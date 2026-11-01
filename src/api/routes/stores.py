"""
RetailVision - Infinite Dynamic Store Construction & Analytics API
Provides store listing, procedural construction loop, individual store analytics,
forecasting, and PDF/CSV reporting with Supabase Storage and PostgreSQL persistence.
"""

from datetime import datetime
import io
import os
from pathlib import Path
from typing import Any, Dict, List, Optional
import uuid
from fastapi import APIRouter, Depends, File, Form, Header, HTTPException, Query, Response, UploadFile, status
import pandas as pd
from pydantic import BaseModel
from sqlalchemy.orm import Session
from src.core.config import settings
from src.core.logging import logger
from src.db.database import get_db
from src.db.models import (
    AuditLog, ConstructionPlot, Dataset, Report, SalesRecord, Store, User
)
from src.api.routes.auth import resolve_user_from_token
from src.services.analytics_service import (
    calculate_kpis, get_category_sales, get_daily_sales, get_monthly_sales,
    get_product_rankings, get_regional_sales
)
from src.services.customer_service import calculate_customer_metrics, get_repeat_customer_breakdown
from src.services.data_service import validate_and_clean_dataset
from src.services.forecasting_service import train_and_forecast_sales
from src.services.procedural_layout import find_next_unoccupied_plot, get_plot_definition
from src.services.reporting_service import export_dataframe_to_csv, generate_pdf_report
from src.services.storage_service import storage_service

router = APIRouter(prefix="/stores", tags=["Stores"])

CATEGORY_COLORS = {
    "Electronics": "#3B82F6",
    "Grocery": "#10B981",
    "Clothing": "#EC4899",
    "Furniture": "#F59E0B",
    "Accessories": "#8B5CF6",
    "Healthcare": "#06B6D4",
    "Custom": "#6366F1"
}


class StoreListItem(BaseModel):
    id: str
    name: str
    category: str
    description: str
    grid_x: float
    grid_z: float
    rotation_y: float
    color: str
    is_default: bool
    total_revenue: float
    total_orders: int
    total_products: int
    created_at: str
    district_id: Optional[str] = "district_1"
    district_name: Optional[str] = "Central Commercial Plaza"
    construction_status: Optional[str] = "completed"


class PlotResponse(BaseModel):
    plot_index: int
    grid_x: float
    grid_z: float
    rotation_y: float
    district_id: str
    district_name: str
    theme: str
    color: str
    is_occupied: bool
    store_id: Optional[str] = None


class DatasetResponse(BaseModel):
    id: str
    store_id: Optional[str] = None
    original_filename: str
    storage_path: str
    file_size: int
    row_count: int
    column_count: int
    upload_status: str
    uploaded_at: str


class ForecastRequest(BaseModel):
    horizon_days: int = 30


def get_or_create_next_available_plot(db: Session, user_id: Optional[str] = None) -> ConstructionPlot:
    """
    Finds the active empty construction plot in the database,
    or dynamically creates the next procedural plot if none is currently open.
    Guarantees that exactly one empty construction plot is always ready.
    """
    empty_plot = db.query(ConstructionPlot).filter(
        ConstructionPlot.is_occupied == False
    ).order_by(ConstructionPlot.plot_index.asc()).first()
    if empty_plot:
        return empty_plot

    occupied_coords = [(s.grid_x, s.grid_z) for s in db.query(Store).all()]
    plot_def = find_next_unoccupied_plot(occupied_coords)

    new_plot = ConstructionPlot(
        id=f"plot_{plot_def['plot_index']}_{uuid.uuid4().hex[:6]}",
        user_id=str(user_id) if user_id else None,
        plot_index=plot_def["plot_index"],
        district_id=plot_def["district_id"],
        district_name=plot_def["district_name"],
        grid_x=plot_def["grid_x"],
        grid_z=plot_def["grid_z"],
        position_x=plot_def["grid_x"],
        position_z=plot_def["grid_z"],
        rotation_y=plot_def["rotation_y"],
        status="available",
        is_occupied=False,
        store_id=None,
        associated_store_id=None,
        created_at=datetime.utcnow()
    )
    db.add(new_plot)
    db.commit()
    db.refresh(new_plot)
    return new_plot


def load_store_dataframe(store: Store, db: Optional[Session] = None) -> pd.DataFrame:
    """
    Loads and returns cleaned DataFrame for a specific store.
    Uses multi-tier recovery: local disk -> Supabase Cloud Storage -> SQL sales_records.
    """
    # 1. Check local file path
    if store.dataset_path:
        csv_path = Path(store.dataset_path)
        if csv_path.exists():
            df, report = validate_and_clean_dataset(csv_path)
            if report.is_valid and df is not None:
                return df

    # 2. Check Supabase Storage
    if store.dataset_path:
        file_bytes = storage_service.download_file("retail-datasets", store.dataset_path)
        if file_bytes:
            df, report = validate_and_clean_dataset(io.BytesIO(file_bytes))
            if report.is_valid and df is not None:
                return df

    # 3. Fallback to SQL sales_records table
    if db is not None and store.dataset_id:
        records = db.query(SalesRecord).filter(SalesRecord.dataset_id == store.dataset_id).all()
        if records:
            data = [{
                "order_id": r.order_id,
                "order_date": r.order_date,
                "customer_id": r.customer_id,
                "product": r.product,
                "category": r.category,
                "quantity": r.quantity,
                "unit_price": r.unit_price,
                "total_amount": r.revenue,
                "region": r.region,
                "city": r.city
            } for r in records]
            df = pd.DataFrame(data)
            df["order_date"] = pd.to_datetime(df["order_date"])
            return df

    raise HTTPException(
        status_code=404,
        detail=f"Dataset file or records for store '{store.name}' could not be loaded."
    )


@router.get("", response_model=List[StoreListItem])
def list_stores(
    authorization: Optional[str] = Header(None),
    token: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Returns list of all active retail stores in the marketplace with user tenancy isolation."""
    user = resolve_user_from_token(authorization or token, db)
    if user and user.email != "admin@retailvision.com":
        stores = db.query(Store).filter(
            (Store.is_default == True) | (Store.user_id == user.id)
        ).order_by(Store.created_at.asc()).all()
    else:
        stores = db.query(Store).order_by(Store.created_at.asc()).all()

    result = []
    for s in stores:
        name_val = s.store_name if s.store_name else s.name
        gx = s.building_position_x if s.building_position_x is not None else s.grid_x
        gz = s.building_position_z if s.building_position_z is not None else s.grid_z
        c_status = s.status if s.status else s.construction_status
        result.append(StoreListItem(
            id=s.id,
            name=name_val,
            category=s.category,
            description=s.description or "",
            grid_x=float(gx or 0.0),
            grid_z=float(gz or 0.0),
            rotation_y=float(s.rotation_y or 0.0),
            color=s.color or CATEGORY_COLORS.get(s.category, "#3B82F6"),
            is_default=bool(s.is_default),
            total_revenue=float(s.total_revenue or 0.0),
            total_orders=int(s.total_orders or 0),
            total_products=int(s.total_products or 0),
            created_at=s.created_at.strftime("%Y-%m-%d %H:%M") if s.created_at else "",
            district_id=s.district_id or "district_1",
            district_name=s.district_name or "Central Commercial Plaza",
            construction_status=c_status or "completed"
        ))
    return result


@router.get("/plots/next", response_model=PlotResponse)
def get_next_plot(db: Session = Depends(get_db)):
    """
    Returns the next available empty construction plot in the marketplace.
    Guarantees at least one plot is always available.
    """
    plot = get_or_create_next_available_plot(db)
    plot_def = get_plot_definition(plot.plot_index)
    gx = plot.position_x if plot.position_x is not None else plot.grid_x
    gz = plot.position_z if plot.position_z is not None else plot.grid_z
    s_id = plot.associated_store_id if plot.associated_store_id is not None else plot.store_id
    is_occ = (plot.status == "occupied") if plot.status else bool(plot.is_occupied)
    return PlotResponse(
        plot_index=plot.plot_index,
        grid_x=float(gx),
        grid_z=float(gz),
        rotation_y=float(plot.rotation_y or 0.0),
        district_id=plot.district_id,
        district_name=plot.district_name,
        theme=plot_def["theme"],
        color=plot_def["color"],
        is_occupied=is_occ,
        store_id=s_id
    )


@router.get("/plots", response_model=List[PlotResponse])
def list_plots(db: Session = Depends(get_db)):
    """Returns all current construction plots including occupied and available."""
    get_or_create_next_available_plot(db)
    plots = db.query(ConstructionPlot).order_by(ConstructionPlot.plot_index.asc()).all()
    result = []
    for p in plots:
        plot_def = get_plot_definition(p.plot_index)
        gx = p.position_x if p.position_x is not None else p.grid_x
        gz = p.position_z if p.position_z is not None else p.grid_z
        s_id = p.associated_store_id if p.associated_store_id is not None else p.store_id
        is_occ = (p.status == "occupied") if p.status else bool(p.is_occupied)
        result.append(PlotResponse(
            plot_index=p.plot_index,
            grid_x=float(gx),
            grid_z=float(gz),
            rotation_y=float(p.rotation_y or 0.0),
            district_id=p.district_id,
            district_name=p.district_name,
            theme=plot_def["theme"],
            color=plot_def["color"],
            is_occupied=is_occ,
            store_id=s_id
        ))
    return result


@router.options("/construct")
@router.options("/construct/", include_in_schema=False)
def options_construct_store():
    """Explicitly handle preflight OPTIONS requests for store construction."""
    return Response(
        status_code=status.HTTP_200_OK,
        headers={
            "Allow": "POST, OPTIONS",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Max-Age": "86400",
        }
    )


@router.post("/construct", response_model=StoreListItem)
@router.post("/construct/", response_model=StoreListItem, include_in_schema=False)
async def construct_store(
    file: UploadFile = File(...),
    name: str = Form(...),
    category: str = Form("Custom"),
    description: Optional[str] = Form(""),
    authorization: Optional[str] = Header(None),
    token: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Constructs a new store in the 3D marketplace by validating and saving an uploaded CSV dataset.
    Uploads CSV to Supabase Storage, creates Dataset and SalesRecord entities in PostgreSQL,
    occupies current plot, and procedurally allocates the next available plot.
    """
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Invalid file type: Please upload a valid .csv file.")

    # Check upload file size
    try:
        file_bytes = await file.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not read uploaded file: {e}")

    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if len(file_bytes) > max_bytes:
        raise HTTPException(status_code=400, detail=f"File exceeds maximum upload size of {settings.MAX_UPLOAD_SIZE_MB}MB.")

    store_id = f"store_{uuid.uuid4().hex[:8]}"
    dataset_id = f"ds_{store_id}"

    # Validate dataset using Pandas
    clean_df, report = validate_and_clean_dataset(io.BytesIO(file_bytes))
    if not report.is_valid or clean_df is None:
        raise HTTPException(
            status_code=400,
            detail=f"CSV Validation Failed: {', '.join(report.errors)}"
        )

    # Compute independent dataset statistics
    tot_rev = round(float(clean_df["total_amount"].sum()), 2)
    tot_orders = int(clean_df["order_id"].nunique())
    tot_prods = int(clean_df["product"].nunique())

    # Upload to Supabase Storage (with local disk fallback)
    storage_path = storage_service.upload_dataset(
        store_id=store_id,
        filename=file.filename,
        file_bytes=file_bytes
    )

    try:
        # Resolve user
        user = resolve_user_from_token(authorization or token, db)
        if not user:
            user = db.query(User).filter(User.email == "admin@retailvision.com").first()
        user_id = user.id if user else None

        # 1. Fetch active empty construction plot
        target_plot = get_or_create_next_available_plot(db)
        color = CATEGORY_COLORS.get(category, "#6366F1")

        # 2. Persist Dataset record
        dataset_record = Dataset(
            id=dataset_id,
            store_id=store_id,
            user_id=user_id,
            original_filename=file.filename,
            storage_path=storage_path,
            file_size=len(file_bytes),
            row_count=len(clean_df),
            column_count=len(clean_df.columns),
            upload_status="completed",
            uploaded_at=datetime.utcnow()
        )
        db.add(dataset_record)

        # 3. Create Store record
        new_store = Store(
            id=store_id,
            user_id=user_id,
            store_name=name.strip(),
            name=name.strip(),
            category=category,
            description=description.strip() if description else "",
            dataset_id=dataset_id,
            dataset_path=str(settings.DATA_DIR / "uploads" / f"{store_id}.csv"),
            building_position_x=target_plot.position_x if target_plot.position_x is not None else target_plot.grid_x,
            building_position_z=target_plot.position_z if target_plot.position_z is not None else target_plot.grid_z,
            grid_x=target_plot.position_x if target_plot.position_x is not None else target_plot.grid_x,
            grid_z=target_plot.position_z if target_plot.position_z is not None else target_plot.grid_z,
            rotation_y=target_plot.rotation_y,
            color=color,
            is_default=False,
            district_id=target_plot.district_id,
            district_name=target_plot.district_name,
            status="completed",
            construction_status="completed",
            total_revenue=tot_rev,
            total_orders=tot_orders,
            total_products=tot_prods,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        db.add(new_store)

        # 4. Mark construction plot as occupied
        target_plot.is_occupied = True
        target_plot.status = "occupied"
        target_plot.store_id = store_id
        target_plot.associated_store_id = store_id

        # 5. Insert SalesRecord entries for SQL analytics & persistence
        sales_records = []
        for _, r in clean_df.iterrows():
            sales_records.append(SalesRecord(
                id=str(uuid.uuid4()),
                dataset_id=dataset_id,
                order_id=str(r.get("order_id", "")),
                order_date=pd.to_datetime(r["order_date"]).to_pydatetime() if "order_date" in r else datetime.utcnow(),
                customer_id=str(r.get("customer_id", "Guest")),
                product=str(r.get("product", "")),
                category=str(r.get("category", category)),
                quantity=int(r.get("quantity", 1)),
                unit_price=float(r.get("unit_price", 0.0)),
                revenue=float(r.get("total_amount", 0.0)),
                region=str(r.get("region", "All Regions")),
                city=str(r.get("city", "All Cities")),
                created_at=datetime.utcnow()
            ))
        db.bulk_save_objects(sales_records)

        # 6. Infinite Plot Expansion: Allocate NEXT available plot
        occupied_coords = [
            (s.building_position_x if s.building_position_x is not None else s.grid_x,
             s.building_position_z if s.building_position_z is not None else s.grid_z)
            for s in db.query(Store).all()
        ]
        occupied_coords.append((new_store.building_position_x, new_store.building_position_z))
        next_plot_def = find_next_unoccupied_plot(occupied_coords)

        next_plot = ConstructionPlot(
            id=f"plot_{next_plot_def['plot_index']}_{uuid.uuid4().hex[:6]}",
            user_id=user_id,
            plot_index=next_plot_def["plot_index"],
            district_id=next_plot_def["district_id"],
            district_name=next_plot_def["district_name"],
            grid_x=next_plot_def["grid_x"],
            grid_z=next_plot_def["grid_z"],
            position_x=next_plot_def["grid_x"],
            position_z=next_plot_def["grid_z"],
            rotation_y=next_plot_def["rotation_y"],
            status="available",
            is_occupied=False,
            store_id=None,
            associated_store_id=None,
            created_at=datetime.utcnow()
        )
        db.add(next_plot)

        # 7. Record Audit Log
        audit = AuditLog(
            id=str(uuid.uuid4()),
            user_id=user_id,
            action="construct_store",
            entity_type="store",
            entity_id=store_id,
            created_at=datetime.utcnow()
        )
        db.add(audit)

        db.commit()
        db.refresh(new_store)

    except Exception as e:
        db.rollback()
        storage_service.delete_dataset(store_id, storage_path)
        raise HTTPException(status_code=500, detail=f"Failed constructing store: {str(e)}")

    return StoreListItem(
        id=new_store.id,
        name=new_store.name,
        category=new_store.category,
        description=new_store.description,
        grid_x=new_store.grid_x,
        grid_z=new_store.grid_z,
        rotation_y=new_store.rotation_y,
        color=new_store.color,
        is_default=new_store.is_default,
        total_revenue=new_store.total_revenue,
        total_orders=new_store.total_orders,
        total_products=new_store.total_products,
        created_at=new_store.created_at.strftime("%Y-%m-%d %H:%M"),
        district_id=new_store.district_id,
        district_name=new_store.district_name,
        construction_status=new_store.status
    )


@router.get("/{store_id}/dataset", response_model=DatasetResponse)
def get_store_dataset(
    store_id: str,
    authorization: Optional[str] = Header(None),
    token: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Retrieves dataset metadata associated with a specific store with user ownership checks."""
    store = db.query(Store).filter(Store.id == store_id).first()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found.")

    # Enforce tenancy isolation: only the owner or admin can access custom store dataset
    if not store.is_default and store.user_id is not None:
        user = resolve_user_from_token(authorization or token, db)
        if user and user.id != store.user_id and user.email != "admin@retailvision.com":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Forbidden: You do not have permission to access another user's dataset."
            )

    ds = db.query(Dataset).filter(
        (Dataset.store_id == store_id) | (Dataset.id == store.dataset_id)
    ).first()

    if not ds:
        raise HTTPException(status_code=404, detail=f"Dataset metadata for store '{store.name}' not found.")

    return DatasetResponse(
        id=ds.id,
        store_id=ds.store_id,
        original_filename=ds.original_filename,
        storage_path=ds.storage_path,
        file_size=ds.file_size or 0,
        row_count=ds.row_count or 0,
        column_count=ds.column_count or 0,
        upload_status=ds.upload_status or "completed",
        uploaded_at=ds.uploaded_at.strftime("%Y-%m-%d %H:%M") if ds.uploaded_at else ""
    )


@router.delete("/{store_id}")
def delete_store(
    store_id: str,
    authorization: Optional[str] = Header(None),
    token: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Deletes a custom store, cleans up storage, and reopens its plot with ownership verification."""
    store = db.query(Store).filter(Store.id == store_id).first()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found.")
    if store.is_default:
        raise HTTPException(status_code=400, detail="Default demonstration stores cannot be deleted.")

    # Enforce ownership check
    if store.user_id is not None:
        user = resolve_user_from_token(authorization or token, db)
        if user and user.id != store.user_id and user.email != "admin@retailvision.com":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Forbidden: You cannot delete another user's store."
            )

    # 1. Clean up dataset files from Supabase and local disk
    storage_service.delete_dataset(store_id, store.dataset_path)

    # 2. Free up plot if found
    plot = db.query(ConstructionPlot).filter(
        (ConstructionPlot.associated_store_id == store_id) |
        (ConstructionPlot.store_id == store_id)
    ).first()
    if plot:
        plot.is_occupied = False
        plot.status = "available"
        plot.associated_store_id = None
        plot.store_id = None

    # 3. Clean up dataset records and sales records
    db.query(SalesRecord).filter(SalesRecord.dataset_id == store.dataset_id).delete(synchronize_session=False)
    db.query(Dataset).filter(
        (Dataset.store_id == store_id) | (Dataset.id == store.dataset_id)
    ).delete(synchronize_session=False)

    # 4. Audit log
    audit = AuditLog(
        id=str(uuid.uuid4()),
        user_id=str(store.user_id) if store.user_id else None,
        action="delete_store",
        entity_type="store",
        entity_id=store_id,
        created_at=datetime.utcnow()
    )
    db.add(audit)

    db.delete(store)
    db.commit()
    return {"success": True, "message": f"Store '{store.name}' deleted successfully."}


@router.get("/{store_id}/analytics")
def get_store_analytics(
    store_id: str,
    authorization: Optional[str] = Header(None),
    token: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Computes and returns full analytics dashboard metrics for the store's independent dataset."""
    store = db.query(Store).filter(Store.id == store_id).first()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found.")

    if not store.is_default and store.user_id is not None:
        user = resolve_user_from_token(authorization or token, db)
        if user and user.id != store.user_id and user.email != "admin@retailvision.com":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Forbidden: You do not have permission to access this store's analytics."
            )

    df = load_store_dataframe(store, db)
    kpis = calculate_kpis(df)
    monthly_df = get_monthly_sales(df)
    daily_df = get_daily_sales(df)
    cat_df = get_category_sales(df)
    reg_df = get_regional_sales(df)
    top_prods_df = get_product_rankings(df, top_n=10)
    cust_metrics = calculate_customer_metrics(df)
    repeat_df = get_repeat_customer_breakdown(df)

    def convert_records(records):
        for r in records:
            for k, v in r.items():
                if hasattr(v, "isoformat"):
                    r[k] = v.isoformat()
                elif hasattr(v, "strftime"):
                    r[k] = v.strftime("%Y-%m-%d")
        return records

    return {
        "store": {
            "id": store.id,
            "name": store.name,
            "category": store.category,
            "description": store.description,
            "color": store.color,
            "is_default": store.is_default,
            "district_id": store.district_id,
            "district_name": store.district_name
        },
        "kpis": kpis,
        "monthly_trend": convert_records(monthly_df.to_dict(orient="records")),
        "recent_daily": convert_records(daily_df.tail(30).to_dict(orient="records")),
        "categories": convert_records(cat_df.to_dict(orient="records")),
        "regions": convert_records(reg_df.to_dict(orient="records")),
        "top_products": convert_records(top_prods_df.to_dict(orient="records")),
        "customer_metrics": cust_metrics,
        "repeat_breakdown": convert_records(repeat_df.to_dict(orient="records"))
    }


@router.post("/{store_id}/forecast")
def get_store_forecast(
    store_id: str,
    payload: ForecastRequest,
    authorization: Optional[str] = Header(None),
    token: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Trains forecasting model and returns future sales projection for the store."""
    store = db.query(Store).filter(Store.id == store_id).first()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found.")

    if not store.is_default and store.user_id is not None:
        user = resolve_user_from_token(authorization or token, db)
        if user and user.id != store.user_id and user.email != "admin@retailvision.com":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Forbidden: You do not have permission to access this store's forecast."
            )

    df = load_store_dataframe(store, db)
    forecast_bundle = train_and_forecast_sales(df, horizon_days=payload.horizon_days)

    def serialize_records(records):
        for r in records:
            for k, v in r.items():
                if hasattr(v, "isoformat"):
                    r[k] = v.isoformat()
                elif hasattr(v, "strftime"):
                    r[k] = v.strftime("%Y-%m-%d")
        return records

    return {
        "is_successful": forecast_bundle.is_successful,
        "error_message": forecast_bundle.error_message,
        "horizon_days": forecast_bundle.horizon_days,
        "total_projected_revenue": forecast_bundle.total_projected_revenue,
        "daily_avg_projected_revenue": forecast_bundle.daily_avg_projected_revenue,
        "metrics": forecast_bundle.metrics,
        "forecast": serialize_records(forecast_bundle.future_forecast.to_dict(orient="records")) if not forecast_bundle.future_forecast.empty else [],
        "validation": serialize_records(forecast_bundle.test_predictions.to_dict(orient="records")) if not forecast_bundle.test_predictions.empty else []
    }


@router.get("/{store_id}/report/pdf")
def export_store_report_pdf(
    store_id: str,
    authorization: Optional[str] = Header(None),
    token: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Generates and streams an executive PDF intelligence report for the store and records deliverable in database."""
    store = db.query(Store).filter(Store.id == store_id).first()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found.")

    user = resolve_user_from_token(authorization or token, db)
    if not store.is_default and store.user_id is not None:
        if user and user.id != store.user_id and user.email != "admin@retailvision.com":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Forbidden: You do not have permission to access this store's report."
            )

    df = load_store_dataframe(store, db)
    kpis = calculate_kpis(df)
    pdf_bytes = generate_pdf_report(
        df=df,
        kpi=kpis,
        filter_summary={"Store": store.name, "Category": store.category, "District": store.district_name or "Commercial"}
    )
    # Save to storage
    storage_path = storage_service.upload_report(store_id, pdf_bytes, report_type="pdf")

    # Persist Report metadata in public.reports table
    try:
        report_record = Report(
            id=str(uuid.uuid4()),
            store_id=store.id,
            user_id=user.id if user else store.user_id,
            report_type="pdf",
            storage_path=storage_path,
            created_at=datetime.utcnow()
        )
        db.add(report_record)
        db.commit()
    except Exception as e:
        logger.warning(f"Could not persist report record: {e}")

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=report_{store.id}.pdf"}
    )


@router.get("/{store_id}/report/csv")
def export_store_cleaned_csv(
    store_id: str,
    authorization: Optional[str] = Header(None),
    token: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Exports cleaned store dataset as CSV and records deliverable in database."""
    store = db.query(Store).filter(Store.id == store_id).first()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found.")

    user = resolve_user_from_token(authorization or token, db)
    if not store.is_default and store.user_id is not None:
        if user and user.id != store.user_id and user.email != "admin@retailvision.com":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Forbidden: You do not have permission to access this store's report."
            )

    df = load_store_dataframe(store, db)
    csv_str = export_dataframe_to_csv(df)
    csv_bytes = csv_str.encode("utf-8") if isinstance(csv_str, str) else csv_str
    storage_path = storage_service.upload_report(store_id, csv_bytes, report_type="csv")

    # Persist Report metadata in public.reports table
    try:
        report_record = Report(
            id=str(uuid.uuid4()),
            store_id=store.id,
            user_id=user.id if user else store.user_id,
            report_type="csv",
            storage_path=storage_path,
            created_at=datetime.utcnow()
        )
        db.add(report_record)
        db.commit()
    except Exception as e:
        logger.warning(f"Could not persist report record: {e}")

    return Response(
        content=csv_str,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=dataset_{store.id}.csv"}
    )

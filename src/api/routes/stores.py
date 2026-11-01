"""
RetailVision - Infinite Dynamic Store Construction & Analytics API
Provides store listing, procedural construction loop, individual store analytics,
forecasting, and PDF/CSV reporting.
"""

from datetime import datetime
import os
from pathlib import Path
import shutil
from typing import Any, Dict, List, Optional
import uuid
from fastapi import APIRouter, Depends, File, Form, HTTPException, Response, UploadFile, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from src.core.config import settings
from src.db.database import get_db
from src.db.models import ConstructionPlot, Store, User
from src.services.analytics_service import (
    calculate_kpis, get_category_sales, get_daily_sales, get_monthly_sales,
    get_product_rankings, get_regional_sales
)
from src.services.customer_service import calculate_customer_metrics, get_repeat_customer_breakdown
from src.services.data_service import validate_and_clean_dataset
from src.services.forecasting_service import train_and_forecast_sales
from src.services.procedural_layout import find_next_unoccupied_plot, get_plot_definition
from src.services.reporting_service import export_dataframe_to_csv, generate_pdf_report

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


class ForecastRequest(BaseModel):
    horizon_days: int = 30


def get_or_create_next_available_plot(db: Session, user_id: Optional[int] = None) -> ConstructionPlot:
    """
    Finds the active empty construction plot in the database,
    or dynamically creates the next procedural plot if none is currently open.
    Guarantees that exactly one empty construction plot is always ready.
    """
    # 1. Check if an unoccupied plot is already waiting
    empty_plot = db.query(ConstructionPlot).filter(ConstructionPlot.is_occupied == False).first()
    if empty_plot:
        return empty_plot

    # 2. Otherwise calculate next unoccupied index based on existing stores and plots
    occupied_coords = [(s.grid_x, s.grid_z) for s in db.query(Store).all()]
    plot_def = find_next_unoccupied_plot(occupied_coords)

    # 3. Persist and return new unoccupied plot record
    new_plot = ConstructionPlot(
        id=f"plot_{plot_def['plot_index']}_{uuid.uuid4().hex[:6]}",
        user_id=user_id,
        plot_index=plot_def["plot_index"],
        district_id=plot_def["district_id"],
        district_name=plot_def["district_name"],
        grid_x=plot_def["grid_x"],
        grid_z=plot_def["grid_z"],
        rotation_y=plot_def["rotation_y"],
        is_occupied=False,
        store_id=None,
        created_at=datetime.utcnow()
    )
    db.add(new_plot)
    db.commit()
    db.refresh(new_plot)
    return new_plot


def load_store_dataframe(store: Store):
    """Loads and returns cleaned DataFrame for a specific store."""
    csv_path = Path(store.dataset_path)
    if not csv_path.exists():
        raise HTTPException(
            status_code=404,
            detail=f"Dataset file for store '{store.name}' not found on server."
        )
    df, report = validate_and_clean_dataset(csv_path)
    if not report.is_valid or df is None:
        raise HTTPException(
            status_code=500,
            detail=f"Failed loading dataset for store '{store.name}': {', '.join(report.errors)}"
        )
    return df


@router.get("", response_model=List[StoreListItem])
def list_stores(db: Session = Depends(get_db)):
    """Returns list of all active retail stores in the marketplace."""
    stores = db.query(Store).order_by(Store.created_at.asc()).all()
    result = []
    for s in stores:
        result.append(StoreListItem(
            id=s.id,
            name=s.name,
            category=s.category,
            description=s.description or "",
            grid_x=s.grid_x,
            grid_z=s.grid_z,
            rotation_y=s.rotation_y or 0.0,
            color=s.color or CATEGORY_COLORS.get(s.category, "#3B82F6"),
            is_default=bool(s.is_default),
            total_revenue=float(s.total_revenue or 0.0),
            total_orders=int(s.total_orders or 0),
            total_products=int(s.total_products or 0),
            created_at=s.created_at.strftime("%Y-%m-%d %H:%M") if s.created_at else "",
            district_id=s.district_id or "district_1",
            district_name=s.district_name or "Central Commercial Plaza",
            construction_status=s.construction_status or "completed"
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
    return PlotResponse(
        plot_index=plot.plot_index,
        grid_x=plot.grid_x,
        grid_z=plot.grid_z,
        rotation_y=plot.rotation_y,
        district_id=plot.district_id,
        district_name=plot.district_name,
        theme=plot_def["theme"],
        color=plot_def["color"],
        is_occupied=plot.is_occupied,
        store_id=plot.store_id
    )


@router.get("/plots", response_model=List[PlotResponse])
def list_plots(db: Session = Depends(get_db)):
    """Returns all current construction plots including occupied and available."""
    # Ensure next plot exists
    get_or_create_next_available_plot(db)
    plots = db.query(ConstructionPlot).order_by(ConstructionPlot.plot_index.asc()).all()
    result = []
    for p in plots:
        plot_def = get_plot_definition(p.plot_index)
        result.append(PlotResponse(
            plot_index=p.plot_index,
            grid_x=p.grid_x,
            grid_z=p.grid_z,
            rotation_y=p.rotation_y,
            district_id=p.district_id,
            district_name=p.district_name,
            theme=plot_def["theme"],
            color=plot_def["color"],
            is_occupied=p.is_occupied,
            store_id=p.store_id
        ))
    return result


@router.post("/construct", response_model=StoreListItem)
async def construct_store(
    file: UploadFile = File(...),
    name: str = Form(...),
    category: str = Form("Custom"),
    description: Optional[str] = Form(""),
    db: Session = Depends(get_db)
):
    """
    Constructs a new store in the 3D marketplace by validating and saving an uploaded CSV dataset.
    Occupies the current construction plot and immediately creates the next available empty plot.
    """
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Invalid file type: Please upload a valid .csv file.")

    store_id = f"store_{uuid.uuid4().hex[:8]}"
    upload_dir = settings.DATA_DIR / "uploads"
    try:
        upload_dir.mkdir(parents=True, exist_ok=True)
        saved_csv_path = upload_dir / f"{store_id}.csv"
    except Exception:
        import tempfile
        upload_dir = Path(tempfile.gettempdir()) / "retailvision_uploads"
        upload_dir.mkdir(parents=True, exist_ok=True)
        saved_csv_path = upload_dir / f"{store_id}.csv"

    # Save uploaded file
    try:
        with open(saved_csv_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

    # Validate and clean dataset
    clean_df, report = validate_and_clean_dataset(saved_csv_path)
    if not report.is_valid or clean_df is None:
        if saved_csv_path.exists():
            saved_csv_path.unlink()
        raise HTTPException(
            status_code=400,
            detail=f"CSV Validation Failed: {', '.join(report.errors)}"
        )

    # Compute independent dataset statistics
    tot_rev = round(float(clean_df["total_amount"].sum()), 2)
    tot_orders = int(clean_df["order_id"].nunique())
    tot_prods = int(clean_df["product"].nunique())

    # 1. Fetch the active empty construction plot
    target_plot = get_or_create_next_available_plot(db)
    color = CATEGORY_COLORS.get(category, "#6366F1")

    admin = db.query(User).filter(User.email == "admin@retailvision.com").first()
    user_id = admin.id if admin else None

    # 2. Create the Store record on this plot
    new_store = Store(
        id=store_id,
        user_id=user_id,
        name=name.strip(),
        category=category,
        description=description.strip() if description else "",
        dataset_id=f"ds_{store_id}",
        dataset_path=str(saved_csv_path),
        grid_x=target_plot.grid_x,
        grid_z=target_plot.grid_z,
        rotation_y=target_plot.rotation_y,
        color=color,
        is_default=False,
        district_id=target_plot.district_id,
        district_name=target_plot.district_name,
        construction_status="completed",
        total_revenue=tot_rev,
        total_orders=tot_orders,
        total_products=tot_prods,
        created_at=datetime.utcnow()
    )
    db.add(new_store)

    # 3. Mark the construction plot as occupied
    target_plot.is_occupied = True
    target_plot.store_id = store_id

    # 4. THE NEVER-ENDING CONSTRUCTION LOOP:
    # Automatically allocate and spawn the NEXT available empty plot in the database!
    occupied_coords = [(s.grid_x, s.grid_z) for s in db.query(Store).all()]
    occupied_coords.append((target_plot.grid_x, target_plot.grid_z))
    next_plot_def = find_next_unoccupied_plot(occupied_coords)

    next_plot = ConstructionPlot(
        id=f"plot_{next_plot_def['plot_index']}_{uuid.uuid4().hex[:6]}",
        user_id=user_id,
        plot_index=next_plot_def["plot_index"],
        district_id=next_plot_def["district_id"],
        district_name=next_plot_def["district_name"],
        grid_x=next_plot_def["grid_x"],
        grid_z=next_plot_def["grid_z"],
        rotation_y=next_plot_def["rotation_y"],
        is_occupied=False,
        store_id=None,
        created_at=datetime.utcnow()
    )
    db.add(next_plot)

    db.commit()
    db.refresh(new_store)

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
        construction_status=new_store.construction_status
    )


@router.delete("/{store_id}")
def delete_store(store_id: str, db: Session = Depends(get_db)):
    """Deletes a custom store and reopens its plot."""
    store = db.query(Store).filter(Store.id == store_id).first()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found.")
    if store.is_default:
        raise HTTPException(status_code=400, detail="Default demonstration stores cannot be deleted.")

    if os.path.exists(store.dataset_path) and "uploads" in store.dataset_path:
        try:
            os.remove(store.dataset_path)
        except Exception:
            pass

    # Free up plot if found
    plot = db.query(ConstructionPlot).filter(ConstructionPlot.store_id == store_id).first()
    if plot:
        plot.is_occupied = False
        plot.store_id = None

    db.delete(store)
    db.commit()
    return {"success": True, "message": f"Store '{store.name}' deleted successfully."}


@router.get("/{store_id}/analytics")
def get_store_analytics(store_id: str, db: Session = Depends(get_db)):
    """Computes and returns full analytics dashboard metrics for the store's independent dataset."""
    store = db.query(Store).filter(Store.id == store_id).first()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found.")

    df = load_store_dataframe(store)
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
def get_store_forecast(store_id: str, payload: ForecastRequest, db: Session = Depends(get_db)):
    """Trains forecasting model and returns future sales projection for the store."""
    store = db.query(Store).filter(Store.id == store_id).first()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found.")

    df = load_store_dataframe(store)
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
        "horizon_days": forecast_bundle.horizon_days,
        "total_projected_revenue": forecast_bundle.total_projected_revenue,
        "daily_avg_projected_revenue": forecast_bundle.daily_avg_projected_revenue,
        "metrics": forecast_bundle.metrics,
        "forecast": serialize_records(forecast_bundle.future_forecast.to_dict(orient="records")),
        "validation": serialize_records(forecast_bundle.test_predictions.to_dict(orient="records"))
    }


@router.get("/{store_id}/report/pdf")
def export_store_report_pdf(store_id: str, db: Session = Depends(get_db)):
    """Generates and streams an executive PDF intelligence report for the store."""
    store = db.query(Store).filter(Store.id == store_id).first()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found.")

    df = load_store_dataframe(store)
    kpis = calculate_kpis(df)
    pdf_bytes = generate_pdf_report(
        df=df,
        kpi=kpis,
        filter_summary={"Store": store.name, "Category": store.category, "District": store.district_name or "Commercial"}
    )
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=report_{store.id}.pdf"}
    )


@router.get("/{store_id}/report/csv")
def export_store_cleaned_csv(store_id: str, db: Session = Depends(get_db)):
    """Exports cleaned store dataset as CSV."""
    store = db.query(Store).filter(Store.id == store_id).first()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found.")

    df = load_store_dataframe(store)
    csv_str = export_dataframe_to_csv(df)
    return Response(
        content=csv_str,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=dataset_{store.id}.csv"}
    )

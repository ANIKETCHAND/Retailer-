"""
RetailVision - Store Management & Store Analytics API
Provides store listing, procedural construction, individual store analytics,
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
from src.db.models import Store, User
from src.services.analytics_service import (
    calculate_kpis, get_category_sales, get_daily_sales, get_monthly_sales,
    get_product_rankings, get_regional_sales
)
from src.services.customer_service import calculate_customer_metrics, get_repeat_customer_breakdown
from src.services.data_service import validate_and_clean_dataset
from src.services.forecasting_service import train_and_forecast_sales
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

# Grid plots for dynamically constructed buildings (strictly on empty land, zero road overlap)
CANDIDATE_PLOTS = [
    (13.0, -6.0),    # Plot 1: Dedicated construction crane plot on East commercial plaza
    (-13.0, -6.0),   # Plot 2: North-West commercial plaza plot
    (-13.0, 6.0),    # Plot 3: South-West commercial plaza plot
    (13.0, 11.0),    # Plot 4: South-East outer plaza extension
    (-13.0, 11.0),   # Plot 5: South-West outer plaza extension
    (6.5, 11.0),     # Plot 6: South-East parkside parcel
    (-6.5, 11.0),    # Plot 7: South-West parkside parcel
    (13.0, -11.0),   # Plot 8: North-East outer parcel
    (-13.0, -11.0),  # Plot 9: North-West outer parcel
]


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


class ForecastRequest(BaseModel):
    horizon_days: int = 30


def find_available_plot(db: Session) -> tuple:
    """Finds first unoccupied 3D grid coordinate in the marketplace."""
    stores = db.query(Store).all()
    for x, z in CANDIDATE_PLOTS:
        is_occupied = any(
            ((s.grid_x - x) ** 2 + (s.grid_z - z) ** 2) ** 0.5 < 3.0
            for s in stores
        )
        if not is_occupied:
            return x, z
    # Safe outer perimeter fallback offset
    count = len(stores)
    return 16.0 + (count * 3.5), -6.0


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
            created_at=s.created_at.strftime("%Y-%m-%d %H:%M") if s.created_at else ""
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
    Assigns a 3D coordinate on an open plot.
    """
    if not file.filename.lower().endswith(".csv"):
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

    # Compute stats
    tot_rev = round(float(clean_df["total_amount"].sum()), 2)
    tot_orders = int(clean_df["order_id"].nunique())
    tot_prods = int(clean_df["product"].nunique())

    # Find available plot
    grid_x, grid_z = find_available_plot(db)
    color = CATEGORY_COLORS.get(category, "#6366F1")

    admin = db.query(User).filter(User.email == "admin@retailvision.com").first()
    user_id = admin.id if admin else None

    new_store = Store(
        id=store_id,
        user_id=user_id,
        name=name.strip(),
        category=category,
        description=description.strip() if description else "",
        dataset_path=str(saved_csv_path),
        grid_x=grid_x,
        grid_z=grid_z,
        rotation_y=0.0,
        color=color,
        is_default=False,
        total_revenue=tot_rev,
        total_orders=tot_orders,
        total_products=tot_prods,
        created_at=datetime.utcnow()
    )
    db.add(new_store)
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
        created_at=new_store.created_at.strftime("%Y-%m-%d %H:%M")
    )


@router.delete("/{store_id}")
def delete_store(store_id: str, db: Session = Depends(get_db)):
    """Deletes a custom store."""
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

    db.delete(store)
    db.commit()
    return {"success": True, "message": f"Store '{store.name}' deleted successfully."}


@router.get("/{store_id}/analytics")
def get_store_analytics(store_id: str, db: Session = Depends(get_db)):
    """Computes and returns full analytics dashboard metrics for the store's dataset."""
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

    # Convert timestamps
    daily_records = []
    for _, r in daily_df.tail(60).iterrows():
        daily_records.append({
            "date": r["date"].strftime("%Y-%m-%d"),
            "revenue": float(r["revenue"]),
            "moving_avg_7d": float(r.get("moving_avg_7d", r["revenue"]))
        })

    return {
        "store": {
            "id": store.id,
            "name": store.name,
            "category": store.category,
            "description": store.description,
            "color": store.color,
            "is_default": store.is_default
        },
        "kpis": kpis.__dict__,
        "monthly_trend": monthly_df.to_dict(orient="records"),
        "recent_daily": daily_records,
        "categories": cat_df.to_dict(orient="records"),
        "regions": reg_df.to_dict(orient="records"),
        "top_products": top_prods_df.to_dict(orient="records"),
        "customer_metrics": cust_metrics.__dict__,
        "repeat_breakdown": repeat_df.to_dict(orient="records") if not repeat_df.empty else []
    }


@router.post("/{store_id}/forecast")
def get_store_forecast(store_id: str, req: ForecastRequest, db: Session = Depends(get_db)):
    """Executes time-series forecast for the store's dataset."""
    store = db.query(Store).filter(Store.id == store_id).first()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found.")

    df = load_store_dataframe(store)
    res = train_and_forecast_sales(df, horizon_days=req.horizon_days)

    if not res.is_successful:
        raise HTTPException(status_code=400, detail=res.error_message)

    m = res.metrics
    forecast_points = []
    for _, r in res.future_forecast.iterrows():
        forecast_points.append({
            "date": r["date"].strftime("%Y-%m-%d"),
            "forecast_revenue": float(r["forecast_revenue"]),
            "lower_bound": float(r["lower_bound"]),
            "upper_bound": float(r["upper_bound"])
        })

    validation_points = []
    for _, r in res.test_predictions.iterrows():
        validation_points.append({
            "date": r["date"].strftime("%Y-%m-%d") if hasattr(r["date"], "strftime") else str(r["date"]),
            "predicted_revenue": float(r["predicted_revenue"])
        })

    return {
        "is_successful": True,
        "horizon_days": res.horizon_days,
        "total_projected_revenue": res.total_projected_revenue,
        "daily_avg_projected_revenue": res.daily_avg_projected_revenue,
        "metrics": m.__dict__ if m else {},
        "forecast": forecast_points,
        "validation": validation_points
    }


@router.get("/{store_id}/report/pdf")
def download_store_pdf_report(store_id: str, db: Session = Depends(get_db)):
    """Generates and downloads ReportLab PDF for this specific store."""
    store = db.query(Store).filter(Store.id == store_id).first()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found.")

    df = load_store_dataframe(store)
    kpis = calculate_kpis(df)
    fc = train_and_forecast_sales(df, horizon_days=30)

    filter_summary = {
        "Store Name": store.name,
        "Category": store.category,
        "Date Range": "Full Historical Period"
    }
    pdf_bytes = generate_pdf_report(
        df=df,
        kpi=kpis,
        forecast_res=fc,
        filter_summary=filter_summary
    )

    filename = f"retailvision_{store.category.lower()}_{datetime.now().strftime('%Y%m%d')}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.get("/{store_id}/report/csv")
def download_store_csv_data(store_id: str, db: Session = Depends(get_db)):
    """Downloads this store's CSV transactions."""
    store = db.query(Store).filter(Store.id == store_id).first()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found.")

    df = load_store_dataframe(store)
    csv_bytes = export_dataframe_to_csv(df)
    filename = f"{store.name.lower().replace(' ', '_')}_sales.csv"
    return Response(
        content=csv_bytes,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

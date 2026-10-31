"""
RetailVision - Sales Forecasting API Endpoints
"""

from fastapi import APIRouter, HTTPException
from src.api.schemas import (
    ForecastMetricsSchema, ForecastRequest, ForecastResponse
)
from src.services.data_service import get_default_dataset
from src.services.forecasting_service import train_and_forecast_sales

router = APIRouter(prefix="/forecast", tags=["Forecasting"])


@router.post("/predict", response_model=ForecastResponse)
def predict_sales(req: ForecastRequest):
    """Run machine learning time-series revenue forecast for specified horizon."""
    df, _ = get_default_dataset()
    result = train_and_forecast_sales(df, horizon_days=req.horizon_days)

    if not result.is_successful:
        raise HTTPException(status_code=400, detail=result.error_message)

    m = result.metrics
    metrics_schema = ForecastMetricsSchema(
        mae=m.mae,
        rmse=m.rmse,
        mape=m.mape,
        r2_score=m.r2_score,
        train_samples=m.train_samples,
        test_samples=m.test_samples,
        test_start_date=m.test_start_date,
        test_end_date=m.test_end_date,
        limitations=m.limitations
    ) if m else None

    # Format dates to string
    records = []
    for _, r in result.future_forecast.iterrows():
        records.append({
            "date": r["date"].strftime("%Y-%m-%d"),
            "forecast_revenue": float(r["forecast_revenue"]),
            "lower_bound": float(r["lower_bound"]),
            "upper_bound": float(r["upper_bound"])
        })

    return ForecastResponse(
        is_successful=True,
        horizon_days=result.horizon_days,
        total_projected_revenue=result.total_projected_revenue,
        daily_avg_projected_revenue=result.daily_avg_projected_revenue,
        metrics=metrics_schema,
        forecast=records
    )

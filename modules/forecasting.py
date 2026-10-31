"""
Backward compatibility proxy for forecasting module.
Points to src.services.forecasting_service.
"""
from src.services.forecasting_service import (
    ForecastMetrics, ForecastResult, prepare_daily_series,
    extract_features, calculate_evaluation_metrics, train_and_forecast_sales
)

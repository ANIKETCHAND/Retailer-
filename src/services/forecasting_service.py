"""
RetailVision - Forecasting Service (Business Logic)
Executes chronological train/test splits, time-series feature engineering,
Ridge regularized regression modeling, zero-safe error metrics, and multi-horizon forecasting.
"""

from dataclasses import dataclass, field
from datetime import timedelta
from typing import List, Optional, Tuple
import numpy as np
import pandas as pd
from sklearn.linear_model import Ridge
from sklearn.preprocessing import StandardScaler
from src.core.config import settings
from src.core.exceptions import ForecastingError


@dataclass
class ForecastMetrics:
    """Rigorous evaluation metrics on out-of-sample chronological test set."""
    mae: float = 0.0
    rmse: float = 0.0
    mape: float = 0.0
    r2_score: float = 0.0
    train_samples: int = 0
    test_samples: int = 0
    test_start_date: str = ""
    test_end_date: str = ""
    limitations: List[str] = field(default_factory=list)


@dataclass
class ForecastResult:
    """Complete bundle containing historical, validation, and future predictions."""
    is_successful: bool = True
    error_message: Optional[str] = None
    metrics: Optional[ForecastMetrics] = None
    historical_daily: pd.DataFrame = field(default_factory=pd.DataFrame)
    test_actuals: pd.DataFrame = field(default_factory=pd.DataFrame)
    test_predictions: pd.DataFrame = field(default_factory=pd.DataFrame)
    future_forecast: pd.DataFrame = field(default_factory=pd.DataFrame)
    total_projected_revenue: float = 0.0
    daily_avg_projected_revenue: float = 0.0
    horizon_days: int = 30


def prepare_daily_series(df: pd.DataFrame) -> pd.DataFrame:
    """Aggregates sales by date and ensures a continuous daily frequency with zero fill."""
    if df is None or df.empty:
        return pd.DataFrame(columns=["date", "revenue"])

    daily = df.groupby(df["order_date"].dt.date)["total_amount"].sum().reset_index()
    daily.columns = ["date", "revenue"]
    daily["date"] = pd.to_datetime(daily["date"])
    daily = daily.sort_values(by="date").reset_index(drop=True)

    min_date = daily["date"].min()
    max_date = daily["date"].max()
    full_idx = pd.date_range(start=min_date, end=max_date, freq="D")

    daily = daily.set_index("date").reindex(full_idx, fill_value=0.0).reset_index()
    daily.columns = ["date", "revenue"]
    daily["revenue"] = daily["revenue"].round(2)
    return daily


def extract_features(dates: pd.Series, base_date: pd.Timestamp) -> pd.DataFrame:
    """Generates time-series features: secular trend, day-of-week harmonics, month harmonics."""
    dt = pd.to_datetime(dates)
    days_since_start = (dt - base_date).dt.total_seconds() / (24 * 3600)

    dow = dt.dt.dayofweek
    month = dt.dt.month
    day_of_month = dt.dt.day
    is_weekend = (dow >= 5).astype(int)

    sin_dow = np.sin(2 * np.pi * dow / 7.0)
    cos_dow = np.cos(2 * np.pi * dow / 7.0)
    sin_month = np.sin(2 * np.pi * month / 12.0)
    cos_month = np.cos(2 * np.pi * month / 12.0)

    return pd.DataFrame({
        "trend": days_since_start,
        "is_weekend": is_weekend,
        "sin_dow": sin_dow,
        "cos_dow": cos_dow,
        "sin_month": sin_month,
        "cos_month": cos_month,
        "day_of_month": day_of_month
    })


def calculate_evaluation_metrics(y_true: np.ndarray, y_pred: np.ndarray) -> Tuple[float, float, float, float]:
    """Calculates MAE, RMSE, safe MAPE, and R2."""
    errors = y_pred - y_true
    mae = float(np.mean(np.abs(errors)))
    rmse = float(np.sqrt(np.mean(errors ** 2)))

    non_zero_mask = (y_true > 1e-4)
    if np.any(non_zero_mask):
        mape = float(np.mean(np.abs((y_true[non_zero_mask] - y_pred[non_zero_mask]) / y_true[non_zero_mask])) * 100)
    else:
        mape = 0.0

    ss_res = np.sum((y_true - y_pred) ** 2)
    ss_tot = np.sum((y_true - np.mean(y_true)) ** 2)
    r2 = float(1.0 - (ss_res / ss_tot)) if ss_tot > 1e-6 else 0.0

    return round(mae, 2), round(rmse, 2), round(mape, 2), round(r2, 3)


def train_and_forecast_sales(
    df: pd.DataFrame,
    horizon_days: Optional[int] = None,
    test_ratio: Optional[float] = None,
    min_days_required: Optional[int] = None
) -> ForecastResult:
    """Executes chronological forecasting pipeline."""
    horizon = horizon_days or settings.FORECAST_DEFAULT_HORIZON
    t_ratio = test_ratio or settings.FORECAST_TEST_RATIO
    min_days = min_days_required or settings.FORECAST_MIN_DAYS_REQUIRED

    result = ForecastResult(horizon_days=horizon)
    daily_df = prepare_daily_series(df)
    result.historical_daily = daily_df

    total_days = len(daily_df)
    if total_days < min_days:
        result.is_successful = False
        result.error_message = (
            f"Insufficient historical data: found {total_days} days, "
            f"minimum {min_days} days required for model training and validation."
        )
        return result

    base_date = daily_df["date"].min()

    # Chronological Split
    test_size = max(10, int(total_days * t_ratio))
    train_size = total_days - test_size

    train_df = daily_df.iloc[:train_size].copy()
    test_df = daily_df.iloc[train_size:].copy()

    X_train = extract_features(train_df["date"], base_date)
    y_train = train_df["revenue"].values

    X_test = extract_features(test_df["date"], base_date)
    y_test = test_df["revenue"].values

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    val_model = Ridge(alpha=settings.FORECAST_RIDGE_ALPHA)
    val_model.fit(X_train_scaled, y_train)

    test_preds = np.clip(val_model.predict(X_test_scaled), a_min=0.0, a_max=None)
    mae, rmse, mape, r2 = calculate_evaluation_metrics(y_test, test_preds)

    result.test_actuals = test_df
    result.test_predictions = pd.DataFrame({
        "date": test_df["date"].values,
        "predicted_revenue": np.round(test_preds, 2)
    })

    # Retrain on full series for forward forecast
    X_full = extract_features(daily_df["date"], base_date)
    y_full = daily_df["revenue"].values

    full_scaler = StandardScaler()
    X_full_scaled = full_scaler.fit_transform(X_full)

    final_model = Ridge(alpha=settings.FORECAST_RIDGE_ALPHA)
    final_model.fit(X_full_scaled, y_full)

    last_date = daily_df["date"].max()
    future_dates = [last_date + timedelta(days=i) for i in range(1, horizon + 1)]
    future_series = pd.Series(future_dates)

    X_future = extract_features(future_series, base_date)
    X_future_scaled = full_scaler.transform(X_future)

    future_preds = np.clip(final_model.predict(X_future_scaled), a_min=0.0, a_max=None)
    margin = 1.5 * rmse
    lower_bound = np.clip(future_preds - margin, a_min=0.0, a_max=None)
    upper_bound = future_preds + margin

    result.future_forecast = pd.DataFrame({
        "date": future_dates,
        "forecast_revenue": np.round(future_preds, 2),
        "lower_bound": np.round(lower_bound, 2),
        "upper_bound": np.round(upper_bound, 2)
    })

    result.total_projected_revenue = round(float(result.future_forecast["forecast_revenue"].sum()), 2)
    result.daily_avg_projected_revenue = round(float(result.future_forecast["forecast_revenue"].mean()), 2)

    limitations = [
        "Chronological Validation: Evaluated strictly on the most recent 15% out-of-sample data with zero data leakage.",
        "Model Assumption: Linear trend and weekly/monthly cyclical harmonics are assumed to persist into the forecast horizon.",
        "Horizon Uncertainty: Forecast variance increases for longer projection horizons (e.g. 60-90 days) compared to short terms (7-14 days).",
        "External Variables: Does not model unrecorded external shocks such as marketing ad spends or supply disruptions.",
        "MAPE Interpretation: Zero or near-zero sales days are safely handled to prevent infinite percentage distortion."
    ]

    result.metrics = ForecastMetrics(
        mae=mae,
        rmse=rmse,
        mape=mape,
        r2_score=r2,
        train_samples=len(train_df),
        test_samples=len(test_df),
        test_start_date=test_df["date"].min().strftime("%Y-%m-%d"),
        test_end_date=test_df["date"].max().strftime("%Y-%m-%d"),
        limitations=limitations
    )

    return result

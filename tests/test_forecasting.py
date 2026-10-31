"""
Unit tests for modules/forecasting.py
Verifies time series preparation, feature extraction, chronological splits,
metric calculations (MAE, RMSE, MAPE with zero handling), and horizon projections.
"""

import os
import numpy as np
import pandas as pd
import pytest
from modules.data_loader import load_dataset
from modules.forecasting import (
    prepare_daily_series, extract_features, calculate_evaluation_metrics,
    train_and_forecast_sales
)


@pytest.fixture
def sample_df():
    sample_path = os.path.join("data", "retail_sales.csv")
    df, report = load_dataset(sample_path)
    assert df is not None and report.is_valid
    return df


def test_prepare_daily_series(sample_df):
    """Verify daily aggregation produces continuous chronological series."""
    daily = prepare_daily_series(sample_df)
    assert not daily.empty
    assert "date" in daily.columns
    assert "revenue" in daily.columns
    # Check that dates are consecutive (no skipped days)
    diffs = daily["date"].diff().dropna()
    assert all(diffs == pd.Timedelta(days=1))


def test_feature_extraction():
    """Verify feature matrix generation and cyclical bounds."""
    dates = pd.date_range("2025-01-01", periods=14, freq="D")
    base_date = pd.Timestamp("2025-01-01")
    features = extract_features(pd.Series(dates), base_date)

    assert len(features) == 14
    assert "trend" in features.columns
    assert "is_weekend" in features.columns
    assert "sin_dow" in features.columns
    assert "cos_dow" in features.columns

    # Sin and cos must be bounded between -1 and 1
    assert features["sin_dow"].between(-1.0, 1.0).all()
    assert features["cos_dow"].between(-1.0, 1.0).all()


def test_calculate_evaluation_metrics():
    """Verify MAE, RMSE, and safe MAPE calculation with zeros."""
    y_true = np.array([100.0, 200.0, 0.0, 150.0])
    y_pred = np.array([110.0, 190.0, 20.0, 150.0])

    mae, rmse, mape, r2 = calculate_evaluation_metrics(y_true, y_pred)

    assert mae > 0
    assert rmse > 0
    assert not np.isnan(mape)
    assert not np.isinf(mape)
    # y_true has a 0.0, MAPE must ignore or safely handle the zero without returning inf
    assert mape > 0


def test_train_and_forecast_horizons(sample_df):
    """Test 7, 30, and 90 day forecast horizons."""
    for horizon in [7, 30, 90]:
        res = train_and_forecast_sales(sample_df, horizon_days=horizon)
        assert res.is_successful is True
        assert res.metrics is not None
        assert res.metrics.mae >= 0
        assert res.metrics.rmse >= 0
        assert res.metrics.train_samples > 0
        assert res.metrics.test_samples > 0
        assert len(res.future_forecast) == horizon
        assert res.total_projected_revenue > 0
        # Check no negative predictions
        assert (res.future_forecast["forecast_revenue"] >= 0).all()
        assert (res.future_forecast["lower_bound"] >= 0).all()


def test_insufficient_data_rejection():
    """Verify model refuses to forecast if dataset has too few days."""
    tiny_data = pd.DataFrame({
        "order_date": pd.to_datetime(["2025-01-01", "2025-01-02", "2025-01-03"]),
        "total_amount": [100.0, 150.0, 200.0]
    })
    res = train_and_forecast_sales(tiny_data, min_days_required=30)
    assert res.is_successful is False
    assert "insufficient" in res.error_message.lower()

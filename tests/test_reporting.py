"""
Unit tests for modules/reporting.py
Verifies PDF creation, ReportLab layout building, and CSV exports.
"""

import os
import pytest
from modules.data_loader import load_dataset
from modules.analytics import calculate_kpis
from modules.forecasting import train_and_forecast_sales
from modules.reporting import generate_pdf_report, export_dataframe_to_csv


@pytest.fixture
def sample_data():
    sample_path = os.path.join("data", "retail_sales.csv")
    df, report = load_dataset(sample_path)
    assert df is not None and report.is_valid
    kpi = calculate_kpis(df)
    forecast = train_and_forecast_sales(df, horizon_days=14)
    return df, kpi, forecast


def test_generate_pdf_report(sample_data):
    """Verify that ReportLab compiles a valid PDF file."""
    df, kpi, forecast = sample_data
    pdf_bytes = generate_pdf_report(
        df=df,
        kpi=kpi,
        forecast_res=forecast,
        filter_summary={"Date Range": "2024-01-01 to 2025-12-31", "Categories": "All"}
    )

    assert isinstance(pdf_bytes, bytes)
    assert len(pdf_bytes) > 1000
    # PDF magic number header
    assert pdf_bytes.startswith(b"%PDF-")


def test_export_dataframe_to_csv(sample_data):
    """Verify DataFrame export to CSV bytes."""
    df, _, _ = sample_data
    csv_bytes = export_dataframe_to_csv(df.head(20))
    assert isinstance(csv_bytes, bytes)
    assert len(csv_bytes) > 0
    assert b"order_date" in csv_bytes
    assert b"total_amount" in csv_bytes

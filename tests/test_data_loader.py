"""
Unit tests for modules/data_loader.py
Validates loading, column mapping, error handling, duplicate removal, and imputation.
"""

from io import StringIO
import os
import pandas as pd
import pytest
from modules.data_loader import load_dataset, validate_and_clean_data, resolve_column_mapping


def test_load_sample_dataset():
    """Verify built-in sample retail dataset loads properly."""
    sample_path = os.path.join("data", "retail_sales.csv")
    assert os.path.exists(sample_path), "Sample CSV file must exist"

    df, report = load_dataset(sample_path)
    assert df is not None
    assert report.is_valid is True
    assert len(report.errors) == 0
    assert report.clean_row_count == 3600
    assert "order_date" in df.columns
    assert "total_amount" in df.columns
    assert "product" in df.columns
    assert "category" in df.columns
    assert "quantity" in df.columns
    assert "unit_price" in df.columns
    assert "region" in df.columns
    assert "customer_id" in df.columns
    assert pd.api.types.is_datetime64_any_dtype(df["order_date"])


def test_flexible_column_aliases():
    """Verify alternative retail column headers map to canonical schema."""
    csv_data = StringIO(
        "transaction_date,item_name,dept,qty,price,territory,client_id,invoice_no\n"
        "2025-03-01,Espresso Cup,Kitchen,3,15.50,North,CLI-99,INV-001\n"
        "2025-03-02,Coffee Beans,Grocery,2,12.00,West,CLI-102,INV-002\n"
    )
    df, report = load_dataset(csv_data)
    assert df is not None
    assert report.is_valid is True
    assert len(df) == 2
    assert "order_date" in df.columns
    assert "product" in df.columns
    assert "category" in df.columns
    assert "quantity" in df.columns
    assert "unit_price" in df.columns
    assert "total_amount" in df.columns
    # Check calculated total amount: 3 * 15.50 = 46.50
    assert df.loc[0, "total_amount"] == pytest.approx(46.50)
    assert df.loc[0, "product"] == "Espresso Cup"
    assert df.loc[0, "category"] == "Kitchen"


def test_missing_essential_columns_fails():
    """Verify missing date or product columns produces clean error report."""
    csv_data = StringIO(
        "product,quantity,unit_price\n"
        "Widget,5,10.0\n"
    )
    df, report = load_dataset(csv_data)
    assert df is None
    assert report.is_valid is False
    assert any("essential" in err.lower() or "date" in err.lower() for err in report.errors)


def test_missing_revenue_and_price_fails():
    """Verify dataset with only product and date but no monetary info fails validation."""
    csv_data = StringIO(
        "order_date,product\n"
        "2025-01-01,Gadget\n"
    )
    df, report = load_dataset(csv_data)
    assert df is None
    assert report.is_valid is False
    assert any("revenue" in err.lower() for err in report.errors)


def test_imputation_of_unit_price():
    """Verify unit_price = total_amount / quantity when unit_price is absent."""
    csv_data = StringIO(
        "order_date,product,quantity,total_amount\n"
        "2025-05-10,Desk Lamp,4,100.00\n"
    )
    df, report = load_dataset(csv_data)
    assert df is not None
    assert df.loc[0, "unit_price"] == pytest.approx(25.00)


def test_duplicate_row_removal():
    """Verify duplicates are detected and removed."""
    csv_data = StringIO(
        "order_date,product,quantity,unit_price\n"
        "2025-01-01,Book,1,20.00\n"
        "2025-01-01,Book,1,20.00\n"
        "2025-01-02,Pen,5,2.00\n"
    )
    df, report = load_dataset(csv_data)
    assert df is not None
    assert report.duplicates_detected == 1
    assert len(df) == 2


def test_invalid_dates_dropped():
    """Verify unparseable date rows are dropped gracefully."""
    csv_data = StringIO(
        "order_date,product,quantity,unit_price\n"
        "2025-01-01,Item A,1,10.00\n"
        "not_a_date,Item B,1,10.00\n"
    )
    df, report = load_dataset(csv_data)
    assert df is not None
    assert len(df) == 1
    assert any("dropped" in warn.lower() for warn in report.warnings)


def test_missing_customer_and_region_defaults():
    """Verify fallback values for missing optional demographics."""
    csv_data = StringIO(
        "order_date,product,quantity,unit_price\n"
        "2025-01-01,Item A,2,15.00\n"
    )
    df, report = load_dataset(csv_data)
    assert df is not None
    assert df.loc[0, "customer_id"] == "Guest"
    assert df.loc[0, "region"] == "All Regions"
    assert df.loc[0, "city"] == "All Cities"

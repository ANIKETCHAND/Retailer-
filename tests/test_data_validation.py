"""
Unit tests for data validation, cleaning, and discount mathematics (test_data_validation.py).
Tests alias mappings, numerical cross-imputation, discount calculations, and boundary value sanitation.
"""

from io import StringIO
import pandas as pd
import pytest
from src.services.data_service import (
    load_raw_dataframe, resolve_column_mapping, validate_and_clean_dataset
)


def test_column_alias_mapping():
    """Verify various common real-world retail header aliases resolve correctly."""
    columns = [
        "invoice_no", "transaction_date", "item_name", "department",
        "qty", "cost_per_unit", "line_total", "territory", "metro", "account_id"
    ]
    mapped, unmapped = resolve_column_mapping(columns)
    assert mapped["order_id"] == "invoice_no"
    assert mapped["order_date"] == "transaction_date"
    assert mapped["product"] == "item_name"
    assert mapped["category"] == "department"
    assert mapped["quantity"] == "qty"
    assert mapped["unit_price"] == "cost_per_unit"
    assert mapped["total_amount"] == "line_total"
    assert mapped["region"] == "territory"
    assert mapped["city"] == "metro"
    assert mapped["customer_id"] == "account_id"


def test_discount_pct_mathematical_correctness():
    """
    CRITICAL: Verify discount_pct is properly calculated as a percentage and
    NOT treated as a flat currency amount!
    Example: 2 units * $100 unit price with 10% discount:
      Gross: $200.00
      10% discount = $20.00
      Net Total = $180.00 (NOT $190.00!)
    """
    csv_data = StringIO(
        "order_date,product,quantity,unit_price,discount_pct\n"
        "2025-06-01,Test Widget,2,100.0,10.0\n"
        "2025-06-02,Test Gadget,1,50.0,20%\n"
        "2025-06-03,Test Device,5,20.0,0.15\n"
        "2025-06-04,Test OnePct,1,100.0,1%\n"
        "2025-06-05,Test FivePct,2,50.0,5.0\n"
    )
    df, report = validate_and_clean_dataset(csv_data)
    assert df is not None and report.is_valid
    assert len(df) == 5

    # Row 0: 2 * 100 * (1 - 0.10) = $180.00
    assert df.loc[0, "total_amount"] == pytest.approx(180.00, abs=0.01)

    # Row 1: 1 * 50 * (1 - 0.20) = $40.00
    assert df.loc[1, "total_amount"] == pytest.approx(40.00, abs=0.01)

    # Row 2: 5 * 20 * (1 - 0.15) = $85.00
    assert df.loc[2, "total_amount"] == pytest.approx(85.00, abs=0.01)

    # Row 3: 1 * 100 * (1 - 0.01) = $99.00 (Crucial boundary: 1% must NOT be treated as 100% discount!)
    assert df.loc[3, "total_amount"] == pytest.approx(99.00, abs=0.01)

    # Row 4: 2 * 50 * (1 - 0.05) = $95.00
    assert df.loc[4, "total_amount"] == pytest.approx(95.00, abs=0.01)


def test_unit_price_cross_imputation_with_discount():
    """Verify unit_price = total_amount / (quantity * (1 - discount_rate))."""
    csv_data = StringIO(
        "order_date,product,quantity,total_amount,discount_pct\n"
        "2025-07-01,Deluxe Chair,2,180.00,10.0\n"
    )
    df, report = validate_and_clean_dataset(csv_data)
    assert df is not None and report.is_valid
    # 180 / (2 * 0.9) = 100.00
    assert df.loc[0, "unit_price"] == pytest.approx(100.00, abs=0.01)


def test_negative_quantity_and_price_sanitation():
    """Verify negative quantities become 1 and negative unit prices/revenues are rejected."""
    csv_data = StringIO(
        "order_date,product,quantity,unit_price,total_amount\n"
        "2025-01-01,Valid Item,2,15.00,30.00\n"
        "2025-01-02,Negative Qty Item,-5,10.00,10.00\n"
        "2025-01-03,Negative Revenue Item,1,10.00,-50.00\n"
    )
    df, report = validate_and_clean_dataset(csv_data)
    assert df is not None
    # Row with negative revenue should be dropped
    assert len(df) == 2
    # Negative quantity should be sanitized to 1
    assert (df["quantity"] > 0).all()


def test_duplicate_and_invalid_date_filtering():
    """Verify duplicates are dropped and invalid date strings are removed."""
    csv_data = StringIO(
        "order_date,product,quantity,unit_price\n"
        "2025-01-01,Item Alpha,1,10.00\n"
        "2025-01-01,Item Alpha,1,10.00\n"
        "invalid_date_str,Item Beta,1,10.00\n"
        "2025-01-02,Item Gamma,1,10.00\n"
    )
    df, report = validate_and_clean_dataset(csv_data)
    assert df is not None
    assert len(df) == 2
    assert report.duplicates_detected == 1
    assert any("dropped" in w.lower() for w in report.warnings)


def test_currency_symbols_and_comma_decimal_parsing():
    """Verify currency symbols ($ € £) and European comma decimals parse accurately."""
    csv_data = StringIO(
        "order_date,product,quantity,unit_price,total_amount\n"
        "2025-01-01,Product Dollar,2,$25.50,$51.00\n"
        "2025-01-02,Product Euro,3,€10.00,€30.00\n"
        '2025-01-03,Product Comma,2,"12,50","25,00"\n'
    )
    df, report = validate_and_clean_dataset(csv_data)
    assert df is not None and report.is_valid
    assert len(df) == 3
    assert df.loc[0, "unit_price"] == pytest.approx(25.50)
    assert df.loc[0, "total_amount"] == pytest.approx(51.00)
    assert df.loc[1, "unit_price"] == pytest.approx(10.00)
    assert df.loc[1, "total_amount"] == pytest.approx(30.00)
    assert df.loc[2, "unit_price"] == pytest.approx(12.50)
    assert df.loc[2, "total_amount"] == pytest.approx(25.00)

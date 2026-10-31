"""
Unit tests for modules/analytics.py and modules/customer_analytics.py
Tests aggregations, KPIs, growth rates, filtering, product rankings, and customer segmentation.
"""

import os
import pandas as pd
import pytest
from modules.data_loader import load_dataset
from modules.analytics import (
    calculate_kpis, apply_filters, get_daily_sales, get_weekly_sales,
    get_monthly_sales, get_yearly_sales, get_category_sales,
    get_regional_sales, get_product_rankings, get_lowest_performing_products
)
from modules.customer_analytics import (
    calculate_customer_metrics, get_top_customers,
    get_repeat_customer_breakdown, get_customer_purchase_frequency
)


@pytest.fixture
def sample_df():
    sample_path = os.path.join("data", "retail_sales.csv")
    df, report = load_dataset(sample_path)
    assert df is not None and report.is_valid
    return df


def test_calculate_kpis(sample_df):
    """Verify core KPIs are correctly calculated from actual data."""
    kpi = calculate_kpis(sample_df)
    assert kpi.total_revenue > 0
    assert kpi.total_orders > 0
    assert kpi.total_units_sold > 0
    assert kpi.average_order_value > 0
    assert kpi.total_products > 0
    assert kpi.total_customers > 0

    # Mathematical consistency checks
    expected_rev = round(float(sample_df["total_amount"].sum()), 2)
    assert kpi.total_revenue == pytest.approx(expected_rev, abs=0.01)

    expected_orders = int(sample_df["order_id"].nunique())
    assert kpi.total_orders == expected_orders

    expected_aov = round(expected_rev / expected_orders, 2)
    assert kpi.average_order_value == pytest.approx(expected_aov, abs=0.01)


def test_apply_filters(sample_df):
    """Verify multi-criteria filtering works properly."""
    # Filter by category
    cat_filtered = apply_filters(sample_df, categories=["Electronics"])
    assert len(cat_filtered) < len(sample_df)
    assert all(cat_filtered["category"] == "Electronics")

    # Filter by region
    reg_filtered = apply_filters(sample_df, regions=["West"])
    assert len(reg_filtered) < len(sample_df)
    assert all(reg_filtered["region"] == "West")

    # Filter by date range
    date_filtered = apply_filters(
        sample_df,
        date_range=(pd.Timestamp("2024-01-01"), pd.Timestamp("2024-06-30"))
    )
    assert len(date_filtered) < len(sample_df)
    assert date_filtered["order_date"].max() <= pd.Timestamp("2024-06-30 23:59:59")


def test_sales_aggregations(sample_df):
    """Verify daily, weekly, monthly, yearly aggregations."""
    daily = get_daily_sales(sample_df)
    assert not daily.empty
    assert "revenue" in daily.columns
    assert "moving_avg_7d" in daily.columns

    weekly = get_weekly_sales(sample_df)
    assert not weekly.empty
    assert "revenue" in weekly.columns

    monthly = get_monthly_sales(sample_df)
    assert not monthly.empty
    assert "mom_growth_pct" in monthly.columns

    yearly = get_yearly_sales(sample_df)
    assert len(yearly) == 2  # 2024 and 2025


def test_category_and_regional_sales(sample_df):
    """Verify category and regional revenue share sums to 100%."""
    cat_sales = get_category_sales(sample_df)
    assert not cat_sales.empty
    assert cat_sales["revenue_share_pct"].sum() == pytest.approx(100.0, abs=0.5)

    reg_sales = get_regional_sales(sample_df)
    assert not reg_sales.empty
    assert reg_sales["revenue_share_pct"].sum() == pytest.approx(100.0, abs=0.5)


def test_product_rankings(sample_df):
    """Verify top 10 products and lowest products."""
    top10 = get_product_rankings(sample_df, top_n=10, sort_by="revenue")
    assert len(top10) == 10
    assert top10.iloc[0]["revenue"] >= top10.iloc[-1]["revenue"]
    assert "cumulative_revenue_pct" in top10.columns

    bottom5 = get_lowest_performing_products(sample_df, bottom_n=5)
    assert len(bottom5) == 5
    assert bottom5.iloc[0]["revenue"] <= bottom5.iloc[-1]["revenue"]


def test_customer_analytics(sample_df):
    """Verify customer metrics, repeat buyer rates, and top spenders."""
    metrics = calculate_customer_metrics(sample_df)
    assert metrics.has_customer_ids is True
    assert metrics.total_customers > 0
    assert 0 <= metrics.repeat_customer_rate_pct <= 100
    assert metrics.avg_revenue_per_customer > 0

    top_cust = get_top_customers(sample_df, top_n=5)
    assert len(top_cust) == 5
    assert top_cust.iloc[0]["total_spent"] >= top_cust.iloc[-1]["total_spent"]

    breakdown = get_repeat_customer_breakdown(sample_df)
    assert not breakdown.empty
    assert set(breakdown["segment"].tolist()) == {"Repeat Customers", "One-Time Customers"}

    freq = get_customer_purchase_frequency(sample_df)
    assert not freq.empty
    assert "customer_count" in freq.columns

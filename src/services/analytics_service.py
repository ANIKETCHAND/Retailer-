"""
RetailVision - Analytics Service (Business Logic)
Executes KPI calculations, period comparisons, time-series aggregations,
and product ranking diagnostics.
"""

from dataclasses import dataclass
from typing import Dict, List, Optional, Tuple, Union
import numpy as np
import pandas as pd


@dataclass
class KPISummary:
    """Core executive KPI metrics with period-over-period comparisons."""
    total_revenue: float = 0.0
    total_orders: int = 0
    total_units_sold: int = 0
    average_order_value: float = 0.0
    total_products: int = 0
    total_customers: int = 0
    prior_revenue: Optional[float] = None
    revenue_growth_pct: Optional[float] = None
    prior_orders: Optional[int] = None
    orders_growth_pct: Optional[float] = None
    prior_units: Optional[int] = None
    units_growth_pct: Optional[float] = None
    prior_aov: Optional[float] = None
    aov_growth_pct: Optional[float] = None


def apply_filters(
    df: pd.DataFrame,
    date_range: Optional[Tuple[pd.Timestamp, pd.Timestamp]] = None,
    categories: Optional[List[str]] = None,
    products: Optional[List[str]] = None,
    regions: Optional[List[str]] = None,
    cities: Optional[List[str]] = None
) -> pd.DataFrame:
    """Applies multi-dimensional filters to retail dataframe."""
    if df is None or df.empty:
        return pd.DataFrame()

    filtered = df.copy()

    # 1. Date Range
    if date_range and len(date_range) == 2:
        start_date, end_date = date_range
        if start_date is not None and pd.notna(start_date):
            start_ts = pd.to_datetime(start_date)
            filtered = filtered[filtered["order_date"] >= start_ts]
        if end_date is not None and pd.notna(end_date):
            end_ts = pd.to_datetime(end_date) + pd.Timedelta(days=1) - pd.Timedelta(nanoseconds=1)
            filtered = filtered[filtered["order_date"] <= end_ts]

    # 2. Dimensions (Category, Product, Region, City)
    for col, values in [("category", categories), ("product", products), ("region", regions), ("city", cities)]:
        if values and "All" not in values and len(values) > 0:
            filtered = filtered[filtered[col].isin(values)]

    return filtered.reset_index(drop=True)


def calculate_kpis(df: pd.DataFrame, full_df: Optional[pd.DataFrame] = None) -> KPISummary:
    """Calculates executive KPIs and compares with preceding chronological period."""
    if df is None or df.empty:
        return KPISummary()

    total_revenue = float(df["total_amount"].sum())
    total_orders = int(df["order_id"].nunique()) if "order_id" in df.columns else len(df)
    total_units = int(df["quantity"].sum())
    aov = (total_revenue / total_orders) if total_orders > 0 else 0.0
    total_products = int(df["product"].nunique())

    if "customer_id" in df.columns:
        valid_customers = df["customer_id"][df["customer_id"] != "Guest"]
        if not valid_customers.empty:
            total_customers = int(valid_customers.nunique())
        else:
            total_customers = int(df["customer_id"].nunique())
    else:
        total_customers = 0

    kpi = KPISummary(
        total_revenue=round(total_revenue, 2),
        total_orders=total_orders,
        total_units_sold=total_units,
        average_order_value=round(aov, 2),
        total_products=total_products,
        total_customers=total_customers
    )

    source_df = full_df if full_df is not None else df
    min_date = df["order_date"].min()
    max_date = df["order_date"].max()

    if pd.notna(min_date) and pd.notna(max_date):
        duration = (max_date - min_date)
        prior_end = min_date - pd.Timedelta(seconds=1)
        prior_start = prior_end - duration

        prior_df = source_df[(source_df["order_date"] >= prior_start) & (source_df["order_date"] <= prior_end)]
        if not prior_df.empty:
            p_rev = float(prior_df["total_amount"].sum())
            p_orders = int(prior_df["order_id"].nunique()) if "order_id" in prior_df.columns else len(prior_df)
            p_units = int(prior_df["quantity"].sum())
            p_aov = (p_rev / p_orders) if p_orders > 0 else 0.0

            kpi.prior_revenue = round(p_rev, 2)
            kpi.prior_orders = p_orders
            kpi.prior_units = p_units
            kpi.prior_aov = round(p_aov, 2)

            calc_growth = lambda curr, prior: round(((curr - prior) / prior) * 100, 2) if prior and prior > 0 else None
            kpi.revenue_growth_pct = calc_growth(total_revenue, p_rev)
            kpi.orders_growth_pct = calc_growth(total_orders, p_orders)
            kpi.units_growth_pct = calc_growth(total_units, p_units)
            kpi.aov_growth_pct = calc_growth(aov, p_aov)

    return kpi


def get_daily_sales(df: pd.DataFrame) -> pd.DataFrame:
    """Aggregates sales by calendar day with 7-day smoothing."""
    if df is None or df.empty:
        return pd.DataFrame(columns=["date", "revenue", "orders", "units"])

    daily = df.groupby(df["order_date"].dt.date).agg(
        revenue=("total_amount", "sum"),
        orders=("order_id", "nunique"),
        units=("quantity", "sum")
    ).reset_index()

    daily.rename(columns={"order_date": "date"}, inplace=True)
    daily["date"] = pd.to_datetime(daily["date"])
    daily = daily.sort_values(by="date").reset_index(drop=True)
    daily["revenue"] = daily["revenue"].round(2)
    daily["moving_avg_7d"] = daily["revenue"].rolling(window=7, min_periods=1).mean().round(2)
    return daily


def get_weekly_sales(df: pd.DataFrame) -> pd.DataFrame:
    """Aggregates sales by calendar week (starting Monday)."""
    if df is None or df.empty:
        return pd.DataFrame(columns=["week_start", "revenue", "orders", "units"])

    weekly = df.set_index("order_date").resample("W-MON").agg(
        revenue=("total_amount", "sum"),
        orders=("order_id", "nunique"),
        units=("quantity", "sum")
    ).reset_index()

    weekly.rename(columns={"order_date": "week_start"}, inplace=True)
    weekly["revenue"] = weekly["revenue"].round(2)
    weekly["moving_avg_4w"] = weekly["revenue"].rolling(window=4, min_periods=1).mean().round(2)
    return weekly


def get_monthly_sales(df: pd.DataFrame) -> pd.DataFrame:
    """Aggregates sales by calendar month with MoM growth rates."""
    if df is None or df.empty:
        return pd.DataFrame(columns=["year_month", "month_name", "revenue", "orders", "units", "mom_growth_pct"])

    monthly = df.set_index("order_date").resample("MS").agg(
        revenue=("total_amount", "sum"),
        orders=("order_id", "nunique"),
        units=("quantity", "sum")
    ).reset_index()

    monthly["year_month"] = monthly["order_date"].dt.strftime("%Y-%m")
    monthly["month_name"] = monthly["order_date"].dt.strftime("%b %Y")
    monthly["revenue"] = monthly["revenue"].round(2)
    monthly["mom_growth_pct"] = (monthly["revenue"].pct_change() * 100).round(2).fillna(0.0)
    monthly["avg_order_value"] = (monthly["revenue"] / monthly["orders"]).round(2).fillna(0.0)
    return monthly


def get_yearly_sales(df: pd.DataFrame) -> pd.DataFrame:
    """Aggregates sales by calendar year with YoY growth rates."""
    if df is None or df.empty:
        return pd.DataFrame(columns=["year", "revenue", "orders", "units", "yoy_growth_pct"])

    yearly = df.groupby(df["order_date"].dt.year).agg(
        revenue=("total_amount", "sum"),
        orders=("order_id", "nunique"),
        units=("quantity", "sum")
    ).reset_index()

    yearly.rename(columns={"order_date": "year"}, inplace=True)
    yearly["revenue"] = yearly["revenue"].round(2)
    yearly["yoy_growth_pct"] = (yearly["revenue"].pct_change() * 100).round(2).fillna(0.0)
    yearly["avg_order_value"] = (yearly["revenue"] / yearly["orders"]).round(2).fillna(0.0)
    return yearly


def get_category_sales(df: pd.DataFrame) -> pd.DataFrame:
    """Aggregates sales by category with revenue share percentages."""
    if df is None or df.empty:
        return pd.DataFrame(columns=["category", "revenue", "units", "orders", "revenue_share_pct"])

    cat = df.groupby("category").agg(
        revenue=("total_amount", "sum"),
        units=("quantity", "sum"),
        orders=("order_id", "nunique")
    ).reset_index()

    total_revenue = cat["revenue"].sum()
    cat["revenue"] = cat["revenue"].round(2)
    cat["revenue_share_pct"] = ((cat["revenue"] / total_revenue) * 100).round(2) if total_revenue > 0 else 0.0
    cat["avg_unit_price"] = (cat["revenue"] / cat["units"]).round(2)
    cat = cat.sort_values(by="revenue", ascending=False).reset_index(drop=True)
    return cat


def get_regional_sales(df: pd.DataFrame) -> pd.DataFrame:
    """Aggregates sales by region."""
    if df is None or df.empty:
        return pd.DataFrame(columns=["region", "revenue", "orders", "units", "revenue_share_pct"])

    reg = df.groupby("region").agg(
        revenue=("total_amount", "sum"),
        orders=("order_id", "nunique"),
        units=("quantity", "sum")
    ).reset_index()

    total_revenue = reg["revenue"].sum()
    reg["revenue"] = reg["revenue"].round(2)
    reg["revenue_share_pct"] = ((reg["revenue"] / total_revenue) * 100).round(2) if total_revenue > 0 else 0.0
    reg = reg.sort_values(by="revenue", ascending=False).reset_index(drop=True)
    return reg


def get_city_sales(df: pd.DataFrame, top_n: int = 10) -> pd.DataFrame:
    """Aggregates sales by city."""
    if df is None or df.empty:
        return pd.DataFrame(columns=["city", "region", "revenue", "orders", "units"])

    city_df = df.groupby(["city", "region"]).agg(
        revenue=("total_amount", "sum"),
        orders=("order_id", "nunique"),
        units=("quantity", "sum")
    ).reset_index()

    city_df["revenue"] = city_df["revenue"].round(2)
    city_df = city_df.sort_values(by="revenue", ascending=False).head(top_n).reset_index(drop=True)
    return city_df


def get_product_rankings(
    df: pd.DataFrame,
    top_n: Optional[int] = 10,
    sort_by: str = "revenue",
    ascending: bool = False
) -> pd.DataFrame:
    """Ranks products with Pareto cumulative revenue calculation."""
    if df is None or df.empty:
        return pd.DataFrame()

    prod = df.groupby(["product", "category"]).agg(
        revenue=("total_amount", "sum"),
        units_sold=("quantity", "sum"),
        orders_count=("order_id", "nunique"),
        avg_price=("unit_price", "mean")
    ).reset_index()

    total_rev = prod["revenue"].sum()
    total_units = prod["units_sold"].sum()

    prod["revenue"] = prod["revenue"].round(2)
    prod["avg_price"] = prod["avg_price"].round(2)
    prod["revenue_share_pct"] = ((prod["revenue"] / total_rev) * 100).round(2) if total_rev > 0 else 0.0
    prod["units_share_pct"] = ((prod["units_sold"] / total_units) * 100).round(2) if total_units > 0 else 0.0

    # Pareto cumulative share: sort by revenue descending first to compute cumsum directly
    prod = prod.sort_values(by="revenue", ascending=False).reset_index(drop=True)
    prod["cumulative_revenue_pct"] = (prod["revenue"].cumsum() / total_rev * 100).round(2) if total_rev > 0 else 0.0

    col_map = {
        "revenue": "revenue",
        "units": "units_sold",
        "orders": "orders_count",
        "price": "avg_price"
    }
    target_col = col_map.get(sort_by, "revenue")
    if target_col != "revenue" or ascending:
        prod = prod.sort_values(by=target_col, ascending=ascending).reset_index(drop=True)

    if top_n is not None and top_n > 0:
        return prod.head(top_n)
    return prod


def get_lowest_performing_products(df: pd.DataFrame, bottom_n: int = 10) -> pd.DataFrame:
    """Returns bottom performing products."""
    return get_product_rankings(df, top_n=bottom_n, sort_by="revenue", ascending=True)

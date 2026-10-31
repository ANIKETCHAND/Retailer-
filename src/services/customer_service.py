"""
RetailVision - Customer Service (Business Logic)
Provides customer segmentation, repeat buyer rates, frequency distributions, and ARPU.
"""

from dataclasses import dataclass
from typing import Optional
import numpy as np
import pandas as pd


@dataclass
class CustomerMetrics:
    """Core summary metrics for customer base."""
    total_customers: int = 0
    total_repeat_customers: int = 0
    repeat_customer_rate_pct: float = 0.0
    avg_revenue_per_customer: float = 0.0
    avg_orders_per_customer: float = 0.0
    has_customer_ids: bool = True
    guest_orders_count: int = 0


def calculate_customer_metrics(df: pd.DataFrame) -> CustomerMetrics:
    """Computes customer retention KPIs, handling anonymous guests safely."""
    if df is None or df.empty or "customer_id" not in df.columns:
        return CustomerMetrics(has_customer_ids=False)

    non_guest_df = df[df["customer_id"] != "Guest"]
    guest_orders = int((df["customer_id"] == "Guest").sum())

    if non_guest_df.empty:
        return CustomerMetrics(
            total_customers=1,
            total_repeat_customers=0,
            repeat_customer_rate_pct=0.0,
            avg_revenue_per_customer=round(df["total_amount"].sum(), 2),
            avg_orders_per_customer=round(df["order_id"].nunique(), 2),
            has_customer_ids=False,
            guest_orders_count=guest_orders
        )

    cust_summary = non_guest_df.groupby("customer_id").agg(
        orders=("order_id", "nunique"),
        revenue=("total_amount", "sum")
    )

    total_cust = len(cust_summary)
    repeat_cust = int((cust_summary["orders"] > 1).sum())
    repeat_rate = round((repeat_cust / total_cust * 100), 2) if total_cust > 0 else 0.0
    arpu = round(cust_summary["revenue"].mean(), 2) if total_cust > 0 else 0.0
    avg_orders = round(cust_summary["orders"].mean(), 2) if total_cust > 0 else 0.0

    return CustomerMetrics(
        total_customers=total_cust,
        total_repeat_customers=repeat_cust,
        repeat_customer_rate_pct=repeat_rate,
        avg_revenue_per_customer=arpu,
        avg_orders_per_customer=avg_orders,
        has_customer_ids=True,
        guest_orders_count=guest_orders
    )


def get_top_customers(df: pd.DataFrame, top_n: int = 10) -> pd.DataFrame:
    """Returns top customers ranked by total spend."""
    if df is None or df.empty or "customer_id" not in df.columns:
        return pd.DataFrame()

    valid_df = df[df["customer_id"] != "Guest"]
    if valid_df.empty:
        return pd.DataFrame()

    top_cust = valid_df.groupby("customer_id").agg(
        total_spent=("total_amount", "sum"),
        total_orders=("order_id", "nunique"),
        total_items=("quantity", "sum"),
        first_purchase=("order_date", "min"),
        last_purchase=("order_date", "max")
    ).reset_index()

    top_cust["total_spent"] = top_cust["total_spent"].round(2)
    top_cust["avg_order_value"] = (top_cust["total_spent"] / top_cust["total_orders"]).round(2)
    top_cust["first_purchase"] = top_cust["first_purchase"].dt.strftime("%Y-%m-%d")
    top_cust["last_purchase"] = top_cust["last_purchase"].dt.strftime("%Y-%m-%d")

    top_cust = top_cust.sort_values(by="total_spent", ascending=False).head(top_n).reset_index(drop=True)
    return top_cust


def get_repeat_customer_breakdown(df: pd.DataFrame) -> pd.DataFrame:
    """Compares Single-Order customers vs Repeat-Order customers."""
    if df is None or df.empty or "customer_id" not in df.columns:
        return pd.DataFrame()

    valid_df = df[df["customer_id"] != "Guest"]
    if valid_df.empty:
        return pd.DataFrame()

    cust_stats = valid_df.groupby("customer_id").agg(
        orders=("order_id", "nunique"),
        revenue=("total_amount", "sum")
    ).reset_index()

    cust_stats["segment"] = np.where(cust_stats["orders"] > 1, "Repeat Customers", "One-Time Customers")

    breakdown = cust_stats.groupby("segment").agg(
        customer_count=("customer_id", "count"),
        total_revenue=("revenue", "sum"),
        avg_revenue_per_user=("revenue", "mean"),
        total_orders=("orders", "sum")
    ).reset_index()

    total_rev = breakdown["total_revenue"].sum()
    total_cust = breakdown["customer_count"].sum()

    breakdown["total_revenue"] = breakdown["total_revenue"].round(2)
    breakdown["avg_revenue_per_user"] = breakdown["avg_revenue_per_user"].round(2)
    breakdown["customer_share_pct"] = ((breakdown["customer_count"] / total_cust) * 100).round(2) if total_cust > 0 else 0.0
    breakdown["revenue_share_pct"] = ((breakdown["total_revenue"] / total_rev) * 100).round(2) if total_rev > 0 else 0.0

    return breakdown


def get_customer_purchase_frequency(df: pd.DataFrame) -> pd.DataFrame:
    """Binned frequency distribution of orders per customer."""
    if df is None or df.empty or "customer_id" not in df.columns:
        return pd.DataFrame()

    valid_df = df[df["customer_id"] != "Guest"]
    if valid_df.empty:
        return pd.DataFrame()

    orders_per_cust = valid_df.groupby("customer_id")["order_id"].nunique().reset_index()
    orders_per_cust.columns = ["customer_id", "order_count"]

    bins = [0, 1, 3, 6, 10, np.inf]
    labels = ["1 Order", "2 - 3 Orders", "4 - 6 Orders", "7 - 10 Orders", "11+ Orders"]

    orders_per_cust["frequency_tier"] = pd.cut(orders_per_cust["order_count"], bins=bins, labels=labels, right=True)
    freq_summary = orders_per_cust.groupby("frequency_tier", observed=False).size().reset_index(name="customer_count")
    total_cust = freq_summary["customer_count"].sum()
    freq_summary["percentage"] = ((freq_summary["customer_count"] / total_cust) * 100).round(2) if total_cust > 0 else 0.0

    return freq_summary

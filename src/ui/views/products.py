"""
RetailVision - Product Portfolio Analytics View
Provides SKU performance ranking, Pareto cumulative share, and underperforming SKU identification.
"""

import matplotlib.pyplot as plt
import pandas as pd
import streamlit as st
from src.core.state import state_manager
from src.services.analytics_service import (
    get_lowest_performing_products, get_product_rankings
)
from src.visualizations.charts import plot_top_products


def render_products_view(filtered_df: pd.DataFrame) -> None:
    """Renders the product analytics view."""
    current_theme = state_manager.get_theme()

    st.title("🛍️ Product Portfolio Analytics")
    st.markdown("Comprehensive SKU performance diagnostics, revenue contributions, and Pareto concentration.")
    st.write("")

    if filtered_df.empty:
        st.warning("No records match current filters.")
        return

    prod_ctrl1, prod_ctrl2, prod_ctrl3 = st.columns([1, 1, 1.5])
    with prod_ctrl1:
        sort_metric = st.selectbox("Ranking Metric", options=["Revenue ($)", "Units Sold", "Order Count", "Average Price"], index=0)
    with prod_ctrl2:
        top_k = st.slider("Number of Products", min_value=5, max_value=25, value=10, step=5)
    with prod_ctrl3:
        search_query = st.text_input("Filter Products by Name", placeholder="e.g., Wireless, Headphone, Shirt...")

    metric_key_map = {
        "Revenue ($)": "revenue",
        "Units Sold": "units",
        "Order Count": "orders",
        "Average Price": "price"
    }
    selected_sort_key = metric_key_map[sort_metric]

    prod_rank_df = get_product_rankings(filtered_df, top_n=None, sort_by=selected_sort_key)
    if search_query.strip():
        prod_rank_df = prod_rank_df[prod_rank_df["product"].str.contains(search_query.strip(), case=False, na=False)]

    st.write("")
    st.subheader(f"Top {top_k} Products Ranked by {sort_metric}")

    chart_col, table_col = st.columns([1.2, 1.0])
    with chart_col:
        fig_prod_rank = plot_top_products(prod_rank_df, theme=current_theme, top_n=top_k)
        st.pyplot(fig_prod_rank, use_container_width=True)
        plt.close(fig_prod_rank)

    with table_col:
        st.dataframe(
            prod_rank_df.head(top_k)[["product", "category", "revenue", "units_sold", "revenue_share_pct", "cumulative_revenue_pct"]].style.format({
                "revenue": "${:,.2f}",
                "revenue_share_pct": "{:.2f}%",
                "cumulative_revenue_pct": "{:.1f}%"
            }),
            use_container_width=True,
            height=380
        )

    st.markdown("---")
    st.subheader("Lowest-Performing Products (Underperforming SKUs)")
    st.caption("Identify items with minimal demand to evaluate clearance or inventory reduction.")

    lowest_df = get_lowest_performing_products(filtered_df, bottom_n=5)
    st.dataframe(
        lowest_df[["product", "category", "revenue", "units_sold", "orders_count", "avg_price"]].style.format({
            "revenue": "${:,.2f}",
            "avg_price": "${:,.2f}"
        }),
        use_container_width=True
    )

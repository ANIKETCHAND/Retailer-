"""
RetailVision - Customer Intelligence View
Renders buyer retention metrics, repeat conversion rates, frequency distribution, and high-value customers.
"""

import matplotlib.pyplot as plt
import pandas as pd
import streamlit as st
from src.core.state import state_manager
from src.services.customer_service import (
    calculate_customer_metrics, get_customer_purchase_frequency,
    get_repeat_customer_breakdown, get_top_customers
)
from src.ui.components.kpi_card import render_kpi_card
from src.visualizations.charts import (
    plot_customer_frequency, plot_repeat_vs_onetime
)


def render_customers_view(filtered_df: pd.DataFrame) -> None:
    """Renders the customer intelligence view."""
    current_theme = state_manager.get_theme()

    st.title("👥 Customer Intelligence & Retention Analytics")
    st.markdown("Buyer lifetime analysis, repeat conversion rates, purchase frequencies, and loyalty tiers.")
    st.write("")

    if filtered_df.empty:
        st.warning("No records match current filters.")
        return

    cust_metrics = calculate_customer_metrics(filtered_df)

    if not cust_metrics.has_customer_ids:
        st.info("ℹ️ Dataset does not contain distinct customer IDs or all purchases were made anonymously as 'Guest'.")

    c1, c2, c3, c4 = st.columns(4)
    with c1:
        render_kpi_card("Total Customers", f"{cust_metrics.total_customers:,}")
    with c2:
        render_kpi_card("Repeat Customers (2+)", f"{cust_metrics.total_repeat_customers:,}")
    with c3:
        render_kpi_card("Repeat Customer Rate", f"{cust_metrics.repeat_customer_rate_pct:.1f}%")
    with c4:
        render_kpi_card("Avg Spend / Customer", f"${cust_metrics.avg_revenue_per_customer:,.2f}")

    st.write("")
    cust_row1_col1, cust_row1_col2 = st.columns(2)

    with cust_row1_col1:
        st.subheader("Repeat vs Single-Order Revenue Share")
        breakdown_df = get_repeat_customer_breakdown(filtered_df)
        if not breakdown_df.empty:
            fig_repeat = plot_repeat_vs_onetime(breakdown_df, theme=current_theme)
            st.pyplot(fig_repeat, use_container_width=True)
            plt.close(fig_repeat)
        else:
            st.write("Insufficient customer segmentation data.")

    with cust_row1_col2:
        st.subheader("Customer Purchase Frequency Distribution")
        freq_df = get_customer_purchase_frequency(filtered_df)
        if not freq_df.empty:
            fig_freq = plot_customer_frequency(freq_df, theme=current_theme)
            st.pyplot(fig_freq, use_container_width=True)
            plt.close(fig_freq)
        else:
            st.write("Insufficient purchase frequency distribution data.")

    st.markdown("---")
    st.subheader("Top High-Value Customers")
    top_cust_df = get_top_customers(filtered_df, top_n=10)
    if not top_cust_df.empty:
        st.dataframe(
            top_cust_df.style.format({
                "total_spent": "${:,.2f}",
                "avg_order_value": "${:,.2f}"
            }),
            use_container_width=True
        )
    else:
        st.write("No distinct customer records found.")

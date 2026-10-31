"""
RetailVision - Sales Analytics View
Provides granular temporal analyses: Daily, Weekly, Monthly, Yearly, and Regional/City breakdowns.
"""

import matplotlib.pyplot as plt
import pandas as pd
import streamlit as st
from src.core.state import state_manager
from src.services.analytics_service import (
    get_city_sales, get_daily_sales, get_monthly_sales,
    get_regional_sales, get_weekly_sales, get_yearly_sales
)
from src.visualizations.charts import plot_daily_sales_trend, plot_growth_comparison


def render_sales_view(filtered_df: pd.DataFrame) -> None:
    """Renders the advanced sales analytics view."""
    current_theme = state_manager.get_theme()

    st.title("📈 Advanced Sales Analytics")
    st.markdown("Detailed breakdown of temporal patterns, growth trajectories, and period-over-period dynamics.")
    st.write("")

    if filtered_df.empty:
        st.warning("No records match current filters.")
        return

    grain_tabs = st.tabs(["Daily Sales", "Weekly Sales", "Monthly Analysis", "Yearly Comparison", "Regional & City Breakdown"])

    with grain_tabs[0]:
        st.subheader("Daily Sales Trajectory & 7-Day Smoothing")
        daily_df = get_daily_sales(filtered_df)
        fig_daily = plot_daily_sales_trend(daily_df, theme=current_theme)
        st.pyplot(fig_daily, use_container_width=True)
        plt.close(fig_daily)

        with st.expander("View Daily Sales Summary Table"):
            st.dataframe(
                daily_df.sort_values(by="date", ascending=False).style.format({"revenue": "${:,.2f}", "moving_avg_7d": "${:,.2f}"}),
                use_container_width=True
            )

    with grain_tabs[1]:
        st.subheader("Weekly Sales Aggregation (Monday Start)")
        weekly_df = get_weekly_sales(filtered_df)
        st.line_chart(weekly_df.set_index("week_start")[["revenue", "moving_avg_4w"]])
        with st.expander("View Weekly Sales Data"):
            st.dataframe(
                weekly_df.sort_values(by="week_start", ascending=False).style.format({"revenue": "${:,.2f}", "moving_avg_4w": "${:,.2f}"}),
                use_container_width=True
            )

    with grain_tabs[2]:
        st.subheader("Monthly Revenue vs Month-over-Month (MoM) Growth Rate")
        monthly_df = get_monthly_sales(filtered_df)
        fig_growth = plot_growth_comparison(monthly_df, theme=current_theme)
        st.pyplot(fig_growth, use_container_width=True)
        plt.close(fig_growth)

        st.subheader("Monthly Performance Breakdown")
        st.dataframe(
            monthly_df[["month_name", "revenue", "orders", "units", "avg_order_value", "mom_growth_pct"]].style.format({
                "revenue": "${:,.2f}",
                "avg_order_value": "${:,.2f}",
                "mom_growth_pct": "{:+.2f}%"
            }),
            use_container_width=True
        )

    with grain_tabs[3]:
        st.subheader("Yearly Sales & Annual Growth Comparison")
        yearly_df = get_yearly_sales(filtered_df)
        st.dataframe(
            yearly_df.style.format({
                "revenue": "${:,.2f}",
                "avg_order_value": "${:,.2f}",
                "yoy_growth_pct": "{:+.2f}%"
            }),
            use_container_width=True
        )

    with grain_tabs[4]:
        st.subheader("Regional & Top Metro City Demand")
        c1, c2 = st.columns(2)
        with c1:
            st.write("**Sales by Region**")
            reg_df = get_regional_sales(filtered_df)
            st.dataframe(
                reg_df.style.format({"revenue": "${:,.2f}", "revenue_share_pct": "{:.2f}%"}),
                use_container_width=True
            )
        with c2:
            st.write("**Top 10 Cities by Revenue**")
            city_df = get_city_sales(filtered_df, top_n=10)
            st.dataframe(
                city_df.style.format({"revenue": "${:,.2f}"}),
                use_container_width=True
            )

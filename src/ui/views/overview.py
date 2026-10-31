"""
RetailVision - Overview Dashboard View
Renders 6 executive KPI cards, monthly revenue momentum, category distribution,
regional sales, top products, and executive performance summary.
"""

import matplotlib.pyplot as plt
import pandas as pd
import streamlit as st
from src.core.state import state_manager
from src.services.analytics_service import (
    KPISummary, get_category_sales, get_monthly_sales, get_product_rankings,
    get_regional_sales
)
from src.ui.components.kpi_card import render_kpi_card
from src.visualizations.charts import (
    plot_category_distribution, plot_monthly_revenue_trend,
    plot_regional_sales, plot_top_products
)


def render_overview_view(filtered_df: pd.DataFrame, raw_df: pd.DataFrame, kpis: KPISummary, date_range: tuple) -> None:
    """Renders the executive overview dashboard."""
    start_dt, end_dt = date_range
    current_theme = state_manager.get_theme()

    st.title("🏢 Executive Overview Dashboard")
    st.markdown(
        f"**Active Scope:** {start_dt.strftime('%b %d, %Y')} to {end_dt.strftime('%b %d, %Y')} &nbsp;|&nbsp; "
        f"**Filtered Records:** `{len(filtered_df):,}` of `{len(raw_df):,}` transactions &nbsp;|&nbsp; "
        f"<span class='badge-tag'>{state_manager.get_dataset_source()}</span>",
        unsafe_allow_html=True
    )
    st.write("")

    if filtered_df.empty:
        st.warning("No records match the selected filter combination. Please expand your filter criteria in the sidebar.")
        return

    # 6 Top-tier KPI Cards
    col1, col2, col3, col4, col5, col6 = st.columns(6)
    with col1:
        render_kpi_card("Total Revenue", f"${kpis.total_revenue:,.2f}", kpis.revenue_growth_pct)
    with col2:
        render_kpi_card("Total Orders", f"{kpis.total_orders:,}", kpis.orders_growth_pct)
    with col3:
        render_kpi_card("Units Sold", f"{kpis.total_units_sold:,}", kpis.units_growth_pct)
    with col4:
        render_kpi_card("Avg Order Value", f"${kpis.average_order_value:,.2f}", kpis.aov_growth_pct)
    with col5:
        render_kpi_card("Distinct Products", f"{kpis.total_products:,}")
    with col6:
        render_kpi_card("Active Customers", f"{kpis.total_customers:,}")

    st.write("")

    # Visualizations Row 1
    grid_col1, grid_col2 = st.columns([1.6, 1.0])
    with grid_col1:
        st.subheader("Monthly Revenue Momentum")
        monthly_data = get_monthly_sales(filtered_df)
        fig_monthly = plot_monthly_revenue_trend(monthly_data, theme=current_theme)
        st.pyplot(fig_monthly, use_container_width=True)
        plt.close(fig_monthly)

    with grid_col2:
        st.subheader("Revenue by Category")
        cat_data = get_category_sales(filtered_df)
        fig_cat = plot_category_distribution(cat_data, theme=current_theme)
        st.pyplot(fig_cat, use_container_width=True)
        plt.close(fig_cat)

    st.write("")

    # Visualizations Row 2
    row2_col1, row2_col2 = st.columns([1.1, 1.3])
    with row2_col1:
        st.subheader("Geographic Sales Distribution")
        reg_data = get_regional_sales(filtered_df)
        fig_reg = plot_regional_sales(reg_data, theme=current_theme)
        st.pyplot(fig_reg, use_container_width=True)
        plt.close(fig_reg)

    with row2_col2:
        st.subheader("Top-Performing Products")
        top_prod_data = get_product_rankings(filtered_df, top_n=6, sort_by="revenue")
        fig_prod = plot_top_products(top_prod_data, theme=current_theme, top_n=6)
        st.pyplot(fig_prod, use_container_width=True)
        plt.close(fig_prod)

    # Executive Summary Observation
    st.write("")
    st.subheader("Executive Performance Summary")
    if not cat_data.empty and not reg_data.empty:
        lead_cat = cat_data.iloc[0]["category"]
        lead_cat_rev = cat_data.iloc[0]["revenue"]
        lead_cat_pct = cat_data.iloc[0]["revenue_share_pct"]

        lead_reg = reg_data.iloc[0]["region"]
        lead_reg_rev = reg_data.iloc[0]["revenue"]
        lead_reg_pct = reg_data.iloc[0]["revenue_share_pct"]

        st.info(
            f"💡 **Key Observation:** The **{lead_cat}** category is the strongest portfolio driver, delivering "
            f"**${lead_cat_rev:,.2f}** ({lead_cat_pct:.1f}% of filtered revenue). Regionally, **{lead_reg}** leads "
            f"with **${lead_reg_rev:,.2f}** ({lead_reg_pct:.1f}% regional share). Average revenue per order stands at "
            f"**${kpis.average_order_value:,.2f}** across **{kpis.total_orders:,}** transactions."
        )

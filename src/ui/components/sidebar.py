"""
RetailVision - Sidebar & Navigation Component
Renders sidebar brand header, theme toggle, page navigation, data source selector, and dynamic filters.
"""

from typing import Any, Dict, List, Tuple
import pandas as pd
import streamlit as st
from src.core.state import state_manager


def render_sidebar(raw_df: pd.DataFrame) -> Tuple[str, Dict[str, Any]]:
    """
    Renders sidebar elements and returns:
    (selected_navigation_item, filter_dictionary)
    """
    with st.sidebar:
        # 1. Brand Mark Header
        st.markdown(
            """
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 14px;">
                <div style="background: linear-gradient(135deg, #3B82F6, #10B981); width: 34px; height: 34px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 900; color: white;">RV</div>
                <div>
                    <div style="font-size: 1.15rem; font-weight: 800; letter-spacing: -0.5px; line-height: 1.1;">Retail<span style="color:#10B981;">Vision</span></div>
                    <div style="font-size: 0.65rem; font-weight: 600; letter-spacing: 1px; color: #94A3B8;">ANALYTICS SUITE</div>
                </div>
            </div>
            """,
            unsafe_allow_html=True
        )

        # 2. Theme Toggle
        is_dark = state_manager.get_theme() == "dark"
        selected_theme = st.radio(
            "Interface Theme",
            options=["Dark", "Light"],
            index=0 if is_dark else 1,
            horizontal=True,
            label_visibility="collapsed"
        )
        if selected_theme.lower() != state_manager.get_theme():
            state_manager.set_theme(selected_theme.lower())
            st.rerun()

        st.markdown("---")

        # 3. Navigation
        nav_options = [
            "Overview Dashboard",
            "Sales Analytics",
            "Product Analytics",
            "Customer Analytics",
            "Sales Forecasting",
            "Data Management",
            "Reports & Exports"
        ]
        current_nav = state_manager.get_active_nav()
        nav_idx = nav_options.index(current_nav) if current_nav in nav_options else 0

        nav_selection = st.radio(
            "Navigation",
            options=nav_options,
            index=nav_idx
        )
        state_manager.set_active_nav(nav_selection)

        st.markdown("---")

        # 4. Data Source
        st.subheader("Data Source")
        current_source = state_manager.get_dataset_source()
        source_idx = 0 if current_source == "Built-in Sample" else 1

        dataset_choice = st.selectbox(
            "Active Dataset",
            options=["Sample Dataset (2024-2025)", "User Uploaded CSV"],
            index=source_idx
        )
        if dataset_choice == "User Uploaded CSV":
            state_manager.set_dataset_source("Custom Upload")
        else:
            state_manager.set_dataset_source("Built-in Sample")

        st.markdown("---")

        # 5. Global Interactive Filters
        st.subheader("Global Filters")

        min_date = raw_df["order_date"].min().date()
        max_date = raw_df["order_date"].max().date()

        selected_date_range = st.date_input(
            "Analysis Period",
            value=(min_date, max_date),
            min_value=min_date,
            max_value=max_date
        )

        all_categories = sorted(raw_df["category"].dropna().unique().tolist())
        selected_categories = st.multiselect("Category", options=["All"] + all_categories, default=["All"])

        all_regions = sorted(raw_df["region"].dropna().unique().tolist())
        selected_regions = st.multiselect("Region", options=["All"] + all_regions, default=["All"])

        if "All" in selected_regions or not selected_regions:
            available_cities = sorted(raw_df["city"].dropna().unique().tolist())
        else:
            available_cities = sorted(raw_df[raw_df["region"].isin(selected_regions)]["city"].dropna().unique().tolist())

        selected_cities = st.multiselect("City", options=["All"] + available_cities, default=["All"])

        if st.button("Reset All Filters", use_container_width=True):
            state_manager.reset_filters()
            st.rerun()

        st.markdown("---")
        st.caption("RetailVision v2.0 • Enterprise Edition")

    # Safe Date parsing
    if isinstance(selected_date_range, (list, tuple)) and len(selected_date_range) == 2:
        filter_start, filter_end = selected_date_range
    else:
        filter_start, filter_end = min_date, max_date

    filters = {
        "date_range": (filter_start, filter_end),
        "categories": selected_categories,
        "regions": selected_regions,
        "cities": selected_cities
    }
    return nav_selection, filters

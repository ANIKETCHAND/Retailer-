"""
RetailVision - Advanced Retail Sales Analytics Dashboard
Main application entry point. Coordinates state management, global filtering,
sidebar navigation, and delegates view rendering to modular UI components.
"""

import streamlit as st

# Core & State
from src.core.state import state_manager
from src.services.analytics_service import apply_filters, calculate_kpis
from src.services.data_service import get_default_dataset
from src.ui.components.sidebar import render_sidebar
from src.ui.theme import inject_custom_styles

# Views
from src.ui.views.customers import render_customers_view
from src.ui.views.data_mgmt import render_data_mgmt_view
from src.ui.views.forecasting import render_forecasting_view
from src.ui.views.overview import render_overview_view
from src.ui.views.products import render_products_view
from src.ui.views.reports import render_reports_view
from src.ui.views.sales import render_sales_view

# Page Configuration
st.set_page_config(
    page_title="RetailVision | Enterprise Sales Analytics",
    page_icon="📊",
    layout="wide",
    initial_sidebar_state="expanded"
)

# 1. Initialize State & Theme
state_manager.initialize()
inject_custom_styles(state_manager.get_theme())


# 2. Cached Sample Dataset Loader
@st.cache_data(show_spinner=False)
def load_sample_dataset_cached():
    return get_default_dataset()


# 3. Resolve Active Dataset
if state_manager.get_dataset_source() == "Built-in Sample":
    raw_df, load_report = load_sample_dataset_cached()
else:
    raw_df = state_manager.get_custom_df()
    load_report = state_manager.get_custom_report()
    if raw_df is None or raw_df.empty:
        raw_df, load_report = load_sample_dataset_cached()


# 4. Render Sidebar (Navigation & Filters)
nav_selection, filters = render_sidebar(raw_df)


# 5. Apply Global Filters & Compute Executive KPIs
filtered_df = apply_filters(
    df=raw_df,
    date_range=filters["date_range"],
    categories=filters["categories"],
    regions=filters["regions"],
    cities=filters["cities"]
)
kpis = calculate_kpis(filtered_df, full_df=raw_df)


# 6. Route to Corresponding View
if nav_selection == "Overview Dashboard":
    render_overview_view(filtered_df, raw_df, kpis, filters["date_range"])

elif nav_selection == "Sales Analytics":
    render_sales_view(filtered_df)

elif nav_selection == "Product Analytics":
    render_products_view(filtered_df)

elif nav_selection == "Customer Analytics":
    render_customers_view(filtered_df)

elif nav_selection == "Sales Forecasting":
    render_forecasting_view(filtered_df)

elif nav_selection == "Data Management":
    render_data_mgmt_view(raw_df, load_report)

elif nav_selection == "Reports & Exports":
    render_reports_view(filtered_df, kpis, filters)

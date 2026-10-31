"""
RetailVision - Data Management View
Provides CSV file uploader, schema mapping inspection, and missing value diagnostics.
"""

from typing import Any
import pandas as pd
import streamlit as st
from src.core.state import state_manager
from src.services.data_service import validate_and_clean_dataset
from src.ui.components.kpi_card import render_kpi_card


def render_data_mgmt_view(raw_df: pd.DataFrame, load_report: Any = None) -> None:
    """Renders the data management view."""
    st.title("📂 Data Management & Quality Diagnostics")
    st.markdown("Upload retail CSV datasets, inspect data hygiene, verify schema mapping, and diagnose missing values.")
    st.write("")

    uploader_col1, uploader_col2 = st.columns([1.5, 1])

    with uploader_col1:
        uploaded_file = st.file_uploader(
            "Upload Retail Sales CSV",
            type=["csv"],
            help="Upload any standard retail sales CSV. The system will automatically map common column aliases."
        )

        if uploaded_file is not None:
            with st.spinner("Inspecting, validating, and standardizing CSV..."):
                clean_df, report = validate_and_clean_dataset(uploaded_file)
                if report.is_valid and clean_df is not None:
                    state_manager.set_custom_df(clean_df, report)
                    st.success("✅ Dataset successfully validated and loaded as active data source!")
                else:
                    st.error(f"❌ Dataset Validation Failed: {', '.join(report.errors)}")

    with uploader_col2:
        st.markdown(
            """
            **Supported Column Aliases:**
            - `order_date`: date, transaction_date, sale_date
            - `product`: product_name, item, sku, description
            - `category`: product_category, dept, department
            - `quantity`: qty, units_sold, units, count
            - `unit_price`: price, rate, cost per unit
            - `total_amount`: revenue, total, amount, sales
            - `region`: state, territory, zone, area
            - `customer_id`: customer, client_id, user_id
            """
        )

    active_report = load_report if load_report is not None else state_manager.get_custom_report()
    if active_report:
        st.markdown("---")
        st.subheader("Data Quality & Schema Diagnostics")

        d1, d2, d3, d4 = st.columns(4)
        with d1:
            render_kpi_card("Raw Rows", f"{active_report.raw_row_count:,}")
        with d2:
            render_kpi_card("Cleaned Rows", f"{active_report.clean_row_count:,}")
        with d3:
            render_kpi_card("Duplicates Detected", f"{active_report.duplicates_detected:,}")
        with d4:
            render_kpi_card("Validation Status", "VALID" if active_report.is_valid else "FAILED")

        detail_c1, detail_c2 = st.columns(2)
        with detail_c1:
            st.write("**Canonical Column Schema Mappings**")
            mapping_data = [{"Canonical Field": k, "Matched CSV Column": v} for k, v in active_report.mapped_columns.items()]
            st.dataframe(pd.DataFrame(mapping_data), use_container_width=True)

        with detail_c2:
            st.write("**Missing Values (Null Counts) per Column**")
            null_data = [{"Column": k, "Missing Count": v} for k, v in active_report.null_counts.items()]
            st.dataframe(pd.DataFrame(null_data), use_container_width=True)

        st.subheader("Cleaned Dataset Preview (First 20 Records)")
        st.dataframe(raw_df.head(20), use_container_width=True)

"""
RetailVision - Reports & Exports View
Provides executive PDF generation and CSV data serialization downloads.
"""

from datetime import datetime
from typing import Any, Dict
import pandas as pd
import streamlit as st
from src.services.analytics_service import (
    KPISummary, get_monthly_sales, get_product_rankings
)
from src.services.forecasting_service import train_and_forecast_sales
from src.services.reporting_service import (
    export_dataframe_to_csv, generate_pdf_report
)


def render_reports_view(filtered_df: pd.DataFrame, kpis: KPISummary, filters: Dict[str, Any]) -> None:
    """Renders the executive reports and data exports view."""
    st.title("📑 Executive Reports & Data Export Center")
    st.markdown("Generate board-ready executive PDF reports and export filtered analytical datasets to CSV.")
    st.write("")

    rep_col1, rep_col2 = st.columns([1.2, 1])

    with rep_col1:
        st.subheader("Executive PDF Analytical Report")
        st.markdown(
            """
            Generates a publication-grade PDF report containing:
            1. Executive Cover Banner & Metadata
            2. High-level Key Performance Indicators
            3. Monthly Revenue Trajectory & MoM Growth Analysis
            4. Category Revenue Distribution
            5. Top 10 Product Rankings with Pareto Cumulative Shares
            6. Geographic Regional Breakdown
            7. Machine Learning Predictive Sales Outlook
            8. Strategic Business Insights & Recommendations
            """
        )

        if st.button("📄 Generate & Download Executive PDF Report", type="primary", use_container_width=True):
            with st.spinner("Compiling ReportLab document and analytical sections..."):
                fc_for_pdf = train_and_forecast_sales(filtered_df, horizon_days=30)
                filter_start, filter_end = filters["date_range"]
                filter_summary = {
                    "Date Range": f"{filter_start.strftime('%Y-%m-%d')} to {filter_end.strftime('%Y-%m-%d')}",
                    "Categories": ", ".join(filters["categories"]) if filters["categories"] else "All",
                    "Regions": ", ".join(filters["regions"]) if filters["regions"] else "All"
                }
                pdf_bytes = generate_pdf_report(
                    df=filtered_df,
                    kpi=kpis,
                    forecast_res=fc_for_pdf,
                    filter_summary=filter_summary
                )

                st.download_button(
                    label="💾 Click Here to Save PDF",
                    data=pdf_bytes,
                    file_name=f"retailvision_executive_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf",
                    mime="application/pdf",
                    use_container_width=True
                )
                st.success("PDF Report generated successfully!")

    with rep_col2:
        st.subheader("CSV Data Exports")
        st.markdown("Download granular raw or filtered datasets for downstream modeling in Excel, PowerBI, or Tableau.")

        filtered_csv_bytes = export_dataframe_to_csv(filtered_df)
        st.download_button(
            label=f"📥 Export Filtered Transactions CSV ({len(filtered_df):,} rows)",
            data=filtered_csv_bytes,
            file_name=f"retailvision_transactions_{datetime.now().strftime('%Y%m%d')}.csv",
            mime="text/csv",
            use_container_width=True
        )

        st.write("")

        monthly_csv_bytes = export_dataframe_to_csv(get_monthly_sales(filtered_df))
        st.download_button(
            label="📥 Export Monthly Aggregated Sales CSV",
            data=monthly_csv_bytes,
            file_name=f"retailvision_monthly_sales_{datetime.now().strftime('%Y%m%d')}.csv",
            mime="text/csv",
            use_container_width=True
        )

        st.write("")

        prod_rank_csv = export_dataframe_to_csv(get_product_rankings(filtered_df, top_n=None))
        st.download_button(
            label="📥 Export Complete Product Rankings CSV",
            data=prod_rank_csv,
            file_name=f"retailvision_products_{datetime.now().strftime('%Y%m%d')}.csv",
            mime="text/csv",
            use_container_width=True
        )

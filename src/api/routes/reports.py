"""
RetailVision - Reports & Exports API Endpoints
"""

from fastapi import APIRouter
from fastapi.responses import Response
from src.services.analytics_service import calculate_kpis
from src.services.data_service import get_default_dataset
from src.services.forecasting_service import train_and_forecast_sales
from src.services.reporting_service import (
    export_dataframe_to_csv, generate_pdf_report
)

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/pdf")
def download_pdf_report():
    """Generates and streams the executive boardroom PDF report."""
    df, _ = get_default_dataset()
    kpi = calculate_kpis(df)
    fc = train_and_forecast_sales(df, horizon_days=30)

    pdf_bytes = generate_pdf_report(
        df=df,
        kpi=kpi,
        forecast_res=fc,
        filter_summary={"Date Range": "Full Historical Range", "Categories": "All", "Regions": "All"}
    )

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=retailvision_executive_report.pdf"}
    )


@router.get("/csv")
def download_transactions_csv():
    """Streams transactions dataset as CSV."""
    df, _ = get_default_dataset()
    csv_bytes = export_dataframe_to_csv(df)
    return Response(
        content=csv_bytes,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=retailvision_transactions.csv"}
    )

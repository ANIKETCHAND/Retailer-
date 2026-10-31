"""
Backward compatibility proxy for reporting module.
Points to src.services.reporting_service.
"""
from src.services.reporting_service import (
    generate_business_insights, generate_pdf_report, export_dataframe_to_csv
)

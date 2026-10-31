"""
RetailVision - Data Management API Endpoints
"""

from fastapi import APIRouter
from src.api.schemas import DatasetDiagnosticsSchema
from src.services.data_service import get_default_dataset

router = APIRouter(prefix="/data", tags=["Data"])


@router.get("/summary", response_model=DatasetDiagnosticsSchema)
def get_dataset_summary():
    """Retrieve quality diagnostics and schema mappings of the active retail dataset."""
    _, report = get_default_dataset()
    return DatasetDiagnosticsSchema(
        is_valid=report.is_valid,
        raw_row_count=report.raw_row_count,
        clean_row_count=report.clean_row_count,
        duplicates_detected=report.duplicates_detected,
        date_range=list(report.date_range) if report.date_range else None,
        null_counts=report.null_counts,
        mapped_columns=report.mapped_columns
    )

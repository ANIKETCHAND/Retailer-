"""
Backward compatibility proxy for data_loader module.
Points to src.services.data_service.
"""
from src.services.data_service import (
    STANDARD_COLUMNS, REQUIRED_SEMANTIC_COLS, ValidationReport,
    normalize_col_name, resolve_column_mapping, load_raw_dataframe as load_raw_csv,
    validate_and_clean_dataset as validate_and_clean_data,
    validate_and_clean_dataset as load_dataset,
    get_default_dataset
)

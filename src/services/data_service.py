"""
RetailVision - Data Service (Business Logic)
Handles CSV loading, alias resolution, cross-imputation, validation, and sample data retrieval.
"""

from dataclasses import dataclass, field
from io import BytesIO, StringIO
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Union
import numpy as np
import pandas as pd
from src.core.config import settings
from src.core.exceptions import DataValidationError, DatasetEmptyError
from src.core.logging import logger

STANDARD_COLUMNS = {
    "order_id": [
        "order id", "order_id", "orderid", "transaction id", "transaction_id",
        "invoice no", "invoiceno", "invoice id", "invoice_id", "receipt_id", "id"
    ],
    "order_date": [
        "order date", "order_date", "orderdate", "date", "transaction date",
        "transaction_date", "sale date", "sale_date", "timestamp"
    ],
    "product": [
        "product", "product name", "product_name", "productname", "item",
        "item name", "item_name", "sku", "description"
    ],
    "category": [
        "category", "product category", "product_category", "productcategory",
        "dept", "department", "type", "group"
    ],
    "quantity": [
        "quantity", "qty", "units sold", "units_sold", "unitssold",
        "units", "count", "items"
    ],
    "unit_price": [
        "unit price", "unit_price", "unitprice", "price", "rate",
        "cost per unit", "item price", "price per unit"
    ],
    "total_amount": [
        "total amount", "total_amount", "totalamount", "total", "amount",
        "revenue", "sales", "total sales", "total_sales", "line total", "line_total"
    ],
    "region": [
        "region", "state", "territory", "zone", "area", "market"
    ],
    "city": [
        "city", "town", "location", "metro"
    ],
    "customer_id": [
        "customer id", "customer_id", "customerid", "customer", "client id",
        "client_id", "user id", "user_id", "account_id"
    ],
    "discount_pct": [
        "discount_pct", "discount pct", "discount_percentage", "discount percentage",
        "discount", "discount_rate", "discount rate", "discount_percent", "discount%"
    ]
}

REQUIRED_SEMANTIC_COLS = ["order_date", "product"]


@dataclass
class ValidationReport:
    """Detailed diagnostic report of CSV inspection and validation."""
    is_valid: bool = True
    errors: List[str] = field(default_factory=list)
    warnings: List[str] = field(default_factory=list)
    info: List[str] = field(default_factory=list)
    raw_row_count: int = 0
    raw_col_count: int = 0
    clean_row_count: int = 0
    clean_col_count: int = 0
    duplicates_detected: int = 0
    null_counts: Dict[str, int] = field(default_factory=dict)
    mapped_columns: Dict[str, str] = field(default_factory=dict)
    unmapped_columns: List[str] = field(default_factory=list)
    date_range: Optional[Tuple[str, str]] = None


def normalize_col_name(col: str) -> str:
    """Normalize column header for robust matching."""
    return str(col).strip().lower().replace("-", "_").replace(" ", "_")


def resolve_column_mapping(columns: List[str]) -> Tuple[Dict[str, str], List[str]]:
    """Maps uploaded column names to standardized canonical schema."""
    mapped = {}
    normalized_input = {normalize_col_name(c): c for c in columns}
    used_inputs = set()

    for canonical, aliases in STANDARD_COLUMNS.items():
        matched_col = None
        for alias in aliases:
            norm_alias = normalize_col_name(alias)
            if norm_alias in normalized_input and norm_alias not in used_inputs:
                matched_col = normalized_input[norm_alias]
                used_inputs.add(norm_alias)
                break
        if matched_col:
            mapped[canonical] = matched_col

    unmapped = [c for c in columns if normalize_col_name(c) not in used_inputs]
    return mapped, unmapped


def load_raw_dataframe(source: Union[str, Path, BytesIO, StringIO, pd.DataFrame]) -> pd.DataFrame:
    """Reads dataframe safely from path, buffer, or existing DataFrame."""
    if isinstance(source, pd.DataFrame):
        return source.copy()

    if isinstance(source, (BytesIO, StringIO)):
        source.seek(0, 2)
        length = source.tell()
        source.seek(0)
        if length == 0:
            raise DataValidationError("Uploaded file is empty (0 bytes found).")

    if isinstance(source, (str, Path)):
        p = Path(source)
        if p.exists() and p.stat().st_size == 0:
            raise DataValidationError("Uploaded file is empty (0 bytes found).")

    encodings = ["utf-8", "utf-8-sig", "latin1", "cp1252"]
    for enc in encodings:
        try:
            if isinstance(source, (BytesIO, StringIO)):
                source.seek(0)
            df = pd.read_csv(source, encoding=enc, skipinitialspace=True)
            if not df.empty and df.shape[1] > 0:
                return df
        except Exception:
            continue

    if isinstance(source, (BytesIO, StringIO)):
        source.seek(0)
    try:
        return pd.read_csv(source, sep=None, engine="python", encoding="utf-8", on_bad_lines="skip")
    except Exception as e:
        logger.error(f"Failed to read raw CSV: {e}")
        raise DataValidationError(f"Unable to parse CSV file: {str(e)}")


def validate_and_clean_dataset(
    source: Union[str, Path, BytesIO, StringIO, pd.DataFrame],
    drop_duplicates: bool = True
) -> Tuple[Optional[pd.DataFrame], ValidationReport]:
    """Validates, cleans, and standardizes retail dataset."""
    report = ValidationReport()

    try:
        df_raw = load_raw_dataframe(source)
    except Exception as e:
        report.is_valid = False
        report.errors.append(str(e))
        return None, report

    report.raw_row_count = int(df_raw.shape[0])
    report.raw_col_count = int(df_raw.shape[1])

    if report.raw_row_count == 0:
        report.is_valid = False
        report.errors.append("Uploaded file is empty (0 rows found).")
        return None, report

    # 1. Map columns
    mapped_cols, unmapped_cols = resolve_column_mapping(list(df_raw.columns))
    report.mapped_columns = mapped_cols
    report.unmapped_columns = unmapped_cols

    # Check required columns
    missing_required = [req for req in REQUIRED_SEMANTIC_COLS if req not in mapped_cols]
    if missing_required:
        report.is_valid = False
        report.errors.append(
            f"Missing essential required column(s): {', '.join(missing_required)}. "
            f"Please ensure CSV includes an order date and a product column."
        )
        return None, report

    has_revenue = "total_amount" in mapped_cols
    has_qty = "quantity" in mapped_cols
    has_price = "unit_price" in mapped_cols

    if not has_revenue and not (has_qty and has_price):
        report.is_valid = False
        report.errors.append(
            "Cannot calculate revenue: dataset must have either a 'Total Amount / Revenue' column, "
            "or both 'Quantity' and 'Unit Price' columns."
        )
        return None, report

    # 2. Standardize schema
    clean_df = pd.DataFrame()
    for canonical, original in mapped_cols.items():
        clean_df[canonical] = df_raw[original]
    for orig_col in unmapped_cols:
        clean_df[orig_col] = df_raw[orig_col]

    # 3. Handle duplicates
    dup_mask = clean_df.duplicated()
    report.duplicates_detected = int(dup_mask.sum())
    if report.duplicates_detected > 0:
        if drop_duplicates:
            clean_df = clean_df.drop_duplicates().reset_index(drop=True)
            report.info.append(f"Removed {report.duplicates_detected} duplicate row(s).")
        else:
            report.warnings.append(f"Detected {report.duplicates_detected} duplicate row(s).")

    report.null_counts = {str(c): int(clean_df[c].isna().sum()) for c in clean_df.columns}

    # 4. Dates
    clean_df["order_date"] = pd.to_datetime(clean_df["order_date"], errors="coerce")
    null_dates = int(clean_df["order_date"].isna().sum())
    if null_dates > 0:
        report.warnings.append(f"Dropped {null_dates} row(s) with invalid dates.")
        clean_df = clean_df.dropna(subset=["order_date"]).reset_index(drop=True)

    if clean_df.empty:
        report.is_valid = False
        report.errors.append("No valid records remaining after date parsing.")
        return None, report

    min_date = clean_df["order_date"].min().strftime("%Y-%m-%d")
    max_date = clean_df["order_date"].max().strftime("%Y-%m-%d")
    report.date_range = (min_date, max_date)

    # 5. Products & Categories
    clean_df["product"] = clean_df["product"].astype(str).str.strip()
    clean_df = clean_df[clean_df["product"] != ""].copy()

    if "category" in clean_df.columns:
        clean_df["category"] = clean_df["category"].fillna("General").astype(str).str.strip()
        clean_df.loc[clean_df["category"] == "", "category"] = "General"
    else:
        clean_df["category"] = "General"

    # 6. Numeric sanitation & cross-imputation
    if "quantity" in clean_df.columns:
        clean_df["quantity"] = pd.to_numeric(clean_df["quantity"], errors="coerce").fillna(1)
        clean_df.loc[clean_df["quantity"] <= 0, "quantity"] = 1
        clean_df["quantity"] = clean_df["quantity"].round().astype(int)
    else:
        clean_df["quantity"] = 1

    if "unit_price" in clean_df.columns:
        clean_df["unit_price"] = pd.to_numeric(clean_df["unit_price"], errors="coerce")
        # Invalidate negative prices
        clean_df.loc[clean_df["unit_price"] < 0, "unit_price"] = np.nan
    else:
        clean_df["unit_price"] = np.nan

    # Discount Percentage Handling (Academic Convention: percentage or fraction)
    if "discount_pct" in clean_df.columns:
        raw_str = clean_df["discount_pct"].astype(str).str.strip()
        has_pct = raw_str.str.contains("%", regex=False)
        num_val = pd.to_numeric(raw_str.str.replace("%", "", regex=False).str.strip(), errors="coerce").fillna(0.0)
        num_val = num_val.clip(lower=0.0)

        # Calculate discount rate:
        # If explicitly formatted with '%', always divide by 100 (e.g. '1%' -> 0.01)
        # If numeric > 1.0, it is a percentage (e.g. 10.0 -> 0.10)
        # If numeric <= 1.0 and no '%', it is already a fraction (e.g. 0.15 -> 0.15)
        rates = []
        for v, pct_flag in zip(num_val, has_pct):
            if pct_flag:
                rates.append(min(1.0, float(v) / 100.0))
            elif v > 1.0:
                rates.append(min(1.0, float(v) / 100.0))
            else:
                rates.append(min(1.0, float(v)))

        clean_df["discount_rate"] = rates
        clean_df["discount_pct"] = num_val
    else:
        clean_df["discount_pct"] = 0.0
        clean_df["discount_rate"] = 0.0

    if "total_amount" in clean_df.columns:
        clean_df["total_amount"] = pd.to_numeric(clean_df["total_amount"], errors="coerce")
    else:
        clean_df["total_amount"] = np.nan

    # Cross-imputation: Total Amount = Quantity * Unit Price * (1 - Discount Rate)
    # Never treat discount percentages as flat currency amounts!
    calc_total_mask = clean_df["total_amount"].isna() & clean_df["unit_price"].notna()
    if calc_total_mask.any():
        discount_multiplier = 1.0 - clean_df.loc[calc_total_mask, "discount_rate"]
        clean_df.loc[calc_total_mask, "total_amount"] = (
            clean_df.loc[calc_total_mask, "quantity"] *
            clean_df.loc[calc_total_mask, "unit_price"] *
            discount_multiplier
        )

    calc_price_mask = clean_df["unit_price"].isna() & clean_df["total_amount"].notna()
    if calc_price_mask.any():
        effective_mult = 1.0 - clean_df.loc[calc_price_mask, "discount_rate"]
        # Guard against 100% discount dividing by zero
        safe_mult = effective_mult.apply(lambda m: m if m > 0.01 else 1.0)
        clean_df.loc[calc_price_mask, "unit_price"] = (
            clean_df.loc[calc_price_mask, "total_amount"] /
            (clean_df.loc[calc_price_mask, "quantity"] * safe_mult)
        )

    invalid_revenue = clean_df["total_amount"].isna() | (clean_df["total_amount"] < 0)
    if invalid_revenue.any():
        clean_df = clean_df[~invalid_revenue].reset_index(drop=True)

    clean_df["total_amount"] = clean_df["total_amount"].round(2)
    clean_df["unit_price"] = clean_df["unit_price"].round(2)
    clean_df["discount_pct"] = clean_df["discount_pct"].round(2)

    # 7. Regions, Cities, Customers, Orders
    clean_df["region"] = clean_df.get("region", "All Regions")
    clean_df["region"] = clean_df["region"].fillna("Unspecified").astype(str).str.strip()

    clean_df["city"] = clean_df.get("city", "All Cities")
    clean_df["city"] = clean_df["city"].fillna("Unspecified").astype(str).str.strip()

    clean_df["customer_id"] = clean_df.get("customer_id", "Guest")
    clean_df["customer_id"] = clean_df["customer_id"].fillna("Guest").astype(str).str.strip()
    clean_df.loc[clean_df["customer_id"].isin(["", "nan", "None"]), "customer_id"] = "Guest"

    if "order_id" not in clean_df.columns:
        clean_df["order_id"] = [f"ORD-GEN-{i+1:06d}" for i in range(len(clean_df))]
    else:
        clean_df["order_id"] = clean_df["order_id"].fillna("").astype(str).str.strip()
        missing_orders = clean_df["order_id"] == ""
        if missing_orders.any():
            clean_df.loc[missing_orders, "order_id"] = [
                f"ORD-GEN-{i+1:06d}" for i in range(int(missing_orders.sum()))
            ]

    clean_df = clean_df.sort_values(by="order_date").reset_index(drop=True)
    report.clean_row_count = int(clean_df.shape[0])
    report.clean_col_count = int(clean_df.shape[1])

    if report.clean_row_count == 0:
        report.is_valid = False
        report.errors.append("Dataset has no valid records after cleaning and validation.")
        return None, report

    return clean_df, report


def get_default_dataset() -> Tuple[pd.DataFrame, ValidationReport]:
    """Retrieves and cleans the built-in sample retail dataset."""
    path = settings.DEFAULT_DATASET_PATH
    if not path.exists():
        from modules.dataset_generator import generate_retail_dataset
        generate_retail_dataset(str(path))
    return validate_and_clean_dataset(path)

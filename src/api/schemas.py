"""
RetailVision - API Request & Response Schemas (Pydantic)
Defines strongly-typed schemas for REST API endpoints.
"""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str = "ok"
    version: str = "2.0.0"
    app_name: str = "RetailVision"


class KPISummarySchema(BaseModel):
    total_revenue: float
    total_orders: int
    total_units_sold: int
    average_order_value: float
    total_products: int
    total_customers: int
    prior_revenue: Optional[float] = None
    revenue_growth_pct: Optional[float] = None
    prior_orders: Optional[int] = None
    orders_growth_pct: Optional[float] = None
    prior_units: Optional[int] = None
    units_growth_pct: Optional[float] = None
    prior_aov: Optional[float] = None
    aov_growth_pct: Optional[float] = None


class MonthlySalesItem(BaseModel):
    year_month: str
    month_name: str
    revenue: float
    orders: int
    units: int
    mom_growth_pct: float
    avg_order_value: float


class CategorySalesItem(BaseModel):
    category: str
    revenue: float
    units: int
    orders: int
    revenue_share_pct: float
    avg_unit_price: float


class RegionalSalesItem(BaseModel):
    region: str
    revenue: float
    orders: int
    units: int
    revenue_share_pct: float


class ProductRankItem(BaseModel):
    product: str
    category: str
    revenue: float
    units_sold: int
    orders_count: int
    avg_price: float
    revenue_share_pct: float
    cumulative_revenue_pct: float


class ForecastRequest(BaseModel):
    horizon_days: int = Field(default=30, ge=7, le=90, description="Forecast horizon in days")


class ForecastMetricsSchema(BaseModel):
    mae: float
    rmse: float
    mape: float
    r2_score: float
    train_samples: int
    test_samples: int
    test_start_date: str
    test_end_date: str
    limitations: List[str]


class ForecastResponse(BaseModel):
    is_successful: bool
    horizon_days: int
    total_projected_revenue: float
    daily_avg_projected_revenue: float
    metrics: Optional[ForecastMetricsSchema] = None
    forecast: List[Dict[str, Any]] = []


class DatasetDiagnosticsSchema(BaseModel):
    is_valid: bool
    raw_row_count: int
    clean_row_count: int
    duplicates_detected: int
    date_range: Optional[List[str]] = None
    null_counts: Dict[str, int]
    mapped_columns: Dict[str, str]

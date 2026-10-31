"""
RetailVision - Analytics API Endpoints
"""

from typing import List, Optional
from fastapi import APIRouter, Query
from src.api.schemas import (
    CategorySalesItem, KPISummarySchema, MonthlySalesItem,
    ProductRankItem, RegionalSalesItem
)
from src.services.analytics_service import (
    apply_filters, calculate_kpis, get_category_sales, get_monthly_sales,
    get_product_rankings, get_regional_sales
)
from src.services.data_service import get_default_dataset

router = APIRouter(prefix="/analytics", tags=["Analytics"])


def _get_active_df(category: Optional[str] = None, region: Optional[str] = None):
    df, _ = get_default_dataset()
    cat_list = [category] if category and category != "All" else None
    reg_list = [region] if region and region != "All" else None
    return apply_filters(df, categories=cat_list, regions=reg_list), df


@router.get("/kpis", response_model=KPISummarySchema)
def get_kpis(category: Optional[str] = None, region: Optional[str] = None):
    """Retrieve executive KPIs with period-over-period growth metrics."""
    filtered_df, full_df = _get_active_df(category, region)
    kpis = calculate_kpis(filtered_df, full_df=full_df)
    return kpis.__dict__


@router.get("/monthly", response_model=List[MonthlySalesItem])
def get_monthly(category: Optional[str] = None, region: Optional[str] = None):
    """Retrieve monthly sales trajectory and MoM growth rates."""
    filtered_df, _ = _get_active_df(category, region)
    monthly_df = get_monthly_sales(filtered_df)
    return monthly_df.to_dict(orient="records")


@router.get("/categories", response_model=List[CategorySalesItem])
def get_categories():
    """Retrieve sales by product category with revenue share."""
    df, _ = get_default_dataset()
    cat_df = get_category_sales(df)
    return cat_df.to_dict(orient="records")


@router.get("/regions", response_model=List[RegionalSalesItem])
def get_regions():
    """Retrieve sales by geographic region."""
    df, _ = get_default_dataset()
    reg_df = get_regional_sales(df)
    return reg_df.to_dict(orient="records")


@router.get("/products", response_model=List[ProductRankItem])
def get_products(top_n: int = Query(default=10, ge=1, le=100), sort_by: str = "revenue"):
    """Retrieve product rankings with Pareto cumulative percentage."""
    df, _ = get_default_dataset()
    prod_df = get_product_rankings(df, top_n=top_n, sort_by=sort_by)
    return prod_df.to_dict(orient="records")

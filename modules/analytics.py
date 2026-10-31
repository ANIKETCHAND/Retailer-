"""
Backward compatibility proxy for analytics module.
Points to src.services.analytics_service.
"""
from src.services.analytics_service import (
    KPISummary, apply_filters, calculate_kpis, get_daily_sales,
    get_weekly_sales, get_monthly_sales, get_yearly_sales,
    get_category_sales, get_regional_sales, get_city_sales,
    get_product_rankings, get_lowest_performing_products
)

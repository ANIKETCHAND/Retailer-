"""
Backward compatibility proxy for visualizations module.
Points to src.visualizations.charts.
"""
from src.visualizations.charts import (
    THEME_CONFIGS, _get_theme, _apply_base_styling, currency_fmt,
    plot_monthly_revenue_trend, plot_category_distribution, plot_regional_sales,
    plot_top_products, plot_daily_sales_trend, plot_growth_comparison,
    plot_customer_frequency, plot_repeat_vs_onetime, plot_forecast_results
)

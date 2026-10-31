"""
Backward compatibility proxy for customer_analytics module.
Points to src.services.customer_service.
"""
from src.services.customer_service import (
    CustomerMetrics, calculate_customer_metrics, get_top_customers,
    get_repeat_customer_breakdown, get_customer_purchase_frequency
)

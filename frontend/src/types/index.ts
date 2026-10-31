/**
 * RetailVision - TypeScript Type Definitions
 */

export interface Store {
  id: string
  name: string
  category: string
  description: string
  grid_x: number
  grid_z: number
  rotation_y: number
  color: string
  is_default: boolean
  total_revenue: number
  total_orders: number
  total_products: number
  created_at: string
}

export interface KPISummary {
  total_revenue: number
  total_orders: number
  total_units_sold: number
  average_order_value: number
  total_products: number
  total_customers: number
  prior_revenue?: number
  revenue_growth_pct?: number
  prior_orders?: number
  orders_growth_pct?: number
  prior_units?: number
  units_growth_pct?: number
  prior_aov?: number
  aov_growth_pct?: number
}

export interface MonthlyTrend {
  year_month: string
  month_name: string
  revenue: number
  orders: number
  units: number
  mom_growth_pct: number
  avg_order_value: number
}

export interface DailySales {
  date: string
  revenue: number
  moving_avg_7d: number
}

export interface CategorySales {
  category: string
  revenue: number
  units: number
  orders: number
  revenue_share_pct: number
  avg_unit_price: number
}

export interface RegionalSales {
  region: string
  revenue: number
  orders: number
  units: number
  revenue_share_pct: number
}

export interface ProductRank {
  product: string
  category: string
  revenue: number
  units_sold: number
  orders_count: number
  avg_price: number
  revenue_share_pct: number
  cumulative_revenue_pct: number
}

export interface CustomerMetrics {
  total_customers: number
  total_repeat_customers: number
  repeat_customer_rate_pct: number
  avg_revenue_per_customer: number
  avg_orders_per_customer: number
  has_customer_ids: boolean
  guest_orders_count: number
}

export interface StoreAnalyticsBundle {
  store: {
    id: string
    name: string
    category: string
    description: string
    color: string
    is_default: boolean
  }
  kpis: KPISummary
  monthly_trend: MonthlyTrend[]
  recent_daily: DailySales[]
  categories: CategorySales[]
  regions: RegionalSales[]
  top_products: ProductRank[]
  customer_metrics: CustomerMetrics
  repeat_breakdown: any[]
}

export interface ForecastPoint {
  date: string
  forecast_revenue: number
  lower_bound: number
  upper_bound: number
}

export interface ValidationPoint {
  date: string
  predicted_revenue: number
}

export interface StoreForecastResponse {
  is_successful: boolean
  horizon_days: number
  total_projected_revenue: number
  daily_avg_projected_revenue: number
  metrics: {
    mae: number
    rmse: number
    mape: number
    r2_score: number
    train_samples: number
    test_samples: number
    test_start_date: string
    test_end_date: string
    limitations: string[]
  }
  forecast: ForecastPoint[]
  validation: ValidationPoint[]
}

export interface UserSession {
  user_id: number
  username: string
  email: string
  token: string
}

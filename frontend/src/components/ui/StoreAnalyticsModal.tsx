/**
 * RetailVision - Store Analytics Dashboard Modal
 * Glassmorphic BI interface providing real-time store metrics,
 * monthly revenue trends, product rankings, ML forecasting, and ReportLab PDF downloads.
 */

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, TrendingUp, ShoppingBag, Users, DollarSign, Package,
  MapPin, Download, BrainCircuit,
  Maximize2, Minimize2
} from 'lucide-react'
import { storeApi } from '../../api/client'
import type { Store, StoreAnalyticsBundle, StoreForecastResponse } from '../../types'

interface StoreAnalyticsModalProps {
  store: Store | null
  isOpen: boolean
  onClose: () => void
}

export const StoreAnalyticsModal: React.FC<StoreAnalyticsModalProps> = ({
  store,
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'customers' | 'forecast' | 'reports'>('overview')
  const [analytics, setAnalytics] = useState<StoreAnalyticsBundle | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isFullScreen, setIsFullScreen] = useState(false)

  // Forecasting state
  const [forecastHorizon, setForecastHorizon] = useState<number>(30)
  const [forecastData, setForecastData] = useState<StoreForecastResponse | null>(null)
  const [isForecastLoading, setIsForecastLoading] = useState(false)

  useEffect(() => {
    if (store && isOpen) {
      loadAnalytics(store.id)
    }
  }, [store, isOpen])

  const loadAnalytics = async (storeId: string) => {
    setIsLoading(true)
    try {
      const data = await storeApi.getStoreAnalytics(storeId)
      setAnalytics(data)
      loadForecast(storeId, forecastHorizon)
    } catch (err) {
      console.error('Failed to load store analytics', err)
    } finally {
      setIsLoading(false)
    }
  }

  const loadForecast = async (storeId: string, horizon: number) => {
    setIsForecastLoading(true)
    try {
      const data = await storeApi.getStoreForecast(storeId, horizon)
      setForecastData(data)
    } catch (err) {
      console.error('Failed to load forecast', err)
    } finally {
      setIsForecastLoading(false)
    }
  }

  const handleHorizonChange = (horizon: number) => {
    setForecastHorizon(horizon)
    if (store) {
      loadForecast(store.id, horizon)
    }
  }

  if (!isOpen || !store) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25 }}
          className={`relative w-full ${isFullScreen ? 'h-full max-w-none' : 'max-w-6xl max-h-[92vh]'} flex flex-col glass-panel rounded-2xl border border-white/10 shadow-2xl overflow-hidden`}
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/50">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg text-white shadow-lg"
                style={{ backgroundColor: store.color || '#3b82f6' }}
              >
                {(store.name || 'S').charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white tracking-tight">{store.name || 'Store'}</h2>
                  <span
                    className="px-2.5 py-0.5 text-xs font-semibold rounded-full border"
                    style={{
                      borderColor: store.color || '#3b82f6',
                      color: store.color || '#3b82f6',
                      backgroundColor: `${store.color || '#3b82f6'}15`
                    }}
                  >
                    {store.category}
                  </span>
                  {store.is_default && (
                    <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded bg-slate-800 text-slate-400 border border-slate-700">
                      Sample Dataset
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 line-clamp-1">{store.description || 'Retail performance analytics and machine learning insights.'}</p>
              </div>
            </div>

            {/* Window controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsFullScreen(!isFullScreen)}
                className="p-2 rounded-lg bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
                title={isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
              >
                {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg bg-slate-800/80 text-slate-400 hover:text-white hover:bg-red-500/80 transition-colors cursor-pointer"
                title="Return to Marketplace"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 px-6 pt-3 border-b border-white/5 bg-slate-900/30">
            {[
              { id: 'overview', label: 'Executive Overview', icon: TrendingUp },
              { id: 'products', label: 'Products & SKUs', icon: Package },
              { id: 'customers', label: 'Customer Retention', icon: Users },
              { id: 'forecast', label: 'ML Sales Forecast', icon: BrainCircuit },
              { id: 'reports', label: 'Reports & Exports', icon: Download },
            ].map((tab) => {
              const Icon = tab.icon
              const active = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all cursor-pointer border-b-2 ${
                    active
                      ? 'border-blue-500 text-blue-400 bg-slate-800/60'
                      : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {isLoading ? (
              <div className="h-96 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-3 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                <span className="text-sm text-slate-400 font-medium">Computing analytics from store CSV...</span>
              </div>
            ) : analytics ? (
              <>
                {/* 6 Executive KPI Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  <div className="p-4 rounded-xl glass-card border border-white/5">
                    <div className="flex items-center justify-between text-slate-400 mb-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider">Total Revenue</span>
                      <DollarSign className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                    <div className="text-xl font-extrabold text-white">
                      ${(analytics.kpis?.total_revenue ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                    {analytics.kpis?.revenue_growth_pct !== null && analytics.kpis?.revenue_growth_pct !== undefined && (
                      <div className={`text-[11px] font-semibold mt-1 ${analytics.kpis.revenue_growth_pct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {analytics.kpis.revenue_growth_pct >= 0 ? '↑' : '↓'} {analytics.kpis.revenue_growth_pct.toFixed(1)}% vs prior
                      </div>
                    )}
                  </div>

                  <div className="p-4 rounded-xl glass-card border border-white/5">
                    <div className="flex items-center justify-between text-slate-400 mb-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider">Total Orders</span>
                      <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <div className="text-xl font-extrabold text-white">
                      {(analytics.kpis?.total_orders ?? 0).toLocaleString()}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">Processed transactions</div>
                  </div>

                  <div className="p-4 rounded-xl glass-card border border-white/5">
                    <div className="flex items-center justify-between text-slate-400 mb-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider">Units Sold</span>
                      <Package className="w-3.5 h-3.5 text-purple-400" />
                    </div>
                    <div className="text-xl font-extrabold text-white">
                      {(analytics.kpis?.total_units_sold ?? 0).toLocaleString()}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">Total items shipped</div>
                  </div>

                  <div className="p-4 rounded-xl glass-card border border-white/5">
                    <div className="flex items-center justify-between text-slate-400 mb-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider">Avg Order Value</span>
                      <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                    </div>
                    <div className="text-xl font-extrabold text-white">
                      ${(analytics.kpis?.average_order_value ?? 0).toFixed(2)}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">Revenue per basket</div>
                  </div>

                  <div className="p-4 rounded-xl glass-card border border-white/5">
                    <div className="flex items-center justify-between text-slate-400 mb-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider">Products (SKUs)</span>
                      <Package className="w-3.5 h-3.5 text-cyan-400" />
                    </div>
                    <div className="text-xl font-extrabold text-white">
                      {(analytics.kpis?.total_products ?? 0).toLocaleString()}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">Catalog items</div>
                  </div>

                  <div className="p-4 rounded-xl glass-card border border-white/5">
                    <div className="flex items-center justify-between text-slate-400 mb-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider">Customers</span>
                      <Users className="w-3.5 h-3.5 text-rose-400" />
                    </div>
                    <div className="text-xl font-extrabold text-white">
                      {(analytics.kpis?.total_customers ?? 0).toLocaleString()}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">Active buyers</div>
                  </div>
                </div>

                {/* TAB 1: OVERVIEW & TRENDS */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div className="p-5 rounded-2xl glass-card border border-white/5">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-blue-400" />
                          Monthly Revenue Trajectory & Growth
                        </h3>
                        <span className="text-xs text-slate-400">Chronological aggregations</span>
                      </div>

                      <div className="h-56 w-full flex items-end gap-2 pt-6 pb-2 border-b border-slate-700/50">
                        {(analytics.monthly_trend || []).map((m, idx) => {
                          const maxRev = Math.max(1, ...(analytics.monthly_trend || []).map(x => x.revenue || 0))
                          const heightPct = Math.min(100, Math.max(4, ((m.revenue || 0) / maxRev) * 100))
                          const momPct = m.mom_growth_pct ?? 0
                          return (
                            <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative h-full justify-end">
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 px-2 py-1 rounded bg-slate-900 text-white text-[10px] font-bold whitespace-nowrap border border-slate-700 pointer-events-none z-10 shadow-lg">
                                {m.month_name || 'Month'}: ${(m.revenue ?? 0).toLocaleString()} ({momPct >= 0 ? '+' : ''}{momPct.toFixed(1)}%)
                              </div>
                              <div
                                className="w-full rounded-t-md transition-all duration-300 group-hover:brightness-125"
                                style={{
                                  height: `${heightPct}%`,
                                  backgroundColor: store.color || '#3b82f6',
                                  opacity: 0.85
                                }}
                              />
                              <span className="text-[10px] text-slate-400 truncate w-full text-center mt-1">
                                {(m.month_name || 'Month').split(' ')[0]}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-5 rounded-2xl glass-card border border-white/5">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-emerald-400" />
                          Regional Demand Distribution
                        </h3>
                        <div className="space-y-3">
                          {(analytics.regions || []).map((reg, i) => (
                            <div key={i} className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="font-semibold text-slate-200">{reg.region || 'Region'}</span>
                                <span className="font-mono text-slate-300">
                                  ${(reg.revenue ?? 0).toLocaleString()} ({(reg.revenue_share_pct ?? 0).toFixed(1)}%)
                                </span>
                              </div>
                              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-emerald-500"
                                  style={{ width: `${Math.min(100, Math.max(0, reg.revenue_share_pct ?? 0))}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="p-5 rounded-2xl glass-card border border-white/5">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                          <Package className="w-4 h-4 text-purple-400" />
                          Category Revenue Breakdown
                        </h3>
                        <div className="space-y-3">
                          {(analytics.categories || []).map((cat, i) => (
                            <div key={i} className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="font-semibold text-slate-200">{cat.category || 'Category'}</span>
                                <span className="font-mono text-slate-300">
                                  ${(cat.revenue ?? 0).toLocaleString()} ({(cat.revenue_share_pct ?? 0).toFixed(1)}%)
                                </span>
                              </div>
                              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-purple-500"
                                  style={{ width: `${Math.min(100, Math.max(0, cat.revenue_share_pct ?? 0))}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: PRODUCTS */}
                {activeTab === 'products' && (
                  <div className="p-5 rounded-2xl glass-card border border-white/5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Package className="w-4 h-4 text-blue-400" />
                        Top Performing Products by Revenue (Pareto Distribution)
                      </h3>
                      <span className="text-xs text-slate-400">Cumulative revenue analysis</span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-700/60 text-slate-400 font-semibold uppercase">
                            <th className="py-2.5 px-3">Rank</th>
                            <th className="py-2.5 px-3">Product Name</th>
                            <th className="py-2.5 px-3">Category</th>
                            <th className="py-2.5 px-3">Units Sold</th>
                            <th className="py-2.5 px-3">Avg Price</th>
                            <th className="py-2.5 px-3">Total Revenue</th>
                            <th className="py-2.5 px-3">Share %</th>
                            <th className="py-2.5 px-3">Cumulative %</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 font-mono">
                          {(analytics.top_products || []).map((prod, idx) => (
                            <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                              <td className="py-2.5 px-3 font-sans font-bold text-blue-400">#{idx + 1}</td>
                              <td className="py-2.5 px-3 font-sans font-semibold text-slate-100">{prod.product || 'Product'}</td>
                              <td className="py-2.5 px-3 font-sans text-slate-400">{prod.category || 'General'}</td>
                              <td className="py-2.5 px-3 text-slate-300">{(prod.units_sold ?? 0).toLocaleString()}</td>
                              <td className="py-2.5 px-3 text-slate-300">${(prod.avg_price ?? 0).toFixed(2)}</td>
                              <td className="py-2.5 px-3 font-bold text-emerald-400">${(prod.revenue ?? 0).toLocaleString()}</td>
                              <td className="py-2.5 px-3 text-slate-400">{(prod.revenue_share_pct ?? 0).toFixed(1)}%</td>
                              <td className="py-2.5 px-3 text-purple-400 font-bold">{(prod.cumulative_revenue_pct ?? 0).toFixed(1)}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* TAB 3: CUSTOMERS */}
                {activeTab === 'customers' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="p-5 rounded-2xl glass-card border border-white/5 space-y-4">
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Users className="w-4 h-4 text-rose-400" />
                        Buyer Retention Rate
                      </h3>
                      <div className="text-3xl font-extrabold text-rose-400">
                        {(analytics.customer_metrics?.repeat_customer_rate_pct ?? 0).toFixed(1)}%
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Proportion of total customers who made 2 or more separate purchases in this store dataset.
                      </p>
                      <div className="pt-2 border-t border-slate-700/50 flex justify-between text-xs">
                        <span className="text-slate-400">Repeat Customers:</span>
                        <span className="font-bold text-white">{analytics.customer_metrics?.total_repeat_customers ?? 0}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Total Unique Buyers:</span>
                        <span className="font-bold text-white">{analytics.customer_metrics?.total_customers ?? 0}</span>
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl glass-card border border-white/5 space-y-4">
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-emerald-400" />
                        Average Revenue Per User (ARPU)
                      </h3>
                      <div className="text-3xl font-extrabold text-emerald-400">
                        ${(analytics.customer_metrics?.avg_revenue_per_customer ?? 0).toFixed(2)}
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Mean lifetime customer value generated across the customer cohort for this store.
                      </p>
                      <div className="pt-2 border-t border-slate-700/50 flex justify-between text-xs">
                        <span className="text-slate-400">Avg Orders per User:</span>
                        <span className="font-bold text-white">{(analytics.customer_metrics?.avg_orders_per_customer ?? 0).toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl glass-card border border-white/5 space-y-4">
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-blue-400" />
                        Single vs Repeat Revenue
                      </h3>
                      <div className="space-y-3 pt-2">
                        {(analytics.repeat_breakdown || []).map((seg, i) => (
                          <div key={i} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-300 font-semibold">{seg.segment || 'Segment'}</span>
                              <span className="font-mono text-emerald-400">${(seg.total_revenue ?? 0).toLocaleString()}</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-blue-500"
                                style={{ width: `${Math.min(100, Math.max(0, seg.revenue_share_pct ?? 0))}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4: ML SALES FORECAST */}
                {activeTab === 'forecast' && (
                  <div className="space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl glass-card border border-white/5">
                      <div className="flex items-center gap-2">
                        <BrainCircuit className="w-5 h-5 text-purple-400" />
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-white">Machine Learning Time-Series Model</h4>
                          <p className="text-[11px] text-slate-400">Ridge Regularization trained strictly on chronological historical actuals (zero data leakage).</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-700">
                        {[7, 14, 30, 60, 90].map((h) => (
                          <button
                            key={h}
                            onClick={() => handleHorizonChange(h)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              forecastHorizon === h
                                ? 'bg-purple-600 text-white shadow-md'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            {h}d
                          </button>
                        ))}
                      </div>
                    </div>

                    {isForecastLoading ? (
                      <div className="h-48 flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                      </div>
                    ) : forecastData ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="p-3.5 rounded-xl glass-card border border-white/5">
                            <span className="text-[10px] font-bold uppercase text-slate-400">Projected {forecastHorizon}d Revenue</span>
                            <div className="text-lg font-extrabold text-purple-400 mt-1">
                              ${(forecastData.total_projected_revenue ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </div>
                          </div>
                          <div className="p-3.5 rounded-xl glass-card border border-white/5">
                            <span className="text-[10px] font-bold uppercase text-slate-400">Daily Projected Run-rate</span>
                            <div className="text-lg font-extrabold text-blue-400 mt-1">
                              ${(forecastData.daily_avg_projected_revenue ?? 0).toFixed(2)}/day
                            </div>
                          </div>
                          <div className="p-3.5 rounded-xl glass-card border border-white/5">
                            <span className="text-[10px] font-bold uppercase text-slate-400">Out-of-Sample Test RMSE</span>
                            <div className="text-lg font-extrabold text-amber-400 mt-1">
                              ${(forecastData.metrics?.rmse ?? 0).toFixed(2)}
                            </div>
                          </div>
                          <div className="p-3.5 rounded-xl glass-card border border-white/5">
                            <span className="text-[10px] font-bold uppercase text-slate-400">Test MAPE</span>
                            <div className="text-lg font-extrabold text-emerald-400 mt-1">
                              {(forecastData.metrics?.mape ?? 0).toFixed(1)}%
                            </div>
                          </div>
                        </div>

                        <div className="p-4 rounded-xl glass-card border border-white/5">
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
                            Future {forecastHorizon}-Day Revenue Projections with Confidence Intervals (±1.5 RMSE)
                          </h4>
                          <div className="max-h-48 overflow-y-auto">
                            <table className="w-full text-left text-xs font-mono">
                              <thead>
                                <tr className="border-b border-slate-700/60 text-slate-400 uppercase">
                                  <th className="py-2 px-3">Date</th>
                                  <th className="py-2 px-3">Projected Revenue</th>
                                  <th className="py-2 px-3">Lower Bound</th>
                                  <th className="py-2 px-3">Upper Bound</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-800">
                                {(forecastData.forecast || []).slice(0, 15).map((pt, i) => (
                                  <tr key={i} className="hover:bg-slate-800/30">
                                    <td className="py-1.5 px-3 text-slate-300">{pt.date}</td>
                                    <td className="py-1.5 px-3 font-bold text-purple-400">${(pt.forecast_revenue ?? 0).toFixed(2)}</td>
                                    <td className="py-1.5 px-3 text-slate-500">${(pt.lower_bound ?? 0).toFixed(2)}</td>
                                    <td className="py-1.5 px-3 text-slate-500">${(pt.upper_bound ?? 0).toFixed(2)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}

                {/* TAB 5: REPORTS & EXPORTS */}
                {activeTab === 'reports' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="p-6 rounded-2xl glass-card border border-white/5 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="p-3 w-fit rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-3">
                          <Download className="w-6 h-6" />
                        </div>
                        <h3 className="text-base font-bold text-white tracking-tight">Executive PDF Analytics Report</h3>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          Generates a publication-grade multi-page ReportLab PDF containing executive KPI cards, monthly momentum tables, category shares, top 10 products with Pareto cumulative contributions, regional breakdowns, and automated analytical takeaways.
                        </p>
                      </div>
                      <a
                        href={storeApi.getPdfReportUrl(store.id)}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 cursor-pointer transition-all"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download Boardroom PDF Report</span>
                      </a>
                    </div>

                    <div className="p-6 rounded-2xl glass-card border border-white/5 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="p-3 w-fit rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3">
                          <Package className="w-6 h-6" />
                        </div>
                        <h3 className="text-base font-bold text-white tracking-tight">Store Transactions CSV Export</h3>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          Download the complete clean CSV dataset assigned to this store for downstream modeling, Excel pivot tables, or external business intelligence integration.
                        </p>
                      </div>
                      <a
                        href={storeApi.getCsvDataUrl(store.id)}
                        download
                        className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center justify-center gap-2 border border-slate-600 shadow-md cursor-pointer transition-all"
                      >
                        <Download className="w-4 h-4 text-emerald-400" />
                        <span>Export Store Dataset CSV</span>
                      </a>
                    </div>
                  </div>
                )}
              </>
            ) : null}
          </div>

          {/* Footer Bar */}
          <div className="flex items-center justify-between px-6 py-3 border-t border-white/10 bg-slate-900/40 text-xs text-slate-400">
            <span>Store ID: <code className="text-slate-300">{store.id}</code></span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-500/30 font-semibold cursor-pointer transition-colors"
            >
              Return to 3D Marketplace
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

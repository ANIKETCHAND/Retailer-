/**
 * RetailVision - Store Analytics Dashboard Modal
 * Styled in the AAA Casual-Game Theme matching the City Radar minimap
 * and the iconic skyblue Build & Explore action pills:
 *  - Saturated skyblue gradient outer frame with 3.5px solid white border & top reflection shine
 *  - Round game-pill navigation tabs with active skyblue gloss
 *  - Vibrant casual-game KPI stat badges with 2px white borders & top shine
 *  - Sale Forecast horizons & cards styled as high-contrast game widgets
 *  - Bottom "Return to 3D Marketplace" styled as a full game-pill action button
 */

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, TrendingUp, ShoppingBag, Users, DollarSign, Package,
  MapPin, BrainCircuit,
  Maximize2, Minimize2
} from 'lucide-react'
import { storeApi } from '../../api/client'
import type { Store, StoreAnalyticsBundle, StoreForecastResponse } from '../../types'
import { cartoonTextStyle, pillShineStyle } from './GamePillButtons'

interface StoreAnalyticsModalProps {
  store: Store | null
  isOpen: boolean
  onClose: () => void
}

// Reusable SkyBlue Game Theme Styles matching Map and Build/Explore buttons
const gameShellStyle: React.CSSProperties = {
  background: 'linear-gradient(180deg, #38bdf8 0%, #0ea5e9 20%, #0284c7 60%, #034f7c 100%)',
  border: '3.5px solid #ffffff',
  borderRadius: '28px',
  boxShadow: '0 25px 60px rgba(2, 132, 199, 0.65), inset 0 2px 6px rgba(255, 255, 255, 0.8)',
}

const gameInnerCanvasStyle: React.CSSProperties = {
  background: 'rgba(2, 22, 44, 0.86)',
  border: '2px solid rgba(255, 255, 255, 0.28)',
  borderRadius: '20px',
  boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.4)',
}

const gameCardStyle: React.CSSProperties = {
  background: 'linear-gradient(180deg, rgba(14, 165, 233, 0.30) 0%, rgba(3, 105, 161, 0.52) 100%)',
  border: '2px solid rgba(255, 255, 255, 0.45)',
  borderRadius: '18px',
  boxShadow: '0 6px 18px rgba(2, 132, 199, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.55)',
}

export const StoreAnalyticsModal: React.FC<StoreAnalyticsModalProps> = ({
  store,
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'customers' | 'forecast'>('overview')
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 18 }}
          transition={{ duration: 0.25 }}
          className={`relative w-full ${isFullScreen ? 'h-full max-w-none' : 'max-w-6xl max-h-[92vh]'} flex flex-col overflow-hidden`}
          style={gameShellStyle}
        >
          {/* Top Curved Glass Reflection Shine */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '45px',
              background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0) 100%)',
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />

          {/* Header Bar */}
          <div className="relative z-10 flex items-center justify-between px-6 py-3.5 border-b-2 border-white/25 bg-sky-900/30">
            <div className="flex items-center gap-3">
              {/* Store Avatar Badge */}
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center font-black text-xl text-white shadow-lg border-2 border-white"
                style={{
                  backgroundColor: store.color || '#3b82f6',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.35)',
                }}
              >
                {(store.name || 'S').charAt(0)}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2
                    className="text-xl sm:text-2xl font-black text-white tracking-tight"
                    style={{
                      textShadow: '0 2px 4px rgba(0, 0, 0, 0.6)',
                    }}
                  >
                    {store.name || 'Store'}
                  </h2>
                  <span
                    className="px-3 py-0.5 text-xs font-black rounded-full border-2 border-white shadow-sm"
                    style={{
                      background: 'linear-gradient(180deg, #fef08a 0%, #facc15 100%)',
                      color: '#0f172a',
                    }}
                  >
                    {store.category}
                  </span>
                  {store.is_default && (
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-white/25 text-white border border-white/40">
                      Sample Dataset
                    </span>
                  )}
                </div>
                <p className="text-xs text-sky-100/90 font-medium line-clamp-1">
                  {store.description || 'Retail performance analytics and sales forecast insights.'}
                </p>
              </div>
            </div>

            {/* Window Controls: Game styled circles */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsFullScreen(!isFullScreen)}
                className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/35 border-2 border-white text-white flex items-center justify-center shadow-md cursor-pointer transition-transform active:scale-95"
                title={isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
              >
                {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-red-500/80 hover:bg-red-500 border-2 border-white text-white flex items-center justify-center shadow-md cursor-pointer transition-transform active:scale-95"
                title="Return to Marketplace"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs as Game Pills */}
          <div className="relative z-10 flex items-center gap-2 px-6 py-2.5 bg-sky-950/40 border-b-2 border-white/20 overflow-x-auto">
            {[
              { id: 'overview', label: 'Executive Overview', icon: TrendingUp },
              { id: 'products', label: 'Products & SKUs', icon: Package },
              { id: 'customers', label: 'Customer Retention', icon: Users },
              { id: 'forecast', label: 'Sale Forecast', icon: BrainCircuit },
            ].map((tab) => {
              const Icon = tab.icon
              const active = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-black rounded-full transition-all duration-200 cursor-pointer select-none ${
                    active
                      ? 'shadow-md scale-[1.02]'
                      : 'hover:bg-white/25 active:scale-95'
                  }`}
                  style={
                    active
                      ? {
                          background: 'linear-gradient(180deg, #38bdf8 0%, #0ea5e9 40%, #0284c7 75%, #0369a1 100%)',
                          border: '2.5px solid #ffffff',
                          color: '#ffffff',
                          boxShadow: '0 4px 14px rgba(2, 132, 199, 0.6), inset 0 2px 3px rgba(255, 255, 255, 0.8)',
                          textShadow: '0 1px 2px rgba(0, 0, 0, 0.6)',
                        }
                      : {
                          background: 'rgba(255, 255, 255, 0.18)',
                          border: '2px solid rgba(255, 255, 255, 0.4)',
                          color: '#e0f2fe',
                        }
                  }
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>

          {/* Content Body inside Ocean Canvas */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 m-3 sm:m-4" style={gameInnerCanvasStyle}>
            {isLoading ? (
              <div className="h-96 flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 border-4 border-sky-400/30 border-t-sky-400 rounded-full animate-spin" />
                <span className="text-sm text-sky-200 font-bold tracking-wide">Computing analytics from store CSV...</span>
              </div>
            ) : analytics ? (
              <>
                {/* 6 Executive KPI Game Stat Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  <div className="relative p-3.5 overflow-hidden group" style={gameCardStyle}>
                    <div style={pillShineStyle} />
                    <div className="flex items-center justify-between text-sky-100 mb-1">
                      <span className="text-[11px] font-black uppercase tracking-wider">Total Revenue</span>
                      <DollarSign className="w-4 h-4 text-sky-300 drop-shadow-sm" />
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-white drop-shadow-sm">
                      ${(analytics.kpis?.total_revenue ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                    {analytics.kpis?.revenue_growth_pct !== null && analytics.kpis?.revenue_growth_pct !== undefined && (
                      <div className={`text-[11px] font-extrabold mt-1 ${analytics.kpis.revenue_growth_pct >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                        {analytics.kpis.revenue_growth_pct >= 0 ? '↑' : '↓'} {analytics.kpis.revenue_growth_pct.toFixed(1)}% vs prior
                      </div>
                    )}
                  </div>

                  <div className="relative p-3.5 overflow-hidden group" style={gameCardStyle}>
                    <div style={pillShineStyle} />
                    <div className="flex items-center justify-between text-sky-100 mb-1">
                      <span className="text-[11px] font-black uppercase tracking-wider">Total Orders</span>
                      <ShoppingBag className="w-4 h-4 text-emerald-300 drop-shadow-sm" />
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-white drop-shadow-sm">
                      {(analytics.kpis?.total_orders ?? 0).toLocaleString()}
                    </div>
                    <div className="text-[11px] font-semibold text-sky-200/90 mt-1">Processed transactions</div>
                  </div>

                  <div className="relative p-3.5 overflow-hidden group" style={gameCardStyle}>
                    <div style={pillShineStyle} />
                    <div className="flex items-center justify-between text-sky-100 mb-1">
                      <span className="text-[11px] font-black uppercase tracking-wider">Units Sold</span>
                      <Package className="w-4 h-4 text-yellow-300 drop-shadow-sm" />
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-white drop-shadow-sm">
                      {(analytics.kpis?.total_units_sold ?? 0).toLocaleString()}
                    </div>
                    <div className="text-[11px] font-semibold text-sky-200/90 mt-1">Total items shipped</div>
                  </div>

                  <div className="relative p-3.5 overflow-hidden group" style={gameCardStyle}>
                    <div style={pillShineStyle} />
                    <div className="flex items-center justify-between text-sky-100 mb-1">
                      <span className="text-[11px] font-black uppercase tracking-wider">Avg Order Value</span>
                      <TrendingUp className="w-4 h-4 text-amber-300 drop-shadow-sm" />
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-white drop-shadow-sm">
                      ${(analytics.kpis?.average_order_value ?? 0).toFixed(2)}
                    </div>
                    <div className="text-[11px] font-semibold text-sky-200/90 mt-1">Revenue per basket</div>
                  </div>

                  <div className="relative p-3.5 overflow-hidden group" style={gameCardStyle}>
                    <div style={pillShineStyle} />
                    <div className="flex items-center justify-between text-sky-100 mb-1">
                      <span className="text-[11px] font-black uppercase tracking-wider">Products (SKUs)</span>
                      <Package className="w-4 h-4 text-cyan-300 drop-shadow-sm" />
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-white drop-shadow-sm">
                      {(analytics.kpis?.total_products ?? 0).toLocaleString()}
                    </div>
                    <div className="text-[11px] font-semibold text-sky-200/90 mt-1">Catalog items</div>
                  </div>

                  <div className="relative p-3.5 overflow-hidden group" style={gameCardStyle}>
                    <div style={pillShineStyle} />
                    <div className="flex items-center justify-between text-sky-100 mb-1">
                      <span className="text-[11px] font-black uppercase tracking-wider">Customers</span>
                      <Users className="w-4 h-4 text-rose-300 drop-shadow-sm" />
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-white drop-shadow-sm">
                      {(analytics.kpis?.total_customers ?? 0).toLocaleString()}
                    </div>
                    <div className="text-[11px] font-semibold text-sky-200/90 mt-1">Active buyers</div>
                  </div>
                </div>

                {/* TAB 1: OVERVIEW & TRENDS */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div className="p-5" style={gameCardStyle}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-sky-300" />
                          Monthly Revenue Trajectory & Growth
                        </h3>
                        <span className="text-xs font-semibold text-sky-200">Chronological aggregations</span>
                      </div>

                      <div className="h-56 w-full flex items-end gap-2 pt-6 pb-2 border-b-2 border-white/20">
                        {(analytics.monthly_trend || []).map((m, idx) => {
                          const maxRev = Math.max(1, ...(analytics.monthly_trend || []).map(x => x.revenue || 0))
                          const heightPct = Math.min(100, Math.max(5, ((m.revenue || 0) / maxRev) * 100))
                          const momPct = m.mom_growth_pct ?? 0
                          return (
                            <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative h-full justify-end">
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 px-2.5 py-1 rounded-xl bg-sky-950 text-white text-[10px] font-black whitespace-nowrap border-2 border-white pointer-events-none z-10 shadow-xl">
                                {m.month_name || 'Month'}: ${(m.revenue ?? 0).toLocaleString()} ({momPct >= 0 ? '+' : ''}{momPct.toFixed(1)}%)
                              </div>
                              <div
                                className="w-full rounded-t-lg transition-all duration-300 group-hover:brightness-125 border-t border-x border-white/60"
                                style={{
                                  height: `${heightPct}%`,
                                  background: 'linear-gradient(180deg, #38bdf8 0%, #0284c7 100%)',
                                  boxShadow: '0 4px 10px rgba(2, 132, 199, 0.4)',
                                }}
                              />
                              <span className="text-[10px] font-bold text-sky-200 truncate w-full text-center mt-1">
                                {(m.month_name || 'Month').split(' ')[0]}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-5" style={gameCardStyle}>
                        <h3 className="text-sm font-black text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-emerald-300" />
                          Regional Demand Distribution
                        </h3>
                        <div className="space-y-3">
                          {(analytics.regions || []).map((reg, i) => (
                            <div key={i} className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="font-bold text-white">{reg.region || 'Region'}</span>
                                <span className="font-mono font-bold text-sky-200">
                                  ${(reg.revenue ?? 0).toLocaleString()} ({(reg.revenue_share_pct ?? 0).toFixed(1)}%)
                                </span>
                              </div>
                              <div className="w-full h-2.5 rounded-full bg-sky-950/80 overflow-hidden border border-white/20">
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${Math.min(100, Math.max(0, reg.revenue_share_pct ?? 0))}%`,
                                    background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)',
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="p-5" style={gameCardStyle}>
                        <h3 className="text-sm font-black text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                          <Package className="w-4 h-4 text-yellow-300" />
                          Category Revenue Breakdown
                        </h3>
                        <div className="space-y-3">
                          {(analytics.categories || []).map((cat, i) => (
                            <div key={i} className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="font-bold text-white">{cat.category || 'Category'}</span>
                                <span className="font-mono font-bold text-sky-200">
                                  ${(cat.revenue ?? 0).toLocaleString()} ({(cat.revenue_share_pct ?? 0).toFixed(1)}%)
                                </span>
                              </div>
                              <div className="w-full h-2.5 rounded-full bg-sky-950/80 overflow-hidden border border-white/20">
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${Math.min(100, Math.max(0, cat.revenue_share_pct ?? 0))}%`,
                                    background: 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)',
                                  }}
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
                  <div className="p-5" style={gameCardStyle}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                        <Package className="w-4 h-4 text-sky-300" />
                        Top Performing Products by Revenue (Pareto Distribution)
                      </h3>
                      <span className="text-xs font-semibold text-sky-200">Cumulative revenue analysis</span>
                    </div>

                    <div className="overflow-x-auto rounded-xl border-2 border-white/25">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-sky-950/80 border-b-2 border-white/25 text-sky-200 font-black uppercase">
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
                        <tbody className="divide-y divide-white/10 font-mono">
                          {(analytics.top_products || []).map((prod, idx) => (
                            <tr key={idx} className="hover:bg-sky-500/20 transition-colors">
                              <td className="py-2.5 px-3 font-sans font-black text-yellow-300">#{idx + 1}</td>
                              <td className="py-2.5 px-3 font-sans font-bold text-white">{prod.product || 'Product'}</td>
                              <td className="py-2.5 px-3 font-sans text-sky-200">{prod.category || 'General'}</td>
                              <td className="py-2.5 px-3 text-sky-100">{(prod.units_sold ?? 0).toLocaleString()}</td>
                              <td className="py-2.5 px-3 text-sky-100">${(prod.avg_price ?? 0).toFixed(2)}</td>
                              <td className="py-2.5 px-3 font-bold text-emerald-300">${(prod.revenue ?? 0).toLocaleString()}</td>
                              <td className="py-2.5 px-3 text-sky-200">{(prod.revenue_share_pct ?? 0).toFixed(1)}%</td>
                              <td className="py-2.5 px-3 text-yellow-300 font-bold">{(prod.cumulative_revenue_pct ?? 0).toFixed(1)}%</td>
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
                    <div className="p-5 space-y-4" style={gameCardStyle}>
                      <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                        <Users className="w-4 h-4 text-rose-300" />
                        Buyer Retention Rate
                      </h3>
                      <div className="text-3xl font-black text-rose-300 drop-shadow-sm">
                        {(analytics.customer_metrics?.repeat_customer_rate_pct ?? 0).toFixed(1)}%
                      </div>
                      <p className="text-xs text-sky-200 leading-relaxed font-medium">
                        Proportion of total customers who made 2 or more separate purchases in this store dataset.
                      </p>
                      <div className="pt-2 border-t-2 border-white/20 flex justify-between text-xs">
                        <span className="text-sky-200 font-semibold">Repeat Customers:</span>
                        <span className="font-black text-white">{analytics.customer_metrics?.total_repeat_customers ?? 0}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-sky-200 font-semibold">Total Unique Buyers:</span>
                        <span className="font-black text-white">{analytics.customer_metrics?.total_customers ?? 0}</span>
                      </div>
                    </div>

                    <div className="p-5 space-y-4" style={gameCardStyle}>
                      <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-emerald-300" />
                        Average Revenue Per User (ARPU)
                      </h3>
                      <div className="text-3xl font-black text-emerald-300 drop-shadow-sm">
                        ${(analytics.customer_metrics?.avg_revenue_per_customer ?? 0).toFixed(2)}
                      </div>
                      <p className="text-xs text-sky-200 leading-relaxed font-medium">
                        Mean lifetime customer value generated across the customer cohort for this store.
                      </p>
                      <div className="pt-2 border-t-2 border-white/20 flex justify-between text-xs">
                        <span className="text-sky-200 font-semibold">Avg Orders per User:</span>
                        <span className="font-black text-white">{(analytics.customer_metrics?.avg_orders_per_customer ?? 0).toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="p-5 space-y-4" style={gameCardStyle}>
                      <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-yellow-300" />
                        Single vs Repeat Revenue
                      </h3>
                      <div className="space-y-3 pt-2">
                        {(analytics.repeat_breakdown || []).map((seg, i) => (
                          <div key={i} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-white font-bold">{seg.segment || 'Segment'}</span>
                              <span className="font-mono font-bold text-emerald-300">${(seg.total_revenue ?? 0).toLocaleString()}</span>
                            </div>
                            <div className="w-full h-2.5 rounded-full bg-sky-950/80 overflow-hidden border border-white/20">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${Math.min(100, Math.max(0, seg.revenue_share_pct ?? 0))}%`,
                                  background: 'linear-gradient(90deg, #38bdf8 0%, #0284c7 100%)',
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4: SALE FORECAST (The exact screen matching the reference theme) */}
                {activeTab === 'forecast' && (
                  <div className="space-y-5">
                    {/* Model Banner with Horizon Game Pills */}
                    <div className="flex flex-wrap items-center justify-between gap-3 p-4" style={gameCardStyle}>
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl bg-white/20 border-2 border-white text-white shadow-md">
                          <BrainCircuit className="w-6 h-6 text-yellow-300 drop-shadow-sm" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black uppercase tracking-wider text-white">Time-Series Sale Forecast Model</h4>
                          <p className="text-[11px] text-sky-100 font-medium">Ridge Regularization trained strictly on chronological historical actuals (zero data leakage).</p>
                        </div>
                      </div>

                      {/* Horizon Selection Pills */}
                      <div className="flex items-center gap-1.5 bg-sky-950/80 p-1.5 rounded-full border-2 border-white/40 shadow-inner">
                        {[7, 14, 30, 60, 90].map((h) => {
                          const isSel = forecastHorizon === h
                          return (
                            <button
                              key={h}
                              onClick={() => handleHorizonChange(h)}
                              className={`px-3 py-1 rounded-full text-xs font-black transition-all cursor-pointer select-none ${
                                isSel
                                  ? 'shadow-md scale-105'
                                  : 'text-sky-200 hover:text-white hover:bg-white/20 active:scale-95'
                              }`}
                              style={
                                isSel
                                  ? {
                                      background: 'linear-gradient(180deg, #38bdf8 0%, #0ea5e9 40%, #0284c7 100%)',
                                      border: '2px solid #ffffff',
                                      color: '#ffffff',
                                      boxShadow: '0 3px 8px rgba(2, 132, 199, 0.6), inset 0 1px 2px rgba(255, 255, 255, 0.6)',
                                      textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
                                    }
                                  : {}
                              }
                            >
                              {h}d
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {isForecastLoading ? (
                      <div className="h-48 flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-sky-400/30 border-t-sky-400 rounded-full animate-spin" />
                      </div>
                    ) : forecastData ? (
                      <div className="space-y-4">
                        {/* 4 Forecast KPI Stat Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="relative p-3.5 overflow-hidden" style={gameCardStyle}>
                            <div style={pillShineStyle} />
                            <span className="text-[10px] font-black uppercase text-sky-100">Projected {forecastHorizon}d Revenue</span>
                            <div className="text-xl sm:text-2xl font-black text-yellow-300 drop-shadow-sm mt-1">
                              ${(forecastData.total_projected_revenue ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </div>
                          </div>

                          <div className="relative p-3.5 overflow-hidden" style={gameCardStyle}>
                            <div style={pillShineStyle} />
                            <span className="text-[10px] font-black uppercase text-sky-100">Daily Projected Run-rate</span>
                            <div className="text-xl sm:text-2xl font-black text-sky-200 drop-shadow-sm mt-1">
                              ${(forecastData.daily_avg_projected_revenue ?? 0).toFixed(2)}/day
                            </div>
                          </div>

                          <div className="relative p-3.5 overflow-hidden" style={gameCardStyle}>
                            <div style={pillShineStyle} />
                            <span className="text-[10px] font-black uppercase text-sky-100">Out-of-Sample Test RMSE</span>
                            <div className="text-xl sm:text-2xl font-black text-amber-300 drop-shadow-sm mt-1">
                              ${(forecastData.metrics?.rmse ?? 0).toFixed(2)}
                            </div>
                          </div>

                          <div className="relative p-3.5 overflow-hidden" style={gameCardStyle}>
                            <div style={pillShineStyle} />
                            <span className="text-[10px] font-black uppercase text-sky-100">Test MAPE</span>
                            <div className="text-xl sm:text-2xl font-black text-emerald-300 drop-shadow-sm mt-1">
                              {(forecastData.metrics?.mape ?? 0).toFixed(1)}%
                            </div>
                          </div>
                        </div>

                        {/* Projections Table Card */}
                        <div className="p-4" style={gameCardStyle}>
                          <h4 className="text-xs font-black text-white uppercase tracking-wider mb-3">
                            Future {forecastHorizon}-Day Revenue Projections with Confidence Intervals (±1.5 RMSE)
                          </h4>
                          <div className="max-h-56 overflow-y-auto rounded-xl border-2 border-white/25">
                            <table className="w-full text-left text-xs font-mono">
                              <thead>
                                <tr className="bg-sky-950/80 border-b-2 border-white/25 text-sky-200 uppercase font-bold">
                                  <th className="py-2 px-3">Date</th>
                                  <th className="py-2 px-3">Projected Revenue</th>
                                  <th className="py-2 px-3">Lower Bound</th>
                                  <th className="py-2 px-3">Upper Bound</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/10">
                                {(forecastData.forecast || []).slice(0, 15).map((pt, i) => (
                                  <tr key={i} className="hover:bg-sky-500/20 transition-colors">
                                    <td className="py-2 px-3 font-semibold text-white">{pt.date}</td>
                                    <td className="py-2 px-3 font-black text-yellow-300">${(pt.forecast_revenue ?? 0).toFixed(2)}</td>
                                    <td className="py-2 px-3 text-sky-200">${(pt.lower_bound ?? 0).toFixed(2)}</td>
                                    <td className="py-2 px-3 text-sky-200">${(pt.upper_bound ?? 0).toFixed(2)}</td>
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
              </>
            ) : null}
          </div>

          {/* Footer Bar with "Return to 3D Marketplace" Game Pill */}
          <div className="relative z-10 flex items-center justify-between px-6 py-3 border-t-2 border-white/25 bg-sky-900/40 text-xs">
            <span className="font-bold text-sky-100">
              Store ID: <code className="text-white px-2 py-0.5 rounded bg-black/30 border border-white/20">{store.id}</code>
            </span>

            {/* Solid SkyBlue Action Pill matching Build & Explore buttons */}
            <button
              onClick={onClose}
              className="relative px-5 py-2 rounded-full font-black text-xs tracking-wide text-white cursor-pointer transition-all duration-200 active:scale-95 overflow-hidden flex items-center gap-2 shadow-lg"
              style={{
                background: 'linear-gradient(180deg, #38bdf8 0%, #0ea5e9 40%, #0284c7 75%, #0369a1 100%)',
                border: '3px solid #ffffff',
                boxShadow: '0 6px 20px rgba(2, 132, 199, 0.65), inset 0 2px 4px rgba(255, 255, 255, 0.8)',
                ...cartoonTextStyle,
              }}
            >
              <div style={pillShineStyle} />
              <span>Return to 3D Marketplace</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

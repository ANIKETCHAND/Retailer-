/**
 * RetailVision - Master Floating Top Navigation Bar
 * Implements full Requirement 9:
 *  - Marketplace
 *  - Existing Stores (with interactive directory modal/drawer)
 *  - Construct Store (smooth fly-to empty plot)
 *  - My Stores
 *  - Analytics
 *  - Settings
 *  - Dynamic Store Counter: "{N} STORES ACTIVE | 1 AVAILABLE CONSTRUCTION PLOT"
 */

import React, { useState } from 'react'
import {
  Building2,
  Hammer,
  Layers,
  LayoutGrid,
  LineChart,
  LogOut,
  Moon,
  SlidersHorizontal,
  Sparkles,
  Sun,
  UserCheck,
  X
} from 'lucide-react'
import type { GraphicsQuality, Store, TimeOfDay, UserSession } from '../../types'

interface FloatingNavProps {
  stores: Store[]
  selectedStore: Store | null
  onSelectStore: (store: Store) => void
  onOpenConstruct: () => void
  onResetCamera: () => void
  userSession: UserSession | null
  onLogout: () => void
  timeOfDay: TimeOfDay
  onToggleTimeOfDay: () => void
  graphicsQuality: GraphicsQuality
  onChangeGraphicsQuality: (quality: GraphicsQuality) => void
  nextPlotIndex?: number
}

export const FloatingNav: React.FC<FloatingNavProps> = ({
  stores,
  selectedStore,
  onSelectStore,
  onOpenConstruct,
  onResetCamera,
  userSession,
  onLogout,
  timeOfDay,
  onToggleTimeOfDay,
  graphicsQuality,
  onChangeGraphicsQuality,
  nextPlotIndex = 1
}) => {
  const [isStoreDrawerOpen, setIsStoreDrawerOpen] = useState(false)
  const [drawerFilter, setDrawerFilter] = useState<'all' | 'custom'>('all')

  const totalCityRevenue = stores.reduce((sum, s) => sum + (s.total_revenue || 0), 0)
  const customStores = stores.filter(s => !s.is_default)
  const displayedStores = drawerFilter === 'custom' ? customStores : stores

  const cycleQuality = () => {
    const qualities: GraphicsQuality[] = ['low', 'medium', 'high', 'ultra']
    const nextIdx = (qualities.indexOf(graphicsQuality) + 1) % qualities.length
    onChangeGraphicsQuality(qualities[nextIdx])
  }

  return (
    <>
      <header className="fixed top-3 left-3 right-3 z-40 flex items-center justify-between px-3 sm:px-5 py-2 sm:py-2.5 rounded-2xl bg-slate-900/90 backdrop-blur-2xl border border-white/15 shadow-2xl shadow-black/60 transition-all duration-300">
        {/* Brand & Dynamic Counter Pill */}
        <div className="flex items-center gap-3">
          <div
            onClick={onResetCamera}
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-emerald-400 text-white font-black text-xs shadow-lg shadow-orange-500/25 cursor-pointer hover:scale-105 transition-transform"
          >
            RV
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-extrabold text-white tracking-tight">
                Retail<span className="text-emerald-400">Vision</span>
              </h1>
              <span className="hidden sm:flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <Sparkles className="w-2.5 h-2.5" />
                Live City
              </span>
            </div>

            {/* LIVE COUNTER: "{N} STORES ACTIVE | 1 AVAILABLE CONSTRUCTION PLOT" */}
            <div className="text-[10px] sm:text-[11px] font-bold flex items-center gap-1.5 mt-0.5">
              <span className="text-white flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400">{stores.length}</span> STORES ACTIVE
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-emerald-300 font-semibold">
                ${totalCityRevenue.toLocaleString()}
              </span>
              <span className="text-slate-500">|</span>
              <span className="text-amber-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                PLOT #{nextPlotIndex} AVAILABLE
              </span>
            </div>
          </div>
        </div>

        {/* Central Primary Navigation Items */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-white/10">
          {/* Marketplace */}
          <button
            onClick={onResetCamera}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-sky-400" />
            <span>Marketplace</span>
          </button>

          {/* Existing Stores */}
          <button
            onClick={() => {
              setDrawerFilter('all')
              setIsStoreDrawerOpen(true)
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <Building2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Existing Stores</span>
            <span className="px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-[10px] text-cyan-300 font-bold">
              {stores.length}
            </span>
          </button>

          {/* Construct Store */}
          <button
            onClick={onOpenConstruct}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-amber-200 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 transition-all cursor-pointer shadow-sm active:scale-95"
            title="Focus on next empty plot and open construction interface"
          >
            <Hammer className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
            <span className="text-amber-300">Construct Store</span>
          </button>

          {/* My Stores */}
          <button
            onClick={() => {
              setDrawerFilter('custom')
              setIsStoreDrawerOpen(true)
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            <span>My Stores</span>
            {customStores.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-purple-500/20 text-[10px] text-purple-300 font-bold">
                {customStores.length}
              </span>
            )}
          </button>

          {/* Analytics */}
          <button
            onClick={() => {
              if (selectedStore && onSelectStore) {
                onSelectStore(selectedStore)
              } else if (stores.length > 0) {
                onSelectStore(stores[0])
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <LineChart className="w-3.5 h-3.5 text-emerald-400" />
            <span>Analytics</span>
          </button>
        </nav>

        {/* Mobile / Compact Quick Action: Construct Store */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            onClick={onOpenConstruct}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white text-xs font-black shadow-lg shadow-orange-500/25 border border-amber-300/30 transition-all cursor-pointer active:scale-95"
          >
            <Hammer className="w-3.5 h-3.5" />
            <span>Construct</span>
          </button>
          <button
            onClick={() => {
              setDrawerFilter('all')
              setIsStoreDrawerOpen(true)
            }}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-200 border border-slate-700"
          >
            <Building2 className="w-4 h-4" />
          </button>
        </div>

        {/* Right Controls: Settings (Day/Night, Quality), User, Exit */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Day / Night Mode Switcher */}
          <button
            onClick={onToggleTimeOfDay}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer shadow-md ${
              timeOfDay === 'day'
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/40 hover:bg-amber-500/25 shadow-amber-500/10'
                : 'bg-indigo-500/20 text-indigo-200 border-indigo-400/40 hover:bg-indigo-500/30 shadow-indigo-500/20'
            }`}
            title={timeOfDay === 'day' ? 'Switch to Night Mode' : 'Switch to Day Mode'}
          >
            {timeOfDay === 'day' ? (
              <>
                <Sun className="w-3 h-3 text-amber-400" />
                <span className="hidden md:inline">Day</span>
              </>
            ) : (
              <>
                <Moon className="w-3 h-3 text-indigo-300" />
                <span className="hidden md:inline">Night</span>
              </>
            )}
          </button>

          {/* Graphics Quality */}
          <button
            onClick={cycleQuality}
            className="hidden sm:flex items-center gap-1 px-2 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700 text-[10px] font-bold transition-colors cursor-pointer"
            title={`Graphics: ${graphicsQuality.toUpperCase()}`}
          >
            <SlidersHorizontal className="w-3 h-3 text-cyan-400" />
            <span className="uppercase text-cyan-300">{graphicsQuality}</span>
          </button>

          {/* User Account */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800/70 border border-white/10 text-[11px] text-slate-200">
            <UserCheck className="w-3 h-3 text-emerald-400" />
            <span className="font-semibold">{userSession?.username || 'admin'}</span>
          </div>

          {/* Exit / Logout */}
          <button
            onClick={onLogout}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold transition-colors cursor-pointer"
            title="Exit marketplace"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Exit</span>
          </button>
        </div>
      </header>

      {/* STORES DIRECTORY MODAL / DRAWER */}
      {isStoreDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-2xl max-h-[80vh] flex flex-col rounded-3xl bg-slate-900 border border-white/20 shadow-2xl overflow-hidden">
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-950/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Marketplace Stores Directory</h2>
                  <p className="text-xs text-slate-400">
                    Click any retail landmark to fly camera and inspect its individual analytics
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsStoreDrawerOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 px-6 py-2.5 border-b border-white/5 bg-slate-900/60">
              <button
                onClick={() => setDrawerFilter('all')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  drawerFilter === 'all'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                All Stores ({stores.length})
              </button>
              <button
                onClick={() => setDrawerFilter('custom')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  drawerFilter === 'custom'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                My Constructed Stores ({customStores.length})
              </button>
            </div>

            {/* Stores List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2.5">
              {displayedStores.map((store) => (
                <div
                  key={store.id}
                  onClick={() => {
                    setIsStoreDrawerOpen(false)
                    onSelectStore(store)
                  }}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-white/5 hover:border-blue-500/40 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-10 rounded-full"
                      style={{ backgroundColor: store.color || '#3b82f6' }}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors">
                          {store.name}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-semibold text-slate-300">
                          {store.category}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          ID: {store.id}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                        {store.district_name || 'Central Commercial Plaza'} • Pos: ({store.grid_x.toFixed(1)}, {store.grid_z.toFixed(1)})
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-extrabold text-emerald-400">
                      ${(store.total_revenue || 0).toLocaleString()}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {(store.total_orders || 0).toLocaleString()} Orders
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

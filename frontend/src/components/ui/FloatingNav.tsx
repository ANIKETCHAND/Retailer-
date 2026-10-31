/**
 * RetailVision - Floating Top Navigation Bar
 * Provides instant access to marketplace navigation, store selector,
 * construct trigger, camera reset, Day/Night mode toggle, Graphics quality,
 * and user session controls.
 */

import React from 'react'
import {
  Coins,
  Hammer, LogOut, RotateCcw,
  Sparkles,
  Store as StoreIcon,
  Sun, Moon,
  SlidersHorizontal
} from 'lucide-react'
import type { Store, UserSession, TimeOfDay, GraphicsQuality } from '../../types'

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
  onChangeGraphicsQuality
}) => {
  // Compute total city revenue across all retail stores
  const totalCityRevenue = stores.reduce((sum, s) => sum + (s.total_revenue || 0), 0)

  // Cycle quality on click
  const cycleQuality = () => {
    const qualities: GraphicsQuality[] = ['low', 'medium', 'high', 'ultra']
    const nextIdx = (qualities.indexOf(graphicsQuality) + 1) % qualities.length
    onChangeGraphicsQuality(qualities[nextIdx])
  }

  return (
    <header className="fixed top-4 left-4 right-4 z-40 flex items-center justify-between px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl bg-slate-900/85 backdrop-blur-xl border border-white/15 shadow-2xl shadow-black/50 transition-all duration-300">
      {/* Brand & City Indicator */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-emerald-400 text-white font-black text-sm shadow-lg shadow-orange-500/25">
          RV
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-extrabold text-white tracking-tight">
              Retail<span className="text-emerald-400">Vision</span>
            </h1>
            <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Sparkles className="w-2.5 h-2.5" />
              Metropolis
            </span>
          </div>
          <p className="text-[11px] text-slate-300 font-medium flex items-center gap-2">
            <span>{stores.length} Retail Landmarks</span>
            <span className="text-slate-500">•</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <Coins className="w-3 h-3 text-amber-400" />
              ${totalCityRevenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
          </p>
        </div>
      </div>

      {/* Middle Controls: Store Selector & Construct Button */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Store Quick-Jump Selector */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs">
          <StoreIcon className="w-3.5 h-3.5 text-sky-400" />
          <select
            value={selectedStore?.id || ''}
            onChange={(e) => {
              const found = stores.find(s => s.id === e.target.value)
              if (found) onSelectStore(found)
            }}
            className="bg-transparent text-white text-xs focus:outline-none cursor-pointer"
          >
            <option value="" disabled className="bg-slate-900 text-slate-400">Jump to Building...</option>
            {stores.map((s) => (
              <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                {s.name} ({s.category})
              </option>
            ))}
          </select>
        </div>

        {/* Construct Store Button */}
        <button
          onClick={onOpenConstruct}
          className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-white text-xs font-black shadow-lg shadow-orange-500/30 border border-amber-300/30 transition-all cursor-pointer active:scale-95"
          title="Upload CSV to construct new building"
        >
          <Hammer className="w-4 h-4 animate-bounce" />
          <span className="font-extrabold">Construct Store</span>
        </button>

        {/* Reset Camera Button */}
        <button
          onClick={onResetCamera}
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700 shadow-sm"
          title="Reset Camera to City Overview"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Right Controls: Day/Night, Quality, Profile & Exit */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Day / Night Mode Switcher */}
        <button
          onClick={onToggleTimeOfDay}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-md ${
            timeOfDay === 'day'
              ? 'bg-amber-500/15 text-amber-300 border-amber-500/40 hover:bg-amber-500/25 shadow-amber-500/10'
              : 'bg-indigo-500/20 text-indigo-200 border-indigo-400/40 hover:bg-indigo-500/30 shadow-indigo-500/20'
          }`}
          title={timeOfDay === 'day' ? 'Switch to Cyberpunk Night Mode' : 'Switch to Sunlit Daytime'}
        >
          {timeOfDay === 'day' ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
              <span className="hidden md:inline">Day</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-indigo-300" />
              <span className="hidden md:inline">Night</span>
            </>
          )}
        </button>

        {/* Graphics Quality Selector */}
        <button
          onClick={cycleQuality}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700 text-[11px] font-semibold transition-colors cursor-pointer"
          title={`Graphics Quality: ${graphicsQuality.toUpperCase()} (Click to toggle)`}
        >
          <SlidersHorizontal className="w-3 h-3 text-cyan-400" />
          <span className="uppercase font-bold text-cyan-300">{graphicsQuality}</span>
        </button>

        {/* User Badge */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/70 border border-white/10 text-xs text-slate-200">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-medium">{userSession?.username || 'admin@retailvision.com'}</span>
        </div>

        {/* Exit Storefront Button */}
        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold transition-colors cursor-pointer"
          title="Lock storefront & exit to landing window"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Exit</span>
        </button>
      </div>
    </header>
  )
}

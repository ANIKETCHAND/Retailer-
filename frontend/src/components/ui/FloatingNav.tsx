/**
 * RetailVision - Floating Top Navigation Bar
 * Provides instant access to marketplace navigation, store selector,
 * construct trigger, camera reset, and logout controls.
 */

import React from 'react'
import {
  Hammer, LogOut, RotateCcw,
  Store as StoreIcon
} from 'lucide-react'
import type { Store, UserSession } from '../../types'

interface FloatingNavProps {
  stores: Store[]
  selectedStore: Store | null
  onSelectStore: (store: Store) => void
  onOpenConstruct: () => void
  onResetCamera: () => void
  userSession: UserSession | null
  onLogout: () => void
}

export const FloatingNav: React.FC<FloatingNavProps> = ({
  stores,
  selectedStore,
  onSelectStore,
  onOpenConstruct,
  onResetCamera,
  userSession,
  onLogout
}) => {
  return (
    <header className="fixed top-4 left-4 right-4 z-40 flex items-center justify-between px-5 py-3 rounded-2xl glass-panel border border-white/10 shadow-2xl">
      {/* Brand & City Indicator */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-500 text-white font-extrabold text-sm shadow-md">
          RV
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-extrabold text-white tracking-tight">
              Retail<span className="text-emerald-400">Vision</span>
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              3D Marketplace
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium">
            {stores.length} Retail Buildings Active
          </p>
        </div>
      </div>

      {/* Middle Controls: Jump to Store & Construct Button */}
      <div className="flex items-center gap-2">
        {/* Store Quick-Jump Selector */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-xs">
          <StoreIcon className="w-3.5 h-3.5 text-blue-400" />
          <select
            value={selectedStore?.id || ''}
            onChange={(e) => {
              const found = stores.find(s => s.id === e.target.value)
              if (found) onSelectStore(found)
            }}
            className="bg-transparent text-white text-xs focus:outline-none cursor-pointer"
          >
            <option value="" disabled className="bg-slate-900 text-slate-400">Select Store...</option>
            {stores.map((s) => (
              <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                {s.name} ({s.category})
              </option>
            ))}
          </select>
        </div>

        {/* Construct Button */}
        <button
          onClick={onOpenConstruct}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-bold shadow-md shadow-orange-500/20 transition-all cursor-pointer"
          title="Upload CSV to construct building"
        >
          <Hammer className="w-3.5 h-3.5" />
          <span>Construct Store</span>
        </button>

        {/* Reset Camera Button */}
        <button
          onClick={onResetCamera}
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700"
          title="Reset Camera View"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Right Controls: User Profile & Logout */}
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/60 border border-white/5 text-xs text-slate-300">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{userSession?.username || 'Admin'}</span>
        </div>

        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-semibold transition-colors cursor-pointer"
          title="Lock storefront & exit"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Exit</span>
        </button>
      </div>
    </header>
  )
}

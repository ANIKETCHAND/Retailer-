/**
 * RetailVision - 3D Hover Store Tooltip HUD
 * Floats at the bottom-left of the viewport when hovering over any 3D retail building.
 */

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DollarSign, ShoppingBag, ArrowRight } from 'lucide-react'
import type { Store } from '../../types'

interface StoreCardTooltipProps {
  store: Store | null
}

export const StoreCardTooltip: React.FC<StoreCardTooltipProps> = ({ store }) => {
  if (!store) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 15, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 15, scale: 0.95 }}
        transition={{ duration: 0.18 }}
        className="fixed bottom-6 left-6 z-30 p-4 rounded-2xl glass-panel border border-white/10 shadow-2xl max-w-sm pointer-events-none"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-base shadow"
            style={{ backgroundColor: store.color || '#3b82f6' }}
          >
            {store.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white tracking-tight">{store.name}</h4>
              <span
                className="px-2 py-0.5 text-[9px] font-bold uppercase rounded-full border"
                style={{
                  borderColor: store.color || '#3b82f6',
                  color: store.color || '#3b82f6',
                  backgroundColor: `${store.color || '#3b82f6'}15`
                }}
              >
                {store.category}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{store.description || 'Retail storefront'}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/5">
          <div className="flex items-center gap-1.5 text-xs">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-mono font-bold text-emerald-400">
              ${store.total_revenue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <ShoppingBag className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-mono">{store.total_orders.toLocaleString()} Orders</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] text-blue-400 font-bold mt-2 pt-1 border-t border-white/5">
          <span>Click building to open dashboard</span>
          <ArrowRight className="w-3 h-3" />
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

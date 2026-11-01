/**
 * RetailVision - Modern Architectural City Minimap & Radar Guide
 * Seamlessly matched to the RetailVision glassmorphic dashboard theme.
 * Features:
 *  - 100% theme harmony with FloatingNav and StoreAnalyticsModal
 *  - Modern cartographic styling (soft asphalt roads, water canal, railway, district blocks)
 *  - Interactive colored store blips with category-matched glow rings
 *  - Construction beacon matching the orange Construct Store branding
 *  - Real-time 60 FPS camera heading tracker with zero React re-render thrashing
 *  - City retail metrics (Revenue, Orders, Stores) replacing retro game health bars
 */

import React, { useEffect, useRef, useState } from 'react'
import {
  Maximize2,
  Minimize2,
  Navigation,
  Crosshair,
  MapPin,
  Coins,
  ShoppingBag,
  Sparkles
} from 'lucide-react'
import type { Store } from '../../types'
import { findNextAvailablePlot } from '../../api/client'

interface GtaMinimapProps {
  stores: Store[]
  selectedStore: Store | null
  onSelectStore: (store: Store) => void
  onOpenConstruct: () => void
  onResetCamera: () => void
}

export const GtaMinimap: React.FC<GtaMinimapProps> = ({
  stores,
  selectedStore,
  onSelectStore,
  onOpenConstruct,
  onResetCamera
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [hoveredBlip, setHoveredBlip] = useState<{
    id: string
    name: string
    category: string
    revenue: number
    orders: number
    color: string
    isConstruct?: boolean
  } | null>(null)

  // Direct ref to the camera orientation cone (buttery-smooth 60 FPS tracking)
  const playerMarkerRef = useRef<SVGGElement>(null)

  // Radar dimensions
  const worldRadius = isExpanded ? 32 : 20
  const mapSize = isExpanded ? 360 : 224
  const center = mapSize / 2
  const scale = (mapSize * 0.42) / worldRadius

  const worldToMap = (wx: number, wz: number) => {
    const mx = center + wx * scale
    const my = center + wz * scale
    return { x: mx, y: my }
  }

  // Real-time camera listener
  useEffect(() => {
    const handleCamUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ cx: number; cz: number; tx: number; tz: number; heading: number }>
      if (!customEvent.detail || !playerMarkerRef.current) return

      const { cx, cz, heading } = customEvent.detail
      const camPos = worldToMap(cx, cz)

      // Clamp camera marker inside radar boundary
      const maxR = center - 14
      const dx = camPos.x - center
      const dy = camPos.y - center
      const dist = Math.sqrt(dx * dx + dy * dy)

      const clampedX = dist > maxR ? center + (dx / dist) * maxR : camPos.x
      const clampedY = dist > maxR ? center + (dy / dist) * maxR : camPos.y
      const headingDeg = (heading * 180) / Math.PI

      playerMarkerRef.current.setAttribute(
        'transform',
        `translate(${clampedX.toFixed(1)}, ${clampedY.toFixed(1)}) rotate(${headingDeg.toFixed(1)})`
      )
    }

    window.addEventListener('retailvision-cam', handleCamUpdate)
    return () => {
      window.removeEventListener('retailvision-cam', handleCamUpdate)
    }
  }, [center, scale])

  // Aggregate metrics
  const totalRev = stores.reduce((acc, s) => acc + (s.total_revenue || 0), 0)
  const totalOrders = stores.reduce((acc, s) => acc + (s.total_orders || 0), 0)

  return (
    <aside
      className={`fixed z-40 transition-all duration-300 select-none ${
        isExpanded
          ? 'bottom-6 left-6 w-[384px]'
          : 'bottom-6 left-6 w-[248px]'
      }`}
      aria-label="City District Map"
    >
      {/* GLASSMORPHIC CONTAINER (MATCHING FLOATINGNAV & THEME) */}
      <div className="relative rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-white/15 shadow-2xl shadow-black/70 overflow-hidden p-3 transition-colors">
        {/* Subtle Ambient Sheen */}
        <div className="absolute inset-0 pointer-events-none rounded-2xl bg-gradient-to-b from-white/5 via-transparent to-transparent" />

        {/* TOP STATUS HEADER */}
        <div className="relative z-10 flex items-center justify-between mb-2 px-0.5">
          {/* Title & Live Status */}
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shadow-sm">
              <MapPin className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-extrabold text-white tracking-tight">
                  City Radar
                </span>
                <span className="flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live
                </span>
              </div>
            </div>
          </div>

          {/* Quick Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={onResetCamera}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
              title="Reset View to Metropolis Overview"
            >
              <Crosshair className="w-3.5 h-3.5 text-sky-400" />
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
              title={isExpanded ? 'Minimize Radar' : 'Expand Radar'}
            >
              {isExpanded ? (
                <Minimize2 className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
              )}
            </button>
          </div>
        </div>

        {/* CARTOGRAPHIC MAP CANVAS */}
        <div
          className="relative rounded-xl bg-slate-950 border border-slate-800/80 overflow-hidden shadow-inner cursor-crosshair"
          style={{ width: `${mapSize}px`, height: `${mapSize}px` }}
        >
          {/* Soft Depth Gradient */}
          <div className="absolute inset-0 pointer-events-none rounded-xl opacity-40 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-sky-500/15 via-slate-950/20 to-transparent" />

          {/* VECTOR MAP GRAPHICS */}
          <svg
            width={mapSize}
            height={mapSize}
            className="absolute inset-0 pointer-events-auto"
          >
            <defs>
              {/* Subtle Grid */}
              <pattern id="themeGrid" width="24" height="24" patternUnits="userSpaceOnUse">
                <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(255,255,255,0.035)" strokeWidth="0.8" />
              </pattern>
            </defs>

            {/* Base Background: Deep Tropical Ocean */}
            <rect width={mapSize} height={mapSize} fill="#032644" />
            <rect width={mapSize} height={mapSize} fill="url(#themeGrid)" />

            {/* Tropical Island Landmass */}
            <rect
              x={center - (mapSize * 0.44)}
              y={center - (mapSize * 0.44)}
              width={mapSize * 0.88}
              height={mapSize * 0.88}
              rx={18}
              fill="#064e3b"
              opacity="0.85"
            />

            {/* Golden Sand Beach Coastline in the South */}
            <rect
              x={center - (mapSize * 0.44)}
              y={center + (mapSize * 0.30)}
              width={mapSize * 0.88}
              height={mapSize * 0.14}
              rx={12}
              fill="#eab308"
              opacity="0.65"
            />

            {/* Marina Pier in the West */}
            <rect
              x={center - (mapSize * 0.48)}
              y={center - 8}
              width={mapSize * 0.12}
              height={16}
              fill="#854d0e"
              opacity="0.8"
            />

            {/* Concentric Soft Radar Rings */}
            {[0.32, 0.64, 0.94].map((fraction, i) => (
              <circle
                key={`ring-${i}`}
                cx={center}
                cy={center}
                r={(mapSize / 2) * fraction}
                fill="none"
                stroke="rgba(56, 189, 248, 0.12)"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
            ))}

            {/* WATER CANAL (z = -12.5) */}
            {(() => {
              const canalY = worldToMap(0, -12.5).y
              return (
                <g>
                  <rect
                    x="0"
                    y={canalY - 4}
                    width={mapSize}
                    height="9"
                    fill="#0284c7"
                    opacity="0.85"
                  />
                  {/* Road Bridge Crossing */}
                  <rect
                    x={center - 7}
                    y={canalY - 5}
                    width="14"
                    height="11"
                    fill="#334155"
                  />
                </g>
              )
            })()}

            {/* RAILWAY LINE (z = -14.5) */}
            {(() => {
              const railY = worldToMap(0, -14.5).y
              return (
                <line
                  x1="0"
                  y1={railY}
                  x2={mapSize}
                  y2={railY}
                  stroke="#64748b"
                  strokeWidth="2"
                  strokeDasharray="4 3"
                />
              )
            })()}

            {/* ROAD NETWORK */}
            {/* East-West Boulevard (z = 0) */}
            <rect
              x="0"
              y={center - 6}
              width={mapSize}
              height="12"
              fill="#1e293b"
            />
            <line
              x1="0"
              y1={center}
              x2={mapSize}
              y2={center}
              stroke="#e2e8f0"
              strokeWidth="1"
              strokeDasharray="4 4"
              opacity="0.6"
            />

            {/* North-South Avenue (x = 0) */}
            <rect
              x={center - 6}
              y="0"
              width="12"
              height={mapSize}
              fill="#1e293b"
            />
            <line
              x1={center}
              y1="0"
              x2={center}
              y2={mapSize}
              stroke="#e2e8f0"
              strokeWidth="1"
              strokeDasharray="4 4"
              opacity="0.6"
            />

            {/* Central Intersection */}
            <rect
              x={center - 6}
              y={center - 6}
              width="12"
              height="12"
              fill="#334155"
            />

            {/* CONSTRUCT STORE LOT BLIP (Next vacant plot) */}
            {(() => {
              const nextPlot = findNextAvailablePlot(stores)
              const cPos = worldToMap(nextPlot.x, nextPlot.z)
              const isHovered = hoveredBlip?.id === 'construct'

              return (
                <g
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation()
                    onOpenConstruct()
                  }}
                  onMouseEnter={() =>
                    setHoveredBlip({
                      id: 'construct',
                      name: 'Construction Site',
                      category: 'New Expansion',
                      revenue: 0,
                      orders: 0,
                      color: '#f97316',
                      isConstruct: true
                    })
                  }
                  onMouseLeave={() => setHoveredBlip(null)}
                >
                  <circle cx={cPos.x} cy={cPos.y} r="14" fill="transparent" />

                  {/* Parcel Footprint */}
                  <rect
                    x={cPos.x - 9}
                    y={cPos.y - 9}
                    width="18"
                    height="18"
                    fill={isHovered ? 'rgba(249, 115, 22, 0.4)' : 'rgba(249, 115, 22, 0.2)'}
                    stroke="#f97316"
                    strokeWidth={isHovered ? '2' : '1.2'}
                    strokeDasharray="3 2"
                    rx="4"
                  />

                  {/* Pulsing Beacon Ring */}
                  <circle cx={cPos.x} cy={cPos.y} r="5" fill="none" stroke="#f97316" strokeWidth="1.5">
                    <animate attributeName="r" from="5" to="14" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from="0.9" to="0" dur="2s" repeatCount="indefinite" />
                  </circle>

                  {/* Core Orange Pin */}
                  <circle cx={cPos.x} cy={cPos.y} r="4" fill="#f97316" />
                </g>
              )
            })()}

            {/* STORE PINS */}
            {stores.map((s) => {
              const pos = worldToMap(s.grid_x, s.grid_z)
              const isSelected = selectedStore?.id === s.id
              const isHovered = hoveredBlip?.id === s.id
              const color = s.color || '#3b82f6'

              return (
                <g
                  key={s.id}
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation()
                    onSelectStore(s)
                  }}
                  onMouseEnter={() =>
                    setHoveredBlip({
                      id: s.id,
                      name: s.name,
                      category: s.category,
                      revenue: s.total_revenue || 0,
                      orders: s.total_orders || 0,
                      color
                    })
                  }
                  onMouseLeave={() => setHoveredBlip(null)}
                >
                  {/* Stable Invisible Hit Area */}
                  <circle cx={pos.x} cy={pos.y} r="14" fill="transparent" />

                  {/* Architectural Building Footprint */}
                  <rect
                    x={pos.x - 9}
                    y={pos.y - 9}
                    width="18"
                    height="18"
                    fill={
                      isSelected
                        ? `${color}40`
                        : isHovered
                        ? `${color}25`
                        : '#1e293b'
                    }
                    stroke={isSelected || isHovered ? color : '#475569'}
                    strokeWidth={isSelected || isHovered ? '2' : '1.2'}
                    rx="4"
                  />

                  {/* Selected Pulse Wave */}
                  {isSelected && (
                    <circle cx={pos.x} cy={pos.y} r="5" fill="none" stroke={color} strokeWidth="1.5">
                      <animate attributeName="r" from="5" to="15" dur="1.6s" repeatCount="indefinite" />
                      <animate attributeName="opacity" from="1" to="0" dur="1.6s" repeatCount="indefinite" />
                    </circle>
                  )}

                  {/* Core Pin Dot */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={isSelected || isHovered ? 4.5 : 3.5}
                    fill={color}
                  />
                </g>
              )
            })}

            {/* CAMERA / PLAYER FIELD-OF-VIEW CONE */}
            <g
              ref={playerMarkerRef}
              transform={`translate(${center}, ${center}) rotate(45)`}
            >
              {/* Soft directional view cone */}
              <path
                d="M 0 0 L -16 -34 A 36 36 0 0 1 16 -34 Z"
                fill="rgba(56, 189, 248, 0.22)"
                stroke="rgba(56, 189, 248, 0.55)"
                strokeWidth="1"
              />
              {/* Sleek Navigation Pointer */}
              <polygon
                points="0,-7 5,3 0,1 -5,3"
                fill="#ffffff"
                stroke="#0284c7"
                strokeWidth="1.2"
              />
            </g>

            {/* NORTH COMPASS BADGE */}
            <g transform={`translate(${mapSize - 16}, 16)`}>
              <circle cx="0" cy="0" r="8" fill="#1e293b" stroke="#334155" strokeWidth="1" />
              <text
                x="0"
                y="3"
                textAnchor="middle"
                fontSize="8"
                fontWeight="bold"
                fill="#f43f5e"
                fontFamily="system-ui, sans-serif"
              >
                N
              </text>
            </g>
          </svg>

          {/* HOVER TOOLTIP CARD */}
          {hoveredBlip && (
            <div className="absolute top-2 left-2 right-2 z-20 px-2.5 py-1.5 rounded-xl bg-slate-900/95 backdrop-blur-xl border border-white/20 shadow-2xl text-left pointer-events-none animate-fadeIn">
              <div className="flex items-center justify-between text-xs font-bold text-white">
                <span className="truncate flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: hoveredBlip.color }}
                  />
                  <span className="truncate">{hoveredBlip.name}</span>
                </span>
                <span className="text-[10px] text-amber-300 font-semibold shrink-0 ml-1">
                  {hoveredBlip.isConstruct ? 'CONSTRUCT' : `$${(hoveredBlip.revenue / 1000).toFixed(0)}K`}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                {hoveredBlip.isConstruct
                  ? 'Click to build new retail store'
                  : `${hoveredBlip.category} • ${hoveredBlip.orders} Orders • Click to jump`}
              </p>
            </div>
          )}
        </div>

        {/* BOTTOM METRICS & DISTRICT INTEL (REPLACED RETRO HEALTH BARS) */}
        <div className="mt-2.5 space-y-2 px-0.5">
          {/* Active District / Store Focus */}
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="flex items-center gap-1.5 text-slate-200 truncate">
              <Navigation className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span className="truncate">
                {selectedStore ? selectedStore.name : 'Metropolis Central'}
              </span>
            </span>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
              {stores.length} Stores
            </span>
          </div>

          {/* Clean Metric Pills (Matching FloatingNav aesthetic) */}
          <div className="grid grid-cols-2 gap-1.5 pt-0.5">
            {/* Revenue Badge */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-800/80 border border-white/10">
              <Coins className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <div className="truncate">
                <div className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold leading-none">Revenue</div>
                <div className="text-[11px] font-bold text-emerald-400 leading-tight">
                  ${(totalRev / 1000).toFixed(0)}K
                </div>
              </div>
            </div>

            {/* Orders Badge */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-800/80 border border-white/10">
              <ShoppingBag className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <div className="truncate">
                <div className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold leading-none">Orders</div>
                <div className="text-[11px] font-bold text-sky-300 leading-tight">
                  {totalOrders.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Quick-Travel Tip */}
          <div className="text-center text-[10px] text-slate-400 flex items-center justify-center gap-1.5 pt-0.5">
            <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
            <span>Click any store pin to quick-travel</span>
          </div>
        </div>
      </div>
    </aside>
  )
}

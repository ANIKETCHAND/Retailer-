/**
 * RetailVision - Modern Architectural City Minimap & Radar Guide
 * Redesigned to match the exact casual game-pill visual language of the Build and Explore buttons:
 *  - 3.5px solid pure white outer border
 *  - Saturated skyblue glossy gradient
 *  - Upper-half glass reflection shine
 *  - Cartoon typography with dark sticker outline
 *  - Vibrant tropical island & clean asphalt cartography
 *  - Frosted game-card metric pills with white borders
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
import {
  skyBluePillStyle,
  pillShineStyle,
  cartoonTextStyle
} from './GamePillButtons'

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
      className="fixed bottom-6 left-6 z-30 select-none pointer-events-auto"
      aria-label="City District Map"
    >
      {/* ======================================================== */}
      {/* GAME-PILL STYLED RADAR CONTAINER                         */}
      {/* Matches Build and Explore skyblue gradient & white border*/}
      {/* ======================================================== */}
      <div
        className="game-pill-btn relative overflow-hidden p-3.5 transition-all duration-300"
        style={{
          ...skyBluePillStyle,
          borderRadius: '28px',
          boxShadow: '0 12px 35px rgba(2, 132, 199, 0.65), inset 0 2px 4px rgba(255, 255, 255, 0.75)',
        }}
      >
        {/* Top Curved Glass Reflection Shine */}
        <div className="game-pill-shine" style={pillShineStyle} />

        {/* TOP STATUS HEADER */}
        <div className="relative z-10 flex items-center justify-between mb-2.5 px-0.5">
          {/* Title & Live Status */}
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-white/25 border-2 border-white text-white shadow-sm">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="text-base font-black text-white tracking-wide select-none"
                  style={cartoonTextStyle}
                >
                  City Radar
                </span>
                <span
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/80 text-white border border-white shadow-sm"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  Live
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Controls (Reset View & Expand) */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onResetCamera}
              className="p-1.5 rounded-full bg-white/20 hover:bg-white/35 text-white border-2 border-white shadow transition-all hover:scale-110 active:scale-95 cursor-pointer"
              title="Reset View to Metropolis Overview"
            >
              <Crosshair className="w-3.5 h-3.5 text-white" />
            </button>
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-full bg-white/20 hover:bg-white/35 text-white border-2 border-white shadow transition-all hover:scale-110 active:scale-95 cursor-pointer"
              title={isExpanded ? 'Minimize Radar' : 'Expand Radar'}
            >
              {isExpanded ? (
                <Minimize2 className="w-3.5 h-3.5 text-amber-200" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5 text-amber-200" />
              )}
            </button>
          </div>
        </div>

        {/* CARTOGRAPHIC MAP CANVAS VIEWPORT */}
        <div
          className="relative rounded-2xl overflow-hidden shadow-inner cursor-crosshair border-[3px] border-white"
          style={{
            width: `${mapSize}px`,
            height: `${mapSize}px`,
            background: '#0284c7', // Vibrant Tropical Ocean
          }}
        >
          {/* VECTOR MAP GRAPHICS */}
          <svg
            width={mapSize}
            height={mapSize}
            className="absolute inset-0 pointer-events-auto"
          >
            <defs>
              {/* Soft Grid Lines */}
              <pattern id="gameGrid" width="24" height="24" patternUnits="userSpaceOnUse">
                <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8" />
              </pattern>
              {/* Landmass Green Gradient */}
              <linearGradient id="islandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4ade80" />
                <stop offset="50%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#16a34a" />
              </linearGradient>
            </defs>

            {/* Base Ocean & Grid */}
            <rect width={mapSize} height={mapSize} fill="#0284c7" />
            <rect width={mapSize} height={mapSize} fill="url(#gameGrid)" />

            {/* Tropical Island Landmass */}
            <rect
              x={center - (mapSize * 0.44)}
              y={center - (mapSize * 0.44)}
              width={mapSize * 0.88}
              height={mapSize * 0.88}
              rx={22}
              fill="url(#islandGrad)"
              stroke="#ffffff"
              strokeWidth="2"
            />

            {/* Golden Sand Beach Coastline in South */}
            <rect
              x={center - (mapSize * 0.44)}
              y={center + (mapSize * 0.28)}
              width={mapSize * 0.88}
              height={mapSize * 0.15}
              rx={14}
              fill="#fde047"
              stroke="#facc15"
              strokeWidth="1.5"
            />

            {/* Marina Pier in West */}
            <rect
              x={center - (mapSize * 0.48)}
              y={center - 8}
              width={mapSize * 0.12}
              height={16}
              rx={4}
              fill="#b45309"
              stroke="#ffffff"
              strokeWidth="1.5"
            />

            {/* Concentric Game Radar Rings */}
            {[0.32, 0.64, 0.94].map((fraction, i) => (
              <circle
                key={`ring-${i}`}
                cx={center}
                cy={center}
                r={worldRadius * scale * fraction}
                fill="none"
                stroke="rgba(255, 255, 255, 0.25)"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
            ))}

            {/* WATER CANAL (North Shore Canal) */}
            {(() => {
              const canalY = worldToMap(0, -50.0).y
              return (
                <g>
                  <rect
                    x="0"
                    y={canalY - 4}
                    width={mapSize}
                    height="8"
                    fill="#38bdf8"
                    stroke="#ffffff"
                    strokeWidth="1"
                  />
                  {/* Road Bridge Crossing */}
                  <rect
                    x={center - 7}
                    y={canalY - 5}
                    width="14"
                    height="10"
                    fill="#334155"
                    stroke="#ffffff"
                    strokeWidth="1"
                    rx={2}
                  />
                </g>
              )
            })()}

            {/* ROAD NETWORK */}
            {/* East-West Boulevard (z = 0) */}
            <rect
              x="0"
              y={center - 6}
              width={mapSize}
              height="12"
              fill="#334155"
              stroke="#1e293b"
              strokeWidth="1"
            />
            <line
              x1="0"
              y1={center}
              x2={mapSize}
              y2={center}
              stroke="#ffffff"
              strokeWidth="1.2"
              strokeDasharray="4 3"
            />

            {/* North-South Avenue (x = 0) */}
            <rect
              x={center - 6}
              y="0"
              width="12"
              height={mapSize}
              fill="#334155"
              stroke="#1e293b"
              strokeWidth="1"
            />
            <line
              x1={center}
              y1="0"
              x2={center}
              y2={mapSize}
              stroke="#ffffff"
              strokeWidth="1.2"
              strokeDasharray="4 3"
            />

            {/* Central Intersection */}
            <rect
              x={center - 6}
              y={center - 6}
              width="12"
              height="12"
              fill="#475569"
              stroke="#ffffff"
              strokeWidth="1"
            />

            {/* CONSTRUCT STORE LOT BLIP (Next vacant plot) */}
            {(() => {
              const nextPlot = findNextAvailablePlot(stores)
              const cPos = worldToMap(nextPlot.grid_x, nextPlot.grid_z)
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
                      name: `Plot #${nextPlot.plot_index + 1}`,
                      category: 'New Expansion',
                      revenue: 0,
                      orders: 0,
                      color: '#f59e0b',
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
                    fill={isHovered ? 'rgba(245, 158, 11, 0.6)' : 'rgba(245, 158, 11, 0.35)'}
                    stroke="#ffffff"
                    strokeWidth="2"
                    strokeDasharray="3 2"
                    rx="5"
                  />

                  {/* Pulsing Beacon Ring */}
                  <circle cx={cPos.x} cy={cPos.y} r="5" fill="none" stroke="#ffffff" strokeWidth="2">
                    <animate attributeName="r" from="5" to="15" dur="1.8s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from="1" to="0" dur="1.8s" repeatCount="indefinite" />
                  </circle>

                  {/* Core Amber Pin with White Border */}
                  <circle cx={cPos.x} cy={cPos.y} r="5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
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

                  {/* Building Footprint with White Border */}
                  <rect
                    x={pos.x - 9}
                    y={pos.y - 9}
                    width="18"
                    height="18"
                    fill={isSelected ? '#ffffff' : color}
                    stroke="#ffffff"
                    strokeWidth={isHovered || isSelected ? '3' : '2'}
                    rx="5"
                    className={`drop-shadow-sm transition-all ${isHovered ? 'brightness-125' : ''}`}
                  />

                  {/* Selected Pulse Wave */}
                  {isSelected && (
                    <circle cx={pos.x} cy={pos.y} r="6" fill="none" stroke="#ffffff" strokeWidth="2">
                      <animate attributeName="r" from="6" to="16" dur="1.5s" repeatCount="indefinite" />
                      <animate attributeName="opacity" from="1" to="0" dur="1.5s" repeatCount="indefinite" />
                    </circle>
                  )}

                  {/* Inner Dot */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={isSelected ? 4 : 3}
                    fill={isSelected ? color : '#ffffff'}
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
                fill="rgba(255, 255, 255, 0.35)"
                stroke="#ffffff"
                strokeWidth="1.5"
              />
              {/* Sleek Navigation Pointer with White Fill & Dark Contour */}
              <polygon
                points="0,-8 6,4 0,1 -6,4"
                fill="#ffffff"
                stroke="#0f172a"
                strokeWidth="1.5"
              />
            </g>

            {/* NORTH COMPASS BADGE */}
            <g transform={`translate(${mapSize - 18}, 18)`}>
              <circle cx="0" cy="0" r="9" fill="#ffffff" stroke="#0f172a" strokeWidth="1.5" />
              <text
                x="0"
                y="3.5"
                textAnchor="middle"
                fontSize="9"
                fontWeight="900"
                fill="#ef4444"
                fontFamily="system-ui, sans-serif"
              >
                N
              </text>
            </g>
          </svg>

          {/* HOVER TOOLTIP CARD */}
          {hoveredBlip && (
            <div className="absolute top-2 left-2 right-2 z-20 px-3 py-2 rounded-xl bg-slate-900/95 backdrop-blur-xl border-2 border-white shadow-xl text-left pointer-events-none animate-fadeIn">
              <div className="flex items-center justify-between text-xs font-black text-white">
                <span className="truncate flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 border border-white"
                    style={{ backgroundColor: hoveredBlip.color }}
                  />
                  <span className="truncate">{hoveredBlip.name}</span>
                </span>
                <span className="text-[11px] text-amber-300 font-black shrink-0 ml-1">
                  {hoveredBlip.isConstruct ? 'CONSTRUCT' : `$${(hoveredBlip.revenue / 1000).toFixed(0)}K`}
                </span>
              </div>
              <p className="text-[10px] text-slate-300 font-semibold mt-0.5">
                {hoveredBlip.isConstruct
                  ? 'Click to construct new retail store'
                  : `${hoveredBlip.category} • ${hoveredBlip.orders} Orders • Click to view`}
              </p>
            </div>
          )}
        </div>

        {/* BOTTOM METRICS & DISTRICT INTEL */}
        <div className="relative z-10 mt-3 space-y-2 px-0.5">
          {/* Active District / Store Focus */}
          <div className="flex items-center justify-between text-xs font-black">
            <span className="flex items-center gap-1.5 text-white truncate">
              <Navigation className="w-4 h-4 text-white shrink-0 drop-shadow" />
              <span className="truncate drop-shadow" style={cartoonTextStyle}>
                {selectedStore ? selectedStore.name : 'Metropolis Central'}
              </span>
            </span>

            {/* Store Count Badge */}
            <span
              className="px-2.5 py-0.5 text-xs font-black select-none shrink-0"
              style={{
                background: 'linear-gradient(180deg, #fef08a 0%, #facc15 50%, #d97706 100%)',
                border: '2px solid #ffffff',
                borderRadius: '9999px',
                color: '#0f172a',
                boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
              }}
            >
              {stores.length} Stores
            </span>
          </div>

          {/* Frosted Metric Pills (Matching Game Buttons) */}
          <div className="grid grid-cols-2 gap-2 pt-0.5">
            {/* Revenue Badge */}
            <div
              className="flex items-center gap-2 px-2.5 py-1.5"
              style={{
                background: 'rgba(255, 255, 255, 0.22)',
                border: '2px solid #ffffff',
                borderRadius: '16px',
                backdropFilter: 'blur(8px)',
                boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.4), 0 3px 6px rgba(0, 0, 0, 0.2)',
              }}
            >
              <Coins className="w-4 h-4 text-amber-300 shrink-0 drop-shadow" />
              <div className="truncate">
                <div className="text-[9px] uppercase tracking-wider text-white/90 font-black leading-none drop-shadow">
                  Revenue
                </div>
                <div className="text-xs font-black text-white leading-tight drop-shadow mt-0.5">
                  ${(totalRev / 1000).toFixed(0)}K
                </div>
              </div>
            </div>

            {/* Orders Badge */}
            <div
              className="flex items-center gap-2 px-2.5 py-1.5"
              style={{
                background: 'rgba(255, 255, 255, 0.22)',
                border: '2px solid #ffffff',
                borderRadius: '16px',
                backdropFilter: 'blur(8px)',
                boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.4), 0 3px 6px rgba(0, 0, 0, 0.2)',
              }}
            >
              <ShoppingBag className="w-4 h-4 text-white shrink-0 drop-shadow" />
              <div className="truncate">
                <div className="text-[9px] uppercase tracking-wider text-white/90 font-black leading-none drop-shadow">
                  Orders
                </div>
                <div className="text-xs font-black text-white leading-tight drop-shadow mt-0.5">
                  {totalOrders.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Quick-Travel Tip */}
          <div className="text-center text-[10px] text-white/90 font-bold flex items-center justify-center gap-1 pt-0.5 drop-shadow">
            <Sparkles className="w-3 h-3 text-amber-200 shrink-0" />
            <span>Click any store pin to quick-travel</span>
          </div>
        </div>
      </div>
    </aside>
  )
}

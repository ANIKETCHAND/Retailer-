/**
 * RetailVision - GTA 6 Style GPS Minimap & Radar Guide (Glitch-Free Edition)
 * Highlights:
 *  - High-performance direct DOM/SVG transform tracking (Zero React re-render thrash)
 *  - Native SVG animation elements instead of broken CSS transform keyframes
 *  - Fixed collision hitboxes to prevent hover-scale oscillation loops
 *  - Clamped coordinates to guarantee camera icon stays inside radar boundaries
 *  - Interactive colored store blips, pulsing construction beacon, and quick travel
 */

import React, { useEffect, useRef, useState } from 'react'
import {
  Maximize2,
  Minimize2,
  Navigation,
  Crosshair,
  Info
} from 'lucide-react'
import type { Store } from '../../types'

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
    isConstruct?: boolean
  } | null>(null)

  // Direct ref to the player / camera icon so we can update transform at 60 FPS without re-rendering React!
  const playerMarkerRef = useRef<SVGGElement>(null)

  // Radar dimensions
  const worldRadius = isExpanded ? 32 : 20
  const mapSize = isExpanded ? 360 : 220
  const center = mapSize / 2
  const scale = (mapSize * 0.42) / worldRadius

  const worldToMap = (wx: number, wz: number) => {
    const mx = center + wx * scale
    const my = center + wz * scale
    return { x: mx, y: my }
  }

  // Listen to camera movements directly via CustomEvent to avoid re-rendering root App
  useEffect(() => {
    const handleCamUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ cx: number; cz: number; tx: number; tz: number; heading: number }>
      if (!customEvent.detail || !playerMarkerRef.current) return

      const { cx, cz, heading } = customEvent.detail

      // Convert camera coordinates to map coordinates
      const camPos = worldToMap(cx, cz)

      // Clamp camera position within radar boundary (margin of 14px)
      const maxR = center - 14
      const dx = camPos.x - center
      const dy = camPos.y - center
      const dist = Math.sqrt(dx * dx + dy * dy)

      const clampedX = dist > maxR ? center + (dx / dist) * maxR : camPos.x
      const clampedY = dist > maxR ? center + (dy / dist) * maxR : camPos.y

      // Calculate heading angle in degrees (pointing towards target)
      const headingDeg = (heading * 180) / Math.PI

      // Update SVG transform directly (buttery smooth 60 FPS, zero React re-renders)
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

  // Get category icon symbol
  const getCatSymbol = (cat: string) => {
    switch (cat) {
      case 'Electronics': return '💻'
      case 'Grocery': return '🛒'
      case 'Clothing': return '👗'
      case 'Furniture': return '🪑'
      case 'Accessories': return '💎'
      default: return '🏬'
    }
  }

  // Calculate city metrics
  const totalRev = stores.reduce((acc, s) => acc + (s.total_revenue || 0), 0)
  const totalOrders = stores.reduce((acc, s) => acc + (s.total_orders || 0), 0)

  return (
    <aside
      className={`fixed z-40 transition-all duration-300 select-none ${
        isExpanded
          ? 'bottom-8 left-8 w-[380px]'
          : 'bottom-6 left-6 w-[236px] sm:w-[246px]'
      }`}
      aria-label="GTA 6 Minimap Navigation Radar"
    >
      {/* TACTICAL RADAR CONTAINER */}
      <div className="relative rounded-3xl bg-slate-950/92 backdrop-blur-2xl border-2 border-slate-700/80 shadow-2xl shadow-black/90 overflow-hidden p-2.5">
        {/* Subtle Cyberpunk Radar Bezel & Scanlines */}
        <div className="absolute inset-0 pointer-events-none rounded-3xl bg-gradient-to-b from-sky-500/5 via-transparent to-black/40" />

        {/* TOP STATUS HEADER */}
        <div className="relative z-10 flex items-center justify-between mb-1.5 px-1 text-[10px] font-mono tracking-wider text-slate-300">
          <div className="flex items-center gap-1.5 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-white">GPS // METROPOLIS</span>
          </div>

          <div className="flex items-center gap-1">
            {/* Quick Reset Camera Icon */}
            <button
              onClick={onResetCamera}
              className="p-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Center Map / Overview"
            >
              <Crosshair className="w-3 h-3 text-sky-400" />
            </button>
            {/* Expand / Minimize Minimap */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title={isExpanded ? 'Minimize Radar' : 'Expand Radar'}
            >
              {isExpanded ? (
                <Minimize2 className="w-3 h-3 text-amber-400" />
              ) : (
                <Maximize2 className="w-3 h-3 text-amber-400" />
              )}
            </button>
          </div>
        </div>

        {/* RADAR MAP SURFACE (Vector Top-Down View) */}
        <div
          className="relative rounded-2xl bg-slate-900 border border-slate-800/90 overflow-hidden shadow-inner cursor-crosshair"
          style={{ width: `${mapSize}px`, height: `${mapSize}px` }}
        >
          {/* Subtle Radar Radial Gradient */}
          <div className="absolute inset-0 pointer-events-none rounded-2xl opacity-25 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-sky-500/30 via-slate-900/10 to-transparent" />

          {/* SVG MAP GRAPHICS */}
          <svg
            width={mapSize}
            height={mapSize}
            className="absolute inset-0 pointer-events-auto"
          >
            <defs>
              {/* Tactical Radar Grid */}
              <pattern id="gtaGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.8" />
              </pattern>
            </defs>

            {/* Tactical Grid Background */}
            <rect width={mapSize} height={mapSize} fill="#090e17" />
            <rect width={mapSize} height={mapSize} fill="url(#gtaGrid)" />

            {/* Concentric Distance Radar Rings */}
            {[0.32, 0.64, 0.94].map((fraction, i) => (
              <circle
                key={`ring-${i}`}
                cx={center}
                cy={center}
                r={(mapSize / 2) * fraction}
                fill="none"
                stroke="rgba(56, 189, 248, 0.12)"
                strokeWidth="1"
                strokeDasharray="3 3"
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
                    fill="#0891b2"
                    opacity="0.8"
                  />
                  {/* Road Bridge at center */}
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

            {/* RAILWAY TRACK (z = -14.5) */}
            {(() => {
              const railY = worldToMap(0, -14.5).y
              return (
                <line
                  x1="0"
                  y1={railY}
                  x2={mapSize}
                  y2={railY}
                  stroke="#475569"
                  strokeWidth="2.5"
                  strokeDasharray="4 3"
                />
              )
            })()}

            {/* ROADS & HIGHWAYS */}
            {/* Main East-West Highway (z = 0) */}
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
              stroke="#f8fafc"
              strokeWidth="1.2"
              strokeDasharray="5 4"
              opacity="0.8"
            />

            {/* Main North-South Boulevard (x = 0) */}
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
              stroke="#f8fafc"
              strokeWidth="1.2"
              strokeDasharray="5 4"
              opacity="0.8"
            />

            {/* Central Intersection Crossing */}
            <rect
              x={center - 6}
              y={center - 6}
              width="12"
              height="12"
              fill="#334155"
            />

            {/* CONSTRUCT PLOT RADAR BLIP (x = 13.0, z = -6.0) */}
            {(() => {
              const cPos = worldToMap(13.0, -6.0)
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
                      category: 'Expansion Parcel',
                      revenue: 0,
                      orders: 0,
                      isConstruct: true
                    })
                  }
                  onMouseLeave={() => setHoveredBlip(null)}
                >
                  {/* Stable Transparent Hit Target */}
                  <circle cx={cPos.x} cy={cPos.y} r="14" fill="transparent" />

                  {/* Parcel Footprint */}
                  <rect
                    x={cPos.x - 9}
                    y={cPos.y - 9}
                    width="18"
                    height="18"
                    fill={isHovered ? 'rgba(249, 115, 22, 0.35)' : 'rgba(249, 115, 22, 0.18)'}
                    stroke="#ea580c"
                    strokeWidth={isHovered ? '2' : '1.2'}
                    strokeDasharray="3 2"
                    rx="3"
                  />

                  {/* Native SVG Pulsing Ring (Zero CSS keyframe offset glitch) */}
                  <circle cx={cPos.x} cy={cPos.y} r="6" fill="none" stroke="#f97316" strokeWidth="1.5">
                    <animate attributeName="r" from="6" to="14" dur="1.8s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from="0.9" to="0" dur="1.8s" repeatCount="indefinite" />
                  </circle>

                  {/* Core Dot */}
                  <circle cx={cPos.x} cy={cPos.y} r="4" fill="#f97316" />
                </g>
              )
            })()}

            {/* STORE RADAR BLIPS */}
            {stores.map((s) => {
              const pos = worldToMap(s.grid_x, s.grid_z)
              const isSelected = selectedStore?.id === s.id
              const isHovered = hoveredBlip?.id === s.id
              const blipColor = s.color || '#3b82f6'

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
                      orders: s.total_orders || 0
                    })
                  }
                  onMouseLeave={() => setHoveredBlip(null)}
                >
                  {/* Stable Transparent Hit Target */}
                  <circle cx={pos.x} cy={pos.y} r="14" fill="transparent" />

                  {/* Building Parcel Footprint */}
                  <rect
                    x={pos.x - 9}
                    y={pos.y - 9}
                    width="18"
                    height="18"
                    fill={
                      isSelected
                        ? 'rgba(56, 189, 248, 0.4)'
                        : isHovered
                        ? 'rgba(56, 189, 248, 0.25)'
                        : 'rgba(30, 41, 59, 0.85)'
                    }
                    stroke={isSelected || isHovered ? '#38bdf8' : blipColor}
                    strokeWidth={isSelected || isHovered ? '2' : '1.2'}
                    rx="3"
                  />

                  {/* Native SVG Pulsing Ring when Selected */}
                  {isSelected && (
                    <circle cx={pos.x} cy={pos.y} r="5" fill="none" stroke="#38bdf8" strokeWidth="1.5">
                      <animate attributeName="r" from="5" to="15" dur="1.5s" repeatCount="indefinite" />
                      <animate attributeName="opacity" from="1" to="0" dur="1.5s" repeatCount="indefinite" />
                    </circle>
                  )}

                  {/* Core Radar Blip */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={isSelected || isHovered ? 4.5 : 3.5}
                    fill={blipColor}
                  />
                </g>
              )
            })}

            {/* CAMERA / PLAYER VISION CONE (FOV) */}
            <g
              ref={playerMarkerRef}
              transform={`translate(${center}, ${center}) rotate(45)`}
            >
              {/* Vision Cone Wedge */}
              <path
                d="M 0 0 L -18 -36 A 38 38 0 0 1 18 -36 Z"
                fill="rgba(56, 189, 248, 0.25)"
                stroke="rgba(56, 189, 248, 0.6)"
                strokeWidth="1"
              />
              {/* Player Icon Diamond */}
              <polygon
                points="0,-6 5,4 0,2 -5,4"
                fill="#ffffff"
                stroke="#0284c7"
                strokeWidth="1.2"
              />
            </g>

            {/* NORTH COMPASS INDICATOR (Always at Top Right) */}
            <g transform={`translate(${mapSize - 16}, 16)`}>
              <circle cx="0" cy="0" r="9" fill="#0f172a" stroke="#475569" strokeWidth="1" />
              <text
                x="0"
                y="3.5"
                textAnchor="middle"
                fontSize="9"
                fontWeight="black"
                fill="#f43f5e"
                fontFamily="sans-serif"
              >
                N
              </text>
            </g>
          </svg>

          {/* HOVER TOOLTIP POPUP (GTA Tactical Target Lock) */}
          {hoveredBlip && (
            <div className="absolute top-2 left-2 right-2 z-20 px-2.5 py-1.5 rounded-xl bg-slate-950/95 backdrop-blur-xl border border-sky-500/50 shadow-2xl text-left pointer-events-none">
              <div className="flex items-center justify-between text-[11px] font-bold text-white">
                <span className="truncate flex items-center gap-1">
                  <span>{hoveredBlip.isConstruct ? '🔨' : getCatSymbol(hoveredBlip.category)}</span>
                  <span className="text-sky-300 truncate">{hoveredBlip.name}</span>
                </span>
                <span className="text-[10px] text-amber-400 font-mono">
                  {hoveredBlip.isConstruct ? 'BUILD' : `$${hoveredBlip.revenue.toLocaleString()}`}
                </span>
              </div>
              <p className="text-[9px] text-slate-400 font-medium">
                {hoveredBlip.isConstruct
                  ? 'Click to construct new retail store'
                  : `${hoveredBlip.category} • ${hoveredBlip.orders} Orders • Click to jump`}
              </p>
            </div>
          )}
        </div>

        {/* BOTTOM VITALS METERS (GTA VI Style Status HUD) */}
        <div className="mt-2 space-y-1.5 px-0.5 font-mono text-[9px]">
          {/* Street / District Name */}
          <div className="flex items-center justify-between text-slate-300 font-bold uppercase tracking-wider text-[10px]">
            <span className="flex items-center gap-1 truncate">
              <Navigation className="w-3 h-3 text-sky-400" />
              <span className="truncate">
                {selectedStore ? selectedStore.name : 'Central Marketplace'}
              </span>
            </span>
            <span className="text-emerald-400 font-black">
              {stores.length} STORES
            </span>
          </div>

          {/* Health / Stability Bar (Green) */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 w-12 text-right font-semibold">HEALTH</span>
            <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden border border-slate-700">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-green-400 w-[96%]" />
            </div>
            <span className="text-emerald-400 font-bold text-[8px]">98%</span>
          </div>

          {/* Revenue Capital Bar (Cyan) */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 w-12 text-right font-semibold">CAPITAL</span>
            <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden border border-slate-700">
              <div className="h-full bg-gradient-to-r from-sky-500 to-cyan-400 w-[84%]" />
            </div>
            <span className="text-sky-300 font-bold text-[8px] truncate">
              ${(totalRev / 1000).toFixed(0)}K
            </span>
          </div>

          {/* Orders Volume Bar (Amber) */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 w-12 text-right font-semibold">ORDERS</span>
            <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden border border-slate-700">
              <div className="h-full bg-gradient-to-r from-amber-500 to-orange-400 w-[78%]" />
            </div>
            <span className="text-amber-300 font-bold text-[8px] truncate">
              {totalOrders.toLocaleString()}
            </span>
          </div>

          {/* Quick Click-to-Travel Notice */}
          <div className="pt-1 text-center text-[8.5px] text-slate-400 flex items-center justify-center gap-1">
            <Info className="w-2.5 h-2.5 text-sky-400" />
            <span>Click any radar blip to quick-travel</span>
          </div>
        </div>
      </div>
    </aside>
  )
}

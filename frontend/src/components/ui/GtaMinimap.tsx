/**
 * RetailVision - GTA 6 Style GPS Minimap & Radar Guide
 * Replaces traditional dropdowns with an immersive in-game tactical radar HUD:
 *  - Real-time top-down 2D vector map of roads, canal, railway, and parcels
 *  - Interactive colored store blips with radar pulse animations
 *  - Construction zone beacon with quick-travel & build trigger
 *  - Real-time camera position marker with dynamic vision cone (FOV)
 *  - GTA VI inspired vitals meters (Market Health, City Capital, Store Capacity)
 *  - Expandable modal view for full-city tactical inspection
 */

import React, { useState } from 'react'
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
  cameraState?: { x: number; z: number; heading: number }
}

export const GtaMinimap: React.FC<GtaMinimapProps> = ({
  stores,
  selectedStore,
  onSelectStore,
  onOpenConstruct,
  onResetCamera,
  cameraState = { x: 18, z: 20, heading: 0.8 }
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

  // Map coordinate conversion: 3D world coords -> Minimap SVG space
  // Central retail district ranges roughly [-25, 25] in world space
  const worldRadius = isExpanded ? 36 : 22
  const mapSize = isExpanded ? 380 : 220
  const center = mapSize / 2
  const scale = (mapSize * 0.44) / worldRadius

  const worldToMap = (wx: number, wz: number) => {
    // wx: East (+), West (-) -> mapX
    // wz: South (+), North (-) -> mapY
    const mx = center + wx * scale
    const my = center + wz * scale
    return { x: mx, y: my }
  }

  // Camera marker position in map space
  const camMapPos = worldToMap(cameraState.x, cameraState.z)
  // Camera heading angle in degrees (rotated so 0 deg points North)
  const headingDeg = (cameraState.heading * 180) / Math.PI

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
          ? 'bottom-8 left-8 w-[400px]'
          : 'bottom-6 left-6 w-[236px] sm:w-[250px]'
      }`}
      aria-label="GTA 6 Minimap Navigation Radar"
    >
      {/* GTA 6 TACTICAL RADAR CONTAINER */}
      <div className="relative rounded-3xl bg-slate-950/90 backdrop-blur-2xl border-2 border-slate-700/80 shadow-2xl shadow-black/90 overflow-hidden p-2.5 sm:p-3">
        {/* Subtle Cyberpunk Radar Bezel & Scanlines */}
        <div className="absolute inset-0 pointer-events-none rounded-3xl bg-gradient-to-b from-sky-500/5 via-transparent to-black/40" />

        {/* TOP STATUS HEADER */}
        <div className="relative z-10 flex items-center justify-between mb-1.5 px-1 text-[10px] font-mono tracking-wider text-slate-300">
          <div className="flex items-center gap-1.5 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
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
          {/* Circular Radar Scan Sweep Effect */}
          <div className="absolute inset-0 pointer-events-none rounded-2xl opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-sky-400/30 via-slate-900/10 to-transparent" />

          {/* SVG MAP GRAPHICS */}
          <svg
            width={mapSize}
            height={mapSize}
            className="absolute inset-0 pointer-events-auto"
          >
            <defs>
              {/* Radar Grid Pattern */}
              <pattern id="radarGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.8" />
              </pattern>
            </defs>

            {/* Tactical Grid Background */}
            <rect width={mapSize} height={mapSize} fill="#0b1120" />
            <rect width={mapSize} height={mapSize} fill="url(#radarGrid)" />

            {/* Concentric Distance Radar Rings */}
            {[0.3, 0.6, 0.9].map((fraction, i) => (
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
                    opacity="0.85"
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
                  stroke="#64748b"
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
              return (
                <g
                  className="cursor-pointer group"
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
                  {/* Construction Area Footprint */}
                  <rect
                    x={cPos.x - 10}
                    y={cPos.y - 10}
                    width="20"
                    height="20"
                    fill="rgba(249, 115, 22, 0.18)"
                    stroke="#ea580c"
                    strokeWidth="1.2"
                    strokeDasharray="3 2"
                    rx="3"
                  />
                  {/* Pulsing Hazard Beacon Ring */}
                  <circle
                    cx={cPos.x}
                    cy={cPos.y}
                    r="8"
                    fill="none"
                    stroke="#f97316"
                    strokeWidth="1.5"
                    className="animate-ping"
                    opacity="0.75"
                  />
                  <circle cx={cPos.x} cy={cPos.y} r="5" fill="#f97316" />
                </g>
              )
            })()}

            {/* STORE RADAR BLIPS */}
            {stores.map((s) => {
              const pos = worldToMap(s.grid_x, s.grid_z)
              const isSelected = selectedStore?.id === s.id
              const blipColor = s.color || '#3b82f6'

              return (
                <g
                  key={s.id}
                  className="cursor-pointer transition-transform hover:scale-125"
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
                  {/* Building Parcel Footprint */}
                  <rect
                    x={pos.x - 9}
                    y={pos.y - 9}
                    width="18"
                    height="18"
                    fill={isSelected ? 'rgba(56, 189, 248, 0.35)' : 'rgba(30, 41, 59, 0.8)'}
                    stroke={isSelected ? '#38bdf8' : blipColor}
                    strokeWidth={isSelected ? '2' : '1.2'}
                    rx="3"
                  />

                  {/* Pulsing Selection Ring */}
                  {isSelected && (
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r="12"
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="1.5"
                      className="animate-ping"
                    />
                  )}

                  {/* Core Radar Blip */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={isSelected ? 4.5 : 3.5}
                    fill={blipColor}
                  />
                </g>
              )
            })}

            {/* CAMERA / PLAYER VISION CONE (FOV) */}
            <g transform={`translate(${camMapPos.x}, ${camMapPos.y}) rotate(${headingDeg})`}>
              {/* Vision Cone Wedge */}
              <path
                d="M 0 0 L -22 -44 A 48 48 0 0 1 22 -44 Z"
                fill="rgba(56, 189, 248, 0.2)"
                stroke="rgba(56, 189, 248, 0.5)"
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

            {/* NORTH COMPASS INDICATOR (Always at Top) */}
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
            <div className="absolute top-2 left-2 right-2 z-20 px-2.5 py-1.5 rounded-xl bg-slate-950/95 backdrop-blur-xl border border-sky-500/40 shadow-xl text-left pointer-events-none">
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

/**
 * RetailVision - Minimalist Game-Styled City Radar
 * Features:
 *  - Matches the skyblue gradient and 3.5px solid white border of the action buttons
 *  - Header keeps ONLY "City Radar" title
 *  - All extra metrics, labels, and bottom text clutter completely removed
 *  - Clean, crisp casual-game map cartography with interactive store pins
 */

import React, { useEffect, useRef, useState } from 'react'
import type { Store } from '../../types'
import { findNextAvailablePlot } from '../../api/client'
import { cartoonTextStyle } from './GamePillButtons'

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
  const [hoveredBlipId, setHoveredBlipId] = useState<string | null>(null)

  // Direct ref to the camera orientation cone (buttery-smooth 60 FPS tracking)
  const playerMarkerRef = useRef<SVGGElement>(null)

  // Radar dimensions: compact and clean
  const worldRadius = isExpanded ? 32 : 20
  const mapSize = isExpanded ? 300 : 200
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

  return (
    <aside
      className="fixed bottom-6 left-6 z-30 select-none pointer-events-auto"
      aria-label="City Radar"
    >
      {/* ======================================================== */}
      {/* GAME-STYLED RADAR CARD: SKYBLUE GRADIENT & 3.5px BORDER  */}
      {/* Clean rounded-3xl container without 9999px oval stretch   */}
      {/* ======================================================== */}
      <div
        className="relative overflow-hidden p-3 transition-all duration-300"
        style={{
          background: 'linear-gradient(180deg, #38bdf8 0%, #0ea5e9 35%, #0284c7 75%, #0369a1 100%)',
          border: '3.5px solid #ffffff',
          borderRadius: '24px',
          boxShadow: '0 12px 35px rgba(2, 132, 199, 0.65), inset 0 2px 4px rgba(255, 255, 255, 0.75)',
        }}
      >
        {/* Top Curved Glass Reflection Shine */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '40%',
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0) 100%)',
            borderTopLeftRadius: '20px',
            borderTopRightRadius: '20px',
            pointerEvents: 'none',
          }}
        />

        {/* HEADER: KEEPS ONLY "City Radar" TITLE */}
        <div className="relative z-10 flex items-center justify-between mb-2 px-1">
          <span
            className="text-base sm:text-lg font-black text-white tracking-wide select-none cursor-pointer"
            style={cartoonTextStyle}
            onClick={onResetCamera}
            title="City Radar (Click to reset overview)"
          >
            City Radar
          </span>

          {/* Toggle Expand / Reset */}
          <button
            type="button"
            onClick={() => setIsExpanded(prev => !prev)}
            className="w-5 h-5 rounded-full bg-white/25 hover:bg-white/40 border border-white text-white text-[10px] font-black flex items-center justify-center shadow-sm cursor-pointer transition-transform active:scale-90"
            title={isExpanded ? 'Minimize' : 'Expand'}
          >
            {isExpanded ? '−' : '+'}
          </button>
        </div>

        {/* MAP CANVAS VIEWPORT */}
        <div
          className="relative overflow-hidden shadow-inner cursor-crosshair border-[2.5px] border-white"
          style={{
            width: `${mapSize}px`,
            height: `${mapSize}px`,
            borderRadius: '16px',
            background: '#0284c7', // Tropical Ocean
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
              <pattern id="radarGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8" />
              </pattern>
              {/* Landmass Green Gradient */}
              <linearGradient id="radarIslandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4ade80" />
                <stop offset="50%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#16a34a" />
              </linearGradient>
            </defs>

            {/* Ocean & Grid */}
            <rect width={mapSize} height={mapSize} fill="#0284c7" />
            <rect width={mapSize} height={mapSize} fill="url(#radarGrid)" />

            {/* Tropical Island Landmass */}
            <rect
              x={center - (mapSize * 0.44)}
              y={center - (mapSize * 0.44)}
              width={mapSize * 0.88}
              height={mapSize * 0.88}
              rx={18}
              fill="url(#radarIslandGrad)"
              stroke="#ffffff"
              strokeWidth="2"
            />

            {/* Golden Beach Sand in South */}
            <rect
              x={center - (mapSize * 0.44)}
              y={center + (mapSize * 0.28)}
              width={mapSize * 0.88}
              height={mapSize * 0.15}
              rx={12}
              fill="#fde047"
              stroke="#facc15"
              strokeWidth="1.2"
            />

            {/* Pier in West */}
            <rect
              x={center - (mapSize * 0.48)}
              y={center - 7}
              width={mapSize * 0.12}
              height={14}
              rx={3}
              fill="#b45309"
              stroke="#ffffff"
              strokeWidth="1.2"
            />

            {/* Concentric Guide Rings */}
            {[0.32, 0.64, 0.94].map((fraction, i) => (
              <circle
                key={`ring-${i}`}
                cx={center}
                cy={center}
                r={worldRadius * scale * fraction}
                fill="none"
                stroke="rgba(255, 255, 255, 0.25)"
                strokeWidth="0.9"
                strokeDasharray="4 3"
              />
            ))}

            {/* WATER CANAL (North Shore) */}
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
                  <rect
                    x={center - 6}
                    y={canalY - 5}
                    width="12"
                    height="10"
                    fill="#334155"
                    stroke="#ffffff"
                    strokeWidth="1"
                    rx={2}
                  />
                </g>
              )
            })()}

            {/* ROADS */}
            {/* East-West Boulevard */}
            <rect
              x="0"
              y={center - 5}
              width={mapSize}
              height="10"
              fill="#334155"
              stroke="#1e293b"
              strokeWidth="0.8"
            />
            <line
              x1="0"
              y1={center}
              x2={mapSize}
              y2={center}
              stroke="#ffffff"
              strokeWidth="1"
              strokeDasharray="4 3"
            />

            {/* North-South Avenue */}
            <rect
              x={center - 5}
              y="0"
              width="10"
              height={mapSize}
              fill="#334155"
              stroke="#1e293b"
              strokeWidth="0.8"
            />
            <line
              x1={center}
              y1="0"
              x2={center}
              y2={mapSize}
              stroke="#ffffff"
              strokeWidth="1"
              strokeDasharray="4 3"
            />

            {/* Central Crossing */}
            <rect
              x={center - 5}
              y={center - 5}
              width="10"
              height="10"
              fill="#475569"
              stroke="#ffffff"
              strokeWidth="0.8"
            />

            {/* NEXT CONSTRUCT PLOT BEACON */}
            {(() => {
              const nextPlot = findNextAvailablePlot(stores)
              const cPos = worldToMap(nextPlot.grid_x, nextPlot.grid_z)

              return (
                <g
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation()
                    onOpenConstruct()
                  }}
                  onMouseEnter={() => setHoveredBlipId('construct')}
                  onMouseLeave={() => setHoveredBlipId(null)}
                >
                  <circle cx={cPos.x} cy={cPos.y} r="12" fill="transparent" />

                  {/* Parcel Footprint */}
                  <rect
                    x={cPos.x - 8}
                    y={cPos.y - 8}
                    width="16"
                    height="16"
                    fill="rgba(245, 158, 11, 0.4)"
                    stroke="#ffffff"
                    strokeWidth="1.8"
                    strokeDasharray="3 2"
                    rx="4"
                  />

                  {/* Pulsing Beacon Ring */}
                  <circle cx={cPos.x} cy={cPos.y} r="4" fill="none" stroke="#ffffff" strokeWidth="1.8">
                    <animate attributeName="r" from="4" to="14" dur="1.8s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from="1" to="0" dur="1.8s" repeatCount="indefinite" />
                  </circle>

                  {/* Amber Dot */}
                  <circle cx={cPos.x} cy={cPos.y} r="4" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.2" />
                </g>
              )
            })()}

            {/* STORE PINS */}
            {stores.map((s) => {
              const pos = worldToMap(s.grid_x, s.grid_z)
              const isSelected = selectedStore?.id === s.id
              const isHovered = hoveredBlipId === s.id
              const color = s.color || '#3b82f6'

              return (
                <g
                  key={s.id}
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation()
                    onSelectStore(s)
                  }}
                  onMouseEnter={() => setHoveredBlipId(s.id)}
                  onMouseLeave={() => setHoveredBlipId(null)}
                >
                  {/* Invisible Hit Area */}
                  <circle cx={pos.x} cy={pos.y} r="12" fill="transparent" />

                  {/* Building Marker with White Border */}
                  <rect
                    x={pos.x - 8}
                    y={pos.y - 8}
                    width="16"
                    height="16"
                    fill={isSelected ? '#ffffff' : color}
                    stroke="#ffffff"
                    strokeWidth={isSelected || isHovered ? '2.5' : '1.8'}
                    rx="4"
                    className="drop-shadow-sm"
                  />

                  {/* Selected Pulse Ring */}
                  {isSelected && (
                    <circle cx={pos.x} cy={pos.y} r="5" fill="none" stroke="#ffffff" strokeWidth="2">
                      <animate attributeName="r" from="5" to="15" dur="1.5s" repeatCount="indefinite" />
                      <animate attributeName="opacity" from="1" to="0" dur="1.5s" repeatCount="indefinite" />
                    </circle>
                  )}

                  {/* Core Inner Dot */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={isSelected ? 3.5 : 2.5}
                    fill={isSelected ? color : '#ffffff'}
                  />
                </g>
              )
            })}

            {/* CAMERA FOV CONE */}
            <g
              ref={playerMarkerRef}
              transform={`translate(${center}, ${center}) rotate(45)`}
            >
              <path
                d="M 0 0 L -14 -30 A 32 32 0 0 1 14 -30 Z"
                fill="rgba(255, 255, 255, 0.35)"
                stroke="#ffffff"
                strokeWidth="1.2"
              />
              <polygon
                points="0,-7 5,3 0,1 -5,3"
                fill="#ffffff"
                stroke="#0f172a"
                strokeWidth="1.2"
              />
            </g>

            {/* COMPASS 'N' BADGE */}
            <g transform={`translate(${mapSize - 16}, 16)`}>
              <circle cx="0" cy="0" r="8" fill="#ffffff" stroke="#0f172a" strokeWidth="1.2" />
              <text
                x="0"
                y="3"
                textAnchor="middle"
                fontSize="8"
                fontWeight="900"
                fill="#ef4444"
                fontFamily="system-ui, sans-serif"
              >
                N
              </text>
            </g>
          </svg>
        </div>
      </div>
    </aside>
  )
}

/**
 * GamePillButtons - AAA Casual Game Style Action Pills
 * Matches the visual design of the city-builder reference UI:
 *  - Elongated capsule pill with rounded-full geometry
 *  - Crisp 3.5px solid white border
 *  - Saturated skyblue glossy gradient matching reference image (#38bdf8 -> #0ea5e9 -> #0284c7 -> #0369a1)
 *  - Upper-half glass reflection shine
 *  - 3D cartoon safety hard hat helmet & retail storefront icons with bold black outlines
 *  - Chunky cartoon white typography with dark outline sticker effect and drop shadow
 */

import React from 'react'

// Reusable inline style object guaranteeing skyblue gradient and solid white border
export const skyBluePillStyle: React.CSSProperties = {
  background: 'linear-gradient(180deg, #38bdf8 0%, #0ea5e9 40%, #0284c7 75%, #0369a1 100%)',
  border: '3.5px solid #ffffff',
  borderRadius: '9999px',
  boxShadow: '0 8px 25px rgba(2, 132, 199, 0.65), inset 0 2px 4px rgba(255, 255, 255, 0.75)',
  color: '#ffffff',
}

export const pillShineStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  height: '50%',
  background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0) 100%)',
  borderTopLeftRadius: '9999px',
  borderTopRightRadius: '9999px',
  pointerEvents: 'none',
}

export const pillBadgeStyle: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.3)',
  border: '1.5px solid #ffffff',
  borderRadius: '9999px',
  color: '#ffffff',
  boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.4), 0 2px 4px rgba(0, 0, 0, 0.25)',
  textShadow: '0 1px 2px rgba(0, 0, 0, 0.6)',
}

export const cartoonTextStyle: React.CSSProperties = {
  WebkitTextStroke: '1.5px #0f172a',
  paintOrder: 'stroke fill',
  textShadow:
    '-2px -2px 0 #0f172a, 2px -2px 0 #0f172a, -2px 2px 0 #0f172a, 2px 2px 0 #0f172a, 0 3px 0 #020617, 0 5px 8px rgba(0,0,0,0.65)',
}

interface GamePillButtonsProps {
  storeCount: number
  onExplore: () => void
  onBuild: () => void
}

/**
 * 3D Cartoon Yellow Construction Hard Hat Icon (Matches User Reference Image)
 */
export const HardHatGameIcon: React.FC<{ className?: string }> = ({ className = 'w-9 h-9' }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`drop-shadow-[0_3px_5px_rgba(0,0,0,0.5)] select-none pointer-events-none flex-shrink-0 ${className}`}
  >
    <defs>
      <linearGradient id="hardhatDomeGrad" x1="20%" y1="0%" x2="80%" y2="100%">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="35%" stopColor="#facc15" />
        <stop offset="85%" stopColor="#eab308" />
        <stop offset="100%" stopColor="#ca8a04" />
      </linearGradient>
      <linearGradient id="hardhatBrimGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#fde047" />
        <stop offset="50%" stopColor="#eab308" />
        <stop offset="100%" stopColor="#a16207" />
      </linearGradient>
    </defs>

    {/* Under helmet shadow */}
    <ellipse cx="50" cy="76" rx="36" ry="7" fill="#000000" fillOpacity="0.35" />

    {/* Main Yellow Dome with Crisp Dark Contour */}
    <path
      d="M22 62 C22 34 32 18 50 18 C68 18 78 34 78 62 Z"
      fill="url(#hardhatDomeGrad)"
      stroke="#111827"
      strokeWidth="5"
      strokeLinejoin="round"
    />

    {/* Center Structural Ridges */}
    <path
      d="M50 18 C50 32 50 46 50 60"
      stroke="#b45309"
      strokeWidth="3.5"
      strokeLinecap="round"
    />
    <path
      d="M44 20 C42 34 38 47 36 60"
      stroke="#ca8a04"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <path
      d="M56 20 C58 34 62 47 64 60"
      stroke="#ca8a04"
      strokeWidth="3"
      strokeLinecap="round"
    />

    {/* Glossy Top-Left Reflection */}
    <path
      d="M31 29 C35 22 42 20 49 20"
      stroke="#ffffff"
      strokeWidth="4.5"
      strokeLinecap="round"
      opacity="0.9"
    />
    <circle cx="33" cy="37" r="3" fill="#ffffff" opacity="0.85" />

    {/* Wide Helmet Protective Brim */}
    <path
      d="M12 65 C15 57 32 59 50 59 C68 59 85 57 88 65 C90 71 82 74 50 74 C18 74 10 71 12 65 Z"
      fill="url(#hardhatBrimGrad)"
      stroke="#111827"
      strokeWidth="4.5"
      strokeLinejoin="round"
    />

    {/* Side Tab Detail */}
    <circle cx="76" cy="62" r="4" fill="#facc15" stroke="#111827" strokeWidth="2.5" />
  </svg>
)

/**
 * 3D Cartoon Storefront Icon (Matches Game-Pill Theme)
 */
export const StorefrontGameIcon: React.FC<{ className?: string }> = ({ className = 'w-9 h-9' }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`drop-shadow-[0_3px_5px_rgba(0,0,0,0.5)] select-none pointer-events-none flex-shrink-0 ${className}`}
  >
    <defs>
      <linearGradient id="storeWallGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="100%" stopColor="#cbd5e1" />
      </linearGradient>
      <linearGradient id="storeAwningRed" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#f87171" />
        <stop offset="100%" stopColor="#dc2626" />
      </linearGradient>
      <linearGradient id="storeAwningWhite" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="100%" stopColor="#e2e8f0" />
      </linearGradient>
      <linearGradient id="storeGlass" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#7dd3fc" />
        <stop offset="100%" stopColor="#0284c7" />
      </linearGradient>
    </defs>

    {/* Under shadow */}
    <ellipse cx="50" cy="78" rx="36" ry="6" fill="#000000" fillOpacity="0.35" />

    {/* Shop Building Base */}
    <rect
      x="20"
      y="36"
      width="60"
      height="40"
      rx="6"
      fill="url(#storeWallGrad)"
      stroke="#111827"
      strokeWidth="4.5"
    />

    {/* Window with reflection */}
    <rect
      x="26"
      y="48"
      width="22"
      height="20"
      rx="3"
      fill="url(#storeGlass)"
      stroke="#111827"
      strokeWidth="3"
    />
    <path d="M29 51 L41 63" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />

    {/* Door */}
    <rect
      x="53"
      y="46"
      width="20"
      height="30"
      rx="3"
      fill="#0284c7"
      stroke="#111827"
      strokeWidth="3"
    />
    <circle cx="57" cy="61" r="2.2" fill="#facc15" stroke="#111827" strokeWidth="1.5" />

    {/* Striped Canopy / Awning */}
    <g stroke="#111827" strokeWidth="4" strokeLinejoin="round">
      <path d="M16 38 L22 23 L31 23 L28 38 Z" fill="url(#storeAwningRed)" />
      <path d="M28 38 L31 23 L40 23 L38 38 Z" fill="url(#storeAwningWhite)" />
      <path d="M38 38 L40 23 L50 23 L50 38 Z" fill="url(#storeAwningRed)" />
      <path d="M50 38 L50 23 L60 23 L62 38 Z" fill="url(#storeAwningWhite)" />
      <path d="M62 38 L60 23 L69 23 L72 38 Z" fill="url(#storeAwningRed)" />
      <path d="M72 38 L69 23 L78 23 L84 38 Z" fill="url(#storeAwningWhite)" />
    </g>

    {/* Store Signboard on Roof */}
    <rect
      x="36"
      y="14"
      width="28"
      height="12"
      rx="3"
      fill="#facc15"
      stroke="#111827"
      strokeWidth="3.5"
    />
    <circle cx="50" cy="20" r="3" fill="#dc2626" />
  </svg>
)

/**
 * 3D Cartoon Metropolis Skyline Icon for City View Mode
 */
export const CityViewGameIcon: React.FC<{ className?: string }> = ({ className = 'w-9 h-9' }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`drop-shadow-[0_3px_5px_rgba(0,0,0,0.5)] select-none pointer-events-none flex-shrink-0 ${className}`}
  >
    <defs>
      <linearGradient id="towerGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#38bdf8" />
        <stop offset="100%" stopColor="#0369a1" />
      </linearGradient>
      <linearGradient id="towerGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#facc15" />
        <stop offset="100%" stopColor="#d97706" />
      </linearGradient>
      <linearGradient id="towerGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#60a5fa" />
        <stop offset="100%" stopColor="#1d4ed8" />
      </linearGradient>
      <linearGradient id="sunGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="100%" stopColor="#f59e0b" />
      </linearGradient>
    </defs>

    {/* Shadow */}
    <ellipse cx="50" cy="80" rx="36" ry="6" fill="#000000" fillOpacity="0.35" />

    {/* Sun in background */}
    <circle cx="68" cy="28" r="14" fill="url(#sunGrad)" stroke="#111827" strokeWidth="3.5" />

    {/* Tower 1 (Left, mid-height) */}
    <rect
      x="18"
      y="38"
      width="22"
      height="38"
      rx="4"
      fill="url(#towerGrad1)"
      stroke="#111827"
      strokeWidth="4"
    />
    {/* Windows */}
    <rect x="23" y="44" width="4" height="5" rx="1" fill="#ffffff" opacity="0.9" />
    <rect x="31" y="44" width="4" height="5" rx="1" fill="#ffffff" opacity="0.9" />
    <rect x="23" y="53" width="4" height="5" rx="1" fill="#ffffff" opacity="0.9" />
    <rect x="31" y="53" width="4" height="5" rx="1" fill="#ffffff" opacity="0.9" />
    <rect x="23" y="62" width="4" height="5" rx="1" fill="#ffffff" opacity="0.9" />
    <rect x="31" y="62" width="4" height="5" rx="1" fill="#ffffff" opacity="0.9" />

    {/* Tower 2 (Center, tallest) */}
    <rect
      x="36"
      y="20"
      width="28"
      height="56"
      rx="4"
      fill="url(#towerGrad3)"
      stroke="#111827"
      strokeWidth="4.5"
    />
    {/* Spire antenna */}
    <line x1="50" y1="20" x2="50" y2="8" stroke="#111827" strokeWidth="4" strokeLinecap="round" />
    <circle cx="50" cy="8" r="3" fill="#ef4444" stroke="#111827" strokeWidth="2" />
    {/* Windows */}
    <rect x="42" y="27" width="5" height="5" rx="1" fill="#fef08a" />
    <rect x="52" y="27" width="5" height="5" rx="1" fill="#fef08a" />
    <rect x="42" y="36" width="5" height="5" rx="1" fill="#fef08a" />
    <rect x="52" y="36" width="5" height="5" rx="1" fill="#fef08a" />
    <rect x="42" y="46" width="5" height="5" rx="1" fill="#fef08a" />
    <rect x="52" y="46" width="5" height="5" rx="1" fill="#fef08a" />
    <rect x="42" y="56" width="5" height="5" rx="1" fill="#ffffff" opacity="0.9" />
    <rect x="52" y="56" width="5" height="5" rx="1" fill="#ffffff" opacity="0.9" />

    {/* Tower 3 (Right, medium) */}
    <rect
      x="60"
      y="42"
      width="22"
      height="34"
      rx="4"
      fill="url(#towerGrad2)"
      stroke="#111827"
      strokeWidth="4"
    />
    {/* Windows */}
    <rect x="65" y="48" width="4" height="5" rx="1" fill="#ffffff" opacity="0.9" />
    <rect x="73" y="48" width="4" height="5" rx="1" fill="#ffffff" opacity="0.9" />
    <rect x="65" y="57" width="4" height="5" rx="1" fill="#ffffff" opacity="0.9" />
    <rect x="73" y="57" width="4" height="5" rx="1" fill="#ffffff" opacity="0.9" />

    {/* Front ground road strip */}
    <rect x="14" y="74" width="72" height="6" rx="2" fill="#334155" stroke="#111827" strokeWidth="2.5" />
    <line x1="30" y1="77" x2="42" y2="77" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="3 2" />
    <line x1="58" y1="77" x2="70" y2="77" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="3 2" />
  </svg>
)

export const GamePillButtons: React.FC<GamePillButtonsProps> = ({
  storeCount,
  onExplore,
  onBuild,
}) => {
  return (
    <aside
      aria-label="Marketplace Quick Action Pills"
      className="fixed top-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5 sm:gap-4 animate-in fade-in slide-in-from-top-4 duration-500 max-w-[95vw] overflow-x-auto p-1"
    >
      {/* ======================================================== */}
      {/* BUTTON 1: EXPLORE EXISTING STORES                        */}
      {/* ======================================================== */}
      <button
        type="button"
        onClick={onExplore}
        className="game-pill-btn group relative flex items-center gap-2 sm:gap-3 px-5 py-2 sm:px-6 sm:py-2.5 flex-shrink-0"
        style={skyBluePillStyle}
        title={`Explore all ${storeCount} active retail stores`}
      >
        {/* Top curved glossy shine */}
        <div className="game-pill-shine" style={pillShineStyle} />

        {/* 3D Storefront Game Icon */}
        <StorefrontGameIcon className="w-8 h-8 sm:w-10 sm:h-10 relative z-10 transition-transform group-hover:rotate-6 group-hover:scale-110" />

        {/* Bold White Text with Cartoon Outline */}
        <span
          className="relative z-10 font-black text-white text-base sm:text-2xl tracking-wide select-none"
          style={cartoonTextStyle}
        >
          Explore Stores
        </span>

        {/* Store Count Badge */}
        <span
          className="relative z-10 px-2.5 py-0.5 text-xs sm:text-sm font-black select-none"
          style={pillBadgeStyle}
        >
          {storeCount}
        </span>
      </button>

      {/* ======================================================== */}
      {/* BUTTON 2: CONSTRUCT NEW STORE (EXACT MATCH TO IMAGE 2)   */}
      {/* ======================================================== */}
      <button
        type="button"
        onClick={onBuild}
        className="game-pill-btn group relative flex items-center gap-2 sm:gap-3 px-6 py-2 sm:px-7 sm:py-2.5 flex-shrink-0"
        style={skyBluePillStyle}
        title="Construct a new store on the next plot"
      >
        {/* Top curved glossy shine */}
        <div className="game-pill-shine" style={pillShineStyle} />

        {/* Yellow Hard Hat Helmet Game Icon */}
        <HardHatGameIcon className="w-8 h-8 sm:w-10 sm:h-10 relative z-10 transition-transform group-hover:-rotate-6 group-hover:scale-110" />

        {/* Bold White Text with Cartoon Outline: "Build" */}
        <span
          className="relative z-10 font-black text-white text-lg sm:text-2xl tracking-wide select-none"
          style={cartoonTextStyle}
        >
          Build
        </span>
      </button>
    </aside>
  )
}

interface CityViewPillProps {
  onCityView: () => void
  onNextStore?: () => void
  currentStoreIndex?: number
  totalStores?: number
  storeName?: string
  isPlotMode?: boolean
  plotIndex?: number
  onOpenBuild?: () => void
}

/**
 * CityViewPill - Displayed when user is focused on a store or a construction plot,
 * allowing 1-click return to City View overview mode where Explore and Build buttons reappear.
 */
export const CityViewPill: React.FC<CityViewPillProps> = ({
  onCityView,
  onNextStore,
  currentStoreIndex,
  totalStores,
  storeName,
  isPlotMode = false,
  plotIndex,
  onOpenBuild,
}) => {
  return (
    <aside
      aria-label="Focus Navigation Controls"
      className="fixed top-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5 sm:gap-4 animate-in fade-in slide-in-from-top-4 duration-500 max-w-[95vw] overflow-x-auto p-1"
    >
      {/* ======================================================== */}
      {/* CITY VIEW BUTTON: Returns to Full 3D City Overview       */}
      {/* ======================================================== */}
      <button
        type="button"
        onClick={onCityView}
        className="game-pill-btn group relative flex items-center gap-2.5 sm:gap-3 px-5 py-2 sm:px-7 sm:py-2.5 flex-shrink-0"
        style={skyBluePillStyle}
        title="Return to full city view mode"
      >
        {/* Top curved glossy shine */}
        <div className="game-pill-shine" style={pillShineStyle} />

        {/* 3D City Skyline Game Icon */}
        <CityViewGameIcon className="w-8 h-8 sm:w-10 sm:h-10 relative z-10 transition-transform group-hover:scale-110" />

        {/* Bold White Text: "City View" */}
        <span
          className="relative z-10 font-black text-white text-base sm:text-2xl tracking-wide select-none"
          style={cartoonTextStyle}
        >
          City View
        </span>
      </button>

      {/* ======================================================== */}
      {/* PLOT MODE: RE-OPEN BUILD MENU / CONSTRUCT                */}
      {/* ======================================================== */}
      {isPlotMode && onOpenBuild && (
        <button
          type="button"
          onClick={onOpenBuild}
          className="game-pill-btn group relative flex items-center gap-2 sm:gap-3 px-5 py-2 sm:px-6 sm:py-2.5 flex-shrink-0"
          style={skyBluePillStyle}
          title={`Construct store on Plot #${plotIndex ?? ''}`}
        >
          <div className="game-pill-shine" style={pillShineStyle} />
          <HardHatGameIcon className="w-8 h-8 sm:w-10 sm:h-10 relative z-10 transition-transform group-hover:-rotate-6 group-hover:scale-110" />
          <span
            className="relative z-10 font-black text-white text-base sm:text-2xl tracking-wide select-none"
            style={cartoonTextStyle}
          >
            Build
          </span>
          {plotIndex && (
            <span
              className="relative z-10 px-2 py-0.5 rounded-full bg-amber-400/30 border border-amber-300 text-amber-200 font-extrabold text-xs shadow-inner"
            >
              #{plotIndex}
            </span>
          )}
        </button>
      )}

      {/* ======================================================== */}
      {/* STORE MODE: NEXT STORE TOUR BUTTON                       */}
      {/* ======================================================== */}
      {!isPlotMode && onNextStore && totalStores && totalStores > 1 && (
        <button
          type="button"
          onClick={onNextStore}
          className="game-pill-btn group relative flex items-center gap-2 sm:gap-2.5 px-4 py-2 sm:px-6 sm:py-2.5 flex-shrink-0"
          style={skyBluePillStyle}
          title="Tour next store"
        >
          <div className="game-pill-shine" style={pillShineStyle} />
          <StorefrontGameIcon className="w-7 h-7 sm:w-9 sm:h-9 relative z-10 transition-transform group-hover:rotate-6 group-hover:scale-110" />
          <span
            className="relative z-10 font-black text-white text-sm sm:text-xl tracking-wide select-none"
            style={cartoonTextStyle}
          >
            Next Store
          </span>
          <span
            className="relative z-10 px-2.5 py-0.5 text-xs sm:text-sm font-black select-none"
            style={pillBadgeStyle}
          >
            {(currentStoreIndex ?? 0) + 1}/{totalStores}
          </span>
        </button>
      )}

      {/* Plot Name or Store Name Tag */}
      {isPlotMode && plotIndex && (
        <div className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900/85 backdrop-blur-md border border-white/30 text-white text-xs font-bold shadow-lg">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-slate-300">Plot:</span>
          <span className="text-amber-300">Plot #{plotIndex} Available</span>
        </div>
      )}

      {!isPlotMode && storeName && (
        <div className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900/85 backdrop-blur-md border border-white/30 text-white text-xs font-bold shadow-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-300">Viewing:</span>
          <span className="text-amber-300 truncate max-w-[140px]">{storeName}</span>
        </div>
      )}
    </aside>
  )
}

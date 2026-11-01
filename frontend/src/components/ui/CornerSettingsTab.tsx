/**
 * CornerSettingsTab - Game-Pill Styled Settings Tab in the Screen Corner
 * Matches the exact visual language of the Build and Explore game-pill buttons:
 *  - Elongated capsule pill with 3.5px solid white border
 *  - Saturated skyblue glossy gradient
 *  - Upper-half glass reflection shine
 *  - 3D cartoon settings cog icon with black outlines
 *  - Chunky cartoon white typography
 * Controls:
 *  - Environment Mode: Shift between Day and Night
 *  - Graphics Quality: Shift between Low, Medium, High, Ultra
 *  - Sign Out option at the bottom
 */

import React, { useState, useRef, useEffect } from 'react'
import {
  Sun,
  Moon,
  LogOut,
  X,
  Sliders,
  Sparkles,
  User,
  Monitor
} from 'lucide-react'
import {
  skyBluePillStyle,
  pillShineStyle,
  cartoonTextStyle
} from './GamePillButtons'
import type { GraphicsQuality, TimeOfDay, UserSession } from '../../types'

interface CornerSettingsTabProps {
  timeOfDay: TimeOfDay
  onToggleTimeOfDay: (time: TimeOfDay) => void
  graphicsQuality: GraphicsQuality
  onChangeGraphicsQuality: (quality: GraphicsQuality) => void
  onLogout: () => void
  userSession: UserSession | null
}

/**
 * 3D Cartoon Gear / Settings Icon with Bold Black Outlines
 */
export const SettingsGameIcon: React.FC<{ className?: string }> = ({ className = 'w-8 h-8' }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`drop-shadow-[0_3px_5px_rgba(0,0,0,0.5)] select-none pointer-events-none flex-shrink-0 ${className}`}
  >
    <defs>
      <linearGradient id="settingsGearGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="45%" stopColor="#facc15" />
        <stop offset="100%" stopColor="#ca8a04" />
      </linearGradient>
      <linearGradient id="settingsHoleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#38bdf8" />
        <stop offset="100%" stopColor="#0284c7" />
      </linearGradient>
    </defs>

    {/* Shadow */}
    <ellipse cx="50" cy="80" rx="34" ry="6" fill="#000000" fillOpacity="0.35" />

    {/* 8-Toothed Cartoon Gear Body */}
    <path
      d="M44 14 L56 14 L58 24 C62 25 66 27 69 30 L78 26 L86 34 L82 43 C85 46 87 50 88 54 L98 56 L98 68 L88 70 C87 74 85 78 82 81 L86 90 L78 98 L69 94 C66 97 62 99 58 100 L56 110 L44 110 L42 100 C38 99 34 97 31 94 L22 98 L14 90 L18 81 C15 78 13 74 12 70 L2 68 L2 56 L12 54 C13 50 15 46 18 43 L14 34 L22 26 L31 30 C34 27 38 25 42 24 Z"
      transform="scale(0.76) translate(15, 14)"
      fill="url(#settingsGearGrad)"
      stroke="#111827"
      strokeWidth="4.5"
      strokeLinejoin="round"
    />

    {/* Center Core Hole */}
    <circle cx="50" cy="50" r="14" fill="url(#settingsHoleGrad)" stroke="#111827" strokeWidth="4" />
    <circle cx="46" cy="46" r="3.5" fill="#ffffff" opacity="0.85" />
  </svg>
)

export const CornerSettingsTab: React.FC<CornerSettingsTabProps> = ({
  timeOfDay,
  onToggleTimeOfDay,
  graphicsQuality,
  onChangeGraphicsQuality,
  onLogout,
  userSession
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const graphicsOptions: GraphicsQuality[] = ['low', 'medium', 'high', 'ultra']

  return (
    <div ref={menuRef} className="fixed top-6 right-6 z-40">
      {/* ======================================================== */}
      {/* THE CORNER SETTINGS PILL BUTTON                          */}
      {/* Matches the Build and Explore game-pill aesthetic        */}
      {/* ======================================================== */}
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className="game-pill-btn group relative flex items-center gap-2.5 px-5 py-2 sm:px-6 sm:py-2.5 flex-shrink-0 cursor-pointer"
        style={skyBluePillStyle}
        title="Open simulation settings (Lighting, Graphics, Sign Out)"
        aria-expanded={isOpen}
      >
        {/* Top curved glossy shine */}
        <div className="game-pill-shine" style={pillShineStyle} />

        {/* 3D Settings Gear Icon */}
        <SettingsGameIcon className="w-8 h-8 sm:w-9 sm:h-9 relative z-10 transition-transform group-hover:rotate-45" />

        {/* Bold White Text with Cartoon Outline */}
        <span
          className="relative z-10 font-black text-white text-base sm:text-xl tracking-wide select-none"
          style={cartoonTextStyle}
        >
          Settings
        </span>

        {/* Indicator Dot for current state */}
        <span
          className={`relative z-10 w-2.5 h-2.5 rounded-full border border-white ${
            timeOfDay === 'day' ? 'bg-amber-300' : 'bg-indigo-300'
          } shadow-sm`}
        />
      </button>

      {/* ======================================================== */}
      {/* SETTINGS DROPDOWN DRAWER / POPUP PANEL                   */}
      {/* ======================================================== */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Application Settings"
          className="absolute top-16 right-0 w-80 sm:w-88 rounded-3xl bg-slate-900/95 backdrop-blur-2xl border-[3px] border-white/40 shadow-2xl shadow-black/80 p-5 text-white animate-in fade-in slide-in-from-top-3 duration-200 select-none"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-white/15">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-sky-400" />
              <h2 className="font-black text-lg tracking-wide text-white" style={cartoonTextStyle}>
                Settings
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Close settings"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* User Profile Info if signed in */}
          {userSession && (
            <div className="mt-3.5 p-3 rounded-2xl bg-slate-800/60 border border-white/10 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-400 to-blue-600 border border-white flex items-center justify-center font-black text-white text-sm shadow">
                <User className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">
                  {userSession.username || 'RetailVision Administrator'}
                </p>
                <p className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {userSession.email || 'admin@retailvision.com'}
                </p>
              </div>
            </div>
          )}

          {/* Setting 1: Day / Night Lighting Mode */}
          <div className="mt-4">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Lighting & Atmosphere
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-800/80 border border-white/10">
              <button
                type="button"
                onClick={() => onToggleTimeOfDay('day')}
                className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  timeOfDay === 'day'
                    ? 'bg-gradient-to-b from-amber-400 to-amber-600 text-white shadow-md border-2 border-white/80 scale-[1.02]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Sun className="w-4 h-4 text-amber-200" />
                <span>Day Mode</span>
              </button>

              <button
                type="button"
                onClick={() => onToggleTimeOfDay('night')}
                className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  timeOfDay === 'night'
                    ? 'bg-gradient-to-b from-indigo-500 to-purple-700 text-white shadow-md border-2 border-white/80 scale-[1.02]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Moon className="w-4 h-4 text-indigo-200" />
                <span>Night Mode</span>
              </button>
            </div>
          </div>

          {/* Setting 2: Graphics Quality (Low to Ultra) */}
          <div className="mt-4">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 mb-2">
              <Monitor className="w-3.5 h-3.5 text-sky-400" />
              Graphics Fidelity
            </label>
            <div className="grid grid-cols-4 gap-1.5 p-1 rounded-2xl bg-slate-800/80 border border-white/10">
              {graphicsOptions.map(quality => (
                <button
                  key={quality}
                  type="button"
                  onClick={() => onChangeGraphicsQuality(quality)}
                  className={`py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                    graphicsQuality === quality
                      ? 'bg-gradient-to-b from-sky-400 to-blue-600 text-white shadow-md border-2 border-white/90 scale-[1.03]'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  {quality}
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-[11px] text-slate-400 text-center">
              {graphicsQuality === 'low' && 'Optimized for high performance on mobile & laptops.'}
              {graphicsQuality === 'medium' && 'Balanced fidelity and framerate.'}
              {graphicsQuality === 'high' && 'High resolution shadows and soft lighting.'}
              {graphicsQuality === 'ultra' && 'Ultra fidelity with full post-processing.'}
            </p>
          </div>

          {/* Setting 3: Sign Out Option */}
          <div className="mt-5 pt-4 border-t border-white/15">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false)
                onLogout()
              }}
              className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-full bg-gradient-to-r from-rose-500 via-red-600 to-rose-700 hover:from-rose-600 hover:to-red-700 text-white font-black text-sm tracking-wide border-2 border-white shadow-lg shadow-red-600/40 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

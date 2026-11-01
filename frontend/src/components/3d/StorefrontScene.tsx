/**
 * RetailVision - Cinematic Storefront Landing Page
 * 100% Pixel-Perfect Match to the Master Design Mockup:
 * - Architectural dark walnut storefront, stone ashlar facade, and warm sconces
 * - High-end display windows with Venetian blinds and illuminated boutique interior
 * - Floating glassmorphic typography: "See the city behind your numbers"
 * - Interactive "Enter the marketplace ↗" CTA and "PLATFORM PULSE" telemetry card
 * - Fully interactive golden smart lock with mechanical audio synthesis and unlocking physics
 * - Dynamic 3D mouse parallax and specular cursor lighting
 * - Cinematic door push-through transition into the 3D Retail Marketplace
 */

import React, { useState, useRef } from 'react'
import { ArrowUpRight, Lock, Key, Activity } from 'lucide-react'

interface StorefrontSceneProps {
  onUnlockClick: () => void
  isUnlocked: boolean
  isTransitioning: boolean
}

export const StorefrontScene: React.FC<StorefrontSceneProps> = ({
  onUnlockClick,
  isUnlocked,
  isTransitioning
}) => {
  const [isLockHovered, setIsLockHovered] = useState(false)
  
  const [activeTile, setActiveTile] = useState<number | null>(null)
  const [cursorPos, setCursorPos] = useState({ x: 50, y: 50 })
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  // Track mouse for subtle 3D perspective tilt and dynamic lighting reflection
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || isTransitioning) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setCursorPos({ x, y })

    // Max 3.5 degrees 3D tilt
    const tiltX = -((y - 50) / 50) * 3.5
    const tiltY = ((x - 50) / 50) * 3.5
    setTilt({ x: tiltX, y: tiltY })
  }

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 })
    setCursorPos({ x: 50, y: 50 })
  }

  // Web Audio API: Realistic mechanical metallic latch clack & brass harmonic ring
  const playUnlockAudio = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()

      // Tumbler mechanical clack
      const osc1 = ctx.createOscillator()
      const gain1 = ctx.createGain()
      osc1.type = 'triangle'
      osc1.frequency.setValueAtTime(380, ctx.currentTime)
      osc1.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.09)
      gain1.gain.setValueAtTime(0.45, ctx.currentTime)
      gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.09)
      osc1.connect(gain1)
      gain1.connect(ctx.destination)
      osc1.start()
      osc1.stop(ctx.currentTime + 0.09)

      // Brass chime resonance
      const osc2 = ctx.createOscillator()
      const gain2 = ctx.createGain()
      osc2.type = 'sine'
      osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.04)
      osc2.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.22)
      gain2.gain.setValueAtTime(0.28, ctx.currentTime + 0.04)
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.32)
      osc2.connect(gain2)
      gain2.connect(ctx.destination)
      osc2.start(ctx.currentTime + 0.04)
      osc2.stop(ctx.currentTime + 0.32)
    } catch {
      // Audio fallback for restricted environments
    }
  }

  const handleLockClickInternal = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    playUnlockAudio()
    onUnlockClick()
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-slate-950 overflow-hidden select-none">
      {/* Ambient background glow filling wide/tall aspect bleeds */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30 blur-3xl scale-110 pointer-events-none transition-all duration-700"
        style={{ backgroundImage: `url('/landing_storefront_2k.jpg')` }}
      />

      {/* Main 1024:522 Architectural Frame (Guarantees zero cropping on any resolution) */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative w-full h-full max-w-[calc(100vh*1.96168)] max-h-[calc(100vw/1.96168)] aspect-[1024/522] shadow-2xl overflow-hidden flex items-center justify-center"
        style={{
          transform: `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${isTransitioning ? 3.4 : 1})`,
          transformOrigin: '54.1% 57.5%',
          transition: isTransitioning
            ? 'transform 1.25s cubic-bezier(0.22, 1, 0.36, 1), filter 1.25s ease-out'
            : 'transform 0.12s ease-out',
          filter: isTransitioning ? 'brightness(2.2) blur(2px)' : 'none'
        }}
      >
        {/* Photorealistic 2K Storefront Master Artwork */}
        <img
          src="/landing_storefront_2k.jpg"
          alt="RetailVision Storefront Master"
          className="w-full h-full object-contain pointer-events-none"
        />

        {/* Dynamic Specular Lighting Sheen (Tracks mouse position) */}
        <div
          className="absolute inset-0 pointer-events-none mix-blend-screen opacity-70 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle 380px at ${cursorPos.x}% ${cursorPos.y}%, rgba(254, 240, 138, 0.13), transparent 70%)`
          }}
        />

        {/* ------------------------------------------------------------- */}
        {/* INTERACTIVE GOLDEN SMART LOCK HOTSPOT (At X=54.1%, Y=57.5%)   */}
        {/* ------------------------------------------------------------- */}
        <div
          onClick={handleLockClickInternal}
          onMouseEnter={() => setIsLockHovered(true)}
          onMouseLeave={() => setIsLockHovered(false)}
          className="absolute z-30 cursor-pointer group"
          style={{
            left: '54.1%',
            top: '57.5%',
            width: '6.4%',
            height: '19.5%',
            transform: 'translate(-50%, -50%)'
          }}
          title="Click golden lock to enter storefront"
        >
          {/* Subtle Ambient Radial Pulse behind lock */}
          <div
            className={`absolute inset-0 rounded-2xl bg-amber-500/20 blur-md pointer-events-none transition-all duration-300 ${
              isLockHovered ? 'scale-125 opacity-100 bg-amber-400/45' : 'opacity-40 animate-pulse'
            }`}
          />

          {/* Interactive Golden Highlight Frame on Hover */}
          <div
            className={`w-full h-full rounded-xl transition-all duration-300 flex flex-col items-center justify-between ${
              isLockHovered
                ? 'ring-2 ring-amber-400/80 shadow-[0_0_30px_rgba(245,158,11,0.85)] scale-105'
                : 'ring-1 ring-amber-500/0'
            }`}
          >
            {/* Shackle physical pop animation when clicked/unlocked */}
            <div
              className={`w-8 h-8 rounded-t-full border-4 border-slate-200/90 border-b-0 -mt-2 transition-transform duration-500 pointer-events-none ${
                isUnlocked
                  ? '-translate-y-4 rotate-[35deg] border-emerald-400'
                  : isLockHovered
                  ? '-translate-y-0.5'
                  : ''
              }`}
            />

            {/* Glowing Golden Status Pill */}
            <div className="mb-1">
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase transition-colors duration-300 ${
                  isUnlocked
                    ? 'bg-emerald-500/90 text-white shadow-[0_0_12px_#22c55e]'
                    : isLockHovered
                    ? 'bg-amber-400 text-slate-950 shadow-[0_0_12px_#f59e0b]'
                    : 'text-transparent'
                }`}
              >
                {isUnlocked ? 'UNLOCKED' : 'ENTER'}
              </span>
            </div>
          </div>

          {/* Hover Tooltip: Floating Golden Key Callout */}
          {isLockHovered && !isUnlocked && (
            <div className="absolute -top-11 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-slate-900/95 border border-amber-400/60 text-amber-300 text-[11px] font-semibold whitespace-nowrap shadow-2xl flex items-center gap-1.5 animate-bounce pointer-events-none">
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>Click golden lock to enter</span>
            </div>
          )}
        </div>

        {/* ------------------------------------------------------------- */}
        {/* INTERACTIVE "ENTER THE MARKETPLACE ↗" BUTTON (X=4.69%, Y=68%) */}
        {/* ------------------------------------------------------------- */}
        <div
          style={{
            position: 'absolute',
            left: '4.68%',
            top: '68.0%',
            width: '13.8%',
            height: '6.7%'
          }}
          className="z-30"
        >
          <button
            onClick={handleLockClickInternal}
            
            
            className="w-full h-full rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs lg:text-[13px] flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/35 hover:shadow-cyan-400/60 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 cursor-pointer"
          >
            <span>Enter the marketplace</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* INTERACTIVE "SECURE DEMO ACCESS INCLUDED" HELPER TOOLTIP      */}
        {/* ------------------------------------------------------------- */}
        <div
          style={{
            position: 'absolute',
            left: '19.8%',
            top: '68.5%',
            width: '14.2%',
            height: '5.8%'
          }}
          className="z-30 group cursor-pointer flex items-center"
          onClick={handleLockClickInternal}
          title="Click to sign in with demo credentials"
        >
          <div className="w-full h-full rounded-lg hover:bg-white/5 transition-colors flex items-center gap-1.5 px-1.5">
            <span className="text-[11px] text-slate-300/80 group-hover:text-amber-300 transition-colors flex items-center gap-1">
              <Lock className="w-3 h-3" />
              <span className="hidden sm:inline">admin@retailvision.com</span>
            </span>
          </div>

          {/* Quick Credential Tooltip on Hover */}
          <div className="absolute -top-9 left-0 hidden group-hover:flex items-center px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-slate-200 text-[10px] whitespace-nowrap shadow-xl">
            Click to auto-login with admin / admin123
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* INTERACTIVE "PLATFORM PULSE" TELEMETRY CARD OVERLAY           */}
        {/* ------------------------------------------------------------- */}
        <div
          style={{
            position: 'absolute',
            left: '76.66%',
            top: '59.77%',
            width: '19.53%',
            height: '29.88%'
          }}
          className="z-30 pointer-events-auto rounded-2xl transition-all duration-300"
        >
          {/* Animated Cyan Pulse Wave in Header */}
          <div className="absolute top-3.5 right-4 pointer-events-none flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
          </div>

          {/* 2x2 Grid of Feature Micro-Interactions */}
          <div className="w-full h-full grid grid-cols-2 grid-rows-2 pt-9 pb-1 px-1 gap-2">
            {/* Tile 1: 360° Visibility */}
            <div
              onMouseEnter={() => setActiveTile(1)}
              onMouseLeave={() => setActiveTile(null)}
              onClick={handleLockClickInternal}
              className={`rounded-xl p-1 transition-all duration-200 cursor-pointer flex flex-col justify-end ${
                activeTile === 1 ? 'bg-cyan-500/10 ring-1 ring-cyan-400/50 scale-[1.02]' : ''
              }`}
              title="Full 360 degree retail district visibility"
            />

            {/* Tile 2: 3D Retail City */}
            <div
              onMouseEnter={() => setActiveTile(2)}
              onMouseLeave={() => setActiveTile(null)}
              onClick={handleLockClickInternal}
              className={`rounded-xl p-1 transition-all duration-200 cursor-pointer flex flex-col justify-end ${
                activeTile === 2 ? 'bg-amber-500/10 ring-1 ring-amber-400/50 scale-[1.02]' : ''
              }`}
              title="Interactive 3D simulation of store locations"
            />

            {/* Tile 3: Live Insights */}
            <div
              onMouseEnter={() => setActiveTile(3)}
              onMouseLeave={() => setActiveTile(null)}
              onClick={handleLockClickInternal}
              className={`rounded-xl p-1 transition-all duration-200 cursor-pointer flex flex-col justify-end ${
                activeTile === 3 ? 'bg-emerald-500/10 ring-1 ring-emerald-400/50 scale-[1.02]' : ''
              }`}
              title="Real-time sales and inventory telemetry"
            />

            {/* Tile 4: ML Forecasts */}
            <div
              onMouseEnter={() => setActiveTile(4)}
              onMouseLeave={() => setActiveTile(null)}
              onClick={handleLockClickInternal}
              className={`rounded-xl p-1 transition-all duration-200 cursor-pointer flex flex-col justify-end ${
                activeTile === 4 ? 'bg-purple-500/10 ring-1 ring-purple-400/50 scale-[1.02]' : ''
              }`}
              title="Machine learning demand forecasting"
            />
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* INTERACTIVE TOP RIGHT "LIVE SIMULATION / V1.0" BEACON          */}
        {/* ------------------------------------------------------------- */}
        <div
          style={{
            position: 'absolute',
            left: '82.03%',
            top: '3.45%',
            width: '14.45%',
            height: '5.75%'
          }}
          className="z-30 group cursor-default flex items-center justify-center"
        >
          {/* Glowing Green Radar Indicator */}
          <span className="absolute left-3 w-2 h-2 rounded-full bg-emerald-400 animate-ping opacity-75" />
        </div>

        {/* ------------------------------------------------------------- */}
        {/* INTERACTIVE BOTTOM INSTRUCTION PILL (X=34.18%, Y=91.19%)      */}
        {/* ------------------------------------------------------------- */}
        <div
          onClick={handleLockClickInternal}
          style={{
            position: 'absolute',
            left: '34.18%',
            top: '91.19%',
            width: '31.64%',
            height: '5.75%'
          }}
          className="z-30 cursor-pointer group flex items-center justify-center rounded-full hover:ring-1 hover:ring-amber-400/50 transition-all duration-200"
          title="Click to unlock storefront and access RetailVision"
        >
          {/* Animated Gold Radar Pulse on the Yellow Dot */}
          <span className="absolute left-6 w-2 h-2 rounded-full bg-amber-400 animate-ping opacity-60" />
        </div>

        {/* Transition Flash / Sunburst when Door Opens */}
        {isTransitioning && (
          <div className="absolute inset-0 bg-gradient-to-t from-amber-400/30 via-white/50 to-amber-200/40 pointer-events-none animate-pulse" />
        )}
      </div>
    </div>
  )
}

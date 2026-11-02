/**
 * RetailVision - Interactive 3D Retail Metropolis Landing Page
 * Full 3D casual-game theme matching the rest of the application:
 *  - Interactive 3D Island Metropolis with real-time lighting, roads, ocean, and stores
 *  - Floating 3D holographic business badges over the town
 *  - Smooth cinematic camera orbit with interactive mouse parallax tilt
 *  - Sleek Skyblue Game-Pill UI overlay with 3.5px solid white borders and glossy reflections
 *  - 1-Click "Quick Demo Tour" + "Enter Marketplace" authentication triggers
 *  - Exhilarating cinematic zoom transition into the marketplace
 */

import React, { useRef, useState, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { PerspectiveCamera, Float, Html } from '@react-three/drei'
import * as THREE from 'three'
import { DEFAULT_STORES, authApi } from '../../api/client'
import { launchGoogleSignIn } from '../../lib/googleAuth'
import type { UserSession } from '../../types'
import { EnvironmentDecor } from './EnvironmentDecor'
import { StoreBuilding } from './StoreBuilding'
import { DriftingClouds } from './DriftingClouds'
import { cartoonTextStyle, pillShineStyle } from '../ui/GamePillButtons'
import { Sparkles, ArrowRight, Zap, Building2, BarChart3, TrendingUp, ShieldCheck } from 'lucide-react'

const GoogleIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={`${className} shrink-0`} viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
  </svg>
)

interface StorefrontSceneProps {
  onUnlockClick: () => void
  isUnlocked: boolean
  isTransitioning: boolean
  onQuickEnter?: (session: UserSession) => void
}

// Reusable SkyBlue Game Theme Styles matching Minimap and Action Pills
const heroShellStyle: React.CSSProperties = {
  background: 'linear-gradient(180deg, rgba(56, 189, 248, 0.95) 0%, rgba(14, 165, 233, 0.92) 25%, rgba(2, 132, 199, 0.95) 75%, rgba(3, 79, 124, 0.98) 100%)',
  border: '3.5px solid #ffffff',
  borderRadius: '28px',
  boxShadow: '0 25px 60px rgba(2, 132, 199, 0.65), inset 0 2px 6px rgba(255, 255, 255, 0.85)',
}

const heroInnerCanvasStyle: React.CSSProperties = {
  background: 'rgba(2, 22, 44, 0.88)',
  border: '2px solid rgba(255, 255, 255, 0.28)',
  borderRadius: '20px',
  boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.45)',
}

// ─────────────────────────────────────────────────────────────
// Cinematic 3D Camera Controller with Smooth Orbit & Mouse Tilt
// ─────────────────────────────────────────────────────────────
function LandingCamera({
  isTransitioning,
  mousePos
}: {
  isTransitioning: boolean
  mousePos: { x: number; y: number }
}) {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null)
  const angleRef = useRef<number>(0.85)

  useFrame((_, delta) => {
    if (!cameraRef.current) return

    if (isTransitioning) {
      // Exhilarating fly-through plunge into the city center on entry!
      cameraRef.current.position.lerp(new THREE.Vector3(0, 3.2, 5.0), 0.08)
      cameraRef.current.lookAt(0, 1.2, 0)
      return
    }

    // Gentle slow cinematic orbit around the central plaza
    angleRef.current += delta * 0.075

    const radius = 38.0
    const height = 24.0

    // Combine gentle orbit with mouse parallax tilt
    const targetX = Math.sin(angleRef.current) * radius + mousePos.x * 6.0
    const targetZ = Math.cos(angleRef.current) * radius + mousePos.y * 6.0
    const targetY = height + mousePos.y * 3.5

    cameraRef.current.position.x = THREE.MathUtils.lerp(cameraRef.current.position.x, targetX, 0.04)
    cameraRef.current.position.y = THREE.MathUtils.lerp(cameraRef.current.position.y, targetY, 0.04)
    cameraRef.current.position.z = THREE.MathUtils.lerp(cameraRef.current.position.z, targetZ, 0.04)

    cameraRef.current.lookAt(0, 1.5, 0)
  })

  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault
      position={[28, 24, 28]}
      fov={42}
      near={0.5}
      far={350}
    />
  )
}

// ─────────────────────────────────────────────────────────────
// Floating 3D Holographic Pin over Landmark Buildings
// ─────────────────────────────────────────────────────────────
function FloatingLandmarkPin({
  position,
  label,
  icon,
  color = '#38bdf8'
}: {
  position: [number, number, number]
  label: string
  icon: string
  color?: string
}) {
  return (
    <Float speed={2.5} rotationIntensity={0.2} floatIntensity={0.8} position={position}>
      <Html center distanceFactor={28} className="pointer-events-none select-none">
        <div
          className="flex items-center gap-1.5 px-3 py-1 rounded-full whitespace-nowrap text-white font-black text-xs shadow-2xl transition-transform"
          style={{
            background: `linear-gradient(180deg, ${color} 0%, #0284c7 100%)`,
            border: '2px solid #ffffff',
            boxShadow: `0 8px 20px rgba(2, 132, 199, 0.6), inset 0 1px 2px rgba(255, 255, 255, 0.8)`,
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.6)',
            transform: 'scale(0.9)'
          }}
        >
          <span>{icon}</span>
          <span className="tracking-wide">{label}</span>
        </div>
      </Html>
    </Float>
  )
}

// ─────────────────────────────────────────────────────────────
// Main 3D Storefront Landing Page Component
// ─────────────────────────────────────────────────────────────
export const StorefrontScene: React.FC<StorefrontSceneProps> = ({
  onUnlockClick,
  isUnlocked: _isUnlocked,
  isTransitioning,
  onQuickEnter
}) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [isQuickLoggingIn, setIsQuickLoggingIn] = useState(false)

  // Track mouse coordinates for gentle 3D parallax
  const handleMouseMove = (e: React.MouseEvent) => {
    const nx = (e.clientX / window.innerWidth) * 2 - 1
    const ny = -(e.clientY / window.innerHeight) * 2 + 1
    setMousePos({ x: nx, y: ny })
  }

  // 1-Click Instant Demo Tour Login
  const handleInstantDemo = async () => {
    setIsQuickLoggingIn(true)
    try {
      const session = await authApi.login('admin@retailvision.com', 'admin123')
      if (onQuickEnter) {
        onQuickEnter(session)
      } else {
        onUnlockClick()
      }
    } catch {
      onUnlockClick()
    } finally {
      setIsQuickLoggingIn(false)
    }
  }

  // Google Sign-In Handler with automatic fallback to chooser
  const handleGoogleClick = () => {
    launchGoogleSignIn(
      (session) => {
        if (onQuickEnter) {
          onQuickEnter(session)
        } else {
          onUnlockClick()
        }
      },
      () => {
        onUnlockClick()
      }
    )
  }

  const storesList = useMemo(() => DEFAULT_STORES, [])

  return (
    <div
      className="relative w-full h-full overflow-hidden bg-slate-950 font-sans select-none"
      onMouseMove={handleMouseMove}
    >
      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. INTERACTIVE 3D METROPOLIS BACKGROUND CANVAS */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="absolute inset-0 z-0">
        <Canvas
          shadows
          gl={{
            antialias: true,
            powerPreference: 'high-performance',
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.15
          }}
        >
          <LandingCamera isTransitioning={isTransitioning} mousePos={mousePos} />

          {/* Tropical Sunlight */}
          <directionalLight
            position={[45, 60, 35]}
            intensity={1.75}
            color="#fffbeb"
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-camera-near={0.5}
            shadow-camera-far={180}
            shadow-camera-left={-60}
            shadow-camera-right={60}
            shadow-camera-top={60}
            shadow-camera-bottom={-60}
            shadow-bias={-0.0005}
          />

          {/* Ambient Fill Light */}
          <ambientLight intensity={0.45} color="#e0f2fe" />

          <React.Suspense fallback={null}>
            {/* Drifting Low-Poly Clouds */}
            <DriftingClouds />

            {/* City Island Environment, Roads, Curbs, Sidewalks, Ocean */}
            <EnvironmentDecor timeOfDay="day" stores={storesList} />

            {/* 3D Retail Store Buildings */}
            {storesList.map((store) => (
              <StoreBuilding
                key={store.id}
                store={store}
                isSelected={false}
                onClick={() => onUnlockClick()}
                onHover={() => {}}
                timeOfDay="day"
              />
            ))}

            {/* Floating 3D Holographic Landmark Pins */}
            <FloatingLandmarkPin
              position={[-6.5, 6.2, -6.0]}
              label="Nova Electronics • $412K"
              icon="⚡"
            />
            <FloatingLandmarkPin
              position={[6.5, 5.8, 6.0]}
              label="Daily Fresh Market"
              icon="🍏"
              color="#10b981"
            />
            <FloatingLandmarkPin
              position={[-6.5, 5.5, 6.0]}
              label="Urban Boutique"
              icon="✨"
              color="#ec4899"
            />
            <FloatingLandmarkPin
              position={[13.0, 5.5, 6.0]}
              label="Nordic Living"
              icon="🛋️"
              color="#f59e0b"
            />
          </React.Suspense>
        </Canvas>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. TOP BRANDING & STATUS BAR */}
      {/* ───────────────────────────────────────────────────────────── */}
      <header className="relative z-20 flex items-center justify-between px-6 sm:px-10 py-5 pointer-events-none">
        {/* RetailVision 3D Logo Badge */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg"
            style={{
              background: 'linear-gradient(180deg, #38bdf8 0%, #0ea5e9 40%, #0284c7 100%)',
              border: '2.5px solid #ffffff',
              boxShadow: '0 6px 18px rgba(2, 132, 199, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.8)',
              ...cartoonTextStyle
            }}
          >
            RV
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-white text-xl tracking-wide drop-shadow-md">
                Retail<span className="text-sky-300">Vision</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 text-white border border-white/40">
                3D OS
              </span>
            </div>
            <p className="text-[11px] font-bold text-sky-200/90 tracking-wider uppercase">
              Commerce Intelligence Metropolis
            </p>
          </div>
        </div>

        {/* Live Simulation Status & Direct Sign In Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/20 text-xs text-sky-200 font-bold shadow-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
            <span>3D CITY SIMULATION ACTIVE</span>
          </div>

          <button
            onClick={handleGoogleClick}
            className="relative px-4 py-2 rounded-full font-black text-xs text-slate-800 bg-white hover:bg-slate-50 cursor-pointer transition-all duration-200 active:scale-95 overflow-hidden shadow-lg flex items-center gap-2 border-2 border-white"
            style={{
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
              ...cartoonTextStyle
            }}
            title="Sign in with your Google Account"
          >
            <GoogleIcon className="w-4 h-4" />
            <span className="hidden xs:inline">Sign in with Google</span>
            <span className="xs:hidden">Google</span>
          </button>

          <button
            onClick={onUnlockClick}
            className="relative px-5 py-2 rounded-full font-black text-xs text-white cursor-pointer transition-all duration-200 active:scale-95 overflow-hidden shadow-lg flex items-center gap-2"
            style={{
              background: 'linear-gradient(180deg, #38bdf8 0%, #0ea5e9 40%, #0284c7 75%, #0369a1 100%)',
              border: '2.5px solid #ffffff',
              boxShadow: '0 6px 18px rgba(2, 132, 199, 0.55), inset 0 2px 3px rgba(255, 255, 255, 0.8)',
              ...cartoonTextStyle
            }}
          >
            <div style={pillShineStyle} />
            <span>Sign In</span>
          </button>
        </div>
      </header>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. HERO SHOWCASE CARD (THEME-ALIGNED CASUAL-GAME PILL DESIGN) */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="relative z-20 flex flex-col justify-end lg:justify-center min-h-[calc(100vh-140px)] px-6 sm:px-12 pb-8 sm:pb-12 max-w-2xl pointer-events-none">
        <div
          className="relative overflow-hidden p-6 sm:p-8 pointer-events-auto animate-in fade-in slide-in-from-bottom-6 duration-700"
          style={heroShellStyle}
        >
          {/* Top Reflection Curved Shine */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: '5%',
              right: '5%',
              height: '35%',
              background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.75) 0%, rgba(255, 255, 255, 0.15) 60%, rgba(255, 255, 255, 0) 100%)',
              borderRadius: '24px 24px 80px 80px',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />

          <div className="relative z-10 space-y-5">
            {/* Supercharged Sparkle Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/20 border-2 border-white text-white text-xs font-black tracking-wide shadow-md">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300 drop-shadow-sm" />
              <span>NEXT-GENERATION 3D RETAIL INTELLIGENCE</span>
            </div>

            {/* Big Cartoon Heading */}
            <h1
              className="text-3xl sm:text-5xl font-black text-white leading-[1.08] tracking-tight drop-shadow-lg"
              style={{
                textShadow: '0 3px 6px rgba(0, 0, 0, 0.55), 0 1px 2px rgba(0, 0, 0, 0.8)',
              }}
            >
              See the city behind your numbers.
            </h1>

            {/* Subtitle inside Dark Ocean Canvas */}
            <div className="p-4" style={heroInnerCanvasStyle}>
              <p className="text-sm sm:text-base text-sky-100 font-medium leading-relaxed">
                Step into an interactive 3D retail metropolis where every storefront turns your CSV data into instant decisions, Pareto rankings, and machine learning sales forecasts.
              </p>

              {/* 4 Feature Pills Grid */}
              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/15 text-xs font-black text-sky-200">
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-sky-300" />
                  <span>3D Town Marketplace</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-yellow-300" />
                  <span>Instant CSV Construction</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-emerald-300" />
                  <span>Executive KPI Dashboards</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-purple-300" />
                  <span>ML Ridge Sales Forecast</span>
                </div>
              </div>
            </div>

            {/* Action Buttons: Iconic Game Pills */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              {/* Primary Action Button: Enter Marketplace */}
              <button
                onClick={onUnlockClick}
                className="relative flex-1 py-3.5 px-6 rounded-full font-black text-base text-white cursor-pointer transition-all duration-200 active:scale-95 overflow-hidden flex items-center justify-center gap-2 shadow-xl group"
                style={{
                  background: 'linear-gradient(180deg, #38bdf8 0%, #0ea5e9 35%, #0284c7 75%, #0369a1 100%)',
                  border: '3.5px solid #ffffff',
                  boxShadow: '0 8px 25px rgba(2, 132, 199, 0.75), inset 0 2px 4px rgba(255, 255, 255, 0.85)',
                  ...cartoonTextStyle
                }}
              >
                <div style={pillShineStyle} />
                <span>Enter Marketplace</span>
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>

              {/* Google Sign In Button */}
              <button
                onClick={handleGoogleClick}
                className="relative py-3.5 px-5 rounded-full font-black text-sm text-slate-800 bg-white hover:bg-slate-50 cursor-pointer transition-all duration-200 active:scale-95 overflow-hidden flex items-center justify-center gap-2.5 shadow-xl group"
                style={{
                  border: '3.5px solid #ffffff',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.35), inset 0 2px 4px rgba(255, 255, 255, 0.85)',
                  ...cartoonTextStyle
                }}
                title="Sign in with your Google Account"
              >
                <div style={pillShineStyle} />
                <GoogleIcon className="w-5 h-5" />
                <span>Sign in with Google</span>
              </button>

              {/* Secondary Action Button: Quick Demo Tour */}
              <button
                onClick={handleInstantDemo}
                disabled={isQuickLoggingIn}
                className="relative py-3.5 px-5 rounded-full font-black text-sm text-white cursor-pointer transition-all duration-200 active:scale-95 overflow-hidden flex items-center justify-center gap-2 shadow-xl group"
                style={{
                  background: 'linear-gradient(180deg, #10b981 0%, #059669 40%, #047857 100%)',
                  border: '3.5px solid #ffffff',
                  boxShadow: '0 8px 25px rgba(5, 150, 105, 0.65), inset 0 2px 4px rgba(255, 255, 255, 0.85)',
                  ...cartoonTextStyle
                }}
                title="1-Click Instant Demo Login (Zero typing required)"
              >
                <div style={pillShineStyle} />
                <Zap className="w-4 h-4 text-yellow-300" />
                <span>{isQuickLoggingIn ? 'Launching…' : 'Quick Tour'}</span>
              </button>
            </div>

            {/* Bottom Hint */}
            <div className="flex items-center justify-between text-[11px] text-sky-100/80 font-bold px-1">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                <span>Secure demo & Google authentication included</span>
              </span>
              <span className="hidden sm:inline">Orbit 360° with mouse</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * RetailVision - Interactive 3D Storefront Landing Page
 * Completely built in code via Three.js (@react-three/fiber & @react-three/drei)
 * Matching the exact architecture in Image 1:
 * - Cream stucco upper wall (#e2d9cc) with dual glowing amber wall sconces
 * - Black-framed 4-pane cross-mullion display windows with warm interior glow
 * - Dark walnut entrance door with central glass panel, hanging CLOSE sign, and interactive 3D padlock
 * - Lower brown wooden paneling (#78350f) with vertical relief slats (#451a03)
 * - Potted green spherical bush plants in corner planters
 * - Floating responsive glassmorphic UI overlay:
 *   - Top Bar: RV gradient logo, RetailVision branding, LIVE SIMULATION / V1.0 pill
 *   - Left Hero: "THE RETAIL OPERATING SYSTEM", "See the city behind your numbers", CTA button
 *   - Right Feature Card: "PLATFORM PULSE" telemetry with 2x2 metric grid
 *   - Bottom Pill: "Move cursor over the golden lock and click to unlock storefront"
 * - Dynamic mouse parallax, Web Audio mechanical sound synthesis, and door push-through transition
 * - Clean 3D scene matching Image 1!
 */

import React, { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { PerspectiveCamera, Text } from '@react-three/drei'
import * as THREE from 'three'
import { ArrowUpRight, Lock, Activity, Sparkles, Box, ShieldCheck, BarChart3 } from 'lucide-react'

interface StorefrontSceneProps {
  onUnlockClick: () => void
  isUnlocked: boolean
  isTransitioning: boolean
}

// ----------------------------------------------------------------------
// Audio Synthesizer: Mechanical Metallic Tumbler & Brass Harmonic Ring
// ----------------------------------------------------------------------
function playMechanicalUnlockAudio() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()

    // Tumbler clack
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = 'triangle'
    osc1.frequency.setValueAtTime(380, ctx.currentTime)
    osc1.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.08)
    gain1.gain.setValueAtTime(0.45, ctx.currentTime)
    gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08)
    osc1.connect(gain1)
    gain1.connect(ctx.destination)
    osc1.start()
    osc1.stop(ctx.currentTime + 0.08)

    // Brass chime resonance
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.04)
    osc2.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.22)
    gain2.gain.setValueAtTime(0.3, ctx.currentTime + 0.04)
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    osc2.start(ctx.currentTime + 0.04)
    osc2.stop(ctx.currentTime + 0.3)
  } catch {
    // Audio fallback
  }
}

// ----------------------------------------------------------------------
// Interactive 3D Padlock Component
// ----------------------------------------------------------------------
function Padlock3D({
  isUnlocked,
  onClick
}: {
  isUnlocked: boolean
  onClick: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const lockRef = useRef<THREE.Group>(null)
  const shackleRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (lockRef.current) {
      const t = state.clock.getElapsedTime()
      if (hovered && !isUnlocked) {
        lockRef.current.position.y = -0.15 + Math.sin(t * 5) * 0.018
        lockRef.current.rotation.y = Math.sin(t * 3) * 0.08
      } else {
        lockRef.current.position.y = -0.15
        lockRef.current.rotation.y = 0
      }
    }

    if (shackleRef.current && isUnlocked) {
      shackleRef.current.position.y = THREE.MathUtils.lerp(shackleRef.current.position.y, 0.42, 0.1)
      shackleRef.current.rotation.y = THREE.MathUtils.lerp(shackleRef.current.rotation.y, 0.5, 0.1)
    }
  })

  return (
    <group
      ref={lockRef}
      position={[0.38, -0.15, 0.18]}
      onClick={(e) => {
        e.stopPropagation()
        playMechanicalUnlockAudio()
        onClick()
      }}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        setHovered(false)
        document.body.style.cursor = 'default'
      }}
    >
      {/* Padlock Body */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.26, 0.32, 0.12]} />
        <meshStandardMaterial
          color={hovered ? '#fbbf24' : '#d97706'}
          metalness={0.88}
          roughness={0.25}
          emissive={hovered ? '#f59e0b' : '#78350f'}
          emissiveIntensity={hovered ? 0.45 : 0.15}
        />
      </mesh>

      {/* Keyhole */}
      <mesh position={[0, -0.04, 0.065]}>
        <circleGeometry args={[0.035, 16]} />
        <meshBasicMaterial color="#1f2937" />
      </mesh>
      <mesh position={[0, -0.09, 0.065]}>
        <planeGeometry args={[0.02, 0.06]} />
        <meshBasicMaterial color="#1f2937" />
      </mesh>

      {/* Padlock Shackle */}
      <mesh ref={shackleRef} position={[0, 0.22, 0]} castShadow>
        <torusGeometry args={[0.11, 0.032, 16, 32, Math.PI]} />
        <meshStandardMaterial
          color={hovered ? '#e2e8f0' : '#94a3b8'}
          metalness={0.95}
          roughness={0.15}
        />
      </mesh>

      {/* 3D Status Tag below lock */}
      <group position={[0, -0.32, 0.1]}>
        <Text
          fontSize={0.075}
          color={isUnlocked ? '#22c55e' : (hovered ? '#38bdf8' : '#cbd5e1')}
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
          letterSpacing={0.12}
        >
          {isUnlocked ? 'UNLOCKED' : (hovered ? 'CLICK TO UNLOCK' : 'LOCKED')}
        </Text>
      </group>
    </group>
  )
}

// ----------------------------------------------------------------------
// Complete 3D Architectural Storefront Matching Image 1
// ----------------------------------------------------------------------
function Storefront3DModel({
  isUnlocked,
  onUnlockClick
}: {
  isUnlocked: boolean
  onUnlockClick: () => void
}) {
  const doorRef = useRef<THREE.Group>(null)

  useFrame(() => {
    if (doorRef.current && isUnlocked) {
      // Swing door inward
      doorRef.current.rotation.y = THREE.MathUtils.lerp(doorRef.current.rotation.y, -Math.PI / 2.2, 0.04)
    }
  })

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Stone Ground Pavement */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.1, 1]} receiveShadow>
        <planeGeometry args={[14, 8]} />
        <meshStandardMaterial color="#334155" roughness={0.8} />
      </mesh>

      {/* Raised Step in front of door */}
      <mesh position={[0, -1.95, 0.4]} receiveShadow castShadow>
        <boxGeometry args={[4.2, 0.2, 1.0]} />
        <meshStandardMaterial color="#475569" roughness={0.7} />
      </mesh>

      {/* 2. Outer Wall Facade (Warm Stucco #e2d9cc) */}
      <mesh position={[0, 0.8, -0.1]} receiveShadow>
        <boxGeometry args={[10, 5.8, 0.2]} />
        <meshStandardMaterial color="#e2d9cc" roughness={0.9} />
      </mesh>

      {/* 3. Lower Wooden Wall Paneling (#78350f) */}
      <mesh position={[0, -1.0, 0.05]} castShadow receiveShadow>
        <boxGeometry args={[8.4, 1.8, 0.15]} />
        <meshStandardMaterial color="#78350f" roughness={0.5} />
      </mesh>

      {/* Vertical Wood Slats on Lower Paneling (#451a03) */}
      {[-3.6, -2.8, -2.0, 2.0, 2.8, 3.6].map((x, i) => (
        <mesh key={i} position={[x, -1.0, 0.14]}>
          <boxGeometry args={[0.04, 1.76, 0.04]} />
          <meshStandardMaterial color="#451a03" roughness={0.4} />
        </mesh>
      ))}

      {/* 4. Upper Storefront Header & Fascia Beam (#292524) */}
      <mesh position={[0, 2.65, 0.2]} castShadow receiveShadow>
        <boxGeometry args={[8.8, 0.9, 0.4]} />
        <meshStandardMaterial color="#292524" roughness={0.4} />
      </mesh>

      {/* 5. LEFT WINDOW (2.8m x 2.2m with 4-Pane Cross-Mullion Divider) */}
      <group position={[-2.7, 0.5, 0]}>
        {/* Outer Black Window Frame */}
        <mesh position={[0, 0, 0.05]} castShadow>
          <boxGeometry args={[2.8, 2.2, 0.12]} />
          <meshStandardMaterial color="#1c1917" roughness={0.4} />
        </mesh>
        {/* Warm Translucent Glass Pane */}
        <mesh position={[0, 0, 0.06]}>
          <planeGeometry args={[2.5, 1.9]} />
          <meshPhysicalMaterial
            color="#fed7aa"
            transparent
            opacity={0.35}
            roughness={0.05}
            transmission={0.85}
            ior={1.45}
          />
        </mesh>
        {/* Cross-Mullion: Vertical Center Black Divider Bar */}
        <mesh position={[0, 0, 0.075]}>
          <boxGeometry args={[0.07, 1.9, 0.06]} />
          <meshStandardMaterial color="#1c1917" roughness={0.3} />
        </mesh>
        {/* Cross-Mullion: Horizontal Center Black Divider Bar */}
        <mesh position={[0, 0, 0.075]}>
          <boxGeometry args={[2.5, 0.07, 0.06]} />
          <meshStandardMaterial color="#1c1917" roughness={0.3} />
        </mesh>

        {/* Interior Shelves visible through glass */}
        <mesh position={[0, -0.3, -0.6]}>
          <boxGeometry args={[2.2, 0.06, 0.4]} />
          <meshStandardMaterial color="#78350f" />
        </mesh>
        <mesh position={[0, 0.3, -0.6]}>
          <boxGeometry args={[2.2, 0.06, 0.4]} />
          <meshStandardMaterial color="#78350f" />
        </mesh>
        {/* Hanging Warm Pendant Lamp */}
        <mesh position={[0, 1.2, -0.5]}>
          <cylinderGeometry args={[0.01, 0.01, 0.6, 8]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        <mesh position={[0, 0.85, -0.5]}>
          <coneGeometry args={[0.22, 0.2, 16]} />
          <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={0.8} />
        </mesh>
        <pointLight position={[0, 0.7, -0.5]} intensity={2.8} distance={5} color="#fed7aa" />
      </group>

      {/* 6. RIGHT WINDOW (2.8m x 2.2m with 4-Pane Cross-Mullion Divider) */}
      <group position={[2.7, 0.5, 0]}>
        <mesh position={[0, 0, 0.05]} castShadow>
          <boxGeometry args={[2.8, 2.2, 0.12]} />
          <meshStandardMaterial color="#1c1917" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0, 0.06]}>
          <planeGeometry args={[2.5, 1.9]} />
          <meshPhysicalMaterial
            color="#fed7aa"
            transparent
            opacity={0.35}
            roughness={0.05}
            transmission={0.85}
            ior={1.45}
          />
        </mesh>
        {/* Cross-Mullion: Vertical Center Black Divider Bar */}
        <mesh position={[0, 0, 0.075]}>
          <boxGeometry args={[0.07, 1.9, 0.06]} />
          <meshStandardMaterial color="#1c1917" roughness={0.3} />
        </mesh>
        {/* Cross-Mullion: Horizontal Center Black Divider Bar */}
        <mesh position={[0, 0, 0.075]}>
          <boxGeometry args={[2.5, 0.07, 0.06]} />
          <meshStandardMaterial color="#1c1917" roughness={0.3} />
        </mesh>

        {/* Interior Shelves visible through glass */}
        <mesh position={[0, -0.3, -0.6]}>
          <boxGeometry args={[2.2, 0.06, 0.4]} />
          <meshStandardMaterial color="#78350f" />
        </mesh>
        <mesh position={[0, 0.3, -0.6]}>
          <boxGeometry args={[2.2, 0.06, 0.4]} />
          <meshStandardMaterial color="#78350f" />
        </mesh>
        {/* Hanging Warm Pendant Lamp */}
        <mesh position={[0, 1.2, -0.5]}>
          <cylinderGeometry args={[0.01, 0.01, 0.6, 8]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        <mesh position={[0, 0.85, -0.5]}>
          <coneGeometry args={[0.22, 0.2, 16]} />
          <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={0.8} />
        </mesh>
        <pointLight position={[0, 0.7, -0.5]} intensity={2.8} distance={5} color="#fed7aa" />
      </group>

      {/* 7. CENTRAL DOORWAY & DOOR ASSEMBLY */}
      <group position={[0, 0, 0]}>
        {/* Outer Wooden/Black Door Frame (#292524) */}
        <mesh position={[0, 0.05, 0.08]} castShadow>
          <boxGeometry args={[1.7, 3.8, 0.16]} />
          <meshStandardMaterial color="#1c1917" roughness={0.5} />
        </mesh>

        {/* SWINGING DOOR */}
        <group ref={doorRef} position={[-0.7, 0, 0.12]}>
          <group position={[0.7, 0, 0]}>
            {/* Main Door Leaf offset */}
            <mesh castShadow receiveShadow>
              <boxGeometry args={[1.4, 3.6, 0.1]} />
              <meshStandardMaterial color="#592b02" roughness={0.4} />
            </mesh>

            {/* Central Glass Upper Pane on Door */}
            <mesh position={[0, 0.7, 0]}>
              <boxGeometry args={[1.0, 1.7, 0.12]} />
              <meshPhysicalMaterial
                color="#fef3c7"
                transparent
                opacity={0.3}
                roughness={0.05}
                transmission={0.85}
              />
            </mesh>

            {/* Hanging "CLOSE" Sign */}
            <group position={[0, 0.9, 0.08]}>
              <mesh castShadow>
                <boxGeometry args={[0.65, 0.28, 0.02]} />
                <meshStandardMaterial color="#1c1917" roughness={0.4} />
              </mesh>
              <Text
                position={[0, 0, 0.02]}
                fontSize={0.12}
                color={isUnlocked ? "#22c55e" : "#fef08a"}
                anchorX="center"
                anchorY="middle"
                fontWeight="bold"
              >
                {isUnlocked ? "OPEN" : "CLOSE"}
              </Text>
              {/* String hanging cords */}
              <mesh position={[-0.2, 0.22, 0]} rotation={[0, 0, -0.4]}>
                <cylinderGeometry args={[0.005, 0.005, 0.25, 8]} />
                <meshBasicMaterial color="#e2e8f0" />
              </mesh>
              <mesh position={[0.2, 0.22, 0]} rotation={[0, 0, 0.4]}>
                <cylinderGeometry args={[0.005, 0.005, 0.25, 8]} />
                <meshBasicMaterial color="#e2e8f0" />
              </mesh>
            </group>

            {/* Metallic Door Handle */}
            <mesh position={[0.42, -0.15, 0.1]} castShadow>
              <cylinderGeometry args={[0.02, 0.02, 0.35, 12]} />
              <meshStandardMaterial color="#d1d5db" metalness={0.9} roughness={0.2} />
            </mesh>

            {/* INTERACTIVE 3D PADLOCK */}
            <Padlock3D isUnlocked={isUnlocked} onClick={onUnlockClick} />
          </group>
        </group>
      </group>

      {/* 8. POTTED PLANTS FLANKING ENTRANCE */}
      {/* Left Plant */}
      <group position={[-3.8, -1.3, 0.7]}>
        <mesh position={[0, -0.3, 0]} castShadow>
          <cylinderGeometry args={[0.35, 0.25, 0.8, 24]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.35, 0]} castShadow>
          <sphereGeometry args={[0.48, 16, 16]} />
          <meshStandardMaterial color="#15803d" roughness={0.8} />
        </mesh>
        <mesh position={[0.1, 0.55, 0.1]} castShadow>
          <sphereGeometry args={[0.32, 16, 16]} />
          <meshStandardMaterial color="#16a34a" roughness={0.8} />
        </mesh>
      </group>

      {/* Right Plant */}
      <group position={[3.8, -1.3, 0.7]}>
        <mesh position={[0, -0.3, 0]} castShadow>
          <cylinderGeometry args={[0.35, 0.25, 0.8, 24]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.35, 0]} castShadow>
          <sphereGeometry args={[0.48, 16, 16]} />
          <meshStandardMaterial color="#15803d" roughness={0.8} />
        </mesh>
        <mesh position={[-0.1, 0.55, 0.1]} castShadow>
          <sphereGeometry args={[0.32, 16, 16]} />
          <meshStandardMaterial color="#16a34a" roughness={0.8} />
        </mesh>
      </group>

      {/* 9. Wall Sconce Lights (Warm Amber Glowing Spheres on Cream Wall) */}
      <group position={[-1.2, 1.8, 0.25]}>
        <mesh>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={1.2} />
        </mesh>
        <pointLight intensity={2.2} distance={4.0} color="#fed7aa" />
      </group>
      <group position={[1.2, 1.8, 0.25]}>
        <mesh>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={1.2} />
        </mesh>
        <pointLight intensity={2.2} distance={4.0} color="#fed7aa" />
      </group>

      {/* Interior Depth Fill */}
      <mesh position={[0, 0.5, -1.8]}>
        <planeGeometry args={[9, 5]} />
        <meshStandardMaterial color="#451a03" roughness={0.9} />
      </mesh>
      <pointLight position={[0, 1.0, -1.2]} intensity={4.5} distance={8} color="#fed7aa" />
    </group>
  )
}

// ----------------------------------------------------------------------
// Camera Controller for Mouse Parallax & Cinematic Entry
// ----------------------------------------------------------------------
function StorefrontCameraRig({ isTransitioning }: { isTransitioning: boolean }) {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null)

  useFrame((state) => {
    if (!cameraRef.current) return

    if (isTransitioning) {
      // Smoothly push camera through the open door
      cameraRef.current.position.z = THREE.MathUtils.lerp(cameraRef.current.position.z, -1.2, 0.04)
      cameraRef.current.position.y = THREE.MathUtils.lerp(cameraRef.current.position.y, 0.1, 0.04)
    } else {
      // Subtle breathing motion based on mouse pointer
      const targetX = state.pointer.x * 0.28
      const targetY = state.pointer.y * 0.16 + 0.12
      cameraRef.current.position.x = THREE.MathUtils.lerp(cameraRef.current.position.x, targetX, 0.05)
      cameraRef.current.position.y = THREE.MathUtils.lerp(cameraRef.current.position.y, targetY, 0.05)
      cameraRef.current.lookAt(0, 0.2, 0)
    }
  })

  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault
      position={[0, 0.15, 4.8]}
      fov={48}
    />
  )
}

// ----------------------------------------------------------------------
// Master Component: 3D Scene + Real HTML/Tailwind Responsive UI Overlay
// ----------------------------------------------------------------------
export const StorefrontScene: React.FC<StorefrontSceneProps> = ({
  onUnlockClick,
  isUnlocked,
  isTransitioning
}) => {
  const [activeTile, setActiveTile] = useState<number | null>(null)

  const handleUnlockTrigger = () => {
    playMechanicalUnlockAudio()
    onUnlockClick()
  }

  return (
    <div className="relative w-full h-full bg-slate-950 overflow-hidden select-none">
      {/* ------------------------------------------------------------------ */}
      {/* 1. ACTUAL 3D WEBGL THREE.JS CANVAS ENVIRONMENT                     */}
      {/* ------------------------------------------------------------------ */}
      <div className="absolute inset-0 z-0">
        <Canvas shadows className="w-full h-full">
          <StorefrontCameraRig isTransitioning={isTransitioning} />

          {/* Atmospheric Lighting */}
          <ambientLight intensity={0.55} color="#94a3b8" />
          <directionalLight
            position={[4, 8, 6]}
            intensity={1.2}
            color="#fef08a"
            castShadow
            shadow-mapSize={[1024, 1024]}
          />

          <Storefront3DModel
            isUnlocked={isUnlocked}
            onUnlockClick={handleUnlockTrigger}
          />
        </Canvas>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 2. REAL CODED HTML/TAILWIND UI OVERLAY (Matching Image 1)          */}
      {/* ------------------------------------------------------------------ */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-6 md:p-8 lg:p-10">
        {/* TOP BAR */}
        <div className="w-full flex items-center justify-between pointer-events-auto">
          {/* Top Left Brand Logo */}
          <div className="flex items-center gap-3">
            {/* RV Gradient Square Icon */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25 border border-white/10">
              <span className="text-white font-black text-sm tracking-tighter">RV</span>
            </div>
            {/* Brand Typography */}
            <div>
              <div className="text-lg font-bold tracking-tight text-white flex items-center">
                <span>Retail</span>
                <span className="text-cyan-400">Vision</span>
              </div>
              <div className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase">
                COMMERCE INTELLIGENCE
              </div>
            </div>
          </div>

          {/* Top Right Live Simulation Status Badge */}
          <div className="px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center gap-2 shadow-xl">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
            <span className="text-xs font-bold text-white/90 tracking-wider uppercase">
              LIVE SIMULATION / V1.0
            </span>
          </div>
        </div>

        {/* MIDDLE SECTION: HERO ON LEFT & PLATFORM PULSE ON RIGHT */}
        <div className="w-full flex items-center justify-between my-auto pointer-events-none">
          {/* Left Hero Text Block (Floating over Left Window) */}
          <div className="max-w-md pointer-events-auto">
            {/* Pill Tag */}
            <div className="px-3.5 py-1.5 rounded-full bg-cyan-950/70 backdrop-blur-md border border-cyan-500/30 text-cyan-400 text-xs font-semibold tracking-wider flex items-center gap-1.5 w-fit shadow-lg mb-4">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>THE RETAIL OPERATING SYSTEM</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.08] mb-4 drop-shadow-md">
              See the city<br />
              behind your<br />
              numbers.
            </h1>

            {/* Subtitle Description */}
            <p className="text-slate-200 text-sm leading-relaxed mb-6 max-w-sm drop-shadow">
              Step into an interactive retail district where every storefront turns sales data into a decision you can act on.
            </p>

            {/* Action CTA Button & Demo Access */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleUnlockTrigger}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-400/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
              >
                <span>Enter the marketplace</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>

              <div
                onClick={handleUnlockTrigger}
                className="flex items-center gap-1.5 text-xs text-slate-300/80 hover:text-amber-300 cursor-pointer transition-colors"
                title="Click to auto-fill demo credentials: admin@retailvision.com / admin123"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Secure demo access included</span>
              </div>
            </div>
          </div>

          {/* Right Platform Pulse Telemetry Card (Floating over Right Window) */}
          <div className="pointer-events-auto w-72 rounded-2xl bg-slate-950/80 backdrop-blur-xl border border-white/10 p-4 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <span className="text-xs font-bold tracking-wider text-slate-200 uppercase">
                PLATFORM PULSE
              </span>
              <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
            </div>

            {/* 2x2 Feature Metric Grid */}
            <div className="grid grid-cols-2 gap-2.5 mt-3">
              {/* Tile 1: 360° Visibility */}
              <div
                onMouseEnter={() => setActiveTile(1)}
                onMouseLeave={() => setActiveTile(null)}
                className={`bg-white/[0.03] border border-white/5 rounded-xl p-3 flex flex-col transition-all duration-200 cursor-pointer ${
                  activeTile === 1 ? 'border-cyan-500/50 bg-cyan-500/10 scale-[1.02]' : ''
                }`}
              >
                <BarChart3 className="w-4 h-4 text-cyan-400 mb-2" />
                <span className="text-lg font-bold text-white leading-none mb-1">360°</span>
                <span className="text-[11px] text-slate-400">visibility</span>
              </div>

              {/* Tile 2: 3D Retail City */}
              <div
                onMouseEnter={() => setActiveTile(2)}
                onMouseLeave={() => setActiveTile(null)}
                className={`bg-white/[0.03] border border-white/5 rounded-xl p-3 flex flex-col transition-all duration-200 cursor-pointer ${
                  activeTile === 2 ? 'border-amber-500/50 bg-amber-500/10 scale-[1.02]' : ''
                }`}
              >
                <Box className="w-4 h-4 text-amber-400 mb-2" />
                <span className="text-lg font-bold text-white leading-none mb-1">3D</span>
                <span className="text-[11px] text-slate-400">retail city</span>
              </div>

              {/* Tile 3: Live Insights */}
              <div
                onMouseEnter={() => setActiveTile(3)}
                onMouseLeave={() => setActiveTile(null)}
                className={`bg-white/[0.03] border border-white/5 rounded-xl p-3 flex flex-col transition-all duration-200 cursor-pointer ${
                  activeTile === 3 ? 'border-emerald-500/50 bg-emerald-500/10 scale-[1.02]' : ''
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400 mb-2" />
                <span className="text-lg font-bold text-white leading-none mb-1">Live</span>
                <span className="text-[11px] text-slate-400">insights</span>
              </div>

              {/* Tile 4: ML Forecasts */}
              <div
                onMouseEnter={() => setActiveTile(4)}
                onMouseLeave={() => setActiveTile(null)}
                className={`bg-white/[0.03] border border-white/5 rounded-xl p-3 flex flex-col transition-all duration-200 cursor-pointer ${
                  activeTile === 4 ? 'border-purple-500/50 bg-purple-500/10 scale-[1.02]' : ''
                }`}
              >
                <Sparkles className="w-4 h-4 text-purple-400 mb-2" />
                <span className="text-lg font-bold text-white leading-none mb-1">ML</span>
                <span className="text-[11px] text-slate-400">forecasts</span>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM INSTRUCTION PILL */}
        <div className="w-full flex justify-center pointer-events-auto">
          <div
            onClick={handleUnlockTrigger}
            className="px-6 py-2.5 rounded-full bg-black/80 backdrop-blur-md border border-amber-500/30 text-amber-300 text-xs font-medium shadow-2xl flex items-center gap-2.5 hover:border-amber-400/60 cursor-pointer transition-all hover:scale-[1.02]"
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_#f59e0b]" />
            <span>Move cursor over the golden lock and click to unlock storefront</span>
          </div>
        </div>
      </div>

      {/* Cinematic Flash when Door Opens */}
      {isTransitioning && (
        <div className="absolute inset-0 z-20 bg-gradient-to-t from-amber-400/40 via-white/60 to-amber-200/50 pointer-events-none animate-pulse transition-opacity duration-700" />
      )}
    </div>
  )
}

/**
 * RetailVision - Interactive Photorealistic 3D Storefront Landing Page
 * Engineered in WebGL via Three.js (@react-three/fiber & @react-three/drei)
 * Matching the Master Visual Mockup:
 * - Upper Ashlar stone masonry facade with authentic stone texture
 * - Warm dark walnut vertical fluted wood slat wainscoting with chair-rail trim
 * - Left & Right showroom display windows with warm glowing boutique interiors,
 *   interior shelves, hanging industrial pendant lamps, and physical glass transmission
 * - Dark walnut paneled entrance door with traditional panels, hanging CLOSE/OPEN plaque,
 *   vertical architectural pull handle, and interactive 3D golden padlock
 * - Dual architectural cylinder sconces casting up/down photometric wall-wash light cones
 * - 5 Ceiling recessed canister spotlights casting warm pools of light downward
 * - Charcoal slate floor paving slabs capturing specular reflections
 * - Corner concrete planters with lush multi-leaf tropical foliage
 * - Floating glassmorphic responsive UI overlay matching the layout
 * - Web Audio API mechanical tumbler click and brass harmonic resonance
 * - Door swing physics & push-through camera transition into the 3D retail city
 */

import React, { useRef, useState, useMemo, useEffect } from 'react'
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
// Recessed Ceiling Canister Downlight
// ----------------------------------------------------------------------
function RecessedDownlight({ position }: { position: [number, number, number] }) {
  const lightRef = useRef<THREE.SpotLight>(null)
  const targetRef = useRef<THREE.Object3D>(null)

  useEffect(() => {
    if (lightRef.current && targetRef.current) {
      lightRef.current.target = targetRef.current
    }
  }, [])

  return (
    <group position={position}>
      {/* Bezel Ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.03, 16]} />
        <meshStandardMaterial color="#18181b" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Glowing Lens */}
      <mesh position={[0, -0.016, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.065, 16]} />
        <meshBasicMaterial color="#ffeed1" />
      </mesh>
      {/* Downward Spotlight */}
      <spotLight
        ref={lightRef}
        position={[0, -0.02, 0]}
        color="#ffe2be"
        intensity={3.2}
        distance={6.5}
        angle={0.52}
        penumbra={0.75}
      />
      <object3D ref={targetRef} position={[0, -4, 0.3]} />
    </group>
  )
}

// ----------------------------------------------------------------------
// Architectural Cylinder Wall Sconce with Up/Down Light Cones
// ----------------------------------------------------------------------
function WallSconce({ position }: { position: [number, number, number] }) {
  const upLightRef = useRef<THREE.SpotLight>(null)
  const downLightRef = useRef<THREE.SpotLight>(null)
  const upTargetRef = useRef<THREE.Object3D>(null)
  const downTargetRef = useRef<THREE.Object3D>(null)

  useEffect(() => {
    if (upLightRef.current && upTargetRef.current) {
      upLightRef.current.target = upTargetRef.current
    }
    if (downLightRef.current && downTargetRef.current) {
      downLightRef.current.target = downTargetRef.current
    }
  }, [])

  return (
    <group position={position}>
      {/* Wall Bracket */}
      <mesh position={[0, 0, -0.06]}>
        <boxGeometry args={[0.07, 0.32, 0.03]} />
        <meshStandardMaterial color="#0f0f10" metalness={0.85} roughness={0.3} />
      </mesh>

      {/* Fixture Cylinder Body */}
      <mesh castShadow>
        <cylinderGeometry args={[0.055, 0.055, 0.42, 24]} />
        <meshStandardMaterial color="#18181b" metalness={0.85} roughness={0.25} />
      </mesh>

      {/* Top Diffuser Cap */}
      <mesh position={[0, 0.211, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.053, 16]} />
        <meshBasicMaterial color="#ffcca0" />
      </mesh>

      {/* Bottom Diffuser Cap */}
      <mesh position={[0, -0.211, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.053, 16]} />
        <meshBasicMaterial color="#ffcca0" />
      </mesh>

      {/* Upward Spotlight onto Stone Wall */}
      <spotLight
        ref={upLightRef}
        position={[0, 0.22, 0]}
        color="#ffae58"
        intensity={5.5}
        distance={4.0}
        angle={0.65}
        penumbra={0.8}
      />
      <object3D ref={upTargetRef} position={[0, 1.8, -0.08]} />

      {/* Downward Spotlight onto Wood Slats */}
      <spotLight
        ref={downLightRef}
        position={[0, -0.22, 0]}
        color="#ffae58"
        intensity={5.5}
        distance={4.0}
        angle={0.65}
        penumbra={0.8}
      />
      <object3D ref={downTargetRef} position={[0, -1.8, -0.08]} />

      {/* Local Ambient Wall Glow */}
      <pointLight color="#ffba6e" intensity={1.8} distance={2.5} />
    </group>
  )
}

// ----------------------------------------------------------------------
// Showroom Window with HOLLOW Frame and Illuminated Boutique Interior
// ----------------------------------------------------------------------
function ShowroomWindow({
  position,
  interiorTexture
}: {
  position: [number, number, number]
  interiorTexture: THREE.Texture
}) {
  return (
    <group position={position}>
      {/* 1. Hollow Black Steel Window Outer Frame (4 Border Bars - NEVER a solid box!) */}
      {/* Top Bar */}
      <mesh position={[0, 1.1, 0.05]} castShadow>
        <boxGeometry args={[2.85, 0.08, 0.1]} />
        <meshStandardMaterial color="#18181b" metalness={0.7} roughness={0.35} />
      </mesh>
      {/* Bottom Bar */}
      <mesh position={[0, -1.1, 0.05]} castShadow>
        <boxGeometry args={[2.85, 0.08, 0.1]} />
        <meshStandardMaterial color="#18181b" metalness={0.7} roughness={0.35} />
      </mesh>
      {/* Left Bar */}
      <mesh position={[-1.38, 0, 0.05]} castShadow>
        <boxGeometry args={[0.08, 2.25, 0.1]} />
        <meshStandardMaterial color="#18181b" metalness={0.7} roughness={0.35} />
      </mesh>
      {/* Right Bar */}
      <mesh position={[1.38, 0, 0.05]} castShadow>
        <boxGeometry args={[0.08, 2.25, 0.1]} />
        <meshStandardMaterial color="#18181b" metalness={0.7} roughness={0.35} />
      </mesh>

      {/* Center Vertical Mullion Divider Bar */}
      <mesh position={[0, 0, 0.06]}>
        <boxGeometry args={[0.06, 2.15, 0.06]} />
        <meshStandardMaterial color="#18181b" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Horizontal Transom Divider Bar */}
      <mesh position={[0, 0, 0.06]}>
        <boxGeometry args={[2.75, 0.06, 0.06]} />
        <meshStandardMaterial color="#18181b" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* 2. Window Glass Pane */}
      <mesh position={[0, 0, 0.04]}>
        <planeGeometry args={[2.75, 2.15]} />
        <meshPhysicalMaterial
          color="#ffffff"
          roughness={0.05}
          transmission={0.85}
          reflectivity={0.65}
          transparent
          opacity={0.35}
        />
      </mesh>

      {/* 3. Venetian Blinds along Top of Window */}
      {[0.82, 0.89, 0.96, 1.03].map((y, i) => (
        <mesh key={i} position={[0, y, 0.02]} rotation={[0.2, 0, 0]}>
          <boxGeometry args={[2.7, 0.025, 0.03]} />
          <meshStandardMaterial color="#18181b" roughness={0.5} />
        </mesh>
      ))}

      {/* 4. BOUTIQUE INTERIOR SHOWROOM (Clean, bright, luxury interior view!) */}
      <mesh position={[0, 0, -0.4]}>
        <planeGeometry args={[2.75, 2.15]} />
        <meshBasicMaterial map={interiorTexture} />
      </mesh>

      {/* Hanging Black Industrial Pendant Lamp */}
      <group position={[0, 0.75, -0.2]}>
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.005, 0.005, 0.4, 8]} />
          <meshBasicMaterial color="#18181b" />
        </mesh>
        <mesh castShadow>
          <coneGeometry args={[0.2, 0.14, 20]} />
          <meshStandardMaterial color="#18181b" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0, -0.05, 0]}>
          <sphereGeometry args={[0.045, 16, 16]} />
          <meshBasicMaterial color="#ffe8b3" />
        </mesh>
      </group>

      {/* Warm Local Interior Light */}
      <pointLight position={[0, 0.4, -0.2]} intensity={3.0} distance={4} color="#ffd49e" />
    </group>
  )
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
      position={[0.38, -0.15, 0.12]}
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
        <boxGeometry args={[0.26, 0.32, 0.1]} />
        <meshStandardMaterial
          color={hovered ? '#fbbf24' : '#eab308'}
          metalness={0.9}
          roughness={0.22}
          emissive={hovered ? '#f59e0b' : '#b45309'}
          emissiveIntensity={hovered ? 0.45 : 0.15}
        />
      </mesh>

      {/* Keyhole */}
      <mesh position={[0, -0.04, 0.055]}>
        <circleGeometry args={[0.035, 16]} />
        <meshBasicMaterial color="#1f2937" />
      </mesh>
      <mesh position={[0, -0.09, 0.055]}>
        <planeGeometry args={[0.02, 0.06]} />
        <meshBasicMaterial color="#1f2937" />
      </mesh>

      {/* Padlock Shackle */}
      <mesh ref={shackleRef} position={[0, 0.22, 0]} castShadow>
        <torusGeometry args={[0.11, 0.032, 16, 32, Math.PI]} />
        <meshStandardMaterial
          color={hovered ? '#f1f5f9' : '#cbd5e1'}
          metalness={0.95}
          roughness={0.15}
        />
      </mesh>

      {/* 3D Status Tag below lock */}
      <group position={[0, -0.32, 0.08]}>
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
// Dark Walnut Entrance Door with Traditional Panels, Pull Handle, Sign & Lock
// ----------------------------------------------------------------------
function StorefrontDoor({
  isUnlocked,
  onUnlockClick,
  doorTexture
}: {
  isUnlocked: boolean
  onUnlockClick: () => void
  doorTexture: THREE.Texture
}) {
  const doorRef = useRef<THREE.Group>(null)

  useFrame(() => {
    if (doorRef.current && isUnlocked) {
      // Swing door inward smoothly
      doorRef.current.rotation.y = THREE.MathUtils.lerp(
        doorRef.current.rotation.y,
        -Math.PI / 2.2,
        0.04
      )
    }
  })

  return (
    <group position={[0, 0, 0]}>
      {/* Outer Door Frame (Hollow 3 Bars - Top, Left, Right) */}
      <mesh position={[0, 1.88, 0.06]} castShadow>
        <boxGeometry args={[1.65, 0.08, 0.12]} />
        <meshStandardMaterial color="#18181b" metalness={0.7} roughness={0.35} />
      </mesh>
      <mesh position={[-0.78, 0, 0.06]} castShadow>
        <boxGeometry args={[0.08, 3.75, 0.12]} />
        <meshStandardMaterial color="#18181b" metalness={0.7} roughness={0.35} />
      </mesh>
      <mesh position={[0.78, 0, 0.06]} castShadow>
        <boxGeometry args={[0.08, 3.75, 0.12]} />
        <meshStandardMaterial color="#18181b" metalness={0.7} roughness={0.35} />
      </mesh>

      {/* HINGED SWINGING DOOR ASSEMBLY */}
      <group ref={doorRef} position={[-0.72, 0, 0.05]}>
        <group position={[0.72, 0, 0]}>
          {/* Main Door Slab with PBR Dark Walnut Panels Texture */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.44, 3.65, 0.06]} />
            <meshStandardMaterial
              map={doorTexture}
              color="#ffffff"
              roughness={0.35}
              metalness={0.05}
            />
          </mesh>

          {/* Hanging "CLOSE" Sign */}
          <group position={[0, 0.85, 0.05]}>
            <mesh position={[-0.18, 0.22, 0]} rotation={[0, 0, -0.42]}>
              <cylinderGeometry args={[0.003, 0.003, 0.32, 8]} />
              <meshBasicMaterial color="#e2e8f0" />
            </mesh>
            <mesh position={[0.18, 0.22, 0]} rotation={[0, 0, 0.42]}>
              <cylinderGeometry args={[0.003, 0.003, 0.32, 8]} />
              <meshBasicMaterial color="#e2e8f0" />
            </mesh>

            <mesh castShadow>
              <boxGeometry args={[0.62, 0.26, 0.02]} />
              <meshStandardMaterial color="#18181b" metalness={0.6} roughness={0.35} />
            </mesh>
            <Text
              position={[0, 0, 0.015]}
              fontSize={0.12}
              color={isUnlocked ? '#22c55e' : '#fef08a'}
              anchorX="center"
              anchorY="middle"
              fontWeight="bold"
              letterSpacing={0.08}
            >
              {isUnlocked ? 'OPEN' : 'CLOSE'}
            </Text>
          </group>

          {/* Vertical Architectural Tubular Door Pull Handle */}
          <group position={[0.45, -0.15, 0.06]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.016, 0.016, 0.45, 16]} />
              <meshStandardMaterial color="#e2e8f0" metalness={0.92} roughness={0.18} />
            </mesh>
            <mesh position={[-0.03, 0.18, -0.02]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.012, 0.012, 0.06, 12]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
            </mesh>
            <mesh position={[-0.03, -0.18, -0.02]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.012, 0.012, 0.06, 12]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
            </mesh>
          </group>

          {/* INTERACTIVE 3D PADLOCK */}
          <Padlock3D isUnlocked={isUnlocked} onClick={onUnlockClick} />
        </group>
      </group>
    </group>
  )
}

// ----------------------------------------------------------------------
// Corner Ceramic Planter with Lush Tropical Foliage
// ----------------------------------------------------------------------
function StorefrontPlanter({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Tapered Concrete Planter Pot */}
      <mesh castShadow receiveShadow position={[0, -0.32, 0]}>
        <cylinderGeometry args={[0.36, 0.26, 0.82, 24]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.65} metalness={0.05} />
      </mesh>

      {/* Bush Core */}
      <mesh position={[0, 0.28, 0]} castShadow>
        <sphereGeometry args={[0.38, 16, 16]} />
        <meshStandardMaterial color="#14532d" roughness={0.8} />
      </mesh>

      {/* Multi-tier Angular Leaf Fronds */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
        const rad = (angle * Math.PI) / 180
        const x = Math.cos(rad) * 0.24
        const z = Math.sin(rad) * 0.24
        return (
          <group key={i} position={[x, 0.35 + (i % 2) * 0.08, z]} rotation={[0.4, rad, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.008, 0.012, 0.28, 8]} />
              <meshStandardMaterial color="#166534" />
            </mesh>
            <mesh position={[0, 0.2, 0]} castShadow>
              <sphereGeometry args={[0.18, 12, 12]} />
              <meshStandardMaterial color={i % 2 === 0 ? '#15803d' : '#16a34a'} roughness={0.7} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

// ----------------------------------------------------------------------
// Master 3D Architectural Scene Component
// ----------------------------------------------------------------------
function Storefront3DModel({
  isUnlocked,
  onUnlockClick
}: {
  isUnlocked: boolean
  onUnlockClick: () => void
}) {
  // Load high-resolution PBR textures
  const textures = useMemo(() => {
    const loader = new THREE.TextureLoader()
    const load = (url: string, rx = 1, ry = 1) => {
      const tex = loader.load(url)
      tex.wrapS = THREE.RepeatWrapping
      tex.wrapT = THREE.RepeatWrapping
      tex.repeat.set(rx, ry)
      tex.colorSpace = THREE.SRGBColorSpace
      return tex
    }
    return {
      stone: load('/textures/stone_wall.jpg', 3, 2),
      slats: load('/textures/fluted_wood.jpg', 5, 1),
      floor: load('/textures/floor_slate.jpg', 5, 4),
      door: load('/textures/door_clean.jpg', 1, 1),
      windowInterior: load('/textures/window_interior.jpg', 1, 1),
    }
  }, [])

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Stone Ground Pavement */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.05, 1]} receiveShadow>
        <planeGeometry args={[16, 10]} />
        <meshStandardMaterial
          map={textures.floor}
          color="#ffffff"
          roughness={0.5}
          metalness={0.1}
        />
      </mesh>

      {/* Raised Entrance Step */}
      <mesh position={[0, -1.95, 0.5]} receiveShadow castShadow>
        <boxGeometry args={[4.4, 0.2, 1.2]} />
        <meshStandardMaterial
          map={textures.floor}
          color="#e2e8f0"
          roughness={0.55}
          metalness={0.1}
        />
      </mesh>

      {/* 2. Upper Ashlar Stone Facade Wall */}
      <mesh position={[0, 1.15, -0.06]} receiveShadow>
        <boxGeometry args={[10, 2.6, 0.1]} />
        <meshStandardMaterial
          map={textures.stone}
          color="#ffffff"
          roughness={0.8}
        />
      </mesh>

      {/* 3. Lower Fluted Walnut Wood Wainscoting */}
      <mesh position={[0, -1.0, 0.02]} castShadow receiveShadow>
        <boxGeometry args={[9.2, 1.85, 0.1]} />
        <meshStandardMaterial
          map={textures.slats}
          color="#ffffff"
          roughness={0.4}
          metalness={0.05}
        />
      </mesh>

      {/* Horizontal Dividing Chair-Rail Moulding Trim */}
      <mesh position={[0, -0.08, 0.08]} castShadow receiveShadow>
        <boxGeometry args={[9.2, 0.06, 0.06]} />
        <meshStandardMaterial color="#2d1305" roughness={0.4} />
      </mesh>

      {/* Horizontal Baseboard Moulding Trim */}
      <mesh position={[0, -1.92, 0.08]} castShadow receiveShadow>
        <boxGeometry args={[9.2, 0.1, 0.06]} />
        <meshStandardMaterial color="#2d1305" roughness={0.4} />
      </mesh>

      {/* 4. Top Storefront Fascia Beam / Soffit Overhang */}
      <mesh position={[0, 2.45, 0.2]} castShadow receiveShadow>
        <boxGeometry args={[9.6, 0.55, 0.5]} />
        <meshStandardMaterial color="#18181b" roughness={0.4} metalness={0.6} />
      </mesh>

      {/* 5 Recessed Ceiling Canister Downlights */}
      {[-3.2, -1.6, 0, 1.6, 3.2].map((x, i) => (
        <RecessedDownlight key={i} position={[x, 2.2, 0.3]} />
      ))}

      {/* 5. Left Showroom Window */}
      <ShowroomWindow
        position={[-2.7, 0.45, 0]}
        interiorTexture={textures.windowInterior}
      />

      {/* 6. Right Showroom Window */}
      <ShowroomWindow
        position={[2.7, 0.45, 0]}
        interiorTexture={textures.windowInterior}
      />

      {/* 7. Central Entrance Door Assembly */}
      <StorefrontDoor
        isUnlocked={isUnlocked}
        onUnlockClick={onUnlockClick}
        doorTexture={textures.door}
      />

      {/* 8. Dual Wall Sconces Flanking Door */}
      <WallSconce position={[-1.38, 1.35, 0.18]} />
      <WallSconce position={[1.38, 1.35, 0.18]} />

      {/* 9. Flanking Potted Plants */}
      <StorefrontPlanter position={[-3.85, -1.25, 0.8]} />
      <StorefrontPlanter position={[3.85, -1.25, 0.8]} />
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
      cameraRef.current.position.z = THREE.MathUtils.lerp(cameraRef.current.position.z, -1.2, 0.04)
      cameraRef.current.position.y = THREE.MathUtils.lerp(cameraRef.current.position.y, 0.1, 0.04)
    } else {
      const targetX = state.pointer.x * 0.22
      const targetY = state.pointer.y * 0.12 + 0.12
      cameraRef.current.position.x = THREE.MathUtils.lerp(cameraRef.current.position.x, targetX, 0.05)
      cameraRef.current.position.y = THREE.MathUtils.lerp(cameraRef.current.position.y, targetY, 0.05)
      cameraRef.current.lookAt(0, 0.18, 0)
    }
  })

  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault
      position={[0, 0.12, 4.8]}
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
        <Canvas
          shadows
          gl={{
            antialias: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.15,
            powerPreference: 'high-performance'
          }}
          className="w-full h-full"
        >
          <StorefrontCameraRig isTransitioning={isTransitioning} />

          {/* Warm Architectural Environmental Light */}
          <ambientLight intensity={1.0} color="#ffffff" />
          <directionalLight
            position={[3, 6, 5]}
            intensity={1.2}
            color="#ffffff"
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
      {/* 2. REAL CODED HTML/TAILWIND UI OVERLAY (Matching Reference Layout) */}
      {/* ------------------------------------------------------------------ */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-6 md:p-8 lg:p-10">
        {/* TOP BAR */}
        <div className="w-full flex items-center justify-between pointer-events-auto">
          {/* Top Left Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25 border border-white/10">
              <span className="text-white font-black text-sm tracking-tighter">RV</span>
            </div>
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
            <div className="px-3.5 py-1.5 rounded-full bg-cyan-950/70 backdrop-blur-md border border-cyan-500/30 text-cyan-400 text-xs font-semibold tracking-wider flex items-center gap-1.5 w-fit shadow-lg mb-4">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>THE RETAIL OPERATING SYSTEM</span>
            </div>

            <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.08] mb-4 drop-shadow-md">
              See the city<br />
              behind your<br />
              numbers.
            </h1>

            <p className="text-slate-200 text-sm leading-relaxed mb-6 max-w-sm drop-shadow">
              Step into an interactive retail district where every storefront turns sales data into a decision you can act on.
            </p>

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
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <span className="text-xs font-bold tracking-wider text-slate-200 uppercase">
                PLATFORM PULSE
              </span>
              <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
            </div>

            <div className="grid grid-cols-2 gap-2.5 mt-3">
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

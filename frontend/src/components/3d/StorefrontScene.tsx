/**
 * RetailVision - Cinematic 3D Storefront Landing Page
 * Completely modeled in Three.js (@react-three/fiber & @react-three/drei)
 * Matching the Master Visual Architecture:
 * - Slatted timber ceiling with recessed warm downlights
 * - Dark ashlar stone facade with dual up/down architectural cylinder sconces
 * - Black-framed picture showroom windows with Venetian blinds & illuminated boutique interior
 * - Walnut paneled door with hanging CLOSE/OPEN sign & interactive 3D Golden Smart Lock
 * - Vertical walnut lower acoustic paneling & reflective charcoal granite pavement
 * - Floating responsive glassmorphic UI: "See the city behind your numbers" & "PLATFORM PULSE"
 * - Dynamic mouse parallax, mechanical Web Audio synthesis, and cinematic push-through door transition
 */

import React, { useRef, useState, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { PerspectiveCamera, Text } from '@react-three/drei'
import * as THREE from 'three'
import { ArrowUpRight, Lock, Activity, Sparkles, Box, ShieldCheck, Compass } from 'lucide-react'
import {
  createDarkAshlarStoneTexture,
  createDarkWalnutTexture,
  createCharcoalPaverTexture,
  createCeilingSlatsTexture
} from './textures'

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
// 3D Camera Rig with Responsive Parallax & Push-Through Animation
// ----------------------------------------------------------------------
function CameraParallaxController({ isTransitioning }: { isTransitioning: boolean }) {
  const { camera } = useThree()

  useFrame((state) => {
    if (isTransitioning) {
      // Push camera directly through the open doorway
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, -0.9, 0.045)
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, 0.05, 0.045)
    } else {
      // Subtle architectural mouse parallax
      const targetX = state.pointer.x * 0.22
      const targetY = state.pointer.y * 0.12
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.05)
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.05)
      camera.lookAt(0, 0.08, 0)
    }
  })

  return null
}

// ----------------------------------------------------------------------
// Interactive 3D Golden Smart Padlock
// ----------------------------------------------------------------------
function InteractiveSmartLock({
  isUnlocked,
  onClick
}: {
  isUnlocked: boolean
  onClick: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const lockGroupRef = useRef<THREE.Group>(null)
  const shackleMeshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (lockGroupRef.current) {
      const t = state.clock.getElapsedTime()
      if (hovered && !isUnlocked) {
        lockGroupRef.current.position.y = -0.15 + Math.sin(t * 5) * 0.015
        lockGroupRef.current.rotation.y = Math.sin(t * 3) * 0.08
      } else {
        lockGroupRef.current.position.y = -0.15
        lockGroupRef.current.rotation.y = 0
      }
    }

    if (shackleMeshRef.current && isUnlocked) {
      // Animate shackle popping open and turning
      shackleMeshRef.current.position.y = THREE.MathUtils.lerp(shackleMeshRef.current.position.y, 0.38, 0.1)
      shackleMeshRef.current.rotation.y = THREE.MathUtils.lerp(shackleMeshRef.current.rotation.y, 0.6, 0.1)
    }
  })

  return (
    <group
      ref={lockGroupRef}
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
      {/* Golden Smart Lock Body */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.26, 0.32, 0.1]} />
        <meshStandardMaterial
          color={hovered ? '#fbbf24' : '#d97706'}
          metalness={0.92}
          roughness={0.22}
          emissive={hovered ? '#f59e0b' : '#78350f'}
          emissiveIntensity={hovered ? 0.5 : 0.12}
        />
      </mesh>

      {/* Front Bevel Plate */}
      <mesh position={[0, 0, 0.052]}>
        <planeGeometry args={[0.22, 0.28]} />
        <meshStandardMaterial
          color={hovered ? '#fde047' : '#eab308'}
          metalness={0.88}
          roughness={0.25}
        />
      </mesh>

      {/* Keyhole / Biometric Sensor */}
      <mesh position={[0, -0.03, 0.055]}>
        <circleGeometry args={[0.03, 16]} />
        <meshBasicMaterial color="#18181b" />
      </mesh>
      <mesh position={[0, -0.075, 0.055]}>
        <planeGeometry args={[0.016, 0.05]} />
        <meshBasicMaterial color="#18181b" />
      </mesh>

      {/* Hardened Steel Shackle */}
      <mesh ref={shackleMeshRef} position={[0, 0.21, 0]} castShadow>
        <torusGeometry args={[0.1, 0.028, 16, 32, Math.PI]} />
        <meshStandardMaterial
          color={hovered ? '#f8fafc' : '#cbd5e1'}
          metalness={0.95}
          roughness={0.12}
        />
      </mesh>

      {/* 3D "LOCKED" / "UNLOCKED" Indicator Label */}
      <group position={[0, -0.28, 0.06]}>
        <Text
          fontSize={0.065}
          color={isUnlocked ? '#22c55e' : (hovered ? '#38bdf8' : '#f8fafc')}
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.15}
          fontWeight="bold"
        >
          {isUnlocked ? 'UNLOCKED' : (hovered ? 'CLICK TO ENTER' : 'LOCKED')}
        </Text>
      </group>
    </group>
  )
}

// ----------------------------------------------------------------------
// Complete 3D Architectural Storefront Matching Master Image
// ----------------------------------------------------------------------
function Storefront3DModel({
  isUnlocked,
  onUnlockClick
}: {
  isUnlocked: boolean
  onUnlockClick: () => void
}) {
  const doorRef = useRef<THREE.Group>(null)

  // Load procedural textures
  const ashlarStoneTex = useMemo(() => createDarkAshlarStoneTexture(), [])
  const darkWalnutTex = useMemo(() => createDarkWalnutTexture(), [])
  const charcoalPaverTex = useMemo(() => createCharcoalPaverTexture(), [])
  const ceilingSlatsTex = useMemo(() => createCeilingSlatsTexture(), [])

  useFrame(() => {
    if (doorRef.current && isUnlocked) {
      // Door swings smoothly inward into illuminated boutique
      doorRef.current.rotation.y = THREE.MathUtils.lerp(
        doorRef.current.rotation.y,
        -Math.PI / 2.1,
        0.045
      )
    }
  })

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Ground Charcoal Granite Paver Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.0, 1.2]} receiveShadow>
        <planeGeometry args={[16, 9]} />
        <meshStandardMaterial
          map={charcoalPaverTex}
          roughness={0.45}
          metalness={0.2}
          color="#292524"
        />
      </mesh>

      {/* Raised Doorstep with Polished Brass Trim */}
      <mesh position={[0, -1.91, 0.35]} receiveShadow castShadow>
        <boxGeometry args={[4.2, 0.18, 0.9]} />
        <meshStandardMaterial color="#1c1917" roughness={0.6} />
      </mesh>

      {/* 2. Overhead Wood Slat Ceiling / Canopy */}
      <mesh position={[0, 2.45, 0.8]} receiveShadow castShadow>
        <boxGeometry args={[11, 0.35, 3.2]} />
        <meshStandardMaterial
          map={ceilingSlatsTex}
          roughness={0.5}
          color="#3b2210"
        />
      </mesh>

      {/* Recessed Ceiling Downlights casting warm downward light cones */}
      {[-3.6, -1.8, 0, 1.8, 3.6].map((x, i) => (
        <group key={`downlight-${i}`} position={[x, 2.27, 0.5]}>
          <mesh>
            <cylinderGeometry args={[0.08, 0.08, 0.03, 16]} />
            <meshStandardMaterial color="#1c1917" />
          </mesh>
          <mesh position={[0, -0.015, 0]}>
            <circleGeometry args={[0.065, 16]} />
            <meshStandardMaterial
              color="#fbbf24"
              emissive="#f59e0b"
              emissiveIntensity={1.5}
            />
          </mesh>
          <spotLight
            position={[0, -0.05, 0]}
            target-position={[x, -2, 0.5]}
            intensity={2.6}
            distance={5.5}
            color="#fed7aa"
            angle={0.52}
            penumbra={0.7}
            castShadow
          />
        </group>
      ))}

      {/* 3. Dark Ashlar Stone Upper Wall Facade */}
      <mesh position={[0, 1.1, -0.08]} receiveShadow>
        <boxGeometry args={[10.5, 4.2, 0.16]} />
        <meshStandardMaterial
          map={ashlarStoneTex}
          roughness={0.7}
          metalness={0.1}
          color="#3f3f46"
        />
      </mesh>

      {/* 4. Dual Modern Up/Down Cylinder Sconces flanking door */}
      {[-1.38, 1.38].map((x, i) => (
        <group key={`sconce-${i}`} position={[x, 1.25, 0.12]}>
          {/* Wall Mount Bracket */}
          <mesh position={[0, 0, -0.06]}>
            <boxGeometry args={[0.08, 0.16, 0.06]} />
            <meshStandardMaterial color="#18181b" roughness={0.3} />
          </mesh>
          {/* Matte Black Cylinder Body */}
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.065, 0.065, 0.38, 16]} />
            <meshStandardMaterial color="#18181b" roughness={0.25} metalness={0.6} />
          </mesh>
          {/* Polished Brass Accent Rings */}
          <mesh position={[0, 0.16, 0]}>
            <cylinderGeometry args={[0.068, 0.068, 0.03, 16]} />
            <meshStandardMaterial color="#d97706" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[0, -0.16, 0]}>
            <cylinderGeometry args={[0.068, 0.068, 0.03, 16]} />
            <meshStandardMaterial color="#d97706" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Top & Bottom Glowing Lenses */}
          <mesh position={[0, 0.195, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 0.02, 16]} />
            <meshBasicMaterial color="#fef08a" />
          </mesh>
          <mesh position={[0, -0.195, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 0.02, 16]} />
            <meshBasicMaterial color="#fef08a" />
          </mesh>
          {/* SpotLight Up onto Stone/Ceiling */}
          <spotLight
            position={[0, 0.22, 0.04]}
            target-position={[0, 2.4, -0.05]}
            intensity={3.8}
            distance={3.2}
            color="#fed7aa"
            angle={0.62}
            penumbra={0.65}
          />
          {/* SpotLight Down onto Wall & Door */}
          <spotLight
            position={[0, -0.22, 0.04]}
            target-position={[0, -1.8, 0.2]}
            intensity={4.2}
            distance={3.6}
            color="#fef08a"
            angle={0.62}
            penumbra={0.65}
            castShadow
          />
        </group>
      ))}

      {/* 5. Lower Wall: Vertical Dark Walnut Acoustic Slats */}
      <mesh position={[0, -1.05, 0.02]} receiveShadow castShadow>
        <boxGeometry args={[9.4, 1.8, 0.12]} />
        <meshStandardMaterial
          map={darkWalnutTex}
          roughness={0.45}
          color="#3b200e"
        />
      </mesh>
      {/* Array of 28 Vertical Wood Relief Slats */}
      {Array.from({ length: 28 }).map((_, idx) => {
        const x = -4.2 + idx * 0.31
        // Skip slats in door area
        if (x > -0.9 && x < 0.9) return null
        return (
          <mesh key={`slat-${idx}`} position={[x, -1.05, 0.09]} castShadow>
            <boxGeometry args={[0.045, 1.76, 0.035]} />
            <meshStandardMaterial color="#271406" roughness={0.4} />
          </mesh>
        )
      })}

      {/* 6. Central Door Assembly */}
      <group position={[0, 0, 0]}>
        {/* Outer Heavy Black Metal Door Frame */}
        <mesh position={[0, 0.05, 0.04]} castShadow>
          <boxGeometry args={[1.76, 3.82, 0.18]} />
          <meshStandardMaterial color="#18181b" roughness={0.35} metalness={0.7} />
        </mesh>

        {/* Swinging Door Leaf (Pivot on Left Hinge at -0.72) */}
        <group ref={doorRef} position={[-0.72, 0, 0.1]}>
          <group position={[0.72, 0, 0]}>
            {/* Main Walnut Door Base */}
            <mesh castShadow receiveShadow>
              <boxGeometry args={[1.44, 3.6, 0.1]} />
              <meshStandardMaterial
                map={darkWalnutTex}
                roughness={0.4}
                color="#451a03"
              />
            </mesh>

            {/* Upper Beveled Inset Panel */}
            <mesh position={[0, 0.78, 0.02]} castShadow>
              <boxGeometry args={[1.14, 1.48, 0.08]} />
              <meshStandardMaterial color="#2e1203" roughness={0.45} />
            </mesh>
            <mesh position={[0, 0.78, 0.045]}>
              <boxGeometry args={[1.02, 1.34, 0.04]} />
              <meshStandardMaterial
                map={darkWalnutTex}
                roughness={0.35}
                color="#502106"
              />
            </mesh>

            {/* Lower Beveled Inset Panel */}
            <mesh position={[0, -0.84, 0.02]} castShadow>
              <boxGeometry args={[1.14, 1.48, 0.08]} />
              <meshStandardMaterial color="#2e1203" roughness={0.45} />
            </mesh>
            <mesh position={[0, -0.84, 0.045]}>
              <boxGeometry args={[1.02, 1.34, 0.04]} />
              <meshStandardMaterial
                map={darkWalnutTex}
                roughness={0.35}
                color="#502106"
              />
            </mesh>

            {/* Hanging "CLOSE" / "OPEN" Sign on Upper Panel */}
            <group position={[0, 0.92, 0.09]}>
              {/* Plaque Body */}
              <mesh castShadow>
                <boxGeometry args={[0.64, 0.26, 0.02]} />
                <meshStandardMaterial color="#18181b" roughness={0.3} />
              </mesh>
              {/* Sign Text */}
              <Text
                position={[0, 0, 0.016]}
                fontSize={0.11}
                color={isUnlocked ? '#22c55e' : '#f8fafc'}
                anchorX="center"
                anchorY="middle"
                fontWeight="bold"
                letterSpacing={0.08}
              >
                {isUnlocked ? 'OPEN' : 'CLOSE'}
              </Text>
              {/* Hanging Cords */}
              <mesh position={[-0.2, 0.2, 0]} rotation={[0, 0, -0.38]}>
                <cylinderGeometry args={[0.004, 0.004, 0.24, 8]} />
                <meshBasicMaterial color="#e2e8f0" />
              </mesh>
              <mesh position={[0.2, 0.2, 0]} rotation={[0, 0, 0.38]}>
                <cylinderGeometry args={[0.004, 0.004, 0.24, 8]} />
                <meshBasicMaterial color="#e2e8f0" />
              </mesh>
            </group>

            {/* Stainless Steel / Black Architectural Handle Bar */}
            <mesh position={[0.44, -0.15, 0.1]} castShadow>
              <cylinderGeometry args={[0.016, 0.016, 0.42, 16]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.15} />
            </mesh>

            {/* Interactive 3D Golden Smart Padlock */}
            <InteractiveSmartLock
              isUnlocked={isUnlocked}
              onClick={onUnlockClick}
            />
          </group>
        </group>
      </group>

      {/* 7. LEFT SHOWROOM WINDOW (With Venetian Blinds, Interior & Pendant) */}
      <group position={[-2.75, 0.42, 0]}>
        {/* Outer Black Frame */}
        <mesh position={[0, 0, 0.04]} castShadow>
          <boxGeometry args={[2.76, 2.34, 0.14]} />
          <meshStandardMaterial color="#18181b" roughness={0.3} metalness={0.7} />
        </mesh>

        {/* Clear Architectural Glass Pane */}
        <mesh position={[0, 0, 0.06]}>
          <planeGeometry args={[2.52, 2.1]} />
          <meshPhysicalMaterial
            color="#fef3c7"
            transparent
            opacity={0.35}
            roughness={0.05}
            transmission={0.88}
            ior={1.48}
          />
        </mesh>

        {/* Venetian Blinds on Upper Window */}
        {Array.from({ length: 9 }).map((_, idx) => (
          <mesh key={`blind-l-${idx}`} position={[0, 0.88 - idx * 0.1, -0.12]}>
            <boxGeometry args={[2.48, 0.02, 0.04]} />
            <meshStandardMaterial color="#1c1917" roughness={0.4} />
          </mesh>
        ))}

        {/* Interior Boutique Room Behind Glass */}
        <mesh position={[0, 0, -1.2]}>
          <planeGeometry args={[2.6, 2.2]} />
          <meshStandardMaterial color="#2e1408" roughness={0.9} />
        </mesh>

        {/* Interior Shelves with Boutique Merchandise */}
        <mesh position={[0, -0.35, -0.6]}>
          <boxGeometry args={[2.3, 0.05, 0.35]} />
          <meshStandardMaterial color="#592205" />
        </mesh>
        <mesh position={[0, 0.25, -0.6]}>
          <boxGeometry args={[2.3, 0.05, 0.35]} />
          <meshStandardMaterial color="#592205" />
        </mesh>
        {/* Merchandise pieces */}
        <mesh position={[-0.6, 0.42, -0.5]}>
          <cylinderGeometry args={[0.09, 0.11, 0.28, 16]} />
          <meshStandardMaterial color="#38bdf8" roughness={0.2} metalness={0.5} />
        </mesh>
        <mesh position={[0.4, 0.38, -0.5]}>
          <boxGeometry args={[0.26, 0.22, 0.18]} />
          <meshStandardMaterial color="#f472b6" roughness={0.3} />
        </mesh>

        {/* Lush Green Indoor Plant on Counter */}
        <group position={[0.65, -0.62, -0.3]}>
          <mesh position={[0, 0, 0]} castShadow>
            <cylinderGeometry args={[0.15, 0.11, 0.26, 16]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.22, 0]} castShadow>
            <sphereGeometry args={[0.22, 16, 16]} />
            <meshStandardMaterial color="#16a34a" roughness={0.8} />
          </mesh>
          <mesh position={[-0.08, 0.35, 0.05]} castShadow>
            <sphereGeometry args={[0.15, 12, 12]} />
            <meshStandardMaterial color="#22c55e" roughness={0.8} />
          </mesh>
        </group>

        {/* Hanging Industrial Black Pendant Lamp */}
        <mesh position={[0, 0.95, -0.5]}>
          <cylinderGeometry args={[0.006, 0.006, 0.7, 8]} />
          <meshBasicMaterial color="#0f172a" />
        </mesh>
        <mesh position={[0, 0.58, -0.5]} castShadow>
          <coneGeometry args={[0.22, 0.18, 16]} />
          <meshStandardMaterial color="#18181b" roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.52, -0.5]}>
          <sphereGeometry args={[0.05, 12, 12]} />
          <meshBasicMaterial color="#fef08a" />
        </mesh>
        <pointLight position={[0, 0.45, -0.5]} intensity={3.5} distance={4.5} color="#fed7aa" />
      </group>

      {/* 8. RIGHT SHOWROOM WINDOW (With Venetian Blinds, Interior & Pendant) */}
      <group position={[2.75, 0.42, 0]}>
        <mesh position={[0, 0, 0.04]} castShadow>
          <boxGeometry args={[2.76, 2.34, 0.14]} />
          <meshStandardMaterial color="#18181b" roughness={0.3} metalness={0.7} />
        </mesh>

        <mesh position={[0, 0, 0.06]}>
          <planeGeometry args={[2.52, 2.1]} />
          <meshPhysicalMaterial
            color="#fef3c7"
            transparent
            opacity={0.35}
            roughness={0.05}
            transmission={0.88}
            ior={1.48}
          />
        </mesh>

        {/* Venetian Blinds on Upper Window */}
        {Array.from({ length: 9 }).map((_, idx) => (
          <mesh key={`blind-r-${idx}`} position={[0, 0.88 - idx * 0.1, -0.12]}>
            <boxGeometry args={[2.48, 0.02, 0.04]} />
            <meshStandardMaterial color="#1c1917" roughness={0.4} />
          </mesh>
        ))}

        {/* Interior Boutique Room Behind Glass */}
        <mesh position={[0, 0, -1.2]}>
          <planeGeometry args={[2.6, 2.2]} />
          <meshStandardMaterial color="#2e1408" roughness={0.9} />
        </mesh>

        <mesh position={[0, -0.35, -0.6]}>
          <boxGeometry args={[2.3, 0.05, 0.35]} />
          <meshStandardMaterial color="#592205" />
        </mesh>
        <mesh position={[0, 0.25, -0.6]}>
          <boxGeometry args={[2.3, 0.05, 0.35]} />
          <meshStandardMaterial color="#592205" />
        </mesh>
        <mesh position={[-0.4, -0.2, -0.5]}>
          <boxGeometry args={[0.3, 0.24, 0.22]} />
          <meshStandardMaterial color="#34d399" />
        </mesh>
        <mesh position={[0.5, 0.42, -0.5]}>
          <sphereGeometry args={[0.14, 16, 16]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.8} />
        </mesh>

        {/* Lush Green Indoor Plant on Counter */}
        <group position={[-0.65, -0.62, -0.3]}>
          <mesh position={[0, 0, 0]} castShadow>
            <cylinderGeometry args={[0.15, 0.11, 0.26, 16]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.22, 0]} castShadow>
            <sphereGeometry args={[0.22, 16, 16]} />
            <meshStandardMaterial color="#16a34a" roughness={0.8} />
          </mesh>
          <mesh position={[0.08, 0.35, 0.05]} castShadow>
            <sphereGeometry args={[0.15, 12, 12]} />
            <meshStandardMaterial color="#22c55e" roughness={0.8} />
          </mesh>
        </group>

        {/* Hanging Industrial Black Pendant Lamp */}
        <mesh position={[0, 0.95, -0.5]}>
          <cylinderGeometry args={[0.006, 0.006, 0.7, 8]} />
          <meshBasicMaterial color="#0f172a" />
        </mesh>
        <mesh position={[0, 0.58, -0.5]} castShadow>
          <coneGeometry args={[0.22, 0.18, 16]} />
          <meshStandardMaterial color="#18181b" roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.52, -0.5]}>
          <sphereGeometry args={[0.05, 12, 12]} />
          <meshBasicMaterial color="#fef08a" />
        </mesh>
        <pointLight position={[0, 0.45, -0.5]} intensity={3.5} distance={4.5} color="#fed7aa" />
      </group>

      {/* 9. Flanking Architectural Potted Planters in Corners */}
      {[-4.0, 4.0].map((x, i) => (
        <group key={`planter-${i}`} position={[x, -1.35, 0.85]}>
          {/* Ceramic/Stone Pot */}
          <mesh position={[0, -0.28, 0]} castShadow>
            <cylinderGeometry args={[0.34, 0.24, 0.72, 24]} />
            <meshStandardMaterial color="#64748b" roughness={0.65} />
          </mesh>
          {/* Lush Green Foliage Multi-Cluster */}
          <mesh position={[0, 0.32, 0]} castShadow>
            <sphereGeometry args={[0.42, 16, 16]} />
            <meshStandardMaterial color="#15803d" roughness={0.8} />
          </mesh>
          <mesh position={[0.1, 0.55, 0.08]} castShadow>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshStandardMaterial color="#16a34a" roughness={0.75} />
          </mesh>
          <mesh position={[-0.12, 0.48, -0.06]} castShadow>
            <sphereGeometry args={[0.26, 14, 14]} />
            <meshStandardMaterial color="#22c55e" roughness={0.8} />
          </mesh>
        </group>
      ))}

      {/* Interior Depth Fill Lighting */}
      <pointLight position={[0, 0.8, -1.4]} intensity={5.2} distance={7} color="#fed7aa" />
    </group>
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
      {/* 1. REAL INTERACTIVE 3D WEBGL THREE.JS CANVAS ENVIRONMENT          */}
      {/* ------------------------------------------------------------------ */}
      <div className="absolute inset-0 z-0">
        <Canvas
          shadows
          dpr={[1, 2]}
          gl={{
            antialias: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.15
          }}
          className="w-full h-full"
        >
          <PerspectiveCamera makeDefault position={[0, 0, 5.0]} fov={45} />
          <CameraParallaxController isTransitioning={isTransitioning} />

          {/* Atmospheric Lighting */}
          <ambientLight intensity={0.4} color="#64748b" />
          <directionalLight
            position={[5, 8, 6]}
            intensity={0.85}
            color="#fed7aa"
            castShadow
            shadow-mapSize={[1024, 1024]}
          />

          {/* Complete 3D Architectural Facade */}
          <Storefront3DModel
            isUnlocked={isUnlocked}
            onUnlockClick={handleUnlockTrigger}
          />
        </Canvas>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 2. REAL CODED HTML/TAILWIND UI OVERLAY (Pixel-Perfect Match)       */}
      {/* ------------------------------------------------------------------ */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-6 md:p-8 lg:p-10">
        {/* TOP BAR */}
        <div className="w-full flex items-center justify-between">
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
            <h1 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.08] mb-4 drop-shadow-md">
              See the city<br />
              behind your<br />
              numbers.
            </h1>

            {/* Subtitle Description */}
            <p className="text-slate-300 text-sm leading-relaxed mb-6 max-w-sm drop-shadow">
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
                <Compass className="w-4 h-4 text-cyan-400 mb-2" />
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

      {/* Cinematic Flash / Sunlight Bloom when Door Opens */}
      {isTransitioning && (
        <div className="absolute inset-0 z-20 bg-gradient-to-t from-amber-400/40 via-white/60 to-amber-200/50 pointer-events-none animate-pulse transition-opacity duration-700" />
      )}
    </div>
  )
}

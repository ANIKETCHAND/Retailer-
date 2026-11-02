/**
 * RetailVision - Cinematic AAA 3D Storefront Landing Page
 * Ultra-realistic architectural storefront with:
 * - Deep cream stucco wall with procedural micro-texture
 * - Fully modeled Art Deco wall sconces (brass arm + cylinder housing + glowing bulb)
 * - Floor-to-ceiling black-framed 4-pane display windows with beveled surrounds,
 *   thick mullions, double interior reveal, warm-lit shelves and pendant lamps
 * - Rich walnut entrance door with raised rectangular panel moldings,
 *   brass bar handle, transept fanlight, and beveled frame
 * - Premium brass padlock with chamfered body, shackle groove, and keyhole engraving
 * - Polished granite threshold, stone paver forecourt
 * - Dense topiary bushes in ornate tapered planters with feet
 * - Cinematic warm-cool mixed lighting with shadow maps
 */

import React, { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'

interface StorefrontSceneProps {
  onUnlockClick: () => void
  isUnlocked: boolean
  isTransitioning: boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// High-Performance Cached Textures (Zero Blocking, Instant Load)
// ─────────────────────────────────────────────────────────────────────────────
let cachedStuccoTexture: THREE.CanvasTexture | null = null
let cachedGraniteTexture: THREE.CanvasTexture | null = null
let cachedWoodTexture: THREE.CanvasTexture | null = null

function makeStuccoTexture(): THREE.CanvasTexture {
  if (cachedStuccoTexture) return cachedStuccoTexture
  const canvas = document.createElement('canvas')
  canvas.width = 256; canvas.height = 256
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.fillStyle = '#e8ddd0'
    ctx.fillRect(0, 0, 256, 256)
    const imgData = ctx.getImageData(0, 0, 256, 256)
    const data = imgData.data
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 22
      data[i] = Math.min(255, Math.max(0, data[i] + noise))
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise - 2))
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise - 4))
    }
    ctx.putImageData(imgData, 0, 0)
  }
  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(6, 4)
  cachedStuccoTexture = tex
  return tex
}

function makeGraniteTexture(): THREE.CanvasTexture {
  if (cachedGraniteTexture) return cachedGraniteTexture
  const canvas = document.createElement('canvas')
  canvas.width = 256; canvas.height = 256
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.fillStyle = '#3a4756'
    ctx.fillRect(0, 0, 256, 256)
    const imgData = ctx.getImageData(0, 0, 256, 256)
    const data = imgData.data
    for (let i = 0; i < data.length; i += 4) {
      if (Math.random() > 0.4) {
        const noise = (Math.random() - 0.5) * 44
        data[i] = Math.min(255, Math.max(0, data[i] + noise))
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise + 2))
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise + 4))
      }
    }
    ctx.putImageData(imgData, 0, 0)
  }
  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(4, 4)
  cachedGraniteTexture = tex
  return tex
}

function makeWoodTexture(): THREE.CanvasTexture {
  if (cachedWoodTexture) return cachedWoodTexture
  const canvas = document.createElement('canvas')
  canvas.width = 256; canvas.height = 256
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.fillStyle = '#4a1c06'
    ctx.fillRect(0, 0, 256, 256)
    for (let i = 0; i < 70; i++) {
      const x = Math.random() * 256
      ctx.strokeStyle = `rgba(${Math.floor(20 + Math.random() * 30)},${Math.floor(8 + Math.random() * 12)},0,0.14)`
      ctx.lineWidth = 1 + Math.random() * 2
      ctx.beginPath(); ctx.moveTo(x, 0)
      ctx.bezierCurveTo(x + 8, 85, x - 8, 170, x + 4, 256)
      ctx.stroke()
    }
  }
  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(2, 3)
  cachedWoodTexture = tex
  return tex
}

// Instant synchronous 2D Canvas Text (no network font fetch, no suspense delay)
const textTextureCache = new Map<string, THREE.CanvasTexture>()

function getCachedTextTexture(
  text: string,
  color: string,
  width: number,
  height: number,
  fontSize: number,
  fontWeight = 'bold'
): THREE.CanvasTexture {
  const key = `${text}_${color}_${width}_${height}_${fontSize}_${fontWeight}`
  const cached = textTextureCache.get(key)
  if (cached) return cached

  const canvas = document.createElement('canvas')
  const scale = 512
  canvas.width = Math.round(width * scale)
  canvas.height = Math.round(height * scale)
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.font = `${fontWeight} ${Math.round(fontSize * (scale / 100))}px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif`
    ctx.fillStyle = color
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, canvas.width / 2, canvas.height / 2)
  }
  const tex = new THREE.CanvasTexture(canvas)
  tex.generateMipmaps = true
  tex.minFilter = THREE.LinearMipmapLinearFilter
  tex.magFilter = THREE.LinearFilter
  tex.needsUpdate = true
  textTextureCache.set(key, tex)
  return tex
}

function CanvasTextPlane({
  text,
  color,
  width = 0.8,
  height = 0.2,
  fontSize = 12,
  fontWeight = 'bold',
  position = [0, 0, 0] as [number, number, number],
}: {
  text: string
  color: string
  width?: number
  height?: number
  fontSize?: number
  fontWeight?: string
  position?: [number, number, number]
}) {
  const texture = React.useMemo(() => {
    return getCachedTextTexture(text, color, width, height, fontSize, fontWeight)
  }, [text, color, width, height, fontSize, fontWeight])

  return (
    <mesh position={position}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Audio Synthesizer
// ─────────────────────────────────────────────────────────────────────────────
function playMechanicalUnlockAudio() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const osc1 = ctx.createOscillator(); const gain1 = ctx.createGain()
    osc1.type = 'triangle'; osc1.frequency.setValueAtTime(440, ctx.currentTime)
    osc1.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.1)
    gain1.gain.setValueAtTime(0.5, ctx.currentTime); gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1)
    osc1.connect(gain1); gain1.connect(ctx.destination); osc1.start(); osc1.stop(ctx.currentTime + 0.1)
    const osc2 = ctx.createOscillator(); const gain2 = ctx.createGain()
    osc2.type = 'sine'; osc2.frequency.setValueAtTime(1100, ctx.currentTime + 0.05)
    osc2.frequency.exponentialRampToValueAtTime(2200, ctx.currentTime + 0.28)
    gain2.gain.setValueAtTime(0.35, ctx.currentTime + 0.05); gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35)
    osc2.connect(gain2); gain2.connect(ctx.destination); osc2.start(ctx.currentTime + 0.05); osc2.stop(ctx.currentTime + 0.35)
  } catch { /* audio fallback */ }
}

// ─────────────────────────────────────────────────────────────────────────────
// PREMIUM BRASS PADLOCK — chamfered body, detailed shackle, raised keyhole
// ─────────────────────────────────────────────────────────────────────────────
function Padlock3D({ isUnlocked, onClick }: { isUnlocked: boolean; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  const lockRef = useRef<THREE.Group>(null)
  const shackleRef = useRef<THREE.Group>(null)
  const glowRef = useRef<THREE.PointLight>(null)

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (lockRef.current) {
      if (hovered && !isUnlocked) {
        lockRef.current.position.y = Math.sin(t * 6) * 0.014
        lockRef.current.rotation.y = Math.sin(t * 3.5) * 0.10
      } else {
        lockRef.current.position.y = THREE.MathUtils.lerp(lockRef.current.position.y, 0, 0.08)
        lockRef.current.rotation.y = THREE.MathUtils.lerp(lockRef.current.rotation.y, 0, 0.08)
      }
    }
    if (shackleRef.current && isUnlocked) {
      shackleRef.current.position.y = THREE.MathUtils.lerp(shackleRef.current.position.y, 0.55, 0.07)
      shackleRef.current.rotation.z = THREE.MathUtils.lerp(shackleRef.current.rotation.z, 0.7, 0.07)
    }
    if (glowRef.current) {
      glowRef.current.intensity = hovered ? (2.2 + Math.sin(t * 9) * 0.5) : 0.7
    }
  })

  const bodyColor = hovered ? '#f5c842' : '#c8900a'

  return (
    <group
      ref={lockRef}
      position={[0.38, -0.18, 0.20]}
      onClick={(e) => { e.stopPropagation(); playMechanicalUnlockAudio(); onClick() }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default' }}
    >
      {/* Lock body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.30, 0.36, 0.15]} />
        <meshStandardMaterial color={bodyColor} metalness={0.92} roughness={0.20}
          emissive={hovered ? '#c87800' : '#6b3700'} emissiveIntensity={hovered ? 0.45 : 0.14} />
      </mesh>

      {/* Body corner bevel strips */}
      {[[-0.145, 0, 0.076], [0.145, 0, 0.076]].map(([bx, _by, bz], i) => (
        <mesh key={`bev-${i}`} position={[bx, 0, bz]}>
          <boxGeometry args={[0.022, 0.32, 0.012]} />
          <meshStandardMaterial color="#f0c040" metalness={0.98} roughness={0.09} />
        </mesh>
      ))}
      <mesh position={[0, 0.17, 0.076]}>
        <boxGeometry args={[0.26, 0.022, 0.012]} />
        <meshStandardMaterial color="#f0c040" metalness={0.98} roughness={0.09} />
      </mesh>
      <mesh position={[0, -0.17, 0.076]}>
        <boxGeometry args={[0.26, 0.022, 0.012]} />
        <meshStandardMaterial color="#f0c040" metalness={0.98} roughness={0.09} />
      </mesh>

      {/* Engraved brand text area recessed panel */}
      <mesh position={[0, 0.06, 0.076]}>
        <boxGeometry args={[0.22, 0.10, 0.005]} />
        <meshStandardMaterial color="#a07408" metalness={0.88} roughness={0.28} />
      </mesh>

      {/* Raised keyhole base plate */}
      <mesh position={[0, -0.05, 0.078]}>
        <cylinderGeometry args={[0.058, 0.058, 0.010, 22]} />
        <meshStandardMaterial color="#b08010" metalness={0.86} roughness={0.30} />
      </mesh>
      {/* Keyhole circle cutout */}
      <mesh position={[0, -0.03, 0.085]}>
        <circleGeometry args={[0.026, 22]} />
        <meshBasicMaterial color="#100800" />
      </mesh>
      {/* Keyhole slot */}
      <mesh position={[0, -0.072, 0.085]}>
        <boxGeometry args={[0.015, 0.052, 0.003]} />
        <meshBasicMaterial color="#100800" />
      </mesh>

      {/* Shackle group */}
      <group ref={shackleRef}>
        {/* Torus shackle arc */}
        <mesh position={[0, 0.28, 0]} castShadow>
          <torusGeometry args={[0.118, 0.024, 20, 38, Math.PI]} />
          <meshStandardMaterial color={hovered ? '#e8eaf0' : '#aab8c8'} metalness={0.96} roughness={0.11}
            emissive={hovered ? '#8898b8' : '#203050'} emissiveIntensity={0.12} />
        </mesh>
        {/* Left leg */}
        <mesh position={[-0.118, 0.10, 0]} castShadow>
          <cylinderGeometry args={[0.024, 0.024, 0.36, 18]} />
          <meshStandardMaterial color={hovered ? '#e8eaf0' : '#aab8c8'} metalness={0.96} roughness={0.11} />
        </mesh>
        {/* Right leg (slightly shorter — fits into body) */}
        <mesh position={[0.118, 0.08, 0]} castShadow>
          <cylinderGeometry args={[0.024, 0.024, 0.32, 18]} />
          <meshStandardMaterial color={hovered ? '#e8eaf0' : '#aab8c8'} metalness={0.96} roughness={0.11} />
        </mesh>
        {/* Groove ring at body entry */}
        <mesh position={[-0.118, -0.065, 0]}>
          <torusGeometry args={[0.024, 0.007, 12, 22]} />
          <meshStandardMaterial color="#7888a0" metalness={0.92} roughness={0.18} />
        </mesh>
      </group>

      {/* Hover glow point light */}
      <pointLight ref={glowRef} position={[0, 0, 0.35]} color="#ffcc44" intensity={0.7} distance={2.4} />

      {/* Status label */}
      <group position={[0, -0.38, 0.12]}>
        <CanvasTextPlane
          text={isUnlocked ? 'UNLOCKED' : (hovered ? 'CLICK TO UNLOCK' : 'LOCKED')}
          color={isUnlocked ? '#34d399' : (hovered ? '#38bdf8' : '#e0d0b8')}
          width={0.82}
          height={0.16}
          fontSize={11}
          fontWeight="bold"
        />
      </group>
    </group>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ART DECO WALL SCONCE — brass arm + cylindrical housing + glowing bulb
// ─────────────────────────────────────────────────────────────────────────────
function WallSconce({ position }: { position: [number, number, number] }) {
  const glowRef = useRef<THREE.PointLight>(null)
  const spillRef = useRef<THREE.PointLight>(null)
  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (glowRef.current) glowRef.current.intensity = 4.2 + Math.sin(t * 3.1 + position[0]) * 0.18
    if (spillRef.current) spillRef.current.intensity = 1.0 + Math.sin(t * 2.4) * 0.08
  })
  return (
    <group position={position}>
      {/* Wall backplate */}
      <mesh castShadow>
        <boxGeometry args={[0.18, 0.30, 0.055]} />
        <meshStandardMaterial color="#8b6914" metalness={0.85} roughness={0.30} />
      </mesh>
      {/* Decorative rosette center */}
      <mesh position={[0, 0, 0.032]}>
        <cylinderGeometry args={[0.04, 0.044, 0.012, 16]} />
        <meshStandardMaterial color="#c0940c" metalness={0.92} roughness={0.18} />
      </mesh>

      {/* Arm extending out */}
      <mesh position={[0, -0.04, 0.14]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.016, 0.020, 0.30, 14]} />
        <meshStandardMaterial color="#a07820" metalness={0.90} roughness={0.20} />
      </mesh>

      {/* Elbow/joint */}
      <mesh position={[0, -0.04, 0.29]} castShadow>
        <sphereGeometry args={[0.027, 16, 16]} />
        <meshStandardMaterial color="#c0940c" metalness={0.92} roughness={0.16} />
      </mesh>

      {/* Cylindrical lamp housing body */}
      <mesh position={[0, -0.04, 0.38]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.062, 0.055, 0.20, 24, 1, true]} />
        <meshStandardMaterial color="#b88818" metalness={0.88} roughness={0.22} side={THREE.DoubleSide} />
      </mesh>
      {/* Housing top cap */}
      <mesh position={[0, 0.06, 0.38]}>
        <circleGeometry args={[0.064, 24]} />
        <meshStandardMaterial color="#a87810" metalness={0.90} roughness={0.20} />
      </mesh>
      {/* Bottom flange ring */}
      <mesh position={[0, -0.14, 0.38]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.066, 0.009, 10, 24]} />
        <meshStandardMaterial color="#d4a420" metalness={0.95} roughness={0.12} />
      </mesh>
      {/* Top finial ring */}
      <mesh position={[0, 0.07, 0.38]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.058, 0.006, 10, 24]} />
        <meshStandardMaterial color="#d4a420" metalness={0.95} roughness={0.12} />
      </mesh>

      {/* Edison glowing bulb */}
      <mesh position={[0, -0.04, 0.38]}>
        <sphereGeometry args={[0.036, 16, 16]} />
        <meshStandardMaterial color="#fff8e8" emissive="#ffdd80" emissiveIntensity={3.0}
          roughness={0.04} transparent opacity={0.96} />
      </mesh>

      {/* Main point light */}
      <pointLight ref={glowRef} position={[0, -0.04, 0.5]} color="#ffcc77" intensity={4.2} distance={5.8} />

      {/* Downward warm spill */}
      <pointLight ref={spillRef} position={[0, -0.9, 0.6]} color="#ff8828" intensity={2.5} distance={6.0} />
    </group>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// DISPLAY WINDOW ASSEMBLY
// ─────────────────────────────────────────────────────────────────────────────
function DisplayWindow({ position, woodTex }: { position: [number, number, number]; woodTex: THREE.CanvasTexture }) {
  return (
    <group position={position}>
      {/* Outer stone/painted wood surround — top */}
      <mesh position={[0, 1.20, 0.04]} castShadow>
        <boxGeometry args={[3.06, 0.20, 0.26]} />
        <meshStandardMaterial color="#383028" roughness={0.52} />
      </mesh>
      {/* Bottom sill (wider, projects forward) */}
      <mesh position={[0, -1.18, 0.06]} castShadow>
        <boxGeometry args={[3.06, 0.20, 0.38]} />
        <meshStandardMaterial color="#383028" roughness={0.52} />
      </mesh>
      {/* Sill drip nose */}
      <mesh position={[0, -1.30, 0.18]} castShadow>
        <boxGeometry args={[3.1, 0.06, 0.12]} />
        <meshStandardMaterial color="#100d0a" roughness={0.55} />
      </mesh>
      {/* Left jamb */}
      <mesh position={[-1.44, 0.02, 0.04]} castShadow>
        <boxGeometry args={[0.18, 2.26, 0.26]} />
        <meshStandardMaterial color="#383028" roughness={0.52} />
      </mesh>
      {/* Right jamb */}
      <mesh position={[1.44, 0.02, 0.04]} castShadow>
        <boxGeometry args={[0.18, 2.26, 0.26]} />
        <meshStandardMaterial color="#383028" roughness={0.52} />
      </mesh>

      {/* Inner rebate — deep reveal */}
      <mesh position={[0, 0.02, -0.02]}>
        <boxGeometry args={[2.70, 2.12, 0.08]} />
        <meshStandardMaterial color="#383028" roughness={0.52} />
      </mesh>

      {/* Glass pane — physically based */}
      <mesh position={[0, 0.02, 0.05]}>
        <planeGeometry args={[2.58, 2.02]} />
        <meshPhysicalMaterial
          color="#c8e8f8" transparent opacity={0.20}
          roughness={0.02} metalness={0.06}
          transmission={0.94} ior={1.52}
          reflectivity={0.20}
        />
      </mesh>

      {/* Cross mullion — vertical (thicker center bar) */}
      <mesh position={[0, 0.02, 0.062]} castShadow>
        <boxGeometry args={[0.068, 2.04, 0.058]} />
        <meshStandardMaterial color="#0e0a08" roughness={0.42} />
      </mesh>
      {/* Cross mullion — horizontal */}
      <mesh position={[0, 0.02, 0.062]} castShadow>
        <boxGeometry args={[2.58, 0.068, 0.058]} />
        <meshStandardMaterial color="#0e0a08" roughness={0.42} />
      </mesh>
      {/* Quarter-pane thin glazing beads — vertical */}
      {[-0.64, 0.64].map((px, i) => (
        <mesh key={`vb-${i}`} position={[px, 0.02, 0.064]}>
          <boxGeometry args={[0.032, 1.98, 0.020]} />
          <meshStandardMaterial color="#0a0806" roughness={0.50} />
        </mesh>
      ))}
      {/* Quarter-pane thin glazing beads — horizontal */}
      {[-0.48, 0.52].map((py, i) => (
        <mesh key={`hb-${i}`} position={[0, py, 0.064]}>
          <boxGeometry args={[2.55, 0.032, 0.020]} />
          <meshStandardMaterial color="#0a0806" roughness={0.50} />
        </mesh>
      ))}

      {/* Interior back wall — warm dark wood */}
      <mesh position={[0, 0.02, -1.05]}>
        <boxGeometry args={[2.62, 2.06, 0.04]} />
        <meshStandardMaterial map={woodTex} color="#220a02" roughness={0.82} />
      </mesh>

      {/* Interior display shelf — upper */}
      <mesh position={[0, 0.44, -0.72]} castShadow>
        <boxGeometry args={[2.44, 0.055, 0.52]} />
        <meshStandardMaterial map={woodTex} roughness={0.60} />
      </mesh>
      {/* Interior display shelf — lower */}
      <mesh position={[0, -0.40, -0.72]} castShadow>
        <boxGeometry args={[2.44, 0.055, 0.52]} />
        <meshStandardMaterial map={woodTex} roughness={0.60} />
      </mesh>

      {/* Pendant lamp cord */}
      <mesh position={[0, 1.12, -0.62]} castShadow>
        <cylinderGeometry args={[0.008, 0.008, 0.84, 8]} />
        <meshStandardMaterial color="#1e293b" roughness={0.80} />
      </mesh>
      {/* Lamp shade (cone open downward) */}
      <mesh position={[0, 0.64, -0.62]} castShadow>
        <coneGeometry args={[0.20, 0.24, 20, 1, true]} />
        <meshStandardMaterial color="#c8880a" emissive="#aa5f00" emissiveIntensity={0.65}
          roughness={0.38} side={THREE.DoubleSide} />
      </mesh>
      {/* Edison bulb in pendant */}
      <mesh position={[0, 0.58, -0.62]}>
        <sphereGeometry args={[0.040, 16, 16]} />
        <meshStandardMaterial color="#fff8d0" emissive="#ffdd80" emissiveIntensity={2.4} roughness={0.04} transparent opacity={0.96} />
      </mesh>

      {/* Pendant point light */}
      <pointLight position={[0, 0.48, -0.62]} color="#ffc870" intensity={3.2} distance={5.5} />
      {/* Warm interior fill */}
      <pointLight position={[0, 0, -0.52]} color="#ff8832" intensity={1.5} distance={3.2} />
    </group>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ORNATE TERRACOTTA PLANTER + LUSH TOPIARY
// ─────────────────────────────────────────────────────────────────────────────
function TerracottaPlanter({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Tapered planter body */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.34, 0.23, 0.76, 26]} />
        <meshStandardMaterial color="#c2723a" roughness={0.72} metalness={0.04} />
      </mesh>
      {/* Rim torus */}
      <mesh position={[0, 0.40, 0]} castShadow>
        <torusGeometry args={[0.36, 0.056, 14, 30]} />
        <meshStandardMaterial color="#ae5e28" roughness={0.68} />
      </mesh>
      {/* Base pedestal */}
      <mesh position={[0, -0.40, 0]} castShadow>
        <cylinderGeometry args={[0.26, 0.30, 0.10, 24]} />
        <meshStandardMaterial color="#a0541e" roughness={0.73} />
      </mesh>
      {/* Soil */}
      <mesh position={[0, 0.35, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.31, 22]} />
        <meshStandardMaterial color="#2a1508" roughness={0.98} />
      </mesh>

      {/* Main topiary sphere */}
      <mesh position={[0, 0.86, 0]} castShadow>
        <sphereGeometry args={[0.52, 22, 22]} />
        <meshStandardMaterial color="#166534" roughness={0.86} />
      </mesh>
      {/* Secondary clusters */}
      <mesh position={[0.20, 1.12, 0.14]} castShadow>
        <sphereGeometry args={[0.30, 16, 16]} />
        <meshStandardMaterial color="#15803d" roughness={0.86} />
      </mesh>
      <mesh position={[-0.18, 1.08, -0.10]} castShadow>
        <sphereGeometry args={[0.26, 14, 14]} />
        <meshStandardMaterial color="#14532d" roughness={0.90} />
      </mesh>
      <mesh position={[0.06, 0.64, 0.22]} castShadow>
        <sphereGeometry args={[0.24, 14, 14]} />
        <meshStandardMaterial color="#166534" roughness={0.88} />
      </mesh>
      <mesh position={[-0.10, 0.72, -0.20]} castShadow>
        <sphereGeometry args={[0.20, 14, 14]} />
        <meshStandardMaterial color="#15803d" roughness={0.90} />
      </mesh>
    </group>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN 3D STOREFRONT MODEL
// ─────────────────────────────────────────────────────────────────────────────
function Storefront3DModel({ isUnlocked, onUnlockClick }: { isUnlocked: boolean; onUnlockClick: () => void }) {
  const doorRef = useRef<THREE.Group>(null)
  const stuccoTex = React.useMemo(() => makeStuccoTexture(), [])
  const graniteTex = React.useMemo(() => makeGraniteTexture(), [])
  const woodTex = React.useMemo(() => makeWoodTexture(), [])

  useFrame(() => {
    if (doorRef.current && isUnlocked) {
      doorRef.current.rotation.y = THREE.MathUtils.lerp(doorRef.current.rotation.y, -Math.PI / 2.15, 0.035)
    }
  })

  return (
    <group>
      {/* ── FORECOURT GROUND ─────────────────────────────────────────── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.12, 1.4]} receiveShadow>
        <planeGeometry args={[18, 10]} />
        <meshStandardMaterial map={graniteTex} color="#38424e" roughness={0.38} metalness={0.28} />
      </mesh>
      {/* Granite grout lines */}
      {[-3, 0, 3].map((gx, i) => (
        <mesh key={`gv-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[gx, -2.108, 1.4]}>
          <planeGeometry args={[0.04, 10]} />
          <meshBasicMaterial color="#252e38" />
        </mesh>
      ))}
      {[-2, 0, 2].map((gz, i) => (
        <mesh key={`gh-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.108, gz]}>
          <planeGeometry args={[18, 0.04]} />
          <meshBasicMaterial color="#252e38" />
        </mesh>
      ))}

      {/* Granite raised threshold step */}
      <mesh position={[0, -1.94, 0.62]} receiveShadow castShadow>
        <boxGeometry args={[4.2, 0.24, 1.3]} />
        <meshStandardMaterial color="#2c3642" roughness={0.34} metalness={0.32} />
      </mesh>
      {/* Step front nose edge (polished) */}
      <mesh position={[0, -2.07, 1.24]}>
        <boxGeometry args={[4.22, 0.06, 0.04]} />
        <meshStandardMaterial color="#48596a" metalness={0.5} roughness={0.22} />
      </mesh>

      {/* ── MAIN FACADE WALL ─────────────────────────────────────────── */}
      <mesh position={[0, 0.88, -0.14]} receiveShadow>
        <boxGeometry args={[11.4, 6.2, 0.24]} />
        <meshStandardMaterial map={stuccoTex} color="#ede4d6" roughness={0.92} />
      </mesh>

      {/* ── LOWER WAINSCOT PANELING ───────────────────────────────────── */}
      <mesh position={[0, -1.04, 0.06]} castShadow receiveShadow>
        <boxGeometry args={[9.4, 1.76, 0.20]} />
        <meshStandardMaterial map={woodTex} color="#7a3820" roughness={0.50} />
      </mesh>
      {/* Top capping rail */}
      <mesh position={[0, -0.13, 0.12]} castShadow>
        <boxGeometry args={[9.5, 0.12, 0.26]} />
        <meshStandardMaterial color="#3c2010" roughness={0.44} />
      </mesh>
      {/* Bottom baseboard */}
      <mesh position={[0, -1.93, 0.12]} castShadow>
        <boxGeometry args={[9.5, 0.16, 0.26]} />
        <meshStandardMaterial color="#3c2010" roughness={0.44} />
      </mesh>
      {/* Vertical relief slats */}
      {[-4.2, -3.2, -2.2, -1.2, 1.2, 2.2, 3.2, 4.2].map((x, i) => (
        <mesh key={i} position={[x, -1.04, 0.18]} castShadow>
          <boxGeometry args={[0.058, 1.64, 0.045]} />
          <meshStandardMaterial color="#4a2208" roughness={0.40} />
        </mesh>
      ))}

      {/* ── UPPER HEADER FASCIA ──────────────────────────────────────── */}
      <mesh position={[0, 2.74, 0.24]} castShadow receiveShadow>
        <boxGeometry args={[9.8, 0.96, 0.48]} />
        <meshStandardMaterial color="#2e2018" roughness={0.44} />
      </mesh>
      {/* Gold accent reveal strip */}
      <mesh position={[0, 2.27, 0.28]} castShadow>
        <boxGeometry args={[9.8, 0.085, 0.38]} />
        <meshStandardMaterial color="#c8940c" emissive="#885500" emissiveIntensity={0.14}
          metalness={0.75} roughness={0.28} />
      </mesh>

      {/* ── DISPLAY WINDOWS ──────────────────────────────────────────── */}
      <DisplayWindow position={[-2.95, 0.60, 0]} woodTex={woodTex} />
      <DisplayWindow position={[2.95, 0.60, 0]} woodTex={woodTex} />

      {/* ── DOORWAY ASSEMBLY ─────────────────────────────────────────── */}
      <group position={[0, 0.12, 0]}>
        {/* Door frame — top architrave */}
        <mesh position={[0, 1.98, 0.12]} castShadow>
          <boxGeometry args={[1.90, 0.22, 0.32]} />
          <meshStandardMaterial color="#302820" roughness={0.48} />
        </mesh>
        {/* Left jamb */}
        <mesh position={[-0.90, 0.78, 0.12]} castShadow>
          <boxGeometry args={[0.20, 2.44, 0.32]} />
          <meshStandardMaterial color="#302820" roughness={0.48} />
        </mesh>
        {/* Right jamb */}
        <mesh position={[0.90, 0.78, 0.12]} castShadow>
          <boxGeometry args={[0.20, 2.44, 0.32]} />
          <meshStandardMaterial color="#302820" roughness={0.48} />
        </mesh>

        {/* Fanlight transom frame */}
        <mesh position={[0, 2.22, 0.12]} castShadow>
          <boxGeometry args={[1.58, 0.064, 0.28]} />
          <meshStandardMaterial color="#181008" roughness={0.46} />
        </mesh>
        {/* Fanlight glass */}
        <mesh position={[0, 2.36, 0.12]}>
          <boxGeometry args={[1.56, 0.28, 0.068]} />
          <meshPhysicalMaterial color="#fff8c8" transparent opacity={0.26} roughness={0.04} transmission={0.92} ior={1.5} />
        </mesh>
        {/* Fanlight muntins */}
        {[-0.40, 0, 0.40].map((mx, i) => (
          <mesh key={i} position={[mx, 2.36, 0.14]}>
            <boxGeometry args={[0.042, 0.30, 0.022]} />
            <meshStandardMaterial color="#130e08" roughness={0.50} />
          </mesh>
        ))}
        {/* Fanlight point light */}
        <pointLight position={[0, 2.36, 0.22]} color="#ffee88" intensity={0.6} distance={1.5} />

        {/* SWINGING DOOR */}
        <group ref={doorRef} position={[-0.72, 0, 0.16]}>
          <group position={[0.72, 0, 0]}>
            {/* Door leaf */}
            <mesh castShadow receiveShadow>
              <boxGeometry args={[1.44, 3.86, 0.13]} />
              <meshStandardMaterial color="#5c3820" roughness={0.44} />
            </mesh>

            {/* Raised upper panel (glazed) — outer molding */}
            <mesh position={[0, 0.85, 0.068]} castShadow>
              <boxGeometry args={[1.06, 1.62, 0.042]} />
              <meshStandardMaterial color="#2c0e02" roughness={0.50} />
            </mesh>
            {/* Glass upper pane */}
            <mesh position={[0, 0.85, 0.080]}>
              <boxGeometry args={[0.92, 1.48, 0.065]} />
              <meshPhysicalMaterial color="#fef6d0" transparent opacity={0.24} roughness={0.04} transmission={0.90} ior={1.5} />
            </mesh>
            {/* Upper glass horizontal bar */}
            <mesh position={[0, 0.85, 0.11]}>
              <boxGeometry args={[0.92, 0.048, 0.042]} />
              <meshStandardMaterial color="#1a0802" roughness={0.42} />
            </mesh>
            {/* Upper glass vertical bar */}
            <mesh position={[0, 0.85, 0.11]}>
              <boxGeometry args={[0.048, 1.48, 0.042]} />
              <meshStandardMaterial color="#1a0802" roughness={0.42} />
            </mesh>

            {/* Lower raised panel — outer molding */}
            <mesh position={[0, -0.94, 0.068]} castShadow>
              <boxGeometry args={[1.06, 1.38, 0.042]} />
              <meshStandardMaterial color="#2c0e02" roughness={0.50} />
            </mesh>
            {/* Lower center raised rectangle */}
            <mesh position={[0, -0.94, 0.095]} castShadow>
              <boxGeometry args={[0.82, 1.16, 0.038]} />
              <meshStandardMaterial color="#3a1204" roughness={0.48} />
            </mesh>
            {/* Lower panel inner bevel strip */}
            <mesh position={[0, -0.94, 0.115]} castShadow>
              <boxGeometry args={[0.68, 1.02, 0.010]} />
              <meshStandardMaterial color="#2e0e02" roughness={0.52} />
            </mesh>

            {/* Mid-door horizontal rail */}
            <mesh position={[0, 0.08, 0.068]} castShadow>
              <boxGeometry args={[1.44, 0.11, 0.022]} />
              <meshStandardMaterial color="#180802" roughness={0.50} />
            </mesh>

            {/* Brass hinge plates — 3 hinges */}
            {[-1.40, 0, 1.40].map((hy, i) => (
              <group key={i} position={[-0.66, hy * 0.74, 0.072]}>
                <mesh castShadow>
                  <boxGeometry args={[0.055, 0.18, 0.034]} />
                  <meshStandardMaterial color="#c8940c" metalness={0.92} roughness={0.17} />
                </mesh>
                {/* Hinge pin */}
                <mesh position={[0, 0, 0.022]} castShadow>
                  <cylinderGeometry args={[0.009, 0.009, 0.18, 10]} />
                  <meshStandardMaterial color="#a07810" metalness={0.95} roughness={0.12} />
                </mesh>
              </group>
            ))}

            {/* Brass bar door handle */}
            <group position={[0.48, -0.24, 0.11]}>
              {/* Back rose */}
              <mesh castShadow>
                <cylinderGeometry args={[0.028, 0.028, 0.065, 16]} />
                <meshStandardMaterial color="#c8940c" metalness={0.94} roughness={0.15} />
              </mesh>
              {/* Horizontal bar */}
              <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.04, 0.20]} castShadow>
                <cylinderGeometry args={[0.018, 0.018, 0.42, 16]} />
                <meshStandardMaterial color="#d4a828" metalness={0.96} roughness={0.13} />
              </mesh>
              {/* End cap sphere */}
              <mesh position={[0, 0.04, 0.42]} castShadow>
                <sphereGeometry args={[0.024, 16, 16]} />
                <meshStandardMaterial color="#c8940c" metalness={0.94} roughness={0.15} />
              </mesh>
            </group>

            {/* CLOSE / OPEN SIGN */}
            <group position={[0, 0.90, 0.11]}>
              {/* Left cord */}
              <mesh position={[-0.22, 0.30, 0]} rotation={[0, 0, -0.35]} castShadow>
                <cylinderGeometry args={[0.006, 0.006, 0.32, 8]} />
                <meshStandardMaterial color="#d4c8b0" roughness={0.68} />
              </mesh>
              {/* Right cord */}
              <mesh position={[0.22, 0.30, 0]} rotation={[0, 0, 0.35]} castShadow>
                <cylinderGeometry args={[0.006, 0.006, 0.32, 8]} />
                <meshStandardMaterial color="#d4c8b0" roughness={0.68} />
              </mesh>
              {/* Sign board */}
              <mesh castShadow>
                <boxGeometry args={[0.74, 0.32, 0.030]} />
                <meshStandardMaterial color="#0d0c0a" roughness={0.43} />
              </mesh>
              {/* Brass border strips */}
              {[[-0.36, 0, 0.017], [0.36, 0, 0.017]].map(([bx, by, bz], i) => (
                <mesh key={i} position={[bx, by, bz]}>
                  <boxGeometry args={[0.022, 0.30, 0.006]} />
                  <meshStandardMaterial color="#c8940c" metalness={0.92} roughness={0.18} />
                </mesh>
              ))}
              <mesh position={[0, 0.145, 0.017]}>
                <boxGeometry args={[0.69, 0.022, 0.006]} />
                <meshStandardMaterial color="#c8940c" metalness={0.92} roughness={0.18} />
              </mesh>
              <mesh position={[0, -0.145, 0.017]}>
                <boxGeometry args={[0.69, 0.022, 0.006]} />
                <meshStandardMaterial color="#c8940c" metalness={0.92} roughness={0.18} />
              </mesh>
              <CanvasTextPlane
                position={[0, 0, 0.022]}
                text={isUnlocked ? 'OPEN' : 'CLOSE'}
                color={isUnlocked ? '#34d399' : '#f5d060'}
                width={0.68}
                height={0.24}
                fontSize={16}
                fontWeight="bold"
              />
            </group>

            {/* INTERACTIVE PADLOCK */}
            <Padlock3D isUnlocked={isUnlocked} onClick={onUnlockClick} />
          </group>
        </group>
      </group>

      {/* ── WALL SCONCES ─────────────────────────────────────────────── */}
      <WallSconce position={[-1.12, 1.84, 0.24]} />
      <WallSconce position={[1.12, 1.84, 0.24]} />

      {/* ── PLANTERS ─────────────────────────────────────────────────── */}
      <TerracottaPlanter position={[-4.2, -1.40, 0.86]} />
      <TerracottaPlanter position={[4.2, -1.40, 0.86]} />

      {/* ── INTERIOR AMBIENT ─────────────────────────────────────────── */}
      <mesh position={[0, 0.60, -2.0]}>
        <planeGeometry args={[10.0, 5.8]} />
        <meshStandardMaterial color="#4a1e08" roughness={0.96} emissive="#603010" emissiveIntensity={0.35} />
      </mesh>
      <pointLight position={[0, 1.0, -1.6]} color="#ff8828" intensity={5.5} distance={10} />

      {/* ── LOWER ZONE FILL LIGHTS (brighten wainscot + forecourt) ─── */}
      {/* Wide warm fill sweeping across the entire lower panel */}
      <pointLight position={[0, -0.8, 2.2]} color="#ffcc88" intensity={6.0} distance={9.0} />
      {/* Left lower fill */}
      <pointLight position={[-3.5, -1.2, 1.8]} color="#ffaa55" intensity={3.5} distance={6.0} />
      {/* Right lower fill */}
      <pointLight position={[3.5, -1.2, 1.8]} color="#ffaa55" intensity={3.5} distance={6.0} />
      {/* Ground forecourt up-light */}
      <pointLight position={[0, -2.0, 2.0]} color="#ffd080" intensity={4.0} distance={7.0} />
      {/* Center façade wash — broad soft forward light */}
      <pointLight position={[0, 0.5, 3.5]} color="#fff4d8" intensity={2.5} distance={12.0} />
    </group>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// CAMERA RIG
// ─────────────────────────────────────────────────────────────────────────────
function StorefrontCameraRig({ isTransitioning }: { isTransitioning: boolean }) {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null)
  useFrame((state) => {
    if (!cameraRef.current) return
    if (isTransitioning) {
      cameraRef.current.position.z = THREE.MathUtils.lerp(cameraRef.current.position.z, -0.8, 0.04)
      cameraRef.current.position.y = THREE.MathUtils.lerp(cameraRef.current.position.y, 0.08, 0.04)
    } else {
      const targetX = state.pointer.x * 0.26
      const targetY = state.pointer.y * 0.14 + 0.10
      cameraRef.current.position.x = THREE.MathUtils.lerp(cameraRef.current.position.x, targetX, 0.04)
      cameraRef.current.position.y = THREE.MathUtils.lerp(cameraRef.current.position.y, targetY, 0.04)
      cameraRef.current.lookAt(0, 0.14, 0)
    }
  })
  return <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 0.12, 5.2]} fov={46} />
}

// ─────────────────────────────────────────────────────────────────────────────
// MASTER EXPORT
// ─────────────────────────────────────────────────────────────────────────────
export const StorefrontScene: React.FC<StorefrontSceneProps> = ({ onUnlockClick, isUnlocked, isTransitioning }) => {
  const handleUnlockTrigger = () => {
    playMechanicalUnlockAudio()
    onUnlockClick()
  }

  return (
    <div className="relative w-full h-full bg-[#1a0e06] overflow-hidden select-none">
      {/* 3D Canvas */}
      <div className="absolute inset-0 z-0">
        <Canvas
          shadows={{ type: THREE.PCFSoftShadowMap }}
          gl={{
            antialias: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.35,
            powerPreference: 'high-performance'
          }}
          className="w-full h-full"
        >
          <StorefrontCameraRig isTransitioning={isTransitioning} />
          <color attach="background" args={['#1a0e06']} />

          {/* Base ambient — very dark, warm */}
          <ambientLight intensity={0.72} color="#ffe8c8" />

          {/* Key sunlight — warm gold from upper-right */}
          <directionalLight
            position={[5, 10, 8]}
            intensity={1.85}
            color="#fff5e0"
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-camera-left={-9}
            shadow-camera-right={9}
            shadow-camera-top={9}
            shadow-camera-bottom={-9}
            shadow-bias={-0.00018}
          />

          {/* Cool blue sky fill from left */}
          <directionalLight position={[-7, 5, 4]} intensity={0.55} color="#c8dcf0" />

          {/* Ground bounce — very subtle warm */}
          <hemisphereLight args={['#ffe8b8', '#c89050', 0.65]} />

          <React.Suspense fallback={null}>
            <Storefront3DModel isUnlocked={isUnlocked} onUnlockClick={handleUnlockTrigger} />
          </React.Suspense>
        </Canvas>
      </div>

      {/* HTML Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-6 md:p-8 lg:p-10">
        {/* TOP BAR */}
        <div className="w-full flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25 border border-white/10">
              <span className="text-white font-black text-sm tracking-tighter">RV</span>
            </div>
            <div>
              <div className="text-lg font-bold tracking-tight text-white flex items-center">
                <span>Retail</span><span className="text-cyan-400">Vision</span>
              </div>
              <div className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase">COMMERCE INTELLIGENCE</div>
            </div>
          </div>
        </div>

        {/* BOTTOM PILL */}
        <div className="w-full flex justify-center pointer-events-auto">
          <div onClick={handleUnlockTrigger}
            className="px-6 py-2.5 rounded-full bg-black/80 backdrop-blur-md border border-amber-500/30 text-amber-300 text-xs font-medium shadow-2xl flex items-center gap-2.5 hover:border-amber-400/60 cursor-pointer transition-all hover:scale-[1.02]">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_#f59e0b]" />
            <span>Click the golden padlock or tap here to unlock storefront</span>
          </div>
        </div>
      </div>

      {/* Cinematic flash */}
      {isTransitioning && (
        <div className="absolute inset-0 z-20 bg-gradient-to-t from-amber-400/40 via-white/60 to-amber-200/50 pointer-events-none animate-pulse transition-opacity duration-700" />
      )}
    </div>
  )
}

/**
 * RetailVision - Cinematic Realistic 3D Storefront Entrance
 * AAA Architectural Visualization of a Luxury Retail Boutique.
 * Features:
 *  - Honed limestone facade panels & architectural dark walnut fins
 *  - Floor-to-ceiling transparent glass showroom windows
 *  - Fully visible illuminated luxury interior (marble plinths, designer displays, chandeliers)
 *  - Premium Brushed Brass & Champagne Gold Smart Biometric Lock
 *  - Cantilevered canopy with recessed spotlights & up/down architectural sconces
 *  - Flamed granite sidewalk pavers, fluted planters & manicured greenery
 *  - Synthesized Web Audio mechanical click & biometric unlock chime
 *  - Cinematic perspective camera with mouse parallax and smooth flythrough transition
 */

import React, { useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { PerspectiveCamera, Text } from '@react-three/drei'
import * as THREE from 'three'
import {
  createWalnutWoodTexture,
  createLimestoneTexture,
  createGranitePaverTexture,
  createChevronParquetTexture,
  createMarbleTexture
} from './textures'
import { playLockHoverSound, playLockSuccessSound } from '../../utils/audio'

interface StorefrontSceneProps {
  onUnlockClick: () => void
  isUnlocked: boolean
  isTransitioning: boolean
  isAudioMuted?: boolean
}

// ========================================================
// 1. PREMIUM GOLDEN SMART BIOMETRIC LOCK COMPONENT
// ========================================================
function GoldenSmartLock({
  isUnlocked,
  onClick,
  isAudioMuted = false
}: {
  isUnlocked: boolean
  onClick: () => void
  isAudioMuted?: boolean
}) {
  const [hovered, setHovered] = useState(false)
  const lockGroupRef = useRef<THREE.Group>(null)
  const boltRef = useRef<THREE.Mesh>(null)
  const scannerRingRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    const t = state.clock.getElapsedTime()

    if (lockGroupRef.current) {
      if (hovered && !isUnlocked) {
        // Subtle magnetic breathing animation on hover
        lockGroupRef.current.position.y = -0.15 + Math.sin(t * 4) * 0.015
        lockGroupRef.current.scale.setScalar(THREE.MathUtils.lerp(lockGroupRef.current.scale.x, 1.06, 0.1))
      } else {
        lockGroupRef.current.position.y = -0.15
        lockGroupRef.current.scale.setScalar(THREE.MathUtils.lerp(lockGroupRef.current.scale.x, 1.0, 0.1))
      }
    }

    // Biometric LED Scanner Ring pulse animation
    if (scannerRingRef.current) {
      const mat = scannerRingRef.current.material as THREE.MeshStandardMaterial
      if (isUnlocked) {
        mat.color.set('#10b981')
        mat.emissive.set('#059669')
        mat.emissiveIntensity = 2.2
      } else if (hovered) {
        const pulse = 1.2 + Math.sin(t * 8) * 0.5
        mat.color.set('#38bdf8')
        mat.emissive.set('#0284c7')
        mat.emissiveIntensity = pulse
      } else {
        const pulse = 0.8 + Math.sin(t * 3) * 0.3
        mat.color.set('#f59e0b')
        mat.emissive.set('#b45309')
        mat.emissiveIntensity = pulse
      }
    }

    // Mechanical Locking Bolt Slide Animation
    if (boltRef.current) {
      const targetX = isUnlocked ? -0.12 : 0
      boltRef.current.position.x = THREE.MathUtils.lerp(boltRef.current.position.x, targetX, 0.12)
    }
  })

  return (
    <group
      ref={lockGroupRef}
      position={[0.42, -0.15, 0.16]}
      onClick={(e) => {
        e.stopPropagation()
        playLockSuccessSound(isAudioMuted)
        onClick()
      }}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
        playLockHoverSound(isAudioMuted)
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        setHovered(false)
        document.body.style.cursor = 'default'
      }}
    >
      {/* Smart Lock Main Chassis - Brushed Champagne Gold / Brass */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.22, 0.44, 0.08]} />
        <meshStandardMaterial
          color={hovered ? '#fbbf24' : '#d4af37'}
          metalness={0.92}
          roughness={0.22}
          emissive={hovered ? '#f59e0b' : '#78350f'}
          emissiveIntensity={hovered ? 0.3 : 0.08}
        />
      </mesh>

      {/* Chamfered Accent Bezel Rim */}
      <mesh position={[0, 0, 0.041]} castShadow>
        <boxGeometry args={[0.20, 0.42, 0.008]} />
        <meshStandardMaterial
          color="#1e1e24"
          metalness={0.8}
          roughness={0.3}
        />
      </mesh>

      {/* Biometric Circular Fingerprint Scanner */}
      <group position={[0, 0.11, 0.046]}>
        {/* Scanner Touch Plate */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.048, 0.048, 0.008, 32]} />
          <meshStandardMaterial
            color="#0f172a"
            metalness={0.95}
            roughness={0.1}
          />
        </mesh>
        {/* Illuminated Neon Halo Ring */}
        <mesh ref={scannerRingRef} position={[0, 0, 0.005]}>
          <ringGeometry args={[0.045, 0.054, 32]} />
          <meshStandardMaterial
            color="#f59e0b"
            emissive="#b45309"
            emissiveIntensity={1.0}
            toneMapped={false}
          />
        </mesh>
        {/* Micro Sensor Icon / Ridges */}
        <mesh position={[0, 0, 0.006]}>
          <ringGeometry args={[0.02, 0.028, 24]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.6} />
        </mesh>
      </group>

      {/* Digital Touch Capacitive Keypad Matrix (Etched OLED Dots) */}
      <group position={[0, -0.06, 0.046]}>
        {[-0.045, 0, 0.045].map((x, colIdx) =>
          [-0.05, -0.015, 0.02, 0.055].map((y, rowIdx) => (
            <mesh key={`${colIdx}-${rowIdx}`} position={[x, y, 0]}>
              <circleGeometry args={[0.009, 12]} />
              <meshStandardMaterial
                color={hovered ? '#e2e8f0' : '#64748b'}
                emissive={hovered ? '#94a3b8' : '#334155'}
                emissiveIntensity={hovered ? 0.8 : 0.2}
              />
            </mesh>
          ))
        )}
      </group>

      {/* Mechanical Internal Stainless Bolt (visible at side latch) */}
      <mesh ref={boltRef} position={[0.11, 0, 0]}>
        <boxGeometry args={[0.05, 0.06, 0.04]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.98} roughness={0.12} />
      </mesh>

      {/* Floating Holographic Interaction Badge */}
      <group position={[0, -0.32, 0.12]}>
        {/* Glow pill background */}
        <mesh position={[0, 0, -0.005]}>
          <planeGeometry args={[1.3, 0.24]} />
          <meshBasicMaterial
            color={isUnlocked ? '#064e3b' : hovered ? '#451a03' : '#1e293b'}
            transparent
            opacity={0.88}
          />
        </mesh>
        <Text
          fontSize={0.08}
          color={isUnlocked ? '#34d399' : hovered ? '#fbbf24' : '#e2e8f0'}
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.12}
          fontWeight="bold"
        >
          {isUnlocked ? 'ACCESS GRANTED' : hovered ? 'CLICK TO UNLOCK' : 'SMART LOCK SECURED'}
        </Text>
      </group>

      {/* Soft point glow focused on the smart lock */}
      <pointLight
        position={[0, 0, 0.25]}
        intensity={hovered ? 1.8 : 0.8}
        distance={2.5}
        color={isUnlocked ? '#34d399' : hovered ? '#fde68a' : '#fed7aa'}
      />
    </group>
  )
}

// ========================================================
// 2. LUXURY VISIBLE INTERIOR COMPONENT (SEEN THROUGH GLASS)
// ========================================================
function BoutiqueInterior({
  isUnlocked,
  walnutTex,
  chevronTex,
  marbleTex
}: {
  isUnlocked: boolean
  walnutTex: THREE.CanvasTexture
  chevronTex: THREE.CanvasTexture
  marbleTex: THREE.CanvasTexture
}) {
  return (
    <group position={[0, 0, -1.8]}>
      {/* Interior Herringbone Parquet Flooring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.98, 0.8]} receiveShadow>
        <planeGeometry args={[13, 5]} />
        <meshStandardMaterial map={chevronTex} roughness={0.35} metalness={0.1} />
      </mesh>

      {/* Warm Ambient Rear Feature Wall (Dark Walnut & Brass Inlay) */}
      <mesh position={[0, 0.8, -1.2]} receiveShadow>
        <planeGeometry args={[13, 5.8]} />
        <meshStandardMaterial map={walnutTex} roughness={0.5} />
      </mesh>

      {/* Architectural Linear Brass Trim Inlay on Back Wall */}
      {[-4.0, -2.0, 0, 2.0, 4.0].map((x, i) => (
        <mesh key={i} position={[x, 0.8, -1.18]}>
          <boxGeometry args={[0.02, 5.8, 0.01]} />
          <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.2} />
        </mesh>
      ))}

      {/* Interior Ceiling with Recessed Warm LED Cove */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 3.6, 0.8]}>
        <planeGeometry args={[13, 5]} />
        <meshStandardMaterial color="#1e1e24" roughness={0.8} />
      </mesh>

      {/* ==================================================== */}
      {/* LEFT WINDOW DISPLAY: Luxury Chronograph & Perfume */}
      {/* ==================================================== */}
      <group position={[-3.3, 0, 0.3]}>
        {/* Sculptural Black Fluted Marble Pedestal */}
        <mesh position={[0, -1.2, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.42, 0.46, 1.5, 32]} />
          <meshStandardMaterial color="#18181b" roughness={0.25} metalness={0.2} />
        </mesh>

        {/* Brushed Brass Tier Accent Ring */}
        <mesh position={[0, -0.44, 0]}>
          <cylinderGeometry args={[0.44, 0.44, 0.03, 32]} />
          <meshStandardMaterial color="#d4af37" metalness={0.92} roughness={0.2} />
        </mesh>

        {/* Display Item 1: Luxury Chronograph Timepiece on Stand */}
        <group position={[-0.12, -0.25, 0]}>
          {/* Watch Stand */}
          <mesh position={[0, 0.08, 0]} castShadow>
            <cylinderGeometry args={[0.015, 0.015, 0.18, 16]} />
            <meshStandardMaterial color="#09090b" roughness={0.2} />
          </mesh>
          {/* Watch Bezel & Case */}
          <mesh position={[0, 0.17, 0]} rotation={[0.4, 0.2, 0]} castShadow>
            <cylinderGeometry args={[0.07, 0.07, 0.025, 32]} />
            <meshStandardMaterial color="#d4af37" metalness={0.95} roughness={0.15} />
          </mesh>
          {/* Sapphire Crystal Face */}
          <mesh position={[0, 0.185, 0]} rotation={[0.4, 0.2, 0]}>
            <circleGeometry args={[0.055, 32]} />
            <meshStandardMaterial color="#0284c7" metalness={0.9} roughness={0.05} />
          </mesh>
        </group>

        {/* Display Item 2: Emerald Cut Designer Fragrance Flacon */}
        <group position={[0.15, -0.28, 0.08]}>
          <mesh castShadow>
            <boxGeometry args={[0.09, 0.14, 0.07]} />
            <meshPhysicalMaterial
              color="#059669"
              transparent
              opacity={0.65}
              roughness={0.05}
              transmission={0.85}
              ior={1.5}
            />
          </mesh>
          {/* Golden Cap */}
          <mesh position={[0, 0.095, 0]} castShadow>
            <cylinderGeometry args={[0.025, 0.025, 0.05, 24]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.15} />
          </mesh>
        </group>

        {/* Contemporary Ring Chandelier Floating Overhead */}
        <group position={[0, 1.8, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.55, 0.025, 16, 48]} />
            <meshStandardMaterial
              color="#fbbf24"
              emissive="#f59e0b"
              emissiveIntensity={1.8}
              toneMapped={false}
            />
          </mesh>
          {/* Slim Suspension Cable */}
          <mesh position={[0, 0.7, 0]}>
            <cylinderGeometry args={[0.004, 0.004, 1.4, 8]} />
            <meshStandardMaterial color="#09090b" />
          </mesh>
          {/* Warm Chandelier Spotlight */}
          <pointLight intensity={isUnlocked ? 4.5 : 3.0} distance={4.5} color="#fed7aa" />
        </group>

        {/* Backlit Walnut Product Shelves along left wall */}
        <group position={[-2.4, 0.3, -0.6]}>
          {[0, 0.6, 1.2].map((y, idx) => (
            <group key={idx} position={[0, y, 0]}>
              <mesh position={[0, 0, 0]} castShadow>
                <boxGeometry args={[2.0, 0.05, 0.38]} />
                <meshStandardMaterial map={walnutTex} roughness={0.4} />
              </mesh>
              {/* Warm Under-shelf LED Strip */}
              <mesh position={[0, -0.028, 0.05]}>
                <boxGeometry args={[1.95, 0.008, 0.02]} />
                <meshBasicMaterial color="#fef08a" />
              </mesh>
              {/* Sample High-End Tech Displays on shelves */}
              <mesh position={[-0.5, 0.12, 0]} castShadow>
                <boxGeometry args={[0.18, 0.22, 0.14]} />
                <meshStandardMaterial color="#38bdf8" metalness={0.8} roughness={0.2} />
              </mesh>
              <mesh position={[0.4, 0.1, 0]} castShadow>
                <cylinderGeometry args={[0.08, 0.08, 0.18, 24]} />
                <meshStandardMaterial color="#f472b6" metalness={0.7} roughness={0.25} />
              </mesh>
            </group>
          ))}
        </group>
      </group>

      {/* ==================================================== */}
      {/* RIGHT WINDOW DISPLAY: Luxury Leather & Audio Tech */}
      {/* ==================================================== */}
      <group position={[3.3, 0, 0.3]}>
        {/* Polished White Carrara Marble Plinth */}
        <mesh position={[0, -1.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.85, 1.5, 0.85]} />
          <meshStandardMaterial map={marbleTex} roughness={0.2} metalness={0.1} />
        </mesh>

        {/* Display Item 1: Artisan Italian Leather Briefcase */}
        <group position={[-0.1, -0.22, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.34, 0.24, 0.12]} />
            <meshStandardMaterial color="#78350f" roughness={0.55} />
          </mesh>
          {/* Brass Buckles */}
          <mesh position={[-0.08, -0.03, 0.065]}>
            <boxGeometry args={[0.03, 0.05, 0.01]} />
            <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[0.08, -0.03, 0.065]}>
            <boxGeometry args={[0.03, 0.05, 0.01]} />
            <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>

        {/* Display Item 2: High-End Audiophile Headphones on Wooden Stand */}
        <group position={[0.22, -0.24, 0.08]}>
          {/* Wood Arc Stand */}
          <mesh castShadow>
            <torusGeometry args={[0.08, 0.02, 16, 24, Math.PI]} />
            <meshStandardMaterial map={walnutTex} roughness={0.4} />
          </mesh>
          {/* Headband & Earcups */}
          <mesh position={[0, 0.02, 0]}>
            <torusGeometry args={[0.09, 0.012, 16, 24, Math.PI]} />
            <meshStandardMaterial color="#09090b" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[-0.09, -0.04, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.035, 0.035, 0.04, 24]} />
            <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[0.09, -0.04, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.035, 0.035, 0.04, 24]} />
            <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>

        {/* Contemporary Ring Chandelier Floating Overhead */}
        <group position={[0, 1.8, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.55, 0.025, 16, 48]} />
            <meshStandardMaterial
              color="#fbbf24"
              emissive="#f59e0b"
              emissiveIntensity={1.8}
              toneMapped={false}
            />
          </mesh>
          <mesh position={[0, 0.7, 0]}>
            <cylinderGeometry args={[0.004, 0.004, 1.4, 8]} />
            <meshStandardMaterial color="#09090b" />
          </mesh>
          <pointLight intensity={isUnlocked ? 4.5 : 3.0} distance={4.5} color="#fed7aa" />
        </group>
      </group>

      {/* ==================================================== */}
      {/* CENTER DEPTH: Boutique Checkout Counter & Lush Flora */}
      {/* ==================================================== */}
      <group position={[0, -0.8, -0.6]}>
        {/* Curated Reception Island Counter */}
        <mesh position={[0, -0.6, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.4, 1.0, 0.8]} />
          <meshStandardMaterial map={marbleTex} roughness={0.2} />
        </mesh>
        {/* Dark Walnut Countertop Lip */}
        <mesh position={[0, -0.08, 0]} castShadow>
          <boxGeometry args={[2.48, 0.06, 0.88]} />
          <meshStandardMaterial map={walnutTex} roughness={0.35} />
        </mesh>
        {/* Under-counter Warm Ambient Glow Strip */}
        <mesh position={[0, -1.06, 0.41]}>
          <boxGeometry args={[2.3, 0.02, 0.02]} />
          <meshBasicMaterial color="#fef08a" />
        </mesh>
        <pointLight position={[0, -0.5, 0.6]} intensity={1.5} distance={3} color="#fde68a" />

        {/* Fiddle-Leaf Fig Indoor Plant in Fluted Ceramic Pot */}
        <group position={[1.8, -0.4, -0.1]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.26, 0.2, 0.65, 24]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.4} />
          </mesh>
          {/* Lush Green Foliage */}
          {[-0.1, 0, 0.1].map((ox, i) => (
            <mesh key={i} position={[ox, 0.45 + i * 0.15, (i - 1) * 0.08]} rotation={[0.2, i * 0.8, 0.1]} castShadow>
              <sphereGeometry args={[0.22, 12, 12]} />
              <meshStandardMaterial color="#166534" roughness={0.7} />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  )
}

// ========================================================
// 3. COMPLETE ARCHITECTURAL STOREFRONT SCENE
// ========================================================
function StorefrontArchitecture({
  isUnlocked,
  onUnlockClick,
  isAudioMuted = false
}: {
  isUnlocked: boolean
  onUnlockClick: () => void
  isAudioMuted?: boolean
}) {
  const doorRef = useRef<THREE.Group>(null)

  // Procedural Materials
  const walnutTex = useMemo(() => createWalnutWoodTexture(), [])
  const limestoneTex = useMemo(() => createLimestoneTexture(), [])
  const granitePaverTex = useMemo(() => createGranitePaverTexture(), [])
  const chevronTex = useMemo(() => createChevronParquetTexture(), [])
  const marbleTex = useMemo(() => createMarbleTexture(), [])

  useFrame(() => {
    if (doorRef.current && isUnlocked) {
      // Smooth inward pivot of the large architectural glass entrance door
      doorRef.current.rotation.y = THREE.MathUtils.lerp(
        doorRef.current.rotation.y,
        -Math.PI / 2.2,
        0.045
      )
    }
  })

  return (
    <group position={[0, 0, 0]}>
      {/* ==================================================== */}
      {/* EXTERIOR ENVIRONMENT & SIDEWALK PAVEMENT */}
      {/* ==================================================== */}
      {/* Flamed Dark Granite Sidewalk Pavement */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.0, 2.5]} receiveShadow>
        <planeGeometry args={[18, 9]} />
        <meshStandardMaterial map={granitePaverTex} roughness={0.7} metalness={0.15} />
      </mesh>

      {/* Raised Honed Stone Entrance Step with Embedded Brass Inlay */}
      <mesh position={[0, -1.94, 0.55]} receiveShadow castShadow>
        <boxGeometry args={[5.2, 0.14, 1.2]} />
        <meshStandardMaterial map={limestoneTex} roughness={0.6} />
      </mesh>
      {/* Front Edge Polished Brass Threshold Trim */}
      <mesh position={[0, -1.86, 1.15]} castShadow>
        <boxGeometry args={[5.22, 0.02, 0.04]} />
        <meshStandardMaterial color="#d4af37" metalness={0.95} roughness={0.15} />
      </mesh>

      {/* ==================================================== */}
      {/* MAIN FAÇADE STRUCTURE: Limestone & Fluted Walnut */}
      {/* ==================================================== */}
      {/* Rear Structural Facade Wall */}
      <mesh position={[0, 1.0, -0.15]} receiveShadow>
        <boxGeometry args={[14, 6.2, 0.2]} />
        <meshStandardMaterial color="#18181b" roughness={0.9} />
      </mesh>

      {/* Left Exterior Architectural Pilaster Column (Limestone Travertine) */}
      <mesh position={[-5.8, 0.9, 0.15]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 6.0, 0.5]} />
        <meshStandardMaterial map={limestoneTex} roughness={0.65} />
      </mesh>

      {/* Right Exterior Architectural Pilaster Column (Limestone Travertine) */}
      <mesh position={[5.8, 0.9, 0.15]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 6.0, 0.5]} />
        <meshStandardMaterial map={limestoneTex} roughness={0.65} />
      </mesh>

      {/* Architectural Dark Walnut Fluted Slat Accent Bands (flanking glass) */}
      {[-4.65, 4.65].map((xBase, bIdx) => (
        <group key={bIdx} position={[xBase, 0.8, 0.18]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.5, 5.6, 0.15]} />
            <meshStandardMaterial map={walnutTex} roughness={0.4} />
          </mesh>
          {/* Vertical Fine Slat Louvers */}
          {[-0.18, -0.06, 0.06, 0.18].map((lx, lIdx) => (
            <mesh key={lIdx} position={[lx, 0, 0.09]} castShadow>
              <boxGeometry args={[0.04, 5.56, 0.04]} />
              <meshStandardMaterial color="#1c110a" roughness={0.35} />
            </mesh>
          ))}
        </group>
      ))}

      {/* ==================================================== */}
      {/* CANTILEVERED CANOPY & 3D ILLUMINATED SIGNAGE */}
      {/* ==================================================== */}
      {/* Modern Cantilevered Anodized Matte Black Steel Canopy */}
      <mesh position={[0, 3.25, 0.55]} castShadow receiveShadow>
        <boxGeometry args={[11.5, 0.45, 1.4]} />
        <meshStandardMaterial color="#18181b" metalness={0.75} roughness={0.25} />
      </mesh>

      {/* Underside Soffit Trim with Warm Recessed LED Downlights */}
      <group position={[0, 3.0, 0.55]}>
        {[-3.6, -1.8, 0, 1.8, 3.6].map((sx, idx) => (
          <group key={idx} position={[sx, 0, 0]}>
            {/* Recessed Can Fixture */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.08, 0.08, 0.02, 16]} />
              <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={1.5} />
            </mesh>
            {/* Downward Architectural Spotlight Cone */}
            <spotLight
              position={[0, -0.02, 0]}
              target-position={[sx, -2, 0.55]}
              intensity={2.8}
              distance={6.5}
              angle={0.45}
              penumbra={0.6}
              color="#fed7aa"
            />
          </group>
        ))}
      </group>

      {/* 3D ILLUMINATED STOREFRONT SIGN: "RETAILVISION" */}
      <group position={[0, 3.25, 1.28]}>
        {/* Backlit Floating Sign Board Backing */}
        <mesh position={[0, 0, -0.02]} receiveShadow>
          <boxGeometry args={[4.8, 0.48, 0.03]} />
          <meshStandardMaterial color="#09090b" metalness={0.9} roughness={0.15} />
        </mesh>
        {/* Illuminated Luxury 3D Typography */}
        <Text
          fontSize={0.28}
          color="#f8fafc"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.16}
          fontWeight="bold"
        >
          RETAILVISION
        </Text>
        <Text
          position={[0, -0.16, 0.01]}
          fontSize={0.08}
          color="#d4af37"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.28}
          fontWeight="semibold"
        >
          YOUR WORLD OF RETAIL ANALYTICS
        </Text>
      </group>

      {/* ==================================================== */}
      {/* FLOOR-TO-CEILING GLASS SHOWROOM WINDOWS */}
      {/* ==================================================== */}
      {/* LEFT WINDOW PANE & ANODIZED BLACK PERIMETER FRAME */}
      <group position={[-2.75, 0.65, 0.12]}>
        {/* Outer Frame */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[3.2, 4.4, 0.1]} />
          <meshStandardMaterial color="#09090b" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Glass Sheet */}
        <mesh position={[0, 0, 0.01]}>
          <planeGeometry args={[3.04, 4.24]} />
          <meshPhysicalMaterial
            color="#e0f2fe"
            transparent
            opacity={0.22}
            roughness={0.04}
            transmission={0.92}
            ior={1.5}
            reflectivity={0.85}
          />
        </mesh>
      </group>

      {/* RIGHT WINDOW PANE & ANODIZED BLACK PERIMETER FRAME */}
      <group position={[2.75, 0.65, 0.12]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[3.2, 4.4, 0.1]} />
          <meshStandardMaterial color="#09090b" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0, 0.01]}>
          <planeGeometry args={[3.04, 4.24]} />
          <meshPhysicalMaterial
            color="#e0f2fe"
            transparent
            opacity={0.22}
            roughness={0.04}
            transmission={0.92}
            ior={1.5}
            reflectivity={0.85}
          />
        </mesh>
      </group>

      {/* ==================================================== */}
      {/* CENTRAL GRAND ENTRANCE & GLASS PIVOT DOOR */}
      {/* ==================================================== */}
      <group position={[0, 0.55, 0]}>
        {/* Entrance Portal Outer Frame */}
        <mesh position={[0, 0, 0.14]} castShadow>
          <boxGeometry args={[2.0, 4.6, 0.16]} />
          <meshStandardMaterial color="#09090b" metalness={0.85} roughness={0.25} />
        </mesh>

        {/* RECTANGULAR GLASS PIVOT DOOR ASSEMBLY (Swings Inward when Unlocked) */}
        <group ref={doorRef} position={[-0.85, 0, 0.18]}>
          {/* Door Leaf offset from hinge pivot point at x=-0.85 */}
          <group position={[0.85, 0, 0]}>
            {/* Slim Black Metal Door Perimeter Border */}
            <mesh castShadow receiveShadow>
              <boxGeometry args={[1.65, 4.42, 0.08]} />
              <meshStandardMaterial color="#18181b" metalness={0.8} roughness={0.3} />
            </mesh>

            {/* Large Clear Architectural Door Glass */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[1.52, 4.28, 0.05]} />
              <meshPhysicalMaterial
                color="#e0f2fe"
                transparent
                opacity={0.25}
                roughness={0.04}
                transmission={0.92}
                ior={1.52}
                reflectivity={0.9}
              />
            </mesh>

            {/* Luxury Floor-to-Ceiling Brushed Brass Pull Bar Handle */}
            <group position={[0.62, 0, 0.08]}>
              {/* Vertical Solid Brass Bar */}
              <mesh castShadow>
                <cylinderGeometry args={[0.022, 0.022, 1.6, 24]} />
                <meshStandardMaterial
                  color="#d4af37"
                  metalness={0.95}
                  roughness={0.18}
                />
              </mesh>
              {/* Stand-off Stanchion Mounts */}
              <mesh position={[-0.04, 0.65, -0.03]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.018, 0.018, 0.08, 16]} />
                <meshStandardMaterial color="#18181b" metalness={0.8} roughness={0.2} />
              </mesh>
              <mesh position={[-0.04, -0.65, -0.03]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.018, 0.018, 0.08, 16]} />
                <meshStandardMaterial color="#18181b" metalness={0.8} roughness={0.2} />
              </mesh>
            </group>

            {/* THE HERO INTERACTIVE GOLDEN SMART BIOMETRIC LOCK */}
            <GoldenSmartLock
              isUnlocked={isUnlocked}
              onClick={onUnlockClick}
              isAudioMuted={isAudioMuted}
            />
          </group>
        </group>
      </group>

      {/* ==================================================== */}
      {/* ARCHITECTURAL WALL SCONCES (UP/DOWN WARM LIGHT CONES) */}
      {/* ==================================================== */}
      {[-5.0, 5.0].map((x, i) => (
        <group key={i} position={[x, 1.2, 0.44]}>
          {/* Minimalist Matte Black Cylindrical Sconce */}
          <mesh castShadow>
            <cylinderGeometry args={[0.05, 0.05, 0.28, 16]} />
            <meshStandardMaterial color="#09090b" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Top Brass Emitter Ring */}
          <mesh position={[0, 0.14, 0]}>
            <cylinderGeometry args={[0.048, 0.048, 0.02, 16]} />
            <meshBasicMaterial color="#fef08a" />
          </mesh>
          {/* Bottom Brass Emitter Ring */}
          <mesh position={[0, -0.14, 0]}>
            <cylinderGeometry args={[0.048, 0.048, 0.02, 16]} />
            <meshBasicMaterial color="#fef08a" />
          </mesh>
          {/* Upward Light Cone */}
          <spotLight
            position={[0, 0.16, 0]}
            target-position={[x, 3.5, 0.3]}
            intensity={2.2}
            distance={4.0}
            angle={0.5}
            penumbra={0.7}
            color="#fed7aa"
          />
          {/* Downward Light Cone */}
          <spotLight
            position={[0, -0.16, 0]}
            target-position={[x, -1.8, 0.3]}
            intensity={2.2}
            distance={4.0}
            angle={0.5}
            penumbra={0.7}
            color="#fed7aa"
          />
        </group>
      ))}

      {/* ==================================================== */}
      {/* MODERN FLUTED CONCRETE PLANTERS & TOPIARY GREENERY */}
      {/* ==================================================== */}
      {/* Left Boutique Planter */}
      <group position={[-4.8, -1.3, 1.2]}>
        {/* Fluted Modern Trough Planter */}
        <mesh position={[0, -0.25, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.8, 0.9, 0.8]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.65} />
        </mesh>
        {/* Sculpted Spherical Topiary Buxus / Boxwood */}
        <mesh position={[0, 0.5, 0]} castShadow>
          <sphereGeometry args={[0.42, 20, 20]} />
          <meshStandardMaterial color="#15803d" roughness={0.8} />
        </mesh>
        <mesh position={[0.08, 0.72, 0.06]} castShadow>
          <sphereGeometry args={[0.26, 16, 16]} />
          <meshStandardMaterial color="#16a34a" roughness={0.8} />
        </mesh>
        {/* Landscape Ground Uplight */}
        <mesh position={[0.3, 0.22, 0.3]} rotation={[-0.4, 0, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.06, 12]} />
          <meshBasicMaterial color="#fef08a" />
        </mesh>
        <pointLight position={[0.3, 0.3, 0.3]} intensity={1.5} distance={2.5} color="#fed7aa" />
      </group>

      {/* Right Boutique Planter */}
      <group position={[4.8, -1.3, 1.2]}>
        <mesh position={[0, -0.25, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.8, 0.9, 0.8]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.65} />
        </mesh>
        <mesh position={[0, 0.5, 0]} castShadow>
          <sphereGeometry args={[0.42, 20, 20]} />
          <meshStandardMaterial color="#15803d" roughness={0.8} />
        </mesh>
        <mesh position={[-0.08, 0.72, 0.06]} castShadow>
          <sphereGeometry args={[0.26, 16, 16]} />
          <meshStandardMaterial color="#16a34a" roughness={0.8} />
        </mesh>
        <mesh position={[-0.3, 0.22, 0.3]} rotation={[-0.4, 0, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.06, 12]} />
          <meshBasicMaterial color="#fef08a" />
        </mesh>
        <pointLight position={[-0.3, 0.3, 0.3]} intensity={1.5} distance={2.5} color="#fed7aa" />
      </group>

      {/* ==================================================== */}
      {/* INTERIOR STORE SHOWROOM (VISIBLE THROUGH THE GLASS) */}
      {/* ==================================================== */}
      <BoutiqueInterior
        isUnlocked={isUnlocked}
        walnutTex={walnutTex}
        chevronTex={chevronTex}
        marbleTex={marbleTex}
      />
    </group>
  )
}

// ========================================================
// 4. CINEMATIC CAMERA RIG WITH SMOOTH PARALLAX & PORTAL ENTRY
// ========================================================
function StorefrontCameraRig({ isTransitioning }: { isTransitioning: boolean }) {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null)

  useFrame((state) => {
    if (!cameraRef.current) return

    if (isTransitioning) {
      // Smoothly push camera through the open glass door into the interior
      cameraRef.current.position.z = THREE.MathUtils.lerp(cameraRef.current.position.z, -1.6, 0.045)
      cameraRef.current.position.y = THREE.MathUtils.lerp(cameraRef.current.position.y, 0.4, 0.045)
      cameraRef.current.position.x = THREE.MathUtils.lerp(cameraRef.current.position.x, 0.0, 0.045)
    } else {
      // Natural responsive mouse parallax for high-end cinematic feel
      const targetX = state.pointer.x * 0.45
      const targetY = state.pointer.y * 0.25 + 0.35
      cameraRef.current.position.x = THREE.MathUtils.lerp(cameraRef.current.position.x, targetX, 0.05)
      cameraRef.current.position.y = THREE.MathUtils.lerp(cameraRef.current.position.y, targetY, 0.05)
      cameraRef.current.lookAt(0, 0.55, 0)
    }
  })

  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault
      position={[0, 0.35, 5.4]}
      fov={45}
    />
  )
}

// ========================================================
// 5. MASTER 3D STOREFRONT SCENE
// ========================================================
export const StorefrontScene: React.FC<StorefrontSceneProps> = ({
  onUnlockClick,
  isUnlocked,
  isTransitioning,
  isAudioMuted = false
}) => {
  return (
    <div className="w-full h-full relative bg-[#090b10]">
      <Canvas
        shadows
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.05
        }}
      >
        <StorefrontCameraRig isTransitioning={isTransitioning} />

        {/* Cinematic Architectural Evening Lighting */}
        <ambientLight intensity={0.65} color="#cbd5e1" />

        {/* Warm Sunlight / Key Light Angle */}
        <directionalLight
          position={[5, 9, 7]}
          intensity={1.4}
          color="#fef3c7"
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0001}
        />

        {/* Soft Cool Sky Hemispheric Fill */}
        <hemisphereLight args={['#38bdf8', '#1e293b', 0.5]} />

        {/* Architecture & Interactive Storefront */}
        <StorefrontArchitecture
          isUnlocked={isUnlocked}
          onUnlockClick={onUnlockClick}
          isAudioMuted={isAudioMuted}
        />
      </Canvas>
    </div>
  )
}

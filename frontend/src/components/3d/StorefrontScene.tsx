/**
 * RetailVision - Photorealistic Architectural 3D Storefront Entrance
 * High-End Architectural Visualization matching the physical storefront layout:
 *  - Authentic dark walnut wood grain & honed natural limestone textures
 *  - Radiant boutique showroom windows with fully visible illuminated luxury interior
 *  - Architectural up/down dual wall sconces with soft photometric lighting (no harsh glare blooms)
 *  - Precision brushed brass & champagne gold smart lock with biometric LED halo ring
 *  - Multi-tiered realistic boxwood topiary plants in modern fluted planters
 *  - Flamed dark granite sidewalk pavers with raised limestone step & brass trim
 *  - Balanced cinematic lighting with ACESFilmic tone mapping
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

interface StorefrontSceneProps {
  onUnlockClick: () => void
  isUnlocked: boolean
  isTransitioning: boolean
}

// ========================================================
// 1. TACTILE BRUSHED BRASS & GOLD SMART LOCK COMPONENT
// ========================================================
function SmartPadlock({
  isUnlocked,
  onClick
}: {
  isUnlocked: boolean
  onClick: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const lockRef = useRef<THREE.Group>(null)
  const shackleRef = useRef<THREE.Mesh>(null)
  const scannerRingRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    const t = state.clock.getElapsedTime()

    if (lockRef.current) {
      if (hovered && !isUnlocked) {
        // Subtle magnetic breathing animation on hover
        lockRef.current.position.y = -0.15 + Math.sin(t * 4) * 0.015
        lockRef.current.scale.setScalar(THREE.MathUtils.lerp(lockRef.current.scale.x, 1.06, 0.1))
      } else {
        lockRef.current.position.y = -0.15
        lockRef.current.scale.setScalar(THREE.MathUtils.lerp(lockRef.current.scale.x, 1.0, 0.1))
      }
    }

    if (shackleRef.current && isUnlocked) {
      // Animate shackle popping open
      shackleRef.current.position.y = THREE.MathUtils.lerp(shackleRef.current.position.y, 0.44, 0.1)
      shackleRef.current.rotation.y = THREE.MathUtils.lerp(shackleRef.current.rotation.y, 0.6, 0.1)
    }

    if (scannerRingRef.current) {
      const mat = scannerRingRef.current.material as THREE.MeshStandardMaterial
      if (isUnlocked) {
        mat.color.set('#10b981')
        mat.emissive.set('#059669')
        mat.emissiveIntensity = 2.0
      } else if (hovered) {
        const pulse = 1.2 + Math.sin(t * 8) * 0.4
        mat.color.set('#38bdf8')
        mat.emissive.set('#0284c7')
        mat.emissiveIntensity = pulse
      } else {
        const pulse = 0.8 + Math.sin(t * 3) * 0.25
        mat.color.set('#f59e0b')
        mat.emissive.set('#b45309')
        mat.emissiveIntensity = pulse
      }
    }
  })

  return (
    <group
      ref={lockRef}
      position={[0.38, -0.15, 0.18]}
      onClick={(e) => {
        e.stopPropagation()
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
      {/* Padlock Body - Brushed Champagne Brass */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.26, 0.34, 0.11]} />
        <meshStandardMaterial
          color={hovered ? '#fbbf24' : '#d4af37'}
          metalness={0.92}
          roughness={0.22}
          emissive={hovered ? '#f59e0b' : '#78350f'}
          emissiveIntensity={hovered ? 0.35 : 0.08}
        />
      </mesh>

      {/* Chamfered Face Rim */}
      <mesh position={[0, 0, 0.056]}>
        <boxGeometry args={[0.23, 0.31, 0.005]} />
        <meshStandardMaterial color="#1e1e24" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Biometric LED Scanner Ring */}
      <group position={[0, 0.04, 0.06]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.042, 0.042, 0.006, 24]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh ref={scannerRingRef} position={[0, 0, 0.004]}>
          <ringGeometry args={[0.038, 0.046, 32]} />
          <meshStandardMaterial color="#f59e0b" emissive="#b45309" emissiveIntensity={1.0} toneMapped={false} />
        </mesh>
      </group>

      {/* Classic Keyhole Slot */}
      <mesh position={[0, -0.065, 0.06]}>
        <circleGeometry args={[0.024, 16]} />
        <meshBasicMaterial color="#09090b" />
      </mesh>
      <mesh position={[0, -0.095, 0.06]}>
        <planeGeometry args={[0.016, 0.045]} />
        <meshBasicMaterial color="#09090b" />
      </mesh>

      {/* Polished Stainless Steel Padlock Shackle */}
      <mesh ref={shackleRef} position={[0, 0.22, 0]} castShadow>
        <torusGeometry args={[0.11, 0.032, 16, 32, Math.PI]} />
        <meshStandardMaterial
          color={hovered ? '#f1f5f9' : '#cbd5e1'}
          metalness={0.98}
          roughness={0.12}
        />
      </mesh>

      {/* Floating Prompt HUD Tag */}
      <group position={[0, -0.32, 0.1]}>
        <mesh position={[0, 0, -0.005]}>
          <planeGeometry args={[1.1, 0.22]} />
          <meshBasicMaterial
            color={isUnlocked ? '#064e3b' : hovered ? '#451a03' : '#1e293b'}
            transparent
            opacity={0.85}
          />
        </mesh>
        <Text
          fontSize={0.075}
          color={isUnlocked ? '#34d399' : hovered ? '#fbbf24' : '#e2e8f0'}
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.1}
          fontWeight="bold"
        >
          {isUnlocked ? 'ACCESS GRANTED' : hovered ? 'CLICK TO UNLOCK' : 'LOCKED'}
        </Text>
      </group>

      {/* Soft lock illumination */}
      <pointLight
        position={[0, 0, 0.2]}
        intensity={hovered ? 1.5 : 0.6}
        distance={2.0}
        color={isUnlocked ? '#34d399' : hovered ? '#fde68a' : '#fed7aa'}
      />
    </group>
  )
}

// ========================================================
// 2. COMPLETE ARCHITECTURAL STOREFRONT SCENE
// ========================================================
function StorefrontArchitecture({
  isUnlocked,
  onUnlockClick
}: {
  isUnlocked: boolean
  onUnlockClick: () => void
}) {
  const doorRef = useRef<THREE.Group>(null)

  // Procedural PBR Textures
  const walnutWoodTex = useMemo(() => createWalnutWoodTexture(), [])
  const limestoneTex = useMemo(() => createLimestoneTexture(), [])
  const granitePaverTex = useMemo(() => createGranitePaverTexture(), [])
  const chevronParquetTex = useMemo(() => createChevronParquetTexture(), [])
  const marbleTex = useMemo(() => createMarbleTexture(), [])

  useFrame(() => {
    if (doorRef.current && isUnlocked) {
      // Swing door inward smoothly
      doorRef.current.rotation.y = THREE.MathUtils.lerp(doorRef.current.rotation.y, -Math.PI / 2.2, 0.045)
    }
  })

  return (
    <group position={[0, 0, 0]}>
      {/* ==================================================== */}
      {/* GROUND & SIDEWALK ENVIRONMENT */}
      {/* ==================================================== */}
      {/* Flamed Dark Granite Sidewalk Flagstone Pavers */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.1, 1.8]} receiveShadow>
        <planeGeometry args={[16, 8]} />
        <meshStandardMaterial map={granitePaverTex} roughness={0.7} metalness={0.15} />
      </mesh>

      {/* Raised Honed Limestone Entrance Step with Brass Edge Inlay */}
      <mesh position={[0, -1.98, 0.5]} receiveShadow castShadow>
        <boxGeometry args={[4.6, 0.16, 1.1]} />
        <meshStandardMaterial map={limestoneTex} roughness={0.65} />
      </mesh>
      {/* Polished Brass Step Trim */}
      <mesh position={[0, -1.9, 1.05]} castShadow>
        <boxGeometry args={[4.62, 0.02, 0.03]} />
        <meshStandardMaterial color="#d4af37" metalness={0.95} roughness={0.15} />
      </mesh>

      {/* ==================================================== */}
      {/* FAÇADE WALL STRUCTURE */}
      {/* ==================================================== */}
      {/* Upper Facade Wall (Honed Natural Limestone / Travertine) */}
      <mesh position={[0, 1.0, -0.1]} receiveShadow>
        <boxGeometry args={[11, 5.8, 0.2]} />
        <meshStandardMaterial map={limestoneTex} roughness={0.7} />
      </mesh>

      {/* Lower Architectural Paneling (Rich Dark Walnut Wood) */}
      <mesh position={[0, -1.0, 0.06]} castShadow receiveShadow>
        <boxGeometry args={[8.8, 1.8, 0.14]} />
        <meshStandardMaterial map={walnutWoodTex} roughness={0.4} />
      </mesh>

      {/* Vertical Dark Walnut Slat Fins with Real Depth */}
      {[-3.8, -3.0, -2.2, 2.2, 3.0, 3.8].map((x, i) => (
        <group key={i} position={[x, -1.0, 0.14]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.06, 1.76, 0.05]} />
            <meshStandardMaterial color="#1f130b" roughness={0.35} />
          </mesh>
          {/* Subtle Brass Side Reveal Trim */}
          <mesh position={[0.032, 0, -0.01]}>
            <boxGeometry args={[0.005, 1.76, 0.02]} />
            <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>
      ))}

      {/* Upper Storefront Fascia Header */}
      <mesh position={[0, 2.7, 0.25]} castShadow receiveShadow>
        <boxGeometry args={[9.2, 0.95, 0.45]} />
        <meshStandardMaterial color="#18181b" metalness={0.8} roughness={0.25} />
      </mesh>

      {/* 3D Signboard Title: RETAILVISION */}
      <group position={[0, 2.7, 0.49]}>
        <Text
          fontSize={0.32}
          color="#f8fafc"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.12}
          fontWeight="bold"
        >
          RETAILVISION
        </Text>
        <Text
          position={[0, -0.22, 0.01]}
          fontSize={0.095}
          color="#d4af37"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.24}
          fontWeight="semibold"
        >
          3D RETAIL MARKETPLACE &amp; ANALYTICS
        </Text>
      </group>

      {/* Recessed Downlights under Canopy */}
      {[-3.0, -1.5, 0, 1.5, 3.0].map((dx, i) => (
        <group key={i} position={[dx, 2.22, 0.25]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 0.02, 16]} />
            <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={1.2} />
          </mesh>
          <spotLight
            position={[0, -0.05, 0]}
            target-position={[dx, -2, 0.25]}
            intensity={1.8}
            distance={5.0}
            angle={0.45}
            penumbra={0.7}
            color="#fed7aa"
          />
        </group>
      ))}

      {/* ==================================================== */}
      {/* LEFT WINDOW: RADIANT BOUTIQUE SHOWROOM DISPLAY */}
      {/* ==================================================== */}
      <group position={[-2.8, 0.55, 0]}>
        {/* Outer Anodized Dark Metal Window Frame */}
        <mesh position={[0, 0, 0.05]} castShadow>
          <boxGeometry args={[2.9, 2.3, 0.12]} />
          <meshStandardMaterial color="#18181b" metalness={0.8} roughness={0.25} />
        </mesh>

        {/* Clear Transparent Architectural Glass Pane */}
        <mesh position={[0, 0, 0.06]}>
          <planeGeometry args={[2.72, 2.12]} />
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

        {/* Interior Parquet Floor visible through window */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.1, -0.5]}>
          <planeGeometry args={[2.7, 1.4]} />
          <meshStandardMaterial map={chevronParquetTex} roughness={0.35} metalness={0.1} />
        </mesh>

        {/* Interior Shelves (Dark Walnut Wood with Warm LED Strips) */}
        {[-0.35, 0.35].map((sy, sIdx) => (
          <group key={sIdx} position={[0, sy, -0.55]}>
            <mesh castShadow>
              <boxGeometry args={[2.4, 0.05, 0.38]} />
              <meshStandardMaterial map={walnutWoodTex} roughness={0.4} />
            </mesh>
            {/* Under-shelf Warm LED Glow Strip */}
            <mesh position={[0, -0.028, 0.08]}>
              <boxGeometry args={[2.35, 0.008, 0.02]} />
              <meshBasicMaterial color="#fef08a" />
            </mesh>
          </group>
        ))}

        {/* Display Pedestal 1: Fluted Black Marble Podium */}
        <group position={[-0.65, -0.55, -0.45]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.26, 0.3, 0.8, 24]} />
            <meshStandardMaterial color="#18181b" roughness={0.25} metalness={0.2} />
          </mesh>
          {/* Brushed Brass Rim */}
          <mesh position={[0, 0.41, 0]}>
            <cylinderGeometry args={[0.28, 0.28, 0.02, 24]} />
            <meshStandardMaterial color="#d4af37" metalness={0.95} roughness={0.15} />
          </mesh>
          {/* Curated Chronograph Watch Display */}
          <group position={[0, 0.52, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.05, 0.05, 0.02, 24]} />
              <meshStandardMaterial color="#d4af37" metalness={0.95} roughness={0.15} />
            </mesh>
            <mesh position={[0, 0.012, 0]}>
              <circleGeometry args={[0.04, 24]} />
              <meshStandardMaterial color="#0284c7" metalness={0.9} roughness={0.1} />
            </mesh>
          </group>
        </group>

        {/* Display Item 2: Designer Emerald Perfume Bottle */}
        <group position={[0.5, 0.52, -0.5]}>
          <mesh castShadow>
            <boxGeometry args={[0.16, 0.22, 0.12]} />
            <meshPhysicalMaterial
              color="#059669"
              transparent
              opacity={0.7}
              roughness={0.05}
              transmission={0.85}
              ior={1.5}
            />
          </mesh>
          {/* Golden Cap */}
          <mesh position={[0, 0.14, 0]} castShadow>
            <cylinderGeometry args={[0.04, 0.04, 0.06, 16]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.15} />
          </mesh>
        </group>

        {/* Display Item 3: Luxury Tech Device */}
        <group position={[-0.5, 0.5, -0.5]}>
          <mesh castShadow>
            <boxGeometry args={[0.26, 0.2, 0.14]} />
            <meshStandardMaterial color="#0284c7" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>

        {/* Warm Floating Minimalist Ring Chandelier */}
        <group position={[0, 0.9, -0.45]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.38, 0.02, 16, 32]} />
            <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={1.8} toneMapped={false} />
          </mesh>
          {/* Suspension Cable */}
          <mesh position={[0, 0.45, 0]}>
            <cylinderGeometry args={[0.003, 0.003, 0.9, 8]} />
            <meshStandardMaterial color="#09090b" />
          </mesh>
        </group>

        {/* Warm Window Glow Light Source */}
        <pointLight position={[0, 0.3, -0.4]} intensity={3.5} distance={5.5} color="#fed7aa" />
      </group>

      {/* ==================================================== */}
      {/* RIGHT WINDOW: RADIANT BOUTIQUE SHOWROOM DISPLAY */}
      {/* ==================================================== */}
      <group position={[2.8, 0.55, 0]}>
        {/* Outer Anodized Dark Metal Window Frame */}
        <mesh position={[0, 0, 0.05]} castShadow>
          <boxGeometry args={[2.9, 2.3, 0.12]} />
          <meshStandardMaterial color="#18181b" metalness={0.8} roughness={0.25} />
        </mesh>

        {/* Clear Transparent Architectural Glass Pane */}
        <mesh position={[0, 0, 0.06]}>
          <planeGeometry args={[2.72, 2.12]} />
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

        {/* Interior Parquet Floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.1, -0.5]}>
          <planeGeometry args={[2.7, 1.4]} />
          <meshStandardMaterial map={chevronParquetTex} roughness={0.35} metalness={0.1} />
        </mesh>

        {/* Interior Shelves (Dark Walnut Wood with Warm LED Strips) */}
        {[-0.35, 0.35].map((sy, sIdx) => (
          <group key={sIdx} position={[0, sy, -0.55]}>
            <mesh castShadow>
              <boxGeometry args={[2.4, 0.05, 0.38]} />
              <meshStandardMaterial map={walnutWoodTex} roughness={0.4} />
            </mesh>
            <mesh position={[0, -0.028, 0.08]}>
              <boxGeometry args={[2.35, 0.008, 0.02]} />
              <meshBasicMaterial color="#fef08a" />
            </mesh>
          </group>
        ))}

        {/* Display Pedestal: Carrara White Marble Plinth */}
        <group position={[0.65, -0.55, -0.45]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.55, 0.8, 0.55]} />
            <meshStandardMaterial map={marbleTex} roughness={0.25} metalness={0.1} />
          </mesh>
          {/* Display Item: Artisan Italian Leather Briefcase */}
          <group position={[0, 0.52, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.28, 0.2, 0.1]} />
              <meshStandardMaterial color="#78350f" roughness={0.5} />
            </mesh>
            {/* Brass Clasp */}
            <mesh position={[0, 0.04, 0.055]}>
              <boxGeometry args={[0.04, 0.04, 0.01]} />
              <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.2} />
            </mesh>
          </group>
        </group>

        {/* Display Item 2: Luxury Headphones on Sculptural Walnut Stand */}
        <group position={[-0.5, 0.52, -0.5]}>
          {/* Curved Walnut Arch */}
          <mesh castShadow>
            <torusGeometry args={[0.07, 0.018, 16, 24, Math.PI]} />
            <meshStandardMaterial map={walnutWoodTex} roughness={0.4} />
          </mesh>
          {/* Headband & Earcups */}
          <mesh position={[-0.08, -0.04, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.032, 0.032, 0.035, 16]} />
            <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[0.08, -0.04, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.032, 0.032, 0.035, 16]} />
            <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>

        {/* Display Item 3: Golden Decorative Sphere */}
        <group position={[0.5, 0.5, -0.5]}>
          <mesh castShadow>
            <sphereGeometry args={[0.1, 24, 24]} />
            <meshStandardMaterial color="#d4af37" metalness={0.95} roughness={0.15} />
          </mesh>
        </group>

        {/* Warm Floating Minimalist Ring Chandelier */}
        <group position={[0, 0.9, -0.45]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.38, 0.02, 16, 32]} />
            <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={1.8} toneMapped={false} />
          </mesh>
          <mesh position={[0, 0.45, 0]}>
            <cylinderGeometry args={[0.003, 0.003, 0.9, 8]} />
            <meshStandardMaterial color="#09090b" />
          </mesh>
        </group>

        {/* Warm Window Glow Light Source */}
        <pointLight position={[0, 0.3, -0.4]} intensity={3.5} distance={5.5} color="#fed7aa" />
      </group>

      {/* ==================================================== */}
      {/* CENTRAL ENTRANCE DOORWAY & GLASS PIVOT DOOR */}
      {/* ==================================================== */}
      <group position={[0, 0, 0]}>
        {/* Outer Architectural Door Frame */}
        <mesh position={[0, 0.05, 0.08]} castShadow>
          <boxGeometry args={[1.75, 3.85, 0.16]} />
          <meshStandardMaterial color="#18181b" metalness={0.8} roughness={0.3} />
        </mesh>

        {/* PIVOTING ENTRANCE DOOR */}
        <group ref={doorRef} position={[-0.75, 0, 0.12]}>
          {/* Main Door Leaf offset so hinge is at x=-0.75 */}
          <group position={[0.75, 0, 0]}>
            {/* Rich Dark Walnut Stile and Rail Door Body */}
            <mesh castShadow receiveShadow>
              <boxGeometry args={[1.45, 3.65, 0.09]} />
              <meshStandardMaterial map={walnutWoodTex} roughness={0.4} />
            </mesh>

            {/* Clear Architectural Glass Upper Pane */}
            <mesh position={[0, 0.72, 0]}>
              <boxGeometry args={[1.05, 1.75, 0.1]} />
              <meshPhysicalMaterial
                color="#e0f2fe"
                transparent
                opacity={0.25}
                roughness={0.04}
                transmission={0.92}
                ior={1.5}
                reflectivity={0.9}
              />
            </mesh>

            {/* Hanging "CLOSE" / "OPEN" Boutique Placard */}
            <group position={[0, 0.92, 0.08]}>
              <mesh castShadow>
                <boxGeometry args={[0.62, 0.26, 0.02]} />
                <meshStandardMaterial color="#18181b" roughness={0.3} metalness={0.2} />
              </mesh>
              <Text
                position={[0, 0, 0.016]}
                fontSize={0.11}
                color={isUnlocked ? '#22c55e' : '#fef08a'}
                anchorX="center"
                anchorY="middle"
                fontWeight="bold"
                letterSpacing={0.12}
              >
                {isUnlocked ? 'OPEN' : 'CLOSE'}
              </Text>
              {/* String Hanging Cords */}
              <mesh position={[-0.18, 0.2, 0]} rotation={[0, 0, -0.4]}>
                <cylinderGeometry args={[0.004, 0.004, 0.22, 8]} />
                <meshBasicMaterial color="#d4af37" />
              </mesh>
              <mesh position={[0.18, 0.2, 0]} rotation={[0, 0, 0.4]}>
                <cylinderGeometry args={[0.004, 0.004, 0.22, 8]} />
                <meshBasicMaterial color="#d4af37" />
              </mesh>
            </group>

            {/* Long Vertical Architectural Champagne Brass Pull Handle */}
            <group position={[0.48, -0.15, 0.09]}>
              <mesh castShadow>
                <cylinderGeometry args={[0.018, 0.018, 0.75, 16]} />
                <meshStandardMaterial color="#d4af37" metalness={0.95} roughness={0.18} />
              </mesh>
              {/* Stand-offs */}
              <mesh position={[-0.03, 0.3, -0.02]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.014, 0.014, 0.06, 12]} />
                <meshStandardMaterial color="#18181b" metalness={0.8} roughness={0.3} />
              </mesh>
              <mesh position={[-0.03, -0.3, -0.02]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.014, 0.014, 0.06, 12]} />
                <meshStandardMaterial color="#18181b" metalness={0.8} roughness={0.3} />
              </mesh>
            </group>

            {/* INTERACTIVE GOLDEN SMART PADLOCK */}
            <SmartPadlock isUnlocked={isUnlocked} onClick={onUnlockClick} />
          </group>
        </group>
      </group>

      {/* ==================================================== */}
      {/* ARCHITECTURAL DUAL UP/DOWN WALL SCONCES */}
      {/* Replacing the harsh yellow blobs with realistic fixtures */}
      {/* ==================================================== */}
      {[-1.25, 1.25].map((sx, idx) => (
        <group key={idx} position={[sx, 1.85, 0.26]}>
          {/* Matte Black & Brass Cylindrical Fixture Body */}
          <mesh castShadow>
            <cylinderGeometry args={[0.045, 0.045, 0.24, 16]} />
            <meshStandardMaterial color="#18181b" metalness={0.85} roughness={0.25} />
          </mesh>
          {/* Center Brass Accent Ring */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.048, 0.048, 0.03, 16]} />
            <meshStandardMaterial color="#d4af37" metalness={0.95} roughness={0.15} />
          </mesh>
          {/* Top Frosted Amber Diffuser */}
          <mesh position={[0, 0.12, 0]}>
            <cylinderGeometry args={[0.043, 0.043, 0.02, 16]} />
            <meshBasicMaterial color="#fef08a" />
          </mesh>
          {/* Bottom Frosted Amber Diffuser */}
          <mesh position={[0, -0.12, 0]}>
            <cylinderGeometry args={[0.043, 0.043, 0.02, 16]} />
            <meshBasicMaterial color="#fef08a" />
          </mesh>
          {/* Soft Downward Illumination Cone */}
          <spotLight
            position={[0, -0.14, 0.05]}
            target-position={[sx, -1.0, 0.1]}
            intensity={2.2}
            distance={3.6}
            angle={0.52}
            penumbra={0.85}
            color="#fed7aa"
          />
          {/* Soft Upward Illumination Cone */}
          <spotLight
            position={[0, 0.14, 0.05]}
            target-position={[sx, 3.0, 0.1]}
            intensity={1.8}
            distance={2.8}
            angle={0.52}
            penumbra={0.85}
            color="#fed7aa"
          />
        </group>
      ))}

      {/* ==================================================== */}
      {/* REALISTIC POTTED TOPIARY SHRUBS */}
      {/* ==================================================== */}
      {[-4.2, 4.2].map((px, idx) => (
        <group key={idx} position={[px, -1.3, 0.8]}>
          {/* Modern Fluted Ceramic Planter */}
          <mesh position={[0, -0.3, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.34, 0.24, 0.8, 24]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
          </mesh>
          {/* Dark Potting Soil */}
          <mesh position={[0, 0.08, 0]}>
            <cylinderGeometry args={[0.32, 0.32, 0.04, 24]} />
            <meshStandardMaterial color="#1c110a" roughness={0.9} />
          </mesh>
          {/* Natural Spherical Boxwood Leaf Clusters */}
          <mesh position={[0, 0.42, 0]} castShadow>
            <sphereGeometry args={[0.46, 18, 18]} />
            <meshStandardMaterial color="#15803d" roughness={0.8} />
          </mesh>
          <mesh position={[0.08, 0.65, 0.06]} castShadow>
            <sphereGeometry args={[0.28, 14, 14]} />
            <meshStandardMaterial color="#16a34a" roughness={0.8} />
          </mesh>
          <mesh position={[-0.08, 0.48, -0.08]} castShadow>
            <sphereGeometry args={[0.24, 14, 14]} />
            <meshStandardMaterial color="#166534" roughness={0.8} />
          </mesh>
          {/* Ground Landscape Accent Light */}
          <pointLight position={[0, 0.25, 0.3]} intensity={1.2} distance={2.2} color="#fef08a" />
        </group>
      ))}

      {/* Interior Depth Ambient Fill */}
      <mesh position={[0, 0.5, -2.2]}>
        <planeGeometry args={[12, 6]} />
        <meshStandardMaterial color="#2d1b11" roughness={0.9} />
      </mesh>
      <pointLight position={[0, 1.2, -1.4]} intensity={4.8} distance={8} color="#fed7aa" />
    </group>
  )
}

// ========================================================
// 3. CAMERA RIG FOR CINEMATIC THREE-QUARTER FRAMING
// ========================================================
function StorefrontCameraRig({ isTransitioning }: { isTransitioning: boolean }) {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null)

  useFrame((state) => {
    if (!cameraRef.current) return

    if (isTransitioning) {
      // Smoothly push camera through the open door
      cameraRef.current.position.z = THREE.MathUtils.lerp(cameraRef.current.position.z, -1.4, 0.045)
      cameraRef.current.position.y = THREE.MathUtils.lerp(cameraRef.current.position.y, 0.3, 0.045)
      cameraRef.current.position.x = THREE.MathUtils.lerp(cameraRef.current.position.x, 0.0, 0.045)
    } else {
      // Subtle responsive mouse parallax for high-end cinematic feel
      const targetX = state.pointer.x * 0.32
      const targetY = state.pointer.y * 0.18 + 0.28
      cameraRef.current.position.x = THREE.MathUtils.lerp(cameraRef.current.position.x, targetX, 0.05)
      cameraRef.current.position.y = THREE.MathUtils.lerp(cameraRef.current.position.y, targetY, 0.05)
      cameraRef.current.lookAt(0, 0.45, 0)
    }
  })

  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault
      position={[0, 0.28, 5.2]}
      fov={44}
    />
  )
}

// ========================================================
// 4. MAIN STOREFRONT CANVAS COMPONENT
// ========================================================
export const StorefrontScene: React.FC<StorefrontSceneProps> = ({
  onUnlockClick,
  isUnlocked,
  isTransitioning
}) => {
  return (
    <div className="w-full h-full relative bg-[#090b10]">
      <Canvas
        shadows
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.08
        }}
      >
        <StorefrontCameraRig isTransitioning={isTransitioning} />

        {/* Ambient & Directional Architectural Lighting */}
        <ambientLight intensity={0.62} color="#cbd5e1" />

        {/* Sunlight / Key Directional Light */}
        <directionalLight
          position={[4, 8, 6]}
          intensity={1.3}
          color="#fef3c7"
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0001}
        />

        {/* Sky Fill Light */}
        <hemisphereLight args={['#38bdf8', '#1e293b', 0.45]} />

        {/* 3D Storefront Architecture */}
        <StorefrontArchitecture
          isUnlocked={isUnlocked}
          onUnlockClick={onUnlockClick}
        />
      </Canvas>
    </div>
  )
}

/**
 * RetailVision - Scene One: The Locked Storefront Window Scene
 * Realistic 3D storefront matching Image 1:
 * Wooden frame, warm glowing interior lights, shelves, potted plants,
 * hanging "CLOSE" sign, and an interactive metallic padlock.
 */

import React, { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { PerspectiveCamera, Text } from '@react-three/drei'
import * as THREE from 'three'

interface StorefrontSceneProps {
  onUnlockClick: () => void
  isUnlocked: boolean
  isTransitioning: boolean
}

// Interactive 3D Padlock Component
function Padlock({
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
      // Subtle float animation
      const t = state.clock.getElapsedTime()
      if (hovered && !isUnlocked) {
        lockRef.current.position.y = -0.15 + Math.sin(t * 5) * 0.02
        lockRef.current.rotation.y = Math.sin(t * 3) * 0.1
      } else {
        lockRef.current.position.y = -0.15
        lockRef.current.rotation.y = 0
      }
    }

    if (shackleRef.current && isUnlocked) {
      // Animate shackle popping open
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

      {/* Floating Prompt Tag */}
      <group position={[0, -0.32, 0.1]}>
        <Text
          fontSize={0.075}
          color={hovered ? '#60a5fa' : '#cbd5e1'}
          anchorX="center"
          anchorY="middle"
        >
          {isUnlocked ? "UNLOCKED" : (hovered ? "CLICK TO UNLOCK" : "LOCKED")}
        </Text>
      </group>
    </group>
  )
}

// Complete 3D Architectural Storefront
function StorefrontArchitecture({
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
      {/* Stone Ground Pavement */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.1, 1]} receiveShadow>
        <planeGeometry args={[14, 8]} />
        <meshStandardMaterial color="#334155" roughness={0.8} />
      </mesh>

      {/* Step in front of door */}
      <mesh position={[0, -1.95, 0.4]} receiveShadow castShadow>
        <boxGeometry args={[4.2, 0.2, 1.0]} />
        <meshStandardMaterial color="#475569" roughness={0.7} />
      </mesh>

      {/* Outer Wall Facade (Warm Stucco) */}
      <mesh position={[0, 0.8, -0.1]} receiveShadow>
        <boxGeometry args={[10, 5.8, 0.2]} />
        <meshStandardMaterial color="#e2d9cc" roughness={0.9} />
      </mesh>

      {/* Lower Wooden Wall Paneling (matching Image 1) */}
      <mesh position={[0, -1.0, 0.05]} castShadow receiveShadow>
        <boxGeometry args={[8.4, 1.8, 0.15]} />
        <meshStandardMaterial color="#78350f" roughness={0.5} />
      </mesh>

      {/* Vertical Wood Slats on Lower Paneling */}
      {[-3.6, -2.8, -2.0, 2.0, 2.8, 3.6].map((x, i) => (
        <mesh key={i} position={[x, -1.0, 0.14]}>
          <boxGeometry args={[0.04, 1.76, 0.04]} />
          <meshStandardMaterial color="#451a03" roughness={0.4} />
        </mesh>
      ))}

      {/* Upper Storefront Header & Fascia */}
      <mesh position={[0, 2.65, 0.2]} castShadow receiveShadow>
        <boxGeometry args={[8.8, 0.9, 0.4]} />
        <meshStandardMaterial color="#292524" roughness={0.4} />
      </mesh>

      {/* 3D Signboard Title: RETAILVISION */}
      <group position={[0, 2.65, 0.42]}>
        <Text
          fontSize={0.34}
          color="#38bdf8"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.08}
        >
          RETAILVISION
        </Text>
        <Text
          position={[0, -0.22, 0]}
          fontSize={0.11}
          color="#94a3b8"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.2}
        >
          3D RETAIL MARKETPLACE & ANALYTICS
        </Text>
      </group>

      {/* LEFT WINDOW */}
      <group position={[-2.7, 0.5, 0]}>
        {/* Wooden Window Frame */}
        <mesh position={[0, 0, 0.05]} castShadow>
          <boxGeometry args={[2.8, 2.2, 0.12]} />
          <meshStandardMaterial color="#451a03" roughness={0.4} />
        </mesh>
        {/* Glass Pane */}
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
        {/* Interior Shelves visible through glass */}
        <mesh position={[0, -0.3, -0.6]}>
          <boxGeometry args={[2.2, 0.06, 0.4]} />
          <meshStandardMaterial color="#78350f" />
        </mesh>
        <mesh position={[0, 0.3, -0.6]}>
          <boxGeometry args={[2.2, 0.06, 0.4]} />
          <meshStandardMaterial color="#78350f" />
        </mesh>
        {/* Display Items on Shelves */}
        <mesh position={[-0.6, 0.48, -0.5]}>
          <cylinderGeometry args={[0.1, 0.12, 0.3, 16]} />
          <meshStandardMaterial color="#38bdf8" />
        </mesh>
        <mesh position={[0.4, 0.45, -0.5]}>
          <boxGeometry args={[0.3, 0.25, 0.2]} />
          <meshStandardMaterial color="#f472b6" />
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

      {/* RIGHT WINDOW */}
      <group position={[2.7, 0.5, 0]}>
        <mesh position={[0, 0, 0.05]} castShadow>
          <boxGeometry args={[2.8, 2.2, 0.12]} />
          <meshStandardMaterial color="#451a03" roughness={0.4} />
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
        <mesh position={[0, -0.3, -0.6]}>
          <boxGeometry args={[2.2, 0.06, 0.4]} />
          <meshStandardMaterial color="#78350f" />
        </mesh>
        <mesh position={[0, 0.3, -0.6]}>
          <boxGeometry args={[2.2, 0.06, 0.4]} />
          <meshStandardMaterial color="#78350f" />
        </mesh>
        <mesh position={[-0.4, -0.15, -0.5]}>
          <boxGeometry args={[0.35, 0.22, 0.25]} />
          <meshStandardMaterial color="#34d399" />
        </mesh>
        <mesh position={[0.5, 0.48, -0.5]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color="#fbbf24" />
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

      {/* CENTRAL DOORWAY & DOOR ASSEMBLY */}
      <group position={[0, 0, 0]}>
        {/* Outer Wooden Door Frame */}
        <mesh position={[0, 0.05, 0.08]} castShadow>
          <boxGeometry args={[1.7, 3.8, 0.16]} />
          <meshStandardMaterial color="#292524" roughness={0.5} />
        </mesh>

        {/* SWINGING DOOR */}
        <group ref={doorRef} position={[-0.7, 0, 0.12]}>
          {/* Main Door Leaf offset so hinge is at -0.7 */}
          <group position={[0.7, 0, 0]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[1.4, 3.6, 0.1]} />
              <meshStandardMaterial color="#592b02" roughness={0.4} />
            </mesh>

            {/* Glass Upper Pane on Door */}
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

            {/* Hanging "CLOSE" / "OPEN" Sign (matching Image 1) */}
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

            {/* INTERACTIVE PADLOCK */}
            <Padlock isUnlocked={isUnlocked} onClick={onUnlockClick} />
          </group>
        </group>
      </group>

      {/* POTTED PLANTS FLANKING ENTRANCE (matching Image 1) */}
      {/* Left Plant */}
      <group position={[-3.8, -1.3, 0.7]}>
        {/* Ceramic Pot */}
        <mesh position={[0, -0.3, 0]} castShadow>
          <cylinderGeometry args={[0.35, 0.25, 0.8, 24]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.6} />
        </mesh>
        {/* Bush Foliage */}
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

      {/* Wall Sconce Lights (Warm Amber Exterior Glow) */}
      <group position={[-1.2, 1.8, 0.25]}>
        <mesh>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={1.0} />
        </mesh>
        <pointLight intensity={1.8} distance={3.5} color="#fed7aa" />
      </group>
      <group position={[1.2, 1.8, 0.25]}>
        <mesh>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={1.0} />
        </mesh>
        <pointLight intensity={1.8} distance={3.5} color="#fed7aa" />
      </group>

      {/* Interior Depth Background */}
      <mesh position={[0, 0.5, -1.8]}>
        <planeGeometry args={[9, 5]} />
        <meshStandardMaterial color="#451a03" roughness={0.9} />
      </mesh>
      <pointLight position={[0, 1.0, -1.2]} intensity={4.5} distance={8} color="#fed7aa" />
    </group>
  )
}

// Camera Flight Controller for Cinematic Entry
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
      const targetX = state.pointer.x * 0.35
      const targetY = state.pointer.y * 0.2 + 0.1
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

export const StorefrontScene: React.FC<StorefrontSceneProps> = ({
  onUnlockClick,
  isUnlocked,
  isTransitioning
}) => {
  return (
    <div className="w-full h-full relative bg-slate-950">
      <Canvas shadows>
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

        <StorefrontArchitecture
          isUnlocked={isUnlocked}
          onUnlockClick={onUnlockClick}
        />
      </Canvas>
    </div>
  )
}

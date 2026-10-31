/**
 * RetailVision - Interactive 3D Store Building Component
 * Renders category-specific 3D architectural models inspired by Images 3 & 4.
 * Features hover scale, lighting reaction, 3D signage, and click-to-open analytics.
 */

import React, { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import type { Store } from '../../types'

interface StoreBuildingProps {
  store: Store
  isSelected: boolean
  onClick: (store: Store) => void
  onHover: (store: Store | null) => void
}

export const StoreBuilding: React.FC<StoreBuildingProps> = ({
  store,
  isSelected,
  onClick,
  onHover
}) => {
  const [hovered, setHovered] = useState(false)
  const groupRef = useRef<THREE.Group>(null)

  // Determine styling based on category
  const category = store.category
  const primaryColor = store.color || '#3B82F6'

  useFrame(() => {
    if (!groupRef.current) return
    // Smooth hover elevation and scale
    const targetScale = hovered || isSelected ? 1.06 : 1.0
    const targetY = hovered ? 0.2 : 0.0

    groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.12)
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.12)
  })

  // Visual variants depending on store category
  return (
    <group
      ref={groupRef}
      position={[store.grid_x, 0, store.grid_z]}
      rotation={[0, store.rotation_y || 0, 0]}
      onClick={(e) => {
        e.stopPropagation()
        onClick(store)
      }}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
        onHover(store)
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        setHovered(false)
        onHover(null)
        document.body.style.cursor = 'default'
      }}
    >
      {/* Grass/Pavement Foundation Plot */}
      <mesh position={[0, 0.08, 0]} receiveShadow>
        <boxGeometry args={[4.2, 0.16, 3.8]} />
        <meshStandardMaterial
          color={hovered || isSelected ? '#38bdf8' : '#e2e8f0'}
          roughness={0.7}
        />
      </mesh>

      {/* Main Building Body */}
      <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.4, 2.1, 2.8]} />
        <meshStandardMaterial
          color={
            category === 'Grocery' ? '#e9d5ff' :
            category === 'Clothing' ? '#fce7f3' :
            category === 'Furniture' ? '#fef3c7' :
            category === 'Accessories' ? '#ede9fe' : '#e0f2fe'
          }
          roughness={0.4}
        />
      </mesh>

      {/* Modern Roof / Upper Trim */}
      <mesh position={[0, 2.32, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.6, 0.24, 3.0]} />
        <meshStandardMaterial color={primaryColor} roughness={0.3} />
      </mesh>
      <mesh position={[0, 2.5, 0]} castShadow>
        <boxGeometry args={[3.2, 0.16, 2.6]} />
        <meshStandardMaterial color="#334155" roughness={0.5} />
      </mesh>

      {/* Roof Details: AC Vents / Antennas (matching Image 3 & 4) */}
      <group position={[0.8, 2.65, -0.5]}>
        <mesh castShadow>
          <boxGeometry args={[0.6, 0.35, 0.5]} />
          <meshStandardMaterial color="#64748b" metalness={0.6} />
        </mesh>
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.4, 8]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.8} />
        </mesh>
      </group>

      {/* Front Entrance Double Doors (Glass & Frame) */}
      <mesh position={[0, 0.8, 1.41]} castShadow>
        <boxGeometry args={[1.1, 1.4, 0.04]} />
        <meshPhysicalMaterial
          color="#38bdf8"
          transparent
          opacity={0.4}
          roughness={0.1}
          metalness={0.2}
        />
      </mesh>
      {/* Door Frame */}
      <mesh position={[0, 0.8, 1.42]}>
        <boxGeometry args={[1.15, 1.45, 0.02]} />
        <meshStandardMaterial color="#d97706" roughness={0.3} wireframe />
      </mesh>

      {/* Front Display Windows */}
      <mesh position={[-1.15, 0.95, 1.41]}>
        <boxGeometry args={[0.85, 1.1, 0.03]} />
        <meshPhysicalMaterial color="#bae6fd" transparent opacity={0.35} roughness={0.1} />
      </mesh>
      <mesh position={[1.15, 0.95, 1.41]}>
        <boxGeometry args={[0.85, 1.1, 0.03]} />
        <meshPhysicalMaterial color="#bae6fd" transparent opacity={0.35} roughness={0.1} />
      </mesh>

      {/* Striped Canopy / Awning (matching Images 3 & 4) */}
      <group position={[0, 1.65, 1.65]} rotation={[0.35, 0, 0]}>
        <mesh castShadow>
          <boxGeometry args={[3.5, 0.08, 0.65]} />
          <meshStandardMaterial color={primaryColor} roughness={0.3} />
        </mesh>
        {/* Striped edge frills */}
        <mesh position={[0, -0.06, 0.32]} rotation={[0.4, 0, 0]}>
          <boxGeometry args={[3.5, 0.12, 0.04]} />
          <meshStandardMaterial color="#ffffff" roughness={0.2} />
        </mesh>
      </group>

      {/* 3D SIGNBOARD (with Store Name & Category) */}
      <group position={[0, 2.9, 0.6]}>
        <mesh castShadow>
          <boxGeometry args={[2.8, 0.55, 0.16]} />
          <meshStandardMaterial
            color={hovered || isSelected ? '#1e293b' : primaryColor}
            roughness={0.2}
            emissive={primaryColor}
            emissiveIntensity={hovered || isSelected ? 0.35 : 0.15}
          />
        </mesh>
        <Text
          position={[0, 0.04, 0.09]}
          fontSize={0.22}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
          maxWidth={2.6}
        >
          {store.name.toUpperCase()}
        </Text>
        <Text
          position={[0, -0.16, 0.09]}
          fontSize={0.09}
          color="#fef08a"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.12}
        >
          {store.category.toUpperCase()}
        </Text>
      </group>

      {/* Exterior Props: Potted Bushes & Curb Elements */}
      <group position={[-1.7, 0.3, 1.6]}>
        <mesh position={[0, -0.1, 0]} castShadow>
          <cylinderGeometry args={[0.16, 0.12, 0.3, 16]} />
          <meshStandardMaterial color="#b45309" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.15, 0]} castShadow>
          <sphereGeometry args={[0.22, 16, 16]} />
          <meshStandardMaterial color="#22c55e" roughness={0.8} />
        </mesh>
      </group>

      <group position={[1.7, 0.3, 1.6]}>
        <mesh position={[0, -0.1, 0]} castShadow>
          <cylinderGeometry args={[0.16, 0.12, 0.3, 16]} />
          <meshStandardMaterial color="#b45309" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.15, 0]} castShadow>
          <sphereGeometry args={[0.22, 16, 16]} />
          <meshStandardMaterial color="#22c55e" roughness={0.8} />
        </mesh>
      </group>

      {/* Spotlight on Hover or Selection */}
      {(hovered || isSelected) && (
        <pointLight
          position={[0, 3.8, 1.5]}
          intensity={3.5}
          distance={6}
          color={primaryColor}
        />
      )}
    </group>
  )
}

/**
 * RetailVision - AAA Architectural 3D Store Buildings
 * High-detail PBR architectural models matching reference designs:
 *  - Electronics (Ref: Image 4): Blue & white striped awning, 3D rooftop lightbox sign,
 *    dark glass storefront with gold handles, potted topiary balls.
 *  - Grocery (Ref: Image 3): 3D "GROCERY" typography, pink/white striped awning,
 *    produce crates, sidewalk bench, potted plant, rooftop AC vents.
 *  - Clothing: High-end fashion boutique, rose-gold cornice, display mannequins.
 *  - Furniture: Scandinavian timber showroom, sofa & brass lamp, hardwood deck.
 *  - Accessories: Neoclassical luxury salon, marble colonnade, cupola dome & fountain.
 *  - Custom: Modular commercial pavilion with category styling.
 *  - Construction Staging: Animated construction scaffold, laser grid, spark particles.
 * Supports Dynamic Day & Night lighting transitions!
 */

import React, { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import type { Store, TimeOfDay } from '../../types'
import { createMarbleTexture, createWoodDeckTexture } from './textures'

interface StoreBuildingProps {
  store: Store
  isSelected: boolean
  onClick: (store: Store) => void
  onHover: (store: Store | null) => void
  timeOfDay?: TimeOfDay
  isConstructing?: boolean
}

// -------------------------------------------------------------
// 1. ELECTRONICS: MODERN TECH STORE (Matching Image 4)
// -------------------------------------------------------------
function ElectronicsStore({ hovered, isSelected, isNight }: { hovered: boolean; isSelected: boolean; isNight: boolean }) {
  return (
    <group position={[0, 0, 0]}>
      {/* Concrete Platform Base with Pedestrian Walkway */}
      <mesh position={[0, 0.08, 0]} receiveShadow>
        <boxGeometry args={[4.4, 0.16, 4.0]} />
        <meshStandardMaterial color={hovered || isSelected ? '#38bdf8' : '#e2e8f0'} roughness={0.4} />
      </mesh>

      {/* Main Structural Building: Slate Grey Facade */}
      <mesh position={[0, 1.35, -0.2]} castShadow receiveShadow>
        <boxGeometry args={[3.8, 2.4, 3.2]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.4} />
      </mesh>

      {/* Dark Reflective Panoramic Glass Windows with Gold/Wood Trim */}
      <mesh position={[-1.0, 1.25, 1.42]}>
        <boxGeometry args={[1.4, 1.6, 0.04]} />
        <meshPhysicalMaterial
          color={isNight ? '#38bdf8' : '#1e293b'}
          transparent
          opacity={0.85}
          roughness={0.08}
          metalness={0.2}
        />
      </mesh>
      <mesh position={[1.0, 1.25, 1.42]}>
        <boxGeometry args={[1.4, 1.6, 0.04]} />
        <meshPhysicalMaterial
          color={isNight ? '#38bdf8' : '#1e293b'}
          transparent
          opacity={0.85}
          roughness={0.08}
          metalness={0.2}
        />
      </mesh>

      {/* Double Glass Doors with Gold Vertical Handles */}
      <group position={[0, 0.95, 1.43]}>
        <mesh>
          <boxGeometry args={[1.0, 1.7, 0.04]} />
          <meshPhysicalMaterial color={isNight ? '#60a5fa' : '#334155'} transparent opacity={0.8} />
        </mesh>
        {/* Door Frame Trim */}
        <mesh position={[0, 0, 0.02]}>
          <boxGeometry args={[1.08, 1.78, 0.02]} />
          <meshStandardMaterial color="#d97706" roughness={0.3} metalness={0.6} wireframe />
        </mesh>
        {/* Brass Handles */}
        <mesh position={[-0.08, 0, 0.04]}>
          <cylinderGeometry args={[0.015, 0.015, 0.5, 8]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0.08, 0, 0.04]}>
          <cylinderGeometry args={[0.015, 0.015, 0.5, 8]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>

      {/* Blue & White Striped Canopy Awning (Image 4 Style) */}
      <group position={[0, 2.05, 1.62]} rotation={[0.26, 0, 0]}>
        <mesh castShadow>
          <boxGeometry args={[4.0, 0.08, 0.85]} />
          <meshStandardMaterial color="#1d4ed8" />
        </mesh>
        {[-1.6, -1.0, -0.4, 0.2, 0.8, 1.4].map((sx, idx) => (
          <mesh key={`e-stripe-${idx}`} position={[sx, 0.05, 0]}>
            <boxGeometry args={[0.3, 0.02, 0.87]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        ))}
      </group>

      {/* Rooftop Dark Asphalt Stepped Tiers with HVAC Vents */}
      <mesh position={[0, 2.65, -0.2]} castShadow>
        <boxGeometry args={[4.0, 0.2, 3.4]} />
        <meshStandardMaterial color="#334155" roughness={0.6} />
      </mesh>
      <mesh position={[0, 2.9, -0.3]} castShadow>
        <boxGeometry args={[3.2, 0.3, 2.4]} />
        <meshStandardMaterial color="#1e293b" roughness={0.7} />
      </mesh>

      {/* Prominent 3D Lightbox Sign on Roof: "ELECTRONIC STORE" (Image 4 Style) */}
      <group position={[0, 3.35, 0.4]}>
        <mesh castShadow>
          <boxGeometry args={[2.8, 0.65, 0.2]} />
          <meshStandardMaterial
            color="#1e40af"
            emissive="#1d4ed8"
            emissiveIntensity={isNight ? 1.4 : 0.6}
            roughness={0.2}
          />
        </mesh>
        <mesh position={[0, 0, 0.11]}>
          <boxGeometry args={[2.7, 0.55, 0.02]} />
          <meshStandardMaterial color="#1e3a8a" />
        </mesh>
        <Text
          position={[0, 0.06, 0.13]}
          fontSize={0.2}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          fontWeight="black"
        >
          ELECTRONIC
        </Text>
        <Text
          position={[0, -0.12, 0.13]}
          fontSize={0.16}
          color="#67e8f9"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          STORE
        </Text>
        {/* Support Stilts */}
        <mesh position={[-1.1, -0.42, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.35, 8]} />
          <meshStandardMaterial color="#64748b" />
        </mesh>
        <mesh position={[1.1, -0.42, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.35, 8]} />
          <meshStandardMaterial color="#64748b" />
        </mesh>
      </group>

      {/* Potted Round Topiary Trees Flanking the Entrance (Image 4 Style) */}
      {[-1.6, 1.6].map((tx, idx) => (
        <group key={`topiary-${idx}`} position={[tx, 0.16, 1.6]}>
          {/* Terracotta Pot */}
          <mesh castShadow>
            <cylinderGeometry args={[0.18, 0.14, 0.3, 12]} />
            <meshStandardMaterial color="#b45309" roughness={0.8} />
          </mesh>
          {/* Trunk */}
          <mesh position={[0, 0.22, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.2, 8]} />
            <meshStandardMaterial color="#78350f" />
          </mesh>
          {/* Spherical Topiary Bush */}
          <mesh position={[0, 0.45, 0]} castShadow>
            <sphereGeometry args={[0.26, 16, 16]} />
            <meshStandardMaterial color="#22c55e" roughness={0.5} />
          </mesh>
        </group>
      ))}

      {/* Night Interior Light Spilling Through Windows */}
      {isNight && (
        <pointLight position={[0, 1.6, 0.8]} intensity={3.2} distance={6} color="#38bdf8" />
      )}
    </group>
  )
}

// -------------------------------------------------------------
// 2. GROCERY: FRESH HARVEST MARKET (Matching Image 3)
// -------------------------------------------------------------
function GroceryStore({ hovered, isSelected, isNight }: { hovered: boolean; isSelected: boolean; isNight: boolean }) {
  return (
    <group position={[0, 0, 0]}>
      {/* Base Platform */}
      <mesh position={[0, 0.08, 0]} receiveShadow>
        <boxGeometry args={[4.4, 0.16, 4.0]} />
        <meshStandardMaterial color={hovered || isSelected ? '#10b981' : '#f1f5f9'} roughness={0.5} />
      </mesh>

      {/* Soft Lilac / Pastel Stucco Market Walls (Image 3 Style) */}
      <mesh position={[0, 1.35, -0.2]} castShadow receiveShadow>
        <boxGeometry args={[3.8, 2.4, 3.2]} />
        <meshStandardMaterial color="#e9d5ff" roughness={0.5} />
      </mesh>

      {/* Large Glass Corner Windows with Peach Frames */}
      <mesh position={[-0.9, 1.25, 1.42]}>
        <boxGeometry args={[1.6, 1.6, 0.04]} />
        <meshPhysicalMaterial
          color={isNight ? '#fef08a' : '#bae6fd'}
          transparent
          opacity={isNight ? 0.85 : 0.4}
          roughness={0.05}
        />
      </mesh>

      {/* Double Glass Doors with Handles */}
      <group position={[0.9, 1.0, 1.43]}>
        <mesh>
          <boxGeometry args={[1.2, 1.7, 0.04]} />
          <meshPhysicalMaterial color={isNight ? '#fde047' : '#38bdf8'} transparent opacity={0.65} />
        </mesh>
        <mesh position={[-0.1, 0, 0.04]}>
          <cylinderGeometry args={[0.015, 0.015, 0.45, 8]} />
          <meshStandardMaterial color="#f43f5e" metalness={0.7} />
        </mesh>
        <mesh position={[0.1, 0, 0.04]}>
          <cylinderGeometry args={[0.015, 0.015, 0.45, 8]} />
          <meshStandardMaterial color="#f43f5e" metalness={0.7} />
        </mesh>
      </group>

      {/* Striped Pink & White Awning Canopy (Image 3 Style) */}
      <group position={[-0.9, 2.05, 1.65]} rotation={[0.26, 0, 0]}>
        <mesh castShadow>
          <boxGeometry args={[2.0, 0.08, 0.82]} />
          <meshStandardMaterial color="#f43f5e" />
        </mesh>
        {[-0.7, -0.2, 0.3, 0.8].map((sx, idx) => (
          <mesh key={`g-stripe-${idx}`} position={[sx, 0.05, 0]}>
            <boxGeometry args={[0.24, 0.02, 0.84]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        ))}
      </group>

      {/* Rounded Purple Roof Parapet (Image 3 Style) */}
      <mesh position={[0, 2.65, -0.2]} castShadow>
        <boxGeometry args={[4.1, 0.28, 3.4]} />
        <meshStandardMaterial color="#c084fc" roughness={0.3} />
      </mesh>

      {/* 3D Cyan Letters "GROCERY" along Roof Parapet (Image 3 Style) */}
      <group position={[0.8, 2.7, 1.52]}>
        <Text
          fontSize={0.28}
          color="#38bdf8"
          anchorX="center"
          anchorY="middle"
          fontWeight="black"
          letterSpacing={0.06}
        >
          GROCERY
        </Text>
      </group>

      {/* Rooftop Air Conditioner Units & Exhaust Vents (Image 3 Style) */}
      <group position={[-0.8, 2.95, -0.4]}>
        {/* Main AC Blue Box */}
        <mesh castShadow>
          <boxGeometry args={[0.9, 0.6, 0.7]} />
          <meshStandardMaterial color="#3b82f6" roughness={0.4} />
        </mesh>
        {/* Twin Exhaust Fans */}
        <mesh position={[0.65, 0.05, 0]} castShadow>
          <boxGeometry args={[0.4, 0.45, 0.5]} />
          <meshStandardMaterial color="#f43f5e" roughness={0.5} />
        </mesh>
      </group>

      {/* Wooden Sidewalk Bench (Image 3 Style) */}
      <group position={[-1.3, 0.25, 1.65]}>
        <mesh position={[0, 0.15, 0]} castShadow>
          <boxGeometry args={[0.9, 0.06, 0.32]} />
          <meshStandardMaterial color="#d97706" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.3, -0.14]} castShadow>
          <boxGeometry args={[0.9, 0.24, 0.05]} />
          <meshStandardMaterial color="#d97706" roughness={0.6} />
        </mesh>
        {[-0.38, 0.38].map((bx, i) => (
          <mesh key={`bench-leg-${i}`} position={[bx, 0.08, 0]}>
            <boxGeometry args={[0.06, 0.2, 0.28]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
        ))}
      </group>

      {/* Potted Plant and Trash Bin in Front (Image 3 Style) */}
      <group position={[-0.6, 0.16, 1.65]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.14, 0.1, 0.24, 12]} />
          <meshStandardMaterial color="#b45309" />
        </mesh>
        <mesh position={[0, 0.2, 0]} castShadow>
          <sphereGeometry args={[0.18, 12, 12]} />
          <meshStandardMaterial color="#10b981" />
        </mesh>
      </group>

      {/* Night Warm Illumination */}
      {isNight && (
        <pointLight position={[0, 1.6, 0.8]} intensity={3.0} distance={6} color="#fef08a" />
      )}
    </group>
  )
}

// -------------------------------------------------------------
// 3. CLOTHING: CHIC FASHION BOUTIQUE & MANNEQUINS
// -------------------------------------------------------------
function ClothingStore({ hovered, isSelected, isNight }: { hovered: boolean; isSelected: boolean; isNight: boolean }) {
  return (
    <group position={[0, 0, 0]}>
      {/* Polished Marble Step Foundation */}
      <mesh position={[0, 0.08, 0]} receiveShadow>
        <boxGeometry args={[4.4, 0.16, 4.0]} />
        <meshStandardMaterial color={hovered || isSelected ? '#ec4899' : '#fdf2f8'} roughness={0.3} />
      </mesh>

      {/* Elegant Rose-Gold & Slate Boutique Structure */}
      <mesh position={[0, 1.4, -0.2]} castShadow receiveShadow>
        <boxGeometry args={[3.8, 2.5, 3.2]} />
        <meshStandardMaterial color="#1e1b4b" roughness={0.3} />
      </mesh>

      {/* Large Boutique Showcase Display Windows with Rose Trim */}
      <mesh position={[-0.95, 1.25, 1.42]}>
        <boxGeometry args={[1.5, 1.9, 0.04]} />
        <meshPhysicalMaterial
          color={isNight ? '#fbcfe8' : '#bae6fd'}
          transparent
          opacity={isNight ? 0.85 : 0.4}
          roughness={0.05}
        />
      </mesh>
      <mesh position={[0.95, 1.25, 1.42]}>
        <boxGeometry args={[1.5, 1.9, 0.04]} />
        <meshPhysicalMaterial
          color={isNight ? '#fbcfe8' : '#bae6fd'}
          transparent
          opacity={isNight ? 0.85 : 0.4}
          roughness={0.05}
        />
      </mesh>

      {/* Boutique Entrance in Center */}
      <mesh position={[0, 0.9, 1.43]}>
        <boxGeometry args={[0.8, 1.6, 0.04]} />
        <meshPhysicalMaterial color="#38bdf8" transparent opacity={0.6} />
      </mesh>

      {/* Stylized Fashion Mannequins Behind Windows */}
      {[-0.95, 0.95].map((mx, idx) => (
        <group key={`mannequin-${idx}`} position={[mx, 0.7, 1.0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.08, 0.12, 0.6, 12]} />
            <meshStandardMaterial color="#ffffff" roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.42, 0]} castShadow>
            <sphereGeometry args={[0.09, 12, 12]} />
            <meshStandardMaterial color="#fcd34d" metalness={0.8} />
          </mesh>
          <mesh position={[0, -0.1, 0]}>
            <coneGeometry args={[0.22, 0.45, 12]} />
            <meshStandardMaterial color={idx === 0 ? '#ec4899' : '#8b5cf6'} roughness={0.5} />
          </mesh>
        </group>
      ))}

      {/* Rose Gold Facade Cornice Trim */}
      <mesh position={[0, 2.68, -0.2]} castShadow>
        <boxGeometry args={[4.0, 0.2, 3.4]} />
        <meshStandardMaterial color="#f472b6" emissive="#db2777" emissiveIntensity={isNight ? 1.0 : 0.3} />
      </mesh>

      {/* Night Warm Boutique Illumination */}
      {isNight && (
        <pointLight position={[0, 1.6, 0.9]} intensity={2.6} distance={6} color="#f472b6" />
      )}
    </group>
  )
}

// -------------------------------------------------------------
// 4. FURNITURE: SCANDINAVIAN SHOWROOM & ICONIC TIMBER ROOF
// -------------------------------------------------------------
function FurnitureStore({ hovered, isSelected, isNight }: { hovered: boolean; isSelected: boolean; isNight: boolean }) {
  const woodDeck = useMemo(() => createWoodDeckTexture(), [])

  return (
    <group position={[0, 0, 0]}>
      {/* Hardwood Timber Platform Deck */}
      <mesh position={[0, 0.08, 0]} receiveShadow>
        <boxGeometry args={[4.4, 0.16, 4.0]} />
        <meshStandardMaterial map={woodDeck} roughness={0.6} />
      </mesh>

      {/* Minimalist Solid Oak & White Showroom Walls */}
      <mesh position={[0, 1.35, -0.2]} castShadow receiveShadow>
        <boxGeometry args={[3.8, 2.4, 3.2]} />
        <meshStandardMaterial color="#fffbeb" roughness={0.4} />
      </mesh>

      {/* Large Floor-to-Ceiling Showroom Glass Window */}
      <mesh position={[-0.4, 1.25, 1.42]}>
        <boxGeometry args={[2.6, 2.0, 0.04]} />
        <meshPhysicalMaterial
          color={isNight ? '#fef3c7' : '#bae6fd'}
          transparent
          opacity={isNight ? 0.85 : 0.4}
          roughness={0.05}
        />
      </mesh>

      {/* Interior Designer Furniture on Display (Armchair & Lamp) */}
      <group position={[-0.6, 0.45, 0.8]}>
        <mesh position={[0, 0.18, 0]} castShadow>
          <boxGeometry args={[0.65, 0.25, 0.6]} />
          <meshStandardMaterial color="#d97706" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.45, -0.25]} castShadow>
          <boxGeometry args={[0.65, 0.4, 0.12]} />
          <meshStandardMaterial color="#d97706" roughness={0.6} />
        </mesh>
        <mesh position={[0.5, 0.55, -0.1]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, 1.1, 8]} />
          <meshStandardMaterial color="#eab308" metalness={0.9} />
        </mesh>
        <mesh position={[0.5, 1.1, -0.1]}>
          <coneGeometry args={[0.18, 0.22, 12]} />
          <meshStandardMaterial color="#ffffff" emissive="#fef08a" emissiveIntensity={isNight ? 1.5 : 0.3} />
        </mesh>
      </group>

      {/* Modern Slat Timber Pergola Canopy */}
      {[-0.8, -0.2, 0.4, 1.0].map((px, idx) => (
        <mesh key={`pergola-${idx}`} position={[px, 2.5, 1.6]} castShadow>
          <boxGeometry args={[0.1, 0.1, 1.2]} />
          <meshStandardMaterial color="#78350f" roughness={0.6} />
        </mesh>
      ))}

      {/* Amber Illuminated Facade Trim */}
      <mesh position={[0, 2.65, -0.2]} castShadow>
        <boxGeometry args={[3.9, 0.18, 3.3]} />
        <meshStandardMaterial
          color={hovered || isSelected ? '#fbbf24' : '#f59e0b'}
          emissive="#f59e0b"
          emissiveIntensity={isNight ? 0.9 : (hovered ? 0.5 : 0.25)}
        />
      </mesh>

      {isNight && (
        <pointLight position={[-0.2, 1.5, 0.8]} intensity={2.6} distance={6} color="#fed7aa" />
      )}
    </group>
  )
}

// -------------------------------------------------------------
// 5. ACCESSORIES: NEOCLASSICAL LUXURY SALON & PLAZA FOUNTAIN
// -------------------------------------------------------------
function AccessoriesStore({ hovered, isSelected, isNight }: { hovered: boolean; isSelected: boolean; isNight: boolean }) {
  const marbleTex = useMemo(() => createMarbleTexture(), [])
  const fountainWaterRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (fountainWaterRef.current) {
      fountainWaterRef.current.rotation.y = state.clock.getElapsedTime() * 0.9
    }
  })

  return (
    <group position={[0, 0, 0]}>
      {/* Polished Marble Plaza Platform */}
      <mesh position={[0, 0.08, 0]} receiveShadow>
        <boxGeometry args={[4.4, 0.16, 4.0]} />
        <meshStandardMaterial map={marbleTex} roughness={0.3} />
      </mesh>

      {/* Neoclassical Royal Blue Salon Body */}
      <mesh position={[0, 1.4, -0.4]} castShadow receiveShadow>
        <boxGeometry args={[3.8, 2.5, 2.6]} />
        <meshStandardMaterial color={hovered || isSelected ? '#2563eb' : '#1e3a8a'} roughness={0.3} />
      </mesh>

      {/* Classical White Colonnade Pillars */}
      {[-1.4, -0.7, 0.7, 1.4].map((px, i) => (
        <mesh key={`col-${i}`} position={[px, 1.25, 0.85]} castShadow>
          <cylinderGeometry args={[0.08, 0.1, 2.3, 16]} />
          <meshStandardMaterial color="#ffffff" roughness={0.3} />
        </mesh>
      ))}

      {/* Pediment & Classical Balustrade Roof */}
      <mesh position={[0, 2.5, 0.85]} castShadow>
        <boxGeometry args={[3.6, 0.28, 0.4]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, 2.7, -0.4]} castShadow>
        <boxGeometry args={[3.9, 0.15, 2.7]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Silver Cupola Dome with Golden Needle Finial */}
      <group position={[0, 2.8, -0.4]}>
        <mesh position={[0, 0.4, 0]} castShadow>
          <cylinderGeometry args={[0.85, 0.95, 0.8, 8]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0, 1.15, 0]} castShadow>
          <sphereGeometry args={[0.9, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0, 2.1, 0]}>
          <cylinderGeometry args={[0.02, 0.05, 0.6, 8]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.9} />
        </mesh>
      </group>

      {/* Tiered Circular Water Fountain in Front Plaza */}
      <group position={[0, 0.16, 1.45]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.85, 0.95, 0.24, 24]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.78, 0.78, 0.05, 24]} />
          <meshPhysicalMaterial color="#06b6d4" transparent opacity={0.8} roughness={0.1} />
        </mesh>
        <mesh ref={fountainWaterRef} position={[0, 0.55, 0]}>
          <coneGeometry args={[0.22, 0.5, 12]} />
          <meshStandardMaterial
            color="#38bdf8"
            emissive="#38bdf8"
            emissiveIntensity={isNight ? 1.2 : 0.6}
            transparent
            opacity={0.85}
          />
        </mesh>
      </group>

      {isNight && (
        <pointLight position={[0, 1.8, 0.8]} intensity={2.8} distance={6} color="#818cf8" />
      )}
    </group>
  )
}

// -------------------------------------------------------------
// 6. CUSTOM / PROCEDURAL STORE: HIGH-TECH COMMERCIAL PAVILION
// -------------------------------------------------------------
function CustomStorePavilion({
  color,
  hovered,
  isSelected,
  isNight
}: {
  color: string
  hovered: boolean
  isSelected: boolean
  isNight: boolean
}) {
  return (
    <group position={[0, 0, 0]}>
      <mesh position={[0, 0.08, 0]} receiveShadow>
        <boxGeometry args={[4.4, 0.16, 4.0]} />
        <meshStandardMaterial color={hovered || isSelected ? color : '#334155'} roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.8, 2.4, 3.2]} />
        <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.5} />
      </mesh>
      <mesh position={[0, 1.35, 1.62]}>
        <boxGeometry args={[3.4, 1.8, 0.04]} />
        <meshPhysicalMaterial color="#38bdf8" transparent opacity={0.6} roughness={0.05} />
      </mesh>
      <mesh position={[0, 2.65, 0]} castShadow>
        <boxGeometry args={[4.0, 0.2, 3.4]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={isNight ? 1.2 : 0.4} />
      </mesh>
      {isNight && (
        <pointLight position={[0, 1.5, 0.8]} intensity={2.5} distance={6} color={color} />
      )}
    </group>
  )
}

// -------------------------------------------------------------
// 7. ANIMATED CONSTRUCTION STAGING (Active when constructing)
// -------------------------------------------------------------
function ConstructionStaging({ color }: { color: string }) {
  const scaffoldRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (scaffoldRef.current) {
      scaffoldRef.current.rotation.y = state.clock.getElapsedTime() * 0.4
    }
  })

  return (
    <group position={[0, 0, 0]}>
      {/* Foundation Base */}
      <mesh position={[0, 0.08, 0]}>
        <boxGeometry args={[4.4, 0.16, 4.0]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.7} />
      </mesh>
      {/* Laser Scanning Grid */}
      <group ref={scaffoldRef}>
        <mesh position={[0, 1.6, 0]}>
          <boxGeometry args={[4.2, 3.2, 3.8]} />
          <meshBasicMaterial color={color} wireframe transparent opacity={0.7} />
        </mesh>
      </group>
      {/* Central Rebar Rising */}
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[1.2, 1.2, 2.2, 8]} />
        <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Flashing Beacon */}
      <pointLight position={[0, 3.5, 0]} intensity={4.0} distance={10} color="#f59e0b" />
    </group>
  )
}

// -------------------------------------------------------------
// MAIN STORE BUILDING EXPORT WITH SLEEK WORLD-SPACE BADGE
// -------------------------------------------------------------
export const StoreBuilding: React.FC<StoreBuildingProps> = ({
  store,
  isSelected,
  onClick,
  onHover,
  timeOfDay = 'day',
  isConstructing = false
}) => {
  const [hovered, setHovered] = useState(false)
  const groupRef = useRef<THREE.Group>(null)
  const pinRef = useRef<THREE.Group>(null)

  const isNight = timeOfDay === 'night'
  const primaryColor = store.color || '#3B82F6'

  useFrame((state) => {
    if (!groupRef.current) return
    // Smooth hover elevation and gentle bounce
    const targetScale = hovered || isSelected ? 1.04 : 1.0
    const targetY = hovered ? 0.2 : 0.0

    groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.12)
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.12)

    // Gentle float for world pin
    if (pinRef.current) {
      pinRef.current.position.y = 5.2 + Math.sin(state.clock.getElapsedTime() * 2.5) * 0.06
    }
  })

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Electronics':
        return '💻'
      case 'Grocery':
        return '🛒'
      case 'Clothing':
        return '👗'
      case 'Furniture':
        return '🪑'
      case 'Accessories':
        return '💎'
      default:
        return '🏬'
    }
  }

  const renderArchitecture = () => {
    if (isConstructing) {
      return <ConstructionStaging color={primaryColor} />
    }

    switch (store.category) {
      case 'Electronics':
        return <ElectronicsStore hovered={hovered} isSelected={isSelected} isNight={isNight} />
      case 'Grocery':
        return <GroceryStore hovered={hovered} isSelected={isSelected} isNight={isNight} />
      case 'Clothing':
        return <ClothingStore hovered={hovered} isSelected={isSelected} isNight={isNight} />
      case 'Furniture':
        return <FurnitureStore hovered={hovered} isSelected={isSelected} isNight={isNight} />
      case 'Accessories':
        return <AccessoriesStore hovered={hovered} isSelected={isSelected} isNight={isNight} />
      default:
        return (
          <CustomStorePavilion
            color={primaryColor}
            hovered={hovered}
            isSelected={isSelected}
            isNight={isNight}
          />
        )
    }
  }

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
      {/* Active Glowing Holographic Pedestal on Hover/Select */}
      {(hovered || isSelected) && (
        <group position={[0, 0.02, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[2.5, 2.7, 32]} />
            <meshBasicMaterial color={primaryColor} transparent opacity={0.8} />
          </mesh>
          <pointLight position={[0, 3.8, 1.5]} intensity={3.0} distance={6} color={primaryColor} />
        </group>
      )}

      {/* BESPOKE STORE ARCHITECTURE */}
      {renderArchitecture()}

      {/* SLEEK FLOATING GAME-STYLE HUD PIN */}
      <group ref={pinRef} position={[0, 5.2, 0]}>
        {/* Dark Pill Capsule */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[2.3, 0.44, 0.08]} />
          <meshStandardMaterial
            color="#0f172a"
            roughness={0.2}
            emissive={primaryColor}
            emissiveIntensity={isNight ? 0.4 : 0.15}
          />
        </mesh>
        <mesh position={[0, 0, -0.01]}>
          <boxGeometry args={[2.36, 0.5, 0.04]} />
          <meshStandardMaterial color={primaryColor} />
        </mesh>

        {/* Store Title */}
        <Text
          position={[0, 0.08, 0.06]}
          fontSize={0.14}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
          maxWidth={2.2}
        >
          {`${getCategoryIcon(store.category)}  ${store.name}`}
        </Text>

        {/* Revenue Metric Pill */}
        <Text
          position={[0, -0.1, 0.06]}
          fontSize={0.11}
          color="#38bdf8"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          {`$${(store.total_revenue || 0).toLocaleString()} • ${store.total_orders || 0} Orders`}
        </Text>

        {/* Pointer Diamond */}
        <mesh position={[0, -0.32, 0]} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[0.12, 0.12, 0.04]} />
          <meshStandardMaterial color={primaryColor} />
        </mesh>
      </group>
    </group>
  )
}

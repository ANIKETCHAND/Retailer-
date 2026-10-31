/**
 * RetailVision - High-Fidelity 3D Store Architectural Models
 * Inspired by Image 6: SimCity/Megapolis game art style.
 * Bespoke architectural landmarks:
 *  - Electronics: The Curved Glass Sky-Garden Eco-Tower
 *  - Grocery: The Giant Rooftop 3D Cheeseburger & Gourmet Market
 *  - Clothing: Modern Glass High-Rise with Pink Podium & Rooftop Lounge
 *  - Furniture: Stacked Timber Barrel Showroom with Deck
 *  - Accessories: Classical Neoclassical Domed Pavilion & Portico
 *  - Custom: Modular High-Tech Glass & Steel Pavilion
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

// -------------------------------------------------------------
// 1. ELECTRONICS: CURVED GLASS SKY-GARDEN ECO-TOWER (Image 6 style)
// -------------------------------------------------------------
function CurvedGlassEcoTower({ hovered, isSelected }: { hovered: boolean; isSelected: boolean }) {
  const gardenRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (gardenRef.current) {
      gardenRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.05
    }
  })

  return (
    <group position={[0, 0, 0]}>
      {/* Foundation & Paved Plaza */}
      <mesh position={[0, 0.06, 0]} receiveShadow>
        <boxGeometry args={[4.4, 0.12, 4.0]} />
        <meshStandardMaterial color={hovered || isSelected ? '#38bdf8' : '#e2e8f0'} roughness={0.4} />
      </mesh>

      {/* Podium Ground Floor (Granite & Chrome) */}
      <mesh position={[0, 0.65, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.8, 1.1, 3.4]} />
        <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.5} />
      </mesh>

      {/* Entrance Glass Revolving Door / Atrium */}
      <mesh position={[0, 0.55, 1.72]}>
        <boxGeometry args={[1.4, 0.9, 0.06]} />
        <meshPhysicalMaterial color="#38bdf8" transparent opacity={0.6} roughness={0.1} />
      </mesh>
      {/* Blue LED Entrance Canopy */}
      <mesh position={[0, 1.1, 1.9]} castShadow>
        <boxGeometry args={[1.8, 0.08, 0.8]} />
        <meshStandardMaterial color="#0284c7" emissive="#0284c7" emissiveIntensity={0.6} />
      </mesh>

      {/* Upper Main Body: Tiered Glass Sky-Tower */}
      <mesh position={[0, 2.2, -0.1]} castShadow receiveShadow>
        <boxGeometry args={[3.2, 2.0, 2.8]} />
        <meshPhysicalMaterial
          color="#0284c7"
          transparent
          opacity={0.45}
          roughness={0.1}
          metalness={0.3}
          clearcoat={1.0}
        />
      </mesh>

      {/* ICONIC CURVED GLASS ARCHED FACADE (Walkie-Talkie style) */}
      {[-1.3, -0.65, 0, 0.65, 1.3].map((rx, idx) => (
        <group key={`arch-${idx}`} position={[rx, 2.3, 1.35]}>
          {/* Vertical Mullion Ribs */}
          <mesh castShadow>
            <cylinderGeometry args={[0.035, 0.045, 2.2, 8]} />
            <meshStandardMaterial color="#f8fafc" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>
      ))}

      {/* Horizontal Curved Glass Floor Rings */}
      {[1.6, 2.2, 2.8].map((fy, idx) => (
        <mesh key={`ring-${idx}`} position={[0, fy, 1.34]}>
          <boxGeometry args={[3.3, 0.06, 0.08]} />
          <meshStandardMaterial color="#f8fafc" metalness={0.8} />
        </mesh>
      ))}

      {/* Lush Sky-Garden / Vertical Greenhouse visible through curved glass */}
      <group ref={gardenRef} position={[0, 2.2, 0.4]}>
        {[-0.8, 0, 0.8].map((gx, i) => (
          <group key={`tree-${i}`} position={[gx, -0.4, 0]}>
            <mesh position={[0, 0.3, 0]}>
              <cylinderGeometry args={[0.05, 0.07, 0.6, 6]} />
              <meshStandardMaterial color="#78350f" />
            </mesh>
            <mesh position={[0, 0.7, 0]}>
              <sphereGeometry args={[0.35, 12, 12]} />
              <meshStandardMaterial color={i === 1 ? '#22c55e' : '#16a34a'} roughness={0.8} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Angled Glass Sky-Crown / Sloped Penthouse */}
      <group position={[0, 3.4, -0.2]} rotation={[-0.2, 0, 0]}>
        <mesh castShadow>
          <boxGeometry args={[3.3, 0.4, 2.6]} />
          <meshPhysicalMaterial
            color="#38bdf8"
            transparent
            opacity={0.65}
            roughness={0.1}
            metalness={0.4}
          />
        </mesh>
        {/* Antennas & Communication Spire */}
        <mesh position={[1.1, 0.6, -0.5]}>
          <cylinderGeometry args={[0.02, 0.04, 1.2, 8]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.9} />
        </mesh>
        <mesh position={[-1.1, 0.45, -0.5]}>
          <cylinderGeometry args={[0.02, 0.03, 0.9, 8]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.9} />
        </mesh>
      </group>
    </group>
  )
}

// -------------------------------------------------------------
// 2. GROCERY: GOURMET MARKET & GIANT 3D ROOFTOP CHEESEBURGER (Image 6 style)
// -------------------------------------------------------------
function BurgerMarketBuilding({ hovered, isSelected }: { hovered: boolean; isSelected: boolean }) {
  const burgerRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (burgerRef.current) {
      // Gentle floating/wobble for the giant burger
      burgerRef.current.position.y = 3.0 + Math.sin(state.clock.getElapsedTime() * 1.5) * 0.05
    }
  })

  return (
    <group position={[0, 0, 0]}>
      {/* Foundation & Outdoor Patio */}
      <mesh position={[0, 0.06, 0]} receiveShadow>
        <boxGeometry args={[4.4, 0.12, 4.0]} />
        <meshStandardMaterial color={hovered || isSelected ? '#f59e0b' : '#fef08a'} roughness={0.5} />
      </mesh>

      {/* Two-Story Restaurant Diner Body (Sunny Yellow & Cream) */}
      <mesh position={[0, 1.05, -0.2]} castShadow receiveShadow>
        <boxGeometry args={[3.6, 1.9, 2.8]} />
        <meshStandardMaterial color="#fde047" roughness={0.4} />
      </mesh>

      {/* Lower Storefront Trim / Brick Foundation */}
      <mesh position={[0, 0.25, -0.19]}>
        <boxGeometry args={[3.65, 0.35, 2.85]} />
        <meshStandardMaterial color="#b45309" roughness={0.7} />
      </mesh>

      {/* Front Entrance & Windows */}
      <mesh position={[0, 0.8, 1.22]}>
        <boxGeometry args={[1.2, 1.2, 0.04]} />
        <meshPhysicalMaterial color="#38bdf8" transparent opacity={0.5} />
      </mesh>
      {[-1.2, 1.2].map((wx, i) => (
        <mesh key={`win-${i}`} position={[wx, 0.9, 1.22]}>
          <boxGeometry args={[0.8, 0.9, 0.04]} />
          <meshPhysicalMaterial color="#38bdf8" transparent opacity={0.5} />
        </mesh>
      ))}

      {/* Striped Red & White Diner Canopy */}
      <group position={[0, 1.5, 1.45]} rotation={[0.3, 0, 0]}>
        <mesh castShadow>
          <boxGeometry args={[3.7, 0.08, 0.8]} />
          <meshStandardMaterial color="#dc2626" />
        </mesh>
        {[-1.5, -0.9, -0.3, 0.3, 0.9, 1.5].map((sx, idx) => (
          <mesh key={`stripe-${idx}`} position={[sx, 0.05, 0]}>
            <boxGeometry args={[0.3, 0.02, 0.82]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        ))}
      </group>

      {/* Rooftop Parapet Border */}
      <mesh position={[0, 2.05, -0.2]} castShadow>
        <boxGeometry args={[3.75, 0.15, 2.95]} />
        <meshStandardMaterial color="#dc2626" roughness={0.3} />
      </mesh>

      {/* GIGANTIC 3D CHEESEBURGER LANDMARK ON ROOF (Exact match to Image 6) */}
      <group ref={burgerRef} position={[0, 3.0, -0.2]}>
        {/* Bottom Bun */}
        <mesh position={[0, -0.35, 0]} castShadow>
          <cylinderGeometry args={[1.1, 1.05, 0.3, 24]} />
          <meshStandardMaterial color="#d97706" roughness={0.6} />
        </mesh>
        {/* Beef Patty */}
        <mesh position={[0, -0.15, 0]} castShadow>
          <cylinderGeometry args={[1.2, 1.2, 0.25, 24]} />
          <meshStandardMaterial color="#451a03" roughness={0.8} />
        </mesh>
        {/* Melted Yellow Cheese (Diagonal Corners) */}
        <mesh position={[0, 0.02, 0]} rotation={[0, Math.PI / 4, 0]}>
          <boxGeometry args={[1.8, 0.06, 1.8]} />
          <meshStandardMaterial color="#facc15" roughness={0.3} />
        </mesh>
        {/* Wavy Green Lettuce Leaf */}
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[1.25, 1.25, 0.08, 12]} />
          <meshStandardMaterial color="#22c55e" roughness={0.7} />
        </mesh>
        {/* Red Tomato Slice */}
        <mesh position={[0, 0.18, 0]}>
          <cylinderGeometry args={[1.15, 1.15, 0.09, 24]} />
          <meshStandardMaterial color="#ef4444" roughness={0.4} />
        </mesh>
        {/* Top Sesame Bun (Dome) */}
        <mesh position={[0, 0.42, 0]} castShadow>
          <sphereGeometry args={[1.18, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#d97706" roughness={0.5} />
        </mesh>
        {/* White Sesame Seeds on Top Bun */}
        {[
          [0.2, 0.95, 0.3],
          [-0.3, 0.92, -0.2],
          [0.5, 0.85, -0.4],
          [-0.5, 0.88, 0.3],
          [0.0, 1.0, 0.0]
        ].map(([sx, sy, sz], idx) => (
          <mesh key={`sesame-${idx}`} position={[sx, sy - 0.2, sz]}>
            <sphereGeometry args={[0.035, 8, 8]} />
            <meshStandardMaterial color="#fef08a" />
          </mesh>
        ))}
      </group>

      {/* Outdoor Patio Umbrella & Tables */}
      <group position={[1.4, 0.12, 1.2]}>
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 1.0, 8]} />
          <meshStandardMaterial color="#64748b" />
        </mesh>
        <mesh position={[0, 0.95, 0]} castShadow>
          <coneGeometry args={[0.65, 0.3, 8]} />
          <meshStandardMaterial color="#dc2626" />
        </mesh>
        <mesh position={[0, 0.35, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.04, 12]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      </group>
    </group>
  )
}

// -------------------------------------------------------------
// 3. CLOTHING: GLASS HIGH-RISE WITH PINK PODIUM & ROOFTOP CAFE (Image 6 style)
// -------------------------------------------------------------
function GlassHighRiseHotel({ hovered, isSelected }: { hovered: boolean; isSelected: boolean }) {
  return (
    <group position={[0, 0, 0]}>
      {/* Foundation & Pavement */}
      <mesh position={[0, 0.06, 0]} receiveShadow>
        <boxGeometry args={[4.4, 0.12, 4.0]} />
        <meshStandardMaterial color={hovered || isSelected ? '#ec4899' : '#fbcfe8'} roughness={0.5} />
      </mesh>

      {/* Vibrant Magenta/Pink Ground Podium Boutique */}
      <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.8, 1.3, 3.4]} />
        <meshStandardMaterial color="#db2777" roughness={0.3} />
      </mesh>
      {/* White Podium Trim */}
      <mesh position={[0, 1.42, 0]}>
        <boxGeometry args={[3.9, 0.12, 3.5]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Ground Floor Fashion Showcases */}
      {[-1.1, 1.1].map((fx, i) => (
        <mesh key={`showcase-${i}`} position={[fx, 0.7, 1.72]}>
          <boxGeometry args={[1.2, 0.9, 0.04]} />
          <meshPhysicalMaterial color="#38bdf8" transparent opacity={0.5} roughness={0.1} />
        </mesh>
      ))}

      {/* Multi-Story Glass Tower Grid (Cyan Grid Windows) */}
      <mesh position={[0, 2.45, -0.2]} castShadow receiveShadow>
        <boxGeometry args={[2.8, 2.0, 2.6]} />
        <meshPhysicalMaterial
          color="#38bdf8"
          transparent
          opacity={0.65}
          roughness={0.1}
          metalness={0.4}
        />
      </mesh>

      {/* White Grid Facade Frames (4 floors) */}
      {[-1.0, 0, 1.0].map((gx, idx) => (
        <mesh key={`mullion-${idx}`} position={[gx, 2.45, 1.11]}>
          <boxGeometry args={[0.06, 2.0, 0.04]} />
          <meshStandardMaterial color="#ffffff" metalness={0.6} />
        </mesh>
      ))}
      {[1.7, 2.2, 2.7, 3.2].map((gy, idx) => (
        <mesh key={`floor-beam-${idx}`} position={[0, gy, 1.11]}>
          <boxGeometry args={[2.82, 0.06, 0.04]} />
          <meshStandardMaterial color="#ffffff" metalness={0.6} />
        </mesh>
      ))}

      {/* ROOFTOP OPEN-AIR CAFE & PATIO (Exact match to Image 6) */}
      <group position={[0, 3.5, -0.2]}>
        {/* Roof Deck Flooring */}
        <mesh position={[0, 0, 0]} receiveShadow>
          <boxGeometry args={[2.85, 0.08, 2.65]} />
          <meshStandardMaterial color="#f472b6" roughness={0.3} />
        </mesh>
        {/* Perimeter Glass Balustrade / Railing */}
        <mesh position={[0, 0.22, 1.3]}>
          <boxGeometry args={[2.8, 0.35, 0.04]} />
          <meshPhysicalMaterial color="#38bdf8" transparent opacity={0.5} />
        </mesh>
        {/* Cafe Tables & Chairs on Rooftop */}
        {[
          [-0.7, 0.4],
          [0.7, 0.4],
          [-0.7, -0.5],
          [0.7, -0.5]
        ].map(([tx, tz], i) => (
          <group key={`cafe-table-${i}`} position={[tx, 0.04, tz]}>
            {/* Table */}
            <mesh position={[0, 0.16, 0]}>
              <cylinderGeometry args={[0.18, 0.18, 0.04, 12]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>
            <mesh position={[0, 0.08, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 0.16, 8]} />
              <meshStandardMaterial color="#475569" />
            </mesh>
            {/* 2 Chairs */}
            <mesh position={[-0.22, 0.08, 0]}>
              <boxGeometry args={[0.12, 0.16, 0.12]} />
              <meshStandardMaterial color="#f43f5e" />
            </mesh>
            <mesh position={[0.22, 0.08, 0]}>
              <boxGeometry args={[0.12, 0.16, 0.12]} />
              <meshStandardMaterial color="#f43f5e" />
            </mesh>
          </group>
        ))}
      </group>

      {/* Palm Tree in Front Plaza */}
      <group position={[1.5, 0.12, 1.4]}>
        <mesh position={[0, 0.7, 0]} rotation={[0, 0, -0.15]} castShadow>
          <cylinderGeometry args={[0.08, 0.12, 1.4, 8]} />
          <meshStandardMaterial color="#854d0e" roughness={0.8} />
        </mesh>
        <mesh position={[0.2, 1.45, 0]}>
          <sphereGeometry args={[0.5, 8, 8]} />
          <meshStandardMaterial color="#16a34a" roughness={0.6} />
        </mesh>
      </group>
    </group>
  )
}

// -------------------------------------------------------------
// 4. FURNITURE: STACKED TIMBER BARRELS SHOWROOM (Image 6 style)
// -------------------------------------------------------------
function BarrelFurnitureShowroom({ hovered, isSelected }: { hovered: boolean; isSelected: boolean }) {
  return (
    <group position={[0, 0, 0]}>
      {/* Foundation & Timber Deck */}
      <mesh position={[0, 0.06, 0]} receiveShadow>
        <boxGeometry args={[4.4, 0.12, 4.0]} />
        <meshStandardMaterial color={hovered || isSelected ? '#f59e0b' : '#fed7aa'} roughness={0.6} />
      </mesh>

      {/* Ground Floor Timber Showroom */}
      <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.8, 1.2, 3.4]} />
        <meshStandardMaterial color="#b45309" roughness={0.5} />
      </mesh>

      {/* Front Entrance / Wide Glass Display */}
      <mesh position={[0, 0.65, 1.72]}>
        <boxGeometry args={[2.0, 0.9, 0.04]} />
        <meshPhysicalMaterial color="#fed7aa" transparent opacity={0.4} />
      </mesh>

      {/* STACKED GIANT WOODEN BARRELS ARCHITECTURE (Exact match to Image 6) */}
      {/* Lower Left Barrel */}
      <group position={[-0.85, 1.7, 0]} rotation={[0, 0, Math.PI / 2]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.85, 0.75, 2.2, 24]} />
          <meshStandardMaterial color="#d97706" roughness={0.6} />
        </mesh>
        {/* Metal Hoops */}
        {[-0.7, 0, 0.7].map((hy, idx) => (
          <mesh key={`b1-hoop-${idx}`} position={[0, hy, 0]}>
            <cylinderGeometry args={[0.87, 0.87, 0.06, 24]} />
            <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
          </mesh>
        ))}
        {/* Glass Port Window on Barrel Face */}
        <mesh position={[0, 1.11, 0]}>
          <cylinderGeometry args={[0.65, 0.65, 0.02, 16]} />
          <meshPhysicalMaterial color="#38bdf8" transparent opacity={0.6} />
        </mesh>
      </group>

      {/* Lower Right Barrel */}
      <group position={[0.85, 1.7, 0]} rotation={[0, 0, Math.PI / 2]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.85, 0.75, 2.2, 24]} />
          <meshStandardMaterial color="#d97706" roughness={0.6} />
        </mesh>
        {[-0.7, 0, 0.7].map((hy, idx) => (
          <mesh key={`b2-hoop-${idx}`} position={[0, hy, 0]}>
            <cylinderGeometry args={[0.87, 0.87, 0.06, 24]} />
            <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
          </mesh>
        ))}
      </group>

      {/* Top Stacked Center Barrel */}
      <group position={[0, 2.8, 0]} rotation={[0, 0, Math.PI / 2]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.95, 0.82, 2.4, 24]} />
          <meshStandardMaterial color="#b45309" roughness={0.5} />
        </mesh>
        {[-0.8, -0.2, 0.2, 0.8].map((hy, idx) => (
          <mesh key={`top-hoop-${idx}`} position={[0, hy, 0]}>
            <cylinderGeometry args={[0.97, 0.97, 0.06, 24]} />
            <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
          </mesh>
        ))}
        <mesh position={[0, 1.21, 0]}>
          <cylinderGeometry args={[0.7, 0.7, 0.02, 16]} />
          <meshPhysicalMaterial color="#fef08a" transparent opacity={0.6} />
        </mesh>
      </group>

      {/* Outdoor Furniture Display Bench */}
      <mesh position={[1.2, 0.3, 1.3]} castShadow>
        <boxGeometry args={[1.0, 0.35, 0.5]} />
        <meshStandardMaterial color="#78350f" roughness={0.7} />
      </mesh>
    </group>
  )
}

// -------------------------------------------------------------
// 5. ACCESSORIES: NEOCLASSICAL DOMED PALACE & PLAZA FOUNTAIN (Image 6 style)
// -------------------------------------------------------------
function NeoclassicalDomedPavilion({ hovered, isSelected }: { hovered: boolean; isSelected: boolean }) {
  const fountainWaterRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (fountainWaterRef.current) {
      fountainWaterRef.current.rotation.y = state.clock.getElapsedTime() * 0.8
    }
  })

  return (
    <group position={[0, 0, 0]}>
      {/* Foundation & Cobblestone Plaza */}
      <mesh position={[0, 0.06, 0]} receiveShadow>
        <boxGeometry args={[4.4, 0.12, 4.0]} />
        <meshStandardMaterial color={hovered || isSelected ? '#8b5cf6' : '#e0e7ff'} roughness={0.4} />
      </mesh>

      {/* Neoclassical Main Palace Body (Royal Blue & Ivory White) */}
      <mesh position={[0, 1.15, -0.4]} castShadow receiveShadow>
        <boxGeometry args={[3.8, 2.1, 2.4]} />
        <meshStandardMaterial color="#1e3a8a" roughness={0.3} />
      </mesh>

      {/* Classical Ivory White Colonnade Pillars & Portico */}
      {[-1.5, -0.9, -0.3, 0.3, 0.9, 1.5].map((px, idx) => (
        <group key={`col-${idx}`} position={[px, 1.1, 0.85]}>
          {/* Pillar Column */}
          <mesh castShadow>
            <cylinderGeometry args={[0.07, 0.09, 1.9, 16]} />
            <meshStandardMaterial color="#ffffff" roughness={0.3} />
          </mesh>
          {/* Capital & Base */}
          <mesh position={[0, 0.98, 0]}>
            <boxGeometry args={[0.22, 0.08, 0.22]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          <mesh position={[0, -0.98, 0]}>
            <boxGeometry args={[0.22, 0.08, 0.22]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        </group>
      ))}

      {/* Classical Portico Pediment (Triangle Roof above pillars) */}
      <mesh position={[0, 2.2, 0.85]} castShadow>
        <boxGeometry args={[3.6, 0.25, 0.4]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Roof Balustrades */}
      <mesh position={[0, 2.3, -0.4]} castShadow>
        <boxGeometry args={[3.85, 0.12, 2.45]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* CLASSICAL CENTRAL CUPOLA DOME & SPIRE (Exact match to Image 6) */}
      <group position={[0, 2.4, -0.4]}>
        {/* Octagonal Drum Base */}
        <mesh position={[0, 0.4, 0]} castShadow>
          <cylinderGeometry args={[0.85, 0.95, 0.8, 8]} />
          <meshStandardMaterial color="#ffffff" roughness={0.3} />
        </mesh>
        {/* Arched Drum Windows */}
        {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((ang, i) => (
          <mesh key={`drum-win-${i}`} position={[Math.sin(ang) * 0.86, 0.4, Math.cos(ang) * 0.86]} rotation={[0, ang, 0]}>
            <boxGeometry args={[0.3, 0.5, 0.04]} />
            <meshPhysicalMaterial color="#38bdf8" transparent opacity={0.6} />
          </mesh>
        ))}
        {/* Silver Classical Dome */}
        <mesh position={[0, 1.15, 0]} castShadow>
          <sphereGeometry args={[0.9, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Golden Finial Spire */}
        <mesh position={[0, 2.2, 0]}>
          <cylinderGeometry args={[0.02, 0.05, 0.6, 8]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.9} />
        </mesh>
      </group>

      {/* TIERED CIRCULAR WATER FOUNTAIN IN FRONT PLAZA (Exact match to Image 6) */}
      <group position={[0, 0.12, 1.35]}>
        {/* Lower Stone Basin */}
        <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.9, 1.0, 0.24, 24]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.6} />
        </mesh>
        {/* Lower Water Surface */}
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.82, 0.82, 0.05, 24]} />
          <meshPhysicalMaterial color="#06b6d4" transparent opacity={0.7} roughness={0.1} />
        </mesh>
        {/* Center Pedestal & Upper Tier Basin */}
        <mesh position={[0, 0.42, 0]}>
          <cylinderGeometry args={[0.12, 0.18, 0.4, 12]} />
          <meshStandardMaterial color="#cbd5e1" />
        </mesh>
        <mesh position={[0, 0.62, 0]} castShadow>
          <cylinderGeometry args={[0.45, 0.52, 0.16, 16]} />
          <meshStandardMaterial color="#cbd5e1" />
        </mesh>
        {/* Cascading Sparkling Water Jet */}
        <mesh ref={fountainWaterRef} position={[0, 0.85, 0]}>
          <coneGeometry args={[0.25, 0.45, 12]} />
          <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.6} transparent opacity={0.8} />
        </mesh>
      </group>
    </group>
  )
}

// -------------------------------------------------------------
// 6. CUSTOM / PROCEDURAL STORE: HIGH-TECH MODULAR PAVILION
// -------------------------------------------------------------
function ModularCustomPavilion({
  color,
  hovered,
  isSelected
}: {
  category?: string
  color: string
  hovered: boolean
  isSelected: boolean
}) {
  return (
    <group position={[0, 0, 0]}>
      <mesh position={[0, 0.06, 0]} receiveShadow>
        <boxGeometry args={[4.4, 0.12, 4.0]} />
        <meshStandardMaterial color={hovered || isSelected ? color : '#e2e8f0'} roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.6, 2.0, 3.0]} />
        <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.4} />
      </mesh>
      <mesh position={[0, 1.1, 1.52]}>
        <boxGeometry args={[3.2, 1.6, 0.04]} />
        <meshPhysicalMaterial color="#38bdf8" transparent opacity={0.6} roughness={0.1} />
      </mesh>
      <mesh position={[0, 2.15, 0]} castShadow>
        <boxGeometry args={[3.8, 0.2, 3.2]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} />
      </mesh>
      <mesh position={[0, 2.5, 0]} castShadow>
        <boxGeometry args={[2.4, 0.5, 2.0]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
    </group>
  )
}

// -------------------------------------------------------------
// MAIN STORE BUILDING WRAPPER WITH WORLD-SPACE 3D HUD PIN
// -------------------------------------------------------------
export const StoreBuilding: React.FC<StoreBuildingProps> = ({
  store,
  isSelected,
  onClick,
  onHover
}) => {
  const [hovered, setHovered] = useState(false)
  const groupRef = useRef<THREE.Group>(null)
  const pinRef = useRef<THREE.Group>(null)

  const primaryColor = store.color || '#3B82F6'

  useFrame((state) => {
    if (!groupRef.current) return
    // Smooth hover elevation and scale bounce
    const targetScale = hovered || isSelected ? 1.05 : 1.0
    const targetY = hovered ? 0.22 : 0.0

    groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.12)
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.12)

    // Gentle float for 3D world pin
    if (pinRef.current) {
      pinRef.current.position.y = 5.4 + Math.sin(state.clock.getElapsedTime() * 2.5) * 0.06
    }
  })

  // Category Icon helper
  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Electronics':
        return '💻'
      case 'Grocery':
        return '🍔'
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

  // Render appropriate landmark based on category
  const renderBuildingArchitecture = () => {
    switch (store.category) {
      case 'Electronics':
        return <CurvedGlassEcoTower hovered={hovered} isSelected={isSelected} />
      case 'Grocery':
        return <BurgerMarketBuilding hovered={hovered} isSelected={isSelected} />
      case 'Clothing':
        return <GlassHighRiseHotel hovered={hovered} isSelected={isSelected} />
      case 'Furniture':
        return <BarrelFurnitureShowroom hovered={hovered} isSelected={isSelected} />
      case 'Accessories':
        return <NeoclassicalDomedPavilion hovered={hovered} isSelected={isSelected} />
      default:
        return (
          <ModularCustomPavilion
            category={store.category}
            color={primaryColor}
            hovered={hovered}
            isSelected={isSelected}
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
      {/* GLOWING HOLOGRAPHIC PEDESTAL RING (Active on hover/select) */}
      {(hovered || isSelected) && (
        <group position={[0, 0.02, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[2.5, 2.7, 32]} />
            <meshBasicMaterial color={primaryColor} transparent opacity={0.7} />
          </mesh>
          <pointLight position={[0, 4.0, 1.5]} intensity={3.5} distance={7} color={primaryColor} />
        </group>
      )}

      {/* BESPOKE 3D ARCHITECTURAL MODEL */}
      {renderBuildingArchitecture()}

      {/* SLEEK FLOATING GAME-STYLE HUD PIN (Floating above roof, unobstructed) */}
      <group ref={pinRef} position={[0, 5.4, 0]}>
        {/* Sleek Dark Pill Background */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[2.2, 0.44, 0.08]} />
          <meshStandardMaterial
            color="#0f172a"
            roughness={0.2}
            emissive={primaryColor}
            emissiveIntensity={hovered || isSelected ? 0.3 : 0.1}
          />
        </mesh>
        {/* Glowing Colored Accent Border */}
        <mesh position={[0, 0, -0.01]}>
          <boxGeometry args={[2.26, 0.5, 0.04]} />
          <meshStandardMaterial color={primaryColor} />
        </mesh>

        {/* Store Title with Category Emoji */}
        <Text
          position={[0, 0.08, 0.06]}
          fontSize={0.14}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
          maxWidth={2.1}
        >
          {`${getCategoryIcon(store.category)}  ${store.name}`}
        </Text>

        {/* Live Metrics Pill */}
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

        {/* Diamond Indicator Pointer */}
        <mesh position={[0, -0.32, 0]} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[0.12, 0.12, 0.04]} />
          <meshStandardMaterial color={primaryColor} />
        </mesh>
      </group>
    </group>
  )
}

/**
 * RetailVision - Full Metropolis 3D Environment & Urban Districts
 * Transforms the environment into a sprawling, living city (SimCity/Megapolis style):
 *  - Central Commercial District (Interactive retail stores & Construction Zone)
 *  - North: Downtown Financial Skyline (Modern glass skyscrapers, helipads, corporate spires)
 *  - East: Industrial & Energy Sector (Factory with smokestacks, container yards, warehouses)
 *  - South: Residential Suburbia (Terracotta-roof townhouses, balconies, neighborhood parks)
 *  - West: Waterfront Bay & Space Needle Observation Tower (Marina docks, futuristic spire)
 *  - Railway Arteries with a colorful moving/parked locomotive & passenger train
 *  - Turquoise Waterway Canal with bridges spanning across the metropolis
 *  - Expansive landscape terrain (220x220) with road grid networks, cars, palm trees & streetlamps
 */

import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// -------------------------------------------------------------
// 1. DOWNTOWN FINANCIAL SKYLINE (North District, z < -18)
// -------------------------------------------------------------
function DowntownSkyline() {
  return (
    <group position={[0, 0, -28]}>
      {/* Tower 1: Supertall Glass Apex Tower */}
      <group position={[-12, 0, -6]}>
        <mesh position={[0, 4.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[4.2, 9.0, 4.2]} />
          <meshPhysicalMaterial color="#0284c7" transparent opacity={0.65} roughness={0.1} metalness={0.4} />
        </mesh>
        {/* White structural mullions */}
        {[-1.8, 0, 1.8].map((mx, i) => (
          <mesh key={`m-apex-${i}`} position={[mx, 4.5, 2.15]}>
            <boxGeometry args={[0.08, 9.0, 0.08]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
        ))}
        {/* Tiered Crown & Antenna */}
        <mesh position={[0, 9.5, 0]} castShadow>
          <boxGeometry args={[3.2, 1.0, 3.2]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        <mesh position={[0, 11.2, 0]}>
          <cylinderGeometry args={[0.04, 0.1, 2.4, 8]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.9} />
        </mesh>
      </group>

      {/* Tower 2: Granite Corporate Center with Helipad */}
      <group position={[-4, 0, -8]}>
        <mesh position={[0, 6.0, 0]} castShadow receiveShadow>
          <boxGeometry args={[5.0, 12.0, 4.5]} />
          <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.6} />
        </mesh>
        {/* Window Grids */}
        {Array.from({ length: 6 }).map((_, i) => (
          <mesh key={`win-grid-${i}`} position={[0, 2.0 + i * 1.8, 2.3]}>
            <boxGeometry args={[4.4, 0.8, 0.04]} />
            <meshPhysicalMaterial color="#38bdf8" transparent opacity={0.7} />
          </mesh>
        ))}
        {/* Helipad on Roof */}
        <mesh position={[0, 12.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1.8, 24]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
        <mesh position={[0, 12.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.4, 1.6, 24]} />
          <meshBasicMaterial color="#facc15" />
        </mesh>
      </group>

      {/* Tower 3: Stepped Art-Deco High-Rise */}
      <group position={[5, 0, -7]}>
        <mesh position={[0, 3.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[4.8, 7.0, 4.4]} />
          <meshStandardMaterial color="#0f766e" roughness={0.4} />
        </mesh>
        <mesh position={[0, 8.0, 0]} castShadow>
          <boxGeometry args={[3.6, 2.5, 3.4]} />
          <meshStandardMaterial color="#115e59" roughness={0.4} />
        </mesh>
        <mesh position={[0, 9.8, 0]} castShadow>
          <boxGeometry args={[2.2, 1.2, 2.2]} />
          <meshStandardMaterial color="#134e4a" />
        </mesh>
        <mesh position={[0, 11.0, 0]}>
          <cylinderGeometry args={[0.03, 0.08, 1.8, 8]} />
          <meshStandardMaterial color="#fef08a" metalness={0.9} />
        </mesh>
      </group>

      {/* Tower 4: Modern Twin Glass Towers with Skybridge */}
      <group position={[14, 0, -6]}>
        {/* Left Spire */}
        <mesh position={[-1.6, 4.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.2, 9.0, 3.0]} />
          <meshPhysicalMaterial color="#0284c7" transparent opacity={0.6} />
        </mesh>
        {/* Right Spire */}
        <mesh position={[1.6, 5.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.2, 10.4, 3.0]} />
          <meshPhysicalMaterial color="#0284c7" transparent opacity={0.6} />
        </mesh>
        {/* Connecting Skybridge */}
        <mesh position={[0, 6.2, 0]} castShadow>
          <boxGeometry args={[2.0, 0.8, 1.4]} />
          <meshStandardMaterial color="#ffffff" metalness={0.7} />
        </mesh>
      </group>

      {/* Mid-Rise Office Blocks */}
      <mesh position={[-20, 2.5, -5]} castShadow receiveShadow>
        <boxGeometry args={[4.5, 5.0, 4.0]} />
        <meshStandardMaterial color="#3b82f6" roughness={0.5} />
      </mesh>
      <mesh position={[22, 3.0, -5]} castShadow receiveShadow>
        <boxGeometry args={[5.0, 6.0, 4.2]} />
        <meshStandardMaterial color="#6366f1" roughness={0.4} />
      </mesh>
    </group>
  )
}

// -------------------------------------------------------------
// 2. INDUSTRIAL & FACTORY ZONE (East District, x > 18)
// Inspired directly by Image 2 & Image 6
// -------------------------------------------------------------
function IndustrialSector() {
  return (
    <group position={[28, 0, 0]}>
      {/* Heavy Industry Power & Manufacturing Plant */}
      <group position={[0, 0, -8]}>
        {/* Concrete Main Plant Block */}
        <mesh position={[0, 1.8, 0]} castShadow receiveShadow>
          <boxGeometry args={[7.0, 3.6, 5.5]} />
          <meshStandardMaterial color="#64748b" roughness={0.8} />
        </mesh>
        {/* Corrugated Roof Accents */}
        <mesh position={[0, 3.7, 0]} castShadow>
          <boxGeometry args={[7.2, 0.25, 5.7]} />
          <meshStandardMaterial color="#334155" roughness={0.7} />
        </mesh>

        {/* 3 Industrial Smokestacks with Exhaust Pipes (Image 2 style) */}
        {[-1.8, 0, 1.8].map((sx, idx) => (
          <group key={`smoke-${idx}`} position={[sx, 3.8, -1.2]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.35, 0.5, 3.8, 16]} />
              <meshStandardMaterial color="#94a3b8" roughness={0.7} />
            </mesh>
            {/* Red Warning Band on Rim */}
            <mesh position={[0, 1.7, 0]}>
              <cylinderGeometry args={[0.36, 0.36, 0.35, 16]} />
              <meshStandardMaterial color="#ef4444" />
            </mesh>
          </group>
        ))}

        {/* Diagonal Intake Ventilation Duct Pipes */}
        {[-2.0, -0.6, 0.8, 2.2].map((dx, i) => (
          <mesh key={`duct-${i}`} position={[dx, 0.9, 2.9]} rotation={[0.4, 0, 0]} castShadow>
            <cylinderGeometry args={[0.22, 0.22, 2.2, 12]} />
            <meshStandardMaterial color="#475569" metalness={0.8} />
          </mesh>
        ))}
      </group>

      {/* Cargo Logistics Warehouse & Loading Docks */}
      <group position={[0, 0, 6]}>
        <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[8.0, 3.0, 4.8]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.5} />
        </mesh>
        {/* Sloped Corrugated Metal Roof */}
        <mesh position={[0, 3.2, 0]} rotation={[0, 0, 0.05]} castShadow>
          <boxGeometry args={[8.2, 0.4, 5.1]} />
          <meshStandardMaterial color="#0284c7" />
        </mesh>
        {/* Loading Bays */}
        {[-2.4, 0, 2.4].map((lx, i) => (
          <mesh key={`dock-${i}`} position={[lx, 0.9, 2.45]}>
            <boxGeometry args={[1.5, 1.8, 0.1]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
        ))}
      </group>

      {/* Shipping Container Stacks (Colorful Logistics Yard) */}
      <group position={[7, 0, -2]}>
        {/* Bottom Tier */}
        <mesh position={[0, 0.6, -1.5]} castShadow>
          <boxGeometry args={[1.6, 1.2, 4.0]} />
          <meshStandardMaterial color="#ef4444" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.6, 2.0]} castShadow>
          <boxGeometry args={[1.6, 1.2, 3.5]} />
          <meshStandardMaterial color="#0284c7" roughness={0.6} />
        </mesh>
        {/* Second Tier */}
        <mesh position={[0, 1.8, -0.5]} castShadow>
          <boxGeometry args={[1.6, 1.2, 3.8]} />
          <meshStandardMaterial color="#eab308" roughness={0.6} />
        </mesh>
        <mesh position={[0, 1.8, 3.0]} castShadow>
          <boxGeometry args={[1.6, 1.2, 2.5]} />
          <meshStandardMaterial color="#10b981" roughness={0.6} />
        </mesh>
        {/* Third Tier */}
        <mesh position={[0, 3.0, 0]} castShadow>
          <boxGeometry args={[1.6, 1.2, 3.0]} />
          <meshStandardMaterial color="#f97316" roughness={0.6} />
        </mesh>
      </group>
    </group>
  )
}

// -------------------------------------------------------------
// 3. RESIDENTIAL DISTRICT & TOWNHOUSES (South District, z > 18)
// Inspired directly by Image 6
// -------------------------------------------------------------
function ResidentialNeighborhood() {
  return (
    <group position={[0, 0, 28]}>
      {/* Apartment Complex A: Terracotta Hip Roof & Balconies */}
      <group position={[-11, 0, 0]}>
        <mesh position={[0, 1.8, 0]} castShadow receiveShadow>
          <boxGeometry args={[6.5, 3.6, 4.5]} />
          <meshStandardMaterial color="#fef08a" roughness={0.5} />
        </mesh>
        {/* Terracotta Orange Hip Roof (Exact match to Image 6) */}
        <mesh position={[0, 4.1, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <coneGeometry args={[4.8, 1.4, 4]} />
          <meshStandardMaterial color="#c2410c" roughness={0.6} />
        </mesh>
        {/* Front Balconies */}
        {[-1.8, 1.8].map((bx, i) => (
          <group key={`balc-a-${i}`} position={[bx, 2.0, 2.3]}>
            <mesh position={[0, 0, 0.3]} castShadow>
              <boxGeometry args={[1.4, 0.08, 0.6]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>
            <mesh position={[0, 0.25, 0.58]}>
              <boxGeometry args={[1.4, 0.45, 0.04]} />
              <meshStandardMaterial color="#1e3a8a" />
            </mesh>
          </group>
        ))}
      </group>

      {/* Apartment Complex B: Peach Stucco Courtyard Housing */}
      <group position={[0, 0, 4]}>
        <mesh position={[0, 2.0, 0]} castShadow receiveShadow>
          <boxGeometry args={[7.2, 4.0, 4.6]} />
          <meshStandardMaterial color="#fed7aa" roughness={0.5} />
        </mesh>
        <mesh position={[0, 4.5, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <coneGeometry args={[5.2, 1.5, 4]} />
          <meshStandardMaterial color="#ea580c" roughness={0.6} />
        </mesh>
        {/* Windows */}
        {[-2.2, -0.7, 0.7, 2.2].map((wx, idx) => (
          <group key={`win-b-${idx}`}>
            <mesh position={[wx, 1.4, 2.33]}>
              <boxGeometry args={[0.75, 0.9, 0.04]} />
              <meshPhysicalMaterial color="#38bdf8" transparent opacity={0.6} />
            </mesh>
            <mesh position={[wx, 2.8, 2.33]}>
              <boxGeometry args={[0.75, 0.9, 0.04]} />
              <meshPhysicalMaterial color="#38bdf8" transparent opacity={0.6} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Suburban Family Villas */}
      <group position={[12, 0, 0]}>
        <mesh position={[0, 1.4, 0]} castShadow receiveShadow>
          <boxGeometry args={[5.5, 2.8, 4.0]} />
          <meshStandardMaterial color="#fed7aa" roughness={0.5} />
        </mesh>
        <mesh position={[0, 3.2, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <coneGeometry args={[4.0, 1.3, 4]} />
          <meshStandardMaterial color="#9a3412" roughness={0.6} />
        </mesh>
        {/* Driveway Car */}
        <mesh position={[1.8, 0.22, 2.6]} castShadow>
          <boxGeometry args={[0.88, 0.22, 1.6]} />
          <meshStandardMaterial color="#0284c7" />
        </mesh>
      </group>
    </group>
  )
}

// -------------------------------------------------------------
// 4. WATERFRONT MARINA & ICONIC SPACE NEEDLE TOWER (West District, x < -18)
// Inspired directly by Image 6 left side
// -------------------------------------------------------------
function WaterfrontAndTower() {
  return (
    <group position={[-28, 0, 0]}>
      {/* THE ICONIC SPACE NEEDLE / OBSERVATION TOWER (Exact match to Image 6) */}
      <group position={[4, 0, 6]}>
        {/* Base Conical Pavilion */}
        <mesh position={[0, 0.8, 0]} castShadow>
          <cylinderGeometry args={[1.4, 2.2, 1.6, 24]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.3} metalness={0.4} />
        </mesh>
        {/* Tapered Yellow/Orange Tower Mast */}
        <mesh position={[0, 4.5, 0]} castShadow>
          <cylinderGeometry args={[0.3, 0.85, 6.5, 16]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Elevated Viewing Pod Disc (Blue Glass & Gold Trim) */}
        <mesh position={[0, 7.8, 0]} castShadow>
          <cylinderGeometry args={[1.9, 1.5, 1.2, 24]} />
          <meshPhysicalMaterial color="#0284c7" transparent opacity={0.7} roughness={0.1} metalness={0.5} />
        </mesh>
        <mesh position={[0, 8.45, 0]} castShadow>
          <cylinderGeometry args={[1.3, 1.95, 0.4, 24]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.8} />
        </mesh>
        {/* Golden Antenna Needle Spire */}
        <mesh position={[0, 10.2, 0]}>
          <cylinderGeometry args={[0.02, 0.08, 3.2, 8]} />
          <meshStandardMaterial color="#facc15" metalness={0.9} />
        </mesh>
      </group>

      {/* Marina Basin & Waterfront Boardwalk */}
      <group position={[-3, 0, -4]}>
        {/* Water Basin */}
        <mesh position={[0, 0.01, 0]}>
          <planeGeometry args={[10, 12]} />
          <meshPhysicalMaterial color="#06b6d4" transparent opacity={0.8} roughness={0.1} />
        </mesh>
        {/* Wooden Marina Pier Docks */}
        {[-2.5, 2.5].map((px, i) => (
          <mesh key={`pier-${i}`} position={[px, 0.08, 0]} receiveShadow>
            <boxGeometry args={[1.0, 0.14, 8.5]} />
            <meshStandardMaterial color="#854d0e" roughness={0.7} />
          </mesh>
        ))}
        {/* Small Yachts / Speedboats in Marina */}
        <mesh position={[-0.8, 0.16, 1.5]} castShadow>
          <boxGeometry args={[0.8, 0.28, 2.2]} />
          <meshStandardMaterial color="#ffffff" roughness={0.2} />
        </mesh>
        <mesh position={[0.8, 0.16, -1.8]} castShadow>
          <boxGeometry args={[0.8, 0.28, 2.2]} />
          <meshStandardMaterial color="#dc2626" roughness={0.2} />
        </mesh>
      </group>
    </group>
  )
}

// -------------------------------------------------------------
// 5. COLORFUL CITY PASSENGER TRAIN (Matching Image 5)
// -------------------------------------------------------------
function CityTrain() {
  const trainRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (trainRef.current) {
      // Gentle subtle train idle animation
      trainRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 3.0) * 0.015
    }
  })

  return (
    <group ref={trainRef} position={[-6.0, 0.22, -14.6]}>
      {/* Yellow Locomotive Engine */}
      <group position={[0, 0, 0]}>
        <mesh position={[0, 0.45, 0]} castShadow>
          <boxGeometry args={[2.4, 0.85, 0.8]} />
          <meshStandardMaterial color="#eab308" roughness={0.3} />
        </mesh>
        <mesh position={[-0.9, 0.35, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.38, 0.38, 0.7, 16]} />
          <meshStandardMaterial color="#ca8a04" />
        </mesh>
        <mesh position={[-0.8, 0.8, 0]}>
          <cylinderGeometry args={[0.08, 0.1, 0.35, 8]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        {/* Cabin Window */}
        <mesh position={[0.4, 0.55, 0.42]}>
          <boxGeometry args={[0.6, 0.35, 0.04]} />
          <meshPhysicalMaterial color="#38bdf8" transparent opacity={0.6} />
        </mesh>
      </group>

      {/* Red Passenger Carriage 1 */}
      <group position={[2.8, 0, 0]}>
        <mesh position={[0, 0.45, 0]} castShadow>
          <boxGeometry args={[2.2, 0.8, 0.8]} />
          <meshStandardMaterial color="#dc2626" roughness={0.4} />
        </mesh>
        {/* Windows */}
        {[-0.6, 0, 0.6].map((wx, i) => (
          <mesh key={`cw1-${i}`} position={[wx, 0.5, 0.42]}>
            <boxGeometry args={[0.35, 0.3, 0.04]} />
            <meshPhysicalMaterial color="#38bdf8" transparent opacity={0.6} />
          </mesh>
        ))}
      </group>

      {/* Red Passenger Carriage 2 */}
      <group position={[5.4, 0, 0]}>
        <mesh position={[0, 0.45, 0]} castShadow>
          <boxGeometry args={[2.2, 0.8, 0.8]} />
          <meshStandardMaterial color="#dc2626" roughness={0.4} />
        </mesh>
        {[-0.6, 0, 0.6].map((wx, i) => (
          <mesh key={`cw2-${i}`} position={[wx, 0.5, 0.42]}>
            <boxGeometry args={[0.35, 0.3, 0.04]} />
            <meshPhysicalMaterial color="#38bdf8" transparent opacity={0.6} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

// -------------------------------------------------------------
// 6. WATER CANAL WITH ANIMATED RIPPLES & STONE BRIDGES
// -------------------------------------------------------------
function WaterCanal() {
  const waterRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (waterRef.current) {
      const t = state.clock.getElapsedTime()
      waterRef.current.position.y = 0.02 + Math.sin(t * 1.2) * 0.005
    }
  })

  return (
    <group position={[0, 0, -12.5]}>
      {/* Canal Trench Excavation */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[110, 0.18, 2.6]} />
        <meshStandardMaterial color="#0e7490" roughness={0.9} />
      </mesh>

      {/* Sparkling Turquoise Water Surface */}
      <mesh ref={waterRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <planeGeometry args={[110, 2.4]} />
        <meshPhysicalMaterial
          color="#06b6d4"
          transparent
          opacity={0.85}
          roughness={0.08}
          metalness={0.2}
          reflectivity={0.9}
        />
      </mesh>

      {/* White Stone Embankment Retaining Walls */}
      <mesh position={[0, 0.1, -1.3]} receiveShadow>
        <boxGeometry args={[110, 0.28, 0.2]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.1, 1.3]} receiveShadow>
        <boxGeometry args={[110, 0.28, 0.2]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.5} />
      </mesh>

      {/* Road Bridge at x = 0 */}
      <group position={[0, 0.14, 0]}>
        <mesh receiveShadow castShadow>
          <boxGeometry args={[3.4, 0.32, 2.8]} />
          <meshStandardMaterial color="#334155" roughness={0.6} />
        </mesh>
        <mesh position={[-1.6, 0.26, 0]}>
          <boxGeometry args={[0.2, 0.28, 2.8]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[1.6, 0.26, 0]}>
          <boxGeometry args={[0.2, 0.28, 2.8]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      </group>
    </group>
  )
}

// -------------------------------------------------------------
// 7. RAILWAY TRACK (Parallel to Canal)
// -------------------------------------------------------------
function RailwayTrack() {
  return (
    <group position={[0, 0, -14.6]}>
      {/* Gravel Ballast Bed */}
      <mesh position={[0, 0.04, 0]} receiveShadow>
        <boxGeometry args={[110, 0.1, 1.4]} />
        <meshStandardMaterial color="#64748b" roughness={0.9} />
      </mesh>

      {/* Wooden Railway Ties */}
      {Array.from({ length: 90 }).map((_, i) => (
        <mesh key={`tie-${i}`} position={[-44 + i * 1.0, 0.1, 0]} castShadow>
          <boxGeometry args={[0.18, 0.06, 1.25]} />
          <meshStandardMaterial color="#78350f" roughness={0.9} />
        </mesh>
      ))}

      {/* Dual Shiny Steel Rails */}
      {[-0.38, 0.38].map((rz, i) => (
        <mesh key={`rail-${i}`} position={[0, 0.16, rz]}>
          <boxGeometry args={[110, 0.06, 0.06]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.9} roughness={0.2} />
        </mesh>
      ))}
    </group>
  )
}

// -------------------------------------------------------------
// 8. TROPICAL PALM TREE & DECIDUOUS SHADE TREES
// -------------------------------------------------------------
function PalmTree({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.45, 0]} rotation={[0.08, 0, -0.1]} castShadow>
        <cylinderGeometry args={[0.08, 0.14, 0.9, 8]} />
        <meshStandardMaterial color="#854d0e" roughness={0.9} />
      </mesh>
      <mesh position={[0.08, 1.25, 0]} rotation={[0.12, 0, -0.16]} castShadow>
        <cylinderGeometry args={[0.07, 0.09, 0.9, 8]} />
        <meshStandardMaterial color="#78350f" roughness={0.9} />
      </mesh>
      {[0, Math.PI / 3, (2 * Math.PI) / 3, Math.PI, (4 * Math.PI) / 3, (5 * Math.PI) / 3].map((ang, i) => (
        <group key={`frond-${i}`} position={[0.16, 1.7, 0]} rotation={[0.3, ang, 0.5]}>
          <mesh castShadow>
            <boxGeometry args={[0.75, 0.04, 0.22]} />
            <meshStandardMaterial color={i % 2 === 0 ? '#15803d' : '#22c55e'} roughness={0.7} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// -------------------------------------------------------------
// 9. POLISHED VEHICLES
// -------------------------------------------------------------
function PolishedCar({
  position,
  rotation = 0,
  bodyColor = '#3b82f6',
  isTaxi = false
}: {
  position: [number, number, number]
  rotation?: number
  bodyColor?: string
  isTaxi?: boolean
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.22, 0]} castShadow>
        <boxGeometry args={[0.92, 0.24, 1.8]} />
        <meshStandardMaterial color={isTaxi ? '#eab308' : bodyColor} roughness={0.2} metalness={0.3} />
      </mesh>
      <mesh position={[0, 0.46, -0.08]} castShadow>
        <boxGeometry args={[0.76, 0.26, 0.98]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.44, -0.08]}>
        <boxGeometry args={[0.8, 0.22, 0.92]} />
        <meshPhysicalMaterial color="#38bdf8" transparent opacity={0.5} roughness={0.1} />
      </mesh>
      {[-0.47, 0.47].map((wx, i) =>
        [-0.52, 0.52].map((wz, j) => (
          <mesh key={`${i}-${j}`} position={[wx, 0.13, wz]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.14, 0.14, 0.1, 16]} />
            <meshStandardMaterial color="#1e293b" roughness={0.9} />
          </mesh>
        ))
      )}
    </group>
  )
}

// -------------------------------------------------------------
// 10. STREET LAMPS
// -------------------------------------------------------------
function StreetLamp({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 1.4, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.05, 2.8, 8]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0.25, 2.75, 0]}>
        <boxGeometry args={[0.5, 0.08, 0.12]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} />
      </mesh>
      <mesh position={[0.42, 2.68, 0]}>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshStandardMaterial color="#fef08a" emissive="#fde047" emissiveIntensity={1.6} />
      </mesh>
      <pointLight position={[0.42, 2.5, 0]} intensity={1.8} distance={5.5} color="#fed7aa" />
    </group>
  )
}

// -------------------------------------------------------------
// MAIN METROPOLIS ENVIRONMENT EXPORT
// -------------------------------------------------------------
export const EnvironmentDecor: React.FC = () => {
  return (
    <group position={[0, 0, 0]}>
      {/* VAST SPRAWLING GREEN METROPOLIS GROUND (200 x 200) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#22c55e" roughness={0.8} />
      </mesh>

      {/* CENTRAL COMMERCIAL RETAIL DISTRICT SIDEWALK (Where Stores Live) */}
      <mesh position={[0, 0.015, 0]} receiveShadow>
        <boxGeometry args={[38, 0.03, 24]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.4} />
      </mesh>

      {/* SPRAWLING ROAD NETWORK CONNECTING ALL DISTRICTS */}
      {/* Main East-West Highway (z = 0) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} receiveShadow>
        <planeGeometry args={[120, 2.8]} />
        <meshStandardMaterial color="#334155" roughness={0.6} />
      </mesh>
      {/* Main North-South Boulevard (x = 0) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.032, 0]} receiveShadow>
        <planeGeometry args={[2.8, 120]} />
        <meshStandardMaterial color="#334155" roughness={0.6} />
      </mesh>

      {/* Outer Ring Boulevard (North z = -20) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, -20]} receiveShadow>
        <planeGeometry args={[100, 2.4]} />
        <meshStandardMaterial color="#334155" roughness={0.6} />
      </mesh>
      {/* Outer Ring Boulevard (South z = 20) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 20]} receiveShadow>
        <planeGeometry args={[100, 2.4]} />
        <meshStandardMaterial color="#334155" roughness={0.6} />
      </mesh>
      {/* Outer Ring Boulevard (East x = 20) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[20, 0.03, 0]} receiveShadow>
        <planeGeometry args={[2.4, 100]} />
        <meshStandardMaterial color="#334155" roughness={0.6} />
      </mesh>
      {/* Outer Ring Boulevard (West x = -20) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-20, 0.03, 0]} receiveShadow>
        <planeGeometry args={[2.4, 100]} />
        <meshStandardMaterial color="#334155" roughness={0.6} />
      </mesh>

      {/* Dashed Centerlines on Main Roads */}
      {Array.from({ length: 30 }).map((_, i) => (
        <mesh
          key={`h-dash-${i}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[-42 + i * 2.8, 0.035, 0]}
        >
          <planeGeometry args={[1.4, 0.14]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      ))}
      {Array.from({ length: 30 }).map((_, i) => (
        <mesh
          key={`v-dash-${i}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.036, -42 + i * 2.8]}
        >
          <planeGeometry args={[0.14, 1.4]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      ))}

      {/* CANAL & RAILWAY INFRASTRUCTURE */}
      <WaterCanal />
      <RailwayTrack />
      <CityTrain />

      {/* THE 4 SURROUNDING CITY DISTRICTS */}
      <DowntownSkyline />
      <IndustrialSector />
      <ResidentialNeighborhood />
      <WaterfrontAndTower />

      {/* TROPICAL PALM TREES & BOULEVARD SHADE TREES */}
      {[-18, -12, -6, 6, 12, 18].map((tx, i) => (
        <React.Fragment key={`palms-h-${i}`}>
          <PalmTree position={[tx, 0, -2.4]} />
          <PalmTree position={[tx, 0, 2.4]} />
        </React.Fragment>
      ))}
      {[-18, -12, -6, 6, 12, 18].map((tz, i) => (
        <React.Fragment key={`palms-v-${i}`}>
          <PalmTree position={[-2.4, 0, tz]} />
          <PalmTree position={[2.4, 0, tz]} />
        </React.Fragment>
      ))}

      {/* STREET LAMPS AT INTERSECTIONS */}
      <StreetLamp position={[-2.2, 0, -2.2]} rotation={Math.PI / 4} />
      <StreetLamp position={[2.2, 0, -2.2]} rotation={-Math.PI / 4} />
      <StreetLamp position={[-2.2, 0, 2.2]} rotation={(3 * Math.PI) / 4} />
      <StreetLamp position={[2.2, 0, 2.2]} rotation={(-3 * Math.PI) / 4} />
      <StreetLamp position={[-18.5, 0, -2.2]} rotation={Math.PI / 4} />
      <StreetLamp position={[18.5, 0, -2.2]} rotation={-Math.PI / 4} />
      <StreetLamp position={[-18.5, 0, 2.2]} rotation={(3 * Math.PI) / 4} />
      <StreetLamp position={[18.5, 0, 2.2]} rotation={(-3 * Math.PI) / 4} />

      {/* TRAFFIC & CARS ACROSS THE CITY */}
      <PolishedCar position={[-8.5, 0, -0.65]} rotation={Math.PI / 2} bodyColor="#3b82f6" />
      <PolishedCar position={[7.5, 0, 0.65]} rotation={-Math.PI / 2} isTaxi={true} />
      <PolishedCar position={[-0.65, 0, 7.5]} rotation={0} bodyColor="#ef4444" />
      <PolishedCar position={[0.65, 0, -7.5]} rotation={Math.PI} bodyColor="#10b981" />
      <PolishedCar position={[-20, 0, 8.5]} rotation={0} bodyColor="#f59e0b" />
      <PolishedCar position={[20, 0, -8.5]} rotation={Math.PI} bodyColor="#6366f1" />
      <PolishedCar position={[28, 0, 1.2]} rotation={-Math.PI / 2} bodyColor="#f97316" />
      <PolishedCar position={[-28, 0, -1.2]} rotation={Math.PI / 2} bodyColor="#06b6d4" />
    </group>
  )
}

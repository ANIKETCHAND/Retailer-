/**
 * RetailVision - AAA Metropolis Environment & Urban Infrastructure
 * Features:
 *  - Animated traffic (vehicles smoothly cruising along road networks in lanes)
 *  - Traffic signals & illuminated street fixtures
 *  - Day & Night mode lighting adaptation
 *  - Railway track with active train
 *  - Water canal with bridges & safety handrails
 *  - Surrounding city districts (Downtown skyline, Industrial factory, Residential villas, Space Needle tower)
 */

import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { TimeOfDay } from '../../types'
import { createAsphaltTexture, createGrassTexture, createPaverTexture } from './textures'

interface EnvironmentDecorProps {
  timeOfDay?: TimeOfDay
}

// -------------------------------------------------------------
// 1. ANIMATED MOVING VEHICLE (Smoothly drives along a traffic lane)
// -------------------------------------------------------------
function MovingTrafficCar({
  axis,
  laneOffset,
  direction,
  speed = 4.5,
  bodyColor = '#3b82f6',
  isTaxi = false,
  isNight = false
}: {
  axis: 'x' | 'z'
  laneOffset: number
  direction: 1 | -1
  speed?: number
  bodyColor?: string
  isTaxi?: boolean
  isNight?: boolean
}) {
  const carRef = useRef<THREE.Group>(null)
  const posRef = useRef<number>((Math.random() - 0.5) * 60)

  useFrame((_, delta) => {
    if (carRef.current) {
      posRef.current += speed * direction * delta
      if (direction === 1 && posRef.current > 48) {
        posRef.current = -48
      } else if (direction === -1 && posRef.current < -48) {
        posRef.current = 48
      }

      if (axis === 'x') {
        carRef.current.position.set(posRef.current, 0, laneOffset)
      } else {
        carRef.current.position.set(laneOffset, 0, posRef.current)
      }
    }
  })

  const rotationY = axis === 'x' ? (direction === 1 ? -Math.PI / 2 : Math.PI / 2) : (direction === 1 ? 0 : Math.PI)

  return (
    <group ref={carRef} rotation={[0, rotationY, 0]}>
      {/* Chassis */}
      <mesh position={[0, 0.22, 0]} castShadow>
        <boxGeometry args={[0.92, 0.24, 1.8]} />
        <meshStandardMaterial color={isTaxi ? '#eab308' : bodyColor} roughness={0.2} metalness={0.4} />
      </mesh>
      {/* Cabin Roof */}
      <mesh position={[0, 0.46, -0.08]} castShadow>
        <boxGeometry args={[0.76, 0.26, 0.98]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.2} />
      </mesh>
      {/* Windows */}
      <mesh position={[0, 0.44, -0.08]}>
        <boxGeometry args={[0.8, 0.22, 0.92]} />
        <meshPhysicalMaterial color="#38bdf8" transparent opacity={0.6} roughness={0.1} />
      </mesh>
      {/* Headlights (Radiating forward beam at night) */}
      {[-0.32, 0.32].map((hx, i) => (
        <group key={`hl-${i}`} position={[hx, 0.22, 0.9]}>
          <mesh>
            <boxGeometry args={[0.16, 0.08, 0.02]} />
            <meshStandardMaterial color="#fef08a" emissive="#fef08a" emissiveIntensity={isNight ? 2.5 : 1.0} />
          </mesh>
          {isNight && (
            <pointLight position={[0, 0, 0.4]} intensity={1.5} distance={3.5} color="#fef08a" />
          )}
        </group>
      ))}
      {/* Taillights */}
      {[-0.32, 0.32].map((tx, i) => (
        <mesh key={`tl-${tx}-${i}`} position={[tx, 0.22, -0.9]}>
          <boxGeometry args={[0.16, 0.08, 0.02]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={isNight ? 2.0 : 0.8} />
        </mesh>
      ))}
      {/* Wheels */}
      {[-0.47, 0.47].map((wx, i) =>
        [-0.52, 0.52].map((wz, j) => (
          <mesh key={`w-${i}-${j}`} position={[wx, 0.13, wz]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.14, 0.14, 0.1, 16]} />
            <meshStandardMaterial color="#1e293b" roughness={0.9} />
          </mesh>
        ))
      )}
    </group>
  )
}

// -------------------------------------------------------------
// 2. TRAFFIC SIGNAL POST (At Intersection Corners)
// -------------------------------------------------------------
function TrafficSignalPost({ position, rotation = 0, isNight = false }: { position: [number, number, number]; rotation?: number; isNight?: boolean }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Pole */}
      <mesh position={[0, 1.6, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.06, 3.2, 8]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} />
      </mesh>
      {/* Signal Housing */}
      <mesh position={[0, 2.6, 0.12]} castShadow>
        <boxGeometry args={[0.26, 0.75, 0.18]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      {/* Lenses: Red, Amber, Green */}
      <mesh position={[0, 2.8, 0.22]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={isNight ? 1.5 : 0.6} />
      </mesh>
      <mesh position={[0, 2.6, 0.22]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshStandardMaterial color="#eab308" emissive="#eab308" emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[0, 2.4, 0.22]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={isNight ? 1.8 : 0.8} />
      </mesh>
    </group>
  )
}

// -------------------------------------------------------------
// 3. STREET LIGHT FIXTURE (With Night Volumetric Light)
// -------------------------------------------------------------
function StreetLamp({ position, rotation = 0, isNight = false }: { position: [number, number, number]; rotation?: number; isNight?: boolean }) {
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
        <meshStandardMaterial color="#fef08a" emissive="#fde047" emissiveIntensity={isNight ? 2.5 : 0.8} />
      </mesh>
      {/* Illuminated Cone of Warm Light at Night */}
      {isNight && (
        <pointLight position={[0.42, 2.4, 0]} intensity={2.8} distance={7.0} color="#fde047" />
      )}
    </group>
  )
}

// -------------------------------------------------------------
// 4. WATER CANAL WITH ANIMATED RIPPLES & STONE BRIDGE
// -------------------------------------------------------------
function WaterCanal({ isNight = false }: { isNight?: boolean }) {
  const waterRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (waterRef.current) {
      waterRef.current.position.y = 0.02 + Math.sin(state.clock.getElapsedTime() * 1.4) * 0.006
    }
  })

  return (
    <group position={[0, 0, -12.5]}>
      {/* Canal Trench Excavation */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[120, 0.18, 2.6]} />
        <meshStandardMaterial color="#0e7490" roughness={0.9} />
      </mesh>

      {/* Shimmering Turquoise Water */}
      <mesh ref={waterRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <planeGeometry args={[120, 2.4]} />
        <meshPhysicalMaterial
          color={isNight ? '#083344' : '#06b6d4'}
          transparent
          opacity={0.88}
          roughness={0.08}
          metalness={0.2}
          reflectivity={0.9}
        />
      </mesh>

      {/* White Stone Embankments & Railings */}
      {[-1.3, 1.3].map((rz, i) => (
        <group key={`embankment-${i}`} position={[0, 0.1, rz]}>
          <mesh receiveShadow>
            <boxGeometry args={[120, 0.28, 0.2]} />
            <meshStandardMaterial color="#f1f5f9" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.22, 0]}>
            <boxGeometry args={[120, 0.04, 0.04]} />
            <meshStandardMaterial color="#ffffff" metalness={0.8} />
          </mesh>
        </group>
      ))}

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
// 5. RAILWAY LINE & CITY TRAIN
// -------------------------------------------------------------
function RailwayAndTrain() {
  const trainRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (trainRef.current) {
      trainRef.current.position.y = 0.22 + Math.sin(state.clock.getElapsedTime() * 3.0) * 0.015
    }
  })

  return (
    <group position={[0, 0, -14.6]}>
      {/* Ballast Bed */}
      <mesh position={[0, 0.04, 0]} receiveShadow>
        <boxGeometry args={[120, 0.1, 1.4]} />
        <meshStandardMaterial color="#64748b" roughness={0.9} />
      </mesh>

      {/* Ties */}
      {Array.from({ length: 90 }).map((_, i) => (
        <mesh key={`tie-${i}`} position={[-44 + i * 1.0, 0.1, 0]} castShadow>
          <boxGeometry args={[0.18, 0.06, 1.25]} />
          <meshStandardMaterial color="#78350f" roughness={0.9} />
        </mesh>
      ))}

      {/* Shiny Steel Rails */}
      {[-0.38, 0.38].map((rz, i) => (
        <mesh key={`rail-${i}`} position={[0, 0.16, rz]}>
          <boxGeometry args={[120, 0.06, 0.06]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.9} roughness={0.2} />
        </mesh>
      ))}

      {/* City Passenger Train (Yellow Locomotive + 2 Red Coaches) */}
      <group ref={trainRef} position={[-6.0, 0.22, 0]}>
        <mesh position={[0, 0.45, 0]} castShadow>
          <boxGeometry args={[2.4, 0.85, 0.8]} />
          <meshStandardMaterial color="#eab308" roughness={0.3} />
        </mesh>
        <mesh position={[-0.9, 0.35, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.38, 0.38, 0.7, 16]} />
          <meshStandardMaterial color="#ca8a04" />
        </mesh>
        {/* Carriage 1 */}
        <mesh position={[2.8, 0.45, 0]} castShadow>
          <boxGeometry args={[2.2, 0.8, 0.8]} />
          <meshStandardMaterial color="#dc2626" roughness={0.4} />
        </mesh>
        {/* Carriage 2 */}
        <mesh position={[5.4, 0.45, 0]} castShadow>
          <boxGeometry args={[2.2, 0.8, 0.8]} />
          <meshStandardMaterial color="#dc2626" roughness={0.4} />
        </mesh>
      </group>
    </group>
  )
}

// -------------------------------------------------------------
// 6. DOWNTOWN FINANCIAL TOWERS (North Skyline)
// -------------------------------------------------------------
function DowntownSkyline({ isNight = false }: { isNight?: boolean }) {
  return (
    <group position={[0, 0, -28]}>
      {/* Supertall Apex Tower */}
      <group position={[-12, 0, -6]}>
        <mesh position={[0, 5.0, 0]} castShadow receiveShadow>
          <boxGeometry args={[4.2, 10.0, 4.2]} />
          <meshPhysicalMaterial
            color={isNight ? '#0369a1' : '#0284c7'}
            transparent
            opacity={0.7}
            roughness={0.1}
            metalness={0.4}
          />
        </mesh>
        <mesh position={[0, 10.5, 0]} castShadow>
          <boxGeometry args={[3.2, 1.0, 3.2]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        <mesh position={[0, 12.2, 0]}>
          <cylinderGeometry args={[0.04, 0.1, 2.4, 8]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.9} />
        </mesh>
      </group>

      {/* Granite Corporate Center with Helipad */}
      <group position={[-4, 0, -8]}>
        <mesh position={[0, 6.0, 0]} castShadow receiveShadow>
          <boxGeometry args={[5.0, 12.0, 4.5]} />
          <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.6} />
        </mesh>
        {/* Glowing Office Windows at Night */}
        {Array.from({ length: 6 }).map((_, i) => (
          <mesh key={`win-${i}`} position={[0, 2.0 + i * 1.8, 2.3]}>
            <boxGeometry args={[4.4, 0.8, 0.04]} />
            <meshStandardMaterial
              color="#38bdf8"
              emissive="#fef08a"
              emissiveIntensity={isNight ? 1.0 : 0.1}
            />
          </mesh>
        ))}
      </group>

      {/* Stepped Art-Deco High-Rise */}
      <group position={[5, 0, -7]}>
        <mesh position={[0, 3.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[4.8, 7.0, 4.4]} />
          <meshStandardMaterial color="#0f766e" roughness={0.4} />
        </mesh>
        <mesh position={[0, 8.0, 0]} castShadow>
          <boxGeometry args={[3.6, 2.5, 3.4]} />
          <meshStandardMaterial color="#115e59" roughness={0.4} />
        </mesh>
      </group>

      {/* Modern Twin Glass Towers */}
      <group position={[14, 0, -6]}>
        <mesh position={[-1.6, 5.0, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.2, 10.0, 3.0]} />
          <meshPhysicalMaterial color="#0284c7" transparent opacity={0.6} />
        </mesh>
        <mesh position={[1.6, 5.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.2, 11.0, 3.0]} />
          <meshPhysicalMaterial color="#0284c7" transparent opacity={0.6} />
        </mesh>
      </group>
    </group>
  )
}

// -------------------------------------------------------------
// 7. INDUSTRIAL & MANUFACTURING SECTOR (East District)
// -------------------------------------------------------------
function IndustrialSector({ isNight = false }: { isNight?: boolean }) {
  return (
    <group position={[28, 0, 0]}>
      {/* Factory with 3 Smokestacks */}
      <group position={[0, 0, -8]}>
        <mesh position={[0, 1.8, 0]} castShadow receiveShadow>
          <boxGeometry args={[7.0, 3.6, 5.5]} />
          <meshStandardMaterial color="#64748b" roughness={0.8} />
        </mesh>
        {[-1.8, 0, 1.8].map((sx, idx) => (
          <group key={`sm-${idx}`} position={[sx, 3.8, -1.2]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.35, 0.5, 3.8, 16]} />
              <meshStandardMaterial color="#94a3b8" roughness={0.7} />
            </mesh>
            <mesh position={[0, 1.7, 0]}>
              <cylinderGeometry args={[0.36, 0.36, 0.35, 16]} />
              <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={isNight ? 1.0 : 0.3} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Cargo Logistics Warehouse */}
      <mesh position={[0, 1.5, 6]} castShadow receiveShadow>
        <boxGeometry args={[8.0, 3.0, 4.8]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.5} />
      </mesh>

      {/* Shipping Containers */}
      <group position={[7, 0, -2]}>
        <mesh position={[0, 0.6, -1.5]} castShadow>
          <boxGeometry args={[1.6, 1.2, 4.0]} />
          <meshStandardMaterial color="#ef4444" />
        </mesh>
        <mesh position={[0, 0.6, 2.0]} castShadow>
          <boxGeometry args={[1.6, 1.2, 3.5]} />
          <meshStandardMaterial color="#0284c7" />
        </mesh>
      </group>
    </group>
  )
}

// -------------------------------------------------------------
// 8. RESIDENTIAL TOWNHOUSES & SUBURBIA (South District)
// -------------------------------------------------------------
function ResidentialNeighborhood({ isNight = false }: { isNight?: boolean }) {
  return (
    <group position={[0, 0, 28]}>
      {/* Apartment Complex A */}
      <group position={[-11, 0, 0]}>
        <mesh position={[0, 1.8, 0]} castShadow receiveShadow>
          <boxGeometry args={[6.5, 3.6, 4.5]} />
          <meshStandardMaterial color="#fef08a" roughness={0.5} />
        </mesh>
        <mesh position={[0, 4.1, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <coneGeometry args={[4.8, 1.4, 4]} />
          <meshStandardMaterial color="#c2410c" roughness={0.6} />
        </mesh>
      </group>

      {/* Apartment Complex B */}
      <group position={[0, 0, 4]}>
        <mesh position={[0, 2.0, 0]} castShadow receiveShadow>
          <boxGeometry args={[7.2, 4.0, 4.6]} />
          <meshStandardMaterial color="#fed7aa" roughness={0.5} />
        </mesh>
        <mesh position={[0, 4.5, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <coneGeometry args={[5.2, 1.5, 4]} />
          <meshStandardMaterial color="#ea580c" roughness={0.6} />
        </mesh>
        {/* Warm Window Glow at Night */}
        {isNight && (
          <pointLight position={[0, 2.2, 2.4]} intensity={2.0} distance={5} color="#fef08a" />
        )}
      </group>
    </group>
  )
}

// -------------------------------------------------------------
// 9. WATERFRONT & SPACE NEEDLE TOWER (West District)
// -------------------------------------------------------------
function WaterfrontAndTower({ isNight = false }: { isNight?: boolean }) {
  return (
    <group position={[-28, 0, 0]}>
      {/* Space Needle Observation Tower */}
      <group position={[4, 0, 6]}>
        <mesh position={[0, 0.8, 0]} castShadow>
          <cylinderGeometry args={[1.4, 2.2, 1.6, 24]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.3} />
        </mesh>
        <mesh position={[0, 4.5, 0]} castShadow>
          <cylinderGeometry args={[0.3, 0.85, 6.5, 16]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.7} />
        </mesh>
        {/* Viewing Pod Disc */}
        <mesh position={[0, 7.8, 0]} castShadow>
          <cylinderGeometry args={[1.9, 1.5, 1.2, 24]} />
          <meshPhysicalMaterial
            color="#0284c7"
            emissive={isNight ? '#38bdf8' : '#000000'}
            emissiveIntensity={isNight ? 1.2 : 0}
            transparent
            opacity={0.7}
          />
        </mesh>
        <mesh position={[0, 10.2, 0]}>
          <cylinderGeometry args={[0.02, 0.08, 3.2, 8]} />
          <meshStandardMaterial color="#facc15" metalness={0.9} />
        </mesh>
      </group>
    </group>
  )
}

// -------------------------------------------------------------
// 10. TROPICAL PALM TREE
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
// MAIN ENVIRONMENT DECORATION COMPONENT
// -------------------------------------------------------------
export const EnvironmentDecor: React.FC<EnvironmentDecorProps> = ({ timeOfDay = 'day' }) => {
  const isNight = timeOfDay === 'night'
  const grassTexture = useMemo(() => createGrassTexture(), [])
  const asphaltTexture = useMemo(() => createAsphaltTexture(), [])
  const paverTexture = useMemo(() => createPaverTexture(), [])

  return (
    <group position={[0, 0, 0]}>
      {/* VAST SPRAWLING GREEN GROUND WITH NATURAL LAWN TURF */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial
          map={grassTexture}
          roughness={0.8}
          color={isNight ? '#064e3b' : '#ffffff'}
        />
      </mesh>

      {/* CENTRAL COMMERCIAL RETAIL DISTRICT SIDEWALK */}
      <mesh position={[0, 0.015, 0]} receiveShadow>
        <boxGeometry args={[38, 0.03, 24]} />
        <meshStandardMaterial
          map={paverTexture}
          roughness={0.5}
          color={isNight ? '#475569' : '#ffffff'}
        />
      </mesh>

      {/* ROAD NETWORK WITH CHARCOAL AGGREGATE ASPHALT */}
      {/* Main East-West Highway (z = 0) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} receiveShadow>
        <planeGeometry args={[120, 2.8]} />
        <meshStandardMaterial
          map={asphaltTexture}
          roughness={0.6}
          color={isNight ? '#1e293b' : '#ffffff'}
        />
      </mesh>
      {/* Main North-South Boulevard (x = 0) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.032, 0]} receiveShadow>
        <planeGeometry args={[2.8, 120]} />
        <meshStandardMaterial
          map={asphaltTexture}
          roughness={0.6}
          color={isNight ? '#1e293b' : '#ffffff'}
        />
      </mesh>

      {/* Outer Ring Boulevards */}
      {[-20, 20].map((rz, i) => (
        <mesh key={`ring-z-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, rz]} receiveShadow>
          <planeGeometry args={[100, 2.4]} />
          <meshStandardMaterial map={asphaltTexture} roughness={0.6} color={isNight ? '#1e293b' : '#ffffff'} />
        </mesh>
      ))}
      {[-20, 20].map((rx, i) => (
        <mesh key={`ring-x-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[rx, 0.03, 0]} receiveShadow>
          <planeGeometry args={[2.4, 100]} />
          <meshStandardMaterial map={asphaltTexture} roughness={0.6} color={isNight ? '#1e293b' : '#ffffff'} />
        </mesh>
      ))}

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
      <WaterCanal isNight={isNight} />
      <RailwayAndTrain />

      {/* THE 4 SURROUNDING CITY DISTRICTS */}
      <DowntownSkyline isNight={isNight} />
      <IndustrialSector isNight={isNight} />
      <ResidentialNeighborhood isNight={isNight} />
      <WaterfrontAndTower isNight={isNight} />

      {/* TROPICAL PALM TREES */}
      {[-18, -12, -6, 6, 12, 18].map((tx, i) => (
        <React.Fragment key={`palms-h-${i}`}>
          <PalmTree position={[tx, 0, -2.4]} />
          <PalmTree position={[tx, 0, 2.4]} />
        </React.Fragment>
      ))}

      {/* STREET LAMPS AT INTERSECTIONS (Active warm lighting at night) */}
      <StreetLamp position={[-2.2, 0, -2.2]} rotation={Math.PI / 4} isNight={isNight} />
      <StreetLamp position={[2.2, 0, -2.2]} rotation={-Math.PI / 4} isNight={isNight} />
      <StreetLamp position={[-2.2, 0, 2.2]} rotation={(3 * Math.PI) / 4} isNight={isNight} />
      <StreetLamp position={[2.2, 0, 2.2]} rotation={(-3 * Math.PI) / 4} isNight={isNight} />
      <StreetLamp position={[-18.5, 0, -2.2]} rotation={Math.PI / 4} isNight={isNight} />
      <StreetLamp position={[18.5, 0, -2.2]} rotation={-Math.PI / 4} isNight={isNight} />

      {/* TRAFFIC SIGNALS AT CENTRAL INTERSECTION */}
      <TrafficSignalPost position={[-1.6, 0, -1.6]} rotation={Math.PI / 4} isNight={isNight} />
      <TrafficSignalPost position={[1.6, 0, 1.6]} rotation={(-3 * Math.PI) / 4} isNight={isNight} />

      {/* ANIMATED MOVING VEHICLES IN TRAFFIC LANES */}
      <MovingTrafficCar axis="x" laneOffset={0.65} direction={1} speed={5.2} bodyColor="#3b82f6" isNight={isNight} />
      <MovingTrafficCar axis="x" laneOffset={-0.65} direction={-1} speed={4.8} isTaxi={true} isNight={isNight} />
      <MovingTrafficCar axis="z" laneOffset={-0.65} direction={1} speed={5.0} bodyColor="#ef4444" isNight={isNight} />
      <MovingTrafficCar axis="z" laneOffset={0.65} direction={-1} speed={4.6} bodyColor="#10b981" isNight={isNight} />
    </group>
  )
}

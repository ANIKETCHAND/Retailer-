/**
 * RetailVision - AAA Tropical Metropolis & Island Archipelago
 * Complete City Expansion inspired by Tropic City Construction Game & City Island:
 *  - Island Base (128x128) surrounded by Golden Sand Beaches, Turquoise Lagoon & Vast Ocean (1200x1200)
 *  - District 1: Downtown Financial Metropolis (15+ Skyscraper Towers, Corporate Plazas, City Hall, Art Museum)
 *  - District 2: Coastal International Airport & Tarmac (Runway, Passenger Terminal, Control Tower, Airplanes)
 *  - District 3: Oceanfront Marina, Coastal Lighthouse & Pier with Rotating Ferris Wheel
 *  - District 4: Paradise Residential Suburbs (18+ Modernist Villas, Terracotta Cottages, Pools, School)
 *  - District 5: Commercial Hub, Gas Station, Supermarket Plaza & Cineplex Theater
 *  - District 6: Cargo Container Port (Gantry Crane, 30+ Shipping Containers, Warehouses, Fuel Tanks)
 *  - District 7: Green Clean Energy Park (4 Rotating Wind Turbines & Photovoltaic Solar Farm)
 *  - District 8: Sports Arena, Civic Hospital & Central Botanical Gardens with Three-Tier Fountain
 *  - Comprehensive Interconnected City Road Grid with 16 Animated Vehicles (Taxis, Buses, Sedans, Vans)
 *  - Island Express Railway Train & Coastal Ocean Watercraft
 *  - Full Day / Night Lighting & Visual Atmosphere
 */

import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { Store, TimeOfDay } from '../../types'
import { getActiveDistricts } from '../../lib/proceduralLayout'
import { createAsphaltTexture, createGrassTexture, createPaverTexture } from './textures'

interface EnvironmentDecorProps {
  timeOfDay?: TimeOfDay
  stores?: Store[]
}

// -------------------------------------------------------------
// 1. ANIMATED LIVING TRAFFIC VEHICLE
// -------------------------------------------------------------
type VehicleType = 'sedan' | 'taxi' | 'sports' | 'van' | 'bus' | 'truck'

function MovingTrafficVehicle({
  axis,
  laneOffset,
  direction,
  speed = 5.0,
  vehicleType = 'sedan',
  bodyColor = '#3b82f6',
  range = 56,
  isNight = false
}: {
  axis: 'x' | 'z'
  laneOffset: number
  direction: 1 | -1
  speed?: number
  vehicleType?: VehicleType
  bodyColor?: string
  range?: number
  isNight?: boolean
}) {
  const vehicleRef = useRef<THREE.Group>(null)
  const posRef = useRef<number>((Math.random() - 0.5) * range * 1.8)

  useFrame((_, delta) => {
    if (vehicleRef.current) {
      posRef.current += speed * direction * delta
      if (direction === 1 && posRef.current > range) {
        posRef.current = -range
      } else if (direction === -1 && posRef.current < -range) {
        posRef.current = range
      }

      if (axis === 'x') {
        vehicleRef.current.position.set(posRef.current, 0.02, laneOffset)
      } else {
        vehicleRef.current.position.set(laneOffset, 0.02, posRef.current)
      }
    }
  })

  const rotationY = axis === 'x' ? (direction === 1 ? -Math.PI / 2 : Math.PI / 2) : (direction === 1 ? 0 : Math.PI)
  const isBus = vehicleType === 'bus'
  const isVan = vehicleType === 'van'
  const isTruck = vehicleType === 'truck'
  const length = isBus ? 3.6 : isTruck ? 3.2 : isVan ? 2.4 : 1.8
  const width = isBus ? 1.05 : 0.92
  const height = isBus ? 0.95 : isTruck ? 1.1 : isVan ? 0.75 : 0.48

  return (
    <group ref={vehicleRef} rotation={[0, rotationY, 0]}>
      {/* Chassis Body */}
      <mesh position={[0, height / 2 + 0.1, 0]} castShadow>
        <boxGeometry args={[width, height * 0.5, length]} />
        <meshStandardMaterial
          color={vehicleType === 'taxi' ? '#eab308' : bodyColor}
          roughness={0.25}
          metalness={0.4}
        />
      </mesh>

      {/* Cabin / Upper Structure */}
      <mesh position={[0, height * 0.8 + 0.08, isBus ? 0 : -0.1]} castShadow>
        <boxGeometry args={[width * 0.85, height * 0.5, isBus ? length * 0.92 : length * 0.52]} />
        <meshStandardMaterial color={isBus ? '#0284c7' : isVan ? '#f8fafc' : isTruck ? '#e2e8f0' : '#0f172a'} roughness={0.3} />
      </mesh>

      {/* Tinted Windows */}
      <mesh position={[0, height * 0.78 + 0.08, isBus ? 0 : -0.1]}>
        <boxGeometry args={[width * 0.89, height * 0.38, isBus ? length * 0.94 : length * 0.48]} />
        <meshPhysicalMaterial color="#38bdf8" transparent opacity={0.65} roughness={0.1} />
      </mesh>

      {/* Taxi Roof Sign */}
      {vehicleType === 'taxi' && (
        <mesh position={[0, height + 0.2, 0]}>
          <boxGeometry args={[0.3, 0.1, 0.2]} />
          <meshStandardMaterial color="#fef08a" emissive="#eab308" emissiveIntensity={isNight ? 1.5 : 0.4} />
        </mesh>
      )}

      {/* Headlights */}
      {[-width * 0.35, width * 0.35].map((hx, i) => (
        <group key={`hl-${i}`} position={[hx, 0.22, length * 0.5]}>
          <mesh>
            <boxGeometry args={[0.16, 0.08, 0.02]} />
            <meshStandardMaterial color="#fef08a" emissive="#fef08a" emissiveIntensity={isNight ? 2.5 : 1.0} />
          </mesh>
          {isNight && (
            <pointLight position={[0, 0, 0.5]} intensity={1.6} distance={4.5} color="#fef08a" />
          )}
        </group>
      ))}

      {/* Taillights */}
      {[-width * 0.35, width * 0.35].map((tx, i) => (
        <mesh key={`tl-${i}`} position={[tx, 0.22, -length * 0.5]}>
          <boxGeometry args={[0.16, 0.08, 0.02]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={isNight ? 2.2 : 0.8} />
        </mesh>
      ))}

      {/* Wheels */}
      {[-width * 0.51, width * 0.51].map((wx, i) =>
        [-length * 0.32, length * 0.32].map((wz, j) => (
          <mesh key={`whl-${i}-${j}`} position={[wx, 0.13, wz]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.14, 0.14, 0.1, 16]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} />
          </mesh>
        ))
      )}
    </group>
  )
}

// -------------------------------------------------------------
// 2. OCEAN WATERCRAFT (Bobbing in the Tropical Bay)
// -------------------------------------------------------------
function BobbingBoat({
  position,
  type = 'yacht',
  color = '#ffffff',
  rotation = 0
}: {
  position: [number, number, number]
  type?: 'yacht' | 'sailboat' | 'speedboat' | 'cruiser'
  color?: string
  rotation?: number
}) {
  const boatRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (boatRef.current) {
      const t = state.clock.getElapsedTime() + position[0] * 0.5
      boatRef.current.position.y = position[1] + Math.sin(t * 1.4) * 0.08
      boatRef.current.rotation.z = Math.sin(t * 1.2) * 0.03
      boatRef.current.rotation.x = Math.cos(t * 1.0) * 0.02
    }
  })

  const isCruiser = type === 'cruiser'
  const hullLength = isCruiser ? 18.0 : 4.0
  const hullWidth = isCruiser ? 4.5 : 1.5
  const hullHeight = isCruiser ? 2.4 : 0.5

  return (
    <group ref={boatRef} position={position} rotation={[0, rotation, 0]}>
      {/* Hull */}
      <mesh position={[0, hullHeight / 2, 0]} castShadow>
        <boxGeometry args={[hullWidth, hullHeight, hullLength]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.2} />
      </mesh>
      {/* Bow Taper */}
      <mesh position={[0, hullHeight / 2 + 0.05, hullLength / 2 + 0.6]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[hullWidth * 0.5, 1.4, 4]} />
        <meshStandardMaterial color={color} roughness={0.3} />
      </mesh>

      {/* Superstructure */}
      {isCruiser && (
        <group position={[0, hullHeight + 0.8, -1.0]}>
          <mesh castShadow>
            <boxGeometry args={[3.8, 1.8, 12.0]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
          {/* Deck Tier 2 */}
          <mesh position={[0, 1.4, -0.5]} castShadow>
            <boxGeometry args={[3.2, 1.2, 9.0]} />
            <meshStandardMaterial color="#f1f5f9" />
          </mesh>
          {/* Red Funnel Smokestack */}
          <mesh position={[0, 2.5, -1.5]} castShadow>
            <cylinderGeometry args={[0.6, 0.7, 1.6, 16]} />
            <meshStandardMaterial color="#ef4444" />
          </mesh>
        </group>
      )}

      {type === 'yacht' && (
        <group position={[0, 0.55, -0.2]}>
          <mesh castShadow>
            <boxGeometry args={[1.1, 0.45, 2.0]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
          <mesh position={[0, 0.1, 0.2]}>
            <boxGeometry args={[1.15, 0.25, 1.2]} />
            <meshPhysicalMaterial color="#38bdf8" transparent opacity={0.7} />
          </mesh>
        </group>
      )}

      {type === 'sailboat' && (
        <group position={[0, 0.4, 0]}>
          <mesh position={[0, 1.8, 0.2]} castShadow>
            <cylinderGeometry args={[0.03, 0.04, 3.6, 8]} />
            <meshStandardMaterial color="#f1f5f9" metalness={0.8} />
          </mesh>
          <mesh position={[0, 1.9, -0.7]} rotation={[0, 0.1, 0]}>
            <boxGeometry args={[0.02, 3.2, 1.6]} />
            <meshStandardMaterial color="#ffffff" roughness={0.8} />
          </mesh>
        </group>
      )}

      {type === 'speedboat' && (
        <group position={[0, 0.45, -0.4]}>
          <mesh castShadow>
            <boxGeometry args={[0.9, 0.3, 1.4]} />
            <meshStandardMaterial color="#dc2626" />
          </mesh>
          <mesh position={[0, 0.25, 0.3]}>
            <boxGeometry args={[0.85, 0.2, 0.1]} />
            <meshPhysicalMaterial color="#38bdf8" transparent opacity={0.7} />
          </mesh>
        </group>
      )}
    </group>
  )
}

// -------------------------------------------------------------
// 3. CAPE BEACON COASTAL LIGHTHOUSE
// -------------------------------------------------------------
function CoastalLighthouse({ position, isNight = false }: { position: [number, number, number]; isNight?: boolean }) {
  const beamRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (beamRef.current) {
      beamRef.current.rotation.y = state.clock.getElapsedTime() * 0.9
    }
  })

  return (
    <group position={position}>
      <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[2.4, 2.8, 1.2, 8]} />
        <meshStandardMaterial color="#475569" roughness={0.9} />
      </mesh>
      {[
        { y: 1.8, h: 1.2, r1: 1.8, r2: 2.1, color: '#dc2626' },
        { y: 3.0, h: 1.2, r1: 1.55, r2: 1.8, color: '#f8fafc' },
        { y: 4.2, h: 1.2, r1: 1.35, r2: 1.55, color: '#dc2626' },
        { y: 5.4, h: 1.2, r1: 1.15, r2: 1.35, color: '#f8fafc' },
        { y: 6.6, h: 1.2, r1: 0.95, r2: 1.15, color: '#dc2626' },
        { y: 7.7, h: 1.0, r1: 0.85, r2: 0.95, color: '#f8fafc' }
      ].map((sec, i) => (
        <mesh key={`lh-sec-${i}`} position={[0, sec.y, 0]} castShadow>
          <cylinderGeometry args={[sec.r1, sec.r2, sec.h, 16]} />
          <meshStandardMaterial color={sec.color} roughness={0.5} />
        </mesh>
      ))}
      <mesh position={[0, 8.35, 0]} castShadow>
        <cylinderGeometry args={[1.3, 1.3, 0.3, 16]} />
        <meshStandardMaterial color="#1e293b" metalness={0.7} />
      </mesh>
      <mesh position={[0, 9.1, 0]}>
        <cylinderGeometry args={[0.85, 0.85, 1.2, 16]} />
        <meshPhysicalMaterial
          color="#38bdf8"
          emissive={isNight ? '#fef08a' : '#000000'}
          emissiveIntensity={isNight ? 1.8 : 0.2}
          transparent
          opacity={0.65}
        />
      </mesh>
      <mesh position={[0, 10.1, 0]} castShadow>
        <coneGeometry args={[1.05, 0.9, 16]} />
        <meshStandardMaterial color="#047857" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Rotating Sweeping Spotlight Beam */}
      <group ref={beamRef} position={[0, 9.1, 0]}>
        <mesh position={[0, 0, 6]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[2.2, 12, 16, 1, true]} />
          <meshBasicMaterial
            color="#fef08a"
            transparent
            opacity={isNight ? 0.35 : 0.05}
            side={THREE.DoubleSide}
          />
        </mesh>
        {isNight && (
          <pointLight position={[0, 0, 1.0]} intensity={4.5} distance={32} color="#fef08a" />
        )}
      </group>
    </group>
  )
}

// -------------------------------------------------------------
// 4. ROTATING FERRIS WHEEL (Ocean Pier)
// -------------------------------------------------------------
function FerrisWheel({ position, isNight = false }: { position: [number, number, number]; isNight?: boolean }) {
  const wheelRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (wheelRef.current) {
      wheelRef.current.rotation.z = state.clock.getElapsedTime() * 0.25
    }
  })

  const gondolaColors = ['#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#f97316', '#eab308']

  return (
    <group position={position}>
      <mesh position={[0, 0.2, 0]} receiveShadow>
        <boxGeometry args={[14, 0.4, 18]} />
        <meshStandardMaterial color="#78350f" roughness={0.8} />
      </mesh>
      {[-6, 0, 6].map((px, i) =>
        [-8, 0, 8].map((pz, j) => (
          <mesh key={`piling-${i}-${j}`} position={[px, -0.6, pz]}>
            <cylinderGeometry args={[0.2, 0.2, 1.4, 8]} />
            <meshStandardMaterial color="#451a03" />
          </mesh>
        ))
      )}
      {[-1.2, 1.2].map((sz, i) => (
        <group key={`frame-${i}`} position={[0, 0, sz]}>
          <mesh position={[-1.8, 4.2, 0]} rotation={[0, 0, -0.25]} castShadow>
            <cylinderGeometry args={[0.08, 0.12, 8.8, 8]} />
            <meshStandardMaterial color="#f8fafc" metalness={0.8} />
          </mesh>
          <mesh position={[1.8, 4.2, 0]} rotation={[0, 0, 0.25]} castShadow>
            <cylinderGeometry args={[0.08, 0.12, 8.8, 8]} />
            <meshStandardMaterial color="#f8fafc" metalness={0.8} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 8.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 2.8, 16]} />
        <meshStandardMaterial color="#eab308" metalness={0.9} />
      </mesh>

      <group ref={wheelRef} position={[0, 8.2, 0]}>
        {[-0.6, 0.6].map((rz, i) => (
          <group key={`rings-${i}`} position={[0, 0, rz]}>
            <mesh>
              <torusGeometry args={[6.2, 0.08, 12, 32]} />
              <meshStandardMaterial
                color={isNight ? '#38bdf8' : '#ffffff'}
                emissive={isNight ? '#38bdf8' : '#000000'}
                emissiveIntensity={isNight ? 1.2 : 0}
              />
            </mesh>
          </group>
        ))}
        {Array.from({ length: 8 }).map((_, idx) => {
          const angle = (idx * Math.PI) / 4
          const gx = Math.cos(angle) * 6.2
          const gy = Math.sin(angle) * 6.2
          const gColor = gondolaColors[idx % gondolaColors.length]

          return (
            <group key={`spoke-${idx}`}>
              <mesh position={[gx / 2, gy / 2, 0]} rotation={[0, 0, angle + Math.PI / 2]}>
                <cylinderGeometry args={[0.04, 0.04, 6.2, 6]} />
                <meshStandardMaterial color="#f1f5f9" metalness={0.8} />
              </mesh>
              <group position={[gx, gy, 0]}>
                <mesh castShadow>
                  <boxGeometry args={[0.9, 0.85, 0.9]} />
                  <meshStandardMaterial
                    color={gColor}
                    emissive={isNight ? gColor : '#000000'}
                    emissiveIntensity={isNight ? 0.8 : 0}
                  />
                </mesh>
                <mesh position={[0, 0.55, 0]}>
                  <coneGeometry args={[0.6, 0.35, 4]} />
                  <meshStandardMaterial color="#f8fafc" />
                </mesh>
              </group>
            </group>
          )
        })}
      </group>
    </group>
  )
}

// -------------------------------------------------------------
// 5. WIND TURBINE
// -------------------------------------------------------------
function WindTurbine({ position, isNight = false }: { position: [number, number, number]; isNight?: boolean }) {
  const rotorRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (rotorRef.current) {
      rotorRef.current.rotation.z = state.clock.getElapsedTime() * 1.5 + position[0]
    }
  })

  return (
    <group position={position}>
      <mesh position={[0, 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.9, 1.2, 0.8, 16]} />
        <meshStandardMaterial color="#64748b" roughness={0.7} />
      </mesh>
      <mesh position={[0, 8.0, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.65, 14.8, 16]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.3} metalness={0.2} />
      </mesh>
      <mesh position={[0, 15.6, 0.3]} castShadow>
        <boxGeometry args={[0.7, 0.7, 1.8]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, 16.05, -0.4]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial
          color="#ef4444"
          emissive="#ef4444"
          emissiveIntensity={isNight ? 2.5 : 0.6}
        />
      </mesh>
      <group ref={rotorRef} position={[0, 15.6, 1.2]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.4, 0.6, 16]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
        {[0, (2 * Math.PI) / 3, (4 * Math.PI) / 3].map((ang, i) => (
          <group key={`blade-${i}`} rotation={[0, 0, ang]}>
            <mesh position={[0, 3.4, 0]} castShadow>
              <boxGeometry args={[0.22, 6.2, 0.04]} />
              <meshStandardMaterial color="#ffffff" roughness={0.2} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  )
}

// -------------------------------------------------------------
// 6. TROPICAL PALM TREE & JACARANDA
// -------------------------------------------------------------
export function PalmTree({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.65, 0]} rotation={[0.06, 0, -0.1]} castShadow>
        <cylinderGeometry args={[0.1, 0.18, 1.3, 8]} />
        <meshStandardMaterial color="#854d0e" roughness={0.9} />
      </mesh>
      <mesh position={[0.12, 1.8, 0]} rotation={[0.14, 0, -0.18]} castShadow>
        <cylinderGeometry args={[0.08, 0.11, 1.2, 8]} />
        <meshStandardMaterial color="#78350f" roughness={0.9} />
      </mesh>
      {[0, Math.PI / 3, (2 * Math.PI) / 3, Math.PI, (4 * Math.PI) / 3, (5 * Math.PI) / 3].map((ang, i) => (
        <group key={`frond-${i}`} position={[0.25, 2.35, 0]} rotation={[0.35, ang, 0.55]}>
          <mesh castShadow>
            <boxGeometry args={[1.05, 0.04, 0.28]} />
            <meshStandardMaterial color={i % 2 === 0 ? '#15803d' : '#22c55e'} roughness={0.7} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function JacarandaTree({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.9, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.22, 1.8, 8]} />
        <meshStandardMaterial color="#573a1e" roughness={0.9} />
      </mesh>
      <mesh position={[0, 2.3, 0]} castShadow>
        <sphereGeometry args={[1.3, 12, 12]} />
        <meshStandardMaterial color="#a855f7" roughness={0.8} />
      </mesh>
      <mesh position={[0.4, 2.8, -0.2]} castShadow>
        <sphereGeometry args={[0.9, 10, 10]} />
        <meshStandardMaterial color="#c084fc" roughness={0.8} />
      </mesh>
    </group>
  )
}

// -------------------------------------------------------------
// 7. DOWNTOWN FINANCIAL METROPOLIS SKYLINE (9 Glass High Rises)
// -------------------------------------------------------------
function DowntownMetropolis({ isNight = false }: { isNight?: boolean }) {
  // Clustered strictly in the North-East Financial Block (x: 28 to 43, z: -43 to -28)
  const towers = [
    { x: 30, z: -30, w: 4.4, d: 4.4, h: 22, color: '#0284c7', crown: 'spire' },
    { x: 36, z: -30, w: 4.8, d: 4.6, h: 26, color: '#090d16', crown: 'helipad' },
    { x: 41, z: -30, w: 4.2, d: 4.2, h: 18, color: '#0ea5e9', crown: 'flat' },
    { x: 30, z: -36, w: 4.2, d: 4.2, h: 20, color: '#0284c7', crown: 'twin' },
    { x: 36, z: -36, w: 4.8, d: 4.6, h: 28, color: '#0f766e', crown: 'stepped' },
    { x: 41, z: -36, w: 4.2, d: 4.2, h: 19, color: '#0369a1', crown: 'prism' },
    { x: 30, z: -41, w: 4.4, d: 4.4, h: 16, color: '#1e293b', crown: 'flat' },
    { x: 36, z: -41, w: 4.8, d: 4.6, h: 24, color: '#0284c7', crown: 'spire' },
    { x: 41, z: -41, w: 4.2, d: 4.2, h: 17, color: '#0f172a', crown: 'helipad' }
  ]

  return (
    <group position={[0, 0, 0]}>
      {towers.map((tw, idx) => (
        <group key={`dt-tower-${idx}`} position={[tw.x, 0, tw.z]}>
          <mesh position={[0, tw.h / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[tw.w, tw.h, tw.d]} />
            <meshPhysicalMaterial
              color={tw.color}
              transparent
              opacity={0.82}
              roughness={0.15}
              metalness={0.6}
            />
          </mesh>

          {/* Window Lighting Grid at Night */}
          {Array.from({ length: Math.floor(tw.h / 2.6) }).map((_, f) => (
            <mesh key={`win-${idx}-${f}`} position={[0, 2.0 + f * 2.4, tw.d / 2 + 0.04]}>
              <boxGeometry args={[tw.w * 0.88, 0.85, 0.04]} />
              <meshStandardMaterial
                color="#38bdf8"
                emissive="#fef08a"
                emissiveIntensity={isNight ? 1.4 : 0.08}
              />
            </mesh>
          ))}

          {/* Roof Crowns */}
          {tw.crown === 'spire' && (
            <group position={[0, tw.h, 0]}>
              <mesh position={[0, 1.2, 0]}>
                <boxGeometry args={[tw.w * 0.7, 2.4, tw.d * 0.7]} />
                <meshStandardMaterial color="#0f172a" />
              </mesh>
              <mesh position={[0, 3.8, 0]}>
                <cylinderGeometry args={[0.06, 0.18, 3.2, 8]} />
                <meshStandardMaterial color="#f8fafc" metalness={0.9} />
              </mesh>
              <mesh position={[0, 5.5, 0]}>
                <sphereGeometry args={[0.14, 8, 8]} />
                <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={isNight ? 3.0 : 0.8} />
              </mesh>
            </group>
          )}

          {tw.crown === 'helipad' && (
            <group position={[0, tw.h + 0.1, 0]}>
              <mesh>
                <cylinderGeometry args={[tw.w * 0.42, tw.w * 0.42, 0.2, 24]} />
                <meshStandardMaterial color="#334155" />
              </mesh>
              <mesh position={[0, 0.11, 0]}>
                <ringGeometry args={[tw.w * 0.32, tw.w * 0.36, 24]} />
                <meshBasicMaterial color="#fbbf24" />
              </mesh>
            </group>
          )}

          {tw.crown === 'stepped' && (
            <mesh position={[0, tw.h + 1.2, 0]} castShadow>
              <coneGeometry args={[tw.w * 0.55, 2.4, 4]} />
              <meshStandardMaterial color="#facc15" metalness={0.8} />
            </mesh>
          )}

          {tw.crown === 'prism' && (
            <mesh position={[0, tw.h + 1.5, 0]} rotation={[0, Math.PI / 4, 0]}>
              <octahedronGeometry args={[tw.w * 0.4]} />
              <meshPhysicalMaterial color="#38bdf8" roughness={0.1} />
            </mesh>
          )}
        </group>
      ))}

      {/* Corporate Financial Plaza Sculpture */}
      <group position={[36, 0, -36]}>
        <mesh position={[0, 0.1, 0]} receiveShadow>
          <cylinderGeometry args={[2.5, 2.5, 0.2, 16]} />
          <meshStandardMaterial color="#334155" roughness={0.5} />
        </mesh>
        <mesh position={[0, 1.2, 0]} rotation={[0.4, 0.5, 0.6]} castShadow>
          <torusGeometry args={[0.8, 0.18, 12, 24]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>
    </group>
  )
}

// -------------------------------------------------------------
// 8. TROPICAL AIRPORT (East Coastal Runway & Planes)
// -------------------------------------------------------------
function CoastalAirport({ isNight = false }: { isNight?: boolean }) {
  return (
    <group position={[56, 0, 0]}>
      {/* Tarmac Runway */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[2, 0.02, 0]} receiveShadow>
        <planeGeometry args={[10, 58]} />
        <meshStandardMaterial color="#1e293b" roughness={0.9} />
      </mesh>

      {/* Runway Dashed Centerline */}
      {Array.from({ length: 14 }).map((_, i) => (
        <mesh
          key={`rwy-dash-${i}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[2, 0.03, -24 + i * 3.8]}
        >
          <planeGeometry args={[0.4, 2.0]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      ))}

      {/* Runway Threshold Piano Keys */}
      {[-27, 27].map((endZ, idx) => (
        <group key={`piano-${idx}`} position={[2, 0.03, endZ]}>
          {[-3.6, -2.4, -1.2, 0, 1.2, 2.4, 3.6].map((tx, j) => (
            <mesh key={`p-stripe-${j}`} rotation={[-Math.PI / 2, 0, 0]} position={[tx, 0, 0]}>
              <planeGeometry args={[0.5, 2.4]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          ))}
        </group>
      ))}

      {/* Airport Passenger Terminal Building */}
      <group position={[-3.5, 0, -15]}>
        <mesh position={[0, 2.0, 0]} castShadow receiveShadow>
          <boxGeometry args={[4.2, 4.0, 13.0]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.3} />
        </mesh>
        <mesh position={[2.0, 1.8, 0]}>
          <boxGeometry args={[0.7, 2.6, 12.0]} />
          <meshPhysicalMaterial color="#38bdf8" transparent opacity={0.7} />
        </mesh>
      </group>

      {/* Air Traffic Control Tower with Radar Sphere */}
      <group position={[-3.5, 0, 15]}>
        <mesh position={[0, 5.0, 0]} castShadow>
          <cylinderGeometry args={[1.0, 1.5, 10.0, 12]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.4} />
        </mesh>
        <mesh position={[0, 10.6, 0]}>
          <cylinderGeometry args={[1.9, 1.4, 1.6, 16]} />
          <meshPhysicalMaterial color="#38bdf8" transparent opacity={0.7} />
        </mesh>
        <mesh position={[0, 12.0, 0]}>
          <sphereGeometry args={[0.85, 12, 12]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
        {isNight && (
          <pointLight position={[0, 12.0, 0]} intensity={2.5} distance={10} color="#ef4444" />
        )}
      </group>

      {/* 2 Parked Commercial Airliners on Tarmac Apron */}
      {[-6, 6].map((pz, idx) => (
        <group key={`plane-${idx}`} position={[-1.5, 0.4, pz]} rotation={[0, -Math.PI / 2, 0]}>
          <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.45, 0.45, 4.8, 12]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.3} />
          </mesh>
          <mesh position={[0, 0, 2.6]} rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.45, 0.8, 12]} />
            <meshStandardMaterial color="#0284c7" />
          </mesh>
          <mesh position={[0, -0.05, 0]}>
            <boxGeometry args={[4.8, 0.06, 1.2]} />
            <meshStandardMaterial color="#e2e8f0" />
          </mesh>
          <mesh position={[0, 0.7, -2.0]}>
            <boxGeometry args={[0.08, 1.2, 0.8]} />
            <meshStandardMaterial color="#0284c7" />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// -------------------------------------------------------------
// 9. NORTH CIVIC ESPLANADE (City Hall & Public Museum)
// -------------------------------------------------------------
function NorthCivicSector({ isNight = false }: { isNight?: boolean }) {
  return (
    <group position={[0, 0, 0]}>
      {/* Grand Municipal City Hall on West Civic Esplanade (x: -11, z: -35) */}
      <group position={[-11, 0, -35]}>
        <mesh position={[0, 0.3, 0]} receiveShadow>
          <boxGeometry args={[8.0, 0.6, 5.5]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.4} />
        </mesh>
        <mesh position={[0, 2.5, -0.6]} castShadow receiveShadow>
          <boxGeometry args={[7.2, 3.8, 4.4]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.3} />
        </mesh>
        {[-2.6, -1.3, 0, 1.3, 2.6].map((cx, i) => (
          <mesh key={`pillar-${i}`} position={[cx, 2.4, 1.8]} castShadow>
            <cylinderGeometry args={[0.16, 0.2, 3.4, 12]} />
            <meshStandardMaterial color="#f1f5f9" roughness={0.3} />
          </mesh>
        ))}
        <mesh position={[0, 4.6, 1.7]} castShadow>
          <coneGeometry args={[3.8, 1.2, 4]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.4} />
        </mesh>
        <mesh position={[0, 5.2, -0.6]} castShadow>
          <sphereGeometry args={[1.4, 16, 16]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.8} roughness={0.2} />
        </mesh>
        {isNight && (
          <pointLight position={[0, 3.0, 2.2]} intensity={2.5} distance={8} color="#fde047" />
        )}
      </group>

      {/* Public Art Museum & Conservatory on East Civic Esplanade (x: 11, z: -35) */}
      <group position={[11, 0, -35]}>
        <mesh position={[0, 0.3, 0]} receiveShadow>
          <boxGeometry args={[8.0, 0.6, 5.5]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.4} />
        </mesh>
        <mesh position={[0, 2.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[7.2, 3.4, 4.4]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.3} />
        </mesh>
        {/* Glass Pyramid Skylights */}
        {[-2.0, 2.0].map((px, i) => (
          <mesh key={`pyr-${i}`} position={[px, 4.3, 0]} castShadow>
            <coneGeometry args={[1.5, 1.2, 4]} />
            <meshPhysicalMaterial color="#38bdf8" transparent opacity={0.75} roughness={0.1} />
          </mesh>
        ))}
        {/* Museum Entrance Banner */}
        <mesh position={[0, 2.8, 2.25]}>
          <boxGeometry args={[4.0, 0.8, 0.1]} />
          <meshStandardMaterial color="#0284c7" />
        </mesh>
      </group>
    </group>
  )
}

// -------------------------------------------------------------
// 10. CIVIC SPORTS ARENA & EMERGENCY SERVICES (North-West)
// -------------------------------------------------------------
function CivicSportsAndEmergency({ isNight = false }: { isNight?: boolean }) {
  return (
    <group position={[0, 0, 0]}>
      {/* Sports Stadium Arena (x: -35, z: -35) */}
      <group position={[-35, 0, -35]}>
        <mesh position={[0, 1.8, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[5.2, 5.8, 3.6, 24]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
        </mesh>
        <mesh position={[0, 2.4, 0]}>
          <cylinderGeometry args={[4.6, 4.6, 1.8, 24, 1, true]} />
          <meshStandardMaterial color="#0284c7" side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0.45, 0]}>
          <boxGeometry args={[5.0, 0.1, 3.2]} />
          <meshStandardMaterial color="#16a34a" roughness={0.8} />
        </mesh>
        {[-4.0, 4.0].map((lx, i) =>
          [-2.6, 2.6].map((lz, j) => (
            <group key={`light-${i}-${j}`} position={[lx, 0, lz]}>
              <mesh position={[0, 3.2, 0]}>
                <cylinderGeometry args={[0.07, 0.12, 6.4, 8]} />
                <meshStandardMaterial color="#64748b" metalness={0.8} />
              </mesh>
              <mesh position={[0, 6.4, 0]}>
                <boxGeometry args={[0.8, 0.35, 0.2]} />
                <meshStandardMaterial
                  color="#fef08a"
                  emissive="#fef08a"
                  emissiveIntensity={isNight ? 2.5 : 0.4}
                />
              </mesh>
              {isNight && (
                <pointLight position={[0, 6.2, 0]} intensity={3.0} distance={12} color="#fef08a" />
              )}
            </group>
          ))
        )}
      </group>

      {/* Community Fire Station (x: -29, z: -41) */}
      <group position={[-29, 0, -41]}>
        <mesh position={[0, 1.8, 0]} castShadow receiveShadow>
          <boxGeometry args={[4.5, 3.6, 4.0]} />
          <meshStandardMaterial color="#b91c1c" roughness={0.6} />
        </mesh>
        {/* 2 Red Garage Bay Doors */}
        {[-1.2, 1.2].map((gx, i) => (
          <mesh key={`bay-${i}`} position={[gx, 1.2, 2.05]}>
            <boxGeometry args={[1.8, 2.4, 0.08]} />
            <meshStandardMaterial color="#dc2626" roughness={0.4} />
          </mesh>
        ))}
        {/* Siren Tower */}
        <mesh position={[1.5, 4.2, -1.2]} castShadow>
          <cylinderGeometry args={[0.3, 0.4, 1.5, 8]} />
          <meshStandardMaterial color="#7f1d1d" />
        </mesh>
        <mesh position={[1.5, 5.0, -1.2]}>
          <sphereGeometry args={[0.18, 8, 8]} />
          <meshStandardMaterial color="#facc15" emissive="#facc15" emissiveIntensity={isNight ? 2.0 : 0.5} />
        </mesh>
      </group>

      {/* Police Precinct Station (x: -41, z: -41) */}
      <group position={[-41, 0, -41]}>
        <mesh position={[0, 1.8, 0]} castShadow receiveShadow>
          <boxGeometry args={[4.5, 3.6, 4.0]} />
          <meshStandardMaterial color="#1e293b" roughness={0.4} />
        </mesh>
        {/* Glass Front Entrance */}
        <mesh position={[0, 1.5, 2.05]}>
          <boxGeometry args={[3.2, 2.2, 0.08]} />
          <meshPhysicalMaterial color="#38bdf8" transparent opacity={0.7} />
        </mesh>
        {/* Blue Siren Beacon on Roof */}
        <mesh position={[0, 3.8, 0]}>
          <cylinderGeometry args={[0.2, 0.25, 0.4, 8]} />
          <meshStandardMaterial color="#0284c7" emissive="#0284c7" emissiveIntensity={isNight ? 2.5 : 0.8} />
        </mesh>
      </group>

      {/* Town Clinic & Pharmacy (x: -29, z: -29) */}
      <group position={[-29, 0, -29]}>
        <mesh position={[0, 1.6, 0]} castShadow receiveShadow>
          <boxGeometry args={[4.5, 3.2, 4.0]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.3} />
        </mesh>
        <mesh position={[0, 2.2, 2.05]}>
          <boxGeometry args={[1.2, 0.35, 0.08]} />
          <meshStandardMaterial color="#16a34a" emissive="#16a34a" emissiveIntensity={isNight ? 2.0 : 0.6} />
        </mesh>
        <mesh position={[0, 2.2, 2.05]}>
          <boxGeometry args={[0.35, 1.2, 0.08]} />
          <meshStandardMaterial color="#16a34a" emissive="#16a34a" emissiveIntensity={isNight ? 2.0 : 0.6} />
        </mesh>
      </group>
    </group>
  )
}

// -------------------------------------------------------------
// 11. WEST CULTURE, DINING & GARDENS (Middle-West Sector)
// -------------------------------------------------------------
function WestCultureAndDining({ isNight = false }: { isNight?: boolean }) {
  return (
    <group position={[0, 0, 0]}>
      {/* Downtown Cinema & Theater (x: -35, z: -14) */}
      <group position={[-35, 0, -14]}>
        <mesh position={[0, 2.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[6.0, 4.4, 5.0]} />
          <meshStandardMaterial color="#0f172a" roughness={0.4} />
        </mesh>
        {/* Illuminated Neon Marquee */}
        <mesh position={[0, 3.2, 2.65]}>
          <boxGeometry args={[4.8, 1.1, 0.4]} />
          <meshStandardMaterial color="#e11d48" emissive="#e11d48" emissiveIntensity={isNight ? 2.2 : 0.8} />
        </mesh>
        {/* Entrance Ticket Booth */}
        <mesh position={[0, 0.9, 2.65]}>
          <boxGeometry args={[2.0, 1.8, 0.2]} />
          <meshPhysicalMaterial color="#38bdf8" transparent opacity={0.7} />
        </mesh>
      </group>

      {/* Waterfront Seafood Bistro & Dining Terrace (x: -35, z: 14) */}
      <group position={[-35, 0, 14]}>
        <mesh position={[0, 1.8, 0]} castShadow receiveShadow>
          <boxGeometry args={[6.0, 3.6, 5.0]} />
          <meshStandardMaterial color="#fef3c7" roughness={0.5} />
        </mesh>
        {/* Striped Red/White Fabric Canopy */}
        <mesh position={[0, 2.4, 2.8]} rotation={[-0.2, 0, 0]}>
          <boxGeometry args={[5.2, 0.08, 1.6]} />
          <meshStandardMaterial color="#dc2626" roughness={0.6} />
        </mesh>
        {/* Outdoor Cafe Dining Tables */}
        {[-1.6, 0, 1.6].map((tx, i) => (
          <group key={`bistro-table-${i}`} position={[tx, 0, 3.4]}>
            <mesh position={[0, 0.4, 0]}>
              <cylinderGeometry args={[0.4, 0.4, 0.05, 12]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>
            <mesh position={[0, 0.2, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 0.4, 6]} />
              <meshStandardMaterial color="#334155" />
            </mesh>
            <mesh position={[0, 1.1, 0]}>
              <coneGeometry args={[0.7, 0.4, 8]} />
              <meshStandardMaterial color={i % 2 === 0 ? '#0284c7' : '#ea580c'} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Tropical Garden Pavilions (x: -35, z: -7 & z: 7) */}
      {[-7, 7].map((gz, idx) => (
        <group key={`garden-pav-${idx}`} position={[-35, 0, gz]}>
          <mesh position={[0, 0.05, 0]} receiveShadow>
            <cylinderGeometry args={[2.2, 2.2, 0.1, 16]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.35, 0]}>
            <cylinderGeometry args={[0.9, 1.0, 0.6, 12]} />
            <meshStandardMaterial color="#94a3b8" />
          </mesh>
          <JacarandaTree position={[-1.8, 0, -1.2]} />
          <JacarandaTree position={[1.8, 0, 1.2]} />
        </group>
      ))}
    </group>
  )
}

// -------------------------------------------------------------
// 12. EAST INNOVATION PARK & TECH CAMPUS (Middle-East Sector)
// -------------------------------------------------------------
function EastInnovationPark({ isNight = false }: { isNight?: boolean }) {
  return (
    <group position={[0, 0, 0]}>
      {/* Tech Innovation HQ (x: 35, z: -14) */}
      <group position={[35, 0, -14]}>
        <mesh position={[0, 3.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[6.5, 6.4, 5.0]} />
          <meshPhysicalMaterial color="#0284c7" transparent opacity={0.8} roughness={0.15} metalness={0.5} />
        </mesh>
        {isNight && (
          <pointLight position={[0, 3.5, 2.7]} intensity={2.0} distance={8} color="#38bdf8" />
        )}
        {/* Rooftop Solar Panels */}
        {[-1.8, 0, 1.8].map((sx, i) => (
          <mesh key={`solar-${i}`} position={[sx, 6.55, 0]} rotation={[0.3, 0, 0]}>
            <boxGeometry args={[1.4, 0.06, 2.4]} />
            <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
          </mesh>
        ))}
      </group>

      {/* BioTech Research Labs with Skybridge (x: 35, z: 14) */}
      <group position={[35, 0, 14]}>
        <mesh position={[0, 3.0, 0]} castShadow receiveShadow>
          <boxGeometry args={[6.5, 6.0, 5.0]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.3} />
        </mesh>
        {/* Cyan Glass Window Banding */}
        <mesh position={[0, 3.0, 2.54]}>
          <boxGeometry args={[5.6, 1.2, 0.05]} />
          <meshPhysicalMaterial color="#06b6d4" transparent opacity={0.8} />
        </mesh>
      </group>

      {/* Business Hotel & Suites (x: 35, z: -7) */}
      <group position={[35, 0, -7]}>
        <mesh position={[0, 3.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[6.0, 7.0, 4.8]} />
          <meshStandardMaterial color="#fed7aa" roughness={0.4} />
        </mesh>
        {/* Glass Entrance Canopy */}
        <mesh position={[0, 1.4, 2.7]}>
          <boxGeometry args={[3.6, 0.1, 1.2]} />
          <meshPhysicalMaterial color="#38bdf8" transparent opacity={0.7} />
        </mesh>
      </group>

      {/* Creative Design Hub with Rooftop Garden (x: 35, z: 7) */}
      <group position={[35, 0, 7]}>
        <mesh position={[0, 2.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[6.0, 5.0, 4.8]} />
          <meshStandardMaterial color="#334155" roughness={0.5} />
        </mesh>
        {/* Wood Slat Architectural Accent */}
        <mesh position={[0, 2.5, 2.45]}>
          <boxGeometry args={[4.2, 3.2, 0.08]} />
          <meshStandardMaterial color="#b45309" roughness={0.7} />
        </mesh>
        <JacarandaTree position={[1.5, 5.0, 0]} />
      </group>
    </group>
  )
}

// -------------------------------------------------------------
// 13. SUBURBAN NEIGHBORHOOD (South-East Residential Sector)
// -------------------------------------------------------------
function SuburbanNeighborhood({ isNight = false }: { isNight?: boolean }) {
  const cottageColors = ['#fef08a', '#fed7aa', '#ffedd5', '#fbcfe8', '#e0f2fe', '#fef3c7', '#dcfce7', '#ede9fe', '#fce7f3']
  const roofColors = ['#ea580c', '#dc2626', '#15803d', '#0369a1', '#b45309', '#c026d3', '#ea580c', '#dc2626', '#15803d']

  return (
    <group position={[0, 0, 0]}>
      {/* 9 Terracotta Cottages in Dedicated Suburban Lawn Block (x: 28 to 43, z: 28 to 43) */}
      {[
        { x: 29, z: 29 }, { x: 35, z: 29 }, { x: 41, z: 29 },
        { x: 29, z: 35 }, { x: 35, z: 35 }, { x: 41, z: 35 },
        { x: 29, z: 41 }, { x: 35, z: 41 }, { x: 41, z: 41 }
      ].map((pos, idx) => (
        <group key={`se-cottage-${idx}`} position={[pos.x, 0, pos.z]}>
          <mesh position={[0, 1.4, 0]} castShadow receiveShadow>
            <boxGeometry args={[3.8, 2.8, 3.4]} />
            <meshStandardMaterial color={cottageColors[idx % cottageColors.length]} roughness={0.6} />
          </mesh>
          <mesh position={[0, 3.3, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <coneGeometry args={[3.2, 1.4, 4]} />
            <meshStandardMaterial color={roofColors[idx % roofColors.length]} roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.75, 1.75]}>
            <boxGeometry args={[0.85, 1.5, 0.06]} />
            <meshStandardMaterial color="#78350f" />
          </mesh>
          {/* Chimney */}
          <mesh position={[0.9, 3.4, -0.6]} castShadow>
            <boxGeometry args={[0.4, 1.2, 0.4]} />
            <meshStandardMaterial color="#7f1d1d" />
          </mesh>
          {isNight && (
            <pointLight position={[0, 1.8, 2.1]} intensity={1.5} distance={4} color="#fef08a" />
          )}
        </group>
      ))}

      {/* Neighborhood School & Campus Playground (South Beachfront Greenway z = 52.5) */}
      <group position={[36, 0, 52.5]}>
        <mesh position={[0, 2.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[9.5, 4.4, 4.8]} />
          <meshStandardMaterial color="#fef3c7" roughness={0.5} />
        </mesh>
        <mesh position={[0, 4.6, 0]} castShadow>
          <boxGeometry args={[10.0, 0.4, 5.2]} />
          <meshStandardMaterial color="#0284c7" />
        </mesh>
      </group>
    </group>
  )
}

// -------------------------------------------------------------
// 14. SOUTH CENTER GARDEN VILLAGE & MARKETPLACE
// -------------------------------------------------------------
function SouthCenterVillage({ isNight = false }: { isNight?: boolean }) {
  const townColors = ['#fbcfe8', '#e0f2fe', '#fef08a', '#dcfce7', '#fed7aa', '#f3e8ff', '#fce7f3', '#ffedd5']

  return (
    <group position={[0, 0, 0]}>
      {/* 8 Colorful Artisan Townhouses with Balconies */}
      {[
        { x: -14, z: 30 }, { x: -7, z: 30 }, { x: 7, z: 30 }, { x: 14, z: 30 },
        { x: -14, z: 37 }, { x: -7, z: 37 }, { x: 7, z: 37 }, { x: 14, z: 37 }
      ].map((pos, idx) => (
        <group key={`sc-town-${idx}`} position={[pos.x, 0, pos.z]}>
          <mesh position={[0, 1.8, 0]} castShadow receiveShadow>
            <boxGeometry args={[3.8, 3.6, 3.6]} />
            <meshStandardMaterial color={townColors[idx % townColors.length]} roughness={0.5} />
          </mesh>
          <mesh position={[0, 3.8, 0]} castShadow>
            <boxGeometry args={[4.1, 0.4, 3.9]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
          {/* Balcony */}
          <mesh position={[0, 2.2, 1.95]} castShadow>
            <boxGeometry args={[2.2, 0.6, 0.3]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          {isNight && (
            <pointLight position={[0, 1.8, 2.2]} intensity={1.4} distance={4.5} color="#fef08a" />
          )}
        </group>
      ))}

      {/* Town Square Clock Gazebo (x: -6, z: 34) */}
      <group position={[-6, 0, 34]}>
        <mesh position={[0, 0.15, 0]} receiveShadow>
          <cylinderGeometry args={[1.8, 1.8, 0.3, 8]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.6} />
        </mesh>
        <mesh position={[0, 1.8, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 3.0, 8]} />
          <meshStandardMaterial color="#78350f" />
        </mesh>
        <mesh position={[0, 3.4, 0]} castShadow>
          <coneGeometry args={[1.9, 1.0, 8]} />
          <meshStandardMaterial color="#15803d" />
        </mesh>
        <mesh position={[0, 4.1, 0]}>
          <sphereGeometry args={[0.18, 8, 8]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.9} />
        </mesh>
      </group>

      {/* Village Fountain Plaza (x: 6, z: 34) */}
      <group position={[6, 0, 34]}>
        <mesh position={[0, 0.1, 0]} receiveShadow>
          <cylinderGeometry args={[2.0, 2.0, 0.2, 16]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.35, 0]}>
          <cylinderGeometry args={[1.2, 1.4, 0.4, 16]} />
          <meshStandardMaterial color="#94a3b8" />
        </mesh>
        <mesh position={[0, 0.7, 0]}>
          <coneGeometry args={[0.7, 0.8, 12]} />
          <meshPhysicalMaterial color="#38bdf8" transparent opacity={0.8} />
        </mesh>
      </group>

      {/* Village Bakery & Cafe (x: -8 & 8, z: 41.5) */}
      <group position={[-8, 0, 41.5]}>
        <mesh position={[0, 1.6, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.8, 3.2, 3.2]} />
          <meshStandardMaterial color="#fed7aa" roughness={0.6} />
        </mesh>
        <mesh position={[0, 2.2, 1.7]} rotation={[-0.2, 0, 0]}>
          <boxGeometry args={[3.4, 0.08, 1.0]} />
          <meshStandardMaterial color="#ea580c" />
        </mesh>
      </group>

      <group position={[8, 0, 41.5]}>
        <mesh position={[0, 1.6, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.8, 3.2, 3.2]} />
          <meshStandardMaterial color="#e0f2fe" roughness={0.6} />
        </mesh>
        <mesh position={[0, 2.2, 1.7]} rotation={[-0.2, 0, 0]}>
          <boxGeometry args={[3.4, 0.08, 1.0]} />
          <meshStandardMaterial color="#0284c7" />
        </mesh>
      </group>
    </group>
  )
}

// -------------------------------------------------------------
// 15. SOUTH-WEST LUXURY ESTATES & CENTRAL HOSPITAL
// -------------------------------------------------------------
function SouthWestLuxuryEstates({ isNight = false }: { isNight?: boolean }) {
  return (
    <group position={[0, 0, 0]}>
      {/* 4 Modern Luxury Villas with Pools in South-West Sector */}
      {[
        { x: -36, z: 29 }, { x: -29, z: 29 },
        { x: -36, z: 41 }, { x: -29, z: 41 }
      ].map((pos, idx) => (
        <group key={`sw-villa-${idx}`} position={[pos.x, 0, pos.z]}>
          <mesh position={[0, 1.8, 0]} castShadow receiveShadow>
            <boxGeometry args={[5.2, 3.6, 4.0]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.3} />
          </mesh>
          <mesh position={[0, 1.6, 2.05]}>
            <boxGeometry args={[4.4, 2.2, 0.05]} />
            <meshPhysicalMaterial color="#38bdf8" transparent opacity={0.7} />
          </mesh>
          <mesh position={[0, 3.7, 0]}>
            <boxGeometry args={[5.6, 0.25, 4.4]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          {/* Swimming Pool */}
          <mesh position={[0, 0.05, 2.8]} receiveShadow>
            <boxGeometry args={[3.8, 0.1, 1.4]} />
            <meshStandardMaterial color="#e2e8f0" />
          </mesh>
          <mesh position={[0, 0.09, 2.8]}>
            <boxGeometry args={[3.4, 0.06, 1.1]} />
            <meshPhysicalMaterial
              color="#06b6d4"
              emissive={isNight ? '#06b6d4' : '#000000'}
              emissiveIntensity={isNight ? 1.0 : 0}
              transparent
              opacity={0.85}
            />
          </mesh>
        </group>
      ))}

      {/* Central Hospital with Emergency Helipad (x: -35, z: 35) */}
      <group position={[-35, 0, 35]}>
        <mesh position={[0, 2.6, 0]} castShadow receiveShadow>
          <boxGeometry args={[8.5, 5.2, 5.2]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.3} />
        </mesh>
        <group position={[0, 3.8, 2.65]}>
          <mesh>
            <boxGeometry args={[0.4, 1.4, 0.08]} />
            <meshStandardMaterial color="#dc2626" emissive="#dc2626" emissiveIntensity={isNight ? 2.0 : 0.6} />
          </mesh>
          <mesh>
            <boxGeometry args={[1.4, 0.4, 0.08]} />
            <meshStandardMaterial color="#dc2626" emissive="#dc2626" emissiveIntensity={isNight ? 2.0 : 0.6} />
          </mesh>
        </group>
        <group position={[2.5, 5.3, 0]}>
          <mesh>
            <cylinderGeometry args={[1.8, 1.8, 0.18, 20]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
          <mesh position={[0, 0.1, 0]}>
            <ringGeometry args={[1.4, 1.6, 20]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
        </group>
      </group>
    </group>
  )
}

// -------------------------------------------------------------
// 16. INDUSTRIAL PORT & CLEAN ENERGY HUB
// -------------------------------------------------------------
function IndustrialPortAndEnergy({ isNight = false }: { isNight?: boolean }) {
  const containerColors = ['#0284c7', '#dc2626', '#16a34a', '#ea580c', '#facc15', '#475569']

  return (
    <group position={[56, 0, 0]}>
      {/* Container Dock Wharf Pier over Ocean */}
      <mesh position={[2, 0.2, 0]} receiveShadow>
        <boxGeometry args={[8.0, 0.45, 36.0]} />
        <meshStandardMaterial color="#64748b" roughness={0.8} />
      </mesh>
      <mesh position={[5.8, 0.44, 0]}>
        <boxGeometry args={[0.3, 0.04, 36.0]} />
        <meshStandardMaterial color="#eab308" />
      </mesh>

      {/* Giant Orange Gantry Crane on Harbor Pier */}
      <group position={[3.5, 0.45, 0]}>
        {[-3, 3].map((cz, i) => (
          <group key={`gantry-leg-${i}`} position={[0, 0, cz]}>
            <mesh position={[-1.8, 4.5, 0]} castShadow>
              <boxGeometry args={[0.4, 9.0, 0.4]} />
              <meshStandardMaterial color="#ea580c" metalness={0.7} />
            </mesh>
            <mesh position={[1.8, 4.5, 0]} castShadow>
              <boxGeometry args={[0.4, 9.0, 0.4]} />
              <meshStandardMaterial color="#ea580c" metalness={0.7} />
            </mesh>
          </group>
        ))}
        <mesh position={[0, 9.2, 0]} castShadow>
          <boxGeometry args={[9.0, 0.8, 4.5]} />
          <meshStandardMaterial color="#f97316" metalness={0.6} />
        </mesh>
        <mesh position={[1.5, 8.4, 0]}>
          <boxGeometry args={[1.4, 0.9, 1.2]} />
          <meshStandardMaterial color="#38bdf8" />
        </mesh>
      </group>

      {/* 18 Shipping Containers Stacked along Harbor */}
      <group position={[0, 0.45, -6]}>
        {Array.from({ length: 18 }).map((_, idx) => {
          const col = idx % 2
          const row = Math.floor(idx / 2) % 3
          const tier = Math.floor(idx / 6)
          const color = containerColors[idx % containerColors.length]

          return (
            <mesh
              key={`cont-${idx}`}
              position={[col * 1.6 - 0.8, tier * 1.1 + 0.55, row * 4.2 - 4.2]}
              castShadow
            >
              <boxGeometry args={[1.4, 1.05, 3.8]} />
              <meshStandardMaterial color={color} roughness={0.5} metalness={0.3} />
            </mesh>
          )
        })}
      </group>

      {/* Logistics Distribution Warehouse */}
      <group position={[-1.5, 0, 12]}>
        <mesh position={[0, 2.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[5.0, 4.4, 7.5]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.6} />
        </mesh>
      </group>

      {/* Industrial Storage Tanks */}
      {[0, 1].map((_, i) => (
        <group key={`tank-${i}`} position={[-1.5, 0, -14 - i * 5]}>
          <mesh position={[0, 1.8, 0]} castShadow>
            <cylinderGeometry args={[1.8, 1.8, 3.6, 20]} />
            <meshStandardMaterial color="#f8fafc" metalness={0.5} roughness={0.3} />
          </mesh>
          <mesh position={[0, 2.8, 0]}>
            <cylinderGeometry args={[1.82, 1.82, 0.4, 20]} />
            <meshStandardMaterial color="#0284c7" />
          </mesh>
        </group>
      ))}

      {/* Offshore Wind Turbines */}
      <WindTurbine position={[6, 0, 22]} isNight={isNight} />
      <WindTurbine position={[6, 0, 32]} isNight={isNight} />
      <WindTurbine position={[6, 0, -22]} isNight={isNight} />
      <WindTurbine position={[6, 0, -32]} isNight={isNight} />
    </group>
  )
}

// -------------------------------------------------------------
// 13. TROPICAL ISLAND COASTLINE, BEACHES & VAST OCEAN
// -------------------------------------------------------------
function TropicalOceanAndIsland({ isNight = false }: { isNight?: boolean }) {
  const oceanRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (oceanRef.current) {
      oceanRef.current.position.y = -0.16 + Math.sin(state.clock.getElapsedTime() * 0.7) * 0.02
    }
  })

  return (
    <group position={[0, 0, 0]}>
      {/* 1. VAST DEEP BLUE OCEAN (1200x1200) */}
      <mesh ref={oceanRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.16, 0]} receiveShadow>
        <planeGeometry args={[1200, 1200]} />
        <meshPhysicalMaterial
          color={isNight ? '#021827' : '#0284c7'}
          emissive={isNight ? '#021827' : '#000000'}
          emissiveIntensity={isNight ? 0.2 : 0}
          roughness={0.06}
          metalness={0.25}
          reflectivity={0.9}
          transparent
          opacity={0.96}
        />
      </mesh>

      {/* 2. SHALLOW TURQUOISE LAGOON RING (Translucent Cyan Water around island) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.06, 0]}>
        <ringGeometry args={[60, 95, 36]} />
        <meshPhysicalMaterial
          color={isNight ? '#083344' : '#06b6d4'}
          transparent
          opacity={0.78}
          roughness={0.08}
        />
      </mesh>

      {/* 3. GOLDEN SAND BEACH RING WRAPPING THE ISLAND PERIMETER */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <ringGeometry args={[56, 68, 36]} />
        <meshStandardMaterial
          color={isNight ? '#78716c' : '#fef08a'}
          roughness={0.9}
        />
      </mesh>

      {/* Dotted Beach Umbrellas along South Beaches */}
      {[-45, -30, -15, 0, 15, 30, 45].map((bx, i) => (
        <group key={`beach-tiki-${i}`} position={[bx, 0, 58]}>
          <mesh position={[0, 0.9, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 1.8, 6]} />
            <meshStandardMaterial color="#854d0e" />
          </mesh>
          <mesh position={[0, 1.7, 0]} castShadow>
            <coneGeometry args={[1.2, 0.5, 8]} />
            <meshStandardMaterial color={i % 2 === 0 ? '#ea580c' : '#0284c7'} />
          </mesh>
          <mesh position={[0.4, 0.1, 0.3]} castShadow>
            <boxGeometry args={[0.6, 0.12, 1.2]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        </group>
      ))}

      {/* Distant Tropical Horizon Atolls */}
      {[
        { x: 220, z: 180, r: 26 },
        { x: -240, z: 160, r: 30 },
        { x: -220, z: -210, r: 28 },
        { x: 230, z: -220, r: 24 }
      ].map((atoll, idx) => (
        <group key={`atoll-${idx}`} position={[atoll.x, -0.05, atoll.z]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[atoll.r, 16]} />
            <meshStandardMaterial color={isNight ? '#14532d' : '#16a34a'} roughness={0.8} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
            <ringGeometry args={[atoll.r, atoll.r + 7, 16]} />
            <meshStandardMaterial color={isNight ? '#57534e' : '#fef08a'} roughness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// -------------------------------------------------------------
// 14. WATER CANAL WITH STONE BRIDGES
// -------------------------------------------------------------
function WaterCanal({ isNight = false }: { isNight?: boolean }) {
  const waterRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (waterRef.current) {
      waterRef.current.position.y = 0.02 + Math.sin(state.clock.getElapsedTime() * 1.4) * 0.006
    }
  })

  // Scenic Coastal North Canal (z = -50, outside city street grid)
  return (
    <group position={[0, 0, -50]}>
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[100, 0.18, 2.6]} />
        <meshStandardMaterial color="#0e7490" roughness={0.9} />
      </mesh>
      <mesh ref={waterRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <planeGeometry args={[100, 2.4]} />
        <meshPhysicalMaterial
          color={isNight ? '#083344' : '#06b6d4'}
          transparent
          opacity={0.88}
          roughness={0.08}
          metalness={0.2}
          reflectivity={0.9}
        />
      </mesh>
      {[-24, 0, 24].map((bx, idx) => (
        <group key={`canal-bridge-${idx}`} position={[bx, 0.14, 0]}>
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
      ))}
    </group>
  )
}

// -------------------------------------------------------------
// 15. RAILWAY LINE & ISLAND TRAIN
// -------------------------------------------------------------
function RailwayAndTrain() {
  const trainRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (trainRef.current) {
      trainRef.current.position.y = 0.22 + Math.sin(state.clock.getElapsedTime() * 3.0) * 0.015
    }
  })

  // Seaside Coastal Railway (z = -52.5, scenic coastal route)
  return (
    <group position={[0, 0, -52.5]}>
      <mesh position={[0, 0.04, 0]} receiveShadow>
        <boxGeometry args={[100, 0.08, 1.6]} />
        <meshStandardMaterial color="#475569" roughness={0.9} />
      </mesh>
      {Array.from({ length: 50 }).map((_, i) => (
        <mesh key={`tie-${i}`} position={[-38 + i * 1.5, 0.1, 0]} castShadow>
          <boxGeometry args={[0.18, 0.06, 1.25]} />
          <meshStandardMaterial color="#78350f" roughness={0.9} />
        </mesh>
      ))}
      {[-0.38, 0.38].map((rz, i) => (
        <mesh key={`rail-${i}`} position={[0, 0.16, rz]}>
          <boxGeometry args={[100, 0.06, 0.06]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.9} roughness={0.2} />
        </mesh>
      ))}
      <group ref={trainRef} position={[-6.0, 0.22, 0]}>
        <mesh position={[0, 0.45, 0]} castShadow>
          <boxGeometry args={[2.4, 0.85, 0.8]} />
          <meshStandardMaterial color="#eab308" roughness={0.3} />
        </mesh>
        <mesh position={[-0.9, 0.35, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.38, 0.38, 0.7, 16]} />
          <meshStandardMaterial color="#ca8a04" />
        </mesh>
        <mesh position={[2.8, 0.45, 0]} castShadow>
          <boxGeometry args={[2.2, 0.8, 0.8]} />
          <meshStandardMaterial color="#dc2626" roughness={0.4} />
        </mesh>
      </group>
    </group>
  )
}

// -------------------------------------------------------------
// 16. STREET FIXTURES
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
      {isNight && (
        <pointLight position={[0.42, 2.4, 0]} intensity={2.8} distance={7.0} color="#fde047" />
      )}
    </group>
  )
}

function TrafficSignalPost({ position, rotation = 0, isNight = false }: { position: [number, number, number]; rotation?: number; isNight?: boolean }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 1.6, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.06, 3.2, 8]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} />
      </mesh>
      <mesh position={[0, 2.6, 0.12]} castShadow>
        <boxGeometry args={[0.26, 0.75, 0.18]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      <mesh position={[0, 2.8, 0.22]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={isNight ? 1.5 : 0.6} />
      </mesh>
      <mesh position={[0, 2.4, 0.22]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={isNight ? 1.8 : 0.8} />
      </mesh>
    </group>
  )
}

// -------------------------------------------------------------
// MAIN ENVIRONMENT DECORATION COMPONENT
// -------------------------------------------------------------
export const EnvironmentDecor: React.FC<EnvironmentDecorProps> = ({ timeOfDay = 'day', stores = [] }) => {
  const isNight = timeOfDay === 'night'
  const grassTexture = useMemo(() => createGrassTexture(), [])
  const asphaltTexture = useMemo(() => createAsphaltTexture(), [])
  const paverTexture = useMemo(() => createPaverTexture(), [])
  const activeDistricts = useMemo(() => getActiveDistricts(stores), [stores])

  // Procedural District Commercial Foundations that dynamically expand as stores are built
  // Every foundation is strictly placed within open land blocks, leaving clean road corridors
  const proceduralBlocks = useMemo(() => {
    const blocks = [
      // Central District 1 Plaza Core (4 Quadrants safely between x: ±2.5 to ±19.5, z: ±2.5 to ±19.5)
      // Zero road overlap with Central Arterials (x=0, z=0) and Secondary Avenues (x=±24, z=±24)
      { id: 'nw', x: -11.0, z: -11.0, w: 17.0, d: 17.0 },
      { id: 'ne', x: 11.0, z: -11.0, w: 17.0, d: 17.0 },
      { id: 'sw', x: -11.0, z: 11.0, w: 17.0, d: 17.0 },
      { id: 'se', x: 11.0, z: 11.0, w: 17.0, d: 17.0 }
    ]

    if (activeDistricts.includes('district_2')) {
      blocks.push(
        { id: 'd2_n', x: 35.0, z: -10.5, w: 15.0, d: 16.0 },
        { id: 'd2_s', x: 35.0, z: 10.5, w: 15.0, d: 16.0 }
      )
    }
    if (activeDistricts.includes('district_3')) {
      blocks.push(
        { id: 'd3_n', x: -35.0, z: -10.5, w: 15.0, d: 16.0 },
        { id: 'd3_s', x: -35.0, z: 10.5, w: 15.0, d: 16.0 }
      )
    }
    if (activeDistricts.includes('district_4')) {
      blocks.push(
        { id: 'd4_w', x: -10.5, z: -35.0, w: 16.0, d: 15.0 },
        { id: 'd4_e', x: 10.5, z: -35.0, w: 16.0, d: 15.0 }
      )
    }
    if (activeDistricts.includes('district_5')) {
      blocks.push(
        { id: 'd5_w', x: -10.5, z: 35.0, w: 16.0, d: 15.0 },
        { id: 'd5_e', x: 10.5, z: 35.0, w: 16.0, d: 15.0 }
      )
    }

    return blocks
  }, [activeDistricts])

  return (
    <group position={[0, 0, 0]}>
      {/* 1. TROPICAL OCEAN & ISLAND COASTLINE SYSTEM */}
      <TropicalOceanAndIsland isNight={isNight} />

      {/* 2. MAIN ISLAND LANDMASS (116x116, leaving clear view of beaches & ocean all around!) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[116, 116]} />
        <meshStandardMaterial
          map={grassTexture}
          roughness={0.8}
          color={isNight ? '#064e3b' : '#ffffff'}
        />
      </mesh>

      {/* 3. DYNAMIC PROCEDURAL COMMERCIAL DISTRICT PLAZA FOUNDATIONS */}
      {proceduralBlocks.map((block) => (
        <group key={block.id} position={[block.x, 0.035, block.z]}>
          <mesh receiveShadow>
            <boxGeometry args={[block.w, 0.05, block.d]} />
            <meshStandardMaterial
              map={paverTexture}
              roughness={0.5}
              color={isNight ? '#334155' : '#ffffff'}
            />
          </mesh>
          <mesh position={[0, 0.015, 0]}>
            <boxGeometry args={[block.w + 0.12, 0.02, block.d + 0.12]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.7} />
          </mesh>
        </group>
      ))}

      {/* 4. CONTINUOUS GRID ROAD NETWORK (Connecting every single city block) */}
      {/* Central East-West Highway (z = 0, width: 3.6m) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[94, 3.6]} />
        <meshStandardMaterial map={asphaltTexture} roughness={0.8} color={isNight ? '#0f172a' : '#1e293b'} />
      </mesh>

      {/* Central North-South Boulevard (x = 0, width: 3.6m) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.011, 0]} receiveShadow>
        <planeGeometry args={[3.6, 94]} />
        <meshStandardMaterial map={asphaltTexture} roughness={0.8} color={isNight ? '#0f172a' : '#1e293b'} />
      </mesh>

      {/* Central Intersection */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]} receiveShadow>
        <planeGeometry args={[3.6, 3.6]} />
        <meshStandardMaterial color={isNight ? '#0f172a' : '#1e293b'} roughness={0.8} />
      </mesh>

      {/* Intermediate Grid Streets (x = ±24, z = ±24, width: 3.2m) */}
      {[-24, 24].map((rz, i) => (
        <mesh key={`ring-z-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, rz]} receiveShadow>
          <planeGeometry args={[94, 3.2]} />
          <meshStandardMaterial map={asphaltTexture} roughness={0.8} color={isNight ? '#0f172a' : '#1e293b'} />
        </mesh>
      ))}
      {[-24, 24].map((rx, i) => (
        <mesh key={`ring-x-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[rx, 0.01, 0]} receiveShadow>
          <planeGeometry args={[3.2, 94]} />
          <meshStandardMaterial map={asphaltTexture} roughness={0.8} color={isNight ? '#0f172a' : '#1e293b'} />
        </mesh>
      ))}

      {/* Outer Perimeter Ring Boulevards (x = ±46, z = ±46, width: 2.8m) */}
      {[-46, 46].map((rz, i) => (
        <mesh key={`outer-z-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, rz]} receiveShadow>
          <planeGeometry args={[94, 2.8]} />
          <meshStandardMaterial map={asphaltTexture} roughness={0.8} color={isNight ? '#0f172a' : '#1e293b'} />
        </mesh>
      ))}
      {[-46, 46].map((rx, i) => (
        <mesh key={`outer-x-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[rx, 0.01, 0]} receiveShadow>
          <planeGeometry args={[2.8, 94]} />
          <meshStandardMaterial map={asphaltTexture} roughness={0.8} color={isNight ? '#0f172a' : '#1e293b'} />
        </mesh>
      ))}

      {/* Dashed Centerlines on Main Arterials */}
      {Array.from({ length: 30 }).map((_, i) => {
        const xPos = -44 + i * 3.0
        if (Math.abs(xPos) < 2.5 || Math.abs(xPos - 24) < 2.2 || Math.abs(xPos + 24) < 2.2 || Math.abs(xPos - 46) < 2.0 || Math.abs(xPos + 46) < 2.0) return null
        return (
          <mesh key={`h-dash-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[xPos, 0.016, 0]}>
            <planeGeometry args={[1.5, 0.15]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        )
      })}
      {Array.from({ length: 30 }).map((_, i) => {
        const zPos = -44 + i * 3.0
        if (Math.abs(zPos) < 2.5 || Math.abs(zPos - 24) < 2.2 || Math.abs(zPos + 24) < 2.2 || Math.abs(zPos - 46) < 2.0 || Math.abs(zPos + 46) < 2.0) return null
        return (
          <mesh key={`v-dash-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.016, zPos]}>
            <planeGeometry args={[0.15, 1.5]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        )
      })}

      {/* 5. WATER CANAL & RAILWAY LINE (Running along northern seaside buffer) */}
      <WaterCanal isNight={isNight} />
      <RailwayAndTrain />

      {/* 6. COASTAL MARINA & LIGHTHOUSE & CRUISE LINER */}
      <group position={[-52, 0, 0]}>
        <mesh position={[0, 0.18, 0]} receiveShadow>
          <boxGeometry args={[4.0, 0.35, 28.0]} />
          <meshStandardMaterial color="#78350f" roughness={0.8} />
        </mesh>
        {[-10, -2, 6, 12].map((pz, idx) => (
          <mesh key={`finger-${idx}`} position={[-3.5, 0.18, pz]}>
            <boxGeometry args={[5.0, 0.3, 1.6]} />
            <meshStandardMaterial color="#92400e" roughness={0.8} />
          </mesh>
        ))}
        <BobbingBoat position={[-3.8, 0, -10]} type="yacht" color="#f8fafc" rotation={Math.PI / 2} />
        <BobbingBoat position={[-3.8, 0, -2]} type="sailboat" color="#ffffff" rotation={Math.PI / 2} />
        <BobbingBoat position={[-3.8, 0, 6]} type="speedboat" color="#ef4444" rotation={Math.PI / 2} />
        <BobbingBoat position={[-3.8, 0, 12]} type="yacht" color="#38bdf8" rotation={Math.PI / 2} />
      </group>

      {/* Offshore Luxury Cruise Liner */}
      <BobbingBoat position={[-85, 0, -15]} type="cruiser" color="#f8fafc" rotation={0.3} />

      {/* Cape Beacon Lighthouse on Rocky Point */}
      <CoastalLighthouse position={[-52, 0, -38]} isNight={isNight} />

      {/* Ferris Wheel Amusement Pier */}
      <FerrisWheel position={[-50, 0, 36]} isNight={isNight} />

      {/* 7. ALL CITY DISTRICTS (Every landmark & town building safely in its own open land block) */}
      <DowntownMetropolis isNight={isNight} />
      <CoastalAirport isNight={isNight} />
      <NorthCivicSector isNight={isNight} />
      <CivicSportsAndEmergency isNight={isNight} />
      <WestCultureAndDining isNight={isNight} />
      <EastInnovationPark isNight={isNight} />
      <SuburbanNeighborhood isNight={isNight} />
      <SouthCenterVillage isNight={isNight} />
      <SouthWestLuxuryEstates isNight={isNight} />
      <IndustrialPortAndEnergy isNight={isNight} />

      {/* 8. TROPICAL PALM TREE AVENUES (Planted along sidewalk curbs) */}
      {[-40, -32, -16, -8, 8, 16, 32, 40].map((tx, i) => (
        <React.Fragment key={`palms-grid-${i}`}>
          <PalmTree position={[tx, 0, -2.4]} />
          <PalmTree position={[tx, 0, 2.4]} />
          <PalmTree position={[tx, 0, 21.6]} />
          <PalmTree position={[tx, 0, -21.6]} />
        </React.Fragment>
      ))}

      {/* 9. STREET FIXTURES (Street Lamps & Traffic Signals on Sidewalk Corners) */}
      <StreetLamp position={[-2.4, 0, -2.4]} rotation={Math.PI / 4} isNight={isNight} />
      <StreetLamp position={[2.4, 0, -2.4]} rotation={-Math.PI / 4} isNight={isNight} />
      <StreetLamp position={[-2.4, 0, 2.4]} rotation={(3 * Math.PI) / 4} isNight={isNight} />
      <StreetLamp position={[2.4, 0, 2.4]} rotation={(-3 * Math.PI) / 4} isNight={isNight} />
      <StreetLamp position={[-21.6, 0, -2.4]} rotation={Math.PI / 4} isNight={isNight} />
      <StreetLamp position={[21.6, 0, -2.4]} rotation={-Math.PI / 4} isNight={isNight} />
      <StreetLamp position={[-2.4, 0, 21.6]} rotation={Math.PI / 4} isNight={isNight} />
      <StreetLamp position={[2.4, 0, 21.6]} rotation={-Math.PI / 4} isNight={isNight} />

      <TrafficSignalPost position={[-2.0, 0, -2.0]} rotation={Math.PI / 4} isNight={isNight} />
      <TrafficSignalPost position={[2.0, 0, 2.0]} rotation={(-3 * Math.PI) / 4} isNight={isNight} />

      {/* 10. ANIMATED LIVING TRAFFIC (Aligned directly with roadway lanes) */}
      {/* Central Highway (z = 0) */}
      <MovingTrafficVehicle axis="x" laneOffset={0.75} direction={1} speed={5.8} vehicleType="sedan" bodyColor="#3b82f6" isNight={isNight} />
      <MovingTrafficVehicle axis="x" laneOffset={-0.75} direction={-1} speed={5.2} vehicleType="taxi" isNight={isNight} />
      <MovingTrafficVehicle axis="x" laneOffset={0.75} direction={1} speed={4.4} vehicleType="bus" bodyColor="#0284c7" isNight={isNight} />
      <MovingTrafficVehicle axis="x" laneOffset={-0.75} direction={-1} speed={6.4} vehicleType="sports" bodyColor="#ef4444" isNight={isNight} />

      {/* Central Boulevard (x = 0) */}
      <MovingTrafficVehicle axis="z" laneOffset={-0.75} direction={1} speed={5.4} vehicleType="sedan" bodyColor="#10b981" isNight={isNight} />
      <MovingTrafficVehicle axis="z" laneOffset={0.75} direction={-1} speed={5.0} vehicleType="van" bodyColor="#f8fafc" isNight={isNight} />
      <MovingTrafficVehicle axis="z" laneOffset={-0.75} direction={1} speed={6.0} vehicleType="taxi" isNight={isNight} />
      <MovingTrafficVehicle axis="z" laneOffset={0.75} direction={-1} speed={5.2} vehicleType="sports" bodyColor="#f59e0b" isNight={isNight} />

      {/* Avenues (z = 24, z = -24) */}
      <MovingTrafficVehicle axis="x" laneOffset={24.7} direction={1} speed={5.5} vehicleType="sedan" bodyColor="#8b5cf6" isNight={isNight} />
      <MovingTrafficVehicle axis="x" laneOffset={23.3} direction={-1} speed={4.8} vehicleType="van" bodyColor="#94a3b8" isNight={isNight} />
      <MovingTrafficVehicle axis="x" laneOffset={-23.3} direction={1} speed={5.2} vehicleType="taxi" isNight={isNight} />
      <MovingTrafficVehicle axis="x" laneOffset={-24.7} direction={-1} speed={5.8} vehicleType="truck" bodyColor="#ea580c" isNight={isNight} />

      {/* Avenues (x = -24, x = 24) */}
      <MovingTrafficVehicle axis="z" laneOffset={-23.3} direction={1} speed={5.2} vehicleType="taxi" isNight={isNight} />
      <MovingTrafficVehicle axis="z" laneOffset={24.7} direction={-1} speed={4.6} vehicleType="bus" bodyColor="#0284c7" isNight={isNight} />
    </group>
  )
}

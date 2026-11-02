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
import { createAsphaltTexture, createGrassTexture, createPaverTexture } from './textures'

interface EnvironmentDecorProps {
  timeOfDay?: TimeOfDay
  stores?: Store[]
}

// -------------------------------------------------------------
// 1. ANIMATED LIVING TRAFFIC VEHICLE WITH SUSPENSION & BRAKING PHYSICS
// -------------------------------------------------------------
type VehicleType = 'sedan' | 'taxi' | 'sports' | 'van' | 'bus' | 'truck'

class TrafficVehiclePhysics {
  speed: number = 0.0
  maxSpeed: number
  accel: number = 7.5
  braking: number = 18.0
  pitchAngle: number = 0.0

  constructor(maxSpeed: number = 5.0) {
    this.maxSpeed = maxSpeed
    this.speed = maxSpeed * 0.8
  }

  update(dt: number, distToCenter: number, isRedLight: boolean) {
    const shouldStop = isRedLight && distToCenter > 1.2 && distToCenter < 6.2
    if (shouldStop) {
      this.speed = Math.max(0.0, this.speed - this.braking * dt)
      this.pitchAngle = -0.05 * (this.speed / this.maxSpeed) // Nose dips forward on braking
    } else {
      this.speed = Math.min(this.maxSpeed, this.speed + this.accel * dt)
      this.pitchAngle = 0.025 * (1.0 - this.speed / this.maxSpeed) // Slight squat on acceleration
    }
    return { speed: this.speed, pitch: this.pitchAngle }
  }
}

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
  const chassisRef = useRef<THREE.Group>(null)
  const posRef = useRef<number>((Math.random() - 0.5) * range * 1.8)
  const physicsRef = useRef<TrafficVehiclePhysics | null>(null)

  if (!physicsRef.current) {
    physicsRef.current = new TrafficVehiclePhysics(speed)
  }

  useFrame((state, delta) => {
    if (vehicleRef.current && physicsRef.current) {
      const dt = Math.min(delta, 0.05)
      const distToCenter = Math.abs(posRef.current)
      const isRedLight = ((Math.floor((state.clock.getElapsedTime() + (axis === 'x' ? 0 : 4.5)) / 7) % 2) === 0) && (posRef.current * direction < 0)
      const { speed: currentSpeed, pitch } = physicsRef.current.update(dt, distToCenter, isRedLight)

      posRef.current += currentSpeed * direction * dt
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

      if (chassisRef.current) {
        chassisRef.current.rotation.x = THREE.MathUtils.lerp(chassisRef.current.rotation.x, pitch, 0.15)
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
      <group ref={chassisRef}>
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
// 6. LOW-POLY FACETED TREES & BOTANICALS (With Wind Sway Physics)
// -------------------------------------------------------------
export function LowPolyFacetedTree({
  position,
  scale = 1.0,
  type = 'round',
  shade = '#22c55e'
}: {
  position: [number, number, number]
  scale?: number
  type?: 'round' | 'tiered' | 'pine'
  shade?: string
}) {
  const crownRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (crownRef.current) {
      const t = state.clock.getElapsedTime()
      // Gentle wind breeze sway: 2.0 degrees on X & Z
      crownRef.current.rotation.z = Math.sin(t * 1.8 + position[0] * 0.4) * 0.035
      crownRef.current.rotation.x = Math.cos(t * 1.5 + position[2] * 0.4) * 0.025
    }
  })

  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Low-Poly Faceted Trunk */}
      <mesh position={[0, 0.65, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.13, 1.3, 6]} />
        <meshStandardMaterial color="#78350f" roughness={0.9} flatShading />
      </mesh>

      {/* Faceted Canopy Swaying in the Breeze */}
      <group ref={crownRef}>
        {type === 'round' && (
          <mesh position={[0, 1.8, 0]} castShadow>
            <dodecahedronGeometry args={[1.05, 0]} />
            <meshStandardMaterial color={shade} roughness={0.6} flatShading />
          </mesh>
        )}

        {type === 'tiered' && (
          <group position={[0, 1.5, 0]}>
            <mesh position={[0, 0, 0]} castShadow>
              <dodecahedronGeometry args={[1.0, 0]} />
              <meshStandardMaterial color={shade} roughness={0.6} flatShading />
            </mesh>
            <mesh position={[0, 0.95, 0]} castShadow>
              <dodecahedronGeometry args={[0.72, 0]} />
              <meshStandardMaterial color="#4ade80" roughness={0.6} flatShading />
            </mesh>
          </group>
        )}

        {type === 'pine' && (
          <group position={[0, 1.4, 0]}>
            <mesh position={[0, 0, 0]} castShadow>
              <coneGeometry args={[1.05, 1.3, 6]} />
              <meshStandardMaterial color={shade} roughness={0.7} flatShading />
            </mesh>
            <mesh position={[0, 0.75, 0]} castShadow>
              <coneGeometry args={[0.82, 1.1, 6]} />
              <meshStandardMaterial color="#16a34a" roughness={0.7} flatShading />
            </mesh>
            <mesh position={[0, 1.4, 0]} castShadow>
              <coneGeometry args={[0.55, 0.9, 6]} />
              <meshStandardMaterial color="#4ade80" roughness={0.7} flatShading />
            </mesh>
          </group>
        )}
      </group>
    </group>
  )
}

export function PalmTree({ position }: { position: [number, number, number] }) {
  const frondsRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (frondsRef.current) {
      const t = state.clock.getElapsedTime()
      frondsRef.current.rotation.z = Math.sin(t * 1.6 + position[0] * 0.3) * 0.04
      frondsRef.current.rotation.x = Math.cos(t * 1.3 + position[2] * 0.3) * 0.03
    }
  })

  return (
    <group position={position}>
      <mesh position={[0, 0.65, 0]} rotation={[0.06, 0, -0.1]} castShadow>
        <cylinderGeometry args={[0.1, 0.18, 1.3, 6]} />
        <meshStandardMaterial color="#854d0e" roughness={0.9} flatShading />
      </mesh>
      <mesh position={[0.12, 1.8, 0]} rotation={[0.14, 0, -0.18]} castShadow>
        <cylinderGeometry args={[0.08, 0.11, 1.2, 6]} />
        <meshStandardMaterial color="#78350f" roughness={0.9} flatShading />
      </mesh>
      <group ref={frondsRef}>
        {[0, Math.PI / 3, (2 * Math.PI) / 3, Math.PI, (4 * Math.PI) / 3, (5 * Math.PI) / 3].map((ang, i) => (
          <group key={`frond-${i}`} position={[0.25, 2.35, 0]} rotation={[0.35, ang, 0.55]}>
            <mesh castShadow>
              <boxGeometry args={[1.05, 0.04, 0.28]} />
              <meshStandardMaterial color={i % 2 === 0 ? '#15803d' : '#22c55e'} roughness={0.7} flatShading />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  )
}

export function JacarandaTree({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.9, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.18, 1.8, 6]} />
        <meshStandardMaterial color="#573a1e" roughness={0.9} flatShading />
      </mesh>
      <mesh position={[0, 2.2, 0]} castShadow>
        <dodecahedronGeometry args={[1.2, 0]} />
        <meshStandardMaterial color="#a855f7" roughness={0.7} flatShading />
      </mesh>
      <mesh position={[0.35, 2.7, -0.2]} castShadow>
        <dodecahedronGeometry args={[0.8, 0]} />
        <meshStandardMaterial color="#c084fc" roughness={0.7} flatShading />
      </mesh>
    </group>
  )
}

// -------------------------------------------------------------
// 6B. PARKED STYLIZED VEHICLES (Matching Reference Style)
// -------------------------------------------------------------
export function ParkedCar({
  position,
  rotation = 0,
  carType = 'sedan',
  color = '#3b82f6',
  isPolice: isPoliceProp,
  isAmbulance: isAmbulanceProp,
  isTaxi: isTaxiProp,
  isTruck: isTruckProp
}: {
  position: [number, number, number]
  rotation?: number
  carType?: 'sedan' | 'taxi' | 'police' | 'ambulance' | 'truck'
  color?: string
  isPolice?: boolean
  isAmbulance?: boolean
  isTaxi?: boolean
  isTruck?: boolean
}) {
  const isPolice = isPoliceProp ?? carType === 'police'
  const isAmbulance = isAmbulanceProp ?? carType === 'ambulance'
  const isTaxi = isTaxiProp ?? carType === 'taxi'
  const isTruck = isTruckProp ?? carType === 'truck'

  const w = isTruck ? 1.05 : isAmbulance ? 1.0 : 0.88
  const l = isTruck ? 2.8 : isAmbulance ? 2.6 : isTaxi || isPolice ? 1.85 : 1.75
  const h = isTruck ? 1.2 : isAmbulance ? 1.0 : 0.48

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Chassis Body */}
      <mesh position={[0, h * 0.45, 0]} castShadow>
        <boxGeometry args={[w, h * 0.5, l]} />
        <meshStandardMaterial
          color={isPolice ? '#1e293b' : isAmbulance ? '#f8fafc' : isTaxi ? '#eab308' : color}
          roughness={0.3}
          metalness={0.2}
          flatShading
        />
      </mesh>
      {/* Cabin Roof */}
      <mesh position={[0, h * 0.8, isTruck ? -0.4 : isAmbulance ? 0 : -0.1]} castShadow>
        <boxGeometry args={[w * 0.86, h * 0.45, isTruck ? l * 0.6 : isAmbulance ? l * 0.9 : l * 0.52]} />
        <meshStandardMaterial
          color={isPolice ? '#f8fafc' : isAmbulance ? '#f8fafc' : isTruck ? '#cbd5e1' : '#0f172a'}
          roughness={0.4}
          flatShading
        />
      </mesh>
      {/* Police / Taxi / Ambulance Rooftop Lights */}
      {isPolice && (
        <mesh position={[0, h + 0.12, -0.1]}>
          <boxGeometry args={[0.3, 0.08, 0.12]} />
          <meshStandardMaterial color="#0284c7" emissive="#0284c7" emissiveIntensity={1.8} />
        </mesh>
      )}
      {isTaxi && (
        <mesh position={[0, h + 0.12, -0.1]}>
          <boxGeometry args={[0.26, 0.08, 0.12]} />
          <meshStandardMaterial color="#fef08a" emissive="#eab308" emissiveIntensity={1.2} />
        </mesh>
      )}
      {isAmbulance && (
        <group position={[0, h + 0.12, 0.2]}>
          <mesh>
            <boxGeometry args={[0.35, 0.08, 0.14]} />
            <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={2.0} />
          </mesh>
          <mesh position={[w * 0.44, 0, 0]}>
            <boxGeometry args={[0.02, 0.35, 0.35]} />
            <meshStandardMaterial color="#ef4444" />
          </mesh>
        </group>
      )}
      {/* Wheels */}
      {[-w * 0.51, w * 0.51].map((wx, i) =>
        [-l * 0.3, l * 0.3].map((wz, j) => (
          <mesh key={`pwhl-${i}-${j}`} position={[wx, 0.12, wz]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.13, 0.13, 0.08, 8]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} flatShading />
          </mesh>
        ))
      )}
    </group>
  )
}

// -------------------------------------------------------------
// 6C. STYLIZED BASKETBALL COURT (Matching Reference Bottom-Center)
// -------------------------------------------------------------
function BasketballCourt({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Court Asphalt Base */}
      <mesh position={[0, 0.06, 0]} receiveShadow>
        <boxGeometry args={[7.8, 0.12, 5.2]} />
        <meshStandardMaterial color="#334155" roughness={0.8} />
      </mesh>
      {/* Red Key Court Surface */}
      <mesh position={[0, 0.125, 0]}>
        <planeGeometry args={[7.2, 4.6]} />
        <meshStandardMaterial color="#dc2626" roughness={0.7} />
      </mesh>
      {/* Blue 3-point Area */}
      {[-2.2, 2.2].map((bx, i) => (
        <mesh key={`b-arc-${i}`} position={[bx, 0.13, 0]}>
          <circleGeometry args={[1.4, 16, 0, Math.PI]} />
          <meshStandardMaterial color="#0284c7" />
        </mesh>
      ))}
      {/* Center Circle & Lines */}
      <mesh position={[0, 0.131, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.65, 0.72, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      {/* Perimeter White Line */}
      <mesh position={[0, 0.13, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[7.2, 0.06]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      {/* 2 Basketball Hoops */}
      {[-3.3, 3.3].map((hx, idx) => (
        <group key={`b-hoop-${idx}`} position={[hx, 0.12, 0]} rotation={[0, idx === 0 ? Math.PI / 2 : -Math.PI / 2, 0]}>
          <mesh position={[0, 1.3, -0.3]}>
            <cylinderGeometry args={[0.04, 0.04, 2.6, 6]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          <mesh position={[0, 2.35, 0]}>
            <boxGeometry args={[1.0, 0.7, 0.04]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          <mesh position={[0, 2.15, 0.22]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.18, 0.02, 6, 12]} />
            <meshStandardMaterial color="#ea580c" />
          </mesh>
        </group>
      ))}
      {/* Chainlink Fence Railing */}
      {[-2.55, 2.55].map((fz, i) => (
        <mesh key={`fence-${i}`} position={[0, 0.7, fz]}>
          <boxGeometry args={[7.8, 1.2, 0.04]} />
          <meshStandardMaterial color="#94a3b8" transparent opacity={0.4} metalness={0.7} />
        </mesh>
      ))}
      {/* Courtside Waiting Bench */}
      <mesh position={[0, 0.35, 2.9]}>
        <boxGeometry args={[2.4, 0.12, 0.4]} />
        <meshStandardMaterial color="#78350f" flatShading />
      </mesh>
    </group>
  )
}

// -------------------------------------------------------------
// 6D. STYLIZED LOW-POLY HOSPITAL COMPLEX (Matching Reference Left)
// -------------------------------------------------------------
function StylizedHospital({ position, isNight = false }: { position: [number, number, number]; isNight?: boolean }) {
  return (
    <group position={position}>
      {/* Concrete Foundation / Sidewalk Setback */}
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <boxGeometry args={[11.6, 0.1, 10.4]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.7} flatShading />
      </mesh>

      {/* Main Ground & 2nd Floor Hospital Wing */}
      <mesh position={[0, 1.8, -0.6]} castShadow receiveShadow>
        <boxGeometry args={[10.4, 3.5, 7.2]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.4} flatShading />
      </mesh>

      {/* Blue Horizontal Accent Ribbon */}
      <mesh position={[0, 1.8, -0.6]}>
        <boxGeometry args={[10.45, 0.45, 7.25]} />
        <meshStandardMaterial color="#0284c7" flatShading />
      </mesh>

      {/* Window Rows (Ground & Upper) */}
      {[-3.6, -1.8, 0, 1.8, 3.6].map((wx, i) => (
        <group key={`hosp-win-${i}`}>
          <mesh position={[wx, 2.7, 3.02]}>
            <boxGeometry args={[1.2, 0.85, 0.04]} />
            <meshStandardMaterial color="#38bdf8" roughness={0.2} metalness={0.4} />
          </mesh>
          <mesh position={[wx, 0.9, 3.02]}>
            <boxGeometry args={[1.2, 0.85, 0.04]} />
            <meshStandardMaterial color="#38bdf8" roughness={0.2} metalness={0.4} />
          </mesh>
        </group>
      ))}

      {/* 3rd Floor Stepped Penthouse Wing */}
      <mesh position={[-0.8, 4.3, -0.8]} castShadow receiveShadow>
        <boxGeometry args={[7.2, 1.6, 5.4]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.4} flatShading />
      </mesh>

      {/* Front Entrance Canopy & "HOSPITAL" Marquee */}
      <group position={[0, 0, 3.0]}>
        <mesh position={[0, 1.9, 0.8]} castShadow>
          <boxGeometry args={[3.8, 0.18, 1.6]} />
          <meshStandardMaterial color="#0284c7" flatShading />
        </mesh>
        {[-1.6, 1.6].map((px, i) => (
          <mesh key={`hosp-pillar-${i}`} position={[px, 0.9, 1.4]} castShadow>
            <cylinderGeometry args={[0.07, 0.07, 1.8, 6]} />
            <meshStandardMaterial color="#ffffff" flatShading />
          </mesh>
        ))}
        {/* Entrance Glass Sliding Doors */}
        <mesh position={[0, 0.9, 0.04]}>
          <boxGeometry args={[2.2, 1.7, 0.06]} />
          <meshStandardMaterial color="#38bdf8" transparent opacity={0.7} />
        </mesh>
        {/* Sign Fascia with Blue Header */}
        <mesh position={[0, 2.2, 0.85]}>
          <boxGeometry args={[3.0, 0.45, 0.08]} />
          <meshStandardMaterial color="#0284c7" />
        </mesh>
      </group>

      {/* Circular Blue Rooftop Helipad with "H" */}
      <group position={[1.8, 5.15, -0.8]}>
        {/* Helipad Base */}
        <mesh receiveShadow>
          <cylinderGeometry args={[2.0, 2.0, 0.12, 24]} />
          <meshStandardMaterial color="#1e293b" flatShading />
        </mesh>
        {/* Cyan Circle */}
        <mesh position={[0, 0.07, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1.8, 24]} />
          <meshStandardMaterial color="#0284c7" />
        </mesh>
        {/* White Ring */}
        <mesh position={[0, 0.075, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.5, 1.65, 24]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        {/* Helipad "H" Marking */}
        {[-0.45, 0.45].map((hx, idx) => (
          <mesh key={`h-bar-${idx}`} position={[hx, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.2, 1.2]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        ))}
        <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.7, 0.2]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>

      {/* Rooftop HVAC Chiller Units */}
      <group position={[-2.8, 5.3, -1.2]}>
        <mesh castShadow>
          <boxGeometry args={[1.4, 0.8, 1.1]} />
          <meshStandardMaterial color="#94a3b8" flatShading />
        </mesh>
        <mesh position={[0, 0.42, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.35, 12]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
      </group>
      <group position={[-1.2, 5.25, -2.2]}>
        <mesh castShadow>
          <boxGeometry args={[1.1, 0.7, 0.9]} />
          <meshStandardMaterial color="#cbd5e1" flatShading />
        </mesh>
      </group>

      {/* Emergency Parking Apron with Marked Stalls */}
      <group position={[0, 0.06, 4.2]}>
        <mesh receiveShadow>
          <boxGeometry args={[10.4, 0.02, 3.2]} />
          <meshStandardMaterial color="#334155" roughness={0.8} />
        </mesh>
        {/* White Parking Stripe Dividers */}
        {[-4.2, -2.1, 0, 2.1, 4.2].map((sx, i) => (
          <mesh key={`hosp-stall-${i}`} position={[sx, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.08, 2.8]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        ))}

        {/* 2 Parked Ambulances */}
        <ParkedCar position={[-3.1, 0.02, 0.1]} rotation={0} color="#f8fafc" isAmbulance />
        <ParkedCar position={[-1.0, 0.02, 0.1]} rotation={0} color="#f8fafc" isAmbulance />

        {/* Parked Yellow Taxi & Sedan */}
        <ParkedCar position={[1.0, 0.02, 0.1]} rotation={0} isTaxi />
        <ParkedCar position={[3.1, 0.02, 0.1]} rotation={0} color="#0284c7" />
      </group>

      {/* Bus Stop Shelter with Curved Blue Canopy */}
      <group position={[-5.0, 0.1, 4.2]} rotation={[0, Math.PI / 2, 0]}>
        <mesh position={[0, 1.1, -0.4]} castShadow>
          <boxGeometry args={[2.0, 1.8, 0.05]} />
          <meshPhysicalMaterial color="#38bdf8" transparent opacity={0.6} />
        </mesh>
        <mesh position={[0, 2.05, 0]} castShadow>
          <boxGeometry args={[2.2, 0.1, 1.0]} />
          <meshStandardMaterial color="#0284c7" flatShading />
        </mesh>
        {/* Waiting Bench */}
        <mesh position={[0, 0.45, -0.2]}>
          <boxGeometry args={[1.5, 0.1, 0.35]} />
          <meshStandardMaterial color="#78350f" flatShading />
        </mesh>
      </group>

      {/* Lush Low-Poly Faceted Trees around perimeter */}
      <LowPolyFacetedTree position={[-5.2, 0.1, -3.8]} scale={1.1} type="round" shade="#16a34a" />
      <LowPolyFacetedTree position={[5.2, 0.1, -3.8]} scale={1.0} type="tiered" shade="#22c55e" />
      <LowPolyFacetedTree position={[5.2, 0.1, 3.8]} scale={0.9} type="round" shade="#4ade80" />

      {isNight && (
        <pointLight position={[0, 2.4, 3.8]} intensity={2.2} distance={8} color="#fde047" />
      )}
    </group>
  )
}

// -------------------------------------------------------------
// 6E. STYLIZED SUPERMARKET & LOADING DOCK (Matching Reference Middle-Right)
// -------------------------------------------------------------
function StylizedSupermarket({ position, isNight = false }: { position: [number, number, number]; isNight?: boolean }) {
  return (
    <group position={position}>
      {/* Foundation & Pavement Base */}
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <boxGeometry args={[11.2, 0.1, 8.8]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.7} flatShading />
      </mesh>

      {/* Main Commercial Store Building */}
      <mesh position={[0, 1.9, -0.6]} castShadow receiveShadow>
        <boxGeometry args={[9.8, 3.7, 5.6]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.5} flatShading />
      </mesh>

      {/* Red Parapet Header / Marquee (Matching "SUPERMARKET" in reference) */}
      <mesh position={[0, 3.85, 2.22]} castShadow>
        <boxGeometry args={[7.8, 1.05, 0.25]} />
        <meshStandardMaterial color="#dc2626" roughness={0.4} flatShading />
      </mesh>
      {/* White Signplate Contrast Inset */}
      <mesh position={[0, 3.85, 2.36]}>
        <boxGeometry args={[6.8, 0.65, 0.04]} />
        <meshStandardMaterial color="#ffffff" flatShading />
      </mesh>
      {/* Red Sign Accent Bar */}
      <mesh position={[0, 3.85, 2.39]}>
        <boxGeometry args={[6.2, 0.22, 0.02]} />
        <meshStandardMaterial color="#ef4444" flatShading />
      </mesh>

      {/* Glass Storefront Windows & Sliding Doors */}
      <mesh position={[0, 1.1, 2.22]}>
        <boxGeometry args={[8.4, 2.0, 0.06]} />
        <meshStandardMaterial color="#38bdf8" roughness={0.2} metalness={0.5} />
      </mesh>

      {/* Rear Loading Dock for Delivery Trucks */}
      <group position={[0, 0, -3.5]}>
        <mesh position={[0, 0.35, -0.8]} receiveShadow>
          <boxGeometry args={[3.8, 0.6, 1.6]} />
          <meshStandardMaterial color="#64748b" roughness={0.7} flatShading />
        </mesh>
        {/* Roll-up Loading Bay Door */}
        <mesh position={[0, 1.4, 0.02]}>
          <boxGeometry args={[2.2, 2.1, 0.06]} />
          <meshStandardMaterial color="#334155" roughness={0.8} flatShading />
        </mesh>
        {/* Parked White Delivery Truck at Loading Bay */}
        <ParkedCar position={[0, 0.05, -1.8]} rotation={0} color="#f8fafc" isTruck />
      </group>

      {/* Front Customer Parking Lot with Marked Stalls */}
      <group position={[0, 0.06, 3.2]}>
        <mesh receiveShadow>
          <boxGeometry args={[9.8, 0.02, 2.2]} />
          <meshStandardMaterial color="#334155" roughness={0.8} />
        </mesh>
        {[-3.6, -1.8, 0, 1.8, 3.6].map((sx, i) => (
          <mesh key={`market-stall-${i}`} position={[sx, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.08, 1.8]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        ))}
        {/* Parked Customer Cars */}
        <ParkedCar position={[-2.7, 0.02, 0]} rotation={0} color="#e2e8f0" />
        <ParkedCar position={[-0.9, 0.02, 0]} rotation={0} color="#ef4444" />
        <ParkedCar position={[2.7, 0.02, 0]} rotation={0} color="#3b82f6" />
      </group>

      {/* Low-Poly Faceted Trees around store */}
      <LowPolyFacetedTree position={[-4.8, 0.1, -1.5]} scale={1.0} type="round" shade="#16a34a" />
      <LowPolyFacetedTree position={[4.8, 0.1, -1.5]} scale={1.05} type="tiered" shade="#22c55e" />

      {isNight && (
        <pointLight position={[0, 2.8, 2.8]} intensity={2.0} distance={7} color="#fef08a" />
      )}
    </group>
  )
}

// -------------------------------------------------------------
// 6F. INDUSTRIAL QUONSET HANGARS & PROPANE TANKS (Matching Reference Right)
// -------------------------------------------------------------
function IndustrialQuonsetHangars({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Foundation Concrete Apron */}
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <boxGeometry args={[11.8, 0.1, 10.5]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.8} flatShading />
      </mesh>

      {/* Hangar 1 (Left Blue Semi-Cylindrical Arched Hangar) */}
      <group position={[-2.8, 0.1, 0]}>
        {/* Semi-Cylinder Arched Roof: half cylinder rotated on its side */}
        <mesh position={[0, 0, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow>
          <cylinderGeometry args={[2.5, 2.5, 7.8, 16, 1, false, 0, Math.PI]} />
          <meshStandardMaterial color="#2563eb" roughness={0.5} flatShading />
        </mesh>
        {/* Front End Wall with Bay Door */}
        <mesh position={[0, 0, 3.9]} rotation={[0, 0, 0]}>
          <circleGeometry args={[2.48, 16, 0, Math.PI]} />
          <meshStandardMaterial color="#1e40af" flatShading />
        </mesh>
        <mesh position={[0, 0.9, 3.92]}>
          <boxGeometry args={[1.8, 1.8, 0.06]} />
          <meshStandardMaterial color="#0f172a" flatShading />
        </mesh>
        {/* Rear End Wall */}
        <mesh position={[0, 0, -3.9]} rotation={[0, Math.PI, 0]}>
          <circleGeometry args={[2.48, 16, 0, Math.PI]} />
          <meshStandardMaterial color="#1e40af" flatShading />
        </mesh>
      </group>

      {/* Hangar 2 (Right Blue Semi-Cylindrical Arched Hangar) */}
      <group position={[3.2, 0.1, 0]}>
        <mesh position={[0, 0, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow>
          <cylinderGeometry args={[2.5, 2.5, 7.8, 16, 1, false, 0, Math.PI]} />
          <meshStandardMaterial color="#1d4ed8" roughness={0.5} flatShading />
        </mesh>
        {/* Front End Wall with Bay Door */}
        <mesh position={[0, 0, 3.9]} rotation={[0, 0, 0]}>
          <circleGeometry args={[2.48, 16, 0, Math.PI]} />
          <meshStandardMaterial color="#1e40af" flatShading />
        </mesh>
        <mesh position={[0, 0.9, 3.92]}>
          <boxGeometry args={[1.8, 1.8, 0.06]} />
          <meshStandardMaterial color="#0f172a" flatShading />
        </mesh>
        {/* Rear End Wall */}
        <mesh position={[0, 0, -3.9]} rotation={[0, Math.PI, 0]}>
          <circleGeometry args={[2.48, 16, 0, Math.PI]} />
          <meshStandardMaterial color="#1e40af" flatShading />
        </mesh>
      </group>

      {/* 3 Bright Yellow Propane / Gas Cylindrical Tanks */}
      <group position={[0, 0.1, 4.4]}>
        {[-1.6, 0, 1.6].map((tx, i) => (
          <group key={`prop-tank-${i}`} position={[tx, 0, 0]}>
            {/* Concrete Cradles */}
            <mesh position={[0, 0.12, -0.4]}>
              <boxGeometry args={[0.7, 0.24, 0.15]} />
              <meshStandardMaterial color="#64748b" flatShading />
            </mesh>
            <mesh position={[0, 0.12, 0.4]}>
              <boxGeometry args={[0.7, 0.24, 0.15]} />
              <meshStandardMaterial color="#64748b" flatShading />
            </mesh>
            {/* Yellow Horizontal Tank */}
            <mesh position={[0, 0.45, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[0.35, 0.35, 1.2, 12]} />
              <meshStandardMaterial color="#eab308" roughness={0.4} flatShading />
            </mesh>
          </group>
        ))}
        {/* Silver Connecting Pipe */}
        <mesh position={[0, 0.75, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.04, 0.04, 3.4, 8]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.8} />
        </mesh>
      </group>

      {/* Wooden Cargo Pallets & Crates */}
      <group position={[-4.5, 0.1, 2.5]}>
        <mesh position={[0, 0.4, 0]} castShadow>
          <boxGeometry args={[0.8, 0.8, 0.8]} />
          <meshStandardMaterial color="#b45309" roughness={0.9} flatShading />
        </mesh>
        <mesh position={[0.7, 0.3, 0.4]} castShadow>
          <boxGeometry args={[0.6, 0.6, 0.6]} />
          <meshStandardMaterial color="#d97706" roughness={0.9} flatShading />
        </mesh>
      </group>

      {/* Parked Cargo Box Truck */}
      <ParkedCar position={[4.6, 0.1, 3.2]} rotation={0} color="#f8fafc" isTruck />

      {/* Lush Faceted Low-Poly Trees along the back */}
      <LowPolyFacetedTree position={[-4.8, 0.1, -4.2]} scale={1.2} type="pine" shade="#15803d" />
      <LowPolyFacetedTree position={[0, 0.1, -4.2]} scale={1.1} type="round" shade="#16a34a" />
      <LowPolyFacetedTree position={[4.8, 0.1, -4.2]} scale={1.2} type="pine" shade="#15803d" />
    </group>
  )
}

// -------------------------------------------------------------
// 6G. STYLIZED POLICE STATION & CLASSIC HOTEL (Matching Reference Bottom-Right)
// -------------------------------------------------------------
function StylizedPoliceAndHotel({ isNight = false }: { isNight?: boolean }) {
  return (
    <group position={[0, 0, 0]}>
      {/* Stylized Police Precinct Station (x: -10.5, z: 33) */}
      <group position={[-10.5, 0, 33]}>
        {/* Base */}
        <mesh position={[0, 0.05, 0]} receiveShadow>
          <boxGeometry args={[7.2, 0.1, 6.8]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.7} flatShading />
        </mesh>
        {/* Main Station Building */}
        <mesh position={[0, 1.8, -0.6]} castShadow receiveShadow>
          <boxGeometry args={[6.2, 3.6, 4.8]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.4} flatShading />
        </mesh>
        {/* Dark Blue Roof Parapet / Trim */}
        <mesh position={[0, 3.7, -0.6]} castShadow>
          <boxGeometry args={[6.5, 0.3, 5.1]} />
          <meshStandardMaterial color="#1e3a8a" flatShading />
        </mesh>
        {/* Blue "POLICE" Sign Strip */}
        <mesh position={[0, 3.2, 1.83]}>
          <boxGeometry args={[3.8, 0.55, 0.06]} />
          <meshStandardMaterial color="#1e40af" />
        </mesh>
        {/* Glass Entrance Canopy */}
        <mesh position={[0, 1.8, 2.2]} castShadow>
          <boxGeometry args={[2.4, 0.12, 1.0]} />
          <meshStandardMaterial color="#0284c7" flatShading />
        </mesh>
        {/* Blue Flashing Emergency Rooftop Beacon */}
        <mesh position={[0, 4.0, -0.6]}>
          <cylinderGeometry args={[0.22, 0.25, 0.35, 8]} />
          <meshStandardMaterial color="#0284c7" emissive="#0284c7" emissiveIntensity={isNight ? 2.5 : 1.0} />
        </mesh>
        {/* Parked Police Cruisers */}
        <group position={[0, 0.06, 2.3]}>
          <ParkedCar position={[-1.5, 0.02, 0]} rotation={0} isPolice />
          <ParkedCar position={[1.5, 0.02, 0]} rotation={0} isPolice />
        </group>
        {/* Trees */}
        <LowPolyFacetedTree position={[-3.0, 0.1, -2.8]} scale={0.9} type="round" shade="#16a34a" />
      </group>

      {/* Classic Mint Hotel (x: 10.5, z: 33) */}
      <group position={[10.5, 0, 33]}>
        {/* Base */}
        <mesh position={[0, 0.05, 0]} receiveShadow>
          <boxGeometry args={[7.2, 0.1, 6.8]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.7} flatShading />
        </mesh>
        {/* Hotel Facade in Mint Green */}
        <mesh position={[0, 2.6, -0.6]} castShadow receiveShadow>
          <boxGeometry args={[6.2, 5.2, 4.8]} />
          <meshStandardMaterial color="#a7f3d0" roughness={0.4} flatShading />
        </mesh>
        {/* Classical White Columns at Entrance */}
        {[-1.6, -0.5, 0.5, 1.6].map((cx, i) => (
          <mesh key={`hotel-col-${i}`} position={[cx, 1.4, 1.9]} castShadow>
            <cylinderGeometry args={[0.12, 0.14, 2.8, 8]} />
            <meshStandardMaterial color="#f8fafc" flatShading />
          </mesh>
        ))}
        {/* Balcony Overhang over Columns */}
        <mesh position={[0, 2.85, 2.0]} castShadow>
          <boxGeometry args={[4.2, 0.15, 1.0]} />
          <meshStandardMaterial color="#ffffff" flatShading />
        </mesh>
        {/* Golden "HOTEL" Rooftop Sign Header */}
        <mesh position={[0, 5.35, 1.82]}>
          <boxGeometry args={[3.2, 0.5, 0.06]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Parked Guest Luxury Car */}
        <ParkedCar position={[0, 0.08, 2.3]} rotation={0} color="#0f172a" />
        {/* Trees */}
        <LowPolyFacetedTree position={[3.0, 0.1, -2.8]} scale={1.0} type="tiered" shade="#22c55e" />
      </group>
    </group>
  )
}

// -------------------------------------------------------------
// 6H. STYLIZED COFFEE HOUSE & BARBER SHOP (Matching Reference Center-Bottom)
// -------------------------------------------------------------
function StylizedCoffeeAndBarber() {
  return (
    <group position={[0, 0, 0]}>
      {/* Barber Shop (x: -10.5, z: 40) */}
      <group position={[-10.5, 0, 40]}>
        <mesh position={[0, 1.4, 0]} castShadow receiveShadow>
          <boxGeometry args={[5.2, 2.8, 4.2]} />
          <meshStandardMaterial color="#1e293b" roughness={0.6} flatShading />
        </mesh>
        {/* White Upper Parapet */}
        <mesh position={[0, 2.9, 0]} castShadow>
          <boxGeometry args={[5.4, 0.25, 4.4]} />
          <meshStandardMaterial color="#f8fafc" flatShading />
        </mesh>
        {/* Striped Canopy Awning */}
        <mesh position={[0, 1.9, 2.2]} rotation={[-0.25, 0, 0]} castShadow>
          <boxGeometry args={[4.2, 0.08, 1.0]} />
          <meshStandardMaterial color="#0284c7" flatShading />
        </mesh>
        {/* Barber Pole */}
        <group position={[2.4, 1.4, 2.15]}>
          <mesh>
            <cylinderGeometry args={[0.08, 0.08, 0.9, 8]} />
            <meshStandardMaterial color="#ef4444" flatShading />
          </mesh>
          <mesh position={[0, 0.5, 0]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        </group>
        {/* Parked Taxi */}
        <ParkedCar position={[-1.2, 0.05, 2.6]} rotation={0} isTaxi />
      </group>

      {/* Coffee House with Outdoor Umbrella Patio (x: 10.5, z: 40) */}
      <group position={[10.5, 0, 40]}>
        <mesh position={[0, 1.6, 0]} castShadow receiveShadow>
          <boxGeometry args={[5.2, 3.2, 4.2]} />
          <meshStandardMaterial color="#fef3c7" roughness={0.5} flatShading />
        </mesh>
        {/* Red Roof Coping */}
        <mesh position={[0, 3.3, 0]} castShadow>
          <boxGeometry args={[5.4, 0.25, 4.4]} />
          <meshStandardMaterial color="#dc2626" flatShading />
        </mesh>
        {/* Coffee Sign Header */}
        <mesh position={[0, 2.7, 2.13]}>
          <boxGeometry args={[3.2, 0.45, 0.06]} />
          <meshStandardMaterial color="#78350f" flatShading />
        </mesh>
        {/* Outdoor Cafe Patio with Umbrella Tables */}
        {[-1.2, 1.2].map((tx, i) => (
          <group key={`cafe-tab-${i}`} position={[tx, 0, 2.6]}>
            <mesh position={[0, 0.35, 0]}>
              <cylinderGeometry args={[0.35, 0.35, 0.05, 8]} />
              <meshStandardMaterial color="#ffffff" flatShading />
            </mesh>
            <mesh position={[0, 0.17, 0]}>
              <cylinderGeometry args={[0.03, 0.03, 0.35, 6]} />
              <meshStandardMaterial color="#334155" />
            </mesh>
            {/* Colorful Sun Umbrella */}
            <mesh position={[0, 1.1, 0]}>
              <coneGeometry args={[0.65, 0.35, 6]} />
              <meshStandardMaterial color={i === 0 ? '#dc2626' : '#0284c7'} flatShading />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  )
}

// -------------------------------------------------------------
// 6I. SUBURBAN LOW-POLY HOMES WITH DORMERS & LAWNS (Matching Reference Top)
// -------------------------------------------------------------
function SuburbanLowPolyHomes() {
  const homes = [
    { x: -36, z: -30, roofColor: '#0284c7', wallColor: '#f8fafc', dormer: true, car: 'yellow' },
    { x: -29, z: -30, roofColor: '#ea580c', wallColor: '#fed7aa', dormer: true, car: 'blue' },
    { x: -36, z: -37, roofColor: '#15803d', wallColor: '#fef08a', dormer: true, car: 'red' },
    { x: -29, z: -37, roofColor: '#334155', wallColor: '#bae6fd', dormer: true, car: 'white' }
  ]

  return (
    <group position={[0, 0, 0]}>
      {homes.map((hm, idx) => (
        <group key={`sub-home-${idx}`} position={[hm.x, 0, hm.z]}>
          {/* Green Manicured Lawn */}
          <mesh position={[0, 0.03, 0]} receiveShadow>
            <boxGeometry args={[5.6, 0.06, 5.6]} />
            <meshStandardMaterial color="#22c55e" roughness={0.7} flatShading />
          </mesh>

          {/* House 2-Story Body */}
          <mesh position={[0, 1.3, -0.2]} castShadow receiveShadow>
            <boxGeometry args={[4.2, 2.6, 3.6]} />
            <meshStandardMaterial color={hm.wallColor} roughness={0.5} flatShading />
          </mesh>

          {/* Pitched Gable Roof */}
          <mesh position={[0, 3.1, -0.2]} rotation={[0, 0, 0]} castShadow>
            <coneGeometry args={[3.2, 1.5, 4]} />
            <meshStandardMaterial color={hm.roofColor} roughness={0.6} flatShading />
          </mesh>

          {/* White Dormer Window Protruding from Roof */}
          {hm.dormer && (
            <group position={[0, 3.0, 1.1]}>
              <mesh castShadow>
                <boxGeometry args={[0.85, 0.75, 0.8]} />
                <meshStandardMaterial color="#ffffff" flatShading />
              </mesh>
              <mesh position={[0, 0.45, 0]} rotation={[0, Math.PI / 4, 0]}>
                <coneGeometry args={[0.65, 0.4, 4]} />
                <meshStandardMaterial color={hm.roofColor} flatShading />
              </mesh>
              <mesh position={[0, 0, 0.42]}>
                <planeGeometry args={[0.55, 0.45]} />
                <meshStandardMaterial color="#38bdf8" roughness={0.2} />
              </mesh>
            </group>
          )}

          {/* Brick Chimney */}
          <mesh position={[1.1, 3.4, -0.8]} castShadow>
            <boxGeometry args={[0.4, 1.1, 0.4]} />
            <meshStandardMaterial color="#991b1b" flatShading />
          </mesh>

          {/* Front Porch & Door */}
          <mesh position={[0, 0.7, 1.62]}>
            <boxGeometry args={[0.9, 1.4, 0.05]} />
            <meshStandardMaterial color="#78350f" flatShading />
          </mesh>

          {/* Concrete Driveway with Parked Car */}
          <group position={[1.8, 0.04, 1.6]}>
            <mesh receiveShadow>
              <boxGeometry args={[1.4, 0.02, 2.2]} />
              <meshStandardMaterial color="#cbd5e1" roughness={0.8} />
            </mesh>
            <ParkedCar
              position={[0, 0.02, 0]}
              rotation={0}
              color={hm.car === 'yellow' ? '#eab308' : hm.car === 'blue' ? '#3b82f6' : hm.car === 'red' ? '#ef4444' : '#f8fafc'}
              isTaxi={hm.car === 'yellow'}
            />
          </group>

          {/* Low-Poly Faceted Garden Tree */}
          <LowPolyFacetedTree position={[-1.9, 0.06, 1.8]} scale={0.75} type="round" shade="#16a34a" />
        </group>
      ))}
    </group>
  )
}

// -------------------------------------------------------------
// 6J. ZEBRA PEDESTRIAN CROSSWALKS (At all 9 Intersections)
// -------------------------------------------------------------
function ZebraCrosswalks() {
  // 9 Intersections: (0,0), (0, ±24), (±24, 0), (±24, ±24)
  const intersections = [
    { x: 0, z: 0 },
    { x: 0, z: -24 },
    { x: 0, z: 24 },
    { x: -24, z: 0 },
    { x: 24, z: 0 },
    { x: -24, z: -24 },
    { x: 24, z: -24 },
    { x: -24, z: 24 },
    { x: 24, z: 24 }
  ]

  return (
    <group position={[0, 0, 0]}>
      {intersections.map((inter, idx) => (
        <group key={`zebra-int-${idx}`} position={[inter.x, 0.022, inter.z]}>
          {/* North Approach (Horizontal bar of stripes) */}
          {[-1.0, -0.5, 0, 0.5, 1.0].map((sx, i) => (
            <mesh key={`n-stripe-${i}`} position={[sx, 0, -2.4]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.26, 0.8]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          ))}
          {/* South Approach */}
          {[-1.0, -0.5, 0, 0.5, 1.0].map((sx, i) => (
            <mesh key={`s-stripe-${i}`} position={[sx, 0, 2.4]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.26, 0.8]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          ))}
          {/* West Approach */}
          {[-1.0, -0.5, 0, 0.5, 1.0].map((sz, i) => (
            <mesh key={`w-stripe-${i}`} position={[-2.4, 0, sz]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.8, 0.26]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          ))}
          {/* East Approach */}
          {[-1.0, -0.5, 0, 0.5, 1.0].map((sz, i) => (
            <mesh key={`e-stripe-${i}`} position={[2.4, 0, sz]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.8, 0.26]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          ))}
        </group>
      ))}
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
// 10. CIVIC LOW-POLY SUBURBAN RESIDENTIAL QUARTER (North-West)
// -------------------------------------------------------------
function CivicSportsAndEmergency({ isNight = false }: { isNight?: boolean }) {
  return (
    <group position={[0, 0, 0]}>
      {/* Low-Poly Suburban Homes with Pitched Roofs & Dormers (Matching Reference) */}
      <SuburbanLowPolyHomes />

      {/* Community Fire Station (x: -29, z: -41) */}
      <group position={[-29, 0, -41]}>
        <mesh position={[0, 1.8, 0]} castShadow receiveShadow>
          <boxGeometry args={[4.5, 3.6, 4.0]} />
          <meshStandardMaterial color="#b91c1c" roughness={0.6} flatShading />
        </mesh>
        {/* 2 Red Garage Bay Doors */}
        {[-1.2, 1.2].map((gx, i) => (
          <mesh key={`bay-${i}`} position={[gx, 1.2, 2.05]}>
            <boxGeometry args={[1.8, 2.4, 0.08]} />
            <meshStandardMaterial color="#dc2626" roughness={0.4} flatShading />
          </mesh>
        ))}
        {/* Siren Tower */}
        <mesh position={[1.5, 4.2, -1.2]} castShadow>
          <cylinderGeometry args={[0.3, 0.4, 1.5, 8]} />
          <meshStandardMaterial color="#7f1d1d" flatShading />
        </mesh>
        <mesh position={[1.5, 5.0, -1.2]}>
          <sphereGeometry args={[0.18, 8, 8]} />
          <meshStandardMaterial color="#facc15" emissive="#facc15" emissiveIntensity={isNight ? 2.0 : 0.5} />
        </mesh>
      </group>
    </group>
  )
}

// -------------------------------------------------------------
// 11. WEST CULTURE, RETAIL & SUPERMARKET (Middle-West Sector)
// -------------------------------------------------------------
function WestCultureAndDining({ isNight = false }: { isNight?: boolean }) {
  return (
    <group position={[0, 0, 0]}>
      {/* Stylized Low-Poly Supermarket & Loading Dock (Matching Reference) */}
      <StylizedSupermarket position={[-35, 0, 10.5]} isNight={isNight} />

      {/* Downtown Cinema & Theater (x: -35, z: -14) */}
      <group position={[-35, 0, -14]}>
        <mesh position={[0, 2.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[6.0, 4.4, 5.0]} />
          <meshStandardMaterial color="#0f172a" roughness={0.4} flatShading />
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
          <meshStandardMaterial color="#f8fafc" roughness={0.3} flatShading />
        </mesh>
        {/* Cyan Glass Window Banding */}
        <mesh position={[0, 3.0, 2.54]}>
          <boxGeometry args={[5.6, 1.2, 0.05]} />
          <meshPhysicalMaterial color="#06b6d4" transparent opacity={0.8} />
        </mesh>
      </group>
    </group>
  )
}

// -------------------------------------------------------------
// 13. INDUSTRIAL QUONSET HANGARS & LOGISTICS (South-East Sector)
// -------------------------------------------------------------
function SuburbanNeighborhood({ isNight: _isNight = false }: { isNight?: boolean } = {}) {
  return (
    <group position={[0, 0, 0]}>
      {/* Blue Quonset Hangars & Propane Logistics (Matching Reference Bottom-Right) */}
      <IndustrialQuonsetHangars position={[35, 0, 35]} />
    </group>
  )
}

// -------------------------------------------------------------
// 14. SOUTH CENTER POLICE PRECINCT, HOTEL & ARTISAN SHOPS
// -------------------------------------------------------------
function SouthCenterVillage({ isNight = false }: { isNight?: boolean }) {
  return (
    <group position={[0, 0, 0]}>
      {/* Stylized Police Station & Classic Mint Hotel (Matching Reference) */}
      <StylizedPoliceAndHotel isNight={isNight} />

      {/* Stylized Coffee House with Umbrella Patio & Barber Shop (Matching Reference) */}
      <StylizedCoffeeAndBarber />
    </group>
  )
}

// -------------------------------------------------------------
// 15. SOUTH-WEST HOSPITAL COMPLEX & BASKETBALL COURT
// -------------------------------------------------------------
function SouthWestLuxuryEstates({ isNight = false }: { isNight?: boolean }) {
  return (
    <group position={[0, 0, 0]}>
      {/* Stylized Hospital with Helipad, HVAC & Ambulances (Matching Reference Left) */}
      <StylizedHospital position={[-35, 0, 33]} isNight={isNight} />

      {/* Stylized Community Basketball Court (Matching Reference Bottom-Center) */}
      <BasketballCourt position={[-35, 0, 41]} />
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
// 17. SOUTH TROPICAL RESORT & MALDIVES WATER VILLAS ISLAND
// -------------------------------------------------------------
function SouthResortIsland({ isNight = false }: { isNight?: boolean }) {
  const waterRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (waterRef.current) {
      waterRef.current.position.y = -0.04 + Math.sin(state.clock.getElapsedTime() * 1.2) * 0.01
    }
  })

  return (
    <group position={[0, 0, 118]}>
      {/* 1. Island Landmass (86m x 54m) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[86, 54]} />
        <meshStandardMaterial color={isNight ? '#064e3b' : '#15803d'} roughness={0.8} />
      </mesh>

      {/* 2. Sandy Beach Perimeter */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <ringGeometry args={[40, 52, 32]} />
        <meshStandardMaterial color={isNight ? '#78716c' : '#fef08a'} roughness={0.9} />
      </mesh>

      {/* 3. Turquoise Lagoon Water Ring */}
      <mesh ref={waterRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]}>
        <ringGeometry args={[46, 68, 32]} />
        <meshPhysicalMaterial
          color={isNight ? '#083344' : '#06b6d4'}
          transparent
          opacity={0.82}
          roughness={0.08}
        />
      </mesh>

      {/* 4. Grand Horizon Luxury Resort & Spa Hotel (Curved Modern Hotel) */}
      <group position={[0, 0, -10]}>
        <mesh position={[0, 4.0, 0]} castShadow receiveShadow>
          <boxGeometry args={[32.0, 8.0, 10.0]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.3} />
        </mesh>
        {/* Tier 2 Balcony Floor */}
        <mesh position={[0, 8.8, -1.0]} castShadow>
          <boxGeometry args={[26.0, 2.2, 8.0]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.3} />
        </mesh>
        {/* Penthouse Suite */}
        <mesh position={[0, 10.6, -1.5]} castShadow>
          <boxGeometry args={[18.0, 1.8, 6.0]} />
          <meshStandardMaterial color="#0284c7" />
        </mesh>
        {/* Glass Window Balconies */}
        {[-12, -6, 0, 6, 12].map((bx, i) => (
          <mesh key={`res-balc-${i}`} position={[bx, 4.2, 5.06]}>
            <boxGeometry args={[4.2, 6.2, 0.1]} />
            <meshPhysicalMaterial color="#38bdf8" transparent opacity={0.7} />
          </mesh>
        ))}
        {/* Curved Glass Entrance Atrium */}
        <mesh position={[0, 2.2, 5.6]}>
          <cylinderGeometry args={[4.2, 4.2, 4.4, 16, 1, false, 0, Math.PI]} />
          <meshPhysicalMaterial color="#38bdf8" transparent opacity={0.8} roughness={0.1} />
        </mesh>
        {isNight && (
          <pointLight position={[0, 3.0, 7.0]} intensity={3.5} distance={16} color="#fde047" />
        )}
      </group>

      {/* 5. Cascading Oceanfront Infinity Pool */}
      <group position={[0, 0, 4]}>
        <mesh position={[0, 0.4, 0]} receiveShadow>
          <boxGeometry args={[20.0, 0.8, 8.0]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.78, 0]}>
          <boxGeometry args={[18.4, 0.1, 6.8]} />
          <meshPhysicalMaterial
            color="#06b6d4"
            emissive={isNight ? '#06b6d4' : '#000000'}
            emissiveIntensity={isNight ? 1.2 : 0}
            transparent
            opacity={0.9}
            roughness={0.05}
          />
        </mesh>
        {/* Poolside Sun Loungers */}
        {[-8, -5, -2, 2, 5, 8].map((lx, i) => (
          <mesh key={`lounger-${i}`} position={[lx, 0.9, 3.2]} castShadow>
            <boxGeometry args={[0.9, 0.18, 1.6]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        ))}
      </group>

      {/* 6. Maldives Over-Water Stilt Bungalows (6 Thatch-Roof Villas on Stilts) */}
      <group position={[0, 0, 22]}>
        {/* Main Boardwalk Pier */}
        <mesh position={[0, 0.35, 0]} receiveShadow>
          <boxGeometry args={[2.4, 0.25, 26.0]} />
          <meshStandardMaterial color="#78350f" roughness={0.8} />
        </mesh>
        {/* 6 Over-Water Villas branching off pier */}
        {[-8, 0, 8].map((vx, i) =>
          [-6, 6].map((vz, j) => (
            <group key={`stilt-villa-${i}-${j}`} position={[vx > 0 ? vx + 4 : vx - 4, 0, vz]}>
              {/* Branch Boardwalk */}
              <mesh position={[vx > 0 ? -2.2 : 2.2, 0.35, 0]}>
                <boxGeometry args={[4.4, 0.22, 1.4]} />
                <meshStandardMaterial color="#78350f" roughness={0.8} />
              </mesh>
              {/* Stilts into water */}
              {[-1.8, 1.8].map((sx, k) =>
                [-1.8, 1.8].map((sz, l) => (
                  <mesh key={`stilt-${k}-${l}`} position={[sx, -0.4, sz]}>
                    <cylinderGeometry args={[0.08, 0.1, 1.8, 6]} />
                    <meshStandardMaterial color="#573a1e" />
                  </mesh>
                ))
              )}
              {/* Villa Deck */}
              <mesh position={[0, 0.45, 0]} receiveShadow>
                <boxGeometry args={[4.8, 0.2, 4.8]} />
                <meshStandardMaterial color="#854d0e" roughness={0.8} />
              </mesh>
              {/* Villa Walls */}
              <mesh position={[0, 1.6, 0]} castShadow>
                <boxGeometry args={[3.8, 2.2, 3.8]} />
                <meshStandardMaterial color="#fef3c7" roughness={0.6} />
              </mesh>
              {/* Thatched Straw Roof */}
              <mesh position={[0, 3.2, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
                <coneGeometry args={[3.6, 1.6, 4]} />
                <meshStandardMaterial color="#b45309" roughness={0.9} />
              </mesh>
              {isNight && (
                <pointLight position={[0, 1.8, 1.8]} intensity={1.6} distance={6} color="#fef08a" />
              )}
            </group>
          ))
        )}
      </group>

      {/* 7. Coconut Palm Groves */}
      {[-24, -16, 16, 24].map((px, i) => (
        <React.Fragment key={`resort-palms-${i}`}>
          <PalmTree position={[px, 0, -18]} />
          <PalmTree position={[px, 0, 8]} />
        </React.Fragment>
      ))}

      {/* 8. Connecting South Ocean Causeway Bridge (Linking Main Island to Resort Island) */}
      {/* Spans from Main Island south road (z = 46) to Resort Island (z = 90) */}
      <group position={[0, 0, -48]}>
        <mesh position={[0, 0.4, 0]} receiveShadow>
          <boxGeometry args={[4.2, 0.35, 46.0]} />
          <meshStandardMaterial color="#1e293b" roughness={0.8} />
        </mesh>
        {/* White Guardrails */}
        <mesh position={[-2.05, 0.75, 0]}>
          <boxGeometry args={[0.15, 0.4, 46.0]} />
          <meshStandardMaterial color="#cbd5e1" />
        </mesh>
        <mesh position={[2.05, 0.75, 0]}>
          <boxGeometry args={[0.15, 0.4, 46.0]} />
          <meshStandardMaterial color="#cbd5e1" />
        </mesh>
        {/* Bridge Concrete Support Pillars into ocean */}
        {[-16, -6, 6, 16].map((pz, idx) => (
          <mesh key={`s-bridge-pier-${idx}`} position={[0, -0.6, pz]}>
            <cylinderGeometry args={[0.9, 1.1, 2.2, 12]} />
            <meshStandardMaterial color="#64748b" roughness={0.7} />
          </mesh>
        ))}
        {/* Bridge Street Lamps */}
        {[-18, -6, 6, 18].map((pz, idx) => (
          <React.Fragment key={`s-bridge-lamp-${idx}`}>
            <StreetLamp position={[-2.2, 0.4, pz]} rotation={Math.PI / 2} isNight={isNight} />
            <StreetLamp position={[2.2, 0.4, pz]} rotation={-Math.PI / 2} isNight={isNight} />
          </React.Fragment>
        ))}
        {/* Moving Resort Shuttle Traffic across Bridge */}
        <MovingTrafficVehicle axis="z" laneOffset={0.7} direction={1} speed={4.8} vehicleType="bus" bodyColor="#0284c7" isNight={isNight} />
        <MovingTrafficVehicle axis="z" laneOffset={-0.7} direction={-1} speed={5.6} vehicleType="taxi" isNight={isNight} />
      </group>
    </group>
  )
}

// -------------------------------------------------------------
// 18. EAST INTERNATIONAL AVIATION ISLAND & MEGA AIRPORT
// -------------------------------------------------------------
function EastAirportIsland({ isNight = false }: { isNight?: boolean }) {
  return (
    <group position={[120, 0, 0]}>
      {/* 1. Airport Island Landmass (94m x 68m) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[94, 68]} />
        <meshStandardMaterial color={isNight ? '#064e3b' : '#15803d'} roughness={0.8} />
      </mesh>
      {/* Sand Perimeter */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <ringGeometry args={[44, 56, 32]} />
        <meshStandardMaterial color={isNight ? '#78716c' : '#fef08a'} roughness={0.9} />
      </mesh>

      {/* 2. Main International Runway 09/27 (80m long x 11m wide tarmac) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -18]} receiveShadow>
        <planeGeometry args={[80, 11]} />
        <meshStandardMaterial color="#1e293b" roughness={0.9} />
      </mesh>
      {/* Runway White Dashed Centerline */}
      {Array.from({ length: 18 }).map((_, i) => (
        <mesh
          key={`runway-dash-${i}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[-34 + i * 4.0, 0.03, -18]}
        >
          <planeGeometry args={[2.2, 0.45]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      ))}
      {/* Piano Key Thresholds (Both ends) */}
      {[-38, 38].map((endX, idx) => (
        <group key={`p-end-${idx}`} position={[endX, 0.03, -18]}>
          {[-4.0, -2.6, -1.3, 0, 1.3, 2.6, 4.0].map((tz, j) => (
            <mesh key={`p-bar-${j}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, tz]}>
              <planeGeometry args={[3.2, 0.55]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          ))}
        </group>
      ))}
      {/* Runway Edge Green/Red Approach Lights */}
      {[-39, 39].map((lx, idx) =>
        [-5.5, 5.5].map((lz, j) => (
          <mesh key={`rw-light-${idx}-${j}`} position={[lx, 0.15, -18 + lz]}>
            <sphereGeometry args={[0.12, 8, 8]} />
            <meshStandardMaterial
              color={idx === 0 ? '#22c55e' : '#ef4444'}
              emissive={idx === 0 ? '#22c55e' : '#ef4444'}
              emissiveIntensity={isNight ? 3.0 : 0.8}
            />
          </mesh>
        ))
      )}

      {/* 3. Parallel Taxiway with Yellow Centerline */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -6]} receiveShadow>
        <planeGeometry args={[76, 6]} />
        <meshStandardMaterial color="#334155" roughness={0.9} />
      </mesh>
      {Array.from({ length: 18 }).map((_, i) => (
        <mesh
          key={`taxi-dash-${i}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[-32 + i * 3.8, 0.03, -6]}
        >
          <planeGeometry args={[1.8, 0.25]} />
          <meshBasicMaterial color="#eab308" />
        </mesh>
      ))}

      {/* 4. Futuristic International Airport Terminal Hub */}
      <group position={[0, 0, 14]}>
        {/* Main Curved Terminal Concourse */}
        <mesh position={[0, 3.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[44.0, 7.0, 14.0]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.3} />
        </mesh>
        {/* Curved Glass Roof Barrel Vault */}
        <mesh position={[0, 7.0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[7.2, 7.2, 42.0, 24, 1, false, 0, Math.PI]} />
          <meshPhysicalMaterial color="#38bdf8" transparent opacity={0.7} roughness={0.1} />
        </mesh>
        {/* 3 Telescoping Passenger Jet Bridges extending towards Apron */}
        {[-14, 0, 14].map((jx, i) => (
          <group key={`jetbridge-${i}`} position={[jx, 2.5, -9]}>
            <mesh position={[0, 0, 0]} castShadow>
              <boxGeometry args={[2.2, 2.6, 6.0]} />
              <meshStandardMaterial color="#e2e8f0" metalness={0.6} />
            </mesh>
            <mesh position={[0, -1.0, -2.8]} castShadow>
              <cylinderGeometry args={[0.2, 0.2, 2.2, 8]} />
              <meshStandardMaterial color="#475569" />
            </mesh>
          </group>
        ))}
        {isNight && (
          <pointLight position={[0, 6.0, 0]} intensity={4.0} distance={28} color="#fde047" />
        )}
      </group>

      {/* 5. 3 Commercial Jetliners (One 777 Widebody + Two A320s) */}
      {/* Jetliner 1: Widebody at Gate 1 */}
      <group position={[-14, 0.6, 1]} rotation={[0, 0, 0]}>
        <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.8, 0.8, 8.4, 16]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.3} />
        </mesh>
        <mesh position={[0, 0, -4.8]} rotation={[-Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.8, 1.4, 16]} />
          <meshStandardMaterial color="#0284c7" />
        </mesh>
        {/* Main Wings (span 8.5m) */}
        <mesh position={[0, -0.1, 0]}>
          <boxGeometry args={[8.5, 0.1, 2.2]} />
          <meshStandardMaterial color="#e2e8f0" />
        </mesh>
        {/* Jet Engines */}
        {[-2.2, 2.2].map((ex, i) => (
          <mesh key={`eng-1-${i}`} position={[ex, -0.4, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.35, 0.35, 1.4, 12]} />
            <meshStandardMaterial color="#334155" metalness={0.8} />
          </mesh>
        ))}
        {/* Tail Fin */}
        <mesh position={[0, 1.4, 3.6]}>
          <boxGeometry args={[0.12, 2.2, 1.6]} />
          <meshStandardMaterial color="#0284c7" />
        </mesh>
      </group>

      {/* Jetliner 2: Commercial Jet at Gate 2 */}
      <group position={[14, 0.6, 1]} rotation={[0, 0, 0]}>
        <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.65, 0.65, 7.2, 16]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.3} />
        </mesh>
        <mesh position={[0, 0, -4.2]} rotation={[-Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.65, 1.2, 16]} />
          <meshStandardMaterial color="#ea580c" />
        </mesh>
        <mesh position={[0, -0.1, 0]}>
          <boxGeometry args={[7.2, 0.08, 1.8]} />
          <meshStandardMaterial color="#e2e8f0" />
        </mesh>
        <mesh position={[0, 1.2, 3.0]}>
          <boxGeometry args={[0.1, 1.8, 1.4]} />
          <meshStandardMaterial color="#ea580c" />
        </mesh>
      </group>

      {/* Jetliner 3: Aircraft Taxiing to Runway */}
      <group position={[22, 0.6, -6]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.65, 0.65, 7.2, 16]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.3} />
        </mesh>
        <mesh position={[0, 0, -4.2]} rotation={[-Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.65, 1.2, 16]} />
          <meshStandardMaterial color="#16a34a" />
        </mesh>
        <mesh position={[0, -0.1, 0]}>
          <boxGeometry args={[7.2, 0.08, 1.8]} />
          <meshStandardMaterial color="#e2e8f0" />
        </mesh>
        <mesh position={[0, 1.2, 3.0]}>
          <boxGeometry args={[0.1, 1.8, 1.4]} />
          <meshStandardMaterial color="#16a34a" />
        </mesh>
      </group>

      {/* 6. Air Traffic Control Tower with 360 Radar */}
      <group position={[-34, 0, 14]}>
        <mesh position={[0, 8.0, 0]} castShadow>
          <cylinderGeometry args={[1.4, 2.2, 16.0, 16]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.4} />
        </mesh>
        {/* Cab Viewing Gallery */}
        <mesh position={[0, 17.0, 0]}>
          <cylinderGeometry args={[3.2, 2.4, 2.4, 20]} />
          <meshPhysicalMaterial color="#38bdf8" transparent opacity={0.7} />
        </mesh>
        {/* Dome & Radar Dish */}
        <mesh position={[0, 19.2, 0]}>
          <sphereGeometry args={[1.2, 16, 16]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
        {isNight && (
          <pointLight position={[0, 19.5, 0]} intensity={4.0} distance={20} color="#ef4444" />
        )}
      </group>

      {/* 7. Aircraft Hangars & Fuel Depot */}
      <group position={[32, 0, 14]}>
        <mesh position={[0, 3.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[16.0, 7.0, 12.0]} />
          <meshStandardMaterial color="#64748b" roughness={0.6} />
        </mesh>
        <mesh position={[0, 7.2, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[6.2, 6.2, 15.6, 20, 1, false, 0, Math.PI]} />
          <meshStandardMaterial color="#475569" roughness={0.7} />
        </mesh>
      </group>

      {/* 8. Connecting East Ocean Viaduct Bridge (Spans from Main Island x = 46 to Airport x = 74) */}
      <group position={[-46, 0, 0]}>
        <mesh position={[0, 0.4, 0]} receiveShadow>
          <boxGeometry args={[46.0, 0.35, 4.2]} />
          <meshStandardMaterial color="#1e293b" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.75, -2.05]}>
          <boxGeometry args={[46.0, 0.4, 0.15]} />
          <meshStandardMaterial color="#cbd5e1" />
        </mesh>
        <mesh position={[0, 0.75, 2.05]}>
          <boxGeometry args={[46.0, 0.4, 0.15]} />
          <meshStandardMaterial color="#cbd5e1" />
        </mesh>
        {[-16, -6, 6, 16].map((px, idx) => (
          <mesh key={`e-bridge-pier-${idx}`} position={[px, -0.6, 0]}>
            <cylinderGeometry args={[0.9, 1.1, 2.2, 12]} />
            <meshStandardMaterial color="#64748b" roughness={0.7} />
          </mesh>
        ))}
        {[-18, -6, 6, 18].map((px, idx) => (
          <React.Fragment key={`e-bridge-lamp-${idx}`}>
            <StreetLamp position={[px, 0.4, -2.2]} rotation={0} isNight={isNight} />
            <StreetLamp position={[px, 0.4, 2.2]} rotation={Math.PI} isNight={isNight} />
          </React.Fragment>
        ))}
        {/* Moving Airport Expressway Traffic */}
        <MovingTrafficVehicle axis="x" laneOffset={0.7} direction={1} speed={6.0} vehicleType="taxi" isNight={isNight} />
        <MovingTrafficVehicle axis="x" laneOffset={-0.7} direction={-1} speed={5.2} vehicleType="bus" bodyColor="#0284c7" isNight={isNight} />
      </group>
    </group>
  )
}

// -------------------------------------------------------------
// 19. NORTH-EAST METROPOLIS EXPANSION & TWIN TOWERS PENINSULA
// -------------------------------------------------------------
function NorthEastSkyscraperIsland({ isNight = false }: { isNight?: boolean }) {
  return (
    <group position={[105, 0, -105]}>
      {/* 1. Peninsula Landmass (78m x 78m) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[78, 78]} />
        <meshStandardMaterial color={isNight ? '#064e3b' : '#15803d'} roughness={0.8} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <ringGeometry args={[40, 54, 32]} />
        <meshStandardMaterial color={isNight ? '#78716c' : '#fef08a'} roughness={0.9} />
      </mesh>

      {/* 2. World Commerce Twin Towers with Skybridge */}
      <group position={[-10, 0, -10]}>
        {[-6, 6].map((tx, idx) => (
          <group key={`twin-tower-${idx}`} position={[tx, 0, 0]}>
            <mesh position={[0, 18.0, 0]} castShadow receiveShadow>
              <boxGeometry args={[7.0, 36.0, 7.0]} />
              <meshPhysicalMaterial
                color="#0369a1"
                transparent
                opacity={0.85}
                roughness={0.12}
                metalness={0.6}
              />
            </mesh>
            {/* Illuminated Window Bands */}
            {Array.from({ length: 14 }).map((_, f) => (
              <mesh key={`twin-win-${idx}-${f}`} position={[0, 3.0 + f * 2.4, 3.54]}>
                <boxGeometry args={[6.4, 0.85, 0.04]} />
                <meshStandardMaterial
                  color="#38bdf8"
                  emissive="#fef08a"
                  emissiveIntensity={isNight ? 1.5 : 0.1}
                />
              </mesh>
            ))}
            {/* Spire */}
            <mesh position={[0, 39.0, 0]}>
              <cylinderGeometry args={[0.08, 0.25, 6.0, 8]} />
              <meshStandardMaterial color="#f8fafc" metalness={0.9} />
            </mesh>
          </group>
        ))}
        {/* Double-Decker Glass Skybridge connecting Twin Towers */}
        <mesh position={[0, 24.0, 0]} castShadow>
          <boxGeometry args={[6.0, 3.2, 3.6]} />
          <meshPhysicalMaterial color="#38bdf8" transparent opacity={0.75} roughness={0.1} />
        </mesh>
      </group>

      {/* 3. The Apex Spire Skyscraper (38m Pinnacle Tower) */}
      <group position={[14, 0, -10]}>
        <mesh position={[0, 16.0, 0]} castShadow receiveShadow>
          <boxGeometry args={[8.0, 32.0, 8.0]} />
          <meshPhysicalMaterial color="#0f766e" transparent opacity={0.85} roughness={0.15} metalness={0.6} />
        </mesh>
        <mesh position={[0, 34.0, 0]} castShadow>
          <coneGeometry args={[4.2, 5.0, 4]} />
          <meshStandardMaterial color="#facc15" metalness={0.9} />
        </mesh>
        <mesh position={[0, 38.0, 0]}>
          <sphereGeometry args={[0.25, 8, 8]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={isNight ? 3.5 : 1.0} />
        </mesh>
      </group>

      {/* 4. Crystal Diamond Tower & Helipad Tower */}
      <group position={[-10, 0, 16]}>
        <mesh position={[0, 14.0, 0]} castShadow receiveShadow>
          <boxGeometry args={[7.5, 28.0, 7.5]} />
          <meshPhysicalMaterial color="#1e293b" transparent opacity={0.88} roughness={0.2} metalness={0.5} />
        </mesh>
        {/* Rooftop Helipad */}
        <mesh position={[0, 28.1, 0]}>
          <cylinderGeometry args={[3.2, 3.2, 0.2, 24]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
        <mesh position={[0, 28.25, 0]}>
          <ringGeometry args={[2.2, 2.6, 24]} />
          <meshBasicMaterial color="#fbbf24" />
        </mesh>
      </group>

      <group position={[14, 0, 16]}>
        <mesh position={[0, 12.0, 0]} castShadow receiveShadow>
          <boxGeometry args={[6.8, 24.0, 6.8]} />
          <meshPhysicalMaterial color="#0284c7" transparent opacity={0.82} roughness={0.15} metalness={0.6} />
        </mesh>
        <mesh position={[0, 25.5, 0]} rotation={[0, Math.PI / 4, 0]}>
          <octahedronGeometry args={[3.2]} />
          <meshPhysicalMaterial color="#38bdf8" roughness={0.1} />
        </mesh>
      </group>

      {/* 5. Golden Cable-Stayed Suspension Bridge across Channel */}
      {/* Spans diagonally from Main Island (x = 46, z = -46) to Downtown Peninsula */}
      <group position={[-38, 0, 38]} rotation={[0, Math.PI / 4, 0]}>
        <mesh position={[0, 0.4, 0]} receiveShadow>
          <boxGeometry args={[4.2, 0.35, 48.0]} />
          <meshStandardMaterial color="#1e293b" roughness={0.8} />
        </mesh>
        {/* 2 Tall Suspension Pylons (22m tall) */}
        {[-14, 14].map((pz, idx) => (
          <group key={`pylon-${idx}`} position={[0, 0, pz]}>
            <mesh position={[-2.4, 10.0, 0]} castShadow>
              <boxGeometry args={[0.6, 20.0, 0.6]} />
              <meshStandardMaterial color="#f59e0b" metalness={0.8} />
            </mesh>
            <mesh position={[2.4, 10.0, 0]} castShadow>
              <boxGeometry args={[0.6, 20.0, 0.6]} />
              <meshStandardMaterial color="#f59e0b" metalness={0.8} />
            </mesh>
            <mesh position={[0, 19.5, 0]}>
              <boxGeometry args={[5.4, 0.8, 0.6]} />
              <meshStandardMaterial color="#f59e0b" metalness={0.8} />
            </mesh>
            {/* Glowing Suspension Cables */}
            {[-12, -6, 6, 12].map((offZ, k) => (
              <mesh key={`cable-${k}`} position={[0, 10.0, (pz + offZ) / 2]} rotation={[Math.atan2(19, Math.abs(offZ)), 0, 0]}>
                <cylinderGeometry args={[0.02, 0.02, Math.hypot(19, offZ), 6]} />
                <meshStandardMaterial
                  color="#ffffff"
                  emissive={isNight ? '#38bdf8' : '#ffffff'}
                  emissiveIntensity={isNight ? 1.5 : 0}
                />
              </mesh>
            ))}
          </group>
        ))}
      </group>
    </group>
  )
}

// -------------------------------------------------------------
// 20. WEST DEEP-SEA CARGO PORT & MARITIME ISLAND
// -------------------------------------------------------------
function WestDeepSeaPortIsland({ isNight = false }: { isNight?: boolean }) {
  const containerColors = ['#0284c7', '#dc2626', '#16a34a', '#ea580c', '#facc15', '#475569', '#9333ea', '#0891b2']

  return (
    <group position={[-122, 0, 0]}>
      {/* 1. Port Island Landmass (88m x 64m) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[88, 64]} />
        <meshStandardMaterial color={isNight ? '#1e293b' : '#475569'} roughness={0.9} />
      </mesh>

      {/* 2. Reinforced Concrete Quay Wall */}
      <mesh position={[0, 0.25, -22]} receiveShadow>
        <boxGeometry args={[76.0, 0.5, 6.0]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.52, -24.8]}>
        <boxGeometry args={[76.0, 0.04, 0.4]} />
        <meshStandardMaterial color="#eab308" />
      </mesh>

      {/* 3. Massive 44m Ocean Container Cargo Ship Docked at Quay */}
      <group position={[0, 0, -32]}>
        {/* Hull */}
        <mesh position={[0, 1.8, 0]} castShadow>
          <boxGeometry args={[44.0, 3.6, 7.5]} />
          <meshStandardMaterial color="#b91c1c" roughness={0.5} />
        </mesh>
        {/* Bow Wedge */}
        <mesh position={[23.0, 1.8, 0]} rotation={[0, 0, Math.PI / 2]}>
          <coneGeometry args={[3.6, 4.0, 4]} />
          <meshStandardMaterial color="#991b1b" />
        </mesh>
        {/* Superstructure Bridge & Radar */}
        <group position={[-15.0, 4.6, 0]}>
          <mesh castShadow>
            <boxGeometry args={[6.0, 4.2, 6.8]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.3} />
          </mesh>
          <mesh position={[0, 2.6, 0]}>
            <cylinderGeometry args={[0.5, 0.6, 2.0, 12]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
        </group>
        {/* Stacks of Cargo Containers on the Ship Deck */}
        <group position={[2.0, 3.8, 0]}>
          {Array.from({ length: 24 }).map((_, idx) => {
            const col = idx % 6
            const row = Math.floor(idx / 6) % 2
            const tier = Math.floor(idx / 12)
            const color = containerColors[idx % containerColors.length]

            return (
              <mesh
                key={`ship-cont-${idx}`}
                position={[col * 3.8 - 9.5, tier * 1.1, row * 2.6 - 1.3]}
                castShadow
              >
                <boxGeometry args={[3.6, 1.05, 2.4]} />
                <meshStandardMaterial color={color} roughness={0.5} metalness={0.3} />
              </mesh>
            )
          })}
        </group>
      </group>

      {/* 4. Two Giant Orange Rail-Mounted Gantry Container Cranes */}
      {[-12, 12].map((cx, idx) => (
        <group key={`port-crane-${idx}`} position={[cx, 0.5, -20]}>
          {[-2.5, 2.5].map((gx, k) => (
            <mesh key={`g-leg-${k}`} position={[gx, 5.5, 0]} castShadow>
              <boxGeometry args={[0.45, 11.0, 0.45]} />
              <meshStandardMaterial color="#ea580c" metalness={0.7} />
            </mesh>
          ))}
          <mesh position={[0, 11.2, -4.0]} castShadow>
            <boxGeometry args={[6.5, 1.1, 16.0]} />
            <meshStandardMaterial color="#f97316" metalness={0.6} />
          </mesh>
          {isNight && (
            <pointLight position={[0, 10.5, -4.0]} intensity={3.5} distance={18} color="#fef08a" />
          )}
        </group>
      ))}

      {/* 5. Huge Container Logistics Storage Yard (36 Containers) */}
      <group position={[0, 0.5, 4]}>
        {Array.from({ length: 36 }).map((_, idx) => {
          const col = idx % 6
          const row = Math.floor(idx / 6) % 3
          const tier = Math.floor(idx / 18)
          const color = containerColors[(idx * 3) % containerColors.length]

          return (
            <mesh
              key={`yard-cont-${idx}`}
              position={[col * 4.2 - 10.5, tier * 1.2 + 0.6, row * 2.8 - 2.8]}
              castShadow
            >
              <boxGeometry args={[3.8, 1.15, 2.4]} />
              <meshStandardMaterial color={color} roughness={0.5} metalness={0.3} />
            </mesh>
          )
        })}
      </group>

      {/* 6. Petrochemical Refinery Spheres & Storage Tanks */}
      <group position={[28, 0, 12]}>
        {[-3.5, 3.5].map((tx, i) => (
          <group key={`sphere-tank-${i}`} position={[tx, 3.2, 0]}>
            <mesh castShadow>
              <sphereGeometry args={[2.8, 20, 20]} />
              <meshStandardMaterial color="#f8fafc" metalness={0.5} roughness={0.3} />
            </mesh>
            {/* Support Legs */}
            {[-1.8, 1.8].map((lx, k) => (
              <mesh key={`sleg-${k}`} position={[lx, -2.0, 0]}>
                <cylinderGeometry args={[0.12, 0.14, 2.4, 8]} />
                <meshStandardMaterial color="#64748b" />
              </mesh>
            ))}
          </group>
        ))}
      </group>

      {/* 7. Connecting West Heavy Rail & Highway Causeway (Spans from Main Island x = -46 to Port x = -76) */}
      <group position={[46, 0, 0]}>
        <mesh position={[0, 0.4, 0]} receiveShadow>
          <boxGeometry args={[46.0, 0.35, 4.4]} />
          <meshStandardMaterial color="#1e293b" roughness={0.8} />
        </mesh>
        {/* Rail Tracks embedded in Causeway */}
        <mesh position={[0, 0.45, -0.6]}>
          <boxGeometry args={[46.0, 0.05, 0.08]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.9} />
        </mesh>
        <mesh position={[0, 0.45, 0.6]}>
          <boxGeometry args={[46.0, 0.05, 0.08]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.9} />
        </mesh>
        {[-16, -6, 6, 16].map((px, idx) => (
          <mesh key={`w-bridge-pier-${idx}`} position={[px, -0.6, 0]}>
            <cylinderGeometry args={[0.9, 1.1, 2.2, 12]} />
            <meshStandardMaterial color="#64748b" roughness={0.7} />
          </mesh>
        ))}
        {/* Moving Heavy Freight Truck Traffic */}
        <MovingTrafficVehicle axis="x" laneOffset={-1.0} direction={-1} speed={4.2} vehicleType="truck" bodyColor="#ea580c" isNight={isNight} />
        <MovingTrafficVehicle axis="x" laneOffset={1.0} direction={1} speed={4.8} vehicleType="van" bodyColor="#f8fafc" isNight={isNight} />
      </group>
    </group>
  )
}

// -------------------------------------------------------------
// 21. OCEAN CHANNEL VESSELS & CRUISE LINER
// -------------------------------------------------------------
function OceanChannelTraffic({ isNight = false }: { isNight?: boolean }) {
  const cruiseRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (cruiseRef.current) {
      const t = state.clock.getElapsedTime() * 0.15
      cruiseRef.current.position.x = Math.sin(t) * 45 - 80
      cruiseRef.current.position.z = Math.cos(t) * 20 - 70
      cruiseRef.current.rotation.y = Math.sin(t * 0.5) * 0.2 + 0.8
    }
  })

  return (
    <group position={[0, 0, 0]}>
      {/* 36m Luxury Ocean Cruise Ship sailing in the deep bay */}
      <group ref={cruiseRef} position={[-80, 0, -70]}>
        <mesh position={[0, 1.4, 0]} castShadow>
          <boxGeometry args={[6.5, 2.6, 32.0]} />
          <meshStandardMaterial color="#0f172a" roughness={0.4} />
        </mesh>
        {/* White Superstructure */}
        <mesh position={[0, 3.4, -2.0]} castShadow>
          <boxGeometry args={[5.8, 1.8, 24.0]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.2} />
        </mesh>
        <mesh position={[0, 4.8, -4.0]} castShadow>
          <boxGeometry args={[5.0, 1.4, 18.0]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.2} />
        </mesh>
        {/* Red Twin Smokestacks */}
        {[-3, 2].map((sz, i) => (
          <mesh key={`smokestack-${i}`} position={[0, 6.2, sz]} castShadow>
            <cylinderGeometry args={[0.65, 0.8, 2.0, 16]} />
            <meshStandardMaterial color="#dc2626" />
          </mesh>
        ))}
        {isNight && (
          <pointLight position={[0, 4.0, 0]} intensity={3.0} distance={20} color="#fef08a" />
        )}
      </group>
    </group>
  )
}
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
      {/* Emissive traffic light point glow casting on crosswalk */}
      <pointLight position={[0, 2.5, 0.4]} intensity={isNight ? 1.6 : 0.7} distance={4.5} color="#22c55e" />
    </group>
  )
}

// -------------------------------------------------------------
// MAIN ENVIRONMENT DECORATION COMPONENT
// -------------------------------------------------------------
export const EnvironmentDecor: React.FC<EnvironmentDecorProps> = ({ timeOfDay = 'day', stores: _stores = [] }) => {
  const isNight = timeOfDay === 'night'
  const grassTexture = useMemo(() => createGrassTexture(), [])
  const asphaltTexture = useMemo(() => createAsphaltTexture(), [])
  const paverTexture = useMemo(() => createPaverTexture(), [])

  // Procedural District Commercial Foundations framing the entire metropolitan grid
  // Every foundation is strictly placed within open land blocks, leaving clean road corridors
  const proceduralBlocks = useMemo(() => {
    return [
      // Central District 1 Plaza Core (4 Quadrants safely between x: ±2.5 to ±19.5, z: ±2.5 to ±19.5)
      { id: 'nw', x: -11.0, z: -11.0, w: 17.0, d: 17.0 },
      { id: 'ne', x: 11.0, z: -11.0, w: 17.0, d: 17.0 },
      { id: 'sw', x: -11.0, z: 11.0, w: 17.0, d: 17.0 },
      { id: 'se', x: 11.0, z: 11.0, w: 17.0, d: 17.0 },

      // District 2: East Boulevard Commercial Hub
      { id: 'd2_n', x: 35.0, z: -10.5, w: 15.0, d: 16.0 },
      { id: 'd2_s', x: 35.0, z: 10.5, w: 15.0, d: 16.0 },

      // District 3: West Fashion Promenade
      { id: 'd3_n', x: -35.0, z: -10.5, w: 15.0, d: 16.0 },
      { id: 'd3_s', x: -35.0, z: 10.5, w: 15.0, d: 16.0 },

      // District 4: North Innovation Parkway
      { id: 'd4_w', x: -10.5, z: -35.0, w: 16.0, d: 15.0 },
      { id: 'd4_e', x: 10.5, z: -35.0, w: 16.0, d: 15.0 },

      // District 5: South Marina Waterfront
      { id: 'd5_w', x: -10.5, z: 35.0, w: 16.0, d: 15.0 },
      { id: 'd5_e', x: 10.5, z: 35.0, w: 16.0, d: 15.0 },

      // Corner Metropolitan Zones (connecting the entire 116x116 island into an unbroken city)
      { id: 'd_ne', x: 35.0, z: -35.0, w: 15.0, d: 15.0 },
      { id: 'd_nw', x: -35.0, z: -35.0, w: 15.0, d: 15.0 },
      { id: 'd_se', x: 35.0, z: 35.0, w: 15.0, d: 15.0 },
      { id: 'd_sw', x: -35.0, z: 35.0, w: 15.0, d: 15.0 }
    ]
  }, [])

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
        <group key={block.id} position={[block.x, 0.08, block.z]}>
          {/* Elevated Sidewalk Slab (0.15 curb height above road) */}
          <mesh receiveShadow castShadow position={[0, 0, 0]}>
            <boxGeometry args={[block.w, 0.15, block.d]} />
            <meshStandardMaterial
              map={paverTexture}
              roughness={0.5}
              color={isNight ? '#334155' : '#f8fafc'}
            />
          </mesh>
          {/* Concrete Bevel Curb Trim framing the roadway */}
          <mesh position={[0, -0.01, 0]}>
            <boxGeometry args={[block.w + 0.18, 0.14, block.d + 0.18]} />
            <meshStandardMaterial color={isNight ? '#475569' : '#cbd5e1'} roughness={0.7} />
          </mesh>
        </group>
      ))}

      {/* 4. CONTINUOUS GRID ROAD NETWORK (Connecting every single city block) */}
      {/* Central East-West Highway (z = 0, width: 3.6m) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[94, 3.6]} />
        <meshStandardMaterial map={asphaltTexture} roughness={0.65} metalness={0.15} color={isNight ? '#12161f' : '#1E2229'} />
      </mesh>

      {/* Central North-South Boulevard (x = 0, width: 3.6m) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.011, 0]} receiveShadow>
        <planeGeometry args={[3.6, 94]} />
        <meshStandardMaterial map={asphaltTexture} roughness={0.65} metalness={0.15} color={isNight ? '#12161f' : '#1E2229'} />
      </mesh>

      {/* Central Intersection */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]} receiveShadow>
        <planeGeometry args={[3.6, 3.6]} />
        <meshStandardMaterial color={isNight ? '#12161f' : '#1E2229'} roughness={0.65} metalness={0.15} />
      </mesh>

      {/* Intermediate Grid Streets (x = ±24, z = ±24, width: 3.2m) */}
      {[-24, 24].map((rz, i) => (
        <mesh key={`ring-z-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, rz]} receiveShadow>
          <planeGeometry args={[94, 3.2]} />
          <meshStandardMaterial map={asphaltTexture} roughness={0.65} metalness={0.15} color={isNight ? '#12161f' : '#1E2229'} />
        </mesh>
      ))}
      {[-24, 24].map((rx, i) => (
        <mesh key={`ring-x-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[rx, 0.01, 0]} receiveShadow>
          <planeGeometry args={[3.2, 94]} />
          <meshStandardMaterial map={asphaltTexture} roughness={0.65} metalness={0.15} color={isNight ? '#12161f' : '#1E2229'} />
        </mesh>
      ))}

      {/* Outer Perimeter Ring Boulevards (x = ±46, z = ±46, width: 2.8m) */}
      {[-46, 46].map((rz, i) => (
        <mesh key={`outer-z-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, rz]} receiveShadow>
          <planeGeometry args={[94, 2.8]} />
          <meshStandardMaterial map={asphaltTexture} roughness={0.65} metalness={0.15} color={isNight ? '#12161f' : '#1E2229'} />
        </mesh>
      ))}
      {[-46, 46].map((rx, i) => (
        <mesh key={`outer-x-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[rx, 0.01, 0]} receiveShadow>
          <planeGeometry args={[2.8, 94]} />
          <meshStandardMaterial map={asphaltTexture} roughness={0.65} metalness={0.15} color={isNight ? '#12161f' : '#1E2229'} />
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

      {/* Pedestrian Crosswalks at All 9 Intersections (Matching Reference) */}
      <ZebraCrosswalks />

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

      {/* 8. TROPIC CITY EXPANSION ISLANDS & OCEAN HIGHWAY BRIDGES */}
      <SouthResortIsland isNight={isNight} />
      <EastAirportIsland isNight={isNight} />
      <NorthEastSkyscraperIsland isNight={isNight} />
      <WestDeepSeaPortIsland isNight={isNight} />
      <OceanChannelTraffic isNight={isNight} />

      {/* 8. LOW-POLY FACETED TREES & BOTANICALS (Planted along sidewalk curbs & road margins) */}
      {[-40, -32, -16, -8, 8, 16, 32, 40].map((tx, i) => (
        <React.Fragment key={`faceted-trees-grid-${i}`}>
          <LowPolyFacetedTree
            position={[tx, 0, -2.4]}
            scale={0.9}
            type={i % 3 === 0 ? 'tiered' : i % 3 === 1 ? 'round' : 'pine'}
            shade={i % 2 === 0 ? '#22c55e' : '#16a34a'}
          />
          <LowPolyFacetedTree
            position={[tx, 0, 2.4]}
            scale={0.9}
            type={i % 2 === 0 ? 'round' : 'tiered'}
            shade={i % 2 === 0 ? '#16a34a' : '#4ade80'}
          />
          <LowPolyFacetedTree position={[tx, 0, 21.6]} scale={0.95} type="round" shade="#22c55e" />
          <LowPolyFacetedTree position={[tx, 0, -21.6]} scale={0.95} type="tiered" shade="#15803d" />
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

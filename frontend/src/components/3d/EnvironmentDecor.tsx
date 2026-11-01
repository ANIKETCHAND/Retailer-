/**
 * RetailVision - AAA Tropical Metropolis & Urban Island Infrastructure
 * Inspired by Town Building Games & Tropic City Construction:
 *  - Expansive Tropical Island Archipelago & Shimmering Ocean Lagoon
 *  - Golden Sandy Beaches, Tiki Huts, Sun Loungers, Palm Groves
 *  - Coastal Yacht Marina with Luxury Boats & Red-White Lighthouse with Rotating Searchlight
 *  - Boardwalk Pier with Functional Rotating Ferris Wheel & Colorful Gondolas
 *  - Downtown Financial Metropolis with 7 Unique High-Rise Towers & Neoclassical City Hall
 *  - Luxury Beachfront Resort Hotel with Tiered Infinity Pools & Tennis Courts
 *  - Charming Residential District with Modernist Villas, Terracotta Cottages & Pools
 *  - Commercial Cargo Port with Gantry Crane, Container Stacks, Warehouses & Fuel Tanks
 *  - Green Energy Park with Rotating Wind Turbines & Photovoltaic Solar Farm
 *  - Metropolis Sports Arena & Central Hospital with Emergency Helipad
 *  - Central Botanical Gardens with Three-Tier Fountain, Jacaranda Trees & Trails
 *  - Expanded Multi-Lane Road Grid with 12 Animated Vehicles (Taxis, Sedans, Vans, Buses)
 *  - Island Express Railway with Locomotive & Passenger Coaches
 *  - Full Dynamic Day & Night Mode Lighting & Atmosphere
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
// 1. ANIMATED LIVING TRAFFIC VEHICLE
// -------------------------------------------------------------
type VehicleType = 'sedan' | 'taxi' | 'sports' | 'van' | 'bus'

function MovingTrafficVehicle({
  axis,
  laneOffset,
  direction,
  speed = 5.0,
  vehicleType = 'sedan',
  bodyColor = '#3b82f6',
  range = 80,
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
  const posRef = useRef<number>((Math.random() - 0.5) * range * 1.6)

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
  const length = isBus ? 3.4 : isVan ? 2.4 : 1.8
  const width = isBus ? 1.05 : 0.92
  const height = isBus ? 0.95 : isVan ? 0.75 : 0.48

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
        <meshStandardMaterial color={isBus ? '#0284c7' : isVan ? '#f8fafc' : '#0f172a'} roughness={0.3} />
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
  type?: 'yacht' | 'sailboat' | 'speedboat'
  color?: string
  rotation?: number
}) {
  const boatRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (boatRef.current) {
      const t = state.clock.getElapsedTime() + position[0] * 0.5
      boatRef.current.position.y = position[1] + Math.sin(t * 1.4) * 0.06
      boatRef.current.rotation.z = Math.sin(t * 1.2) * 0.03
      boatRef.current.rotation.x = Math.cos(t * 1.0) * 0.02
    }
  })

  return (
    <group ref={boatRef} position={position} rotation={[0, rotation, 0]}>
      {/* Hull */}
      <mesh position={[0, 0.18, 0]} castShadow>
        <boxGeometry args={[1.4, 0.45, 3.8]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.2} />
      </mesh>
      {/* Bow Taper */}
      <mesh position={[0, 0.22, 1.9]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.72, 1.0, 4]} />
        <meshStandardMaterial color={color} roughness={0.3} />
      </mesh>

      {/* Deck Cabin / Details */}
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
          {/* Radar Arch */}
          <mesh position={[0, 0.5, -0.6]}>
            <boxGeometry args={[1.1, 0.35, 0.12]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.8} />
          </mesh>
        </group>
      )}

      {type === 'sailboat' && (
        <group position={[0, 0.4, 0]}>
          {/* Mast */}
          <mesh position={[0, 1.8, 0.2]} castShadow>
            <cylinderGeometry args={[0.03, 0.04, 3.6, 8]} />
            <meshStandardMaterial color="#f1f5f9" metalness={0.8} />
          </mesh>
          {/* Main Sail */}
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
// 3. CAPE BEACON COASTAL LIGHTHOUSE (Rotating Night Beam)
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
      {/* Stone Foundation Base */}
      <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[2.4, 2.8, 1.2, 8]} />
        <meshStandardMaterial color="#475569" roughness={0.9} />
      </mesh>

      {/* Red & White Striped Tower Sections */}
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

      {/* Observation Balcony Gallery */}
      <mesh position={[0, 8.35, 0]} castShadow>
        <cylinderGeometry args={[1.3, 1.3, 0.3, 16]} />
        <meshStandardMaterial color="#1e293b" metalness={0.7} />
      </mesh>

      {/* Glass Lantern Room */}
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

      {/* Conical Copper Cupola Roof */}
      <mesh position={[0, 10.1, 0]} castShadow>
        <coneGeometry args={[1.05, 0.9, 16]} />
        <meshStandardMaterial color="#047857" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Rotating Sweeping Spotlight Beam */}
      <group ref={beamRef} position={[0, 9.1, 0]}>
        <mesh position={[0, 0, 5]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[1.8, 10, 16, 1, true]} />
          <meshBasicMaterial
            color="#fef08a"
            transparent
            opacity={isNight ? 0.35 : 0.05}
            side={THREE.DoubleSide}
          />
        </mesh>
        {isNight && (
          <pointLight position={[0, 0, 1.0]} intensity={4.5} distance={28} color="#fef08a" />
        )}
      </group>
    </group>
  )
}

// -------------------------------------------------------------
// 4. ROTATING FERRIS WHEEL (Ocean Amusement Pier)
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
      {/* Pier Deck Platform */}
      <mesh position={[0, 0.2, 0]} receiveShadow>
        <boxGeometry args={[14, 0.4, 18]} />
        <meshStandardMaterial color="#78350f" roughness={0.8} />
      </mesh>

      {/* Pilings under pier */}
      {[-6, 0, 6].map((px, i) =>
        [-8, 0, 8].map((pz, j) => (
          <mesh key={`piling-${i}-${j}`} position={[px, -0.6, pz]}>
            <cylinderGeometry args={[0.2, 0.2, 1.4, 8]} />
            <meshStandardMaterial color="#451a03" />
          </mesh>
        ))
      )}

      {/* Wheel Hub & Support A-Frames */}
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

      {/* Central Spindle Hub */}
      <mesh position={[0, 8.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 2.8, 16]} />
        <meshStandardMaterial color="#eab308" metalness={0.9} />
      </mesh>

      {/* Rotating Wheel Assembly */}
      <group ref={wheelRef} position={[0, 8.2, 0]}>
        {/* Outer & Inner Rings */}
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
            <mesh>
              <torusGeometry args={[3.2, 0.06, 12, 24]} />
              <meshStandardMaterial color="#ffffff" metalness={0.8} />
            </mesh>
          </group>
        ))}

        {/* 8 Spokes & Hanging Passenger Gondolas */}
        {Array.from({ length: 8 }).map((_, idx) => {
          const angle = (idx * Math.PI) / 4
          const gx = Math.cos(angle) * 6.2
          const gy = Math.sin(angle) * 6.2
          const gColor = gondolaColors[idx % gondolaColors.length]

          return (
            <group key={`spoke-${idx}`}>
              {/* Spoke Structural Rods */}
              <mesh position={[gx / 2, gy / 2, 0]} rotation={[0, 0, angle + Math.PI / 2]}>
                <cylinderGeometry args={[0.04, 0.04, 6.2, 6]} />
                <meshStandardMaterial color="#f1f5f9" metalness={0.8} />
              </mesh>

              {/* Passenger Gondola Cabin (Always hangs vertically) */}
              <group position={[gx, gy, 0]}>
                <mesh castShadow>
                  <boxGeometry args={[0.9, 0.85, 0.9]} />
                  <meshStandardMaterial
                    color={gColor}
                    emissive={isNight ? gColor : '#000000'}
                    emissiveIntensity={isNight ? 0.8 : 0}
                  />
                </mesh>
                <mesh position={[0, 0, 0]}>
                  <boxGeometry args={[0.75, 0.4, 0.94]} />
                  <meshPhysicalMaterial color="#38bdf8" transparent opacity={0.7} />
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
// 5. RENEWABLE WIND TURBINE (Spinning Rotor Blades)
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
      {/* Foundation Pedestal */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.9, 1.2, 0.8, 16]} />
        <meshStandardMaterial color="#64748b" roughness={0.7} />
      </mesh>

      {/* Sleek Tapered Tower */}
      <mesh position={[0, 8.0, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.65, 14.8, 16]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.3} metalness={0.2} />
      </mesh>

      {/* Nacelle Housing */}
      <mesh position={[0, 15.6, 0.3]} castShadow>
        <boxGeometry args={[0.7, 0.7, 1.8]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Red Safety Beacon on Nacelle Roof */}
      <mesh position={[0, 16.05, -0.4]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial
          color="#ef4444"
          emissive="#ef4444"
          emissiveIntensity={isNight ? 2.5 : 0.6}
        />
      </mesh>

      {/* Rotating 3-Blade Aerodynamic Rotor */}
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
// 6. TROPICAL PALM TREE & FLOWERING JACARANDA
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
// 7. DOWNTOWN FINANCIAL METROPOLIS SKYLINE (North District)
// -------------------------------------------------------------
function DowntownMetropolis({ isNight = false }: { isNight?: boolean }) {
  return (
    <group position={[0, 0, -32]}>
      {/* 1. APEX CORPORATE SPIRE (Supertall, 26m) */}
      <group position={[-14, 0, -8]}>
        <mesh position={[0, 8.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[5.2, 17.0, 5.2]} />
          <meshPhysicalMaterial
            color={isNight ? '#0369a1' : '#0284c7'}
            transparent
            opacity={0.8}
            roughness={0.1}
            metalness={0.5}
          />
        </mesh>
        <mesh position={[0, 18.2, 0]} castShadow>
          <boxGeometry args={[3.8, 2.4, 3.8]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} />
        </mesh>
        <mesh position={[0, 21.0, 0]}>
          <cylinderGeometry args={[0.06, 0.2, 4.2, 8]} />
          <meshStandardMaterial color="#f8fafc" metalness={0.9} />
        </mesh>
        {/* Red Aviation Warning Light */}
        <mesh position={[0, 23.2, 0]}>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={isNight ? 3.0 : 0.8} />
        </mesh>
      </group>

      {/* 2. OBSIDIAN BANKING HQ WITH ROOFTOP HELIPAD */}
      <group position={[-5, 0, -10]}>
        <mesh position={[0, 9.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[6.4, 19.0, 5.8]} />
          <meshStandardMaterial color="#090d16" roughness={0.2} metalness={0.8} />
        </mesh>
        {/* Gold Corner Mullions */}
        {[-3.2, 3.2].map((mx, i) =>
          [-2.9, 2.9].map((mz, j) => (
            <mesh key={`mull-${i}-${j}`} position={[mx, 9.5, mz]}>
              <boxGeometry args={[0.18, 19.0, 0.18]} />
              <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.2} />
            </mesh>
          ))
        )}
        {/* Glowing Office Windows Grid */}
        {Array.from({ length: 8 }).map((_, i) => (
          <mesh key={`obs-win-${i}`} position={[0, 3.0 + i * 2.0, 2.94]}>
            <boxGeometry args={[5.6, 0.8, 0.05]} />
            <meshStandardMaterial
              color="#38bdf8"
              emissive="#fef08a"
              emissiveIntensity={isNight ? 1.4 : 0.1}
            />
          </mesh>
        ))}
        {/* Rooftop Helipad Pad */}
        <group position={[0, 19.1, 0]}>
          <mesh>
            <cylinderGeometry args={[2.2, 2.2, 0.2, 24]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
          <mesh position={[0, 0.12, 0]}>
            <ringGeometry args={[1.7, 1.9, 24]} />
            <meshBasicMaterial color="#fbbf24" />
          </mesh>
        </group>
      </group>

      {/* 3 & 4. TWIN MARINA TOWERS WITH SKYBRIDGE */}
      <group position={[7, 0, -9]}>
        {[-2.2, 2.2].map((tx, idx) => (
          <group key={`twin-${idx}`} position={[tx, 0, 0]}>
            <mesh position={[0, 7.5, 0]} castShadow receiveShadow>
              <boxGeometry args={[3.2, 15.0, 3.6]} />
              <meshPhysicalMaterial color="#0ea5e9" transparent opacity={0.7} roughness={0.1} />
            </mesh>
            <mesh position={[0, 15.6, 0]} castShadow>
              <boxGeometry args={[2.4, 1.2, 2.8]} />
              <meshStandardMaterial color="#0284c7" />
            </mesh>
          </group>
        ))}
        {/* Skybridge Linking the Twin Towers at floor 6 */}
        <mesh position={[0, 10.5, 0]} castShadow>
          <boxGeometry args={[4.4, 1.4, 1.8]} />
          <meshStandardMaterial color="#f8fafc" metalness={0.6} />
        </mesh>
        <mesh position={[0, 10.5, 0.95]}>
          <planeGeometry args={[4.0, 0.9]} />
          <meshPhysicalMaterial color="#38bdf8" transparent opacity={0.8} />
        </mesh>
      </group>

      {/* 5. ART DECO HORIZON TOWER (Stepped Crown) */}
      <group position={[18, 0, -8]}>
        <mesh position={[0, 5.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[5.2, 11.0, 5.0]} />
          <meshStandardMaterial color="#0f766e" roughness={0.4} />
        </mesh>
        <mesh position={[0, 12.0, 0]} castShadow>
          <boxGeometry args={[4.0, 3.5, 3.8]} />
          <meshStandardMaterial color="#115e59" roughness={0.4} />
        </mesh>
        <mesh position={[0, 14.5, 0]} castShadow>
          <boxGeometry args={[2.8, 2.0, 2.6]} />
          <meshStandardMaterial color="#134e4a" roughness={0.4} />
        </mesh>
        <mesh position={[0, 16.0, 0]}>
          <coneGeometry args={[1.2, 1.8, 4]} />
          <meshStandardMaterial color="#facc15" metalness={0.9} />
        </mesh>
      </group>

      {/* 6. NEOCLASSICAL CITY MUNICIPAL HALL & GRAND PLAZA */}
      <group position={[-25, 0, -6]}>
        {/* Marble Steps Base */}
        <mesh position={[0, 0.3, 0]} receiveShadow>
          <boxGeometry args={[10.0, 0.6, 7.5]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.4} />
        </mesh>
        {/* Main Hall Body */}
        <mesh position={[0, 2.5, -0.6]} castShadow receiveShadow>
          <boxGeometry args={[9.0, 4.0, 5.8]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.3} />
        </mesh>
        {/* Classical Colonnade Columns (6 pillars) */}
        {[-3.6, -2.1, -0.7, 0.7, 2.1, 3.6].map((cx, i) => (
          <mesh key={`pillar-${i}`} position={[cx, 2.4, 2.4]} castShadow>
            <cylinderGeometry args={[0.2, 0.24, 3.6, 12]} />
            <meshStandardMaterial color="#f1f5f9" roughness={0.3} />
          </mesh>
        ))}
        {/* Triangular Pediment */}
        <mesh position={[0, 4.8, 2.3]} rotation={[0, 0, 0]} castShadow>
          <coneGeometry args={[4.8, 1.4, 4]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.4} />
        </mesh>
        {/* Golden Central Dome */}
        <mesh position={[0, 5.6, -0.6]} castShadow>
          <sphereGeometry args={[1.8, 16, 16]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>
    </group>
  )
}

// -------------------------------------------------------------
// 8. TROPICAL BEACHFRONT RESORT HOTEL (North-West Coastal District)
// -------------------------------------------------------------
function TropicalResortDistrict({ isNight = false }: { isNight?: boolean }) {
  return (
    <group position={[-28, 0, -18]}>
      {/* Crescent Luxury Resort Main Building */}
      <group position={[0, 0, 0]}>
        <mesh position={[0, 3.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[14.0, 7.0, 5.5]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.25} />
        </mesh>
        {/* Terraced Ocean Balconies */}
        {[1.8, 3.6, 5.4].map((by, i) => (
          <mesh key={`balc-${i}`} position={[0, by, 2.85]}>
            <boxGeometry args={[13.4, 0.25, 0.8]} />
            <meshStandardMaterial color="#0284c7" />
          </mesh>
        ))}
        {/* Rooftop Penthouse Terrace & Cocktail Cabana */}
        <mesh position={[0, 7.5, 0]} castShadow>
          <boxGeometry args={[8.0, 1.2, 3.8]} />
          <meshStandardMaterial color="#38bdf8" />
        </mesh>
      </group>

      {/* Tiered Infinity Swimming Pools */}
      <group position={[0, 0, 6.2]}>
        {/* Main Pool Deck Platform */}
        <mesh position={[0, 0.35, 0]} receiveShadow>
          <boxGeometry args={[12.0, 0.7, 6.0]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.4} />
        </mesh>
        {/* Turquoise Infinity Pool Water */}
        <mesh position={[0, 0.65, 0]}>
          <boxGeometry args={[9.5, 0.15, 4.4]} />
          <meshPhysicalMaterial
            color={isNight ? '#0891b2' : '#06b6d4'}
            emissive={isNight ? '#06b6d4' : '#000000'}
            emissiveIntensity={isNight ? 1.0 : 0}
            transparent
            opacity={0.88}
            roughness={0.05}
          />
        </mesh>
        {/* Sun Lounge Chairs & Umbrellas */}
        {[-3.8, -1.9, 1.9, 3.8].map((lx, i) => (
          <group key={`lounge-${i}`} position={[lx, 0.75, 2.4]}>
            <mesh castShadow>
              <boxGeometry args={[0.5, 0.12, 1.0]} />
              <meshStandardMaterial color="#ec4899" />
            </mesh>
            <mesh position={[0, 0.5, 0]}>
              <coneGeometry args={[0.45, 0.3, 8]} />
              <meshStandardMaterial color="#fef08a" />
            </mesh>
          </group>
        ))}
      </group>

      {/* Professional Tennis Court */}
      <group position={[12, 0, 4]}>
        <mesh position={[0, 0.04, 0]} receiveShadow>
          <boxGeometry args={[7.0, 0.08, 11.0]} />
          <meshStandardMaterial color="#0284c7" roughness={0.6} />
        </mesh>
        {/* Green In-Bounds Turf */}
        <mesh position={[0, 0.05, 0]}>
          <boxGeometry args={[5.2, 0.08, 9.2]} />
          <meshStandardMaterial color="#16a34a" roughness={0.6} />
        </mesh>
        {/* Net */}
        <mesh position={[0, 0.35, 0]}>
          <boxGeometry args={[5.4, 0.5, 0.04]} />
          <meshStandardMaterial color="#ffffff" wireframe />
        </mesh>
      </group>
    </group>
  )
}

// -------------------------------------------------------------
// 9. RESIDENTIAL ISLAND VILLAS & SUBURBS (South District)
// -------------------------------------------------------------
function ResidentialNeighborhood({ isNight = false }: { isNight?: boolean }) {
  const roofTileTexture = useMemo(() => {
    try {
      const canvas = document.createElement('canvas')
      canvas.width = 128
      canvas.height = 128
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.fillStyle = '#ea580c'
        ctx.fillRect(0, 0, 128, 128)
        ctx.fillStyle = '#c2410c'
        for (let y = 0; y < 128; y += 16) {
          ctx.fillRect(0, y, 128, 2)
        }
      }
      const tex = new THREE.CanvasTexture(canvas)
      tex.wrapS = THREE.RepeatWrapping
      tex.wrapT = THREE.RepeatWrapping
      tex.repeat.set(4, 4)
      return tex
    } catch {
      return null
    }
  }, [])

  return (
    <group position={[0, 0, 28]}>
      {/* 4 Modernist Luxury Beachfront Villas with Private Pools */}
      {[-24, -14, 14, 24].map((vx, i) => (
        <group key={`mod-villa-${i}`} position={[vx, 0, 4]}>
          {/* Villa Main Block */}
          <mesh position={[0, 1.8, 0]} castShadow receiveShadow>
            <boxGeometry args={[6.2, 3.6, 5.0]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.3} />
          </mesh>
          {/* Panoramic Window Glass Wall */}
          <mesh position={[0, 1.6, 2.54]}>
            <boxGeometry args={[5.2, 2.4, 0.05]} />
            <meshPhysicalMaterial color="#38bdf8" transparent opacity={0.7} />
          </mesh>
          {/* Flat Overhanging Cantilever Roof */}
          <mesh position={[0, 3.7, 0.4]} castShadow>
            <boxGeometry args={[7.0, 0.25, 6.2]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          {/* Private Swimming Pool */}
          <mesh position={[0, 0.05, 4.6]} receiveShadow>
            <boxGeometry args={[4.4, 0.1, 2.6]} />
            <meshStandardMaterial color="#e2e8f0" />
          </mesh>
          <mesh position={[0, 0.1, 4.6]}>
            <boxGeometry args={[3.8, 0.08, 2.0]} />
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

      {/* 6 Mediterranean Terracotta Bungalows */}
      {[
        { x: -18, z: -8, color: '#fed7aa', roof: '#ea580c' },
        { x: -8, z: -8, color: '#fef08a', roof: '#c2410c' },
        { x: 8, z: -8, color: '#fbcfe8', roof: '#ea580c' },
        { x: 18, z: -8, color: '#e0f2fe', roof: '#b45309' },
        { x: -5, z: 12, color: '#ffedd5', roof: '#ea580c' },
        { x: 5, z: 12, color: '#fef3c7', roof: '#c2410c' }
      ].map((home, idx) => (
        <group key={`med-home-${idx}`} position={[home.x, 0, home.z]}>
          <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
            <boxGeometry args={[5.2, 3.0, 4.2]} />
            <meshStandardMaterial color={home.color} roughness={0.6} />
          </mesh>
          {/* Terracotta Hip Roof */}
          <mesh position={[0, 3.7, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <coneGeometry args={[4.2, 1.6, 4]} />
            <meshStandardMaterial
              color={home.roof}
              map={roofTileTexture || undefined}
              roughness={0.7}
            />
          </mesh>
          {/* Front Porch & Entrance Door */}
          <mesh position={[0, 0.8, 2.14]}>
            <boxGeometry args={[0.9, 1.6, 0.06]} />
            <meshStandardMaterial color="#78350f" />
          </mesh>
          {/* Warm Porch Light at Night */}
          {isNight && (
            <pointLight position={[0, 1.8, 2.3]} intensity={1.8} distance={4} color="#fef08a" />
          )}
        </group>
      ))}
    </group>
  )
}

// -------------------------------------------------------------
// 10. INDUSTRIAL CARGO PORT & LOGISTICS HUB (East District)
// -------------------------------------------------------------
function IndustrialPortAndEnergy({ isNight = false }: { isNight?: boolean }) {
  const containerColors = ['#0284c7', '#dc2626', '#16a34a', '#ea580c', '#facc15', '#475569']

  return (
    <group position={[32, 0, 0]}>
      {/* Deepwater Commercial Dock Wharf */}
      <mesh position={[6, 0.2, 0]} receiveShadow>
        <boxGeometry args={[14.0, 0.45, 48.0]} />
        <meshStandardMaterial color="#64748b" roughness={0.8} />
      </mesh>
      {/* Dock Edge Yellow Warning Stripe */}
      <mesh position={[12.8, 0.44, 0]}>
        <boxGeometry args={[0.3, 0.04, 48.0]} />
        <meshStandardMaterial color="#eab308" />
      </mesh>

      {/* Massive Orange Container Gantry Crane */}
      <group position={[10, 0.45, -8]}>
        {/* Steel Leg A-Frames */}
        {[-3, 3].map((cz, i) => (
          <group key={`gantry-leg-${i}`} position={[0, 0, cz]}>
            <mesh position={[-2.4, 4.5, 0]} castShadow>
              <boxGeometry args={[0.4, 9.0, 0.4]} />
              <meshStandardMaterial color="#ea580c" metalness={0.7} />
            </mesh>
            <mesh position={[2.4, 4.5, 0]} castShadow>
              <boxGeometry args={[0.4, 9.0, 0.4]} />
              <meshStandardMaterial color="#ea580c" metalness={0.7} />
            </mesh>
          </group>
        ))}
        {/* Horizontal Overhead Gantry Boom */}
        <mesh position={[0, 9.2, 0]} castShadow>
          <boxGeometry args={[14.0, 0.8, 4.5]} />
          <meshStandardMaterial color="#f97316" metalness={0.6} />
        </mesh>
        {/* Operator Cabin & Hoist Cable */}
        <mesh position={[1.5, 8.4, 0]}>
          <boxGeometry args={[1.4, 0.9, 1.2]} />
          <meshStandardMaterial color="#38bdf8" />
        </mesh>
      </group>

      {/* Stacks of Colorful Shipping Containers */}
      <group position={[2, 0.45, -4]}>
        {Array.from({ length: 16 }).map((_, idx) => {
          const col = idx % 4
          const row = Math.floor(idx / 4) % 2
          const tier = Math.floor(idx / 8)
          const color = containerColors[idx % containerColors.length]

          return (
            <mesh
              key={`cont-${idx}`}
              position={[col * 1.6 - 2.4, tier * 1.1 + 0.55, row * 4.2 - 2.0]}
              castShadow
            >
              <boxGeometry args={[1.4, 1.05, 3.8]} />
              <meshStandardMaterial color={color} roughness={0.5} metalness={0.3} />
            </mesh>
          )
        })}
      </group>

      {/* Industrial Logistics Warehouse */}
      <group position={[-6, 0, 14]}>
        <mesh position={[0, 2.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[10.0, 4.4, 7.5]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.6} />
        </mesh>
        {/* Roll-up Loading Bay Doors */}
        {[-3, 0, 3].map((bx, i) => (
          <mesh key={`bay-${i}`} position={[bx, 1.2, 3.8]}>
            <boxGeometry args={[2.0, 2.2, 0.08]} />
            <meshStandardMaterial color="#334155" metalness={0.8} />
          </mesh>
        ))}
      </group>

      {/* Cylindrical Industrial Fuel Storage Tanks */}
      {[0, 1].map((_, i) => (
        <group key={`tank-${i}`} position={[-6, 0, -14 - i * 7]}>
          <mesh position={[0, 2.2, 0]} castShadow>
            <cylinderGeometry args={[2.8, 2.8, 4.4, 24]} />
            <meshStandardMaterial color="#f8fafc" metalness={0.5} roughness={0.3} />
          </mesh>
          {/* Blue Brand Band */}
          <mesh position={[0, 3.2, 0]}>
            <cylinderGeometry args={[2.82, 2.82, 0.5, 24]} />
            <meshStandardMaterial color="#0284c7" />
          </mesh>
        </group>
      ))}

      {/* Green Energy Wind Park (3 Coastal Turbines) */}
      <WindTurbine position={[14, 0, 16]} isNight={isNight} />
      <WindTurbine position={[18, 0, 0]} isNight={isNight} />
      <WindTurbine position={[14, 0, -18]} isNight={isNight} />

      {/* Solar Panel Photovoltaic Farm */}
      <group position={[-6, 0.1, -4]}>
        {Array.from({ length: 6 }).map((_, i) => (
          <mesh
            key={`solar-${i}`}
            position={[(i % 3) * 2.8 - 2.8, 0.6, Math.floor(i / 3) * 2.2 - 1.1]}
            rotation={[0.45, 0, 0]}
            castShadow
          >
            <boxGeometry args={[2.4, 0.08, 1.6]} />
            <meshPhysicalMaterial
              color="#0284c7"
              metalness={0.9}
              roughness={0.08}
              reflectivity={0.9}
            />
          </mesh>
        ))}
      </group>
    </group>
  )
}

// -------------------------------------------------------------
// 11. CIVIC SPORTS ARENA & CENTRAL HOSPITAL (West District)
// -------------------------------------------------------------
function SportsStadiumAndCivic({ isNight = false }: { isNight?: boolean }) {
  return (
    <group position={[-34, 0, 6]}>
      {/* 1. METROPOLIS SPORTS STADIUM */}
      <group position={[0, 0, 0]}>
        {/* Outer Oval Concrete Bowl */}
        <mesh position={[0, 1.8, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[8.5, 9.8, 3.6, 28]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
        </mesh>
        {/* Blue Tiered Seating Stands */}
        <mesh position={[0, 2.4, 0]}>
          <cylinderGeometry args={[7.8, 7.8, 1.8, 24, 1, true]} />
          <meshStandardMaterial color="#0284c7" side={THREE.DoubleSide} />
        </mesh>
        {/* Striped Green Soccer Pitch */}
        <mesh position={[0, 0.45, 0]}>
          <boxGeometry args={[8.2, 0.1, 5.2]} />
          <meshStandardMaterial color="#16a34a" roughness={0.8} />
        </mesh>
        {/* White Center Line & Circle */}
        <mesh position={[0, 0.52, 0]}>
          <ringGeometry args={[0.8, 0.9, 16]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        {/* 4 Corner Floodlight Towers */}
        {[-6.2, 6.2].map((lx, i) =>
          [-4.5, 4.5].map((lz, j) => (
            <group key={`light-${i}-${j}`} position={[lx, 0, lz]}>
              <mesh position={[0, 3.6, 0]}>
                <cylinderGeometry args={[0.08, 0.14, 7.2, 8]} />
                <meshStandardMaterial color="#64748b" metalness={0.8} />
              </mesh>
              <mesh position={[0, 7.2, 0]}>
                <boxGeometry args={[0.9, 0.4, 0.2]} />
                <meshStandardMaterial
                  color="#fef08a"
                  emissive="#fef08a"
                  emissiveIntensity={isNight ? 2.5 : 0.4}
                />
              </mesh>
              {isNight && (
                <pointLight position={[0, 7.0, 0]} intensity={3.5} distance={14} color="#fef08a" />
              )}
            </group>
          ))
        )}
      </group>

      {/* 2. GENERAL HOSPITAL & EMERGENCY HELIPAD */}
      <group position={[0, 0, 18]}>
        <mesh position={[0, 2.6, 0]} castShadow receiveShadow>
          <boxGeometry args={[11.0, 5.2, 6.8]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.3} />
        </mesh>
        {/* Red Medical Cross Logo */}
        <group position={[0, 3.8, 3.45]}>
          <mesh>
            <boxGeometry args={[0.4, 1.4, 0.08]} />
            <meshStandardMaterial color="#dc2626" emissive="#dc2626" emissiveIntensity={isNight ? 2.0 : 0.6} />
          </mesh>
          <mesh>
            <boxGeometry args={[1.4, 0.4, 0.08]} />
            <meshStandardMaterial color="#dc2626" emissive="#dc2626" emissiveIntensity={isNight ? 2.0 : 0.6} />
          </mesh>
        </group>
        {/* Rooftop Emergency Helipad */}
        <group position={[3.2, 5.3, 0]}>
          <mesh>
            <cylinderGeometry args={[2.0, 2.0, 0.18, 20]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
          <mesh position={[0, 0.1, 0]}>
            <ringGeometry args={[1.6, 1.8, 20]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
        </group>
      </group>
    </group>
  )
}

// -------------------------------------------------------------
// 12. CENTRAL BOTANICAL PARK & FOUNTAIN
// -------------------------------------------------------------
function CentralPark({ isNight = false }: { isNight?: boolean }) {
  const fountainRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (fountainRef.current) {
      fountainRef.current.position.y = 0.5 + Math.sin(state.clock.getElapsedTime() * 4.0) * 0.04
    }
  })

  return (
    <group position={[-18, 0, -6]}>
      {/* Stone Paved Circular Plaza */}
      <mesh position={[0, 0.03, 0]} receiveShadow>
        <cylinderGeometry args={[7.0, 7.0, 0.06, 24]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.6} />
      </mesh>

      {/* Central 3-Tier Water Fountain */}
      <group position={[0, 0, 0]}>
        <mesh position={[0, 0.25, 0]}>
          <cylinderGeometry args={[2.4, 2.6, 0.5, 16]} />
          <meshStandardMaterial color="#94a3b8" />
        </mesh>
        {/* Animated Fountain Water Spray */}
        <mesh ref={fountainRef} position={[0, 0.5, 0]}>
          <coneGeometry args={[1.2, 1.6, 16]} />
          <meshPhysicalMaterial
            color="#38bdf8"
            emissive={isNight ? '#38bdf8' : '#000000'}
            emissiveIntensity={isNight ? 1.5 : 0}
            transparent
            opacity={0.8}
          />
        </mesh>
      </group>

      {/* Shaded Benches */}
      {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((ang, i) => (
        <group key={`bench-${i}`} position={[Math.cos(ang) * 4.8, 0.15, Math.sin(ang) * 4.8]} rotation={[0, -ang + Math.PI / 2, 0]}>
          <mesh castShadow>
            <boxGeometry args={[1.4, 0.25, 0.5]} />
            <meshStandardMaterial color="#78350f" />
          </mesh>
        </group>
      ))}

      {/* Jacaranda & Tropical Palm Grove */}
      <JacarandaTree position={[-4.5, 0, -3.5]} />
      <JacarandaTree position={[4.5, 0, -3.5]} />
      <JacarandaTree position={[-4.5, 0, 3.5]} />
      <JacarandaTree position={[4.5, 0, 3.5]} />
      <PalmTree position={[0, 0, -5.5]} />
      <PalmTree position={[0, 0, 5.5]} />
    </group>
  )
}

// -------------------------------------------------------------
// 13. TROPICAL OCEAN, BEACHES & DISTANT ATOLLS
// -------------------------------------------------------------
function TropicalOceanAndBeaches({ isNight = false }: { isNight?: boolean }) {
  const oceanRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (oceanRef.current) {
      oceanRef.current.position.y = -0.15 + Math.sin(state.clock.getElapsedTime() * 0.8) * 0.02
    }
  })

  return (
    <group position={[0, 0, 0]}>
      {/* VAST TROPICAL OCEAN (Spanning 900x900) */}
      <mesh ref={oceanRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.15, 0]} receiveShadow>
        <planeGeometry args={[900, 900]} />
        <meshPhysicalMaterial
          color={isNight ? '#041f30' : '#0284c7'}
          emissive={isNight ? '#022135' : '#000000'}
          emissiveIntensity={isNight ? 0.3 : 0}
          roughness={0.08}
          metalness={0.2}
          reflectivity={0.9}
          transparent
          opacity={0.95}
        />
      </mesh>

      {/* SHALLOW TURQUOISE LAGOON RING (Translucent Cyan Water around island) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.08, 0]}>
        <ringGeometry args={[55, 120, 32]} />
        <meshPhysicalMaterial
          color={isNight ? '#083344' : '#06b6d4'}
          transparent
          opacity={0.7}
          roughness={0.1}
        />
      </mesh>

      {/* GOLDEN SAND BEACHES (South & South-West Coastline) */}
      <group position={[0, 0, 48]}>
        {/* Sand Strip */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
          <planeGeometry args={[140, 24]} />
          <meshStandardMaterial
            color={isNight ? '#78716c' : '#fef08a'}
            roughness={0.9}
          />
        </mesh>
        {/* Beach Umbrellas & Tiki Cabanas */}
        {[-40, -25, -10, 5, 20, 35].map((bx, i) => (
          <group key={`beach-tiki-${i}`} position={[bx, 0, 3.5]}>
            <mesh position={[0, 0.9, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 1.8, 6]} />
              <meshStandardMaterial color="#854d0e" />
            </mesh>
            <mesh position={[0, 1.7, 0]} castShadow>
              <coneGeometry args={[1.2, 0.5, 8]} />
              <meshStandardMaterial color={i % 2 === 0 ? '#ea580c' : '#0284c7'} />
            </mesh>
            {/* Lounger */}
            <mesh position={[0.4, 0.1, 0.3]} castShadow>
              <boxGeometry args={[0.6, 0.12, 1.2]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>
          </group>
        ))}
      </group>

      {/* 4 DISTANT TROPICAL ATOLL ISLANDS (Rich Horizon Depth) */}
      {[
        { x: 190, z: 160, r: 24 },
        { x: -210, z: 140, r: 28 },
        { x: -190, z: -180, r: 26 },
        { x: 200, z: -190, r: 22 }
      ].map((atoll, idx) => (
        <group key={`atoll-${idx}`} position={[atoll.x, -0.05, atoll.z]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[atoll.r, 16]} />
            <meshStandardMaterial color={isNight ? '#14532d' : '#16a34a'} roughness={0.8} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
            <ringGeometry args={[atoll.r, atoll.r + 6, 16]} />
            <meshStandardMaterial color={isNight ? '#57534e' : '#fef08a'} roughness={0.9} />
          </mesh>
          {/* Mini Palm Clusters */}
          {[-4, 4].map((px, i) => (
            <PalmTree key={`atoll-palm-${i}`} position={[px, 0, 0]} />
          ))}
        </group>
      ))}
    </group>
  )
}

// -------------------------------------------------------------
// 14. WATER CANAL WITH ANIMATED RIPPLES & STONE BRIDGE
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
        <boxGeometry args={[140, 0.18, 2.6]} />
        <meshStandardMaterial color="#0e7490" roughness={0.9} />
      </mesh>

      {/* Shimmering Turquoise Water */}
      <mesh ref={waterRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <planeGeometry args={[140, 2.4]} />
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
            <boxGeometry args={[140, 0.28, 0.2]} />
            <meshStandardMaterial color="#f1f5f9" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.22, 0]}>
            <boxGeometry args={[140, 0.04, 0.04]} />
            <meshStandardMaterial color="#ffffff" metalness={0.8} />
          </mesh>
        </group>
      ))}

      {/* Road Bridges */}
      {[-20, 0, 20].map((bx, idx) => (
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

  return (
    <group position={[0, 0, -14.5]}>
      {/* Ballast Gravel Bed */}
      <mesh position={[0, 0.04, 0]} receiveShadow>
        <boxGeometry args={[140, 0.08, 1.6]} />
        <meshStandardMaterial color="#475569" roughness={0.9} />
      </mesh>

      {/* Wooden Railroad Ties (Sleepers) */}
      {Array.from({ length: 80 }).map((_, i) => (
        <mesh key={`tie-${i}`} position={[-60 + i * 1.5, 0.1, 0]} castShadow>
          <boxGeometry args={[0.18, 0.06, 1.25]} />
          <meshStandardMaterial color="#78350f" roughness={0.9} />
        </mesh>
      ))}

      {/* Shiny Steel Rails */}
      {[-0.38, 0.38].map((rz, i) => (
        <mesh key={`rail-${i}`} position={[0, 0.16, rz]}>
          <boxGeometry args={[140, 0.06, 0.06]} />
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
// 16. STREET FIXTURES (Lamps, Signals)
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
// MAIN ENVIRONMENT DECORATION COMPONENT
// -------------------------------------------------------------
export const EnvironmentDecor: React.FC<EnvironmentDecorProps> = ({ timeOfDay = 'day' }) => {
  const isNight = timeOfDay === 'night'
  const grassTexture = useMemo(() => createGrassTexture(), [])
  const asphaltTexture = useMemo(() => createAsphaltTexture(), [])
  const paverTexture = useMemo(() => createPaverTexture(), [])

  return (
    <group position={[0, 0, 0]}>
      {/* 1. TROPICAL OCEAN & SURROUNDING ATOLLS */}
      <TropicalOceanAndBeaches isNight={isNight} />

      {/* 2. MAIN ISLAND LANDMASS (Expanded to 360x360 with lush natural grass) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[360, 360]} />
        <meshStandardMaterial
          map={grassTexture}
          roughness={0.8}
          color={isNight ? '#064e3b' : '#ffffff'}
        />
      </mesh>

      {/* 3. CENTRAL COMMERCIAL PLAZA BLOCKS (Hosting the user's interactive stores) */}
      {[
        { id: 'nw', x: -10.5, z: -7.0, w: 16.6, d: 9.6 },
        { id: 'ne', x: 10.5, z: -7.0, w: 16.6, d: 9.6 },
        { id: 'sw', x: -10.5, z: 7.0, w: 16.6, d: 9.6 },
        { id: 'se', x: 10.5, z: 7.0, w: 16.6, d: 9.6 }
      ].map((block) => (
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

      {/* 4. EXPANDED INTERCONNECTED ROAD NETWORK */}
      {/* Central East-West Highway (z = 0) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[180, 3.4]} />
        <meshStandardMaterial
          map={asphaltTexture}
          roughness={0.8}
          color={isNight ? '#0f172a' : '#1e293b'}
        />
      </mesh>

      {/* Central North-South Boulevard (x = 0) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.011, 0]} receiveShadow>
        <planeGeometry args={[3.4, 180]} />
        <meshStandardMaterial
          map={asphaltTexture}
          roughness={0.8}
          color={isNight ? '#0f172a' : '#1e293b'}
        />
      </mesh>

      {/* Central Intersection Crossing Slab */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]} receiveShadow>
        <planeGeometry args={[3.4, 3.4]} />
        <meshStandardMaterial
          color={isNight ? '#0f172a' : '#1e293b'}
          roughness={0.8}
        />
      </mesh>

      {/* Secondary Ring Avenues (x = ±20, z = ±20) */}
      {[-20, 20].map((rz, i) => (
        <mesh key={`ring-z-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, rz]} receiveShadow>
          <planeGeometry args={[160, 3.0]} />
          <meshStandardMaterial map={asphaltTexture} roughness={0.8} color={isNight ? '#0f172a' : '#1e293b'} />
        </mesh>
      ))}
      {[-20, 20].map((rx, i) => (
        <mesh key={`ring-x-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[rx, 0.01, 0]} receiveShadow>
          <planeGeometry args={[3.0, 160]} />
          <meshStandardMaterial map={asphaltTexture} roughness={0.8} color={isNight ? '#0f172a' : '#1e293b'} />
        </mesh>
      ))}

      {/* Outer Scenic Coastal Highways (x = ±40, z = ±40) */}
      {[-40, 40].map((rz, i) => (
        <mesh key={`outer-z-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, rz]} receiveShadow>
          <planeGeometry args={[140, 2.8]} />
          <meshStandardMaterial map={asphaltTexture} roughness={0.8} color={isNight ? '#0f172a' : '#1e293b'} />
        </mesh>
      ))}
      {[-40, 40].map((rx, i) => (
        <mesh key={`outer-x-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[rx, 0.01, 0]} receiveShadow>
          <planeGeometry args={[2.8, 140]} />
          <meshStandardMaterial map={asphaltTexture} roughness={0.8} color={isNight ? '#0f172a' : '#1e293b'} />
        </mesh>
      ))}

      {/* Pedestrian Crosswalks at Central Intersection */}
      {[-2.3, 2.3].map((cx, i) => (
        <group key={`cw-x-${i}`} position={[cx, 0.016, 0]}>
          {[-1.2, -0.6, 0, 0.6, 1.2].map((sz, j) => (
            <mesh key={`cws-${j}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, sz]}>
              <planeGeometry args={[0.55, 0.28]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          ))}
        </group>
      ))}
      {[-2.3, 2.3].map((cz, i) => (
        <group key={`cw-z-${i}`} position={[0, 0.016, cz]}>
          {[-1.2, -0.6, 0, 0.6, 1.2].map((sx, j) => (
            <mesh key={`cws-z-${j}`} rotation={[-Math.PI / 2, 0, 0]} position={[sx, 0, 0]}>
              <planeGeometry args={[0.28, 0.55]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          ))}
        </group>
      ))}

      {/* Dashed Centerlines on Main Highways */}
      {Array.from({ length: 44 }).map((_, i) => {
        const xPos = -72 + i * 3.4
        if (Math.abs(xPos) < 3.2 || Math.abs(xPos - 20) < 2.0 || Math.abs(xPos + 20) < 2.0) return null
        return (
          <mesh key={`h-dash-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[xPos, 0.016, 0]}>
            <planeGeometry args={[1.5, 0.15]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        )
      })}
      {Array.from({ length: 44 }).map((_, i) => {
        const zPos = -72 + i * 3.4
        if (Math.abs(zPos) < 3.2 || Math.abs(zPos - 20) < 2.0 || Math.abs(zPos + 20) < 2.0) return null
        return (
          <mesh key={`v-dash-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.016, zPos]}>
            <planeGeometry args={[0.15, 1.5]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        )
      })}

      {/* 5. WATER CANAL & RAILWAY INFRASTRUCTURE */}
      <WaterCanal isNight={isNight} />
      <RailwayAndTrain />

      {/* 6. COASTAL MARINA & LIGHTHOUSE */}
      <group position={[-42, 0, 0]}>
        {/* Marina Wooden Piers */}
        <mesh position={[0, 0.18, 0]} receiveShadow>
          <boxGeometry args={[4.0, 0.35, 24.0]} />
          <meshStandardMaterial color="#78350f" roughness={0.8} />
        </mesh>
        {/* Pier Fingers */}
        {[-8, 0, 8].map((pz, idx) => (
          <mesh key={`finger-${idx}`} position={[-3.5, 0.18, pz]}>
            <boxGeometry args={[5.0, 0.3, 1.6]} />
            <meshStandardMaterial color="#92400e" roughness={0.8} />
          </mesh>
        ))}
        {/* Moored Boats */}
        <BobbingBoat position={[-3.8, 0, -8]} type="yacht" color="#f8fafc" rotation={Math.PI / 2} />
        <BobbingBoat position={[-3.8, 0, 0]} type="sailboat" color="#ffffff" rotation={Math.PI / 2} />
        <BobbingBoat position={[-3.8, 0, 8]} type="speedboat" color="#ef4444" rotation={Math.PI / 2} />
      </group>

      {/* Iconic Cape Beacon Lighthouse */}
      <CoastalLighthouse position={[-44, 0, -36]} isNight={isNight} />

      {/* Ferris Wheel Amusement Pier */}
      <FerrisWheel position={[-42, 0, 36]} isNight={isNight} />

      {/* 7. THE THRIVING DISTRICTS */}
      <DowntownMetropolis isNight={isNight} />
      <TropicalResortDistrict isNight={isNight} />
      <ResidentialNeighborhood isNight={isNight} />
      <IndustrialPortAndEnergy isNight={isNight} />
      <SportsStadiumAndCivic isNight={isNight} />
      <CentralPark isNight={isNight} />

      {/* 8. TROPICAL PALM TREES ALONG BOULEVARDS */}
      {[-36, -28, -18, -12, -6, 6, 12, 18, 28, 36].map((tx, i) => (
        <React.Fragment key={`palms-h-${i}`}>
          <PalmTree position={[tx, 0, -2.4]} />
          <PalmTree position={[tx, 0, 2.4]} />
          <PalmTree position={[tx, 0, 17.6]} />
          <PalmTree position={[tx, 0, -17.6]} />
        </React.Fragment>
      ))}

      {/* 9. STREET FIXTURES (Street Lamps & Traffic Signals) */}
      <StreetLamp position={[-2.2, 0, -2.2]} rotation={Math.PI / 4} isNight={isNight} />
      <StreetLamp position={[2.2, 0, -2.2]} rotation={-Math.PI / 4} isNight={isNight} />
      <StreetLamp position={[-2.2, 0, 2.2]} rotation={(3 * Math.PI) / 4} isNight={isNight} />
      <StreetLamp position={[2.2, 0, 2.2]} rotation={(-3 * Math.PI) / 4} isNight={isNight} />
      <StreetLamp position={[-18.5, 0, -2.2]} rotation={Math.PI / 4} isNight={isNight} />
      <StreetLamp position={[18.5, 0, -2.2]} rotation={-Math.PI / 4} isNight={isNight} />
      <StreetLamp position={[-2.2, 0, 18.5]} rotation={Math.PI / 4} isNight={isNight} />
      <StreetLamp position={[2.2, 0, 18.5]} rotation={-Math.PI / 4} isNight={isNight} />

      <TrafficSignalPost position={[-1.6, 0, -1.6]} rotation={Math.PI / 4} isNight={isNight} />
      <TrafficSignalPost position={[1.6, 0, 1.6]} rotation={(-3 * Math.PI) / 4} isNight={isNight} />
      <TrafficSignalPost position={[-18.4, 0, -1.6]} rotation={Math.PI / 4} isNight={isNight} />
      <TrafficSignalPost position={[18.4, 0, 1.6]} rotation={(-3 * Math.PI) / 4} isNight={isNight} />

      {/* 10. ANIMATED MULTI-LANE TRAFFIC (12 Vehicles) */}
      {/* Central East-West Highway */}
      <MovingTrafficVehicle axis="x" laneOffset={0.65} direction={1} speed={5.8} vehicleType="sedan" bodyColor="#3b82f6" range={75} isNight={isNight} />
      <MovingTrafficVehicle axis="x" laneOffset={-0.65} direction={-1} speed={5.2} vehicleType="taxi" range={75} isNight={isNight} />
      <MovingTrafficVehicle axis="x" laneOffset={0.65} direction={1} speed={4.6} vehicleType="bus" bodyColor="#0284c7" range={75} isNight={isNight} />
      <MovingTrafficVehicle axis="x" laneOffset={-0.65} direction={-1} speed={6.4} vehicleType="sports" bodyColor="#ef4444" range={75} isNight={isNight} />

      {/* Central North-South Boulevard */}
      <MovingTrafficVehicle axis="z" laneOffset={-0.65} direction={1} speed={5.4} vehicleType="sedan" bodyColor="#10b981" range={75} isNight={isNight} />
      <MovingTrafficVehicle axis="z" laneOffset={0.65} direction={-1} speed={5.0} vehicleType="van" bodyColor="#f8fafc" range={75} isNight={isNight} />
      <MovingTrafficVehicle axis="z" laneOffset={-0.65} direction={1} speed={6.0} vehicleType="taxi" range={75} isNight={isNight} />
      <MovingTrafficVehicle axis="z" laneOffset={0.65} direction={-1} speed={5.2} vehicleType="sports" bodyColor="#f59e0b" range={75} isNight={isNight} />

      {/* Outer Ring Avenues (z = 20, z = -20) */}
      <MovingTrafficVehicle axis="x" laneOffset={20.6} direction={1} speed={5.5} vehicleType="sedan" bodyColor="#8b5cf6" range={65} isNight={isNight} />
      <MovingTrafficVehicle axis="x" laneOffset={19.4} direction={-1} speed={4.8} vehicleType="van" bodyColor="#94a3b8" range={65} isNight={isNight} />
      <MovingTrafficVehicle axis="x" laneOffset={-19.4} direction={1} speed={5.2} vehicleType="taxi" range={65} isNight={isNight} />
      <MovingTrafficVehicle axis="x" laneOffset={-20.6} direction={-1} speed={6.2} vehicleType="sports" bodyColor="#06b6d4" range={65} isNight={isNight} />
    </group>
  )
}

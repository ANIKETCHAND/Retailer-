/**
 * RetailVision - Rich High-Fidelity Town Environment & Decor
 * Inspired by Image 6: SimCity/Megapolis game art style.
 * Includes:
 *  - Water Canal with turquoise water, stone retaining walls & safety railings
 *  - Railway track with ballast, wooden ties, and dual steel rails
 *  - Paved sidewalks with white curbs & pedestrian zebra crossings
 *  - Tropical palm trees & manicured boxwood hedges
 *  - Flower beds with colorful blossoms
 *  - Classical tiered fountain plazas
 *  - Stylized low-poly cars & taxis
 *  - Modern street light fixtures
 */

import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// -------------------------------------------------------------
// 1. TROPICAL PALM TREE (Matching Image 6)
// -------------------------------------------------------------
function PalmTree({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Segmented Curved Brown Trunk */}
      <mesh position={[0, 0.45, 0]} rotation={[0.08, 0, -0.1]} castShadow>
        <cylinderGeometry args={[0.08, 0.14, 0.9, 8]} />
        <meshStandardMaterial color="#854d0e" roughness={0.9} />
      </mesh>
      <mesh position={[0.08, 1.25, 0]} rotation={[0.12, 0, -0.16]} castShadow>
        <cylinderGeometry args={[0.07, 0.09, 0.9, 8]} />
        <meshStandardMaterial color="#78350f" roughness={0.9} />
      </mesh>
      {/* Palm Fronds (Radiating Starburst) */}
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
// 2. MANICURED ROUND DECIDUOUS TREE
// -------------------------------------------------------------
function LushDeciduousTree({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Trunk */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.13, 1.0, 8]} />
        <meshStandardMaterial color="#78350f" roughness={0.8} />
      </mesh>
      {/* Layered Foliage Spheres */}
      <mesh position={[0, 1.2, 0]} castShadow>
        <sphereGeometry args={[0.6, 12, 12]} />
        <meshStandardMaterial color="#16a34a" roughness={0.8} />
      </mesh>
      <mesh position={[0.18, 1.45, 0.1]} castShadow>
        <sphereGeometry args={[0.42, 10, 10]} />
        <meshStandardMaterial color="#22c55e" roughness={0.7} />
      </mesh>
    </group>
  )
}

// -------------------------------------------------------------
// 3. COLORFUL FLOWER BED & HEDGE
// -------------------------------------------------------------
function FlowerBedHedge({
  position,
  length = 2.4,
  rotation = 0
}: {
  position: [number, number, number]
  length?: number
  rotation?: number
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Manicured Boxwood Hedge */}
      <mesh position={[0, 0.18, 0]} castShadow>
        <boxGeometry args={[length, 0.36, 0.35]} />
        <meshStandardMaterial color="#15803d" roughness={0.8} />
      </mesh>
      {/* Blossoms on Top */}
      {[-length / 2.5, 0, length / 2.5].map((bx, i) => (
        <mesh key={`blossom-${i}`} position={[bx, 0.38, 0]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color={i === 0 ? '#f43f5e' : i === 1 ? '#facc15' : '#ffffff'} />
        </mesh>
      ))}
    </group>
  )
}

// -------------------------------------------------------------
// 4. WATER CANAL WITH ANIMATED RIPPLES & STONE EMBANKMENTS
// -------------------------------------------------------------
function WaterCanal() {
  const waterRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (waterRef.current) {
      // Subtle shimmer in water
      const t = state.clock.getElapsedTime()
      waterRef.current.position.y = 0.02 + Math.sin(t * 1.2) * 0.005
    }
  })

  return (
    <group position={[0, 0, -12.5]}>
      {/* Canal Trench Excavation */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[44, 0.18, 2.6]} />
        <meshStandardMaterial color="#0e7490" roughness={0.9} />
      </mesh>

      {/* Sparkling Turquoise Water Surface */}
      <mesh ref={waterRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <planeGeometry args={[44, 2.4]} />
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
        <boxGeometry args={[44, 0.28, 0.2]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.1, 1.3]} receiveShadow>
        <boxGeometry args={[44, 0.28, 0.2]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.5} />
      </mesh>

      {/* White Safety Handrail along Canal Banks */}
      {[-1.32, 1.32].map((rz, i) => (
        <group key={`rail-${i}`} position={[0, 0.3, rz]}>
          <mesh>
            <boxGeometry args={[44, 0.04, 0.04]} />
            <meshStandardMaterial color="#ffffff" metalness={0.8} />
          </mesh>
          {Array.from({ length: 22 }).map((_, j) => (
            <mesh key={`post-${j}`} position={[-21 + j * 2.0, -0.1, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 0.22, 6]} />
              <meshStandardMaterial color="#ffffff" metalness={0.8} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Stone Arch Bridge crossing the Canal at x = 0 (Road crossing) */}
      <group position={[0, 0.14, 0]}>
        <mesh receiveShadow castShadow>
          <boxGeometry args={[3.4, 0.32, 2.8]} />
          <meshStandardMaterial color="#334155" roughness={0.6} />
        </mesh>
        {/* Bridge Side Curbs */}
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
// 5. RAILWAY TRACK (Parallel to Canal, matching Image 6)
// -------------------------------------------------------------
function RailwayTrack() {
  return (
    <group position={[0, 0, -14.6]}>
      {/* Gravel Ballast Bed */}
      <mesh position={[0, 0.04, 0]} receiveShadow>
        <boxGeometry args={[44, 0.1, 1.4]} />
        <meshStandardMaterial color="#64748b" roughness={0.9} />
      </mesh>

      {/* Wooden Railway Sleepers / Ties */}
      {Array.from({ length: 44 }).map((_, i) => (
        <mesh key={`tie-${i}`} position={[-21.5 + i * 1.0, 0.1, 0]} castShadow>
          <boxGeometry args={[0.18, 0.06, 1.25]} />
          <meshStandardMaterial color="#78350f" roughness={0.9} />
        </mesh>
      ))}

      {/* Dual Shiny Steel Rails */}
      {[-0.38, 0.38].map((rz, i) => (
        <mesh key={`rail-${i}`} position={[0, 0.16, rz]}>
          <boxGeometry args={[44, 0.06, 0.06]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.9} roughness={0.2} />
        </mesh>
      ))}

      {/* Railroad Crossing Gates at x = 0 */}
      <group position={[-1.9, 0.1, 0]}>
        <mesh position={[0, 0.6, 0]}>
          <cylinderGeometry args={[0.04, 0.06, 1.2, 8]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        <mesh position={[0.6, 0.9, 0]} rotation={[0, 0, -0.2]}>
          <boxGeometry args={[1.4, 0.08, 0.04]} />
          <meshStandardMaterial color="#ef4444" />
        </mesh>
      </group>
      <group position={[1.9, 0.1, 0]}>
        <mesh position={[0, 0.6, 0]}>
          <cylinderGeometry args={[0.04, 0.06, 1.2, 8]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        <mesh position={[-0.6, 0.9, 0]} rotation={[0, 0, 0.2]}>
          <boxGeometry args={[1.4, 0.08, 0.04]} />
          <meshStandardMaterial color="#ef4444" />
        </mesh>
      </group>
    </group>
  )
}

// -------------------------------------------------------------
// 6. STYLIZED LOW-POLY CARS
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
      {/* Lower Body Chassis */}
      <mesh position={[0, 0.22, 0]} castShadow>
        <boxGeometry args={[0.92, 0.24, 1.8]} />
        <meshStandardMaterial color={isTaxi ? '#eab308' : bodyColor} roughness={0.2} metalness={0.3} />
      </mesh>
      {/* Cabin Roof */}
      <mesh position={[0, 0.46, -0.08]} castShadow>
        <boxGeometry args={[0.76, 0.26, 0.98]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.2} />
      </mesh>
      {/* Cyan Tinted Windows */}
      <mesh position={[0, 0.44, -0.08]}>
        <boxGeometry args={[0.8, 0.22, 0.92]} />
        <meshPhysicalMaterial color="#38bdf8" transparent opacity={0.5} roughness={0.1} />
      </mesh>
      {/* Headlights & Taillights */}
      <mesh position={[-0.32, 0.22, 0.9]}>
        <boxGeometry args={[0.16, 0.08, 0.02]} />
        <meshStandardMaterial color="#fef08a" emissive="#fef08a" emissiveIntensity={1.2} />
      </mesh>
      <mesh position={[0.32, 0.22, 0.9]}>
        <boxGeometry args={[0.16, 0.08, 0.02]} />
        <meshStandardMaterial color="#fef08a" emissive="#fef08a" emissiveIntensity={1.2} />
      </mesh>
      <mesh position={[-0.32, 0.22, -0.9]}>
        <boxGeometry args={[0.16, 0.08, 0.02]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={1.0} />
      </mesh>
      <mesh position={[0.32, 0.22, -0.9]}>
        <boxGeometry args={[0.16, 0.08, 0.02]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={1.0} />
      </mesh>
      {/* Taxi Sign on Top */}
      {isTaxi && (
        <mesh position={[0, 0.65, -0.08]}>
          <boxGeometry args={[0.3, 0.1, 0.12]} />
          <meshStandardMaterial color="#fef08a" emissive="#eab308" emissiveIntensity={0.8} />
        </mesh>
      )}
      {/* 4 Wheels */}
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
// 7. MODERN STREET LIGHT FIXTURE
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
// MAIN TOWN ENVIRONMENT DECORATION COMPONENT
// -------------------------------------------------------------
export const EnvironmentDecor: React.FC = () => {
  return (
    <group position={[0, 0, 0]}>
      {/* VIBRANT MANICURED GREEN TOWN TERRAIN */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]} receiveShadow>
        <planeGeometry args={[46, 46]} />
        <meshStandardMaterial color="#34d399" roughness={0.7} />
      </mesh>

      {/* LIGHT-GREY CONCRETE SIDEWALK BOULEVARDS BORDERING EVERY BLOCK */}
      {/* NW Sidewalk Block */}
      <mesh position={[-9.5, 0.02, -8.5]} receiveShadow>
        <boxGeometry args={[15.0, 0.04, 11.0]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
      </mesh>
      {/* NE Sidewalk Block */}
      <mesh position={[9.5, 0.02, -8.5]} receiveShadow>
        <boxGeometry args={[15.0, 0.04, 11.0]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
      </mesh>
      {/* SW Sidewalk Block */}
      <mesh position={[-9.5, 0.02, 8.5]} receiveShadow>
        <boxGeometry args={[15.0, 0.04, 11.0]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
      </mesh>
      {/* SE Sidewalk Block */}
      <mesh position={[9.5, 0.02, 8.5]} receiveShadow>
        <boxGeometry args={[15.0, 0.04, 11.0]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
      </mesh>

      {/* ROAD NETWORK: ASPHALT WITH WHITE EDGING & DASHED LANES */}
      {/* Horizontal Main Avenue (z = 0) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} receiveShadow>
        <planeGeometry args={[42, 2.8]} />
        <meshStandardMaterial color="#334155" roughness={0.6} />
      </mesh>
      {/* White Road Curbs (Horizontal) */}
      <mesh position={[0, 0.04, -1.45]}>
        <boxGeometry args={[42, 0.05, 0.1]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, 0.04, 1.45]}>
        <boxGeometry args={[42, 0.05, 0.1]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Dashed Centerline (Horizontal) */}
      {Array.from({ length: 14 }).map((_, i) => (
        <mesh
          key={`h-dash-${i}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[-18 + i * 2.8, 0.035, 0]}
        >
          <planeGeometry args={[1.4, 0.14]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      ))}

      {/* Vertical Main Boulevard (x = 0) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.032, 0]} receiveShadow>
        <planeGeometry args={[2.8, 42]} />
        <meshStandardMaterial color="#334155" roughness={0.6} />
      </mesh>
      {/* White Road Curbs (Vertical) */}
      <mesh position={[-1.45, 0.04, 0]}>
        <boxGeometry args={[0.1, 0.05, 42]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[1.45, 0.04, 0]}>
        <boxGeometry args={[0.1, 0.05, 42]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Dashed Centerline (Vertical) */}
      {Array.from({ length: 14 }).map((_, i) => (
        <mesh
          key={`v-dash-${i}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.036, -18 + i * 2.8]}
        >
          <planeGeometry args={[0.14, 1.4]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      ))}

      {/* PEDESTRIAN ZEBRA CROSSWALKS AT 4 SIDES OF INTERSECTION */}
      {[-0.6, -0.2, 0.2, 0.6].map((offset, i) => (
        <group key={`crosswalk-h-${i}`}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-2.0, 0.038, offset]}>
            <planeGeometry args={[0.5, 0.2]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[2.0, 0.038, offset]}>
            <planeGeometry args={[0.5, 0.2]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>
      ))}
      {[-0.6, -0.2, 0.2, 0.6].map((offset, i) => (
        <group key={`crosswalk-v-${i}`}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[offset, 0.038, -2.0]}>
            <planeGeometry args={[0.2, 0.5]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[offset, 0.038, 2.0]}>
            <planeGeometry args={[0.2, 0.5]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>
      ))}

      {/* WATER CANAL & RAILWAY TRACK (Directly from Image 6) */}
      <WaterCanal />
      <RailwayTrack />

      {/* TROPICAL PALM TREES LINING BOULEVARDS */}
      <PalmTree position={[-2.4, 0, -3.2]} />
      <PalmTree position={[2.4, 0, -3.2]} />
      <PalmTree position={[-2.4, 0, 3.2]} />
      <PalmTree position={[2.4, 0, 3.2]} />
      <PalmTree position={[10.0, 0, -3.2]} />
      <PalmTree position={[-10.0, 0, -3.2]} />
      <PalmTree position={[10.0, 0, 3.2]} />
      <PalmTree position={[-10.0, 0, 3.2]} />

      {/* FLUFFY ROUND DECIDUOUS TREES */}
      <LushDeciduousTree position={[-14.5, 0, -11.0]} />
      <LushDeciduousTree position={[14.5, 0, -11.0]} />
      <LushDeciduousTree position={[-14.5, 0, 11.0]} />
      <LushDeciduousTree position={[14.5, 0, 11.0]} />
      <LushDeciduousTree position={[-3.6, 0, -9.5]} />
      <LushDeciduousTree position={[3.6, 0, -9.5]} />
      <LushDeciduousTree position={[-3.6, 0, 9.5]} />
      <LushDeciduousTree position={[3.6, 0, 9.5]} />

      {/* MANICURED FLOWER BEDS & HEDGES */}
      <FlowerBedHedge position={[-6.5, 0, -2.1]} length={3.2} />
      <FlowerBedHedge position={[6.5, 0, -2.1]} length={3.2} />
      <FlowerBedHedge position={[-6.5, 0, 2.1]} length={3.2} />
      <FlowerBedHedge position={[6.5, 0, 2.1]} length={3.2} />

      {/* STREET LAMPS */}
      <StreetLamp position={[-2.2, 0, -2.2]} rotation={Math.PI / 4} />
      <StreetLamp position={[2.2, 0, -2.2]} rotation={-Math.PI / 4} />
      <StreetLamp position={[-2.2, 0, 2.2]} rotation={(3 * Math.PI) / 4} />
      <StreetLamp position={[2.2, 0, 2.2]} rotation={(-3 * Math.PI) / 4} />
      <StreetLamp position={[-9.5, 0, -1.9]} rotation={0} />
      <StreetLamp position={[9.5, 0, -1.9]} rotation={0} />
      <StreetLamp position={[-9.5, 0, 1.9]} rotation={Math.PI} />
      <StreetLamp position={[9.5, 0, 1.9]} rotation={Math.PI} />

      {/* CARS & VEHICLES (Driving & Parked in Bays) */}
      <PolishedCar position={[-6.2, 0, -0.65]} rotation={Math.PI / 2} bodyColor="#3b82f6" />
      <PolishedCar position={[5.8, 0, 0.65]} rotation={-Math.PI / 2} isTaxi={true} />
      <PolishedCar position={[-0.65, 0, 5.5]} rotation={0} bodyColor="#ef4444" />
      <PolishedCar position={[0.65, 0, -7.5]} rotation={Math.PI} bodyColor="#10b981" />
      {/* Parked Cars in Curbside Bays */}
      <PolishedCar position={[-10.5, 0, -3.2]} rotation={0} bodyColor="#8b5cf6" />
      <PolishedCar position={[-11.8, 0, -3.2]} rotation={0} bodyColor="#06b6d4" />
      <PolishedCar position={[10.5, 0, 3.2]} rotation={Math.PI} bodyColor="#f97316" />
      <PolishedCar position={[11.8, 0, 3.2]} rotation={Math.PI} bodyColor="#64748b" />
    </group>
  )
}

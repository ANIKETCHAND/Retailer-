/**
 * RetailVision - 3D Environment Decorations & Town Infrastructure
 * Inspired by Images 2 & 5:
 * Asphalt roads, lane markings, stylized trees, streetlamps, benches, and cars.
 */

import React from 'react'

// Stylized Pine Tree
function PineTree({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Trunk */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.12, 0.8, 8]} />
        <meshStandardMaterial color="#78350f" roughness={0.9} />
      </mesh>
      {/* Lower Foliage */}
      <mesh position={[0, 1.0, 0]} castShadow>
        <coneGeometry args={[0.55, 0.9, 8]} />
        <meshStandardMaterial color="#15803d" roughness={0.8} />
      </mesh>
      {/* Mid Foliage */}
      <mesh position={[0, 1.45, 0]} castShadow>
        <coneGeometry args={[0.42, 0.75, 8]} />
        <meshStandardMaterial color="#16a34a" roughness={0.8} />
      </mesh>
      {/* Top Foliage */}
      <mesh position={[0, 1.85, 0]} castShadow>
        <coneGeometry args={[0.28, 0.6, 8]} />
        <meshStandardMaterial color="#22c55e" roughness={0.8} />
      </mesh>
    </group>
  )
}

// Stylized Round Canopy Tree
function RoundTree({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.14, 1.0, 8]} />
        <meshStandardMaterial color="#854d0e" roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.35, 0]} castShadow>
        <sphereGeometry args={[0.65, 12, 12]} />
        <meshStandardMaterial color="#16a34a" roughness={0.7} />
      </mesh>
    </group>
  )
}

// Modern Street Lamp with light
function StreetLamp({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Pole */}
      <mesh position={[0, 1.3, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.05, 2.6, 8]} />
        <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Arm & Fixture */}
      <mesh position={[0.2, 2.55, 0]}>
        <boxGeometry args={[0.45, 0.08, 0.12]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} />
      </mesh>
      <mesh position={[0.38, 2.48, 0]}>
        <sphereGeometry args={[0.07, 12, 12]} />
        <meshStandardMaterial color="#fef08a" emissive="#fde047" emissiveIntensity={1.2} />
      </mesh>
      <pointLight position={[0.38, 2.3, 0]} intensity={1.6} distance={4.5} color="#fed7aa" />
    </group>
  )
}

// Park Bench
function Bench({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.22, 0]} castShadow>
        <boxGeometry args={[0.85, 0.06, 0.35]} />
        <meshStandardMaterial color="#b45309" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.45, -0.15]} castShadow>
        <boxGeometry args={[0.85, 0.3, 0.05]} />
        <meshStandardMaterial color="#b45309" roughness={0.6} />
      </mesh>
      <mesh position={[-0.35, 0.12, 0]}>
        <boxGeometry args={[0.05, 0.24, 0.32]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh position={[0.35, 0.12, 0]}>
        <boxGeometry args={[0.05, 0.24, 0.32]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
    </group>
  )
}

// Stylized Low-Poly Car
function LowPolyCar({
  position,
  rotation = 0,
  bodyColor = '#3b82f6'
}: {
  position: [number, number, number]
  rotation?: number
  bodyColor?: string
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Lower Chassis */}
      <mesh position={[0, 0.22, 0]} castShadow>
        <boxGeometry args={[0.9, 0.22, 1.7]} />
        <meshStandardMaterial color={bodyColor} roughness={0.3} metalness={0.2} />
      </mesh>
      {/* Cabin Roof */}
      <mesh position={[0, 0.44, -0.1]} castShadow>
        <boxGeometry args={[0.75, 0.24, 0.95]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.2} />
      </mesh>
      {/* Windows */}
      <mesh position={[0, 0.43, -0.1]}>
        <boxGeometry args={[0.78, 0.2, 0.9]} />
        <meshPhysicalMaterial color="#38bdf8" transparent opacity={0.5} roughness={0.1} />
      </mesh>
      {/* 4 Wheels */}
      {[-0.46, 0.46].map((wx, i) =>
        [-0.5, 0.5].map((wz, j) => (
          <mesh key={`${i}-${j}`} position={[wx, 0.12, wz]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.13, 0.13, 0.1, 16]} />
            <meshStandardMaterial color="#1e293b" roughness={0.9} />
          </mesh>
        ))
      )}
    </group>
  )
}

export const EnvironmentDecor: React.FC = () => {
  return (
    <group position={[0, 0, 0]}>
      {/* LUSH GREEN TOWN TERRAIN */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[46, 46]} />
        <meshStandardMaterial color="#4ade80" roughness={0.8} />
      </mesh>

      {/* ROAD GRID NETWORK */}
      {/* Horizontal Main Road */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[42, 2.8]} />
        <meshStandardMaterial color="#334155" roughness={0.7} />
      </mesh>
      {/* Horizontal Dashed Centerline */}
      {Array.from({ length: 14 }).map((_, i) => (
        <mesh
          key={`h-dash-${i}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[-18 + i * 2.8, 0.02, 0]}
        >
          <planeGeometry args={[1.4, 0.15]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      ))}

      {/* Vertical Cross Road */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]} receiveShadow>
        <planeGeometry args={[2.8, 42]} />
        <meshStandardMaterial color="#334155" roughness={0.7} />
      </mesh>
      {/* Vertical Dashed Centerline */}
      {Array.from({ length: 14 }).map((_, i) => (
        <mesh
          key={`v-dash-${i}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.02, -18 + i * 2.8]}
        >
          <planeGeometry args={[0.15, 1.4]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      ))}

      {/* Secondary Outer Roads */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -11]} receiveShadow>
        <planeGeometry args={[36, 2.0]} />
        <meshStandardMaterial color="#334155" roughness={0.7} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 11]} receiveShadow>
        <planeGeometry args={[36, 2.0]} />
        <meshStandardMaterial color="#334155" roughness={0.7} />
      </mesh>

      {/* Crosswalk Zebra Striping at Intersections */}
      {[-0.6, -0.2, 0.2, 0.6].map((offset, i) => (
        <group key={`crosswalk-${i}`}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-2.2, 0.025, offset]}>
            <planeGeometry args={[0.5, 0.2]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[2.2, 0.025, offset]}>
            <planeGeometry args={[0.5, 0.2]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>
      ))}

      {/* STREET LAMPS */}
      <StreetLamp position={[-2.0, 0, -2.0]} rotation={Math.PI / 4} />
      <StreetLamp position={[2.0, 0, -2.0]} rotation={-Math.PI / 4} />
      <StreetLamp position={[-2.0, 0, 2.0]} rotation={3 * Math.PI / 4} />
      <StreetLamp position={[2.0, 0, 2.0]} rotation={-3 * Math.PI / 4} />

      <StreetLamp position={[-8.8, 0, -1.8]} rotation={0} />
      <StreetLamp position={[8.8, 0, -1.8]} rotation={0} />
      <StreetLamp position={[-8.8, 0, 1.8]} rotation={Math.PI} />
      <StreetLamp position={[8.8, 0, 1.8]} rotation={Math.PI} />

      {/* TREES */}
      {[-16, -13, -10, -7, -3, 3, 7, 10, 13, 16].map((tx, i) => (
        <PineTree key={`np-${i}`} position={[tx, 0, -15]} />
      ))}
      {[-16, -13, -10, -7, -3, 3, 7, 10, 13, 16].map((tx, i) => (
        <PineTree key={`sp-${i}`} position={[tx, 0, 15]} />
      ))}
      {[-14, -10, -6, 6, 10, 14].map((tz, i) => (
        <PineTree key={`wp-${i}`} position={[-16, 0, tz]} />
      ))}
      {[-14, -10, -6, 6, 10, 14].map((tz, i) => (
        <PineTree key={`ep-${i}`} position={[16, 0, tz]} />
      ))}

      <RoundTree position={[-3.2, 0, -3.2]} />
      <RoundTree position={[3.2, 0, -3.2]} />
      <RoundTree position={[-3.2, 0, 3.2]} />
      <RoundTree position={[3.2, 0, 3.2]} />

      <Bench position={[-2.2, 0, -3.6]} rotation={Math.PI / 2} />
      <Bench position={[2.2, 0, -3.6]} rotation={-Math.PI / 2} />
      <Bench position={[-2.2, 0, 3.6]} rotation={Math.PI / 2} />
      <Bench position={[2.2, 0, 3.6]} rotation={-Math.PI / 2} />

      {/* CARS */}
      <LowPolyCar position={[-5.5, 0, -0.6]} rotation={Math.PI / 2} bodyColor="#eab308" />
      <LowPolyCar position={[4.5, 0, 0.6]} rotation={-Math.PI / 2} bodyColor="#3b82f6" />
      <LowPolyCar position={[-0.6, 0, 4.5]} rotation={0} bodyColor="#ef4444" />
      <LowPolyCar position={[0.6, 0, -6.5]} rotation={Math.PI} bodyColor="#10b981" />
    </group>
  )
}

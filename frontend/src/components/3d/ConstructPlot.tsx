/**
 * RetailVision - Scene Three: Dedicated 3D Construction Plot
 * Inspired by Image 2:
 * Foundation gravel, orange construction crane, safety cones,
 * and a prominent 3D signboard "CONSTRUCT - BUILD YOUR STORE".
 */

import React, { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

interface ConstructPlotProps {
  position?: [number, number, number]
  plotNumber?: number
  districtName?: string
  onConstructClick: () => void
}

export const ConstructPlot: React.FC<ConstructPlotProps> = ({
  position = [13.0, 0, -6.0],
  plotNumber = 1,
  districtName = 'BUILD YOUR STORE',
  onConstructClick
}) => {
  const [hovered, setHovered] = useState(false)
  const craneArmRef = useRef<THREE.Group>(null)
  const beaconRef = useRef<THREE.PointLight>(null)

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    // Subtle crane rotation
    if (craneArmRef.current) {
      craneArmRef.current.rotation.y = Math.sin(t * 0.8) * 0.45
    }
    // Pulsing construction beacon
    if (beaconRef.current) {
      beaconRef.current.intensity = 2.0 + Math.sin(t * 6) * 1.5
    }
  })

  return (
    <group
      position={position}
      onClick={(e) => {
        e.stopPropagation()
        onConstructClick()
      }}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        setHovered(false)
        document.body.style.cursor = 'default'
      }}
    >
      {/* Foundation Concrete Slab on Empty Land */}
      <mesh position={[0, 0.08, 0]} receiveShadow>
        <boxGeometry args={[4.8, 0.16, 4.4]} />
        <meshStandardMaterial
          color={hovered ? '#fbbf24' : '#64748b'}
          roughness={0.8}
        />
      </mesh>

      {/* Gravel / Rebar foundation center */}
      <mesh position={[0, 0.18, 0]}>
        <boxGeometry args={[3.8, 0.06, 3.2]} />
        <meshStandardMaterial color="#475569" roughness={0.9} />
      </mesh>

      {/* Access Pathway connecting Plot to Road Curb */}
      <mesh position={[-1.0, 0.04, 3.2]} receiveShadow>
        <boxGeometry args={[1.6, 0.08, 2.2]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.7} />
      </mesh>

      {/* Concrete Foundation Rebar Pillars (Rising from gravel like in Image 2) */}
      {[-1.2, -0.4, 0.4, 1.2].map((rx, i) =>
        [-0.8, 0.0, 0.8].map((rz, j) => (
          <mesh key={`rebar-${i}-${j}`} position={[rx, 0.45, rz]}>
            <cylinderGeometry args={[0.04, 0.04, 0.6, 6]} />
            <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.4} />
          </mesh>
        ))
      )}

      {/* Safety Construction Cones (4 corners with glowing beacons) */}
      {[
        [-2.1, -1.9],
        [2.1, -1.9],
        [-2.1, 1.9],
        [2.1, 1.9]
      ].map(([cx, cz], idx) => (
        <group key={idx} position={[cx, 0.2, cz]}>
          <mesh castShadow>
            <coneGeometry args={[0.16, 0.45, 12]} />
            <meshStandardMaterial color="#f97316" roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.08, 0]}>
            <cylinderGeometry args={[0.13, 0.13, 0.08, 12]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh position={[0, 0.24, 0]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial color="#fbbf24" emissive="#f97316" emissiveIntensity={2.2} />
          </mesh>
          <pointLight position={[0, 0.3, 0]} intensity={0.65} distance={2.5} color="#f97316" />
        </group>
      ))}

      {/* ORANGE CONSTRUCTION CRANE (Image 2 style) */}
      <group position={[1.6, 0.16, -1.2]}>
        {/* Crane Vertical Tower */}
        <mesh position={[0, 1.8, 0]} castShadow>
          <boxGeometry args={[0.25, 3.6, 0.25]} />
          <meshStandardMaterial color="#ea580c" metalness={0.7} roughness={0.3} />
        </mesh>

        {/* Crane Tower Warning Beacon */}
        <mesh position={[0, 3.75, 0]}>
          <sphereGeometry args={[0.07, 8, 8]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={2.5} />
        </mesh>
        <pointLight position={[0, 3.8, 0]} intensity={1.5} distance={6} color="#ef4444" />

        {/* Crane Rotating Arm */}
        <group ref={craneArmRef} position={[0, 3.6, 0]}>
          {/* Main Jib Boom */}
          <mesh position={[-0.8, 0, 0]} castShadow>
            <boxGeometry args={[2.2, 0.16, 0.16]} />
            <meshStandardMaterial color="#f97316" metalness={0.6} />
          </mesh>
          {/* Counter Jib */}
          <mesh position={[0.5, 0, 0]}>
            <boxGeometry args={[0.9, 0.16, 0.16]} />
            <meshStandardMaterial color="#f97316" metalness={0.6} />
          </mesh>
          {/* Counterweight */}
          <mesh position={[0.8, -0.15, 0]}>
            <boxGeometry args={[0.4, 0.3, 0.3]} />
            <meshStandardMaterial color="#334155" metalness={0.8} />
          </mesh>
          {/* Hoist Cable & Hook */}
          <mesh position={[-1.6, -0.8, 0]}>
            <cylinderGeometry args={[0.01, 0.01, 1.6, 8]} />
            <meshBasicMaterial color="#94a3b8" />
          </mesh>
          <mesh position={[-1.6, -1.65, 0]}>
            <boxGeometry args={[0.15, 0.15, 0.15]} />
            <meshStandardMaterial color="#eab308" />
          </mesh>
        </group>
      </group>

      {/* 3D SIGNBOARD: "CONSTRUCT - BUILD YOUR STORE" */}
      <group position={[-0.2, 1.2, 1.6]}>
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[2.8, 0.95, 0.14]} />
          <meshStandardMaterial
            color={hovered ? '#d97706' : '#1e293b'}
            roughness={0.3}
            emissive={hovered ? '#f59e0b' : '#000000'}
            emissiveIntensity={hovered ? 0.35 : 0.0}
          />
        </mesh>
        {/* Support Posts */}
        <mesh position={[-1.1, -0.65, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 1.2, 8]} />
          <meshStandardMaterial color="#475569" />
        </mesh>
        <mesh position={[1.1, -0.65, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 1.2, 8]} />
          <meshStandardMaterial color="#475569" />
        </mesh>

        {/* Text on Sign */}
        <Text
          position={[0, 0.24, 0.08]}
          fontSize={0.18}
          color="#fef08a"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          {`PLOT #${plotNumber} • CONSTRUCT`}
        </Text>
        <Text
          position={[0, -0.06, 0.08]}
          fontSize={0.10}
          color="#38bdf8"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
          letterSpacing={0.05}
        >
          {districtName}
        </Text>
        <Text
          position={[0, -0.26, 0.08]}
          fontSize={0.08}
          color="#cbd5e1"
          anchorX="center"
          anchorY="middle"
        >
          [ CLICK TO UPLOAD CSV ]
        </Text>

        {/* Pulsing Beacon Light on Top of Sign */}
        <mesh position={[0, 0.52, 0]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#f97316" emissive="#f97316" emissiveIntensity={1.5} />
        </mesh>
        <pointLight ref={beaconRef} position={[0, 0.65, 0.2]} intensity={2.5} distance={4} color="#f97316" />
      </group>
    </group>
  )
}

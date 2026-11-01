/**
 * RetailVision - Atmospheric 3D Drifting Clouds
 * Stylized low-poly clouds drifting overhead across the metropolis,
 * casting subtle shadows and giving the sky living movement and depth.
 */

import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface CloudClusterProps {
  position: [number, number, number]
  scale?: number
  speed?: number
}

function CloudCluster({ position, scale = 1, speed = 1 }: CloudClusterProps) {
  const groupRef = useRef<THREE.Group>(null)
  const initialX = position[0]

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.position.x += delta * 1.5 * speed
      // Wrap around when drifting beyond the eastern horizon
      if (groupRef.current.position.x > 110) {
        groupRef.current.position.x = -110
      }
    }
  })

  return (
    <group ref={groupRef} position={[initialX, position[1], position[2]]} scale={scale}>
      {/* Puffy Cloud Spheres */}
      <mesh position={[0, 0, 0]} castShadow>
        <sphereGeometry args={[2.8, 12, 12]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} transparent opacity={0.88} />
      </mesh>
      <mesh position={[2.0, -0.4, 0.4]} castShadow>
        <sphereGeometry args={[2.2, 10, 10]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.9} transparent opacity={0.85} />
      </mesh>
      <mesh position={[-2.0, -0.5, -0.3]} castShadow>
        <sphereGeometry args={[2.0, 10, 10]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.9} transparent opacity={0.85} />
      </mesh>
      <mesh position={[0.8, 1.0, -0.2]} castShadow>
        <sphereGeometry args={[1.8, 10, 10]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} transparent opacity={0.9} />
      </mesh>
      <mesh position={[-1.0, 0.8, 0.5]} castShadow>
        <sphereGeometry args={[1.6, 10, 10]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} transparent opacity={0.9} />
      </mesh>
    </group>
  )
}

export const DriftingClouds: React.FC = () => {
  return (
    <group position={[0, 68, 0]}>
      <CloudCluster position={[-60, 0, -40]} scale={1.8} speed={0.9} />
      <CloudCluster position={[-15, 4, -15]} scale={1.5} speed={1.1} />
      <CloudCluster position={[30, -2, -50]} scale={2.2} speed={0.8} />
      <CloudCluster position={[-80, 2, 20]} scale={1.7} speed={1.0} />
      <CloudCluster position={[10, 5, 35]} scale={1.9} speed={1.2} />
      <CloudCluster position={[70, 0, -10]} scale={2.0} speed={0.85} />
      <CloudCluster position={[-40, -3, 60]} scale={2.4} speed={0.95} />
    </group>
  )
}

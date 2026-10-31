/**
 * RetailVision - Scene Two: 3D Retail Marketplace Town Scene
 * Main simulation environment:
 * Elevated isometric camera, roads, stores, construct plot, and interactive selection.
 */

import React, { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import type { Store } from '../../types'
import { ConstructPlot } from './ConstructPlot'
import { EnvironmentDecor } from './EnvironmentDecor'
import { StoreBuilding } from './StoreBuilding'

interface MarketplaceSceneProps {
  stores: Store[]
  selectedStore: Store | null
  onStoreSelect: (store: Store) => void
  onHoverStore: (store: Store | null) => void
  onConstructClick: () => void
  cameraTarget: [number, number, number] | null
}

// Dynamic Camera Controller that smoothly glides to selected store or plot
function SmoothMarketplaceCamera({
  cameraTarget
}: {
  cameraTarget: [number, number, number] | null
}) {
  const controlsRef = useRef<any>(null)

  useFrame((state) => {
    if (cameraTarget) {
      // Focus on target store
      const [tx, ty, tz] = cameraTarget
      const desiredPos = new THREE.Vector3(tx + 4.5, ty + 5.5, tz + 6.5)
      const desiredTarget = new THREE.Vector3(tx, ty + 1.2, tz)

      state.camera.position.lerp(desiredPos, 0.05)
      if (controlsRef.current) {
        controlsRef.current.target.lerp(desiredTarget, 0.05)
        controlsRef.current.update()
      }
    }
  })

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.06}
      maxPolarAngle={Math.PI / 2.15} // Don't allow camera to go underground
      minDistance={6}
      maxDistance={42}
      target={[0, 0, 0]}
    />
  )
}

export const MarketplaceScene: React.FC<MarketplaceSceneProps> = ({
  stores,
  selectedStore,
  onStoreSelect,
  onHoverStore,
  onConstructClick,
  cameraTarget
}) => {
  return (
    <div className="w-full h-full relative bg-gradient-to-b from-sky-400 via-sky-200 to-sky-100">
      <Canvas
        shadows
        camera={{
          position: [14, 18, 16],
          fov: 40,
          near: 0.1,
          far: 200
        }}
      >
        <SmoothMarketplaceCamera cameraTarget={cameraTarget} />

        {/* Atmospheric Sky Fog */}
        <fog attach="fog" args={['#bae6fd', 45, 85]} />

        {/* Sunlight & Ambient illumination (Vibrant daylight game look) */}
        <ambientLight intensity={0.75} color="#ffffff" />
        <directionalLight
          position={[24, 32, 18]}
          intensity={1.5}
          color="#fffbeb"
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-26}
          shadow-camera-right={26}
          shadow-camera-top={26}
          shadow-camera-bottom={-26}
          shadow-bias={-0.0001}
        />
        {/* Soft fill sky & ground bounce light */}
        <hemisphereLight args={['#7dd3fc', '#4ade80', 0.55]} />

        {/* Town Environment Infrastructure */}
        <EnvironmentDecor />

        {/* Dedicated Empty Construction Plot (Shifted onto East Empty Land Parcel) */}
        <ConstructPlot position={[13.0, 0, -6.0]} onConstructClick={onConstructClick} />

        {/* Retail Store Buildings */}
        {stores.map((store) => (
          <StoreBuilding
            key={store.id}
            store={store}
            isSelected={selectedStore?.id === store.id}
            onClick={onStoreSelect}
            onHover={onHoverStore}
          />
        ))}
      </Canvas>
    </div>
  )
}

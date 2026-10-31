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
    <div className="w-full h-full relative bg-slate-900">
      <Canvas
        shadows
        camera={{
          position: [14, 18, 16],
          fov: 42,
          near: 0.1,
          far: 200
        }}
      >
        <SmoothMarketplaceCamera cameraTarget={cameraTarget} />

        {/* Sunlight & Ambient illumination */}
        <ambientLight intensity={0.65} color="#e0f2fe" />
        <directionalLight
          position={[20, 30, 15]}
          intensity={1.3}
          color="#fffbeb"
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-25}
          shadow-camera-right={25}
          shadow-camera-top={25}
          shadow-camera-bottom={-25}
        />
        {/* Soft fill sky light */}
        <hemisphereLight args={['#38bdf8', '#4ade80', 0.4]} />

        {/* Town Environment Infrastructure */}
        <EnvironmentDecor />

        {/* Dedicated Empty Construction Plot (Image 2 style) */}
        <ConstructPlot onConstructClick={onConstructClick} />

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

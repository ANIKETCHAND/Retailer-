/**
 * RetailVision - Scene Two: 3D Retail Marketplace Town Scene
 * Main simulation environment:
 * Elevated isometric camera, roads, stores, construct plot, and interactive selection.
 */

import React, { useEffect, useRef } from 'react'
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
  onCameraTargetReached?: () => void
  onUserInteract?: () => void
  onDeselectStore?: () => void
}

// Snappy, friction-free camera controller that glides once then gives 100% control back to user
function SmoothMarketplaceCamera({
  cameraTarget,
  onCameraTargetReached,
  onUserInteract
}: {
  cameraTarget: [number, number, number] | null
  onCameraTargetReached?: () => void
  onUserInteract?: () => void
}) {
  const controlsRef = useRef<any>(null)
  const isTransitioningRef = useRef<boolean>(false)
  const activeTargetRef = useRef<THREE.Vector3 | null>(null)
  const activePosRef = useRef<THREE.Vector3 | null>(null)

  // Trigger smooth one-shot glide when cameraTarget changes
  useEffect(() => {
    if (cameraTarget) {
      const [tx, ty, tz] = cameraTarget
      const isOverview = tx === 0 && ty === 0 && tz === 0

      activeTargetRef.current = new THREE.Vector3(tx, ty + (isOverview ? 0 : 1.2), tz)
      activePosRef.current = isOverview
        ? new THREE.Vector3(14, 18, 16)
        : new THREE.Vector3(tx + 5.5, ty + 7.5, tz + 8.5)

      isTransitioningRef.current = true
    } else {
      isTransitioningRef.current = false
    }
  }, [cameraTarget])

  // Attach OrbitControls event listener: as soon as the user touches the mouse (scroll or drag), release lock!
  useEffect(() => {
    const controls = controlsRef.current
    if (!controls) return

    const handleUserInteraction = () => {
      // User started scrolling wheel or dragging - CANCEL ANY ACTIVE PROGRAMMATIC LOCK!
      isTransitioningRef.current = false
      if (onUserInteract) onUserInteract()
    }

    controls.addEventListener('start', handleUserInteraction)
    return () => {
      controls.removeEventListener('start', handleUserInteraction)
    }
  }, [onUserInteract])

  useFrame((state) => {
    if (
      isTransitioningRef.current &&
      activePosRef.current &&
      activeTargetRef.current &&
      controlsRef.current
    ) {
      // Smoothly lerp towards the target
      state.camera.position.lerp(activePosRef.current, 0.08)
      controlsRef.current.target.lerp(activeTargetRef.current, 0.08)
      controlsRef.current.update()

      // Arrived within threshold: complete transition and release control back to OrbitControls
      const posDist = state.camera.position.distanceTo(activePosRef.current)
      const targetDist = controlsRef.current.target.distanceTo(activeTargetRef.current)

      if (posDist < 0.25 && targetDist < 0.25) {
        state.camera.position.copy(activePosRef.current)
        controlsRef.current.target.copy(activeTargetRef.current)
        controlsRef.current.update()
        isTransitioningRef.current = false
        if (onCameraTargetReached) onCameraTargetReached()
      }
    }
  })

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.08}
      rotateSpeed={0.9}
      zoomSpeed={1.8}     // Snappy, responsive scroll zoom sensitivity!
      panSpeed={1.4}      // Fast, effortless drag panning!
      minDistance={4}     // Can zoom close to inspect storefronts
      maxDistance={80}    // Can zoom way out to see the entire city easily
      maxPolarAngle={Math.PI / 2.15} // Don't allow camera to go underground
      minPolarAngle={Math.PI / 10}   // Prevent awkward top-down gimbal lock
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
  cameraTarget,
  onCameraTargetReached,
  onUserInteract,
  onDeselectStore
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
        onPointerDown={(e) => {
          // Deselect when clicking on empty canvas/background
          if ((e.target as HTMLElement).tagName === 'CANVAS' && onDeselectStore) {
            onDeselectStore()
          }
        }}
      >
        <SmoothMarketplaceCamera
          cameraTarget={cameraTarget}
          onCameraTargetReached={onCameraTargetReached}
          onUserInteract={onUserInteract}
        />

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

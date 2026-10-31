/**
 * RetailVision - Scene Two: 3D Retail Marketplace Town Scene
 * Main simulation environment:
 * Elevated isometric camera, roads, stores, construct plot, and interactive selection.
 * Dynamic Day & Night lighting transitions with night sky stars,
 * Graphics quality scaling, and responsive frictionless camera controls!
 */

import React, { useEffect, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import * as THREE from 'three'
import type { Store, TimeOfDay, GraphicsQuality } from '../../types'
import { ConstructPlot } from './ConstructPlot'
import { DriftingClouds } from './DriftingClouds'
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
  timeOfDay?: TimeOfDay
  graphicsQuality?: GraphicsQuality
  constructingStoreId?: string | null
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
      panSpeed={1.4}      // Fast, effortless drag panning across the city!
      minDistance={4}     // Can zoom close to inspect storefronts
      maxDistance={140}   // Can zoom way out to see the entire thriving metropolis!
      maxPolarAngle={Math.PI / 2.12} // Don't allow camera to go underground
      minPolarAngle={Math.PI / 12}   // Prevent awkward top-down gimbal lock
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
  onDeselectStore,
  timeOfDay = 'day',
  graphicsQuality = 'high',
  constructingStoreId
}) => {
  const isNight = timeOfDay === 'night'

  // Shadow map resolution based on quality tier
  const shadowResolution = (() => {
    switch (graphicsQuality) {
      case 'ultra': return 4096
      case 'high': return 2048
      case 'medium': return 1024
      case 'low': return 512
    }
  })()

  return (
    <div
      className={`w-full h-full relative transition-colors duration-1000 ${
        isNight
          ? 'bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950'
          : 'bg-gradient-to-b from-sky-400 via-sky-300 to-sky-200'
      }`}
    >
      <Canvas
        shadows={graphicsQuality !== 'low'}
        camera={{
          position: [18, 22, 20],
          fov: 42,
          near: 0.1,
          far: 500
        }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = isNight ? 1.1 : 1.0
          gl.shadowMap.enabled = graphicsQuality !== 'low'
          gl.shadowMap.type = THREE.PCFSoftShadowMap
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

        {/* Dynamic Fog (Day: Sky Blue, Night: Deep Midnight Slate) */}
        {isNight ? (
          <fog attach="fog" args={['#090d16', 90, 220]} />
        ) : (
          <fog attach="fog" args={['#7dd3fc', 130, 260]} />
        )}

        {/* Night Sky Stars / Day Drifting Clouds */}
        {isNight ? (
          <Stars radius={110} depth={45} count={2600} factor={4} saturation={0} fade speed={1.2} />
        ) : (
          <DriftingClouds />
        )}

        {/* Ambient Illumination */}
        <ambientLight
          intensity={isNight ? 0.22 : 0.65}
          color={isNight ? '#1e293b' : '#ffffff'}
        />

        {/* Directional Sunlight / Moonlight */}
        <directionalLight
          position={isNight ? [25, 40, -20] : [32, 45, 24]}
          intensity={isNight ? 0.35 : 1.15}
          color={isNight ? '#93c5fd' : '#fffbf0'}
          castShadow={graphicsQuality !== 'low'}
          shadow-mapSize={[shadowResolution, shadowResolution]}
          shadow-camera-left={-55}
          shadow-camera-right={55}
          shadow-camera-top={55}
          shadow-camera-bottom={-55}
          shadow-bias={-0.0001}
        />

        {/* Soft Sky & Ground Bounce Light */}
        <hemisphereLight
          args={
            isNight
              ? ['#1e1b4b', '#0f172a', 0.2]
              : ['#bae6fd', '#bbf7d0', 0.35]
          }
        />

        {/* Town Environment Infrastructure */}
        <EnvironmentDecor timeOfDay={timeOfDay} />

        {/* Dedicated Empty Construction Plot (Shifted onto East Empty Land Parcel) */}
        <ConstructPlot
          position={[13.0, 0, -6.0]}
          onConstructClick={onConstructClick}
        />

        {/* Retail Store Buildings */}
        {stores.map((store) => (
          <StoreBuilding
            key={store.id}
            store={store}
            isSelected={selectedStore?.id === store.id}
            onClick={onStoreSelect}
            onHover={onHoverStore}
            timeOfDay={timeOfDay}
            isConstructing={constructingStoreId === store.id}
          />
        ))}
      </Canvas>
    </div>
  )
}

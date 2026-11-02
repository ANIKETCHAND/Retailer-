/**
 * RetailVision - Scene Two: 3D Retail Marketplace Town Scene
 * Main simulation environment:
 * Elevated isometric camera, roads, stores, construct plot, and interactive selection.
 * Dynamic Day & Night lighting transitions with night sky stars,
 * Graphics quality scaling, responsive camera controls,
 * and real-time camera tracking for the GTA 6 Minimap Guide!
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
import { findNextAvailablePlot } from '../../api/client'

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
  const lastUpdateRef = useRef<number>(0)

  // Trigger smooth one-shot glide when cameraTarget changes
  useEffect(() => {
    if (cameraTarget) {
      const [tx, ty, tz] = cameraTarget
      const isOverview = tx === 0 && ty === 0 && tz === 0

      // Dynamic tilt: Zoom in closer and lower (28° street-level view) for stores,
      // and higher (45° RTS overview) for city overview
      activeTargetRef.current = new THREE.Vector3(tx, ty + (isOverview ? 0 : 1.2), tz)
      activePosRef.current = isOverview
        ? new THREE.Vector3(26, 32, 28)
        : new THREE.Vector3(tx + 4.5, ty + 4.8, tz + 6.8)

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
    // 1. Programmatic smooth camera glide
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

    // 2. Real-time camera tracking for GTA 6 Minimap (Direct dispatch, zero React re-render)
    const now = performance.now()
    if (now - lastUpdateRef.current > 40) {
      lastUpdateRef.current = now
      const cx = state.camera.position.x
      const cz = state.camera.position.z
      const tx = controlsRef.current?.target?.x || 0
      const tz = controlsRef.current?.target?.z || 0
      const heading = Math.atan2(tx - cx, tz - cz)
      window.dispatchEvent(
        new CustomEvent('retailvision-cam', {
          detail: { cx, cz, tx, tz, heading }
        })
      )
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
      maxDistance={450}   // Can zoom out to see the entire vast tropical mega-city archipelago!
      maxPolarAngle={Math.PI / 2.06} // Keep ocean and horizon in view without going underground
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
  const nextPlot = findNextAvailablePlot(stores)

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
          near: 0.2,
          far: 900
        }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 1.1
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
        {/* Sky Background Color (Eliminates any black canvas void) */}
        <color attach="background" args={[isNight ? '#050c18' : '#38bdf8']} />

        <SmoothMarketplaceCamera
          cameraTarget={cameraTarget}
          onCameraTargetReached={onCameraTargetReached}
          onUserInteract={onUserInteract}
        />

        {/* Dynamic Fog (Day: Sky Blue, Night: Deep Midnight Slate) */}
        {isNight ? (
          <fog attach="fog" args={['#050c18', 160, 480]} />
        ) : (
          <fog attach="fog" args={['#38bdf8', 180, 540]} />
        )}

        {/* Night Sky Stars / Day Drifting Clouds */}
        {isNight ? (
          <Stars radius={180} depth={60} count={3200} factor={4} saturation={0} fade speed={1.2} />
        ) : (
          <DriftingClouds />
        )}

        {/* Sky/Ground Hemisphere Light - Rich Ambient Color Balance */}
        <hemisphereLight
          args={
            isNight
              ? ['#1e1b4b', '#0f172a', 0.3]
              : ['#ddeeff', '#3d4e38', 0.7]
          }
        />

        {/* Directional "Sun" Light with Soft PCF Shadows */}
        <directionalLight
          position={isNight ? [35, 55, -25] : [40, 60, 30]}
          intensity={isNight ? 0.45 : 1.4}
          color={isNight ? '#93c5fd' : '#fff5e6'}
          castShadow={graphicsQuality !== 'low'}
          shadow-mapSize={[shadowResolution, shadowResolution]}
          shadow-camera-near={0.5}
          shadow-camera-far={150}
          shadow-camera-left={-75}
          shadow-camera-right={75}
          shadow-camera-top={75}
          shadow-camera-bottom={-75}
          shadow-bias={-0.0005}
        />

        {/* Subtle Ambient Fill Light */}
        <ambientLight
          intensity={isNight ? 0.18 : 0.35}
          color={isNight ? '#1e293b' : '#ffffff'}
        />

        <React.Suspense fallback={null}>
          {/* Town Environment Infrastructure */}
          <EnvironmentDecor timeOfDay={timeOfDay} stores={stores} />

          {/* Dedicated Empty Construction Plot (Relocates to next vacant plot, never overlaps finished stores) */}
          <ConstructPlot
            position={[nextPlot.grid_x, 0, nextPlot.grid_z]}
            plotNumber={nextPlot.plot_index + 1}
            districtName={nextPlot.district_name}
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
        </React.Suspense>
      </Canvas>
    </div>
  )
}

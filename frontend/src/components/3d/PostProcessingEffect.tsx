/**
 * RetailVision - Cinematic WebGL Post-Processing Pipeline
 * Implements UnrealBloomPass, ACESFilmicToneMapping, and PCFSoftShadowMap
 * directly via Three.js addons to achieve rich AAA game visual fidelity.
 */

import { useEffect, useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'

export const PostProcessingEffects = () => {
  const { gl, scene, camera, size } = useThree()
  const composerRef = useRef<EffectComposer | null>(null)

  useEffect(() => {
    // Enable soft PCF shadows and cinematic filmic tone mapping
    gl.shadowMap.enabled = true
    gl.shadowMap.type = THREE.PCFSoftShadowMap
    gl.toneMapping = THREE.ACESFilmicToneMapping
    gl.toneMappingExposure = 1.18

    // Initialize composer
    const composer = new EffectComposer(gl)
    composer.addPass(new RenderPass(scene, camera))

    // Unreal Bloom: gentle glow on neon, streetlamps, glass reflections, and car lights
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(size.width, size.height),
      0.32,  // strength: tasteful, realistic bloom
      0.45,  // radius
      0.82   // threshold: only bright highlights radiate glow
    )
    composer.addPass(bloomPass)

    // Accurate color space output
    const outputPass = new OutputPass()
    composer.addPass(outputPass)

    composerRef.current = composer

    return () => {
      composer.dispose()
    }
  }, [gl, scene, camera])

  useEffect(() => {
    if (composerRef.current) {
      composerRef.current.setSize(size.width, size.height)
    }
  }, [size])

  // Priority 1 ensures composer renders to canvas after all R3F updates
  useFrame(() => {
    if (composerRef.current) {
      composerRef.current.render()
    }
  }, 1)

  return null
}

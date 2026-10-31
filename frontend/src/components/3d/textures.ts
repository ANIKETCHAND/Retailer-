/**
 * RetailVision - Clean Procedural Surface Textures
 * High-quality micro-grain textures without repetitive stripes or banding.
 */

import * as THREE from 'three'

// 1. Manicured Natural Lawn Turf (Subtle organic grain, no visible barcode banding)
export function createGrassTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')

  if (ctx) {
    // Rich saturated lawn green base
    ctx.fillStyle = '#22c55e'
    ctx.fillRect(0, 0, 512, 512)

    // Soft organic noise for natural turf appearance
    for (let i = 0; i < 8000; i++) {
      const rx = Math.random() * 512
      const ry = Math.random() * 512
      const isBright = Math.random() > 0.5
      ctx.fillStyle = isBright ? '#4ade80' : '#16a34a'
      ctx.fillRect(rx, ry, 2, 2)
    }
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(40, 40) // Very high repeat = seamless fine grass texture, zero visible lines
  return texture
}

// 2. Smooth Charcoal Asphalt Road Texture
export function createAsphaltTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')

  if (ctx) {
    ctx.fillStyle = '#334155'
    ctx.fillRect(0, 0, 256, 256)

    // Fine dark stone specks
    for (let i = 0; i < 3000; i++) {
      const rx = Math.random() * 256
      const ry = Math.random() * 256
      const tone = Math.floor(45 + Math.random() * 20)
      ctx.fillStyle = `rgb(${tone}, ${tone + 4}, ${tone + 8})`
      ctx.fillRect(rx, ry, 1, 1)
    }
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(6, 30)
  return texture
}

// 3. Clean Concrete Pavers
export function createPaverTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')

  if (ctx) {
    ctx.fillStyle = '#e2e8f0'
    ctx.fillRect(0, 0, 256, 256)

    // Subtle expansion joints
    ctx.strokeStyle = '#cbd5e1'
    ctx.lineWidth = 2
    for (let i = 0; i <= 256; i += 64) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i, 256)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(0, i)
      ctx.lineTo(256, i)
      ctx.stroke()
    }
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(12, 8)
  return texture
}

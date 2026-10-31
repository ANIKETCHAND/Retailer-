/**
 * RetailVision - High-Resolution Procedural Textures
 * Generates canvas textures for grass lawns, asphalt roadways,
 * concrete paving stones, and skyscraper window grids to give
 * the 3D metropolis tangible depth and realistic surface variation.
 */

import * as THREE from 'three'

// 1. Manicured Striped Lawn Turf Texture
export function createGrassTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')

  if (ctx) {
    // Base green
    ctx.fillStyle = '#22c55e'
    ctx.fillRect(0, 0, 512, 512)

    // Striped lawn mowing pattern (alternating bands of deep and bright emerald)
    const stripeWidth = 64
    for (let x = 0; x < 512; x += stripeWidth * 2) {
      ctx.fillStyle = '#16a34a'
      ctx.fillRect(x, 0, stripeWidth, 512)
    }

    // Fine turf grass blade noise
    for (let i = 0; i < 4000; i++) {
      const rx = Math.random() * 512
      const ry = Math.random() * 512
      ctx.fillStyle = Math.random() > 0.5 ? '#15803d' : '#4ade80'
      ctx.fillRect(rx, ry, 2, 3)
    }
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(16, 16)
  return texture
}

// 2. Realistic Asphalt Road Texture (Dark aggregate with fine grain)
export function createAsphaltTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')

  if (ctx) {
    ctx.fillStyle = '#27272a'
    ctx.fillRect(0, 0, 512, 512)

    // Fine aggregate stone grain
    for (let i = 0; i < 6000; i++) {
      const rx = Math.random() * 512
      const ry = Math.random() * 512
      const tone = Math.floor(40 + Math.random() * 30)
      ctx.fillStyle = `rgb(${tone}, ${tone}, ${tone})`
      ctx.fillRect(rx, ry, 2, 2)
    }
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(4, 20)
  return texture
}

// 3. Concrete Sidewalk Paver Tiles (Beveled tiles with expansion joints)
export function createPaverTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')

  if (ctx) {
    ctx.fillStyle = '#e2e8f0'
    ctx.fillRect(0, 0, 256, 256)

    // Tile grid lines (subtle dark joint seams)
    ctx.strokeStyle = '#cbd5e1'
    ctx.lineWidth = 4
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
  texture.repeat.set(8, 8)
  return texture
}

// 4. Skyscraper Office Window Grid (Scattered warm lights at dusk/day)
export function createWindowGridTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 512
  const ctx = canvas.getContext('2d')

  if (ctx) {
    ctx.fillStyle = '#0f172a'
    ctx.fillRect(0, 0, 256, 512)

    const cols = 8
    const rows = 24
    const cellW = 256 / cols
    const cellH = 512 / rows

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // Randomly lit window (cyan, warm amber, or dark)
        const rand = Math.random()
        if (rand > 0.45) {
          ctx.fillStyle = rand > 0.8 ? '#fef08a' : '#38bdf8'
        } else {
          ctx.fillStyle = '#1e293b'
        }
        ctx.fillRect(c * cellW + 4, r * cellH + 4, cellW - 8, cellH - 8)
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(1, 1)
  return texture
}

/**
 * RetailVision - High-Performance Procedural PBR Textures
 * Generates lightweight, optimized canvas textures for grass, asphalt,
 * concrete pavers, wood decking, terracotta roof tiles, and marble.
 */

import * as THREE from 'three'

// Helper to create and configure repeated CanvasTexture
function makeRepeatedTexture(canvas: HTMLCanvasElement, repeatX: number, repeatY: number): THREE.CanvasTexture {
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(repeatX, repeatY)
  return texture
}

// 1. Manicured Natural Lawn Turf
export function createGrassTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.fillStyle = '#16a34a'
    ctx.fillRect(0, 0, 512, 512)

    for (let i = 0; i < 9000; i++) {
      const rx = Math.random() * 512
      const ry = Math.random() * 512
      const rand = Math.random()
      ctx.fillStyle = rand > 0.6 ? '#22c55e' : rand > 0.3 ? '#15803d' : '#4ade80'
      ctx.fillRect(rx, ry, 2, 2)
    }
  }
  return makeRepeatedTexture(canvas, 36, 36)
}

// 2. Realistic Asphalt Roadway with Fine Micro-Aggregate (Moiré-Free)
export function createAsphaltTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')
  if (ctx) {
    // Deep dark slate/charcoal asphalt base
    ctx.fillStyle = '#1e293b'
    ctx.fillRect(0, 0, 512, 512)

    // Very fine uniform micro-aggregate specks (no directional banding)
    for (let i = 0; i < 12000; i++) {
      const rx = Math.random() * 512
      const ry = Math.random() * 512
      const shade = Math.floor(22 + Math.random() * 26)
      ctx.fillStyle = `rgb(${shade}, ${shade + 3}, ${shade + 6})`
      ctx.fillRect(rx, ry, 1.5, 1.5)
    }
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(16, 16) // Uniform 1:1 square repeat eliminates any directional moiré or stretching
  texture.anisotropy = 8
  return texture
}

// 3. Concrete Plaza Paver Tiles
export function createPaverTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.fillStyle = '#f1f5f9'
    ctx.fillRect(0, 0, 256, 256)

    // Subtle noise
    for (let i = 0; i < 2000; i++) {
      const rx = Math.random() * 256
      const ry = Math.random() * 256
      ctx.fillStyle = Math.random() > 0.5 ? '#e2e8f0' : '#ffffff'
      ctx.fillRect(rx, ry, 2, 2)
    }

    // Joint seams
    ctx.strokeStyle = '#cbd5e1'
    ctx.lineWidth = 3
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
  const texture = makeRepeatedTexture(canvas, 8, 8)
  texture.anisotropy = 8
  return texture
}

// 4. Warm Timber Decking / Hardwood Planks
export function createWoodDeckTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.fillStyle = '#b45309'
    ctx.fillRect(0, 0, 256, 256)

    const plankHeight = 32
    for (let y = 0; y < 256; y += plankHeight) {
      ctx.fillStyle = y % 64 === 0 ? '#92400e' : '#d97706'
      ctx.fillRect(0, y, 256, plankHeight - 2)

      // Wood grain streaks
      for (let i = 0; i < 60; i++) {
        ctx.fillStyle = 'rgba(69, 26, 3, 0.25)'
        ctx.fillRect(Math.random() * 256, y + Math.random() * (plankHeight - 4), 35, 1)
      }
    }
  }
  return makeRepeatedTexture(canvas, 6, 6)
}

// 5. Polished Neoclassical Marble Texture
export function createMarbleTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.fillStyle = '#f8fafc'
    ctx.fillRect(0, 0, 256, 256)

    // Soft marble veins
    ctx.strokeStyle = '#e2e8f0'
    ctx.lineWidth = 2
    for (let v = 0; v < 8; v++) {
      ctx.beginPath()
      ctx.moveTo(Math.random() * 256, 0)
      ctx.bezierCurveTo(
        Math.random() * 256, 80,
        Math.random() * 256, 170,
        Math.random() * 256, 256
      )
      ctx.stroke()
    }
  }
  return makeRepeatedTexture(canvas, 4, 4)
}

// 6. Terracotta Roof Tile Texture
export function createRoofTileTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.fillStyle = '#ea580c'
    ctx.fillRect(0, 0, 256, 256)

    const rowH = 24
    for (let y = 0; y < 256; y += rowH) {
      ctx.fillStyle = y % (rowH * 2) === 0 ? '#c2410c' : '#ea580c'
      ctx.fillRect(0, y, 256, rowH - 2)

      // Tile scallops / segments
      for (let x = 0; x < 256; x += 32) {
        ctx.strokeStyle = '#9a3412'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(x + 16, y + rowH - 2, 14, Math.PI, 0)
        ctx.stroke()
      }
    }
  }
  return makeRepeatedTexture(canvas, 6, 6)
}


// 7. Dark Ashlar Stone Texture for Luxury Boutique Facade
export function createDarkAshlarStoneTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')
  if (ctx) {
    // Dark stone base
    ctx.fillStyle = '#292524'
    ctx.fillRect(0, 0, 512, 512)

    // Staggered ashlar blocks
    const blockH = 64
    const blockW = 128
    for (let row = 0; row <= 8; row++) {
      const y = row * blockH
      const offset = (row % 2) * (blockW / 2)
      for (let col = -1; col <= 5; col++) {
        const x = col * blockW + offset
        const shade = Math.floor(38 + Math.random() * 18)
        ctx.fillStyle = 'rgb(' + shade + ', ' + (shade - 2) + ', ' + (shade - 4) + ')'
        ctx.fillRect(x + 2, y + 2, blockW - 4, blockH - 4)

        // Micro texture specks
        for (let s = 0; s < 40; s++) {
          const sx = x + 2 + Math.random() * (blockW - 4)
          const sy = y + 2 + Math.random() * (blockH - 4)
          ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.18)'
          ctx.fillRect(sx, sy, 2, 2)
        }
      }

      // Horizontal mortar line
      ctx.fillStyle = '#1c1917'
      ctx.fillRect(0, y, 512, 2)
    }

    // Vertical mortar lines
    for (let row = 0; row <= 8; row++) {
      const y = row * blockH
      const offset = (row % 2) * (blockW / 2)
      for (let col = -1; col <= 5; col++) {
        const x = col * blockW + offset
        ctx.fillStyle = '#1c1917'
        ctx.fillRect(x, y, 2, blockH)
      }
    }
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(4, 4)
  return texture
}

// 8. Dark Walnut PBR Wood Grain Texture
export function createDarkWalnutTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.fillStyle = '#3e2010'
    ctx.fillRect(0, 0, 512, 512)

    // Grain striations
    for (let i = 0; i < 400; i++) {
      const x = Math.random() * 512
      const w = 1 + Math.random() * 3
      const alpha = 0.08 + Math.random() * 0.15
      ctx.fillStyle = Math.random() > 0.4 ? 'rgba(26, 12, 5, ' + alpha + ')' : 'rgba(92, 52, 26, ' + alpha + ')'
      ctx.fillRect(x, 0, w, 512)
    }

    // Subtle wavy organic grain lines
    ctx.lineWidth = 1.5
    for (let g = 0; g < 20; g++) {
      const x = g * 26 + (Math.random() * 10 - 5)
      ctx.strokeStyle = 'rgba(24, 10, 4, 0.18)'
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.bezierCurveTo(x + 12, 170, x - 12, 340, x + 6, 512)
      ctx.stroke()
    }
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(2, 4)
  return texture
}

// 9. Charcoal Granite / Slate Floor Paver Texture
export function createCharcoalPaverTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.fillStyle = '#1c1917'
    ctx.fillRect(0, 0, 512, 512)

    // Tile grid (4x4 tiles per 512px)
    const tileSize = 128
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const x = c * tileSize
        const y = r * tileSize
        const val = Math.floor(26 + Math.random() * 12)
        ctx.fillStyle = 'rgb(' + val + ', ' + (val + 1) + ', ' + (val + 2) + ')'
        ctx.fillRect(x + 2, y + 2, tileSize - 4, tileSize - 4)

        // Surface speckles
        for (let s = 0; s < 50; s++) {
          ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.2)'
          ctx.fillRect(x + 2 + Math.random() * (tileSize - 4), y + 2 + Math.random() * (tileSize - 4), 2, 2)
        }
      }
    }

    // Grout lines
    ctx.strokeStyle = '#0c0a09'
    ctx.lineWidth = 3
    for (let i = 0; i <= 512; i += tileSize) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i, 512)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(0, i)
      ctx.lineTo(512, i)
      ctx.stroke()
    }
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(4, 4)
  return texture
}

// 10. Horizontal Ceiling Timber Slats Texture
export function createCeilingSlatsTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.fillStyle = '#1c1917'
    ctx.fillRect(0, 0, 256, 256)

    const slatH = 16
    for (let y = 0; y < 256; y += slatH) {
      ctx.fillStyle = y % (slatH * 2) === 0 ? '#451a03' : '#592205'
      ctx.fillRect(0, y + 2, 256, slatH - 4)

      // Highlight on slat edge
      ctx.fillStyle = 'rgba(251, 191, 36, 0.08)'
      ctx.fillRect(0, y + 2, 256, 1)

      // Shadow in groove
      ctx.fillStyle = '#0f0702'
      ctx.fillRect(0, y + slatH - 2, 256, 2)
    }
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(6, 4)
  return texture
}

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


// 7. Architectural Dark Walnut Wood Grain (Boutique Facade & Door Paneling)
export function createWalnutWoodTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.fillStyle = '#2d1b11'
    ctx.fillRect(0, 0, 512, 512)

    for (let y = 0; y < 512; y += 4) {
      const alpha = 0.08 + Math.random() * 0.12
      ctx.fillStyle = y % 8 === 0 ? `rgba(64, 40, 25, ${alpha})` : `rgba(28, 17, 10, ${alpha})`
      ctx.fillRect(0, y, 512, 3)
    }

    for (let i = 0; i < 40; i++) {
      ctx.strokeStyle = `rgba(95, 60, 38, ${0.06 + Math.random() * 0.08})`
      ctx.lineWidth = 1 + Math.random() * 3
      ctx.beginPath()
      let startY = Math.random() * 512
      ctx.moveTo(0, startY)
      ctx.bezierCurveTo(
        150, startY + (Math.random() - 0.5) * 40,
        350, startY + (Math.random() - 0.5) * 40,
        512, startY + (Math.random() - 0.5) * 20
      )
      ctx.stroke()
    }
  }
  const texture = makeRepeatedTexture(canvas, 4, 4)
  texture.anisotropy = 8
  return texture
}

// 8. Honed Architectural Limestone / Travertine Wall Slabs
export function createLimestoneTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.fillStyle = '#e5ddd3'
    ctx.fillRect(0, 0, 512, 512)

    for (let i = 0; i < 15000; i++) {
      const x = Math.random() * 512
      const y = Math.random() * 512
      const shade = Math.floor(190 + Math.random() * 50)
      ctx.fillStyle = `rgb(${shade}, ${shade - 6}, ${shade - 14})`
      ctx.fillRect(x, y, 1.5, 1.5)
    }

    for (let i = 0; i < 25; i++) {
      ctx.strokeStyle = `rgba(180, 165, 150, ${0.12 + Math.random() * 0.15})`
      ctx.lineWidth = 1 + Math.random() * 2
      ctx.beginPath()
      const y = Math.random() * 512
      ctx.moveTo(0, y)
      ctx.lineTo(512, y + (Math.random() - 0.5) * 8)
      ctx.stroke()
    }

    ctx.strokeStyle = 'rgba(120, 108, 95, 0.45)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(256, 0)
    ctx.lineTo(256, 512)
    ctx.moveTo(0, 256)
    ctx.lineTo(512, 256)
    ctx.stroke()
  }
  const texture = makeRepeatedTexture(canvas, 3, 3)
  texture.anisotropy = 8
  return texture
}

// 9. Boutique Sidewalk Flamed Charcoal Granite Pavers
export function createGranitePaverTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.fillStyle = '#22252a'
    ctx.fillRect(0, 0, 512, 512)

    for (let i = 0; i < 18000; i++) {
      const x = Math.random() * 512
      const y = Math.random() * 512
      const val = Math.floor(25 + Math.random() * 45)
      ctx.fillStyle = `rgb(${val}, ${val + 2}, ${val + 6})`
      ctx.fillRect(x, y, 1.5, 1.5)
    }

    ctx.strokeStyle = '#121417'
    ctx.lineWidth = 4
    const step = 128
    for (let x = 0; x <= 512; x += step) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, 512)
      ctx.stroke()
    }
    for (let y = 0; y <= 512; y += step) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(512, y)
      ctx.stroke()
    }
  }
  const texture = makeRepeatedTexture(canvas, 6, 6)
  texture.anisotropy = 8
  return texture
}

// 10. Chevron Herringbone Parquet Luxury Interior Floor
export function createChevronParquetTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.fillStyle = '#4a2f1b'
    ctx.fillRect(0, 0, 512, 512)

    const h = 32
    for (let y = 0; y < 512; y += h) {
      ctx.fillStyle = y % (h * 2) === 0 ? '#3f2715' : '#573721'
      ctx.fillRect(0, y, 512, h - 2)

      for (let x = 0; x < 512; x += 64) {
        ctx.strokeStyle = '#27170c'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(x + 32, y + h)
        ctx.lineTo(x + 64, y)
        ctx.stroke()
      }
    }
  }
  const texture = makeRepeatedTexture(canvas, 4, 4)
  texture.anisotropy = 8
  return texture
}

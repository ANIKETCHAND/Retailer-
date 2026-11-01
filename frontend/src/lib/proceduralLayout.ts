/**
 * RetailVision - Procedural City Layout & Plot Allocation Engine
 * Shared mathematical algorithm guaranteeing collision-free, structured
 * expansion across districts for infinite store construction.
 */

import type { Store } from '../types'

export interface PlotDefinition {
  plot_index: number
  grid_x: number
  grid_z: number
  x: number
  z: number
  rotation_y: number
  district_id: string
  district_name: string
  theme: string
  color: string
}

export interface DistrictInfo {
  id: string
  name: string
  theme: string
  color: string
  center: [number, number]
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number }
}

export const DISTRICT_DEFINITIONS: Array<{
  id: string
  name: string
  theme: string
  color: string
  center: [number, number]
  plots: Array<[number, number]>
}> = [
  {
    id: 'district_1',
    name: 'Central Commercial Plaza',
    theme: 'Metropolitan Flagship Core',
    color: '#38bdf8',
    center: [0.0, 0.0],
    plots: [
      [-6.5, -6.0],   // 0: Store 1 (Electronics)
      [6.5, 6.0],     // 1: Store 2 (Grocery)
      [-6.5, 6.0],    // 2: Store 3 (Clothing)
      [13.0, 6.0],    // 3: Store 4 (Furniture)
      [6.5, -6.0],    // 4: Store 5 (Accessories)
      [13.0, -6.0],   // 5: Plot 1 (First empty plot for Store 6)
      [-13.0, -6.0],  // 6: Plot 2
      [-13.0, 6.0],   // 7: Plot 3
    ]
  },
  {
    id: 'district_2',
    name: 'East Boulevard Commercial Hub',
    theme: 'Contemporary Retail & Dining',
    color: '#f59e0b',
    center: [22.5, 0.0],
    plots: [
      [19.5, -6.0],   // 8: Plot 4
      [19.5, 6.0],    // 9: Plot 5
      [25.5, -6.0],   // 10: Plot 6
      [25.5, 6.0],    // 11: Plot 7
      [19.5, -12.0],  // 12: Plot 8
      [19.5, 12.0],   // 13: Plot 9
      [25.5, -12.0],  // 14: Plot 10
      [25.5, 12.0],   // 15: Plot 11
    ]
  },
  {
    id: 'district_3',
    name: 'West Fashion Promenade',
    theme: 'Luxury Boutiques & Salons',
    color: '#ec4899',
    center: [-22.5, 0.0],
    plots: [
      [-19.5, -6.0],  // 16: Plot 12
      [-19.5, 6.0],   // 17: Plot 13
      [-25.5, -6.0],  // 18: Plot 14
      [-25.5, 6.0],   // 19: Plot 15
      [-19.5, -12.0], // 20: Plot 16
      [-19.5, 12.0],  // 21: Plot 17
      [-25.5, -12.0], // 22: Plot 18
      [-25.5, 12.0],  // 23: Plot 19
    ]
  },
  {
    id: 'district_4',
    name: 'North Innovation Parkway',
    theme: 'Technology & Smart Living',
    color: '#10b981',
    center: [0.0, -19.0],
    plots: [
      [-6.5, -16.0],  // 24: Plot 20
      [6.5, -16.0],   // 25: Plot 21
      [-13.0, -16.0], // 26: Plot 22
      [13.0, -16.0],  // 27: Plot 23
      [-6.5, -22.0],  // 28: Plot 24
      [6.5, -22.0],   // 29: Plot 25
      [-13.0, -22.0], // 30: Plot 26
      [13.0, -22.0],  // 31: Plot 27
    ]
  },
  {
    id: 'district_5',
    name: 'South Marina Waterfront',
    theme: 'Coastal Lifestyle & Artisan Goods',
    color: '#8b5cf6',
    center: [0.0, 19.0],
    plots: [
      [-6.5, 16.0],   // 32: Plot 28
      [6.5, 16.0],    // 33: Plot 29
      [-13.0, 16.0],  // 34: Plot 30
      [13.0, 16.0],   // 35: Plot 31
      [-6.5, 22.0],   // 36: Plot 32
      [6.5, 22.0],    // 37: Plot 33
      [-13.0, 22.0],  // 38: Plot 34
      [13.0, 22.0],   // 39: Plot 35
    ]
  }
]

export function getPlotDefinition(index: number): PlotDefinition {
  let currentOffset = 0
  for (const district of DISTRICT_DEFINITIONS) {
    const count = district.plots.length
    if (index < currentOffset + count) {
      const relIdx = index - currentOffset
      const [gx, gz] = district.plots[relIdx]
      let rotY = 0
      if (Math.abs(gx) > Math.abs(gz)) {
        rotY = gx > 0 ? -1.57 : 1.57
      } else {
        rotY = gz > 0 ? 3.14 : 0.0
      }

      return {
        plot_index: index,
        grid_x: Math.round(gx * 100) / 100,
        grid_z: Math.round(gz * 100) / 100,
        x: Math.round(gx * 100) / 100,
        z: Math.round(gz * 100) / 100,
        rotation_y: rotY,
        district_id: district.id,
        district_name: district.name,
        theme: district.theme,
        color: district.color
      }
    }
    currentOffset += count
  }

  // Infinite Procedural Outer Ring Extension (Index >= 40)
  const extraIdx = index - 40
  const ring = 6 + Math.floor(extraIdx / 16)
  const slot = extraIdx % 16
  const side = Math.floor(slot / 4)
  const posInSide = slot % 4

  const baseDist = 28.0 + (ring - 6) * 12.0
  const offsets = [-9.75, -3.25, 3.25, 9.75]
  const lateral = offsets[posInSide]

  let gx = 0
  let gz = 0
  let rotY = 0

  if (side === 0) {
    // East
    gx = baseDist
    gz = lateral
    rotY = -1.57
  } else if (side === 1) {
    // West
    gx = -baseDist
    gz = lateral
    rotY = 1.57
  } else if (side === 2) {
    // North
    gx = lateral
    gz = -baseDist
    rotY = 0
  } else {
    // South
    gx = lateral
    gz = baseDist
    rotY = 3.14
  }

  return {
    plot_index: index,
    grid_x: Math.round(gx * 100) / 100,
    grid_z: Math.round(gz * 100) / 100,
    x: Math.round(gx * 100) / 100,
    z: Math.round(gz * 100) / 100,
    rotation_y: rotY,
    district_id: `district_${ring}`,
    district_name: `Metropolis District ${ring}`,
    theme: 'Expanded Metropolitan Zone',
    color: '#6366f1'
  }
}

/**
 * Finds the next unoccupied plot given the current list of stores.
 * Guarantees that when Store N is placed on Plot N, Plot N+1 is immediately returned.
 */
export function findNextAvailablePlot(existingStores: Store[]): PlotDefinition {
  let index = 0
  while (true) {
    const plot = getPlotDefinition(index)
    const isOccupied = existingStores.some((s) => {
      const sx = s.grid_x ?? 0
      const sz = s.grid_z ?? 0
      return Math.hypot(sx - plot.grid_x, sz - plot.grid_z) < 3.2
    })
    if (!isOccupied) {
      return plot
    }
    index++
  }
}

/**
 * Returns which districts are active (have at least one store or active plot)
 */
export function getActiveDistricts(existingStores: Store[]): string[] {
  const districtSet = new Set<string>(['district_1'])
  for (const s of existingStores) {
    if (s.district_id) {
      districtSet.add(s.district_id)
    } else {
      // Deduce from coordinate
      const x = s.grid_x ?? 0
      const z = s.grid_z ?? 0
      if (Math.abs(x) > 18) {
        districtSet.add(x > 0 ? 'district_2' : 'district_3')
      } else if (Math.abs(z) > 14) {
        districtSet.add(z > 0 ? 'district_5' : 'district_4')
      }
    }
  }
  return Array.from(districtSet)
}

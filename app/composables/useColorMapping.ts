import type { Bucket } from '~/types'

/**
 * Green-tone color palette with 8 gradient levels
 * From light (low data) to dark (high data)
 * Improved for better readability with higher contrast
 */
const GREEN_PALETTE = [
  '#e8f5e9', // Level 0 - Very light (lowest data)
  '#c8e6c9', // Level 1 - Light
  '#a5d6a7', // Level 2
  '#81c784', // Level 3
  '#66bb6a', // Level 4
  '#4caf50', // Level 5
  '#388e3c', // Level 6
  '#1b5e20', // Level 7 - Darkest (highest data)
] as const

const EMPTY_CELL = '#f5f5f5'

/**
 * Calculate color level based on data count
 * Uses linear scaling between min and max
 */
export function getColorLevel(dataCount: number, minDataCount: number, maxDataCount: number): number {
  if (minDataCount === maxDataCount) return 4 // Middle level
  
  const range = maxDataCount - minDataCount
  const normalizedValue = (dataCount - minDataCount) / range
  
  // Map to 0-7 range (8 levels)
  return Math.min(7, Math.floor(normalizedValue * 8))
}

/**
 * Get background color for a bucket based on its data count
 */
export function getBucketColor(bucket: Bucket | null, minDataCount: number, maxDataCount: number): string {
  if (!bucket || bucket.dataCount === 0) {
    return EMPTY_CELL
  }
  
  const level = getColorLevel(bucket.dataCount, minDataCount, maxDataCount)
  return GREEN_PALETTE[level] ?? GREEN_PALETTE[4]
}

/**
 * Get text color for contrast
 */
export function getTextColor(backgroundColor: string): string {
  // For the empty cell, use dark text
  if (backgroundColor === EMPTY_CELL) {
    return '#6b7280'
  }
  
  // For the new green palette, use dark text for lighter backgrounds, white for darker
  const lightLevels = ['#e8f5e9', '#c8e6c9', '#a5d6a7', '#81c784']
  if (lightLevels.includes(backgroundColor)) {
    return '#1a1a1a'
  }
  return '#ffffff'
}

/**
 * Get all palette colors for the legend
 */
export function getPaletteColors(): string[] {
  return [...GREEN_PALETTE]
}

/**
 * Get color for a specific level (0-7)
 */
export function getColorByLevel(level: number): string {
  if (level < 0 || level > 7) return EMPTY_CELL
  const color = GREEN_PALETTE[level]
  return color !== undefined ? color : GREEN_PALETTE[4]
}

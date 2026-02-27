/**
 * Format bytes to human-readable size
 */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '0 B'
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Format large numbers with abbreviations (K, M, B)
 */
export function formatNumber(num: number): string {
  if (!Number.isFinite(num) || num < 0) return '0'
  
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B'
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

/**
 * Format number with comma separators
 */
export function formatWithCommas(num: number): string {
  if (!Number.isFinite(num) || num < 0) return '0'
  return num.toLocaleString()
}

/**
 * Format compression ratio as percentage
 */
export function formatCompressionRatio(ratio: number): string {
  if (!Number.isFinite(ratio) || ratio < 0) return '0%'
  return ratio.toFixed(2) + '%'
}

/**
 * Format hour label
 */
export function formatHourLabel(hour: number): string {
  return `${hour}:00`
}

/**
 * Format minute label
 */
export function formatMinuteLabel(minute: number): string {
  return String(minute).padStart(2, '0')
}

/**
 * Flexible timestamp — fields present depend on granularity
 */
export interface ChunkDate {
  year: number
  month: number   // 1-12
  day: number     // 1-31
  hour: number    // 0-23
  minute?: number // 0-59 (present in bucket-level data)
}

/**
 * A single data chunk (one minute of backup data)
 */
export interface Bucket {
  date: ChunkDate
  dataChunkCount: number    // Always 1
  sizeOnDisk: number        // Bytes
  compressedBytes: number   // Bytes (≈ sizeOnDisk)
  uncompressedBytes: number // Bytes
  compressionRatio: number  // uncompressedBytes / compressedBytes
  dataCount: number         // Number of records
}

/**
 * An hourly group containing 60 minute-buckets
 */
export interface ChunkGroup {
  date: ChunkDate           // Hour-level date (no minute field)
  buckets: Bucket[]         // 60 buckets (one per minute)
  dataChunkCount: number    // Sum of all bucket counts
  sizeOnDisk: number        // Sum of all bucket sizes
  compressedBytes: number
  uncompressedBytes: number
  compressionRatio: number  // Calculated from totals
  dataCount: number         // Sum of all bucket record counts
}

/**
 * Full API response for chunk data
 */
export interface SignedFilesResponse {
  groups: ChunkGroup[]      // 24 groups (one per hour)
  dataChunkCount: number    // Total chunks across all groups
  sizeOnDisk: number        // Total size across all groups
  compressedBytes: number
  uncompressedBytes: number
  compressionRatio: number
  dataCount: number         // Total records across all groups
  minDataCount: number      // Minimum dataCount across all buckets
  maxDataCount: number      // Maximum dataCount across all buckets
  minByte: number           // Minimum sizeOnDisk across all buckets
  maxByte: number           // Maximum sizeOnDisk across all buckets
}

/**
 * Download URL for a single chunk file
 */
export interface DownloadFile {
  fileId: string
  fileName: string          // Format: chunk_YYYY_MM_DD_HH_mm.dat
  downloadUrl: string       // Time-limited signed URL
  expirationDate: string    // ISO 8601 date string
  fileSize: number          // Bytes
}

/**
 * Result of a delete operation
 */
export interface DeleteResult {
  processedFileIds: string[] // Successfully deleted file IDs
  failedFileIds: string[]    // Failed file IDs (empty on full success)
  status: string             // "completed" | "partial" | "failed"
  additionalInfo: string     // Human-readable summary
}

/**
 * Request body for download-urls and delete endpoints
 */
export interface ChunkRequest {
  dates: ChunkDate[]        // List of chunk timestamps to operate on
}

/**
 * Selection state for a bucket
 */
export interface BucketSelection {
  date: ChunkDate
  selected: boolean
}

/**
 * Hour group with selection state
 */
export interface GroupSelection {
  hour: number
  allSelected: boolean
  partialSelected: boolean
  selectedMinutes: Set<number>
}

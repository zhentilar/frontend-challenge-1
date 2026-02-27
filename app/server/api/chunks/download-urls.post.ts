import { defineEventHandler, readBody, createError } from 'h3'
import type { ChunkRequest, DownloadFile, Bucket } from '~/types'
import signedfilesData from '../../mock-data/signedfiles.json'

// Mock data fallback sizes (used when bucket data is not found)
const FALLBACK_MIN_SIZE = 89808
const FALLBACK_MAX_SIZE = 209888

export default defineEventHandler(async (event) => {
  const body = await readBody<ChunkRequest>(event)
  
  if (!body.dates || !Array.isArray(body.dates)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid request body: dates array is required'
    })
  }

  const downloads: DownloadFile[] = []
  
  // Build a lookup map for buckets by date
  const bucketMap = new Map<string, Bucket>()
  for (const group of signedfilesData.groups) {
    for (const bucket of group.buckets) {
      const key = `${bucket.date.year}-${bucket.date.month}-${bucket.date.day}-${bucket.date.hour}-${bucket.date.minute}`
      bucketMap.set(key, bucket)
    }
  }

  for (const date of body.dates) {
    const key = `${date.year}-${date.month}-${date.day}-${date.hour}-${date.minute}`
    const bucket = bucketMap.get(key)
    
    const fileName = `chunk_${date.year}_${String(date.month).padStart(2, '0')}_${String(date.day).padStart(2, '0')}_${String(date.hour).padStart(2, '0')}_${String(date.minute).padStart(2, '0')}.dat`
    
    downloads.push({
      fileId: `f${downloads.length + 1}`,
      fileName,
      downloadUrl: `/api/download?file=${encodeURIComponent(fileName)}&size=${bucket?.sizeOnDisk || Math.floor(Math.random() * (FALLBACK_MAX_SIZE - FALLBACK_MIN_SIZE) + FALLBACK_MIN_SIZE)}`,
      expirationDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      fileSize: bucket?.sizeOnDisk || Math.floor(Math.random() * (FALLBACK_MAX_SIZE - FALLBACK_MIN_SIZE) + FALLBACK_MIN_SIZE)
    })
  }

  return downloads
})

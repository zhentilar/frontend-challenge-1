import { defineEventHandler, readBody, createError } from 'h3'
import type { ChunkRequest, DeleteResult } from '~/types'

export default defineEventHandler(async (event) => {
  const body = await readBody<ChunkRequest>(event)
  
  if (!body.dates || !Array.isArray(body.dates)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid request body: dates array is required'
    })
  }

  // Mock delete response - no actual deletion
  const fileIds = body.dates.map((_, index) => `f${index + 1}`)
  
  const result: DeleteResult = {
    processedFileIds: fileIds,
    failedFileIds: [],
    status: 'completed',
    additionalInfo: `${body.dates.length} files deleted successfully`
  }

  return result
})

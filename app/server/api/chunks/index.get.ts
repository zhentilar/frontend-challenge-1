import { defineEventHandler } from 'h3'
import type { SignedFilesResponse } from '~/types'

export default defineEventHandler(async () => {
  // Import mock data from the server mock-data directory
  const mockData = await import('../../mock-data/signedfiles.json') as SignedFilesResponse
  
  return mockData
})

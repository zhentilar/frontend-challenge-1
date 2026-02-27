import { defineEventHandler, getQuery } from 'h3'

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const fileName = query.file as string
  const size = parseInt(query.size as string) || 1024 * 100 // 100KB default

  // Generate mock binary data
  const data = new Uint8Array(size)
  for (let i = 0; i < size; i++) {
    data[i] = Math.floor(Math.random() * 256)
  }

  // Set response headers for file download
  event.node.res.setHeader('Content-Type', 'application/octet-stream')
  event.node.res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`)
  event.node.res.setHeader('Content-Length', size)

  return data
})

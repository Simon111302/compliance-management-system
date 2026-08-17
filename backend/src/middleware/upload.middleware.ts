import express, { type RequestHandler } from 'express'

export const evidenceUpload: RequestHandler = express.raw({
  limit: '10mb',
  type: 'application/octet-stream',
})

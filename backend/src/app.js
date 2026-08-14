import express from 'express'
import { connectDatabase } from './config/database.js'
import { databaseName, frontendOrigin } from './config/env.js'
import authRoutes from './routes/authRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import complianceRoutes from './routes/complianceRoutes.js'
import { errorHandler } from './middleware/errorHandler.js'

export function createApp(database) {
  const app = express()
  app.locals.database = database
  app.disable('x-powered-by')
  app.use((request, response, next) => {
    const origin = request.get('origin')
    if (origin && origin !== frontendOrigin) {
      response.status(403).json({ message: 'Origin is not allowed' })
      return
    }

    response.setHeader('X-Content-Type-Options', 'nosniff')
    response.setHeader('X-Frame-Options', 'DENY')
    response.setHeader('Referrer-Policy', 'no-referrer')
    next()
  })
  app.use(
    '/api/compliances/:id/evidence',
    express.raw({ limit: '10mb', type: 'application/octet-stream' }),
  )
  app.use(express.json({ limit: '100kb' }))

  app.get('/api/health', async (_request, response, next) => {
    try {
      await database.command({ ping: 1 })
      response.json({ database: databaseName, status: 'connected' })
    } catch (error) {
      next(error)
    }
  })

  app.use('/api/auth', authRoutes)
  app.use('/api/admin', adminRoutes)
  app.use('/api/compliances', complianceRoutes)
  app.use(errorHandler)

  return app
}

export async function prepareDatabase(database) {
  await Promise.all([
    database.collection('compliances').createIndex({ id: 1 }, { unique: true }),
    database
      .collection('sessions')
      .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    database
      .collection('reviewerActions')
      .createIndex({ reviewerId: 1, createdAt: -1 }),
    database.collection('auditLogs').createIndex({ createdAt: -1 }),
  ])
}

export { connectDatabase }

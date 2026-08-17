import express, { type Express } from 'express'
import type { Db } from 'mongodb'
import { connectDatabase } from './config/database.js'
import { databaseName, frontendOrigin } from './config/env.js'
import authRoutes from './routes/auth.routes.js'
import userRoutes from './routes/user.routes.js'
import complianceRoutes from './routes/compliance.routes.js'
import reviewerActionRoutes from './routes/reviewer-action.routes.js'
import auditRoutes from './routes/audit.routes.js'
import { authenticate } from './middleware/auth.middleware.js'
import { errorMiddleware } from './middleware/error.middleware.js'
import { requireRoles } from './middleware/role.middleware.js'
import { evidenceUpload } from './middleware/upload.middleware.js'

export function createApp(database: Db): Express {
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
  app.use(express.json({ limit: '100kb' }))

  app.get('/v1/health', async (_request, response, next) => {
    try {
      await database.command({ ping: 1 })
      response.json({ database: databaseName, status: 'connected' })
    } catch (error) {
      next(error)
    }
  })

  app.use('/v1/auth', authRoutes)
  app.use(
    '/v1/compliances/:id/evidence',
    authenticate,
    requireRoles('Admin', 'Reviewer'),
    evidenceUpload,
  )
  app.use('/v1', userRoutes)
  app.use('/v1', reviewerActionRoutes)
  app.use('/v1', auditRoutes)
  app.use('/v1/compliances', complianceRoutes)
  app.use(errorMiddleware)

  return app
}

export async function prepareDatabase(database: Db): Promise<void> {
  await Promise.all([
    database.collection('users').createIndex({ userId: 1 }, { unique: true }),
    database.collection('roles').createIndex({ roleId: 1 }, { unique: true }),
    database.collection('roles').createIndex({ userId: 1 }, { unique: true }),
    database.collection('compliances').createIndex({ id: 1 }, { unique: true }),
    database
      .collection('sessions')
      .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    database
      .collection('reviewerActions')
      .createIndex({ reviewerId: 1, createdAt: -1 }),
    database
      .collection('auditLogs')
      .createIndex({ auditId: 1 }, { unique: true }),
    database.collection('auditLogs').createIndex({ createdAt: -1 }),
  ])
}

export { connectDatabase }

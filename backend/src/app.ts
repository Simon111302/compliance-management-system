import express, { type Express } from 'express'
import type { Db } from 'mongodb'
import { connectDatabase } from './config/database.js'
import { allowedFrontendOrigins, databaseName } from './config/env.js'
import authRoutes from './routes/auth.routes.js'
import userRoutes from './routes/user.routes.js'
import complianceRoutes from './routes/compliance.routes.js'
import reviewerActionRoutes from './routes/reviewer-action.routes.js'
import auditRoutes from './routes/audit.routes.js'
import notificationRoutes from './routes/notification.routes.js'
import { errorMiddleware } from './middleware/error.middleware.js'
import { evidenceUpload } from './middleware/upload.middleware.js'

export function createApp(database: Db): Express {
  const app = express()
  app.locals.database = database
  app.disable('x-powered-by')
  app.use((request, response, next) => {
    const origin = request.get('origin')
    if (origin && !allowedFrontendOrigins.has(origin)) {
      response.status(403).json({ message: 'Origin is not allowed' })
      return
    }

    if (origin) {
      response.setHeader('Access-Control-Allow-Origin', origin)
      response.setHeader('Access-Control-Allow-Credentials', 'true')
      response.setHeader('Vary', 'Origin')
    }
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    response.setHeader(
      'Access-Control-Allow-Methods',
      'GET,HEAD,POST,PUT,PATCH,DELETE',
    )
    response.setHeader('X-Content-Type-Options', 'nosniff')
    response.setHeader('X-Frame-Options', 'DENY')
    response.setHeader('Referrer-Policy', 'no-referrer')
    if (request.method === 'OPTIONS') {
      response.sendStatus(204)
      return
    }
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
  app.use('/v1/compliances/:id/evidence', evidenceUpload)
  app.use('/v1', userRoutes)
  app.use('/v1', reviewerActionRoutes)
  app.use('/v1', auditRoutes)
  app.use('/v1', notificationRoutes)
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
    database
      .collection('notifications')
      .createIndex({ userId: 1, createdAt: -1 }),
    database
      .collection('notifications')
      .createIndex({ notificationId: 1 }, { unique: true }),
  ])
}

export { connectDatabase }

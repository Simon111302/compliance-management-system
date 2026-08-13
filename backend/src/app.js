import express from 'express'
import { connectDatabase } from './config/database.js'
import { databaseName } from './config/env.js'
import authRoutes from './routes/authRoutes.js'
import complianceRoutes from './routes/complianceRoutes.js'
import { errorHandler } from './middleware/errorHandler.js'

export function createApp(database) {
  const app = express()
  app.locals.database = database
  app.use(express.json())

  app.get('/api/health', async (_request, response, next) => {
    try {
      await database.command({ ping: 1 })
      response.json({ database: databaseName, status: 'connected' })
    } catch (error) {
      next(error)
    }
  })

  app.use('/api/auth', authRoutes)
  app.use('/api/compliances', complianceRoutes)
  app.use(errorHandler)

  return app
}

export async function prepareDatabase(database, initialCompliances) {
  await database
    .collection('compliances')
    .createIndex({ id: 1 }, { unique: true })
  await database
    .collection('sessions')
    .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })

  const collection = database.collection('compliances')
  if ((await collection.countDocuments()) === 0) {
    await collection.insertMany(initialCompliances)
  }
}

export { connectDatabase }

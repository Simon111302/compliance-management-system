import { closeDatabase, connectDatabase } from './config/database.js'
import { port } from './config/env.js'
import { ensureAdminUser } from './services/admin-bootstrap.Service.js'
import { createApp, prepareDatabase } from './app.js'

async function start() {
  const database = await connectDatabase()
  await database.collection('users').createIndex({ email: 1 }, { unique: true })
  await prepareDatabase(database)
  await ensureAdminUser(database)

  const app = createApp(database)
  app.listen(port, () => {
    console.log(`Compliance API running at http://localhost:${port}`)
  })
}

async function shutdown() {
  await closeDatabase()
  process.exit(0)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

start().catch((error) => {
  console.error('Failed to start Compliance API:', error)
  process.exit(1)
})

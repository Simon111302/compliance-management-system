import express from 'express'
import { connectDatabase, closeDatabase } from './database.js'
import { initialCompliances } from '../src/models/complianceModel.js'

const app = express()
const port = Number(process.env.PORT ?? 3001)

app.use(express.json())

async function compliancesCollection() {
  const database = await connectDatabase()
  return database.collection('compliances')
}

function withoutMongoId(document) {
  const { _id, ...compliance } = document
  return compliance
}

app.get('/api/health', async (_request, response, next) => {
  try {
    const database = await connectDatabase()
    await database.command({ ping: 1 })
    response.json({ database: database.databaseName, status: 'connected' })
  } catch (error) {
    next(error)
  }
})

app.get('/api/compliances', async (_request, response, next) => {
  try {
    const collection = await compliancesCollection()
    const compliances = await collection.find().sort({ id: 1 }).toArray()
    response.json(compliances.map(withoutMongoId))
  } catch (error) {
    next(error)
  }
})

app.post('/api/compliances', async (request, response, next) => {
  try {
    const collection = await compliancesCollection()
    await collection.insertOne(request.body)
    response.status(201).json(request.body)
  } catch (error) {
    next(error)
  }
})

app.put('/api/compliances/:id', async (request, response, next) => {
  try {
    const collection = await compliancesCollection()
    const compliance = { ...request.body, id: request.params.id }
    const result = await collection.replaceOne(
      { id: request.params.id },
      compliance,
    )

    if (!result.matchedCount) {
      response.status(404).json({ message: 'Compliance not found' })
      return
    }

    response.json(compliance)
  } catch (error) {
    next(error)
  }
})

app.patch('/api/compliances/:id/review', async (request, response, next) => {
  try {
    const statusByDecision = {
      Approve: 'Approved',
      Partial: 'Partial',
      Reject: 'Rejected',
    }
    const status = statusByDecision[request.body.decision]

    if (!status) {
      response.status(400).json({ message: 'Invalid review decision' })
      return
    }

    const collection = await compliancesCollection()
    const result = await collection.findOneAndUpdate(
      { id: request.params.id },
      {
        $set: { status, reviewerComments: request.body.comments?.trim() ?? '' },
      },
      { returnDocument: 'after' },
    )

    if (!result) {
      response.status(404).json({ message: 'Compliance not found' })
      return
    }

    response.json(withoutMongoId(result))
  } catch (error) {
    next(error)
  }
})

app.use((error, _request, response, _next) => {
  console.error(error)
  response.status(500).json({ message: 'Database request failed' })
})

async function start() {
  const collection = await compliancesCollection()
  await collection.createIndex({ id: 1 }, { unique: true })

  if ((await collection.countDocuments()) === 0) {
    await collection.insertMany(initialCompliances)
  }

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

import dns from 'node:dns'
import { MongoClient, type Db } from 'mongodb'
import { databaseName, mongoUri, mongodbDnsServers } from './env.js'

if (mongodbDnsServers) {
  dns.setServers(
    mongodbDnsServers
      .split(',')
      .map((server) => server.trim())
      .filter(Boolean),
  )
}

const client = new MongoClient(mongoUri)
let database: Db | undefined

export async function connectDatabase(): Promise<Db> {
  if (!database) {
    await client.connect()
    database = client.db(databaseName)
  }

  return database
}

export async function closeDatabase(): Promise<void> {
  await client.close()
  database = undefined
}

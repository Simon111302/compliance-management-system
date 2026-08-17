import { MongoClient, type Db } from 'mongodb'
import { databaseName, mongoUri } from './env.js'

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

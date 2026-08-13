import { MongoClient } from 'mongodb'
import { databaseName, mongoUri } from './env.js'

const client = new MongoClient(mongoUri)
let database

export async function connectDatabase() {
  if (!database) {
    await client.connect()
    database = client.db(databaseName)
  }

  return database
}

export async function closeDatabase() {
  await client.close()
  database = undefined
}

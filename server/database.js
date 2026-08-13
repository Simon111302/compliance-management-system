import 'dotenv/config'
import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI
const databaseName = process.env.MONGODB_DATABASE

if (!uri || !databaseName) {
  throw new Error('MONGODB_URI and MONGODB_DATABASE must be defined in .env')
}

const client = new MongoClient(uri)
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

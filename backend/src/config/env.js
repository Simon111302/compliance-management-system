import 'dotenv/config'

export const port = Number(process.env.PORT ?? 3001)
export const mongoUri = process.env.MONGODB_URI
export const databaseName = process.env.MONGODB_DATABASE

if (!mongoUri || !databaseName) {
  throw new Error('MONGODB_URI and MONGODB_DATABASE must be defined in .env')
}

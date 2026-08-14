import 'dotenv/config'

export const port = Number(process.env.PORT ?? 3001)
export const mongoUri = process.env.MONGODB_URI
export const databaseName = process.env.MONGODB_DATABASE
export const frontendOrigin = process.env.FRONTEND_ORIGIN
export const adminName = process.env.ADMIN_NAME
export const adminEmail = process.env.ADMIN_EMAIL
export const adminPassword = process.env.ADMIN_PASSWORD

if (!mongoUri || !databaseName || !frontendOrigin) {
  throw new Error(
    'MONGODB_URI, MONGODB_DATABASE, and FRONTEND_ORIGIN must be defined in .env',
  )
}

if (!adminName || !adminEmail || !adminPassword) {
  throw new Error(
    'ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD must be defined in .env',
  )
}

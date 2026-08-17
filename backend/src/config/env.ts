import 'dotenv/config'

interface BackendEnvironment {
  PORT?: string
  MONGODB_URI?: string
  MONGODB_DATABASE?: string
  FRONTEND_ORIGIN?: string
  ADMIN_NAME?: string
  ADMIN_EMAIL?: string
  ADMIN_PASSWORD?: string
}

const environment = process.env as BackendEnvironment
export const port = Number(environment.PORT ?? 3001)

if (
  !environment.MONGODB_URI ||
  !environment.MONGODB_DATABASE ||
  !environment.FRONTEND_ORIGIN
) {
  throw new Error(
    'MONGODB_URI, MONGODB_DATABASE, and FRONTEND_ORIGIN must be defined in .env',
  )
}
if (
  !environment.ADMIN_NAME ||
  !environment.ADMIN_EMAIL ||
  !environment.ADMIN_PASSWORD
) {
  throw new Error(
    'ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD must be defined in .env',
  )
}

export const mongoUri = environment.MONGODB_URI
export const databaseName = environment.MONGODB_DATABASE
export const frontendOrigin = environment.FRONTEND_ORIGIN
export const adminName = environment.ADMIN_NAME
export const adminEmail = environment.ADMIN_EMAIL
export const adminPassword = environment.ADMIN_PASSWORD

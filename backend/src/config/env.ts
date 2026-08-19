import 'dotenv/config'

interface BackendEnvironment {
  PORT?: string
  MONGODB_URI?: string
  MONGODB_DATABASE?: string
  FRONTEND_ORIGIN?: string
  ADMIN_NAME?: string
  ADMIN_EMAIL?: string
  ADMIN_PASSWORD?: string
  AWS_REGION?: string
  S3_EVIDENCE_BUCKET?: string
  MONGODB_DNS_SERVERS?: string
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

if (!environment.AWS_REGION || !environment.S3_EVIDENCE_BUCKET) {
  throw new Error('AWS_REGION and S3_EVIDENCE_BUCKET must be defined in .env')
}

export const mongoUri = environment.MONGODB_URI
export const databaseName = environment.MONGODB_DATABASE
export const frontendOrigin = environment.FRONTEND_ORIGIN
export const allowedFrontendOrigins = new Set([
  frontendOrigin,
  ...(process.env.NODE_ENV === 'production'
    ? []
    : ['http://localhost:5173', 'http://127.0.0.1:5173']),
])
export const adminName = environment.ADMIN_NAME
export const adminEmail = environment.ADMIN_EMAIL
export const adminPassword = environment.ADMIN_PASSWORD
export const awsRegion = environment.AWS_REGION
export const evidenceBucket = environment.S3_EVIDENCE_BUCKET
export const mongodbDnsServers = environment.MONGODB_DNS_SERVERS

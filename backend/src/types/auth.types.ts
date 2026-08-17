import type { Document, ObjectId } from 'mongodb'

export interface SessionDocument extends Document {
  _id: ObjectId
  userId: ObjectId
  tokenHash: string
  expiresAt: Date
}

export interface LoginInput {
  email?: unknown
  password?: unknown
}

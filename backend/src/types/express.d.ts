import type { ObjectId } from 'mongodb'
import type { Database } from './database.types.js'
import type { ReviewerActionInput } from './reviewer-action.types.js'
import type { AuthenticatedUser } from './user.types.js'

declare global {
  namespace Express {
    interface Locals {
      database: Database
    }

    interface Request {
      user: AuthenticatedUser
      validatedReviewerAction?: ReviewerActionInput
      validatedObjectIds?: Record<string, ObjectId>
    }
  }
}

export {}

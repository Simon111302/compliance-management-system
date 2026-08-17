import type { Db, Document } from 'mongodb'
import type { AuditDocument } from '../models/audit.Model.js'
import type { RoleDocument } from '../models/role.Model.js'
import type { ComplianceDocument } from './compliance.types.js'
import type { ReviewerActionDocument } from './reviewer-action.types.js'
import type { SessionDocument } from './auth.types.js'
import type { UserDocument } from './user.types.js'

export interface AuditLogDocument extends AuditDocument, Document {
  performedByEmail?: string
}

export interface DatabaseCollections {
  users: UserDocument
  roles: RoleDocument
  sessions: SessionDocument
  compliances: ComplianceDocument
  reviewerActions: ReviewerActionDocument
  auditLogs: AuditLogDocument
}

export type Database = Db

import { randomUUID } from 'node:crypto'
import type { ObjectId } from 'mongodb'

export const auditActions = [
  'CREATE',
  'UPDATE',
  'DELETE',
  'RESET_PASSWORD',
  'UPLOAD_EVIDENCE',
  'SUBMIT',
  'REVIEW',
] as const
export type AuditAction = (typeof auditActions)[number]

export interface AuditDocument {
  _id: ObjectId
  auditId: string
  action: AuditAction
  details: Record<string, unknown> | string
  entityType: string
  entityId: string
  performedBy: string
  createdAt: Date
}

export interface AuditInput {
  action: AuditAction
  details?: Record<string, unknown> | string
  entityType: string
  entityId: string
  performedBy: string
}

export function createAuditDocument(
  input: AuditInput,
  createdAt = new Date(),
  auditId = randomUUID(),
): Omit<AuditDocument, '_id'> {
  return {
    auditId,
    action: input.action,
    details: input.details ?? {},
    entityType: input.entityType,
    entityId: input.entityId,
    performedBy: input.performedBy,
    createdAt,
  }
}

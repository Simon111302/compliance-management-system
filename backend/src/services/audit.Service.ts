import { ObjectId, type Db } from 'mongodb'
import {
  createAuditDocument,
  type AuditAction,
  type AuditDocument,
  type AuditInput,
} from '../models/audit.Model.js'
import type { AuthenticatedUser } from '../types/user.types.js'

export type UpdateAuditInput = Partial<
  Omit<AuditDocument, '_id' | 'auditId' | 'createdAt'>
>

export interface ActivityAuditInput {
  action: AuditAction
  entityType: string
  entityId: string
  description: string
  details?: Record<string, unknown>
}

function audits(database: Db) {
  return database.collection<AuditDocument>('auditLogs')
}

export function recordActivity(
  database: Db,
  actor: AuthenticatedUser,
  input: ActivityAuditInput,
): Promise<AuditDocument> {
  return createAudit(database, {
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    performedBy: actor.email,
    details: {
      ...input.details,
      description: input.description,
      actorName: actor.name,
      actorRole: actor.role,
    },
  })
}

export function listAudits(database: Db): Promise<AuditDocument[]> {
  return audits(database).find({}).sort({ createdAt: -1 }).toArray()
}

export function getAudit(
  database: Db,
  auditId: string,
): Promise<AuditDocument | null> {
  return audits(database).findOne({ auditId })
}

export async function createAudit(
  database: Db,
  input: AuditInput,
): Promise<AuditDocument> {
  const document: AuditDocument = {
    _id: new ObjectId(),
    ...createAuditDocument(input),
  }

  await audits(database).insertOne(document)
  return document
}

export async function updateAudit(
  database: Db,
  auditId: string,
  input: UpdateAuditInput,
): Promise<AuditDocument | null> {
  const existingAudit = await getAudit(database, auditId)
  if (!existingAudit) return null

  const document: AuditDocument = {
    ...existingAudit,
    ...input,
    auditId: existingAudit.auditId,
  }

  await audits(database).replaceOne({ auditId }, document)
  return document
}

export async function deleteAudit(
  database: Db,
  auditId: string,
): Promise<boolean> {
  const result = await audits(database).deleteOne({ auditId })
  return result.deletedCount === 1
}

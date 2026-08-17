import type { AuditLog } from '../types'

export interface AuditRecord {
  _id: string
  auditId: string
  action: string
  details: Record<string, unknown> | string
  entityType: string
  entityId: string
  performedBy: string
  createdAt: string
}

function describeAudit(details: AuditRecord['details']): string {
  return typeof details === 'string' ? details : JSON.stringify(details)
}

export function toAuditLog(audit: AuditRecord): AuditLog {
  return {
    id: audit.auditId,
    _id: audit._id,
    action: audit.action,
    entity: audit.entityType,
    description: describeAudit(audit.details),
    userEmail: audit.performedBy,
    createdAt: audit.createdAt,
  }
}

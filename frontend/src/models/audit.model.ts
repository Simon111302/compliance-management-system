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

function getDetail(
  details: AuditRecord['details'],
  key: string,
): string | undefined {
  if (typeof details === 'string') return undefined
  const value = details[key]
  return typeof value === 'string' ? value : undefined
}

function describeAudit(details: AuditRecord['details']): string {
  if (typeof details === 'string') return details
  return getDetail(details, 'description') ?? JSON.stringify(details)
}

export function toAuditLog(audit: AuditRecord): AuditLog {
  return {
    id: audit.auditId,
    _id: audit._id,
    action: audit.action,
    entity: `${audit.entityType} · ${audit.entityId}`,
    description: describeAudit(audit.details),
    userName: getDetail(audit.details, 'actorName'),
    userEmail: audit.performedBy,
    userRole: getDetail(audit.details, 'actorRole'),
    createdAt: audit.createdAt,
  }
}

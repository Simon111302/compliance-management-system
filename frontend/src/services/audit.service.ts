import { apiRequest } from '../config/api'
import { toAuditLog, type AuditRecord } from '../models/audit.model'
import type { AuditLog } from '../types'

export async function getAuditLogs(): Promise<AuditLog[]> {
  const audits = await apiRequest<AuditRecord[]>(
    '/audits',
    undefined,
    'Admin request failed',
  )
  return audits.map(toAuditLog)
}

import { useCallback, useState } from 'react'
import { getAuditLogs } from '../services/audit.service'
import { getErrorMessage } from '../types'
import type { AuditLog } from '../types'

type Notify = (message: string) => void

export function useAuditController(notify: Notify) {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])

  const loadAuditLogs = useCallback(async () => {
    try {
      setAuditLogs(await getAuditLogs())
    } catch (error) {
      notify(getErrorMessage(error, 'Admin request failed'))
    }
  }, [notify])

  return { auditLogs, loadAuditLogs }
}

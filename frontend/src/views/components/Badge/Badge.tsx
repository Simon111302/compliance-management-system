import type { CompliancePriority, ComplianceStatus } from '../../../types'
import './Badge.css'

interface StatusBadgeProps {
  status: ComplianceStatus
}

interface PriorityBadgeProps {
  priority: CompliancePriority
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`status-badge status-${status.toLowerCase().replaceAll(' ', '-')}`}
    >
      {status}
    </span>
  )
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  return (
    <span className={`priority-badge priority-${priority.toLowerCase()}`}>
      {priority}
    </span>
  )
}

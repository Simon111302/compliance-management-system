import './Badge.css'

export function StatusBadge({ status }) {
  return (
    <span
      className={`status-badge status-${status.toLowerCase().replaceAll(' ', '-')}`}
    >
      {status}
    </span>
  )
}

export function PriorityBadge({ priority }) {
  return (
    <span className={`priority-badge priority-${priority.toLowerCase()}`}>
      {priority}
    </span>
  )
}

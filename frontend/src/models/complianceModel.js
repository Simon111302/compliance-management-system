export const complianceStatuses = [
  'All',
  'Pending',
  'Pending Evidence',
  'Overdue',
  'Approved',
  'Partial',
  'Rejected',
]
export const compliancePriorities = ['Urgent', 'High', 'Medium', 'Low']
export const complianceTypes = [
  'Government Contribution',
  'Tax Compliance',
  'Employee Records',
  'Regulatory Filing',
]

export function applyAutomaticComplianceStatus(compliance, today = new Date()) {
  if (
    !compliance.dueDate ||
    ['Approved', 'Rejected'].includes(compliance.status)
  ) {
    return compliance
  }

  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  const currentDate = `${year}-${month}-${day}`

  return compliance.dueDate < currentDate
    ? { ...compliance, status: 'Overdue' }
    : compliance
}

export function filterCompliances(compliances, search, status) {
  const query = search.trim().toLowerCase()

  return compliances.filter((compliance) => {
    const searchable =
      `${compliance.id} ${compliance.name} ${compliance.reporter}`.toLowerCase()
    const matchesSearch = searchable.includes(query)
    const matchesStatus = status === 'All' || compliance.status === status
    return matchesSearch && matchesStatus
  })
}

export function createCompliance(compliances, form) {
  const nextNumber =
    compliances.reduce((highest, compliance) => {
      const number = Number(compliance.id.replace('COMP-', ''))
      return Number.isNaN(number) ? highest : Math.max(highest, number)
    }, 0) + 1

  return {
    id: `COMP-${String(nextNumber).padStart(3, '0')}`,
    name: form.name.trim(),
    type: form.type,
    reporterId: form.reporterId,
    reporter: form.reporter,
    dueDate: form.dueDate,
    priority: form.priority,
    status: form.status,
    notes: form.notes.trim(),
    submission: null,
    reviewerComments: '',
  }
}

export function updateCompliance(compliances, updatedCompliance) {
  return compliances.map((compliance) =>
    compliance.id === updatedCompliance.id ? updatedCompliance : compliance,
  )
}

export function reviewCompliance(
  compliances,
  complianceId,
  decision,
  comments,
) {
  const statusByDecision = {
    Approve: 'Approved',
    Partial: 'Partial',
    Reject: 'Rejected',
  }

  return compliances.map((compliance) =>
    compliance.id === complianceId
      ? {
          ...compliance,
          status: statusByDecision[decision],
          reviewerComments: comments.trim(),
        }
      : compliance,
  )
}

export function getComplianceSummary(compliances, today = new Date()) {
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  )

  return {
    open: compliances.filter(
      (compliance) => !['Approved', 'Rejected'].includes(compliance.status),
    ).length,
    overdue: compliances.filter(
      (compliance) =>
        !['Approved', 'Rejected'].includes(compliance.status) &&
        new Date(`${compliance.dueDate}T00:00:00`) < startOfToday,
    ).length,
    completed: compliances.filter(
      (compliance) => compliance.status === 'Approved',
    ).length,
  }
}

export function formatDueDate(dueDate, short = false) {
  if (!dueDate) return '—'

  return new Intl.DateTimeFormat(
    'en-US',
    short
      ? { month: 'short', day: 'numeric' }
      : { month: 'long', day: 'numeric', year: 'numeric' },
  ).format(new Date(`${dueDate}T00:00:00`))
}

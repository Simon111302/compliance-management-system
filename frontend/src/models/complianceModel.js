export const complianceStatuses = [
  'All',
  'Draft',
  'Pending Evidence',
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
export const reporters = ['Reporter 1', 'Reporter 2', 'Reporter 3']

export const initialCompliances = [
  {
    id: 'COMP-001',
    name: 'Govt Contribution Employee',
    type: 'Government Contribution',
    reporter: 'Reporter 1',
    dueDate: '2026-08-20',
    priority: 'Urgent',
    status: 'Pending Evidence',
    notes: 'Employee government contribution compliance.',
    evidence: {
      fileName: 'employee_information.pdf',
      remarks: 'Employee information document submitted.',
    },
    reviewerComments: '',
  },
  {
    id: 'COMP-002',
    name: 'Tax Compliance',
    type: 'Tax Compliance',
    reporter: 'Reporter 2',
    dueDate: '2026-08-22',
    priority: 'High',
    status: 'Approved',
    notes: 'Quarterly tax records and payment confirmations.',
    evidence: {
      fileName: 'tax_compliance_q2.pdf',
      remarks: 'Tax payment receipts submitted for review.',
    },
    reviewerComments: 'Evidence is complete and accurate.',
  },
  {
    id: 'COMP-003',
    name: 'Employee Records',
    type: 'Employee Records',
    reporter: 'Reporter 3',
    dueDate: '2026-08-25',
    priority: 'Medium',
    status: 'Partial',
    notes: 'Validate employee records for the current reporting period.',
    evidence: {
      fileName: 'employee_records.pdf',
      remarks: 'Core employee records submitted; supporting forms are pending.',
    },
    reviewerComments: 'Please provide the missing supporting forms.',
  },
]

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
    reporter: form.reporter,
    dueDate: form.dueDate,
    priority: form.priority,
    status: form.status,
    notes: form.notes.trim(),
    evidence: null,
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

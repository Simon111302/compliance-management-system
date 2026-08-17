import type {
  Compliance,
  ComplianceFormData,
  ComplianceSubmission,
  ComplianceSummary,
  ComplianceType,
  ReviewDecision,
  SubmissionFieldDefinition,
  SubmissionForm,
  SubmissionFormDefinition,
} from '../types'

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

export const evidenceFields = [
  {
    key: 'reference',
    label: 'Evidence Reference or Link',
    type: 'url',
    optional: true,
  },
] satisfies readonly SubmissionFieldDefinition[]

export const submissionFormDefinitions = {
  'Government Contribution': {
    employeeTitle: 'Employee Information',
    employeeFields: [
      { key: 'employeeName', label: 'Employee Name' },
      { key: 'employeeId', label: 'Employee ID' },
      { key: 'position', label: 'Position' },
      { key: 'department', label: 'Department' },
      { key: 'employmentPeriod', label: 'Employment Period' },
    ],
    sectionTitle: 'Government Contributions',
    rowLabel: 'Government Agency',
    rowLabels: ['SSS', 'PhilHealth', 'Pag-IBIG'],
    rowFields: [
      { key: 'contributionPeriod', label: 'Contribution Period' },
      {
        key: 'employeeShare',
        label: 'Employee Share',
        prefix: '₱',
        type: 'number',
      },
      {
        key: 'employerShare',
        label: 'Employer Share',
        prefix: '₱',
        type: 'number',
      },
      {
        key: 'remitted',
        label: 'Remitted?',
        options: ['Yes', 'No'],
      },
    ],
    detailFields: [],
  },
  'Tax Compliance': {
    employeeTitle: 'Employee Information',
    employeeFields: [
      { key: 'employeeName', label: 'Employee Name' },
      { key: 'employeeId', label: 'Employee ID' },
      { key: 'position', label: 'Position' },
      { key: 'department', label: 'Department' },
      { key: 'employmentPeriod', label: 'Employment Period' },
    ],
    sectionTitle: 'Tax Compliance',
    rowLabel: 'Tax Type',
    rowLabels: ['Withholding Tax', 'Income Tax'],
    rowFields: [
      { key: 'taxPeriod', label: 'Tax Period' },
      {
        key: 'taxableIncome',
        label: 'Taxable Income',
        prefix: '₱',
        type: 'number',
      },
      {
        key: 'taxWithheld',
        label: 'Tax Withheld',
        prefix: '₱',
        type: 'number',
      },
      { key: 'filed', label: 'Filed?', options: ['Yes', 'No'] },
    ],
    detailsTitle: 'Tax Details',
    detailFields: [
      { key: 'tin', label: 'TIN' },
      { key: 'filingDate', label: 'Filing Date', type: 'date' },
      { key: 'taxReferenceNumber', label: 'Tax Reference No.' },
      {
        key: 'complianceStatus',
        label: 'Compliance Status',
        options: ['Compliant', 'Pending', 'Overdue'],
      },
    ],
  },
  'Employee Records': {
    employeeTitle: 'Employee Information',
    employeeFields: [
      { key: 'employeeName', label: 'Employee Name' },
      { key: 'employeeId', label: 'Employee ID' },
      { key: 'position', label: 'Position' },
      { key: 'department', label: 'Department' },
      { key: 'employmentType', label: 'Employment Type' },
      {
        key: 'employmentStartDate',
        label: 'Employment Start Date',
        type: 'date',
      },
      {
        key: 'employmentEndDate',
        label: 'Employment End Date',
        optional: true,
        type: 'date',
      },
    ],
    sectionTitle: 'Employee Records',
    rowLabel: 'Record Type',
    rowLabels: [
      'Employment Contract',
      'Government ID',
      'Tax Documents',
      'Company Documents',
    ],
    rowFields: [
      { key: 'documentReference', label: 'Document / Reference' },
      { key: 'dateSubmitted', label: 'Date Submitted', type: 'date' },
      {
        key: 'status',
        label: 'Status',
        options: ['Complete', 'Missing'],
      },
    ],
    detailFields: [
      { key: 'remarks', label: 'Remarks', type: 'textarea', optional: true },
    ],
  },
  'Regulatory Filing': {
    employeeTitle: 'Company / Employee Information',
    employeeFields: [
      { key: 'employeeName', label: 'Employee Name' },
      { key: 'employeeId', label: 'Employee ID' },
      { key: 'department', label: 'Department' },
      { key: 'filingPeriod', label: 'Filing Period' },
    ],
    sectionTitle: 'Regulatory Filing',
    rowLabel: 'Regulatory Agency',
    rowLabels: ['SSS', 'PhilHealth', 'Pag-IBIG', 'BIR'],
    rowFields: [
      { key: 'filingType', label: 'Filing Type' },
      { key: 'filingPeriod', label: 'Filing Period' },
      { key: 'dueDate', label: 'Due Date', type: 'date' },
      { key: 'filed', label: 'Filed?', options: ['Yes', 'No'] },
    ],
    detailsTitle: 'Filing Details',
    detailFields: [
      { key: 'referenceNumber', label: 'Reference Number' },
      { key: 'filingDate', label: 'Filing Date', type: 'date' },
      {
        key: 'filingStatus',
        label: 'Filing Status',
        options: ['Filed', 'Pending', 'Overdue'],
      },
      { key: 'remarks', label: 'Remarks', type: 'textarea', optional: true },
    ],
  },
} satisfies Record<ComplianceType, SubmissionFormDefinition>

export function applyAutomaticComplianceStatus(
  compliance: Compliance,
  today = new Date(),
): Compliance {
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

export function filterCompliances(
  compliances: Compliance[],
  search: string,
  status: string,
): Compliance[] {
  const query = search.trim().toLowerCase()

  return compliances.filter((compliance) => {
    const searchable =
      `${compliance.id} ${compliance.name} ${compliance.reporter}`.toLowerCase()
    const matchesSearch = searchable.includes(query)
    const matchesStatus = status === 'All' || compliance.status === status
    return matchesSearch && matchesStatus
  })
}

export function createCompliance(
  compliances: Compliance[],
  form: ComplianceFormData,
): Compliance {
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

export function updateCompliance(
  compliances: Compliance[],
  updatedCompliance: Compliance,
): Compliance[] {
  return compliances.map((compliance) =>
    compliance.id === updatedCompliance.id ? updatedCompliance : compliance,
  )
}

export function reviewCompliance(
  compliances: Compliance[],
  complianceId: string,
  decision: Exclude<ReviewDecision, ''>,
  comments: string,
): Compliance[] {
  const statusByDecision = {
    Approve: 'Approved',
    Partial: 'Partial',
    Reject: 'Rejected',
  } as const

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

export function getComplianceSummary(
  compliances: Compliance[],
  today = new Date(),
): ComplianceSummary {
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

export function formatDueDate(dueDate: string, short = false): string {
  if (!dueDate) return '—'

  return new Intl.DateTimeFormat(
    'en-US',
    short
      ? { month: 'short', day: 'numeric' }
      : { month: 'long', day: 'numeric', year: 'numeric' },
  ).format(new Date(`${dueDate}T00:00:00`))
}

export function createSubmissionForm(type: ComplianceType): SubmissionForm {
  const definition = submissionFormDefinitions[type]

  return {
    employeeInformation: Object.fromEntries(
      definition.employeeFields.map(({ key }) => [key, '']),
    ),
    rows: definition.rowLabels.map((label) => ({
      label,
      ...Object.fromEntries(definition.rowFields.map(({ key }) => [key, ''])),
    })),
    details: Object.fromEntries(
      definition.detailFields.map(({ key }) => [key, '']),
    ),
    evidence: { reference: '' },
    evidenceFile: null,
  }
}

export function normalizeSubmissionForm(
  type: ComplianceType,
  submission: ComplianceSubmission | null | undefined,
): SubmissionForm {
  const empty = createSubmissionForm(type)
  if (!submission || submission.type !== type) return empty

  return {
    employeeInformation: {
      ...empty.employeeInformation,
      ...submission.employeeInformation,
    },
    rows: empty.rows.map((row, index) => ({
      ...row,
      ...(submission.rows?.[index] ?? {}),
      label: row.label,
    })),
    details: { ...empty.details, ...submission.details },
    evidence: { ...empty.evidence, ...submission.evidence },
    evidenceFile: null,
  }
}

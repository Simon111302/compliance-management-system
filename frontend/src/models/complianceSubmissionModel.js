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
}

export function createSubmissionForm(type) {
  const definition = submissionFormDefinitions[type]
  if (!definition) return null

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
  }
}

export function normalizeSubmissionForm(type, submission) {
  const empty = createSubmissionForm(type)
  if (!empty || !submission || submission.type !== type) return empty

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
  }
}

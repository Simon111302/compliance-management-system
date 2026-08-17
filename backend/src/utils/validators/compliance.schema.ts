export interface FieldRule {
  optional?: boolean
  maxLength?: number
  type?: 'number' | 'date'
  options?: readonly string[]
}

export interface SubmissionSchema {
  employeeFields: string[]
  employeeFieldRules?: Record<string, FieldRule>
  rowLabels: string[]
  rowFields: Record<string, FieldRule>
  detailFields: Record<string, FieldRule>
}

export const submissionSchemas: Record<string, SubmissionSchema> = {
  'Government Contribution': {
    employeeFields: [
      'employeeName',
      'employeeId',
      'position',
      'department',
      'employmentPeriod',
    ],
    rowLabels: ['SSS', 'PhilHealth', 'Pag-IBIG'],
    rowFields: {
      contributionPeriod: {},
      employeeShare: { type: 'number' },
      employerShare: { type: 'number' },
      remitted: { options: ['Yes', 'No'] },
    },
    detailFields: {},
  },
  'Tax Compliance': {
    employeeFields: [
      'employeeName',
      'employeeId',
      'position',
      'department',
      'employmentPeriod',
    ],
    rowLabels: ['Withholding Tax', 'Income Tax'],
    rowFields: {
      taxPeriod: {},
      taxableIncome: { type: 'number' },
      taxWithheld: { type: 'number' },
      filed: { options: ['Yes', 'No'] },
    },
    detailFields: {
      tin: {},
      filingDate: { type: 'date' },
      taxReferenceNumber: {},
      complianceStatus: {
        options: ['Compliant', 'Pending', 'Overdue'],
      },
    },
  },
  'Employee Records': {
    employeeFields: [
      'employeeName',
      'employeeId',
      'position',
      'department',
      'employmentType',
      'employmentStartDate',
      'employmentEndDate',
    ],
    employeeFieldRules: {
      employmentStartDate: { type: 'date' },
      employmentEndDate: { optional: true, type: 'date' },
    },
    rowLabels: [
      'Employment Contract',
      'Government ID',
      'Tax Documents',
      'Company Documents',
    ],
    rowFields: {
      documentReference: {},
      dateSubmitted: { type: 'date' },
      status: { options: ['Complete', 'Missing'] },
    },
    detailFields: { remarks: { optional: true, maxLength: 2000 } },
  },
  'Regulatory Filing': {
    employeeFields: [
      'employeeName',
      'employeeId',
      'department',
      'filingPeriod',
    ],
    rowLabels: ['SSS', 'PhilHealth', 'Pag-IBIG', 'BIR'],
    rowFields: {
      filingType: {},
      filingPeriod: {},
      dueDate: { type: 'date' },
      filed: { options: ['Yes', 'No'] },
    },
    detailFields: {
      referenceNumber: {},
      filingDate: { type: 'date' },
      filingStatus: { options: ['Filed', 'Pending', 'Overdue'] },
      remarks: { optional: true, maxLength: 2000 },
    },
  },
}

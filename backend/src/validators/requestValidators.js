export function validateLoginInput(email, password) {
  return (
    typeof email === 'string' &&
    email.trim().length > 0 &&
    typeof password === 'string' &&
    password.length > 0
  )
}

export function validateReviewInput(decision) {
  return ['Approve', 'Partial', 'Reject'].includes(decision)
}

const submissionSchemas = {
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

function isObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value)
}

function sanitizeField(value, rule, fieldName, errors) {
  if (typeof value !== 'string') {
    errors.push(`${fieldName} must be a string`)
    return ''
  }

  const sanitized = value.trim()
  if (!rule.optional && !sanitized) errors.push(`${fieldName} is required`)
  if (sanitized.length > (rule.maxLength ?? 300)) {
    errors.push(`${fieldName} is too long`)
  }
  if (
    rule.type === 'number' &&
    sanitized &&
    (!Number.isFinite(Number(sanitized)) || Number(sanitized) < 0)
  ) {
    errors.push(`${fieldName} must be a non-negative number`)
  }
  if (
    rule.type === 'date' &&
    sanitized &&
    !/^\d{4}-\d{2}-\d{2}$/.test(sanitized)
  ) {
    errors.push(`${fieldName} must be a valid date`)
  }
  if (rule.options && sanitized && !rule.options.includes(sanitized)) {
    errors.push(`${fieldName} must be one of: ${rule.options.join(', ')}`)
  }

  return sanitized
}

function sanitizeFields(input, rules, prefix, errors) {
  if (!isObject(input)) {
    errors.push(`${prefix} must be an object`)
    return Object.fromEntries(Object.keys(rules).map((field) => [field, '']))
  }

  return Object.fromEntries(
    Object.entries(rules).map(([field, rule]) => [
      field,
      sanitizeField(input[field], rule, `${prefix}.${field}`, errors),
    ]),
  )
}

export function validateComplianceSubmission(type, input) {
  const schema = submissionSchemas[type]
  const errors = []

  if (!schema || !isObject(input)) {
    return { valid: false, errors: ['Invalid compliance submission'] }
  }

  const employeeRules = Object.fromEntries(
    schema.employeeFields.map((field) => [
      field,
      schema.employeeFieldRules?.[field] ?? {},
    ]),
  )
  const employeeInformation = sanitizeFields(
    input.employeeInformation,
    employeeRules,
    'employeeInformation',
    errors,
  )

  if (
    !Array.isArray(input.rows) ||
    input.rows.length !== schema.rowLabels.length
  ) {
    errors.push(`rows must contain ${schema.rowLabels.length} records`)
  }
  const rows = schema.rowLabels.map((label, index) => ({
    label,
    ...sanitizeFields(
      input.rows?.[index],
      schema.rowFields,
      `rows.${index}`,
      errors,
    ),
  }))
  const details = sanitizeFields(
    input.details,
    schema.detailFields,
    'details',
    errors,
  )

  return {
    valid: errors.length === 0,
    errors,
    data: { employeeInformation, rows, details },
  }
}

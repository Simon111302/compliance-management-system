export interface SubmissionFieldDefinition {
  key: string
  label: string
  type?: 'url' | 'number' | 'date' | 'textarea'
  optional?: boolean
  prefix?: string
  options?: readonly string[]
}

export interface SubmissionFormDefinition {
  employeeTitle: string
  employeeFields: readonly SubmissionFieldDefinition[]
  sectionTitle: string
  rowLabel: string
  rowLabels: readonly string[]
  rowFields: readonly SubmissionFieldDefinition[]
  detailsTitle?: string
  detailFields: readonly SubmissionFieldDefinition[]
}

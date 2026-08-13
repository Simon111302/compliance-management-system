export const TOTAL_EVIDENCE_REQUESTS = 12
export const PREVIOUSLY_COMPLETED_REQUESTS = 8

export const evidenceRequestFilters = [
  'All requests',
  'Needs attention',
  'In progress',
]

export const initialEvidenceRequests = [
  {
    id: 'SOC2-184',
    control: 'CC6.1',
    title: 'Quarterly user access review',
    description:
      'Export the Q2 access review with reviewer sign-off and remediation notes.',
    reviewer: 'Maya Chen',
    reviewerInitials: 'MC',
    dueDate: 'Aug 15, 2026',
    dueLabel: 'Due in 2 days',
    priority: 'High',
    status: 'Needs attention',
    category: 'Access control',
  },
  {
    id: 'SOC2-179',
    control: 'CC7.2',
    title: 'Security alert response samples',
    description:
      'Provide three resolved alerts showing triage, investigation, and closure.',
    reviewer: 'Noah Williams',
    reviewerInitials: 'NW',
    dueDate: 'Aug 18, 2026',
    dueLabel: 'Due in 5 days',
    priority: 'Medium',
    status: 'In progress',
    category: 'Monitoring',
  },
  {
    id: 'SOC2-171',
    control: 'CC8.1',
    title: 'Production change approvals',
    description:
      'Upload approved change tickets for the selected June production releases.',
    reviewer: 'Maya Chen',
    reviewerInitials: 'MC',
    dueDate: 'Aug 22, 2026',
    dueLabel: 'Due in 9 days',
    priority: 'Medium',
    status: 'Not started',
    category: 'Change management',
  },
  {
    id: 'SOC2-165',
    control: 'CC3.2',
    title: 'Annual risk assessment',
    description:
      'Submit the approved 2026 risk register and management review minutes.',
    reviewer: 'Elena Rossi',
    reviewerInitials: 'ER',
    dueDate: 'Aug 28, 2026',
    dueLabel: 'Due in 15 days',
    priority: 'Low',
    status: 'Not started',
    category: 'Risk management',
  },
]

export function filterEvidenceRequests(requests, search, filter) {
  const normalizedSearch = search.trim().toLowerCase()

  return requests.filter((request) => {
    const searchableText =
      `${request.title} ${request.control} ${request.id}`.toLowerCase()
    const matchesSearch = searchableText.includes(normalizedSearch)
    const matchesFilter = filter === 'All requests' || request.status === filter
    return matchesSearch && matchesFilter
  })
}

export function submitEvidenceForRequest(requests, requestId) {
  return requests.map((request) =>
    request.id === requestId
      ? { ...request, status: 'Submitted', dueLabel: 'Awaiting review' }
      : request,
  )
}

export function calculateCompletion(requests) {
  const submittedCount = requests.filter(
    (request) => request.status === 'Submitted',
  ).length
  const completed = PREVIOUSLY_COMPLETED_REQUESTS + submittedCount

  return {
    completed,
    progress: Math.round((completed / TOTAL_EVIDENCE_REQUESTS) * 100),
    total: TOTAL_EVIDENCE_REQUESTS,
  }
}

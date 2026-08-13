import assert from 'node:assert/strict'
import test from 'node:test'
import {
  createCompliance,
  filterCompliances,
  getComplianceSummary,
  initialCompliances,
  reviewCompliance,
} from './complianceModel.js'

test('filters compliance records by search and status', () => {
  assert.deepEqual(
    filterCompliances(initialCompliances, 'reporter 2', 'Approved').map(
      ({ id }) => id,
    ),
    ['COMP-002'],
  )
  assert.deepEqual(
    filterCompliances(initialCompliances, 'employee', 'All').map(
      ({ id }) => id,
    ),
    ['COMP-001', 'COMP-003'],
  )
})

test('creates the next compliance ID and trims text fields', () => {
  const created = createCompliance(initialCompliances, {
    name: '  Annual Filing  ',
    type: 'Regulatory Filing',
    reporter: 'Reporter 1',
    dueDate: '2026-09-01',
    priority: 'High',
    status: 'Draft',
    notes: '  File before September.  ',
  })

  assert.equal(created.id, 'COMP-004')
  assert.equal(created.name, 'Annual Filing')
  assert.equal(created.notes, 'File before September.')
  assert.equal(created.evidence, null)
})

test('maps reviewer decisions to compliance statuses', () => {
  const reviewed = reviewCompliance(
    initialCompliances,
    'COMP-001',
    'Reject',
    '  Missing receipt.  ',
  )
  const compliance = reviewed.find(({ id }) => id === 'COMP-001')

  assert.equal(compliance.status, 'Rejected')
  assert.equal(compliance.reviewerComments, 'Missing receipt.')
})

test('calculates open, overdue, and completed totals', () => {
  assert.deepEqual(
    getComplianceSummary(initialCompliances, new Date(2026, 7, 24)),
    { open: 2, overdue: 1, completed: 1 },
  )
})

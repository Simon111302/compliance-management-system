import { useEffect, useMemo, useState } from 'react'
import {
  applyAutomaticComplianceStatus,
  compliancePriorities,
  complianceStatuses,
  complianceTypes,
  createCompliance,
  filterCompliances,
  getComplianceSummary,
  updateCompliance,
} from '../models/complianceModel.js'
import {
  createSubmissionForm,
  normalizeSubmissionForm,
} from '../models/complianceSubmissionModel.js'
import {
  addCompliance,
  getCompliances,
  getReporters,
  saveCompliance as saveComplianceRequest,
  saveReview,
  submitComplianceForm as submitComplianceFormRequest,
  uploadComplianceEvidence,
} from '../services/complianceService.js'

const emptyForm = {
  name: '',
  type: complianceTypes[0],
  reporterId: '',
  reporter: '',
  dueDate: '',
  priority: compliancePriorities[1],
  notes: '',
  status: 'Pending',
}

export function useReviewerController(enabled = true, loadReporters = true) {
  const [compliances, setCompliances] = useState([])
  const [reporters, setReporters] = useState([])
  const [page, setPage] = useState('dashboard')
  const [selectedId, setSelectedId] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [decision, setDecision] = useState('')
  const [reviewerComments, setReviewerComments] = useState('')
  const [submissionForm, setSubmissionForm] = useState(null)
  const [submittingForm, setSubmittingForm] = useState(false)
  const [toast, setToast] = useState('')

  const filteredCompliances = useMemo(
    () => filterCompliances(compliances, search, statusFilter),
    [compliances, search, statusFilter],
  )
  const summary = useMemo(
    () => getComplianceSummary(compliances),
    [compliances],
  )
  const selectedCompliance =
    compliances.find((item) => item.id === selectedId) ?? null

  useEffect(() => {
    if (!enabled) return undefined

    let active = true

    Promise.all([
      getCompliances(),
      loadReporters ? getReporters() : Promise.resolve([]),
    ])
      .then(([items, reporterUsers]) => {
        if (!active) return
        setCompliances(
          items.map((item) => applyAutomaticComplianceStatus(item)),
        )
        setReporters(reporterUsers)
        setForm((current) => ({
          ...current,
          reporterId: current.reporterId || reporterUsers[0]?.id || '',
          reporter: current.reporter || reporterUsers[0]?.name || '',
        }))
      })
      .catch(() => {
        if (active) setToast('Unable to connect to the compliance database')
      })

    return () => {
      active = false
    }
  }, [enabled, loadReporters])

  useEffect(() => {
    if (!enabled) return undefined

    let timeout

    function scheduleStatusUpdate() {
      const now = new Date()
      const nextDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
      )
      timeout = window.setTimeout(() => {
        setCompliances((items) =>
          items.map((item) => applyAutomaticComplianceStatus(item)),
        )
        scheduleStatusUpdate()
      }, nextDay.getTime() - now.getTime())
    }

    scheduleStatusUpdate()
    return () => window.clearTimeout(timeout)
  }, [enabled])

  function notify(message) {
    setToast(message)
    window.setTimeout(() => setToast(''), 3200)
  }

  function navigate(nextPage) {
    setPage(nextPage)
    if (nextPage !== 'details') setSelectedId(null)
  }

  function openDetails(complianceId) {
    const compliance = compliances.find((item) => item.id === complianceId)
    setSelectedId(complianceId)
    setDecision('')
    setReviewerComments(compliance?.reviewerComments ?? '')
    setPage('details')
  }

  function openSubmission(complianceId) {
    const compliance = compliances.find((item) => item.id === complianceId)
    if (!compliance) return

    setSelectedId(complianceId)
    setSubmissionForm(
      normalizeSubmissionForm(compliance.type, compliance.submission),
    )
    setPage('submission')
  }

  function updateSubmissionEmployee(field, value) {
    setSubmissionForm((current) => ({
      ...current,
      employeeInformation: {
        ...current.employeeInformation,
        [field]: value,
      },
    }))
  }

  function updateSubmissionRow(rowIndex, field, value) {
    setSubmissionForm((current) => ({
      ...current,
      rows: current.rows.map((row, index) =>
        index === rowIndex ? { ...row, [field]: value } : row,
      ),
    }))
  }

  function updateSubmissionDetails(field, value) {
    setSubmissionForm((current) => ({
      ...current,
      details: { ...current.details, [field]: value },
    }))
  }

  function updateSubmissionEvidence(field, value) {
    setSubmissionForm((current) => ({
      ...current,
      evidence: { ...current.evidence, [field]: value },
    }))
  }

  function updateSubmissionEvidenceFile(file) {
    setSubmissionForm((current) => ({ ...current, evidenceFile: file }))
  }

  function openCreate() {
    const reporterId = reporters[0]?.id ?? ''
    const reporter = reporters.find((item) => item.id === reporterId)

    setEditingId(null)
    setForm({
      ...emptyForm,
      reporterId,
      reporter: reporter?.name ?? '',
    })
    setPage('create')
  }

  function openEdit(complianceId) {
    const compliance = compliances.find((item) => item.id === complianceId)
    if (!compliance) return

    setEditingId(complianceId)
    setForm({
      name: compliance.name,
      type: compliance.type,
      reporterId:
        compliance.reporterId ??
        reporters.find((reporter) => reporter.name === compliance.reporter)
          ?.id ??
        '',
      reporter: compliance.reporter,
      dueDate: compliance.dueDate,
      priority: compliance.priority,
      notes: compliance.notes,
      status: compliance.status,
    })
    setPage('create')
  }

  function updateForm(field, value) {
    if (field === 'reporterId') {
      const reporter = reporters.find((item) => item.id === value)
      setForm((current) => ({
        ...current,
        reporterId: value,
        reporter: reporter?.name ?? '',
      }))
      return
    }

    setForm((current) => ({ ...current, [field]: value }))
  }

  async function saveCompliance(event) {
    event.preventDefault()

    try {
      if (editingId) {
        const current = compliances.find((item) => item.id === editingId)
        const updated = {
          ...current,
          ...form,
          name: form.name.trim(),
          notes: form.notes.trim(),
        }
        const saved = applyAutomaticComplianceStatus(
          await saveComplianceRequest(updated),
        )
        setCompliances((items) => updateCompliance(items, saved))
        notify(`${editingId} updated`)
      } else {
        const created = createCompliance(compliances, form)
        const saved = applyAutomaticComplianceStatus(
          await addCompliance(created),
        )
        setCompliances((items) => [...items, saved])
        notify(`${saved.id} created`)
      }

      setEditingId(null)
      setForm(emptyForm)
      setPage('compliance')
    } catch {
      notify('Unable to save compliance')
    }
  }

  async function submitComplianceForm(event) {
    event.preventDefault()
    if (!selectedCompliance || !submissionForm) return

    setSubmittingForm(true)
    try {
      if (submissionForm.evidenceFile) {
        await uploadComplianceEvidence(
          selectedCompliance.id,
          submissionForm.evidenceFile,
        )
      }

      const { evidenceFile: _evidenceFile, ...submission } = submissionForm
      const saved = applyAutomaticComplianceStatus(
        await submitComplianceFormRequest(selectedCompliance.id, submission),
      )
      setCompliances((items) => updateCompliance(items, saved))
      setSubmissionForm(createSubmissionForm(saved.type))
      setPage('details')
      notify(`${saved.id} submitted for review`)
    } catch (error) {
      notify(error.message || 'Unable to submit compliance')
    } finally {
      setSubmittingForm(false)
    }
  }

  async function submitReview(event) {
    event.preventDefault()
    if (!selectedCompliance || !decision) return

    try {
      const reviewed = applyAutomaticComplianceStatus(
        await saveReview(selectedCompliance.id, decision, reviewerComments),
      )
      setCompliances((items) => updateCompliance(items, reviewed))
      notify(
        `${selectedCompliance.id} marked ${decision === 'Approve' ? 'Approved' : decision}`,
      )
      setPage('compliance')
      setSelectedId(null)
    } catch {
      notify('Unable to submit review')
    }
  }

  return {
    compliancePriorities,
    complianceStatuses,
    complianceTypes,
    compliances,
    decision,
    editingId,
    filteredCompliances,
    form,
    navigate,
    openCreate,
    openDetails,
    openEdit,
    openSubmission,
    page,
    reporters,
    reviewerComments,
    saveCompliance,
    search,
    selectedCompliance,
    setDecision,
    setReviewerComments,
    setSearch,
    setStatusFilter,
    statusFilter,
    submissionForm,
    submitComplianceForm,
    submitReview,
    submittingForm,
    summary,
    toast,
    updateForm,
    updateSubmissionDetails,
    updateSubmissionEmployee,
    updateSubmissionEvidence,
    updateSubmissionEvidenceFile,
    updateSubmissionRow,
  }
}

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import {
  applyAutomaticComplianceStatus,
  compliancePriorities,
  complianceStatuses,
  complianceTypes,
  createCompliance,
  filterCompliances,
  getComplianceSummary,
  updateCompliance,
  createSubmissionForm,
  normalizeSubmissionForm,
} from '../models/compliance.model'
import {
  addCompliance,
  getCompliances,
  saveCompliance as saveComplianceRequest,
} from '../services/compliance.service'
import {
  submitComplianceForm as submitComplianceFormRequest,
  uploadComplianceEvidence,
} from '../services/reporter.service'
import { getReporters, saveReview } from '../services/reviewer.service'
import { getErrorMessage } from '../types'
import type {
  Compliance,
  ComplianceFormData,
  CompliancePriority,
  ComplianceType,
  Reporter,
  ReviewerPage,
  ReviewDecision,
  SubmissionForm,
} from '../types'

const emptyForm: ComplianceFormData = {
  name: '',
  type: complianceTypes[0] as ComplianceType,
  reporterId: '',
  reporter: '',
  dueDate: '',
  priority: compliancePriorities[1] as CompliancePriority,
  notes: '',
  status: 'Pending',
}

export function useComplianceController(
  enabled = true,
  loadReporters = true,
  onNavigate?: (page: ReviewerPage, resourceId?: string) => void,
) {
  const [compliances, setCompliances] = useState<Compliance[]>([])
  const [reporters, setReporters] = useState<Reporter[]>([])
  const [page, setPage] = useState<ReviewerPage>('dashboard')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [form, setForm] = useState<ComplianceFormData>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [decision, setDecision] = useState<ReviewDecision>('')
  const [reviewerComments, setReviewerComments] = useState('')
  const [submissionForm, setSubmissionForm] = useState<SubmissionForm | null>(
    null,
  )
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
      loadReporters ? getReporters() : Promise.resolve([] as Reporter[]),
    ])
      .then(([items, reporterUsers]: [Compliance[], Reporter[]]) => {
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
      .catch((error: unknown) => {
        if (active) {
          setToast(getErrorMessage(error, 'Unable to load compliance records'))
        }
      })

    return () => {
      active = false
    }
  }, [enabled, loadReporters])

  useEffect(() => {
    if (!enabled) return undefined

    let timeout: number

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

  function notify(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(''), 3200)
  }

  function setCurrentPage(nextPage: ReviewerPage, resourceId?: string) {
    setPage(nextPage)
    onNavigate?.(nextPage, resourceId)
  }

  function navigate(nextPage: ReviewerPage) {
    setCurrentPage(nextPage)
    if (nextPage !== 'details') setSelectedId(null)
  }

  const syncPage = useCallback(
    (nextPage: ReviewerPage, resourceId?: string) => {
      setPage(nextPage)

      if (!resourceId) {
        if (nextPage === 'create') {
          const reporterId = reporters[0]?.id ?? ''
          const reporter = reporters.find((item) => item.id === reporterId)
          setEditingId(null)
          setForm({
            ...emptyForm,
            reporterId,
            reporter: reporter?.name ?? '',
          })
        }
        if (nextPage !== 'details' && nextPage !== 'submission') {
          setSelectedId(null)
        }
        return
      }

      const compliance = compliances.find((item) => item.id === resourceId)
      if (!compliance) {
        if (nextPage === 'details' || nextPage === 'submission') {
          setPage('compliance')
          setSelectedId(null)
        }
        return
      }

      setSelectedId(resourceId)
      if (nextPage === 'details') {
        setDecision('')
        setReviewerComments(compliance.reviewerComments ?? '')
      }
      if (nextPage === 'submission') {
        setSubmissionForm(
          normalizeSubmissionForm(compliance.type, compliance.submission),
        )
      }
      if (nextPage === 'create') {
        setEditingId(resourceId)
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
      }
    },
    [compliances, reporters],
  )

  function openDetails(complianceId: string) {
    const compliance = compliances.find((item) => item.id === complianceId)
    setSelectedId(complianceId)
    setDecision('')
    setReviewerComments(compliance?.reviewerComments ?? '')
    setCurrentPage('details', complianceId)
  }

  function openSubmission(complianceId: string) {
    const compliance = compliances.find((item) => item.id === complianceId)
    if (!compliance) return

    setSelectedId(complianceId)
    setSubmissionForm(
      normalizeSubmissionForm(compliance.type, compliance.submission),
    )
    setCurrentPage('submission', complianceId)
  }

  function updateSubmissionEmployee(field: string, value: string) {
    setSubmissionForm((current) => ({
      ...current!,
      employeeInformation: {
        ...current!.employeeInformation,
        [field]: value,
      },
    }))
  }

  function updateSubmissionRow(rowIndex: number, field: string, value: string) {
    setSubmissionForm((current) => ({
      ...current!,
      rows: current!.rows.map((row, index) =>
        index === rowIndex ? { ...row, [field]: value } : row,
      ),
    }))
  }

  function updateSubmissionDetails(field: string, value: string) {
    setSubmissionForm((current) => ({
      ...current!,
      details: { ...current!.details, [field]: value },
    }))
  }

  function updateSubmissionEvidence(field: string, value: string) {
    setSubmissionForm((current) => ({
      ...current!,
      evidence: { ...current!.evidence, [field]: value },
    }))
  }

  function updateSubmissionEvidenceFile(file: File | null) {
    setSubmissionForm((current) => ({ ...current!, evidenceFile: file }))
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
    setCurrentPage('create')
  }

  function openEdit(complianceId: string) {
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
    setCurrentPage('create', complianceId)
  }

  function updateForm(
    field: keyof ComplianceFormData,
    value: ComplianceFormData[keyof ComplianceFormData],
  ) {
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

  async function saveCompliance(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    try {
      if (editingId) {
        const current = compliances.find((item) => item.id === editingId)
        if (!current) return
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
      setCurrentPage('compliance')
    } catch (error) {
      notify(getErrorMessage(error, 'Unable to save compliance'))
    }
  }

  async function submitComplianceForm(event: FormEvent<HTMLFormElement>) {
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
      setCurrentPage('details', saved.id)
      notify(`${saved.id} submitted for review`)
    } catch (error) {
      notify(getErrorMessage(error, 'Unable to submit compliance'))
    } finally {
      setSubmittingForm(false)
    }
  }

  async function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedCompliance || !decision) return

    try {
      const reviewed = {
        ...applyAutomaticComplianceStatus(
          await saveReview(selectedCompliance.id, decision, reviewerComments),
        ),
        reporter: selectedCompliance.reporter,
      }
      setCompliances((items) => updateCompliance(items, reviewed))
      notify(
        `${selectedCompliance.id} marked ${decision === 'Approve' ? 'Approved' : decision}`,
      )
      setCurrentPage('compliance')
      setSelectedId(null)
    } catch (error) {
      notify(getErrorMessage(error, 'Unable to submit review'))
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
    syncPage,
    toast,
    updateForm,
    updateSubmissionDetails,
    updateSubmissionEmployee,
    updateSubmissionEvidence,
    updateSubmissionEvidenceFile,
    updateSubmissionRow,
  }
}

import { useEffect, useMemo, useState } from 'react'
import {
  compliancePriorities,
  complianceStatuses,
  complianceTypes,
  createCompliance,
  filterCompliances,
  getComplianceSummary,
  reporters,
  updateCompliance,
} from '../models/complianceModel.js'
import {
  addCompliance,
  getCompliances,
  saveCompliance as saveComplianceRequest,
  saveReview,
} from '../services/complianceService.js'

const emptyForm = {
  name: '',
  type: complianceTypes[0],
  reporter: reporters[0],
  dueDate: '',
  priority: compliancePriorities[1],
  notes: '',
  status: 'Draft',
}

export function useReviewerController() {
  const [compliances, setCompliances] = useState([])
  const [page, setPage] = useState('dashboard')
  const [selectedId, setSelectedId] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [decision, setDecision] = useState('')
  const [reviewerComments, setReviewerComments] = useState('')
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
    let active = true

    getCompliances()
      .then((items) => {
        if (active) setCompliances(items)
      })
      .catch(() => {
        if (active) setToast('Unable to connect to the compliance database')
      })

    return () => {
      active = false
    }
  }, [])

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

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm)
    setPage('create')
  }

  function openEdit(complianceId) {
    const compliance = compliances.find((item) => item.id === complianceId)
    if (!compliance) return

    setEditingId(complianceId)
    setForm({
      name: compliance.name,
      type: compliance.type,
      reporter: compliance.reporter,
      dueDate: compliance.dueDate,
      priority: compliance.priority,
      notes: compliance.notes,
      status: compliance.status,
    })
    setPage('create')
  }

  function updateForm(field, value) {
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
        const saved = await saveComplianceRequest(updated)
        setCompliances((items) => updateCompliance(items, saved))
        notify(`${editingId} updated`)
      } else {
        const created = createCompliance(compliances, form)
        const saved = await addCompliance(created)
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

  async function submitReview(event) {
    event.preventDefault()
    if (!selectedCompliance || !decision) return

    try {
      const reviewed = await saveReview(
        selectedCompliance.id,
        decision,
        reviewerComments,
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
    submitReview,
    summary,
    toast,
    updateForm,
  }
}

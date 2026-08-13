import { useEffect, useMemo, useState } from 'react'
import {
  calculateCompletion,
  evidenceRequestFilters,
  filterEvidenceRequests,
  initialEvidenceRequests,
  submitEvidenceForRequest,
} from '../models/evidenceRequestModel.js'

export function useDashboardController() {
  const [requests, setRequests] = useState(initialEvidenceRequests)
  const [activeRequest, setActiveRequest] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [note, setNote] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All requests')
  const [toast, setToast] = useState('')

  const filteredRequests = useMemo(
    () => filterEvidenceRequests(requests, search, filter),
    [filter, requests, search],
  )
  const completion = useMemo(() => calculateCompletion(requests), [requests])

  useEffect(() => {
    if (!toast) return undefined

    const timer = window.setTimeout(() => setToast(''), 3500)
    return () => window.clearTimeout(timer)
  }, [toast])

  function openUpload(request) {
    setActiveRequest(request)
    setSelectedFile(null)
    setNote('')
  }

  function closeUpload() {
    setActiveRequest(null)
    setSelectedFile(null)
    setNote('')
  }

  function submitEvidence(event) {
    event.preventDefault()
    if (!selectedFile || !activeRequest) return

    setRequests((current) =>
      submitEvidenceForRequest(current, activeRequest.id),
    )
    setToast(`Evidence submitted for ${activeRequest.control}`)
    closeUpload()
  }

  return {
    activeRequest,
    closeUpload,
    completion,
    evidenceRequestFilters,
    filter,
    filteredRequests,
    note,
    openUpload,
    search,
    selectedFile,
    setFilter,
    setNote,
    setSearch,
    setSelectedFile,
    submitEvidence,
    toast,
  }
}

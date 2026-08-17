import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { emptyReviewerActionForm } from '../models/reviewer.model'
import {
  createReviewerAction,
  deleteReviewerAction,
  getReviewerActions,
  updateReviewerAction,
} from '../services/reviewer-action.service'
import { getErrorMessage } from '../types'
import type {
  AdminPage,
  ReviewerAction,
  ReviewerActionForm,
  User,
} from '../types'

type Navigate = (page: AdminPage, resourceId?: string) => void
type Notify = (message: string) => void

export function useReviewerActionController(
  enabled: boolean,
  reviewers: User[],
  navigate: Navigate,
  notify: Notify,
) {
  const [reviewerActions, setReviewerActions] = useState<ReviewerAction[]>([])
  const [reviewerActionForm, setReviewerActionForm] =
    useState<ReviewerActionForm>(emptyReviewerActionForm)
  const [editingReviewerActionId, setEditingReviewerActionId] = useState<
    string | null | undefined
  >(null)

  useEffect(() => {
    if (!enabled) return undefined

    let active = true
    getReviewerActions()
      .then((items) => {
        if (active) setReviewerActions(items)
      })
      .catch((error: unknown) => {
        if (active) notify(getErrorMessage(error, 'Admin request failed'))
      })

    return () => {
      active = false
    }
  }, [enabled, notify])

  const syncReviewerActionPage = useCallback(
    (page: AdminPage, resourceId?: string) => {
      if (page !== 'add-reviewer-action') return

      if (!resourceId) {
        setEditingReviewerActionId(null)
        setReviewerActionForm({
          ...emptyReviewerActionForm,
          reviewerId: reviewers[0]?._id ?? reviewers[0]?.id ?? '',
        })
        return
      }

      const action = reviewerActions.find(
        (item) => (item.id ?? item._id) === resourceId,
      )
      if (!action) return

      setEditingReviewerActionId(resourceId)
      setReviewerActionForm({
        reviewerId: action.reviewerId,
        type: action.type,
        severity: action.severity,
        reason: action.reason,
        notes: action.notes ?? '',
        status: action.status,
      })
    },
    [reviewerActions, reviewers],
  )

  function updateReviewerActionForm(
    field: keyof ReviewerActionForm,
    value: ReviewerActionForm[keyof ReviewerActionForm],
  ) {
    setReviewerActionForm((current) => ({ ...current, [field]: value }))
  }

  function openAddReviewerAction() {
    setEditingReviewerActionId(null)
    setReviewerActionForm({
      ...emptyReviewerActionForm,
      reviewerId: reviewers[0]?._id ?? reviewers[0]?.id ?? '',
    })
    navigate('add-reviewer-action')
  }

  function openEditReviewerAction(action: ReviewerAction) {
    const id = action.id ?? action._id
    setEditingReviewerActionId(id)
    setReviewerActionForm({
      reviewerId: action.reviewerId,
      type: action.type,
      severity: action.severity,
      reason: action.reason,
      notes: action.notes ?? '',
      status: action.status,
    })
    navigate('add-reviewer-action', id)
  }

  async function saveReviewerAction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    try {
      const saved = editingReviewerActionId
        ? await updateReviewerAction(
            editingReviewerActionId,
            reviewerActionForm,
          )
        : await createReviewerAction(reviewerActionForm)
      setReviewerActions((current) => {
        const id = saved.id ?? saved._id
        return editingReviewerActionId
          ? current.map((action) =>
              (action.id ?? action._id) === id ? saved : action,
            )
          : [saved, ...current]
      })
      notify(editingReviewerActionId ? 'Action updated' : 'Action recorded')
      navigate('reviewer-actions')
    } catch (error) {
      notify(getErrorMessage(error, 'Admin request failed'))
    }
  }

  async function removeReviewerAction(action: ReviewerAction) {
    if (!window.confirm(`Delete this ${action.type}?`)) return

    try {
      await deleteReviewerAction(action.id ?? action._id)
      setReviewerActions((current) =>
        current.filter(
          (item) => (item.id ?? item._id) !== (action.id ?? action._id),
        ),
      )
      notify('Action deleted')
    } catch (error) {
      notify(getErrorMessage(error, 'Admin request failed'))
    }
  }

  return {
    editingReviewerActionId,
    openAddReviewerAction,
    openEditReviewerAction,
    removeReviewerAction,
    reviewerActionForm,
    reviewerActions,
    saveReviewerAction,
    syncReviewerActionPage,
    updateReviewerActionForm,
  }
}

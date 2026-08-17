import { useCallback, useEffect, useState } from 'react'
import { getAdminDashboard } from '../services/admin.service'
import { getErrorMessage } from '../types'
import type { AdminDashboardData, AdminPage } from '../types'
import { useAuditController } from './useAuditController'
import { useReviewerActionController } from './useReviewerActionController'
import { useUserController } from './useUserController'

export function useAdminController(
  enabled = true,
  onNavigate?: (page: AdminPage, resourceId?: string) => void,
) {
  const [page, setPage] = useState<AdminPage>('admin-dashboard')
  const [dashboard, setDashboard] = useState<AdminDashboardData | null>(null)
  const [toast, setToast] = useState('')

  const notify = useCallback((message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 3200)
  }, [])

  const navigateTo = useCallback(
    (nextPage: AdminPage, resourceId?: string) => {
      setPage(nextPage)
      onNavigate?.(nextPage, resourceId)
    },
    [onNavigate],
  )

  const users = useUserController(enabled, navigateTo, notify)
  const reviewerActions = useReviewerActionController(
    enabled,
    users.reviewers,
    navigateTo,
    notify,
  )
  const audits = useAuditController(notify)

  useEffect(() => {
    if (!enabled) return undefined

    let active = true
    getAdminDashboard()
      .then((data) => {
        if (active) setDashboard(data)
      })
      .catch((error: unknown) => {
        if (active) notify(getErrorMessage(error, 'Admin request failed'))
      })

    return () => {
      active = false
    }
  }, [enabled, notify])

  const loadAuditLogs = audits.loadAuditLogs
  const navigate = useCallback(
    async (nextPage: AdminPage) => {
      navigateTo(nextPage)
      if (nextPage === 'audit-logs') await loadAuditLogs()
    },
    [loadAuditLogs, navigateTo],
  )

  const syncUserPage = users.syncUserPage
  const syncReviewerActionPage = reviewerActions.syncReviewerActionPage
  const syncPage = useCallback(
    (nextPage: AdminPage, resourceId?: string) => {
      setPage(nextPage)
      syncUserPage(nextPage, resourceId)
      syncReviewerActionPage(nextPage, resourceId)
      if (nextPage === 'audit-logs') void loadAuditLogs()
    },
    [loadAuditLogs, syncReviewerActionPage, syncUserPage],
  )

  return {
    auditLogs: audits.auditLogs,
    dashboard,
    editingReviewerActionId: reviewerActions.editingReviewerActionId,
    editingUserId: users.editingUserId,
    filteredUsers: users.filteredUsers,
    navigate,
    openAddReviewerAction: reviewerActions.openAddReviewerAction,
    openAddUser: users.openAddUser,
    openEditReviewerAction: reviewerActions.openEditReviewerAction,
    openEditUser: users.openEditUser,
    page,
    removeReviewerAction: reviewerActions.removeReviewerAction,
    removeUser: users.removeUser,
    resetPassword: users.resetPassword,
    reviewerActionForm: reviewerActions.reviewerActionForm,
    reviewerActions: reviewerActions.reviewerActions,
    reviewers: users.reviewers,
    roleFilter: users.roleFilter,
    saveReviewerAction: reviewerActions.saveReviewerAction,
    saveUser: users.saveUser,
    search: users.search,
    setRoleFilter: users.setRoleFilter,
    setSearch: users.setSearch,
    syncPage,
    toast,
    toggleUserStatus: users.toggleUserStatus,
    updateReviewerActionForm: reviewerActions.updateReviewerActionForm,
    updateUserForm: users.updateUserForm,
    userForm: users.userForm,
  }
}

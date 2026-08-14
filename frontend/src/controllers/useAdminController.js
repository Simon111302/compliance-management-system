import { useEffect, useMemo, useState } from 'react'
import {
  createReviewerAction,
  createUser,
  deleteReviewerAction,
  deleteUser,
  getAdminDashboard,
  getAuditLogs,
  getReviewerActions,
  getUsers,
  resetUserPassword,
  updateReviewerAction,
  updateUser,
} from '../services/adminService.js'
import {
  emptyReviewerActionForm,
  emptyUserForm,
  filterUsers,
} from '../models/adminModel.js'

export function useAdminController(enabled = true) {
  const [page, setPage] = useState('admin-dashboard')
  const [dashboard, setDashboard] = useState(null)
  const [users, setUsers] = useState([])
  const [reviewerActions, setReviewerActions] = useState([])
  const [auditLogs, setAuditLogs] = useState([])
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('All')
  const [userForm, setUserForm] = useState(emptyUserForm)
  const [reviewerActionForm, setReviewerActionForm] = useState(
    emptyReviewerActionForm,
  )
  const [editingUserId, setEditingUserId] = useState(null)
  const [editingReviewerActionId, setEditingReviewerActionId] = useState(null)
  const [toast, setToast] = useState('')

  const filteredUsers = useMemo(
    () => filterUsers(users, search, roleFilter),
    [roleFilter, search, users],
  )
  const reviewers = useMemo(
    () => users.filter((user) => user.role === 'Reviewer'),
    [users],
  )

  useEffect(() => {
    if (!enabled) return undefined

    let active = true
    Promise.all([getAdminDashboard(), getUsers(), getReviewerActions()])
      .then(([dashboardData, userData, actionData]) => {
        if (!active) return
        setDashboard(dashboardData)
        setUsers(userData)
        setReviewerActions(actionData)
      })
      .catch((error) => {
        if (active) setToast(error.message)
      })

    return () => {
      active = false
    }
  }, [enabled])

  function notify(message) {
    setToast(message)
    window.setTimeout(() => setToast(''), 3200)
  }

  async function navigate(nextPage) {
    setPage(nextPage)

    if (nextPage === 'audit-logs') {
      try {
        setAuditLogs(await getAuditLogs())
      } catch (error) {
        notify(error.message)
      }
    }
  }

  function updateUserForm(field, value) {
    setUserForm((current) => ({ ...current, [field]: value }))
  }

  function openAddUser() {
    setEditingUserId(null)
    setUserForm(emptyUserForm)
    setPage('add-user')
  }

  function openEditUser(user) {
    setEditingUserId(user.id ?? user._id)
    setUserForm({
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      email: user.email,
      password: '',
      role: user.role,
      status: user.status ?? 'Active',
    })
    setPage('add-user')
  }

  async function saveUser(event) {
    event.preventDefault()

    try {
      const saved = editingUserId
        ? await updateUser(editingUserId, userForm)
        : await createUser(userForm)
      setUsers((current) => {
        const id = saved.id ?? saved._id
        return editingUserId
          ? current.map((user) => ((user.id ?? user._id) === id ? saved : user))
          : [...current, saved]
      })
      notify(editingUserId ? 'User updated' : 'User created')
      setPage('users')
    } catch (error) {
      notify(error.message)
    }
  }

  async function toggleUserStatus(user) {
    try {
      const id = user.id ?? user._id
      const saved = await updateUser(id, {
        ...user,
        status: user.status === 'Inactive' ? 'Active' : 'Inactive',
      })
      setUsers((current) =>
        current.map((item) => ((item.id ?? item._id) === id ? saved : item)),
      )
    } catch (error) {
      notify(error.message)
    }
  }

  async function resetPassword(user) {
    const password = window.prompt(`Enter a new password for ${user.email}`)
    if (!password) return

    try {
      await resetUserPassword(user.id ?? user._id, password)
      notify('Password reset')
    } catch (error) {
      notify(error.message)
    }
  }

  async function removeUser(user) {
    if (!window.confirm(`Delete ${user.email}?`)) return

    try {
      await deleteUser(user.id ?? user._id)
      setUsers((current) =>
        current.filter(
          (item) => (item.id ?? item._id) !== (user.id ?? user._id),
        ),
      )
      notify('User deleted')
    } catch (error) {
      notify(error.message)
    }
  }

  function updateReviewerActionForm(field, value) {
    setReviewerActionForm((current) => ({ ...current, [field]: value }))
  }

  function openAddReviewerAction() {
    setEditingReviewerActionId(null)
    setReviewerActionForm({
      ...emptyReviewerActionForm,
      reviewerId: reviewers[0]?._id ?? reviewers[0]?.id ?? '',
    })
    setPage('add-reviewer-action')
  }

  function openEditReviewerAction(action) {
    setEditingReviewerActionId(action.id ?? action._id)
    setReviewerActionForm({
      reviewerId: action.reviewerId,
      type: action.type,
      severity: action.severity,
      reason: action.reason,
      notes: action.notes ?? '',
      status: action.status,
    })
    setPage('add-reviewer-action')
  }

  async function saveReviewerAction(event) {
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
      setPage('reviewer-actions')
    } catch (error) {
      notify(error.message)
    }
  }

  async function removeReviewerAction(action) {
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
      notify(error.message)
    }
  }

  return {
    auditLogs,
    dashboard,
    editingReviewerActionId,
    editingUserId,
    filteredUsers,
    navigate,
    openAddReviewerAction,
    openAddUser,
    openEditReviewerAction,
    openEditUser,
    page,
    removeReviewerAction,
    removeUser,
    resetPassword,
    reviewerActionForm,
    reviewerActions,
    reviewers,
    roleFilter,
    saveReviewerAction,
    saveUser,
    search,
    setRoleFilter,
    setSearch,
    toast,
    toggleUserStatus,
    updateReviewerActionForm,
    updateUserForm,
    userForm,
  }
}

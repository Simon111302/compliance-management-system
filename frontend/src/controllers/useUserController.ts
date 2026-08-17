import { useCallback, useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { emptyUserForm, filterUsers } from '../models/user.model'
import {
  createUser,
  deleteUser,
  getUsers,
  resetUserPassword,
  updateUser,
} from '../services/user.service'
import { getErrorMessage } from '../types'
import type { AdminPage, User, UserForm } from '../types'

type Navigate = (page: AdminPage, resourceId?: string) => void
type Notify = (message: string) => void

export function useUserController(
  enabled: boolean,
  navigate: Navigate,
  notify: Notify,
) {
  const [users, setUsers] = useState<User[]>([])
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('All')
  const [userForm, setUserForm] = useState<UserForm>(emptyUserForm)
  const [editingUserId, setEditingUserId] = useState<string | null | undefined>(
    null,
  )

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
    getUsers()
      .then((items) => {
        if (active) setUsers(items)
      })
      .catch((error: unknown) => {
        if (active) notify(getErrorMessage(error, 'Admin request failed'))
      })

    return () => {
      active = false
    }
  }, [enabled, notify])

  const syncUserPage = useCallback(
    (page: AdminPage, resourceId?: string) => {
      if (page !== 'add-user') return

      if (!resourceId) {
        setEditingUserId(null)
        setUserForm(emptyUserForm)
        return
      }

      const user = users.find((item) => (item.id ?? item._id) === resourceId)
      if (!user) return

      setEditingUserId(resourceId)
      setUserForm({
        firstName: user.firstName ?? '',
        lastName: user.lastName ?? '',
        email: user.email,
        password: '',
        role: user.role as UserForm['role'],
        status: user.status ?? 'Active',
      })
    },
    [users],
  )

  function updateUserForm(
    field: keyof UserForm,
    value: UserForm[keyof UserForm],
  ) {
    setUserForm((current) => ({ ...current, [field]: value }))
  }

  function openAddUser() {
    setEditingUserId(null)
    setUserForm(emptyUserForm)
    navigate('add-user')
  }

  function openEditUser(user: User) {
    const id = user.id ?? user._id
    setEditingUserId(id)
    setUserForm({
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      email: user.email,
      password: '',
      role: user.role as UserForm['role'],
      status: user.status ?? 'Active',
    })
    navigate('add-user', id)
  }

  async function saveUser(event: FormEvent<HTMLFormElement>) {
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
      navigate('users')
    } catch (error) {
      notify(getErrorMessage(error, 'Admin request failed'))
    }
  }

  async function toggleUserStatus(user: User) {
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
      notify(getErrorMessage(error, 'Admin request failed'))
    }
  }

  async function resetPassword(user: User) {
    const password = window.prompt(`Enter a new password for ${user.email}`)
    if (!password) return

    try {
      await resetUserPassword(user.id ?? user._id, password)
      notify('Password reset')
    } catch (error) {
      notify(getErrorMessage(error, 'Admin request failed'))
    }
  }

  async function removeUser(user: User) {
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
      notify(getErrorMessage(error, 'Admin request failed'))
    }
  }

  return {
    editingUserId,
    filteredUsers,
    openAddUser,
    openEditUser,
    removeUser,
    resetPassword,
    reviewers,
    roleFilter,
    saveUser,
    search,
    setRoleFilter,
    setSearch,
    syncUserPage,
    toggleUserStatus,
    updateUserForm,
    userForm,
    users,
  }
}

import type { User, UserForm } from '../types'

export const userRoles = ['Reviewer', 'Reporter'] as const
export const statusOptions = ['Active', 'Inactive'] as const

export const emptyUserForm: UserForm = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: userRoles[0],
  status: statusOptions[0],
}

export function filterUsers(
  users: User[],
  search: string,
  role: string,
): User[] {
  const query = search.trim().toLowerCase()

  return users.filter((user) => {
    const text =
      `${user.firstName ?? ''} ${user.lastName ?? ''} ${user.name ?? ''} ${user.email}`.toLowerCase()
    return text.includes(query) && (role === 'All' || user.role === role)
  })
}

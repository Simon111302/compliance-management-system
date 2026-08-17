import { apiRequest, jsonOptions } from '../config/api'
import type { User, UserForm, UserRole } from '../types'

interface ApiUser {
  _id: string
  userId: string
  firstName: string
  lastName: string
  name: string
  email: string
  status: User['status']
  createdAt: string
}

interface ApiRole {
  _id: string
  roleId: string
  userId: string
  type: 'admin' | 'reviewr' | 'reporter'
  createdAt: string
}

const roleByType: Record<ApiRole['type'], UserRole> = {
  admin: 'Admin',
  reviewr: 'Reviewer',
  reporter: 'Reporter',
}

const typeByRole: Record<UserRole, ApiRole['type']> = {
  Admin: 'admin',
  Reviewer: 'reviewr',
  Reporter: 'reporter',
}

function joinUsers(users: ApiUser[], roles: ApiRole[]): User[] {
  const rolesByUserId = new Map(roles.map((role) => [role.userId, role]))

  return users.map((user) => ({
    ...user,
    id: user.userId,
    role: roleByType[rolesByUserId.get(user.userId)?.type ?? 'reporter'],
  }))
}

async function getUserRecords(): Promise<{
  users: ApiUser[]
  roles: ApiRole[]
}> {
  const [users, roles] = await Promise.all([
    apiRequest<ApiUser[]>('/users', undefined, 'Admin request failed'),
    apiRequest<ApiRole[]>('/roles', undefined, 'Admin request failed'),
  ])
  return { users, roles }
}

export async function getUsers(): Promise<User[]> {
  const { users, roles } = await getUserRecords()
  return joinUsers(users, roles)
}

export async function createUser(user: UserForm): Promise<User> {
  const createdUser = await apiRequest<ApiUser>(
    '/users',
    jsonOptions('POST', {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: user.password,
      status: user.status,
    }),
    'Admin request failed',
  )

  await apiRequest<ApiRole>(
    '/roles',
    jsonOptions('POST', {
      userId: createdUser.userId,
      type: typeByRole[user.role],
    }),
    'Admin request failed',
  )

  return {
    ...createdUser,
    id: createdUser.userId,
    role: user.role,
  }
}

export async function updateUser(
  userId: string | undefined,
  user: UserForm | User,
): Promise<User> {
  const updatedUser = await apiRequest<ApiUser>(
    `/users/${userId}`,
    jsonOptions('PATCH', {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      status: user.status,
      ...('password' in user && user.password
        ? { password: user.password }
        : {}),
    }),
    'Admin request failed',
  )
  const roles = await apiRequest<ApiRole[]>(
    '/roles',
    undefined,
    'Admin request failed',
  )
  const role = roles.find((item) => item.userId === updatedUser.userId)

  if (role && roleByType[role.type] !== user.role) {
    await apiRequest<ApiRole>(
      `/roles/${role.roleId}`,
      jsonOptions('PATCH', { type: typeByRole[user.role] }),
      'Admin request failed',
    )
  }

  return {
    ...updatedUser,
    id: updatedUser.userId,
    role: user.role,
  }
}

export function resetUserPassword(
  userId: string | undefined,
  password: string,
): Promise<User> {
  return apiRequest(
    `/users/${userId}`,
    jsonOptions('PATCH', { password }),
    'Admin request failed',
  )
}

export function deleteUser(userId: string | undefined): Promise<null> {
  return apiRequest(
    `/users/${userId}`,
    { method: 'DELETE' },
    'Admin request failed',
  )
}

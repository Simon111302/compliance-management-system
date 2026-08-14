export const reviewerActionTypes = ['Warning', 'Incident Report', 'Sanction']
export const reviewerActionSeverities = ['Low', 'Medium', 'High', 'Critical']
export const reviewerActionStatuses = ['Open', 'Resolved']

export const userRoles = ['Reviewer', 'Reporter']
export const statusOptions = ['Active', 'Inactive']

export const emptyUserForm = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: userRoles[0],
  status: statusOptions[0],
}

export const emptyReviewerActionForm = {
  reviewerId: '',
  type: reviewerActionTypes[0],
  severity: reviewerActionSeverities[1],
  reason: '',
  notes: '',
  status: reviewerActionStatuses[0],
}

export function filterUsers(users, search, role) {
  const query = search.trim().toLowerCase()

  return users.filter((user) => {
    const text =
      `${user.firstName ?? ''} ${user.lastName ?? ''} ${user.name ?? ''} ${user.email}`.toLowerCase()
    return text.includes(query) && (role === 'All' || user.role === role)
  })
}

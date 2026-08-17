import type { AdminPage, ReviewerPage, UserRole } from '../types'

export interface AdminRouteState {
  page: AdminPage
  resourceId?: string
}

export interface WorkspaceRouteState {
  page: ReviewerPage
  resourceId?: string
}

const adminPaths: Partial<Record<AdminPage, string>> = {
  'admin-dashboard': '/admin/dashboard',
  users: '/admin/users',
  'add-user': '/admin/users/new',
  'reviewer-actions': '/admin/reviewer-actions',
  'add-reviewer-action': '/admin/reviewer-actions/new',
  'admin-compliance': '/admin/compliances',
  'audit-logs': '/admin/audits',
  'admin-settings': '/admin/settings',
}

function workspacePrefix(role: UserRole): string {
  return role === 'Reporter' ? '/reporter' : '/reviewer'
}

export function getAdminPath(page: AdminPage, resourceId?: string): string {
  if (page === 'add-user' && resourceId) {
    return `/admin/users/${encodeURIComponent(resourceId)}/edit`
  }
  if (page === 'add-reviewer-action' && resourceId) {
    return `/admin/reviewer-actions/${encodeURIComponent(resourceId)}/edit`
  }
  return adminPaths[page] ?? '/admin/dashboard'
}

export function getWorkspacePath(
  page: ReviewerPage,
  role: UserRole,
  resourceId?: string,
): string {
  const prefix = workspacePrefix(role)
  if (page === 'dashboard') return `${prefix}/dashboard`
  if (page === 'compliance') return `${prefix}/compliances`
  if (page === 'create' && !resourceId) return `${prefix}/compliances/new`
  if (page === 'create' && resourceId) {
    return `${prefix}/compliances/${encodeURIComponent(resourceId)}/edit`
  }
  if (page === 'submission' && resourceId) {
    return `${prefix}/compliances/${encodeURIComponent(resourceId)}/submission`
  }
  if (page === 'details' && resourceId) {
    return `${prefix}/compliances/${encodeURIComponent(resourceId)}`
  }
  return `${prefix}/compliances`
}

export function getAdminRoute(pathname: string): AdminRouteState {
  const userEdit = pathname.match(/^\/admin\/users\/([^/]+)\/edit$/)
  if (userEdit?.[1]) {
    return { page: 'add-user', resourceId: decodeURIComponent(userEdit[1]) }
  }

  const actionEdit = pathname.match(
    /^\/admin\/reviewer-actions\/([^/]+)\/edit$/,
  )
  if (actionEdit?.[1]) {
    return {
      page: 'add-reviewer-action',
      resourceId: decodeURIComponent(actionEdit[1]),
    }
  }

  if (pathname.startsWith('/admin/compliances')) {
    return { page: 'admin-compliance' }
  }

  const page = Object.entries(adminPaths).find(
    ([, path]) => path === pathname,
  )?.[0]
  return { page: (page as AdminPage | undefined) ?? 'admin-dashboard' }
}

export function getAdminCompliancePath(
  page: ReviewerPage,
  resourceId?: string,
): string {
  if (page === 'details' && resourceId) {
    return `/admin/compliances/${encodeURIComponent(resourceId)}`
  }
  if (page === 'submission' && resourceId) {
    return `/admin/compliances/${encodeURIComponent(resourceId)}/submission`
  }
  return '/admin/compliances'
}

export function getAdminComplianceRoute(pathname: string): WorkspaceRouteState {
  const submission = pathname.match(
    /^\/admin\/compliances\/([^/]+)\/submission$/,
  )
  if (submission?.[1]) {
    return {
      page: 'submission',
      resourceId: decodeURIComponent(submission[1]),
    }
  }

  const details = pathname.match(/^\/admin\/compliances\/([^/]+)$/)
  if (details?.[1]) {
    return { page: 'details', resourceId: decodeURIComponent(details[1]) }
  }

  return { page: 'compliance' }
}

export function getWorkspaceRoute(
  pathname: string,
  role: UserRole,
): WorkspaceRouteState {
  const prefix = workspacePrefix(role)
  if (pathname === `${prefix}/dashboard`) return { page: 'dashboard' }
  if (pathname === `${prefix}/compliances`) return { page: 'compliance' }
  if (pathname === `${prefix}/compliances/new`) return { page: 'create' }

  const edit = pathname.match(
    new RegExp(`^${prefix}/compliances/([^/]+)/edit$`),
  )
  if (edit?.[1]) {
    return { page: 'create', resourceId: decodeURIComponent(edit[1]) }
  }

  const submission = pathname.match(
    new RegExp(`^${prefix}/compliances/([^/]+)/submission$`),
  )
  if (submission?.[1]) {
    return {
      page: 'submission',
      resourceId: decodeURIComponent(submission[1]),
    }
  }

  const details = pathname.match(new RegExp(`^${prefix}/compliances/([^/]+)$`))
  if (details?.[1]) {
    return { page: 'details', resourceId: decodeURIComponent(details[1]) }
  }

  return { page: 'dashboard' }
}

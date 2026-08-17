import { ActorForm } from '../pages/ActorForm/ActorForm'
import { Actors } from '../pages/Actors/Actors'
import { AdminDashboard } from '../pages/AdminDashboard/AdminDashboard'
import { AdminSettings } from '../pages/AdminSettings/AdminSettings'
import { AuditLogs } from '../pages/AuditLogs/AuditLogs'
import { ComplianceList } from '../pages/ComplianceList/ComplianceList'
import { UserForm } from '../pages/UserForm/UserForm'
import { UserManagement } from '../pages/UserManagement/UserManagement'
import type { useAdminController } from '../controllers/useAdminController'
import type { useReviewerController } from '../controllers/useReviewerController'
import { AppRoutes } from './AppRoutes'

interface AdminRoutesProps {
  admin: ReturnType<typeof useAdminController>
  reviewer: ReturnType<typeof useReviewerController>
}

export function AdminRoutes({ admin, reviewer }: AdminRoutesProps) {
  if (admin.page === 'admin-dashboard') {
    return (
      <AdminDashboard
        dashboard={admin.dashboard}
        onNavigate={admin.navigate}
      />
    )
  }

  if (admin.page === 'users') {
    return (
      <UserManagement
        users={admin.filteredUsers}
        search={admin.search}
        roleFilter={admin.roleFilter}
        onSearch={admin.setSearch}
        onRoleFilter={admin.setRoleFilter}
        onAdd={admin.openAddUser}
        onEdit={admin.openEditUser}
        onToggleStatus={admin.toggleUserStatus}
        onResetPassword={admin.resetPassword}
        onDelete={admin.removeUser}
      />
    )
  }

  if (admin.page === 'add-user') {
    return (
      <UserForm
        editing={Boolean(admin.editingUserId)}
        form={admin.userForm}
        onUpdate={admin.updateUserForm}
        onCancel={() => admin.navigate('users')}
        onSubmit={admin.saveUser}
      />
    )
  }

  if (admin.page === 'reviewer-actions') {
    return (
      <Actors
        actions={admin.reviewerActions}
        onAdd={admin.openAddReviewerAction}
        onEdit={admin.openEditReviewerAction}
        onDelete={admin.removeReviewerAction}
      />
    )
  }

  if (admin.page === 'add-reviewer-action') {
    return (
      <ActorForm
        editing={Boolean(admin.editingReviewerActionId)}
        form={admin.reviewerActionForm}
        reviewers={admin.reviewers}
        onUpdate={admin.updateReviewerActionForm}
        onCancel={() => admin.navigate('reviewer-actions')}
        onSubmit={admin.saveReviewerAction}
      />
    )
  }

  if (
    admin.page === 'admin-compliance' &&
    ['dashboard', 'compliance'].includes(reviewer.page)
  ) {
    return (
      <ComplianceList
        canCreate={false}
        canEdit={false}
        compliances={reviewer.filteredCompliances}
        description="View compliance records for administrative oversight."
        eyebrow="Administration"
        search={reviewer.search}
        statusFilter={reviewer.statusFilter}
        statuses={reviewer.complianceStatuses}
        onSearch={reviewer.setSearch}
        onStatusFilter={reviewer.setStatusFilter}
        onCreate={reviewer.openCreate}
        onOpenDetails={reviewer.openDetails}
        onOpenSubmission={reviewer.openSubmission}
        onEdit={reviewer.openEdit}
      />
    )
  }

  if (
    admin.page === 'admin-compliance' &&
    ['details', 'submission'].includes(reviewer.page)
  ) {
    return (
      <AppRoutes
        controller={reviewer}
        readOnly
        role="Administration"
      />
    )
  }

  if (admin.page === 'audit-logs') {
    return <AuditLogs logs={admin.auditLogs} />
  }

  return <AdminSettings />
}

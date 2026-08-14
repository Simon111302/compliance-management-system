import { ActorForm } from '../pages/ActorForm/ActorForm.jsx'
import { Actors } from '../pages/Actors/Actors.jsx'
import { AdminDashboard } from '../pages/AdminDashboard/AdminDashboard.jsx'
import { AdminSettings } from '../pages/AdminSettings/AdminSettings.jsx'
import { AuditLogs } from '../pages/AuditLogs/AuditLogs.jsx'
import { ComplianceList } from '../pages/ComplianceList/ComplianceList.jsx'
import { UserForm } from '../pages/UserForm/UserForm.jsx'
import { UserManagement } from '../pages/UserManagement/UserManagement.jsx'
import { AppRoutes } from './AppRoutes.jsx'

export function AdminRoutes({ admin, reviewer }) {
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

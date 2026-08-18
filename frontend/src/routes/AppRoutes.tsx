import { Dashboard } from '../pages/Dashboard/Dashboard'
import { ComplianceList } from '../pages/ComplianceList/ComplianceList'
import { ComplianceForm } from '../pages/ComplianceForm/ComplianceForm'
import { ComplianceDetails } from '../pages/ComplianceDetails/ComplianceDetails'
import { ComplianceSubmissionForm } from '../pages/ComplianceSubmissionForm/ComplianceSubmissionForm'
import { ComplianceSubmissionView } from '../pages/ComplianceSubmissionView/ComplianceSubmissionView'
import type { CompliancePriority, ComplianceType, UserRole } from '../types'
import type { useReviewerController } from '../controllers/useReviewerController'

type ReviewerController = ReturnType<typeof useReviewerController>
type WorkspaceRole = UserRole | 'Administration'

interface AppRoutesProps {
  controller: ReviewerController
  readOnly?: boolean
  role?: WorkspaceRole
}

export function AppRoutes({
  controller,
  readOnly = false,
  role = 'Reviewer',
}: AppRoutesProps) {
  const {
    compliancePriorities,
    complianceStatuses,
    complianceTypes,
    compliances,
    decision,
    editingId,
    filteredCompliances,
    form,
    navigate,
    openCreate,
    openDetails,
    openEdit,
    openSubmission,
    page,
    reporters,
    reviewerComments,
    saveCompliance,
    search,
    selectedCompliance,
    setDecision,
    setReviewerComments,
    setSearch,
    setStatusFilter,
    statusFilter,
    submissionForm,
    submitComplianceForm,
    submitReview,
    submittingForm,
    summary,
    updateForm,
    updateSubmissionDetails,
    updateSubmissionEmployee,
    updateSubmissionEvidence,
    updateSubmissionEvidenceFile,
    updateSubmissionRow,
  } = controller

  if (page === 'dashboard')
    return (
      <Dashboard
        compliances={compliances}
        role={role}
        summary={summary}
        onNavigate={navigate}
        onOpenDetails={openDetails}
      />
    )
  if (page === 'compliance')
    return (
      <ComplianceList
        canCreate={!readOnly}
        canEdit={!readOnly}
        compliances={filteredCompliances}
        description={
          readOnly
            ? 'View compliance records assigned to your account.'
            : 'Create, review, and manage compliance records.'
        }
        eyebrow={`${role} workspace`}
        search={search}
        statusFilter={statusFilter}
        statuses={complianceStatuses}
        onSearch={setSearch}
        onStatusFilter={setStatusFilter}
        onCreate={openCreate}
        onOpenDetails={openDetails}
        onOpenSubmission={openSubmission}
        onEdit={openEdit}
      />
    )
  if (page === 'submission') {
    const reporterCanRework =
      readOnly &&
      role === 'Reporter' &&
      ['Partial', 'Rejected'].includes(selectedCompliance?.status ?? '')
    if (
      readOnly &&
      role === 'Reporter' &&
      (!selectedCompliance?.submission || reporterCanRework)
    ) {
      return (
        <ComplianceSubmissionForm
          compliance={selectedCompliance}
          form={submissionForm}
          submitting={submittingForm}
          onBack={() => navigate('compliance')}
          onSubmit={submitComplianceForm}
          onUpdateDetails={updateSubmissionDetails}
          onUpdateEmployee={updateSubmissionEmployee}
          onUpdateEvidence={updateSubmissionEvidence}
          onUpdateEvidenceFile={updateSubmissionEvidenceFile}
          onUpdateRow={updateSubmissionRow}
        />
      )
    }

    return (
      <ComplianceSubmissionView
        compliance={selectedCompliance}
        onBack={() => navigate('compliance')}
      />
    )
  }
  if (page === 'create' && !readOnly)
    return (
      <ComplianceForm
        editing={Boolean(editingId)}
        form={form}
        types={complianceTypes as ComplianceType[]}
        reporters={reporters}
        priorities={compliancePriorities as CompliancePriority[]}
        onUpdate={updateForm}
        onCancel={() => navigate('compliance')}
        onSubmit={saveCompliance}
      />
    )
  return (
    <ComplianceDetails
      canEdit={!readOnly}
      canReview={!readOnly && selectedCompliance?.status === 'Pending Evidence'}
      canRework={
        readOnly &&
        role === 'Reporter' &&
        ['Partial', 'Rejected'].includes(selectedCompliance?.status ?? '')
      }
      compliance={selectedCompliance}
      decision={decision}
      comments={reviewerComments}
      onDecision={setDecision}
      onComments={setReviewerComments}
      onBack={() => navigate('compliance')}
      onEdit={openEdit}
      onOpenSubmission={openSubmission}
      onSubmitReview={submitReview}
    />
  )
}

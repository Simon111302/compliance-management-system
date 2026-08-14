import { Dashboard } from '../pages/Dashboard/Dashboard.jsx'
import { ComplianceList } from '../pages/ComplianceList/ComplianceList.jsx'
import { ComplianceForm } from '../pages/ComplianceForm/ComplianceForm.jsx'
import { ComplianceDetails } from '../pages/ComplianceDetails/ComplianceDetails.jsx'
import { ComplianceSubmissionForm } from '../pages/ComplianceSubmissionForm/ComplianceSubmissionForm.jsx'
import { ComplianceSubmissionView } from '../pages/ComplianceSubmissionView/ComplianceSubmissionView.jsx'

export function AppRoutes({ controller, readOnly = false, role = 'Reviewer' }) {
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
    if (readOnly && role === 'Reporter') {
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
        types={complianceTypes}
        reporters={reporters}
        priorities={compliancePriorities}
        onUpdate={updateForm}
        onCancel={() => navigate('compliance')}
        onSubmit={saveCompliance}
      />
    )
  return (
    <ComplianceDetails
      canEdit={!readOnly}
      canReview={!readOnly}
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

import { Dashboard } from '../pages/Dashboard/Dashboard.jsx'
import { ComplianceList } from '../pages/ComplianceList/ComplianceList.jsx'
import { ComplianceForm } from '../pages/ComplianceForm/ComplianceForm.jsx'
import { ComplianceDetails } from '../pages/ComplianceDetails/ComplianceDetails.jsx'

export function AppRoutes({ controller }) {
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
    submitReview,
    summary,
    updateForm,
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
        compliances={filteredCompliances}
        search={search}
        statusFilter={statusFilter}
        statuses={complianceStatuses}
        onSearch={setSearch}
        onStatusFilter={setStatusFilter}
        onCreate={openCreate}
        onOpenDetails={openDetails}
        onEdit={openEdit}
      />
    )
  if (page === 'create')
    return (
      <ComplianceForm
        editing={Boolean(editingId)}
        form={form}
        types={complianceTypes}
        reporters={reporters}
        priorities={compliancePriorities}
        statuses={complianceStatuses}
        onUpdate={updateForm}
        onCancel={() => navigate('compliance')}
        onSubmit={saveCompliance}
      />
    )
  return (
    <ComplianceDetails
      compliance={selectedCompliance}
      decision={decision}
      comments={reviewerComments}
      onDecision={setDecision}
      onComments={setReviewerComments}
      onBack={() => navigate('compliance')}
      onEdit={openEdit}
      onSubmitReview={submitReview}
    />
  )
}

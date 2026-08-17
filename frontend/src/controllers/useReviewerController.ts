import { useComplianceController } from './useComplianceController'
import type { ReviewerPage } from '../types'

export function useReviewerController(
  enabled = true,
  loadReporters = true,
  onNavigate?: (page: ReviewerPage, resourceId?: string) => void,
) {
  return useComplianceController(enabled, loadReporters, onNavigate)
}

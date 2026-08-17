import { useComplianceController } from './useComplianceController'
import type { ReviewerPage } from '../types'

export function useReporterController(
  enabled = true,
  onNavigate?: (page: ReviewerPage, resourceId?: string) => void,
) {
  return useComplianceController(enabled, false, onNavigate)
}

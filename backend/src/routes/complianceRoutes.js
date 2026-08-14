import { Router } from 'express'
import { authenticate } from '../services/authService.js'
import { requireRoles } from '../middleware/roleAuthorization.js'
import {
  createCompliance,
  downloadComplianceEvidence,
  listCompliances,
  listReporters,
  replaceCompliance,
  reviewCompliance,
  submitComplianceForm,
  uploadComplianceEvidence,
} from '../controllers/complianceController.js'

const router = Router()

router.use(authenticate)
router.get('/', requireRoles('Admin', 'Reviewer', 'Reporter'), listCompliances)
router.get('/reporters', requireRoles('Reviewer'), listReporters)
router.post('/', requireRoles('Reviewer'), createCompliance)
router.put('/:id', requireRoles('Reviewer'), replaceCompliance)
router.put('/:id/evidence', requireRoles('Reporter'), uploadComplianceEvidence)
router.get(
  '/:id/evidence/:fileId',
  requireRoles('Admin', 'Reviewer', 'Reporter'),
  downloadComplianceEvidence,
)
router.put('/:id/submission', requireRoles('Reporter'), submitComplianceForm)
router.patch('/:id/review', requireRoles('Reviewer'), reviewCompliance)

export default router

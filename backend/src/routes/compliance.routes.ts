import { Router } from 'express'
import {
  createCompliance,
  deleteCompliance,
  downloadEvidence,
  getCompliance,
  listCompliances,
  listReporters,
  reviewCompliance,
  submitCompliance,
  updateCompliance,
  uploadEvidence,
} from '../controllers/compliance.Controller.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { requireRoles } from '../middleware/role.middleware.js'

const router = Router()

router.use(authenticate)

router.get('/', requireRoles('Admin', 'Reviewer', 'Reporter'), listCompliances)
router.get('/reporters', requireRoles('Admin', 'Reviewer'), listReporters)
router.get('/:id', requireRoles('Admin', 'Reviewer', 'Reporter'), getCompliance)
router.get(
  '/:id/evidence/:fileId',
  requireRoles('Admin', 'Reviewer', 'Reporter'),
  downloadEvidence,
)
router.put('/:id/evidence', requireRoles('Reporter'), uploadEvidence)
router.put('/:id/submission', requireRoles('Reporter'), submitCompliance)
router.patch('/:id/review', requireRoles('Admin', 'Reviewer'), reviewCompliance)
router.post('/', requireRoles('Admin', 'Reviewer'), createCompliance)
router.put('/:id', requireRoles('Admin', 'Reviewer'), updateCompliance)
router.patch('/:id', requireRoles('Admin', 'Reviewer'), updateCompliance)
router.delete('/:id', requireRoles('Admin', 'Reviewer'), deleteCompliance)

export default router

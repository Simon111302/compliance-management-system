import { Router } from 'express'
import {
  createAudit,
  deleteAudit,
  getAudit,
  listAudits,
  updateAudit,
} from '../controllers/audit.Controller.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { requireRoles } from '../middleware/role.middleware.js'

const router = Router()

router.use('/audits', authenticate, requireRoles('Admin'))
router.get('/audits', listAudits)
router.get('/audits/:auditId', getAudit)
router.post('/audits', createAudit)
router.put('/audits/:auditId', updateAudit)
router.patch('/audits/:auditId', updateAudit)
router.delete('/audits/:auditId', deleteAudit)

export default router

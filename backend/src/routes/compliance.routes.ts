import { Router } from 'express'
import {
  createCompliance,
  deleteCompliance,
  getCompliance,
  listCompliances,
  updateCompliance,
} from '../controllers/compliance.Controller.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { requireRoles } from '../middleware/role.middleware.js'

const router = Router()

router.use(authenticate)

router.get('/', requireRoles('Admin', 'Reviewer', 'Reporter'), listCompliances)
router.get('/:id', requireRoles('Admin', 'Reviewer', 'Reporter'), getCompliance)
router.post('/', requireRoles('Admin', 'Reviewer'), createCompliance)
router.put('/:id', requireRoles('Admin', 'Reviewer'), updateCompliance)
router.patch('/:id', requireRoles('Admin', 'Reviewer'), updateCompliance)
router.delete('/:id', requireRoles('Admin', 'Reviewer'), deleteCompliance)

export default router

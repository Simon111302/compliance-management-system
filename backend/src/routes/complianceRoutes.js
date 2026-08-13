import { Router } from 'express'
import { authenticate } from '../services/authService.js'
import {
  createCompliance,
  listCompliances,
  replaceCompliance,
  reviewCompliance,
} from '../controllers/complianceController.js'

const router = Router()

router.use(authenticate)
router.get('/', listCompliances)
router.post('/', createCompliance)
router.put('/:id', replaceCompliance)
router.patch('/:id/review', reviewCompliance)

export default router

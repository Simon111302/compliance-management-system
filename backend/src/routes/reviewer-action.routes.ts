import { Router } from 'express'
import {
  createReviewerAction,
  deleteReviewerAction,
  getReviewerAction,
  listReviewerActions,
  updateReviewerAction,
} from '../controllers/reviewer-action.Controller.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { requireRoles } from '../middleware/role.middleware.js'
import {
  validateObjectIdParam,
  validateReviewerActionBody,
} from '../middleware/validation.middleware.js'

const router = Router()
const validateActionId = validateObjectIdParam('actionId')

router.use('/reviewer-actions', authenticate, requireRoles('Admin'))

router.get('/reviewer-actions', listReviewerActions)
router.get('/reviewer-actions/:actionId', validateActionId, getReviewerAction)
router.post(
  '/reviewer-actions',
  validateReviewerActionBody,
  createReviewerAction,
)
router.put(
  '/reviewer-actions/:actionId',
  validateActionId,
  validateReviewerActionBody,
  updateReviewerAction,
)
router.patch(
  '/reviewer-actions/:actionId',
  validateActionId,
  validateReviewerActionBody,
  updateReviewerAction,
)
router.delete(
  '/reviewer-actions/:actionId',
  validateActionId,
  deleteReviewerAction,
)

export default router

import { Router } from 'express'
import {
  createReviewerAction,
  createUser,
  deleteReviewerAction,
  deleteUser,
  getDashboard,
  listAuditLogs,
  listReviewerActions,
  listUsers,
  resetUserPassword,
  updateReviewerAction,
  updateUser,
} from '../controllers/adminController.js'
import { requireAdmin } from '../middleware/adminAuthorization.js'
import { authenticate } from '../services/authService.js'

const router = Router()

router.use(authenticate)
router.use(requireAdmin)
router.get('/dashboard', getDashboard)
router.get('/users', listUsers)
router.post('/users', createUser)
router.put('/users/:id', updateUser)
router.patch('/users/:id/reset-password', resetUserPassword)
router.delete('/users/:id', deleteUser)
router.get('/reviewer-actions', listReviewerActions)
router.post('/reviewer-actions', createReviewerAction)
router.put('/reviewer-actions/:id', updateReviewerAction)
router.delete('/reviewer-actions/:id', deleteReviewerAction)
router.get('/audit-logs', listAuditLogs)

export default router

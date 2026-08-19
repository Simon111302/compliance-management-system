import { Router } from 'express'
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../controllers/notification.Controller.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { requireRoles } from '../middleware/role.middleware.js'

const router = Router()

router.use('/notifications', authenticate, requireRoles('Reviewer', 'Reporter'))
router.get('/notifications', listNotifications)
router.patch('/notifications/read-all', markAllNotificationsRead)
router.patch('/notifications/:notificationId/read', markNotificationRead)

export default router

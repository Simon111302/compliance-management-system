import { Router } from 'express'
import { currentUser, login, logout } from '../controllers/auth.Controller.js'
import { authenticate } from '../middleware/auth.middleware.js'

const router = Router()

router.post('/login', login)
router.get('/me', authenticate, currentUser)
router.post('/logout', authenticate, logout)

export default router

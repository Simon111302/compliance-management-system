import { Router } from 'express'
import { authenticate } from '../services/authService.js'
import { currentUser, login, logout } from '../controllers/authController.js'

const router = Router()

router.post('/login', login)
router.get('/me', authenticate, currentUser)
router.post('/logout', logout)

export default router

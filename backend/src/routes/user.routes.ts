import { Router } from 'express'
import {
  createRole,
  deleteRole,
  getRole,
  listRoles,
  updateRole,
} from '../controllers/role.Controller.js'
import {
  createUser,
  deleteUser,
  getUser,
  listUsers,
  updateUser,
} from '../controllers/user.Controller.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { requireRoles } from '../middleware/role.middleware.js'

const router = Router()

router.use(authenticate)
router.use(requireRoles('Admin'))

router.get('/users', listUsers)
router.get('/users/:userId', getUser)
router.post('/users', createUser)
router.put('/users/:userId', updateUser)
router.patch('/users/:userId', updateUser)
router.delete('/users/:userId', deleteUser)

router.get('/roles', listRoles)
router.get('/roles/:roleId', getRole)
router.post('/roles', createRole)
router.put('/roles/:roleId', updateRole)
router.patch('/roles/:roleId', updateRole)
router.delete('/roles/:roleId', deleteRole)

export default router

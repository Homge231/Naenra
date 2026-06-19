import { Router } from 'express'
import { getUserProfile, updateUserProfile } from '../controllers/userController'
import { authMiddleware } from '../middleware/authMiddleware'

const router = Router()

router.get('/profile', authMiddleware, getUserProfile)
router.patch('/profile', authMiddleware, updateUserProfile)

export default router
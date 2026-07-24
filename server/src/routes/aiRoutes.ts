import { Router } from 'express'
import { getAiChatResponse } from '../controllers/userController'
import { authMiddleware } from '../middleware/authMiddleware'

const router = Router()

router.post('/chat', authMiddleware, getAiChatResponse)

export default router

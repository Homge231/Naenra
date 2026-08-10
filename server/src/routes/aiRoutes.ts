import { Router } from 'express'
import { getAiChatResponse, getAiChatResponseStream } from '../controllers/userController'
import { authMiddleware } from '../middleware/authMiddleware'

const router = Router()

router.post('/chat', authMiddleware, getAiChatResponse)
router.post('/chat/stream', authMiddleware, getAiChatResponseStream)

export default router

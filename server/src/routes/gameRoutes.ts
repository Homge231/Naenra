import { Router } from 'express'
import { authMiddleware } from '../middleware/authMiddleware'
import { getQuestion, getQuestions, createSession, timeoutSession, submitAnswer, abandonSession } from '../controllers/gameController'

const router = Router()

router.get('/question', authMiddleware, getQuestion)
router.get('/questions', authMiddleware, getQuestions)
router.post('/session', authMiddleware, createSession)
router.post('/submit-answer', authMiddleware, submitAnswer)
router.post('/timeout', authMiddleware, timeoutSession)
router.post('/abandon', authMiddleware, abandonSession)

export default router

import { Router } from 'express'
import { authMiddleware } from '../middleware/authMiddleware'
import { getQuestion } from '../controllers/gameController'

const router = Router()

/**
 * All /api/game routes require a valid arena JWT.
 * The authMiddleware pattern matches authRoutes.ts / userRoutes.ts.
 */

// GET /api/game/question  →  standardized { question_text, target_word }
router.get('/question', authMiddleware, getQuestion)

export default router
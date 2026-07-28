import { Router } from 'express'
import { getUserProfile, updateUserProfile, getVocabAnalytics, getAiCoachAnalysis, getLeaderboard } from '../controllers/userController'
import { authMiddleware } from '../middleware/authMiddleware'

const router = Router()

router.get('/profile', authMiddleware, getUserProfile)
router.patch('/profile', authMiddleware, updateUserProfile)
router.get('/analytics', authMiddleware, getVocabAnalytics)
router.post('/ai-coach', authMiddleware, getAiCoachAnalysis)
router.get('/leaderboard', authMiddleware, getLeaderboard)

export default router
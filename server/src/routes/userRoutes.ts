import { Router } from 'express'
import { 
  getUserProfile, 
  updateUserProfile, 
  getAiCoachAnalysis, 
  getLeaderboard,
  getUserCoreProgress,
  claimCoreMission,
  syncCoreProgress
} from '../controllers/userController'
import { authMiddleware } from '../middleware/authMiddleware'

const router = Router()

router.get('/profile', authMiddleware, getUserProfile)
router.patch('/profile', authMiddleware, updateUserProfile)
router.post('/ai-coach', authMiddleware, getAiCoachAnalysis)
router.get('/leaderboard', authMiddleware, getLeaderboard)

// US-88: Core Progress Cloud Sync Routes
router.get('/core-progress', authMiddleware, getUserCoreProgress)
router.post('/core-progress/claim', authMiddleware, claimCoreMission)
router.post('/core-progress/sync', authMiddleware, syncCoreProgress)

export default router
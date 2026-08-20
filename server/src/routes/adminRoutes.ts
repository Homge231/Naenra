import { Router, Response, NextFunction } from 'express'
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware'
import { supabase } from '../config/supabase'
import { SUPER_ADMIN_EMAILS } from '../constants'
import { 
  getAdminSummary,
  getQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  importQuestions,
  getPlayers,
  banPlayer,
  unbanPlayer,
  togglePlayerAdmin,
  getLeaderboard,
  resetSeason,
  getAdminCores,
  createCore,
  updateCore,
  toggleCoreActive,
  deleteCore,
  getMatchAnalytics,
  getLiveMatchMetrics,
  getMatchHistory,
  generateAiQuestions
} from '../controllers/adminController'

const router = Router()

async function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const user = req.user
  if (!user || user.isGuest) {
    res.status(403).json({ success: false, error: 'Forbidden', message: 'Admin access required' })
    return
  }

  const email = (user.email || '').toLowerCase()

  const { data: player } = await supabase
    .from('players')
    .select('is_admin')
    .eq('id', user.id)
    .maybeSingle()

  if (!player?.is_admin && !SUPER_ADMIN_EMAILS.has(email)) {
    res.status(403).json({ success: false, error: 'Forbidden', message: 'Admin access required' })
    return
  }

  next()
}

// Protected Admin metrics endpoint
router.get('/summary', authMiddleware, requireAdmin, getAdminSummary)

// Protected Question Bank CRUD endpoints
router.get('/questions', authMiddleware, requireAdmin, getQuestions)
router.post('/questions', authMiddleware, requireAdmin, createQuestion)
router.put('/questions/:id', authMiddleware, requireAdmin, updateQuestion)
router.delete('/questions/:id', authMiddleware, requireAdmin, deleteQuestion)

// Bulk Import CSV/JSON endpoint
router.post('/questions/import', authMiddleware, requireAdmin, importQuestions)

// Protected Player Management endpoints
router.get('/players', authMiddleware, requireAdmin, getPlayers)
router.post('/players/:id/ban', authMiddleware, requireAdmin, banPlayer)
router.post('/players/:id/unban', authMiddleware, requireAdmin, unbanPlayer)
router.patch('/players/:id/admin', authMiddleware, requireAdmin, togglePlayerAdmin)

// Leaderboard & Season Management endpoints (US-92)
router.get('/leaderboard', authMiddleware, requireAdmin, getLeaderboard)
router.post('/season/reset', authMiddleware, requireAdmin, resetSeason)

// Support Core & Configs Management endpoints (US-94)
router.get('/cores', authMiddleware, requireAdmin, getAdminCores)
router.post('/cores', authMiddleware, requireAdmin, createCore)
router.put('/cores/:id', authMiddleware, requireAdmin, updateCore)
router.patch('/cores/:id/toggle', authMiddleware, requireAdmin, toggleCoreActive)
router.delete('/cores/:id', authMiddleware, requireAdmin, deleteCore)

// Protected Match Analytics & Telemetry endpoints (US-93)
router.get('/matches/analytics', authMiddleware, requireAdmin, getMatchAnalytics)
router.get('/matches/live', authMiddleware, requireAdmin, getLiveMatchMetrics)
router.get('/matches/history', authMiddleware, requireAdmin, getMatchHistory)

// Protected AI Operations endpoints (US-96)
router.post('/ai/generate-questions', authMiddleware, requireAdmin, generateAiQuestions)

export default router

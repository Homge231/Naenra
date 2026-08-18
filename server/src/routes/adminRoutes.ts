import { Router, Response, NextFunction } from 'express'
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware'
import { supabase } from '../config/supabase'
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
  togglePlayerAdmin
} from '../controllers/adminController'

const router = Router()

async function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const user = req.user
  if (!user || user.isGuest) {
    res.status(403).json({ success: false, error: 'Forbidden', message: 'Admin access required' })
    return
  }

  const email = (user.email || '').toLowerCase()
  const isKnownAdminEmail = email === 'homge231@gmail.com' || 
                           email === 'baonhggcd220259@fpt.edu.vn'

  const { data: player } = await supabase
    .from('players')
    .select('is_admin')
    .eq('id', user.id)
    .maybeSingle()

  const isAdmin = player?.is_admin === true || isKnownAdminEmail

  if (!isAdmin) {
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

export default router

import { Router } from 'express'
import { authMiddleware } from '../middleware/authMiddleware'
import { 
  getAdminSummary,
  getQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  importQuestions
} from '../controllers/adminController'

const router = Router()

// Protected Admin metrics endpoint
router.get('/summary', authMiddleware, getAdminSummary)

// Protected Question Bank CRUD endpoints
router.get('/questions', authMiddleware, getQuestions)
router.post('/questions', authMiddleware, createQuestion)
router.put('/questions/:id', authMiddleware, updateQuestion)
router.delete('/questions/:id', authMiddleware, deleteQuestion)

// Bulk Import CSV/JSON endpoint
router.post('/questions/import', authMiddleware, importQuestions)

export default router

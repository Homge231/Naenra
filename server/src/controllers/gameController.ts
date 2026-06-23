import { Request, Response } from 'express'
import { getRandomQuestion } from '../utils/questions'

/**
 * GET /api/game/question
 * Auth: JWT required (authMiddleware applied in gameRoutes)
 *
 * Response 200:
 * {
 *   "question_text": "The scientist made a remarkable ________ ...",
 *   "target_word":   "discovery"
 * }
 *
 * US-06 [BE] — payload always contains exactly these two fields so the
 * frontend can render the question and derive blank-slot count independently.
 */
export async function getQuestion(_req: Request, res: Response): Promise<void> {
  try {
    const payload = getRandomQuestion()
    res.status(200).json(payload)
  } catch (err) {
    console.error('getQuestion error:', err)
    res.status(500).json({ error: 'Failed to fetch question.' })
  }
}
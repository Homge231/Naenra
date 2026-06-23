import { Request, Response } from 'express'
import { createClient } from '@supabase/supabase-js'

// Use service key to bypass RLS — same pattern as other controllers
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

/**
 * GET /api/game/question
 * Auth: JWT required (applied in gameRoutes.ts)
 *
 * Picks a random question from the `questions` table.
 * Response: { question_text: string, target_word: string }
 */
export async function getQuestion(_req: Request, res: Response): Promise<void> {
  try {
    // Fetch all IDs, pick one randomly, then fetch that row.
    // Avoids loading all text into memory for large question banks.
    const { data: ids, error: idError } = await supabase
      .from('questions')
      .select('id')

    if (idError) throw idError
    if (!ids || ids.length === 0) {
      res.status(404).json({ error: 'No questions available.' })
      return
    }

    const randomId = ids[Math.floor(Math.random() * ids.length)].id

    const { data: question, error: qError } = await supabase
      .from('questions')
      .select('question_text, target_word')
      .eq('id', randomId)
      .single()

    if (qError) throw qError

    res.status(200).json(question)
  } catch (err) {
    console.error('getQuestion error:', err)
    res.status(500).json({ error: 'Failed to fetch question.' })
  }
}
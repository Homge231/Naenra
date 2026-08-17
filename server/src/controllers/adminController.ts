import { Response } from 'express'
import { AuthRequest } from '../middleware/authMiddleware'
import { supabase } from '../config/supabase'

/**
 * GET /api/admin/summary
 * Returns lightweight COUNT() metrics across players, questions, matches, and system state.
 */
export async function getAdminSummary(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const startTime = Date.now()

    const [
      playersRes,
      questionsRes,
      matchesRes,
      liveMatchesRes,
      coresRes
    ] = await Promise.all([
      supabase.from('players').select('*', { count: 'exact', head: true }),
      supabase.from('questions').select('*', { count: 'exact', head: true }),
      supabase.from('game_sessions').select('*', { count: 'exact', head: true }),
      supabase.from('game_sessions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('cores').select('*', { count: 'exact', head: true })
    ])

    const totalPlayers = playersRes.count ?? 0
    const totalQuestions = questionsRes.count ?? 0
    const totalMatches = matchesRes.count ?? 0
    const liveMatches = liveMatchesRes.count ?? 0
    const totalCores = coresRes.count ?? 0

    const queryLatencyMs = Date.now() - startTime

    res.json({
      success: true,
      data: {
        totalPlayers,
        liveMatches,
        totalQuestions,
        totalMatches,
        totalCores,
        serverStatus: 'online',
        uptimeSeconds: Math.floor(process.uptime()),
        queryLatencyMs,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error: any) {
    console.error('Error in getAdminSummary:', error)
    res.status(500).json({
      success: false,
      error: 'InternalServerError',
      message: 'Failed to retrieve admin summary metrics'
    })
  }
}

/**
 * GET /api/admin/questions
 * Returns paginated questions with search, theme/topic filter, difficulty filter.
 */
export async function getQuestions(req: AuthRequest, res: Response): Promise<void> {
  try {
    const page = Math.max(1, parseInt(req.query.page as string || '1'))
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string || '10')))
    const search = (req.query.search as string || '').trim()
    const topic = (req.query.topic as string || req.query.theme as string || '').trim()
    const difficulty = (req.query.difficulty as string || '').trim()

    let query = supabase.from('questions').select('*', { count: 'exact' })

    if (search) {
      query = query.or(`target_word.ilike.%${search}%,question_text.ilike.%${search}%,hint.ilike.%${search}%`)
    }

    if (topic) {
      query = query.ilike('topic', `%${topic}%`)
    }

    if (difficulty) {
      query = query.eq('difficulty', difficulty)
    }

    const fromIndex = (page - 1) * limit
    const toIndex = fromIndex + limit - 1

    query = query.range(fromIndex, toIndex).order('id', { ascending: false })

    const { data, count, error } = await query

    if (error) throw error

    const total = count ?? 0
    const totalPages = Math.ceil(total / limit) || 1

    res.json({
      success: true,
      data: {
        questions: data || [],
        total,
        page,
        limit,
        totalPages
      }
    })
  } catch (error: any) {
    console.error('Error in getQuestions:', error)
    res.status(500).json({
      success: false,
      error: 'InternalServerError',
      message: 'Failed to fetch questions'
    })
  }
}

/**
 * POST /api/admin/questions
 * Creates a new question.
 */
export async function createQuestion(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { question_text, target_word, hint, topic, difficulty, category } = req.body

    if (!target_word || typeof target_word !== 'string') {
      res.status(400).json({ success: false, message: 'Target word is required' })
      return
    }

    const newQuestionPayload = {
      question_text: question_text || `Target word is ${target_word}`,
      target_word: target_word.trim().toLowerCase(),
      hint: hint || '',
      topic: topic || 'general',
      difficulty: difficulty || 'A1',
      category: category || topic || 'general'
    }

    const { data, error } = await supabase
      .from('questions')
      .insert(newQuestionPayload)
      .select()
      .single()

    if (error) throw error

    res.status(201).json({
      success: true,
      data,
      message: 'Question created successfully'
    })
  } catch (error: any) {
    console.error('Error in createQuestion:', error)
    res.status(500).json({
      success: false,
      error: 'InternalServerError',
      message: 'Failed to create question'
    })
  }
}

/**
 * PUT /api/admin/questions/:id
 * Updates an existing question.
 */
export async function updateQuestion(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params
    const { question_text, target_word, hint, topic, difficulty, category } = req.body

    if (!id) {
      res.status(400).json({ success: false, message: 'Question ID is required' })
      return
    }

    const updatePayload: Record<string, any> = {}
    if (question_text !== undefined) updatePayload.question_text = question_text
    if (target_word !== undefined) updatePayload.target_word = target_word.trim().toLowerCase()
    if (hint !== undefined) updatePayload.hint = hint
    if (topic !== undefined) updatePayload.topic = topic
    if (difficulty !== undefined) updatePayload.difficulty = difficulty
    if (category !== undefined) updatePayload.category = category

    const { data, error } = await supabase
      .from('questions')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    res.json({
      success: true,
      data,
      message: 'Question updated successfully'
    })
  } catch (error: any) {
    console.error('Error in updateQuestion:', error)
    res.status(500).json({
      success: false,
      error: 'InternalServerError',
      message: 'Failed to update question'
    })
  }
}

/**
 * DELETE /api/admin/questions/:id
 * Deletes a question by ID.
 */
export async function deleteQuestion(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params

    if (!id) {
      res.status(400).json({ success: false, message: 'Question ID is required' })
      return
    }

    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', id)

    if (error) throw error

    res.json({
      success: true,
      message: 'Question deleted successfully'
    })
  } catch (error: any) {
    console.error('Error in deleteQuestion:', error)
    res.status(500).json({
      success: false,
      error: 'InternalServerError',
      message: 'Failed to delete question'
    })
  }
}

/**
 * POST /api/admin/questions/import
 * Bulk imports questions from raw CSV content or JSON array.
 */
export async function importQuestions(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { csvText, questions } = req.body
    let itemsToInsert: Array<{
      question_text: string
      target_word: string
      hint: string
      topic: string
      difficulty: string
    }> = []

    if (Array.isArray(questions) && questions.length > 0) {
      itemsToInsert = questions.map(q => ({
        question_text: q.question_text || q.word || `Target word is ${q.target_word || q.word}`,
        target_word: (q.target_word || q.word || q.answer || '').trim().toLowerCase(),
        hint: q.hint || q.meaning || '',
        topic: q.topic || q.theme || 'general',
        difficulty: q.difficulty || q.tier || 'A1'
      })).filter(q => q.target_word.length > 0)
    } else if (typeof csvText === 'string' && csvText.trim().length > 0) {
      const lines = csvText.trim().split(/\r?\n/)
      if (lines.length > 1) {
        const header = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/^["']|["']$/g, ''))
        
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim()
          if (!line) continue
          
          // Regex to parse CSV line respecting quotes
          const row = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(',')
          const cleanRow = row.map(cell => cell.trim().replace(/^["']|["']$/g, ''))

          const getVal = (colNames: string[]) => {
            const idx = header.findIndex(h => colNames.includes(h))
            return idx !== -1 && cleanRow[idx] ? cleanRow[idx] : ''
          }

          const target_word = getVal(['target_word', 'word', 'vocabulary', 'answer']).toLowerCase()
          if (!target_word) continue

          const question_text = getVal(['question_text', 'question', 'sentence']) || `Target word is ${target_word}`
          const hint = getVal(['hint', 'meaning', 'description'])
          const topic = getVal(['topic', 'theme', 'category']) || 'general'
          const difficulty = getVal(['difficulty', 'tier', 'level']) || 'A1'

          itemsToInsert.push({
            question_text,
            target_word,
            hint,
            topic,
            difficulty
          })
        }
      }
    }

    if (itemsToInsert.length === 0) {
      res.status(400).json({
        success: false,
        message: 'No valid questions found to import. Please check your format.'
      })
      return
    }

    // Insert in batches of 100
    const batchSize = 100
    let insertedCount = 0

    for (let i = 0; i < itemsToInsert.length; i += batchSize) {
      const batch = itemsToInsert.slice(i, i + batchSize)
      const { error } = await supabase.from('questions').insert(batch)
      if (error) throw error
      insertedCount += batch.length
    }

    res.json({
      success: true,
      importedCount: insertedCount,
      message: `Successfully imported ${insertedCount} questions into the question bank.`
    })
  } catch (error: any) {
    console.error('Error in importQuestions:', error)
    res.status(500).json({
      success: false,
      error: 'InternalServerError',
      message: 'Failed to bulk import questions'
    })
  }
}

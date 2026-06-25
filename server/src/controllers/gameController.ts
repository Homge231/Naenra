import { Request, Response } from 'express'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

/**
 * GET /api/game/question
 * Trả về 1 câu hỏi ngẫu nhiên.
 */
export async function getQuestion(_req: Request, res: Response): Promise<void> {
  try {
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
      .select('id, question_text, target_word, hint')
      .eq('id', randomId)
      .single()

    if (qError) throw qError

    res.status(200).json(question)
  } catch (err) {
    console.error('getQuestion error:', err)
    res.status(500).json({ error: 'Failed to fetch question.' })
  }
}

/**
 * GET /api/game/questions
 * Trả về batch 20 câu hỏi ngẫu nhiên.
 */
export async function getQuestions(_req: Request, res: Response): Promise<void> {
  const BATCH_SIZE = 20
  try {
    const { data: ids, error: idError } = await supabase
      .from('questions')
      .select('id')

    if (idError) throw idError
    if (!ids || ids.length === 0) {
      res.status(404).json({ error: 'No questions available.' })
      return
    }

    const shuffled = [...ids].sort(() => Math.random() - 0.5).slice(0, BATCH_SIZE)
    const pickedIds = shuffled.map((r: { id: string }) => r.id)

    const { data: questions, error: qError } = await supabase
      .from('questions')
      .select('id, question_text, target_word, hint')
      .in('id', pickedIds)

    if (qError) throw qError

    const shuffledQuestions = (questions ?? []).sort(() => Math.random() - 0.5)

    res.status(200).json({ questions: shuffledQuestions })
  } catch (err) {
    console.error('getQuestions error:', err)
    res.status(500).json({ error: 'Failed to fetch questions.' })
  }
}

/**
 * POST /api/game/session
 * Tạo một session mới khi trận bắt đầu. Kèm theo random theme.
 */
export async function createSession(req: Request, res: Response): Promise<void> {
  try {
    const playerId = (req as any).user?.id
    if (!playerId) { res.status(401).json({ error: 'Unauthorized' }); return }

    const { data, error } = await supabase
      .from('game_sessions')
      .insert({ player_id: playerId, status: 'active' })
      .select('id')
      .single()

    if (error) throw error

   const themes = ['daily-life', 'cafe', 'travel']
    const randomTheme = themes[Math.floor(Math.random() * themes.length)]

    res.status(201).json({ session_id: data.id, theme: randomTheme })
  } catch (err) {
    console.error('createSession error:', err)
    res.status(500).json({ error: 'Failed to create session.' })
  }
}

/**
 * POST /api/game/submit-answer
 * Gửi đáp án từng câu hỏi, kiểm tra server-side và cộng điểm vào session.
 */
export async function submitAnswer(req: Request, res: Response): Promise<void> {
  try {
    const playerId = (req as any).user?.id;
    if (!playerId) { res.status(401).json({ error: 'Unauthorized' }); return; }

    const { session_id, question_id, answer, time_left } = req.body;

    if (!session_id || !question_id || answer === undefined) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const { data: session, error: sessErr } = await supabase
      .from('game_sessions')
      .select('id, status, score, questions_answered')
      .eq('id', session_id)
      .eq('player_id', playerId)
      .single();

    if (sessErr || !session || session.status !== 'active') {
      res.status(400).json({ error: 'Invalid or inactive session' });
      return;
    }

    const { data: question, error: qErr } = await supabase
      .from('questions')
      .select('target_word')
      .eq('id', question_id)
      .single();

    if (qErr || !question) {
      res.status(404).json({ error: 'Question not found' });
      return;
    }

    const isCorrect = answer.toLowerCase() === question.target_word.toLowerCase();

    if (isCorrect) {
      const points = 100 + Math.floor((time_left || 0) * 3);
      const newScore = (session.score || 0) + points;
      const newQuestionsAnswered = (session.questions_answered || 0) + 1;

      const { error: updErr } = await supabase
        .from('game_sessions')
        .update({ score: newScore, questions_answered: newQuestionsAnswered })
        .eq('id', session_id);

      if (updErr) throw updErr;

      res.status(200).json({ 
        correct: true, 
        points_earned: points, 
        current_total_score: newScore,
        questions_answered: newQuestionsAnswered
      });
    } else {
      res.status(200).json({ 
        correct: false, 
        points_earned: 0, 
        current_total_score: session.score || 0,
        questions_answered: session.questions_answered || 0
      });
    }
  } catch (err) {
    console.error('submitAnswer error:', err);
    res.status(500).json({ error: 'Failed to submit answer.' });
  }
}

/**
 * POST /api/game/timeout
 * Khoá session khi hết giờ.
 */
export async function timeoutSession(req: Request, res: Response): Promise<void> {
  try {
    const playerId = (req as any).user?.id
    if (!playerId) { res.status(401).json({ error: 'Unauthorized' }); return }

    const { session_id, score, questions_answered } = req.body

    if (!session_id) {
      res.status(400).json({ error: 'session_id is required.' })
      return
    }

    const { data: session, error: fetchError } = await supabase
      .from('game_sessions')
      .select('id, status, player_id')
      .eq('id', session_id)
      .single()

    if (fetchError || !session) {
      res.status(404).json({ error: 'Session not found.' })
      return
    }
    if (session.player_id !== playerId) {
      res.status(403).json({ error: 'Forbidden.' })
      return
    }
    if (session.status !== 'active') {
      res.status(409).json({ error: 'Session already ended.', status: session.status })
      return
    }

    const { error: updateError } = await supabase
      .from('game_sessions')
      .update({
        status:             'timeout',
        score:              score             ?? 0,
        questions_answered: questions_answered ?? 0,
        ended_at:           new Date().toISOString(),
      })
      .eq('id', session_id)

    if (updateError) throw updateError

    res.status(200).json({ message: 'Session locked as timeout.', session_id })
  } catch (err) {
    console.error('timeoutSession error:', err)
    res.status(500).json({ error: 'Failed to lock session.' })
  }
}
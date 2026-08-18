import { Response } from 'express'
import { AuthRequest } from '../middleware/authMiddleware'
import { supabase } from '../config/supabase'
import { broadcastSessionInvalidated } from '../utils/realtimeBroadcast'
import { kickUserClients, getOnlineUserIds } from '../utils/activeClients'

// ── Shared admin helpers ──────────────────────────────────────────────────────

/**
 * Fetch a player by ID or send a 404 response and return null.
 * Use at the top of any admin action that needs to validate the target player.
 */
async function fetchPlayerOrFail(
  id: string,
  res: Response
): Promise<{ id: string; email: string; username: string; is_admin: boolean } | null> {
  const { data, error } = await supabase
    .from('players')
    .select('id, email, username, is_admin')
    .eq('id', id)
    .single()
  if (error || !data) {
    res.status(404).json({ success: false, message: 'Player not found' })
    return null
  }
  return data
}

/**
 * Increment session_version, broadcast session invalidation, and optionally
 * kick all active WebSocket connections for the player.
 */
async function invalidatePlayerSession(id: string, kick = false): Promise<void> {
  const { data: newVersion } = await supabase.rpc('increment_session_version', { player_id: id })
  try {
    await broadcastSessionInvalidated(id, newVersion ?? Date.now())
    if (kick) kickUserClients(id, 4003)
  } catch (e) {
    console.warn('Session invalidation warning:', e)
  }
}

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
      supabase.from('players').select('*', { count: 'exact', head: true }).not('email', 'ilike', '%@guest.naenra.xyz%').not('email', 'ilike', 'guest_%'),
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

/**
 * GET /api/admin/players
 * Returns paginated players with search, status filtering (all/online/offline/banned),
 * sorting (elo/matches/wins/created_at), and KPI stats.
 */
export async function getPlayers(req: AuthRequest, res: Response): Promise<void> {
  try {
    const page = Math.max(1, parseInt((req.query.page as string) || '1'))
    const limit = Math.max(1, Math.min(100, parseInt((req.query.limit as string) || '10')))
    const search = ((req.query.search as string) || '').trim()
    const status = ((req.query.status as string) || 'all').toLowerCase()
    const sortBy = ((req.query.sortBy as string) || 'created_at')
    const sortOrder = ((req.query.sortOrder as string) || 'desc').toLowerCase() === 'asc'

    // 1. Identify currently active / online player IDs
    const onlinePlayerIds = getOnlineUserIds()

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
    const [activeSessionsRes, recentPlayersRes] = await Promise.all([
      supabase
        .from('game_sessions')
        .select('player_id')
        .eq('status', 'active')
        .gte('updated_at', fiveMinutesAgo),
      supabase
        .from('players')
        .select('id')
        .gte('updated_at', fiveMinutesAgo)
    ])

    if (activeSessionsRes.data) {
      activeSessionsRes.data.forEach((s: any) => {
        if (s.player_id) onlinePlayerIds.add(s.player_id)
      })
    }
    if (recentPlayersRes.data) {
      recentPlayersRes.data.forEach((p: any) => {
        if (p.id) onlinePlayerIds.add(p.id)
      })
    }

    // 2. Fetch global player KPI stats (strictly registered accounts)
    const [totalRes, bannedRes] = await Promise.all([
      supabase
        .from('players')
        .select('*', { count: 'exact', head: true })
        .not('email', 'ilike', '%@guest.naenra.xyz%')
        .not('email', 'ilike', 'guest_%'),
      supabase
        .from('players')
        .select('*', { count: 'exact', head: true })
        .eq('is_banned', true)
        .not('email', 'ilike', '%@guest.naenra.xyz%')
        .not('email', 'ilike', 'guest_%')
    ])

    const totalPlayers = totalRes.count ?? 0
    const bannedPlayers = bannedRes.count ?? 0
    const onlinePlayers = onlinePlayerIds.size
    const activeRate = totalPlayers > 0 ? Math.round(((totalPlayers - bannedPlayers) / totalPlayers) * 100) : 100

    // 3. Build filtered player query (strictly registered accounts)
    let query = supabase
      .from('players')
      .select('*', { count: 'exact' })
      .not('email', 'ilike', '%@guest.naenra.xyz%')
      .not('email', 'ilike', 'guest_%')

    if (search) {
      query = query.or(`username.ilike.%${search}%,email.ilike.%${search}%`)
    }

    if (status === 'banned') {
      query = query.eq('is_banned', true)
    } else if (status === 'online') {
      query = query.eq('is_banned', false)
      if (onlinePlayerIds.size > 0) {
        query = query.in('id', Array.from(onlinePlayerIds))
      } else {
        // No one online -> match impossible id to return empty list
        query = query.eq('id', '00000000-0000-0000-0000-000000000000')
      }
    } else if (status === 'offline') {
      query = query.eq('is_banned', false)
      if (onlinePlayerIds.size > 0) {
        query = query.not('id', 'in', `(${Array.from(onlinePlayerIds).join(',')})`)
      }
    }

    const sortColumn = ['elo', 'wins', 'losses', 'total_matches', 'created_at'].includes(sortBy)
      ? sortBy
      : 'created_at'

    const fromIndex = (page - 1) * limit
    const toIndex = fromIndex + limit - 1

    query = query.order(sortColumn, { ascending: sortOrder }).range(fromIndex, toIndex)

    const { data: playersData, count, error } = await query

    if (error) throw error

    const total = count ?? 0
    const totalPages = Math.ceil(total / limit) || 1

    const mappedPlayers = (playersData || []).map((p: any) => {
      const isBanned = p.is_banned === true
      const isOnline = !isBanned && onlinePlayerIds.has(p.id)
      const totalMatches = p.total_matches ?? 0
      const wins = p.wins ?? 0
      const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0

      return {
        id: p.id,
        username: p.username || 'Anonymous',
        email: p.email || '',
        avatar_url: p.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(p.username || 'Player')}`,
        elo: p.elo ?? 0,
        wins,
        losses: p.losses ?? 0,
        total_matches: totalMatches,
        win_rate: winRate,
        is_banned: isBanned,
        banned_at: p.banned_at || null,
        is_admin: p.is_admin === true,
        status: isBanned ? 'banned' : isOnline ? 'online' : 'offline',
        created_at: p.created_at
      }
    })

    res.json({
      success: true,
      data: {
        players: mappedPlayers,
        total,
        page,
        limit,
        totalPages,
        stats: {
          totalPlayers,
          onlinePlayers,
          bannedPlayers,
          activeRate
        }
      }
    })
  } catch (error: any) {
    console.error('Error in getPlayers:', error)
    res.status(500).json({
      success: false,
      error: 'InternalServerError',
      message: 'Failed to retrieve player list'
    })
  }
}

/**
 * POST /api/admin/players/:id/ban
 * Bans a player, revokes their active JWT session, aborts ongoing matches, and disconnects them.
 */
export async function banPlayer(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = String(req.params.id || '')
    const { reason } = req.body

    if (!id) {
      res.status(400).json({ success: false, message: 'Player ID is required' })
      return
    }

    const targetPlayer = await fetchPlayerOrFail(id, res)
    if (!targetPlayer) return

    if (targetPlayer.is_admin) {
      res.status(403).json({ success: false, message: 'Administrator accounts cannot be banned.' })
      return
    }

    const { error: updateErr } = await supabase
      .from('players')
      .update({ is_banned: true, banned_at: new Date().toISOString() })
      .eq('id', id)
    if (updateErr) throw updateErr

    // Abort any active game sessions
    await supabase
      .from('game_sessions')
      .update({ status: 'aborted' })
      .eq('player_id', id)
      .eq('status', 'active')

    await invalidatePlayerSession(id, /* kick = */ true)

    res.json({
      success: true,
      message: `Player ${targetPlayer.username || targetPlayer.email} has been suspended successfully.`,
      reason: reason || 'Violation of terms of service'
    })
  } catch (error: any) {
    console.error('Error in banPlayer:', error)
    res.status(500).json({ success: false, error: 'InternalServerError', message: 'Failed to ban player' })
  }
}

/**
 * POST /api/admin/players/:id/unban
 * Unbans a player and restores their account access.
 */
export async function unbanPlayer(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = String(req.params.id || '')

    if (!id) {
      res.status(400).json({ success: false, message: 'Player ID is required' })
      return
    }

    // Verify player exists before updating
    const targetPlayer = await fetchPlayerOrFail(id, res)
    if (!targetPlayer) return

    const { error: updateErr } = await supabase
      .from('players')
      .update({ is_banned: false, banned_at: null })
      .eq('id', id)
    if (updateErr) throw updateErr

    res.json({ success: true, message: 'Player account has been restored successfully.' })
  } catch (error: any) {
    console.error('Error in unbanPlayer:', error)
    res.status(500).json({ success: false, error: 'InternalServerError', message: 'Failed to restore player account' })
  }
}

/**
 * PATCH /api/admin/players/:id/admin
 * Updates a player's is_admin status (grant or revoke admin privileges).
 */
export async function togglePlayerAdmin(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = String(req.params.id || '')
    const { is_admin } = req.body

    if (!id) {
      res.status(400).json({ success: false, message: 'Player ID is required' })
      return
    }
    if (typeof is_admin !== 'boolean') {
      res.status(400).json({ success: false, message: 'is_admin (boolean) is required' })
      return
    }
    // Prevent an admin from removing admin rights from their own account
    if (req.user?.id === id && !is_admin) {
      res.status(400).json({ success: false, message: 'You cannot remove admin privileges from your own account.' })
      return
    }

    const targetPlayer = await fetchPlayerOrFail(id, res)
    if (!targetPlayer) return

    const { error: updateErr } = await supabase
      .from('players')
      .update({ is_admin })
      .eq('id', id)
    if (updateErr) throw updateErr

    // Invalidate session so the player's JWT refreshes with the new is_admin value
    await invalidatePlayerSession(id)

    res.json({
      success: true,
      message: `Admin privileges ${is_admin ? 'granted to' : 'revoked from'} ${targetPlayer.username || targetPlayer.email}.`,
      data: { id, is_admin }
    })
  } catch (error: any) {
    console.error('Error in togglePlayerAdmin:', error)
    res.status(500).json({ success: false, error: 'InternalServerError', message: 'Failed to update admin status' })
  }
}

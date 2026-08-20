import { Response } from 'express'
import { matchMaker } from 'colyseus'
import { AuthRequest } from '../middleware/authMiddleware'
import { supabase } from '../config/supabase'
import { broadcastSessionInvalidated } from '../utils/realtimeBroadcast'
import { kickUserClients, getOnlineUserIds } from '../utils/activeClients'
import { generateQuestions, getAiBehaviorConfig, saveAiBehaviorConfig, resetAiBehaviorConfig } from '../services/aiService'

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
    const page = Math.max(1, parseInt((req.query.page as string) || '1'))
    const limit = Math.max(1, Math.min(100, parseInt((req.query.limit as string) || '10')))
    const search = ((req.query.search as string) || '').trim()
    const topic = ((req.query.topic as string) || (req.query.theme as string) || '').trim()
    const difficulty = ((req.query.difficulty as string) || '').trim()

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
 * Returns paginated players with search, status filtering, sorting, and KPI stats.
 */
export async function getPlayers(req: AuthRequest, res: Response): Promise<void> {
  try {
    const page = Math.max(1, parseInt((req.query.page as string) || '1'))
    const limit = Math.max(1, Math.min(100, parseInt((req.query.limit as string) || '10')))
    const search = ((req.query.search as string) || '').trim()
    const status = ((req.query.status as string) || 'all').toLowerCase()
    const sortBy = ((req.query.sortBy as string) || 'created_at')
    const sortOrder = ((req.query.sortOrder as string) || 'desc').toLowerCase() === 'asc'

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

    const sessionPlayerIds = (activeSessionsRes.data || []).map(s => s.player_id).filter(Boolean)
    const recentPlayerIds = (recentPlayersRes.data || []).map(p => p.id).filter(Boolean)

    const allOnlineIds = new Set([...onlinePlayerIds, ...sessionPlayerIds, ...recentPlayerIds])

    let baseQuery = supabase
      .from('players')
      .select('*', { count: 'exact' })
      .not('email', 'ilike', '%@guest.naenra.xyz%')
      .not('email', 'ilike', 'guest_%')

    if (search) {
      baseQuery = baseQuery.or(`username.ilike.%${search}%,email.ilike.%${search}%`)
    }

    if (status === 'banned') {
      baseQuery = baseQuery.eq('is_banned', true)
    } else if (status === 'online') {
      const activeIdsList = Array.from(allOnlineIds)
      if (activeIdsList.length > 0) {
        baseQuery = baseQuery.in('id', activeIdsList).eq('is_banned', false)
      } else {
        baseQuery = baseQuery.eq('id', '00000000-0000-0000-0000-000000000000')
      }
    } else if (status === 'offline') {
      baseQuery = baseQuery.eq('is_banned', false)
      const activeIdsList = Array.from(allOnlineIds)
      if (activeIdsList.length > 0) {
        baseQuery = baseQuery.not('id', 'in', `(${activeIdsList.join(',')})`)
      }
    }

    const validSortFields = ['created_at', 'elo', 'wins', 'losses', 'total_matches']
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at'

    const fromIndex = (page - 1) * limit
    const toIndex = fromIndex + limit - 1

    baseQuery = baseQuery.range(fromIndex, toIndex).order(sortField, { ascending: sortOrder })

    const { data: rawPlayers, count: totalCount, error: fetchErr } = await baseQuery

    if (fetchErr) throw fetchErr

    const mappedPlayers = (rawPlayers || []).map(p => {
      const isBanned = !!p.is_banned
      const isOnline = !isBanned && allOnlineIds.has(p.id)
      const wins = p.wins ?? 0
      const totalMatches = p.total_matches ?? 0
      const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0

      return {
        id: p.id,
        username: p.username || 'Anonymous',
        email: p.email || '',
        avatar_url: p.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(p.username || 'Player')}`,
        elo: p.elo ?? 1000,
        wins,
        losses: p.losses ?? 0,
        total_matches: totalMatches,
        win_rate: winRate,
        is_banned: isBanned,
        banned_at: p.banned_at || null,
        is_admin: !!p.is_admin,
        status: isBanned ? 'banned' : (isOnline ? 'online' : 'offline'),
        created_at: p.created_at || new Date().toISOString()
      }
    })

    const [totalStatsRes, bannedStatsRes] = await Promise.all([
      supabase.from('players').select('*', { count: 'exact', head: true }).not('email', 'ilike', '%@guest.naenra.xyz%').not('email', 'ilike', 'guest_%'),
      supabase.from('players').select('*', { count: 'exact', head: true }).eq('is_banned', true).not('email', 'ilike', '%@guest.naenra.xyz%').not('email', 'ilike', 'guest_%')
    ])

    const totalPlayers = totalStatsRes.count ?? totalCount ?? 0
    const bannedPlayers = bannedStatsRes.count ?? 0
    const onlinePlayers = allOnlineIds.size
    const activeRate = totalPlayers > 0 ? Math.round(((totalPlayers - bannedPlayers) / totalPlayers) * 100) : 100

    const total = totalCount ?? 0
    const totalPages = Math.ceil(total / limit) || 1

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
 * GET /api/admin/leaderboard
 * Returns Top 100 players by ELO score with summary stats.
 */
export async function getLeaderboard(req: AuthRequest, res: Response): Promise<void> {
  try {
    const limit = Math.max(1, Math.min(100, parseInt((req.query.limit as string) || '100')))
    const search = ((req.query.search as string) || '').trim()

    let query = supabase
      .from('players')
      .select('id, username, elo, avatar_url, created_at, is_first_play')
      .not('email', 'ilike', '%@guest.naenra.xyz%')
      .not('email', 'ilike', 'guest_%')
      .not('username', 'ilike', 'Guest #%')
      .not('username', 'ilike', 'Guest_%')

    if (search) {
      query = query.ilike('username', `%${search}%`)
    }

    const { data: players, error } = await query
      .order('elo', { ascending: false })
      .limit(limit)

    if (error) throw error

    const { count: totalPlayers } = await supabase
      .from('players')
      .select('*', { count: 'exact', head: true })
      .not('email', 'ilike', '%@guest.naenra.xyz%')
      .not('email', 'ilike', 'guest_%')

    const playerList = players || []
    const eloSum = playerList.reduce((acc, p) => acc + (p.elo || 0), 0)
    const averageElo = playerList.length > 0 ? Math.round(eloSum / playerList.length) : 1000
    const highestElo = playerList.length > 0 ? Math.max(...playerList.map(p => p.elo || 0)) : 1000

    res.json({
      success: true,
      data: {
        players: playerList,
        totalPlayers: totalPlayers ?? playerList.length,
        averageElo,
        highestElo,
        currentSeason: 'Season 1 (Active)'
      }
    })
  } catch (error: any) {
    console.error('Error in getLeaderboard:', error)
    res.status(500).json({
      success: false,
      error: 'InternalServerError',
      message: 'Failed to fetch leaderboard data'
    })
  }
}

/**
 * POST /api/admin/season/reset
 * Bulk updates all players' ELO scores to default baseline (1000).
 * Requires exact confirmation string "CONFIRM RESET".
 */
export async function resetSeason(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { confirmText } = req.body

    if (confirmText !== 'CONFIRM RESET') {
      res.status(400).json({
        success: false,
        message: 'Security validation failed: Confirmation string must be exactly "CONFIRM RESET".'
      })
      return
    }

    const { data, error } = await supabase
      .from('players')
      .update({ elo: 0 })
      .gte('elo', 0)
      .select('id')

    if (error) throw error

    const resetCount = data ? data.length : 0

    res.json({
      success: true,
      resetCount,
      message: `Season reset executed successfully. ${resetCount} player ELO ratings reset to 0.`
    })
  } catch (error: any) {
    console.error('Error in resetSeason:', error)
    res.status(500).json({
      success: false,
      error: 'InternalServerError',
      message: 'Failed to execute season reset'
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

    const { data: targetPlayer, error: fetchErr } = await supabase
      .from('players')
      .select('id, email, username, is_admin')
      .eq('id', id)
      .single()

    if (fetchErr || !targetPlayer) {
      res.status(404).json({ success: false, message: 'Player not found' })
      return
    }

    if (targetPlayer.is_admin) {
      res.status(403).json({ success: false, message: 'Administrator accounts cannot be banned.' })
      return
    }

    const { error: updateErr } = await supabase
      .from('players')
      .update({ is_banned: true, banned_at: new Date().toISOString() })
      .eq('id', id)
    if (updateErr) throw updateErr

    const { data: versionResult } = await supabase
      .rpc('increment_session_version', { player_id: id })

    const newVersion = versionResult ?? Date.now()

    await supabase
      .from('game_sessions')
      .update({ status: 'aborted' })
      .eq('player_id', id)
      .eq('status', 'active')

    try {
      await broadcastSessionInvalidated(id, newVersion)
      kickUserClients(id, 4003)
    } catch (e) {
      console.warn('Realtime kick warning:', e)
    }

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
    if (req.user?.id === id && !is_admin) {
      res.status(400).json({ success: false, message: 'You cannot remove admin privileges from your own account.' })
      return
    }

    const { data: targetPlayer, error: fetchErr } = await supabase
      .from('players')
      .select('id, email, username, is_admin')
      .eq('id', id)
      .single()

    if (fetchErr || !targetPlayer) {
      res.status(404).json({ success: false, message: 'Player not found' })
      return
    }

    const { error: updateErr } = await supabase
      .from('players')
      .update({ is_admin })
      .eq('id', id)
    if (updateErr) throw updateErr

    const { data: versionResult } = await supabase
      .rpc('increment_session_version', { player_id: id })

    const newVersion = versionResult ?? Date.now()
    try {
      await broadcastSessionInvalidated(id, newVersion)
    } catch (e) {
      console.warn('Realtime session update warning:', e)
    }

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

// ── US-93: Match Analytics, Live Telemetry & Match History Endpoints ──────────

/**
 * GET /api/admin/matches/analytics
 * Returns aggregated match telemetry for visual charts and KPI metrics.
 * Query param: ?timeframe=7d | 30d | 12m (default: 7d)
 */
export async function getMatchAnalytics(req: AuthRequest, res: Response): Promise<void> {
  try {
    const timeframe = (req.query.timeframe as string || '7d').toLowerCase()

    // 1. Calculate time window
    const now = new Date()
    const startDate = new Date()
    let bucketFormat: 'day' | 'month' = 'day'
    let numberOfBuckets = 7

    if (timeframe === '30d') {
      startDate.setDate(now.getDate() - 30)
      bucketFormat = 'day'
      numberOfBuckets = 30
    } else if (timeframe === '12m') {
      startDate.setFullYear(now.getFullYear() - 1)
      bucketFormat = 'month'
      numberOfBuckets = 12
    } else {
      // default: 7d
      startDate.setDate(now.getDate() - 7)
      bucketFormat = 'day'
      numberOfBuckets = 7
    }

    // 2. Fetch match sessions within window
    const { data: sessions, error } = await supabase
      .from('game_sessions')
      .select('id, player_id, score, questions_answered, status, started_at, ended_at, active_core_id')
      .gte('started_at', startDate.toISOString())
      .order('started_at', { ascending: true })

    if (error) throw error

    const sessionList = sessions || []

    // 3. Fetch cores to map active_core_id to core names
    const { data: coresData } = await supabase
      .from('cores')
      .select('id, name, classification, tier')

    const coreMap = new Map<string, any>()
    for (const c of coresData || []) {
      coreMap.set(String(c.id), c)
    }

    // 4. Generate continuous time buckets so charts have complete X-axis intervals
    const bucketsMap = new Map<string, {
      date: string
      label: string
      totalMatches: number
      completedMatches: number
      abortedMatches: number
      activeMatches: number
      totalScore: number
      totalDurationSeconds: number
      durationCount: number
    }>()

    if (bucketFormat === 'day') {
      for (let i = numberOfBuckets - 1; i >= 0; i--) {
        const d = new Date(now)
        d.setDate(d.getDate() - i)
        const key = d.toISOString().split('T')[0]
        const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        bucketsMap.set(key, {
          date: key,
          label,
          totalMatches: 0,
          completedMatches: 0,
          abortedMatches: 0,
          activeMatches: 0,
          totalScore: 0,
          totalDurationSeconds: 0,
          durationCount: 0
        })
      }
    } else {
      // 12 months
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        const label = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        bucketsMap.set(key, {
          date: key,
          label,
          totalMatches: 0,
          completedMatches: 0,
          abortedMatches: 0,
          activeMatches: 0,
          totalScore: 0,
          totalDurationSeconds: 0,
          durationCount: 0
        })
      }
    }

    // Status breakdown & core popularity
    const statusCounts = {
      completed: 0,
      active: 0,
      aborted: 0,
      abandoned: 0
    }

    const coreUsageMap = new Map<string, { id: string; name: string; tier: number; count: number }>()

    let grandTotalScore = 0
    let grandTotalDurationSec = 0
    let grandDurationCount = 0

    for (const s of sessionList) {
      if (!s.started_at) continue
      const sDate = new Date(s.started_at)
      if (isNaN(sDate.getTime())) continue

      let bucketKey = ''
      if (bucketFormat === 'day') {
        bucketKey = sDate.toISOString().split('T')[0]
      } else {
        bucketKey = `${sDate.getFullYear()}-${String(sDate.getMonth() + 1).padStart(2, '0')}`
      }

      const bucket = bucketsMap.get(bucketKey)

      const isCompleted = s.status === 'timeout' || s.status === 'completed'
      const isAborted = s.status === 'aborted' || s.status === 'abandoned'
      const isActive = s.status === 'active'

      if (isCompleted) statusCounts.completed++
      else if (isAborted) {
        if (s.status === 'aborted') statusCounts.aborted++
        else statusCounts.abandoned++
      } else if (isActive) {
        statusCounts.active++
      }

      // Duration calculation in seconds
      let durationSec = 0
      if (s.ended_at && s.started_at) {
        const startT = new Date(s.started_at).getTime()
        const endT = new Date(s.ended_at).getTime()
        if (!isNaN(startT) && !isNaN(endT)) {
          const diff = (endT - startT) / 1000
          if (diff > 0 && diff < 3600) {
            durationSec = Math.round(diff)
          }
        }
      }

      const score = Number(s.score) || 0
      grandTotalScore += score
      if (durationSec > 0) {
        grandTotalDurationSec += durationSec
        grandDurationCount++
      }

      if (bucket) {
        bucket.totalMatches++
        if (isCompleted) bucket.completedMatches++
        if (isAborted) bucket.abortedMatches++
        if (isActive) bucket.activeMatches++
        bucket.totalScore += score
        if (durationSec > 0) {
          bucket.totalDurationSeconds += durationSec
          bucket.durationCount++
        }
      }

      // Track Core Popularity
      if (s.active_core_id) {
        const coreInfo = coreMap.get(String(s.active_core_id))
        const coreName = coreInfo?.name || 'Unknown Core'
        const tier = coreInfo?.tier || 1
        const existing = coreUsageMap.get(coreName) || { id: s.active_core_id, name: coreName, tier, count: 0 }
        existing.count++
        coreUsageMap.set(coreName, existing)
      }
    }

    const timeline = Array.from(bucketsMap.values()).map(b => ({
      date: b.date,
      label: b.label,
      totalMatches: b.totalMatches,
      completedMatches: b.completedMatches,
      abortedMatches: b.abortedMatches,
      activeMatches: b.activeMatches,
      avgScore: b.totalMatches > 0 ? Math.round(b.totalScore / b.totalMatches) : 0,
      avgDurationSeconds: b.durationCount > 0 ? Math.round(b.totalDurationSeconds / b.durationCount) : 0
    }))

    const topCores = Array.from(coreUsageMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)

    const totalMatchesInPeriod = sessionList.length
    const avgScoreInPeriod = totalMatchesInPeriod > 0 ? Math.round(grandTotalScore / totalMatchesInPeriod) : 0
    const avgDurationInPeriod = grandDurationCount > 0 ? Math.round(grandTotalDurationSec / grandDurationCount) : 60
    const completionRate = totalMatchesInPeriod > 0
      ? Math.round((statusCounts.completed / totalMatchesInPeriod) * 100)
      : 100

    res.json({
      success: true,
      data: {
        timeframe,
        summary: {
          totalMatches: totalMatchesInPeriod,
          avgScore: avgScoreInPeriod,
          avgDurationSeconds: avgDurationInPeriod,
          completionRate,
          statusBreakdown: statusCounts
        },
        timeline,
        topCores
      }
    })
  } catch (error: any) {
    console.error('Error in getMatchAnalytics:', error)
    res.status(500).json({
      success: false,
      error: 'InternalServerError',
      message: 'Failed to retrieve match analytics'
    })
  }
}

/**
 * GET /api/admin/cores
 * Returns list of all cores with optional filtering and KPI metrics.
 */
export async function getAdminCores(req: AuthRequest, res: Response): Promise<void> {
  try {
    const search = ((req.query.search as string) || '').trim()
    const classification = ((req.query.classification as string) || '').trim()
    const tier = req.query.tier ? parseInt(req.query.tier as string) : null
    const status = ((req.query.status as string) || 'all').toLowerCase()

    let query = supabase.from('cores').select('*')

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    if (classification && classification !== 'all') {
      query = query.ilike('classification', `%${classification}%`)
    }

    if (tier && tier >= 1 && tier <= 3) {
      query = query.eq('tier', tier)
    }

    if (status === 'active') {
      query = query.or('is_active.eq.true,is_active.is.null')
    } else if (status === 'disabled') {
      query = query.eq('is_active', false)
    }

    const { data: coresData, error } = await query.order('tier', { ascending: true }).order('name', { ascending: true })

    if (error) throw error

    const coresList = (coresData || []).map(c => ({
      id: c.id,
      name: c.name,
      description: c.description || 'No description provided.',
      classification: c.classification || c.core_type || 'Special',
      core_type: c.core_type || 'sub',
      tier: c.tier || 1,
      flat_buff: c.flat_buff ?? c.flat_bonus ?? 0,
      multiplier_buff: c.multiplier_buff ?? c.multipliers ?? 1.0,
      duration: c.duration ?? c.duration_seconds ?? 0,
      is_active: c.is_active !== false,
      icon_url: c.icon_url || null,
      upgrades_to: c.upgrades_to || null,
      created_at: c.created_at || new Date().toISOString()
    }))

    // Calculate metrics
    const totalCores = coresList.length
    const activeCores = coresList.filter(c => c.is_active).length
    const disabledCores = totalCores - activeCores

    const activeMultipliers = coresList.filter(c => c.is_active && c.multiplier_buff > 1)
    const avgMultiplier = activeMultipliers.length > 0
      ? Number((activeMultipliers.reduce((acc, c) => acc + c.multiplier_buff, 0) / activeMultipliers.length).toFixed(2))
      : 1.25

    res.json({
      success: true,
      data: {
        cores: coresList,
        stats: {
          totalCores,
          activeCores,
          disabledCores,
          avgMultiplier
        }
      }
    })
  } catch (error: any) {
    console.error('Error in getAdminCores:', error)
    res.status(500).json({
      success: false,
      error: 'InternalServerError',
      message: 'Failed to retrieve core configurations'
    })
  }
}

/**
 * POST /api/admin/cores
 * Creates a new Core configuration.
 */
export async function createCore(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { name, description, classification, tier, flat_buff, multiplier_buff, duration, is_active, icon_url, upgrades_to } = req.body

    if (!name || typeof name !== 'string') {
      res.status(400).json({ success: false, message: 'Core name is required' })
      return
    }

    const newCorePayload = {
      name: name.trim(),
      description: description || '',
      classification: classification || 'Attack',
      core_type: Number(tier) === 1 ? 'main' : 'sub',
      tier: Number(tier) || 1,
      flat_buff: Number(flat_buff) || 0,
      multiplier_buff: Number(multiplier_buff) || 1.0,
      duration: Number(duration) || 0,
      is_active: is_active !== false,
      icon_url: icon_url || null,
      upgrades_to: upgrades_to || null
    }

    const { data, error } = await supabase
      .from('cores')
      .insert(newCorePayload)
      .select()
      .single()

    if (error) throw error

    res.status(201).json({
      success: true,
      data,
      message: `Core "${name}" created successfully.`
    })
  } catch (error: any) {
    console.error('Error in createCore:', error)
    res.status(500).json({
      success: false,
      error: 'InternalServerError',
      message: 'Failed to create core configuration'
    })
  }
}

/**
 * PUT /api/admin/cores/:id
 * Updates an existing Core configuration.
 */
export async function updateCore(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = String(req.params.id || '')
    const { name, description, classification, tier, flat_buff, multiplier_buff, duration, is_active, icon_url, upgrades_to } = req.body

    if (!id) {
      res.status(400).json({ success: false, message: 'Core ID is required' })
      return
    }

    const updatePayload: Record<string, any> = {}
    if (name !== undefined) updatePayload.name = name.trim()
    if (description !== undefined) updatePayload.description = description
    if (classification !== undefined) updatePayload.classification = classification
    if (tier !== undefined) {
      updatePayload.tier = Number(tier)
      updatePayload.core_type = Number(tier) === 1 ? 'main' : 'sub'
    }
    if (flat_buff !== undefined) updatePayload.flat_buff = Number(flat_buff)
    if (multiplier_buff !== undefined) updatePayload.multiplier_buff = Number(multiplier_buff)
    if (duration !== undefined) updatePayload.duration = Number(duration)
    if (is_active !== undefined) updatePayload.is_active = Boolean(is_active)
    if (icon_url !== undefined) updatePayload.icon_url = icon_url
    if (upgrades_to !== undefined) updatePayload.upgrades_to = upgrades_to

    const { data, error } = await supabase
      .from('cores')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    res.json({
      success: true,
      data,
      message: `Core configuration updated successfully.`
    })
  } catch (error: any) {
    console.error('Error in updateCore:', error)
    res.status(500).json({
      success: false,
      error: 'InternalServerError',
      message: 'Failed to update core configuration'
    })
  }
}

/**
 * PATCH /api/admin/cores/:id/toggle
 * Instantly toggles a Core's active status (is_active).
 */
export async function toggleCoreActive(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = String(req.params.id || '')
    const { is_active } = req.body

    if (!id) {
      res.status(400).json({ success: false, message: 'Core ID is required' })
      return
    }

    let newStatus = Boolean(is_active)
    if (is_active === undefined) {
      const { data: existingCore } = await supabase
        .from('cores')
        .select('is_active')
        .eq('id', id)
        .single()
      newStatus = existingCore?.is_active === false ? true : false
    }

    const { data, error } = await supabase
      .from('cores')
      .update({ is_active: newStatus })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    res.json({
      success: true,
      data,
      message: `Core status updated: ${newStatus ? 'ENABLED' : 'DISABLED'} from drop pool.`
    })
  } catch (error: any) {
    console.error('Error in toggleCoreActive:', error)
    res.status(500).json({
      success: false,
      error: 'InternalServerError',
      message: 'Failed to toggle core active status'
    })
  }
}

/**
 * DELETE /api/admin/cores/:id
 * Deletes a core configuration from the catalog.
 */
export async function deleteCore(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = String(req.params.id || '')

    if (!id) {
      res.status(400).json({ success: false, message: 'Core ID is required' })
      return
    }

    const { error } = await supabase
      .from('cores')
      .delete()
      .eq('id', id)

    if (error) throw error

    res.json({
      success: true,
      message: 'Core configuration deleted successfully.'
    })
  } catch (error: any) {
    console.error('Error in deleteCore:', error)
    res.status(500).json({
      success: false,
      error: 'InternalServerError',
      message: 'Failed to delete core configuration'
    })
  }
}

/**
 * GET /api/admin/matches/live
 * Returns live active match sessions & concurrency stats.
 */
export async function getLiveMatchMetrics(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
    const { data: activeSessions, error } = await supabase
      .from('game_sessions')
      .select('id, player_id, score, questions_answered, started_at, active_core_id')
      .eq('status', 'active')
      .gte('started_at', fiveMinutesAgo)

    if (error) throw error

    const liveMatches = (activeSessions || []).length
    const onlineCount = getOnlineUserIds().size

    res.json({
      success: true,
      data: {
        liveMatches,
        colyseusRooms: liveMatches > 0 ? Math.ceil(liveMatches / 2) : 0,
        onlinePlayers: onlineCount,
        activeSessions: activeSessions || []
      }
    })
  } catch (error: any) {
    console.error('Error in getLiveMatchMetrics:', error)
    res.status(500).json({
      success: false,
      error: 'InternalServerError',
      message: 'Failed to retrieve live match metrics'
    })
  }
}

/**
 * GET /api/admin/matches/history
 * Returns paginated match history with search, status filtering, and player info.
 */
export async function getMatchHistory(req: AuthRequest, res: Response): Promise<void> {
  try {
    const page = Math.max(1, parseInt((req.query.page as string) || '1'))
    const limit = Math.max(1, Math.min(100, parseInt((req.query.limit as string) || '10')))
    const status = ((req.query.status as string) || 'all').toLowerCase()
    const search = ((req.query.search as string) || '').trim()

    let query = supabase
      .from('game_sessions')
      .select('*', { count: 'exact' })

    if (status !== 'all') {
      if (status === 'completed') {
        query = query.or('status.eq.completed,status.eq.timeout')
      } else if (status === 'aborted') {
        query = query.or('status.eq.aborted,status.eq.abandoned')
      } else {
        query = query.eq('status', status)
      }
    }

    const fromIndex = (page - 1) * limit
    const toIndex = fromIndex + limit - 1

    query = query.range(fromIndex, toIndex).order('started_at', { ascending: false })

    const { data: sessions, count, error } = await query

    if (error) throw error

    const sessionList = sessions || []
    const total = count ?? 0
    const totalPages = Math.ceil(total / limit) || 1

    // Collect all player IDs and core IDs to fetch their details without PostgREST foreign key join errors
    const playerIds = [...new Set(sessionList.map(s => s.player_id).filter(Boolean))]
    const coreIds = [...new Set(sessionList.map(s => s.active_core_id).filter(Boolean))]

    const playerMap = new Map<string, any>()
    if (playerIds.length > 0) {
      const { data: playersData } = await supabase
        .from('players')
        .select('id, username, email, avatar_url, elo')
        .in('id', playerIds)

      for (const p of playersData || []) {
        playerMap.set(String(p.id), p)
      }
    }

    const coreMap = new Map<string, any>()
    if (coreIds.length > 0) {
      const { data: coresData } = await supabase
        .from('cores')
        .select('id, name, classification, tier, icon_url')
        .in('id', coreIds)

      for (const c of coresData || []) {
        coreMap.set(String(c.id), c)
      }
    }

    // Format match records for client table display
    let matches = sessionList.map(s => {
      const player = playerMap.get(String(s.player_id)) || {
        id: s.player_id,
        username: 'Arena Player',
        email: '—',
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.player_id || 'Player'}`,
        elo: 1000
      }

      const core = s.active_core_id ? coreMap.get(String(s.active_core_id)) || null : null

      const startMs = s.started_at ? new Date(s.started_at).getTime() : 0
      const endMs = s.ended_at ? new Date(s.ended_at).getTime() : Date.now()
      const durationSeconds = startMs > 0 ? Math.max(0, Math.round((endMs - startMs) / 1000)) : 60

      let displayStatus = 'Completed'
      if (s.status === 'active') displayStatus = 'Active'
      else if (s.status === 'aborted' || s.status === 'abandoned') displayStatus = 'Aborted'
      else if (s.status === 'timeout') displayStatus = 'Timeout'

      return {
        id: s.id,
        score: s.score || 0,
        questions_answered: s.questions_answered || 0,
        status: displayStatus,
        raw_status: s.status,
        duration_seconds: durationSeconds,
        started_at: s.started_at,
        ended_at: s.ended_at,
        player,
        core
      }
    })

    if (search) {
      const q = search.toLowerCase()
      matches = matches.filter(m => 
        m.id.toLowerCase().includes(q) ||
        m.player.username.toLowerCase().includes(q) ||
        m.player.email.toLowerCase().includes(q)
      )
    }

    res.json({
      success: true,
      data: {
        matches,
        total,
        page,
        limit,
        totalPages
      }
    })
  } catch (error: any) {
    console.error('Error in getMatchHistory:', error)
    res.status(500).json({
      success: false,
      error: 'InternalServerError',
      message: 'Failed to retrieve match history'
    })
  }
}

/**
 * POST /api/admin/ai/generate-questions
 * Generates batches of vocabulary questions using Gemini AI (US-96 AI Operations).
 */
export async function generateAiQuestions(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { topic = 'daily-life', level = 'intermediate', count = 5 } = req.body
    const parsedCount = Math.min(Math.max(Number(count) || 5, 1), 20)
    const questions = await generateQuestions(String(topic), String(level), parsedCount)
    res.json({
      success: true,
      questions
    })
  } catch (error: any) {
    console.error('Error in generateAiQuestions:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate questions via Gemini AI'
    })
  }
}

/**
 * GET /api/admin/ai/config
 * Retrieves current dynamic AI prompt and behavior settings.
 */
export async function getAiConfigController(req: AuthRequest, res: Response): Promise<void> {
  try {
    const config = getAiBehaviorConfig()
    res.json({
      success: true,
      data: config
    })
  } catch (error: any) {
    console.error('Error in getAiConfigController:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve AI configuration'
    })
  }
}

/**
 * PUT /api/admin/ai/config
 * Updates dynamic AI prompt and behavior settings.
 */
export async function updateAiConfigController(req: AuthRequest, res: Response): Promise<void> {
  try {
    const updated = saveAiBehaviorConfig(req.body)
    res.json({
      success: true,
      data: updated,
      message: 'AI behavior and persona configuration updated successfully'
    })
  } catch (error: any) {
    console.error('Error in updateAiConfigController:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update AI configuration'
    })
  }
}

/**
 * POST /api/admin/ai/config/reset
 * Resets AI configuration to factory default behavior.
 */
export async function resetAiConfigController(req: AuthRequest, res: Response): Promise<void> {
  try {
    const reset = resetAiBehaviorConfig()
    res.json({
      success: true,
      data: reset,
      message: 'AI configuration reset to factory defaults'
    })
  } catch (error: any) {
    console.error('Error in resetAiConfigController:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to reset AI configuration'
    })
  }
}




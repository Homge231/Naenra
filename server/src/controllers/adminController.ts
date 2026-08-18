import { Response } from 'express'
import { matchMaker } from 'colyseus'
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
      const sDate = new Date(s.started_at)
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
        const diff = (new Date(s.ended_at).getTime() - new Date(s.started_at).getTime()) / 1000
        if (diff > 0 && diff < 3600) {
          durationSec = Math.round(diff)
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
 * GET /api/admin/matches/live
 * Real-time counter of active matches (Colyseus live match rooms + DB active sessions).
 */
export async function getLiveMatchMetrics(_req: AuthRequest, res: Response): Promise<void> {
  try {
    let colyseusRoomsCount = 0
    try {
      const matchRooms = await matchMaker.query({ name: 'match_room' })
      colyseusRoomsCount = matchRooms.length
    } catch {
      // In standalone dev or when matchMaker query is unsupported
    }

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
    const { count: dbActiveSessions } = await supabase
      .from('game_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      .gte('updated_at', fiveMinutesAgo)

    const onlineUserIds = getOnlineUserIds()
    const liveActiveMatches = Math.max(colyseusRoomsCount, dbActiveSessions ?? 0)

    res.json({
      success: true,
      data: {
        liveMatches: liveActiveMatches,
        colyseusRooms: colyseusRoomsCount,
        dbActiveSessions: dbActiveSessions ?? 0,
        onlinePlayers: onlineUserIds.size,
        timestamp: new Date().toISOString()
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
 * Returns paginated list of match logs joining player profile and equipped core.
 * Query params: ?page=1&limit=10&search=&status=&sortBy=started_at&sortOrder=desc
 */
export async function getMatchHistory(req: AuthRequest, res: Response): Promise<void> {
  try {
    const page = Math.max(1, parseInt((req.query.page as string) || '1'))
    const limit = Math.max(1, Math.min(100, parseInt((req.query.limit as string) || '10')))
    const search = ((req.query.search as string) || '').trim()
    const status = ((req.query.status as string) || 'all').toLowerCase()
    const sortBy = ((req.query.sortBy as string) || 'started_at')
    const sortOrder = ((req.query.sortOrder as string) || 'desc').toLowerCase() === 'asc'

    let matchingPlayerIds: string[] | null = null
    let matchById: string | null = null

    if (search) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(search)
      if (isUuid) {
        matchById = search
      } else {
        const { data: matchedPlayers } = await supabase
          .from('players')
          .select('id')
          .or(`username.ilike.%${search}%,email.ilike.%${search}%`)
          .limit(50)

        matchingPlayerIds = (matchedPlayers || []).map(p => p.id)
      }
    }

    let query = supabase
      .from('game_sessions')
      .select('*', { count: 'exact' })

    if (matchById) {
      query = query.or(`id.eq.${matchById},player_id.eq.${matchById}`)
    } else if (matchingPlayerIds !== null) {
      if (matchingPlayerIds.length > 0) {
        query = query.in('player_id', matchingPlayerIds)
      } else {
        query = query.eq('id', '00000000-0000-0000-0000-000000000000')
      }
    }

    if (status === 'completed' || status === 'timeout') {
      query = query.in('status', ['timeout', 'completed'])
    } else if (status === 'active') {
      query = query.eq('status', 'active')
    } else if (status === 'aborted' || status === 'abandoned') {
      query = query.in('status', ['aborted', 'abandoned'])
    }

    const sortColumn = ['started_at', 'score', 'questions_answered'].includes(sortBy)
      ? sortBy
      : 'started_at'

    const fromIndex = (page - 1) * limit
    const toIndex = fromIndex + limit - 1

    query = query.order(sortColumn, { ascending: sortOrder }).range(fromIndex, toIndex)

    const { data: sessionsData, count, error } = await query

    if (error) throw error

    const total = count ?? 0
    const totalPages = Math.ceil(total / limit) || 1
    const rawSessions = sessionsData || []

    const playerIds = Array.from(new Set(rawSessions.map(s => s.player_id).filter(Boolean)))
    const coreIds = Array.from(new Set(rawSessions.map(s => s.active_core_id).filter(Boolean)))

    const [playersRes, coresRes] = await Promise.all([
      playerIds.length > 0
        ? supabase.from('players').select('id, username, email, avatar_url, elo').in('id', playerIds)
        : Promise.resolve({ data: [] }),
      coreIds.length > 0
        ? supabase.from('cores').select('id, name, classification, tier, icon_url').in('id', coreIds)
        : Promise.resolve({ data: [] })
    ])

    const playerMap = new Map<string, any>()
    for (const p of playersRes.data || []) {
      playerMap.set(p.id, p)
    }

    const coreMap = new Map<string, any>()
    for (const c of coresRes.data || []) {
      coreMap.set(c.id, c)
    }

    const mappedMatches = rawSessions.map(s => {
      const player = playerMap.get(s.player_id)
      const core = s.active_core_id ? coreMap.get(s.active_core_id) : null

      let durationSec = 0
      if (s.started_at) {
        const start = new Date(s.started_at).getTime()
        const end = s.ended_at ? new Date(s.ended_at).getTime() : (s.updated_at ? new Date(s.updated_at).getTime() : Date.now())
        durationSec = Math.max(0, Math.round((end - start) / 1000))
      }

      const isCompleted = s.status === 'timeout' || s.status === 'completed'
      const displayStatus = isCompleted ? 'completed' : s.status

      return {
        id: s.id,
        score: s.score ?? 0,
        questions_answered: s.questions_answered ?? 0,
        status: displayStatus,
        raw_status: s.status,
        duration_seconds: durationSec,
        started_at: s.started_at,
        ended_at: s.ended_at,
        player: {
          id: s.player_id,
          username: player?.username || 'Anonymous Player',
          email: player?.email || '',
          avatar_url: player?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(player?.username || 'Player')}`,
          elo: player?.elo ?? 1000
        },
        core: core ? {
          id: core.id,
          name: core.name,
          classification: core.classification,
          tier: core.tier,
          icon_url: core.icon_url
        } : null
      }
    })

    res.json({
      success: true,
      data: {
        matches: mappedMatches,
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


import { Response } from 'express'
import { createClient } from '@supabase/supabase-js'
import { AuthRequest } from '../middleware/authMiddleware'
import { generateCoachAnalysis, generateChatResponse, generateChatResponseStream } from '../services/aiService'
import dotenv from 'dotenv'
dotenv.config()

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
)

import { getRankFromElo } from '../utils/ranks'

export const getUserProfile = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { data: profile, error } = await supabase
      .from('players')
      .select('username, avatar_url, elo, wins, losses, total_matches, is_first_play, role, is_admin')
      .eq('id', req.user!.id)
      .maybeSingle()

    if (error) {
      console.error('getUserProfile query error:', error)
      return res.status(400).json({ error: error.message })
    }

    const { data: { user } } = await supabase.auth.admin.getUserById(req.user!.id)
    const userMeta = user?.user_metadata || {}
    const gmailAvatar = userMeta.avatar_url || userMeta.picture || ''

    const username = profile?.username || userMeta.full_name || 'Player'
    const finalAvatar = profile?.avatar_url?.trim()
      ? profile.avatar_url
      : gmailAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`

    const elo = profile?.elo ?? 0

    // Fetch all cores to filter by default locked list
    const { data: allDBCores } = await supabase
      .from('cores')
      .select('id, name, tier, core_type')

    const DEFAULT_LOCKED_CORES = new Set([
      // 40 Support Cores strictly locked behind gameplay missions (4 per family across 10 families = 1/3 of all upgrades)
      'combo burst', 'combo shield', 'hyper combo', 'super combo',
      'velocity shield', 'speed demon', 'hyperdrive', 'sonic boom',
      'inner eye', 'future sight', 'prophecy', 'cosmic wisdom',
      'contract hunter', 'bounty hunter', 'mission legend', 'apex predator',
      'reflective barrier', 'fortress aegis', 'aegis sanctuary', 'spiked shield',
      'zen momentum', 'equilibrium', 'serenity', 'nirvana',
      'overcharge', 'power surge', 'cataclysm', 'absolute power',
      'wild card', 'chaos prism', 'pandora overdrive', 'chaos theory',
      'feather shield', 'rebirth', 'phoenix overlord', 'eternal rebirth',
      'high stakes', 'safe bet', 'casino empire', 'russian roulette'
    ])

    const baseCoreIds = (allDBCores || [])
      .filter((c: any) => {
        const isBaseCore = c.tier === 1 || c.core_type === 'main'
        const nameKey = String(c.name || '').trim().toLowerCase()
        
        // Tier 1 / Main is always unlocked
        if (isBaseCore) return true
        
        // Otherwise, unlock if it is NOT in DEFAULT_LOCKED_CORES
        return !DEFAULT_LOCKED_CORES.has(nameKey)
      })
      .map((c: any) => String(c.id))


    // Fetch user unlocked cores from user_core_progress table
    const { data: userUnlockedProgress } = await supabase
      .from('user_core_progress')
      .select('core_id')
      .eq('user_id', req.user!.id)
      .eq('is_unlocked', true)

    const userUnlockedIds = (userUnlockedProgress || []).map((p: any) => String(p.core_id))

    // Merge unique unlocked core IDs
    const unlockedCoreIds = Array.from(new Set([...baseCoreIds, ...userUnlockedIds]))

    const isAdmin = (profile as any)?.is_admin === true || 
                    (profile as any)?.role === 'admin' || 
                    userMeta.is_admin === true || 
                    userMeta.role === 'admin' || 
                    user?.email?.toLowerCase().includes('admin') ||
                    username.toLowerCase().includes('admin') || false

    const role = isAdmin ? 'admin' : ((profile as any)?.role || 'user')

    return res.status(200).json({
      id: req.user!.id,
      username,
      avatar_url: finalAvatar,
      elo,
      rank: getRankFromElo(elo),
      wins: profile?.wins ?? 0,
      losses: profile?.losses ?? 0,
      total_matches: profile?.total_matches ?? 0,
      is_first_play: profile?.is_first_play ?? true,
      role,
      is_admin: isAdmin,
      unlocked_core_ids: unlockedCoreIds
    })
  } catch (error) {
    console.error('getUserProfile error:', error)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}

export const updateUserProfile = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { username, avatar_url } = req.body

    if (!username && !avatar_url) {
      return res.status(400).json({ error: 'Nothing to update' })
    }

    const updates: any = {}
    if (username?.trim()) updates.username = username.trim()

    if (avatar_url?.trim()) {
      let finalAvatarToSave = avatar_url.trim()

      // If it's a new base64 upload, store it in the avatars bucket
      if (finalAvatarToSave.startsWith('data:image')) {
        try {
          const match = finalAvatarToSave.match(/^data:image\/(\w+);base64,/)
          const ext = match ? match[1] : 'png'
          const base64Data = finalAvatarToSave.replace(/^data:image\/\w+;base64,/, '')
          const buffer = Buffer.from(base64Data, 'base64')

          const filePath = `${req.user!.id}/avatar.${ext}`

          const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, buffer, {
              contentType: `image/${ext}`,
              upsert: true
            })

          if (uploadError) {
            console.error('Avatar upload error:', uploadError)
            return res.status(500).json({ error: 'Failed to upload avatar to storage' })
          }

          const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath)

          // Append timestamp to bypass browser cache on updates
          finalAvatarToSave = `${publicUrl}?t=${Date.now()}`
        } catch (uploadErr) {
          console.error('Avatar processing error:', uploadErr)
          return res.status(500).json({ error: 'Failed to process avatar image' })
        }
      }

      updates.avatar_url = finalAvatarToSave
    }

    const { data, error } = await supabase
      .from('players')
      .update(updates)
      .eq('id', req.user!.id)
      .select('username, avatar_url, elo, wins, losses, total_matches')
      .single()

    if (error) {
      console.error('updateUserProfile query error:', error)
      return res.status(400).json({ error: error.message })
    }

    const elo = data?.elo ?? 0
    const finalUsername = data.username || 'Player'
    const finalAvatar = data.avatar_url?.trim()
      ? data.avatar_url
      : `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(finalUsername)}`

    return res.status(200).json({
      message: 'Profile updated',
      profile: {
        username: finalUsername,
        avatar_url: finalAvatar,
        elo,
        rank: getRankFromElo(elo),
        wins: data.wins ?? 0,
        losses: data.losses ?? 0,
        total_matches: data.total_matches ?? 0
      }
    })
  } catch (error) {
    console.error('updateUserProfile error:', error)
  }
}

export const getAiCoachAnalysis = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { analyticsData, message, history } = req.body
    const username = req.user?.username || req.user?.email?.split('@')[0] || 'Player'

    const analysis = await generateCoachAnalysis(username, analyticsData || [], message, history)
    return res.status(200).json({ analysis })
  } catch (error: any) {
    console.error('getAiCoachAnalysis error:', error)
    return res.status(500).json({ error: error.message || 'Failed to generate AI analysis' })
  }
}

export const getAiChatResponse = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { prompt, history, playerHistory } = req.body

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({ error: 'prompt is required' })
    }

    const username = req.user?.username || req.user?.email?.split('@')[0] || 'Player'
    const reply = await generateChatResponse(username, prompt.trim(), history, playerHistory)
    return res.status(200).json({ reply })
  } catch (error: any) {
    console.error('getAiChatResponse error:', error)
    return res.status(500).json({ error: error.message || 'Failed to get AI response' })
  }
}

export const getAiChatResponseStream = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { prompt, history, playerHistory } = req.body

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({ error: 'prompt is required' })
    }

    const username = req.user?.username || req.user?.email?.split('@')[0] || 'Player'
    // generateChatResponseStream manages SSE headers and response lifecycle internally
    await generateChatResponseStream(username, prompt.trim(), res, history, playerHistory)
  } catch (error: any) {
    console.error('getAiChatResponseStream error:', error)
    if (!res.headersSent) {
      return res.status(500).json({ error: error.message || 'Failed to stream AI response' })
    }
  }
}

export const getLeaderboard = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const currentUserId = req.user?.id
    if (!currentUserId) return res.status(401).json({ error: 'Unauthorized' })

    // Fetch top 50 non-guest players
    const { data: topPlayersRaw, error: topError } = await supabase
      .from('players')
      .select('id, username, avatar_url, elo, email')
      .not('username', 'ilike', 'Guest %')
      .not('username', 'ilike', 'Guest#%')
      .not('email', 'ilike', '%@guest.naenra.xyz')
      .order('elo', { ascending: false })
      .limit(50)

    if (topError) throw topError

    // Secondary safety check to guarantee no guest user is included
    const topPlayers = (topPlayersRaw || []).filter(p => {
      const uname = (p.username || '').toLowerCase()
      const email = (p.email || '').toLowerCase()
      const isGuestUser = uname.startsWith('guest #') || uname.startsWith('guest_') || email.endsWith('@guest.naenra.xyz')
      return !isGuestUser
    })

    // Fetch current user's profile to get their elo
    const { data: currentUser, error: userError } = await supabase
      .from('players')
      .select('id, username, avatar_url, elo, email')
      .eq('id', currentUserId)
      .single()

    if (userError) throw userError

    const isCurrentGuest = req.user?.isGuest || 
                           (currentUser.username || '').toLowerCase().startsWith('guest #') || 
                           (currentUser.email || '').toLowerCase().endsWith('@guest.naenra.xyz')

    let userRank: number | string = '-'
    if (!isCurrentGuest) {
      // Calculate current user's rank among non-guest players
      const { count, error: countError } = await supabase
        .from('players')
        .select('*', { count: 'exact', head: true })
        .not('username', 'ilike', 'Guest %')
        .not('username', 'ilike', 'Guest#%')
        .not('email', 'ilike', '%@guest.naenra.xyz')
        .gt('elo', currentUser.elo)

      if (countError) throw countError
      userRank = (count || 0) + 1
    }

    return res.status(200).json({
      topPlayers,
      currentUser: {
        ...currentUser,
        rank: userRank
      }
    })
  } catch (error: any) {
    console.error('getLeaderboard error:', error)
    return res.status(500).json({ error: error.message || 'Failed to fetch leaderboard' })
  }
}

// ── US-88: Core Progress Cloud Sync Endpoints ─────────────────────────────────

export const getUserCoreProgress = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })

    // Fetch user progress rows
    const { data: progressRows, error: pErr } = await supabase
      .from('user_core_progress')
      .select('core_id, current_progress, is_unlocked, unlocked_at')
      .eq('user_id', userId)

    if (pErr) throw pErr

    // Fetch all cores
    const { data: allCores, error: cErr } = await supabase
      .from('cores')
      .select('id, name, classification, tier, description, flat_buff, multiplier_buff, icon_url')

    if (cErr) throw cErr

    // Fetch all core missions
    const { data: allMissions, error: mErr } = await supabase
      .from('core_missions')
      .select('id, core_id, mission_type, target_value, description')

    if (mErr) throw mErr

    const progressMap = new Map<string, any>()
    for (const p of progressRows || []) {
      progressMap.set(String(p.core_id), p)
    }

    const missionMap = new Map<string, any>()
    for (const m of allMissions || []) {
      missionMap.set(String(m.core_id), m)
    }

    const unlockedCoreNames: string[] = []
    const unlockedCoreIds: string[] = []
    const missions: any[] = []

    for (const core of allCores || []) {
      const coreId = String(core.id)
      const coreName = String(core.name || '').trim()
      const isBase = core.tier === 1 || core.classification === 'main'
      const p = progressMap.get(coreId)
      const m = missionMap.get(coreId)

      const isUnlocked = isBase || Boolean(p?.is_unlocked)
      if (isUnlocked) {
        unlockedCoreNames.push(coreName)
        unlockedCoreIds.push(coreId)
      }

      if (!isBase) {
        const targetValue = Math.max(1, Number(m?.target_value || 10))
        const currentProg = p ? Number(p.current_progress || 0) : 0
        missions.push({
          missionId: m?.id || `mission_${coreId}`,
          coreId,
          coreName,
          title: m?.description || `${coreName} Mission`,
          description: m?.description || `Complete gameplay tasks to unlock ${coreName}.`,
          missionType: m?.mission_type || 'matches_played',
          targetCount: targetValue,
          currentProgress: isUnlocked ? targetValue : Math.min(targetValue, currentProg),
          isCompleted: isUnlocked || currentProg >= targetValue,
          isUnlocked,
          unlockedAt: p?.unlocked_at || null,
          tier: core.tier || 2,
          iconUrl: core.icon_url
        })
      }
    }

    return res.status(200).json({
      unlockedCoreNames: Array.from(new Set(unlockedCoreNames)),
      unlockedCoreIds: Array.from(new Set(unlockedCoreIds)),
      missions
    })
  } catch (error: any) {
    console.error('getUserCoreProgress error:', error)
    return res.status(500).json({ error: error.message || 'Failed to fetch core progress' })
  }
}

export const claimCoreMission = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })

    const { coreId, coreName } = req.body
    if (!coreId && !coreName) {
      return res.status(400).json({ error: 'coreId or coreName is required' })
    }

    // Resolve core
    let query = supabase.from('cores').select('id, name, tier, classification')
    if (coreId) {
      query = query.eq('id', coreId)
    } else {
      query = query.ilike('name', String(coreName).trim())
    }
    const { data: core, error: cErr } = await query.maybeSingle()
    if (cErr || !core) {
      return res.status(404).json({ error: 'Core not found' })
    }

    // Fetch target value from core_missions
    const { data: mission } = await supabase
      .from('core_missions')
      .select('target_value')
      .eq('core_id', core.id)
      .maybeSingle()

    const targetValue = Math.max(1, Number(mission?.target_value || 10))

    // Fetch existing user progress to validate completion
    const { data: existingProgress } = await supabase
      .from('user_core_progress')
      .select('current_progress, is_unlocked, unlocked_at')
      .eq('user_id', userId)
      .eq('core_id', core.id)
      .maybeSingle()

    const currentProg = Number(existingProgress?.current_progress || 0)
    const isAlreadyUnlocked = Boolean(existingProgress?.is_unlocked)
    const clientTargetCount = Number(req.body.targetCount) || 0
    const isCompleted = req.body.isCompleted === true

    const isTargetMet = isAlreadyUnlocked || 
                        isCompleted || 
                        (clientTargetCount > 0 && currentProg >= clientTargetCount) || 
                        (currentProg >= targetValue)

    if (!isAlreadyUnlocked && !isTargetMet) {
      return res.status(400).json({
        error: `Mission not completed yet. Progress: ${currentProg}/${targetValue}`,
        currentProgress: currentProg,
        targetValue
      })
    }

    // Upsert as unlocked in user_core_progress
    const now = new Date().toISOString()
    const finalProg = Math.max(targetValue, clientTargetCount, currentProg)
    const { error: upsertErr } = await supabase
      .from('user_core_progress')
      .upsert({
        user_id: userId,
        core_id: core.id,
        current_progress: finalProg,
        is_unlocked: true,
        unlocked_at: existingProgress?.unlocked_at || now,
        updated_at: now
      }, { onConflict: 'user_id,core_id' })

    if (upsertErr) throw upsertErr

    return res.status(200).json({
      success: true,
      coreId: core.id,
      coreName: core.name,
      isUnlocked: true,
      unlockedAt: existingProgress?.unlocked_at || now
    })
  } catch (error: any) {
    console.error('claimCoreMission error:', error)
    return res.status(500).json({ error: error.message || 'Failed to claim core mission' })
  }
}

export const syncCoreProgress = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })

    const { progressList } = req.body
    if (!Array.isArray(progressList) || progressList.length === 0) {
      return res.status(200).json({ message: 'No progress items to sync' })
    }

    // Fetch all cores to map by name or id
    const { data: allCores } = await supabase
      .from('cores')
      .select('id, name')

    const coreNameMap = new Map<string, string>()
    const coreIdMap = new Set<string>()
    for (const c of allCores || []) {
      coreNameMap.set(String(c.name).toLowerCase().trim(), String(c.id))
      coreIdMap.add(String(c.id))
    }

    // Fetch existing progress
    const { data: existingProgress } = await supabase
      .from('user_core_progress')
      .select('core_id, current_progress, is_unlocked, unlocked_at')
      .eq('user_id', userId)

    const existingMap = new Map<string, any>()
    for (const p of existingProgress || []) {
      existingMap.set(String(p.core_id), p)
    }

    const now = new Date().toISOString()
    const upserts = []

    for (const item of progressList) {
      let resolvedCoreId = item.coreId
      if (!resolvedCoreId && item.coreName) {
        resolvedCoreId = coreNameMap.get(String(item.coreName).toLowerCase().trim())
      }
      if (!resolvedCoreId || !coreIdMap.has(resolvedCoreId)) continue

      const existing = existingMap.get(resolvedCoreId)
      const incomingProgress = Number(item.currentProgress || 0)
      const existingProgressVal = existing ? Number(existing.current_progress || 0) : 0
      const finalProgress = Math.max(existingProgressVal, incomingProgress)
      
      const isUnlocked = Boolean(existing?.is_unlocked) || Boolean(item.isClaimed || item.isUnlocked)

      upserts.push({
        user_id: userId,
        core_id: resolvedCoreId,
        current_progress: finalProgress,
        is_unlocked: isUnlocked,
        unlocked_at: isUnlocked ? (existing?.unlocked_at || now) : null,
        updated_at: now
      })
    }

    if (upserts.length > 0) {
      const { error: upsertErr } = await supabase
        .from('user_core_progress')
        .upsert(upserts, { onConflict: 'user_id,core_id' })

      if (upsertErr) throw upsertErr
    }

    return res.status(200).json({ success: true, syncedCount: upserts.length })
  } catch (error: any) {
    console.error('syncCoreProgress error:', error)
    return res.status(500).json({ error: error.message || 'Failed to sync core progress' })
  }
}
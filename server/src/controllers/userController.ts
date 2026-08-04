import { Response } from 'express'
import { createClient } from '@supabase/supabase-js'
import { AuthRequest } from '../middleware/authMiddleware'
import { generateCoachAnalysis, generateChatResponse } from '../services/aiService'
import dotenv from 'dotenv'
dotenv.config()

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
)

function getRankFromElo(elo: number): string {
  if (elo >= 8000) return 'Grandmaster'
  if (elo >= 7500) return 'Master'
  if (elo >= 7000) return 'Diamond III'
  if (elo >= 6500) return 'Diamond II'
  if (elo >= 6000) return 'Diamond I'
  if (elo >= 5500) return 'Platinum III'
  if (elo >= 5000) return 'Platinum II'
  if (elo >= 4500) return 'Platinum I'
  if (elo >= 4000) return 'Gold III'
  if (elo >= 3500) return 'Gold II'
  if (elo >= 3000) return 'Gold I'
  if (elo >= 2500) return 'Silver III'
  if (elo >= 2000) return 'Silver II'
  if (elo >= 1500) return 'Silver I'
  if (elo >= 1000) return 'Bronze III'
  if (elo >= 500) return 'Bronze II'
  return 'Bronze I'
}

export const getUserProfile = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { data: profile, error } = await supabase
      .from('players')
      .select('username, avatar_url, elo, wins, losses, total_matches, is_first_play')
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
      // Round 2 (Tier 2) default locked
      'combo burst', 'velocity shield', 'inner eye', 'contract hunter', 
      'reflective barrier', 'zen momentum', 'overcharge', 'wild card', 
      'feather shield', 'high stakes',
      
      // Round 3 (Tier 3) default locked
      'hyper combo', 'hyperdrive', 'prophecy', 'mission legend', 
      'aegis sanctuary', 'serenity', 'cataclysm', 'pandora overdrive', 
      'phoenix overlord', 'casino empire'
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
    const { prompt, history } = req.body

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({ error: 'prompt is required' })
    }

    const username = req.user?.username || req.user?.email?.split('@')[0] || 'Player'
    const reply = await generateChatResponse(username, prompt.trim(), history)
    return res.status(200).json({ reply })
  } catch (error: any) {
    console.error('getAiChatResponse error:', error)
    return res.status(500).json({ error: error.message || 'Failed to get AI response' })
  }
}

export const getLeaderboard = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const currentUserId = req.user?.id
    if (!currentUserId) return res.status(401).json({ error: 'Unauthorized' })

    // Fetch top 50 players
    const { data: topPlayers, error: topError } = await supabase
      .from('players')
      .select('id, username, avatar_url, elo')
      .order('elo', { ascending: false })
      .limit(50)

    if (topError) throw topError

    // Fetch current user's profile to get their elo
    const { data: currentUser, error: userError } = await supabase
      .from('players')
      .select('id, username, avatar_url, elo')
      .eq('id', currentUserId)
      .single()

    if (userError) throw userError

    // Calculate current user's rank
    // Count how many players have an elo STRICTLY GREATER than the current user's elo
    const { count, error: countError } = await supabase
      .from('players')
      .select('*', { count: 'exact', head: true })
      .gt('elo', currentUser.elo)

    if (countError) throw countError

    // The rank is the number of people with higher elo + 1
    const userRank = (count || 0) + 1

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
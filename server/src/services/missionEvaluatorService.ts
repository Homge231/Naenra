import { supabase } from '../config/supabase'

export interface PostMatchStats {
  userId: string
  score: number
  questionsAnswered: number
  accuracy: number
  isWin: boolean
  activeCoreName?: string
  activeCoreFamily?: string
}

export interface MissionProgressUpdate {
  coreId: string
  coreName: string
  title: string
  oldProgress: number
  newProgress: number
  targetProgress: number
  isUnlocked: boolean
}

export interface UnlockedCoreDetail {
  id: string
  name: string
  classification: string
  tier: number
  description: string
  flat_buff: number
  multiplier_buff: number
  icon_url?: string
}

/**
 * US-74: Mission Evaluator Engine
 * Evaluates user active missions after a match, updates `user_core_progress` table,
 * sets `is_unlocked = true` when progress reaches 100%, and returns updates & unlocked core details.
 */
export async function evaluatePostMatchMissions(
  stats: PostMatchStats
): Promise<{
  newlyUnlockedCores: UnlockedCoreDetail[]
  progressUpdates: MissionProgressUpdate[]
}> {
  const { userId, score, questionsAnswered, accuracy, isWin, activeCoreName, activeCoreFamily } = stats
  if (!userId) {
    return { newlyUnlockedCores: [], progressUpdates: [] }
  }

  try {
    // 1. Fetch user core progress entries joined with cores
    const { data: progressEntries, error: fetchErr } = await supabase
      .from('user_core_progress')
      .select('id, core_id, current_progress, target_progress, is_unlocked, cores(id, name, classification, tier, description, flat_buff, multiplier_buff, icon_url)')
      .eq('user_id', userId)

    if (fetchErr) {
      console.warn('[MissionEvaluator] Error fetching user_core_progress:', fetchErr.message)
    }

    // Also fetch all locked cores to seed missing progress rows if needed
    const { data: allCores } = await supabase
      .from('cores')
      .select('id, name, classification, tier, description, flat_buff, multiplier_buff, icon_url')

    const existingProgressMap = new Map<string, any>()
    if (progressEntries) {
      for (const entry of progressEntries) {
        existingProgressMap.set(String(entry.core_id), entry)
      }
    }

    const newlyUnlockedCores: UnlockedCoreDetail[] = []
    const progressUpdates: MissionProgressUpdate[] = []

    const coreList = allCores || []

    for (const core of coreList) {
      const coreId = String(core.id)
      const coreName = String(core.name || '').trim()
      const coreNameLower = coreName.toLowerCase()
      const isBaseCore = core.tier === 1 || core.classification === 'main'

      // Base cores are unlocked by default, skip
      if (isBaseCore) continue

      let entry = existingProgressMap.get(coreId)
      let currentProgress = entry ? Number(entry.current_progress || 0) : 0
      let isUnlocked = entry ? Boolean(entry.is_unlocked) : false
      const targetProgress = entry ? Number(entry.target_progress || 10) : 10

      // If already unlocked, skip evaluation
      if (isUnlocked) continue

      // Calculate progress delta based on match stats & core family criteria
      let delta = 0
      const activeFamilyLower = (activeCoreFamily || '').toLowerCase()

      if (coreNameLower.includes('combo')) {
        // Progress on match completion with high accuracy or questions answered
        if (questionsAnswered >= 5) delta = 1
      } else if (coreNameLower.includes('oracle') || coreNameLower.includes('prophecy')) {
        // Progress on matches played with accuracy >= 80%
        if (accuracy >= 80) delta = 1
      } else if (coreNameLower.includes('aegis') || coreNameLower.includes('shield') || coreNameLower.includes('serenity')) {
        // Progress on wins or defense core usage
        if (isWin || activeFamilyLower.includes('aegis')) delta = 1
      } else if (coreNameLower.includes('pandora') || coreNameLower.includes('cataclysm')) {
        // Progress on high score matches (score >= 1000)
        if (score >= 1000) delta = 1
      } else if (coreNameLower.includes('phoenix') || coreNameLower.includes('overlord')) {
        // Progress on wins
        if (isWin) delta = 1
      } else if (coreNameLower.includes('casino') || coreNameLower.includes('high roller')) {
        // Progress on match played
        delta = 1
      } else {
        // Generic mission progress increment per completed match
        delta = 1
      }

      if (delta > 0) {
        const oldProgress = currentProgress
        const newProgress = Math.min(targetProgress, currentProgress + delta)
        const newlyUnlocked = newProgress >= targetProgress

        // Update database
        if (entry) {
          await supabase
            .from('user_core_progress')
            .update({
              current_progress: newProgress,
              is_unlocked: newlyUnlocked,
              updated_at: new Date().toISOString()
            })
            .eq('id', entry.id)
        } else {
          await supabase
            .from('user_core_progress')
            .insert({
              user_id: userId,
              core_id: coreId,
              current_progress: newProgress,
              target_progress: targetProgress,
              is_unlocked: newlyUnlocked
            })
        }

        progressUpdates.push({
          coreId,
          coreName,
          title: `${coreName} Mission`,
          oldProgress,
          newProgress,
          targetProgress,
          isUnlocked: newlyUnlocked
        })

        if (newlyUnlocked) {
          newlyUnlockedCores.push({
            id: coreId,
            name: coreName,
            classification: core.classification || 'Effect',
            tier: core.tier || 2,
            description: core.description || 'Newly unlocked Support Core',
            flat_buff: core.flat_buff || 0,
            multiplier_buff: core.multiplier_buff || 1.0,
            icon_url: core.icon_url
          })
        }
      }
    }

    return { newlyUnlockedCores, progressUpdates }
  } catch (error) {
    console.error('[MissionEvaluator] Error in evaluatePostMatchMissions:', error)
    return { newlyUnlockedCores: [], progressUpdates: [] }
  }
}

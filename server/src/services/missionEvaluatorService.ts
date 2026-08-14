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
    // 1. Fetch user core progress entries
    const { data: progressEntries, error: fetchErr } = await supabase
      .from('user_core_progress')
      .select('user_id, core_id, current_progress, is_unlocked, unlocked_at')
      .eq('user_id', userId)

    if (fetchErr) {
      console.warn('[MissionEvaluator] Error fetching user_core_progress:', fetchErr.message)
    }

    const existingProgressMap = new Map<string, any>()
    if (progressEntries) {
      for (const entry of progressEntries) {
        existingProgressMap.set(String(entry.core_id), entry)
      }
    }

    // 2. Fetch all core missions joined with core details
    const { data: allMissions, error: missionsErr } = await supabase
      .from('core_missions')
      .select('id, core_id, mission_type, target_value, description, cores:core_id(id, name, classification, tier, description, flat_buff, multiplier_buff, icon_url)')

    if (missionsErr) {
      console.warn('[MissionEvaluator] Error fetching core_missions:', missionsErr.message)
    }

    const newlyUnlockedCores: UnlockedCoreDetail[] = []
    const progressUpdates: MissionProgressUpdate[] = []

    const missionList = allMissions || []

    for (const item of missionList) {
      const core: any = Array.isArray(item.cores) ? item.cores[0] : item.cores
      if (!core) continue

      const coreId = String(core.id)
      const coreName = String(core.name || '').trim()
      const coreNameLower = coreName.toLowerCase()
      const isBaseCore = core.tier === 1 || core.classification === 'main'

      // Base cores are unlocked by default, skip
      if (isBaseCore) continue

      const entry = existingProgressMap.get(coreId)
      const currentProgress = entry ? Number(entry.current_progress || 0) : 0
      const isUnlocked = entry ? Boolean(entry.is_unlocked) : false
      const targetProgress = Math.max(1, Number(item.target_value || 10))

      // If already unlocked, skip evaluation
      if (isUnlocked) continue

      // Calculate progress delta based on match stats & core criteria
      let delta = 0
      const missionType = String(item.mission_type || '').toLowerCase()
      const activeFamilyLower = (activeCoreFamily || '').toLowerCase()

      if (missionType === 'matches_played' || missionType === 'games_played') {
        delta = 1
      } else if (missionType === 'words_typed' || missionType === 'correct_answers') {
        delta = Math.max(1, questionsAnswered)
      } else if (missionType === 'score_reach' || missionType === 'high_score') {
        if (score >= targetProgress) delta = targetProgress - currentProgress
      } else if (missionType === 'accuracy_streak' || missionType === 'high_accuracy') {
        if (accuracy >= 80) delta = 1
      } else if (missionType === 'win_match' || missionType === 'matches_won') {
        if (isWin) delta = 1
      } else if (coreNameLower.includes('combo')) {
        if (questionsAnswered >= 5) delta = 1
      } else if (coreNameLower.includes('oracle') || coreNameLower.includes('prophecy')) {
        if (accuracy >= 80) delta = 1
      } else if (coreNameLower.includes('aegis') || coreNameLower.includes('shield')) {
        if (isWin || activeFamilyLower.includes('aegis')) delta = 1
      } else if (coreNameLower.includes('pandora') || coreNameLower.includes('cataclysm')) {
        if (score >= 800) delta = 1
      } else if (coreNameLower.includes('phoenix') || coreNameLower.includes('overlord')) {
        if (isWin) delta = 1
      } else {
        // Default: 1 progress point per completed match
        delta = 1
      }

      if (delta > 0) {
        const oldProgress = currentProgress
        const newProgress = Math.min(targetProgress, currentProgress + delta)
        const newlyUnlocked = newProgress >= targetProgress

        // Upsert database record with composite primary key (user_id, core_id)
        const { error: upsertErr } = await supabase
          .from('user_core_progress')
          .upsert({
            user_id: userId,
            core_id: coreId,
            current_progress: newProgress,
            is_unlocked: newlyUnlocked || isUnlocked,
            unlocked_at: newlyUnlocked ? new Date().toISOString() : (entry?.unlocked_at || null),
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id,core_id' })

        if (upsertErr) {
          console.warn(`[MissionEvaluator] Failed to upsert progress for core ${coreName}:`, upsertErr.message)
        }

        progressUpdates.push({
          coreId,
          coreName,
          title: item.description || `${coreName} Mission`,
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

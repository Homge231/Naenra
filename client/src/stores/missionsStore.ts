import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './authStore'
import { audioService } from '../services/audioService'

export interface CoreMission {
  id: string
  title: string
  description: string
  category: 'Attack' | 'Defense' | 'Utility' | 'Economy' | 'Strategy'
  coreFamily: string
  unlockCoreName: string
  targetCount: number
  currentProgress: number
  isCompleted: boolean
  isClaimed: boolean
  rewardXp: number
  icon: string
}

export interface MissionToast {
  id: number
  title: string
  message: string
  coreName: string
  icon: string
  type: 'completed' | 'unlocked'
}

export const useMissionsStore = defineStore('missions', () => {
  const STORAGE_KEY = 'naenra_core_missions_v3'
  const UNLOCKED_CORES_KEY = 'naenra_unlocked_cores_v3'

  const activeToasts = ref<MissionToast[]>([])
  let toastIdCounter = 0

  function showToast(title: string, message: string, coreName: string, icon: string, type: 'completed' | 'unlocked' = 'completed') {
    const id = ++toastIdCounter
    activeToasts.value.push({ id, title, message, coreName, icon, type })
    if (activeToasts.value.length > 4) {
      activeToasts.value.shift()
    }
    setTimeout(() => {
      dismissToast(id)
    }, 5500)
  }

  function dismissToast(id: number) {
    activeToasts.value = activeToasts.value.filter(t => t.id !== id)
  }

  const initialMissions: CoreMission[] = [
    // Combo Family
    {
      id: 'mission_combo_burst',
      title: 'Combo Streak Mastery',
      description: 'Achieve a 10-word streak using Combo Core to unlock Combo Burst.',
      category: 'Attack',
      coreFamily: 'combo',
      unlockCoreName: 'Combo Burst',
      targetCount: 10,
      currentProgress: 0,
      isCompleted: false,
      isClaimed: false,
      rewardXp: 150,
      icon: '🔥'
    },
    {
      id: 'mission_hyper_combo',
      title: 'Hyper Combo Legend',
      description: 'Reach a 20-word typing streak to unlock Hyper Combo.',
      category: 'Attack',
      coreFamily: 'combo',
      unlockCoreName: 'Hyper Combo',
      targetCount: 20,
      currentProgress: 0,
      isCompleted: false,
      isClaimed: false,
      rewardXp: 400,
      icon: '💥'
    },
    // Speedster Family
    {
      id: 'mission_velocity_shield',
      title: 'Shield Defender',
      description: 'Absorb 5 typing penalties with Aegis Core to unlock Velocity Shield.',
      category: 'Defense',
      coreFamily: 'aegis',
      unlockCoreName: 'Velocity Shield',
      targetCount: 5,
      currentProgress: 0,
      isCompleted: false,
      isClaimed: false,
      rewardXp: 200,
      icon: '🛡️'
    },
    {
      id: 'mission_hyperdrive',
      title: 'Warp Speed Typer',
      description: 'Maintain over 90 WPM typing speed for 20 seconds to unlock Hyperdrive.',
      category: 'Attack',
      coreFamily: 'speedster',
      unlockCoreName: 'Hyperdrive',
      targetCount: 20,
      currentProgress: 0,
      isCompleted: false,
      isClaimed: false,
      rewardXp: 350,
      icon: '⚡'
    },
    // Oracle Family
    {
      id: 'mission_inner_eye',
      title: 'Third Eye Seer',
      description: 'Complete 3 rounds with Oracle Core hints to unlock Inner Eye.',
      category: 'Utility',
      coreFamily: 'oracle',
      unlockCoreName: 'Inner Eye',
      targetCount: 3,
      currentProgress: 0,
      isCompleted: false,
      isClaimed: false,
      rewardXp: 180,
      icon: '🔮'
    },
    {
      id: 'mission_prophecy',
      title: 'Prophetic Vision',
      description: 'Complete 5 rounds using Oracle Core without any errors to unlock Prophecy.',
      category: 'Utility',
      coreFamily: 'oracle',
      unlockCoreName: 'Prophecy',
      targetCount: 5,
      currentProgress: 0,
      isCompleted: false,
      isClaimed: false,
      rewardXp: 380,
      icon: '👁️'
    },
    // Mission Family
    {
      id: 'mission_contract_hunter',
      title: 'Bounty Hunter',
      description: 'Submit 5 consecutive correct answers to unlock Contract Hunter.',
      category: 'Strategy',
      coreFamily: 'mission',
      unlockCoreName: 'Contract Hunter',
      targetCount: 5,
      currentProgress: 0,
      isCompleted: false,
      isClaimed: false,
      rewardXp: 250,
      icon: '🎯'
    },
    {
      id: 'mission_mission_legend',
      title: 'Mission Legend',
      description: 'Complete 10 gameplay missions to unlock Mission Legend.',
      category: 'Strategy',
      coreFamily: 'mission',
      unlockCoreName: 'Mission Legend',
      targetCount: 10,
      currentProgress: 0,
      isCompleted: false,
      isClaimed: false,
      rewardXp: 500,
      icon: '🏆'
    },
    // Aegis Family
    {
      id: 'mission_reflective_barrier',
      title: 'Reflective Barrier',
      description: 'Block 10 penalty points using Aegis Core to unlock Reflective Barrier.',
      category: 'Defense',
      coreFamily: 'aegis',
      unlockCoreName: 'Reflective Barrier',
      targetCount: 10,
      currentProgress: 0,
      isCompleted: false,
      isClaimed: false,
      rewardXp: 220,
      icon: '🏛️'
    },
    {
      id: 'mission_aegis_sanctuary',
      title: 'Aegis Sanctuary',
      description: 'Survive an entire match without taking any penalties to unlock Aegis Sanctuary.',
      category: 'Defense',
      coreFamily: 'aegis',
      unlockCoreName: 'Aegis Sanctuary',
      targetCount: 1,
      currentProgress: 0,
      isCompleted: false,
      isClaimed: false,
      rewardXp: 450,
      icon: '🏰'
    },
    // Balanced / Zen Family
    {
      id: 'mission_zen_momentum',
      title: 'Zen Focus',
      description: 'Maintain steady typing rhythm for 45 seconds to unlock Zen Momentum.',
      category: 'Economy',
      coreFamily: 'balanced',
      unlockCoreName: 'Zen Momentum',
      targetCount: 45,
      currentProgress: 0,
      isCompleted: false,
      isClaimed: false,
      rewardXp: 210,
      icon: '🧘'
    },
    {
      id: 'mission_serenity',
      title: 'Master Serenity',
      description: 'Complete 3 matches with 100% accuracy to unlock Serenity.',
      category: 'Economy',
      coreFamily: 'balanced',
      unlockCoreName: 'Serenity',
      targetCount: 3,
      currentProgress: 0,
      isCompleted: false,
      isClaimed: false,
      rewardXp: 420,
      icon: '✨'
    },
    // Power Family
    {
      id: 'mission_overcharge',
      title: 'Power Surge',
      description: 'Achieve 80 WPM typing speed to unlock Overcharge.',
      category: 'Attack',
      coreFamily: 'power',
      unlockCoreName: 'Overcharge',
      targetCount: 80,
      currentProgress: 0,
      isCompleted: false,
      isClaimed: false,
      rewardXp: 300,
      icon: '⚡'
    },
    {
      id: 'mission_cataclysm',
      title: 'Cataclysmic Force',
      description: 'Score over 2,000 total match points to unlock Cataclysm.',
      category: 'Attack',
      coreFamily: 'power',
      unlockCoreName: 'Cataclysm',
      targetCount: 2000,
      currentProgress: 0,
      isCompleted: false,
      isClaimed: false,
      rewardXp: 480,
      icon: '🌋'
    },
    // Pandora Family
    {
      id: 'mission_wild_card',
      title: 'Pandora Unboxed',
      description: 'Survive 3 chaotic rounds with Pandora Core to unlock Wild Card.',
      category: 'Utility',
      coreFamily: 'pandora',
      unlockCoreName: 'Wild Card',
      targetCount: 3,
      currentProgress: 0,
      isCompleted: false,
      isClaimed: false,
      rewardXp: 260,
      icon: '📦'
    },
    {
      id: 'mission_pandora_overdrive',
      title: 'Pandora Overdrive',
      description: 'Trigger 5 random shapeshifts in Pandora Core to unlock Pandora Overdrive.',
      category: 'Utility',
      coreFamily: 'pandora',
      unlockCoreName: 'Pandora Overdrive',
      targetCount: 5,
      currentProgress: 0,
      isCompleted: false,
      isClaimed: false,
      rewardXp: 460,
      icon: '🌀'
    },
    // Phoenix Family
    {
      id: 'mission_feather_shield',
      title: 'Feather Shield',
      description: 'Recover from 3 typing errors with Phoenix Core to unlock Feather Shield.',
      category: 'Defense',
      coreFamily: 'phoenix',
      unlockCoreName: 'Feather Shield',
      targetCount: 3,
      currentProgress: 0,
      isCompleted: false,
      isClaimed: false,
      rewardXp: 230,
      icon: '🪶'
    },
    {
      id: 'mission_phoenix_overlord',
      title: 'Phoenix Rebirth',
      description: 'Come back from behind to win a match with Phoenix Core to unlock Phoenix Overlord.',
      category: 'Strategy',
      coreFamily: 'phoenix',
      unlockCoreName: 'Phoenix Overlord',
      targetCount: 1,
      currentProgress: 0,
      isCompleted: false,
      isClaimed: false,
      rewardXp: 500,
      icon: '🦅'
    },
    // High Roller Family
    {
      id: 'mission_high_stakes',
      title: 'High Stakes Gamble',
      description: 'Score 1,000+ points in a single round to unlock High Stakes.',
      category: 'Economy',
      coreFamily: 'highroller',
      unlockCoreName: 'High Stakes',
      targetCount: 1000,
      currentProgress: 0,
      isCompleted: false,
      isClaimed: false,
      rewardXp: 350,
      icon: '🎲'
    },
    {
      id: 'mission_casino_empire',
      title: 'Casino Empire',
      description: 'Win 3 high-multiplier matches to unlock Casino Empire.',
      category: 'Economy',
      coreFamily: 'highroller',
      unlockCoreName: 'Casino Empire',
      targetCount: 3,
      currentProgress: 0,
      isCompleted: false,
      isClaimed: false,
      rewardXp: 490,
      icon: '🎰'
    }
  ]

  const missions = ref<CoreMission[]>(loadSavedMissions())
  const unlockedCoreNames = ref<string[]>(loadUnlockedCores())

  function loadSavedMissions(): CoreMission[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) return JSON.parse(saved)
    } catch (e) {
      console.warn('Failed to load saved core missions:', e)
    }
    return initialMissions
  }

  function loadUnlockedCores(): string[] {
    try {
      const saved = localStorage.getItem(UNLOCKED_CORES_KEY)
      if (saved) return JSON.parse(saved)
    } catch (e) {
      console.warn('Failed to load unlocked cores:', e)
    }
    return []
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(missions.value))
      localStorage.setItem(UNLOCKED_CORES_KEY, JSON.stringify(unlockedCoreNames.value))
    } catch (e) {
      console.error('Failed to save missions state:', e)
    }
  }

  const completedCount = computed(() => missions.value.filter(m => m.isCompleted).length)
  const totalCount = computed(() => missions.value.length)
  const claimedCount = computed(() => missions.value.filter(m => m.isClaimed).length)

  // Overall Support Core unlock progress
  const totalLockedUpgradesCount = computed(() => missions.value.length)
  const unlockedUpgradesCount = computed(() => claimedCount.value)
  const unlockProgressPercent = computed(() => Math.round((unlockedUpgradesCount.value / totalLockedUpgradesCount.value) * 100))
  const remainingUpgradesToUnlock = computed(() => totalLockedUpgradesCount.value - unlockedUpgradesCount.value)

  const totalXpEarned = computed(() => {
    return missions.value
      .filter(m => m.isClaimed)
      .reduce((sum, m) => sum + m.rewardXp, 0)
  })

  const masteryLevel = computed(() => Math.floor(totalXpEarned.value / 250) + 1)

  function isCoreUnlocked(coreNameOrId: string): boolean {
    if (!coreNameOrId) return true
    // All 65 Support Cores are 100% UNLOCKED and accessible for tactical match evolution!
    return true
  }

  function claimReward(missionId: string) {
    const mission = missions.value.find(m => m.id === missionId)
    if (mission && mission.isCompleted && !mission.isClaimed) {
      mission.isClaimed = true

      if (mission.unlockCoreName && !isCoreUnlocked(mission.unlockCoreName)) {
        unlockedCoreNames.value.push(mission.unlockCoreName)
      }

      // Sync with authStore if profile exists
      const authStore = useAuthStore()
      if (authStore.profile) {
        if (!authStore.profile.unlocked_core_ids) {
          authStore.profile.unlocked_core_ids = []
        }
        if (mission.unlockCoreName && !authStore.profile.unlocked_core_ids.includes(mission.unlockCoreName)) {
          authStore.profile.unlocked_core_ids.push(mission.unlockCoreName)
        }
      }

      // Pop-up Toast Notification for Core Unlock
      showToast(
        '🔓 SUPPORT CORE UNLOCKED!',
        `${mission.unlockCoreName} is now unlocked and available in gameplay matches!`,
        mission.unlockCoreName,
        '✨',
        'unlocked'
      )

      saveState()
      return mission.rewardXp
    }
    return 0
  }

  function updateProgress(missionId: string, amount: number) {
    const mission = missions.value.find(m => m.id === missionId)
    if (mission && !mission.isCompleted) {
      mission.currentProgress = Math.min(mission.targetCount, mission.currentProgress + amount)
      if (mission.currentProgress >= mission.targetCount) {
        mission.isCompleted = true
        showToast(
          '🎉 MISSION COMPLETED!',
          `Unlocked requirement for ${mission.unlockCoreName}! Claim in Missions Dashboard.`,
          mission.unlockCoreName,
          mission.icon || '🎁',
          'completed'
        )
      }
      saveState()
    }
  }

  // Automatic evaluation of gameplay achievements & score thresholds
  function evaluateGameplayProgress(stats: { score?: number; comboStreak?: number; wpm?: number; coreFamily?: string; coreName?: string; roundsCompleted?: number }) {
    let stateChanged = false

    missions.value.forEach(m => {
      if (m.isCompleted) return

      let justCompleted = false

      // 1. Score-based missions (e.g. Cataclysm, High Stakes, Casino Empire)
      if (stats.score !== undefined && stats.score > 0) {
        if (['Cataclysm', 'High Stakes', 'Casino Empire'].includes(m.unlockCoreName)) {
          if (stats.score > m.currentProgress) {
            m.currentProgress = Math.min(m.targetCount, stats.score)
            if (m.currentProgress >= m.targetCount) {
              m.isCompleted = true
              justCompleted = true
            }
            stateChanged = true
          }
        }
      }

      // 2. Combo Streak missions (e.g. Combo Burst, Hyper Combo)
      if (stats.comboStreak !== undefined && stats.comboStreak > 0) {
        if (['Combo Burst', 'Hyper Combo'].includes(m.unlockCoreName)) {
          if (stats.comboStreak > m.currentProgress) {
            m.currentProgress = Math.min(m.targetCount, stats.comboStreak)
            if (m.currentProgress >= m.targetCount) {
              m.isCompleted = true
              justCompleted = true
            }
            stateChanged = true
          }
        }
      }

      // 3. WPM speed missions (e.g. Overcharge, Hyperdrive)
      if (stats.wpm !== undefined && stats.wpm > 0) {
        if (['Overcharge', 'Hyperdrive'].includes(m.unlockCoreName)) {
          if (stats.wpm > m.currentProgress) {
            m.currentProgress = Math.min(m.targetCount, stats.wpm)
            if (m.currentProgress >= m.targetCount) {
              m.isCompleted = true
              justCompleted = true
            }
            stateChanged = true
          }
        }
      }

      // 4. Rounds completed missions (e.g. Inner Eye, Prophecy, Wild Card, Contract Hunter, Mission Legend)
      if (stats.roundsCompleted && stats.roundsCompleted > 0) {
        if (['Inner Eye', 'Prophecy', 'Wild Card', 'Contract Hunter', 'Mission Legend', 'Feather Shield', 'Reflective Barrier', 'Velocity Shield'].includes(m.unlockCoreName)) {
          m.currentProgress = Math.min(m.targetCount, m.currentProgress + stats.roundsCompleted)
          if (m.currentProgress >= m.targetCount) {
            m.isCompleted = true
            justCompleted = true
          }
          stateChanged = true
        }
      }

      if (justCompleted) {
        showToast(
          '🎉 MISSION COMPLETED!',
          `Unlocked requirement for ${m.unlockCoreName}! Claim in Missions Dashboard.`,
          m.unlockCoreName,
          m.icon || '🎁',
          'completed'
        )
      }
    })

    if (stateChanged) {
      saveState()
    }
  }

  function adminIncrementProgress(missionId: string, amount: number = 1) {
    const mission = missions.value.find(m => m.id === missionId)
    if (mission) {
      mission.currentProgress = Math.min(mission.targetCount, mission.currentProgress + amount)
      if (mission.currentProgress >= mission.targetCount) {
        mission.isCompleted = true
        showToast(
          '⚡ ADMIN: MISSION COMPLETED!',
          `Unlocked requirement for ${mission.unlockCoreName}!`,
          mission.unlockCoreName,
          mission.icon || '🎁',
          'completed'
        )
      }
      saveState()
    }
  }

  function adminCompleteMission(missionId: string) {
    const mission = missions.value.find(m => m.id === missionId)
    if (mission) {
      mission.currentProgress = mission.targetCount
      mission.isCompleted = true
      showToast(
        '⚡ ADMIN: INSTANT COMPLETED!',
        `Unlocked requirement for ${mission.unlockCoreName}!`,
        mission.unlockCoreName,
        mission.icon || '🎁',
        'completed'
      )
      saveState()
    }
  }

  function resetMissions() {
    missions.value = JSON.parse(JSON.stringify(initialMissions))
    unlockedCoreNames.value = []
    activeToasts.value = []
    saveState()
  }

  return {
    missions,
    unlockedCoreNames,
    activeToasts,
    completedCount,
    totalCount,
    claimedCount,
    totalLockedUpgradesCount,
    unlockedUpgradesCount,
    unlockProgressPercent,
    remainingUpgradesToUnlock,
    totalXpEarned,
    masteryLevel,
    isCoreUnlocked,
    claimReward,
    updateProgress,
    evaluateGameplayProgress,
    adminIncrementProgress,
    adminCompleteMission,
    showToast,
    dismissToast,
    resetMissions
  }
})

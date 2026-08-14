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
  const STORAGE_KEY = 'naenra_core_missions_v5'
  const UNLOCKED_CORES_KEY = 'naenra_unlocked_cores_v5'

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
    // ── Combo Family (4 missions: 2 Tier 2 + 2 Tier 3) ───────────────────────
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
      id: 'mission_combo_shield',
      title: 'Combo Shield Specialist',
      description: 'Reach a 15-word typing streak to unlock Combo Shield.',
      category: 'Defense',
      coreFamily: 'combo',
      unlockCoreName: 'Combo Shield',
      targetCount: 15,
      currentProgress: 0,
      isCompleted: false,
      isClaimed: false,
      rewardXp: 200,
      icon: '🛡️'
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
    {
      id: 'mission_super_combo',
      title: 'Super Combo Dominator',
      description: 'Score 1,500 points in a single round with Combo Core to unlock Super Combo.',
      category: 'Attack',
      coreFamily: 'combo',
      unlockCoreName: 'Super Combo',
      targetCount: 1500,
      currentProgress: 0,
      isCompleted: false,
      isClaimed: false,
      rewardXp: 450,
      icon: '🎯'
    },

    // ── Speedster Family (4 missions: 2 Tier 2 + 2 Tier 3) ───────────────────
    {
      id: 'mission_velocity_shield',
      title: 'Shield Defender',
      description: 'Absorb 5 typing penalties with Aegis Core to unlock Velocity Shield.',
      category: 'Defense',
      coreFamily: 'speedster',
      unlockCoreName: 'Velocity Shield',
      targetCount: 5,
      currentProgress: 0,
      isCompleted: false,
      isClaimed: false,
      rewardXp: 200,
      icon: '🛡️'
    },
    {
      id: 'mission_speed_demon',
      title: 'Speed Demon Sprint',
      description: 'Answer 5 questions in under 1.5 seconds each to unlock Speed Demon.',
      category: 'Attack',
      coreFamily: 'speedster',
      unlockCoreName: 'Speed Demon',
      targetCount: 5,
      currentProgress: 0,
      isCompleted: false,
      isClaimed: false,
      rewardXp: 220,
      icon: '🏎️'
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
    {
      id: 'mission_sonic_boom',
      title: 'Sonic Boom Velocity',
      description: 'Solve a question in under 1 second to unlock Sonic Boom.',
      category: 'Attack',
      coreFamily: 'speedster',
      unlockCoreName: 'Sonic Boom',
      targetCount: 1,
      currentProgress: 0,
      isCompleted: false,
      isClaimed: false,
      rewardXp: 480,
      icon: '🚀'
    },

    // ── Argus Eyes Family (4 missions: 2 Tier 2 + 2 Tier 3) ──────────────────
    {
      id: 'mission_inner_eye',
      title: 'Third Eye Seer',
      description: 'Complete 3 rounds with Argus Eyes Core hints to unlock Inner Eye.',
      category: 'Utility',
      coreFamily: 'argus eyes',
      unlockCoreName: 'Inner Eye',
      targetCount: 3,
      currentProgress: 0,
      isCompleted: false,
      isClaimed: false,
      rewardXp: 180,
      icon: '🔮'
    },
    {
      id: 'mission_future_sight',
      title: 'Future Sight Visionary',
      description: 'Finish 2 matches using Argus Eyes without hints to unlock Future Sight.',
      category: 'Utility',
      coreFamily: 'argus eyes',
      unlockCoreName: 'Future Sight',
      targetCount: 2,
      currentProgress: 0,
      isCompleted: false,
      isClaimed: false,
      rewardXp: 240,
      icon: '✨'
    },
    {
      id: 'mission_prophecy',
      title: 'Prophetic Vision',
      description: 'Complete 5 rounds using Argus Eyes Core without any errors to unlock Prophecy.',
      category: 'Utility',
      coreFamily: 'argus eyes',
      unlockCoreName: 'Prophecy',
      targetCount: 5,
      currentProgress: 0,
      isCompleted: false,
      isClaimed: false,
      rewardXp: 380,
      icon: '👁️'
    },
    {
      id: 'mission_cosmic_wisdom',
      title: 'Cosmic Wisdom Master',
      description: 'Maintain 95% accuracy in 3 consecutive matches to unlock Cosmic Wisdom.',
      category: 'Utility',
      coreFamily: 'argus eyes',
      unlockCoreName: 'Cosmic Wisdom',
      targetCount: 3,
      currentProgress: 0,
      isCompleted: false,
      isClaimed: false,
      rewardXp: 460,
      icon: '🌌'
    },

    // ── Mission Family (4 missions: 2 Tier 2 + 2 Tier 3) ─────────────────────
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
      id: 'mission_bounty_hunter',
      title: 'Bounty Specialist',
      description: 'Complete 3 target word objectives in a single match to unlock Bounty Hunter.',
      category: 'Strategy',
      coreFamily: 'mission',
      unlockCoreName: 'Bounty Hunter',
      targetCount: 3,
      currentProgress: 0,
      isCompleted: false,
      isClaimed: false,
      rewardXp: 270,
      icon: '🤠'
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
    {
      id: 'mission_apex_predator',
      title: 'Apex Predator Hunter',
      description: 'Win 5 matches while using Mission Core to unlock Apex Predator.',
      category: 'Strategy',
      coreFamily: 'mission',
      unlockCoreName: 'Apex Predator',
      targetCount: 5,
      currentProgress: 0,
      isCompleted: false,
      isClaimed: false,
      rewardXp: 490,
      icon: '🦅'
    },

    // ── Aegis Family (4 missions: 2 Tier 2 + 2 Tier 3) ───────────────────────
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
      id: 'mission_fortress_aegis',
      title: 'Fortress Aegis Defender',
      description: 'Stack 3 Aegis shields in a single round to unlock Fortress Aegis.',
      category: 'Defense',
      coreFamily: 'aegis',
      unlockCoreName: 'Fortress Aegis',
      targetCount: 3,
      currentProgress: 0,
      isCompleted: false,
      isClaimed: false,
      rewardXp: 260,
      icon: '🏰'
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
      icon: '⛩️'
    },
    {
      id: 'mission_spiked_shield',
      title: 'Spiked Shield Counter',
      description: 'Reflect 10 typing penalty points using Aegis Core to unlock Spiked Shield.',
      category: 'Defense',
      coreFamily: 'aegis',
      unlockCoreName: 'Spiked Shield',
      targetCount: 10,
      currentProgress: 0,
      isCompleted: false,
      isClaimed: false,
      rewardXp: 470,
      icon: '🔰'
    },

    // ── Balanced Family (4 missions: 2 Tier 2 + 2 Tier 3) ────────────────────
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
      id: 'mission_equilibrium',
      title: 'Equilibrium Harmonizer',
      description: 'Complete a round with 90%+ accuracy to unlock Equilibrium.',
      category: 'Economy',
      coreFamily: 'balanced',
      unlockCoreName: 'Equilibrium',
      targetCount: 1,
      currentProgress: 0,
      isCompleted: false,
      isClaimed: false,
      rewardXp: 230,
      icon: '☯️'
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
    {
      id: 'mission_nirvana',
      title: 'Nirvana Transcendence',
      description: 'Complete 5 consecutive rounds without any typos to unlock Nirvana.',
      category: 'Economy',
      coreFamily: 'balanced',
      unlockCoreName: 'Nirvana',
      targetCount: 5,
      currentProgress: 0,
      isCompleted: false,
      isClaimed: false,
      rewardXp: 500,
      icon: '🌟'
    },

    // ── Power Family (4 missions: 2 Tier 2 + 2 Tier 3) ───────────────────────
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
      id: 'mission_power_surge',
      title: 'Power Surge Amplifier',
      description: 'Score 500 flat buff points with Power Core to unlock Power Surge.',
      category: 'Attack',
      coreFamily: 'power',
      unlockCoreName: 'Power Surge',
      targetCount: 500,
      currentProgress: 0,
      isCompleted: false,
      isClaimed: false,
      rewardXp: 280,
      icon: '💥'
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
    {
      id: 'mission_absolute_power',
      title: 'Absolute Power Titan',
      description: 'Win 3 matches using Power Core upgrades to unlock Absolute Power.',
      category: 'Attack',
      coreFamily: 'power',
      unlockCoreName: 'Absolute Power',
      targetCount: 3,
      currentProgress: 0,
      isCompleted: false,
      isClaimed: false,
      rewardXp: 500,
      icon: '⚡'
    },

    // ── Pandora Family (4 missions: 2 Tier 2 + 2 Tier 3) ─────────────────────
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
      id: 'mission_chaos_prism',
      title: 'Chaos Prism Weaver',
      description: 'Trigger 3 random shapeshifts in Pandora Core to unlock Chaos Prism.',
      category: 'Utility',
      coreFamily: 'pandora',
      unlockCoreName: 'Chaos Prism',
      targetCount: 3,
      currentProgress: 0,
      isCompleted: false,
      isClaimed: false,
      rewardXp: 270,
      icon: '💎'
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
    {
      id: 'mission_chaos_theory',
      title: 'Chaos Theory Master',
      description: 'Score 1,200 points during a Pandora chaos state to unlock Chaos Theory.',
      category: 'Utility',
      coreFamily: 'pandora',
      unlockCoreName: 'Chaos Theory',
      targetCount: 1200,
      currentProgress: 0,
      isCompleted: false,
      isClaimed: false,
      rewardXp: 490,
      icon: '🌪️'
    },

    // ── Phoenix Family (4 missions: 2 Tier 2 + 2 Tier 3) ─────────────────────
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
      id: 'mission_rebirth',
      title: 'Phoenix Rebirth Flame',
      description: 'Revive from penalty state twice in a match to unlock Rebirth.',
      category: 'Defense',
      coreFamily: 'phoenix',
      unlockCoreName: 'Rebirth',
      targetCount: 2,
      currentProgress: 0,
      isCompleted: false,
      isClaimed: false,
      rewardXp: 250,
      icon: '🔥'
    },
    {
      id: 'mission_phoenix_overlord',
      title: 'Phoenix Overlord Rebirth',
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
    {
      id: 'mission_eternal_rebirth',
      title: 'Eternal Rebirth Champion',
      description: 'Win 3 matches after dropping below 50% accuracy to unlock Eternal Rebirth.',
      category: 'Strategy',
      coreFamily: 'phoenix',
      unlockCoreName: 'Eternal Rebirth',
      targetCount: 3,
      currentProgress: 0,
      isCompleted: false,
      isClaimed: false,
      rewardXp: 490,
      icon: '☀️'
    },

    // ── High Roller Family (4 missions: 2 Tier 2 + 2 Tier 3) ─────────────────
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
      id: 'mission_safe_bet',
      title: 'Safe Bet Tactician',
      description: 'Maintain a positive score multiplier for 3 rounds to unlock Safe Bet.',
      category: 'Economy',
      coreFamily: 'highroller',
      unlockCoreName: 'Safe Bet',
      targetCount: 3,
      currentProgress: 0,
      isCompleted: false,
      isClaimed: false,
      rewardXp: 290,
      icon: '♠️'
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
    },
    {
      id: 'mission_russian_roulette',
      title: 'Russian Roulette High Roller',
      description: 'Risk and score 500+ points in a single high-stakes round to unlock Russian Roulette.',
      category: 'Economy',
      coreFamily: 'highroller',
      unlockCoreName: 'Russian Roulette',
      targetCount: 500,
      currentProgress: 0,
      isCompleted: false,
      isClaimed: false,
      rewardXp: 500,
      icon: '🃏'
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

  const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'
  const isSyncing = ref(false)

  let syncTimeout: any = null
  function debouncedCloudSync() {
    if (syncTimeout) clearTimeout(syncTimeout)
    syncTimeout = setTimeout(async () => {
      const token = localStorage.getItem('arena_token')
      const authStore = useAuthStore()
      if (!token || authStore.isGuest) return

      try {
        const payload = missions.value.map(m => ({
          coreName: m.unlockCoreName,
          currentProgress: m.currentProgress,
          isCompleted: m.isCompleted,
          isClaimed: m.isClaimed,
          isUnlocked: m.isClaimed || isCoreUnlocked(m.unlockCoreName)
        }))

        await fetch(`${SERVER_URL}/api/user/core-progress/sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ progressList: payload })
        })
      } catch (err) {
        console.warn('[MissionsStore] Cloud progress sync error:', err)
      }
    }, 2000)
  }

  async function fetchCloudProgress() {
    const token = localStorage.getItem('arena_token')
    if (!token) return

    try {
      const authStore = useAuthStore()
      if (authStore.isGuest) return

      isSyncing.value = true
      const res = await fetch(`${SERVER_URL}/api/user/core-progress`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      if (!res.ok) return

      const data = await res.json()
      if (data.unlockedCoreNames && Array.isArray(data.unlockedCoreNames)) {
        const mergedNames = new Set([...unlockedCoreNames.value, ...data.unlockedCoreNames])
        unlockedCoreNames.value = Array.from(mergedNames)
      }

      if (data.missions && Array.isArray(data.missions)) {
        for (const cloudM of data.missions) {
          const localM = missions.value.find(m => 
            m.unlockCoreName.toLowerCase() === cloudM.coreName.toLowerCase() ||
            m.id.toLowerCase() === cloudM.coreName.toLowerCase()
          )
          if (localM) {
            localM.currentProgress = Math.max(localM.currentProgress, cloudM.currentProgress)
            if (cloudM.isCompleted || cloudM.isUnlocked) {
              localM.isCompleted = true
            }
            if (cloudM.isUnlocked) {
              localM.isClaimed = true
            }
          }
        }
      }

      saveState(false)
    } catch (err) {
      console.warn('[MissionsStore] Failed to fetch cloud core progress:', err)
    } finally {
      isSyncing.value = false
    }
  }

  // Trigger initial cloud fetch on startup if token exists
  if (typeof window !== 'undefined' && localStorage.getItem('arena_token')) {
    setTimeout(() => {
      fetchCloudProgress()
    }, 500)
  }

  function saveState(shouldSyncToCloud: boolean = true) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(missions.value))
      localStorage.setItem(UNLOCKED_CORES_KEY, JSON.stringify(unlockedCoreNames.value))
      if (shouldSyncToCloud) {
        debouncedCloudSync()
      }
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

  const lockedCoreNames = new Set([
    // Combo
    'Combo Burst', 'Combo Shield', 'Hyper Combo', 'Super Combo',
    // Speedster
    'Velocity Shield', 'Speed Demon', 'Hyperdrive', 'Sonic Boom',
    // Argus Eyes
    'Inner Eye', 'Future Sight', 'Prophecy', 'Cosmic Wisdom',
    // Mission
    'Contract Hunter', 'Bounty Hunter', 'Mission Legend', 'Apex Predator',
    // Aegis
    'Reflective Barrier', 'Fortress Aegis', 'Aegis Sanctuary', 'Spiked Shield',
    // Balanced
    'Zen Momentum', 'Equilibrium', 'Serenity', 'Nirvana',
    // Power
    'Overcharge', 'Power Surge', 'Cataclysm', 'Absolute Power',
    // Pandora
    'Wild Card', 'Chaos Prism', 'Pandora Overdrive', 'Chaos Theory',
    // Phoenix
    'Feather Shield', 'Rebirth', 'Phoenix Overlord', 'Eternal Rebirth',
    // High Roller
    'High Stakes', 'Safe Bet', 'Casino Empire', 'Russian Roulette'
  ])

  function isCoreUnlocked(coreNameOrId: string): boolean {
    if (!coreNameOrId) return true
    const nameLower = String(coreNameOrId).trim().toLowerCase()

    // Resolve target core name (handle mission IDs or core name lookup)
    let targetName = nameLower
    const matchingMission = missions.value.find(m => 
      m.unlockCoreName.toLowerCase() === nameLower || m.id.toLowerCase() === nameLower
    )
    if (matchingMission) {
      targetName = matchingMission.unlockCoreName.toLowerCase()
    }

    // 1. If core name is NOT in the 1/3 locked list, it is UNLOCKED BY DEFAULT (2/3 cores free)
    const isLockedByDefault = Array.from(lockedCoreNames).some(
      lockedName => lockedName.toLowerCase() === targetName
    )
    if (!isLockedByDefault) return true

    // 2. Check if explicitly unlocked in unlockedCoreNames (claimed via Mission Tracker)
    const inUnlockedNames = unlockedCoreNames.value.some(
      unlockedName => unlockedName.trim().toLowerCase() === targetName
    )
    if (inUnlockedNames) return true

    // 3. Check if claimed in authStore profile
    const authStore = useAuthStore()
    if (authStore.profile?.unlocked_core_ids?.some(id => id.trim().toLowerCase() === targetName)) {
      return true
    }

    // 4. Check if corresponding mission is completed
    const completedMission = missions.value.find(m =>
      m.isCompleted && (
        m.unlockCoreName.trim().toLowerCase() === targetName ||
        m.id.trim().toLowerCase() === targetName
      )
    )
    if (completedMission) return true

    return false
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

      saveState(true)

      // Sync claim to Supabase cloud
      const token = localStorage.getItem('arena_token')
      if (token && !authStore.isGuest) {
        fetch(`${SERVER_URL}/api/user/core-progress/claim`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            coreName: mission.unlockCoreName,
            missionId: mission.id
          })
        }).catch(err => {
          console.warn('[MissionsStore] Failed to sync claim to cloud:', err)
        })
      }

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
    resetMissions,
    fetchCloudProgress,
    isSyncing
  }
})

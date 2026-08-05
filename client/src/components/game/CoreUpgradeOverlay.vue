<template>
  <div class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/20 backdrop-blur-sm text-white select-none">
    
    <div class="absolute inset-0 cyber-grid opacity-20 pointer-events-none z-0"></div>

    <div class="absolute top-8 right-8 z-20 flex items-center gap-2"
      :class="timeLeft <= 5 ? (settingsStore.vfxEnabled ? 'text-hexred animate-pulse' : 'text-hexred') : 'text-lightOrange'">
      <svg class="w-6 h-6 drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span class="font-mono font-black text-4xl tabular-nums drop-shadow-lg">
        {{ String(timeLeft).padStart(2, '0') }}
      </span>
    </div>

    <main class="relative z-10 flex flex-col items-center justify-center px-4 md:px-6 max-w-4xl mx-auto w-full">
      <h2
        class="text-4xl md:text-5xl font-black text-white mb-3 drop-shadow-[0_0_20px_rgba(59,130,246,0.6)] tracking-widest text-center uppercase">
        Tactical Upgrade
      </h2>
      <p class="text-lightBlue/80 mb-6 text-sm md:text-base tracking-[0.2em] uppercase text-center font-bold">
        Select a Support Core for Round {{ matchStore.currentRound + 1 }}
      </p>

      <div v-if="gameStore.coreHistory.length > 0" class="mb-8 flex flex-wrap items-center justify-center gap-3">
        <div v-if="gameStore.coreHistory[0]" class="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white/5 border border-emerald-500/30 backdrop-blur shadow-lg">
          <img :src="gameStore.coreHistory[0].icon" :alt="gameStore.coreHistory[0].name" @error="onImgError" class="w-6 h-6 object-contain" />
          <div class="text-left">
            <p class="text-[9px] font-black uppercase text-emerald-400 tracking-wider">Main Core</p>
            <p class="text-xs font-bold text-white">{{ gameStore.coreHistory[0].name }}</p>
          </div>
        </div>

        <div v-for="(uCore, uIdx) in gameStore.coreHistory.slice(1)" :key="`${uCore.id}-${uIdx}`" class="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white/5 border border-blue-500/30 backdrop-blur shadow-lg">
          <img :src="uCore.icon" :alt="uCore.name" @error="onImgError" class="w-6 h-6 object-contain" />
          <div class="text-left">
            <p class="text-[9px] font-black uppercase text-blue-400 tracking-wider">Upgrade {{ uIdx + 1 }}</p>
            <p class="text-xs font-bold text-white">{{ uCore.name }}</p>
          </div>
        </div>
      </div>

      <div v-if="loading && upgradeCores.length === 0" class="flex justify-center py-16">
        <svg class="w-10 h-10 text-lightBlue" :class="{ 'animate-spin': settingsStore.vfxEnabled }" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c..."></path>
        </svg>
      </div>

      <div v-else id="tutorial-upgrade-cards" class="relative z-20 grid grid-cols-1 md:grid-cols-2 gap-8 w-full items-stretch"
        :class="{ 'pointer-events-none': loading && upgradeCores.length > 0 }">
        
        <div v-for="(core, index) in upgradeCores" :key="core.id || index" class="flex flex-col items-center w-full h-full relative">
          
          <transition name="fade">
            <CoreTooltip v-if="activeTooltipIndex === index" :core="core" :isLocked="core.isLocked" :missionText="core.missionText" />
          </transition>

          <div @click="selectCore(core)"
            class="group flex-1 w-full relative backdrop-blur-xl rounded-2xl p-8 md:p-12 transition-all duration-500 flex flex-col items-center text-center overflow-hidden"
            :class="[
              core.isLocked
                ? 'bg-black/50 border border-red-500/30 cursor-not-allowed grayscale opacity-70'
                : (settingsStore.vfxEnabled ? 'tech-border cursor-pointer' : 'border border-white/20 cursor-pointer'),
              selectedCore?.id === core.id
                ? (settingsStore.vfxEnabled ? 'bg-white/20 border-2 border-lightBlue shadow-[0_0_40px_rgba(59,130,246,0.5)] -translate-y-4 scale-105' : 'bg-white/20 border-2 border-lightBlue -translate-y-4 scale-105')
                : (!core.isLocked ? (settingsStore.vfxEnabled ? 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-lightBlue/50 shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:-translate-y-2' : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-lightBlue/50 hover:-translate-y-2') : ''),
              loading && selectedCore?.id !== core.id && upgradeCores.length > 0 ? 'opacity-40 grayscale' : ''
            ]"
            @mouseenter="showTooltip(index); audioService.playHover()"
            @mouseleave="hideTooltip"
            @touchstart="handleTouchStart(index, $event)"
            @touchend="handleTouchEnd(core, $event)"
          >
            
            <div class="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <span
              class="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-widest"
              :class="core.isLocked
                ? 'text-red-400 bg-red-500/10 border-red-500/30'
                : core.classification === 'main'
                  ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                  : core.classification === 'power'
                    ? 'text-orange-400 bg-orange-500/10 border-orange-500/30'
                    : 'text-violet-400 bg-violet-500/10 border-violet-500/30'"
            >
              {{ core.isLocked ? '🔒 LOCKED CORE' : (core.classification === 'main' ? 'MAIN CORE' : (core.classification === 'power' ? 'UPGRADE CORE • POWER' : 'UPGRADE CORE • EFFECT')) }}
            </span>
            
            <div class="relative w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-br from-black/60 to-black/20 flex items-center justify-center mb-6 lg:mb-8 transition-all duration-500 border shadow-[inset_0_4px_20px_rgba(0,0,0,0.5)]"
              :class="core.isLocked
                ? 'border-red-500/50 text-gray-500'
                : selectedCore?.id === core.id ? 'border-lightBlue text-lightBlue shadow-[0_0_20px_rgba(59,130,246,0.6)]' : 'border-white/10 text-gray-400 group-hover:border-lightBlue group-hover:text-lightBlue group-hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]'">
              <img :src="core.icon" :alt="core.name"
                @error="onImgError"
                class="w-12 h-12 lg:w-16 lg:h-16 object-contain filter drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] transform transition-transform group-hover:scale-110 duration-300"
                :class="{ 'grayscale opacity-60': core.isLocked }" />

              <!-- Padlock Overlay -->
              <div v-if="core.isLocked" class="absolute inset-0 rounded-full bg-black/75 backdrop-blur-[2px] flex items-center justify-center border-2 border-red-500/60 shadow-inner">
                <svg class="w-8 h-8 text-red-400 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>

            <h3 class="text-3xl font-black mb-1 tracking-wide transition-colors duration-500"
              :class="core.isLocked ? 'text-gray-400' : (selectedCore?.id === core.id ? 'text-lightBlue' : 'text-white group-hover:text-lightBlue')">
              {{ core.name }}
            </h3>
            <span class="text-xs font-bold uppercase tracking-widest mb-4" :class="core.isLocked ? 'text-red-400/90' : 'text-lightOrange/90'">
              {{ core.isLocked ? '🔒 Mission Required' : `Upgrade Core (Tier ${core.tier || 2})` }}
            </span>

            <p v-if="!core.isLocked" class="text-base text-gray-300/80 leading-relaxed max-w-[250px] z-10">{{ core.description }}</p>
            <div v-else class="w-full bg-red-950/40 border border-red-500/30 rounded-xl p-3 text-center z-10">
              <p class="text-[10px] font-black uppercase tracking-wider text-red-400 mb-1 flex items-center justify-center gap-1">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Unlock Mission Requirement
              </p>
              <p class="text-xs font-bold text-red-200 leading-snug">
                {{ core.missionText || 'Complete gameplay missions to unlock this Core.' }}
              </p>
            </div>
          </div>

        </div>
      </div>
    </main>

    <div class="absolute bottom-0 left-0 z-20 h-2 w-full flex bg-black/50">
      <div class="h-full transition-all duration-1000 ease-linear rounded-r-full shadow-[0_0_10px_rgba(255,165,0,0.8)]"
        :class="timeLeft <= 5 ? 'bg-hexred shadow-[0_0_15px_rgba(230,57,70,0.8)]' : 'bg-gradient-to-r from-orange to-lightOrange'"
        :style="{ width: `${tutorial.isCurrentScreen('upgrade') ? 0 : (timeLeft / SELECTION_DURATION) * 100}%` }"></div>
    </div>

    <CoachMark 
      v-if="tutorial.isCurrentScreen('upgrade')"
      :targetId="tutorial.currentStepData.value?.targetId || ''"
      :message="tutorial.currentStepData.value?.message || ''"
      :title="tutorial.currentStepData.value?.title || ''"
      :icon="tutorial.currentStepData.value?.icon || ''"
      :step="tutorial.currentStepNumber.value"
      :totalSteps="tutorial.totalSteps"
      :keyHints="tutorial.currentStepData.value?.keyHints"
      :placement="tutorial.currentStepData.value?.placement"
      @next="tutorial.next"
      @skip="tutorial.complete"
    />

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useSettingsStore } from '../../stores/settingsStore'
import { useGameStore } from '../../stores/gameStore'
import { useMatchStore } from '../../stores/matchStore'
import { getCoreIconPath } from '../../game/cores/icons'
import CoreTooltip from './CoreTooltip.vue'
import CoachMark from '../tutorial/CoachMark.vue'
import { useTutorial } from '../../composables/useTutorial'
import { audioService } from '../../services/audioService'

const settingsStore = useSettingsStore()

const emit = defineEmits<{ (e: 'selected', coreId: string): void }>()
const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'

const gameStore = useGameStore()
const matchStore = useMatchStore()
const tutorial = useTutorial()

// ── Hover & Touch-Hold Tooltip Logic ─────────────────────────────────────────
const activeTooltipIndex = ref<number | null>(null)
let touchTimeout: ReturnType<typeof setTimeout> | null = null
let isHolding = false

function showTooltip(index: number) {
  activeTooltipIndex.value = index
}

function hideTooltip() {
  activeTooltipIndex.value = null
}

function onImgError(e: Event) {
  const target = e.target as HTMLImageElement | null
  if (target) {
    target.src = '/icons/cores/default.svg'
  }
}

function handleTouchStart(index: number, _e: TouchEvent) {
  isHolding = false
  if (touchTimeout) clearTimeout(touchTimeout)
  touchTimeout = setTimeout(() => {
    isHolding = true
    showTooltip(index)
  }, 250)
}

function handleTouchEnd(core: any, e: TouchEvent) {
  if (touchTimeout) {
    clearTimeout(touchTimeout)
    touchTimeout = null
  }
  
  e.preventDefault()
  
  if (isHolding) {
    hideTooltip()
  } else {
    selectCore(core)
  }
}

// Icon mapping is now centralized in game/cores/icons.ts

// ── State ───────────────────────────────────────────────────────────────────

import { useAuthStore } from '../../stores/authStore'
import { useMissionsStore } from '../../stores/missionsStore'
const authStore = useAuthStore()
const missionsStore = useMissionsStore()

type CoreOption = { id: string; name: string; description: string; icon: string; flat_buff: number; multiplier_buff: number; classification?: string; tier?: number; isLocked?: boolean; missionText?: string }

const upgradeCores = ref<CoreOption[]>([])
const loading = ref(true)
const selectedCore = ref<CoreOption | null>(null)
const offeredCoresSignature = ref<string>('')

const SELECTION_DURATION = 15
const timeLeft = ref(SELECTION_DURATION)
let timer: ReturnType<typeof setInterval> | null = null
let selectTimeout: ReturnType<typeof setTimeout> | null = null

function startTimer() {
  timer = setInterval(() => {
    if (tutorial.isCurrentScreen('upgrade')) return // Pause timer while tutorial is active

    if (timeLeft.value <= 1) {
      timeLeft.value = 0
      stopTimer()
      autoSelect()
    } else {
      timeLeft.value--
    }
  }, 1000)
}

function stopTimer() {
  if (timer) { clearInterval(timer); timer = null }
}

function autoSelect() {
  if (selectedCore.value) return // Wait for the timeout in selectCore to finish

  const unlockedOptions = upgradeCores.value.filter(c => !c.isLocked)
  if (unlockedOptions.length > 0) {
    const randomIndex = Math.floor(Math.random() * unlockedOptions.length)
    selectCore(unlockedOptions[randomIndex])
  } else {
    // If all offered options are locked, NEVER force-select a locked core.
    // Retain current active core for session continuity.
    emit('selected', gameStore.activeCoreId || '')
  }
}

async function fetchUpgradeCores() {
  loading.value = true
  try {
    const token = localStorage.getItem('arena_token')
    const prevCoreId = gameStore.activeCoreId
    const targetRound = matchStore.currentRound + 1

    const url = new URL(`${SERVER_URL}/api/game/cores`)
    if (prevCoreId) url.searchParams.append('previous_core_id', prevCoreId)
    url.searchParams.append('round', targetRound.toString())

    const res = await fetch(url.toString(), {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
    })
    if (!res.ok) throw new Error('failed')
    const data = await res.json()
    
    // Store signature for anti-cheat verification
    if (data.signature) {
      offeredCoresSignature.value = data.signature
    }

    const unlockedIds = new Set(authStore.profile?.unlocked_core_ids || [])

    const mappedCores = (data.cores ?? []).map((c: any) => {
      const isBaseCore = c.tier === 1 || c.core_type === 'main'
      const isUnlockedInMissions = missionsStore.isCoreUnlocked(c.name) || missionsStore.isCoreUnlocked(c.id)
      const isLocked = !isBaseCore && !unlockedIds.has(String(c.id)) && !unlockedIds.has(c.name) && !isUnlockedInMissions
      return {
        id: c.id,
        name: c.name,
        description: c.description,
        flat_buff: c.flat_buff,
        multiplier_buff: c.multiplier_buff,
        icon: getCoreIconPath(c.name, c.icon_url),
        classification: c.classification,
        tier: c.tier,
        isLocked,
        missionText: isLocked ? `Complete gameplay missions to unlock ${c.name}.` : ''
      }
    })

    const unlockedCores = mappedCores.filter((c: any) => !c.isLocked)
    if (unlockedCores.length > 0 && mappedCores.slice(0, 2).every((c: any) => c.isLocked)) {
      // Guarantee at least one unlocked card is displayed
      const firstUnlocked = unlockedCores[0]
      const remainingCores = mappedCores.filter((c: any) => c.id !== firstUnlocked.id)
      upgradeCores.value = [firstUnlocked, remainingCores[0]].filter(Boolean).sort(() => 0.5 - Math.random())
    } else {
      upgradeCores.value = mappedCores.slice(0, 2)
    }
  } catch (err) {
    console.error('Failed to fetch upgrade cores', err)
  } finally {
    loading.value = false
    startTimer()
  }
}

async function updateSessionCore(coreId: string) {
  try {
    const token = localStorage.getItem('arena_token')
    const res = await fetch(`${SERVER_URL}/api/game/session/core`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ 
        session_id: gameStore.sessionId, 
        new_core_id: coreId,
        signature: offeredCoresSignature.value
      })
    })

    if (!res.ok) {
      console.error('Failed to update session core')
    }
  } catch (err) {
    console.error('Error updating Session core:', err)
  }
}

// ── Select a Core Upgrade ───────────────────────────────────────────────────
async function selectCore(core: CoreOption) {
  if (loading.value) return

  // Early return guard: Block selecting locked cores strictly
  if (core.isLocked) {
    audioService.playError()
    return
  }

  selectedCore.value = core
  loading.value = true
  
  audioService.playClick()
  audioService.playCoreActivation(core.name)
  
  stopTimer()

  // Update Pinia state
  gameStore.activeCoreId = core.id
  gameStore.activeCoreName = core.name
  gameStore.coreHistory.push({ id: core.id, name: core.name, icon: core.icon })

  // Notify backend if session exists
  if (gameStore.sessionId) {
    await updateSessionCore(core.id)
  }

  // Brief visual feedback before closing the overlay
  if (selectTimeout) clearTimeout(selectTimeout)
  selectTimeout = setTimeout(() => {
    emit('selected', core.id)
  }, 500)
}

onMounted(() => {
  if (gameStore.coreHistory.length === 0 && gameStore.activeCoreName) {
    gameStore.coreHistory.push({
      id: gameStore.activeCoreId || '',
      name: gameStore.activeCoreName,
      icon: getCoreIconPath(gameStore.activeCoreName)
    })
  }
  fetchUpgradeCores()
})
onUnmounted(() => {
  stopTimer()
  if (touchTimeout) clearTimeout(touchTimeout)
  if (selectTimeout) clearTimeout(selectTimeout)
})
</script>

<style scoped>
.cyber-grid {
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 64px 64px;
}

.tech-border {
  position: relative;
}

.tech-border::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 2px;
  background: linear-gradient(60deg,
      rgba(255, 255, 255, 0.1) 0%,
      #3b82f6 30%,
      rgba(255, 165, 0, 0.8) 50%,
      #3b82f6 70%,
      rgba(255, 255, 255, 0.1) 100%);
  background-size: 300% 300%;
  animation: sweepGlow 4s linear infinite;
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
  z-index: 10;
}

.tech-border:hover::after {
  animation: sweepGlow 1.5s linear infinite;
  padding: 3px;
}

@keyframes sweepGlow {
  0% {
    background-position: 0% 50%;
  }

  100% {
    background-position: 100% 50%;
  }
}
</style>
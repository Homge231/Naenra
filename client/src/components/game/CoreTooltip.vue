<script setup lang="ts">
import { computed } from 'vue'
import { getCoreFamily } from '../../game/cores/families'
import { useMissionsStore } from '../../stores/missionsStore'

const props = withDefaults(
  defineProps<{
    core: {
      id: string
      name: string
      description: string
      flat_buff?: number
      multiplier_buff?: number
      tier?: number
      core_type?: string
      classification?: string
      isLocked?: boolean
      missionText?: string
    }
    isLocked?: boolean
    missionText?: string
    position?: 'top' | 'bottom'
    isMobile?: boolean
    showClose?: boolean
    showEvolutionBtn?: boolean
  }>(),
  {
    isLocked: false,
    missionText: '',
    position: 'top',
    isMobile: false,
    showClose: false,
    showEvolutionBtn: false
  }
)

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'viewEvolution'): void
}>()

const missionsStore = useMissionsStore()

// Evaluate whether the core is locked from either prop or core object
const isCoreLocked = computed(() => {
  return props.isLocked || (props.core as any)?.isLocked || false
})

// Find matching mission in missionsStore for locked core progress
const relatedMission = computed(() => {
  if (!props.core?.name) return null
  const coreNameLower = props.core.name.trim().toLowerCase()
  return missionsStore.missions.find(m =>
    m.unlockCoreName.trim().toLowerCase() === coreNameLower ||
    m.title.trim().toLowerCase() === coreNameLower ||
    m.coreFamily.trim().toLowerCase() === coreNameLower
  )
})

const familyName = computed(() => {
  return getCoreFamily(props.core.name) || 'unknown'
})

const FAMILY_CONFIGS: Record<string, {
  color: string
  border: string
  dot: string
  pointerBorder: string
  displayName: string
}> = {
  balanced: {
    color: 'text-blue-400',
    border: 'border-blue-500 shadow-[0_20px_50px_rgba(0,0,0,0.9)]',
    dot: 'bg-blue-500',
    pointerBorder: 'border-t-blue-500',
    displayName: 'Balanced'
  },
  combo: {
    color: 'text-orange-400',
    border: 'border-orange-500 shadow-[0_20px_50px_rgba(0,0,0,0.9)]',
    dot: 'bg-orange-500',
    pointerBorder: 'border-t-orange-500',
    displayName: 'Combo'
  },
  speedster: {
    color: 'text-cyan-400',
    border: 'border-cyan-400 shadow-[0_20px_50px_rgba(0,0,0,0.9)]',
    dot: 'bg-cyan-400',
    pointerBorder: 'border-t-cyan-400',
    displayName: 'Speedster'
  },
  oracle: {
    color: 'text-violet-400',
    border: 'border-violet-500 shadow-[0_20px_50px_rgba(0,0,0,0.9)]',
    dot: 'bg-violet-500',
    pointerBorder: 'border-t-violet-500',
    displayName: 'Oracle'
  },
  mission: {
    color: 'text-amber-400',
    border: 'border-amber-500 shadow-[0_20px_50px_rgba(0,0,0,0.9)]',
    dot: 'bg-amber-500',
    pointerBorder: 'border-t-amber-500',
    displayName: 'Mission'
  },
  aegis: {
    color: 'text-sky-400',
    border: 'border-sky-500 shadow-[0_20px_50px_rgba(0,0,0,0.9)]',
    dot: 'bg-sky-500',
    pointerBorder: 'border-t-sky-500',
    displayName: 'Aegis'
  },
  power: {
    color: 'text-pink-500',
    border: 'border-pink-500 shadow-[0_20px_50px_rgba(0,0,0,0.9)]',
    dot: 'bg-pink-500',
    pointerBorder: 'border-t-pink-500',
    displayName: 'Power'
  },
  pandora: {
    color: 'text-purple-500',
    border: 'border-purple-500 shadow-[0_20px_50px_rgba(0,0,0,0.9)]',
    dot: 'bg-purple-500',
    pointerBorder: 'border-t-purple-500',
    displayName: 'Pandora'
  },
  phoenix: {
    color: 'text-red-400',
    border: 'border-red-500 shadow-[0_20px_50px_rgba(0,0,0,0.9)]',
    dot: 'bg-red-500',
    pointerBorder: 'border-t-red-500',
    displayName: 'Phoenix'
  },
  highroller: {
    color: 'text-yellow-400',
    border: 'border-yellow-500 shadow-[0_20px_50px_rgba(0,0,0,0.9)]',
    dot: 'bg-yellow-500',
    pointerBorder: 'border-t-yellow-500',
    displayName: 'High Roller'
  }
}

const currentConfig = computed(() => {
  const family = familyName.value
  return FAMILY_CONFIGS[family] || {
    color: 'text-gray-400',
    border: 'border-gray-600 shadow-[0_20px_50px_rgba(0,0,0,0.9)]',
    dot: 'bg-gray-500',
    pointerBorder: 'border-t-gray-600',
    displayName: family.toUpperCase()
  }
})

const tierRoman = computed(() => {
  const t = props.core.tier || 1
  return t === 3 ? 'III' : t === 2 ? 'II' : 'I'
})

const traitConfig = computed(() => {
  const family = familyName.value
  if (['power', 'combo', 'speedster', 'highroller'].includes(family)) {
    return {
      label: 'Score Multiplier',
      icon: '🔥',
      color: 'text-orange-400',
      bg: 'bg-orange-950/60 border-orange-800',
      desc: 'Amplifies base typing score per correct word.'
    }
  }
  if (['aegis', 'oracle', 'mission', 'pandora', 'phoenix'].includes(family)) {
    return {
      label: 'Special Mechanic',
      icon: '🔮',
      color: 'text-violet-400',
      bg: 'bg-violet-950/60 border-violet-800',
      desc: 'Grants unique tactical abilities in battle.'
    }
  }
  return {
    label: 'Standard Buff',
    icon: '⚡',
    color: 'text-blue-400',
    bg: 'bg-blue-950/60 border-blue-800',
    desc: 'Provides steady performance boost.'
  }
})

const stats = computed(() => {
  const mult = props.core.multiplier_buff ?? 1.0
  const flat = props.core.flat_buff ?? 0
  const family = familyName.value

  const multiplierStr = mult > 1.0 ? `+${Math.round((mult - 1) * 100)}%` : 'Base'
  const flatStr = flat > 0 ? `+${flat} pts` : '0 pts'
  let penaltyStr = 'Standard'
  let specialMechanic = ''

  switch (family) {
    case 'aegis':
      penaltyStr = 'Protected'
      specialMechanic = 'Consumes 1 shield instead of applying full penalty on wrong answer.'
      break
    case 'oracle':
      specialMechanic = 'Reveals letter slot hints during typing rounds.'
      break
    case 'mission':
      specialMechanic = 'Awards massive points once milestone is reached.'
      break
    case 'pandora':
      specialMechanic = 'Shapeshifts randomly into another core during match.'
      break
    case 'phoenix':
      penaltyStr = 'Recoverable'
      specialMechanic = 'Restores score momentum when building streaks.'
      break
    case 'highroller':
      penaltyStr = 'High Risk'
      specialMechanic = 'High risk gamble for maximum multiplier payouts.'
      break
  }

  return {
    multiplier: multiplierStr,
    flat: flatStr,
    penalty: penaltyStr,
    mechanic: specialMechanic
  }
})
</script>

<template>
  <div 
    class="relative z-[9999] w-[320px] sm:w-[340px] max-w-[90vw] p-3.5 sm:p-4 rounded-2xl border-2 text-left flex flex-col gap-2.5 sm:gap-3 transition-all duration-300 select-none bg-slate-950 shadow-2xl overflow-hidden box-border"
    :class="[
      isCoreLocked ? 'border-red-500 shadow-[0_20px_50px_rgba(239,68,68,0.4)]' : currentConfig.border
    ]"
  >
    <!-- Close Button (Visible when isMobile or showClose is true) -->
    <button 
      v-if="isMobile || showClose"
      @click.stop="emit('close')"
      class="absolute top-2.5 right-2.5 text-gray-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-colors cursor-pointer z-20 pointer-events-auto"
      title="Close Details"
    >
      ✕
    </button>

    <!-- 🔒 LOCKED POPUP CONTENT (Replaces upgrade stats until unlocked) -->
    <template v-if="isCoreLocked">
      <div class="flex items-start justify-between border-b border-red-900/60 pb-2.5 pr-6">
        <div class="flex flex-col gap-0.5">
          <div class="flex items-center gap-1.5 text-red-400">
            <span class="text-sm">🔒</span>
            <h4 class="text-white text-sm font-black tracking-wide uppercase">
              {{ core.name }}
            </h4>
          </div>
          <span class="text-[9px] font-bold text-red-300/80 uppercase tracking-widest">
            Tier {{ tierRoman }} Core • LOCKED
          </span>
        </div>
        <span class="px-2 py-0.5 rounded-full bg-red-950 border border-red-700 text-[8px] font-black uppercase tracking-widest text-red-300 animate-pulse">
          Locked
        </span>
      </div>

      <!-- Mission Progress & Details Box -->
      <div class="flex flex-col gap-2 p-3 rounded-xl bg-red-950/70 border border-red-600/80 text-red-100">
        <div class="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-red-300">
          <span class="flex items-center gap-1">🎯 Mission Requirement</span>
          <span class="text-[9px] bg-red-900/90 px-1.5 py-0.5 rounded text-white">
            {{ relatedMission ? `${relatedMission.currentProgress}/${relatedMission.targetCount}` : 'Required' }}
          </span>
        </div>

        <p class="text-[11px] font-bold text-red-100 leading-snug">
          {{ relatedMission?.description || props.missionText || props.core.missionText || `Complete the gameplay mission challenge to unlock ${core.name}.` }}
        </p>

        <!-- Mission Progress Bar -->
        <div v-if="relatedMission" class="flex flex-col gap-1 mt-0.5">
          <div class="flex justify-between text-[9px] font-black text-red-300">
            <span>Mission Progress</span>
            <span>{{ Math.round((relatedMission.currentProgress / relatedMission.targetCount) * 100) }}%</span>
          </div>
          <div class="w-full h-2 bg-red-950 rounded-full overflow-hidden p-0.5 border border-red-800">
            <div 
              class="h-full rounded-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500"
              :style="{ width: `${Math.min(100, (relatedMission.currentProgress / relatedMission.targetCount) * 100)}%` }"
            ></div>
          </div>
        </div>
      </div>

      <div class="p-2 rounded-xl bg-slate-900 border border-red-900/50 text-[10px] font-bold text-gray-300 leading-snug flex items-center gap-1.5">
        <span class="text-sm shrink-0">💡</span>
        <span>Complete & claim in <strong class="text-orange-400">Missions Dashboard</strong> to unlock!</span>
      </div>
    </template>

    <!-- ✨ UNLOCKED UPGRADE DETAILS (Shown ONLY after core is unlocked) -->
    <template v-else>
      <div class="flex items-start justify-between border-b border-slate-700/80 pb-2.5 pr-6">
        <div class="flex flex-col gap-0.5">
          <h4 class="text-white text-sm font-black tracking-wide uppercase">
            {{ core.name }}
          </h4>
          <span class="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
            Tier {{ tierRoman }} Core
          </span>
          <span
            class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-widest w-fit mt-0.5"
            :class="[traitConfig.color, traitConfig.bg]"
          >
            {{ traitConfig.icon }} {{ traitConfig.label }}
          </span>
        </div>
        <span class="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-[8px] font-bold uppercase tracking-widest text-gray-300">
          <span class="w-1.5 h-1.5 rounded-full shrink-0" :class="currentConfig.dot"></span>
          {{ currentConfig.displayName }}
        </span>
      </div>

      <div class="grid grid-cols-3 gap-1.5 py-0.5">
        <div class="flex flex-col gap-0.5 items-center bg-slate-900 px-1.5 py-1.5 rounded-lg border border-slate-800">
          <span class="text-[8px] font-bold text-gray-400 uppercase tracking-wider text-center">Multiplier</span>
          <span class="text-xs font-black text-white font-mono flex-1 flex items-center">{{ stats.multiplier }}</span>
        </div>
        <div class="flex flex-col gap-0.5 items-center bg-slate-900 px-1.5 py-1.5 rounded-lg border border-slate-800">
          <span class="text-[8px] font-bold text-gray-400 uppercase tracking-wider text-center">Flat Buff</span>
          <span class="text-xs font-black text-white font-mono flex-1 flex items-center">{{ stats.flat }}</span>
        </div>
        <div class="flex flex-col gap-0.5 items-center bg-slate-900 px-1 py-1.5 rounded-lg border border-slate-800">
          <span class="text-[8px] font-bold text-gray-400 uppercase tracking-wider text-center">Mistakes</span>
          <span class="text-[9px] leading-tight font-black font-mono text-center flex-1 flex items-center justify-center" 
                :class="stats.penalty !== 'Standard' ? 'text-orange-400' : 'text-gray-300'">
            {{ stats.penalty }}
          </span>
        </div>
      </div>

      <div
        class="flex items-start gap-1.5 px-2.5 py-1.5 rounded-lg border text-[9px] leading-snug"
        :class="[traitConfig.color, traitConfig.bg]"
      >
        <span class="shrink-0">{{ traitConfig.icon }}</span>
        <span class="text-gray-200">{{ traitConfig.desc }}</span>
      </div>

      <div class="flex flex-col gap-1 text-[11px] text-gray-300 leading-snug">
        <p class="font-bold text-[8px] text-gray-400 uppercase tracking-widest">Tactical Description</p>
        <p class="italic text-gray-400 text-[10px]">
          "{{ core.description }}"
        </p>
        <div v-if="stats.mechanic" class="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[10px] leading-snug text-blue-300">
          {{ stats.mechanic }}
        </div>
      </div>

      <button 
        v-if="showEvolutionBtn"
        @click.stop="emit('viewEvolution')"
        class="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 hover:brightness-110 text-white font-black text-[11px] uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-1 pointer-events-auto"
      >
        <span>View Evolution Paths</span>
        <span class="text-sm">➔</span>
      </button>
    </template>

    <!-- Pointer arrow (only on desktop non-mobile) -->
    <template v-if="!isMobile">
      <div 
        v-if="position === 'bottom'"
        class="absolute bottom-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px]"
        :class="isCoreLocked ? 'border-b-red-500' : currentConfig.pointerBorder.replace('border-t-', 'border-b-')"
      ></div>
      <div 
        v-else
        class="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px]"
        :class="isCoreLocked ? 'border-t-red-500' : currentConfig.pointerBorder"
      ></div>
    </template>
  </div>
</template>
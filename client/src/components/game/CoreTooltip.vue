<script setup lang="ts">
import { computed } from 'vue'
import { getCoreFamily } from '../../game/cores/families'

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
    }
    position?: 'top' | 'bottom'
  }>(),
  {
    position: 'top'
  }
)

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
  unknown: {
    color: 'text-gray-400',
    border: 'border-gray-500 shadow-[0_20px_50px_rgba(0,0,0,0.95)]',
    dot: 'bg-gray-400',
    pointerBorder: 'border-t-gray-500',
    displayName: 'Standard'
  }
}

const currentConfig = computed(() => {
  return FAMILY_CONFIGS[familyName.value] || FAMILY_CONFIGS.unknown
})

const coreTrait = computed(() => {
  const c = props.core.classification ?? ''
  if (c === 'power') return 'power'
  if (c === 'effect') return 'effect'
  return 'unknown'
})

// MÀU NỀN ĐẶC CHO TRAIT BOX (bg-slate-900)
const TRAIT_CONFIG = {
  power: {
    label: 'Power Core',
    icon: '⚔️',
    color: 'text-orange-400',
    bg: 'bg-slate-900 border-orange-500/50',
    desc: 'Amplifies score — multipliers, flat buffs & speed bonuses.'
  },
  effect: {
    label: 'Effect Core',
    icon: '🔮',
    color: 'text-violet-400',
    bg: 'bg-slate-900 border-violet-500/50',
    desc: 'Grants special mechanics — shields, hints, missions & chaos.'
  },
  unknown: {
    label: 'Standard',
    icon: '◆',
    color: 'text-gray-400',
    bg: 'bg-slate-900 border-gray-500/50',
    desc: 'Base scoring — no bonus mechanics.'
  }
}

const traitConfig = computed(() => TRAIT_CONFIG[coreTrait.value])

const tierRoman = computed(() => {
  const t = props.core.tier ?? 1
  if (t === 2) return 'II'
  if (t === 3) return 'III'
  return 'I'
})

const stats = computed(() => {
  const m = props.core.multiplier_buff ?? 1.0
  const f = props.core.flat_buff ?? 0

  let multiplierStr = `x${m.toFixed(1)}`
  let flatStr = f > 0 ? `+${f} PTS` : '0'
  let penaltyStr = 'Standard'
  let specialMechanic = ''

  switch (familyName.value) {
    case 'power':
      penaltyStr = props.core.tier === 3 ? 'Triple (3.0x)' : 'Double (2.0x)'
      specialMechanic = 'Sacrifices stability for raw scoring power. Highly volatile.'
      break
    case 'balanced':
      penaltyStr = 'None (0x)'
      specialMechanic = 'Protects score from dropping. Completely immune to wrong answer penalties.'
      break
    case 'combo':
      specialMechanic = 'Gives cumulative streak bonuses up to +100 points per correct answer.'
      break
    case 'speedster':
      multiplierStr = 'N/A'
      flatStr = 'Up to +150'
      specialMechanic = 'Adds score bonuses based on how quickly you type the words.'
      break
    case 'oracle':
      penaltyStr = 'High (Stacking)'
      specialMechanic = 'Gives progressive letter hints but penalizes wrong answers based on hint levels used.'
      break
    case 'aegis':
      specialMechanic = 'Generates shields that absorb mistakes. Shield capacity is tier-dependent.'
      break
    case 'mission':
      specialMechanic = 'Awards massive points once you complete typing-streak milestones.'
      break
    case 'pandora':
      specialMechanic = 'Randomly shapeshifts into another Tier 1 core every 15-20 seconds during battle.'
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
    class="absolute z-[9999] left-1/2 -translate-x-1/2 w-[340px] max-w-[90vw] p-5 rounded-2xl border-2 text-left flex flex-col gap-4 transition-all duration-300 pointer-events-none select-none bg-slate-950"
    :class="[
      currentConfig.border,
      position === 'bottom' ? 'top-full mt-3' : 'bottom-full mb-6'
    ]"
  >
    <div class="flex items-start justify-between border-b border-slate-700 pb-3">
      <div class="flex flex-col gap-1">
        <h4 class="text-white text-base font-black tracking-wide uppercase">
          {{ core.name }}
        </h4>
        <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Tier {{ tierRoman }} Core
        </span>
        <span
          class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border-2 text-[9px] font-black uppercase tracking-widest w-fit mt-0.5"
          :class="[traitConfig.color, traitConfig.bg]"
        >
          {{ traitConfig.icon }} {{ traitConfig.label }}
        </span>
      </div>
      <span class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border-2 border-slate-700 text-[9px] font-bold uppercase tracking-widest text-gray-300">
        <span class="w-1.5 h-1.5 rounded-full shrink-0" :class="currentConfig.dot"></span>
        {{ currentConfig.displayName }}
      </span>
    </div>

    <div class="grid grid-cols-3 gap-2 py-1">
      <div class="flex flex-col gap-0.5 items-center bg-slate-900 px-2 py-2 rounded-lg border border-slate-700">
        <span class="text-[8px] font-bold text-gray-400 uppercase tracking-wider text-center">Multiplier</span>
        <span class="text-sm font-black text-white font-mono flex-1 flex items-center">{{ stats.multiplier }}</span>
      </div>
      <div class="flex flex-col gap-0.5 items-center bg-slate-900 px-2 py-2 rounded-lg border border-slate-700">
        <span class="text-[8px] font-bold text-gray-400 uppercase tracking-wider text-center">Flat Buff</span>
        <span class="text-sm font-black text-white font-mono flex-1 flex items-center">{{ stats.flat }}</span>
      </div>
      <div class="flex flex-col gap-0.5 items-center bg-slate-900 px-1 py-2 rounded-lg border border-slate-700">
        <span class="text-[8px] font-bold text-gray-400 uppercase tracking-wider text-center">Mistakes</span>
        <span class="text-[10px] leading-tight font-black font-mono text-center flex-1 flex items-center justify-center" 
              :class="stats.penalty !== 'Standard' ? 'text-orange-400' : 'text-gray-300'">
          {{ stats.penalty }}
        </span>
      </div>
    </div>

    <div
      class="flex items-start gap-2 px-3 py-2 rounded-xl border-2 text-[10px] leading-relaxed"
      :class="[traitConfig.color, traitConfig.bg]"
    >
      <span class="mt-0.5 shrink-0">{{ traitConfig.icon }}</span>
      <span class="text-gray-200">{{ traitConfig.desc }}</span>
    </div>

    <div class="flex flex-col gap-1.5 text-xs text-gray-300 leading-relaxed">
      <p class="font-bold text-[9px] text-gray-400 uppercase tracking-widest mb-0.5">Tactical Description</p>
      <p class="italic text-gray-400 mb-1">
        "{{ core.description }}"
      </p>
      <div v-if="stats.mechanic" class="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-[11px] leading-relaxed text-blue-300">
        {{ stats.mechanic }}
      </div>
    </div>

    <div 
      v-if="position === 'bottom'"
      class="absolute bottom-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px]"
      :class="currentConfig.pointerBorder.replace('border-t-', 'border-b-')"
    ></div>
    <div 
      v-else
      class="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px]"
      :class="currentConfig.pointerBorder"
    ></div>
  </div>
</template>
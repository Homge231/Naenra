<template>
  <div
    @click="handleClick"
    class="group relative backdrop-blur-xl rounded-2xl p-6 md:p-8 transition-all duration-500 flex flex-col items-center text-center overflow-hidden h-full select-none"
    :class="[
      isLocked
        ? 'bg-black/40 border border-gray-700/50 cursor-not-allowed opacity-75 grayscale'
        : isSelected
          ? (vfxEnabled ? 'bg-white/20 border-2 border-lightBlue shadow-[0_0_40px_rgba(59,130,246,0.5)] -translate-y-2 scale-105 cursor-pointer' : 'bg-white/20 border-2 border-lightBlue -translate-y-2 scale-105 cursor-pointer')
          : (vfxEnabled ? 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-lightBlue/50 shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:-translate-y-1 cursor-pointer' : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-lightBlue/50 hover:-translate-y-1 cursor-pointer')
    ]"
  >
    <!-- Background Shimmer -->
    <div v-if="!isLocked" class="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

    <!-- Core Trait/Classification Badge -->
    <span
      class="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-widest"
      :class="isLocked
        ? 'text-gray-400 bg-gray-800/50 border-gray-700'
        : core.classification === 'main'
          ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
          : core.classification === 'power'
            ? 'text-orange-400 bg-orange-500/10 border-orange-500/30'
            : 'text-violet-400 bg-violet-500/10 border-violet-500/30'"
    >
      {{ isLocked ? '🔒 LOCKED CORE' : (core.classification === 'main' ? 'MAIN CORE' : (core.classification === 'power' ? 'UPGRADE CORE • POWER' : 'UPGRADE CORE • EFFECT')) }}
    </span>

    <!-- Core Icon Container -->
    <div
      class="relative w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-br from-black/60 to-black/20 flex items-center justify-center mb-5 transition-all duration-500 border shadow-[inset_0_4px_20px_rgba(0,0,0,0.5)]"
      :class="isLocked
        ? 'border-red-500/40 text-gray-500'
        : isSelected
          ? 'border-lightBlue text-lightBlue shadow-[0_0_20px_rgba(59,130,246,0.6)]'
          : 'border-white/10 text-gray-400 group-hover:border-lightBlue group-hover:text-lightBlue group-hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]'"
    >
      <img
        :src="core.icon || core.icon_url"
        :alt="core.name"
        @error="onImgError"
        class="w-12 h-12 lg:w-16 lg:h-16 object-contain filter drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-transform duration-300"
        :class="{ 'scale-110': !isLocked && isSelected, 'filter grayscale opacity-60': isLocked }"
      />

      <!-- Locked Padlock Icon Overlay -->
      <div v-if="isLocked" class="absolute inset-0 rounded-full bg-black/65 backdrop-blur-[2px] flex flex-col items-center justify-center border-2 border-red-500/50 shadow-inner">
        <svg class="w-8 h-8 text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
    </div>

    <!-- Core Title & Tier -->
    <h3
      class="text-2xl lg:text-3xl font-black mb-1 tracking-wide transition-colors duration-500"
      :class="isLocked ? 'text-gray-400' : (isSelected ? 'text-lightBlue' : 'text-white group-hover:text-lightBlue')"
    >
      {{ core.name }}
    </h3>
    <span class="text-[10px] lg:text-xs font-bold uppercase tracking-widest mb-3" :class="isLocked ? 'text-red-400/80' : 'text-lightOrange/90'">
      {{ isLocked ? '🔒 Mission Required' : `Upgrade Core (Tier ${core.tier || 2})` }}
    </span>

    <!-- Description or Mission Requirement -->
    <p v-if="!isLocked" class="text-xs lg:text-sm text-gray-300/80 leading-relaxed max-w-[260px]">
      {{ core.description }}
    </p>

    <div v-else class="w-full bg-red-950/40 border border-red-500/30 rounded-xl p-3 text-center">
      <p class="text-[9px] font-black uppercase tracking-wider text-red-400 mb-1 flex items-center justify-center gap-1">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        Unlock Mission Requirement
      </p>
      <p class="text-xs font-bold text-red-200 leading-snug">
        {{ missionText || 'Complete gameplay missions to unlock this Core.' }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { audioService } from '../../services/audioService'

const props = withDefaults(
  defineProps<{
    core: {
      id: string
      name: string
      description: string
      icon?: string
      icon_url?: string
      classification?: string
      tier?: number
    }
    isLocked?: boolean
    missionText?: string
    isSelected?: boolean
    vfxEnabled?: boolean
  }>(),
  {
    isLocked: false,
    missionText: '',
    isSelected: false,
    vfxEnabled: true
  }
)

const emit = defineEmits<{ (e: 'select', core: any): void }>()

function onImgError(e: Event) {
  const target = e.target as HTMLImageElement | null
  if (target) {
    target.src = '/icons/cores/default.svg'
  }
}

function handleClick() {
  if (props.isLocked) {
    audioService.playError()
    return
  }
  emit('select', props.core)
}
</script>

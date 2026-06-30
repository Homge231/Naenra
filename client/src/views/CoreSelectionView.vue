<template>
<div class="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md">
<div class="relative w-full max-w-4xl px-4 md:px-8 flex flex-col items-center">
<h2 class="text-4xl md:text-5xl font-black text-white mb-3 drop-shadow-[0_0_20px_rgba(59,130,246,0.6)] tracking-widest text-center uppercase">
        Tactical Support
</h2>
<p class="text-lightBlue/80 mb-12 text-sm md:text-base tracking-[0.2em] uppercase text-center font-bold">
        Select 1 of 2 available cores for this round
</p>
 
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 w-full">
<div v-for="core in supportCores" :key="core.id"
             @click="selectCore(core)"
             class="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 hover:bg-white/10 hover:border-lightBlue/50 cursor-pointer transition-all duration-500 shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:shadow-[0_0_40px_rgba(59,130,246,0.3)] hover:-translate-y-4 flex flex-col items-center text-center overflow-hidden">
<div class="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
 
          <div class="relative w-24 h-24 rounded-full bg-gradient-to-br from-black/60 to-black/20 flex items-center justify-center mb-8 group-hover:from-blue/20 group-hover:to-lightBlue/10 transition-all duration-500 border border-white/10 group-hover:border-lightBlue shadow-[inset_0_4px_20px_rgba(0,0,0,0.5)] group-hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]">
<svg class="w-12 h-12 text-gray-400 group-hover:text-lightBlue transition-colors duration-500 drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" :d="core.icon" />
</svg>
</div>
 
          <h3 class="text-3xl font-black text-white mb-4 tracking-wide group-hover:text-lightBlue transition-colors duration-500">
            {{ core.title }}
</h3>
<p class="text-base text-gray-300/80 leading-relaxed max-w-[250px]">
            {{ core.description }}
</p>
 
          <div class="mt-10 opacity-0 group-hover:opacity-100 transition-all transform translate-y-6 group-hover:translate-y-0 duration-500">
<div class="relative px-8 py-3 bg-blue/20 rounded-full border border-lightBlue overflow-hidden shadow-[0_0_15px_rgba(59,130,246,0.5)]">
<div class="absolute inset-0 bg-lightBlue/20 animate-pulse"></div>
<span class="relative z-10 text-xs font-black text-lightBlue tracking-[0.2em] uppercase drop-shadow-md">Select</span>
</div>
</div>
</div>
</div>
 
    </div>
</div>
</template>
 
<script setup lang="ts">
import { ref, onMounted } from 'vue'
 
interface SupportCore {
  id: string
  title: string
  description: string
  icon: string
}
 
const emit = defineEmits<{
  (e: 'coreSelected', core: SupportCore): void
}>()
 
const MOCK_CORES: SupportCore[] = [
  { id: 'core-time', title: 'Time Freeze', description: 'Pauses the timer for 5 seconds once per match.', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  { id: 'core-score', title: 'Score Multiplier', description: 'Earn 1.5x points for the next 3 correct answers.', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
  { id: 'core-hint', title: 'Hint Reveal', description: 'Automatically reveals the first letter of the target word.', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' }
]
 
const supportCores = ref<SupportCore[]>([])
 
function fetchSupportCores() {
  const shuffledCores = [...MOCK_CORES].sort(() => 0.5 - Math.random())
  supportCores.value = shuffledCores.slice(0, 2)
}
 
function selectCore(core: SupportCore) {
  emit('coreSelected', core)
}
 
onMounted(() => {
  fetchSupportCores()
})
</script>
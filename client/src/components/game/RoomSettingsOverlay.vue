<template>
  <transition name="fade">
    <div v-if="isOpen" class="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4">
      <!-- Backdrop -->
      <div 
        class="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        @click="close"
      ></div>

      <!-- Modal Content Container -->
      <div class="relative w-full max-w-xl bg-gradient-to-b from-[#182032] via-[#111726] to-[#0a0e1a] backdrop-blur-2xl border border-white/20 rounded-3xl shadow-[0_0_60px_rgba(0,0,0,0.9)] p-5 sm:p-7 overflow-hidden flex flex-col gap-6 max-h-[90vh]">
        
        <!-- Ambient Glowing Orbs -->
        <div class="absolute -top-20 -left-20 w-56 h-56 bg-orange-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-20 -right-20 w-56 h-56 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <!-- Header -->
        <div class="flex justify-between items-center pb-4 border-b border-white/15 relative z-10">
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 shadow-lg shadow-orange-500/30 flex items-center justify-center text-white flex-shrink-0">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
            </div>
            <div>
              <h2 class="text-xl font-black uppercase tracking-wider text-white flex items-center gap-2">
                Room Settings
              </h2>
              <p class="text-xs text-gray-300 font-medium">Customize match rules, question topics & core restrictions</p>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <span :class="['px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest shadow-md', isHost ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-black shadow-emerald-500/20' : 'bg-gray-700 text-gray-200 border border-gray-600']">
              {{ isHost ? 'HOST CONTROLS' : 'VIEW ONLY' }}
            </span>
            <button 
              @click="close"
              class="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-gray-200 hover:text-white transition-all flex items-center justify-center focus:outline-none shadow"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Body Scrollable Content -->
        <div class="space-y-6 flex-1 overflow-y-auto pr-1.5 custom-scrollbar relative z-10">
          
          <!-- SECTION 01: Question Topic -->
          <div class="space-y-3 bg-white/5 border border-white/15 rounded-2xl p-4">
            <div class="flex items-center justify-between">
              <label class="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                <svg class="w-4 h-4 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"></path>
                </svg>
                Question Topic
              </label>
              <span class="text-[11px] text-pink-300 font-bold uppercase tracking-wider bg-pink-500/20 px-2 py-0.5 rounded border border-pink-500/30">3 Assigned Topics</span>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button 
                v-for="t in topicsList" 
                :key="t.id"
                :disabled="!isHost"
                @click="localMetadata.topic = t.id"
                :class="[
                  'flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all duration-200 gap-1.5 relative overflow-hidden group shadow-md',
                  localMetadata.topic === t.id 
                    ? 'bg-gradient-to-br from-pink-500 to-purple-600 border-pink-300 text-white shadow-pink-500/30 scale-[1.02]' 
                    : 'bg-black/40 border-white/10 text-gray-300 hover:text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed'
                ]"
              >
                <span class="text-2xl group-hover:scale-110 transition-transform">{{ t.icon }}</span>
                <span class="text-xs font-black uppercase tracking-wider text-white">{{ t.name }}</span>
                <span :class="['text-[10px] leading-tight font-medium', localMetadata.topic === t.id ? 'text-pink-100' : 'text-gray-400']">{{ t.desc }}</span>
              </button>
            </div>
          </div>

          <!-- SECTION 02: Match Mode (Pure Skill Switch) -->
          <div class="bg-white/5 border border-white/15 rounded-2xl p-4 flex items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <div :class="['w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg transition-all flex-shrink-0', localMetadata.pureSkillMode ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-orange-500/30' : 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-purple-500/30']">
                <svg v-if="localMetadata.pureSkillMode" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
                <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
                </svg>
              </div>
              <div>
                <div class="flex items-center gap-2.5">
                  <h3 class="text-xs font-black uppercase tracking-wider text-white">Pure Skill Mode</h3>
                  <span :class="['px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider shadow', localMetadata.pureSkillMode ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-black' : 'bg-purple-500/30 border border-purple-400/50 text-purple-200']">
                    {{ localMetadata.pureSkillMode ? 'ACTIVE (NO CORES)' : 'CORES ENABLED' }}
                  </span>
                </div>
                <p class="text-[11px] text-gray-300 font-medium mt-0.5">Disables all Support Cores for a 100% pure typing speed duel.</p>
              </div>
            </div>

            <button 
              :disabled="!isHost"
              @click="togglePureSkillMode"
              :class="[
                'w-13 h-7 rounded-full transition-colors relative flex items-center p-1 flex-shrink-0 border',
                localMetadata.pureSkillMode ? 'bg-gradient-to-r from-amber-500 to-orange-500 border-orange-300 shadow-md shadow-orange-500/40' : 'bg-gray-700 border-gray-600',
                !isHost ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              ]"
            >
              <span 
                class="w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200"
                :class="localMetadata.pureSkillMode ? 'translate-x-6' : 'translate-x-0'"
              ></span>
            </button>
          </div>

          <!-- SECTION 03: Vocabulary Level -->
          <div class="space-y-3 bg-white/5 border border-white/15 rounded-2xl p-4">
            <div class="flex items-center justify-between">
              <label class="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                <svg class="w-4 h-4 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                </svg>
                Vocabulary Difficulty
              </label>
              <span class="text-[11px] text-sky-300 font-bold uppercase tracking-wider bg-sky-500/20 px-2 py-0.5 rounded border border-sky-500/30">CEFR Standard</span>
            </div>

            <div class="grid grid-cols-3 gap-2 p-1.5 bg-black/50 rounded-xl border border-white/10">
              <button 
                v-for="lvl in levelsList" 
                :key="lvl.id"
                :disabled="!isHost"
                @click="localMetadata.vocabularyLevel = lvl.id"
                :class="[
                  'py-2.5 px-3 text-center rounded-lg transition-all duration-200 flex flex-col items-center gap-0.5 shadow-sm',
                  localMetadata.vocabularyLevel === lvl.id 
                    ? 'bg-gradient-to-r from-sky-500 to-blue-600 border border-sky-300 text-white font-black shadow-sky-500/30 scale-[1.02]' 
                    : 'text-gray-300 hover:text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed'
                ]"
              >
                <span class="text-xs font-black uppercase tracking-wider text-white">{{ lvl.name }}</span>
                <span :class="['text-[10px] font-bold', localMetadata.vocabularyLevel === lvl.id ? 'text-sky-100' : 'text-gray-400']">{{ lvl.cefr }}</span>
              </button>
            </div>
            <p class="text-[11px] text-gray-300 font-medium italic">Sets match vocabulary starting difficulty (A1-A2 in Round 1, B1-B2 in Round 2, C1 in Round 3).</p>
          </div>

          <!-- SECTION 04: Support Core Restrictions -->
          <div class="space-y-3 bg-white/5 border border-white/15 rounded-2xl p-4">
            <div class="flex items-center justify-between">
              <label class="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                <svg class="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
                </svg>
                Core Ability Restrictions
              </label>
              <span class="text-[11px] text-purple-300 font-bold uppercase tracking-wider bg-purple-500/20 px-2 py-0.5 rounded border border-purple-500/30">
                {{ localMetadata.disabledCores.length }} Banned
              </span>
            </div>

            <div v-if="allCores.length === 0" class="text-xs text-gray-400 italic text-center py-4">Loading core abilities...</div>
            <div 
              v-else 
              :class="[
                'grid grid-cols-2 gap-2.5 max-h-48 overflow-y-auto custom-scrollbar pr-1 transition-opacity duration-300',
                localMetadata.pureSkillMode ? 'opacity-30 pointer-events-none' : ''
              ]"
            >
              <div 
                v-for="core in allCores" 
                :key="core.id"
                class="flex items-center justify-between p-2.5 bg-black/50 rounded-xl border border-white/10 hover:border-white/20 transition-colors shadow-sm"
              >
                <div class="flex items-center gap-2 overflow-hidden">
                  <div class="w-6 h-6 rounded-lg bg-purple-500/30 border border-purple-400/50 flex items-center justify-center flex-shrink-0">
                    <img v-if="core.icon_url" :src="core.icon_url" class="w-4 h-4 object-contain" />
                    <span v-else class="text-[10px] font-bold text-purple-300">⚡</span>
                  </div>
                  <span class="text-xs font-bold text-white truncate" :title="core.name">{{ core.name }}</span>
                </div>

                <button 
                  :disabled="!isHost"
                  @click="toggleCore(core.id)"
                  :class="[
                    'w-8 h-4 rounded-full transition-colors relative flex items-center p-0.5 flex-shrink-0',
                    !localMetadata.disabledCores.includes(core.id) ? 'bg-emerald-500 shadow-sm shadow-emerald-500/30' : 'bg-red-500/80 shadow-sm shadow-red-500/30',
                    !isHost ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  ]"
                >
                  <span 
                    class="w-3 h-3 bg-white rounded-full shadow-md transition-transform duration-200"
                    :class="!localMetadata.disabledCores.includes(core.id) ? 'translate-x-4' : 'translate-x-0'"
                  ></span>
                </button>
              </div>
            </div>
          </div>
          
        </div>

        <!-- Footer / Save Button -->
        <div class="pt-4 border-t border-white/15 mt-auto relative z-10 flex flex-col gap-2">
          <button 
            v-if="isHost"
            @click="saveAndClose"
            class="w-full py-3.5 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-400 hover:via-red-400 hover:to-pink-400 text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
            </svg>
            Save Room Settings
          </button>

          <div v-else class="py-3 bg-white/5 border border-white/10 rounded-xl text-center">
            <p class="text-xs font-bold text-gray-300 uppercase tracking-widest flex items-center justify-center gap-2">
              <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
              Only the Host can edit settings
            </p>
          </div>
        </div>
        
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { fetchWithAuth } from '../../services/api'

const props = defineProps<{
  isOpen: boolean
  isHost: boolean
  metadata: {
    vocabularyLevel: string
    difficulty: string
    topic: string
    disabledCores: string[]
    pureSkillMode: boolean
  }
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', newMetadata: { vocabularyLevel: string, difficulty: string, topic: string, disabledCores: string[], pureSkillMode: boolean }): void
}>()

const topicsList = [
  { id: 'Any', name: 'ANY', icon: '🎲', desc: 'Random Mix' },
  { id: 'daily-life', name: 'DAILY LIFE', icon: '🏠', desc: 'Habits & Routine' },
  { id: 'cafe', name: 'CAFE', icon: '☕', desc: 'Culinary Culture' },
  { id: 'travel', name: 'TRAVEL', icon: '✈️', desc: 'Places & Vacations' }
]

const levelsList = [
  { id: 'Easy', name: 'Easy', cefr: 'A1 - A2' },
  { id: 'Normal', name: 'Normal', cefr: 'B1 - B2' },
  { id: 'Hard', name: 'Hard', cefr: 'C1 Expert' }
]

const localMetadata = ref({
  vocabularyLevel: 'Normal',
  difficulty: 'Standard',
  topic: 'Any',
  disabledCores: [] as string[],
  pureSkillMode: false
})

const allCores = ref<any[]>([])

onMounted(async () => {
  try {
    const res = await fetchWithAuth(`/api/game/cores?all=true`)
    if (res.ok) {
      const data = await res.json()
      allCores.value = data.cores.filter((c: any) => c.tier === 1 || !c.tier)
    }
  } catch (err) {
    console.error('Failed to load cores for settings', err)
  }
})

// Sync local state when opened
watch(() => props.isOpen, (newVal) => {
  if (newVal && props.metadata) {
    localMetadata.value = {
      vocabularyLevel: props.metadata.vocabularyLevel || 'Normal',
      difficulty: props.metadata.difficulty || 'Standard',
      topic: props.metadata.topic || 'Any',
      disabledCores: [...(props.metadata.disabledCores || [])],
      pureSkillMode: props.metadata.pureSkillMode || false
    }
  }
})

const toggleCore = (coreId: string) => {
  if (!props.isHost) return
  const index = localMetadata.value.disabledCores.indexOf(coreId)
  if (index > -1) {
    localMetadata.value.disabledCores.splice(index, 1)
  } else {
    localMetadata.value.disabledCores.push(coreId)
  }
}

const togglePureSkillMode = () => {
  if (!props.isHost) return
  localMetadata.value.pureSkillMode = !localMetadata.value.pureSkillMode
}

const saveAndClose = () => {
  if (props.isHost) {
    emit('save', { ...localMetadata.value })
  }
  emit('close')
}

const close = () => {
  emit('close')
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.4);
}
</style>

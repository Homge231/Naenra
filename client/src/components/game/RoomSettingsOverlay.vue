<template>
  <transition name="fade">
    <div v-if="isOpen" class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <!-- Backdrop -->
      <div 
        class="absolute inset-0 bg-black/60 backdrop-blur-sm"
        @click="close"
      ></div>

      <!-- Modal Content -->
      <div class="relative w-full max-w-lg bg-darkNavy/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-6 overflow-hidden flex flex-col gap-8">
        
        <!-- Header -->
        <div class="flex justify-between items-center pb-4 border-b border-white/10">
          <h2 class="text-xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-orange to-hexred">
            Room Settings
          </h2>
          <button 
            @click="close"
            class="text-gray-400 hover:text-white transition-colors focus:outline-none"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Body -->
        <div class="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
          
          <!-- Vocabulary Level -->
          <div class="space-y-3">
            <label class="text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <svg class="w-5 h-5 text-lightBlue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
              </svg>
              Vocabulary Level
            </label>
            <div class="flex p-1 bg-black/40 rounded-lg border border-white/5">
              <button 
                v-for="level in ['Easy', 'Normal', 'Hard']" 
                :key="level"
                :disabled="!isHost"
                @click="localMetadata.vocabularyLevel = level"
                :class="[
                  'flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all duration-300',
                  localMetadata.vocabularyLevel === level 
                    ? 'bg-lightBlue text-white shadow-md' 
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed'
                ]"
              >
                {{ level }}
              </button>
            </div>
            <p class="text-[10px] text-gray-500">Determines the complexity and length of the words.</p>
          </div>

          <!-- Difficulty Tier -->
          <div class="space-y-3">
            <label class="text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <svg class="w-5 h-5 text-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
              Difficulty Tier
            </label>
            <div class="flex p-1 bg-black/40 rounded-lg border border-white/5">
              <button 
                v-for="tier in ['Standard', 'Veteran', 'Master']" 
                :key="tier"
                :disabled="!isHost"
                @click="localMetadata.difficulty = tier"
                :class="[
                  'flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all duration-300',
                  localMetadata.difficulty === tier 
                    ? 'bg-orange text-white shadow-md' 
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed'
                ]"
              >
                {{ tier }}
              </button>
            </div>
            <p class="text-[10px] text-gray-500">Affects scoring multipliers and time constraints.</p>
          </div>

          <!-- Topic / Theme -->
          <div class="space-y-3">
            <label class="text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <svg class="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"></path>
              </svg>
              Question Topic
            </label>
            <div class="flex p-1 bg-black/40 rounded-lg border border-white/5 flex-wrap gap-1">
              <button 
                v-for="topic in ['Any', 'Science', 'History', 'Tech']" 
                :key="topic"
                :disabled="!isHost"
                @click="localMetadata.topic = topic"
                :class="[
                  'flex-1 py-2 min-w-[20%] text-xs font-bold uppercase tracking-wider rounded-md transition-all duration-300',
                  localMetadata.topic === topic 
                    ? 'bg-pink-500 text-white shadow-md' 
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed'
                ]"
              >
                {{ topic }}
              </button>
            </div>
            <p class="text-[10px] text-gray-500">Select the category of the questions.</p>
          </div>
          
          <!-- Core Toggles -->
          <div class="space-y-3">
            <label class="text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
              </svg>
              Support Cores
            </label>
            <div v-if="allCores.length === 0" class="text-xs text-gray-500 italic">Loading cores...</div>
            <div v-else class="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
              <div 
                v-for="core in allCores" 
                :key="core.id"
                class="flex items-center justify-between p-2 bg-black/40 rounded-lg border border-white/5"
              >
                <div class="flex items-center gap-2 overflow-hidden">
                  <img v-if="core.icon_url" :src="core.icon_url" class="w-5 h-5 opacity-80" />
                  <span class="text-xs font-bold text-gray-300 truncate" :title="core.name">{{ core.name }}</span>
                </div>
                <button 
                  :disabled="!isHost"
                  @click="toggleCore(core.id)"
                  :class="[
                    'w-8 h-4 rounded-full transition-colors relative flex items-center',
                    !localMetadata.disabledCores.includes(core.id) ? 'bg-green-500' : 'bg-gray-600',
                    !isHost ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  ]"
                >
                  <span 
                    class="w-3 h-3 bg-white rounded-full shadow-sm absolute transition-transform duration-200"
                    :class="!localMetadata.disabledCores.includes(core.id) ? 'translate-x-4' : 'translate-x-1'"
                  ></span>
                </button>
              </div>
            </div>
          </div>
          
        </div>

        <!-- Footer / Save Button -->
        <div class="pt-4 border-t border-white/10 mt-auto" v-if="isHost">
          <button 
            @click="close"
            class="w-full py-3 bg-gradient-to-r from-orange to-hexred text-white font-black uppercase tracking-widest rounded-lg shadow-lg hover:shadow-orange/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            Save Changes
          </button>
        </div>
        <div class="pt-4 border-t border-white/10 mt-auto" v-else>
          <p class="text-xs font-bold text-gray-500 uppercase tracking-widest text-center">Only the Host can edit settings</p>
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
  }
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', newMetadata: { vocabularyLevel: string, difficulty: string, topic: string, disabledCores: string[] }): void
}>()

const localMetadata = ref({
  vocabularyLevel: 'Normal',
  difficulty: 'Standard',
  topic: 'Any',
  disabledCores: [] as string[]
})

const allCores = ref<any[]>([])

onMounted(async () => {
  try {
    const res = await fetchWithAuth(`/api/game/cores?all=true`)
    if (res.ok) {
      const data = await res.json()
      allCores.value = data.cores.filter((c: any) => c.tier === 1 || !c.tier) // Only show base cores to toggle
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
      disabledCores: [...(props.metadata.disabledCores || [])]
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

const close = () => {
  if (props.isHost) {
    emit('save', { ...localMetadata.value })
  }
  emit('close')
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>

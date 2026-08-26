<template>
  <transition name="fade">
    <div v-if="isOpen" class="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4">
      <!-- Backdrop -->
      <div 
        class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        @click="emit('close')"
      ></div>

      <!-- Modal Content -->
      <div class="relative w-full max-w-3xl bg-white/95 backdrop-blur-2xl border-2 border-orange-200 rounded-[2rem] shadow-2xl p-5 sm:p-7 overflow-hidden flex flex-col gap-4 max-h-[90vh] text-gray-900 z-10">
        
        <!-- Ambient Glowing Orbs -->
        <div class="absolute -top-20 -left-20 w-56 h-56 bg-orange-300/30 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-20 -right-20 w-56 h-56 bg-red-300/20 rounded-full blur-3xl pointer-events-none"></div>

        <!-- Header -->
        <div class="flex justify-between items-center pb-3 border-b border-gray-200 relative z-10">
          <div class="flex items-center gap-3">
            <div 
              class="w-11 h-11 rounded-2xl shadow-md flex items-center justify-center text-white flex-shrink-0 text-2xl"
              style="background: linear-gradient(135deg, #FF7B00 0%, #E63946 100%);"
            >
              🐉
            </div>
            <div>
              <h2 class="text-xl font-black uppercase tracking-wider text-gray-900 flex items-center gap-2">
                Creature Challengers
              </h2>
              <p class="text-xs text-gray-600 font-bold">Choose an AI Beast or Boss to duel in this custom room</p>
            </div>
          </div>

          <button 
            @click="emit('close')"
            class="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 border-2 border-gray-200 text-gray-700 hover:text-gray-900 transition-all flex items-center justify-center focus:outline-none cursor-pointer active:scale-95"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Tier Filter Tabs -->
        <div class="flex gap-1.5 p-1 bg-gray-100/90 rounded-xl border border-gray-200 overflow-x-auto custom-scrollbar flex-shrink-0">
          <button 
            v-for="tab in filterTabs" 
            :key="tab.id"
            @click="selectedTab = tab.id"
            class="px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5"
            :class="selectedTab === tab.id 
              ? 'bg-white text-gray-900 shadow-xs border border-gray-300' 
              : 'text-gray-500 hover:text-gray-900'
            "
          >
            <span>{{ tab.icon }}</span>
            <span>{{ tab.name }}</span>
            <span class="text-[10px] px-1.5 py-0.2 rounded-full" :class="selectedTab === tab.id ? 'bg-orange-100 text-orange-800' : 'bg-gray-200 text-gray-600'">
              {{ tab.count }}
            </span>
          </button>
        </div>

        <!-- Creature Grid -->
        <div class="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-3">
          <div v-if="loading" class="text-center py-12 text-gray-500 font-bold animate-pulse">
            Loading Creature Challengers...
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div 
              v-for="creature in filteredCreatures" 
              :key="creature.id"
              class="bg-white border-2 rounded-2xl p-4 transition-all duration-200 flex flex-col justify-between gap-3 relative overflow-hidden group shadow-xs hover:shadow-md"
              :class="currentCreatureId === creature.id ? 'border-orange-500 ring-2 ring-orange-200 bg-orange-50/20' : 'border-gray-200 hover:border-orange-300'"
            >
              <!-- Top Row: Avatar & Identity -->
              <div class="flex items-start justify-between gap-3">
                <div class="flex items-center gap-3">
                  <div class="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-gray-200 bg-gray-50 p-1 flex-shrink-0 shadow-xs">
                    <img :src="creature.avatar" :alt="creature.name" class="w-full h-full object-contain" />
                    <span class="absolute -bottom-1 -right-1 text-base">{{ creature.icon }}</span>
                  </div>
                  <div>
                    <h3 class="text-sm font-black text-gray-900 tracking-wide uppercase flex items-center gap-1.5">
                      {{ creature.name }}
                    </h3>
                    <p class="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      {{ creature.title }}
                    </p>
                  </div>
                </div>

                <!-- Tier Badge -->
                <span 
                  class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-2xs flex-shrink-0"
                  :style="{ 
                    backgroundColor: `${creature.badgeColor}15`, 
                    color: creature.badgeColor,
                    borderColor: `${creature.badgeColor}40`
                  }"
                >
                  {{ creature.tier }}
                </span>
              </div>

              <!-- Quote & Description -->
              <div class="bg-gray-50/80 rounded-xl p-2.5 border border-gray-100 text-left">
                <p class="text-[11px] text-gray-700 italic font-medium leading-snug">
                  "{{ creature.quote }}"
                </p>
                <p class="text-[10px] text-gray-500 font-bold mt-1">
                  {{ creature.description }}
                </p>
              </div>

              <!-- Stats Row -->
              <div class="grid grid-cols-3 gap-2 py-1 border-t border-b border-gray-100 text-center">
                <div>
                  <p class="text-[9px] font-black text-gray-400 uppercase tracking-widest">Speed</p>
                  <p class="text-xs font-black text-gray-900">⚡ {{ creature.wpm }} WPM</p>
                </div>
                <div class="border-l border-r border-gray-100">
                  <p class="text-[9px] font-black text-gray-400 uppercase tracking-widest">Accuracy</p>
                  <p class="text-xs font-black text-gray-900">🎯 {{ Math.round(creature.accuracy * 100) }}%</p>
                </div>
                <div>
                  <p class="text-[9px] font-black text-gray-400 uppercase tracking-widest">Favorite Core</p>
                  <p class="text-[11px] font-black text-orange-600 truncate px-1" :title="creature.favoriteCore">
                    ✨ {{ creature.favoriteCore || 'Balanced' }}
                  </p>
                </div>
              </div>

              <!-- Select Button -->
              <button 
                @click="selectCreature(creature)"
                class="w-full py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-98"
                :style="currentCreatureId === creature.id 
                  ? 'background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: #FFFFFF; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.35);' 
                  : 'background: linear-gradient(135deg, #FF7B00 0%, #E63946 100%); color: #FFFFFF; box-shadow: 0 4px 12px rgba(255, 123, 0, 0.35);'
                "
              >
                <span v-if="currentCreatureId === creature.id">✓ Currently Selected</span>
                <span v-else>⚔️ Challenge This Creature</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="pt-2 border-t border-gray-200 flex justify-between items-center text-xs text-gray-500 font-bold">
          <span>Total Creatures: {{ creatures.length }}</span>
          <button 
            @click="emit('close')"
            class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-black rounded-xl uppercase tracking-wider cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { fetchWithAuth } from '../../services/api'

const props = defineProps<{
  isOpen: boolean
  currentCreatureId?: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'select', creature: any): void
}>()

const loading = ref(false)
const creatures = ref<any[]>([])
const selectedTab = ref<'all' | 'bronze' | 'silver' | 'gold_plat' | 'boss'>('all')

const filterTabs = computed(() => [
  { id: 'all', name: 'All', icon: '🌟', count: creatures.value.length },
  { id: 'bronze', name: 'Bronze', icon: '🥉', count: creatures.value.filter(c => c.tier === 'Bronze').length },
  { id: 'silver', name: 'Silver', icon: '🥈', count: creatures.value.filter(c => c.tier === 'Silver').length },
  { id: 'gold_plat', name: 'Gold & Plat', icon: '🥇', count: creatures.value.filter(c => c.tier === 'Gold' || c.tier === 'Platinum').length },
  { id: 'boss', name: 'Diamond & Boss', icon: '👑', count: creatures.value.filter(c => c.tier === 'Diamond' || c.tier === 'Boss').length }
])

const filteredCreatures = computed(() => {
  if (selectedTab.value === 'bronze') {
    return creatures.value.filter(c => c.tier === 'Bronze')
  }
  if (selectedTab.value === 'silver') {
    return creatures.value.filter(c => c.tier === 'Silver')
  }
  if (selectedTab.value === 'gold_plat') {
    return creatures.value.filter(c => c.tier === 'Gold' || c.tier === 'Platinum')
  }
  if (selectedTab.value === 'boss') {
    return creatures.value.filter(c => c.tier === 'Diamond' || c.tier === 'Boss')
  }
  return creatures.value
})

async function fetchCreatures() {
  loading.value = true
  try {
    const res = await fetchWithAuth('/api/game/creatures')
    if (res.ok) {
      const data = await res.json()
      creatures.value = data.creatures || []
    }
  } catch (err) {
    console.error('Failed to fetch creatures:', err)
  } finally {
    loading.value = false
  }
}

function selectCreature(creature: any) {
  emit('select', creature)
  emit('close')
}

onMounted(() => {
  fetchCreatures()
})
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
  width: 5px;
  height: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #F1F5F9;
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #CBD5E1;
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94A3B8;
}
</style>

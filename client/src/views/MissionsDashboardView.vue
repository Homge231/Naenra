<template>
  <div class="min-h-screen w-full bg-[#fff8f5] text-gray-800 relative font-sans selection:bg-orange/50 flex flex-col">

    <!-- Background Ambient Blobs -->
    <div class="fixed inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center">
      <div class="absolute top-[-10%] left-[-5%] w-[50vw] h-[50vw] bg-orange/20 rounded-full mix-blend-multiply blur-[100px] animate-float-slow"></div>
      <div class="absolute bottom-[-10%] right-[-5%] w-[45vw] h-[45vw] bg-hexred/10 rounded-full mix-blend-multiply blur-[100px] animate-float-delayed"></div>
      <div class="absolute top-[30%] left-[60%] w-[30vw] h-[30vw] bg-lightBlue/20 rounded-full mix-blend-multiply blur-[80px] animate-pulse-slow"></div>
    </div>

    <!-- Header -->
    <header class="relative z-20 flex justify-between items-center p-4 lg:px-8">
      <div class="flex items-center gap-4 group cursor-pointer bg-white/60 backdrop-blur-md px-4 py-2 rounded-2xl shadow-sm border border-white/50 active:scale-95 transition-transform"
        @click="router.push('/home')">
        <div class="w-12 h-12 flex items-center justify-center">
          <svg class="w-full h-full text-orange fill-current group-hover:scale-110 transition-transform"
            viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 3 L7 21 L12 21 L12 9 L17 21 L17 3 L12 3 L12 15 L7 3 Z" />
          </svg>
        </div>
        <div class="leading-none">
          <h1 class="text-3xl font-black mb-1 tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-orange to-hexred drop-shadow-sm uppercase">
            NAENRA
          </h1>
          <p class="text-[10px] text-lightBlue font-bold tracking-[0.3em] uppercase">MISSIONS TRACKER</p>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <button @click="router.push('/library')"
          class="px-4 py-2 rounded-full font-black text-xs uppercase tracking-widest bg-white/80 text-blue-600 border border-white/60 hover:bg-blue-50 transition-all shadow-sm flex items-center gap-2 cursor-pointer">
          <span>📚</span> Go to Library
        </button>
        <button @click="router.push('/home')"
          class="px-4 py-2 rounded-full font-black text-xs uppercase tracking-widest bg-white/80 text-gray-700 border border-white/60 hover:bg-orange/10 hover:text-orange transition-all shadow-sm flex items-center gap-2 cursor-pointer">
          <span>⬅️</span> Back to Home
        </button>
      </div>
    </header>

    <!-- Main Content -->
    <main class="relative z-20 flex-1 w-full max-w-7xl mx-auto px-6 md:px-12 py-6 flex flex-col">

      <!-- Hero Header & Global Unlock Progress Bar -->
      <div class="mb-8">
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <div class="inline-flex items-center gap-2 bg-orange/10 border border-orange/30 text-orange px-4 py-1.5 rounded-full mb-3 shadow-xs">
              <span class="text-xs">🎯</span>
              <span class="text-xs font-black tracking-widest uppercase">Support Core Unlock Tracker</span>
            </div>
            <h2 class="text-4xl md:text-5xl font-black text-gray-900 uppercase tracking-tight drop-shadow-sm">
              Core Missions <span class="text-transparent bg-clip-text bg-gradient-to-r from-orange to-hexred">Dashboard</span>
            </h2>
            <p class="text-sm font-bold text-gray-500 mt-1 max-w-xl">
              Complete gameplay missions to unlock locked Support Cores & Upgrades in the Library view.
            </p>
          </div>

          <button @click="handleReset"
            class="self-start md:self-auto text-xs font-bold text-gray-400 hover:text-hexred transition-colors underline cursor-pointer">
            Reset Mission Progress
          </button>
        </div>

        <!-- Global Support Core Upgrade Unlock Banner -->
        <div class="bg-gradient-to-r from-orange/15 via-red/10 to-purple/15 backdrop-blur-md border-2 border-white/90 p-6 rounded-[2rem] shadow-sm mb-6 relative overflow-hidden">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xl">🔑</span>
                <h3 class="text-lg font-black text-gray-900 uppercase tracking-wide">Overall Support Core Unlock Progress</h3>
              </div>
              <p class="text-xs font-bold text-gray-600 mt-0.5">
                <span v-if="missionsStore.remainingUpgradesToUnlock > 0" class="text-orange-600 font-extrabold">
                  Only {{ missionsStore.remainingUpgradesToUnlock }} more upgrades left to unlock the complete Support Core collection!
                </span>
                <span v-else class="text-green-600 font-extrabold">
                  🎉 Congratulations! All Support Cores and Upgrades have been fully unlocked!
                </span>
              </p>
            </div>
            <div class="text-right">
              <span class="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange to-hexred">
                {{ missionsStore.unlockedUpgradesCount }} / {{ missionsStore.totalLockedUpgradesCount }}
              </span>
              <span class="text-xs font-black text-gray-500 block uppercase tracking-wider">Cores Unlocked</span>
            </div>
          </div>

          <!-- Animated Global Progress Bar -->
          <div class="w-full h-4 bg-gray-200/80 rounded-full overflow-hidden p-0.5 border border-white shadow-inner">
            <div class="h-full rounded-full bg-gradient-to-r from-orange via-hexred to-purple-600 transition-all duration-700 shadow-md"
              :style="{ width: `${missionsStore.unlockProgressPercent}%` }">
            </div>
          </div>
        </div>

        <!-- 4 KPI Stat Cards -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="bg-white/80 backdrop-blur-md border border-white/80 p-5 rounded-3xl shadow-sm flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-orange/10 flex items-center justify-center text-2xl text-orange">
              🎯
            </div>
            <div>
              <p class="text-[10px] font-black tracking-widest uppercase text-gray-400">Completed</p>
              <p class="text-2xl font-black text-gray-900">{{ missionsStore.completedCount }} / {{ missionsStore.totalCount }}</p>
            </div>
          </div>

          <div class="bg-white/80 backdrop-blur-md border border-white/80 p-5 rounded-3xl shadow-sm flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-hexred/10 flex items-center justify-center text-2xl text-hexred">
              ⚡
            </div>
            <div>
              <p class="text-[10px] font-black tracking-widest uppercase text-gray-400">Total XP</p>
              <p class="text-2xl font-black text-gray-900">{{ missionsStore.totalXpEarned }} XP</p>
            </div>
          </div>

          <div class="bg-white/80 backdrop-blur-md border border-white/80 p-5 rounded-3xl shadow-sm flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-lightBlue/10 flex items-center justify-center text-2xl text-lightBlue">
              👑
            </div>
            <div>
              <p class="text-[10px] font-black tracking-widest uppercase text-gray-400">Mastery Level</p>
              <p class="text-2xl font-black text-gray-900">Level {{ missionsStore.masteryLevel }}</p>
            </div>
          </div>

          <div class="bg-white/80 backdrop-blur-md border border-white/80 p-5 rounded-3xl shadow-sm flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-2xl text-green-500">
              🔓
            </div>
            <div>
              <p class="text-[10px] font-black tracking-widest uppercase text-gray-400">Claimed & Unlocked</p>
              <p class="text-2xl font-black text-gray-900">{{ missionsStore.claimedCount }} Cores</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Controls: Category Tabs, Search & Hide Claimed Toggle -->
      <div class="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <div class="flex flex-wrap gap-2 w-full md:w-auto">
          <button v-for="tab in categoryTabs" :key="tab" @click="activeTab = tab"
            :class="[
              'px-5 py-2 rounded-full font-black text-xs uppercase tracking-widest transition-all border cursor-pointer',
              activeTab === tab
                ? 'bg-gradient-to-r from-orange to-hexred text-white border-transparent shadow-[0_4px_14px_rgba(255,107,0,0.35)] scale-105'
                : 'bg-white/80 text-gray-500 border-white/60 hover:bg-orange/10 hover:text-orange'
            ]">
            {{ tab }}
          </button>
        </div>

        <div class="flex items-center gap-4 w-full md:w-auto">
          <!-- Hide Claimed Switch -->
          <label class="flex items-center gap-2 text-xs font-bold text-gray-600 bg-white/80 px-4 py-2 rounded-full border border-white/80 shadow-xs cursor-pointer select-none">
            <input type="checkbox" v-model="hideClaimed" class="accent-orange w-4 h-4 cursor-pointer" />
            <span>Hide Claimed & Unlocked</span>
          </label>

          <!-- Search Input -->
          <div class="w-full md:w-60 relative">
            <input v-model="searchQuery" type="text" placeholder="Search missions..."
              class="w-full pl-10 pr-4 py-2 rounded-full bg-white/80 border border-white/80 text-xs font-bold text-gray-700 placeholder-gray-400 outline-none focus:border-orange transition-all shadow-xs" />
            <span class="absolute left-3.5 top-2.5 text-xs text-gray-400">🔍</span>
          </div>
        </div>
      </div>

      <!-- Mission Grid -->
      <div v-if="filteredMissions.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
        <div v-for="mission in filteredMissions" :key="mission.id"
          class="bg-white/80 backdrop-blur-md border-2 border-white rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden"
          :class="{ 'border-green-400/50 bg-green-50/30': mission.isClaimed }">

          <!-- Top Section -->
          <div>
            <div class="flex justify-between items-start mb-4">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange/20 to-hexred/20 border border-white flex items-center justify-center text-2xl shadow-xs">
                  {{ mission.icon }}
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <span class="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-gray-100 text-gray-600">
                      {{ mission.category }}
                    </span>
                    <span class="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-orange/10 text-orange">
                      {{ mission.coreFamily }}
                    </span>
                  </div>
                  <h3 class="text-lg font-black text-gray-900 mt-0.5">{{ mission.title }}</h3>
                </div>
              </div>

              <!-- Status Badge -->
              <div>
                <span v-if="mission.isClaimed" class="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-green-100 text-green-700 border border-green-200 flex items-center gap-1">
                  ✓ UNLOCKED IN LIBRARY
                </span>
                <span v-else-if="mission.isCompleted" class="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 border border-yellow-300 animate-pulse flex items-center gap-1">
                  🎁 READY TO UNLOCK
                </span>
                <span v-else class="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-gray-100 text-gray-500">
                  IN PROGRESS
                </span>
              </div>
            </div>

            <p class="text-xs font-bold text-gray-600 mb-3 leading-relaxed">
              {{ mission.description }}
            </p>

            <!-- Unlocks Target Badge -->
            <div class="inline-flex items-center gap-2 bg-gradient-to-r from-orange/10 to-red/10 border border-orange/20 px-3 py-1 rounded-xl mb-4">
              <span class="text-xs">🔓</span>
              <span class="text-xs font-black text-gray-800">Unlocks Support Core:</span>
              <span class="text-xs font-black text-orange uppercase">{{ mission.unlockCoreName }}</span>
            </div>
          </div>

          <!-- Bottom Section: Progress Bar & Actions -->
          <div>
            <div class="mb-4">
              <div class="flex justify-between text-[11px] font-black mb-1 text-gray-600">
                <span>Progress</span>
                <span>{{ mission.currentProgress }} / {{ mission.targetCount }} ({{ Math.round((mission.currentProgress / mission.targetCount) * 100) }}%)</span>
              </div>
              <div class="w-full h-3 bg-gray-200/70 rounded-full overflow-hidden p-0.5">
                <div class="h-full rounded-full transition-all duration-500"
                  :class="mission.isCompleted ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-orange to-hexred'"
                  :style="{ width: `${Math.min(100, (mission.currentProgress / mission.targetCount) * 100)}%` }">
                </div>
              </div>
            </div>

            <div class="flex justify-between items-center pt-2 border-t border-gray-100">
              <div class="text-xs font-black text-gray-700">
                <span class="text-orange">+{{ mission.rewardXp }} XP</span>
                <span class="text-gray-400 font-bold ml-1">• Unlocks Core</span>
              </div>

              <button v-if="mission.isCompleted && !mission.isClaimed" @click="claim(mission.id)"
                class="px-5 py-2 rounded-xl font-black text-xs uppercase tracking-widest bg-gradient-to-r from-orange to-hexred text-white shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5">
                <span>Claim & Unlock Core 🔓</span>
              </button>
              <button v-else-if="mission.isClaimed" disabled
                class="px-4 py-1.5 rounded-xl font-bold text-xs uppercase tracking-widest bg-gray-100 text-gray-400 cursor-not-allowed">
                Unlocked ✓
              </button>
              <button v-else @click="simulateProgress(mission.id)"
                class="px-4 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-orange/10 text-orange hover:bg-orange/20 transition-all cursor-pointer">
                + Progress (Demo)
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-16 bg-white/60 backdrop-blur-md rounded-[2rem] border border-white">
        <div class="text-4xl mb-3">🎉</div>
        <h3 class="text-xl font-black text-gray-800 mb-1">No Active Missions Found</h3>
        <p class="text-xs font-bold text-gray-500">
          All missions in this view are completed or hidden. Turn off "Hide Claimed & Unlocked" to view your claimed rewards!
        </p>
      </div>

    </main>

    <!-- Floating Scroll To Top Button -->
    <ScrollToTopButton />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMissionsStore } from '../stores/missionsStore'
import { audioService } from '../services/audioService'
import ScrollToTopButton from '../components/ScrollToTopButton.vue'

const router = useRouter()
const missionsStore = useMissionsStore()

const categoryTabs = ['All', 'Attack', 'Defense', 'Utility', 'Economy', 'Strategy'] as const
const activeTab = ref<string>('All')
const searchQuery = ref('')
const hideClaimed = ref(false)

const filteredMissions = computed(() => {
  return missionsStore.missions.filter(m => {
    if (hideClaimed.value && m.isClaimed) return false
    const matchesTab = activeTab.value === 'All' || m.category === activeTab.value
    const matchesSearch = searchQuery.value.trim() === '' ||
      m.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      m.unlockCoreName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      m.coreFamily.toLowerCase().includes(searchQuery.value.toLowerCase())
    return matchesTab && matchesSearch
  })
})

function claim(id: string) {
  audioService.playClick()
  missionsStore.claimReward(id)
}

function simulateProgress(id: string) {
  audioService.playClick()
  missionsStore.updateProgress(id, 1)
}

function handleReset() {
  audioService.playClick()
  missionsStore.resetMissions()
}
</script>

<template>
  <div class="min-h-screen w-full bg-[#fff8f5] text-gray-800 relative font-sans selection:bg-orange/50 flex flex-col">

    <!-- Background Ambient Blobs -->
    <div class="fixed inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center">
      <div class="absolute top-[-10%] left-[-5%] w-[50vw] h-[50vw] bg-orange/20 rounded-full mix-blend-multiply blur-[100px] animate-float-slow"></div>
      <div class="absolute bottom-[-10%] right-[-5%] w-[45vw] h-[45vw] bg-hexred/10 rounded-full mix-blend-multiply blur-[100px] animate-float-delayed"></div>
      <div class="absolute top-[30%] left-[60%] w-[30vw] h-[30vw] bg-lightBlue/20 rounded-full mix-blend-multiply blur-[80px] animate-pulse-slow"></div>
    </div>

    <!-- Header -->
    <header class="relative z-20 flex justify-between items-center p-3 md:p-4 lg:px-8">
      <div class="flex items-center gap-2 md:gap-4 group cursor-pointer bg-white/60 backdrop-blur-md px-3 md:px-4 py-1.5 md:py-2 rounded-xl md:rounded-2xl shadow-sm border border-white/50 active:scale-95 transition-transform"
        @click="router.push('/home')">
        <div class="w-8 h-8 md:w-12 md:h-12 flex items-center justify-center">
          <svg class="w-full h-full text-orange fill-current group-hover:scale-110 transition-transform"
            viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 3 L7 21 L12 21 L12 9 L17 21 L17 3 L12 3 L12 15 L7 3 Z" />
          </svg>
        </div>
        <div class="leading-none">
          <h1 class="text-xl md:text-3xl font-black mb-0.5 md:mb-1 tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-orange to-hexred drop-shadow-sm uppercase">
            NAENRA
          </h1>
          <p class="text-[8px] md:text-[10px] text-lightBlue font-bold tracking-[0.3em] uppercase">MISSIONS TRACKER</p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button @click="router.push('/library')"
          class="px-3 md:px-4 py-1.5 md:py-2 rounded-full font-black text-[10px] md:text-xs uppercase tracking-widest bg-white/80 text-blue-600 border border-white/60 hover:bg-blue-50 transition-all shadow-sm flex items-center gap-1.5 cursor-pointer">
          <span>📚</span> <span class="hidden sm:inline">Go to Library</span><span class="sm:hidden">Library</span>
        </button>
      </div>
    </header>

    <!-- Main Content -->
    <main class="relative z-20 flex-1 w-full max-w-7xl mx-auto px-3 md:px-6 lg:px-12 py-3 md:py-6 flex flex-col">

      <!-- Guest Lock Banner -->
      <div v-if="authStore.isGuest" class="mb-8 p-6 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-2 border-amber-400/50 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-2xl font-black shrink-0 shadow-md">
            🔒
          </div>
          <div>
            <h3 class="text-lg font-black text-amber-900 uppercase">Guest Mission Progress Locked</h3>
            <p class="text-xs font-bold text-amber-800/80 mt-0.5">
              Mission progress tracking and Core unlocking are locked for Guest accounts. Register now to save your progress and unlock new Support Cores!
            </p>
          </div>
        </div>
        <button @click="router.push('/login')" class="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:scale-105 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-md transition-all whitespace-nowrap cursor-pointer">
          Login / Register ➔
        </button>
      </div>

      <!-- Hero Header & Global Unlock Progress Bar -->
      <div class="mb-4 md:mb-8">
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-2 md:gap-4 mb-4 md:mb-6">
          <div>
            <div class="inline-flex items-center gap-1.5 md:gap-2 bg-orange/10 border border-orange/30 text-orange px-3 md:px-4 py-1 md:py-1.5 rounded-full mb-2 md:mb-3 shadow-xs">
              <span class="text-xs">🎯</span>
              <span class="text-[10px] md:text-xs font-black tracking-widest uppercase">Support Core Unlock Tracker</span>
            </div>
            <h2 class="text-2xl md:text-5xl font-black text-gray-900 uppercase tracking-tight drop-shadow-sm">
              Core Missions <span class="text-transparent bg-clip-text bg-gradient-to-r from-orange to-hexred">Dashboard</span>
            </h2>
            <p class="text-xs md:text-sm font-bold text-gray-500 mt-1 max-w-xl hidden md:block">
              Complete gameplay missions to unlock locked Support Cores & Upgrades in the Library view.
            </p>
          </div>

          <button v-if="authStore.isAdmin" @click="handleReset"
            class="self-start md:self-auto text-xs font-bold text-amber-600 hover:text-hexred transition-colors underline cursor-pointer">
            ⚡ Admin: Reset Mission Progress
          </button>
        </div>

        <!-- Global Support Core Upgrade Unlock Banner -->
        <div class="bg-gradient-to-r from-orange/15 via-red/10 to-purple/15 backdrop-blur-md border-2 border-white/90 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] shadow-sm mb-4 md:mb-6 relative overflow-hidden">
          <div class="flex flex-row items-center justify-between gap-2 md:gap-4 mb-2 md:mb-3">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-1.5 md:gap-2">
                <span class="text-base md:text-xl">🔑</span>
                <h3 class="text-sm md:text-lg font-black text-gray-900 uppercase tracking-wide leading-tight">Overall Support Core Unlock Progress</h3>
              </div>
              <p class="text-[10px] md:text-xs font-bold text-gray-600 mt-0.5">
                <span v-if="missionsStore.remainingUpgradesToUnlock > 0" class="text-orange-600 font-extrabold">
                  Only {{ missionsStore.remainingUpgradesToUnlock }} more upgrades left to unlock the complete Support Core collection!
                </span>
                <span v-else class="text-green-600 font-extrabold">
                  🎉 Congratulations! All Support Cores and Upgrades have been fully unlocked!
                </span>
              </p>
            </div>
            <div class="text-right flex-shrink-0">
              <span class="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange to-hexred">
                {{ missionsStore.unlockedUpgradesCount }} / {{ missionsStore.totalLockedUpgradesCount }}
              </span>
              <span class="text-[9px] md:text-xs font-black text-gray-500 block uppercase tracking-wider">Cores Unlocked</span>
            </div>
          </div>

          <!-- Animated Global Progress Bar -->
          <div class="w-full h-3 md:h-4 bg-gray-200/80 rounded-full overflow-hidden p-0.5 border border-white shadow-inner">
            <div class="h-full rounded-full bg-gradient-to-r from-orange via-hexred to-purple-600 transition-all duration-700 shadow-md"
              :style="{ width: `${missionsStore.unlockProgressPercent}%` }">
            </div>
          </div>
        </div>

        <!-- 4 KPI Stat Cards -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
          <div class="bg-white/80 backdrop-blur-md border border-white/80 p-3 md:p-5 rounded-2xl md:rounded-3xl shadow-sm flex items-center gap-2 md:gap-4">
            <div class="w-9 h-9 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-orange/10 flex items-center justify-center text-lg md:text-2xl text-orange flex-shrink-0">
              🎯
            </div>
            <div class="min-w-0">
              <p class="text-[9px] md:text-[10px] font-black tracking-widest uppercase text-gray-400">Completed</p>
              <p class="text-lg md:text-2xl font-black text-gray-900">{{ missionsStore.completedCount }} / {{ missionsStore.totalCount }}</p>
            </div>
          </div>

          <div class="bg-white/80 backdrop-blur-md border border-white/80 p-3 md:p-5 rounded-2xl md:rounded-3xl shadow-sm flex items-center gap-2 md:gap-4">
            <div class="w-9 h-9 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-hexred/10 flex items-center justify-center text-lg md:text-2xl text-hexred flex-shrink-0">
              ⚡
            </div>
            <div class="min-w-0">
              <p class="text-[9px] md:text-[10px] font-black tracking-widest uppercase text-gray-400">Total XP</p>
              <p class="text-lg md:text-2xl font-black text-gray-900">{{ missionsStore.totalXpEarned }} XP</p>
            </div>
          </div>

          <div class="bg-white/80 backdrop-blur-md border border-white/80 p-3 md:p-5 rounded-2xl md:rounded-3xl shadow-sm flex items-center gap-2 md:gap-4">
            <div class="w-9 h-9 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-lightBlue/10 flex items-center justify-center text-lg md:text-2xl text-lightBlue flex-shrink-0">
              👑
            </div>
            <div class="min-w-0">
              <p class="text-[9px] md:text-[10px] font-black tracking-widest uppercase text-gray-400">Mastery Level</p>
              <p class="text-lg md:text-2xl font-black text-gray-900">Level {{ missionsStore.masteryLevel }}</p>
            </div>
          </div>

          <div class="bg-white/80 backdrop-blur-md border border-white/80 p-3 md:p-5 rounded-2xl md:rounded-3xl shadow-sm flex items-center gap-2 md:gap-4">
            <div class="w-9 h-9 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-green-500/10 flex items-center justify-center text-lg md:text-2xl text-green-500 flex-shrink-0">
              🔓
            </div>
            <div class="min-w-0">
              <p class="text-[9px] md:text-[10px] font-black tracking-widest uppercase text-gray-400">Claimed & Unlocked</p>
              <p class="text-lg md:text-2xl font-black text-gray-900">{{ missionsStore.claimedCount }} Cores</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Controls: Category Tabs, Search & Hide Claimed Toggle Switch -->
      <div class="flex flex-col gap-3 mb-4 md:mb-6">
        <!-- Category Tabs: scrollable horizontally on mobile -->
        <div class="flex md:flex-wrap overflow-x-auto md:overflow-visible gap-2 pb-1 md:pb-0 scrollbar-hide">
          <button v-for="tab in categoryTabs" :key="tab" @click="activeTab = tab"
            :class="[
              'px-4 md:px-5 py-1.5 md:py-2 rounded-full font-black text-[10px] md:text-xs uppercase tracking-widest transition-all border cursor-pointer whitespace-nowrap flex-shrink-0',
              activeTab === tab
                ? 'bg-gradient-to-r from-orange to-hexred text-white border-transparent shadow-[0_4px_14px_rgba(255,107,0,0.35)] scale-105'
                : 'bg-white/80 text-gray-500 border-white/60 hover:bg-orange/10 hover:text-orange'
            ]">
            {{ tab }}
          </button>
        </div>

        <!-- Search + Hide Claimed on one row on mobile -->
        <div class="flex items-center gap-2 md:gap-3">
          <!-- Search Input -->
          <div class="flex-1 relative">
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Search missions..."
              class="w-full pl-8 md:pl-10 pr-8 py-2 md:py-2.5 rounded-full bg-white/90 border border-white/90 text-xs font-bold text-gray-800 placeholder-gray-400 outline-none focus:border-orange focus:ring-2 focus:ring-orange/20 transition-all shadow-sm" 
            />
            <span class="absolute left-3 top-2.5 text-[10px] md:text-xs text-gray-400">🔍</span>
            <button 
              v-if="searchQuery" 
              @click="searchQuery = ''" 
              class="absolute right-2.5 top-2 text-xs text-gray-400 hover:text-gray-600 font-black cursor-pointer bg-gray-100 rounded-full w-4 h-4 flex items-center justify-center"
            >
              ✕
            </button>
          </div>

          <!-- Hide Claimed Toggle -->
          <div 
            class="flex items-center gap-2 bg-white/90 backdrop-blur-xl px-3 py-2 rounded-full border border-white/90 shadow-sm select-none cursor-pointer hover:border-orange/40 transition-all flex-shrink-0"
            @click="hideClaimed = !hideClaimed"
          >
            <span class="text-[10px] font-black uppercase tracking-wider text-gray-700 hidden sm:inline">Hide Claimed</span>
            <span class="text-[10px] font-black uppercase tracking-wider text-gray-700 sm:hidden">Hide</span>
            <button 
              type="button"
              class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none"
              :class="hideClaimed ? 'bg-orange' : 'bg-gray-300'"
            >
              <span 
                class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-300 ease-in-out"
                :class="hideClaimed ? 'translate-x-4' : 'translate-x-0'"
              ></span>
            </button>
          </div>
        </div>
      </div>

      <!-- Mission Grid -->
      <div v-if="filteredMissions.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6 pb-12">
        <div v-for="mission in filteredMissions" :key="mission.id"
          class="bg-white/80 backdrop-blur-md border-2 border-white rounded-2xl md:rounded-[2rem] p-3 md:p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden"
          :class="{ 'border-green-400/50 bg-green-50/30': mission.isClaimed }">

          <!-- Top Section -->
          <div>
            <div class="flex justify-between items-start mb-3">
              <div class="flex items-center gap-2 md:gap-3">
                <!-- Matching Official Core Icon Asset -->
                <div class="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl p-[2px] shadow-sm bg-gradient-to-br from-orange to-hexred shrink-0">
                  <div class="w-full h-full bg-white rounded-[10px] md:rounded-[13px] flex items-center justify-center overflow-hidden">
                    <img 
                      :src="resolveIcon(mission)" 
                      :alt="mission.unlockCoreName"
                      @error="onImgError"
                      class="w-6 h-6 md:w-9 md:h-9 object-contain drop-shadow-sm" 
                    />
                  </div>
                </div>

                <div>
                  <div class="flex items-center gap-1.5">
                    <span class="text-[9px] md:text-[10px] font-black uppercase tracking-wider px-1.5 md:px-2 py-0.5 rounded-md bg-gray-100 text-gray-600">
                      {{ mission.category }}
                    </span>
                    <span class="text-[9px] md:text-[10px] font-black uppercase tracking-wider px-1.5 md:px-2 py-0.5 rounded-md bg-orange/10 text-orange">
                      {{ mission.coreFamily }}
                    </span>
                  </div>
                  <h3 class="text-sm md:text-lg font-black text-gray-900 mt-0.5 leading-tight">{{ mission.title }}</h3>
                </div>
              </div>

              <!-- Status Badge -->
              <div class="block">
                <span v-if="mission.isClaimed" class="text-[9px] md:text-[10px] font-black uppercase tracking-wider px-2 md:px-3 py-1 rounded-full bg-green-100 text-green-700 border border-green-200 flex items-center gap-1">
                  ✓ UNLOCKED
                </span>
                <span v-else-if="mission.isCompleted" class="text-[9px] md:text-[10px] font-black uppercase tracking-wider px-2 md:px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 border border-yellow-300 animate-pulse flex items-center gap-1">
                  🎁 READY
                </span>
                <span v-else class="text-[9px] md:text-[10px] font-black uppercase tracking-wider px-2 md:px-3 py-1 rounded-full bg-gray-100 text-gray-500">
                  IN PROGRESS
                </span>
              </div>
            </div>

            <p class="text-[11px] md:text-xs font-bold text-gray-600 mb-3 leading-relaxed">
              {{ mission.description }}
            </p>

            <!-- Unlocks Target Badge -->
            <div class="inline-flex items-center gap-1.5 md:gap-2 bg-gradient-to-r from-orange/10 to-red/10 border border-orange/20 px-2 md:px-3 py-1 rounded-lg md:rounded-xl mb-3 md:mb-4">
              <span class="text-[10px] md:text-xs">🔓</span>
              <span class="text-[10px] md:text-xs font-black text-gray-800">Unlocks:</span>
              <span class="text-[10px] md:text-xs font-black text-orange uppercase">{{ mission.unlockCoreName }}</span>
            </div>
          </div>

          <!-- Bottom Section: Progress Bar & Actions -->
          <div>
            <div class="mb-3">
              <div class="flex justify-between text-[10px] font-black mb-1 text-gray-600">
                <span>Progress</span>
                <span>{{ mission.currentProgress }} / {{ mission.targetCount }}</span>
              </div>
              <div class="w-full h-2 md:h-3 bg-gray-200/70 rounded-full overflow-hidden p-0.5">
                <div class="h-full rounded-full transition-all duration-500"
                  :class="mission.isCompleted ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-orange to-hexred'"
                  :style="{ width: `${Math.min(100, (mission.currentProgress / mission.targetCount) * 100)}%` }">
                </div>
              </div>
            </div>

            <div class="flex justify-between items-center pt-2 border-t border-gray-100">
              <div class="text-[10px] md:text-xs font-black text-gray-700">
                <span class="text-orange">+{{ mission.rewardXp }} XP</span>
              </div>

              <div class="flex items-center gap-2">
                <!-- Admin Mission Controls -->
                <div v-if="authStore.isAdmin" class="flex items-center gap-1.5 bg-amber-50 border border-amber-300 p-0.5 rounded-lg">
                  <button @click="missionsStore.adminIncrementProgress(mission.id, 1)"
                    title="Admin: +1"
                    class="px-2 py-1 rounded font-black text-[9px] uppercase bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition-all cursor-pointer">
                    +1
                  </button>
                </div>

                <button v-if="mission.isCompleted && !mission.isClaimed" @click="claim(mission.id)"
                  class="px-4 md:px-5 py-1.5 md:py-2 rounded-lg md:rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest bg-gradient-to-r from-orange to-hexred text-white shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer">
                  Claim Reward 🔓
                </button>
                <button v-else-if="mission.isClaimed" disabled
                  class="px-4 md:px-4 py-1.5 rounded-lg md:rounded-xl font-bold text-[10px] md:text-xs uppercase tracking-widest bg-gray-100 text-gray-400 cursor-not-allowed">
                  Claimed ✓
                </button>
              </div>
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
import { useMissionsStore } from '../../stores/missionsStore.ts'
import { useAuthStore } from '../../stores/authStore.ts'
import { audioService } from '../../services/audioService.ts'
import ScrollToTopButton from '../../components/ScrollToTopButton.vue'
import { getCoreIconPath, DEFAULT_ICON } from '../../game/cores/icons.ts'

const router = useRouter()
const missionsStore = useMissionsStore()
const authStore = useAuthStore()

const categoryTabs = ['All', 'Attack', 'Defense', 'Utility', 'Economy', 'Strategy'] as const
const activeTab = ref<string>('All')
const searchQuery = ref('')
const hideClaimed = ref(false)

const resolveIcon = (mission: any) => {
  if (mission.unlockCoreName) {
    const icon = getCoreIconPath(mission.unlockCoreName)
    if (icon !== DEFAULT_ICON) return icon
  }
  if (mission.coreFamily) {
    return getCoreIconPath(mission.coreFamily)
  }
  return DEFAULT_ICON
}

const onImgError = (event: Event) => {
  const target = event.target as HTMLImageElement
  if (target && target.src !== DEFAULT_ICON) {
    target.src = DEFAULT_ICON
  }
}

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

<template>
  <div class="w-full h-full min-h-screen bg-gray-50 flex flex-col font-['Inter',sans-serif] relative overflow-hidden">
    <!-- Animated background patterns -->
    <div class="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-orange-400/10 blur-[100px] animate-pulse-slow"></div>
      <div class="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-red-400/10 blur-[120px] animate-float-delayed"></div>
    </div>

    <!-- Header -->
    <header class="relative z-20 flex justify-between items-center p-4 lg:px-8 bg-white/60 backdrop-blur-md shadow-sm">
      <button @click="goBack" @mouseenter="audioService.playHover()" 
        class="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 text-gray-600 hover:text-orange-500 hover:border-orange-200 rounded-xl transition-all shadow-sm group">
        <svg class="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"></path></svg>
      </button>
      
      <div class="text-center">
        <h1 class="text-2xl md:text-3xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500 drop-shadow-sm">
          Global Leaderboard
        </h1>
        <p class="text-[10px] text-gray-500 font-bold tracking-[0.2em] uppercase mt-0.5">
          Top 50 Players
        </p>
      </div>

      <div class="w-10 h-10"></div> <!-- Placeholder for balance -->
    </header>

    <!-- Main Content -->
    <main class="relative z-10 flex-1 overflow-hidden flex flex-col items-center px-4 pt-6 pb-24">
      
      <div v-if="isLoading" class="flex flex-col items-center justify-center h-full gap-4 text-orange-500">
        <svg class="animate-spin w-10 h-10" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span class="font-bold text-sm tracking-widest uppercase animate-pulse">Fetching Ranks...</span>
      </div>

      <div v-else-if="error" class="flex flex-col items-center justify-center h-full text-red-500 gap-2">
        <span class="text-4xl">⚠️</span>
        <p class="font-bold text-sm bg-red-50 px-4 py-2 rounded-xl border border-red-100">{{ error }}</p>
        <button @click="fetchLeaderboard" class="mt-2 text-xs font-bold text-gray-500 hover:text-gray-800 underline">Try Again</button>
      </div>

      <!-- Scrollable List -->
      <div v-else class="w-full max-w-2xl h-full overflow-y-auto scrollbar-hide rounded-3xl pb-10">
        <div class="flex flex-col gap-3">
          
          <div v-for="(player, index) in topPlayers" :key="player.id"
            class="relative flex items-center bg-white p-3 rounded-2xl shadow-sm border transition-all hover:-translate-y-0.5 hover:shadow-md group overflow-hidden"
            :class="[
              index === 0 ? 'border-yellow-400 ring-2 ring-yellow-300/50 bg-gradient-to-r from-yellow-50 via-amber-50 to-white' : '',
              index === 1 ? 'border-slate-300 ring-2 ring-slate-200 bg-gradient-to-r from-slate-100 to-white' : '',
              index === 2 ? 'border-amber-500 ring-2 ring-amber-200 bg-gradient-to-r from-amber-50 to-white' : '',
              index > 2 ? 'border-gray-200 hover:border-orange-300' : ''
            ]">
            
            <!-- Rank Number -->
            <div class="w-12 flex-shrink-0 flex items-center justify-center font-black text-xl italic"
              :class="[
                index === 0 ? 'text-yellow-500 drop-shadow-sm text-3xl' : '',
                index === 1 ? 'text-slate-500 drop-shadow-sm text-2xl' : '',
                index === 2 ? 'text-amber-700 drop-shadow-sm text-2xl' : '',
                index > 2 ? 'text-gray-600 font-black text-lg' : ''
              ]">
              <span v-if="index === 0">👑</span>
              <span v-else-if="index === 1">🥈</span>
              <span v-else-if="index === 2">🥉</span>
              <span v-else>#{{ index + 1 }}</span>
            </div>

            <!-- Avatar -->
            <div class="w-12 h-12 rounded-full overflow-hidden bg-gray-100 border-2 flex-shrink-0 ml-2"
              :class="[
                index === 0 ? 'border-yellow-400' : '',
                index === 1 ? 'border-gray-400' : '',
                index === 2 ? 'border-amber-600' : '',
                index > 2 ? 'border-gray-200' : ''
              ]">
              <img :src="player.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.username}`" 
                   class="w-full h-full object-cover" />
            </div>

            <!-- Username & Rank Tier Badge -->
            <div class="ml-4 flex-1 flex flex-col justify-center min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="font-black text-gray-900 tracking-wide text-sm md:text-base truncate">
                  {{ player.username }}
                </h3>
                <span 
                  class="text-[9px] font-black uppercase px-2 py-0.5 rounded-full border tracking-wider flex-shrink-0 shadow-2xs"
                  :style="{
                    color: getTierForElo(player.elo).color === '#ffd700' ? '#d97706' : getTierForElo(player.elo).color,
                    borderColor: `${getTierForElo(player.elo).color}60`,
                    backgroundColor: `${getTierForElo(player.elo).color}20`
                  }"
                >
                  {{ getTierForElo(player.elo).name }}
                </span>
              </div>
            </div>

            <div class="px-4 text-right flex-shrink-0">
              <p class="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-0.5">Rating</p>
              <div class="font-black text-lg md:text-xl text-orange-600 drop-shadow-sm flex items-center gap-1 justify-end">
                <span>{{ player.elo }}</span>
                <span class="text-xs text-orange-500">⭐</span>
              </div>
            </div>
            
            <!-- Shine effect for top 3 -->
            <div v-if="index < 3" class="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-full h-full -translate-x-[150%] group-hover:animate-shimmer pointer-events-none"></div>
          </div>

        </div>
      </div>
    </main>

    <!-- Sticky Bottom Row: Current User -->
    <div class="fixed bottom-0 left-0 w-full z-30 p-4 bg-white/90 backdrop-blur-xl border-t border-gray-200 shadow-[0_-10px_30px_rgba(0,0,0,0.08)] flex justify-center">
      <div v-if="currentUser" class="w-full max-w-2xl flex items-center bg-white p-2 pl-5 pr-2 rounded-2xl border-2 border-orange-400 shadow-lg relative overflow-hidden group">
        
        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-orange-100/40 to-transparent w-full h-full -translate-x-[150%] animate-shimmer pointer-events-none"></div>

        <div class="flex-1 flex items-center min-w-0">
          <div class="flex flex-col">
            <span class="text-[10px] font-extrabold tracking-[0.2em] text-orange-500 uppercase">Your Rank</span>
            <div class="font-black text-2xl flex items-baseline gap-1">
              <span class="text-orange-600 font-black">{{ currentUser.rank === '-' || !currentUser.rank ? 'Unranked' : `#${currentUser.rank}` }}</span>
            </div>
          </div>
          
          <div class="mx-4 h-8 w-px bg-gray-200"></div>
          
          <div class="flex items-center gap-3 truncate">
            <div class="w-10 h-10 rounded-full overflow-hidden border-2 border-orange-400 shadow-sm flex-shrink-0 bg-gray-100">
              <img :src="currentUser.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.username}`" class="w-full h-full object-cover" />
            </div>
            <div class="flex flex-col min-w-0">
              <span class="font-black text-gray-900 text-base truncate">{{ currentUser.username }}</span>
              <span 
                class="text-[9px] font-black uppercase tracking-widest"
                :style="{ color: getTierForElo(currentUser.elo).color === '#ffd700' ? '#d97706' : getTierForElo(currentUser.elo).color }"
              >
                {{ getTierForElo(currentUser.elo).name }} Tier
              </span>
            </div>
          </div>
        </div>

        <!-- High-Contrast Rating Badge -->
        <div class="bg-orange-50/80 border border-orange-200/80 px-4 py-2 rounded-xl flex flex-col items-end flex-shrink-0 ml-4 shadow-sm">
          <span class="text-[9px] font-black tracking-widest text-gray-500 uppercase mb-0.5">Rating</span>
          <div class="font-black text-xl text-orange-600 flex items-center gap-1">
            <span class="text-orange-600 font-black tracking-wide">{{ currentUser.elo }}</span>
            <span class="text-sm">⭐</span>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { audioService } from '../../services/audioService'
import { fetchWithAuth } from '../../services/api'
import { getTierForElo } from '../../utils/ranks'

const router = useRouter()

const isLoading = ref(true)
const error = ref('')
const topPlayers = ref<any[]>([])
const currentUser = ref<any>(null)

async function fetchLeaderboard() {
  isLoading.value = true
  error.value = ''
  try {
    const response = await fetchWithAuth('/api/user/leaderboard')
    if (!response.ok) {
      throw new Error('Failed to fetch leaderboard')
    }
    const data = await response.json()
    topPlayers.value = data.topPlayers
    currentUser.value = data.currentUser
  } catch (err: any) {
    error.value = err.message || 'Network error'
    console.error('Fetch leaderboard error:', err)
  } finally {
    isLoading.value = false
  }
}

function goBack() {
  audioService.playClick()
  router.push('/home')
}

onMounted(() => {
  fetchLeaderboard()
})

</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}
.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}

.animate-shimmer {
  animation: shimmer 2.5s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-150%); }
  50% { transform: translateX(150%); }
  100% { transform: translateX(150%); }
}

.animate-pulse-slow {
  animation: pulseBlob 8s ease-in-out infinite alternate;
}

.animate-float-delayed {
  animation: floatSky 15s ease-in-out infinite alternate-reverse;
}

@keyframes pulseBlob {
  0% { transform: scale(1); opacity: 0.3; }
  100% { transform: scale(1.1); opacity: 0.5; }
}

@keyframes floatSky {
  0% { transform: translate(0, 0) scale(1); }
  100% { transform: translate(40px, -40px) scale(1.1); }
}
</style>

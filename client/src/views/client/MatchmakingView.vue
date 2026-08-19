<template>
  <div class="min-h-screen w-full bg-[#fff8f5] text-gray-800 relative font-sans selection:bg-orange/50 flex flex-col justify-between">
    
    <!-- Ambient Background Blobs -->
    <div class="fixed inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center">
      <div class="absolute top-[-10%] left-[-5%] w-[50vw] h-[50vw] bg-orange/20 rounded-full mix-blend-multiply blur-[100px] animate-float-slow"></div>
      <div class="absolute bottom-[-10%] right-[-5%] w-[45vw] h-[45vw] bg-hexred/10 rounded-full mix-blend-multiply blur-[100px] animate-float-delayed"></div>
      <div class="absolute top-[30%] left-[60%] w-[30vw] h-[30vw] bg-lightBlue/20 rounded-full mix-blend-multiply blur-[80px] animate-pulse-slow"></div>
    </div>

    <!-- Header -->
    <header class="relative z-20 w-full px-4 md:px-12 py-4 md:py-6 flex justify-between items-center">
      <div class="flex items-center gap-2 md:gap-4 group cursor-pointer bg-white/70 backdrop-blur-md px-3 md:px-4 py-1.5 md:py-2 rounded-xl md:rounded-2xl shadow-sm border border-white/60" @click="cancelMatchmaking">
        <div class="w-8 h-8 md:w-12 md:h-12 flex items-center justify-center">
          <svg class="w-full h-full text-orange fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 3 L7 21 L12 21 L12 9 L17 21 L17 3 L12 3 L12 15 L7 3 Z" />
          </svg>
        </div>
        <div class="leading-none">
          <h1 class="text-xl md:text-3xl font-black mb-0.5 md:mb-1 tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-orange to-hexred drop-shadow-sm uppercase">
            NAENRA
          </h1>
          <p class="text-[8px] md:text-[10px] text-lightBlue font-bold tracking-[0.3em] uppercase">MATCHMAKING ARENA</p>
        </div>
      </div>

      <div class="flex items-center gap-2 bg-white/70 backdrop-blur-md border border-white/60 px-3 md:px-4 py-1.5 md:py-2 rounded-full shadow-sm">
        <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
        <span class="text-[9px] md:text-xs font-black text-gray-600 tracking-widest uppercase">Connected</span>
      </div>
    </header>

    <!-- Main Content Container -->
    <main class="relative z-20 flex-1 flex flex-col items-center justify-center px-4 py-4 md:py-6 w-full max-w-lg mx-auto gap-4 md:gap-6">
      
      <!-- Player Profile Card -->
      <div class="flex flex-col items-center gap-3 w-full bg-white/60 backdrop-blur-xl border border-white/80 p-5 md:p-6 rounded-3xl shadow-lg relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-b from-orange/10 via-transparent to-transparent pointer-events-none"></div>

        <div class="relative flex items-center justify-center">
          <div class="absolute inset-0 rounded-full bg-orange/30 animate-ping opacity-75"></div>
          
          <div class="relative z-10 w-24 h-24 md:w-28 md:h-28 rounded-full p-1 bg-gradient-to-tr from-orange via-hexred to-yellow-400 shadow-xl">
            <div class="w-full h-full rounded-full overflow-hidden bg-white border-2 border-white">
              <img
                :src="avatarUrl"
                :alt="username"
                class="w-full h-full object-cover"
                @error="(e) => (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`"
              />
            </div>
          </div>
        </div>

        <div class="text-center z-10">
          <h2 class="text-xl md:text-2xl font-black text-gray-900 uppercase tracking-wider mb-1">
            {{ username }}
          </h2>
          <div class="inline-flex items-center gap-1.5 px-3 py-1 bg-orange/10 border border-orange/20 rounded-full text-orange font-black text-xs uppercase tracking-widest">
            <span>⭐ ELO: {{ elo }}</span>
          </div>
        </div>
      </div>

      <!-- Matchmaking Status & Timer Card -->
      <div class="flex flex-col items-center text-center gap-2 w-full bg-white/70 backdrop-blur-xl border border-white/80 p-5 md:p-6 rounded-3xl shadow-lg">
        <div class="flex items-center gap-2 text-orange">
          <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span class="text-xs md:text-sm font-black uppercase tracking-[0.2em]">Searching for Opponent...</span>
        </div>

        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Elapsed Time</p>
        <div class="text-5xl md:text-6xl font-black font-mono tracking-tight text-gray-900 drop-shadow-sm">
          {{ formattedElapsedTime }}
        </div>
      </div>

      <!-- Ranked Rules Card -->
      <div class="w-full bg-white/50 backdrop-blur-md p-4 rounded-2xl border border-white/70 shadow-sm text-left flex items-start gap-3">
        <div class="p-2 bg-orange/10 text-orange rounded-xl flex-shrink-0 mt-0.5">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <div>
          <h3 class="text-xs font-black text-gray-900 uppercase tracking-wider mb-0.5">Ranked Matchmaking Rules</h3>
          <p class="text-[10px] md:text-xs text-gray-500 font-medium leading-relaxed">
            Matching with an opponent based on ELO rating (±100 variance). If no human opponent is found within 30s, an AI bot will match automatically.
          </p>
        </div>
      </div>

      <!-- Cancel Matchmaking Button -->
      <button
        @click="cancelMatchmaking"
        @mouseenter="audioService.playHover()"
        class="w-full py-3.5 md:py-4 bg-white border-2 border-gray-200 hover:bg-red-50 hover:border-red-300 text-gray-600 hover:text-hexred rounded-2xl font-black text-xs md:text-sm tracking-[0.2em] uppercase transition-all duration-200 shadow-md active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
        <span>Cancel Matchmaking</span>
      </button>

    </main>

    <div class="h-2"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'
import { audioService } from '../../services/audioService'
import { joinOrCreateQueueRoom, queueRoom, joinMatchRoomById, leaveMatchRoom } from '../../services/multiplayerService'

// @ts-ignore

const router = useRouter()
const authStore = useAuthStore()

// Timer State
const secondsElapsed = ref(0)
let timerInterval: ReturnType<typeof setInterval> | null = null
const isConnecting = ref(false)
const navigatingToGame = ref(false)

const username = computed(() =>
  authStore.profile?.username ||
  authStore.user?.user_metadata?.full_name ||
  'Player'
)

const avatarUrl = computed(() =>
  authStore.profile?.avatar_url ||
  authStore.user?.user_metadata?.avatar_url ||
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${username.value}`
)

const elo = computed(() => authStore.profile?.elo ?? 1000)

// Format mm:ss
const formattedElapsedTime = computed(() => {
  const mins = Math.floor(secondsElapsed.value / 60)
  const secs = secondsElapsed.value % 60
  const mm = mins.toString().padStart(2, '0')
  const ss = secs.toString().padStart(2, '0')
  return `${mm}:${ss}`
})

function startTimer() {
  secondsElapsed.value = 0
  if (timerInterval) clearInterval(timerInterval)
  timerInterval = setInterval(() => {
    secondsElapsed.value++
  }, 1000)
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

async function startQueueConnection() {
  isConnecting.value = true
  const options = {
    token: localStorage.getItem('arena_token'),
    id: authStore.user?.id,
    name: username.value,
    avatar: avatarUrl.value
  }

  try {
    const room = await joinOrCreateQueueRoom(options)

    room.onMessage('match_found', async ({ roomId }: { roomId: string }) => {
      if (navigatingToGame.value) return
      navigatingToGame.value = true
      stopTimer()
      
      try {
        await joinMatchRoomById(roomId, options)
        router.push('/match-found')
      } catch (err) {
        console.error("Failed to join match room after finding match:", err)
        navigatingToGame.value = false
        alert("Failed to connect to the match server. Please try again.")
        cancelMatchmaking()
      }
    })

  } catch (err: any) {
    console.error('Failed to join matchmaking room:', err)
  } finally {
    isConnecting.value = false
  }
}

function cancelMatchmaking() {
  audioService.playClick()
  stopTimer()

  if (queueRoom) {
    try {
      queueRoom.send('cancel_queue', { userId: authStore.user?.id })
    } catch (e) {
      console.warn('Error sending cancel_queue:', e)
    }
    queueRoom.leave()
  }

  router.push('/home')
}

onMounted(() => {
  startTimer()
  startQueueConnection()
})

onUnmounted(() => {
  stopTimer()
  if (!navigatingToGame.value) {
    if (typeof leaveMatchRoom === 'function') {
        leaveMatchRoom()
    }
  }
})

</script>

<style scoped>
.animate-float-slow {
  animation: floatSky 12s ease-in-out infinite alternate;
}
.animate-float-delayed {
  animation: floatSky 15s ease-in-out infinite alternate-reverse;
}
.animate-pulse-slow {
  animation: pulseBlob 8s ease-in-out infinite alternate;
}

@keyframes floatSky {
  0% { transform: translate(0, 0) scale(1); }
  100% { transform: translate(40px, -40px) scale(1.1); }
}

@keyframes pulseBlob {
  0% { transform: scale(1); opacity: 0.3; }
  100% { transform: scale(1.1); opacity: 0.5; }
}
</style>
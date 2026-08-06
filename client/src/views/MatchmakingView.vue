<template>
  <div class="h-screen w-full bg-[#fff8f5] text-gray-800 overflow-hidden relative font-sans selection:bg-orange-300/50 flex flex-col">
    
    <div class="absolute inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center">
      <div class="absolute top-[-10%] left-[-5%] w-[50vw] h-[50vw] bg-orange-300/30 rounded-full mix-blend-multiply blur-[100px] animate-float-slow"></div>
      <div class="absolute bottom-[-10%] right-[-5%] w-[45vw] h-[45vw] bg-red-300/20 rounded-full mix-blend-multiply blur-[100px] animate-float-delayed"></div>
      <div class="absolute top-[30%] left-[60%] w-[30vw] h-[30vw] bg-rose-200/40 rounded-full mix-blend-multiply blur-[80px] animate-pulse-slow"></div>
      
      <div class="absolute top-[15%] left-[10%] text-6xl font-black text-gray-300 uppercase animate-float-slow opacity-50">S</div>
      <div class="absolute top-[60%] left-[80%] text-8xl font-black text-gray-300 uppercase animate-float-delayed opacity-30">P</div>
      <div class="absolute top-[80%] left-[20%] text-5xl font-black text-gray-300 uppercase animate-pulse-slow opacity-40">E</div>
      <div class="absolute top-[25%] left-[75%] text-7xl font-black text-gray-300 uppercase animate-float-slow opacity-50" style="animation-delay: 2s;">D</div>
    </div>

    <header class="relative z-20 w-full p-6 md:px-12 flex justify-between items-start">
      
      <div class="flex items-center gap-4 group cursor-pointer bg-white/60 backdrop-blur-md px-4 py-2 rounded-2xl shadow-sm border border-white/50" @click="cancelMatchmaking">
        <div class="w-12 h-12 flex items-center justify-center">
          <svg class="w-full h-full text-orange fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 3 L7 21 L12 21 L12 9 L17 21 L17 3 L12 3 L12 15 L7 3 Z" />
          </svg>
        </div>
        <div class="leading-none">
          <h1 class="text-3xl font-black mb-1 tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-orange to-hexred drop-shadow-sm uppercase">
            NAENRA
          </h1>
          <p class="text-[10px] text-lightBlue font-bold tracking-[0.3em] uppercase">MATCHMAKING ARENA</p>
        </div>
      </div>

      <div class="hidden md:flex items-center gap-2 bg-white/60 backdrop-blur-md border border-gray-200 px-4 py-2 rounded-full shadow-sm">
        <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
        <span class="text-[10px] font-black text-gray-500 tracking-[0.2em] uppercase">Asia-East-1 Connected</span>
      </div>
    </header>

    <main class="relative z-20 flex-1 flex flex-col lg:flex-row items-center justify-center w-full px-6 md:px-12 gap-12 lg:gap-24">
      
      <div class="flex-1 flex justify-center items-center relative w-full max-w-lg">
        <div class="absolute inset-0 bg-white/40 backdrop-blur-3xl rounded-full scale-125 shadow-[0_0_100px_rgba(251,146,60,0.15)] pointer-events-none"></div>

        <div class="relative w-72 h-72 md:w-96 md:h-96 flex items-center justify-center">
          <div class="absolute inset-0 rounded-full border-2 border-orange-400/40 radar-pulse-1 pointer-events-none"></div>
          <div class="absolute inset-0 rounded-full border-2 border-orange-500/20 radar-pulse-2 pointer-events-none"></div>
          <div class="absolute inset-0 rounded-full border-2 border-red-500/10 radar-pulse-3 pointer-events-none"></div>

          <div class="absolute inset-0 rounded-full border-4 border-white radar-sweep-bg overflow-hidden pointer-events-none shadow-lg">
            <div class="absolute top-1/2 left-1/2 w-full h-full radar-sweep-line origin-top-left"></div>
          </div>

          <div class="absolute w-full h-px bg-gray-300/60"></div>
          <div class="absolute h-full w-px bg-gray-300/60"></div>
          <div class="absolute w-56 h-56 rounded-full border-2 border-dashed border-gray-400/50"></div>

          <div class="relative z-10 w-36 h-36 md:w-44 md:h-44 rounded-full p-[6px] bg-gradient-to-tr from-orange-500 via-red-500 to-yellow-400 shadow-[0_0_50px_rgba(251,146,60,0.5)]">
            <div class="w-full h-full rounded-full overflow-hidden bg-white border-4 border-white relative group">
              <img
                :src="avatarUrl"
                :alt="username"
                class="w-full h-full object-cover"
                @error="(e) => (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`"
              />
              <div class="absolute inset-0 bg-black/20 hidden group-hover:block transition-all"></div>
            </div>
            
            <div class="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white border-2 border-gray-100 px-4 py-1.5 rounded-full shadow-lg whitespace-nowrap min-w-max flex items-center justify-center">
              <p class="text-xs font-black text-orange-600 tracking-widest flex items-center gap-1">
                ⭐ ELO: {{ elo }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="flex-1 flex flex-col items-center lg:items-start w-full max-w-lg">
        
        <div class="flex items-center gap-4 mb-4">
          <div class="relative flex items-center justify-center w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-100">
            <svg class="w-6 h-6 text-orange-500 animate-spin-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <div>
            <h2 class="text-3xl md:text-4xl font-black text-gray-900 uppercase tracking-tight">Searching</h2>
            <p class="text-sm font-bold text-orange-500 uppercase tracking-[0.2em] animate-pulse">Finding Opponent...</p>
          </div>
        </div>

        <div class="w-full h-px bg-gradient-to-r from-gray-200 to-transparent my-6 hidden lg:block"></div>

        <div class="flex flex-col items-center lg:items-start mb-10">
          <p class="text-xs font-black text-gray-400 uppercase tracking-[0.3em] mb-2">Elapsed Time</p>
          <div class="text-[5rem] md:text-[7rem] leading-none font-black font-mono tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-gray-800 to-gray-400 drop-shadow-sm">
            {{ formattedElapsedTime }}
          </div>
        </div>

        <div class="w-full bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-white shadow-sm mb-10 text-center lg:text-left">
          <div class="flex items-start gap-4">
            <div class="mt-1 p-2 bg-blue-50 rounded-lg text-blue-500">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <div>
              <h3 class="text-sm font-black text-gray-900 uppercase tracking-widest mb-1">Ranked Matchmaking Rules</h3>
              <p class="text-xs text-gray-500 font-bold leading-relaxed">
                System is matching you with an opponent based on ELO rating (±100 variance). If no human opponent is found within 30s, an AI Bot of similar rank will match automatically.
              </p>
            </div>
          </div>
        </div>

        <button
          @click="cancelMatchmaking"
          @mouseenter="audioService.playHover()"
          class="group relative w-full lg:w-auto h-16 px-10 bg-white border-2 border-gray-200 hover:bg-red-50 hover:border-red-200 rounded-2xl text-gray-500 hover:text-red-600 font-black text-sm tracking-[0.2em] uppercase transition-all duration-300 shadow-sm active:scale-95 flex items-center justify-center gap-3"
        >
          <svg class="w-5 h-5 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
          <span>CANCEL MATCHMAKING</span>
        </button>
      </div>

    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { audioService } from '../services/audioService'
// @ts-ignore
import { joinOrCreateQueueRoom, queueRoom, joinMatchRoomById, leaveMatchRoom } from '../services/multiplayerService'

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
/* Background Floating Animations */
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

.animate-spin-slow {
  animation: spin 3s linear infinite;
}

/* Radar Sweep Line Animation (Cam) */
.radar-sweep-line {
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.4) 0%, rgba(249, 115, 22, 0) 60%);
  animation: radar-spin 3s linear infinite;
}

@keyframes radar-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Pulsing Radar Ring Keyframes */
.radar-pulse-1 {
  animation: radar-expand 3s cubic-bezier(0.1, 0.8, 0.3, 1) infinite;
}

.radar-pulse-2 {
  animation: radar-expand 3s cubic-bezier(0.1, 0.8, 0.3, 1) 1s infinite;
}

.radar-pulse-3 {
  animation: radar-expand 3s cubic-bezier(0.1, 0.8, 0.3, 1) 2s infinite;
}

@keyframes radar-expand {
  0% {
    transform: scale(0.6);
    opacity: 0.8;
  }
  100% {
    transform: scale(1.4);
    opacity: 0;
  }
}
</style>
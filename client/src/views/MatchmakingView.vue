<template>
  <div class="h-screen w-full bg-darkNavy text-white overflow-hidden relative font-sans selection:bg-orange/40 flex flex-col justify-between items-center p-6 md:p-12">
    <!-- Ambient Background Glow Effects -->
    <div class="absolute top-[-20%] left-[-10%] w-[55vw] h-[55vw] bg-blue rounded-full mix-blend-screen filter blur-[220px] opacity-20 pointer-events-none z-0"></div>
    <div class="absolute bottom-[-20%] right-[-10%] w-[55vw] h-[55vw] bg-hexred rounded-full mix-blend-screen filter blur-[220px] opacity-20 pointer-events-none z-0"></div>
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] bg-orange rounded-full mix-blend-screen filter blur-[200px] opacity-10 pointer-events-none z-0"></div>

    <!-- Cyber Grid Background -->
    <div class="absolute inset-0 cyber-grid opacity-40 pointer-events-none z-0"></div>

    <!-- Header / Brand Bar -->
    <header class="relative z-20 w-full max-w-6xl flex justify-between items-center">
      <div class="flex items-center gap-3 cursor-pointer" @click="cancelMatchmaking">
        <div class="w-10 h-10 flex items-center justify-center">
          <svg class="w-full h-full text-orange fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 3 L7 21 L12 21 L12 9 L17 21 L17 3 L12 3 L12 15 L7 3 Z" />
          </svg>
        </div>
        <div class="leading-none">
          <h1 class="text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-orange to-hexred uppercase">
            NAENRA
          </h1>
          <p class="text-[9px] text-lightBlue font-bold tracking-[0.25em] uppercase">MATCHMAKING ARENA</p>
        </div>
      </div>

      <!-- Player Quick Profile Badge -->
      <div class="flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl">
        <img :src="avatarUrl" :alt="username" class="w-8 h-8 rounded-full bg-darkNavy object-cover border border-lightBlue/40" />
        <div class="text-right">
          <p class="font-bold text-xs text-white leading-tight">{{ username }}</p>
          <p class="text-[10px] text-lightOrange font-mono font-semibold">ELO: {{ elo }}</p>
        </div>
      </div>
    </header>

    <!-- Main Content: Glassmorphism Matchmaking Card -->
    <main class="relative z-20 my-auto flex flex-col items-center justify-center w-full max-w-xl">
      <div class="w-full bg-darkNavy/60 backdrop-blur-xl border border-white/15 rounded-3xl p-8 md:p-12 flex flex-col items-center text-center shadow-[0_0_60px_rgba(0,0,0,0.6)] relative overflow-hidden">
        
        <!-- Top Status Pill -->
        <div class="inline-flex items-center gap-2.5 bg-blue/15 border border-blue/30 px-4 py-1.5 rounded-full mb-8">
          <span class="w-2.5 h-2.5 rounded-full bg-lightBlue animate-ping"></span>
          <span class="text-xs font-bold text-lightBlue tracking-[0.25em] uppercase">SEARCHING FOR OPPONENT</span>
        </div>

        <!-- Radar & Avatar Container -->
        <div class="relative w-56 h-56 md:w-64 md:h-64 flex items-center justify-center mb-8">
          <!-- Outer Pulsing Radar Wave Rings (CSS @keyframes) -->
          <div class="absolute inset-0 rounded-full border border-cyan-400/30 radar-pulse-1 pointer-events-none"></div>
          <div class="absolute inset-0 rounded-full border border-cyan-400/20 radar-pulse-2 pointer-events-none"></div>
          <div class="absolute inset-0 rounded-full border border-cyan-500/10 radar-pulse-3 pointer-events-none"></div>

          <!-- Rotating Radar Sweep Line -->
          <div class="absolute inset-0 rounded-full border border-white/10 radar-sweep-bg overflow-hidden pointer-events-none">
            <div class="absolute top-1/2 left-1/2 w-full h-full radar-sweep-line origin-top-left"></div>
          </div>

          <!-- Center Radar Reticle Overlay -->
          <div class="absolute w-full h-px bg-white/10"></div>
          <div class="absolute h-full w-px bg-white/10"></div>
          <div class="absolute w-44 h-44 rounded-full border border-dashed border-white/20"></div>

          <!-- Center Avatar Frame -->
          <div class="relative z-10 w-28 h-28 md:w-32 md:h-32 rounded-full p-1 bg-gradient-to-tr from-orange via-hexred to-blue shadow-[0_0_35px_rgba(255,123,0,0.5)]">
            <div class="w-full h-full rounded-full overflow-hidden bg-darkNavy border-2 border-white/20">
              <img
                :src="avatarUrl"
                :alt="username"
                class="w-full h-full object-cover"
                @error="(e) => (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`"
              />
            </div>
          </div>
        </div>

        <!-- Live Elapsed Wait Timer -->
        <div class="mb-6">
          <p class="text-xs uppercase tracking-[0.3em] text-gray-400 font-semibold mb-1">ELAPSED TIME</p>
          <div class="text-4xl md:text-5xl font-black font-mono tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-lightBlue to-cyan-300 drop-shadow-md">
            {{ formattedElapsedTime }}
          </div>
        </div>

        <!-- Matchmaking Sub-info -->
        <p class="text-xs text-gray-400 max-w-sm mb-8 font-medium leading-relaxed">
          Matching based on ELO rating (±100). Please wait while we find an optimal challenger.
        </p>

        <!-- Cancel Matchmaking Button -->
        <button
          @click="cancelMatchmaking"
          @mouseenter="audioService.playHover()"
          class="group relative w-full max-w-xs h-13 py-3 px-8 bg-hexred/20 border border-hexred/40 hover:bg-hexred hover:border-hexred rounded-xl text-white font-bold text-sm tracking-[0.2em] uppercase transition-all duration-300 shadow-[0_0_20px_rgba(230,57,70,0.2)] hover:shadow-[0_0_30px_rgba(230,57,70,0.6)] active:scale-95 flex items-center justify-center gap-3"
        >
          <svg class="w-5 h-5 text-hexred group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
          <span>CANCEL MATCHMAKING</span>
        </button>
      </div>
    </main>

    <!-- Bottom Footer Status Line -->
    <footer class="relative z-20 text-center text-xs text-gray-500 tracking-wider">
      <span>SERVER: ASIA-EAST-1 &bull; PROTOCOL: WS / COLYSEUS 0.17</span>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { audioService } from '../services/audioService'
import { joinOrCreateMatchRoom, currentRoom, leaveMatchRoom } from '../services/multiplayerService'

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
    const room = await joinOrCreateMatchRoom(options)

    const handleMatchStarted = () => {
      if (navigatingToGame.value) return
      navigatingToGame.value = true
      stopTimer()
      router.push('/match-found')
    }

    // 1. Listen to Colyseus schema status change
    room.onStateChange((state) => {
      if (state && (state.status === "starting" || state.status === "playing")) {
        handleMatchStarted()
      }
    })

    // 2. Listen to broadcast message
    room.onMessage('match_started', () => {
      handleMatchStarted()
    })

    // 3. Immediate check if room state is already starting or full
    if (room.state && (room.state.status === "starting" || (room.state.players && room.state.players.size === 2))) {
      handleMatchStarted()
    }
  } catch (err: any) {
    console.error('Failed to join matchmaking room:', err)
  } finally {
    isConnecting.value = false
  }
}

function cancelMatchmaking() {
  audioService.playClick()
  stopTimer()

  // Emit cancel_queue event to Colyseus server if connected to a match room
  if (currentRoom) {
    try {
      currentRoom.send('cancel_queue', { userId: authStore.user?.id })
    } catch (e) {
      console.warn('Error sending cancel_queue:', e)
    }
    leaveMatchRoom()
  }

  // Return to Lobby (/home)
  router.push('/home')
}

onMounted(() => {
  startTimer()
  startQueueConnection()
})

onUnmounted(() => {
  stopTimer()
  if (!navigatingToGame.value) {
    leaveMatchRoom()
  }
})
</script>

<style scoped>
.cyber-grid {
  background-image: linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
  background-size: 64px 64px;
}

/* Radar Sweep Line Animation */
.radar-sweep-line {
  background: linear-gradient(135deg, rgba(34, 211, 238, 0.4) 0%, rgba(34, 211, 238, 0) 60%);
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
    transform: scale(1.35);
    opacity: 0;
  }
}
</style>

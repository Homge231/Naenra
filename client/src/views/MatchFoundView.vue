<template>
  <div class="h-screen w-full bg-darkNavy text-white overflow-hidden relative font-sans selection:bg-orange/40 flex flex-col justify-between items-center p-6 md:p-12">
    <!-- Ambient Background Glow Effects -->
    <div class="absolute top-[-20%] left-[-10%] w-[55vw] h-[55vw] bg-orange rounded-full mix-blend-screen filter blur-[220px] opacity-25 pointer-events-none z-0"></div>
    <div class="absolute bottom-[-20%] right-[-10%] w-[55vw] h-[55vw] bg-hexred rounded-full mix-blend-screen filter blur-[220px] opacity-25 pointer-events-none z-0"></div>
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[45vw] h-[45vw] bg-lightBlue rounded-full mix-blend-screen filter blur-[240px] opacity-15 pointer-events-none z-0"></div>

    <!-- Cyber Grid Overlay -->
    <div class="absolute inset-0 cyber-grid opacity-40 pointer-events-none z-0"></div>

    <!-- Header / Brand Bar -->
    <header class="relative z-20 w-full max-w-6xl flex justify-between items-center">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 flex items-center justify-center">
          <svg class="w-full h-full text-orange fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 3 L7 21 L12 21 L12 9 L17 21 L17 3 L12 3 L12 15 L7 3 Z" />
          </svg>
        </div>
        <div class="leading-none">
          <h1 class="text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-orange to-hexred uppercase">
            NAENRA
          </h1>
          <p class="text-[9px] text-lightBlue font-bold tracking-[0.25em] uppercase">MATCH FOUND ARENA</p>
        </div>
      </div>

      <div class="inline-flex items-center gap-2.5 bg-success/20 border border-success/40 px-4 py-1.5 rounded-full shadow-[0_0_20px_rgba(74,222,128,0.3)]">
        <span class="w-2.5 h-2.5 rounded-full bg-success animate-ping"></span>
        <span class="text-xs font-bold text-success tracking-[0.25em] uppercase">OPPONENT CONNECTED</span>
      </div>
    </header>

    <!-- Main Content: VS Arena Showcase -->
    <main class="relative z-20 my-auto flex flex-col items-center justify-center w-full max-w-5xl">
      <!-- Top Title -->
      <div class="text-center mb-8 animate-bounce-slow">
        <h2 class="text-4xl md:text-6xl font-black italic uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-orange to-hexred drop-shadow-[0_0_30px_rgba(255,123,0,0.5)]">
          MATCH FOUND
        </h2>
        <p class="text-xs md:text-sm text-lightBlue font-mono font-bold tracking-[0.3em] uppercase mt-2">
          &gt; PREPARE FOR 1V1 TYPING BATTLE
        </p>
      </div>

      <!-- VS Card Container -->
      <div class="w-full grid grid-cols-1 md:grid-cols-11 gap-6 items-center bg-darkNavy/60 backdrop-blur-xl border border-white/15 rounded-3xl p-6 md:p-10 shadow-[0_0_60px_rgba(0,0,0,0.6)] relative overflow-hidden">
        
        <!-- Player 1 (YOU) - Left Side -->
        <div class="md:col-span-5 flex flex-col items-center text-center p-6 bg-white/5 border border-white/10 rounded-2xl relative group hover:border-orange/50 transition-colors transform hover:-translate-y-1 duration-300">
          <div class="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange text-darkNavy text-[10px] font-black tracking-widest px-3 py-0.5 rounded-full uppercase shadow-md">
            YOU
          </div>
          
          <div class="relative w-28 h-28 md:w-36 md:h-36 rounded-full p-1 bg-gradient-to-tr from-orange to-hexred shadow-[0_0_35px_rgba(255,123,0,0.5)] mb-4">
            <div class="w-full h-full rounded-full overflow-hidden bg-darkNavy border-2 border-white/20">
              <img
                :src="myAvatarUrl"
                :alt="myUsername"
                class="w-full h-full object-cover"
                @error="(e) => (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${myUsername}`"
              />
            </div>
          </div>

          <h3 class="text-xl md:text-2xl font-black tracking-wider text-white mb-1 uppercase truncate max-w-full">
            {{ myUsername }}
          </h3>
          <div class="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-lightOrange bg-orange/10 px-3 py-1 rounded-md border border-orange/20">
            <span>ELO: {{ myElo }}</span>
          </div>
        </div>

        <!-- Center VS Badge & Countdown Ring -->
        <div class="md:col-span-1 flex flex-col items-center justify-center my-4 md:my-0">
          <div class="relative flex items-center justify-center">
            <span class="text-5xl md:text-7xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-orange via-hexred to-red-600 drop-shadow-[0_0_25px_rgba(230,57,70,0.8)] select-none transform -skew-x-12">
              VS
            </span>
          </div>

          <!-- Countdown Ring Ticker -->
          <div class="mt-6 flex flex-col items-center">
            <div class="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-lightBlue/30 border-t-lightBlue flex items-center justify-center bg-darkNavy/80 shadow-[0_0_25px_rgba(59,130,246,0.5)] animate-pulse">
              <span class="text-3xl md:text-4xl font-black font-mono text-white">
                {{ countdown }}
              </span>
            </div>
            <span class="text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase mt-2">STARTING IN</span>
          </div>
        </div>

        <!-- Player 2 (OPPONENT) - Right Side -->
        <div class="md:col-span-5 flex flex-col items-center text-center p-6 bg-white/5 border border-white/10 rounded-2xl relative group hover:border-lightBlue/50 transition-colors transform hover:-translate-y-1 duration-300">
          <div class="absolute -top-3 left-1/2 -translate-x-1/2 bg-lightBlue text-darkNavy text-[10px] font-black tracking-widest px-3 py-0.5 rounded-full uppercase shadow-md">
            OPPONENT
          </div>

          <div class="relative w-28 h-28 md:w-36 md:h-36 rounded-full p-1 bg-gradient-to-tr from-cyan-400 to-blue shadow-[0_0_35px_rgba(34,211,238,0.5)] mb-4">
            <div class="w-full h-full rounded-full overflow-hidden bg-darkNavy border-2 border-white/20">
              <img
                :src="opponentAvatarUrl"
                :alt="opponentUsername"
                class="w-full h-full object-cover"
                @error="(e) => (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${opponentUsername}`"
              />
            </div>
          </div>

          <h3 class="text-xl md:text-2xl font-black tracking-wider text-white mb-1 uppercase truncate max-w-full">
            {{ opponentUsername }}
          </h3>
          <div class="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-lightBlue bg-blue/10 px-3 py-1 rounded-md border border-blue/20">
            <span>ELO: {{ opponentElo }}</span>
          </div>
        </div>

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
import { currentRoom } from '../services/multiplayerService'

const router = useRouter()
const authStore = useAuthStore()

// Countdown state
const countdown = ref(5)
let countdownInterval: ReturnType<typeof setInterval> | null = null

// Player 1 (Me)
const myUsername = computed(() =>
  authStore.profile?.username ||
  authStore.user?.user_metadata?.full_name ||
  'Player 1'
)

const myAvatarUrl = computed(() =>
  authStore.profile?.avatar_url ||
  authStore.user?.user_metadata?.avatar_url ||
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${myUsername.value}`
)

const myElo = computed(() => authStore.profile?.elo ?? 1000)

const oppName = ref('Opponent');
const oppAvatar = ref('');
const oppElo = ref(1000);

if (currentRoom && currentRoom.state && currentRoom.state.players) {
  currentRoom.state.players.forEach((player: any, sessionId: string) => {
    if (sessionId !== currentRoom.sessionId) {
      oppName.value = player.name || 'Opponent';
      oppAvatar.value = player.avatar || '';
      oppElo.value = player.elo || 1000;
    }
  });

  // @ts-ignore
  currentRoom.state.players.onAdd((player: any, sessionId: string) => {
    if (currentRoom && sessionId !== currentRoom.sessionId) {
      oppName.value = player.name || 'Opponent';
      oppAvatar.value = player.avatar || '';
      oppElo.value = player.elo || 1000;
    }
  });
}

const opponentUsername = computed(() => oppName.value)

const opponentAvatarUrl = computed(() => {
  if (oppAvatar.value) return oppAvatar.value
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${opponentUsername.value}`
})

const opponentElo = computed(() => oppElo.value)

function startCountdown() {
  countdown.value = 5
  if (countdownInterval) clearInterval(countdownInterval)
  
  countdownInterval = setInterval(() => {
    countdown.value--
    if (countdown.value > 0) {
      audioService.playClick()
    } else {
      if (countdownInterval) clearInterval(countdownInterval)
      audioService.playCorrect()
      router.push('/core/multiplayer')
    }
  }, 1000)
}

onMounted(() => {
  startCountdown()
})

onUnmounted(() => {
  if (countdownInterval) {
    clearInterval(countdownInterval)
    countdownInterval = null
  }
})
</script>

<style scoped>
.cyber-grid {
  background-image: linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
  background-size: 64px 64px;
}

@keyframes bounce-slow {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
}

.animate-bounce-slow {
  animation: bounce-slow 3s ease-in-out infinite;
}
</style>

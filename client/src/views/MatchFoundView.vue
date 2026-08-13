<template>
  <div class="min-h-screen md:h-screen w-full bg-[#fff8f5] text-gray-800 overflow-y-auto md:overflow-hidden relative font-sans selection:bg-orange-300/50 flex flex-col justify-between items-center pb-6 md:pb-0">
    
    <div class="absolute inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center">
      <div class="absolute top-[-10%] left-[-5%] w-[50vw] h-[50vw] bg-orange-300/30 rounded-full mix-blend-multiply blur-[100px] animate-float-slow"></div>
      <div class="absolute bottom-[-10%] right-[-5%] w-[45vw] h-[45vw] bg-red-300/20 rounded-full mix-blend-multiply blur-[100px] animate-float-delayed"></div>
      <div class="absolute top-[30%] left-[60%] w-[30vw] h-[30vw] bg-rose-200/40 rounded-full mix-blend-multiply blur-[80px] animate-pulse-slow"></div>
      <div v-for="letter in floatingLetters" :key="letter.id"
          class="absolute top-0 font-black uppercase text-gray-300 select-none animate-matrix-drift"
          :style="{
              left: letter.left + '%',
              fontSize: letter.size + 'rem',
              animationDelay: letter.delay + 's',
              animationDuration: letter.duration + 's'
          }">
          {{ letter.char }}
      </div>
    </div>

    <header class="relative z-20 w-full flex justify-between items-center p-3 md:p-4 lg:px-8">
      
      <div class="flex items-center gap-2 md:gap-4 group bg-white/60 backdrop-blur-md px-3 md:px-4 py-1.5 md:py-2 rounded-xl md:rounded-2xl shadow-sm border border-white/50">
        <div class="w-8 h-8 md:w-12 md:h-12 flex items-center justify-center">
          <svg class="w-full h-full text-orange-500 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 3 L7 21 L12 21 L12 9 L17 21 L17 3 L12 3 L12 15 L7 3 Z" />
          </svg>
        </div>
        <div class="leading-none">
          <h1 class="text-xl md:text-3xl font-black mb-0.5 md:mb-1 tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600 drop-shadow-sm uppercase">
            NAENRA
          </h1>
          <p class="text-[8px] md:text-[10px] text-blue-500 font-bold tracking-[0.3em] uppercase">MATCH FOUND ARENA</p>
        </div>
      </div>

      <div class="inline-flex items-center gap-2 md:gap-2.5 bg-green-50 border border-green-200 px-3 md:px-5 py-1.5 md:py-2 rounded-full shadow-sm">
        <span class="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-green-500 animate-ping"></span>
        <span class="text-[9px] md:text-[10px] font-black text-green-600 tracking-[0.25em] uppercase hidden sm:block">Opponent Connected</span>
      </div>
    </header>

    <main class="relative z-20 my-auto flex flex-col items-center justify-center w-full max-w-5xl px-3 md:px-8 py-2 md:py-0">
      
      <div class="text-center mb-3 md:mb-8 animate-bounce-slow">
        <h2 class="text-3xl sm:text-5xl md:text-7xl font-black italic uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-br from-gray-900 via-orange-500 to-red-600 drop-shadow-md">
          MATCH FOUND
        </h2>
        <p class="text-[10px] md:text-sm text-gray-500 font-mono font-black tracking-[0.2em] md:tracking-[0.3em] uppercase mt-1 md:mt-3 bg-white/50 inline-block px-3 md:px-4 py-0.5 md:py-1 rounded-full border border-gray-200">
          &gt; PREPARE FOR 1V1 TYPING BATTLE
        </p>
      </div>

      <div class="w-full grid grid-cols-1 md:grid-cols-11 gap-3 md:gap-6 items-center bg-white/80 backdrop-blur-xl border-2 border-white rounded-2xl md:rounded-[2.5rem] p-3.5 md:p-10 shadow-[0_10px_40px_rgba(0,0,0,0.08)] relative overflow-hidden">
        
        <div class="md:col-span-5 flex flex-col items-center text-center p-3.5 md:p-8 bg-gray-50/50 border-2 border-orange-100 rounded-2xl md:rounded-3xl relative group hover:border-orange-300 transition-colors transform hover:-translate-y-1 md:hover:-translate-y-2 duration-300 shadow-sm">
          <div class="absolute -top-3.5 md:-top-4 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[9px] md:text-[10px] font-black tracking-widest px-3 md:px-4 py-0.5 md:py-1 rounded-full uppercase shadow-md border-2 border-white">
            YOU
          </div>
          
          <div class="relative w-20 h-20 sm:w-28 sm:h-28 md:w-40 md:h-40 rounded-full p-[4px] md:p-[6px] bg-gradient-to-tr from-orange-400 to-red-500 shadow-[0_0_40px_rgba(251,146,60,0.3)] mb-2 md:mb-5 mt-1 md:mt-0">
            <div class="w-full h-full rounded-full overflow-hidden bg-white border-2 md:border-4 border-white">
              <img
                :src="myAvatarUrl"
                :alt="myUsername"
                class="w-full h-full object-cover"
                @error="(e) => (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${myUsername}`"
              />
            </div>
          </div>

          <h3 class="text-base sm:text-xl md:text-2xl font-black tracking-wider text-gray-900 mb-1 md:mb-2 uppercase truncate max-w-full">
            {{ myUsername }}
          </h3>
          <div class="inline-flex items-center gap-1.5 text-xs md:text-sm font-mono font-black text-orange-600 bg-orange-50 px-3 md:px-4 py-1 md:py-1.5 rounded-lg md:rounded-xl border border-orange-200">
            <span>ELO: {{ myElo }}</span>
          </div>
        </div>

        <div class="md:col-span-1 flex flex-col items-center justify-center my-1 md:my-0">
          <div class="relative flex items-center justify-center">
            <span class="text-4xl md:text-8xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-orange-500 via-red-500 to-red-700 drop-shadow-md select-none transform -skew-x-12">
              VS
            </span>
          </div>

          <div class="mt-2 md:mt-8 flex flex-col items-center">
            <div class="w-12 h-12 md:w-24 md:h-24 rounded-full border-4 md:border-8 border-gray-100 border-t-orange-500 flex items-center justify-center bg-white shadow-lg animate-[spin_2s_linear_infinite]">
              <span class="text-xl md:text-5xl font-black font-mono text-gray-900 animate-[spin_2s_linear_infinite_reverse]">
                {{ countdown }}
              </span>
            </div>
            <span class="text-[8px] md:text-[10px] font-black text-gray-400 tracking-[0.2em] uppercase mt-1 md:mt-4">STARTING IN</span>
          </div>
        </div>

        <div class="md:col-span-5 flex flex-col items-center text-center p-3.5 md:p-8 bg-gray-50/50 border-2 border-blue-100 rounded-2xl md:rounded-3xl relative group hover:border-blue-300 transition-colors transform hover:-translate-y-1 md:hover:-translate-y-2 duration-300 shadow-sm">
          <div class="absolute -top-3.5 md:-top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[9px] md:text-[10px] font-black tracking-widest px-3 md:px-4 py-0.5 md:py-1 rounded-full uppercase shadow-md border-2 border-white">
            OPPONENT
          </div>

          <div class="relative w-20 h-20 sm:w-28 sm:h-28 md:w-40 md:h-40 rounded-full p-[4px] md:p-[6px] bg-gradient-to-tr from-cyan-400 to-blue-500 shadow-[0_0_40px_rgba(59,130,246,0.3)] mb-2 md:mb-5 mt-1 md:mt-0">
            <div class="w-full h-full rounded-full overflow-hidden bg-white border-2 md:border-4 border-white">
              <img
                :src="opponentAvatarUrl"
                :alt="opponentUsername"
                class="w-full h-full object-cover"
                @error="(e) => (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${opponentUsername}`"
              />
            </div>
          </div>

          <h3 class="text-base sm:text-xl md:text-2xl font-black tracking-wider text-gray-900 mb-1 md:mb-2 uppercase truncate max-w-full">
            {{ opponentUsername }}
          </h3>
          <div class="inline-flex items-center gap-1.5 text-xs md:text-sm font-mono font-black text-blue-600 bg-blue-50 px-3 md:px-4 py-1 md:py-1.5 rounded-lg md:rounded-xl border border-blue-200">
            <span>ELO: {{ opponentElo }}</span>
          </div>
        </div>

      </div>
    </main>

    <div class="relative z-20 flex justify-center pb-2 md:pb-4">
      <footer class="text-center text-[8px] md:text-[10px] font-black text-gray-400 tracking-[0.2em] uppercase bg-white/60 py-1.5 md:py-2 px-4 md:px-6 rounded-full border border-gray-200/50 backdrop-blur-sm shadow-sm">
        SERVER: ASIA-EAST-1 &nbsp;&bull;&nbsp; PROTOCOL: WS / COLYSEUS 0.17
      </footer>
    </div>
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

if (currentRoom) {
  const currentSessionId = currentRoom.sessionId
  
  // Initial check in case state is already populated
  if (currentRoom.state && currentRoom.state.players) {
    currentRoom.state.players.forEach((player: any, sessionId: string) => {
      if (sessionId !== currentSessionId) {
        oppName.value = player.name || 'Opponent';
        oppAvatar.value = player.avatar || '';
        oppElo.value = player.elo ?? 1000;
      }
    });
  }

  // Safely listen to state changes instead of relying on undocumented/unsupported schema callbacks
  currentRoom.onStateChange((state: any) => {
    if (state && state.players) {
      state.players.forEach((player: any, sessionId: string) => {
        if (sessionId !== currentSessionId) {
          oppName.value = player.name || 'Opponent';
          oppAvatar.value = player.avatar || '';
          oppElo.value = player.elo ?? 1000;
        }
      });
    }
  });
}

const opponentUsername = computed(() => oppName.value)

const opponentAvatarUrl = computed(() => {
  if (oppAvatar.value) return oppAvatar.value
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${opponentUsername.value}`
})

const opponentElo = computed(() => oppElo.value)

// MẢNG ALPHABET ĐỂ TẠO HIỆU ỨNG BACKGROUND
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
const floatingLetters = alphabet.map((char, index) => {
  return {
    id: index,
    char: char,
    left: Math.random() * 95,
    size: 2 + Math.random() * 5,
    delay: Math.random() * 15,
    duration: 15 + Math.random() * 20
  }
})

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

/* HIỆU ỨNG CHỮ CHẢY THẲNG ĐỨNG TỪ DƯỚI LÊN */
.animate-matrix-drift {
  animation-name: drift;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  animation-fill-mode: both;
}

@keyframes drift {
  0% { 
    transform: translateY(110vh);
    opacity: 0; 
  }
  10% { 
    opacity: 0.2; 
  }
  90% { 
    opacity: 0.2; 
  }
  100% { 
    transform: translateY(-20vh);
    opacity: 0; 
  }
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
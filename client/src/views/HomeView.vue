<template>
  <div class="h-screen w-full bg-[#fff8f5] text-gray-800 overflow-hidden relative font-sans selection:bg-orange-300/50 flex flex-col">
    
    <div class="absolute inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center">
      <div class="absolute top-[-10%] left-[-5%] w-[50vw] h-[50vw] bg-orange-300/30 rounded-full mix-blend-multiply blur-[100px] animate-float-slow"></div>
      <div class="absolute bottom-[-10%] right-[-5%] w-[45vw] h-[45vw] bg-red-300/20 rounded-full mix-blend-multiply blur-[100px] animate-float-delayed"></div>
      <div class="absolute top-[30%] left-[60%] w-[30vw] h-[30vw] bg-rose-200/40 rounded-full mix-blend-multiply blur-[80px] animate-pulse-slow"></div>
      <div class="absolute top-[45%] left-[5%] w-[40vw] h-[40vw] bg-blue-300/20 rounded-full mix-blend-multiply blur-[100px] animate-float-slow" style="animation-delay: 2s;"></div>
      <div class="absolute top-[5%] left-[35%] w-[35vw] h-[35vw] bg-purple-300/20 rounded-full mix-blend-multiply blur-[90px] animate-pulse-slow" style="animation-delay: 1.5s;"></div>
      <div class="absolute bottom-[5%] left-[30%] w-[50vw] h-[50vw] bg-yellow-300/20 rounded-full mix-blend-multiply blur-[120px] animate-float-delayed" style="animation-delay: 3s;"></div>

      <div class="absolute left-[15%] text-7xl font-black text-gray-400 uppercase animate-drift-1 opacity-20 pointer-events-auto hover:opacity-100 hover:scale-[1.4] hover:text-orange-500 hover:-rotate-12 transition-all duration-300 cursor-crosshair">A</div>
      <div class="absolute left-[40%] text-6xl font-black text-orange-400 uppercase animate-drift-2 opacity-20 pointer-events-auto hover:opacity-100 hover:scale-[1.5] hover:text-red-500 hover:rotate-12 transition-all duration-300 cursor-crosshair" style="animation-delay: 2s;">K</div>
      <div class="absolute left-[80%] text-8xl font-black text-blue-400 uppercase animate-drift-3 opacity-10 pointer-events-auto hover:opacity-100 hover:scale-[1.2] hover:text-yellow-500 hover:-rotate-12 transition-all duration-300 cursor-crosshair" style="animation-delay: 1s;">X</div>
      
      <div class="absolute left-[25%] text-3xl font-black text-purple-400 uppercase animate-drift-4 opacity-30 blur-[2px] pointer-events-auto hover:blur-none hover:opacity-100 hover:scale-[2] hover:text-green-500 hover:rotate-45 transition-all duration-300 cursor-crosshair" style="animation-delay: 4s;">Z</div>
      <div class="absolute left-[65%] text-4xl font-black text-red-400 uppercase animate-drift-5 opacity-20 blur-[3px] pointer-events-auto hover:blur-none hover:opacity-100 hover:scale-[2] hover:text-blue-500 hover:-rotate-12 transition-all duration-300 cursor-crosshair" style="animation-delay: 0.5s;">Q</div>
      <div class="absolute left-[10%] text-5xl font-black text-yellow-400 uppercase animate-drift-2 opacity-20 blur-[1px] pointer-events-auto hover:blur-none hover:opacity-100 hover:scale-[1.5] hover:text-rose-500 hover:rotate-45 transition-all duration-300 cursor-crosshair" style="animation-delay: 3s;">W</div>
      <div class="absolute left-[85%] text-3xl font-black text-gray-500 uppercase animate-drift-1 opacity-30 blur-[2px] pointer-events-auto hover:blur-none hover:opacity-100 hover:scale-[2] hover:text-indigo-500 hover:-rotate-45 transition-all duration-300 cursor-crosshair" style="animation-delay: 5s;">S</div>
    </div>

    <header class="relative z-20 flex justify-between items-center p-4 lg:px-8">
      <div class="flex items-center gap-4 group cursor-pointer bg-white/60 backdrop-blur-md px-4 py-2 rounded-2xl shadow-sm border border-white/50">
        <div class="w-12 h-12 flex items-center justify-center">
          <svg class="w-full h-full text-orange fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 3 L7 21 L12 21 L12 9 L17 21 L17 3 L12 3 L12 15 L7 3 Z" />
          </svg>
        </div>
        <div class="leading-none">
          <h1 class="text-3xl font-black mb-1 tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-orange to-hexred drop-shadow-sm uppercase">
            NAENRA
          </h1>
          <p class="text-[10px] text-lightBlue font-bold tracking-[0.3em] uppercase">
            TYPING ESPORTS ARENA
          </p>
        </div>
      </div>

      <div class="flex items-center gap-3 bg-white/80 backdrop-blur-md border border-white p-2 pr-4 rounded-full shadow-[0_4px_15px_rgba(251,146,60,0.08)]">
        <div class="w-11 h-11 bg-gradient-to-br from-orange to-hexred p-[2.5px] cursor-pointer rounded-full overflow-hidden hover:scale-105 transition-transform"
          @click="router.push('/profile')" @mouseenter="audioService.playHover()" title="View Profile">
          <img :src="avatarUrl" :alt="username" class="w-full h-full bg-white object-cover rounded-full"
            @error="(e) => (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`" />
        </div>
        <div class="text-right hidden md:block mr-2">
          <p class="font-black text-sm text-gray-800">{{ username }}</p>
          <p class="text-[11px] text-orange-600 font-bold bg-orange-100 px-2.5 py-0.5 rounded-full inline-block mt-0.5 border border-orange-200">⭐ {{ elo }} ELO</p>
        </div>
        
        <div class="flex gap-1 border-l-2 border-orange-100 pl-3 ml-1">
          <button v-if="authStore.isGuest" @click="router.push('/login')" @mouseenter="audioService.playHover()" 
            class="px-4 py-2 font-black text-xs uppercase tracking-widest rounded-full shadow-md hover:scale-105 transition-all cursor-pointer border border-white/30"
            style="background: linear-gradient(135deg, #FF7B00 0%, #E63946 100%); color: #ffffff !important;">
            Login / Register
          </button>
          <button v-else @click="handleLogout" @mouseenter="audioService.playHover()" 
            class="w-9 h-9 flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-full transition-colors shadow-sm" title="Disconnect">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          </button>
        </div>
      </div>
    </header>

    <main class="relative z-20 flex-1 flex flex-col justify-center items-center px-4 w-full">
      <div class="w-full max-w-[650px] flex flex-col items-center text-center relative z-10 mt-[-5vh]">
        
        <div class="inline-flex items-center gap-2 bg-white border-2 border-orange-200 text-orange-600 px-5 py-2 rounded-full mb-6 shadow-sm">
          <span class="text-sm animate-pulse">🔥</span>
          <span class="text-xs font-black tracking-widest uppercase">
            {{ authStore.isGuest ? 'Playing as Guest — Press Enter to Play!' : 'Season 1 is Live!' }}
          </span>
        </div>

        <h2 class="text-6xl md:text-[5rem] font-black uppercase tracking-tight text-gray-800 mb-6 drop-shadow-sm leading-none">
          Ready to <br/>
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-orange to-hexred">Type?</span>
        </h2>
        
        <p class="text-gray-600 font-bold max-w-sm mx-auto text-sm md:text-base leading-relaxed mb-10 bg-white/60 p-4 rounded-3xl border border-white shadow-sm backdrop-blur-sm">
          Join the thrilling 1vs1 arena. Type lightning fast, use tactical cards, and climb the ranks now! 🎮
        </p>

        <div class="w-full px-4 mb-8">
          <button @click="handlePrimaryPlay" @mouseenter="audioService.playHover()" :disabled="isSearching"
            class="group relative w-full h-[80px] rounded-[2rem] text-white font-black text-2xl tracking-widest uppercase transition-all duration-150 disabled:opacity-70 flex items-center justify-center gap-3 border-4 border-white active:translate-y-[8px] active:shadow-none overflow-hidden hover:scale-[1.02] cursor-pointer"
            :style="!isSearching 
              ? 'background: linear-gradient(135deg, #FF7B00 0%, #E63946 100%); color: #ffffff !important; box-shadow: 0 8px 0 #b91c1c, 0 15px 40px rgba(239,68,68,0.7)' 
              : 'background: linear-gradient(135deg, #FF7B00 0%, #E63946 100%); color: #ffffff !important; box-shadow: 0 0px 0 #b91c1c; transform: translateY(8px)'">
            
            <div class="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-full h-full -translate-x-[150%] animate-shimmer"></div>

            <span v-if="!isSearching" class="drop-shadow-md z-10 flex items-center gap-2" style="color: #ffffff !important;">
              {{ authStore.isGuest ? 'PLAY NOW' : 'FIND MATCH 1V1' }}
              <span class="text-xs bg-black/20 px-2.5 py-1 rounded-full border border-white/30 font-mono hidden sm:inline-block" style="color: #ffffff !important;">PRESS ENTER ↵</span>
            </span>
            <span v-else class="animate-pulse z-10" style="color: #ffffff !important;">
              {{ authStore.isGuest ? 'Starting... ☁️' : 'Finding Match... ☁️' }}
            </span>
            
            <svg v-if="!isSearching" class="w-8 h-8 drop-shadow-md z-10" style="color: #ffffff !important;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          </button>
        </div>

        <div class="w-full grid gap-4 px-4 mb-4" :class="authStore.isGuest ? 'grid-cols-2' : 'grid-cols-2'">
          <button @click="goToCustomRoom" @mouseenter="audioService.playHover()" :disabled="isJoiningCustom"
            class="relative h-16 rounded-2xl bg-white border-b-4 border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 transition-all font-black text-sm tracking-widest uppercase flex items-center justify-center gap-2 active:border-b-0 active:translate-y-1 shadow-sm">
            <span class="text-xl">🤝</span>
            <span>Create Room</span>
            <span v-if="authStore.isGuest" class="absolute -top-2 -right-2 bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow border border-white flex items-center gap-0.5">
              🔒 Login
            </span>
          </button>

          <div class="relative h-16 rounded-2xl bg-white border-b-4 border-gray-200 flex overflow-hidden focus-within:border-orange-400 transition-all group active:border-b-0 active:translate-y-1 shadow-sm">
            <input v-model="joinCode" @keyup.enter="joinExistingRoom" type="text" placeholder="CODE..."
              class="bg-transparent text-gray-800 font-black pl-5 w-full outline-none uppercase text-sm placeholder:text-gray-400" maxlength="12" />
            <button @click="joinExistingRoom" @mouseenter="audioService.playHover()" :disabled="!joinCode || isJoiningCustom"
              class="px-5 text-orange-500 font-black text-sm uppercase hover:bg-orange-50 transition-colors disabled:opacity-50 border-l border-gray-100 flex items-center gap-1">
              <span>Join</span>
              <span v-if="authStore.isGuest" class="text-xs">🔒</span>
            </button>
          </div>
        </div>

        <div class="w-full grid gap-3 px-4" :class="authStore.isGuest ? 'grid-cols-3' : 'grid-cols-2 md:grid-cols-4'">
          <button @click="goToLeaderboard" @mouseenter="audioService.playHover()"
            class="relative h-14 rounded-2xl bg-white/80 border-2 border-white text-gray-600 hover:text-orange-500 hover:bg-white transition-all font-black text-xs tracking-widest uppercase shadow-sm active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer">
            <span>🏆</span> Leaderboard
            <span v-if="authStore.isGuest" class="text-xs text-amber-500">🔒</span>
          </button>
          
          <button @click="router.push('/library'); audioService.playClick()" @mouseenter="audioService.playHover()"
            class="h-14 rounded-2xl bg-white/80 border-2 border-white text-gray-600 hover:text-blue-500 hover:bg-white transition-all font-black text-xs tracking-widest uppercase shadow-sm active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer">
            <span>📚</span> Library
          </button>

          <button @click="goToMissions" @mouseenter="audioService.playHover()"
            class="relative h-14 rounded-2xl bg-white/80 border-2 border-white text-gray-600 hover:text-hexred hover:bg-white transition-all font-black text-xs tracking-widest uppercase shadow-sm active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer">
            <span>🎯</span> Missions
            <span v-if="authStore.isGuest" class="text-xs text-amber-500">🔒</span>
          </button>

          <button v-if="!authStore.isGuest" @click="startSinglePlayer" @mouseenter="audioService.playHover()"
            class="h-14 rounded-2xl bg-white/80 border-2 border-white text-gray-600 hover:text-red-500 hover:bg-white transition-all font-black text-xs tracking-widest uppercase shadow-sm active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer">
            <span>🎮</span> Training
          </button>
        </div>

      </div>
    </main>

    <div class="relative z-20 h-3 w-full bg-white flex mt-auto">
      <div class="w-1/3 h-full bg-gradient-to-r from-orange-400 to-red-400 rounded-tr-full"></div>
    </div>

    <AIChatWidget />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { audioService } from '../services/audioService'
import AIChatWidget from '../components/AIChatWidget.vue'

const router = useRouter()
const authStore = useAuthStore()

const isSearching = ref(false)
const joinCode = ref('')
const isJoiningCustom = ref(false)

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

const elo = computed(() => authStore.profile?.elo ?? 0)

function handleGuestRestrictedClick(featureName: string) {
  audioService.playClick()
  alert(`Tính năng ${featureName} chỉ dành cho tài khoản đã đăng nhập. Bạn sẽ được chuyển tới trang đăng nhập!`)
  router.push('/login')
}

function joinExistingRoom() {
  if (authStore.isGuest) {
    handleGuestRestrictedClick('Đấu Custom Room')
    return
  }
  if (!joinCode.value) return
  audioService.playClick()
  isJoiningCustom.value = true
  setTimeout(() => {
    let code = joinCode.value.trim()
    router.push(`/room/custom?id=${code}`).finally(() => {
      isJoiningCustom.value = false
      joinCode.value = '' 
    })
  }, 600)
}

function goToCustomRoom() {
  if (authStore.isGuest) {
    handleGuestRestrictedClick('Tạo Phòng Custom')
    return
  }
  audioService.playClick()
  isJoiningCustom.value = true
  setTimeout(() => {
    router.push('/room/custom').finally(() => {
      isJoiningCustom.value = false
    })
  }, 600)
}

function goToLeaderboard() {
  if (authStore.isGuest) {
    handleGuestRestrictedClick('Bảng Xếp Hạng')
    return
  }
  audioService.playClick()
  router.push('/leaderboard')
}

function goToMissions() {
  if (authStore.isGuest) {
    handleGuestRestrictedClick('Nhiệm Vụ Lõi')
    return
  }
  audioService.playClick()
  router.push('/missions')
}

function handleLogout() {
  audioService.playClick()
  authStore.logout()
  router.push('/login')
}

function startMatchmaking() {
  if (authStore.isGuest) {
    handleGuestRestrictedClick('Tìm Trận Đấu Online')
    return
  }
  audioService.playClick()
  isSearching.value = true
  setTimeout(() => {
    router.push('/matchmaking').finally(() => {
      isSearching.value = false
    })
  }, 1000)
}

function startSinglePlayer() {
  audioService.playClick()
  router.push('/core')
}

function handlePrimaryPlay() {
  if (authStore.isGuest) {
    startSinglePlayer()
  } else {
    startMatchmaking()
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    const activeEl = document.activeElement
    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
      return
    }
    e.preventDefault()
    handlePrimaryPlay()
  }
}

import { getSavedReconnectionToken, reconnectMatchRoom, currentRoom } from '../services/multiplayerService'
import { onUnmounted } from 'vue'

onMounted(async () => {
  audioService.stopBGM()
  window.addEventListener('keydown', handleKeydown)

  if (!localStorage.getItem('arena_token')) {
    await authStore.loginAsGuest()
  }

  const token = getSavedReconnectionToken()
  if (token && !currentRoom) {
    try {
      console.log('[HomeView] Found saved reconnection token, reconnecting to match...')
      const room = await reconnectMatchRoom(token)
      if (room) {
        if (room.state && room.state.status === "playing") {
          router.push('/game/multiplayer')
        } else {
          router.push('/core/multiplayer')
        }
      }
    } catch (e) {
      console.warn('[HomeView] Reconnection token invalid or expired:', e)
    }
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
/* Khối màu Pastel trôi lơ lửng */
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

/* HIỆU ỨNG ZERO-GRAVITY DRIFTING TỪ DƯỚI LÊN & NHANH HƠN */
.animate-drift-1 { animation: drift1 7s ease-in-out infinite; } 
.animate-drift-2 { animation: drift2 9s ease-in-out infinite; } 
.animate-drift-3 { animation: drift3 8s ease-in-out infinite; } 
.animate-drift-4 { animation: drift4 10s ease-in-out infinite; } 
.animate-drift-5 { animation: drift5 11s ease-in-out infinite; } 

@keyframes drift1 {
  0% { transform: translate(0, 120vh) rotate(0deg); opacity: 0; }
  20% { opacity: 0.3; }
  50% { transform: translate(40px, 50vh) rotate(45deg); opacity: 0.6; }
  80% { opacity: 0.3; transform: translate(-20px, 20vh) rotate(90deg); }
  100% { transform: translate(10px, -20vh) rotate(120deg); opacity: 0; }
}

@keyframes drift2 {
  0% { transform: translate(0, 120vh) rotate(15deg); opacity: 0; }
  30% { opacity: 0.2; transform: translate(-30px, 80vh) rotate(0deg); }
  60% { opacity: 0.5; transform: translate(20px, 40vh) rotate(-30deg); }
  90% { opacity: 0.2; }
  100% { transform: translate(-10px, -20vh) rotate(-60deg); opacity: 0; }
}

@keyframes drift3 {
  0% { transform: translate(0, 120vh) rotate(-20deg); opacity: 0; }
  40% { opacity: 0.15; transform: translate(50px, 70vh) rotate(10deg); }
  70% { opacity: 0.3; transform: translate(-40px, 30vh) rotate(40deg); }
  100% { transform: translate(20px, -20vh) rotate(80deg); opacity: 0; }
}

@keyframes drift4 {
  0% { transform: translate(0, 120vh) rotate(45deg) scale(0.8); opacity: 0; }
  25% { opacity: 0.2; transform: translate(-50px, 90vh) rotate(20deg) scale(1); }
  75% { opacity: 0.4; transform: translate(30px, 30vh) rotate(-20deg) scale(0.9); }
  100% { transform: translate(-20px, -20vh) rotate(-45deg) scale(0.8); opacity: 0; }
}

@keyframes drift5 {
  0% { transform: translate(0, 120vh) rotate(-30deg) scale(1.1); opacity: 0; }
  35% { opacity: 0.25; transform: translate(60px, 80vh) rotate(15deg) scale(1); }
  85% { opacity: 0.2; transform: translate(-30px, 20vh) rotate(60deg) scale(1.2); }
  100% { transform: translate(10px, -20vh) rotate(90deg) scale(1); opacity: 0; }
}

.animate-shimmer {
  animation: shimmer 2.5s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-150%); }
  100% { transform: translateX(250%); }
}
</style>
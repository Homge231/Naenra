<template>
    <div class="h-screen w-full bg-[#fff8f5] text-gray-800 relative flex flex-col items-center justify-center font-sans overflow-hidden selection:bg-orange-300/50">
        
        <div class="absolute inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center">
            <div class="absolute top-[-10%] left-[-5%] w-[50vw] h-[50vw] bg-orange-300/30 rounded-full mix-blend-multiply blur-[100px] animate-float-slow"></div>
            <div class="absolute bottom-[-10%] right-[-5%] w-[45vw] h-[45vw] bg-red-300/20 rounded-full mix-blend-multiply blur-[100px] animate-float-delayed"></div>
            <div class="absolute top-[30%] left-[60%] w-[30vw] h-[30vw] bg-rose-200/40 rounded-full mix-blend-multiply blur-[80px] animate-pulse-slow"></div>
            <div class="absolute top-[45%] left-[5%] w-[40vw] h-[40vw] bg-blue-300/20 rounded-full mix-blend-multiply blur-[100px] animate-float-slow" style="animation-delay: 2s;"></div>
            <div class="absolute top-[5%] left-[35%] w-[35vw] h-[35vw] bg-purple-300/20 rounded-full mix-blend-multiply blur-[90px] animate-pulse-slow" style="animation-delay: 1.5s;"></div>
            <div class="absolute bottom-[5%] left-[30%] w-[50vw] h-[50vw] bg-yellow-300/20 rounded-full mix-blend-multiply blur-[120px] animate-float-delayed" style="animation-delay: 3s;"></div>

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

        <div class="absolute top-4 md:top-8 left-3 md:left-8 z-50 flex flex-col items-start gap-1">
            <p class="text-[9px] md:text-[10px] text-gray-400 font-bold tracking-[0.2em] uppercase ml-1">Leave</p>
            <button @click="router.push('/home')"
                class="flex items-center justify-center px-3 md:px-4 py-2 md:py-2.5 bg-white border-2 border-gray-200 rounded-xl md:rounded-2xl shadow-sm group hover:bg-red-50 hover:border-red-200 transition-all duration-300 focus:outline-none"
                title="Abandon Room">
                <svg class="w-5 h-5 md:w-6 md:h-6 text-gray-400 group-hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                </svg>
            </button>
        </div>

        <div class="absolute top-4 md:top-8 right-3 md:right-8 z-50 flex flex-col items-end gap-1">
            <p class="text-[9px] md:text-[10px] text-gray-400 font-bold tracking-[0.2em] uppercase mr-1">Room Code</p>
            <div
                class="flex items-center gap-2 md:gap-4 bg-white/80 backdrop-blur-md border-2 border-gray-200 px-3 md:px-5 py-2 md:py-2.5 rounded-xl md:rounded-2xl shadow-sm group hover:border-orange-300 transition-all duration-300">
                <span class="text-lg md:text-2xl font-mono font-black text-gray-900 tracking-widest drop-shadow-sm">
                    {{ roomId }}
                </span>
                <button @click="copyRoomId"
                    class="relative text-gray-400 hover:text-orange-500 transition-colors focus:outline-none p-1 active:scale-95"
                    :title="copied ? 'Copied!' : 'Copy to clipboard'">
                    <svg v-if="!copied" class="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z">
                        </path>
                    </svg>
                    <svg v-else class="w-5 h-5 md:w-6 md:h-6 text-green-500" fill="none"
                        stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span v-if="copied"
                        class="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-bold text-green-600 uppercase tracking-widest whitespace-nowrap animate-fade-up">
                        Copied!
                    </span>
                </button>
            </div>
        </div>

        <div class="absolute bottom-4 md:bottom-8 left-3 md:left-8 z-50 flex flex-col items-start gap-1">
            <p class="text-[9px] md:text-[10px] text-gray-400 font-bold tracking-[0.2em] uppercase ml-1">Settings</p>
            <button @click="isRoomSettingsOpen = true"
                class="flex items-center justify-center px-3 md:px-4 py-2 md:py-2.5 bg-white border-2 border-gray-200 text-gray-500 rounded-xl md:rounded-2xl shadow-sm group hover:bg-gray-50 hover:text-gray-900 transition-all duration-300 focus:outline-none active:scale-95"
                title="Room Settings">
                <svg class="w-5 h-5 md:w-6 md:h-6 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
            </button>
        </div>

        <main class="relative z-20 flex flex-col items-center w-full max-w-5xl px-4 mt-16 md:mt-0">
            <h1 class="text-2xl md:text-5xl font-black italic tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500 mb-6 md:mb-12 drop-shadow-sm">
                Custom Room
            </h1>

            <div class="flex flex-row md:flex-row items-center justify-center gap-6 md:gap-24 w-full mb-8 md:mb-16">

                <!-- Player 1 -->
                <div class="flex flex-col items-center transform transition-transform duration-500 hover:-translate-y-2">
                    <template v-if="player1">
                        <div class="w-24 h-24 md:w-44 md:h-44 rounded-[1.5rem] md:rounded-[2rem] bg-white backdrop-blur-xl border-4 border-orange-200 p-1.5 md:p-2 shadow-lg relative">
                            <div class="absolute -top-2.5 -right-2.5 md:-top-3 md:-right-3 bg-gray-900 text-white text-[9px] md:text-[10px] font-black px-2 md:px-3 py-0.5 md:py-1 rounded-full uppercase tracking-wider shadow-md border-2 border-gray-900">Host</div>
                            <img :src="player1.avatar" :alt="player1.name" class="w-full h-full rounded-[1.2rem] md:rounded-[1.5rem] object-cover bg-gray-100" />
                        </div>
                        <p class="mt-3 md:mt-6 text-base md:text-2xl font-black tracking-widest uppercase text-gray-900 drop-shadow-sm">
                            {{ player1.name }}
                        </p>
                    </template>
                    <template v-else>
                        <div class="w-24 h-24 md:w-44 md:h-44 rounded-[1.5rem] md:rounded-[2rem] bg-gray-100/80 backdrop-blur-md border-4 border-dashed border-gray-300 flex items-center justify-center p-2 shadow-inner">
                            <svg class="w-8 h-8 md:w-12 md:h-12 text-gray-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                            </svg>
                        </div>
                        <p class="mt-3 md:mt-6 text-xs md:text-sm font-bold tracking-[0.2em] uppercase text-gray-400 animate-pulse">
                            Loading...
                        </p>
                    </template>
                </div>

                <!-- VS -->
                <div class="flex flex-col items-center justify-center relative">
                    <div class="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 blur-xl opacity-30 rounded-full"></div>
                    <span class="relative z-10 text-3xl md:text-6xl font-black italic text-transparent bg-clip-text bg-gradient-to-b from-orange-500 to-red-600 drop-shadow-sm">
                        VS
                    </span>
                </div>

                <!-- Player 2 -->
                <div class="flex flex-col items-center transform transition-transform duration-500 hover:-translate-y-2">
                    <template v-if="player2">
                        <div class="w-24 h-24 md:w-44 md:h-44 rounded-[1.5rem] md:rounded-[2rem] bg-white backdrop-blur-xl border-4 border-blue-200 p-1.5 md:p-2 shadow-lg">
                            <img :src="player2.avatar" :alt="player2.name" class="w-full h-full rounded-[1.2rem] md:rounded-[1.5rem] object-cover bg-gray-100" />
                        </div>
                        <p class="mt-3 md:mt-6 text-base md:text-2xl font-black tracking-widest uppercase text-gray-900 drop-shadow-sm">
                            {{ player2.name }}
                        </p>
                    </template>

                    <template v-else>
                        <div class="w-24 h-24 md:w-44 md:h-44 rounded-[1.5rem] md:rounded-[2rem] bg-gray-100/80 backdrop-blur-md border-4 border-dashed border-gray-300 flex items-center justify-center p-2 shadow-inner">
                            <svg class="w-8 h-8 md:w-12 md:h-12 text-gray-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                            </svg>
                        </div>
                        <p class="mt-3 md:mt-6 text-xs md:text-sm font-bold tracking-[0.2em] uppercase text-gray-400 animate-pulse">
                            Waiting...
                        </p>
                    </template>
                </div>
            </div>

            <div class="mt-2 md:mt-4 flex flex-col items-center w-full max-w-sm" v-if="isHost">
                <button 
                    :disabled="!canStartGame"
                    @click="initiateMatch"
                    class="group relative w-full py-3.5 md:py-5 bg-gray-900 text-white font-black text-lg md:text-2xl tracking-widest uppercase rounded-[1.5rem] md:rounded-[2rem] shadow-[0_8px_20px_rgba(0,0,0,0.15)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black hover:shadow-[0_10px_25px_rgba(0,0,0,0.25)] hover:-translate-y-1 active:scale-[0.98] disabled:hover:translate-y-0 transition-all duration-300 overflow-hidden">
                    <div class="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-full h-full -translate-x-[150%] group-hover:animate-shimmer hidden group-hover:block"></div>
                    <span class="relative z-10">Play Game</span>
                </button>
                <p v-if="!canStartGame" class="mt-3 md:mt-4 text-xs font-bold text-gray-500 uppercase tracking-widest animate-pulse">
                    Waiting for opponent...
                </p>
            </div>
            
            <div class="mt-2 md:mt-4 flex flex-col items-center w-full max-w-sm" v-else>
                <div v-if="canStartGame" class="py-3 md:py-4 px-6 md:px-8 bg-orange-50 border-2 border-orange-200 rounded-2xl text-center shadow-sm">
                    <p class="text-sm font-black text-orange-500 animate-pulse tracking-widest uppercase">
                        Waiting for host to start...
                    </p>
                </div>
            </div>
        </main>

        <RoomSettingsOverlay 
            :isOpen="isRoomSettingsOpen"
            :isHost="isHost"
            :metadata="roomMetadata"
            @close="isRoomSettingsOpen = false"
            @save="saveRoomSettings"
        />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/authStore.ts'
import { createMatchRoom, joinMatchRoomById, leaveMatchRoom, currentRoom } from '../../services/multiplayerService.ts'
import RoomSettingsOverlay from '../../components/game/RoomSettingsOverlay.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const navigatingToGame = ref(false)

const roomId = ref(route.query.id as string || 'Loading...')
const copied = ref(false)
const isRoomSettingsOpen = ref(false)
const roomMetadata = ref({
    vocabularyLevel: 'Normal',
    difficulty: 'Standard',
    topic: 'Any',
    disabledCores: [] as string[],
    pureSkillMode: false
})

// MẢNG ALPHABET TỪ HOMEVIEW CHUYỂN SANG ĐỂ TẠO HIỆU ỨNG BACKGROUND
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

const saveRoomSettings = (newMetadata: { vocabularyLevel: string, difficulty: string, topic: string, disabledCores: string[], pureSkillMode: boolean }) => {
    if (currentRoom) {
        currentRoom.send('updateMetadata', newMetadata)
    }
}

// Track the current user's ID securely to determine host status later
const currentUserId = computed(() => authStore.user?.id || authStore.profile?.id)

const copyRoomId = async () => {
    try {
        await navigator.clipboard.writeText(roomId.value)
        copied.value = true
        setTimeout(() => copied.value = false, 2000)
    } catch (err) {
        console.error('Failed to copy room ID: ', err)
    }
}

const participants = ref<{ id: string, name: string, avatar: string }[]>([])
const roomHostId = ref<string>('')

const player1 = computed(() => participants.value[0] || null)
const player2 = computed(() => participants.value[1] || null)

// Determine if the current user is the host
const isHost = computed(() => {
    return roomHostId.value === currentUserId.value && roomHostId.value !== ''
})

// Sub-task: FE Button Conditional Lock
const canStartGame = computed(() => {
    return participants.value.length === 2
})

// Sub-task: FE Match Start Event
const initiateMatch = () => {
    if (currentRoom && canStartGame.value) {
        // Emit an execution signal up to the WebSocket channel
        currentRoom.send('start_match')
    }
}

onMounted(async () => {
    // Wait for the auth store to finish loading the profile.
    while (authStore.loading) {
        await new Promise(resolve => setTimeout(resolve, 50))
    }

    const maxWaitMs = 3000
    const startTime = Date.now()
    while (!localStorage.getItem('arena_token') && authStore.isLoggedIn && Date.now() - startTime < maxWaitMs) {
        await new Promise(resolve => setTimeout(resolve, 50))
    }

    const options = {
        token: localStorage.getItem('arena_token'),
        id: currentUserId.value,
        name: authStore.profile?.username || 'Guest',
        avatar: authStore.profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=Guest`,
        isCustom: true
    }

    try {
        if (route.query.id) {
            // Join existing room (or re-use already connected one)
            if (!currentRoom || currentRoom.roomId !== route.query.id) {
                await joinMatchRoomById(route.query.id as string, options)
            } else {
                console.log("Already connected to custom room — re-attaching listeners.")
            }
        } else {
            // Create new room
            const room = await createMatchRoom(options)
            roomId.value = room.roomId
            router.replace({ query: { id: room.roomId } })
        }

        if (currentRoom) {
            // Helper to parse state and populate participants/metadata
            const applyState = (state: any) => {
                try {
                    const newParticipants: { id: string, name: string, avatar: string }[] = []
                    const playersObj = state.toJSON ? state.toJSON().players : state.players || {}
                    Object.values(playersObj).forEach((player: any) => {
                        if (player && player.name) {
                            newParticipants.push({
                                id: player.id,
                                name: player.name,
                                avatar: player.avatar
                            })
                        }
                    })
                    // Sort participants so that the host is always player1
                    const stateJson = state.toJSON ? state.toJSON() : state
                    const hostId = stateJson.hostId
                    if (hostId) {
                        roomHostId.value = hostId
                        newParticipants.sort((a, b) => {
                            if (a.id === hostId) return -1
                            if (b.id === hostId) return 1
                            return 0
                        })
                    }
                    participants.value = newParticipants

                    const meta = stateJson.metadata
                    if (meta) {
                        roomMetadata.value = {
                            vocabularyLevel: meta.vocabularyLevel || 'Normal',
                            difficulty: meta.difficulty || 'Standard',
                            topic: meta.topic || 'Any',
                            disabledCores: meta.disabledCores || [],
                            pureSkillMode: meta.pureSkillMode || false
                        }
                    }
                } catch (e) {
                    console.error("Error parsing room state:", e)
                }
            }

            // Always re-attach listeners so they work after returning from game view
            currentRoom.removeAllListeners()

            currentRoom.onStateChange((state: any) => {
                applyState(state)
            })

            currentRoom.onMessage('match_started', () => {
                navigatingToGame.value = true
                if (roomMetadata.value.pureSkillMode) {
                    router.push('/game/pure-skill-multiplayer')
                } else {
                    router.push('/core/multiplayer')
                }
            })

            // Server confirms everyone is back in the lobby (after Play Again)
            currentRoom.onMessage('returned_to_lobby', () => {
                console.log('[CustomRoom] All players returned to lobby.')
                navigatingToGame.value = false
            })

            // --- KEY FIX ---
            // Colyseus only fires onStateChange when state actually changes.
            // If the host was already in the room (never left), no new state
            // broadcast arrives, so we must read the current state immediately.
            if (currentRoom.state) {
                applyState(currentRoom.state)
            }
        }
    } catch (err: any) {
        console.error("Failed to join or create room:", err)
        alert("Could not connect to the room! Error: " + (err.message || err))
        router.push('/home')
    }
})

onUnmounted(() => {
    if (!navigatingToGame.value) {
        leaveMatchRoom()
    }
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

/* HIỆU ỨNG CHỮ CHẢY THẲNG ĐỨNG TỪ DƯỚI LÊN (Bê từ Home qua) */
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

.animate-fade-up {
    animation: fadeUp 0.3s ease-out forwards;
}

@keyframes fadeUp {
    from {
        opacity: 0;
        transform: translate(-50%, 5px);
    }
    to {
        opacity: 1;
        transform: translate(-50%, 0);
    }
}

/* HIỆU ỨNG CHỚP SÁNG CHO BUTTON */
.animate-shimmer {
  animation: shimmer 2.5s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-150%); }
  100% { transform: translateX(250%); }
}
</style>
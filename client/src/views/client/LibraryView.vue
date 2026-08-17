<template>
    <div class="min-h-screen w-full bg-[#fff8f5] text-gray-800 relative font-sans selection:bg-orange/50 flex flex-col">

        <div class="fixed inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center">
            <div
                class="absolute top-[-10%] left-[-5%] w-[50vw] h-[50vw] bg-orange/20 rounded-full mix-blend-multiply blur-[100px] animate-float-slow">
            </div>
            <div
                class="absolute bottom-[-10%] right-[-5%] w-[45vw] h-[45vw] bg-hexred/10 rounded-full mix-blend-multiply blur-[100px] animate-float-delayed">
            </div>
            <div
                class="absolute top-[30%] left-[60%] w-[30vw] h-[30vw] bg-lightBlue/20 rounded-full mix-blend-multiply blur-[80px] animate-pulse-slow">
            </div>

            <div v-for="letter in floatingLetters" :key="letter.id"
                class="absolute top-0 font-black uppercase select-none animate-matrix-drift"
                :class="letter.color"
                :style="{
                    left: letter.left + '%',
                    fontSize: letter.size + 'rem',
                    animationDelay: letter.delay + 's',
                    animationDuration: letter.duration + 's'
                }">
                {{ letter.char }}
            </div>
        </div>

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
                    <h1
                        class="text-3xl font-black mb-1 tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-orange to-hexred drop-shadow-sm uppercase">
                        NAENRA
                    </h1>
                    <p class="text-[10px] text-lightBlue font-bold tracking-[0.3em] uppercase">SELECTION CORES</p>
                </div>
            </div>
        </header>

        <main class="relative z-20 flex-1 w-full max-w-7xl mx-auto px-6 md:px-12 py-8 flex flex-col">

            <div class="mb-10 text-center md:text-left">
                <h2 class="text-4xl md:text-5xl font-black text-gray-900 uppercase tracking-tight drop-shadow-sm mb-3">
                    Core <span
                        class="text-transparent bg-clip-text bg-gradient-to-r from-orange to-hexred">Library</span>
                </h2>
                <p class="text-sm font-bold text-gray-500 max-w-2xl mx-auto md:mx-0">
                    Study the skills and formulate your strategy before entering the typing arena. Below are all active
                    cores.
                </p>
            </div>

            <div v-if="loading" class="w-full flex justify-center py-20">
                <svg class="animate-spin w-10 h-10 text-orange" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                    </path>
                </svg>
            </div>

            <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12">

                <div v-for="core in coresData" :key="core.id" @click="router.push(`/library/core/${core.id}`)"
                    class="group bg-white/80 backdrop-blur-xl border-2 border-white rounded-[2rem] p-7 shadow-sm hover:shadow-[0_15px_40px_rgba(0,0,0,0.08)] transform transition-all duration-300 hover:-translate-y-2 flex flex-col h-full cursor-pointer">

                    <div class="flex justify-between items-start mb-6">
                        <div
                            class="w-16 h-16 rounded-2xl p-[3px] shadow-sm bg-gradient-to-br from-orange to-hexred group-hover:brightness-110 transition-all">
                            <div
                                class="w-full h-full bg-white rounded-[14px] flex items-center justify-center overflow-hidden">
                                <img :src="core.icon || core.icon_url || core.image || `https://api.dicebear.com/7.x/icons/svg?seed=${core.name}`"
                                    :alt="core.name"
                                    class="w-10 h-10 object-contain drop-shadow-sm group-hover:scale-110 transition-transform duration-300" />
                            </div>
                        </div>

                        <div class="px-3 py-1 rounded-full border shadow-sm bg-orange/10 text-orange border-orange/30">
                            <span class="text-[10px] font-black tracking-widest uppercase">CORE</span>
                        </div>
                    </div>

                    <div class="flex-1 flex flex-col">
                        <h3
                            class="text-xl font-black text-gray-900 uppercase tracking-wide mb-2 group-hover:text-orange transition-colors">
                            {{ core.name }}
                        </h3>
                        <div
                            class="w-10 h-1 bg-gray-200 rounded-full mb-4 group-hover:w-16 group-hover:bg-orange transition-all duration-300">
                        </div>
                        <p class="text-sm font-semibold text-gray-500 leading-relaxed flex-1">
                            {{ core.description || core.desc }}
                        </p>
                    </div>

                </div>

            </div>

            <div v-if="!loading && coresData.length === 0" class="text-center py-20">
                <p class="text-xl font-black text-gray-400 uppercase tracking-widest">No cores available.</p>
            </div>

        </main>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

// NẾU BẠN ĐANG DÙNG BIẾN allCores ĐƯỢC IMPORT TỪ FILE LOCAL, BẠN CÓ THỂ MỞ COMMENT DÒNG DƯỚI ĐÂY:
// import { allCores } from '../../game/cores/registry' 

const router = useRouter()
const coresData = ref<any[]>([])
const loading = ref(true)

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'

onMounted(async () => {
    try {
        const token = localStorage.getItem('arena_token') || ''
        const res = await fetch(`${SERVER_URL}/api/game/cores`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })

        if (res.ok) {
            const data = await res.json()
            coresData.value = data.data || data.cores || data || []
        } else {
            throw new Error('Failed to fetch from API')
        }
    } catch (err) {
        console.error("Lỗi lấy Cores từ server, thử fallback về local allCores...", err)
        if (typeof window !== 'undefined' && (window as any).allCores) {
            coresData.value = (window as any).allCores
        }
        // Nếu dùng import trực tiếp ở trên thì mở comment dòng này:
        // coresData.value = allCores 
    } finally {
        loading.value = false
    }
})

// Background Animation Array
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
const colors = [
    'text-orange/20',
    'text-hexred/20',
    'text-lightBlue/25',
    'text-lightOrange/20',
    'text-violet-400/20'
]
const floatingLetters = alphabet.map((char, index) => ({
    id: index,
    char: char,
    left: Math.random() * 95,
    size: 1.5 + Math.random() * 4,
    delay: Math.random() * 15,
    duration: 15 + Math.random() * 20,
    color: colors[index % colors.length]
}))
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
    0% {
        transform: translate(0, 0) scale(1);
    }

    100% {
        transform: translate(40px, -40px) scale(1.1);
    }
}

@keyframes pulseBlob {
    0% {
        transform: scale(1);
        opacity: 0.3;
    }

    100% {
        transform: scale(1.1);
        opacity: 0.5;
    }
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
</style>
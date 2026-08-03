<template>
    <div class="min-h-screen w-full bg-[#fff8f5] text-gray-800 relative font-sans selection:bg-orange/50 flex flex-col">

        <!-- Background Ambient Blobs -->
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
                class="absolute top-0 font-black uppercase text-gray-300 select-none animate-matrix-drift opacity-40"
                :style="{
                    left: letter.left + '%',
                    fontSize: letter.size + 'rem',
                    animationDelay: letter.delay + 's',
                    animationDuration: letter.duration + 's'
                }">
                {{ letter.char }}
            </div>
        </div>

        <!-- Header -->
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

        <!-- Main Content -->
        <main class="relative z-20 flex-1 w-full max-w-7xl mx-auto px-6 md:px-12 py-8 flex flex-col">

            <!-- Title & Category Tabs -->
            <div class="mb-10 text-center md:text-left">
                <h2 class="text-4xl md:text-5xl font-black text-gray-900 uppercase tracking-tight drop-shadow-sm mb-3">
                    Core <span
                        class="text-transparent bg-clip-text bg-gradient-to-r from-orange to-hexred">Library</span>
                </h2>
                <p class="text-sm font-bold text-gray-500 max-w-2xl mx-auto md:mx-0 mb-6">
                    Study the skills and formulate your strategy before entering the typing arena. Below are all active base cores.
                </p>

                <!-- Category Tabs (Attack, Defense, Economy, All) -->
                <div class="flex flex-wrap justify-center md:justify-start gap-3">
                    <button v-for="tab in tabs" :key="tab" @click="activeTab = tab"
                        :class="[
                            'px-6 py-2.5 rounded-full font-black text-xs uppercase tracking-widest transition-all shadow-sm border cursor-pointer',
                            activeTab === tab 
                                ? 'bg-gradient-to-r from-orange to-hexred text-white border-transparent shadow-[0_4px_14px_rgba(255,107,0,0.35)] scale-105' 
                                : 'bg-white/80 text-gray-500 border-white/60 hover:bg-orange/10 hover:text-orange hover:border-orange/30'
                        ]">
                        {{ tab }}
                    </button>
                </div>
            </div>

            <!-- Loading Spinner -->
            <div v-if="loading" class="w-full flex justify-center py-20">
                <svg class="animate-spin w-10 h-10 text-orange" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                    </path>
                </svg>
            </div>

            <!-- Grid Layout -->
            <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12" style="grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));">

                <div v-for="core in filteredCores" :key="core.id" @click="router.push(`/library/core/${core.id}`)"
                    class="group bg-white/80 backdrop-blur-xl border-2 border-white rounded-[2rem] p-7 shadow-sm hover:shadow-[0_15px_40px_rgba(0,0,0,0.08)] transform transition-all duration-300 hover:-translate-y-2 flex flex-col h-full cursor-pointer">

                    <div class="flex justify-between items-start mb-6">
                        <div
                            class="w-16 h-16 rounded-2xl p-[3px] shadow-sm bg-gradient-to-br from-orange to-hexred group-hover:brightness-110 transition-all">
                            <div
                                class="w-full h-full bg-white rounded-[14px] flex items-center justify-center overflow-hidden">
                                <img :src="resolveIcon(core)"
                                    :alt="core.name"
                                    @error="onImgError"
                                    class="w-10 h-10 object-contain drop-shadow-sm group-hover:scale-110 transition-transform duration-300" />
                            </div>
                        </div>

                        <!-- Category Pill -->
                        <div class="px-3 py-1 rounded-full border shadow-sm bg-orange/10 text-orange border-orange/30">
                            <span class="text-[10px] font-black tracking-widest uppercase">{{ getCategory(core) }}</span>
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
                            {{ core.description || core.desc || 'Base core for competitive typing matches.' }}
                        </p>
                    </div>

                </div>

            </div>

            <!-- Empty State -->
            <div v-if="!loading && filteredCores.length === 0" class="text-center py-20">
                <p class="text-xl font-black text-gray-400 uppercase tracking-widest">No cores found in this category.</p>
            </div>

        </main>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const coresData = ref<any[]>([])
const loading = ref(true)

const activeTab = ref('All')
const tabs = ['All', 'Attack', 'Defense', 'Economy']

const CATEGORY_MAP: Record<string, string> = {
    'perfect combo': 'Attack',
    'power strike': 'Attack',
    'speedster': 'Attack',
    'argus eyes': 'Economy',
    'mission impossible': 'Economy',
    'balance': 'Economy',
    'high roller': 'Economy',
    'pandora\'s box': 'Attack',
    'phoenix': 'Defense',
    'aegis shield': 'Defense'
}

const getCategory = (core: any): string => {
    if (core.classification && core.classification !== 'main' && core.classification !== 'CORE') {
        const c = core.classification.toLowerCase()
        if (c.includes('attack') || c.includes('power')) return 'Attack'
        if (c.includes('def') || c.includes('aegis') || c.includes('effect')) return 'Defense'
        if (c.includes('econ') || c.includes('balanced') || c.includes('oracle')) return 'Economy'
        return core.classification.toUpperCase()
    }
    const nameKey = core.name?.toLowerCase() || ''
    return CATEGORY_MAP[nameKey] || 'Attack'
}

const filteredCores = computed(() => {
    if (activeTab.value === 'All') return coresData.value
    return coresData.value.filter(c => getCategory(c).toLowerCase() === activeTab.value.toLowerCase())
})

import { getCoreIconPath } from '../game/cores/icons'

const resolveIcon = (core: any) => {
    if (!core || !core.name) return '/icons/cores/default.svg'
    return getCoreIconPath(core.name, core.icon_url || core.icon || core.image)
}

const onImgError = (event: Event) => {
    const target = event.target as HTMLImageElement
    if (target && target.src !== '/icons/cores/default.svg') {
        target.src = '/icons/cores/default.svg'
    }
}

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'

onMounted(async () => {
    try {
        const token = localStorage.getItem('arena_token') || ''
        const res = await fetch(`${SERVER_URL}/api/game/cores`, {
            headers: {
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            }
        })

        if (res.ok) {
            const data = await res.json()
            const raw = data.data || data.cores || data || []
            // Filter to Tier 1 / Base Cores
            coresData.value = raw.filter((c: any) => c.tier === 1 || !c.tier || c.core_type === 'main')
        } else {
            throw new Error('Failed to fetch from API')
        }
    } catch (err) {
        console.error("Lỗi lấy Cores từ server:", err)
    } finally {
        loading.value = false
    }
})

// Background Floating Animations
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
const floatingLetters = alphabet.map((char, index) => ({
    id: index,
    char: char,
    left: Math.random() * 95,
    size: 1.5 + Math.random() * 4,
    delay: Math.random() * 15,
    duration: 15 + Math.random() * 20
}))
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

.animate-matrix-drift {
    animation-name: drift;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
    animation-fill-mode: both;
}

@keyframes drift {
    0% { transform: translateY(110vh); opacity: 0; }
    10% { opacity: 0.2; }
    90% { opacity: 0.2; }
    100% { transform: translateY(-20vh); opacity: 0; }
}
</style>

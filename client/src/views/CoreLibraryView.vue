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

        <!-- Header -->
        <header class="relative z-20 flex justify-between items-center p-3 md:p-4 lg:px-8">
            <div class="flex items-center gap-2 md:gap-4 group cursor-pointer bg-white/60 backdrop-blur-md px-3 md:px-4 py-1.5 md:py-2 rounded-xl md:rounded-2xl shadow-sm border border-white/50 active:scale-95 transition-transform"
                @click="router.push('/home')">
                <div class="w-8 h-8 md:w-12 md:h-12 flex items-center justify-center">
                    <svg class="w-full h-full text-orange fill-current group-hover:scale-110 transition-transform"
                        viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 3 L7 21 L12 21 L12 9 L17 21 L17 3 L12 3 L12 15 L7 3 Z" />
                    </svg>
                </div>
                <div class="leading-none">
                    <h1
                        class="text-xl md:text-3xl font-black mb-0.5 md:mb-1 tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-orange to-hexred drop-shadow-sm uppercase">
                        NAENRA
                    </h1>
                    <p class="text-[8px] md:text-[10px] text-lightBlue font-bold tracking-[0.3em] uppercase">SELECTION CORES</p>
                </div>
            </div>

            <button @click="router.push('/missions')"
                class="px-3 md:px-5 py-1.5 md:py-2.5 rounded-full font-black text-[10px] md:text-xs uppercase tracking-widest bg-white/80 text-gray-700 border border-white/60 hover:bg-orange/10 hover:text-orange transition-all shadow-sm flex items-center gap-1.5 md:gap-2 cursor-pointer">
                <span>🎯</span> <span class="hidden sm:inline">Missions Tracker</span><span class="sm:hidden">Missions</span>
            </button>
        </header>

        <!-- Main Content -->
        <main class="relative z-20 flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-12 py-4 md:py-8 flex flex-col">

            <!-- Title & Category Tabs -->
            <div class="mb-5 md:mb-10 text-center md:text-left">
                <h2 class="text-3xl md:text-5xl font-black text-gray-900 uppercase tracking-tight drop-shadow-sm mb-2 md:mb-3">
                    Core <span
                        class="text-transparent bg-clip-text bg-gradient-to-r from-orange to-hexred">Library</span>
                </h2>
                <p class="text-xs md:text-sm font-bold text-gray-500 max-w-2xl mx-auto md:mx-0 mb-3 md:mb-4">
                    Study the skills and formulate your strategy before entering the typing arena. Below are all active base cores.
                </p>

                <!-- Visual Information Banner -->
                <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-orange/10 border border-orange/20 text-orange mb-4 md:mb-6 shadow-sm">
                    <span class="text-xs">💡</span>
                    <span class="text-[10px] md:text-xs font-black uppercase tracking-wider">
                        Tap card to view Evolutions • <strong class="text-hexred underline decoration-dotted">Press & Hold</strong> for Quick Core Info
                    </span>
                </div>

                <!-- Category Tabs (Attack, Defense, Economy, All) -->
                <div class="flex flex-wrap justify-center md:justify-start gap-2 md:gap-3">
                    <button v-for="tab in tabs" :key="tab" @click="activeTab = tab"
                        :class="[
                            'px-4 md:px-6 py-1.5 md:py-2.5 rounded-full font-black text-[10px] md:text-xs uppercase tracking-widest transition-all shadow-sm border cursor-pointer',
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
            <div v-else class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6 pb-12">

                <div v-for="core in filteredCores" :key="core.id" 
                    @click="handleCardClick($event, core)"
                    @mousedown="startHold($event, core)"
                    @mouseup="cancelHold"
                    @mouseleave="cancelHold(); hideTooltip()"
                    @touchstart.passive="startHold($event, core)"
                    @touchend="cancelHold"
                    @touchmove="cancelHold"
                    @mouseenter="showTooltip($event, core)"
                    class="group bg-white/80 backdrop-blur-xl border-2 border-white rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-7 shadow-sm hover:shadow-[0_15px_40px_rgba(0,0,0,0.08)] transform transition-all duration-300 hover:-translate-y-2 flex flex-col h-full cursor-pointer relative select-none"
                    :class="{ 'opacity-65 grayscale-[30%]': core.isLocked }">

                    <div class="flex justify-between items-start mb-3 md:mb-6">
                        <div
                            class="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl p-[3px] shadow-sm bg-gradient-to-br from-orange to-hexred group-hover:brightness-110 transition-all">
                            <div
                                class="w-full h-full bg-white rounded-[10px] md:rounded-[14px] flex items-center justify-center overflow-hidden">
                                <img :src="resolveIcon(core)"
                                    :alt="core.name"
                                    @error="onImgError"
                                    class="w-7 h-7 md:w-10 md:h-10 object-contain drop-shadow-sm group-hover:scale-110 transition-transform duration-300" />
                            </div>
                        </div>

                        <!-- Category Pill -->
                        <div class="px-2 md:px-3 py-0.5 md:py-1 rounded-full border shadow-sm bg-orange/10 text-orange border-orange/30 flex items-center gap-1">
                            <span v-if="core.isLocked" class="text-[9px] md:text-[10px]" title="Core Locked">🔒</span>
                            <span class="text-[9px] md:text-[10px] font-black tracking-widest uppercase">{{ getCategory(core) }}</span>
                        </div>
                    </div>

                    <div class="flex-1 flex flex-col">
                        <h3
                            class="text-sm md:text-xl font-black text-gray-900 uppercase tracking-wide mb-1 md:mb-2 group-hover:text-orange transition-colors leading-tight">
                            {{ core.name }}
                        </h3>
                        <div
                            class="w-8 md:w-10 h-0.5 md:h-1 bg-gray-200 rounded-full mb-2 md:mb-4 group-hover:w-12 md:group-hover:w-16 group-hover:bg-orange transition-all duration-300">
                        </div>
                        <p class="text-[11px] md:text-sm font-semibold text-gray-500 leading-relaxed flex-1 hidden md:block">
                            {{ core.description || core.desc || 'Base core for competitive typing matches.' }}
                        </p>
                        <p class="text-[10px] font-semibold text-gray-400 leading-snug flex-1 md:hidden line-clamp-2">
                            {{ core.description || core.desc || 'Base core.' }}
                        </p>
                    </div>

                    <!-- Hold for info indicator footer -->
                    <div class="mt-3 pt-2 border-t border-gray-100/80 flex items-center justify-between text-[9px] md:text-[10px] font-bold text-gray-400">
                        <span class="flex items-center gap-1 group-hover:text-orange transition-colors">
                            <svg class="w-3 h-3 text-orange animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Hold for Info</span>
                        </span>
                        <span class="text-orange font-black group-hover:translate-x-0.5 transition-transform">➔</span>
                    </div>

                </div>

            </div>

            <!-- Empty State -->
            <div v-if="!loading && filteredCores.length === 0" class="text-center py-20">
                <p class="text-xl font-black text-gray-400 uppercase tracking-widest">No cores found in this category.</p>
            </div>

        </main>

        <!-- Hover Tooltip Container (Desktop) & Press-and-Hold Info Modal -->
        <Teleport to="body">
            <Transition name="fade">
                <!-- Press & Hold Interactive Info Modal -->
                <div 
                    v-if="isModalOpen && modalCore"
                    class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in"
                    @click="closeModal"
                >
                    <div class="relative w-full max-w-sm pointer-events-auto" @click.stop>
                        <CoreTooltip 
                            v-if="modalCore" 
                            :core="modalCore" 
                            :isLocked="modalCore.isLocked" 
                            :isMobile="true"
                            :showClose="true"
                            :showEvolutionBtn="true"
                            @close="closeModal"
                            @viewEvolution="goToEvolution(modalCore)"
                        />
                    </div>
                </div>

                <!-- Desktop Hover Tooltip -->
                <div 
                    v-else-if="isTooltipVisible && hoveredCore && !isMobileScreen"
                    class="fixed z-[9998] pointer-events-none transform -translate-x-1/2 -translate-y-full pb-4"
                    :style="{ top: tooltipY + 'px', left: tooltipX + 'px' }"
                >
                    <CoreTooltip :core="hoveredCore" :isLocked="hoveredCore.isLocked" />
                </div>
            </Transition>
        </Teleport>

        <!-- Floating Scroll To Top Button -->
        <ScrollToTopButton />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { useMissionsStore } from '../stores/missionsStore'
import ScrollToTopButton from '../components/ScrollToTopButton.vue'
import CoreTooltip from '../components/game/CoreTooltip.vue'
import { useDeviceMode } from '../composables/useDeviceMode'
import { CORE_FAMILIES } from '../game/cores/families'

const { isMobileScreen } = useDeviceMode()

const router = useRouter()
const authStore = useAuthStore()
const missionsStore = useMissionsStore()
const coresData = ref<any[]>([])
const loading = ref(true)

const isTooltipVisible = ref(false)
const hoveredCore = ref<any>(null)
const tooltipX = ref(0)
const tooltipY = ref(0)

const isModalOpen = ref(false)
const modalCore = ref<any>(null)
let holdTimer: ReturnType<typeof setTimeout> | null = null
let isLongPress = false
const HOLD_THRESHOLD = 400

function startHold(event: MouseEvent | TouchEvent, core: any) {
    isLongPress = false
    if (holdTimer) clearTimeout(holdTimer)
    
    holdTimer = setTimeout(() => {
        isLongPress = true
        modalCore.value = core
        isModalOpen.value = true
        hideTooltip()
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(50)
        }
    }, HOLD_THRESHOLD)
}

function cancelHold() {
    if (holdTimer) {
        clearTimeout(holdTimer)
        holdTimer = null
    }
}

function closeModal() {
    isModalOpen.value = false
    modalCore.value = null
}

function showTooltip(event: MouseEvent, core: any) {
    if (isMobileScreen.value || isModalOpen.value) return
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
    tooltipX.value = rect.left + rect.width / 2
    tooltipY.value = rect.top
    hoveredCore.value = core
    isTooltipVisible.value = true
}

function hideTooltip() {
    isTooltipVisible.value = false
    hoveredCore.value = null
}

const handleCardClick = (event: MouseEvent | TouchEvent, core: any) => {
    event.stopPropagation()
    if (isLongPress) {
        event.preventDefault()
        isLongPress = false
        return
    }
    cancelHold()
    hideTooltip()
    closeModal()
    const slug = getCoreSlug(core)
    router.push(`/library/core/${slug}`)
}

const goToEvolution = (core: any) => {
    cancelHold()
    hideTooltip()
    closeModal()
    router.push(`/library/core/${getCoreSlug(core)}`)
}

const activeTab = ref('All')
const tabs = ['All', 'Attack', 'Defense', 'Economy']

const CATEGORY_MAP: Record<string, string> = {
    'perfect combo': 'Attack',
    'power strike': 'Attack',
    'speedster': 'Attack',
    'argus eyes': 'Economy',
    'aegis shield': 'Defense',
    'oracle': 'Economy',
    'phoenix': 'Defense',
    'high roller': 'Economy',
    'mission': 'Attack',
    'pandora': 'Defense',
    'balanced': 'Economy',
    'power': 'Attack'
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
    const unlockedIds = new Set(authStore.profile?.unlocked_core_ids || [])
    const baseCores = activeTab.value === 'All' 
        ? coresData.value 
        : coresData.value.filter(c => getCategory(c).toLowerCase() === activeTab.value.toLowerCase())
        
    return baseCores.map((c: any) => {
        const isBaseCore = c.tier === 1 || c.core_type === 'main'
        const isLocked = !isBaseCore && !missionsStore.isCoreUnlocked(c.name)
        return {
            ...c,
            isLocked
        }
    })
})

import { getCoreIconPath } from '../game/cores/icons'
import { getCoreFamilyTheme } from '../game/cores/families'

const getCoreSlug = (core: any): string => {
    if (!core || !core.name) return String(core?.id || '')
    return core.name.toLowerCase().replace(/['']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

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
        }
    } catch (err) {
        console.error("Lỗi lấy Cores từ server:", err)
    }

    // Fallback: If server returns empty array or request fails, populate base cores from CORE_FAMILIES
    if (!coresData.value || coresData.value.length === 0) {
        const fallbackCores: any[] = []
        for (const key in CORE_FAMILIES) {
            const family = CORE_FAMILIES[key]
            const tier1Name = family.tier1[0]
            if (!fallbackCores.some(c => c.name === tier1Name)) {
                fallbackCores.push({
                    id: 'base-' + key,
                    name: tier1Name,
                    tier: 1,
                    core_type: 'main',
                    description: `${tier1Name} base tactical core.`
                })
            }
        }
        coresData.value = fallbackCores
    }

    loading.value = false
})

// Background Floating Animations
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

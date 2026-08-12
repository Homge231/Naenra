<template>
  <div class="min-h-screen w-full bg-[#fff8f5] text-gray-800 relative font-sans selection:bg-orange/50 flex flex-col">
    
    <div class="fixed inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center">
      <div class="absolute top-[-10%] left-[-5%] w-[50vw] h-[50vw] bg-orange/20 rounded-full mix-blend-multiply blur-[100px] animate-float-slow"></div>
      <div class="absolute bottom-[-10%] right-[-5%] w-[45vw] h-[45vw] bg-hexred/10 rounded-full mix-blend-multiply blur-[100px] animate-float-delayed"></div>
      <div class="absolute top-[30%] left-[60%] w-[30vw] h-[30vw] bg-lightBlue/20 rounded-full mix-blend-multiply blur-[80px] animate-pulse-slow"></div>
      
      <div v-for="letter in floatingLetters" :key="letter.id"
        class="absolute top-0 font-black uppercase text-gray-300 select-none animate-matrix-drift opacity-40"
        :style="{ left: letter.left + '%', fontSize: letter.size + 'rem', animationDelay: letter.delay + 's', animationDuration: letter.duration + 's' }">
        {{ letter.char }}
      </div>
    </div>

    <!-- Header Navigation -->
    <header class="relative z-30 w-full px-6 md:px-12 pt-6 pb-4 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <!-- NAENRA Logo (Click to go Home) -->
        <div class="flex items-center gap-4 group cursor-pointer bg-white/60 backdrop-blur-md px-4 py-2 rounded-2xl shadow-sm border border-white/50 active:scale-95 transition-transform"
          @click="router.push('/home')" title="Go to Home">
          <div class="w-12 h-12 flex items-center justify-center">
            <svg class="w-full h-full text-orange fill-current group-hover:scale-110 transition-transform"
              viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 3 L7 21 L12 21 L12 9 L17 21 L17 3 L12 3 L12 15 L7 3 Z" />
            </svg>
          </div>
          <div class="leading-none">
            <h1 class="text-3xl font-black mb-1 tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-orange to-hexred drop-shadow-sm uppercase">
              NAENRA
            </h1>
            <p class="text-[10px] text-lightBlue font-bold tracking-[0.3em] uppercase">CORE DETAILS</p>
          </div>
        </div>

        <!-- Compact Icon Button: Back to Library right next to Logo -->
        <button @click="router.push('/library')"
          class="w-12 h-12 rounded-2xl bg-white/60 backdrop-blur-md border border-white/50 text-gray-600 hover:text-orange hover:bg-white transition-all shadow-sm active:scale-95 cursor-pointer flex items-center justify-center group"
          title="Back to Core Library">
          <svg class="w-6 h-6 text-gray-500 group-hover:text-orange transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>
    </header>

    <div class="relative z-20 w-full max-w-[1400px] mx-auto flex flex-col flex-1 pb-16">

      <div v-if="loading" class="w-full flex justify-center py-24 flex-1 items-center">
        <svg class="animate-spin w-12 h-12 text-orange" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>

      <main v-else-if="baseCore" class="w-full px-6 md:px-12 py-4 flex flex-col gap-12">
        
        <div class="flex flex-col md:flex-row gap-8 items-center md:items-start bg-white/80 backdrop-blur-xl border-2 border-white rounded-[2.5rem] p-8 md:p-10 shadow-sm w-full">
          <div class="w-32 h-32 md:w-40 md:h-40 rounded-3xl p-[3px] shadow-md bg-gradient-to-br from-orange to-hexred flex-shrink-0">
            <div class="w-full h-full bg-white rounded-[21px] flex items-center justify-center overflow-hidden">
              
              <img 
                :src="resolveIcon(baseCore)" 
                :alt="baseCore.name" 
                class="w-full h-full object-contain drop-shadow-sm p-2 rounded-[21px]" 
              />
            </div>
          </div>
          
          <div class="flex-1 text-center md:text-left flex flex-col justify-center">
            <div class="inline-flex items-center gap-2 bg-orange/10 border border-orange/30 px-3.5 py-1 rounded-full w-max mx-auto md:mx-0 mb-4">
              <span class="w-2 h-2 rounded-full bg-orange animate-pulse"></span>
              <span class="text-[10px] font-black tracking-widest text-orange uppercase">Base Core - Round 1</span>
            </div>
            
            <h2 class="text-4xl md:text-5xl font-black text-gray-900 uppercase tracking-tight mb-4">
              {{ baseCore.name }}
            </h2>
            
            <p class="text-base md:text-lg font-bold text-gray-500 leading-relaxed max-w-4xl">
              {{ baseCore.description || baseCore.desc || 'No description available for this core.' }}
            </p>
          </div>
        </div>

        <div class="w-full">
          <div class="flex items-center gap-6 mb-8">
            <h3 class="text-2xl font-black uppercase tracking-widest text-gray-900 whitespace-nowrap">Evolution Paths</h3>
            <div class="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent"></div>
          </div>

          <div v-if="upgrades.length === 0" class="text-center py-12 bg-white/40 rounded-3xl border border-white/50 w-full">
            <p class="font-black text-gray-400 tracking-widest uppercase">No evolution upgrades available for this core.</p>
          </div>

          <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            
            <div 
              v-for="upgrade in upgrades" 
              :key="upgrade.id"
              @mouseenter="showTooltip($event, upgrade)"
              @mouseleave="hideTooltip"
              @touchstart="showTooltip($event, upgrade)"
              @touchend="hideTooltip"
              class="group bg-white/80 backdrop-blur-xl border-2 border-white rounded-[2rem] p-7 shadow-sm hover:shadow-[0_15px_30px_rgba(0,0,0,0.08)] transform transition-all duration-300 hover:-translate-y-2 flex flex-col h-full cursor-help relative overflow-hidden"
              :class="[upgrade.isLocked ? 'opacity-60 grayscale-[40%]' : '']"
            >
              <div :class="[
                'absolute top-5 right-5 text-[10px] font-black px-3 py-1 rounded-full tracking-widest uppercase shadow-sm border flex items-center gap-1',
                upgrade.isLocked ? 'bg-red-500/10 border-red-500/30 text-red-500' : (upgrade.computedTier === 3 ? 'bg-hexred/10 border-hexred/30 text-hexred' : 'bg-orange/10 border-orange/30 text-orange')
              ]">
                <span v-if="upgrade.isLocked" class="text-[10px]">🔒</span>
                Round {{ upgrade.computedTier || 2 }}
              </div>

              <div class="w-16 h-16 rounded-2xl p-[3px] shadow-sm bg-gradient-to-br from-orange to-hexred mb-6 group-hover:scale-110 transition-transform origin-left flex-shrink-0">
                <div class="w-full h-full bg-white rounded-[14px] flex items-center justify-center overflow-hidden">
                  <img 
                    :src="resolveIcon(upgrade)" 
                    :alt="upgrade.name"
                    class="w-full h-full object-contain drop-shadow-sm p-1.5 rounded-[14px]" 
                  />
                </div>
              </div>

              <div class="flex-1 flex flex-col">
                <h4 class="text-xl font-black text-gray-900 uppercase tracking-wide mb-3 group-hover:text-orange transition-colors pr-16 leading-tight flex items-center gap-2">
                  <span>{{ upgrade.name }}</span>
                  <span v-if="upgrade.isLocked" class="text-xs text-red-500 font-bold" title="Locked by Mission">🔒</span>
                </h4>
                
                <div class="w-12 h-1 bg-gray-200 rounded-full mb-4 group-hover:w-20 group-hover:bg-orange transition-all duration-300"></div>

                <p class="text-sm font-bold text-gray-500 leading-relaxed flex-1">
                  {{ upgrade.description || upgrade.desc }}
                </p>
                
                <div class="mt-6 text-[10px] font-black tracking-widest uppercase flex items-center gap-1.5 opacity-70 group-hover:opacity-100 transition-opacity" :class="upgrade.isLocked ? 'text-red-500' : 'text-lightBlue'">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  {{ upgrade.isLocked ? '🔒 Mission Lock Details' : 'Hover for details' }}
                </div>
              </div>
            </div>

          </div>
        </div>

      </main>
      
      <div v-else class="w-full flex-1 flex flex-col justify-center items-center py-20">
        <div class="w-24 h-24 mb-6 text-gray-300">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
        <h2 class="text-3xl font-black text-gray-400 uppercase tracking-widest">Core Not Found</h2>
        <p class="text-gray-500 mt-2 font-semibold">The selected core could not be retrieved from the server.</p>
        <button @click="router.push('/library')" class="mt-6 px-6 py-2 bg-orange text-white rounded-full font-bold uppercase tracking-wider text-sm hover:bg-orange/90">
            Return to Library
        </button>
      </div>
    </div>

    <div 
      v-if="isTooltipVisible && hoveredCore"
      class="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full pb-4"
      :style="{ top: tooltipY + 'px', left: tooltipX + 'px' }"
    >
      <CoreTooltip 
        :core="hoveredCore" 
        :isLocked="hoveredCore.isLocked" 
        :missionText="hoveredCore.missionText || (hoveredCore.isLocked ? `Complete gameplay missions to unlock ${hoveredCore.name}.` : '')" 
      />
    </div>

    <!-- Floating Scroll To Top Button -->
    <ScrollToTopButton />

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { audioService } from '../services/audioService'
import { useMissionsStore } from '../stores/missionsStore'
import CoreTooltip from '../components/game/CoreTooltip.vue' 
import ScrollToTopButton from '../components/ScrollToTopButton.vue' 

const route = useRoute()
const router = useRouter()
const missionsStore = useMissionsStore()
const coreId = route.params.id

const loading = ref(true)
const baseCore = ref<any>(null)
const upgrades = ref<any[]>([])

const isTooltipVisible = ref(false)
const hoveredCore = ref<any>(null)
const tooltipX = ref(0)
const tooltipY = ref(0)

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'

// MAP DATA GỐC TỪ FILE FAMILIES CỦA BẠN
const CORE_FAMILIES: Record<string, { tier1: string[], tier2: string[], tier3: string[] }> = {
  'combo': {
    tier1: ['Perfect Combo'],
    tier2: ['Radiant Combo', 'Combo Shield', 'Combo Time', 'Combo Multiplier', 'Combo Focus'],
    tier3: ['Prismatic Combo', 'Golden Combo', 'Chain Lightning', 'Combo Mastery', 'Super Combo']
  },
  'speedster': {
    tier1: ['Speedster'],
    tier2: ['Time Warp', 'Speed Shield', 'Mach Speed', 'Overdrive', 'Speed Demon'],
    tier3: ['Chronobreak', 'Time Freeze', 'Warp Speed', 'Grand Prix', 'Sonic Boom']
  },
  'oracle': {
    tier1: ['Argus Eyes'],
    tier2: ['Clairvoyance', 'Third Eye', 'Future Sight', 'Divine Guidance', 'Oracle Blessing'],
    tier3: ['Omniscience', 'Mind Reader', 'Predictive Strike', 'Cosmic Wisdom', 'Divine Eye']
  },
  'mission': {
    tier1: ['Mission Impossible'],
    tier2: ['Bounty Hunter', 'Daily Quest', 'Shield Mission', 'Time Mission', 'Swift Mission'],
    tier3: ['Exodia', 'Bounty Overlord', 'Apex Predator', 'Mission Specialist', 'Mission Master']
  },
  'aegis': {
    tier1: ['Aegis Shield'],
    tier2: ['Reflective Aegis', 'Shield Battery', 'Fortress Aegis', 'Shield Synergy', 'Shield Burst'],
    tier3: ['Bastion of Light', 'Spiked Shield', 'Indomitable', 'Aegis Nova', 'Guardian Angel']
  },
  'balanced': {
    tier1: ['Balance'],
    tier2: ['Harmony', 'Equilibrium', 'Yin Yang', 'Steady Pace', 'Harmony Wave'],
    tier3: ['Perfect Harmony', 'Zenith', 'Nirvana', 'Cosmic Balance', 'Universal Harmony']
  },
  'power': {
    tier1: ['Power Strike'],
    tier2: ['Overclock', 'Hypercharge', 'Power Surge', 'Brute Force', 'Overload'],
    tier3: ['Supernova', 'Gigawatt', 'Desperado', 'Absolute Power', 'Supermassive']
  },
  'pandora': {
    tier1: ["Pandora's Box"],
    tier2: ["Trickster's Glass", 'Chaos Prism', 'Warp Reality', "Pandora's Curse", "Pandora's Mirror"],
    tier3: ['Chaos Theory', 'Butterfly Effect', "Pandora's Wrath", 'Cosmic Entropy', 'Reality Collapse']
  },
  'phoenix': {
    tier1: ['Phoenix'],
    tier2: ['Phoenix Flame', 'Rebirth', 'Ashes to Ashes'],
    tier3: ['Immortal Phoenix', 'Eternal Rebirth', 'Supernova Ashes']
  },
  'highroller': {
    tier1: ['High Roller'],
    tier2: ['Jackpot', 'Safe Bet', 'Double or Nothing'],
    tier3: ['All In', 'House Advantage', 'Russian Roulette']
  }
}

// Hàm chuẩn hóa Tên
const cleanName = (name: string) => name ? String(name).toLowerCase().replace(/[^a-z0-9]/g, '') : ''

// Hàm mò xem Lõi thuộc Hệ nào
const getFamilyForCore = (coreName: string) => {
  const cleaned = cleanName(coreName);
  for (const [family, data] of Object.entries(CORE_FAMILIES)) {
    const allNames = [...data.tier1, ...data.tier2, ...data.tier3].map(cleanName);
    if (allNames.includes(cleaned)) {
      return family;
    }
  }
  return 'combo'; // Default an toàn
}

// 🚀 HÀM QUYẾT ĐỊNH ẢNH: XÂY DỰNG TRỰC TIẾP URL SUPABASE TỪ CÔNG THỨC CỦA BẠN
const resolveIcon = (core: any) => {
  if (!core || !core.name) return '';

  // 1. Kiểm tra ưu tiên link mạng (nếu Database tự trả về full link https://...supabase...) thì dùng luôn
  const dbIcon = core.icon || core.image || core.icon_url;
  if (dbIcon && (dbIcon.startsWith('http://') || dbIcon.startsWith('https://'))) {
    return dbIcon;
  }

  // 2. ÉP BUILD LINK TỪ SUPABASE: Công thức [Link_Base]/[Family]/[Tên-Lõi].svg
  const family = getFamilyForCore(core.name);
  const fileName = core.name.toLowerCase().replace(/[']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  
  return `https://zowxktrpfqwpzckpnytu.supabase.co/storage/v1/object/public/core-icons/${family}/${fileName}.svg`;
}

onMounted(async () => {
  try {
    const token = localStorage.getItem('arena_token') || ''
    
    // GỌI API LẤY TOÀN BỘ DANH SÁCH LÕI TỪ BACKEND
    const resAll = await fetch(`${SERVER_URL}/api/game/cores`, { 
      headers: { 'Authorization': `Bearer ${token}` } 
    })
    
    let allCoresList: any[] = []
    if (resAll.ok) {
      const dataAll = await resAll.json()
      // Đảm bảo dữ liệu trả về là một Mảng (Array)
      const rawData = dataAll.data || dataAll.cores || dataAll || []
      allCoresList = Array.isArray(rawData) ? rawData : Object.values(rawData)
    } else if (typeof window !== 'undefined' && (window as any).allCores) {
      allCoresList = (window as any).allCores || []
    }

    if (allCoresList.length > 0) {
      // 1. TÌM LÕI BASE
      baseCore.value = allCoresList.find((c: any) => String(c.id) === String(coreId) || String(c._id) === String(coreId))

      // 2. TÌM VÀ VÁ LÕI UPGRADE
      if (baseCore.value) {
        const baseCleaned = cleanName(baseCore.value.name)
        let targetFamily: any = null

        // Tìm Lõi Base thuộc Hệ nào
        for (const key in CORE_FAMILIES) {
          const family = CORE_FAMILIES[key]
          const isPartOfFamily = 
            family.tier1.some((n: string) => cleanName(n) === baseCleaned) ||
            family.tier2.some((n: string) => cleanName(n) === baseCleaned) ||
            family.tier3.some((n: string) => cleanName(n) === baseCleaned)
            
          if (isPartOfFamily) {
            targetFamily = family
            break
          }
        }

        if (targetFamily) {
          const matchedUpgrades: any[] = []

          // Duyệt Tier 2
          targetFamily.tier2.forEach((expectedName: string) => {
             const cName = cleanName(expectedName)
             const foundInDB = allCoresList.find((c: any) => cleanName(c.name) === cName)
             
             if (foundInDB) {
                 matchedUpgrades.push({ ...foundInDB, computedTier: 2 })
             } else {
                 // NẾU DB THIẾU -> TẠO PLACEHOLDER ẢO ĐỂ KHÔNG BỊ TRẮNG TRANG
                 matchedUpgrades.push({
                     id: 'mock-' + expectedName,
                     name: expectedName,
                     description: 'Evolution effect hidden. Unlock in-game to view.',
                     computedTier: 2
                 })
             }
          })

          // Duyệt Tier 3
          targetFamily.tier3.forEach((expectedName: string) => {
             const cName = cleanName(expectedName)
             const foundInDB = allCoresList.find((c: any) => cleanName(c.name) === cName)
             
             if (foundInDB) {
                 matchedUpgrades.push({ ...foundInDB, computedTier: 3 })
             } else {
                 // NẾU DB THIẾU -> TẠO PLACEHOLDER ẢO
                 matchedUpgrades.push({
                     id: 'mock-' + expectedName,
                     name: expectedName,
                     description: 'Ultimate evolution effect hidden. Unlock in-game to view.',
                     computedTier: 3
                 })
             }
          })

          // Map isLocked status using missionsStore
          upgrades.value = matchedUpgrades.map((u: any) => {
            const isBaseCore = u.tier === 1 || u.classification === 'main'
            const isUnlockedInMissions = missionsStore.isCoreUnlocked(u.name) || missionsStore.isCoreUnlocked(u.id)
            const isLocked = !isBaseCore && !isUnlockedInMissions
            return {
              ...u,
              isLocked,
              missionText: isLocked ? `Complete gameplay missions to unlock ${u.name}.` : ''
            }
          })
        }
      }
    }
  } catch (err) {
    console.error("Lỗi khi kết nối lấy dữ liệu Cores:", err)
  } finally {
    loading.value = false
  }
})

// Các hàm xử lý Tooltip
const showTooltip = (event: MouseEvent | TouchEvent, core: any) => {
  if (audioService?.playHover) audioService.playHover()
  hoveredCore.value = core
  isTooltipVisible.value = true
  
  let clientX, clientY
  if (window.TouchEvent && event instanceof TouchEvent) {
    clientX = event.touches[0].clientX
    clientY = event.touches[0].clientY
  } else {
    clientX = (event as MouseEvent).clientX
    clientY = (event as MouseEvent).clientY
  }

  tooltipX.value = clientX
  tooltipY.value = clientY
}

const hideTooltip = () => {
  isTooltipVisible.value = false
  hoveredCore.value = null
}

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
.animate-float-slow { animation: floatSky 12s ease-in-out infinite alternate; }
.animate-float-delayed { animation: floatSky 15s ease-in-out infinite alternate-reverse; }
.animate-pulse-slow { animation: pulseBlob 8s ease-in-out infinite alternate; }

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
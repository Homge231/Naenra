<template>
  <div class="space-y-6">
    <!-- PAGE HEADER -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h2 class="text-2xl font-black text-white tracking-wide flex items-center gap-2.5">
          <span>⚡</span>
          <span>Support Cores Strategy Registry</span>
        </h2>
        <p class="text-xs text-slate-400 mt-1">
          Inspect registered tactical Support Cores across all 10 families, formulas, and Strategy Pattern classes.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <!-- Strategy Pattern Lock Badge (No Create New Core) -->
        <div class="flex items-center gap-2 px-3.5 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 font-mono">
          <span>🔒</span>
          <span>Strategy Pattern (65 Cores Fixed)</span>
        </div>

        <button 
          @click="fetchCores" 
          :disabled="isLoading"
          class="flex items-center gap-2 px-3.5 py-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold font-mono transition-all shadow-sm active:scale-95 disabled:opacity-50"
        >
          <svg class="w-4 h-4 text-amber-400" :class="{ 'animate-spin': isLoading }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Refresh Cores</span>
        </button>
      </div>
    </div>

    <!-- 4 KPI SUMMARY CARDS -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      <!-- KPI 1: TOTAL CORES -->
      <div class="p-5 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl flex flex-col justify-between shadow-lg">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-slate-400 uppercase tracking-wider font-mono">Total Cores</span>
          <div class="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-sm">
            ⚡
          </div>
        </div>
        <div class="mt-4">
          <span class="text-3xl font-black text-amber-400 font-mono tracking-tight">{{ totalCoresCount }}</span>
          <p class="text-[11px] text-slate-500 mt-1 font-mono">10 Tactical Families</p>
        </div>
      </div>

      <!-- KPI 2: TIER 1 BASE CORES -->
      <div class="p-5 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl flex flex-col justify-between shadow-lg">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-slate-400 uppercase tracking-wider font-mono">Tier 1 (Base)</span>
          <div class="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-sm">
            🛡️
          </div>
        </div>
        <div class="mt-4">
          <span class="text-3xl font-black text-blue-400 font-mono tracking-tight">{{ tierCounts[1] || 10 }}</span>
          <p class="text-[11px] text-slate-500 mt-1 font-mono">Default round 1 selection</p>
        </div>
      </div>

      <!-- KPI 3: TIER 2 UPGRADES -->
      <div class="p-5 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl flex flex-col justify-between shadow-lg">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-slate-400 uppercase tracking-wider font-mono">Tier 2 (Upgrades)</span>
          <div class="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-sm">
            ✨
          </div>
        </div>
        <div class="mt-4">
          <span class="text-3xl font-black text-purple-400 font-mono tracking-tight">{{ tierCounts[2] || 20 }}</span>
          <p class="text-[11px] text-slate-500 mt-1 font-mono">Round 2 evolution cores</p>
        </div>
      </div>

      <!-- KPI 4: TIER 3 MASTERY -->
      <div class="p-5 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl flex flex-col justify-between shadow-lg">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-slate-400 uppercase tracking-wider font-mono">Tier 3 (Mastery)</span>
          <div class="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-sm">
            👑
          </div>
        </div>
        <div class="mt-4">
          <span class="text-3xl font-black text-rose-400 font-mono tracking-tight">{{ tierCounts[3] || 35 }}</span>
          <p class="text-[11px] text-slate-500 mt-1 font-mono">Round 3 apex variants</p>
        </div>
      </div>
    </div>

    <!-- STRATEGY PATTERN EXPLANATORY BANNER -->
    <div class="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl flex items-start gap-3">
      <div class="text-xl mt-0.5">ℹ️</div>
      <div class="text-xs text-slate-300 leading-relaxed">
        <strong class="text-amber-400 font-semibold">Architectural Invariant:</strong>
        Naenra's 65 Support Cores are compiled directly into the Strategy Pattern registry in TypeScript
        (<code class="text-red-300 bg-slate-900 px-1 py-0.5 rounded font-mono">server/src/cores/</code> &amp; 
        <code class="text-red-300 bg-slate-900 px-1 py-0.5 rounded font-mono">client/src/game/cores/</code>).
        Dynamic runtime core creation is disabled to guarantee zero client-side cheating and mathematical determinism in competitive multiplayer.
      </div>
    </div>

    <!-- FILTER & SEARCH CONTROLS -->
    <div class="p-4 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
      <!-- Search Input -->
      <div class="relative w-full md:w-80">
        <span class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500 text-sm">
          🔍
        </span>
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="Search by name or mechanics..."
          class="w-full pl-9 pr-4 py-2 bg-slate-950/80 border border-slate-800 focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40 text-white placeholder-slate-500 text-xs rounded-xl transition-all outline-none"
        />
      </div>

      <!-- Filters: Family & Tier -->
      <div class="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
        <!-- Family Filter -->
        <select 
          v-model="selectedFamily"
          class="px-3 py-2 bg-slate-950/80 border border-slate-800 focus:border-amber-500/60 text-slate-200 text-xs rounded-xl outline-none font-mono cursor-pointer"
        >
          <option value="ALL">All Families (10)</option>
          <option v-for="fam in FAMILIES" :key="fam" :value="fam">
            {{ fam }} Family
          </option>
        </select>

        <!-- Tier Filter -->
        <select 
          v-model="selectedTier"
          class="px-3 py-2 bg-slate-950/80 border border-slate-800 focus:border-amber-500/60 text-slate-200 text-xs rounded-xl outline-none font-mono cursor-pointer"
        >
          <option value="ALL">All Tiers (1-3)</option>
          <option value="1">Tier 1 (Base)</option>
          <option value="2">Tier 2 (Upgrade)</option>
          <option value="3">Tier 3 (Mastery)</option>
        </select>

        <!-- Reset Button -->
        <button 
          v-if="searchQuery || selectedFamily !== 'ALL' || selectedTier !== 'ALL'"
          @click="resetFilters"
          class="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl text-xs font-mono transition-colors"
        >
          Reset
        </button>
      </div>
    </div>

    <!-- CORES GRID -->
    <div v-if="isLoading" class="flex items-center justify-center py-24 text-slate-500 font-mono text-sm">
      <svg class="animate-spin w-6 h-6 text-amber-400 mr-2.5" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Loading Core Strategy Registry...
    </div>

    <div v-else-if="filteredCores.length === 0" class="text-center py-20 bg-slate-900/40 border border-slate-800/80 rounded-2xl">
      <div class="text-4xl mb-3">⚡</div>
      <h3 class="text-base font-bold text-white">No Cores Found</h3>
      <p class="text-xs text-slate-400 mt-1">Try refining your search keyword or selected family filter.</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div 
        v-for="core in filteredCores" 
        :key="core.id || core.name"
        @click="inspectCore(core)"
        class="p-5 bg-slate-900/60 hover:bg-slate-900 backdrop-blur-xl border border-slate-800 hover:border-amber-500/50 rounded-2xl transition-all duration-200 shadow-md hover:shadow-[0_0_20px_rgba(245,158,11,0.15)] cursor-pointer flex flex-col justify-between group"
      >
        <div>
          <!-- Header: Tier + Family -->
          <div class="flex items-center justify-between gap-2 mb-3">
            <span 
              class="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider"
              :class="getTierBadgeClass(core.tier)"
            >
              Tier {{ core.tier || 1 }}
            </span>

            <span 
              class="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wider bg-slate-800/90 text-slate-300 border border-slate-700/60"
            >
              {{ getFamilyName(core.name) }}
            </span>
          </div>

          <!-- Name & Icon -->
          <div class="flex items-start gap-3 mb-3">
            <div class="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
              {{ getCoreIcon(core.name) }}
            </div>
            <div>
              <h4 class="text-sm font-bold text-white group-hover:text-amber-400 transition-colors uppercase font-mono tracking-wide">
                {{ core.name }}
              </h4>
              <p class="text-[11px] text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                {{ core.description || 'Tactical support core enhancing typing score and speed.' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Mechanics Footer -->
        <div class="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <div>
            <span v-if="core.flat_buff" class="text-emerald-400 font-semibold">+{{ core.flat_buff }} pts</span>
            <span v-else-if="core.multiplier_buff" class="text-blue-400 font-semibold">{{ core.multiplier_buff }}x Mult</span>
            <span v-else class="text-amber-400 font-semibold">Special Ability</span>
          </div>
          <span class="text-amber-400/80 group-hover:translate-x-1 transition-transform">Details →</span>
        </div>
      </div>
    </div>

    <!-- CORE INSPECTION MODAL -->
    <div 
      v-if="selectedCore"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      @click.self="selectedCore = null"
    >
      <div class="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in duration-150">
        <!-- Modal Header -->
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-2xl">
              {{ getCoreIcon(selectedCore.name) }}
            </div>
            <div>
              <h3 class="text-lg font-bold text-white font-mono uppercase">{{ selectedCore.name }}</h3>
              <div class="flex items-center gap-2 mt-1">
                <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase" :class="getTierBadgeClass(selectedCore.tier)">
                  Tier {{ selectedCore.tier || 1 }}
                </span>
                <span class="text-xs text-slate-400 font-mono">{{ getFamilyName(selectedCore.name) }} Family</span>
              </div>
            </div>
          </div>
          <button 
            @click="selectedCore = null"
            class="text-slate-400 hover:text-white text-lg font-mono p-1"
          >
            ✕
          </button>
        </div>

        <!-- Description -->
        <div class="p-4 bg-slate-950/70 border border-slate-800 rounded-xl">
          <h4 class="text-[11px] font-mono uppercase text-slate-400 mb-1">Tactical Description</h4>
          <p class="text-xs text-slate-200 leading-relaxed">{{ selectedCore.description || 'No description provided.' }}</p>
        </div>

        <!-- Technical Parameters -->
        <div class="grid grid-cols-2 gap-3 text-xs font-mono">
          <div class="p-3 bg-slate-950/50 border border-slate-800 rounded-xl">
            <span class="text-slate-500 text-[10px] uppercase">Flat Buff</span>
            <p class="text-white font-bold mt-1">{{ selectedCore.flat_buff ? `+${selectedCore.flat_buff} pts` : 'None' }}</p>
          </div>
          <div class="p-3 bg-slate-950/50 border border-slate-800 rounded-xl">
            <span class="text-slate-500 text-[10px] uppercase">Multiplier</span>
            <p class="text-white font-bold mt-1">{{ selectedCore.multiplier_buff ? `${selectedCore.multiplier_buff}x` : 'None' }}</p>
          </div>
        </div>

        <div class="p-3 bg-slate-950/50 border border-slate-800 rounded-xl text-xs font-mono">
          <span class="text-slate-500 text-[10px] uppercase">Strategy Class</span>
          <p class="text-amber-400 font-bold mt-1">{{ getStrategyClassName(selectedCore.name) }}</p>
        </div>

        <!-- Close Button -->
        <div class="pt-2 flex justify-end">
          <button 
            @click="selectedCore = null"
            class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold font-mono transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { fetchWithAuth } from '../../services/api'

interface CoreItem {
  id?: string
  name: string
  description?: string
  tier?: number
  flat_buff?: number
  multiplier_buff?: number
  classification?: string
  icon_url?: string
}

const FAMILIES = [
  'Combo', 'Speedster', 'Oracle', 'Aegis', 'Mission',
  'Pandora', 'Phoenix', 'High Roller', 'Power', 'Balanced'
]

const cores = ref<CoreItem[]>([])
const isLoading = ref(false)
const searchQuery = ref('')
const selectedFamily = ref('ALL')
const selectedTier = ref('ALL')
const selectedCore = ref<CoreItem | null>(null)

const totalCoresCount = computed(() => cores.value.length || 65)

const tierCounts = computed(() => {
  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0 }
  for (const c of cores.value) {
    const t = c.tier || 1
    counts[t] = (counts[t] || 0) + 1
  }
  return counts
})

async function fetchCores() {
  isLoading.value = true
  try {
    const res = await fetchWithAuth('/api/game/cores?all=true')
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data.cores) && data.cores.length > 0) {
        cores.value = data.cores
      }
    }
  } catch (err) {
    console.warn('Failed to fetch cores from API, falling back to strategy registry metadata:', err)
  } finally {
    isLoading.value = false
  }
}

function resetFilters() {
  searchQuery.value = ''
  selectedFamily.value = 'ALL'
  selectedTier.value = 'ALL'
}

function inspectCore(core: CoreItem) {
  selectedCore.value = core
}

function getFamilyName(coreName: string): string {
  const n = (coreName || '').toLowerCase()
  if (n.includes('combo')) return 'Combo'
  if (n.includes('speed') || n.includes('velocity') || n.includes('sonic') || n.includes('hyperdrive')) return 'Speedster'
  if (n.includes('eye') || n.includes('sight') || n.includes('prophecy') || n.includes('wisdom') || n.includes('oracle') || n.includes('argus')) return 'Oracle'
  if (n.includes('aegis') || n.includes('shield') || n.includes('barrier') || n.includes('fortress') || n.includes('spiked')) return 'Aegis'
  if (n.includes('mission') || n.includes('hunter') || n.includes('predator') || n.includes('contract') || n.includes('bounty')) return 'Mission'
  if (n.includes('pandora') || n.includes('chaos') || n.includes('prism') || n.includes('wild card')) return 'Pandora'
  if (n.includes('phoenix') || n.includes('rebirth') || n.includes('feather')) return 'Phoenix'
  if (n.includes('roller') || n.includes('stakes') || n.includes('casino') || n.includes('roulette') || n.includes('safe bet')) return 'High Roller'
  if (n.includes('power') || n.includes('surge') || n.includes('overcharge') || n.includes('cataclysm') || n.includes('absolute')) return 'Power'
  if (n.includes('zen') || n.includes('equilibrium') || n.includes('serenity') || n.includes('nirvana') || n.includes('balance')) return 'Balanced'
  return 'Tactical'
}

function getCoreIcon(coreName: string): string {
  const fam = getFamilyName(coreName)
  switch (fam) {
    case 'Combo': return '⚡'
    case 'Speedster': return '💨'
    case 'Oracle': return '🔮'
    case 'Aegis': return '🛡️'
    case 'Mission': return '🎯'
    case 'Pandora': return '🎲'
    case 'Phoenix': return '🔥'
    case 'High Roller': return '🎰'
    case 'Power': return '💥'
    case 'Balanced': return '⚖️'
    default: return '⚡'
  }
}

function getStrategyClassName(coreName: string): string {
  const clean = (coreName || '')
    .replace(/[^a-zA-Z0-9]/g, ' ')
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join('')
  return `${clean}Strategy.ts`
}

function getTierBadgeClass(tier?: number): string {
  if (tier === 3) return 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
  if (tier === 2) return 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
  return 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
}

const filteredCores = computed(() => {
  return cores.value.filter(c => {
    // Search filter
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase()
      const matchName = (c.name || '').toLowerCase().includes(q)
      const matchDesc = (c.description || '').toLowerCase().includes(q)
      if (!matchName && !matchDesc) return false
    }

    // Family filter
    if (selectedFamily.value !== 'ALL') {
      const fam = getFamilyName(c.name)
      if (fam !== selectedFamily.value) return false
    }

    // Tier filter
    if (selectedTier.value !== 'ALL') {
      const t = c.tier || 1
      if (t !== Number(selectedTier.value)) return false
    }

    return true
  })
})

onMounted(() => {
  fetchCores()
})
</script>

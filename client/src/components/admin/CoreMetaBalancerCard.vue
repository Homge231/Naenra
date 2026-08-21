<template>
  <div class="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 sm:p-6 backdrop-blur-xl shadow-xl space-y-6 relative overflow-hidden">
    <!-- BACKGROUND AMBIENT GLOW -->
    <div class="absolute -left-20 -top-20 w-72 h-72 bg-amber-600/10 rounded-full blur-3xl pointer-events-none"></div>

    <!-- HEADER SECTION -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)] text-lg">
          ⚖️
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h3 class="text-base sm:text-lg font-bold text-white tracking-wide">
              Support Core Meta Balancer & Hotfix
            </h3>
            <span class="px-2 py-0.5 text-[10px] font-mono font-bold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
              ZERO-DOWNTIME LIVE TUNER
            </span>
          </div>
          <p class="text-xs text-slate-400">
            Real-time Win Rate vs. Pick Rate telemetry with instant hotfix parameter sliders
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button
          @click="fetchMetaAnalytics"
          :disabled="loading"
          class="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          <svg :class="['w-3.5 h-3.5', loading ? 'animate-spin' : '']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>{{ loading ? 'Computing...' : 'Recalculate Meta' }}</span>
        </button>
      </div>
    </div>

    <!-- META OVERVIEW METRICS -->
    <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
      <div class="bg-slate-950/60 border border-red-900/40 rounded-xl p-3">
        <span class="text-[10px] font-mono text-red-400 uppercase tracking-wider">Overpowered (OP)</span>
        <div class="text-lg font-black text-red-400 mt-0.5">{{ opCount }}</div>
      </div>
      <div class="bg-slate-950/60 border border-amber-900/40 rounded-xl p-3">
        <span class="text-[10px] font-mono text-amber-400 uppercase tracking-wider">Meta Tier</span>
        <div class="text-lg font-black text-amber-400 mt-0.5">{{ metaCount }}</div>
      </div>
      <div class="bg-slate-950/60 border border-emerald-900/40 rounded-xl p-3">
        <span class="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">Balanced</span>
        <div class="text-lg font-black text-emerald-400 mt-0.5">{{ balancedCount }}</div>
      </div>
      <div class="bg-slate-950/60 border border-blue-900/40 rounded-xl p-3">
        <span class="text-[10px] font-mono text-blue-400 uppercase tracking-wider">Niche / Specialist</span>
        <div class="text-lg font-black text-blue-400 mt-0.5">{{ nicheCount }}</div>
      </div>
      <div class="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
        <span class="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Underpowered</span>
        <div class="text-lg font-black text-slate-400 mt-0.5">{{ underpoweredCount }}</div>
      </div>
    </div>

    <!-- CONTROLS & FILTER BAR -->
    <div class="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80">
      <div class="flex flex-wrap items-center gap-1.5 text-xs w-full sm:w-auto">
        <button
          v-for="status in ['all', 'OP', 'Meta', 'Balanced', 'Underpowered', 'Niche']"
          :key="status"
          @click="activeStatusFilter = status"
          :class="[
            'px-2.5 py-1 rounded-lg font-bold uppercase font-mono tracking-wider transition-all cursor-pointer text-[11px]',
            activeStatusFilter === status
              ? 'bg-amber-500 text-slate-950 shadow-[0_0_10px_rgba(245,158,11,0.4)]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          ]"
        >
          {{ status }}
        </button>
      </div>

      <div class="relative w-full sm:w-64">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search Core name..."
          class="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
        />
      </div>
    </div>

    <!-- CORES LIST WITH LIVE HOTFIX SLIDERS -->
    <div v-if="loading && cores.length === 0" class="py-12 flex flex-col items-center justify-center text-slate-400 space-y-3">
      <div class="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      <span class="text-xs font-mono">Analyzing telemetry across 65 Support Cores...</span>
    </div>

    <div v-else class="grid grid-cols-1 xl:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-1">
      <div
        v-for="core in filteredCores"
        :key="core.id"
        class="bg-slate-950/80 border border-slate-800/90 hover:border-amber-900/40 rounded-xl p-4 transition-all duration-200 space-y-4"
      >
        <!-- CORE HEADER -->
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-center text-lg overflow-hidden">
              <img v-if="core.icon_url" :src="core.icon_url" :alt="core.name" class="w-full h-full object-cover" />
              <span v-else>⚡</span>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-sm font-bold text-white">{{ core.name }}</span>
                <span class="px-1.5 py-0.2 text-[9px] font-mono font-bold rounded bg-slate-800 text-slate-400 border border-slate-700">
                  T{{ core.tier }} • {{ core.classification }}
                </span>
                <span
                  :class="[
                    'px-2 py-0.5 text-[9px] font-mono font-black uppercase rounded-full border',
                    core.metaStatus === 'OP' ? 'bg-red-500/20 text-red-400 border-red-500/40' :
                    core.metaStatus === 'Meta' ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' :
                    core.metaStatus === 'Niche' ? 'bg-blue-500/20 text-blue-400 border-blue-500/40' :
                    core.metaStatus === 'Underpowered' ? 'bg-slate-500/20 text-slate-400 border-slate-500/40' :
                    'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  ]"
                >
                  {{ core.metaStatus }}
                </span>
              </div>
              <p class="text-xs text-slate-400 line-clamp-1 mt-0.5">{{ core.description || 'Core tactical upgrade' }}</p>
            </div>
          </div>

          <!-- PICK & WIN METRICS -->
          <div class="text-right flex-shrink-0">
            <div class="text-xs font-mono">
              Win: <strong :class="core.winRate >= 55 ? 'text-emerald-400' : 'text-slate-300'">{{ core.winRate }}%</strong>
            </div>
            <div class="text-xs font-mono text-slate-400">
              Pick: <strong class="text-amber-400">{{ core.pickRate }}%</strong> ({{ core.pickCount }})
            </div>
          </div>
        </div>

        <!-- HOTFIX SLIDERS SECTION -->
        <div class="bg-slate-900/60 rounded-xl p-3 border border-slate-800/60 space-y-3">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <!-- MULTIPLIER SLIDER -->
            <div>
              <div class="flex items-center justify-between text-[11px] font-mono mb-1">
                <span class="text-slate-400">Multiplier Buff</span>
                <span class="text-amber-400 font-bold">{{ editableValues[core.id]?.multiplier_buff ?? core.multiplier_buff }}x</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="3.5"
                step="0.1"
                :value="editableValues[core.id]?.multiplier_buff ?? core.multiplier_buff"
                @input="(e) => setDraftValue(core.id, 'multiplier_buff', Number((e.target as HTMLInputElement).value))"
                class="w-full accent-amber-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
              />
            </div>

            <!-- FLAT BUFF SLIDER -->
            <div>
              <div class="flex items-center justify-between text-[11px] font-mono mb-1">
                <span class="text-slate-400">Flat Score Buff</span>
                <span class="text-rose-400 font-bold">+{{ editableValues[core.id]?.flat_buff ?? core.flat_buff }} pts</span>
              </div>
              <input
                type="range"
                min="0"
                max="500"
                step="10"
                :value="editableValues[core.id]?.flat_buff ?? core.flat_buff"
                @input="(e) => setDraftValue(core.id, 'flat_buff', Number((e.target as HTMLInputElement).value))"
                class="w-full accent-rose-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          <!-- DURATION & ACTIONS -->
          <div class="flex items-center justify-between pt-2 border-t border-slate-800/80">
            <div class="flex items-center gap-2">
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  :checked="editableValues[core.id]?.is_active ?? core.is_active"
                  @change="(e) => setDraftValue(core.id, 'is_active', (e.target as HTMLInputElement).checked)"
                  class="sr-only peer"
                />
                <div class="w-8 h-4 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-amber-500"></div>
                <span class="ml-2 text-[11px] font-mono text-slate-300">Active</span>
              </label>
            </div>

            <button
              @click="saveHotfix(core.id)"
              :disabled="saving[core.id]"
              class="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 font-black rounded-lg text-xs tracking-wider uppercase transition-all shadow-[0_0_12px_rgba(245,158,11,0.3)] disabled:opacity-50 cursor-pointer active:scale-95"
            >
              <span>{{ saving[core.id] ? 'Saving...' : '⚡ Apply Hotfix' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- TOAST -->
    <div
      v-if="statusMsg"
      class="fixed bottom-6 right-6 z-50 px-4 py-3 bg-slate-900 text-white border border-amber-500/50 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce"
    >
      <span>⚡</span>
      <span class="text-xs font-medium">{{ statusMsg }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'

const loading = ref(false)
const cores = ref<any[]>([])
const activeStatusFilter = ref('all')
const searchQuery = ref('')
const editableValues = ref<Record<string, any>>({})
const saving = ref<Record<string, boolean>>({})
const statusMsg = ref('')

const opCount = computed(() => cores.value.filter(c => c.metaStatus === 'OP').length)
const metaCount = computed(() => cores.value.filter(c => c.metaStatus === 'Meta').length)
const balancedCount = computed(() => cores.value.filter(c => c.metaStatus === 'Balanced').length)
const nicheCount = computed(() => cores.value.filter(c => c.metaStatus === 'Niche').length)
const underpoweredCount = computed(() => cores.value.filter(c => c.metaStatus === 'Underpowered').length)

const filteredCores = computed(() => {
  return cores.value.filter(c => {
    const matchesStatus = activeStatusFilter.value === 'all' || c.metaStatus === activeStatusFilter.value
    const matchesSearch = !searchQuery.value.trim() || 
      c.name.toLowerCase().includes(searchQuery.value.trim().toLowerCase()) ||
      (c.classification || '').toLowerCase().includes(searchQuery.value.trim().toLowerCase())
    return matchesStatus && matchesSearch
  })
})

function setDraftValue(coreId: string, field: string, value: any) {
  if (!editableValues.value[coreId]) {
    const core = cores.value.find(c => c.id === coreId)
    editableValues.value[coreId] = {
      multiplier_buff: core?.multiplier_buff ?? 1.0,
      flat_buff: core?.flat_buff ?? 0,
      duration: core?.duration ?? 0,
      is_active: core?.is_active ?? true
    }
  }
  editableValues.value[coreId][field] = value
}

async function fetchMetaAnalytics() {
  loading.value = true
  try {
    const token = localStorage.getItem('arena_token')
    const res = await fetch(`${SERVER_URL}/api/admin/cores/meta`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    if (data.success && Array.isArray(data.cores)) {
      cores.value = data.cores
      // Initialize editable state
      for (const c of data.cores) {
        editableValues.value[c.id] = {
          multiplier_buff: c.multiplier_buff,
          flat_buff: c.flat_buff,
          duration: c.duration,
          is_active: c.is_active
        }
      }
    }
  } catch (err) {
    console.error('fetchMetaAnalytics error:', err)
  } finally {
    loading.value = false
  }
}

async function saveHotfix(coreId: string) {
  saving.value[coreId] = true
  try {
    const token = localStorage.getItem('arena_token')
    const draft = editableValues.value[coreId]
    const res = await fetch(`${SERVER_URL}/api/admin/cores/${coreId}/hotfix`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(draft)
    })
    const data = await res.json()
    if (data.success) {
      statusMsg.value = data.message || 'Core hotfix applied successfully!'
      setTimeout(() => { statusMsg.value = '' }, 3500)
      await fetchMetaAnalytics()
    }
  } catch (err) {
    console.error('saveHotfix error:', err)
  } finally {
    saving.value[coreId] = false
  }
}

onMounted(() => {
  fetchMetaAnalytics()
})
</script>

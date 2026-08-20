<template>
  <div class="space-y-8 animate-fade-in">
    <!-- WELCOME BANNER WITH LIVE TIMESTAMP & REFRESH -->
    <div class="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-red-950/40 p-6 lg:p-8 border border-slate-800 shadow-2xl">
      <div class="absolute -right-12 -bottom-12 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>
      
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div>
          <div class="flex items-center gap-3 mb-2">
            <span class="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              CORE METRICS ACTIVE
            </span>
            <span class="text-xs font-mono text-slate-400">{{ currentTime }}</span>
          </div>
          <h1 class="text-2xl lg:text-3xl font-extrabold text-white tracking-wide">
            Command Center Overview
          </h1>
          <p class="text-sm text-slate-400 mt-1 max-w-xl">
            Real-time performance stats, database counts, match telemetry, and system infrastructure health for Naenra ARENA.
          </p>
        </div>

        <div class="flex items-center gap-3">
          <button 
            @click="fetchMetrics" 
            :disabled="isLoading"
            class="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 rounded-xl text-sm font-semibold border border-slate-700 transition-all shadow-lg hover:border-red-500/50 cursor-pointer active:scale-95"
          >
            <svg 
              :class="['w-4 h-4 text-red-400', isLoading ? 'animate-spin' : '']" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{{ isLoading ? 'Refreshing...' : 'Refresh Telemetry' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- KPI SUMMARY CARDS GRID -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <!-- CARD 1: REGISTERED PLAYERS -->
      <div class="group relative overflow-hidden bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 hover:border-blue-500/50 rounded-2xl p-5 transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] hover:-translate-y-0.5">
        <div class="flex items-center justify-between">
          <span class="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">Total Players</span>
          <div class="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 text-xl group-hover:scale-110 transition-transform">
            👥
          </div>
        </div>
        <div class="mt-4">
          <div v-if="isLoading" class="h-8 w-24 bg-slate-800 animate-pulse rounded-lg"></div>
          <div v-else class="text-3xl font-black text-white tracking-tight font-mono">
            {{ metrics.totalPlayers.toLocaleString() }}
          </div>
          <p class="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <span class="text-emerald-400 font-semibold font-mono">Registered</span> accounts in database
          </p>
        </div>
      </div>

      <!-- CARD 2: LIVE MATCHES -->
      <div class="group relative overflow-hidden bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 hover:border-emerald-500/50 rounded-2xl p-5 transition-all duration-300 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:-translate-y-0.5">
        <div class="flex items-center justify-between">
          <span class="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">Live Matches</span>
          <div class="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xl group-hover:scale-110 transition-transform">
            ⚔️
          </div>
        </div>
        <div class="mt-4">
          <div v-if="isLoading" class="h-8 w-24 bg-slate-800 animate-pulse rounded-lg"></div>
          <div v-else class="flex items-baseline gap-2">
            <span class="text-3xl font-black text-white tracking-tight font-mono">{{ metrics.liveMatches }}</span>
            <span class="flex h-2.5 w-2.5 relative">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
          <p class="text-xs text-slate-400 mt-1">
            Active 1v1 / Pure Skill sessions
          </p>
        </div>
      </div>

      <!-- CARD 3: QUESTION BANK -->
      <div class="group relative overflow-hidden bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 hover:border-amber-500/50 rounded-2xl p-5 transition-all duration-300 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)] hover:-translate-y-0.5">
        <div class="flex items-center justify-between">
          <span class="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">Question Bank</span>
          <div class="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-xl group-hover:scale-110 transition-transform">
            ❓
          </div>
        </div>
        <div class="mt-4">
          <div v-if="isLoading" class="h-8 w-24 bg-slate-800 animate-pulse rounded-lg"></div>
          <div v-else class="text-3xl font-black text-white tracking-tight font-mono">
            {{ metrics.totalQuestions.toLocaleString() }}
          </div>
          <p class="text-xs text-slate-400 mt-1">
            Vocabulary items & AI generated
          </p>
        </div>
      </div>

      <!-- CARD 4: SUPPORT CORES CATALOG -->
      <div class="group relative overflow-hidden bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 hover:border-cyan-500/50 rounded-2xl p-5 transition-all duration-300 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] hover:-translate-y-0.5">
        <div class="flex items-center justify-between">
          <span class="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">Support Cores</span>
          <div class="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-xl group-hover:scale-110 transition-transform">
            ⚡
          </div>
        </div>
        <div class="mt-4">
          <div v-if="isLoading" class="h-8 w-24 bg-slate-800 animate-pulse rounded-lg"></div>
          <div v-else class="text-3xl font-black text-white tracking-tight font-mono">
            {{ metrics.totalCores.toLocaleString() }}
          </div>
          <p class="text-xs text-slate-400 mt-1">
            Registered cores in catalog
          </p>
        </div>
      </div>

      <!-- CARD 5: SERVER LATENCY & HEALTH -->
      <div class="group relative overflow-hidden bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 hover:border-red-500/50 rounded-2xl p-5 transition-all duration-300 hover:shadow-[0_0_20px_rgba(225,29,72,0.15)] hover:-translate-y-0.5">
        <div class="flex items-center justify-between">
          <span class="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">Server Health</span>
          <div class="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 text-xl group-hover:scale-110 transition-transform">
            🖥️
          </div>
        </div>
        <div class="mt-4">
          <div v-if="isLoading" class="h-8 w-24 bg-slate-800 animate-pulse rounded-lg"></div>
          <div v-else class="flex items-center gap-2">
            <span class="text-3xl font-black text-emerald-400 font-mono">ONLINE</span>
            <span class="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              {{ metrics.queryLatencyMs }}ms
            </span>
          </div>
          <p class="text-xs text-slate-400 mt-1 font-mono">
            Uptime: {{ formatUptime(metrics.uptimeSeconds) }}
          </p>
        </div>
      </div>
    </div>

    <!-- MODULE SHORTCUTS / NAVIGATION CARDS -->
    <div class="space-y-4">
      <h3 class="text-lg font-bold text-white tracking-wide flex items-center gap-2">
        <span>🚀</span>
        <span>Management Modules</span>
      </h3>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <!-- MODULE 1: QUESTION BANK -->
        <router-link 
          to="/admin/questions" 
          class="group p-6 bg-slate-900/60 hover:bg-slate-900 backdrop-blur-xl border border-slate-800 hover:border-red-500/50 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-[0_0_25px_rgba(225,29,72,0.15)] flex flex-col justify-between"
        >
          <div>
            <div class="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              📚
            </div>
            <h4 class="text-lg font-bold text-white group-hover:text-red-400 transition-colors">
              Question Bank
            </h4>
            <p class="text-xs text-slate-400 mt-1 leading-relaxed">
              Create, edit, import CSV, and classify vocabulary blanks across Tiers 1-3.
            </p>
          </div>
          <div class="mt-6 flex items-center justify-between text-xs font-mono text-red-400 group-hover:translate-x-1 transition-transform">
            <span>Manage Vocabulary</span>
            <span>→</span>
          </div>
        </router-link>

        <!-- MODULE 2: PLAYERS MANAGER -->
        <router-link 
          to="/admin/players" 
          class="group p-6 bg-slate-900/60 hover:bg-slate-900 backdrop-blur-xl border border-slate-800 hover:border-blue-500/50 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-[0_0_25px_rgba(59,130,246,0.15)] flex flex-col justify-between"
        >
          <div>
            <div class="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              👥
            </div>
            <h4 class="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
              Players Manager
            </h4>
            <p class="text-xs text-slate-400 mt-1 leading-relaxed">
              Inspect player accounts, active sessions, unlockable cores, and moderate access.
            </p>
          </div>
          <div class="mt-6 flex items-center justify-between text-xs font-mono text-blue-400 group-hover:translate-x-1 transition-transform">
            <span>Inspect Players</span>
            <span>→</span>
          </div>
        </router-link>

        <!-- MODULE 3: LEADERBOARDS & SEASONS -->
        <router-link 
          to="/admin/leaderboard" 
          class="group p-6 bg-slate-900/60 hover:bg-slate-900 backdrop-blur-xl border border-slate-800 hover:border-amber-500/50 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-[0_0_25px_rgba(245,158,11,0.15)] flex flex-col justify-between"
        >
          <div>
            <div class="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              🏆
            </div>
            <h4 class="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
              Leaderboards & Seasons
            </h4>
            <p class="text-xs text-slate-400 mt-1 leading-relaxed">
              Monitor Top 100 Elo rankings in real-time and trigger global competitive season resets.
            </p>
          </div>
          <div class="mt-6 flex items-center justify-between text-xs font-mono text-amber-400 group-hover:translate-x-1 transition-transform">
            <span>View Leaderboards</span>
            <span>→</span>
          </div>
        </router-link>

        <!-- MODULE 4: MATCH ANALYTICS & TELEMETRY -->
        <router-link 
          to="/admin/matches" 
          class="group p-6 bg-slate-900/60 hover:bg-slate-900 backdrop-blur-xl border border-slate-800 hover:border-emerald-500/50 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-[0_0_25px_rgba(16,185,129,0.15)] flex flex-col justify-between"
        >
          <div>
            <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              ⚔️
            </div>
            <h4 class="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
              Match Analytics & Logs
            </h4>
            <p class="text-xs text-slate-400 mt-1 leading-relaxed">
              Track live match concurrency, score distribution charts, and detailed session history.
            </p>
          </div>
          <div class="mt-6 flex items-center justify-between text-xs font-mono text-emerald-400 group-hover:translate-x-1 transition-transform">
            <span>View Telemetry</span>
            <span>→</span>
          </div>
        </router-link>

        <!-- MODULE 5: SUPPORT CORES SYSTEM -->
        <router-link 
          to="/admin/cores" 
          class="group p-6 bg-slate-900/60 hover:bg-slate-900 backdrop-blur-xl border border-slate-800 hover:border-cyan-500/50 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-[0_0_25px_rgba(6,182,212,0.15)] flex flex-col justify-between"
        >
          <div>
            <div class="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              ⚡
            </div>
            <h4 class="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
              Support Cores System
            </h4>
            <p class="text-xs text-slate-400 mt-1 leading-relaxed">
              Manage catalog of {{ metrics.totalCores }} cores, tune multipliers, and toggle drop pool availability.
            </p>
          </div>
          <div class="mt-6 flex items-center justify-between text-xs font-mono text-cyan-400 group-hover:translate-x-1 transition-transform">
            <span>Manage Core Catalog</span>
            <span>→</span>
          </div>
        </router-link>

        <!-- MODULE 6: AI CORE ASSISTANT -->
        <router-link 
          to="/admin/ai" 
          class="group p-6 bg-slate-900/60 hover:bg-slate-900 backdrop-blur-xl border border-slate-800 hover:border-violet-500/50 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-[0_0_25px_rgba(139,92,246,0.15)] flex flex-col justify-between"
        >
          <div>
            <div class="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              🤖
            </div>
            <h4 class="text-lg font-bold text-white group-hover:text-violet-400 transition-colors">
              AI Core Assistant
            </h4>
            <p class="text-xs text-slate-400 mt-1 leading-relaxed">
              Test AI chat responses, batch-generate questions, and monitor Gemini model health.
            </p>
          </div>
          <div class="mt-6 flex items-center justify-between text-xs font-mono text-violet-400 group-hover:translate-x-1 transition-transform">
            <span>Open AI Workspace</span>
            <span>→</span>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { fetchWithAuth } from '../../services/api'

interface AdminMetrics {
  totalPlayers: number
  liveMatches: number
  totalQuestions: number
  totalMatches: number
  totalCores: number
  serverStatus: string
  queryLatencyMs: number
  uptimeSeconds: number
}

const metrics = ref<AdminMetrics>({
  totalPlayers: 0,
  liveMatches: 0,
  totalQuestions: 0,
  totalMatches: 0,
  totalCores: 0,
  serverStatus: 'online',
  queryLatencyMs: 0,
  uptimeSeconds: 0
})

const isLoading = ref(true)
const currentTime = ref(new Date().toLocaleTimeString())

let timeInterval: any = null

function updateClock() {
  currentTime.value = new Date().toLocaleTimeString()
}

function formatUptime(seconds: number): string {
  if (!seconds) return '0s'
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  if (hrs > 0) return `${hrs}h ${mins}m`
  return `${mins}m ${seconds % 60}s`
}

async function fetchMetrics() {
  isLoading.value = true
  try {
    const res = await fetchWithAuth('/api/admin/summary')
    if (res.ok) {
      const result = await res.json()
      if (result.success && result.data) {
        metrics.value = result.data
      }
    }
  } catch (err) {
    console.error('Failed to fetch admin summary metrics:', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchMetrics()
  timeInterval = setInterval(updateClock, 1000)
})

onUnmounted(() => {
  if (timeInterval) clearInterval(timeInterval)
})
</script>

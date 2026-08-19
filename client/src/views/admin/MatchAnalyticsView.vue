<template>
  <div class="space-y-6 animate-fade-in">
    <!-- PAGE HEADER & LIVE SERVER TELEMETRY BADGE -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <div class="flex items-center gap-2.5 mb-1.5">
          <span class="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 shadow-[0_0_10px_rgba(16,185,129,0.15)]">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            ARENA TELEMETRY ENGINE
          </span>
          <span class="text-xs font-mono text-slate-500">v2.4 Live</span>
        </div>
        <h2 class="text-2xl font-black text-white tracking-wide flex items-center gap-2.5">
          <span>⚔️</span>
          <span>Match Analytics & Telemetry</span>
        </h2>
        <p class="text-xs text-slate-400 mt-1">
          Monitor real-time match concurrency, player match activity trends, gameplay scores, and detailed session history.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <!-- MANUAL REFRESH -->
        <button 
          @click="refreshAllData" 
          :disabled="isLoadingAnalytics || isLoadingHistory"
          class="flex items-center gap-2 px-3.5 py-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold font-mono transition-all shadow-sm active:scale-95 disabled:opacity-50"
        >
          <svg class="w-4 h-4 text-red-400" :class="{ 'animate-spin': isLoadingAnalytics || isLoadingHistory }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Refresh Analytics</span>
        </button>
      </div>
    </div>

    <!-- 4 KPI SUMMARY CARDS -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      <!-- KPI 1: LIVE ACTIVE MATCHES -->
      <div class="p-5 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 hover:border-emerald-500/40 rounded-2xl flex flex-col justify-between shadow-lg transition-all duration-300 hover:shadow-[0_0_20px_rgba(16,185,129,0.1)]">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-slate-400 uppercase tracking-wider font-mono">Live Matches</span>
          <div class="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-sm">
            ⚔️
          </div>
        </div>
        <div class="mt-4">
          <div class="flex items-baseline gap-2">
            <span class="text-3xl font-black text-emerald-400 font-mono tracking-tight">{{ liveMetrics.liveMatches }}</span>
            <span class="flex h-2.5 w-2.5 relative">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
          <p class="text-[11px] text-emerald-500/80 mt-1 font-mono flex items-center justify-between">
            <span>{{ liveMetrics.colyseusRooms }} Colyseus Room(s)</span>
            <span class="text-slate-500">{{ liveMetrics.onlinePlayers }} Online</span>
          </p>
        </div>
      </div>

      <!-- KPI 2: TOTAL MATCHES IN PERIOD -->
      <div class="p-5 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 hover:border-blue-500/40 rounded-2xl flex flex-col justify-between shadow-lg transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.1)]">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-slate-400 uppercase tracking-wider font-mono">Total Matches</span>
          <div class="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-sm">
            📊
          </div>
        </div>
        <div class="mt-4">
          <div v-if="isLoadingAnalytics" class="h-8 w-20 bg-slate-800 animate-pulse rounded-lg"></div>
          <span v-else class="text-3xl font-black text-white font-mono tracking-tight">{{ analyticsSummary.totalMatches.toLocaleString() }}</span>
          <p class="text-[11px] text-slate-400 mt-1 font-mono">
            In timeframe: <span class="text-blue-400 font-semibold">{{ timeframeLabel }}</span>
          </p>
        </div>
      </div>

      <!-- KPI 3: AVERAGE DURATION -->
      <div class="p-5 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 hover:border-amber-500/40 rounded-2xl flex flex-col justify-between shadow-lg transition-all duration-300 hover:shadow-[0_0_20px_rgba(245,158,11,0.1)]">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-slate-400 uppercase tracking-wider font-mono">Avg Duration</span>
          <div class="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-sm">
            ⏱️
          </div>
        </div>
        <div class="mt-4">
          <div v-if="isLoadingAnalytics" class="h-8 w-20 bg-slate-800 animate-pulse rounded-lg"></div>
          <span v-else class="text-3xl font-black text-amber-400 font-mono tracking-tight">{{ formatDuration(analyticsSummary.avgDurationSeconds) }}</span>
          <p class="text-[11px] text-slate-400 mt-1 font-mono">
            Target: <span class="text-slate-300 font-semibold">60s / timed match</span>
          </p>
        </div>
      </div>

      <!-- KPI 4: MATCH COMPLETION RATE -->
      <div class="p-5 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 hover:border-rose-500/40 rounded-2xl flex flex-col justify-between shadow-lg transition-all duration-300 hover:shadow-[0_0_20px_rgba(244,63,94,0.1)]">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-slate-400 uppercase tracking-wider font-mono">Completion Rate</span>
          <div class="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-sm">
            🎯
          </div>
        </div>
        <div class="mt-4">
          <div v-if="isLoadingAnalytics" class="h-8 w-20 bg-slate-800 animate-pulse rounded-lg"></div>
          <span v-else class="text-3xl font-black text-rose-400 font-mono tracking-tight">{{ analyticsSummary.completionRate }}%</span>
          <p class="text-[11px] text-slate-400 mt-1 font-mono">
            Avg Score: <span class="text-rose-300 font-semibold">{{ analyticsSummary.avgScore }} pts</span>
          </p>
        </div>
      </div>
    </div>

    <!-- CHARTS SECTION: TIMELINE & BREAKDOWN -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- MAIN TIMELINE CHART (2 COLS) -->
      <div class="lg:col-span-2 p-6 bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl shadow-xl flex flex-col justify-between">
        <!-- CHART HEADER WITH TIMEFRAME & METRIC CONTROLS -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 class="text-base font-bold text-white tracking-wide flex items-center gap-2">
              <span>📈</span>
              <span>Match Activity Telemetry</span>
            </h3>
            <p class="text-xs text-slate-400 mt-0.5">Historical match volume and gameplay throughput</p>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <!-- METRIC SELECTOR -->
            <div class="inline-flex p-1 bg-slate-950/80 rounded-xl border border-slate-800 text-xs font-mono">
              <button
                v-for="m in metricOptions"
                :key="m.value"
                @click="setChartMetric(m.value)"
                :class="[
                  'px-2.5 py-1 rounded-lg transition-all',
                  selectedMetric === m.value 
                    ? 'bg-red-600 text-white font-bold shadow-[0_0_10px_rgba(220,38,38,0.5)]' 
                    : 'text-slate-400 hover:text-slate-200'
                ]"
              >
                {{ m.label }}
              </button>
            </div>

            <!-- TIMEFRAME SELECTOR -->
            <div class="inline-flex p-1 bg-slate-950/80 rounded-xl border border-slate-800 text-xs font-mono">
              <button
                v-for="t in timeframeOptions"
                :key="t.value"
                @click="setTimeframe(t.value)"
                :class="[
                  'px-2.5 py-1 rounded-lg transition-all',
                  selectedTimeframe === t.value 
                    ? 'bg-slate-800 text-white font-bold border border-slate-700' 
                    : 'text-slate-400 hover:text-slate-200'
                ]"
              >
                {{ t.label }}
              </button>
            </div>
          </div>
        </div>

        <!-- CANVAS WRAPPER -->
        <div class="relative w-full h-[280px] sm:h-[320px] flex items-center justify-center">
          <div v-if="isLoadingAnalytics" class="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/50 backdrop-blur-sm z-10 rounded-xl">
            <div class="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            <span class="text-xs font-mono text-slate-400 mt-3">Rendering Match Telemetry...</span>
          </div>
          <canvas ref="timelineChartCanvas" class="w-full h-full"></canvas>
        </div>
      </div>

      <!-- SECONDARY CARD: STATUS BREAKDOWN & TOP EQUIPPED CORES -->
      <div class="p-6 bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl shadow-xl flex flex-col justify-between space-y-6">
        <div>
          <h3 class="text-base font-bold text-white tracking-wide flex items-center gap-2">
            <span>🍩</span>
            <span>Match Status Distribution</span>
          </h3>
          <p class="text-xs text-slate-400 mt-0.5">Session completion vs termination rates</p>
        </div>

        <!-- DOUGHNUT CHART WRAPPER -->
        <div class="relative w-full h-[180px] flex items-center justify-center">
          <canvas ref="statusChartCanvas" class="w-full h-full"></canvas>
        </div>

        <!-- TOP EQUIPPED CORES MINI-LIST -->
        <div class="border-t border-slate-800/80 pt-4">
          <div class="flex items-center justify-between text-xs font-mono mb-2.5">
            <span class="text-slate-400 font-semibold uppercase tracking-wider">Top Equipped Cores</span>
            <span class="text-slate-500">Matches</span>
          </div>
          <div v-if="topCores.length === 0" class="text-xs text-slate-500 italic py-2 text-center">
            No core data recorded in this period
          </div>
          <div v-else class="space-y-2">
            <div 
              v-for="(core, idx) in topCores.slice(0, 4)" 
              :key="core.name"
              class="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800/60 text-xs font-mono"
            >
              <div class="flex items-center gap-2">
                <span class="text-[10px] w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold">
                  {{ idx + 1 }}
                </span>
                <span class="text-slate-200 font-semibold">{{ core.name }}</span>
              </div>
              <span class="px-2 py-0.5 text-[10px] font-bold rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                {{ core.count }} plays
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- DETAILED MATCH HISTORY LOG TABLE -->
    <div class="bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl shadow-xl overflow-hidden">
      <!-- TABLE CONTROLS BAR -->
      <div class="p-4 sm:p-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 class="text-lg font-bold text-white tracking-wide flex items-center gap-2">
            <span>📜</span>
            <span>Match History Log</span>
          </h3>
          <p class="text-xs text-slate-400 mt-0.5">Detailed per-session records of player battles and performance metrics</p>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <!-- SEARCH INPUT -->
          <div class="relative min-w-[220px] sm:w-64">
            <svg class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              v-model="searchQuery"
              @input="handleSearchDebounced"
              type="text"
              placeholder="Search player / session ID..."
              class="w-full pl-9 pr-8 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500/50 transition-colors font-mono"
            />
            <button 
              v-if="searchQuery" 
              @click="clearSearch"
              class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <!-- STATUS FILTER TABS -->
          <div class="inline-flex p-1 bg-slate-950/80 rounded-xl border border-slate-800 text-xs font-mono">
            <button
              v-for="tab in statusTabs"
              :key="tab.value"
              @click="setStatusFilter(tab.value)"
              :class="[
                'px-3 py-1.5 rounded-lg transition-all font-medium',
                selectedStatus === tab.value 
                  ? 'bg-slate-800 text-white font-bold border border-slate-700 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              ]"
            >
              {{ tab.label }}
            </button>
          </div>
        </div>
      </div>

      <!-- TABLE VIEW -->
      <div class="overflow-x-auto min-h-[300px]">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-slate-800 bg-slate-950/40 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              <th class="py-3.5 px-4 font-semibold">Match ID</th>
              <th class="py-3.5 px-4 font-semibold">Player</th>
              <th class="py-3.5 px-4 font-semibold">Core Equipped</th>
              <th class="py-3.5 px-4 font-semibold text-right">Score</th>
              <th class="py-3.5 px-4 font-semibold text-center">Questions</th>
              <th class="py-3.5 px-4 font-semibold text-center">Duration</th>
              <th class="py-3.5 px-4 font-semibold text-center">Status</th>
              <th class="py-3.5 px-4 font-semibold text-right">Started At</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/60 text-xs">
            <!-- LOADING STATE -->
            <tr v-if="isLoadingHistory">
              <td colspan="8" class="py-12 text-center text-slate-500 font-mono">
                <div class="flex flex-col items-center justify-center gap-2">
                  <div class="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                  <span>Loading match records...</span>
                </div>
              </td>
            </tr>

            <!-- EMPTY STATE -->
            <tr v-else-if="matches.length === 0">
              <td colspan="8" class="py-12 text-center text-slate-500 font-mono">
                <p class="text-sm text-slate-400 mb-1">No match records found</p>
                <p class="text-xs text-slate-600">Try changing your search query or filter parameters.</p>
              </td>
            </tr>

            <!-- MATCH ROW -->
            <tr 
              v-else 
              v-for="m in matches" 
              :key="m.id"
              class="hover:bg-slate-800/40 transition-colors group"
            >
              <!-- MATCH ID -->
              <td class="py-3.5 px-4 font-mono">
                <div class="flex items-center gap-1.5">
                  <span class="text-slate-400 group-hover:text-white transition-colors">
                    #{{ m.id.substring(0, 8) }}
                  </span>
                  <button 
                    @click="copyToClipboard(m.id)" 
                    class="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-opacity p-0.5"
                    title="Copy Session UUID"
                  >
                    📋
                  </button>
                </div>
              </td>

              <!-- PLAYER INFO -->
              <td class="py-3.5 px-4">
                <div class="flex items-center gap-2.5">
                  <img 
                    :src="m.player.avatar_url" 
                    alt="Avatar" 
                    class="w-8 h-8 rounded-lg border border-slate-700 bg-slate-950 object-cover flex-shrink-0"
                  />
                  <div class="min-w-0">
                    <div class="font-bold text-white truncate group-hover:text-red-400 transition-colors">
                      {{ m.player.username }}
                    </div>
                    <div class="text-[10px] text-slate-400 font-mono truncate">
                      {{ m.player.email || 'Guest Player' }}
                    </div>
                  </div>
                </div>
              </td>

              <!-- CORE EQUIPPED -->
              <td class="py-3.5 px-4 font-mono">
                <div v-if="m.core" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/60 border border-slate-800">
                  <span class="text-xs">🔮</span>
                  <span class="text-slate-200 font-medium text-[11px]">{{ m.core.name }}</span>
                  <span class="text-[9px] px-1 py-0.2 rounded bg-red-950/80 text-red-400 border border-red-800/50">T{{ m.core.tier || 1 }}</span>
                </div>
                <span v-else class="text-slate-600 text-[11px] italic">Standard (None)</span>
              </td>

              <!-- SCORE -->
              <td class="py-3.5 px-4 font-mono font-black text-right text-sm">
                <span :class="m.score > 500 ? 'text-amber-400' : 'text-slate-200'">
                  {{ m.score.toLocaleString() }}
                </span>
              </td>

              <!-- QUESTIONS -->
              <td class="py-3.5 px-4 font-mono text-center text-slate-300">
                {{ m.questions_answered }}
              </td>

              <!-- DURATION -->
              <td class="py-3.5 px-4 font-mono text-center text-slate-400">
                {{ m.duration_seconds }}s
              </td>

              <!-- STATUS PILL -->
              <td class="py-3.5 px-4 text-center font-mono">
                <span 
                  v-if="m.status === 'completed'" 
                  class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                >
                  Completed
                </span>
                <span 
                  v-else-if="m.status === 'active'" 
                  class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30 animate-pulse"
                >
                  Active
                </span>
                <span 
                  v-else-if="m.status === 'aborted'" 
                  class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30"
                >
                  Aborted
                </span>
                <span 
                  v-else 
                  class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30"
                >
                  Abandoned
                </span>
              </td>

              <!-- TIMESTAMP -->
              <td class="py-3.5 px-4 text-right font-mono text-slate-400 text-[11px]">
                {{ formatDateTime(m.started_at) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- PAGINATION FOOTER -->
      <div class="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="flex items-center gap-3 text-xs font-mono text-slate-400">
          <span>Showing {{ paginationRange }} of {{ totalMatchesCount }} matches</span>
          <select 
            v-model="pageLimit" 
            @change="resetAndFetchHistory"
            class="bg-slate-900 border border-slate-800 text-slate-300 rounded-lg px-2 py-1 focus:outline-none focus:border-red-500/50"
          >
            <option :value="10">10 per page</option>
            <option :value="25">25 per page</option>
            <option :value="50">50 per page</option>
          </select>
        </div>

        <div class="flex items-center gap-1.5 font-mono text-xs">
          <button 
            @click="changePage(currentPage - 1)" 
            :disabled="currentPage <= 1"
            class="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-all"
          >
            ‹ Prev
          </button>
          
          <span class="px-3 py-1.5 rounded-lg bg-slate-800 text-white font-bold border border-slate-700">
            {{ currentPage }} / {{ totalPages }}
          </span>

          <button 
            @click="changePage(currentPage + 1)" 
            :disabled="currentPage >= totalPages"
            class="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-all"
          >
            Next ›
          </button>
        </div>
      </div>
    </div>

    <!-- TOAST NOTIFICATION -->
    <div 
      v-if="toastMessage" 
      class="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-slate-900 border border-emerald-500/40 text-white font-mono text-xs shadow-2xl flex items-center gap-2 animate-slide-up"
    >
      <span>✅</span>
      <span>{{ toastMessage }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { fetchWithAuth } from '../../services/api'
import Chart from 'chart.js/auto'

interface LiveMetrics {
  liveMatches: number
  colyseusRooms: number
  dbActiveSessions: number
  onlinePlayers: number
}

interface AnalyticsSummary {
  totalMatches: number
  avgScore: number
  avgDurationSeconds: number
  completionRate: number
  statusBreakdown: {
    completed: number
    active: number
    aborted: number
    abandoned: number
  }
}

interface TimelineBucket {
  date: string
  label: string
  totalMatches: number
  completedMatches: number
  abortedMatches: number
  activeMatches: number
  avgScore: number
  avgDurationSeconds: number
}

interface TopCore {
  id: string
  name: string
  tier: number
  count: number
}

interface MatchRecord {
  id: string
  score: number
  questions_answered: number
  status: string
  raw_status: string
  duration_seconds: number
  started_at: string
  ended_at: string | null
  player: {
    id: string
    username: string
    email: string
    avatar_url: string
    elo: number
  }
  core: {
    id: string
    name: string
    classification: string
    tier: number
    icon_url: string | null
  } | null
}

// ── State ─────────────────────────────────────────────────────────────────────
const selectedTimeframe = ref<'7d' | '30d' | '12m'>('7d')
const selectedMetric = ref<'matches' | 'score' | 'breakdown'>('matches')

const liveMetrics = ref<LiveMetrics>({
  liveMatches: 0,
  colyseusRooms: 0,
  dbActiveSessions: 0,
  onlinePlayers: 0
})

const analyticsSummary = ref<AnalyticsSummary>({
  totalMatches: 0,
  avgScore: 0,
  avgDurationSeconds: 60,
  completionRate: 100,
  statusBreakdown: { completed: 0, active: 0, aborted: 0, abandoned: 0 }
})

const timelineData = ref<TimelineBucket[]>([])
const topCores = ref<TopCore[]>([])

const matches = ref<MatchRecord[]>([])
const totalMatchesCount = ref(0)
const totalPages = ref(1)
const currentPage = ref(1)
const pageLimit = ref(10)

const searchQuery = ref('')
const selectedStatus = ref<'all' | 'completed' | 'active' | 'aborted'>('all')

const isLoadingAnalytics = ref(true)
const isLoadingHistory = ref(true)
const toastMessage = ref('')

let searchTimeout: any = null
let livePollingTimer: any = null

// Chart instances
const timelineChartCanvas = ref<HTMLCanvasElement | null>(null)
const statusChartCanvas = ref<HTMLCanvasElement | null>(null)
let timelineChartInstance: Chart | null = null
let statusChartInstance: Chart | null = null

// ── Options ───────────────────────────────────────────────────────────────────
const timeframeOptions = [
  { label: '7 Days', value: '7d' },
  { label: '30 Days', value: '30d' },
  { label: '12 Months', value: '12m' }
]

const metricOptions = [
  { label: 'Total Volume', value: 'matches' },
  { label: 'Avg Score', value: 'score' },
  { label: 'Status Breakdown', value: 'breakdown' }
]

const statusTabs = [
  { label: 'All', value: 'all' },
  { label: 'Completed', value: 'completed' },
  { label: 'Active', value: 'active' },
  { label: 'Aborted', value: 'aborted' }
]

const timeframeLabel = computed(() => {
  if (selectedTimeframe.value === '30d') return 'Last 30 Days'
  if (selectedTimeframe.value === '12m') return 'Last 12 Months'
  return 'Last 7 Days'
})

const paginationRange = computed(() => {
  if (totalMatchesCount.value === 0) return '0'
  const start = (currentPage.value - 1) * pageLimit.value + 1
  const end = Math.min(currentPage.value * pageLimit.value, totalMatchesCount.value)
  return `${start} - ${end}`
})

// ── API Methods ───────────────────────────────────────────────────────────────
async function fetchLiveMetrics() {
  try {
    const res = await fetchWithAuth('/api/admin/matches/live')
    const json = await res.json()
    if (res.ok && json.success && json.data) {
      liveMetrics.value = json.data
    }
  } catch (err) {
    console.error('fetchLiveMetrics error:', err)
  }
}

async function fetchAnalytics() {
  isLoadingAnalytics.value = true
  try {
    const res = await fetchWithAuth(`/api/admin/matches/analytics?timeframe=${selectedTimeframe.value}`)
    const json = await res.json()
    if (res.ok && json.success && json.data) {
      analyticsSummary.value = json.data.summary
      timelineData.value = json.data.timeline || []
      topCores.value = json.data.topCores || []

      await nextTick()
      renderTimelineChart()
      renderStatusChart()
    }
  } catch (err) {
    console.error('fetchAnalytics error:', err)
  } finally {
    isLoadingAnalytics.value = false
  }
}

async function fetchMatchHistory() {
  isLoadingHistory.value = true
  try {
    const params = new URLSearchParams({
      page: String(currentPage.value),
      limit: String(pageLimit.value),
      search: searchQuery.value.trim(),
      status: selectedStatus.value
    })

    const res = await fetchWithAuth(`/api/admin/matches/history?${params.toString()}`)
    const json = await res.json()
    if (res.ok && json.success && json.data) {
      matches.value = json.data.matches || []
      totalMatchesCount.value = json.data.total || 0
      totalPages.value = json.data.totalPages || 1
    }
  } catch (err) {
    console.error('fetchMatchHistory error:', err)
  } finally {
    isLoadingHistory.value = false
  }
}

function refreshAllData() {
  fetchLiveMetrics()
  fetchAnalytics()
  fetchMatchHistory()
}

// ── Chart Rendering ───────────────────────────────────────────────────────────
function renderTimelineChart() {
  if (!timelineChartCanvas.value) return
  if (timelineChartInstance) {
    timelineChartInstance.destroy()
    timelineChartInstance = null
  }

  const ctx = timelineChartCanvas.value.getContext('2d')
  if (!ctx) return

  const labels = timelineData.value.map(t => t.label)

  let datasets: any[] = []

  if (selectedMetric.value === 'matches') {
    const gradient = ctx.createLinearGradient(0, 0, 0, 300)
    gradient.addColorStop(0, 'rgba(239, 68, 68, 0.35)')
    gradient.addColorStop(1, 'rgba(239, 68, 68, 0.0)')

    datasets = [
      {
        label: 'Total Matches',
        data: timelineData.value.map(t => t.totalMatches),
        borderColor: '#ef4444',
        backgroundColor: gradient,
        borderWidth: 2.5,
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#ef4444',
        pointBorderColor: '#0f172a',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  } else if (selectedMetric.value === 'score') {
    const gradient = ctx.createLinearGradient(0, 0, 0, 300)
    gradient.addColorStop(0, 'rgba(245, 158, 11, 0.35)')
    gradient.addColorStop(1, 'rgba(245, 158, 11, 0.0)')

    datasets = [
      {
        label: 'Average Score',
        data: timelineData.value.map(t => t.avgScore),
        borderColor: '#f59e0b',
        backgroundColor: gradient,
        borderWidth: 2.5,
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#f59e0b',
        pointBorderColor: '#0f172a',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  } else {
    // Breakdown (Completed vs Aborted)
    datasets = [
      {
        type: 'bar' as const,
        label: 'Completed',
        data: timelineData.value.map(t => t.completedMatches),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderRadius: 6
      },
      {
        type: 'bar' as const,
        label: 'Aborted / Abandoned',
        data: timelineData.value.map(t => t.abortedMatches),
        backgroundColor: 'rgba(244, 63, 94, 0.8)',
        borderRadius: 6
      }
    ]
  }

  timelineChartInstance = new Chart(ctx, {
    type: selectedMetric.value === 'breakdown' ? 'bar' : 'line',
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          display: selectedMetric.value === 'breakdown',
          position: 'top',
          labels: {
            color: '#94a3b8',
            font: { family: 'ui-monospace, SFMono-Regular, Menlo, monospace', size: 11 }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          titleColor: '#ffffff',
          bodyColor: '#cbd5e1',
          borderColor: 'rgba(51, 65, 85, 0.8)',
          borderWidth: 1,
          padding: 10,
          cornerRadius: 8,
          bodyFont: { family: 'ui-monospace, monospace', size: 12 },
          titleFont: { family: 'ui-monospace, monospace', size: 12, weight: 'bold' }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(51, 65, 85, 0.25)' },
          ticks: {
            color: '#94a3b8',
            font: { family: 'ui-monospace, monospace', size: 10 }
          }
        },
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(51, 65, 85, 0.25)' },
          ticks: {
            color: '#94a3b8',
            font: { family: 'ui-monospace, monospace', size: 10 }
          }
        }
      }
    }
  })
}

function renderStatusChart() {
  if (!statusChartCanvas.value) return
  if (statusChartInstance) {
    statusChartInstance.destroy()
    statusChartInstance = null
  }

  const ctx = statusChartCanvas.value.getContext('2d')
  if (!ctx) return

  const b = analyticsSummary.value.statusBreakdown
  const data = [b.completed, b.active, b.aborted, b.abandoned]
  const labels = ['Completed', 'Active', 'Aborted', 'Abandoned']

  statusChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [
        {
          data,
          backgroundColor: [
            '#10b981', // emerald
            '#3b82f6', // blue
            '#f43f5e', // rose
            '#f59e0b'  // amber
          ],
          borderColor: '#0f172a',
          borderWidth: 3,
          hoverOffset: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: '#94a3b8',
            font: { family: 'ui-monospace, monospace', size: 10 },
            boxWidth: 10
          }
        },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          titleColor: '#ffffff',
          bodyColor: '#cbd5e1',
          borderColor: 'rgba(51, 65, 85, 0.8)',
          borderWidth: 1,
          padding: 8,
          cornerRadius: 6
        }
      },
      cutout: '68%'
    }
  })
}

// ── Control Helpers ───────────────────────────────────────────────────────────
function setTimeframe(tf: any) {
  selectedTimeframe.value = tf
  fetchAnalytics()
}

function setChartMetric(m: any) {
  selectedMetric.value = m
  renderTimelineChart()
}

function resetAndFetchHistory() {
  currentPage.value = 1
  fetchMatchHistory()
}

function handleSearchDebounced() {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(resetAndFetchHistory, 350)
}

function clearSearch() {
  searchQuery.value = ''
  resetAndFetchHistory()
}

function setStatusFilter(status: any) {
  selectedStatus.value = status
  resetAndFetchHistory()
}

function changePage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    fetchMatchHistory()
  }
}

function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '0s'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  if (m === 0) return `${s}s`
  return `${m}m ${s}s`
}

function formatDateTime(isoStr: string): string {
  if (!isoStr) return '—'
  const d = new Date(isoStr)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function copyToClipboard(text: string) {
  if (!text) return
  navigator.clipboard?.writeText(text)
  toastMessage.value = `Copied ID: ${text.substring(0, 8)}...`
  setTimeout(() => { toastMessage.value = '' }, 2500)
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────
onMounted(() => {
  fetchLiveMetrics()
  fetchAnalytics()
  fetchMatchHistory()

  // Poll live metrics every 6 seconds in background
  livePollingTimer = setInterval(fetchLiveMetrics, 6000)
})

onUnmounted(() => {
  if (livePollingTimer) clearInterval(livePollingTimer)
  if (searchTimeout) clearTimeout(searchTimeout)
  if (timelineChartInstance) timelineChartInstance.destroy()
  if (statusChartInstance) statusChartInstance.destroy()
})
</script>
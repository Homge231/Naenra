<template>
  <div class="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 sm:p-6 backdrop-blur-xl shadow-xl space-y-6 relative overflow-hidden">
    <!-- BACKGROUND RADAR GLOW -->
    <div class="absolute -right-20 -top-20 w-72 h-72 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>

    <!-- HEADER SECTION -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-amber-600 flex items-center justify-center shadow-[0_0_15px_rgba(220,38,38,0.4)] text-lg animate-pulse">
          🛡️
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h3 class="text-base sm:text-lg font-bold text-white tracking-wide">
              Anti-Cheat Anomaly Radar
            </h3>
            <span class="px-2 py-0.5 text-[10px] font-mono font-bold rounded-full bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
              LIVE HEURISTICS
            </span>
          </div>
          <p class="text-xs text-slate-400">
            Real-time keystroke interval analysis & behavioral auto-typer detection
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button
          @click="fetchAnomalies"
          :disabled="loading"
          class="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          <svg :class="['w-3.5 h-3.5', loading ? 'animate-spin' : '']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>{{ loading ? 'Scanning...' : 'Scan Now' }}</span>
        </button>
      </div>
    </div>

    <!-- QUICK STATS BAR -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div class="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
        <span class="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Flagged Accounts</span>
        <div class="text-lg font-black text-white mt-0.5">{{ anomalies.length }}</div>
      </div>
      <div class="bg-slate-950/60 border border-red-900/40 rounded-xl p-3">
        <span class="text-[10px] font-mono text-red-400 uppercase tracking-wider">Critical Risk (≥75%)</span>
        <div class="text-lg font-black text-red-400 mt-0.5">{{ criticalCount }}</div>
      </div>
      <div class="bg-slate-950/60 border border-amber-900/40 rounded-xl p-3">
        <span class="text-[10px] font-mono text-amber-400 uppercase tracking-wider">High Risk (50-74%)</span>
        <div class="text-lg font-black text-amber-400 mt-0.5">{{ highRiskCount }}</div>
      </div>
      <div class="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
        <span class="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Active Bans</span>
        <div class="text-lg font-black text-slate-300 mt-0.5">{{ bannedCount }}</div>
      </div>
    </div>

    <!-- RISK FILTER TABS -->
    <div class="flex flex-wrap items-center gap-1.5 bg-slate-950/70 p-1.5 rounded-xl border border-slate-800/80 text-xs">
      <button
        v-for="filter in ['all', 'critical', 'high', 'banned']"
        :key="filter"
        @click="activeFilter = filter"
        :class="[
          'px-3 py-1.5 rounded-lg font-bold uppercase font-mono tracking-wider transition-all cursor-pointer',
          activeFilter === filter
            ? 'bg-red-600 text-white shadow-[0_0_10px_rgba(220,38,38,0.5)]'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
        ]"
      >
        {{ filter === 'all' ? 'All Flagged' : filter }}
      </button>
    </div>

    <!-- ANOMALY CARDS LIST -->
    <div v-if="loading && anomalies.length === 0" class="py-12 flex flex-col items-center justify-center text-slate-400 space-y-3">
      <div class="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      <span class="text-xs font-mono">Running Deep Telemetry Heuristics...</span>
    </div>

    <div v-else-if="filteredAnomalies.length === 0" class="py-12 flex flex-col items-center justify-center text-slate-400 bg-slate-950/40 rounded-xl border border-slate-800/60">
      <span class="text-3xl mb-2">✨</span>
      <p class="text-sm font-semibold text-slate-200">No telemetry anomalies detected</p>
      <p class="text-xs text-slate-500 mt-1">All active player submissions comply with human keystroke thresholds.</p>
    </div>

    <div v-else class="space-y-3 max-h-[520px] overflow-y-auto pr-1">
      <div
        v-for="item in filteredAnomalies"
        :key="item.playerId"
        class="bg-slate-950/80 border border-slate-800/90 hover:border-red-900/50 rounded-xl p-4 transition-all duration-200 space-y-3"
      >
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <!-- PLAYER INFO -->
          <div class="flex items-center gap-3">
            <img
              :src="item.avatar_url"
              :alt="item.username"
              class="w-10 h-10 rounded-xl border border-slate-700 object-cover bg-slate-900"
            />
            <div>
              <div class="flex items-center gap-2">
                <span class="text-sm font-bold text-white">{{ item.username }}</span>
                <span
                  :class="[
                    'px-2 py-0.5 text-[9px] font-mono font-black uppercase rounded-full border',
                    item.riskLevel === 'critical'
                      ? 'bg-red-500/20 text-red-400 border-red-500/40'
                      : item.riskLevel === 'high'
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  ]"
                >
                  {{ item.riskLevel }} risk
                </span>
                <span v-if="item.isBanned" class="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded bg-slate-800 text-slate-400 border border-slate-700">
                  BANNED
                </span>
              </div>
              <p class="text-xs text-slate-400 font-mono">{{ item.email }} • ELO: {{ item.elo }} ({{ item.wins }}W / {{ item.losses }}L)</p>
            </div>
          </div>

          <!-- ANOMALY SCORE GAUGE -->
          <div class="flex items-center gap-3">
            <div class="text-right">
              <span class="text-[10px] font-mono text-slate-400 uppercase">Anomaly Score</span>
              <div
                :class="[
                  'text-lg font-black font-mono',
                  item.anomalyScore >= 75 ? 'text-red-400' : item.anomalyScore >= 50 ? 'text-amber-400' : 'text-emerald-400'
                ]"
              >
                {{ item.anomalyScore }}%
              </div>
            </div>
            <div class="w-12 h-12 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center p-1">
              <div
                class="w-full h-full rounded-full flex items-center justify-center text-xs font-black"
                :class="item.anomalyScore >= 75 ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'"
              >
                ⚡
              </div>
            </div>
          </div>
        </div>

        <!-- TELEMETRY PILLS -->
        <div class="flex flex-wrap items-center gap-2 pt-1">
          <span class="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
            ⏱️ Fastest: <strong class="text-red-400">{{ item.fastestIntervalMs }}ms</strong>
          </span>
          <span class="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
            🎯 Accuracy: <strong class="text-emerald-400">{{ item.accuracy }}%</strong>
          </span>
          <span class="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
            📊 Answers: <strong class="text-slate-200">{{ item.totalLoggedAnswers }}</strong>
          </span>
        </div>

        <!-- FLAG REASONS LIST -->
        <div class="bg-slate-900/60 rounded-lg p-2.5 border border-slate-800/60 space-y-1">
          <div
            v-for="(reason, idx) in item.flagReasons"
            :key="idx"
            class="flex items-center gap-2 text-xs text-rose-300 font-medium"
          >
            <span class="text-red-500 text-xs">⚠️</span>
            <span>{{ reason }}</span>
          </div>
        </div>

        <!-- 1-CLICK ACTIONS -->
        <div class="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-900">
          <button
            @click="executeAction(item.playerId, 'dismiss')"
            :disabled="actionLoading[item.playerId]"
            class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
          >
            Dismiss
          </button>
          <button
            @click="executeAction(item.playerId, 'wipe_elo')"
            :disabled="actionLoading[item.playerId]"
            class="px-3 py-1.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
          >
            🧹 Wipe ELO
          </button>
          <button
            v-if="!item.isBanned"
            @click="executeAction(item.playerId, 'ban')"
            :disabled="actionLoading[item.playerId]"
            class="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold shadow-[0_0_10px_rgba(220,38,38,0.4)] transition-all disabled:opacity-50 cursor-pointer"
          >
            🚨 Ban Player
          </button>
        </div>
      </div>
    </div>

    <!-- TOAST NOTIFICATION -->
    <div
      v-if="statusMsg"
      class="fixed bottom-6 right-6 z-50 px-4 py-3 bg-slate-900 text-white border border-red-500/50 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce"
    >
      <span>🛡️</span>
      <span class="text-xs font-medium">{{ statusMsg }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'

const loading = ref(false)
const anomalies = ref<any[]>([])
const activeFilter = ref('all')
const actionLoading = ref<Record<string, boolean>>({})
const statusMsg = ref('')

const criticalCount = computed(() => anomalies.value.filter(a => a.riskLevel === 'critical').length)
const highRiskCount = computed(() => anomalies.value.filter(a => a.riskLevel === 'high').length)
const bannedCount = computed(() => anomalies.value.filter(a => a.isBanned).length)

const filteredAnomalies = computed(() => {
  if (activeFilter.value === 'critical') return anomalies.value.filter(a => a.riskLevel === 'critical')
  if (activeFilter.value === 'high') return anomalies.value.filter(a => a.riskLevel === 'high')
  if (activeFilter.value === 'banned') return anomalies.value.filter(a => a.isBanned)
  return anomalies.value
})

async function fetchAnomalies() {
  loading.value = true
  try {
    const token = localStorage.getItem('arena_token')
    const res = await fetch(`${SERVER_URL}/api/admin/anticheat/anomalies`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    if (data.success && Array.isArray(data.anomalies)) {
      anomalies.value = data.anomalies
    }
  } catch (err) {
    console.error('fetchAnomalies error:', err)
  } finally {
    loading.value = false
  }
}

async function executeAction(playerId: string, action: 'ban' | 'wipe_elo' | 'dismiss') {
  actionLoading.value[playerId] = true
  try {
    const token = localStorage.getItem('arena_token')
    const res = await fetch(`${SERVER_URL}/api/admin/anticheat/action`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ playerId, action })
    })
    const data = await res.json()
    if (data.success) {
      statusMsg.value = data.message || 'Action executed successfully!'
      setTimeout(() => { statusMsg.value = '' }, 3500)
      await fetchAnomalies()
    }
  } catch (err) {
    console.error('executeAction error:', err)
  } finally {
    actionLoading.value[playerId] = false
  }
}

onMounted(() => {
  fetchAnomalies()
})
</script>

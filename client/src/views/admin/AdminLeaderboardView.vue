<template>
  <div class="space-y-6">
    <!-- TOP HEADER & SEASON CONTROL BANNER -->
    <div class="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-6 shadow-xl relative overflow-hidden backdrop-blur-xl">
      <!-- Cyber Ambient Glow Background -->
      <div class="absolute -right-20 -top-20 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute -left-20 -bottom-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div class="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div class="flex items-center gap-3 mb-2">
            <span class="px-2.5 py-1 text-xs font-mono font-bold uppercase rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1.5 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
              <span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              SEASON 1 IN PROGRESS
            </span>
            <span class="text-xs text-slate-400 font-mono">ID: S1_APEX_2026</span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-black text-white tracking-wide uppercase">
            ELO Rank & Season Management
          </h1>
          <p class="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Monitor real-time global player ELO rankings (Top 100 competitors) and trigger secure global season resets to initiate new competitive seasons.
          </p>
        </div>

        <!-- SEASON RESET TRIGGER BUTTON -->
        <div class="shrink-0 flex items-center gap-3">
          <button 
            @click="fetchLeaderboard" 
            :disabled="isLoading"
            class="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold border border-slate-700 transition-all flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
            title="Refresh Leaderboard Data"
          >
            <svg :class="['w-4 h-4 text-amber-400', isLoading ? 'animate-spin' : '']" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh Data</span>
          </button>

          <button 
            @click="openResetModal" 
            class="px-5 py-3 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-[0_0_20px_rgba(225,29,72,0.35)] hover:shadow-[0_0_25px_rgba(225,29,72,0.55)] border border-red-400/40 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <svg class="w-4 h-4 text-amber-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>RESET SEASON</span>
          </button>
        </div>
      </div>

      <!-- METRICS SUMMARY CARDS -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/80">
        <div class="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
          <p class="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Total Ranked Players</p>
          <p class="text-xl sm:text-2xl font-black text-white mt-1">{{ summary.totalPlayers }}</p>
        </div>
        <div class="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
          <p class="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Average League ELO</p>
          <p class="text-xl sm:text-2xl font-black text-amber-400 mt-1">{{ summary.averageElo }}</p>
        </div>
        <div class="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
          <p class="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Apex Leader ELO (#1)</p>
          <p class="text-xl sm:text-2xl font-black text-emerald-400 mt-1">{{ summary.highestElo }}</p>
        </div>
        <div class="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
          <p class="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Season Status</p>
          <p class="text-sm font-bold text-red-400 mt-2 flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            ACTIVE
          </p>
        </div>
      </div>
    </div>

    <!-- TOP 3 PODIUM HIGHLIGHT CARDS -->
    <div v-if="topThreePlayers.length > 0 && !searchQuery" class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- RANK 2 (SILVER) -->
      <div v-if="topThreePlayers[1]" class="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl relative overflow-hidden flex items-center gap-4 group hover:border-slate-400/50 transition-all">
        <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-400 to-slate-200 flex items-center justify-center text-slate-950 font-black text-xl shadow-[0_0_15px_rgba(203,213,225,0.3)] shrink-0">
          🥈
        </div>
        <div class="min-w-0 flex-1">
          <span class="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest">
            RANK #2 • {{ getTierForElo(topThreePlayers[1].elo).name.toUpperCase() }}
          </span>
          <h3 class="text-base font-bold text-white truncate">{{ topThreePlayers[1].username }}</h3>
          <p class="text-xs font-mono font-bold text-slate-300">{{ topThreePlayers[1].elo }} ELO</p>
        </div>
      </div>

      <!-- RANK 1 (GOLD CHAMPION) -->
      <div v-if="topThreePlayers[0]" class="bg-gradient-to-tr from-slate-900 via-amber-950/30 to-slate-900 border border-amber-500/50 p-5 rounded-2xl relative overflow-hidden flex items-center gap-4 shadow-[0_0_25px_rgba(245,158,11,0.2)] md:-translate-y-2 group hover:border-amber-400 transition-all">
        <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-200 flex items-center justify-center text-slate-950 font-black text-2xl shadow-[0_0_20px_rgba(245,158,11,0.6)] shrink-0 animate-pulse">
          👑
        </div>
        <div class="min-w-0 flex-1">
          <span class="text-[10px] font-mono font-black text-amber-400 uppercase tracking-widest flex items-center gap-1">
            <span>🏆 LEAGUE CHAMPION • {{ getTierForElo(topThreePlayers[0].elo).name.toUpperCase() }}</span>
          </span>
          <h3 class="text-lg font-black text-white truncate">{{ topThreePlayers[0].username }}</h3>
          <p class="text-sm font-mono font-black text-amber-300">{{ topThreePlayers[0].elo }} ELO</p>
        </div>
      </div>

      <!-- RANK 3 (BRONZE) -->
      <div v-if="topThreePlayers[2]" class="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl relative overflow-hidden flex items-center gap-4 group hover:border-amber-700/50 transition-all">
        <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-700 to-amber-500 flex items-center justify-center text-slate-950 font-black text-xl shadow-[0_0_15px_rgba(180,83,9,0.3)] shrink-0">
          🥉
        </div>
        <div class="min-w-0 flex-1">
          <span class="text-[10px] font-mono font-black text-amber-600 uppercase tracking-widest">
            RANK #3 • {{ getTierForElo(topThreePlayers[2].elo).name.toUpperCase() }}
          </span>
          <h3 class="text-base font-bold text-white truncate">{{ topThreePlayers[2].username }}</h3>
          <p class="text-xs font-mono font-bold text-amber-400">{{ topThreePlayers[2].elo }} ELO</p>
        </div>
      </div>
    </div>

    <!-- SEARCH & FILTER BAR -->
    <div class="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
      <!-- Search Input -->
      <div class="relative w-full sm:w-80">
        <svg class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Filter player by username..."
          class="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors font-mono"
        />
      </div>

      <!-- ELO Tier Filter Pills -->
      <div class="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
        <button 
          v-for="tier in tierFilters" 
          :key="tier.id"
          @click="selectedTier = tier.id"
          :class="[
            'px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold transition-all shrink-0 cursor-pointer',
            selectedTier === tier.id 
              ? 'bg-red-600 text-white shadow-[0_0_10px_rgba(225,29,72,0.4)]' 
              : 'bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          ]"
        >
          {{ tier.label }}
        </button>
      </div>
    </div>

    <!-- LEADERBOARD TABLE -->
    <div class="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px] tracking-wider">
              <th class="py-3.5 px-4 text-center w-16">Rank</th>
              <th class="py-3.5 px-4">Competitor</th>
              <th class="py-3.5 px-4 text-center">ELO Rating</th>
              <th class="py-3.5 px-4 text-center">Competitive Tier</th>
              <th class="py-3.5 px-4 text-center">Status</th>
              <th class="py-3.5 px-4 text-center">Joined Date</th>
              <th class="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/60">
            <!-- LOADING STATE -->
            <tr v-if="isLoading">
              <td colspan="7" class="py-12 text-center text-slate-500 font-mono">
                <div class="inline-flex items-center gap-2">
                  <svg class="w-5 h-5 animate-spin text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" class="opacity-25"></circle>
                    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" class="opacity-75"></path>
                  </svg>
                  <span>Fetching Top 100 Leaderboard...</span>
                </div>
              </td>
            </tr>

            <!-- EMPTY STATE -->
            <tr v-else-if="filteredPlayers.length === 0">
              <td colspan="7" class="py-12 text-center text-slate-500 font-mono">
                No players match your search filter criteria.
              </td>
            </tr>

            <!-- PLAYER ROWS -->
            <tr 
              v-else
              v-for="(player, index) in filteredPlayers" 
              :key="player.id"
              class="hover:bg-slate-800/40 transition-colors group"
            >
              <!-- RANK POSITION -->
              <td class="py-3.5 px-4 text-center font-mono font-black">
                <span v-if="index === 0" class="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40 text-sm">🥇</span>
                <span v-else-if="index === 1" class="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-400/20 text-slate-300 border border-slate-400/40 text-sm">🥈</span>
                <span v-else-if="index === 2" class="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-amber-800/20 text-amber-600 border border-amber-700/40 text-sm">🥉</span>
                <span v-else class="text-slate-400 text-xs">#{{ index + 1 }}</span>
              </td>

              <!-- COMPETITOR AVATAR & USERNAME -->
              <td class="py-3.5 px-4">
                <div class="flex items-center gap-3">
                  <img 
                    :src="player.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(player.username)}`"
                    :alt="player.username"
                    class="w-8 h-8 rounded-lg border border-slate-700 bg-slate-950 object-cover shrink-0"
                  />
                  <div>
                    <p class="font-bold text-slate-100 group-hover:text-red-400 transition-colors flex items-center gap-1.5">
                      <span>{{ player.username }}</span>
                      <span v-if="player.is_first_play" class="px-1.5 py-0.2 text-[9px] font-mono bg-blue-950 text-blue-400 border border-blue-800 rounded">ROOKIE</span>
                    </p>
                    <p class="text-[10px] font-mono text-slate-500 truncate max-w-[150px]">ID: {{ player.id }}</p>
                  </div>
                </div>
              </td>

              <!-- ELO RATING -->
              <td class="py-3.5 px-4 text-center font-mono font-black text-sm">
                <span class="text-amber-400 flex items-center justify-center gap-1">
                  <span>{{ player.elo }}</span>
                  <span class="text-xs">⭐</span>
                </span>
              </td>

              <!-- COMPETITIVE TIER BADGE -->
              <td class="py-3.5 px-4 text-center">
                <span 
                  class="px-2.5 py-1 rounded-md text-[10px] font-mono font-black uppercase border tracking-wider shadow-xs inline-block"
                  :style="getTierBadgeStyle(player.elo)"
                >
                  {{ getTierForElo(player.elo).name }}
                </span>
              </td>

              <!-- STATUS -->
              <td class="py-3.5 px-4 text-center">
                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Active
                </span>
              </td>

              <!-- JOINED DATE -->
              <td class="py-3.5 px-4 text-center text-slate-400 font-mono text-[11px]">
                {{ formatDate(player.created_at) }}
              </td>

              <!-- ACTIONS -->
              <td class="py-3.5 px-4 text-right">
                <button 
                  @click="inspectPlayer(player)"
                  class="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded text-[11px] font-semibold border border-slate-700 transition-colors cursor-pointer"
                >
                  Inspect
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- STRICT SEASON RESET CONFIRMATION MODAL -->
    <div v-if="isResetModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <!-- Backdrop -->
      <div @click="closeResetModal" class="absolute inset-0 bg-slate-950/80 backdrop-blur-md"></div>

      <!-- Dialog Card -->
      <div class="relative bg-slate-900 border-2 border-red-500/80 rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-[0_0_50px_rgba(225,29,72,0.4)] z-10 space-y-5 animate-in fade-in zoom-in duration-200">
        <!-- Warning Icon & Title -->
        <div class="flex items-center gap-3 text-red-500">
          <div class="w-12 h-12 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-2xl shrink-0 animate-bounce">
            ⚠️
          </div>
          <div>
            <h3 class="text-lg font-black text-white uppercase tracking-wide">
              HAZARD: SEASON RESET
            </h3>
            <p class="text-xs text-red-400 font-mono">Global Database Mutating Action</p>
          </div>
        </div>

        <div class="bg-red-950/40 border border-red-900/60 p-4 rounded-xl text-xs text-slate-300 leading-relaxed space-y-2">
          <p class="font-bold text-red-300">
            You are about to trigger a global season reset for all registered competitors.
          </p>
          <p>
            This action will execute a bulk query resetting <strong class="text-white font-mono">ALL player ELO scores back to 0</strong>. Current leaderboard ranks will be reset.
          </p>
        </div>

        <!-- Strict Confirmation Input -->
        <div class="space-y-2">
          <label class="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
            Type <span class="text-red-400 select-all font-black bg-slate-950 px-1.5 py-0.5 rounded border border-red-800">CONFIRM RESET</span> to confirm:
          </label>
          <input 
            v-model="confirmInput"
            type="text" 
            placeholder="Type CONFIRM RESET here"
            class="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:border-red-500 tracking-wider font-bold"
            @keyup.enter="handleSeasonReset"
          />
        </div>

        <!-- Feedback Alert Message -->
        <div v-if="resetErrorMessage" class="p-3 bg-red-950/80 border border-red-800 text-red-300 text-xs font-mono rounded-lg">
          ⚠️ {{ resetErrorMessage }}
        </div>

        <!-- Modal Actions -->
        <div class="flex items-center gap-3 pt-2">
          <button 
            @click="closeResetModal" 
            :disabled="isResetting"
            class="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          
          <button 
            @click="handleSeasonReset"
            :disabled="confirmInput !== 'CONFIRM RESET' || isResetting"
            :class="[
              'flex-1 py-3 font-black text-xs uppercase tracking-wider rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-2',
              confirmInput === 'CONFIRM RESET' && !isResetting
                ? 'bg-red-600 hover:bg-red-500 text-white border-red-400 shadow-[0_0_20px_rgba(225,29,72,0.6)] animate-pulse'
                : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed opacity-60'
            ]"
          >
            <svg v-if="isResetting" class="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" class="opacity-25"></circle>
              <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" class="opacity-75"></path>
            </svg>
            <span>{{ isResetting ? 'Executing Reset...' : 'CONFIRM RESET' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- PLAYER INSPECT MODAL -->
    <div v-if="selectedPlayer" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div @click="selectedPlayer = null" class="absolute inset-0 bg-slate-950/80 backdrop-blur-md"></div>
      <div class="relative bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl z-10 space-y-4">
        <div class="flex items-center justify-between border-b border-slate-800 pb-4">
          <h3 class="text-base font-bold text-white flex items-center gap-2">
            <span>Player Inspect</span>
          </h3>
          <button @click="selectedPlayer = null" class="text-slate-400 hover:text-white text-lg font-mono">✕</button>
        </div>
        <div class="flex items-center gap-4">
          <img :src="selectedPlayer.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedPlayer.username}`" class="w-14 h-14 rounded-xl border border-amber-500/40 object-cover" />
          <div>
            <h4 class="text-lg font-bold text-white">{{ selectedPlayer.username }}</h4>
            <p class="text-xs font-mono text-amber-400 font-bold">ELO Rating: {{ selectedPlayer.elo }}</p>
            <p class="text-[10px] font-mono text-slate-400 mt-0.5 font-bold" :style="{ color: getTierForElo(selectedPlayer.elo).color }">
              Tier: {{ getTierForElo(selectedPlayer.elo).name }}
            </p>
          </div>
        </div>
        <div class="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs font-mono text-slate-400 space-y-1">
          <p>Player ID: <span class="text-slate-200">{{ selectedPlayer.id }}</span></p>
          <p>Created: <span class="text-slate-200">{{ formatDate(selectedPlayer.created_at) }}</span></p>
        </div>
        <button @click="selectedPlayer = null" class="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 cursor-pointer">Close</button>
      </div>
    </div>

    <!-- SUCCESS TOAST NOTIFICATION -->
    <div v-if="successToast" class="fixed bottom-6 right-6 z-50 bg-emerald-950 border-2 border-emerald-500 text-emerald-200 px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-3 font-mono text-xs animate-in slide-in-from-bottom duration-300">
      <span class="text-xl">✅</span>
      <div>
        <p class="font-bold text-white">Season Reset Successful</p>
        <p class="text-[11px] text-emerald-300 mt-0.5">{{ successToast }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { fetchWithAuth } from '../../services/api'
import { getTierForElo } from '../../utils/ranks'

interface Player {
  id: string
  username: string
  elo: number
  avatar_url?: string
  created_at?: string
  is_first_play?: boolean
}

const players = ref<Player[]>([])
const summary = ref({
  totalPlayers: 0,
  averageElo: 0,
  highestElo: 0,
  currentSeason: 'Season 1 (Active)'
})

const isLoading = ref(false)
const searchQuery = ref('')
const selectedTier = ref('all')

const isResetModalOpen = ref(false)
const confirmInput = ref('')
const isResetting = ref(false)
const resetErrorMessage = ref('')
const successToast = ref('')
const selectedPlayer = ref<Player | null>(null)

const tierFilters = [
  { id: 'all', label: 'All Tiers' },
  { id: 'Bronze', label: 'Bronze (0-100)' },
  { id: 'Silver', label: 'Silver (101-200)' },
  { id: 'Gold', label: 'Gold (201-300)' },
  { id: 'Platinum', label: 'Platinum (301-400)' },
  { id: 'Diamond', label: 'Diamond (401-600)' },
  { id: 'Master', label: 'Master (601-800)' },
  { id: 'Grandmaster', label: 'Grandmaster (801+)' }
]

const topThreePlayers = computed(() => players.value.slice(0, 3))

const filteredPlayers = computed(() => {
  return players.value.filter(player => {
    // Search query matching
    const matchesSearch = !searchQuery.value || player.username.toLowerCase().includes(searchQuery.value.toLowerCase())

    // Official Tier filtering via getTierForElo
    let matchesTier = true
    if (selectedTier.value !== 'all') {
      const tierInfo = getTierForElo(player.elo || 0)
      matchesTier = tierInfo.name === selectedTier.value
    }

    return matchesSearch && matchesTier
  })
})

async function fetchLeaderboard() {
  isLoading.value = true
  try {
    const res = await fetchWithAuth('/api/admin/leaderboard?limit=100')
    if (!res.ok) throw new Error('Failed to fetch leaderboard')
    const json = await res.json()
    if (json.success && json.data) {
      players.value = json.data.players || []
      summary.value = {
        totalPlayers: json.data.totalPlayers || players.value.length,
        averageElo: json.data.averageElo ?? 0,
        highestElo: json.data.highestElo ?? 0,
        currentSeason: json.data.currentSeason || 'Season 1 (Active)'
      }
    }
  } catch (err: any) {
    console.error('fetchLeaderboard error:', err)
  } finally {
    isLoading.value = false
  }
}

function openResetModal() {
  confirmInput.value = ''
  resetErrorMessage.value = ''
  isResetModalOpen.value = true
}

function closeResetModal() {
  if (isResetting.value) return
  isResetModalOpen.value = false
  confirmInput.value = ''
  resetErrorMessage.value = ''
}

async function handleSeasonReset() {
  if (confirmInput.value !== 'CONFIRM RESET' || isResetting.value) return

  isResetting.value = true
  resetErrorMessage.value = ''

  try {
    const res = await fetchWithAuth('/api/admin/season/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirmText: confirmInput.value })
    })

    const json = await res.json()

    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Season reset failed')
    }

    // Success
    closeResetModal()
    successToast.value = json.message || 'Season reset executed successfully!'
    setTimeout(() => { successToast.value = '' }, 5000)

    // Reload Top 100 Leaderboard
    await fetchLeaderboard()
  } catch (err: any) {
    resetErrorMessage.value = err.message || 'An error occurred during season reset.'
  } finally {
    isResetting.value = false
  }
}

function inspectPlayer(player: Player) {
  selectedPlayer.value = player
}

function getTierBadgeStyle(elo: number) {
  const tier = getTierForElo(elo || 0)
  const hexColor = tier.color === '#ffd700' ? '#f59e0b' : tier.color
  return {
    color: hexColor,
    borderColor: `${hexColor}60`,
    backgroundColor: `${hexColor}15`
  }
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return 'N/A'
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return dateStr
  }
}

onMounted(() => {
  fetchLeaderboard()
})
</script>

<template>
  <div class="space-y-6">
    <!-- ANTI-CHEAT RADAR ACCORDION / TOGGLE -->
    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <button
          @click="showAntiCheatRadar = !showAntiCheatRadar"
          class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-red-500/50 text-xs font-mono font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
        >
          <span>🛡️</span>
          <span>{{ showAntiCheatRadar ? 'Hide Anti-Cheat Anomaly Radar' : 'Open Anti-Cheat Anomaly Radar' }}</span>
          <span class="px-1.5 py-0.2 text-[9px] rounded-full bg-red-500/20 text-red-400 border border-red-500/30">LIVE</span>
        </button>
      </div>

      <AntiCheatRadarCard v-if="showAntiCheatRadar" />
    </div>

    <!-- PAGE HEADER -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h2 class="text-2xl font-black text-white tracking-wide flex items-center gap-2.5">
          <span>👥</span>
          <span>Player Management</span>
        </h2>
        <p class="text-xs text-slate-400 mt-1">
          Monitor real-time player sessions, ELO ratings, match records, and moderate account access.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <button 
          @click="fetchPlayers(false)" 
          :disabled="isLoading"
          class="flex items-center gap-2 px-3.5 py-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold font-mono transition-all shadow-sm active:scale-95 disabled:opacity-50"
        >
          <svg class="w-4 h-4 text-red-400" :class="{ 'animate-spin': isLoading }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Refresh Data</span>
        </button>
      </div>
    </div>

    <!-- 4 KPI SUMMARY CARDS -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      <!-- KPI 1: TOTAL PLAYERS -->
      <div class="p-5 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl flex flex-col justify-between shadow-lg">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-slate-400 uppercase tracking-wider font-mono">Total Players</span>
          <div class="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-sm">
            👥
          </div>
        </div>
        <div class="mt-4">
          <span class="text-3xl font-black text-white font-mono tracking-tight">{{ stats.totalPlayers }}</span>
          <p class="text-[11px] text-slate-500 mt-1 font-mono">Registered accounts in DB</p>
        </div>
      </div>

      <!-- KPI 2: ONLINE NOW -->
      <div class="p-5 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl flex flex-col justify-between shadow-lg">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-slate-400 uppercase tracking-wider font-mono">Online Players</span>
          <div class="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-sm">
            🟢
          </div>
        </div>
        <div class="mt-4">
          <span class="text-3xl font-black text-emerald-400 font-mono tracking-tight">{{ stats.onlinePlayers }}</span>
          <p class="text-[11px] text-emerald-500/80 mt-1 font-mono">Active matches & sessions</p>
        </div>
      </div>

      <!-- KPI 3: BANNED / SUSPENDED -->
      <div class="p-5 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl flex flex-col justify-between shadow-lg">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-slate-400 uppercase tracking-wider font-mono">Banned Players</span>
          <div class="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-sm">
            🚫
          </div>
        </div>
        <div class="mt-4">
          <span class="text-3xl font-black text-red-400 font-mono tracking-tight">{{ stats.bannedPlayers }}</span>
          <p class="text-[11px] text-red-500/80 mt-1 font-mono">Suspended for violations</p>
        </div>
      </div>

      <!-- KPI 4: ACTIVE ACCOUNT RATE -->
      <div class="p-5 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl flex flex-col justify-between shadow-lg">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-slate-400 uppercase tracking-wider font-mono">Active Rate</span>
          <div class="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-sm">
            ⚡
          </div>
        </div>
        <div class="mt-4">
          <span class="text-3xl font-black text-amber-400 font-mono tracking-tight">{{ stats.activeRate }}%</span>
          <p class="text-[11px] text-slate-500 mt-1 font-mono">Non-banned account health</p>
        </div>
      </div>
    </div>

    <!-- FILTER & SEARCH CONTROLS -->
    <div class="p-4 bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <!-- Search Input -->
      <div class="relative flex-1 max-w-md">
        <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
        <input 
          v-model="searchQuery" 
          @input="handleSearchDebounced"
          type="text" 
          placeholder="Search by username or email address..." 
          class="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500/70 focus:ring-1 focus:ring-red-500/50 transition-all font-sans"
        />
        <button 
          v-if="searchQuery" 
          @click="clearSearch" 
          class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
        >
          ✕
        </button>
      </div>

      <!-- Filters & Sort -->
      <div class="flex flex-wrap items-center gap-3">
        <!-- Status Tabs -->
        <div class="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          <button 
            v-for="tab in statusTabs" 
            :key="tab.value" 
            @click="setStatusFilter(tab.value)"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            :class="selectedStatus === tab.value 
              ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-sm' 
              : 'text-slate-400 hover:text-slate-200'"
          >
            <span>{{ tab.label }}</span>
            <span v-if="tab.count !== undefined" class="ml-1.5 text-[10px] font-mono opacity-80">({{ tab.count }})</span>
          </button>
        </div>

        <!-- Sort Select -->
        <div class="flex items-center gap-2">
          <select 
            v-model="selectedSort" 
            @change="fetchPlayers(false)"
            class="bg-slate-950/80 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-red-500 font-sans cursor-pointer"
          >
            <option value="created_at_desc">Newest Registered</option>
            <option value="created_at_asc">Oldest Registered</option>
            <option value="elo_desc">Highest ELO</option>
            <option value="elo_asc">Lowest ELO</option>
            <option value="total_matches_desc">Most Matches</option>
            <option value="wins_desc">Most Wins</option>
          </select>
        </div>
      </div>
    </div>

    <!-- TOAST NOTIFICATION -->
    <div 
      v-if="toastMessage" 
      class="p-4 rounded-xl text-xs font-semibold flex items-center justify-between border shadow-lg transition-all animate-fade-in"
      :class="toastType === 'success' 
        ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 shadow-emerald-950/30' 
        : 'bg-red-950/60 border-red-500/40 text-red-300 shadow-red-950/30'"
    >
      <div class="flex items-center gap-2">
        <span>{{ toastType === 'success' ? '✅' : '⚠️' }}</span>
        <span>{{ toastMessage }}</span>
      </div>
      <button @click="toastMessage = ''" class="text-slate-400 hover:text-white">✕</button>
    </div>

    <!-- PLAYERS DATA TABLE -->
    <div class="bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl shadow-xl overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <!-- Table Head -->
          <thead class="bg-slate-950/80 text-slate-400 font-mono uppercase tracking-wider text-[11px] border-b border-slate-800">
            <tr>
              <th scope="col" class="py-3.5 px-4 font-semibold">Player</th>
              <th scope="col" class="py-3.5 px-4 font-semibold hidden md:table-cell">Email</th>
              <th scope="col" class="py-3.5 px-4 font-semibold">Rating / Rank</th>
              <th scope="col" class="py-3.5 px-4 font-semibold hidden sm:table-cell">Record</th>
              <th scope="col" class="py-3.5 px-4 font-semibold">Status</th>
              <th scope="col" class="py-3.5 px-4 font-semibold hidden lg:table-cell">Joined</th>
              <th scope="col" class="py-3.5 px-4 font-semibold text-right">Moderation</th>
            </tr>
          </thead>

          <!-- Table Body -->
          <tbody class="divide-y divide-slate-800/60">
            <!-- Loading State -->
            <tr v-if="isLoading">
              <td colspan="7" class="py-16 text-center text-slate-400">
                <div class="flex flex-col items-center justify-center gap-3">
                  <div class="w-7 h-7 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                  <span class="font-mono text-xs text-slate-400 tracking-wider">Loading player records...</span>
                </div>
              </td>
            </tr>

            <!-- Empty State -->
            <tr v-else-if="players.length === 0">
              <td colspan="7" class="py-16 text-center text-slate-400">
                <div class="flex flex-col items-center justify-center gap-2">
                  <span class="text-3xl">🔍</span>
                  <p class="font-bold text-white text-sm">No players found</p>
                  <p class="text-xs text-slate-500">Try adjusting your search terms or filter options.</p>
                </div>
              </td>
            </tr>

            <!-- Player Rows -->
            <tr 
              v-else 
              v-for="p in players" 
              :key="p.id"
              class="hover:bg-slate-800/40 transition-colors group"
            >
              <!-- Player Column -->
              <td class="py-3 px-4">
                <div class="flex items-center gap-3">
                  <img 
                    :src="p.avatar_url" 
                    :alt="p.username"
                    class="w-9 h-9 rounded-xl bg-slate-950 border border-slate-700/80 object-cover shrink-0 group-hover:scale-105 transition-transform"
                    @error="(e) => (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.username}`"
                  />
                  <div class="min-w-0">
                    <div class="flex items-center gap-1.5">
                      <span class="font-bold text-white truncate max-w-[140px] sm:max-w-[200px]">{{ p.username }}</span>
                      <span v-if="p.is_admin" class="px-1.5 py-0.2 text-[9px] font-mono font-black uppercase rounded bg-red-600 text-white shrink-0 shadow-[0_0_8px_rgba(220,38,38,0.5)]">
                        ADMIN
                      </span>
                    </div>
                    <span class="text-[10px] text-slate-500 font-mono block truncate max-w-[140px]">{{ p.id.slice(0, 8) }}...</span>
                  </div>
                </div>
              </td>

              <!-- Email Column -->
              <td class="py-3 px-4 text-slate-300 font-mono text-[11px] hidden md:table-cell truncate max-w-[180px]">
                {{ p.email || '—' }}
              </td>

              <!-- ELO / Rank Column -->
              <td class="py-3 px-4">
                <div class="flex items-center gap-2">
                  <span class="font-bold font-mono text-orange-400 text-sm">
                    ⭐ {{ p.elo }}
                  </span>
                  <span 
                    class="px-2 py-0.5 text-[10px] font-mono font-semibold rounded-full border"
                    :style="{
                      color: getTierForElo(p.elo).color,
                      borderColor: `${getTierForElo(p.elo).color}40`,
                      backgroundColor: `${getTierForElo(p.elo).color}15`
                    }"
                  >
                    {{ getRankFromElo(p.elo) }}
                  </span>
                </div>
              </td>

              <!-- Record Column -->
              <td class="py-3 px-4 hidden sm:table-cell">
                <div>
                  <div class="flex items-center gap-2 font-mono text-[11px]">
                    <span class="text-emerald-400 font-semibold">{{ p.wins }}W</span>
                    <span class="text-slate-500">/</span>
                    <span class="text-red-400 font-semibold">{{ p.losses }}L</span>
                    <span class="text-slate-400 font-normal">({{ p.total_matches }} matches)</span>
                  </div>
                  <div class="w-24 bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
                    <div 
                      class="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500" 
                      :style="{ width: `${p.win_rate}%` }"
                    ></div>
                  </div>
                </div>
              </td>

              <!-- Status Column -->
              <td class="py-3 px-4">
                <span 
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border"
                  :class="{
                    'bg-emerald-500/10 text-emerald-400 border-emerald-500/30': p.status === 'online',
                    'bg-slate-800 text-slate-400 border-slate-700': p.status === 'offline',
                    'bg-red-500/10 text-red-400 border-red-500/30 animate-pulse': p.status === 'banned'
                  }"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="{
                    'bg-emerald-400': p.status === 'online',
                    'bg-slate-400': p.status === 'offline',
                    'bg-red-400': p.status === 'banned'
                  }"></span>
                  <span>{{ p.status }}</span>
                </span>
              </td>

              <!-- Joined Date Column -->
              <td class="py-3 px-4 text-slate-400 font-mono text-[11px] hidden lg:table-cell">
                {{ formatDate(p.created_at) }}
              </td>

              <!-- Actions Column -->
              <td class="py-3 px-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <!-- Toggle Admin Role Button -->
                  <button 
                    @click="openAdminModal(p)"
                    :disabled="p.id === currentUserId"
                    class="px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 shadow-sm active:scale-95 flex items-center gap-1 border disabled:opacity-30 disabled:cursor-not-allowed"
                    :class="p.is_admin 
                      ? 'bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-white border-amber-500/30 hover:border-amber-400' 
                      : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700/60'"
                    :title="p.id === currentUserId ? 'You cannot change your own admin role' : (p.is_admin ? 'Demote admin to normal user' : 'Promote to administrator')"
                  >
                    <span>{{ p.is_admin ? '👑' : '🛡️' }}</span>
                    <span class="hidden xl:inline">{{ p.is_admin ? 'Demote' : 'Make Admin' }}</span>
                  </button>

                  <!-- Unban Button -->
                  <button 
                    v-if="p.is_banned"
                    @click="openModal('unban', p)"
                    class="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 rounded-lg text-xs font-semibold transition-all duration-200 shadow-sm active:scale-95 flex items-center gap-1"
                    title="Restore player account"
                  >
                    <span>🔓</span>
                    <span>Unban</span>
                  </button>

                  <!-- Ban Button -->
                  <button 
                    v-else
                    @click="openModal('ban', p)"
                    :disabled="p.is_admin"
                    class="px-3 py-1.5 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 rounded-lg text-xs font-semibold transition-all duration-200 shadow-sm active:scale-95 flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-red-600/20 disabled:hover:text-red-400"
                    :title="p.is_admin ? 'Admin accounts cannot be banned' : 'Suspend player account'"
                  >
                    <span>🚫</span>
                    <span>Ban</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- PAGINATION FOOTER -->
      <div class="p-4 bg-slate-950/80 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-400">
        <div>
          Showing 
          <span class="text-white font-bold">{{ players.length > 0 ? (currentPage - 1) * pageLimit + 1 : 0 }}</span> 
          to 
          <span class="text-white font-bold">{{ Math.min(currentPage * pageLimit, totalPlayers) }}</span> 
          of 
          <span class="text-white font-bold">{{ totalPlayers }}</span> players
        </div>

        <div class="flex items-center gap-4">
          <!-- Page Limit Selector -->
          <div class="flex items-center gap-2">
            <span>Per page:</span>
            <select 
              v-model="pageLimit" 
              @change="handleLimitChange" 
              class="bg-slate-900 border border-slate-800 text-white rounded-lg px-2 py-1 focus:outline-none focus:border-red-500 font-mono"
            >
              <option :value="10">10</option>
              <option :value="25">25</option>
              <option :value="50">50</option>
            </select>
          </div>

          <!-- Page Navigation Buttons -->
          <div class="flex items-center gap-1">
            <button 
              @click="changePage(currentPage - 1)" 
              :disabled="currentPage <= 1 || isLoading"
              class="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ◀
            </button>
            <span class="px-3 py-1 font-bold text-white bg-slate-900 border border-slate-800 rounded-lg">
              {{ currentPage }} / {{ totalPages }}
            </span>
            <button 
              @click="changePage(currentPage + 1)" 
              :disabled="currentPage >= totalPages || isLoading"
              class="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ▶
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- BAN / UNBAN CONFIRMATION MODAL -->
    <BanConfirmationModal 
      :is-open="isModalOpen" 
      :mode="modalMode" 
      :player="selectedPlayer"
      @close="isModalOpen = false"
      @confirm="handleModalConfirm"
    />

    <!-- ADMIN ROLE TOGGLE CONFIRMATION MODAL -->
    <AdminToggleModal 
      :is-open="isAdminModalOpen" 
      :player="adminSelectedPlayer"
      @close="isAdminModalOpen = false"
      @confirm="handleAdminToggleConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { fetchWithAuth } from '../../services/api'
import { useAuthStore } from '../../stores/authStore'
import { getTierForElo, getRankFromElo } from '../../utils/ranks'
import BanConfirmationModal from '../../components/admin/BanConfirmationModal.vue'
import AdminToggleModal from '../../components/admin/AdminToggleModal.vue'
import AntiCheatRadarCard from '../../components/admin/AntiCheatRadarCard.vue'

const showAntiCheatRadar = ref(false)

interface PlayerRecord {
  id: string
  username: string
  email: string
  avatar_url: string
  elo: number
  wins: number
  losses: number
  total_matches: number
  win_rate: number
  is_banned: boolean
  banned_at: string | null
  is_admin: boolean
  status: 'online' | 'offline' | 'banned'
  created_at: string
}

interface KPIStats {
  totalPlayers: number
  onlinePlayers: number
  bannedPlayers: number
  activeRate: number
}

const players = ref<PlayerRecord[]>([])
const totalPlayers = ref(0)
const totalPages = ref(1)
const currentPage = ref(1)
const pageLimit = ref(10)
const isLoading = ref(true)

const searchQuery = ref('')
let searchTimeout: any = null
let autoRefreshTimer: any = null

const selectedStatus = ref<'all' | 'online' | 'offline' | 'banned'>('all')
const selectedSort = ref('created_at_desc')

const stats = ref<KPIStats>({
  totalPlayers: 0,
  onlinePlayers: 0,
  bannedPlayers: 0,
  activeRate: 100
})

const statusTabs = computed(() => [
  { label: 'All Players', value: 'all', count: stats.value.totalPlayers },
  { label: 'Online', value: 'online', count: stats.value.onlinePlayers },
  { label: 'Offline', value: 'offline', count: Math.max(0, stats.value.totalPlayers - stats.value.onlinePlayers - stats.value.bannedPlayers) },
  { label: 'Banned', value: 'banned', count: stats.value.bannedPlayers }
])

const authStore = useAuthStore()
const currentUserId = computed(() => authStore.user?.id || '')

const isModalOpen = ref(false)
const modalMode = ref<'ban' | 'unban'>('ban')
const selectedPlayer = ref<PlayerRecord | null>(null)

const isAdminModalOpen = ref(false)
const adminSelectedPlayer = ref<PlayerRecord | null>(null)

function openAdminModal(player: PlayerRecord) {
  adminSelectedPlayer.value = player
  isAdminModalOpen.value = true
}




const toastMessage = ref('')
const toastType = ref<'success' | 'error'>('success')

function showToast(msg: string, type: 'success' | 'error' = 'success') {
  toastMessage.value = msg
  toastType.value = type
  setTimeout(() => {
    toastMessage.value = ''
  }, 4000)
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

// Explicit map to avoid fragile string-split parsing (e.g. 'created_at_desc'.split('_') gives wrong results)
const SORT_MAP: Record<string, { sortBy: string; sortOrder: string }> = {
  'created_at_desc': { sortBy: 'created_at', sortOrder: 'desc' },
  'created_at_asc':  { sortBy: 'created_at', sortOrder: 'asc' },
  'elo_desc':        { sortBy: 'elo', sortOrder: 'desc' },
  'elo_asc':         { sortBy: 'elo', sortOrder: 'asc' },
  'total_matches_desc': { sortBy: 'total_matches', sortOrder: 'desc' },
  'total_matches_asc':  { sortBy: 'total_matches', sortOrder: 'asc' },
  'wins_desc':       { sortBy: 'wins', sortOrder: 'desc' },
  'wins_asc':        { sortBy: 'wins', sortOrder: 'asc' },
}

async function fetchPlayers(isBackground = false) {
  if (!isBackground) isLoading.value = true
  try {
    const sort = SORT_MAP[selectedSort.value] ?? SORT_MAP['created_at_desc']
    const params = new URLSearchParams({
      page: String(currentPage.value),
      limit: String(pageLimit.value),
      search: searchQuery.value.trim(),
      status: selectedStatus.value,
      sortBy: sort.sortBy,
      sortOrder: sort.sortOrder
    })

    const res = await fetchWithAuth(`/api/admin/players?${params.toString()}`)
    const json = await res.json()

    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to load player list')

    if (json.data) {
      players.value = json.data.players || []
      totalPlayers.value = json.data.total || 0
      totalPages.value = json.data.totalPages || 1
      if (json.data.stats) stats.value = json.data.stats
    }
  } catch (err: any) {
    if (!isBackground) {
      console.error('fetchPlayers error:', err)
      showToast(err.message || 'Failed to fetch players', 'error')
    }
  } finally {
    if (!isBackground) isLoading.value = false
  }
}

/** Reset to page 1 and refresh the player list. Used by filters, search clear, and limit change. */
function resetAndFetch() {
  currentPage.value = 1
  fetchPlayers()
}

function handleSearchDebounced() {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(resetAndFetch, 350)
}

function clearSearch() {
  searchQuery.value = ''
  resetAndFetch()
}

function setStatusFilter(status: any) {
  selectedStatus.value = status
  resetAndFetch()
}

function handleLimitChange() {
  resetAndFetch()
}

function changePage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    fetchPlayers()
  }
}

function openModal(mode: 'ban' | 'unban', player: PlayerRecord) {
  modalMode.value = mode
  selectedPlayer.value = player
  isModalOpen.value = true
}

/**
 * Generic handler for any admin action that calls an API endpoint and refreshes the list.
 * Used by both the ban/unban modal and the admin toggle modal.
 */
async function performPlayerAction(
  url: string,
  method: string,
  body: Record<string, any>,
  onSuccess: () => void
) {
  try {
    const res = await fetchWithAuth(url, { method, body: JSON.stringify(body) })
    const data = await res.json()
    if (!res.ok || !data.success) throw new Error(data.message || 'Action failed')
    onSuccess()
    showToast(data.message || 'Action completed successfully', 'success')
    await fetchPlayers()
  } catch (err: any) {
    console.error('Player action error:', err)
    showToast(err.message || 'Action failed. Please try again.', 'error')
  }
}

async function handleModalConfirm({ id, mode, reason }: { id: string; mode: 'ban' | 'unban'; reason?: string }) {
  const endpoint = mode === 'ban' ? `/api/admin/players/${id}/ban` : `/api/admin/players/${id}/unban`
  await performPlayerAction(endpoint, 'POST', { reason }, () => { isModalOpen.value = false })
}

async function handleAdminToggleConfirm({ id, is_admin }: { id: string; is_admin: boolean }) {
  await performPlayerAction(
    `/api/admin/players/${id}/admin`,
    'PATCH',
    { is_admin },
    () => { isAdminModalOpen.value = false }
  )
}

onMounted(() => {
  fetchPlayers()
  autoRefreshTimer = setInterval(() => {
    // Periodic background presence refresh
    fetchPlayers(true)
  }, 6000)
})

onUnmounted(() => {
  if (autoRefreshTimer) clearInterval(autoRefreshTimer)
  if (searchTimeout) clearTimeout(searchTimeout)
})
</script>

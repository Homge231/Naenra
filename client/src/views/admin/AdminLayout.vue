<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col lg:flex-row overflow-x-hidden">
    <!-- MOBILE OVERLAY BACKDROP -->
    <div 
      v-if="isMobileMenuOpen" 
      @click="isMobileMenuOpen = false"
      class="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-40 lg:hidden transition-opacity"
    ></div>

    <!-- SIDEBAR NAVIGATION -->
    <aside 
      :class="[
        'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900/90 backdrop-blur-xl border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-300 ease-in-out',
        isMobileMenuOpen ? 'translate-x-0 shadow-2xl shadow-red-950/40' : '-translate-x-full lg:translate-x-0'
      ]"
    >
      <!-- BRAND HEADER -->
      <div>
        <div class="p-6 border-b border-slate-800/80 flex items-center justify-between">
          <router-link to="/admin/dashboard" class="flex items-center gap-3 group">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 flex items-center justify-center shadow-[0_0_15px_rgba(225,29,72,0.4)] group-hover:scale-105 transition-transform">
              <span class="text-white font-black text-xl tracking-tighter">N</span>
            </div>
            <div>
              <h1 class="text-lg font-bold tracking-wider text-white group-hover:text-red-400 transition-colors">
                NAENRA<span class="text-red-500 text-xs font-mono ml-1 px-1.5 py-0.5 rounded bg-red-950/60 border border-red-800/50">HQ</span>
              </h1>
              <p class="text-[10px] uppercase font-mono text-slate-400 tracking-widest">Admin Command Core</p>
            </div>
          </router-link>

          <!-- MOBILE CLOSE BUTTON -->
          <button 
            @click="isMobileMenuOpen = false" 
            class="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- NAVIGATION MODULES -->
        <nav class="p-4 space-y-1.5">
          <div class="px-3 py-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
            System Modules
          </div>

          <router-link 
            v-for="item in navItems" 
            :key="item.path" 
            :to="item.path"
            @click="isMobileMenuOpen = false"
            v-slot="{ isActive }"
          >
            <div 
              :class="[
                'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative',
                isActive 
                  ? 'bg-gradient-to-r from-red-600/20 to-rose-600/10 text-white border border-red-500/40 shadow-[0_0_12px_rgba(225,29,72,0.15)] font-semibold' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              ]"
            >
              <span :class="[isActive ? 'text-red-400 scale-110' : 'text-slate-400 group-hover:text-slate-300', 'transition-transform text-lg']">
                {{ item.icon }}
              </span>
              <span class="flex-1 tracking-wide">{{ item.name }}</span>
              <span 
                v-if="item.badge" 
                class="px-2 py-0.5 text-[10px] font-mono font-bold rounded-full bg-red-500/20 text-red-400 border border-red-500/30"
              >
                {{ item.badge }}
              </span>
              <!-- Active Left Pill -->
              <span v-if="isActive" class="absolute left-0 top-2 bottom-2 w-1 bg-red-500 rounded-r-full shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
            </div>
          </router-link>
        </nav>
      </div>

      <!-- SIDEBAR FOOTER / SYSTEM INFO -->
      <div class="p-4 border-t border-slate-800/80">
        <div class="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60 flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <span class="relative flex h-2.5 w-2.5">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <div>
              <p class="text-xs font-medium text-slate-300 font-mono">v2.4-STABLE</p>
              <p class="text-[10px] text-slate-500">Core Engine Online</p>
            </div>
          </div>
          <router-link to="/home" class="p-2 text-slate-400 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors" title="Return to Main Game">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </router-link>
        </div>
      </div>
    </aside>

    <!-- MAIN CONTENT WRAPPER -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- TOP HEADER NAVBAR -->
      <header class="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/80 px-4 lg:px-8 py-3.5 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <!-- MOBILE HAMBURGER TOGGLE -->
          <button 
            @click="isMobileMenuOpen = !isMobileMenuOpen" 
            class="lg:hidden p-2 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700/50 transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <!-- BREADCRUMB / ROUTE TITLE -->
          <div>
            <div class="flex items-center gap-2 text-xs text-slate-400 font-mono">
              <span>ADMIN HQ</span>
              <span>/</span>
              <span class="text-red-400 font-semibold uppercase">{{ currentRouteName }}</span>
            </div>
            <h2 class="text-lg font-bold text-white tracking-wide hidden sm:block">
              {{ currentRouteTitle }}
            </h2>
          </div>
        </div>

        <!-- RIGHT HEADER ACTIONS & PROFILE -->
        <div class="flex items-center gap-4">
          <!-- RETURN TO GAME BUTTON -->
          <router-link 
            to="/home" 
            class="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-semibold border border-slate-700/50 transition-all hover:border-red-500/50"
          >
            <svg class="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            <span>Exit to Game</span>
          </router-link>

          <!-- ADMIN USER PROFILE BADGE -->
          <div class="flex items-center gap-3 pl-3 border-l border-slate-800">
            <div class="relative">
              <img 
                :src="adminUser.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'" 
                alt="Admin Avatar"
                class="w-9 h-9 rounded-xl border border-red-500/40 object-cover shadow-[0_0_10px_rgba(225,29,72,0.2)]"
              />
              <span class="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-red-600 rounded-full border-2 border-slate-900 flex items-center justify-center">
                <span class="w-1.5 h-1.5 bg-white rounded-full"></span>
              </span>
            </div>
            <div class="hidden md:block">
              <div class="flex items-center gap-1.5">
                <span class="text-sm font-bold text-white tracking-wide">{{ adminUser.username || 'System Admin' }}</span>
                <span class="px-1.5 py-0.2 text-[9px] font-mono font-black uppercase rounded bg-red-600 text-white shadow-[0_0_8px_rgba(220,38,38,0.5)]">
                  ADMIN
                </span>
              </div>
              <p class="text-[11px] text-slate-400 truncate max-w-[140px]">{{ adminUser.email || 'admin@naenra.xyz' }}</p>
            </div>
          </div>
        </div>
      </header>

      <!-- ROUTER VIEW CONTENT CONTAINER -->
      <main class="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-[1920px] mx-auto">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'

const route = useRoute()
const authStore = useAuthStore()

const isMobileMenuOpen = ref(false)

const adminUser = computed(() => {
  return authStore.user || {
    username: 'System Admin',
    email: 'admin@naenra.xyz',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'
  }
})

const navItems = [
  { name: 'Overview', path: '/admin/dashboard', icon: '📊' },
  { name: 'Questions Bank', path: '/admin/questions', icon: '❓' },
  { name: 'Players Manager', path: '/admin/players', icon: '👥' },
  { name: 'Leaderboards', path: '/admin/leaderboard', icon: '🏆' },
  { name: 'Matches History', path: '/admin/matches', icon: '⚔️' },
  { name: 'Support Cores', path: '/admin/cores', icon: '⚡' },
  { name: 'AI Core Assistant', path: '/admin/ai', icon: '🤖' }
]

const currentRouteName = computed(() => {
  const name = route.name?.toString() || ''
  return name.replace('admin-', '') || 'OVERVIEW'
})

const currentRouteTitle = computed(() => {
  const match = navItems.find(item => item.path === route.path)
  return match ? match.name : 'Admin Command Overview'
})

onMounted(async () => {
  if (!authStore.user) {
    await authStore.fetchUser()
  }
})
</script>

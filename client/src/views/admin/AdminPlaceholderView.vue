<template>
  <div class="p-8 bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl text-center space-y-6 max-w-2xl mx-auto my-12">
    <div class="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-3xl mx-auto shadow-[0_0_20px_rgba(225,29,72,0.2)]">
      🛠️
    </div>

    <div>
      <span class="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/30">
        MODULE READY
      </span>
      <h2 class="text-2xl font-bold text-white tracking-wide mt-3 uppercase font-mono">
        {{ moduleTitle }}
      </h2>
      <p class="text-sm text-slate-400 mt-2">
        This administrative module is registered in the Admin Command Core. Full management capabilities for {{ moduleTitle.toLowerCase() }} will be enabled in upcoming telemetry updates.
      </p>
    </div>

    <div class="pt-4 border-t border-slate-800 flex justify-center gap-4">
      <router-link 
        to="/admin/questions" 
        class="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-semibold transition-all shadow-[0_0_15px_rgba(220,38,38,0.4)]"
      >
        Go to Question Bank
      </router-link>
      <router-link 
        to="/admin/dashboard" 
        class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm font-semibold border border-slate-700 transition-colors"
      >
        Back to Overview
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const moduleTitle = computed(() => {
  const path = route.path
  if (path.includes('players')) return 'Players Manager'
  if (path.includes('leaderboard')) return 'Leaderboards'
  if (path.includes('matches')) return 'Matches Telemetry'
  if (path.includes('cores')) return 'Support Cores System'
  if (path.includes('ai')) return 'AI Core Assistant'
  return 'Admin Module'
})
</script>

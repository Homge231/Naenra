<template>
  <div class="app-wrapper relative">
    <RouterView />
    <ErrorNotification />
    <MissionToastOverlay />
    
    <!-- Global Settings Modal -->
    <GlobalSettingsOverlay />

    <!-- Floating Global Settings Button -->
    <button 
      v-if="showSettingsButton"
      @click="settingsStore.isSettingsOpen = true"
      class="hidden md:flex fixed bottom-6 right-6 z-[9990] w-12 h-12 bg-slate-900/80 backdrop-blur-md border border-white/20 rounded-full items-center justify-center text-gray-300 hover:text-white hover:bg-slate-800 hover:scale-110 transition-all shadow-xl focus:outline-none"
      title="Global Settings"
    >
      <svg class="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import ErrorNotification from './components/ErrorNotification.vue'
import GlobalSettingsOverlay from './components/GlobalSettingsOverlay.vue'
import MissionToastOverlay from './components/MissionToastOverlay.vue'
import { useSettingsStore } from './stores/settingsStore'
import { useAuthStore } from './stores/authStore'

const route = useRoute()
const settingsStore = useSettingsStore()
const authStore = useAuthStore()

const showSettingsButton = computed(() => {
  const hasToken = !!localStorage.getItem('arena_token')
  return (authStore.isLoggedIn || hasToken) && route.meta.requiresAuth === true
})

// Auto-close settings modal when navigating to a view where setting is not allowed
watch(showSettingsButton, (newVal) => {
  if (!newVal) {
    settingsStore.isSettingsOpen = false
  }
})
</script>


<style scoped>
</style>
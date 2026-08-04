<template>
  <div class="fixed top-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none max-w-sm w-full px-4">
    <transition-group name="toast-pop">
      <div 
        v-for="toast in missionsStore.activeToasts" 
        :key="toast.id"
        class="pointer-events-auto flex items-center justify-between gap-3.5 p-4 rounded-2xl bg-slate-950/95 border-2 shadow-[0_12px_35px_rgba(0,0,0,0.6)] text-white backdrop-blur-xl transition-all duration-300 relative overflow-hidden"
        :class="toast.type === 'unlocked' ? 'border-green-500 shadow-green-500/20' : 'border-orange shadow-orange/30'"
      >
        <!-- Top Accent Light -->
        <div 
          class="absolute top-0 left-0 right-0 h-1"
          :class="toast.type === 'unlocked' ? 'bg-gradient-to-r from-emerald-400 via-green-500 to-teal-400' : 'bg-gradient-to-r from-orange via-hexred to-yellow-400'"
        ></div>

        <div class="flex items-center gap-3">
          <div 
            class="w-11 h-11 rounded-xl flex items-center justify-center text-2xl shrink-0 border"
            :class="toast.type === 'unlocked' ? 'bg-green-950/80 border-green-500/60 text-green-300' : 'bg-orange/20 border-orange/60 text-orange-400'"
          >
            {{ toast.icon }}
          </div>

          <div class="flex flex-col">
            <div class="flex items-center gap-1.5">
              <span 
                class="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                :class="toast.type === 'unlocked' ? 'bg-green-900/90 text-green-200' : 'bg-orange/20 text-orange-300'"
              >
                {{ toast.title }}
              </span>
            </div>
            <p class="text-xs font-bold text-gray-200 leading-snug mt-1">
              {{ toast.message }}
            </p>
          </div>
        </div>

        <button 
          @click="missionsStore.dismissToast(toast.id)"
          class="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10 shrink-0 cursor-pointer font-black text-xs"
        >
          ✕
        </button>
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { useMissionsStore } from '../stores/missionsStore'

const missionsStore = useMissionsStore()
</script>

<style scoped>
.toast-pop-enter-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.toast-pop-leave-active {
  transition: all 0.3s ease-in;
}
.toast-pop-enter-from {
  opacity: 0;
  transform: translateX(100px) scale(0.9);
}
.toast-pop-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}
</style>

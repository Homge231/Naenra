<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <!-- Backdrop Blur -->
    <div class="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity" @click="close"></div>

    <!-- Modal Container -->
    <div 
      class="relative w-full max-w-lg bg-slate-900/95 border rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8 z-10 transition-all duration-300 scale-100"
      :class="isBanMode ? 'border-red-500/40 shadow-[0_0_50px_rgba(225,29,72,0.2)]' : 'border-emerald-500/40 shadow-[0_0_50px_rgba(16,185,129,0.2)]'"
    >
      <!-- Close Button -->
      <button 
        @click="close"
        class="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <!-- Modal Header -->
      <div class="flex items-start gap-4 mb-6">
        <div 
          class="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
          :class="isBanMode ? 'bg-red-500/10 border border-red-500/30 text-red-400' : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'"
        >
          <span>{{ isBanMode ? '🚫' : '🔓' }}</span>
        </div>
        <div>
          <h3 class="text-xl font-bold text-white tracking-wide">
            {{ isBanMode ? 'Suspend Player Account' : 'Restore Player Account' }}
          </h3>
          <p class="text-xs text-slate-400 mt-1 leading-relaxed">
            {{ isBanMode 
              ? 'Suspending this player will instantly terminate their active sessions, abort ongoing matches, and prevent future logins.' 
              : 'Restoring this player will re-enable their account access and allow them to log in again.' 
            }}
          </p>
        </div>
      </div>

      <!-- Player Preview Card -->
      <div class="p-4 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between gap-3 mb-6">
        <div class="flex items-center gap-3 min-w-0">
          <img 
            :src="player?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Player'" 
            :alt="player?.username" 
            class="w-11 h-11 rounded-xl bg-slate-900 border border-slate-700 object-cover shrink-0"
          />
          <div class="min-w-0">
            <div class="flex items-center gap-1.5">
              <span class="text-sm font-bold text-white truncate">{{ player?.username }}</span>
              <span v-if="player?.is_admin" class="px-1.5 py-0.2 text-[9px] font-mono font-black uppercase rounded bg-red-600 text-white">
                ADMIN
              </span>
            </div>
            <p class="text-xs text-slate-400 truncate">{{ player?.email }}</p>
          </div>
        </div>
        <div class="text-right shrink-0">
          <span class="text-xs font-bold text-orange-400 bg-orange-950/40 border border-orange-800/40 px-2 py-0.5 rounded-full font-mono">
            ⭐ {{ player?.elo ?? 0 }} ELO
          </span>
          <p class="text-[10px] text-slate-500 mt-1 font-mono">{{ player?.total_matches || 0 }} matches</p>
        </div>
      </div>

      <!-- Reason Note Input (Ban mode only) -->
      <div v-if="isBanMode" class="mb-6">
        <label class="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-2">
          Suspension Reason / Internal Notes (Optional)
        </label>
        <textarea 
          v-model="banReason"
          placeholder="e.g. Using automated typing scripts, toxic behavior, ELO boosting..."
          rows="3"
          class="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500/70 focus:ring-1 focus:ring-red-500/50 transition-all resize-none font-sans"
        ></textarea>
      </div>

      <!-- Error banner if any -->
      <div v-if="errorMessage" class="mb-4 p-3 bg-red-950/50 border border-red-500/40 rounded-xl text-xs text-red-300 flex items-center gap-2">
        <span>⚠️</span>
        <span>{{ errorMessage }}</span>
      </div>

      <!-- Modal Actions -->
      <div class="flex items-center justify-end gap-3 pt-2">
        <button 
          type="button" 
          @click="close"
          class="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition-colors"
          :disabled="isSubmitting"
        >
          Cancel
        </button>
        <button 
          type="button" 
          @click="handleConfirm"
          :disabled="isSubmitting"
          class="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          :class="isBanMode 
            ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-red-950/50 hover:shadow-red-900/60 hover:scale-[1.02]' 
            : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-950/50 hover:shadow-emerald-900/60 hover:scale-[1.02]'"
        >
          <span v-if="isSubmitting" class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          <span>{{ isSubmitting ? 'Processing...' : (isBanMode ? 'Confirm Ban' : 'Confirm Unban') }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  isOpen: boolean
  mode: 'ban' | 'unban'
  player: any | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'confirm', payload: { id: string; mode: 'ban' | 'unban'; reason?: string }): void
}>()

const banReason = ref('')
const isSubmitting = ref(false)
const errorMessage = ref('')

const isBanMode = computed(() => props.mode === 'ban')

function close() {
  banReason.value = ''
  errorMessage.value = ''
  isSubmitting.value = false
  emit('close')
}

async function handleConfirm() {
  if (!props.player?.id) return
  isSubmitting.value = true
  errorMessage.value = ''
  try {
    emit('confirm', {
      id: props.player.id,
      mode: props.mode,
      reason: banReason.value.trim()
    })
  } catch (err: any) {
    errorMessage.value = err.message || 'Action failed. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

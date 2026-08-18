<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <!-- Backdrop Blur -->
    <div class="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity" @click="close"></div>

    <!-- Modal Container -->
    <div 
      class="relative w-full max-w-lg bg-slate-900/95 border rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8 z-10 transition-all duration-300 scale-100"
      :class="willMakeAdmin ? 'border-amber-500/40 shadow-[0_0_50px_rgba(245,158,11,0.2)]' : 'border-sky-500/40 shadow-[0_0_50px_rgba(14,165,233,0.2)]'"
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
          :class="willMakeAdmin ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400' : 'bg-sky-500/10 border border-sky-500/30 text-sky-400'"
        >
          <span>{{ willMakeAdmin ? '👑' : '👤' }}</span>
        </div>
        <div>
          <h3 class="text-xl font-bold text-white tracking-wide">
            {{ willMakeAdmin ? 'Promote to Administrator' : 'Demote to Normal User' }}
          </h3>
          <p class="text-xs text-slate-400 mt-1 leading-relaxed">
            {{ willMakeAdmin 
              ? 'Granting administrator privileges gives this player full access to manage questions, moderate players, view metrics, and adjust system configurations.' 
              : 'Revoking administrator privileges will return this account to standard player access and remove administrative dashboard routes.' 
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
                CURRENT ADMIN
              </span>
              <span v-else class="px-1.5 py-0.2 text-[9px] font-mono font-medium uppercase rounded bg-slate-800 text-slate-400 border border-slate-700">
                USER
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

      <!-- Change Summary Banner -->
      <div 
        class="p-3.5 rounded-xl border text-xs mb-6 flex items-center gap-3"
        :class="willMakeAdmin ? 'bg-amber-950/20 border-amber-500/30 text-amber-300' : 'bg-sky-950/20 border-sky-500/30 text-sky-300'"
      >
        <span class="text-base">{{ willMakeAdmin ? '⚡' : '🔄' }}</span>
        <span>
          New Status: <strong>{{ willMakeAdmin ? 'Administrator (is_admin = TRUE)' : 'Standard User (is_admin = FALSE)' }}</strong>
        </span>
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
          :class="willMakeAdmin 
            ? 'bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white shadow-amber-950/50 hover:shadow-amber-900/60 hover:scale-[1.02]' 
            : 'bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 text-white shadow-sky-950/50 hover:shadow-sky-900/60 hover:scale-[1.02]'"
        >
          <span v-if="isSubmitting" class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          <span>{{ isSubmitting ? 'Updating...' : (willMakeAdmin ? 'Confirm Make Admin' : 'Confirm Demote User') }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  isOpen: boolean
  player: any | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'confirm', payload: { id: string; is_admin: boolean }): void
}>()

const isSubmitting = ref(false)
const errorMessage = ref('')

const willMakeAdmin = computed(() => !props.player?.is_admin)

function close() {
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
      is_admin: willMakeAdmin.value
    })
  } catch (err: any) {
    errorMessage.value = err.message || 'Action failed. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}
</script>
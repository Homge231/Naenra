<template>
  <div class="fixed top-4 right-4 z-50 space-y-3 pointer-events-none">
    <div
      v-for="error in errors"
      :key="error.id"
      class="pointer-events-auto flex items-start gap-3 min-w-80 max-w-md p-4 rounded-lg shadow-lg backdrop-blur-sm border"
      :class="errorClasses(error.type)"
      role="alert"
    >
      <div class="flex-shrink-0 mt-0.5">
        <component :is="errorIcon(error.type)" class="w-5 h-5" />
      </div>
      <div class="flex-1 min-w-0">
        <p class="font-semibold text-sm">{{ error.message }}</p>
        <p v-if="error.description" class="text-xs opacity-75 mt-1 break-words">
          {{ error.description }}
        </p>
        <div v-if="error.action" class="mt-2 flex gap-2">
          <button
            @click="error.action.callback"
            class="text-xs font-medium underline hover:no-underline"
          >
            {{ error.action.label }}
          </button>
        </div>
      </div>
      <button
        @click="removeError(error.id)"
        class="flex-shrink-0 text-lg leading-none opacity-50 hover:opacity-100"
      >
        ✕
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useErrorStore } from '../stores/errorStore'
import { computed } from 'vue'

const errorStore = useErrorStore()

const errors = computed(() => errorStore.errors)

function removeError(id: string) {
  errorStore.removeError(id)
}

function errorClasses(type: string) {
  const baseClasses = 'border'
  const typeClasses: Record<string, string> = {
    error: 'bg-red-900/20 text-red-200 border-red-500/50',
    warning: 'bg-yellow-900/20 text-yellow-200 border-yellow-500/50',
    info: 'bg-blue-900/20 text-blue-200 border-blue-500/50',
    success: 'bg-green-900/20 text-green-200 border-green-500/50'
  }
  return `${baseClasses} ${typeClasses[type] || typeClasses.error}`
}

function errorIcon(type: string) {

  return defineAsyncComponent(() =>
    import(`../components/icons/Icon${type.charAt(0).toUpperCase() + type.slice(1)}.vue`).catch(() =>
      import('../components/icons/IconError.vue')
    )
  )
}

import { defineAsyncComponent } from 'vue'
</script>

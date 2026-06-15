<template>
  <div class="min-h-screen flex items-center justify-center bg-darkNavy text-white p-4">
    <div class="text-center max-w-md">
      <div class="text-6xl font-bold text-red-500 mb-4">⚠️</div>
      <h1 class="text-4xl font-bold mb-2">Oops!</h1>
      <p class="text-gray-300 mb-6">
        {{ message }}
      </p>
      <p v-if="details" class="text-gray-500 text-sm mb-8 bg-black/50 p-4 rounded-lg break-words">
        {{ details }}
      </p>
      <div class="space-y-3">
        <button
          @click="goHome"
          class="w-full bg-gradient-to-r from-orange to-hexred text-white font-bold py-3 px-4 rounded-lg hover:shadow-lg transition-all"
        >
          Go Home
        </button>
        <button
          @click="reloadPage"
          class="w-full bg-white/10 border border-white/20 text-white font-bold py-3 px-4 rounded-lg hover:bg-white/20 transition-all"
        >
          Reload Page
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useErrorStore } from '../stores/errorStore'

const router = useRouter()
const errorStore = useErrorStore()

defineProps({
  message: {
    type: String,
    default: 'Something went wrong. Please try again.'
  },
  details: {
    type: String,
    default: ''
  }
})

function goHome() {
  errorStore.clearErrors()
  router.push('/')
}

function reloadPage() {
  window.location.reload()
}
</script>

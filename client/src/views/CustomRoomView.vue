<template>
  <div class="h-screen w-full bg-darkNavy text-white relative flex flex-col items-center justify-center font-sans overflow-hidden">
    <!-- Background grid for eSports theme -->
    <div class="absolute inset-0 cyber-grid opacity-30 pointer-events-none z-0"></div>

    <!-- US-40: Room ID Display (Top-Right, Glassmorphism) -->
    <div class="absolute top-8 right-8 z-50 flex flex-col items-end gap-1.5">
      <p class="text-[10px] text-gray-400 font-bold tracking-[0.2em] uppercase">Room Code</p>
      
      <!-- Glassmorphism Container -->
      <div class="flex items-center gap-4 bg-white/5 backdrop-blur-md border border-white/10 px-5 py-2.5 rounded-lg shadow-2xl group hover:bg-white/10 transition-all duration-300">
        <span class="text-2xl font-mono font-black text-white tracking-widest drop-shadow-md">
          {{ roomId }}
        </span>

        <button
          @click="copyRoomId"
          class="relative text-gray-400 hover:text-orange transition-colors focus:outline-none p-1"
          :title="copied ? 'Copied!' : 'Copy to clipboard'"
        >
          <!-- Copy Icon -->
          <svg v-if="!copied" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
          </svg>
          
          <!-- Check/Success Icon -->
          <svg v-else class="w-6 h-6 text-success drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
          </svg>

          <!-- Tooltip toast -->
          <span v-if="copied" class="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-bold text-success uppercase tracking-widest whitespace-nowrap animate-fade-up">
            Copied!
          </span>
        </button>
      </div>
    </div>

    <!-- Center Content -->
    <main class="relative z-20 text-center">
      <h1 class="text-5xl font-black italic tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-orange to-hexred mb-4 drop-shadow-lg">
        Custom Room
      </h1>
      <p class="text-gray-400 tracking-widest uppercase text-sm mb-12 animate-pulse">Waiting for opponent...</p>

      <button @click="router.push('/home')" class="px-8 py-3 bg-white/5 hover:bg-hexred/20 border border-white/10 hover:border-hexred/50 text-gray-400 hover:text-hexred font-bold text-sm tracking-widest uppercase transition-colors rounded-lg">
        Abandon Room
      </button>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Mock Room ID (Later this will be generated or fetched from your server)
const roomId = ref('NRA-8X2Q')
const copied = ref(false)

// US-40: Copy clipboard implementation
const copyRoomId = async () => {
  try {
    // Native JS navigator.clipboard
    await navigator.clipboard.writeText(roomId.value)
    
    // Trigger success state for UI feedback
    copied.value = true
    
    // Reset the checkmark icon back to copy icon after 2 seconds
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy room ID: ', err)
  }
}
</script>

<style scoped>
.cyber-grid {
  background-image: linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
  background-size: 64px 64px;
}

.text-success {
  color: #22c55e;
}

.animate-fade-up {
  animation: fadeUp 0.3s ease-out forwards;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translate(-50%, 5px); }
  to { opacity: 1; transform: translate(-50%, 0); }
}
</style>
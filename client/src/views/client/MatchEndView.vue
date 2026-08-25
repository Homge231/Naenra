<template>
  <div class="min-h-screen w-full bg-[#fff8f5] text-gray-800 relative font-sans flex flex-col items-center justify-center px-4 overflow-hidden">
    <!-- Ambient blobs -->
    <div class="fixed inset-0 pointer-events-none z-0">
      <div class="absolute top-[-10%] left-[-5%] w-[50vw] h-[50vw] bg-orange-300/30 rounded-full blur-[100px] animate-pulse"></div>
      <div class="absolute bottom-[-10%] right-[-5%] w-[45vw] h-[45vw] bg-red-300/20 rounded-full blur-[100px] animate-pulse" style="animation-delay:1s"></div>
      <div class="absolute top-[30%] left-[60%] w-[30vw] h-[30vw] bg-rose-200/30 rounded-full blur-[80px] animate-pulse" style="animation-delay:2s"></div>
    </div>

    <div class="relative z-10 w-full max-w-md">
      <!-- Header -->
      <div class="text-center mb-8">
        <div class="text-7xl mb-4 drop-shadow-lg">🏁</div>
        <h1 class="text-4xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500 drop-shadow-sm">
          Game Over
        </h1>
        <p class="text-xs text-gray-400 font-bold tracking-[0.3em] uppercase mt-1">Solo Match Result</p>
      </div>

      <!-- Score Card -->
      <div class="bg-white/85 backdrop-blur-xl rounded-3xl border-2 border-white p-6 shadow-[0_10px_40px_rgba(0,0,0,0.06)] mb-4">
        <p class="text-[10px] text-gray-400 font-black tracking-[0.3em] uppercase text-center mb-2">Final Score</p>
        <div class="text-center mb-1">
          <span class="text-7xl font-black text-orange-500 tabular-nums drop-shadow-sm">{{ displayScore }}</span>
          <span class="text-2xl font-black text-orange-400 ml-2">pts</span>
        </div>

        <!-- Stats row -->
        <div class="flex justify-center gap-4 mt-5 pt-4 border-t border-gray-100">
          <div class="text-center flex-1">
            <p class="text-3xl font-black text-green-500">{{ correct }}</p>
            <p class="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">✅ Correct</p>
          </div>
          <div class="w-px bg-gray-100"></div>
          <div class="text-center flex-1">
            <p class="text-3xl font-black text-red-400">{{ wrong }}</p>
            <p class="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">❌ Wrong</p>
          </div>
          <div class="w-px bg-gray-100"></div>
          <div class="text-center flex-1">
            <p class="text-3xl font-black text-orange-400">{{ accuracy }}%</p>
            <p class="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">🎯 Accuracy</p>
          </div>
        </div>
      </div>

      <!-- Grade Card -->
      <div
        class="bg-white/70 backdrop-blur-md rounded-2xl border border-white p-4 shadow-sm mb-4 flex items-center gap-4"
        :class="gradeStyle"
      >
        <span class="text-4xl">{{ gradeEmoji }}</span>
        <div>
          <p class="font-black text-lg uppercase tracking-wider">{{ gradeLabel }}</p>
          <p class="text-xs text-gray-500 font-medium">{{ gradeMessage }}</p>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col gap-3 mt-2">
        <button
          @click="playAgain"
          class="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-lg active:scale-95 transition-all cursor-pointer"
        >
          🎮 Play Again
        </button>
        <button
          @click="goHome"
          class="w-full py-3.5 bg-white border-2 border-gray-200 hover:border-orange-300 text-gray-600 hover:text-orange-500 font-black text-xs uppercase tracking-widest rounded-2xl transition-all cursor-pointer"
        >
          ← Back to Home
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const finalScore = ref(0)
const correct = ref(0)
const wrong = ref(0)
const displayScore = ref(0)

onMounted(() => {
  // Read from query params first, then localStorage fallback
  finalScore.value = parseInt(String(route.query.score ?? localStorage.getItem('naenra_last_score') ?? '0'))
  correct.value   = parseInt(String(route.query.correct ?? localStorage.getItem('naenra_last_correct') ?? '0'))
  wrong.value     = parseInt(String(route.query.wrong ?? localStorage.getItem('naenra_last_wrong') ?? '0'))

  // Animate score counting up from 0
  const target = finalScore.value
  if (target <= 0) { displayScore.value = 0; return }
  const duration = 1200 // ms
  const step = target / (duration / 16)
  const interval = setInterval(() => {
    displayScore.value = Math.min(Math.round(displayScore.value + step), target)
    if (displayScore.value >= target) clearInterval(interval)
  }, 16)
})

const accuracy = computed(() => {
  const total = correct.value + wrong.value
  if (total === 0) return 0
  return Math.round((correct.value / total) * 100)
})

const gradeEmoji = computed(() => {
  const acc = accuracy.value
  if (acc >= 90) return '🏆'
  if (acc >= 75) return '⭐'
  if (acc >= 50) return '👍'
  return '💪'
})

const gradeLabel = computed(() => {
  const acc = accuracy.value
  if (acc >= 90) return 'Excellent!'
  if (acc >= 75) return 'Great Job!'
  if (acc >= 50) return 'Keep Going!'
  return 'Try Harder!'
})

const gradeMessage = computed(() => {
  const acc = accuracy.value
  if (acc >= 90) return 'Outstanding accuracy. You\'re a vocabulary master!'
  if (acc >= 75) return 'Solid performance! A few more rounds and you\'ll be unstoppable.'
  if (acc >= 50) return 'Decent effort. Practice makes perfect!'
  return 'Don\'t give up! Every attempt makes you stronger.'
})

const gradeStyle = computed(() => {
  const acc = accuracy.value
  if (acc >= 90) return 'border-yellow-200 bg-yellow-50/70'
  if (acc >= 75) return 'border-green-200 bg-green-50/70'
  if (acc >= 50) return 'border-blue-200 bg-blue-50/70'
  return 'border-orange-200 bg-orange-50/70'
})

function playAgain() { router.push('/core') }
function goHome()    { router.push('/home') }
</script>

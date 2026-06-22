<template>
  <div 
    class="relative w-full h-screen bg-cover bg-center font-sans overflow-hidden flex flex-col"
    :style="{ backgroundImage: `url(${bgUrl})` }"
  >
    <div class="absolute inset-0 bg-darkNavy/80 z-0 backdrop-blur-sm"></div>

    <div class="relative z-10 flex flex-col h-full">
      <header class="flex justify-between items-center p-8 w-full">
        <div class="text-3xl font-black text-white flex items-center gap-3">
          <span class="text-gray-400 uppercase tracking-widest text-sm">Score</span>
          <span 
            class="text-orange transition-transform inline-block"
            :class="{ 'animate-pop': isScorePopping }"
          >
            {{ totalScore }}
          </span>
        </div>

        <div 
          class="text-5xl font-mono font-black tracking-widest"
          :class="timeLeft <= 10 ? 'text-hexred animate-pulse' : 'text-white'"
        >
          {{ formattedTime }}
        </div>
        
        <div class="w-24"></div>
      </header>

      <main class="flex-1 flex flex-col items-center justify-center px-8">
        <h2 class="text-4xl text-white font-medium text-center max-w-4xl leading-relaxed mb-16 drop-shadow-md">
          {{ currentQuestionText }}
        </h2>

        <input 
          ref="hiddenInput"
          v-model="userInput"
          :disabled="isInputDisabled"
          @input="checkAnswer"
          type="text" 
          class="opacity-0 absolute -z-10"
          autocomplete="off"
          autofocus
        />

        <div class="flex gap-4 cursor-pointer" @click="focusInput">
          <div 
            v-for="(char, index) in targetWord" 
            :key="index"
            class="w-14 h-16 border-b-4 flex items-center justify-center text-4xl font-black uppercase transition-colors"
            :class="[
              userInput[index] 
                ? 'border-orange text-orange' 
                : 'border-white/30 text-transparent',
              isInputDisabled ? 'border-gray-600' : ''
            ]"
          >
            {{ userInput[index] || '_' }}
          </div>
        </div>
      </main>
    </div>

    <div class="absolute bottom-8 left-8 z-20">
      <img 
        :src="avatarUrl" 
        alt="Player Avatar" 
        referrerpolicy="no-referrer"
        class="w-20 h-20 rounded-full border-4 border-lightBlue shadow-[0_0_15px_rgba(69,243,255,0.4)] object-cover bg-darkNavy"
      />
      <p class="text-white text-xs font-bold text-center mt-2 tracking-widest uppercase">Player</p>
    </div>

    <div v-if="isTimeOut" class="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
      <div class="bg-darkNavy border-2 border-hexred p-12 text-center transform scale-110 shadow-[0_0_30px_rgba(230,57,70,0.3)]">
        <h2 class="text-7xl font-black italic text-hexred tracking-tighter uppercase mb-4 drop-shadow-[0_0_15px_rgba(230,57,70,0.8)]">
          Time Out
        </h2>
        <p class="text-gray-300 font-bold tracking-[0.3em] mb-8 uppercase text-sm">
          Final Score: <span class="text-orange text-2xl">{{ totalScore }}</span>
        </p>
        <button @click="backToHome" class="px-8 py-4 bg-hexred text-white font-bold tracking-widest hover:bg-red-700 transition-colors">
          RETURN TO LOBBY
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const SERVER_URL = 'http://localhost:3000'

const bgUrl = ref('https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2000&auto=format&fit=crop')
const avatarUrl = ref(localStorage.getItem('user_avatar') || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix')

const timeLeft = ref<number>(45)
const isTimeOut = ref<boolean>(false)
const isInputDisabled = ref<boolean>(false)
let timerInterval: any = null

const hiddenInput = ref<HTMLInputElement | null>(null)
const userInput = ref<string>('')
const totalScore = ref<number>(0)
const isScorePopping = ref<boolean>(false)

const questions = ref([
  { text: "What is the term for a software defect?", word: "BUG" },
  { text: "Which programming language is known for 'Write Once, Run Anywhere'?", word: "JAVA" },
  { text: "What does HTML stand for? HyperText Markup ...", word: "LANGUAGE" },
])
const currentIndex = ref(0)

const currentQuestionText = computed(() => questions.value[currentIndex.value]?.text || 'Loading...')
const targetWord = computed(() => questions.value[currentIndex.value]?.word || '')

const formattedTime = computed(() => {
  const m = Math.floor(timeLeft.value / 60)
  const s = timeLeft.value % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
})

const handleTimeOut = async () => {
  clearInterval(timerInterval)
  isTimeOut.value = true
  isInputDisabled.value = true
  
  try {
    const token = localStorage.getItem('arena_token')
    await axios.post(`${SERVER_URL}/api/match/timeout`, {
      finalScore: totalScore.value
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
  } catch (error) {
    console.error(error)
  }
}

const checkAnswer = async () => {
  if (isTimeOut.value) return
  
  if (userInput.value.length > targetWord.value.length) {
    userInput.value = userInput.value.slice(0, targetWord.value.length)
  }

  if (userInput.value.toUpperCase() === targetWord.value.toUpperCase()) {
    totalScore.value += 10
    triggerScoreAnimation()

    userInput.value = ''

    currentIndex.value++

    if (questions.value.length - currentIndex.value <= 3) {
      await fetchMoreQuestions()
    }
  }
}

const triggerScoreAnimation = () => {
  isScorePopping.value = true
  setTimeout(() => {
    isScorePopping.value = false
  }, 300)
}

const fetchMoreQuestions = async () => {
  try {
    const mockBatch = [
      { text: "Version control system created by Linus Torvalds.", word: "GIT" },
      { text: "CSS property to make an element transparent.", word: "OPACITY" },
      { text: "A popular frontend framework by Facebook.", word: "REACT" }
    ]
    questions.value.push(...mockBatch)
  } catch (e) {
    console.error(e)
  }
}

const focusInput = () => {
  hiddenInput.value?.focus()
}

const backToHome = () => {
  router.push('/home')
}

onMounted(() => {
  nextTick(() => focusInput())
  
  timerInterval = setInterval(() => {
    if (timeLeft.value > 0) timeLeft.value--
    else handleTimeOut()
  }, 1000)
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})
</script>

<style scoped>
@keyframes pop-scale {
  0% { transform: scale(1); color: #FFA500; }
  50% { transform: scale(1.6); color: #E63946; text-shadow: 0 0 15px #E63946; }
  100% { transform: scale(1); color: #FFA500; }
}

.animate-pop {
  animation: pop-scale 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
}
</style>
<template>
  <div class="h-screen w-full bg-darkNavy text-white overflow-hidden relative font-sans flex flex-col select-none">

    <!-- Ambient blobs (consistent with HomeView) -->
    <div class="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-blue rounded-full mix-blend-screen filter blur-[200px] opacity-10 pointer-events-none z-0"></div>
    <div class="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-orange rounded-full mix-blend-screen filter blur-[200px] opacity-10 pointer-events-none z-0"></div>
    <div class="absolute inset-0 cyber-grid opacity-40 pointer-events-none z-0"></div>

    <!-- ── Header ── -->
    <header class="relative z-20 flex justify-between items-center px-8 lg:px-12 py-5 border-b border-white/5">
      <div class="flex items-center gap-3">
        <svg class="w-8 h-8 text-orange fill-current" viewBox="0 0 24 24">
          <path d="M7 3 L7 21 L12 21 L12 9 L17 21 L17 3 L12 3 L12 15 L7 3 Z" />
        </svg>
        <span class="text-xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-orange to-hexred uppercase">NAENRA</span>
      </div>

      <!-- Match meta -->
      <div class="flex items-center gap-6">
        <!-- Round counter -->
        <div class="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-1.5 -skew-x-6">
          <span class="text-[10px] font-bold text-lightBlue tracking-[0.2em] uppercase skew-x-6">Round</span>
          <span class="text-lg font-black text-white skew-x-6">{{ round }}/{{ totalRounds }}</span>
        </div>
        <!-- Timer -->
        <div class="flex items-center gap-2" :class="timeLeft <= 5 ? 'text-hexred' : 'text-lightOrange'">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span class="font-mono font-black text-2xl tabular-nums">{{ String(timeLeft).padStart(2, '0') }}</span>
        </div>
        <!-- Score -->
        <div class="text-right hidden md:block">
          <p class="text-[10px] text-gray-500 uppercase tracking-widest">Score</p>
          <p class="font-black text-lg text-white">{{ score }}</p>
        </div>
      </div>
    </header>

    <!-- ── Main: two-section layout ── -->
    <main class="relative z-20 flex-1 flex flex-col px-6 lg:px-16 py-8 gap-8 max-w-4xl mx-auto w-full">

      <!-- ── SECTION 1: Question Text (Top) ── -->
      <section class="flex-1 flex flex-col justify-center">
        <p class="text-[10px] font-bold text-lightBlue tracking-[0.3em] uppercase mb-4 flex items-center gap-2">
          <span class="inline-block w-4 h-px bg-lightBlue"></span>
          Context
        </p>

        <div
          class="relative border border-white/10 bg-white/[0.03] p-8 lg:p-10"
          :class="{ 'border-orange/40': state === 'playing' }"
        >
          <!-- Corner accent -->
          <span class="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-orange"></span>
          <span class="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-orange"></span>

          <!-- Skeleton while loading -->
          <div v-if="state === 'loading'" class="space-y-3 animate-pulse">
            <div class="h-5 bg-white/10 rounded w-full"></div>
            <div class="h-5 bg-white/10 rounded w-5/6"></div>
            <div class="h-5 bg-white/10 rounded w-3/4"></div>
          </div>

          <p v-else class="text-2xl lg:text-3xl font-medium leading-relaxed text-gray-200 tracking-wide">
            {{ currentQuestion.question_text }}
          </p>
        </div>
      </section>

      <!-- Divider -->
      <div class="flex items-center gap-4">
        <div class="flex-1 h-px bg-white/10"></div>
        <span class="text-[10px] font-bold text-gray-600 tracking-[0.3em] uppercase">Your Answer</span>
        <div class="flex-1 h-px bg-white/10"></div>
      </div>

      <!-- ── SECTION 2: Answer Slots (Bottom) ── -->
      <section class="flex flex-col items-center gap-6 pb-4">

        <!-- Blank slots — one per character of target_word -->
        <div class="flex items-end justify-center gap-2 flex-wrap">
          <template v-if="state === 'loading'">
            <div
              v-for="i in 8"
              :key="i"
              class="w-10 h-14 border-b-2 border-white/20 animate-pulse bg-white/5"
            ></div>
          </template>

          <template v-else>
            <div
              v-for="(char, idx) in currentQuestion.target_word.split('')"
              :key="idx"
              class="slot flex flex-col items-center gap-1"
            >
              <!-- Character cell -->
              <div
                class="relative w-10 h-14 flex items-end justify-center pb-1 transition-all duration-150"
                :class="{
                  'slot--filled':  typedLetters[idx] !== undefined,
                  'slot--active':  idx === typedLetters.length && state === 'playing',
                  'slot--correct': state === 'correct',
                  'slot--wrong':   state === 'wrong',
                }"
              >
                <!-- Typed letter -->
                <span
                  class="text-2xl font-black uppercase tracking-widest transition-all duration-100"
                  :class="{
                    'text-white':   typedLetters[idx] !== undefined && state === 'playing',
                    'text-success': state === 'correct',
                    'text-hexred':  state === 'wrong',
                    'opacity-0':    typedLetters[idx] === undefined,
                    'opacity-100':  typedLetters[idx] !== undefined,
                  }"
                >
                  {{ typedLetters[idx] ?? '_' }}
                </span>
                <!-- Bottom border / underline -->
                <span
                  class="absolute bottom-0 left-0 w-full h-0.5 transition-colors duration-150"
                  :class="{
                    'bg-orange':   idx === typedLetters.length && state === 'playing',
                    'bg-white/20': idx !== typedLetters.length || state !== 'playing',
                    'bg-success':  state === 'correct',
                    'bg-hexred':   state === 'wrong',
                  }"
                ></span>
                <!-- Active cursor blink -->
                <span
                  v-if="idx === typedLetters.length && state === 'playing'"
                  class="absolute bottom-1 left-1/2 -translate-x-1/2 w-0.5 h-5 bg-orange animate-pulse"
                ></span>
              </div>
              <!-- Char index hint (small, subtle) -->
              <span class="text-[9px] text-white/20 font-mono">{{ idx + 1 }}</span>
            </div>
          </template>
        </div>

        <!-- Feedback banner -->
        <transition name="fade">
          <div
            v-if="state === 'correct' || state === 'wrong'"
            class="flex items-center gap-3 px-6 py-3 border font-bold text-sm tracking-widest uppercase transition-all"
            :class="{
              'border-success/40 bg-success/10 text-success': state === 'correct',
              'border-hexred/40 bg-hexred/10 text-hexred':   state === 'wrong',
            }"
          >
            <span v-if="state === 'correct'">✓ Correct! +{{ pointsEarned }} pts</span>
            <span v-else>✕ The word was: <span class="uppercase">{{ currentQuestion.target_word }}</span></span>
          </div>
        </transition>

        <!-- Hint: character count label -->
        <p v-if="state === 'playing'" class="text-[11px] text-gray-600 tracking-widest">
          {{ currentQuestion.target_word.length }} letters — type to fill the blank
        </p>
      </section>
    </main>

    <!-- ── Bottom accent bar ── -->
    <div class="relative z-20 h-1.5 w-full flex">
      <!-- Progress fill based on time -->
      <div
        class="h-full transition-all duration-1000 ease-linear"
        :class="timeLeft <= 5 ? 'bg-hexred' : 'bg-gradient-to-r from-orange to-hexred'"
        :style="{ width: `${(timeLeft / roundDuration) * 100}%` }"
      ></div>
      <div class="flex-1 h-full bg-white/5"></div>
    </div>

    <!-- Hidden keyboard trap -->
    <input
      ref="inputRef"
      class="sr-only"
      type="text"
      autocomplete="off"
      autocorrect="off"
      autocapitalize="off"
      spellcheck="false"
      @keydown="handleKeydown"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'

// ── Types ──────────────────────────────────────────────────────────────────
interface QuestionPayload {
  question_text: string
  target_word: string
}

// ── Constants ──────────────────────────────────────────────────────────────
const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'
const totalRounds  = 5
const roundDuration = 20 // seconds per round

// ── State ──────────────────────────────────────────────────────────────────
type GameState = 'loading' | 'playing' | 'correct' | 'wrong'

const state        = ref<GameState>('loading')
const round        = ref(1)
const score        = ref(0)
const timeLeft     = ref(roundDuration)
const pointsEarned = ref(0)
const typedLetters = ref<string[]>([])
const inputRef     = ref<HTMLInputElement | null>(null)

const currentQuestion = ref<QuestionPayload>({
  question_text: '',
  target_word: '',
})

// ── Timer ──────────────────────────────────────────────────────────────────
let timerInterval: ReturnType<typeof setInterval> | null = null

function startTimer() {
  clearTimer()
  timerInterval = setInterval(() => {
    if (timeLeft.value <= 1) {
      clearTimer()
      revealWrong()
    } else {
      timeLeft.value--
    }
  }, 1000)
}

function clearTimer() {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

// ── API ────────────────────────────────────────────────────────────────────
/**
 * US-06 [BE] — expects { question_text: string, target_word: string }
 */
async function fetchQuestion(): Promise<QuestionPayload> {
  try {
    const token = localStorage.getItem('arena_token')
    const res = await fetch(`${SERVER_URL}/api/game/question`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    })
    if (!res.ok) throw new Error('Failed to fetch question')
    const data: QuestionPayload = await res.json()
    return data
  } catch {
    // Fallback mock so the UI is always usable during development
    const mocks: QuestionPayload[] = [
      { question_text: 'The scientist made a remarkable ________ that changed medicine forever.', target_word: 'discovery' },
      { question_text: 'She spoke with great ________ when addressing the crowd at the stadium.', target_word: 'confidence' },
      { question_text: 'His ability to ________ complex data in seconds impressed the entire team.', target_word: 'analyze' },
      { question_text: 'The committee reached a unanimous ________ after hours of debate.', target_word: 'decision' },
      { question_text: 'The old map revealed a hidden ________ deep inside the mountain range.', target_word: 'treasure' },
    ]
    return mocks[Math.floor(Math.random() * mocks.length)]
  }
}

// ── Game flow ──────────────────────────────────────────────────────────────
async function loadRound() {
  state.value     = 'loading'
  typedLetters.value = []
  timeLeft.value  = roundDuration

  currentQuestion.value = await fetchQuestion()

  state.value = 'playing'
  startTimer()

  await nextTick()
  inputRef.value?.focus()
}

function handleKeydown(e: KeyboardEvent) {
  if (state.value !== 'playing') return

  if (e.key === 'Backspace') {
    typedLetters.value = typedLetters.value.slice(0, -1)
    return
  }

  // Only accept single printable characters
  if (e.key.length !== 1 || e.ctrlKey || e.metaKey || e.altKey) return

  const maxLen = currentQuestion.value.target_word.length
  if (typedLetters.value.length >= maxLen) return

  const letter = e.key.toLowerCase()
  typedLetters.value = [...typedLetters.value, letter]

  // Auto-submit when all slots are filled
  if (typedLetters.value.length === maxLen) {
    checkAnswer()
  }
}

function checkAnswer() {
  clearTimer()
  const typed = typedLetters.value.join('')
  if (typed === currentQuestion.value.target_word) {
    // Points scale with time remaining
    pointsEarned.value = 100 + timeLeft.value * 5
    score.value += pointsEarned.value
    state.value = 'correct'
  } else {
    state.value = 'wrong'
  }

  setTimeout(advanceRound, 1800)
}

function revealWrong() {
  typedLetters.value = currentQuestion.value.target_word.split('')
  state.value = 'wrong'
  setTimeout(advanceRound, 1800)
}

function advanceRound() {
  if (round.value >= totalRounds) {
    // TODO: navigate to /end with final score
    // router.push({ name: 'end', query: { score: score.value } })
    return
  }
  round.value++
  loadRound()
}

// ── Refocus on any click ───────────────────────────────────────────────────
function refocusInput() {
  inputRef.value?.focus()
}

// ── Lifecycle ──────────────────────────────────────────────────────────────
onMounted(() => {
  loadRound()
  window.addEventListener('click', refocusInput)
})

onUnmounted(() => {
  clearTimer()
  window.removeEventListener('click', refocusInput)
})
</script>

<style scoped>
.cyber-grid {
  background-image:
    linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
  background-size: 64px 64px;
}

/* Slot states */
.slot--active  { transform: translateY(-2px); }
.slot--correct { animation: pop 0.25s ease; }
.slot--wrong   { animation: shake 0.35s ease; }

@keyframes pop {
  0%   { transform: scale(1); }
  50%  { transform: scale(1.15); }
  100% { transform: scale(1); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25%       { transform: translateX(-4px); }
  75%       { transform: translateX(4px); }
}

/* Feedback banner */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s, transform 0.2s; }
.fade-enter-from, .fade-leave-to       { opacity: 0; transform: translateY(6px); }

/* Hide from visual flow but keep accessibsle/focusable */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0; 
  overflow: hidden;
  clip: rect(0,0,0,0);
  white-space: nowrap;
  border: 0;
}
</style>
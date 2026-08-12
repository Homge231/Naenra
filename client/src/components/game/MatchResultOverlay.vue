<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useSettingsStore } from '../../stores/settingsStore'
import { useAuthStore } from '../../stores/authStore'
import { useRouter } from 'vue-router'
import { currentRoom } from '../../services/multiplayerService'

const router = useRouter()
const authStore = useAuthStore()

const isCustomRoom = computed(() => {
  return currentRoom?.state?.isCustom === true
})

const props = defineProps<{
  isVisible: boolean
  isVictory: boolean
  // Player data
  playerScore: number
  playerName: string
  playerAvatar: string
  questionsAnswered: number
  matchHistory: Array<{ round: number; submitted: string; correct: string; isCorrect: boolean }>
  matchDurationMs: number
  // Opponent/Comparison data  
  opponentScore: number
  opponentName: string
  opponentAvatar?: string
  // Mode
  isMultiplayer: boolean
  // Elo data
  eloChange?: number
  newElo?: number
  oldElo?: number
  oldTier?: any
  currentTier?: any
}>()

const emit = defineEmits<{
  (e: 'playAgain'): void
  (e: 'goHome'): void
  (e: 'showFeedback'): void
}>()

const settingsStore = useSettingsStore()

const animatedPlayerScore = ref(0)
const animatedOpponentScore = ref(0)
const animatedElo = ref(1000)
const animatedRankProgress = ref(0)

const correctCount = computed(() => props.matchHistory.filter(h => h.isCorrect).length)
const totalCount = computed(() => props.matchHistory.length)
const accuracy = computed(() => totalCount.value > 0 ? ((correctCount.value / totalCount.value) * 100).toFixed(1) : '0.0')

const showRankUp = ref(false)

// WPM: (total chars of correct answers / 5) / (match duration in minutes)
const avgWpm = computed(() => {
  if (totalCount.value === 0) return 0
  const totalCorrectChars = props.matchHistory
    .filter(h => h.isCorrect)
    .reduce((sum, h) => sum + h.submitted.length, 0)
  const durationMinutes = (props.matchDurationMs || 180000) / 60000
  if (durationMinutes <= 0) return 0
  return Math.round((totalCorrectChars / 5) / durationMinutes)
})

// Effective ELO resolution (never default to 0!)
const effectiveNewElo = computed(() => {
  if (props.newElo && props.newElo > 0) return props.newElo
  if (authStore.profile?.elo && authStore.profile.elo > 0) return authStore.profile.elo
  return 1000
})

const effectiveOldElo = computed(() => {
  if (props.oldElo && props.oldElo > 0) return props.oldElo
  const change = props.eloChange ?? 0
  return Math.max(0, effectiveNewElo.value - change)
})

const activeTier = computed(() => {
  if (props.currentTier && props.currentTier.min !== undefined && props.currentTier.max !== undefined) {
    return props.currentTier
  }
  const elo = effectiveNewElo.value
  if (elo < 1500) return { name: 'BRONZE', min: 0, max: 1499, color: '#cd7f32' }
  if (elo < 3000) return { name: 'SILVER', min: 1500, max: 2999, color: '#c0c0c0' }
  if (elo < 4500) return { name: 'GOLD', min: 3000, max: 4499, color: '#ffd700' }
  if (elo < 6000) return { name: 'PLATINUM', min: 4500, max: 5999, color: '#00f2fe' }
  if (elo < 7500) return { name: 'DIAMOND', min: 6000, max: 7499, color: '#a855f7' }
  return { name: 'MASTER', min: 7500, max: 999999, color: '#ff4b4b' }
})

function calculateProgressPercentage(eloValue: number, tier: any) {
  if (!tier || tier.max === undefined || tier.min === undefined) return 50
  const min = tier.min
  const max = tier.max === 999999 ? min + 1000 : tier.max
  const range = Math.max(1, max - min)
  const prog = (eloValue - min) / range
  return Math.min(Math.max(prog * 100, 0), 100)
}

let scoreAnimationFrame: number
let progressAnimationFrame: number
let hasAnimatedRank = false

function animateScore(start: number, end: number, targetRef: any, duration: number = 1500) {
  let startTimestamp: number | null = null
  const step = (timestamp: number) => {
    if (!startTimestamp) startTimestamp = timestamp
    const progress = Math.min((timestamp - startTimestamp) / duration, 1)
    const easeOutCubic = 1 - Math.pow(1 - progress, 3)
    targetRef.value = Math.floor(start + easeOutCubic * (end - start))
    if (progress < 1) {
      scoreAnimationFrame = window.requestAnimationFrame(step)
    } else {
      targetRef.value = end
    }
  }
  scoreAnimationFrame = window.requestAnimationFrame(step)
}

function animateRankProgress(startProg: number, endProg: number, startElo: number, endElo: number, duration: number = 1800) {
  if (progressAnimationFrame) window.cancelAnimationFrame(progressAnimationFrame)
  let startTimestamp: number | null = null
  const step = (timestamp: number) => {
    if (!startTimestamp) startTimestamp = timestamp
    const progress = Math.min((timestamp - startTimestamp) / duration, 1)
    const easeOutCubic = 1 - Math.pow(1 - progress, 3)
    
    animatedRankProgress.value = startProg + easeOutCubic * (endProg - startProg)
    animatedElo.value = Math.floor(startElo + easeOutCubic * (endElo - startElo))

    if (progress < 1) {
      progressAnimationFrame = window.requestAnimationFrame(step)
    } else {
      animatedRankProgress.value = endProg
      animatedElo.value = endElo
    }
  }
  progressAnimationFrame = window.requestAnimationFrame(step)
}

function runRankAnimation() {
  const startEloVal = effectiveOldElo.value
  const endEloVal = effectiveNewElo.value

  const startProg = calculateProgressPercentage(startEloVal, activeTier.value)
  const endProg = calculateProgressPercentage(endEloVal, activeTier.value)

  animatedElo.value = startEloVal
  animatedRankProgress.value = startProg

  if (props.oldTier && props.currentTier && props.oldTier.name !== props.currentTier.name && (props.newElo ?? 0) > (props.oldElo ?? 0)) {
    setTimeout(() => {
      showRankUp.value = true
    }, 1500)
  }

  setTimeout(() => {
    animateRankProgress(startProg, endProg, startEloVal, endEloVal, 1800)
  }, 300)
}

// Watch both visibility and ELO changes so animation triggers when API response returns!
watch(
  [() => props.isVisible, () => props.newElo, () => props.eloChange],
  ([visible, newElo, eloChange]) => {
    if (visible) {
      animatedPlayerScore.value = 0
      animatedOpponentScore.value = 0

      setTimeout(() => {
        animateScore(0, props.playerScore, animatedPlayerScore, 1500)
        animateScore(0, props.opponentScore, animatedOpponentScore, 1500)
      }, 300)

      runRankAnimation()
    } else {
      showRankUp.value = false
      hasAnimatedRank = false
      if (scoreAnimationFrame) window.cancelAnimationFrame(scoreAnimationFrame)
      if (progressAnimationFrame) window.cancelAnimationFrame(progressAnimationFrame)
    }
  },
  { immediate: true }
)

// Confetti setup for Victory
const confettiPieces = Array.from({ length: 25 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  animationDelay: Math.random() * 3,
  animationDuration: 3 + Math.random() * 2,
  color: ['#FFD700', '#FFA500', '#FF8C00', '#F0E68C', '#FFF8DC'][Math.floor(Math.random() * 5)],
  width: 5 + Math.random() * 10,
  height: 5 + Math.random() * 10,
  isCircle: Math.random() > 0.5
}))
</script>

<template>
  <transition name="result-overlay">
    <div v-if="isVisible" 
         class="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 backdrop-blur-xl transition-all duration-700"
         :class="{'vignette-defeat': !isVictory && settingsStore.vfxEnabled}">
      
      <!-- Confetti Layer -->
      <div v-if="isVictory && settingsStore.vfxEnabled" class="fixed inset-0 overflow-hidden pointer-events-none">
        <div v-for="piece in confettiPieces" :key="piece.id" class="absolute top-[-100px] confetti-piece"
             :style="{ 
               left: piece.left + '%', 
               animationDelay: piece.animationDelay + 's', 
               animationDuration: piece.animationDuration + 's',
               backgroundColor: piece.color,
               width: piece.width + 'px',
               height: piece.height + 'px',
               borderRadius: piece.isCircle ? '50%' : '0'
             }">
        </div>
      </div>
      
      <!-- Main Panel -->
      <div class="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-darkNavy/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-4 md:p-8 cyber-grid flex flex-col items-center result-panel custom-scrollbar"
           :class="[
             isVictory && settingsStore.vfxEnabled ? 'border-yellow-500/30 shadow-[0_0_40px_rgba(255,215,0,0.15)]' : '',
             !isVictory && settingsStore.vfxEnabled ? 'border-red-500/30 shadow-[0_0_30px_rgba(220,38,38,0.1)]' : ''
           ]">
           
        <!-- Header -->
        <div class="text-center mb-6 md:mb-10 flex flex-col items-center">
          <div class="text-4xl md:text-6xl mb-1 md:mb-2">{{ isVictory ? '🏆' : '💀' }}</div>
          <h1 class="text-5xl md:text-7xl font-black italic tracking-widest uppercase text-transparent bg-clip-text"
              :class="[
                isVictory ? 'bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500' : 'bg-gradient-to-r from-red-400 via-red-600 to-red-800',
                settingsStore.vfxEnabled && isVictory ? 'drop-shadow-[0_0_40px_rgba(255,215,0,0.6)]' : '',
                settingsStore.vfxEnabled && !isVictory ? 'drop-shadow-[0_0_30px_rgba(220,38,38,0.5)]' : ''
              ]">
            {{ isVictory ? 'VICTORY!' : 'DEFEAT' }}
          </h1>
        </div>

        <!-- Score Comparison -->
        <div class="flex w-full justify-between items-center mb-6 md:mb-10 gap-2 md:gap-4">
          <!-- Player Score Panel -->
          <div class="flex-1 flex flex-col items-center p-3 md:p-6 rounded-xl border border-white/5 bg-black/40"
               :class="[isVictory && settingsStore.vfxEnabled ? 'border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : '']">
            <img v-if="playerAvatar" :src="playerAvatar" class="w-16 h-16 rounded-full mb-3 border-2 border-white/20" alt="Player Avatar" />
            <div class="text-[10px] tracking-widest uppercase text-white/50 mb-1">{{ playerName }}</div>
            <div class="text-5xl font-black" :class="isVictory ? 'text-green-400' : 'text-white'">
              {{ animatedPlayerScore }}
            </div>
          </div>

          <div class="text-xl md:text-3xl font-black text-white/20 px-2 md:px-4 italic">VS</div>

          <!-- Opponent Score Panel -->
          <div class="flex-1 flex flex-col items-center p-3 md:p-6 rounded-xl border border-white/5 bg-black/40"
               :class="[!isVictory && settingsStore.vfxEnabled ? 'border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : '']">
            <template v-if="opponentAvatar">
              <img :src="opponentAvatar" class="w-16 h-16 rounded-full mb-3 border-2 border-white/20" alt="Opponent Avatar" />
            </template>
            <template v-else>
              <div class="w-16 h-16 rounded-full mb-3 border-2 border-white/20 bg-white/5 flex items-center justify-center text-3xl">🎯</div>
            </template>
            <div class="text-[10px] tracking-widest uppercase text-white/50 mb-1">{{ opponentName }}</div>
            <div class="text-5xl font-black" :class="!isVictory ? 'text-green-400' : 'text-white'">
              {{ animatedOpponentScore }}
            </div>
          </div>
        </div>

        <!-- Stats Breakdown Grid -->
        <div class="w-full grid grid-cols-3 gap-2 md:gap-4 mb-6 md:mb-10">
          <div class="stat-row bg-white/5 border border-white/10 rounded-lg p-2 md:p-4 flex flex-col items-center" style="animation-delay: 0.1s">
            <span class="text-[9px] md:text-[10px] tracking-widest uppercase text-white/50 mb-1">Avg WPM</span>
            <span class="text-xl md:text-3xl font-black text-orange">{{ avgWpm }}</span>
          </div>
          <div class="stat-row bg-white/5 border border-white/10 rounded-lg p-2 md:p-4 flex flex-col items-center" style="animation-delay: 0.2s">
            <span class="text-[9px] md:text-[10px] tracking-widest uppercase text-white/50 mb-1">Accuracy</span>
            <span class="text-xl md:text-3xl font-black text-lightBlue">{{ accuracy }}%</span>
          </div>
          <div class="stat-row bg-white/5 border border-white/10 rounded-lg p-2 md:p-4 flex flex-col items-center" style="animation-delay: 0.3s">
            <span class="text-[9px] md:text-[10px] tracking-widest uppercase text-white/50 mb-1">Questions</span>
            <span class="text-xl md:text-3xl font-black text-white">
              <span class="text-success">{{ correctCount }}</span>
              <span class="text-white/30 text-lg md:text-xl mx-1">/</span>
              <span class="text-hexred">{{ totalCount - correctCount }}</span>
            </span>
          </div>
        </div>

        <!-- Word Recap -->
        <div class="w-full mb-8 max-h-60 overflow-y-auto pr-2 custom-scrollbar stat-row relative" style="animation-delay: 0.35s">
          <div class="text-[10px] tracking-widest uppercase text-white/50 mb-3 sticky top-0 bg-darkNavy/90 backdrop-blur-md z-10 py-2 border-b border-white/10 text-center">Word Recap</div>
          <div class="flex flex-col gap-2">
            <div v-for="(item, index) in matchHistory" :key="index" 
                 class="flex items-center justify-between p-2 md:p-3 rounded-lg bg-white/5 border border-white/5 shadow-sm hover:bg-white/10 transition-colors"
                 :class="item.isCorrect ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-red-500'">
              <div class="flex flex-col text-left overflow-hidden w-full pr-2">
                <span class="text-[9px] md:text-[10px] text-white/40 uppercase tracking-widest mb-1 truncate">Target: <span class="text-white">{{ item.correct }}</span></span>
                <span class="text-base md:text-lg font-black truncate" :class="item.isCorrect ? 'text-green-400' : 'text-red-400'">
                  {{ item.submitted || '(Skipped)' }}
                </span>
              </div>
              <div class="flex items-center justify-center flex-shrink-0 ml-4">
                <span v-if="item.isCorrect" class="text-green-500 text-2xl drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]">✓</span>
                <span v-else class="text-red-500 text-2xl drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]">✗</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 🌟 ANIMATED RANK PROGRESSION & ELO RATING BAR WITH PHYSICAL TRAVELLING PIN BADGE -->
        <div v-if="activeTier && !isCustomRoom" class="w-full mb-10 stat-row relative" style="animation-delay: 0.4s">
          <div class="flex justify-between items-end mb-6">
            <div>
              <div class="text-[10px] tracking-widest uppercase text-white/50">Current Rank</div>
              <div class="text-2xl font-black tracking-widest uppercase" :style="{ color: activeTier.color }">
                {{ activeTier.name }}
              </div>
            </div>
            <div class="text-right">
              <div class="text-[10px] tracking-widest uppercase text-white/50">Rating</div>
              <div class="text-xl font-bold flex items-center gap-2 font-mono text-white">
                <span>{{ animatedElo }}</span> 
                <span v-if="eloChange !== undefined && eloChange !== 0" 
                      class="text-sm px-2.5 py-0.5 rounded-full font-bold transition-all"
                      :class="eloChange > 0 ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'">
                  {{ eloChange > 0 ? '+' : '' }}{{ eloChange }}
                </span>
              </div>
            </div>
          </div>

          <!-- Dynamic Progress Track & Floating Travelling Badge Pin -->
          <div class="w-full h-4 bg-black/50 rounded-full p-0.5 relative border border-white/10 shadow-inner my-5">
            <!-- Animated Fill Bar -->
            <div class="h-full rounded-full transition-all duration-75 ease-linear relative overflow-hidden"
                 :style="{ 
                   width: `${animatedRankProgress}%`, 
                   backgroundColor: activeTier.color, 
                   boxShadow: `0 0 15px ${activeTier.color}` 
                 }">
              <div class="absolute right-0 top-0 bottom-0 w-3 bg-white/90 rounded-full blur-[1px] animate-pulse"></div>
            </div>

            <!-- FLOATING RATING BADGE PIN THAT PHYSICALLY TRAVELS/SLIDES FORWARD (THẮNG) OR BACKWARD (THUA) ALONG THE BAR -->
            <div class="absolute top-[-38px] -translate-x-1/2 transition-all duration-75 ease-linear pointer-events-none z-20 flex flex-col items-center"
                 :style="{ left: `${Math.max(12, Math.min(88, animatedRankProgress))}%` }">
              <div class="px-2 md:px-3 py-1 rounded-full font-black text-[10px] md:text-xs font-mono tracking-wider shadow-xl flex items-center gap-1 border whitespace-nowrap"
                   :class="(eloChange ?? 0) >= 0 
                     ? 'bg-emerald-500 text-slate-950 border-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.8)]' 
                     : 'bg-rose-500 text-white border-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.8)]'">
                <span>{{ animatedElo }} pts</span>
                <span v-if="eloChange !== undefined && eloChange !== 0" class="text-[10px]">
                  ({{ eloChange > 0 ? '+' : '' }}{{ eloChange }})
                </span>
              </div>
              <div class="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] -mt-0.5"
                   :class="(eloChange ?? 0) >= 0 ? 'border-t-emerald-500' : 'border-t-rose-500'"></div>
            </div>
          </div>

          <div class="flex justify-between mt-1 text-[10px] font-mono text-white/40">
            <span>{{ activeTier.min }}</span>
            <span>{{ activeTier.max === 999999 ? '∞' : activeTier.max }}</span>
          </div>
        </div>

        <!-- Rank Up Celebration Popup -->
        <transition name="rank-up">
          <div v-if="showRankUp" class="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-2xl">
            <div class="text-center p-8 bg-gradient-to-b from-white/10 to-transparent border border-white/20 rounded-2xl shadow-[0_0_50px_rgba(255,255,255,0.1)] transform scale-110">
              <div class="text-sm font-black tracking-widest uppercase text-white/70 mb-2">Rank Up!</div>
              <div class="text-6xl font-black tracking-widest uppercase mb-4" :style="{ color: activeTier?.color, textShadow: `0 0 30px ${activeTier?.color}` }">
                {{ activeTier?.name }}
              </div>
              <div class="text-white/60 mb-6 flex items-center justify-center gap-2">
                <span class="line-through opacity-50">{{ oldTier?.name }}</span>
                <span>➔</span>
                <span class="font-bold text-white">{{ activeTier?.name }}</span>
              </div>
              <button @click="showRankUp = false" class="px-6 py-2 rounded bg-white/10 hover:bg-white/20 transition-colors uppercase tracking-widest text-xs font-bold cursor-pointer">
                Continue
              </button>
            </div>
          </div>
        </transition>

        <!-- Guest Conversion CTA Banner -->
        <div v-if="authStore.isGuest" class="w-full bg-gradient-to-r from-orange-500/20 to-amber-500/20 border-2 border-orange-400/40 rounded-2xl p-4 mb-4 flex items-center justify-between text-left shadow-lg">
          <div>
            <h4 class="font-black text-amber-300 uppercase tracking-wide text-sm flex items-center gap-1.5">
              <span>⚡</span> Save Your High Score & Rank!
            </h4>
            <p class="text-xs text-gray-300 mt-0.5">
              You played as a Guest. Register now to save your {{ playerScore }} points on the Global Leaderboard!
            </p>
          </div>
          <button @click="router.push('/login')" class="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 hover:scale-105 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-md transition-all whitespace-nowrap cursor-pointer">
            Register Now ➔
          </button>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-center gap-4 w-full stat-row" style="animation-delay: 0.5s">
          <button @click="emit('goHome')" class="px-8 py-3 rounded-lg font-bold uppercase tracking-widest text-sm bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer">
            Home
          </button>
          <button @click="emit('showFeedback')" class="px-8 py-3 rounded-lg font-bold uppercase tracking-widest text-sm bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 transition-all text-white shadow-lg cursor-pointer">
            Feedback
          </button>
          <button v-if="!isMultiplayer || isCustomRoom" @click="emit('playAgain')" class="px-8 py-3 rounded-lg font-bold uppercase tracking-widest text-sm bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 transition-all text-white shadow-lg cursor-pointer"
                  :class="{'animate-pulse': settingsStore.vfxEnabled}">
            Play Again
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.cyber-grid {
  background-image: 
    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 20px 20px;
}

/* Transitions */
.result-overlay-enter-active,
.result-overlay-leave-active {
  transition: opacity 0.6s ease-out;
}
.result-overlay-enter-active .result-panel {
  transition: transform 0.6s ease-out;
}
.result-overlay-enter-from,
.result-overlay-leave-to {
  opacity: 0;
}
.result-overlay-enter-from .result-panel {
  transform: scale(0.85);
}

.vignette-defeat {
  background: radial-gradient(circle, rgba(0,0,0,0.85) 40%, rgba(120,0,0,0.3) 100%);
}

/* Animations */
@keyframes slideInUp {
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
}

.stat-row {
  opacity: 0;
  animation: slideInUp 0.5s ease-out forwards;
}

@keyframes confettiFall {
  0% { transform: translateY(0) rotate(0deg); opacity: 1; }
  100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
}

.confetti-piece {
  animation-name: confettiFall;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}

.rank-up-enter-active,
.rank-up-leave-active {
  transition: opacity 0.5s ease, transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.rank-up-enter-from,
.rank-up-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>

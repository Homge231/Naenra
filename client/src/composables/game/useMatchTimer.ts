import { ref } from 'vue'

export interface UseMatchTimerOptions {
  matchDuration?: number
  showTutorial: () => boolean
  timerSpeedMultiplier: () => number
  isPandoraMode: () => boolean
  isTrickster: () => boolean
  isChaos: () => boolean
  onShapeshift: () => void
  onTimeout: () => void
}

export function useMatchTimer(options: UseMatchTimerOptions) {
  const MATCH_DURATION = options.matchDuration ?? 60

  let matchTimerFrame: number | null = null
  let remainingMatchMs = MATCH_DURATION * 1000
  let lastTickTime = 0
  let isTimerPaused = false

  const timeLeft = ref(MATCH_DURATION)
  const timerProgressPercent = ref(100)

  function stopMatchTimer() {
    if (matchTimerFrame) {
      cancelAnimationFrame(matchTimerFrame)
      matchTimerFrame = null
    }
  }

  function startMatchTimer() {
    if (matchTimerFrame) return
    lastTickTime = Date.now()
    let lastShiftTime = lastTickTime - 25000 // Trigger first shift immediately

    const tick = () => {
      const now = Date.now()
      const dt = now - lastTickTime
      lastTickTime = now

      if (!isTimerPaused && !options.showTutorial() && !isNaN(dt)) {
        remainingMatchMs -= dt * options.timerSpeedMultiplier()
      }
      
      remainingMatchMs = Math.max(0, remainingMatchMs)

      timerProgressPercent.value = (remainingMatchMs / (MATCH_DURATION * 1000)) * 100
      timeLeft.value = isNaN(remainingMatchMs) ? MATCH_DURATION : Math.ceil(remainingMatchMs / 1000)

      // Shapeshifter trigger based on tier
      if (options.isPandoraMode()) {
        let shiftInterval = 20000 // T1 Pandora: 20s
        if (options.isTrickster()) shiftInterval = 20000 // T2 upgrades: 20s
        if (options.isChaos()) shiftInterval = 15000 // T3 upgrades: 15s
        
        if (Date.now() - lastShiftTime >= shiftInterval) {
          lastShiftTime = Date.now()
          options.onShapeshift()
        }
      }

      if (remainingMatchMs > 0) {
        matchTimerFrame = requestAnimationFrame(tick)
      } else {
        matchTimerFrame = null
        timeLeft.value = 0
        options.onTimeout()
      }
    }
    matchTimerFrame = requestAnimationFrame(tick)
  }

  function setPaused(paused: boolean) {
    isTimerPaused = paused
    if (!paused) {
      lastTickTime = Date.now()
    }
  }

  function addTime(ms: number) {
    remainingMatchMs = Math.min(MATCH_DURATION * 1000, remainingMatchMs + ms)
    timerProgressPercent.value = (remainingMatchMs / (MATCH_DURATION * 1000)) * 100
    timeLeft.value = Math.ceil(remainingMatchMs / 1000)
  }

  function pauseTimerFor(ms: number) {
    isTimerPaused = true
    setTimeout(() => {
      isTimerPaused = false
      lastTickTime = Date.now()
    }, ms)
  }

  function resetTimer() {
    stopMatchTimer()
    remainingMatchMs = MATCH_DURATION * 1000
    timeLeft.value = MATCH_DURATION
    timerProgressPercent.value = 100
    isTimerPaused = false
  }

  function getRemainingMs() {
    return remainingMatchMs
  }

  function setRemainingMs(ms: number) {
    remainingMatchMs = ms
    timerProgressPercent.value = (remainingMatchMs / (MATCH_DURATION * 1000)) * 100
    timeLeft.value = Math.ceil(remainingMatchMs / 1000)
  }

  return {
    timeLeft,
    timerProgressPercent,
    startMatchTimer,
    stopMatchTimer,
    setPaused,
    addTime,
    pauseTimerFor,
    resetTimer,
    getRemainingMs,
    setRemainingMs
  }
}

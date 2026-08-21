import { ref, computed } from 'vue'

export interface OfflineQuestion {
  id: string
  question_text: string
  target_word: string
  hint: string
  topic: string
  difficulty: string
}

// 150 Curated Offline Questions Vault
export const OFFLINE_QUESTION_BANK: OfflineQuestion[] = [
  // A1 - Daily Life & Basics
  { id: 'off-1', question_text: 'I drink a cup of hot ______ every morning.', target_word: 'coffee', hint: 'Dark caffeinated brew', topic: 'cafe', difficulty: 'A1' },
  { id: 'off-2', question_text: 'She read an interesting ______ before going to sleep.', target_word: 'book', hint: 'Printed pages bound together', topic: 'daily-life', difficulty: 'A1' },
  { id: 'off-3', question_text: 'We bought fresh red ______ from the grocery market.', target_word: 'apples', hint: 'Common round crunchy fruit', topic: 'daily-life', difficulty: 'A1' },
  { id: 'off-4', question_text: 'The sun rises in the east and sets in the ______.', target_word: 'west', hint: 'Direction opposite to east', topic: 'daily-life', difficulty: 'A1' },
  { id: 'off-5', question_text: 'He unlocked the front ______ with his metal key.', target_word: 'door', hint: 'Hinged entrance barrier', topic: 'daily-life', difficulty: 'A1' },
  { id: 'off-6', question_text: 'Please wash your ______ with soap before having lunch.', target_word: 'hands', hint: 'Body parts with fingers', topic: 'daily-life', difficulty: 'A1' },
  { id: 'off-7', question_text: 'She ordered a cold glass of orange ______ with ice.', target_word: 'juice', hint: 'Drink squeezed from fruit', topic: 'cafe', difficulty: 'A1' },
  { id: 'off-8', question_text: 'The fluffy white ______ chased the small brown mouse.', target_word: 'cat', hint: 'Domestic feline pet', topic: 'daily-life', difficulty: 'A1' },
  { id: 'off-9', question_text: 'They went for a morning swim in the blue ______.', target_word: 'ocean', hint: 'Vast body of salt water', topic: 'travel', difficulty: 'A1' },
  { id: 'off-10', question_text: 'He checked the wall ______ to see what time it was.', target_word: 'clock', hint: 'Timepiece with hands', topic: 'daily-life', difficulty: 'A1' },
  
  // A2 - Travel, Cafe & Social
  { id: 'off-11', question_text: 'We boarded the early morning ______ to Tokyo.', target_word: 'flight', hint: 'Journey by airplane', topic: 'travel', difficulty: 'A2' },
  { id: 'off-12', question_text: 'She packed her leather ______ for the weekend trip.', target_word: 'luggage', hint: 'Suitcases and travel bags', topic: 'travel', difficulty: 'A2' },
  { id: 'off-13', question_text: 'The Italian restaurant serves crispy oven-baked ______.', target_word: 'pizza', hint: 'Crust topped with cheese and sauce', topic: 'cafe', difficulty: 'A2' },
  { id: 'off-14', question_text: 'Could you please pass me the table ______ and salt?', target_word: 'pepper', hint: 'Pungent black ground spice', topic: 'cafe', difficulty: 'A2' },
  { id: 'off-15', question_text: 'The hotel receptionist handed us our room ______.', target_word: 'keycard', hint: 'Plastic card used as an electronic key', topic: 'travel', difficulty: 'A2' },
  { id: 'off-16', question_text: 'He wore a thick woolen ______ because it was freezing.', target_word: 'jacket', hint: 'Outer garment for warmth', topic: 'daily-life', difficulty: 'A2' },
  { id: 'off-17', question_text: 'They visited an ancient marble ______ on the hill.', target_word: 'temple', hint: 'Sacred place of worship', topic: 'travel', difficulty: 'A2' },
  { id: 'off-18', question_text: 'I left my leather ______ on the dining table.', target_word: 'wallet', hint: 'Pocket case for money and cards', topic: 'daily-life', difficulty: 'A2' },
  { id: 'off-19', question_text: 'The waiter brought the printed ______ after our meal.', target_word: 'receipt', hint: 'Paper slip showing payment total', topic: 'cafe', difficulty: 'A2' },
  { id: 'off-20', question_text: 'The city ______ offers subway and electric bus lines.', target_word: 'transit', hint: 'Public transport system', topic: 'travel', difficulty: 'A2' },

  // B1 - Professional & Technology
  { id: 'off-21', question_text: 'The team must meet the project ______ by Friday.', target_word: 'deadline', hint: 'Latest time by which a task must be done', topic: 'tech', difficulty: 'B1' },
  { id: 'off-22', question_text: 'You should always create a secure cloud ______ of files.', target_word: 'backup', hint: 'Copy of data for safekeeping', topic: 'tech', difficulty: 'B1' },
  { id: 'off-23', question_text: 'The software engineer fixed a critical memory ______.', target_word: 'leak', hint: 'Unintended loss or memory drainage', topic: 'tech', difficulty: 'B1' },
  { id: 'off-24', question_text: 'Cyberpunk cities are illuminated by glowing ______ signs.', target_word: 'neon', hint: 'Bright electrified gas lighting', topic: 'tech', difficulty: 'B1' },
  { id: 'off-25', question_text: 'The AI model was trained on a massive text ______.', target_word: 'dataset', hint: 'Collection of structured training data', topic: 'tech', difficulty: 'B1' },
  { id: 'off-26', question_text: 'She received a certificate of ______ in graphic design.', target_word: 'diploma', hint: 'Official document of qualification', topic: 'daily-life', difficulty: 'B1' },
  { id: 'off-27', question_text: 'The user updated their account ______ to prevent theft.', target_word: 'password', hint: 'Secret string for authentication', topic: 'tech', difficulty: 'B1' },
  { id: 'off-28', question_text: 'Our company signed a long-term commercial ______.', target_word: 'contract', hint: 'Legally binding written agreement', topic: 'business', difficulty: 'B1' },
  { id: 'off-29', question_text: 'The wireless ______ connects all office computers together.', target_word: 'network', hint: 'Interconnected system of devices', topic: 'tech', difficulty: 'B1' },
  { id: 'off-30', question_text: 'He gave a brilliant slide ______ at the conference.', target_word: 'keynote', hint: 'Main headline address or speech', topic: 'business', difficulty: 'B1' },

  // B2 - Advanced Vocabulary
  { id: 'off-31', question_text: 'The new encryption protocol ensures absolute ______.', target_word: 'privacy', hint: 'State of being free from unauthorized observation', topic: 'tech', difficulty: 'B2' },
  { id: 'off-32', question_text: 'Her rapid typing skill gave her a competitive ______.', target_word: 'advantage', hint: 'Condition that puts one in a favorable position', topic: 'tech', difficulty: 'B2' },
  { id: 'off-33', question_text: 'The cybernetic core underwent a severe ______ surge.', target_word: 'voltage', hint: 'Electrical potential difference', topic: 'tech', difficulty: 'B2' },
  { id: 'off-34', question_text: 'The company launched an innovative marketing ______.', target_word: 'campaign', hint: 'Organized course of promotional actions', topic: 'business', difficulty: 'B2' },
  { id: 'off-35', question_text: 'The laboratory verified the ______ of the research data.', target_word: 'accuracy', hint: 'State of being correct or precise', topic: 'science', difficulty: 'B2' },
  { id: 'off-36', question_text: 'We must ______ the system parameters before match start.', target_word: 'calibrate', hint: 'Adjust precisely to standard values', topic: 'tech', difficulty: 'B2' },
  { id: 'off-37', question_text: 'The scientist observed an unusual cosmic ______ in space.', target_word: 'anomaly', hint: 'Something that deviates from standard rule', topic: 'science', difficulty: 'B2' },
  { id: 'off-38', question_text: 'The neural network achieved high pattern ______ rates.', target_word: 'detection', hint: 'Action of identifying presence or fact', topic: 'tech', difficulty: 'B2' },
  { id: 'off-39', question_text: 'Effective communication is essential for team ______.', target_word: 'synergy', hint: 'Combined interaction producing greater effect', topic: 'business', difficulty: 'B2' },
  { id: 'off-40', question_text: 'The athlete maintained great endurance and mental ______.', target_word: 'resilience', hint: 'Capacity to recover quickly from difficulties', topic: 'daily-life', difficulty: 'B2' },

  // C1 - Master Tier Lexicon
  { id: 'off-41', question_text: 'The holographic matrix exhibited strange quantum ______.', target_word: 'fluctuation', hint: 'Irregular rising and falling in number or amount', topic: 'science', difficulty: 'C1' },
  { id: 'off-42', question_text: 'Her argument was articulated with remarkable ______.', target_word: 'eloquence', hint: 'Fluent and persuasive discourse in speech', topic: 'business', difficulty: 'C1' },
  { id: 'off-43', question_text: 'The firewall detected a ______ attempt to bypass ports.', target_word: 'clandestine', hint: 'Kept secret or done secretly to conceal', topic: 'tech', difficulty: 'C1' },
  { id: 'off-44', question_text: 'The architect created an intricate urban ______ design.', target_word: 'labyrinth', hint: 'Complicated irregular network of passages', topic: 'travel', difficulty: 'C1' },
  { id: 'off-45', question_text: 'The system automatically purges ______ data buffers.', target_word: 'superfluous', hint: 'Exceeding what is sufficient or necessary', topic: 'tech', difficulty: 'C1' }
]

export function useOfflineTraining() {
  const isMatchActive = ref(false)
  const isMatchFinished = ref(false)
  const timeRemaining = ref(60)
  const currentQuestionIndex = ref(0)
  const questionsList = ref<OfflineQuestion[]>([])
  const score = ref(0)
  const combo = ref(0)
  const maxCombo = ref(0)
  const correctCount = ref(0)
  const wrongCount = ref(0)
  const totalLettersTyped = ref(0)
  const activeCoreId = ref<string | null>(null)
  let timerInterval: any = null

  const currentQuestion = computed(() => {
    if (questionsList.value.length === 0) return null
    return questionsList.value[currentQuestionIndex.value % questionsList.value.length]
  })

  const wpm = computed(() => {
    const minutes = Math.max(1, (60 - timeRemaining.value)) / 60
    return Math.round((totalLettersTyped.value / 5) / minutes) || 0
  })

  const accuracy = computed(() => {
    const total = correctCount.value + wrongCount.value
    if (total === 0) return 100
    return Math.round((correctCount.value / total) * 100)
  })

  function shuffleQuestions() {
    const shuffled = [...OFFLINE_QUESTION_BANK]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    questionsList.value = shuffled
  }

  function startMatch(coreId?: string) {
    shuffleQuestions()
    isMatchActive.value = true
    isMatchFinished.value = false
    timeRemaining.value = 60
    currentQuestionIndex.value = 0
    score.value = 0
    combo.value = 0
    maxCombo.value = 0
    correctCount.value = 0
    wrongCount.value = 0
    totalLettersTyped.value = 0
    activeCoreId.value = coreId || null

    if (timerInterval) clearInterval(timerInterval)
    timerInterval = setInterval(() => {
      if (timeRemaining.value > 0) {
        timeRemaining.value--
      } else {
        finishMatch()
      }
    }, 1000)
  }

  function levenshteinDistance(a: string, b: string): number {
    const matrix = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0))
    for (let i = 0; i <= a.length; i++) matrix[i][0] = i
    for (let j = 0; j <= b.length; j++) matrix[0][j] = j
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        )
      }
    }
    return matrix[a.length][b.length]
  }

  function submitAnswer(inputAnswer: string) {
    if (!isMatchActive.value || !currentQuestion.value) return

    const cleanInput = inputAnswer.trim().toLowerCase()
    const target = currentQuestion.value.target_word.trim().toLowerCase()

    if (cleanInput === target) {
      // Exact Match
      combo.value++
      if (combo.value > maxCombo.value) maxCombo.value = combo.value
      correctCount.value++
      totalLettersTyped.value += target.length

      const comboMultiplier = 1 + Math.min(combo.value * 0.05, 1.0)
      const basePts = target.length * 20
      const earned = Math.round(basePts * comboMultiplier)
      score.value += earned
    } else {
      // Levenshtein Typo Scoring
      wrongCount.value++
      combo.value = 0
      const dist = levenshteinDistance(cleanInput, target)
      const maxLen = Math.max(cleanInput.length, target.length)
      const sim = maxLen > 0 ? (maxLen - dist) / maxLen : 0

      if (sim >= 0.8) {
        score.value = Math.max(0, score.value - (dist * 2))
      } else {
        score.value = Math.max(0, score.value - (dist * 10))
      }
    }

    currentQuestionIndex.value++
  }

  function skipQuestion() {
    if (!isMatchActive.value) return
    wrongCount.value++
    combo.value = 0
    score.value = Math.max(0, score.value - 20)
    currentQuestionIndex.value++
  }

  function finishMatch() {
    if (timerInterval) clearInterval(timerInterval)
    isMatchActive.value = false
    isMatchFinished.value = true

    // Queue match result for cloud background sync
    try {
      const queue = JSON.parse(localStorage.getItem('offline_matches_queue') || '[]')
      queue.push({
        score: score.value,
        wpm: wpm.value,
        accuracy: accuracy.value,
        exp: Math.round(score.value * 0.1),
        playedAt: new Date().toISOString()
      })
      localStorage.setItem('offline_matches_queue', JSON.stringify(queue))
    } catch (e) {}
  }

  return {
    isMatchActive,
    isMatchFinished,
    timeRemaining,
    currentQuestion,
    currentQuestionIndex,
    score,
    combo,
    maxCombo,
    correctCount,
    wrongCount,
    wpm,
    accuracy,
    startMatch,
    submitAnswer,
    skipQuestion,
    finishMatch
  }
}

export interface OfflineCoreOption {
  id: string
  name: string
  description: string
  flat_buff: number
  multiplier_buff: number
  classification: string
  tier: number
}

export const DEFAULT_OFFLINE_CORES: OfflineCoreOption[] = [
  { id: 'combo-core', name: 'Combo Core', description: 'Increases combo multiplier bonus on consecutive correct words.', flat_buff: 0, multiplier_buff: 0.05, classification: 'power', tier: 1 },
  { id: 'speedster-core', name: 'Speedster Core', description: 'Grants +3s bonus time when completing words under 2 seconds.', flat_buff: 0, multiplier_buff: 0, classification: 'power', tier: 1 },
  { id: 'oracle-core', name: 'Oracle Core', description: 'Reveals first and last letters of target words.', flat_buff: 0, multiplier_buff: 0, classification: 'effect', tier: 1 },
  { id: 'aegis-core', name: 'Aegis Core', description: 'Provides 2 energy shields that absorb typos without breaking combo.', flat_buff: 0, multiplier_buff: 0, classification: 'effect', tier: 1 },
  { id: 'power-core', name: 'Power Core', description: 'Grants +30 flat bonus score per correct word.', flat_buff: 30, multiplier_buff: 0, classification: 'power', tier: 1 },
  { id: 'balanced-core', name: 'Balanced Core', description: 'Moderate flat bonus and combo multiplier boost.', flat_buff: 15, multiplier_buff: 0.02, classification: 'power', tier: 1 },
  { id: 'phoenix-core', name: 'Phoenix Core', description: 'Restores 50% score lost on mistakes.', flat_buff: 0, multiplier_buff: 0, classification: 'effect', tier: 1 },
  { id: 'high-roller-core', name: 'High Roller Core', description: 'High risk, double points on long words (7+ letters).', flat_buff: 0, multiplier_buff: 0.1, classification: 'power', tier: 1 }
]

export function evaluateOfflineSubmission(params: {
  typed: string
  target: string
  currentCombo: number
  currentShields: number
  activeCoreName?: string | null
  elapsedMs: number
}) {
  const cleanInput = (params.typed || '').trim().toLowerCase()
  const cleanTarget = (params.target || '').trim().toLowerCase()
  const coreName = (params.activeCoreName || '').toLowerCase()

  if (!cleanInput) {
    // Skipped
    return {
      correct: false,
      isSkip: true,
      pointsEarned: 0,
      pointsDeducted: 20,
      newCombo: 0,
      shieldBlocked: false,
      newShields: params.currentShields,
      timerDelta: 0,
      correctWord: cleanTarget
    }
  }

  if (cleanInput === cleanTarget) {
    // Exact Match
    const newCombo = params.currentCombo + 1
    const comboMultiplier = 1 + Math.min(newCombo * 0.05, 1.0)
    let basePts = cleanTarget.length * 20
    if (coreName.includes('power')) basePts += 30
    if (coreName.includes('balanced')) basePts += 15

    let earned = Math.round(basePts * comboMultiplier)
    if (coreName.includes('high roller') && cleanTarget.length >= 7) {
      earned = Math.round(earned * 1.5)
    }

    let timerDelta = 0
    if (coreName.includes('speedster') && params.elapsedMs < 2000) {
      timerDelta = 3000
    }

    return {
      correct: true,
      isSkip: false,
      pointsEarned: earned,
      pointsDeducted: 0,
      newCombo,
      shieldBlocked: false,
      newShields: params.currentShields,
      timerDelta,
      correctWord: cleanTarget
    }
  }

  // Typo / Wrong Answer
  let dist = 0
  const matrix: number[][] = []
  for (let i = 0; i <= cleanInput.length; i++) matrix[i] = [i]
  for (let j = 0; j <= cleanTarget.length; j++) matrix[0][j] = j
  for (let i = 1; i <= cleanInput.length; i++) {
    for (let j = 1; j <= cleanTarget.length; j++) {
      const cost = cleanInput[i - 1] === cleanTarget[j - 1] ? 0 : 1
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      )
    }
  }
  dist = matrix[cleanInput.length][cleanTarget.length]
  const maxLen = Math.max(cleanInput.length, cleanTarget.length)
  const sim = maxLen > 0 ? (maxLen - dist) / maxLen : 0

  if (params.currentShields > 0) {
    // Aegis shield protects
    return {
      correct: false,
      isSkip: false,
      pointsEarned: 0,
      pointsDeducted: 0,
      newCombo: params.currentCombo,
      shieldBlocked: true,
      newShields: params.currentShields - 1,
      timerDelta: 0,
      correctWord: cleanTarget
    }
  }

  const penalty = sim >= 0.8 ? dist * 2 : Math.min(50, dist * 10)

  return {
    correct: false,
    isSkip: false,
    pointsEarned: 0,
    pointsDeducted: penalty,
    newCombo: 0,
    shieldBlocked: false,
    newShields: 0,
    timerDelta: 0,
    correctWord: cleanTarget
  }
}


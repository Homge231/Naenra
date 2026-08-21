import { ref, nextTick } from 'vue'
import { currentRoom } from '../../services/multiplayerService'
import { OFFLINE_QUESTION_BANK } from '../useOfflineTraining'

export interface QuestionPayload {
  id: string
  question_text: string
  target_length: number
  target_hash: string
  oracle_hints: string[]
  hint?: string
  correct_word?: string
  topic?: string
}

export interface UseQuestionQueueOptions {
  fetchWithAuth: (url: string, options?: RequestInit) => Promise<Response>
  matchStore: any
  gameStore: any
  gameState: any // Ref<GameState>
  typedLetters: any // Ref<string[]>
  oracleRevealLevel: any // Ref<number>
  oracleTotalPenalty: any // Ref<number>
  questionStartTime: any // Ref<number>
  inputRef: any // Ref<HTMLInputElement | null>
  refetchThreshold?: number
}

function generateOracleHints(word: string): string[] {
  const len = word.length
  if (len <= 2) return [word, word, word]
  const h1 = word[0] + '·'.repeat(len - 2) + word[len - 1]
  const mid = Math.floor(len / 2)
  const h2 = word[0] + '·'.repeat(mid - 1) + word[mid] + '·'.repeat(len - mid - 2) + word[len - 1]
  const h3 = word.split('').map((c, i) => i % 2 === 0 ? c : '·').join('')
  return [h1, h2, h3]
}

const RICH_OFFLINE_QUESTIONS: QuestionPayload[] = OFFLINE_QUESTION_BANK.map(q => ({
  id: q.id,
  question_text: q.question_text,
  target_length: q.target_word.length,
  target_hash: '',
  oracle_hints: generateOracleHints(q.target_word.toUpperCase()),
  hint: q.hint,
  correct_word: q.target_word.toLowerCase(),
  topic: q.topic
}))

export function useQuestionQueue(options: UseQuestionQueueOptions) {
  const REFETCH_THRESHOLD = options.refetchThreshold ?? 3
  const questionQueue = ref<QuestionPayload[]>([])
  const isFetchingBatch = ref(false)
  const currentQuestion = ref<QuestionPayload>({
    id: '',
    question_text: '',
    target_length: 0,
    target_hash: '',
    oracle_hints: ['', '', '']
  })

  async function fetchBatch(): Promise<void> {
    if (isFetchingBatch.value || options.gameState.value === 'timeout') return
    isFetchingBatch.value = true
    try {
      let topic = options.matchStore.topics?.[options.matchStore.currentRound - 1] || 'daily-life'
      let vocabularyLevel = 'Normal'
      
      if (currentRoom && currentRoom.state?.metadata) {
        const meta = currentRoom.state.metadata.toJSON()
        if (meta.topic && meta.topic !== 'Any') {
           topic = meta.topic.toLowerCase()
        }
        if (meta.vocabularyLevel) {
           vocabularyLevel = meta.vocabularyLevel
        }
      }

      const currentRound = options.matchStore.currentRound || 1
      const res = await options.fetchWithAuth(`/api/game/questions?topic=${topic}&vocabularyLevel=${vocabularyLevel}&round=${currentRound}`)
      if (!res.ok) throw new Error('fetch failed')
      const data = await res.json()
      questionQueue.value.push(...(data.questions as QuestionPayload[]))
    } catch {
      // Offline fallback: shuffle from 150 offline questions
      const shuffled = [...RICH_OFFLINE_QUESTIONS].sort(() => Math.random() - 0.5)
      questionQueue.value.push(...shuffled)
    } finally {
      isFetchingBatch.value = false
    }
  }

  async function loadQuestion() {
    options.gameState.value = 'loading'
    options.typedLetters.value = []
    options.oracleRevealLevel.value = 0
    options.oracleTotalPenalty.value = 0

    if (questionQueue.value.length <= REFETCH_THRESHOLD) {
      fetchBatch()
    }

    const next = questionQueue.value.shift()
    if (!next) {
      currentQuestion.value = RICH_OFFLINE_QUESTIONS[Math.floor(Math.random() * RICH_OFFLINE_QUESTIONS.length)]
      fetchBatch()
    } else {
      currentQuestion.value = next
    }

    options.questionStartTime.value = Date.now()
    options.gameState.value = 'playing'

    const activeName = (options.gameStore.activeCoreName || '').toLowerCase()
    const hasThirdEye = activeName === 'third eye'
    const hasOmniscience = activeName === 'omniscience'
    const hasMindReader = activeName === 'mind reader'
    const hasDivineEye = activeName === 'divine eye'

    if ((hasOmniscience || hasThirdEye || hasDivineEye) && currentQuestion.value.target_length > 0) {
      const firstLetter = currentQuestion.value.oracle_hints?.[0]?.charAt(0)?.toLowerCase() || '_'
      if (firstLetter && firstLetter !== '·') {
        options.typedLetters.value = [firstLetter]
      }
    } else if (hasMindReader && currentQuestion.value.target_length > 1) {
      const hintLetters = currentQuestion.value.oracle_hints?.[2]?.split(' ') || []
      const first = hintLetters[0]?.toLowerCase()
      const second = hintLetters[1]?.toLowerCase()
      if (first && first !== '·' && second && second !== '·') {
        options.typedLetters.value = [first, second]
      }
    }

    await nextTick()
    options.inputRef.value?.focus()
  }

  function clearQueue() {
    questionQueue.value = []
  }

  return {
    questionQueue,
    isFetchingBatch,
    currentQuestion,
    fetchBatch,
    loadQuestion,
    clearQueue
  }
}

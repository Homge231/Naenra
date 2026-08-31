<template>
  <div class="space-y-6 animate-fade-in">

    <!-- PAGE HEADER -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <div class="flex items-center gap-2.5 mb-1.5">
          <span class="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-violet-500/10 text-violet-400 border border-violet-500/30 flex items-center gap-1.5 shadow-[0_0_10px_rgba(139,92,246,0.15)]">
            <span class="w-2 h-2 rounded-full bg-violet-500 animate-pulse"></span>
            AI OPERATIONS WORKSPACE
          </span>
          <span class="text-xs font-mono text-slate-500">US-96</span>
        </div>
        <h2 class="text-2xl font-black text-white tracking-wide flex items-center gap-2.5">
          <span>🤖</span>
          <span>AI Core Assistant & Prompt Engine</span>
        </h2>
        <p class="text-xs text-slate-400 mt-1">
          Customize AI personas & behavior rules in real-time, test chat streaming, and batch-generate questions.
        </p>
      </div>

      <!-- Model status badge -->
      <div class="flex items-center gap-3">
        <div
          :class="[
            'flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold border transition-all',
            modelStatus === 'online'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
              : modelStatus === 'checking'
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          ]"
        >
          <span
            :class="[
              'w-2 h-2 rounded-full',
              modelStatus === 'online' ? 'bg-emerald-500 animate-pulse' :
              modelStatus === 'checking' ? 'bg-amber-500 animate-pulse' :
              'bg-red-500'
            ]"
          ></span>
          {{ modelStatus === 'online' ? 'Gemini Online' : modelStatus === 'checking' ? 'Checking...' : 'Model Offline' }}
        </div>
        <button
          @click="checkModelStatus"
          :disabled="modelStatus === 'checking'"
          class="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-violet-500/50 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
        >
          <svg :class="['w-3.5 h-3.5 text-violet-400', modelStatus === 'checking' ? 'animate-spin' : '']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Ping AI
        </button>
      </div>
    </div>

    <!-- TOAST -->
    <Transition name="toast-fade">
      <div
        v-if="toast.message"
        :class="[
          'p-4 rounded-xl border flex items-center justify-between shadow-lg',
          toast.type === 'success'
            ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
            : 'bg-red-950/80 border-red-500/40 text-red-300'
        ]"
      >
        <div class="flex items-center gap-2 text-sm font-medium">
          <span>{{ toast.type === 'success' ? '✅' : '⚠️' }}</span>
          <span>{{ toast.message }}</span>
        </div>
        <button @click="toast.message = ''" class="text-xs opacity-60 hover:opacity-100">✕</button>
      </div>
    </Transition>

    <!-- TWO-COLUMN MAIN PANEL: CHAT CONSOLE + QUESTION GENERATOR -->
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">

      <!-- LEFT: AI CHAT CONSOLE -->
      <div id="ai-chat-console" class="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-xl">
        <!-- Header -->
        <div class="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-lg">💬</span>
            <div>
              <h3 class="text-sm font-bold text-white tracking-wide">AI Chat Console</h3>
              <p class="text-[11px] text-slate-500">Live-test AI responses with active persona & behavior via SSE</p>
            </div>
          </div>
          <button
            @click="clearChat"
            class="text-[11px] font-mono text-slate-500 hover:text-red-400 transition-colors px-2 py-1 rounded-lg hover:bg-red-500/10 cursor-pointer"
          >
            Clear
          </button>
        </div>

        <!-- Messages -->
        <div ref="chatBodyRef" class="flex-1 overflow-y-auto p-4 space-y-3 min-h-[280px] max-h-[380px]">
          <div v-if="chatMessages.length === 0" class="flex flex-col items-center justify-center h-full text-center gap-3 py-8">
            <span class="text-4xl opacity-30">🤖</span>
            <p class="text-xs text-slate-500 font-mono">Type a prompt to test your active AI Persona.<br/>Stream is live via SSE with dynamic behavior rules.</p>
          </div>

          <div v-for="(msg, idx) in chatMessages" :key="idx" :class="['flex', msg.role === 'user' ? 'justify-end' : 'justify-start']">
            <div
              :class="[
                'max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed',
                msg.role === 'user'
                  ? 'bg-violet-600/20 border border-violet-500/30 text-violet-100 rounded-br-md'
                  : 'bg-slate-800/80 border border-slate-700/60 text-slate-200 rounded-bl-md'
              ]"
            >
              <div v-if="msg.role === 'model'" v-html="renderMarkdown(msg.content)"></div>
              <p v-else>{{ msg.content }}</p>
              <!-- Streaming cursor -->
              <span v-if="isChatStreaming && chatStreamingIdx === idx" class="inline-block w-[2px] h-3.5 bg-violet-400 ml-0.5 animate-pulse rounded-full align-middle"></span>
            </div>
          </div>

          <!-- Thinking indicator -->
          <div v-if="isChatLoading && !isChatStreaming" class="flex items-center gap-2 text-xs text-slate-500 font-mono">
            <span class="w-2 h-2 rounded-full bg-violet-500 animate-bounce"></span>
            <span class="w-2 h-2 rounded-full bg-violet-500 animate-bounce [animation-delay:0.15s]"></span>
            <span class="w-2 h-2 rounded-full bg-violet-500 animate-bounce [animation-delay:0.3s]"></span>
            <span class="ml-1">AI thinking...</span>
          </div>
        </div>

        <!-- Input -->
        <div class="p-4 border-t border-slate-800">
          <div class="flex gap-2">
            <input
              v-model="chatInput"
              @keyup.enter="sendChatMessage"
              type="text"
              placeholder="Test a prompt (e.g. 'What is Aegis Core?')"
              class="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
              maxlength="300"
            />
            <button
              @click="sendChatMessage"
              :disabled="!chatInput.trim()"
              class="px-4 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-all shadow-[0_0_12px_rgba(139,92,246,0.3)] shrink-0 cursor-pointer"
            >
              <svg v-if="!isChatLoading" class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
              <svg v-else class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"/><path d="M4 12a8 8 0 018-8" stroke-linecap="round"/></svg>
            </button>
          </div>
          <!-- Quick test prompts -->
          <div class="flex flex-wrap gap-1.5 mt-2.5">
            <button
              v-for="hint in quickTestPrompts"
              :key="hint"
              @click="chatInput = hint"
              class="text-[10px] font-mono px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700/50 transition-colors cursor-pointer"
            >
              {{ hint }}
            </button>
          </div>
        </div>
      </div>

      <!-- RIGHT: QUESTION GENERATOR -->
      <AiQuestionGeneratorCard
        v-model="genConfig"
        :questions="generatedQuestions"
        :is-generating="isGenerating"
        :is-saving="isSaving"
        :saved-indexes="savedIndexes"
        @generate="generateQuestions"
        @save-single="saveSingleQuestion"
        @save-all="saveAllToQuestionBank"
        @export-json="exportAsJSON"
      />
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { fetchWithAuth } from '../../services/api'
import AiQuestionGeneratorCard, { type GeneratedQuestion, type GenConfig } from '../../components/admin/ai/AiQuestionGeneratorCard.vue'

// ── Types ────────────────────────────────────────────────────────────────────

interface ChatMessage {
  role: 'user' | 'model'
  content: string
}

interface Toast {
  message: string
  type: 'success' | 'error'
}

// ── State ────────────────────────────────────────────────────────────────────

const modelStatus = ref<'checking' | 'online' | 'offline'>('online')

// Chat console
const chatBodyRef = ref<HTMLElement | null>(null)
const chatInput = ref('')
const chatMessages = ref<ChatMessage[]>([])
const isChatLoading = ref(false)
const isChatStreaming = ref(false)
const chatStreamingIdx = ref(-1)
let chatAbortController: AbortController | null = null
let chatStreamTimer: ReturnType<typeof setInterval> | null = null

// Question generator
const genConfig = ref<GenConfig>({
  topic: 'daily-life',
  level: 'A1',
  count: 5,
  avoidDuplicates: true,
  focusContext: ''
})
const generatedQuestions = ref<GeneratedQuestion[]>([])
const isGenerating = ref(false)
const isSaving = ref(false)
const savedIndexes = ref<Set<number>>(new Set())

// Toast
const toast = ref<Toast>({ message: '', type: 'success' })

const quickTestPrompts = [
  'What is Aegis Core?',
  '🔍 Tìm 3 câu hỏi chủ đề Tech',
  '➕ Tạo câu hỏi từ "astronaut" độ khó B2',
  '👥 Tìm người chơi có tên "admin"',
  'What is my rank?',
]

// ── Helpers ──────────────────────────────────────────────────────────────────

function showToast(message: string, type: 'success' | 'error' = 'success') {
  toast.value = { message, type }
  setTimeout(() => { toast.value.message = '' }, 4000)
}

function scrollChatToBottom() {
  nextTick(() => {
    if (chatBodyRef.value) {
      chatBodyRef.value.scrollTop = chatBodyRef.value.scrollHeight
    }
  })
}

function renderMarkdown(raw: string): string {
  if (!raw) return ''
  let html = raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>')
  html = html.replace(/`([^`]+)`/g, '<code class="bg-slate-700/60 px-1 py-0.5 rounded text-xs font-mono">$1</code>')
  html = html.replace(/\n/g, '<br/>')
  return html
}

// ── Model Status ─────────────────────────────────────────────────────────────

async function checkModelStatus() {
  modelStatus.value = 'checking'
  try {
    const res = await fetchWithAuth('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'ping', history: [], playerHistory: {} })
    })
    modelStatus.value = res.ok ? 'online' : 'offline'
    showToast(res.ok ? '✅ Gemini AI is responding normally.' : '⚠️ AI model returned an error.', res.ok ? 'success' : 'error')
  } catch {
    modelStatus.value = 'offline'
    showToast('⚠️ Could not reach AI service.', 'error')
  }
}

// ── Chat Console ─────────────────────────────────────────────────────────────

function clearChat() {
  if (chatAbortController) {
    chatAbortController.abort()
    chatAbortController = null
  }
  if (chatStreamTimer) {
    clearInterval(chatStreamTimer)
    chatStreamTimer = null
  }
  chatMessages.value = []
  isChatLoading.value = false
  isChatStreaming.value = false
  chatStreamingIdx.value = -1
}

async function sendChatMessage() {
  const text = chatInput.value.trim()
  if (!text) return

  chatInput.value = ''

  // 1. Immediately abort active stream & interval
  if (chatAbortController) {
    chatAbortController.abort()
    chatAbortController = null
  }
  if (chatStreamTimer) {
    clearInterval(chatStreamTimer)
    chatStreamTimer = null
  }

  // 2. Finalize previous AI message if still typing
  if (chatStreamingIdx.value >= 0 && chatStreamingIdx.value < chatMessages.value.length) {
    const prev = chatMessages.value[chatStreamingIdx.value]
    if (prev && !prev.content.trim()) {
      chatMessages.value.splice(chatStreamingIdx.value, 1)
    }
  }

  isChatLoading.value = false
  isChatStreaming.value = false
  chatStreamingIdx.value = -1

  chatMessages.value.push({ role: 'user', content: text })
  scrollChatToBottom()

  isChatLoading.value = true

  let incomingBuffer = ''
  let displayedText = ''
  let isStreamClosed = false

  // Push placeholder AI message
  chatMessages.value.push({ role: 'model', content: '' })
  let answerIdx = chatMessages.value.length - 1

  const startTypewriter = () => {
    if (chatStreamTimer) clearInterval(chatStreamTimer)
    chatStreamTimer = setInterval(() => {
      if (displayedText.length < incomingBuffer.length) {
        if (!isChatStreaming.value) {
          isChatStreaming.value = true
          chatStreamingIdx.value = answerIdx
        }
        const backlog = incomingBuffer.length - displayedText.length
        const step = backlog > 80 ? 5 : backlog > 30 ? 3 : backlog > 12 ? 2 : 1
        displayedText += incomingBuffer.slice(displayedText.length, displayedText.length + step)
        if (answerIdx >= 0 && answerIdx < chatMessages.value.length) {
          chatMessages.value[answerIdx] = { role: 'model', content: displayedText }
        }
        scrollChatToBottom()
      } else if (isStreamClosed) {
        clearInterval(chatStreamTimer!)
        chatStreamTimer = null
        isChatStreaming.value = false
        chatStreamingIdx.value = -1
        isChatLoading.value = false
        if (!displayedText.trim() && answerIdx >= 0) {
          chatMessages.value.splice(answerIdx, 1)
          showToast('AI returned no response. Check model status.', 'error')
        }
        scrollChatToBottom()
      }
    }, 14)
  }

  try {
    chatAbortController = new AbortController()
    const timeoutId = setTimeout(() => chatAbortController?.abort(), 25000)

    const apiBase = (import.meta.env.VITE_SERVER_URL || 'http://localhost:3000') as string
    const token = localStorage.getItem('arena_token') || ''

    const history = chatMessages.value
      .slice(0, -1)
      .slice(-8)
      .map(m => ({ role: m.role, message: m.content }))

    const res = await fetch(`${apiBase}/api/ai/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ prompt: text, history, playerHistory: {} }),
      signal: chatAbortController.signal
    })

    clearTimeout(timeoutId)

    if (!res.ok || !res.body) {
      throw new Error(`AI stream error: ${res.status}`)
    }

    startTypewriter()

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const payload = line.slice(6).trim()
        if (payload === '[DONE]') { isStreamClosed = true; break }
        try {
          const parsed = JSON.parse(payload)
          if (parsed.chunk) incomingBuffer += parsed.chunk
        } catch { /* skip malformed */ }
      }
    }
    isStreamClosed = true
  } catch (err: any) {
    isStreamClosed = true
    if (chatStreamTimer) { clearInterval(chatStreamTimer); chatStreamTimer = null }
    if (answerIdx >= 0 && chatMessages.value[answerIdx]?.content === '') {
      chatMessages.value.splice(answerIdx, 1)
    }
    isChatLoading.value = false
    isChatStreaming.value = false
    chatStreamingIdx.value = -1
    if (err.name !== 'AbortError') {
      showToast(`Chat error: ${err.message}`, 'error')
    }
  } finally {
    chatAbortController = null
    scrollChatToBottom()
  }
}

// ── Question Generator ────────────────────────────────────────────────────────

async function generateQuestions() {
  if (isGenerating.value) return
  isGenerating.value = true
  generatedQuestions.value = []

  try {
    const apiBase = (import.meta.env.VITE_SERVER_URL || 'http://localhost:3000') as string
    const token = localStorage.getItem('arena_token') || ''

    const genRes = await fetch(`${apiBase}/api/admin/ai/generate-questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        topic: genConfig.value.topic,
        level: genConfig.value.level,
        count: genConfig.value.count,
        avoidDuplicates: genConfig.value.avoidDuplicates,
        focusContext: genConfig.value.focusContext
      })
    })

    if (!genRes.ok) {
      const err = await genRes.json().catch(() => ({}))
      throw new Error(err.error || `Generation failed: ${genRes.status}`)
    }

    const data = await genRes.json()
    generatedQuestions.value = data.questions || data || []
    savedIndexes.value = new Set()
    showToast(`✅ Generated ${generatedQuestions.value.length} questions successfully!`)
  } catch (err: any) {
    showToast(`Generation failed: ${err.message}`, 'error')
  } finally {
    isGenerating.value = false
  }
}

async function saveSingleQuestion(idx: number) {
  const q = generatedQuestions.value[idx]
  if (!q || isSaving.value) return
  isSaving.value = true
  try {
    const res = await fetchWithAuth('/api/admin/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question_text: q.question_text,
        target_word: q.target_word.trim().toLowerCase(),
        hint: q.hint,
        topic: genConfig.value.topic,
        difficulty: genConfig.value.level
      })
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message || 'Failed to save question')
    }
    savedIndexes.value.add(idx)
    showToast(`✅ Saved question #${idx + 1} (${q.target_word}) to Question Bank!`)
  } catch (err: any) {
    showToast(`Save failed: ${err.message}`, 'error')
  } finally {
    isSaving.value = false
  }
}

async function saveAllToQuestionBank() {
  if (generatedQuestions.value.length === 0 || isSaving.value) return
  isSaving.value = true
  try {
    const payload = generatedQuestions.value.map(q => ({
      question_text: q.question_text,
      target_word: q.target_word.trim().toLowerCase(),
      hint: q.hint,
      topic: genConfig.value.topic,
      difficulty: genConfig.value.level
    }))

    const res = await fetchWithAuth('/api/admin/questions/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questions: payload })
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message || 'Failed to import questions')
    }

    // Mark all as saved
    generatedQuestions.value.forEach((_, idx) => savedIndexes.value.add(idx))
    showToast(`✅ Saved all ${generatedQuestions.value.length} questions to Question Bank!`)
  } catch (err: any) {
    showToast(`Save all failed: ${err.message}`, 'error')
  } finally {
    isSaving.value = false
  }
}

function exportAsJSON() {
  const json = JSON.stringify(generatedQuestions.value, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `naenra_questions_${genConfig.value.topic}_${genConfig.value.level}_${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
  showToast(`📥 Exported ${generatedQuestions.value.length} questions as JSON.`)
}

onMounted(() => {
  fetchAiConfig()
})
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: all 0.3s ease;
}
.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>

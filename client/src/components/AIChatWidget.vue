<template>
  <!-- Floating container — fixed bottom-right -->
  <div class="ai-chat-root" ref="rootRef">

    <!-- Chat Window Overlay -->
    <Transition name="chat-slide">
      <div
        v-if="isChatOpen"
        class="chat-window shadow-2xl"
        role="dialog"
        aria-label="Naenra Cyber AI Assistant"
      >
        <!-- Top gradient accent bar -->
        <div class="chat-accent-bar"></div>

        <!-- Header: Featuring Interactive Glowing Cyber Avatar (Eyes & Animated Talking Mouth) -->
        <div class="chat-header">
          <div class="chat-header-info">
            
            <!-- 🤖 INTERACTIVE CYBER MASCOT AVATAR (Glowing Eyes + Lip-Synced Mouth) -->
            <div 
              class="cyber-mascot-box relative flex flex-col items-center justify-center cursor-pointer select-none transition-all duration-300 group"
              @click="handleMascotClick"
              :class="{
                'mascot-pulse-listening': isListening,
                'mascot-glow-thinking': isLoading,
                'mascot-talk-speaking': isSpeaking,
                'mascot-interactive-click': isInteracting
              }"
              title="Click to interact with Cyber Mascot!"
            >
              <!-- Glowing Cyber Eyes -->
              <div class="cyber-eyes flex items-center gap-2 z-10">
                <div 
                  class="cyber-eye left-eye" 
                  :class="{ 
                    'eye-blink': isBlinking, 
                    'eye-wide': isListening, 
                    'eye-happy': isInteracting,
                    'eye-think': isLoading 
                  }"
                ></div>
                <div 
                  class="cyber-eye right-eye" 
                  :class="{ 
                    'eye-blink': isBlinking, 
                    'eye-wide': isListening, 
                    'eye-happy': isInteracting,
                    'eye-think': isLoading 
                  }"
                ></div>
              </div>

              <!-- Animated Talking Mouth (Lip Sync to Speech Readout & Audio) -->
              <div class="cyber-mouth mt-1 z-10 flex items-center justify-center h-3.5">
                <!-- When Speaking: Animated Real-Time Mouth Bars (Lip Sync) -->
                <div v-if="isSpeaking || isLiveSpeaking" class="talking-mouth flex items-center gap-0.5 h-3">
                  <span class="mouth-bar bar-1 bg-amber-400 w-1 rounded-full animate-lip-1 shadow-xs" :style="isLiveSpeaking ? { height: `${Math.max(4, audioAmplitude * 14)}px` } : {}"></span>
                  <span class="mouth-bar bar-2 bg-amber-400 w-1 rounded-full animate-lip-2 shadow-xs" :style="isLiveSpeaking ? { height: `${Math.max(6, audioAmplitude * 16)}px` } : {}"></span>
                  <span class="mouth-bar bar-3 bg-amber-400 w-1 rounded-full animate-lip-3 shadow-xs" :style="isLiveSpeaking ? { height: `${Math.max(4, audioAmplitude * 14)}px` } : {}"></span>
                </div>
                <!-- When Listening / Live Active: Pulsing O Mouth -->
                <div v-else-if="isListening || isLiveConnected" class="listening-mouth w-2.5 h-2.5 rounded-full border-2 border-red-500 bg-red-900/50 animate-ping"></div>
                <!-- When Interacting / Happy: Curved Smile -->
                <div v-else-if="isInteracting" class="smile-mouth w-4 h-2 border-b-2 border-amber-400 rounded-b-full shadow-xs"></div>
                <!-- Idle Gold Straight Mouth Line (Matching user screenshot) -->
                <div v-else class="idle-mouth w-3.5 h-[2px] bg-amber-400 rounded-full group-hover:w-4.5 transition-all shadow-xs"></div>
              </div>

              <!-- Cyber Aura Glow Ring -->
              <div class="cyber-mascot-aura" :class="{ 'mascot-live-aura': isLiveConnected }"></div>
            </div>

            <div>
              <h3 class="chat-title flex items-center gap-1.5">
                Naenra Assistant
                <span class="chat-badge">
                  CYBER AI
                </span>
              </h3>
              <p class="chat-subtitle">
                {{ mascotStatusText }}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-1.5">
            <!-- Close Button -->
            <button
              @click="closeChat"
              class="chat-close-btn"
              aria-label="Close Chat"
              id="ai-chat-close-btn"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Messages Body -->
        <div class="chat-body" ref="chatBodyRef">
          <!-- Welcome message with Mascot Intro -->
          <div v-if="messages.length === 0" class="chat-welcome">
            <div class="chat-welcome-mascot-box mb-2">
              <span class="text-4xl animate-bounce-slow inline-block">🤖</span>
            </div>
            <p class="text-xs text-gray-700 font-medium leading-relaxed">
              Welcome <strong class="chat-username text-orange-600 font-extrabold">{{ username }}</strong> to **Naenra Cyber Assistant**!<br/>
              Select a quick prompt below or click **Microphone 🎙️** to speak hands-free!
            </p>
            
            <!-- Quick Action Hints in English -->
            <div class="chat-quick-hints mt-3">
              <button
                v-for="hint in quickHints"
                :key="hint"
                class="chat-quick-btn"
                @click="sendQuick(hint)"
              >
                {{ hint }}
              </button>
            </div>
          </div>

          <!-- Message bubbles -->
          <div
            v-for="(msg, idx) in messages"
            :key="idx"
            :class="['chat-bubble-wrap', msg.role === 'user' ? 'chat-bubble-wrap--user' : 'chat-bubble-wrap--ai']"
          >
            <!-- AI bubble: only render once content starts arriving (hides empty streaming placeholder) -->
            <div
              v-if="msg.role === 'user' || msg.content.length > 0"
              :class="['chat-bubble', msg.role === 'user' ? 'chat-bubble--user' : 'chat-bubble--ai']"
            >
              <div class="flex items-center justify-between gap-2 mb-1.5 border-b border-orange-100 pb-1" v-if="msg.role !== 'user'">
                <span class="chat-bubble-label flex items-center gap-1 text-orange-600 font-bold">
                  <span>🤖</span> Naenra Cyber Guide
                </span>
                <button 
                  v-if="msg.content" 
                  @click="speakText(msg.content)" 
                  class="text-[10px] font-bold text-orange-600 hover:text-white hover:bg-orange-500 transition-colors flex items-center gap-1 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full cursor-pointer"
                  title="Read aloud using Voice TTS"
                >
                  🔊 Read
                </button>
              </div>

              <div
                v-if="msg.role !== 'user'"
                class="chat-bubble-text leading-relaxed"
                v-html="renderMarkdown(msg.content)"
              ></div>
              <p v-else class="chat-bubble-text">{{ msg.content }}</p>
            </div>
          </div>

          <!-- Typing indicator -->
          <div v-if="isLoading" class="chat-typing">
            <span class="text-xs text-orange-600 font-bold mr-2">Cyber AI thinking...</span>
            <span></span><span></span><span></span>
          </div>

          <!-- Error Message -->
          <div v-if="errorMsg" class="chat-error">
            <span>⚠️ {{ errorMsg }}</span>
            <button @click="errorMsg = ''" class="chat-error-dismiss">✕</button>
          </div>
        </div>

        <!-- Voice Live Wavebar Visualizer -->
        <div v-if="isListening || isSpeaking" class="voice-wave-bar">
          <div class="voice-status-info">
            <span class="pulse-dot" :class="{ 'pulse-dot--active': isListening || isSpeaking }"></span>
            <span class="voice-status-text font-bold text-xs">
              {{ isListening ? '🎙️ Listening to your voice...' : '🔊 Speaking response aloud...' }}
            </span>
          </div>
          <div class="waveform-anim" :class="{ 'waveform-anim--active': isListening || isSpeaking }">
            <span class="wave-bar"></span>
            <span class="wave-bar"></span>
            <span class="wave-bar"></span>
            <span class="wave-bar"></span>
            <span class="wave-bar"></span>
          </div>
        </div>

        <!-- Footer: Text Input + Gemini 3.1 Live Mic -->
        <div class="chat-footer">
          <div class="chat-input-wrap flex items-center gap-2">

            <!-- 🎙️ GEMINI 3.1 LIVE MIC BUTTON (replaces old STT mic) -->
            <button
              @click="toggleLiveSession"
              type="button"
              id="ai-chat-mic-btn"
              class="chat-mic-btn shrink-0 relative"
              :class="{
                'chat-mic-btn--listening': isLiveConnected,
                'opacity-60 animate-pulse': isLiveConnecting
              }"
              :title="isLiveConnected ? 'Gemini 3.1 Live — Click to stop' : isLiveConnecting ? 'Connecting...' : 'Start Gemini 3.1 Flash Live Voice'"
            >
              <span v-if="isLiveConnecting" class="text-sm">⏳</span>
              <span v-else-if="isLiveConnected" class="text-sm text-red-400 animate-pulse">🔴</span>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              <!-- Red dot indicator when live -->
              <span v-if="isLiveConnected" class="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
            </button>

            <!-- Text Input Field -->
            <input
              v-model="inputText"
              @keyup.enter="sendMessage"
              :disabled="isLoading"
              type="text"
              :placeholder="isLiveConnected ? 'Live active — speak or type...' : 'Type a question or tap mic for Live AI...'"
              class="chat-input flex-1"
              id="ai-chat-input"
              autocomplete="off"
              maxlength="300"
            />

            <!-- Send Button -->
            <button
              @click="sendMessage"
              :disabled="isLoading || !inputText.trim()"
              class="chat-send-btn shrink-0"
              id="ai-chat-send-btn"
              aria-label="Send"
            >
              <svg v-if="!isLoading" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
              <svg v-else class="spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" stroke-opacity="0.25"/>
                <path d="M4 12a8 8 0 018-8" stroke-linecap="round"/>
              </svg>
            </button>
          </div>

          <!-- Live status + error row -->
          <div class="flex justify-between items-center mt-1.5 px-1">
            <span v-if="liveErrorMsg" class="text-[10px] text-red-400 font-semibold truncate">⚠️ {{ liveErrorMsg }}</span>
            <span v-else-if="isLiveConnected" class="text-[10px] text-red-400 font-bold animate-pulse">🔴 Gemini 3.1 Live active — speak now</span>
            <span v-else class="text-[10px] text-gray-500 font-semibold">⚠️ AI can make mistakes. Please verify.</span>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Floating Toggle Button featuring Cyber Eyes Mascot -->
    <button
      @click="toggleChat"
      class="chat-fab shadow-2xl"
      :class="{ 'chat-fab--open': isChatOpen }"
      :aria-label="isChatOpen ? 'Close AI Assistant' : 'Open AI Assistant'"
      id="ai-chat-fab-btn"
      title="Naenra Voice AI Assistant"
    >
      <!-- Glow ring -->
      <span class="chat-fab-glow"></span>

      <!-- Icon: show X when open, animated eyes when closed -->
      <Transition name="icon-swap" mode="out-in">
        <svg v-if="isChatOpen" key="close" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
        </svg>
        <div v-else key="fab-eyes" class="fab-cyber-eyes flex items-center gap-1.5">
          <div class="fab-eye left-eye"></div>
          <div class="fab-eye right-eye"></div>
        </div>
      </Transition>

      <!-- Unread dot -->
      <span
        v-if="!isChatOpen && messages.length > 0"
        class="chat-fab-dot"
      ></span>
    </button>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onBeforeUnmount, watch } from 'vue'
import { useAuthStore } from '../stores/authStore'
import { useGameStore } from '../stores/gameStore'
import { fetchWithAuth } from '../services/api'
import { useGeminiLive } from '../composables/useGeminiLive'

interface ChatMessage {
  role: 'user' | 'model'
  content: string
}

const authStore = useAuthStore()
const gameStore = useGameStore()
const geminiLive = useGeminiLive()

const {
  isLiveConnected,
  isConnecting: isLiveConnecting,
  isSpeaking: isLiveSpeaking,
  audioAmplitude,
  errorMsg: liveErrorMsg,
  startLiveSession,
  stopLiveSession,
  sendTextMessage,
  onAiTranscript,
  onUserTranscript,
  onTurnComplete
} = geminiLive

function toggleLiveSession() {
  if (isLiveConnected.value || isLiveConnecting.value) {
    stopLiveSession()
  } else {
    startLiveSession()
  }
}

const isChatOpen = ref(false)
const currentAiLiveMsgIdx = ref(-1)
const currentUserLiveMsgIdx = ref(-1)
let liveSpeechRec: any = null

// Real-time transcript from Gemini Live AI Output
onAiTranscript((text: string) => {
  if (!text) return

  // Ensure a user query bubble precedes the AI response if no user bubble exists for this turn
  if (messages.value.length === 0 || (currentAiLiveMsgIdx.value === -1 && messages.value[messages.value.length - 1]?.role !== 'user')) {
    messages.value.push({ role: 'user', content: '🎙️ Live Voice Question' })
  }

  if (currentAiLiveMsgIdx.value === -1 || currentAiLiveMsgIdx.value >= messages.value.length || messages.value[currentAiLiveMsgIdx.value]?.role !== 'model') {
    messages.value.push({ role: 'model', content: text })
    currentAiLiveMsgIdx.value = messages.value.length - 1
  } else {
    const current = messages.value[currentAiLiveMsgIdx.value].content
    if (text.startsWith(current)) {
      messages.value[currentAiLiveMsgIdx.value].content = text
    } else if (!current.endsWith(text)) {
      messages.value[currentAiLiveMsgIdx.value].content += (current && !current.endsWith(' ') && !text.startsWith(' ') ? ' ' : '') + text
    }
  }
  scrollToBottom()
})

// Real-time transcript from Gemini Live Server User Input (if sent by server)
onUserTranscript((text: string) => {
  if (!text) return
  // If a temporary Voice Question bubble was pushed, update it with server transcript
  if (messages.value.length > 0 && messages.value[messages.value.length - 1]?.content === '🎙️ Live Voice Question') {
    messages.value[messages.value.length - 1].content = text
    currentUserLiveMsgIdx.value = messages.value.length - 1
  } else if (currentUserLiveMsgIdx.value === -1 || currentUserLiveMsgIdx.value >= messages.value.length || messages.value[currentUserLiveMsgIdx.value]?.role !== 'user') {
    messages.value.push({ role: 'user', content: text })
    currentUserLiveMsgIdx.value = messages.value.length - 1
  } else {
    messages.value[currentUserLiveMsgIdx.value].content = text
  }
  scrollToBottom()
})

// Signal from Gemini Live when a turn completes (resets indices so next turn starts a new bubble)
onTurnComplete(() => {
  currentAiLiveMsgIdx.value = -1
  currentUserLiveMsgIdx.value = -1
})

watch(isLiveConnected, (connected) => {
  if (!connected) {
    currentAiLiveMsgIdx.value = -1
    currentUserLiveMsgIdx.value = -1
  }
})
const inputText = ref('')
const messages = ref<ChatMessage[]>([])
const isLoading = ref(false)
const errorMsg = ref('')
const isListening = ref(false)
const isSpeaking = ref(false)
const isVoiceOutputEnabled = ref(true)
const isBlinking = ref(false)
const isInteracting = ref(false)

const chatBodyRef = ref<HTMLElement | null>(null)
const rootRef = ref<HTMLElement | null>(null)

let recognition: any = null
let currentUtterance: SpeechSynthesisUtterance | null = null
let blinkInterval: ReturnType<typeof setInterval> | null = null

const username = computed(() =>
  authStore.profile?.username ||
  authStore.user?.user_metadata?.full_name ||
  'Player'
)

// Dynamic Mascot Status Text in English
const mascotStatusText = computed(() => {
  if (isLiveConnecting.value) return 'Connecting to Gemini 3.1 Live...'
  if (isLiveSpeaking.value) return 'Gemini 3.1 Live speaking...'
  if (isLiveConnected.value) return '🔴 Gemini 3.1 Live Active (Listening)'
  if (isListening.value) return 'Listening to your voice...'
  if (isLoading.value) return 'Just a moment, finding your answer...'
  if (isSpeaking.value) return 'Speaking response aloud...'
  return 'Ready to guide & recommend Cores'
})

// Quick Action Hints in English
const quickHints = [
  '🎯 Which Support Core fits me best?',
  '⚡ Which Core is strongest right now?',
  '🔮 How do I use Argus Eyes?',
  '🏆 How can I rank up ELO fast?',
]

// Quick spoken phrases when user sends a question
const quickAckPhrases = [
  'Just a moment, let me check that for you!',
  'Got it! Give me a second to find your answer...',
  'Hold on a moment, getting your response ready...'
]

// Mascot Interactive Click Handler
function handleMascotClick() {
  isInteracting.value = true
  setTimeout(() => {
    isInteracting.value = false
  }, 1800)
}

// ── Automatic Blinking Animation Cycle ──────────────────────────────
function startBlinkCycle() {
  blinkInterval = setInterval(() => {
    isBlinking.value = true
    setTimeout(() => {
      isBlinking.value = false
    }, 200)
  }, 4000)
}


// ── Web Speech Synthesis (Text-to-Speech Output) ─────────────────────
function toggleVoiceOutput() {
  isVoiceOutputEnabled.value = !isVoiceOutputEnabled.value
  if (!isVoiceOutputEnabled.value && typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel()
    isSpeaking.value = false
  }
}

function getBestVoice(isVi: boolean): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null
  const voices = window.speechSynthesis.getVoices()
  if (!voices || voices.length === 0) return null

  const targetLang = isVi ? 'vi' : 'en'
  const langVoices = voices.filter(v => v.lang.toLowerCase().includes(targetLang))
  if (langVoices.length === 0) return voices[0] || null

  // Priority ranking list for most human-like male neural & natural voices matching Puck
  const priorityNames = [
    'guy online (natural)',
    'google us english',
    'google uk english male',
    'natural (male)',
    'neural (male)',
    'alex',
    'daniel',
    'fred',
    'jenny online (natural)',
    'aria online (natural)',
    'online (natural)',
    'samantha (enhanced)',
    'samantha',
    'enhanced',
    'natural',
    'neural'
  ]

  for (const nameKeyword of priorityNames) {
    const found = langVoices.find(v => v.name.toLowerCase().includes(nameKeyword))
    if (found) return found
  }

  return langVoices[0] || null
}

let speechQueue: SpeechSynthesisUtterance[] = []

function speakText(text: string, options?: { rate?: number; pitch?: number }) {
  if (!isVoiceOutputEnabled.value || typeof window === 'undefined' || !('speechSynthesis' in window)) return

  window.speechSynthesis.cancel()
  speechQueue = []

  // Clean markdown, symbols, emojis, and formatting before speaking
  const cleanText = text
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F6D0}-\u{1F6FF}\u{1F900}-\u{1F9FF}]/gu, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/<[^>]*>/g, '')
    .replace(/^[-•*]\s+/gm, '')
    .replace(/https?:\/\/\S+/g, '')
    .trim()

  if (!cleanText) {
    isSpeaking.value = false
    return
  }

  const isVi = /[àáảãạâầấẩẫậăằắẳẵặèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i.test(cleanText)
  const voice = getBestVoice(isVi)

  // Split text into natural sentence chunks for realistic human intonation & pauses
  const sentences = cleanText
    .split(/(?<=[.!?])\s+|\n+/)
    .map(s => s.trim())
    .filter(s => s.length > 0)

  if (sentences.length === 0) return

  isSpeaking.value = true

  sentences.forEach((sentence, index) => {
    const utterance = new SpeechSynthesisUtterance(sentence)
    utterance.lang = isVi ? 'vi-VN' : 'en-US'
    utterance.rate = options?.rate ?? 1.10
    utterance.pitch = options?.pitch ?? 0.95

    if (voice) {
      utterance.voice = voice
    }

    if (index === sentences.length - 1) {
      utterance.onend = () => {
        isSpeaking.value = false
      }
      utterance.onerror = () => {
        isSpeaking.value = false
      }
    }

    speechQueue.push(utterance)
    window.speechSynthesis.speak(utterance)
  })
}

// ── Click outside to close ──────────────────────────────────────────
function handleClickOutside(e: MouseEvent) {
  if (!isChatOpen.value) return
  if (rootRef.value && !rootRef.value.contains(e.target as Node)) {
    isChatOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
  startBlinkCycle()

  // Ensure voices are loaded asynchronously if needed by Chrome/Safari
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = () => {
      // Voices populated
    }
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside)
  if (blinkInterval) clearInterval(blinkInterval)
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel()
  }
})

// ── Toggle / Close ───────────────────────────────────────────────────
function toggleChat() {
  isChatOpen.value = !isChatOpen.value
  if (isChatOpen.value) {
    nextTick(() => scrollToBottom())
  } else {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      isSpeaking.value = false
    }
  }
}

function closeChat() {
  isChatOpen.value = false
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel()
    isSpeaking.value = false
  }
}

// ── Scroll helpers ───────────────────────────────────────────────────
function scrollToBottom() {
  nextTick(() => {
    if (chatBodyRef.value) {
      chatBodyRef.value.scrollTop = chatBodyRef.value.scrollHeight
    }
  })
}

// ── Quick hints ──────────────────────────────────────────────────────
function sendQuick(text: string) {
  inputText.value = text
  sendMessage()
}

// ── Send message with Player History Injection ───────────────────────
async function sendMessage() {
  const text = inputText.value.trim()
  if (!text || isLoading.value) return

  inputText.value = ''
  errorMsg.value = ''

  currentUserLiveMsgIdx.value = -1
  currentAiLiveMsgIdx.value = -1

  messages.value.push({ role: 'user', content: text })
  scrollToBottom()

  // Route text prompt directly into active Gemini 3.1 Live session
  if (isLiveConnected.value) {
    sendTextMessage(text)
    return
  }

  isLoading.value = true

  // Immediately speak a quick, friendly acknowledgment phrase so the user gets instant voice feedback
  const ack = quickAckPhrases[Math.floor(Math.random() * quickAckPhrases.length)]
  speakText(ack, { rate: 1.22 })

  // Hoisted so catch block can clean up empty placeholder on failure
  let msgIdx = -1

  try {
    const history = messages.value
      .slice(0, -1)
      .slice(-10)
      .map(m => ({ role: m.role, message: m.content }))

    const playerHistory = {
      coreHistory: gameStore.coreHistory || [],
      unlockedCores: authStore.profile?.unlocked_core_ids || [],
      elo: authStore.profile?.elo || 1000,
      activeCoreName: gameStore.activeCoreName
    }

    // ── SSE Streaming: AI types response token by token ──────────────
    const token = localStorage.getItem('arena_token') || ''
    let apiBase = import.meta.env.VITE_SERVER_URL
    if (!apiBase && typeof window !== 'undefined') {
      apiBase = window.location.protocol === 'https:' ? 'https://api.naenra.xyz' : `http://${window.location.hostname}:3000`
    }
    apiBase = apiBase || 'http://localhost:3000'
    const res = await fetch(`${apiBase}/api/ai/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ prompt: text, history, playerHistory }),
    })

    if (!res.ok || !res.body) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message || 'Failed to connect to AI Assistant')
    }

    // Push placeholder message, updated chunk-by-chunk as AI streams
    messages.value.push({ role: 'model', content: '' })
    msgIdx = messages.value.length - 1

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let fullText = ''
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
        if (payload === '[DONE]') break
        try {
          const parsed = JSON.parse(payload)
          if (parsed.chunk) {
            fullText += parsed.chunk
            messages.value[msgIdx] = { role: 'model', content: fullText }
            scrollToBottom()
          }
        } catch { /* skip malformed chunk */ }
      }
    }

    // Auto voice readout once full response is assembled
    if (fullText) {
      speakText(fullText)
    } else {
      // Stream ended with no content — remove empty placeholder and show error
      messages.value.splice(msgIdx, 1)
      errorMsg.value = 'No response from AI. Please try again.'
    }
  } catch (err: any) {
    // Remove empty placeholder bubble if stream failed before any content arrived
    if (msgIdx >= 0 && messages.value[msgIdx]?.content === '') {
      messages.value.splice(msgIdx, 1)
    }
    errorMsg.value = err.message || 'An error occurred. Please try again.'
  } finally {
    isLoading.value = false
    scrollToBottom()
  }
}

// ── Simple Markdown renderer ─────────────────────────────────────────
function renderMarkdown(raw: string): string {
  if (!raw) return ''
  let html = raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>')
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')
  html = html.replace(/\n/g, '<br/>')
  return html
}
</script>

<style scoped>
/* ── Root Container ──────────────────────────── */
.ai-chat-root {
  position: fixed;
  bottom: 24px;
  right: 88px;
  z-index: 9999;
  font-family: inherit;
}

/* ── Chat Window ─────────────────────────────── */
.chat-window {
  position: absolute;
  bottom: 72px;
  right: -64px;
  width: 410px;
  height: 560px;
  max-width: calc(100vw - 32px);
  max-height: calc(100vh - 120px);
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 2px solid rgba(254, 215, 170, 0.85);
  border-radius: 24px;
  box-shadow: 0 20px 50px rgba(234, 88, 12, 0.15), 0 10px 25px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

@media (max-width: 640px) {
  .chat-window {
    right: -72px;
  }
}

/* ── Accent Bar ──────────────────────────────── */
.chat-accent-bar {
  height: 4px;
  background: linear-gradient(90deg, #ff7b00, #e63946, #f59e0b);
}

/* ── Header & Cyber Mascot Avatar ────────────── */
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid rgba(254, 215, 170, 0.6);
  background: rgba(255, 245, 236, 0.75);
}

.chat-header-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Cyber Mascot Avatar Box (Eyes + Mouth) */
.cyber-mascot-box {
  width: 44px;
  height: 44px;
  border-radius: 16px;
  background: linear-gradient(135deg, #111827 0%, #1f2937 100%);
  border: 2.5px solid #ea580c;
  box-shadow: 0 0 14px rgba(234, 88, 12, 0.45);
  position: relative;
}
.cyber-mascot-box:hover {
  transform: scale(1.06);
  border-color: #ff7b00;
  box-shadow: 0 0 20px rgba(255, 123, 0, 0.6);
}

/* Glowing Cyber Eyes */
.cyber-eye {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #f97316;
  box-shadow: 0 0 8px #f97316, 0 0 14px #ea580c;
  transition: all 0.2s ease;
}

.eye-blink {
  height: 2px !important;
  border-radius: 2px !important;
  box-shadow: 0 0 4px #f97316 !important;
}

.eye-wide {
  width: 11px !important;
  height: 11px !important;
  background: #ef4444 !important;
  box-shadow: 0 0 14px #ef4444 !important;
}

.eye-happy {
  width: 10px !important;
  height: 5px !important;
  border-top-left-radius: 10px !important;
  border-top-right-radius: 10px !important;
  border-bottom-left-radius: 0 !important;
  border-bottom-right-radius: 0 !important;
  background: #fbbf24 !important;
}

.eye-think {
  background: #f59e0b !important;
  box-shadow: 0 0 12px #f59e0b !important;
}

/* Lip Sync Mouth Animations */
.animate-lip-1 {
  animation: lipMove 0.4s ease-in-out infinite alternate;
}
.animate-lip-2 {
  animation: lipMove 0.4s ease-in-out infinite alternate 0.15s;
}
.animate-lip-3 {
  animation: lipMove 0.4s ease-in-out infinite alternate 0.3s;
}

@keyframes lipMove {
  0% { height: 2px; }
  100% { height: 10px; }
}

.mascot-pulse-listening {
  border-color: #ef4444 !important;
  box-shadow: 0 0 20px rgba(239, 68, 68, 0.8) !important;
  animation: mascot-pulse 1s infinite alternate;
}

.mascot-glow-thinking {
  border-color: #f59e0b !important;
  box-shadow: 0 0 20px rgba(245, 158, 11, 0.8) !important;
}

.mascot-talk-speaking {
  border-color: #10b981 !important;
  box-shadow: 0 0 20px rgba(16, 185, 129, 0.8) !important;
}

.mascot-interactive-click {
  animation: mascot-spin-bounce 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes mascot-pulse {
  0% { transform: scale(1); }
  100% { transform: scale(1.08); }
}

@keyframes mascot-spin-bounce {
  0% { transform: scale(1) rotate(0deg); }
  50% { transform: scale(1.2) rotate(15deg); }
  100% { transform: scale(1) rotate(0deg); }
}

.chat-title {
  font-size: 15px;
  font-weight: 900;
  color: #1e293b;
  margin: 0;
  line-height: 1.2;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.chat-badge {
  font-size: 9px;
  font-weight: 900;
  padding: 2px 6px;
  border-radius: 6px;
  background: #ffedd5;
  color: #ea580c;
  border: 1px solid #fed7aa;
}

.chat-subtitle {
  font-size: 11px;
  color: #64748b;
  margin: 2px 0 0 0;
  font-weight: 700;
}

.chat-icon-btn {
  background: #ffffff;
  border: 1px solid #fed7aa;
  color: #64748b;
  cursor: pointer;
  padding: 6px 9px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.04);
}
.chat-icon-btn:hover {
  background: #fff7ed;
  color: #ea580c;
  border-color: #fdba74;
}
.chat-icon-btn--active {
  background: #ffedd5;
  border-color: #f97316;
  color: #ea580c;
}

.chat-close-btn {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  color: #64748b;
  cursor: pointer;
  padding: 6px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.04);
}
.chat-close-btn:hover {
  background: #fee2e2;
  color: #ef4444;
  border-color: #fca5a5;
}

/* ── Body ────────────────────────────────────── */
.chat-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  scroll-behavior: smooth;
  background: linear-gradient(180deg, rgba(255, 245, 236, 0.5) 0%, rgba(255, 255, 255, 0) 100%);
}

.chat-welcome {
  text-align: center;
  padding: 14px 10px;
  color: #475569;
  font-size: 13px;
  line-height: 1.6;
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid #fed7aa;
  border-radius: 20px;
  box-shadow: 0 4px 15px rgba(251, 146, 60, 0.06);
}

.chat-quick-hints {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.chat-quick-btn {
  background: #ffffff;
  border: 1px solid #fed7aa;
  border-bottom: 3px solid #fdba74;
  color: #ea580c;
  font-size: 11px;
  font-weight: 800;
  padding: 7px 13px;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: 0 2px 6px rgba(251, 146, 60, 0.08);
}
.chat-quick-btn:hover {
  background: linear-gradient(135deg, #ff7b00, #e63946);
  border-color: #ea580c;
  border-bottom-color: #991b1b;
  color: #ffffff;
  transform: translateY(-2px);
  box-shadow: 0 6px 14px rgba(234, 88, 12, 0.25);
}
.chat-quick-btn:active {
  transform: translateY(1px);
  border-bottom-width: 1px;
}

/* ── Message Bubbles ─────────────────────────── */
.chat-bubble-wrap {
  display: flex;
  flex-direction: column;
}
.chat-bubble-wrap--user {
  align-items: flex-end;
}
.chat-bubble-wrap--ai {
  align-items: flex-start;
}

.chat-bubble {
  max-width: 88%;
  padding: 11px 15px;
  border-radius: 18px;
  font-size: 13px;
  line-height: 1.55;
  word-break: break-word;
}

.chat-bubble--user {
  background: linear-gradient(135deg, #ff7b00 0%, #e63946 100%);
  color: #ffffff;
  border-bottom-right-radius: 4px;
  box-shadow: 0 6px 18px rgba(234, 88, 12, 0.25);
  font-weight: 600;
}

.chat-bubble--ai {
  background: #ffffff;
  border: 1px solid #fed7aa;
  color: #1e293b;
  border-bottom-left-radius: 4px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
}

.chat-bubble-label {
  font-size: 11px;
}

.chat-bubble-text {
  margin: 0;
}
.chat-bubble-text :deep(code) {
  background: #fff7ed;
  border: 1px solid #fed7aa;
  padding: 2px 6px;
  border-radius: 6px;
  font-family: monospace;
  font-size: 12px;
  color: #c2410c;
  font-weight: 700;
}

/* ── Typing Indicator ────────────────────────── */
.chat-typing {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 10px 14px;
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #fed7aa;
  border-bottom-left-radius: 4px;
  width: fit-content;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
}
.chat-typing span:not(:first-child) {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #f97316;
  animation: typing 1.2s infinite ease-in-out;
}
.chat-typing span:nth-child(3) { animation-delay: 0.2s; }
.chat-typing span:nth-child(4) { animation-delay: 0.4s; }

@keyframes typing {
  0%, 100% { opacity: 0.3; transform: translateY(0); }
  50% { opacity: 1; transform: translateY(-4px); }
}

/* ── Error ───────────────────────────────────── */
.chat-error {
  background: #fef2f2;
  border: 1px solid #fca5a5;
  color: #991b1b;
  font-size: 12px;
  font-weight: 600;
  padding: 9px 13px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.chat-error-dismiss {
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  font-size: 13px;
  font-weight: bold;
}

/* ── Live Wave Bar ────────────────────────────── */
.voice-wave-bar {
  background: #fff7ed;
  border-top: 1px solid #fed7aa;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.voice-status-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #94a3b8;
  transition: all 0.3s;
}

.pulse-dot--active {
  background: #ef4444;
  box-shadow: 0 0 10px #ef4444;
}

.voice-status-text {
  color: #9a3412;
}

.waveform-anim {
  display: flex;
  align-items: center;
  gap: 3px;
  height: 16px;
}

.wave-bar {
  width: 3px;
  height: 4px;
  background: #f97316;
  border-radius: 2px;
  transition: height 0.2s;
}

.waveform-anim--active .wave-bar {
  animation: wave 1s ease-in-out infinite alternate;
}

.waveform-anim--active .wave-bar:nth-child(1) { animation-delay: 0.1s; }
.waveform-anim--active .wave-bar:nth-child(2) { animation-delay: 0.3s; }
.waveform-anim--active .wave-bar:nth-child(3) { animation-delay: 0.2s; }
.waveform-anim--active .wave-bar:nth-child(4) { animation-delay: 0.4s; }
.waveform-anim--active .wave-bar:nth-child(5) { animation-delay: 0.15s; }

@keyframes wave {
  0% { height: 4px; background: #f97316; }
  100% { height: 16px; background: #dc2626; }
}

/* ── Footer / Input ──────────────────────────── */
.chat-footer {
  padding: 12px 16px;
  background: #ffffff;
  border-top: 1px solid #fed7aa;
}

.chat-input-wrap {
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 16px;
  padding: 6px 8px;
  transition: all 0.2s;
}
.chat-input-wrap:focus-within {
  border-color: #f97316;
  background: #ffffff;
  box-shadow: 0 0 14px rgba(249, 115, 22, 0.2);
}

.chat-input {
  background: transparent;
  border: none;
  color: #1e293b;
  font-size: 13px;
  font-weight: 600;
  outline: none;
}
.chat-input::placeholder {
  color: #94a3b8;
}

.chat-mic-btn {
  background: #fff7ed;
  border: 1px solid #fed7aa;
  color: #ea580c;
  width: 36px;
  height: 36px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 6px rgba(251, 146, 60, 0.1);
}
.chat-mic-btn:hover {
  background: #ffedd5;
  color: #c2410c;
  border-color: #f97316;
  transform: scale(1.05);
}
.chat-mic-btn--listening {
  background: linear-gradient(135deg, #ef4444, #dc2626) !important;
  color: #ffffff !important;
  border-color: #fca5a5 !important;
  box-shadow: 0 0 14px rgba(239, 68, 68, 0.6) !important;
}

.chat-send-btn {
  background: linear-gradient(135deg, #ff7b00, #e63946);
  border: none;
  color: #ffffff;
  width: 36px;
  height: 36px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(234, 88, 12, 0.25);
}
.chat-send-btn:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(234, 88, 12, 0.4);
}
.chat-send-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* FAB Floating Cyber Eyes */
.fab-cyber-eyes {
  display: flex;
  align-items: center;
  gap: 5px;
}

.fab-eye {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 0 8px #ffffff, 0 0 12px #fed7aa;
  animation: fab-eye-glow 2s infinite alternate;
}

@keyframes fab-eye-glow {
  0% { transform: scale(1); box-shadow: 0 0 6px #ffffff; }
  100% { transform: scale(1.25); box-shadow: 0 0 14px #ffffff; }
}

/* ── FAB Button ──────────────────────────────── */
.chat-fab {
  position: relative;
  width: 58px;
  height: 58px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff7b00 0%, #e63946 100%);
  border: 3px solid #ffffff;
  color: #ffffff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12px 35px rgba(234, 88, 12, 0.45);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.chat-fab:hover {
  transform: scale(1.1) rotate(3deg);
  box-shadow: 0 16px 40px rgba(234, 88, 12, 0.6);
}
.chat-fab--open {
  background: linear-gradient(135deg, #1e293b, #0f172a);
  border-color: #fdba74;
}

.chat-fab-glow {
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff7b00, #e63946);
  filter: blur(10px);
  opacity: 0.6;
  z-index: -1;
  transition: opacity 0.25s;
}
.chat-fab:hover .chat-fab-glow {
  opacity: 0.9;
}
.chat-fab--open .chat-fab-glow {
  opacity: 0;
}

.chat-fab-dot {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #22c55e;
  border: 2px solid #ffffff;
  animation: dot-pulse 2s ease-in-out infinite;
}
@keyframes dot-pulse {
  0%, 100% { transform: scale(1); }
  50%       { transform: scale(1.2); }
}

/* ── Spinner & Animations ─────────────────────── */
.spin {
  animation: spin 0.9s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

.animate-bounce-slow {
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

/* ── Transitions ─────────────────────────────── */
.chat-slide-enter-active,
.chat-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.chat-slide-enter-from,
.chat-slide-leave-to {
  opacity: 0;
  transform: translateY(16px) scale(0.96);
}

.icon-swap-enter-active,
.icon-swap-leave-active {
  transition: all 0.18s ease;
}
.icon-swap-enter-from,
.icon-swap-leave-to {
  opacity: 0;
  transform: scale(0.7) rotate(15deg);
}
</style>


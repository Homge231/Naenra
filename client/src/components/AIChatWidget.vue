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
              <div class="cyber-mouth mt-1 z-10 flex items-center justify-center">
                <!-- When Speaking: Animated Real-Time Mouth Bars (Lip Sync) -->
                <div v-if="isSpeaking" class="talking-mouth flex items-center gap-0.5 h-2">
                  <span class="mouth-bar bar-1 bg-cyan-300 w-1 rounded-full animate-lip-1"></span>
                  <span class="mouth-bar bar-2 bg-cyan-300 w-1 rounded-full animate-lip-2"></span>
                  <span class="mouth-bar bar-3 bg-cyan-300 w-1 rounded-full animate-lip-3"></span>
                </div>
                <!-- When Listening: Pulsing O Mouth -->
                <div v-else-if="isListening" class="listening-mouth w-2 h-2 rounded-full border-2 border-red-400 animate-ping"></div>
                <!-- When Interacting / Happy: Curved Smile -->
                <div v-else-if="isInteracting" class="smile-mouth w-3.5 h-1.5 border-b-2 border-cyan-300 rounded-b-full"></div>
                <!-- Idle Smile Dot Line -->
                <div v-else class="idle-mouth w-3 h-0.5 bg-cyan-400/80 rounded-full group-hover:w-4 transition-all"></div>
              </div>

              <!-- Cyber Aura Glow Ring -->
              <div class="cyber-mascot-aura"></div>
            </div>

            <div>
              <h3 class="chat-title flex items-center gap-1.5">
                Naenra Assistant
                <span class="chat-badge">CYBER AI</span>
              </h3>
              <p class="chat-subtitle">
                {{ mascotStatusText }}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-1.5">
            <!-- Voice Output TTS Toggle Button -->
            <button
              @click="toggleVoiceOutput"
              class="chat-icon-btn"
              :class="{ 'chat-icon-btn--active': isVoiceOutputEnabled }"
              :title="isVoiceOutputEnabled ? 'Mute Voice Readout (TTS)' : 'Enable Voice Readout (TTS)'"
            >
              <span v-if="isVoiceOutputEnabled" class="text-sm">🔊</span>
              <span v-else class="text-sm opacity-50">🔇</span>
            </button>

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
            <div class="chat-welcome-mascot-box mb-3">
              <span class="text-4xl animate-bounce-slow inline-block">🤖</span>
            </div>
            <p class="text-sm text-gray-200">
              Welcome <strong class="chat-username text-orange-400 font-extrabold">{{ username }}</strong>!<br/>
              I am your **Naenra Cyber Assistant**. Type your question or click **Voice Input 🎙️** to speak to me hands-free!
            </p>
            
            <!-- Quick Action Hints in English -->
            <div class="chat-quick-hints mt-4">
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
            <div :class="['chat-bubble', msg.role === 'user' ? 'chat-bubble--user' : 'chat-bubble--ai']">
              <div class="flex items-center justify-between gap-2 mb-1 border-b border-white/10 pb-1" v-if="msg.role !== 'user'">
                <span class="chat-bubble-label flex items-center gap-1 text-cyan-400 font-bold">
                  <span>🤖</span> Naenra Cyber Guide
                </span>
                <button 
                  v-if="msg.content" 
                  @click="speakText(msg.content)" 
                  class="text-[10px] font-bold text-cyan-300 hover:text-white transition-colors flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-full cursor-pointer"
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
            <span class="text-xs text-cyan-400 font-bold mr-2">Cyber AI thinking...</span>
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
              {{ isListening ? '🎙️ Listening to your voice...' : '🔊 Speaking response...' }}
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

        <!-- Input Footer & Prominent Voice Recording Button -->
        <div class="chat-footer">

          <div class="chat-input-wrap flex items-center gap-2">
            <!-- 🎙️ PROMINENT VOICE RECORDING BUTTON -->
            <button
              @click="toggleSpeechRecognition"
              type="button"
              class="prominent-voice-btn shrink-0 flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border shadow-md"
              :class="isListening 
                ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white border-red-400 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.6)]' 
                : 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white border-cyan-400 hover:scale-105 hover:shadow-[0_0_15px_rgba(6,182,212,0.5)]'"
              id="ai-chat-mic-btn"
              title="Click to speak using your microphone (Voice Input)"
            >
              <span class="text-base animate-bounce-slow">🎙️</span>
              <span>{{ isListening ? 'Listening...' : 'Voice Input' }}</span>
            </button>

            <!-- Text Input Field -->
            <input
              v-model="inputText"
              @keyup.enter="sendMessage"
              :disabled="isLoading"
              type="text"
              placeholder="Ask a question or click Voice Input..."
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

          <div class="flex justify-between items-center mt-2 px-1 text-[10px] text-gray-400 font-semibold">
            <span>💡 Click <strong class="text-cyan-300">🎙️ Voice Input</strong> to speak hands-free</span>
            <span class="text-cyan-400 font-bold">Gemini 3.5 Flash</span>
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
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useAuthStore } from '../stores/authStore'
import { useGameStore } from '../stores/gameStore'
import { fetchWithAuth } from '../services/api'

interface ChatMessage {
  role: 'user' | 'model'
  content: string
}

const authStore = useAuthStore()
const gameStore = useGameStore()

const isChatOpen = ref(false)
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
  if (isListening.value) return 'Listening to your voice...'
  if (isLoading.value) return 'Analyzing & generating response...'
  if (isSpeaking.value) return 'Speaking response aloud...'
  return 'Ready to guide & recommend Cores'
})

// Quick Action Hints in English
const quickHints = [
  '🎯 Which Core should I use?',
  '⚡ Which Core is strongest?',
  '🔮 How to use Oracle Core?',
  '🏆 How to rank up fast?',
]

// Mascot Interactive Click Handler
function handleMascotClick() {
  isInteracting.value = true
  setTimeout(() => {
    isInteracting.value = false
  }, 1800)
}

// Automatic Blinking Animation Cycle
function startBlinkCycle() {
  blinkInterval = setInterval(() => {
    isBlinking.value = true
    setTimeout(() => {
      isBlinking.value = false
    }, 200)
  }, 4000)
}

// ── Web Speech API Recognition (Voice Input) ───────────────────────
function initSpeechRecognition() {
  if (typeof window === 'undefined') return
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  if (!SpeechRecognition) return

  recognition = new SpeechRecognition()
  recognition.continuous = false
  recognition.interimResults = true
  recognition.lang = 'en-US'

  recognition.onstart = () => {
    isListening.value = true
    errorMsg.value = ''
  }

  recognition.onresult = (event: any) => {
    let transcript = ''
    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript
    }
    if (transcript.trim()) {
      inputText.value = transcript
    }
  }

  recognition.onerror = (event: any) => {
    console.warn('Speech recognition error:', event.error)
    isListening.value = false
    if (event.error === 'not-allowed' || event.error === 'permission-denied') {
      errorMsg.value = '🎙️ Microphone access denied. Please allow microphone permission in your browser settings and try again.'
    } else if (event.error === 'network') {
      errorMsg.value = '🌐 Network error. Speech recognition requires an internet connection. Please check your connection.'
    } else if (event.error === 'no-speech') {
      // Silently ignore — user just didn't say anything
    } else if (event.error === 'service-not-allowed') {
      errorMsg.value = '🔒 Speech recognition not allowed. Please use HTTPS or grant microphone permission.'
    } else if (event.error === 'audio-capture') {
      errorMsg.value = '🎤 No microphone detected. Please connect a microphone and try again.'
    } else {
      errorMsg.value = `Speech error: ${event.error}. Please try again.`
    }
  }

  recognition.onend = () => {
    isListening.value = false
    if (inputText.value.trim()) {
      sendMessage()
    }
  }
}

function toggleSpeechRecognition() {
  if (!recognition) {
    initSpeechRecognition()
  }
  if (!recognition) {
    errorMsg.value = 'Browser does not support speech recognition (Web Speech API).'
    return
  }

  if (isListening.value) {
    recognition.stop()
    isListening.value = false
  } else {
    try {
      recognition.start()
    } catch (e) {
      console.warn('Recognition already started:', e)
    }
  }
}

// ── Web Speech Synthesis (Text-to-Speech Output) ─────────────────────
function toggleVoiceOutput() {
  isVoiceOutputEnabled.value = !isVoiceOutputEnabled.value
  if (!isVoiceOutputEnabled.value && typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel()
    isSpeaking.value = false
  }
}

function speakText(text: string) {
  if (!isVoiceOutputEnabled.value || typeof window === 'undefined' || !('speechSynthesis' in window)) return

  window.speechSynthesis.cancel()

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

  if (!cleanText) return

  currentUtterance = new SpeechSynthesisUtterance(cleanText)
  const isVi = /[àáảãạâầấẩẫậăằắẳẵặèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i.test(cleanText)
  const targetLang = isVi ? 'vi-VN' : 'en-US'
  currentUtterance.lang = targetLang
  currentUtterance.rate = 1.0
  currentUtterance.pitch = 1.05

  // Pick the best natural voice if available
  const voices = window.speechSynthesis.getVoices()
  const bestVoice = voices.find(v => v.lang.includes(isVi ? 'vi' : 'en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Microsoft') || v.name.includes('Samantha')))
  if (bestVoice) {
    currentUtterance.voice = bestVoice
  }

  currentUtterance.onstart = () => {
    isSpeaking.value = true
  }

  currentUtterance.onend = () => {
    isSpeaking.value = false
  }

  currentUtterance.onerror = () => {
    isSpeaking.value = false
  }

  window.speechSynthesis.speak(currentUtterance)
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
  initSpeechRecognition()
  startBlinkCycle()
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside)
  if (blinkInterval) clearInterval(blinkInterval)
  if (recognition) {
    try { recognition.stop() } catch (e) {}
  }
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

  messages.value.push({ role: 'user', content: text })
  scrollToBottom()

  isLoading.value = true

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

    const res = await fetchWithAuth('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: text, history, playerHistory }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message || 'Failed to connect to AI Assistant')
    }

    const data = await res.json()
    const replyText = data.reply || 'Sorry, I could not generate a response.'
    messages.value.push({ role: 'model', content: replyText })

    // Auto voice readout
    speakText(replyText)
  } catch (err: any) {
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
  right: 24px;
  z-index: 9999;
  font-family: inherit;
}

/* ── Chat Window ─────────────────────────────── */
.chat-window {
  position: absolute;
  bottom: 72px;
  right: 0;
  width: 410px;
  height: 560px;
  max-width: calc(100vw - 32px);
  max-height: calc(100vh - 110px);
  background: rgba(15, 23, 42, 0.96);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 24px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.7), 0 0 40px rgba(6, 182, 212, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ── Accent Bar ──────────────────────────────── */
.chat-accent-bar {
  height: 4px;
  background: linear-gradient(90deg, #f97316, #06b6d4, #a855f7);
}

/* ── Header & Cyber Mascot Avatar ────────────── */
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
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
  background: linear-gradient(135deg, #090d16, #1e293b);
  border: 2px solid rgba(6, 182, 212, 0.6);
  box-shadow: 0 0 16px rgba(6, 182, 212, 0.4);
  position: relative;
}
.cyber-mascot-box:hover {
  transform: scale(1.06);
  border-color: #22d3ee;
}

/* Glowing Cyber Eyes */
.cyber-eye {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #22d3ee;
  box-shadow: 0 0 10px #22d3ee, 0 0 18px #06b6d4;
  transition: all 0.2s ease;
}

.eye-blink {
  height: 2px !important;
  border-radius: 2px !important;
  box-shadow: 0 0 4px #22d3ee !important;
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
  background: #38bdf8 !important;
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
  font-size: 14px;
  font-weight: 800;
  color: #f8fafc;
  margin: 0;
  line-height: 1.2;
}

.chat-badge {
  font-size: 8px;
  font-weight: 900;
  padding: 1px 5px;
  border-radius: 4px;
  background: rgba(6, 182, 212, 0.25);
  color: #67e8f9;
  border: 1px solid rgba(6, 182, 212, 0.4);
}

.chat-subtitle {
  font-size: 11px;
  color: #94a3b8;
  margin: 2px 0 0 0;
  font-weight: 600;
}

.chat-icon-btn {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #94a3b8;
  cursor: pointer;
  padding: 5px 8px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.chat-icon-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  color: #f8fafc;
}
.chat-icon-btn--active {
  background: rgba(6, 182, 212, 0.2);
  border-color: rgba(6, 182, 212, 0.4);
  color: #67e8f9;
}

.chat-close-btn {
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 6px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.chat-close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #f8fafc;
}

/* ── Body ────────────────────────────────────── */
.chat-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  scroll-behavior: smooth;
}

.chat-welcome {
  text-align: center;
  padding: 12px 8px;
  color: #cbd5e1;
  font-size: 13px;
  line-height: 1.5;
}

.chat-quick-hints {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
}

.chat-quick-btn {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #67e8f9;
  font-size: 11px;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}
.chat-quick-btn:hover {
  background: rgba(6, 182, 212, 0.25);
  border-color: rgba(6, 182, 212, 0.5);
  color: #ffffff;
  transform: scale(1.03);
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
  padding: 10px 14px;
  border-radius: 14px;
  font-size: 13px;
  line-height: 1.5;
  word-break: break-word;
}

.chat-bubble--user {
  background: linear-gradient(135deg, #f97316, #ea580c);
  color: #ffffff;
  border-bottom-right-radius: 4px;
  box-shadow: 0 4px 14px rgba(249, 115, 22, 0.35);
}

.chat-bubble--ai {
  background: rgba(30, 41, 59, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #e2e8f0;
  border-bottom-left-radius: 4px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
}

.chat-bubble-label {
  font-size: 10px;
}

.chat-bubble-text {
  margin: 0;
}
.chat-bubble-text :deep(code) {
  background: rgba(0, 0, 0, 0.4);
  padding: 2px 5px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
  color: #67e8f9;
}

/* ── Typing Indicator ────────────────────────── */
.chat-typing {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  background: rgba(30, 41, 59, 0.8);
  border-radius: 14px;
  border-bottom-left-radius: 4px;
  width: fit-content;
}
.chat-typing span:not(:first-child) {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #67e8f9;
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
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.4);
  color: #fca5a5;
  font-size: 12px;
  padding: 8px 12px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.chat-error-dismiss {
  background: none;
  border: none;
  color: #fca5a5;
  cursor: pointer;
  font-size: 12px;
}

/* ── Live Wave Bar ────────────────────────────── */
.voice-wave-bar {
  background: rgba(15, 23, 42, 0.95);
  border-top: 1px solid rgba(6, 182, 212, 0.3);
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
  color: #cbd5e1;
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
  background: #06b6d4;
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
  0% { height: 4px; background: #06b6d4; }
  100% { height: 16px; background: #ef4444; }
}

/* ── Footer / Input ──────────────────────────── */
.chat-footer {
  padding: 12px 16px;
  background: rgba(15, 23, 42, 0.98);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.chat-input-wrap {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 14px;
  padding: 6px 8px;
}
.chat-input-wrap:focus-within {
  border-color: rgba(6, 182, 212, 0.6);
  box-shadow: 0 0 14px rgba(6, 182, 212, 0.25);
}

.chat-input {
  background: transparent;
  border: none;
  color: #f8fafc;
  font-size: 13px;
  outline: none;
}
.chat-input::placeholder {
  color: #64748b;
}

.chat-send-btn {
  background: linear-gradient(135deg, #f97316, #ea580c);
  border: none;
  color: #ffffff;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}
.chat-send-btn:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 0 12px rgba(249, 115, 22, 0.5);
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
  background: #22d3ee;
  box-shadow: 0 0 10px #22d3ee, 0 0 15px #06b6d4;
  animation: fab-eye-glow 2s infinite alternate;
}

@keyframes fab-eye-glow {
  0% { transform: scale(1); box-shadow: 0 0 6px #22d3ee; }
  100% { transform: scale(1.25); box-shadow: 0 0 14px #22d3ee; }
}

/* ── FAB Button ──────────────────────────────── */
.chat-fab {
  position: relative;
  width: 54px;
  height: 54px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0f172a, #1e293b);
  border: 2px solid rgba(6, 182, 212, 0.6);
  color: #ffffff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.chat-fab:hover {
  transform: scale(1.08);
}
.chat-fab--open {
  background: linear-gradient(135deg, #1e293b, #0f172a);
}

.chat-fab-glow {
  position: absolute;
  inset: -3px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f97316, #06b6d4);
  filter: blur(8px);
  opacity: 0.5;
  z-index: -1;
  transition: opacity 0.25s;
}
.chat-fab:hover .chat-fab-glow {
  opacity: 0.8;
}
.chat-fab--open .chat-fab-glow {
  opacity: 0;
}

.chat-fab-dot {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #22c55e;
  border: 2px solid #070c1c;
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

<template>
  <!-- Floating container — fixed bottom-right -->
  <div class="ai-chat-root" ref="rootRef">

    <!-- Chat Window Overlay -->
    <Transition name="chat-slide">
      <div
        v-if="isChatOpen"
        class="chat-window shadow-2xl"
        role="dialog"
        aria-label="Naenra AI Assistant"
      >
        <!-- Top gradient accent bar -->
        <div class="chat-accent-bar"></div>

        <!-- Header: Featuring Interactive Glowing AI Avatar (Eyes & Animated Talking Mouth) -->
        <div class="chat-header">
          <div class="chat-header-info">
            
            <!-- 🤖 INTERACTIVE AI MASCOT AVATAR (Glowing Eyes + Lip-Synced Mouth) -->
            <MascotAvatar
              :is-listening="isListening"
              :is-loading="isLoading"
              :is-streaming="isStreaming"
              :is-speaking="isSpeaking"
              :is-live-speaking="isLiveSpeaking"
              :is-live-connected="isLiveConnected"
              :audio-amplitude="audioAmplitude"
            />

            <div>
              <h3 class="chat-title flex items-center gap-1.5">
                Naenra Assistant
                <span class="chat-badge">
                  AI
                </span>
              </h3>
              <p class="chat-subtitle">
                {{ mascotStatusText }}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-1.5">
            <!-- Voice TTS Toggle Button -->
            <button
              @click="toggleVoiceOutput"
              class="chat-icon-btn"
              :class="{ 'chat-icon-btn--active': isVoiceOutputEnabled }"
              :title="isVoiceOutputEnabled ? 'Voice TTS Enabled (Click to mute)' : 'Voice TTS Muted (Click to enable)'"
              aria-label="Toggle Voice Audio"
            >
              <span v-if="isVoiceOutputEnabled" class="text-xs">🔊</span>
              <span v-else class="text-xs opacity-60">🔇</span>
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
            <div class="chat-welcome-mascot-box mb-2">
              <span class="text-4xl animate-bounce-slow inline-block">🤖</span>
            </div>
            <p class="text-xs text-gray-700 font-medium leading-relaxed">
              Welcome <strong class="chat-username text-orange-600 font-extrabold">{{ username }}</strong> to **Naenra AI Assistant**!<br/>
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
            <!-- AI bubble: render if user, or if content started or currently streaming into this index -->
            <div
              v-if="msg.role === 'user' || msg.content.length > 0 || (isStreaming && streamingMsgIdx === idx)"
              :class="['chat-bubble', msg.role === 'user' ? 'chat-bubble--user' : 'chat-bubble--ai']"
            >
              <div class="flex items-center justify-between gap-2 mb-1.5 border-b border-orange-100 pb-1" v-if="msg.role !== 'user'">
                <span class="chat-bubble-label flex items-center gap-1 text-orange-600 font-bold">
                  <span>🤖</span> Naenra AI Guide
                </span>
                <button 
                  v-if="msg.content && (!isStreaming || streamingMsgIdx !== idx)" 
                  @click="speakText(msg.content)" 
                  class="text-[10px] font-bold text-orange-600 hover:text-white hover:bg-orange-500 transition-colors flex items-center gap-1 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full cursor-pointer"
                  title="Read aloud using Voice TTS"
                >
                  🔊 Read
                </button>
              </div>

              <div
                v-if="msg.role !== 'user'"
                class="chat-bubble-text leading-relaxed relative"
              >
                <span v-html="renderMarkdown(msg.content)"></span>
                <!-- ChatGPT-style Real-time Blinking Cursor while streaming -->
                <span
                  v-if="isStreaming && streamingMsgIdx === idx"
                  class="chat-cursor"
                  aria-hidden="true"
                ></span>
              </div>
              <p v-else class="chat-bubble-text">{{ msg.content }}</p>
            </div>
          </div>

          <!-- Typing indicator (only shown before stream chunks start arriving) -->
          <div v-if="isLoading && !isStreaming" class="chat-typing">
            <span class="text-xs text-orange-600 font-bold mr-2">AI thinking...</span>
            <span></span><span></span><span></span>
          </div>

          <!-- Error Message -->
          <div v-if="errorMsg" class="chat-error">
            <span>⚠️ {{ errorMsg }}</span>
            <button @click="errorMsg = ''" class="chat-error-dismiss">✕</button>
          </div>
        </div>

        <!-- Voice Live Wavebar Visualizer & Active Push-to-Talk Recording Banner -->
        <div v-if="isHoldingMic || isListening || isSpeaking" class="voice-wave-bar flex items-center justify-between">
          <div class="voice-status-info flex items-center gap-2">
            <span class="pulse-dot" :class="{ 'pulse-dot--active': isHoldingMic || isListening || isSpeaking }"></span>
            <span class="voice-status-text font-bold text-xs">
              <span v-if="isHoldingMic" class="text-red-600 animate-pulse">🔴 Recording voice... (Release mic button to send payload)</span>
              <span v-else-if="isListening">🎙️ Listening to your voice...</span>
              <span v-else>🔊 Speaking response aloud...</span>
            </span>
          </div>
          <div class="flex items-center gap-2">
            <button
              v-if="isSpeaking"
              @click="stopSpeaking"
              class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-orange-100 hover:bg-orange-200 text-orange-700 border border-orange-300 cursor-pointer transition-colors"
              title="Stop voice audio"
            >
              ⏹ Stop
            </button>
            <div class="waveform-anim" :class="{ 'waveform-anim--active': isHoldingMic || isListening || isSpeaking }">
              <span class="wave-bar"></span>
              <span class="wave-bar"></span>
              <span class="wave-bar"></span>
              <span class="wave-bar"></span>
              <span class="wave-bar"></span>
            </div>
          </div>
        </div>

        <!-- Footer: Text Input + Hold-to-Talk Mic Button -->
        <div class="chat-footer">
          <div class="chat-input-wrap flex items-center gap-2">

            <!-- 🎙️ UNIFIED PTT MIC BUTTON — Gemini Live preferred, Web STT fallback -->
            <!-- Hold to speak → streams to Gemini Live (or Web STT if unavailable). Release to stop. -->
            <button
              v-if="!isLiveConnected"
              @mousedown.prevent.stop="unifiedMicPress"
              @touchstart.prevent.stop="unifiedMicPress"
              type="button"
              id="ai-chat-mic-btn"
              class="chat-mic-btn shrink-0 relative select-none"
              :class="{
                'chat-mic-btn--listening': isHoldingMic,
                'opacity-60 animate-pulse': isLiveConnecting,
                'cursor-not-allowed opacity-40': isAiSpeaking || isMicLocked
              }"
              :disabled="isAiSpeaking || isMicLocked"
              :title="isAiSpeaking ? '🔒 Wait for AI to finish' : isLiveConnecting ? 'Connecting...' : isHoldingMic ? '🔴 Recording — release to send' : 'Hold to speak'"
            >
              <span v-if="isLiveConnecting" class="text-sm">⏳</span>
              <span v-else-if="isHoldingMic" class="text-sm text-red-400 animate-pulse">🔴</span>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              <!-- Active ping indicator when recording -->
              <span v-if="isHoldingMic" class="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
            </button>

            <!-- PTT Active (Gemini Live connected): hold to stream + disconnect button -->
            <div v-else class="flex items-center gap-1 shrink-0">
              <button
                @mousedown.prevent.stop="unifiedMicPress"
                @touchstart.prevent.stop="unifiedMicPress"
                type="button"
                class="chat-mic-btn relative select-none"
                :class="{
                  'chat-mic-btn--listening': !isMicPaused && !isMicLocked,
                  'opacity-40 cursor-not-allowed': isMicLocked
                }"
                :disabled="isMicLocked"
                :title="isMicLocked ? '🔒 AI is speaking — mic locked' : !isMicPaused ? '🎙️ Recording — release to pause' : 'Hold to speak'"
              >
                <span v-if="isMicLocked" class="text-sm">🔒</span>
                <span v-else-if="!isMicPaused" class="text-sm text-red-400 animate-pulse">🔴</span>
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                <span v-if="!isMicPaused && !isMicLocked" class="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
              </button>
              <!-- Disconnect session button -->
              <button
                @click="toggleLiveSession"
                type="button"
                class="text-[9px] font-bold px-1.5 py-1 rounded-md bg-red-50 hover:bg-red-100 text-red-500 border border-red-200 cursor-pointer transition-colors"
                title="Stop Live session"
              >✕</button>
            </div>

            <!-- Text Input Field -->
            <input
              v-model="inputText"
              @keyup.enter="sendMessage"
              type="text"
              :placeholder="isHoldingMic ? '🔴 Recording... Release mic button to send!' : isLiveConnected ? 'Live active — speak or type...' : 'Type a question or hold mic to speak...'"
              class="chat-input flex-1"
              id="ai-chat-input"
              autocomplete="off"
              maxlength="300"
            />

            <!-- Send Button -->
            <button
              @click="sendMessage"
              :disabled="!inputText.trim()"
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
            <span v-else-if="isMicLocked" class="text-[10px] text-orange-500 font-bold animate-pulse">🔒 AI speaking — mic locked</span>
            <span v-else-if="isLiveConnected && !isMicPaused" class="text-[10px] text-red-400 font-bold animate-pulse">🔴 Recording — release to stop</span>
            <span v-else-if="isLiveConnected && isMicPaused" class="text-[10px] text-gray-500 font-semibold">🎙️ Hold mic button to speak</span>
            <span v-else class="text-[10px] text-gray-500 font-semibold">⚠️ AI can make mistakes. Please verify.</span>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Floating Toggle Button featuring AI Eyes Mascot -->
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
        <div v-else key="fab-eyes" class="fab-ai-eyes flex items-center gap-1.5">
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
import { useGeminiLive } from '../composables/useGeminiLive'
import { useVoiceSynthesis } from '../composables/useVoiceSynthesis'
import MascotAvatar from './ai/MascotAvatar.vue'

interface ChatMessage {
  role: 'user' | 'model'
  content: string
}

const authStore = useAuthStore()
const gameStore = useGameStore()
const geminiLive = useGeminiLive()
const { isSpeaking, isVoiceOutputEnabled, toggleVoiceOutput, speakText, stopSpeaking } = useVoiceSynthesis()

const {
  isLiveConnected,
  isConnecting: isLiveConnecting,
  isSpeaking: isLiveSpeaking,
  isMicLocked,          // Issue #7: true while AI is speaking
  isMicPaused,          // Issue #6: true while PTT is released
  audioAmplitude,
  errorMsg: liveErrorMsg,
  startLiveSession,
  stopLiveSession,
  sendTextMessage,
  pauseMicRecording,    // Issue #6: PTT release handler
  resumeMicRecording,   // Issue #6: PTT press handler
  onAiTranscript,
  onUserTranscript,
  onTurnComplete
} = geminiLive

function toggleLiveSession() {
  stopSpeaking()
  if (currentAbortController) {
    currentAbortController.abort()
    currentAbortController = null
  }
  if (streamTickerTimer) {
    clearInterval(streamTickerTimer)
    streamTickerTimer = null
  }

  if (isLiveConnected.value || isLiveConnecting.value) {
    stopLiveSession()
  } else {
    startLiveSession()
  }
}

// Issue #6: Push-to-Talk — called on mousedown / touchstart
function onMicPress() {
  if (isMicLocked.value) return  // Issue #7: blocked while AI is speaking
  stopSpeaking()
  geminiLive.stopAllAudio()

  if (!isLiveConnected.value && !isLiveConnecting.value) {
    // First press: open session (mic will auto-start recording in startMicRecording via setupComplete)
    startLiveSession()
  } else {
    // Already connected: just resume the mic stream
    resumeMicRecording()
  }
}

// Issue #6: Push-to-Talk — called on mouseup / touchend
function onMicRelease() {
  if (isLiveConnected.value) {
    pauseMicRecording()  // Stop streaming audio but keep session open
  }
}

const isChatOpen = ref(false)
const currentAiLiveMsgIdx = ref(-1)
const currentUserLiveMsgIdx = ref(-1)
let lastUserTranscript = ''
let sessionSeq = 0

// Real-time transcript from Gemini Live AI Output
onAiTranscript((text: string) => {
  if (!text || !isChatOpen.value) return

  if (
    currentAiLiveMsgIdx.value === -1 ||
    currentAiLiveMsgIdx.value >= messages.value.length ||
    messages.value[currentAiLiveMsgIdx.value]?.role !== 'model'
  ) {
    messages.value.push({ role: 'model', content: text })
    currentAiLiveMsgIdx.value = messages.value.length - 1
  } else {
    const current = messages.value[currentAiLiveMsgIdx.value].content
    if (text.startsWith(current)) {
      messages.value[currentAiLiveMsgIdx.value].content = text
    } else if (current.startsWith(text)) {
      // Current already has accumulated text, do not overwrite with smaller prefix
    } else {
      messages.value[currentAiLiveMsgIdx.value].content = current + (current.endsWith(' ') || text.startsWith(' ') ? '' : ' ') + text
    }
  }
  scrollToBottom()
})

// Real-time transcript from Gemini Live Server User Input (voice to text)
onUserTranscript((text: string) => {
  if (!text || !isChatOpen.value) return
  if (text.trim() === lastUserTranscript.trim()) return
  lastUserTranscript = text

  // 1. Immediately preempt and stop any previous AI TTS or Live audio playback
  stopSpeaking()
  geminiLive.stopAllAudio()

  if (currentAbortController) {
    currentAbortController.abort()
    currentAbortController = null
  }
  if (streamTickerTimer) {
    clearInterval(streamTickerTimer)
    streamTickerTimer = null
  }
  isStreaming.value = false
  isLoading.value = false

  // 2. Manage user voice transcript bubble cleanly without duplicates
  if (
    currentUserLiveMsgIdx.value === -1 ||
    currentUserLiveMsgIdx.value >= messages.value.length ||
    messages.value[currentUserLiveMsgIdx.value]?.role !== 'user'
  ) {
    messages.value.push({ role: 'user', content: text })
    currentUserLiveMsgIdx.value = messages.value.length - 1
  } else {
    messages.value[currentUserLiveMsgIdx.value].content = text
  }
  scrollToBottom()
})

// Signal from Gemini Live when a turn completes (resets indices so next turn starts a new clean bubble)
onTurnComplete(() => {
  currentAiLiveMsgIdx.value = -1
  currentUserLiveMsgIdx.value = -1
  lastUserTranscript = ''
})

watch(isLiveConnected, (connected) => {
  if (!connected) {
    currentAiLiveMsgIdx.value = -1
    currentUserLiveMsgIdx.value = -1
    lastUserTranscript = ''
  }
})

// Lifecycle: Ensure chatbox ONLY responds and speaks when and only when open
watch(isChatOpen, (open) => {
  if (!open) {
    // 1. Immediately cancel any voice TTS and live audio
    stopSpeaking()
    geminiLive.stopAllAudio()

    // 2. Stop voice speech-to-text if active
    if (isListening.value) {
      isListening.value = false
    }

    // 3. Stop real-time Gemini Live audio session
    if (isLiveConnected.value || isLiveConnecting.value) {
      stopLiveSession()
    }

    // 4. Abort any active streaming request
    if (currentAbortController) {
      currentAbortController.abort()
      currentAbortController = null
    }
    if (streamTickerTimer) {
      clearInterval(streamTickerTimer)
      streamTickerTimer = null
    }
    isStreaming.value = false
    streamingMsgIdx.value = -1
    isLoading.value = false
  } else {
    nextTick(() => scrollToBottom())
  }
})
const inputText = ref('')
const messages = ref<ChatMessage[]>([])
const isLoading = ref(false)
const isStreaming = ref(false)
const streamingMsgIdx = ref(-1)
const errorMsg = ref('')
const isListening = ref(false)

// ── Push-To-Talk Hold Recording State ──────────────────────────────
const isHoldingMic = ref(false)
const recordingTimeMs = ref(0)
let recordingTimer: ReturnType<typeof setInterval> | null = null
let recognitionInstance: any = null
let recordedTranscript = ''
let pressStartTime = 0

// Unified: isAiSpeaking blocks mic in all cases (Gemini Live + Web STT)
const isAiSpeaking = computed(() =>
  isSpeaking.value ||
  isLiveSpeaking.value ||
  isStreaming.value ||
  isLoading.value
)

// ── UNIFIED PTT PRESS handler (HF-1: merges both implementations) ──
// Gemini Live takes priority. Web Speech Recognition is fallback.
function unifiedMicPress() {
  if (isAiSpeaking.value || isMicLocked.value || !isChatOpen.value) return

  stopSpeaking()
  geminiLive.stopAllAudio()

  // Register global safety-net mouseup/touchend (HF-2: catches release outside button)
  window.addEventListener('mouseup', unifiedMicRelease, { once: true })
  window.addEventListener('touchend', unifiedMicRelease, { once: true })

  // === PATH A: Gemini Live WebSocket (preferred) ===
  if (isLiveConnected.value) {
    // Already connected — just resume the audio stream
    resumeMicRecording()
    return
  }

  if (!isLiveConnected.value && !isLiveConnecting.value) {
    // Not connected — open a Gemini Live session (mic starts paused via setupComplete)
    startLiveSession()
    // Also start Web STT simultaneously as a transcript fallback for the input box
  }

  // === PATH B: Web Speech Recognition fallback (transcript → input box → sendMessage) ===
  pressStartTime = Date.now()
  isHoldingMic.value = true
  isListening.value = true
  errorMsg.value = ''
  recordedTranscript = ''
  recordingTimeMs.value = 0

  if (recordingTimer) clearInterval(recordingTimer)
  recordingTimer = setInterval(() => { recordingTimeMs.value += 100 }, 100)

  if (typeof window !== 'undefined') {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (SpeechRecognition) {
      try {
        if (recognitionInstance) recognitionInstance.abort()
        recognitionInstance = new SpeechRecognition()
        recognitionInstance.continuous = true
        recognitionInstance.interimResults = true
        recognitionInstance.lang = navigator.language || 'en-US'
        recognitionInstance.onresult = (event: any) => {
          let text = ''
          for (let i = 0; i < event.results.length; i++) {
            text += event.results[i][0].transcript
          }
          recordedTranscript = text
          if (text) inputText.value = text
        }
        recognitionInstance.onerror = (err: any) => {
          console.warn('[PTT STT Error]:', err)
          // HF-3: use local errorMsg ref (liveErrorMsg is readonly from composable)
          if (err.error !== 'aborted' && err.error !== 'no-speech') {
            errorMsg.value = 'Microphone issue. Please check permissions.'
          }
        }
        recognitionInstance.start()
      } catch (err) {
        console.warn('[PTT STT Start Warning]:', err)
      }
    }
  }
}

// ── UNIFIED PTT RELEASE handler ────────────────────────────────────
function unifiedMicRelease() {
  // Clean up global safety-net listeners
  window.removeEventListener('mouseup', unifiedMicRelease)
  window.removeEventListener('touchend', unifiedMicRelease)

  // --- Gemini Live path: pause mic stream ---
  if (isLiveConnected.value) {
    pauseMicRecording()
  }

  // --- Web STT path: stop recognition, send transcript ---
  if (!isHoldingMic.value) return

  const pressDuration = Date.now() - pressStartTime
  isHoldingMic.value = false
  isListening.value = false

  if (recordingTimer) {
    clearInterval(recordingTimer)
    recordingTimer = null
  }
  if (recognitionInstance) {
    try { recognitionInstance.stop() } catch { /* skip */ }
  }

  // Too short tap without any transcript — show hint
  if (pressDuration < 300 && !inputText.value.trim() && !recordedTranscript.trim()) {
    if (!isLiveConnected.value) {
      errorMsg.value = 'Hold mic button down to record voice, then release to send.'
      setTimeout(() => { errorMsg.value = '' }, 3000)
    }
    return
  }

  // If Gemini Live is active, it handles its own transcript via onUserTranscript
  // For Web STT fallback: auto-send the captured transcript
  if (!isLiveConnected.value) {
    const finalPrompt = (inputText.value || recordedTranscript).trim()
    if (finalPrompt) {
      inputText.value = finalPrompt
      sendMessage()
    }
  }
}

// Legacy stubs — kept so any remaining template refs don't break
const onMicPress = unifiedMicPress
const onMicRelease = unifiedMicRelease
const onMicPressStart = unifiedMicPress
const onMicPressEnd = unifiedMicRelease
function onMicPressCancel() { unifiedMicRelease() }

const chatBodyRef = ref<HTMLElement | null>(null)
const rootRef = ref<HTMLElement | null>(null)

let streamTickerTimer: any = null
let currentAbortController: AbortController | null = null

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
  if (isStreaming.value) return 'Streaming response in real-time...'
  if (isLoading.value) return 'Just a moment, finding your answer...'
  if (isSpeaking.value) return 'Speaking response aloud...'
  return 'Ready to guide & recommend Cores'
})

// Quick Action Hints in English
const quickHints = [
  '📊 What are my player stats & rank?',
  '🎯 Which Support Core fits me best?',
  '⚡ Which Core is strongest right now?',
  '🔮 How do I use Argus Eyes?',
  '🏆 How can I rank up ELO fast?',
]

// ── Click outside to close ──────────────────────────────────────────
function handleClickOutside(e: MouseEvent) {
  if (!isChatOpen.value) return
  if (rootRef.value && !rootRef.value.contains(e.target as Node)) {
    isChatOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside)
  if (streamTickerTimer) clearInterval(streamTickerTimer)
  if (currentAbortController) {
    currentAbortController.abort()
    currentAbortController = null
  }
  stopSpeaking()
  geminiLive.stopAllAudio()
})

// ── Toggle / Close ───────────────────────────────────────────────────
function toggleChat() {
  isChatOpen.value = !isChatOpen.value
  if (isChatOpen.value) {
    if (!authStore.profile) {
      void authStore.fetchProfile()
    }
    nextTick(() => scrollToBottom())
  } else {
    stopSpeaking()
    geminiLive.stopAllAudio()
  }
}

function closeChat() {
  isChatOpen.value = false
  stopSpeaking()
  geminiLive.stopAllAudio()
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
  if (!isChatOpen.value) return
  inputText.value = text
  sendMessage()
}

// ── Send message with 2-Phase Natural Interaction (Instant Acknowledgment -> Streaming Answer) ──
async function sendMessage() {
  // STRICT: Only send if chat window is actively open
  if (!isChatOpen.value) return

  const text = inputText.value.trim()
  if (!text) return

  inputText.value = ''
  errorMsg.value = ''

  // Preemption: Increment session sequence ID to cancel previous session
  const thisSessionId = ++sessionSeq

  // 1. Immediately abort active stream, clear interval, and stop TTS & Live audio
  stopSpeaking()
  geminiLive.stopAllAudio()

  if (streamTickerTimer) {
    clearInterval(streamTickerTimer)
    streamTickerTimer = null
  }
  if (currentAbortController) {
    currentAbortController.abort()
    currentAbortController = null
  }

  // 2. Finalize previous AI message if it was still typing (remove empty placeholder if no content arrived)
  if (streamingMsgIdx.value >= 0 && streamingMsgIdx.value < messages.value.length) {
    const prevMsg = messages.value[streamingMsgIdx.value]
    if (prevMsg && !prevMsg.content.trim()) {
      messages.value.splice(streamingMsgIdx.value, 1)
    }
  }

  isStreaming.value = false
  streamingMsgIdx.value = -1
  isLoading.value = false

  currentUserLiveMsgIdx.value = -1
  currentAiLiveMsgIdx.value = -1
  lastUserTranscript = ''

  // Push user prompt bubble
  messages.value.push({ role: 'user', content: text })
  scrollToBottom()

  // Route text prompt directly into active Gemini 3.1 Live session if connected
  if (isLiveConnected.value) {
    sendTextMessage(text)
    return
  }

  isLoading.value = true

  let incomingBuffer = ''
  let displayedText = ''
  let isStreamClosed = false
  let timeoutId: any = null
  let answerMsgIdx = -1

  const isVi = /[àáảãạâầấẩẫậăằắẳẵặèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i.test(text)

  // Helper to start the incremental typewriter effect for the response bubble
  const startTypewriterLoop = (targetIdx: number) => {
    if (streamTickerTimer) clearInterval(streamTickerTimer)

    streamTickerTimer = setInterval(() => {
      // Abort immediately if chat was closed or a new session preempted this one
      if (!isChatOpen.value || thisSessionId !== sessionSeq) {
        if (streamTickerTimer) clearInterval(streamTickerTimer)
        streamTickerTimer = null
        isStreaming.value = false
        streamingMsgIdx.value = -1
        isLoading.value = false
        return
      }

      if (displayedText.length < incomingBuffer.length) {
        if (!isStreaming.value) {
          isStreaming.value = true
          streamingMsgIdx.value = targetIdx
        }

        const backlog = incomingBuffer.length - displayedText.length
        // Adaptive rate: step size 1 if close to buffer, up to 5 if chunk accumulated
        const step = backlog > 80 ? 5 : backlog > 30 ? 3 : backlog > 12 ? 2 : 1
        displayedText += incomingBuffer.slice(displayedText.length, displayedText.length + step)

        if (targetIdx >= 0 && targetIdx < messages.value.length) {
          messages.value[targetIdx] = { role: 'model', content: displayedText }
        }
        scrollToBottom()
      } else if (isStreamClosed) {
        // Stream completed and buffer fully rendered!
        clearInterval(streamTickerTimer)
        streamTickerTimer = null
        isStreaming.value = false
        streamingMsgIdx.value = -1
        isLoading.value = false

        if (displayedText.trim() && isChatOpen.value && thisSessionId === sessionSeq) {
          speakText(displayedText)
        } else {
          // If no content ever arrived, remove empty placeholder
          if (targetIdx >= 0 && targetIdx < messages.value.length && !messages.value[targetIdx].content) {
            messages.value.splice(targetIdx, 1)
            errorMsg.value = isVi ? 'Không nhận được phản hồi từ AI. Vui lòng thử lại.' : 'No response from AI. Please try again.'
          }
        }
        scrollToBottom()
      }
    }, 14)
  }

  try {
    const history = messages.value
      .slice(0, -1)
      .slice(-10)
      .map(m => ({ role: m.role, message: m.content }))

    const wins = authStore.profile?.wins ?? 0
    const losses = authStore.profile?.losses ?? 0
    const totalMatches = authStore.profile?.total_matches ?? (wins + losses)
    const winRate = totalMatches > 0 ? `${Math.round((wins / totalMatches) * 100)}%` : '0%'

    const playerHistory = {
      username: authStore.profile?.username || username.value,
      elo: authStore.profile?.elo ?? 1000,
      rank: authStore.profile?.rank || 'Novice',
      wins,
      losses,
      totalMatches,
      winRate,
      unlockedCores: authStore.profile?.unlocked_core_ids || [],
      activeCoreName: gameStore.activeCoreName || 'None',
      coreHistory: gameStore.coreHistory || [],
      score: gameStore.score || 0
    }

    // ── Setup SSE Request with AbortController & 25s Timeout ──────────
    currentAbortController = new AbortController()
    timeoutId = setTimeout(() => {
      if (currentAbortController) {
        currentAbortController.abort()
      }
    }, 25000)

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
      signal: currentAbortController.signal
    })

    if (thisSessionId !== sessionSeq) return

    if (!res.ok || !res.body) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message || (isVi ? 'Không thể kết nối đến AI Assistant' : 'Failed to connect to AI Assistant'))
    }

    // Push placeholder message for AI answer
    messages.value.push({ role: 'model', content: '' })
    answerMsgIdx = messages.value.length - 1

    // Launch incremental typewriter loop
    startTypewriterLoop(answerMsgIdx)

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      if (!isChatOpen.value || thisSessionId !== sessionSeq) {
        reader.cancel().catch(() => {})
        isStreamClosed = true
        break
      }

      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const payload = line.slice(6).trim()
        if (payload === '[DONE]') {
          isStreamClosed = true
          break
        }
        try {
          const parsed = JSON.parse(payload)
          if (parsed.chunk && thisSessionId === sessionSeq) {
            incomingBuffer += parsed.chunk
          }
        } catch { /* skip malformed chunk */ }
      }
    }

    isStreamClosed = true
  } catch (err: any) {
    isStreamClosed = true

    // If stream failed before any text arrived, clean up placeholder
    if (thisSessionId === sessionSeq && incomingBuffer.length === 0) {
      if (streamTickerTimer) {
        clearInterval(streamTickerTimer)
        streamTickerTimer = null
      }
      if (answerMsgIdx >= 0 && messages.value[answerMsgIdx]?.content === '') {
        messages.value.splice(answerMsgIdx, 1)
      }
      if (err.name === 'AbortError') {
        errorMsg.value = isVi ? 'Kết nối AI bị quá thời gian (25s). Vui lòng thử lại.' : 'AI connection timed out (25s). Please try again.'
      } else {
        errorMsg.value = err.message || (isVi ? 'Đã xảy ra lỗi. Vui lòng thử lại.' : 'An error occurred. Please try again.')
      }
      isLoading.value = false
      isStreaming.value = false
      streamingMsgIdx.value = -1
    }
  } finally {
    if (timeoutId) clearTimeout(timeoutId)
    if (thisSessionId === sessionSeq) {
      currentAbortController = null
    }
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
  bottom: 20px;
  right: 16px;
  z-index: 9999;
  font-family: inherit;
}

/* ── Chat Window ─────────────────────────────── */
.chat-window {
  position: absolute;
  bottom: 72px;
  right: 0;
  width: 410px;
  height: 540px;
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
  .ai-chat-root {
    bottom: 16px;
    right: 16px;
  }
  .chat-window {
    position: fixed;
    bottom: 88px;
    right: 12px;
    left: 12px;
    width: auto;
    height: 420px;
    max-height: calc(100vh - 120px);
    border-radius: 20px;
  }
}

/* ── Accent Bar ──────────────────────────────── */
.chat-accent-bar {
  height: 4px;
  background: linear-gradient(90deg, #ff7b00, #e63946, #f59e0b);
}

/* ── Header & AI Mascot Avatar ────────────── */
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

/* AI Mascot Avatar Box (Eyes + Mouth) */
.ai-mascot-box,
.cyber-mascot-box {
  width: 44px;
  height: 44px;
  border-radius: 16px;
  background: linear-gradient(135deg, #111827 0%, #1f2937 100%);
  border: 2.5px solid #ea580c;
  box-shadow: 0 0 14px rgba(234, 88, 12, 0.45);
  position: relative;
}
.ai-mascot-box:hover,
.cyber-mascot-box:hover {
  transform: scale(1.06);
  border-color: #ff7b00;
  box-shadow: 0 0 20px rgba(255, 123, 0, 0.6);
}

/* Glowing AI Eyes */
.ai-eye,
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

/* ── ChatGPT-style Streaming Blinking Cursor ─── */
.chat-cursor {
  display: inline-block;
  width: 6px;
  height: 14px;
  background-color: #ea580c;
  margin-left: 3px;
  vertical-align: -1.5px;
  border-radius: 1px;
  box-shadow: 0 0 8px rgba(234, 88, 12, 0.6);
  animation: cursor-blink 0.75s infinite ease-in-out;
}

@keyframes cursor-blink {
  0%, 100% { opacity: 1; transform: scaleY(1); }
  50% { opacity: 0; transform: scaleY(0.85); }
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

.chat-mic-btn--recording {
  background: linear-gradient(135deg, #ef4444, #b91c1c) !important;
  color: #ffffff !important;
  border-color: #fca5a5 !important;
  box-shadow: 0 0 20px rgba(239, 68, 68, 0.8), 0 0 30px rgba(220, 38, 38, 0.5) !important;
  transform: scale(1.12) !important;
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

/* FAB Floating AI Eyes */
.fab-ai-eyes,
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


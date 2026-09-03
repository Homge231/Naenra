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
              :is-listening="isHoldingMicRef || isLiveListening"
              :is-loading="isLoading"
              :is-streaming="isStreaming"
              :is-speaking="isSpeaking"
              :audio-amplitude="liveAmplitude"
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
                :disabled="isLoading || isStreaming"
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
                  @click="speakText(msg.content, isChatOpen)" 
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
        <!-- Voice Live Wavebar Visualizer & Active Push-to-Talk Recording Banner -->
        <div v-if="isHoldingMicRef || isLiveListening || isSpeaking" class="voice-wave-bar flex items-center justify-between">
          <div class="voice-status-info flex items-center gap-2">
            <span class="pulse-dot" :class="{ 'pulse-dot--active': isHoldingMicRef || isLiveListening || isSpeaking }"></span>
            <span class="voice-status-text font-bold text-xs">
              <span v-if="isHoldingMicRef || isLiveListening" class="text-red-600 animate-pulse">🔴 Listening to your voice... (Click mic to stop)</span>
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
            <div class="waveform-anim" :class="{ 'waveform-anim--active': isHoldingMicRef || isLiveListening || isSpeaking }">
              <span class="wave-bar"></span>
              <span class="wave-bar"></span>
              <span class="wave-bar"></span>
              <span class="wave-bar"></span>
              <span class="wave-bar"></span>
            </div>
          </div>
        </div>

        <!-- Footer: Text Input + Click-to-Talk Mic Button -->
        <div class="chat-footer">
          <div class="chat-input-wrap flex items-center gap-2">

            <!-- 🎙️ CLICK-TO-TALK MIC BUTTON -->
            <button
              @click.prevent.stop="toggleMicRecording"
              type="button"
              id="ai-chat-mic-btn"
              class="chat-mic-btn shrink-0 relative select-none cursor-pointer"
              :class="{
                'chat-mic-btn--listening': isHoldingMicRef || isLiveListening,
                'opacity-80': isAiSpeaking && !isHoldingMicRef
              }"
              :title="isContinuousVoiceMode ? '🔴 Continuous Voice Active — click mic to stop' : isAiSpeaking ? '🔊 AI is answering — click mic to interrupt' : '🎙️ Click to speak'"
            >
              <span v-if="isHoldingMicRef || isLiveListening" class="text-sm text-red-400 animate-pulse">🔴</span>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              <!-- Active ping indicator when recording -->
              <span v-if="isHoldingMicRef || isLiveListening" class="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
            </button>

            <!-- Text Input Field -->
            <input
              v-model="inputText"
              @keyup.enter="sendMessage()"
              type="text"
              :placeholder="isContinuousVoiceMode && isHoldingMicRef ? '🔴 Listening... (speech appears here)' : isContinuousVoiceMode ? '⏳ AI is answering...' : 'Type a question or click mic to speak...'"
              class="chat-input flex-1"
              id="ai-chat-input"
              autocomplete="off"
              maxlength="300"
              :readonly="isContinuousVoiceMode"
            />

            <!-- Send Button -->
            <button
              @click="sendMessage()"
              :disabled="!inputText.trim() || isLoading || isContinuousVoiceMode"
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
            <span v-if="errorMsg" class="text-[10px] text-red-400 font-semibold truncate">⚠️ {{ errorMsg }}</span>
            <span v-else-if="isContinuousVoiceMode && isHoldingMicRef" class="text-[10px] text-red-500 font-bold animate-pulse">🔴 Listening... Click mic to stop</span>
            <span v-else-if="isContinuousVoiceMode && !isHoldingMicRef" class="text-[10px] text-orange-500 font-semibold animate-pulse">🔊 AI is answering... (mic will resume)</span>
            <span v-else-if="isAiSpeaking" class="text-[10px] text-orange-500 font-semibold animate-pulse">🔊 AI is answering... (Click mic to interrupt)</span>
            <span v-else class="text-[10px] text-gray-500 font-semibold">🎙️ Click mic button to speak</span>
            <span v-if="inputText.length > 0 && !isContinuousVoiceMode" class="text-[10px] text-gray-400 font-mono">{{ inputText.length }}/300</span>
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
import { ref, computed, nextTick, onBeforeUnmount, watch } from 'vue'
import { useAuthStore } from '../stores/authStore'
import { useGameStore } from '../stores/gameStore'
import { useVoiceSynthesis } from '../composables/useVoiceSynthesis'
import MascotAvatar from './ai/MascotAvatar.vue'

interface ChatMessage { role: 'user' | 'model'; content: string }

const authStore = useAuthStore()
const gameStore = useGameStore()
const { isSpeaking, isVoiceOutputEnabled, toggleVoiceOutput, speakText, stopSpeaking } = useVoiceSynthesis()

const isChatOpen = ref(false)
const inputText = ref('')
const messages = ref<ChatMessage[]>([])
const isLoading = ref(false)
const isStreaming = ref(false)
const streamingMsgIdx = ref(-1)
const errorMsg = ref('')
const isLiveListening = ref(false)
const liveAmplitude = ref(0)

let sessionSeq = 0
let streamTickerTimer: any = null

// ── Gemini Live WebSocket ─────────────────────────────────────────
let liveWs: WebSocket | null = null
let liveWsReady = false
let activeLiveChunkHandler: ((c: string) => void) | null = null
let activeLiveDoneHandler: (() => void) | null = null
let activeLiveTranscriptHandler: ((t: string) => void) | null = null

// ── PCM16 Mic Audio State ─────────────────────────────────────────
let micStream: MediaStream | null = null
let audioCtx: AudioContext | null = null
let micSource: MediaStreamAudioSourceNode | null = null
let scriptProcessor: ScriptProcessorNode | null = null
let isHoldingMic = false  // use plain var for performance in audio loop

const chatBodyRef = ref<HTMLElement | null>(null)
const rootRef = ref<HTMLElement | null>(null)

const isAiSpeaking = computed(() => isSpeaking.value || isStreaming.value || isLoading.value)
const isHoldingMicRef = ref(false)  // reactive version for template

const mascotStatusText = computed(() => {
  if (isLiveListening.value) return '🔴 Listening to your voice...'
  if (isStreaming.value) return 'Streaming response...'
  if (isLoading.value) return 'Thinking...'
  if (isSpeaking.value) return 'Speaking...'
  return 'Ready — Ask me anything!'
})

const quickHints = [
  '📊 What are my player stats & rank?',
  '🎯 Which Support Core fits me best?',
  '⚡ Which Core is strongest right now?',
  '🔮 How do I use Argus Eyes?',
  '🏆 How can I rank up ELO fast?',
]

const username = computed(() =>
  authStore.profile?.username ||
  authStore.user?.user_metadata?.full_name ||
  'Player'
)

function getApiBase(): string {
  let base = import.meta.env.VITE_SERVER_URL || ''
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') return 'http://localhost:3000'
    if (!base) base = window.location.protocol === 'https:' ? 'https://api.naenra.xyz' : `http://${window.location.hostname}:3000`
  }
  return base || 'http://localhost:3000'
}

// ── WebSocket Connection ──────────────────────────────────────────
let connectPromise: Promise<void> | null = null

function connectLiveWs(): Promise<void> {
  if (liveWs && liveWs.readyState === WebSocket.OPEN && liveWsReady) {
    return Promise.resolve()
  }
  if (connectPromise) {
    return connectPromise
  }

  connectPromise = new Promise((resolve, reject) => {
    if (liveWs && liveWs.readyState === WebSocket.OPEN) {
      liveWsReady = true
      connectPromise = null
      resolve()
      return
    }

    const token = localStorage.getItem('arena_token') || ''
    const base = getApiBase()
    const wsBase = base.replace(/^http/, 'ws')
    liveWs = new WebSocket(`${wsBase}/api/ai/live?token=${encodeURIComponent(token)}`)
    liveWsReady = false

    let resolved = false
    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true
        connectPromise = null
        reject(new Error('WS timeout'))
      }
    }, 8000)

    liveWs.onmessage = (event) => {
      try {
        const raw = event.data.toString()
        if (raw.includes('setupComplete')) {
          liveWsReady = true
          if (!resolved) {
            resolved = true
            clearTimeout(timer)
            connectPromise = null
            resolve()
          }
          return
        }
        const msg = JSON.parse(raw)
        if (msg.type === 'textChunk' && msg.chunk && activeLiveChunkHandler) activeLiveChunkHandler(msg.chunk)
        if (msg.type === 'textDone' && activeLiveDoneHandler) activeLiveDoneHandler()
        if (msg.type === 'inputTranscript' && msg.text && activeLiveTranscriptHandler) activeLiveTranscriptHandler(msg.text)
        if (msg.error) {
          if (!msg.error.toLowerCase().includes('aborted')) {
            errorMsg.value = msg.error
          }
          isLoading.value = false
          isStreaming.value = false
        }
      } catch { /* binary/non-JSON */ }
    }

    liveWs.onerror = () => {
      liveWsReady = false
      if (!resolved) {
        resolved = true
        clearTimeout(timer)
        connectPromise = null
        reject(new Error('WS error'))
      }
    }

    liveWs.onclose = () => {
      liveWsReady = false
      liveWs = null
      connectPromise = null
    }
  })

  return connectPromise
}

function disconnectLiveWs() {
  connectPromise = null
  if (liveWs) {
    try { liveWs.close() } catch {}
    liveWs = null
  }
  liveWsReady = false
}

// ── PCM16 Mic Capture ────────────────────────────────────────────
async function startMicCapture(): Promise<boolean> {
  try {
    micStream = await navigator.mediaDevices.getUserMedia({ audio: { sampleRate: 16000, channelCount: 1, echoCancellation: true, noiseSuppression: true }, video: false })
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 })
    micSource = audioCtx.createMediaStreamSource(micStream)
    scriptProcessor = audioCtx.createScriptProcessor(4096, 1, 1)

    scriptProcessor.onaudioprocess = (e: AudioProcessingEvent) => {
      if (!isHoldingMic) return
      const f32 = e.inputBuffer.getChannelData(0)
      // RMS amplitude for mascot visualizer
      let sumSq = 0
      for (let i = 0; i < f32.length; i++) sumSq += f32[i] * f32[i]
      liveAmplitude.value = Math.min(1, Math.sqrt(sumSq / f32.length) * 8)
      // PCM16 encode
      const i16 = new Int16Array(f32.length)
      for (let i = 0; i < f32.length; i++) i16[i] = Math.max(-32768, Math.min(32767, Math.round(f32[i] * 32767)))
      const bytes = new Uint8Array(i16.buffer)
      let bin = ''; for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i])
      const b64 = btoa(bin)
      if (liveWs && liveWs.readyState === WebSocket.OPEN) {
        liveWs.send(JSON.stringify({
          realtimeInput: {
            audio: {
              data: b64,
              mimeType: 'audio/pcm;rate=16000'
            }
          }
        }))
      }
    }

    micSource.connect(scriptProcessor)
    scriptProcessor.connect(audioCtx.destination)
    return true
  } catch (err: any) {
    errorMsg.value = err?.name === 'NotAllowedError' ? 'Microphone permission denied.' : `Mic error: ${err?.message || 'unknown'}`
    return false
  }
}

function stopMicCapture() {
  if (liveWs && liveWs.readyState === WebSocket.OPEN) {
    try {
      liveWs.send(JSON.stringify({
        realtimeInput: {
          audioStreamEnd: true
        }
      }))
    } catch {}
  }
  isHoldingMic = false
  isHoldingMicRef.value = false
  isLiveListening.value = false
  liveAmplitude.value = 0
  try { scriptProcessor?.disconnect() } catch {}
  try { micSource?.disconnect() } catch {}
  try { audioCtx?.close() } catch {}
  micStream?.getTracks().forEach(t => t.stop())
  micStream = null; audioCtx = null; micSource = null; scriptProcessor = null
}

// ── Voice Input Handlers (Click to Talk Toggle) ────────────────────
// isContinuousVoiceMode: true when user has toggled mic ON for continuous chat session
const isContinuousVoiceMode = ref(false)

async function toggleMicRecording() {
  if (!isChatOpen.value) return

  if (isContinuousVoiceMode.value) {
    // User clicked to END the voice session
    isContinuousVoiceMode.value = false
    stopMicCapture()
    inputText.value = ''
  } else {
    // User clicked to START continuous voice session
    await startContinuousVoiceSession()
  }
}

async function startContinuousVoiceSession() {
  if (!isChatOpen.value) return

  isContinuousVoiceMode.value = true
  sessionSeq++
  stopSpeaking()
  if (streamTickerTimer) { clearInterval(streamTickerTimer); streamTickerTimer = null }
  isStreaming.value = false
  isLoading.value = false
  errorMsg.value = ''
  inputText.value = ''

  try {
    await connectLiveWs()
  } catch {
    errorMsg.value = 'Could not connect to AI. Please try again.'
    isContinuousVoiceMode.value = false
    return
  }

  await startMicListenLoop()
}

// Internal: Start mic + listen for transcript/response, then loop back if still in continuous mode
async function startMicListenLoop() {
  if (!isContinuousVoiceMode.value || !isChatOpen.value) return

  const started = await startMicCapture()
  if (!started) {
    isContinuousVoiceMode.value = false
    return
  }

  isHoldingMic = true
  isHoldingMicRef.value = true
  isLiveListening.value = true
  inputText.value = ''

  // Listen for transcript from Gemini → show in input field
  const captureSessionId = sessionSeq
  activeLiveTranscriptHandler = (text: string) => {
    if (captureSessionId !== sessionSeq) return
    inputText.value = text
  }

  // When user says something, Gemini sends audioStreamEnd signal back and we get textChunk/textDone
  // We wait in listening mode. When AI sends a response (textDone), we:
  //  1. Add user bubble (with transcript from inputText)
  //  2. Add AI bubble with the response
  //  3. If still in continuous mode, restart mic loop

  let incomingBuffer = ''
  let isStreamClosed = false

  activeLiveChunkHandler = (chunk: string) => {
    if (captureSessionId !== sessionSeq) return
    incomingBuffer += chunk
  }

  activeLiveDoneHandler = () => {
    if (captureSessionId !== sessionSeq) return
    isStreamClosed = true
  }

  // Wait for Gemini to detect speech end and respond (stream done)
  const TIMEOUT = 45000
  const start = Date.now()
  await new Promise<void>(resolve => {
    const check = setInterval(() => {
      // If user turned off voice mode, exit
      if (!isContinuousVoiceMode.value || captureSessionId !== sessionSeq) {
        clearInterval(check)
        resolve()
        return
      }
      if (isStreamClosed || Date.now() - start > TIMEOUT) {
        clearInterval(check)
        resolve()
      }
    }, 100)
  })

  // Stop mic capture for this turn
  stopMicCapture()

  if (!isContinuousVoiceMode.value || captureSessionId !== sessionSeq) {
    inputText.value = ''
    return
  }

  const transcribedText = inputText.value.trim()
  inputText.value = ''

  if (transcribedText) {
    messages.value.push({ role: 'user', content: transcribedText })
  }

  if (incomingBuffer.trim()) {
    const thisSessionId = ++sessionSeq
    let displayedText = ''
    const capturedBuffer = incomingBuffer
    let localClosed = true

    messages.value.push({ role: 'model', content: '' })
    const aiMsgIdx = messages.value.length - 1
    scrollToBottom()

    isLoading.value = true
    startTypewriterLoop(
      aiMsgIdx, thisSessionId,
      () => capturedBuffer,
      () => { displayedText = capturedBuffer },
      () => localClosed,
      (v) => { displayedText = v },
      () => displayedText
    )

    // Wait for typewriter to finish
    await new Promise<void>(resolve => {
      const check = setInterval(() => {
        if (!isStreaming.value && !isLoading.value) { clearInterval(check); resolve() }
        else if (thisSessionId !== sessionSeq) { clearInterval(check); resolve() }
      }, 100)
    })
  }

  activeLiveChunkHandler = null
  activeLiveDoneHandler = null
  activeLiveTranscriptHandler = null

  // If still in continuous mode, restart mic listen loop
  if (isContinuousVoiceMode.value && isChatOpen.value) {
    // Reconnect if WS dropped
    if (!liveWs || liveWs.readyState !== WebSocket.OPEN) {
      try { await connectLiveWs() } catch {
        isContinuousVoiceMode.value = false
        isHoldingMicRef.value = false
        return
      }
    }
    await startMicListenLoop()
  } else {
    isHoldingMicRef.value = false
    isLiveListening.value = false
  }
}

async function startVoiceRecording() {
  await startContinuousVoiceSession()
}

async function stopVoiceRecording() {
  isContinuousVoiceMode.value = false
  stopMicCapture()
  inputText.value = ''
}

const unifiedMicPress = startVoiceRecording
const unifiedMicRelease = stopVoiceRecording

// ── Scroll helper ─────────────────────────────────────────────────
function scrollToBottom() {
  nextTick(() => { if (chatBodyRef.value) chatBodyRef.value.scrollTop = chatBodyRef.value.scrollHeight })
}

// ── Typewriter loop ───────────────────────────────────────────────
function startTypewriterLoop(
  targetIdx: number,
  thisSessionId: number,
  getBuffer: () => string,
  syncDisplayed: () => void,
  getStreamClosed: () => boolean,
  setDisplayed: (v: string) => void,
  getDisplayed: () => string
) {
  if (streamTickerTimer) clearInterval(streamTickerTimer)
  streamTickerTimer = setInterval(() => {
    if (!isChatOpen.value || thisSessionId !== sessionSeq) {
      clearInterval(streamTickerTimer); streamTickerTimer = null
      isStreaming.value = false; streamingMsgIdx.value = -1; isLoading.value = false
      return
    }
    const buf = getBuffer()
    const disp = getDisplayed()
    if (disp.length < buf.length) {
      if (!isStreaming.value) { isStreaming.value = true; streamingMsgIdx.value = targetIdx }
      const backlog = buf.length - disp.length
      const step = backlog > 80 ? 6 : backlog > 30 ? 4 : backlog > 12 ? 2 : 1
      const next = buf.slice(0, disp.length + step)
      setDisplayed(next)
      if (targetIdx >= 0 && targetIdx < messages.value.length) messages.value[targetIdx] = { role: 'model', content: next }
      scrollToBottom()
    }
    if (getStreamClosed() && getDisplayed().length >= getBuffer().length) {
      clearInterval(streamTickerTimer); streamTickerTimer = null
      isStreaming.value = false; streamingMsgIdx.value = -1; isLoading.value = false
      const final = getDisplayed() || getBuffer()
      if (targetIdx >= 0 && targetIdx < messages.value.length) messages.value[targetIdx] = { role: 'model', content: final }
      if (final.trim() && isChatOpen.value && thisSessionId === sessionSeq) speakText(final, isChatOpen.value)
      if (!final.trim()) {
        if (targetIdx >= 0 && targetIdx < messages.value.length) messages.value.splice(targetIdx, 1)
        errorMsg.value = 'No response from AI. Please try again.'
      }
      scrollToBottom()
    }
  }, 14)
}

async function waitForStreamDone(getStreamClosed: () => boolean, thisSessionId: number, ackMsgIdx: number) {
  // Just wait — the typewriter loop handles everything. Clean up after 45s timeout.
  const TIMEOUT = 45000
  const start = Date.now()
  await new Promise<void>(resolve => {
    const check = setInterval(() => {
      if (getStreamClosed() || thisSessionId !== sessionSeq || Date.now() - start > TIMEOUT) {
        clearInterval(check)
        if (Date.now() - start > TIMEOUT && !getStreamClosed()) {
          errorMsg.value = 'Response timed out. Please try again.'
          if (ackMsgIdx >= 0 && ackMsgIdx < messages.value.length) messages.value.splice(ackMsgIdx, 1)
          isLoading.value = false; isStreaming.value = false
        }
        resolve()
      }
    }, 100)
  })
  activeLiveChunkHandler = null
  activeLiveDoneHandler = null
  activeLiveTranscriptHandler = null
}

// ── Send Text Message (via SSE — Gemini 3.5 Flash backup) ────────
async function sendMessage(overridePrompt?: string) {
  if (!isChatOpen.value) return
  if (isHoldingMicRef.value) {
    stopMicCapture()
  }
  const text = (overridePrompt !== undefined ? overridePrompt : inputText.value).trim()
  if (!text) return

  inputText.value = ''
  errorMsg.value = ''
  const thisSessionId = ++sessionSeq

  stopSpeaking()
  if (streamTickerTimer) { clearInterval(streamTickerTimer); streamTickerTimer = null }
  isStreaming.value = false; streamingMsgIdx.value = -1; isLoading.value = false

  messages.value.push({ role: 'user', content: text })
  scrollToBottom()

  messages.value.push({ role: 'model', content: '⏳ Hold on a moment…' })
  const ackMsgIdx = messages.value.length - 1
  scrollToBottom()
  isLoading.value = true

  // ── Stream via SSE HTTP endpoint (Gemini 3.5 Flash) ──────────────
  let incomingBuffer = ''
  let displayedText = ''
  let isStreamClosed = false

  // Clear ACK and start typewriter immediately
  messages.value[ackMsgIdx] = { role: 'model', content: '' }
  startTypewriterLoop(
    ackMsgIdx, thisSessionId,
    () => incomingBuffer,
    () => { displayedText = incomingBuffer },
    () => isStreamClosed,
    (v) => { displayedText = v },
    () => displayedText
  )

  try {
    const base = getApiBase()
    const token = localStorage.getItem('arena_token') || ''
    const url = `${base}/api/ai/chat/stream`

    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ prompt: text })
    })

    if (!resp.ok || !resp.body) {
      if (resp.status === 401) {
        throw new Error('AUTH_EXPIRED')
      }
      throw new Error(`SSE request failed: ${resp.status}`)
    }

    const reader = resp.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      if (thisSessionId !== sessionSeq) break // preempted
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
        } catch { /* skip */ }
      }
      if (isStreamClosed) break
    }
    isStreamClosed = true
  } catch (err: any) {
    if (thisSessionId === sessionSeq) {
      if (err?.message === 'AUTH_EXPIRED') {
        errorMsg.value = 'Session expired. Please log in again.'
      } else {
        errorMsg.value = 'Connection error. Please try again.'
      }
      if (ackMsgIdx >= 0 && ackMsgIdx < messages.value.length) messages.value.splice(ackMsgIdx, 1)
      isLoading.value = false
      isStreaming.value = false
    }
  }
}

// ── Markdown Utils ────────────────────────────────────────────────
function renderMarkdown(text: string): string {
  if (!text) return ''
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>')
  html = html.replace(/`(.*?)`/g, '<code class="bg-orange-100 text-orange-800 px-1 py-0.5 rounded text-sm">$1</code>')
  html = html.replace(/\n/g, '<br>')

  return html
}

function sendQuick(hint: string) {
  if (isLoading.value || isStreaming.value) return
  sendMessage(hint)
}

// ── Lifecycle ─────────────────────────────────────────────────────
watch(isChatOpen, (open) => {
  if (!open) {
    isContinuousVoiceMode.value = false
    stopSpeaking()
    stopMicCapture()
    window.removeEventListener('mouseup', unifiedMicRelease)
    window.removeEventListener('touchend', unifiedMicRelease)
    if (streamTickerTimer) { clearInterval(streamTickerTimer); streamTickerTimer = null }
    activeLiveChunkHandler = null; activeLiveDoneHandler = null; activeLiveTranscriptHandler = null
    isStreaming.value = false; streamingMsgIdx.value = -1; isLoading.value = false
    inputText.value = ''
    disconnectLiveWs()
  } else {
    // Fetch profile for player context in SSE calls
    if (!authStore.profile) void authStore.fetchProfile()
    // NOTE: Do NOT auto-connect Live WebSocket here.
    // Gemini Live (3.1-flash-live-preview) only supports AUDIO output.
    // WebSocket is connected lazily on mic PTT press only.
    nextTick(() => scrollToBottom())
  }
})

onBeforeUnmount(() => {
  stopMicCapture()
  disconnectLiveWs()
  if (streamTickerTimer) clearInterval(streamTickerTimer)
})

function toggleChat() {
  isChatOpen.value = !isChatOpen.value
  if (isChatOpen.value) {
    if (!authStore.profile) {
      void authStore.fetchProfile()
    }
    nextTick(() => scrollToBottom())
  } else {
    closeChat()
  }
}

function closeChat() {
  isChatOpen.value = false
  isContinuousVoiceMode.value = false
  stopSpeaking()
  stopMicCapture()
  inputText.value = ''
  disconnectLiveWs()
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
  bottom: 74px;
  right: 0;
  width: 360px;
  max-width: calc(100vw - 32px);
  height: 520px;
  max-height: calc(100vh - 120px);
  background: #ffffff;
  border-radius: 20px;
  border: 1px solid rgba(251, 146, 60, 0.35);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.18),
    0 4px 16px rgba(251, 146, 60, 0.15);
}

/* ── Accent Bar ──────────────────────────────── */
.chat-accent-bar {
  height: 4px;
  background: linear-gradient(90deg, #ff7b00, #ffb703, #e63946);
  flex-shrink: 0;
}

/* ── Header ──────────────────────────────────── */
.chat-header {
  padding: 12px 14px;
  background: linear-gradient(180deg, #fff7ed 0%, #ffffff 100%);
  border-bottom: 1px solid #fed7aa;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.chat-header-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.chat-title {
  font-size: 13px;
  font-weight: 800;
  color: #1e293b;
  line-height: 1.2;
}

.chat-badge {
  font-size: 9px;
  font-weight: 800;
  padding: 1px 5px;
  background: #ff7b00;
  color: #ffffff;
  border-radius: 4px;
  letter-spacing: 0.5px;
}

.chat-subtitle {
  font-size: 10px;
  color: #9a3412;
  font-weight: 600;
  line-height: 1.2;
}

.chat-icon-btn,
.chat-close-btn {
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 5px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}
.chat-icon-btn:hover,
.chat-close-btn:hover {
  background: #f1f5f9;
  color: #475569;
}
.chat-icon-btn--active {
  color: #ea580c;
  background: #ffedd5;
}

/* ── Messages Body ───────────────────────────── */
.chat-body {
  flex: 1;
  padding: 12px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: #fafafa;
}

/* ── Welcome Area ────────────────────────────── */
.chat-welcome {
  text-align: center;
  padding: 16px 8px 8px;
}

.chat-welcome-mascot-box {
  display: flex;
  justify-content: center;
}

.chat-username {
  color: #ea580c;
}

.chat-quick-hints {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.chat-quick-btn {
  background: #ffffff;
  border: 1px solid #fed7aa;
  color: #c2410c;
  font-size: 11px;
  font-weight: 600;
  padding: 6px 10px;
  border-radius: 10px;
  text-align: left;
  cursor: pointer;
  transition: all 0.15s;
}
.chat-quick-btn:hover:not(:disabled) {
  background: #ffedd5;
  border-color: #f97316;
  color: #9a3412;
  transform: translateX(2px);
}
.chat-quick-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  border-color: #fed7aa;
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
  padding: 9px 12px;
  border-radius: 14px;
  font-size: 12px;
  line-height: 1.5;
  word-break: break-word;
}

.chat-bubble--user {
  background: linear-gradient(135deg, #ff7b00, #ea580c);
  color: #ffffff;
  border-bottom-right-radius: 3px;
  box-shadow: 0 2px 8px rgba(234, 88, 12, 0.2);
}

.chat-bubble--ai {
  background: #ffffff;
  border: 1px solid #fed7aa;
  color: #1e293b;
  border-bottom-left-radius: 3px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.chat-bubble-label {
  font-size: 10px;
  letter-spacing: 0.3px;
}

.chat-bubble-text code {
  background: #fef3c7;
  color: #92400e;
  padding: 1px 4px;
  border-radius: 4px;
  font-size: 11px;
}

/* ChatGPT style blinking cursor */
.chat-cursor {
  display: inline-block;
  width: 2px;
  height: 12px;
  background: #ea580c;
  margin-left: 2px;
  vertical-align: middle;
  animation: cursor-blink 0.8s infinite;
}
@keyframes cursor-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

/* ── Typing Indicator ────────────────────────── */
.chat-typing {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 8px 12px;
  background: #ffffff;
  border: 1px solid #fed7aa;
  border-radius: 12px;
  width: fit-content;
}
.chat-typing span:not(:first-child) {
  width: 5px;
  height: 5px;
  background: #ea580c;
  border-radius: 50%;
  animation: typing-dot 1.2s infinite;
}
.chat-typing span:nth-child(2) { animation-delay: 0s; }
.chat-typing span:nth-child(3) { animation-delay: 0.2s; }
.chat-typing span:nth-child(4) { animation-delay: 0.4s; }

@keyframes typing-dot {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30% { transform: translateY(-4px); opacity: 1; }
}

/* ── Error Notification ──────────────────────── */
.chat-error {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  font-size: 11px;
  padding: 6px 10px;
  border-radius: 8px;
}
.chat-error-dismiss {
  background: transparent;
  border: none;
  color: #dc2626;
  cursor: pointer;
  font-size: 11px;
  padding: 0 4px;
}

/* ── Voice Wave Bar Visualizer ───────────────── */
.voice-wave-bar {
  padding: 6px 12px;
  background: linear-gradient(90deg, #fff7ed, #fef2f2);
  border-top: 1px solid #fed7aa;
  border-bottom: 1px solid #fed7aa;
  flex-shrink: 0;
}

.pulse-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #94a3b8;
}
.pulse-dot--active {
  background: #ef4444;
  animation: dot-pulse 1s infinite;
}

.waveform-anim {
  display: flex;
  align-items: center;
  gap: 2px;
  height: 14px;
}
.wave-bar {
  width: 2px;
  height: 4px;
  background: #94a3b8;
  border-radius: 2px;
  transition: height 0.15s;
}
.waveform-anim--active .wave-bar {
  background: #ea580c;
  animation: wave-anim 0.8s ease-in-out infinite alternate;
}
.waveform-anim--active .wave-bar:nth-child(1) { animation-delay: 0.0s; }
.waveform-anim--active .wave-bar:nth-child(2) { animation-delay: 0.15s; }
.waveform-anim--active .wave-bar:nth-child(3) { animation-delay: 0.3s; }
.waveform-anim--active .wave-bar:nth-child(4) { animation-delay: 0.45s; }
.waveform-anim--active .wave-bar:nth-child(5) { animation-delay: 0.6s; }

@keyframes wave-anim {
  0%   { height: 3px; }
  100% { height: 14px; }
}

/* ── Footer ──────────────────────────────────── */
.chat-footer {
  padding: 10px 12px;
  background: #ffffff;
  border-top: 1px solid #fed7aa;
  flex-shrink: 0;
}

.chat-input-wrap {
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 14px;
  padding: 4px 6px;
  transition: border-color 0.15s;
}
.chat-input-wrap:focus-within {
  border-color: #f97316;
  box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.15);
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

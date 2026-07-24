<template>
  <!-- Floating container — fixed bottom-right -->
  <div class="ai-chat-root" ref="rootRef">

    <!-- Chat Window Overlay -->
    <Transition name="chat-slide">
      <div
        v-if="isChatOpen"
        class="chat-window"
        role="dialog"
        aria-label="Naenra AI Assistant"
      >
        <!-- Top gradient accent bar -->
        <div class="chat-accent-bar"></div>

        <!-- Header -->
        <div class="chat-header">
          <div class="chat-header-info">
            <div class="chat-avatar">
              <div class="chat-avatar-inner">✨</div>
            </div>
            <div>
              <h3 class="chat-title">
                Naenra Assistant
                <span class="chat-badge">AI</span>
              </h3>
              <p class="chat-subtitle">Game Guide & Helper</p>
            </div>
          </div>
          <button
            @click="closeChat"
            class="chat-close-btn"
            aria-label="Đóng chat"
            id="ai-chat-close-btn"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Messages Body -->
        <div class="chat-body" ref="chatBodyRef">
          <!-- Welcome message -->
          <div v-if="messages.length === 0" class="chat-welcome">
            <span class="chat-welcome-icon">🤖</span>
            <p>Xin chào <strong class="chat-username">{{ username }}</strong>!<br/>
            Hỏi tôi bất kỳ điều gì về Naenra — game mechanics, Support Cores, ELO hay chiến thuật gõ phím!</p>
            <div class="chat-quick-hints">
              <button
                v-for="hint in quickHints"
                :key="hint"
                class="chat-quick-btn"
                @click="sendQuick(hint)"
              >{{ hint }}</button>
            </div>
          </div>

          <!-- Message bubbles -->
          <div
            v-for="(msg, idx) in messages"
            :key="idx"
            :class="['chat-bubble-wrap', msg.role === 'user' ? 'chat-bubble-wrap--user' : 'chat-bubble-wrap--ai']"
          >
            <div :class="['chat-bubble', msg.role === 'user' ? 'chat-bubble--user' : 'chat-bubble--ai']">
              <span v-if="msg.role !== 'user'" class="chat-bubble-label">🤖 AI</span>
              <div
                v-if="msg.role !== 'user'"
                class="chat-bubble-text"
                v-html="renderMarkdown(msg.content)"
              ></div>
              <p v-else class="chat-bubble-text">{{ msg.content }}</p>
            </div>
          </div>

          <!-- Typing indicator -->
          <div v-if="isLoading" class="chat-typing">
            <span></span><span></span><span></span>
          </div>

          <!-- Error -->
          <div v-if="errorMsg" class="chat-error">
            ⚠️ {{ errorMsg }}
            <button @click="errorMsg = ''" class="chat-error-dismiss">✕</button>
          </div>
        </div>

        <!-- Input Footer -->
        <div class="chat-footer">
          <div class="chat-input-wrap">
            <input
              v-model="inputText"
              @keyup.enter="sendMessage"
              :disabled="isLoading"
              type="text"
              placeholder="Nhập câu hỏi..."
              class="chat-input"
              id="ai-chat-input"
              autocomplete="off"
              maxlength="300"
            />
            <button
              @click="sendMessage"
              :disabled="isLoading || !inputText.trim()"
              class="chat-send-btn"
              id="ai-chat-send-btn"
              aria-label="Gửi"
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
          <p class="chat-footer-note">Powered by Gemini 2.5 Flash</p>
        </div>
      </div>
    </Transition>

    <!-- Floating Toggle Button -->
    <button
      @click="toggleChat"
      class="chat-fab"
      :class="{ 'chat-fab--open': isChatOpen }"
      :aria-label="isChatOpen ? 'Đóng AI Assistant' : 'Mở AI Assistant'"
      id="ai-chat-fab-btn"
      title="Naenra AI Assistant"
    >
      <!-- Glow ring -->
      <span class="chat-fab-glow"></span>

      <!-- Icon: show X when open, robot when closed -->
      <Transition name="icon-swap" mode="out-in">
        <svg v-if="isChatOpen" key="close" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
        </svg>
        <span v-else key="robot" class="chat-fab-icon">✨</span>
      </Transition>

      <!-- Unread dot (when chat is closed and there are messages) -->
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
import { fetchWithAuth } from '../services/api'

interface ChatMessage {
  role: 'user' | 'model'
  content: string
}

const authStore = useAuthStore()

const isChatOpen = ref(false)
const inputText = ref('')
const messages = ref<ChatMessage[]>([])
const isLoading = ref(false)
const errorMsg = ref('')
const chatBodyRef = ref<HTMLElement | null>(null)
const rootRef = ref<HTMLElement | null>(null)

const username = computed(() =>
  authStore.profile?.username ||
  authStore.user?.user_metadata?.full_name ||
  'Player'
)

const quickHints = [
  'Support Cores là gì?',
  'Cách tăng ELO nhanh?',
  'Combo Core hoạt động thế nào?',
]

// ── Click outside to close ──────────────────────────────────────────
function handleClickOutside(e: MouseEvent) {
  if (!isChatOpen.value) return
  if (rootRef.value && !rootRef.value.contains(e.target as Node)) {
    isChatOpen.value = false
  }
}

onMounted(() => document.addEventListener('mousedown', handleClickOutside))
onBeforeUnmount(() => document.removeEventListener('mousedown', handleClickOutside))

// ── Toggle / Close ───────────────────────────────────────────────────
function toggleChat() {
  isChatOpen.value = !isChatOpen.value
  if (isChatOpen.value) {
    nextTick(() => scrollToBottom())
  }
}

function closeChat() {
  isChatOpen.value = false
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

// ── Send message ─────────────────────────────────────────────────────
async function sendMessage() {
  const text = inputText.value.trim()
  if (!text || isLoading.value) return

  inputText.value = ''
  errorMsg.value = ''

  messages.value.push({ role: 'user', content: text })
  scrollToBottom()

  isLoading.value = true

  try {
    // Build history (last 10 pairs at most, excluding the just-pushed user msg)
    const history = messages.value
      .slice(0, -1)
      .slice(-10)
      .map(m => ({ role: m.role, message: m.content }))

    const res = await fetchWithAuth('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: text, history }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || `HTTP ${res.status}`)
    }

    const data = await res.json()
    messages.value.push({ role: 'model', content: data.reply || '' })
  } catch (err: any) {
    errorMsg.value = err.message || 'Không thể kết nối AI. Thử lại nhé!'
    // Remove the user message on hard failure so they can retry
    if (messages.value[messages.value.length - 1]?.role === 'user') {
      inputText.value = text
      messages.value.pop()
    }
  } finally {
    isLoading.value = false
    scrollToBottom()
  }
}

// ── Markdown renderer ────────────────────────────────────────────────
function renderMarkdown(text: string): string {
  if (!text) return ''
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#60a5fa;font-weight:700">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em style="color:#d1d5db;font-style:italic">$1</em>')
    .replace(/`([^`]+)`/g, '<code style="background:rgba(255,255,255,0.1);color:#fb923c;padding:1px 5px;border-radius:4px;font-size:11px;font-family:monospace">$1</code>')
    .replace(/^### (.*$)/gim, '<h4 style="font-size:11px;font-weight:700;color:#fff;text-transform:uppercase;letter-spacing:.05em;margin:6px 0 3px">$1</h4>')
    .replace(/^## (.*$)/gim, '<h3 style="font-size:12px;font-weight:700;color:#fff;margin:6px 0 3px">$1</h3>')
    .replace(/^- (.*$)/gim, '<li style="margin-left:12px;list-style:disc;color:#d1d5db;margin-bottom:2px">$1</li>')
    .replace(/^(\d+)\. (.*$)/gim, '<li style="margin-left:12px;list-style:decimal;color:#d1d5db;margin-bottom:2px">$2</li>')
    .replace(/\n/g, '<br/>')
}
</script>

<style scoped>
/* ── Root container ──────────────────────────── */
.ai-chat-root {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 9990;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-family: 'Inter', 'Roboto', sans-serif;
}

/* ── Chat window ─────────────────────────────── */
.chat-window {
  position: absolute;
  bottom: calc(100% + 14px);
  right: 0;
  width: 360px;
  max-width: calc(100vw - 2rem);
  height: 480px;
  max-height: 75vh;
  background: rgba(7, 12, 28, 0.97);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(96, 165, 250, 0.25);
  border-radius: 20px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255,255,255,0.04);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  color: #fff;
}

/* ── Accent bar ──────────────────────────────── */
.chat-accent-bar {
  height: 3px;
  width: 100%;
  background: linear-gradient(90deg, #f97316, #60a5fa, #22c55e);
  flex-shrink: 0;
}

/* ── Header ──────────────────────────────────── */
.chat-header {
  padding: 12px 14px;
  background: rgba(255, 255, 255, 0.04);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}
.chat-header-info {
  display: flex;
  align-items: center;
  gap: 10px;
}
.chat-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f97316, #60a5fa);
  padding: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 12px rgba(96, 165, 250, 0.4);
  flex-shrink: 0;
}
.chat-avatar-inner {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #070c1c;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}
.chat-title {
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0 0 2px;
  line-height: 1;
}
.chat-badge {
  font-size: 8px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 2px 5px;
  border-radius: 4px;
  background: rgba(96, 165, 250, 0.15);
  border: 1px solid rgba(96, 165, 250, 0.35);
  color: #60a5fa;
}
.chat-subtitle {
  font-size: 9px;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  margin: 0;
  line-height: 1;
}
.chat-close-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #6b7280;
  padding: 6px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s, background 0.2s;
}
.chat-close-btn:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
}

/* ── Message body ────────────────────────────── */
.chat-body {
  flex: 1;
  overflow-y: auto;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  scrollbar-width: thin;
  scrollbar-color: rgba(96, 165, 250, 0.2) transparent;
}
.chat-body::-webkit-scrollbar {
  width: 4px;
}
.chat-body::-webkit-scrollbar-track {
  background: transparent;
}
.chat-body::-webkit-scrollbar-thumb {
  background: rgba(96, 165, 250, 0.2);
  border-radius: 4px;
}

/* ── Welcome ─────────────────────────────────── */
.chat-welcome {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
  padding: 16px 8px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 14px;
}
.chat-welcome-icon {
  font-size: 28px;
}
.chat-welcome p {
  font-size: 12px;
  color: #9ca3af;
  line-height: 1.5;
  margin: 0;
}
.chat-username {
  color: #60a5fa;
}
.chat-quick-hints {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  justify-content: center;
  margin-top: 4px;
}
.chat-quick-btn {
  font-size: 10px;
  padding: 4px 10px;
  border-radius: 20px;
  border: 1px solid rgba(96, 165, 250, 0.3);
  background: rgba(96, 165, 250, 0.08);
  color: #93c5fd;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
  font-weight: 600;
}
.chat-quick-btn:hover {
  background: rgba(96, 165, 250, 0.18);
  border-color: rgba(96, 165, 250, 0.6);
  color: #fff;
}

/* ── Bubbles ─────────────────────────────────── */
.chat-bubble-wrap {
  display: flex;
}
.chat-bubble-wrap--user {
  justify-content: flex-end;
}
.chat-bubble-wrap--ai {
  justify-content: flex-start;
}
.chat-bubble {
  max-width: 88%;
  border-radius: 16px;
  padding: 10px 13px;
  font-size: 12px;
  line-height: 1.55;
}
.chat-bubble--user {
  background: rgba(59, 130, 246, 0.22);
  border: 1px solid rgba(96, 165, 250, 0.35);
  border-top-right-radius: 4px;
  color: #e5e7eb;
}
.chat-bubble--ai {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-top-left-radius: 4px;
  color: #d1d5db;
}
.chat-bubble-label {
  display: block;
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #60a5fa;
  margin-bottom: 5px;
  line-height: 1;
}
.chat-bubble-text {
  margin: 0;
  word-break: break-word;
}

/* ── Typing indicator ────────────────────────── */
.chat-typing {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 14px;
  border-top-left-radius: 4px;
  width: fit-content;
}
.chat-typing span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #60a5fa;
  animation: typing-bounce 1.2s infinite ease-in-out;
}
.chat-typing span:nth-child(2) { animation-delay: 0.2s; }
.chat-typing span:nth-child(3) { animation-delay: 0.4s; }
@keyframes typing-bounce {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40%           { transform: scale(1);   opacity: 1; }
}

/* ── Error ───────────────────────────────────── */
.chat-error {
  font-size: 11px;
  color: #f87171;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.25);
  border-radius: 10px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.chat-error-dismiss {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #f87171;
  font-size: 11px;
  padding: 0;
  line-height: 1;
}

/* ── Input footer ────────────────────────────── */
.chat-footer {
  padding: 10px 12px 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.07);
  background: rgba(0, 0, 0, 0.4);
  flex-shrink: 0;
}
.chat-input-wrap {
  display: flex;
  gap: 8px;
  align-items: center;
}
.chat-input {
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  padding: 9px 14px;
  font-size: 12px;
  color: #fff;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  font-family: inherit;
}
.chat-input::placeholder {
  color: #4b5563;
}
.chat-input:focus {
  border-color: rgba(96, 165, 250, 0.5);
  box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.12);
}
.chat-input:disabled {
  opacity: 0.5;
}
.chat-send-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid rgba(96, 165, 250, 0.35);
  background: rgba(96, 165, 250, 0.15);
  color: #60a5fa;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.2s, color 0.2s, transform 0.15s;
}
.chat-send-btn:hover:not(:disabled) {
  background: rgba(96, 165, 250, 0.3);
  color: #fff;
  transform: scale(1.05);
}
.chat-send-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
.chat-footer-note {
  font-size: 9px;
  color: #374151;
  text-align: center;
  margin: 5px 0 0;
  letter-spacing: 0.05em;
}

/* ── FAB (Floating Action Button) ────────────── */
.chat-fab {
  position: relative;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  background: linear-gradient(135deg, #f97316, #3b82f6);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.4), 0 0 0 0 rgba(59, 130, 246, 0.3);
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
              box-shadow 0.25s ease;
  animation: fab-pulse 3s ease-in-out infinite;
}
.chat-fab:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 28px rgba(59, 130, 246, 0.6), 0 0 0 6px rgba(59, 130, 246, 0.12);
}
.chat-fab:active {
  transform: scale(0.95);
}
.chat-fab--open {
  background: linear-gradient(135deg, #374151, #1f2937);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
  animation: none;
}
.chat-fab--open:hover {
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.6);
}

@keyframes fab-pulse {
  0%, 100% { box-shadow: 0 4px 20px rgba(59, 130, 246, 0.4), 0 0 0 0 rgba(59, 130, 246, 0.3); }
  50%       { box-shadow: 0 4px 20px rgba(59, 130, 246, 0.4), 0 0 0 8px rgba(59, 130, 246, 0); }
}

.chat-fab-glow {
  position: absolute;
  inset: -2px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f97316, #3b82f6);
  filter: blur(8px);
  opacity: 0.4;
  z-index: -1;
  transition: opacity 0.25s;
}
.chat-fab:hover .chat-fab-glow {
  opacity: 0.7;
}
.chat-fab--open .chat-fab-glow {
  opacity: 0;
}

.chat-fab-icon {
  font-size: 20px;
  line-height: 1;
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

/* ── Spinner ─────────────────────────────────── */
.spin {
  animation: spin 0.9s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
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

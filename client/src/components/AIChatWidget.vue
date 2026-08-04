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
              <h3 class="chat-title flex items-center gap-1.5">
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
              <span v-if="msg.role !== 'user'" class="chat-bubble-label">🤖 AI Assistant</span>
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

            <!-- Send Button -->
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
          <p class="chat-footer-note">Powered by Gemini 3.5 Flash</p>
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
onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})

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
      throw new Error(err.message || 'Không thể kết nối với AI Assistant')
    }

    const data = await res.json()
    const replyText = data.reply || 'Xin lỗi, tôi chưa hiểu rõ ý bạn.'
    messages.value.push({ role: 'model', content: replyText })
  } catch (err: any) {
    errorMsg.value = err.message || 'Đã có lỗi xảy ra. Vui lòng thử lại sau.'
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
  width: 380px;
  height: 520px;
  max-width: calc(100vw - 32px);
  max-height: calc(100vh - 110px);
  background: rgba(15, 23, 42, 0.94);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 20px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(59, 130, 246, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ── Accent Bar ──────────────────────────────── */
.chat-accent-bar {
  height: 3px;
  background: linear-gradient(90deg, #f97316, #3b82f6, #a855f7);
}

/* ── Header ──────────────────────────────────── */
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
  gap: 10px;
}

.chat-avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.3), rgba(59, 130, 246, 0.3));
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.chat-avatar-inner {
  font-size: 16px;
}

.chat-title {
  font-size: 14px;
  font-weight: 700;
  color: #f8fafc;
  margin: 0;
  line-height: 1.2;
}

.chat-badge {
  font-size: 9px;
  font-weight: 900;
  padding: 1px 5px;
  border-radius: 4px;
  background: rgba(59, 130, 246, 0.25);
  color: #60a5fa;
  border: 1px solid rgba(59, 130, 246, 0.4);
}

.chat-subtitle {
  font-size: 11px;
  color: #94a3b8;
  margin: 2px 0 0 0;
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
  padding: 16px 8px;
  color: #cbd5e1;
  font-size: 13px;
  line-height: 1.5;
}

.chat-welcome-icon {
  font-size: 36px;
  display: block;
  margin-bottom: 8px;
}

.chat-username {
  color: #ffa62b;
}

.chat-quick-hints {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
  margin-top: 14px;
}

.chat-quick-btn {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #93c5fd;
  font-size: 11px;
  padding: 5px 10px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}
.chat-quick-btn:hover {
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.4);
  color: #ffffff;
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
  max-width: 85%;
  padding: 10px 14px;
  border-radius: 14px;
  font-size: 13px;
  line-height: 1.45;
  word-break: break-word;
}

.chat-bubble--user {
  background: linear-gradient(135deg, #f97316, #ea580c);
  color: #ffffff;
  border-bottom-right-radius: 4px;
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
}

.chat-bubble--ai {
  background: rgba(30, 41, 59, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
  border-bottom-left-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.chat-bubble-label {
  font-size: 10px;
  font-weight: 700;
  color: #60a5fa;
  display: block;
  margin-bottom: 4px;
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
  gap: 4px;
  padding: 10px 14px;
  background: rgba(30, 41, 59, 0.7);
  border-radius: 14px;
  border-bottom-left-radius: 4px;
  width: fit-content;
}
.chat-typing span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #60a5fa;
  animation: typing 1.2s infinite ease-in-out;
}
.chat-typing span:nth-child(2) { animation-delay: 0.2s; }
.chat-typing span:nth-child(3) { animation-delay: 0.4s; }

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

/* ── Footer / Input ──────────────────────────── */
.chat-footer {
  padding: 12px 16px;
  background: rgba(15, 23, 42, 0.98);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.chat-input-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 4px 6px 4px 12px;
  transition: all 0.2s;
}
.chat-input-wrap:focus-within {
  border-color: rgba(59, 130, 246, 0.6);
  box-shadow: 0 0 12px rgba(59, 130, 246, 0.2);
}

.chat-input {
  flex: 1;
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
  width: 32px;
  height: 32px;
  border-radius: 8px;
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

.chat-footer-note {
  font-size: 10px;
  color: #64748b;
  text-align: center;
  margin: 6px 0 0 0;
}

/* ── FAB Button ──────────────────────────────── */
.chat-fab {
  position: relative;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0f172a, #1e293b);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
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

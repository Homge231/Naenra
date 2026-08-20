<template>
  <!-- 🤖 INTERACTIVE AI MASCOT AVATAR (Glowing Eyes + Lip-Synced Mouth) -->
  <div 
    class="ai-mascot-box relative flex flex-col items-center justify-center cursor-pointer select-none transition-all duration-300 group"
    @click="handleMascotClick"
    :class="{
      'mascot-pulse-listening': isListening,
      'mascot-glow-thinking': isLoading && !isStreaming,
      'mascot-talk-speaking': isSpeaking || isStreaming,
      'mascot-interactive-click': isInteracting
    }"
    title="Click to interact with AI Mascot!"
  >
    <!-- Glowing AI Eyes -->
    <div class="ai-eyes flex items-center gap-2 z-10">
      <div 
        class="ai-eye left-eye" 
        :class="{ 
          'eye-blink': isBlinking, 
          'eye-wide': isListening, 
          'eye-happy': isInteracting,
          'eye-think': isLoading && !isStreaming 
        }"
      ></div>
      <div 
        class="ai-eye right-eye" 
        :class="{ 
          'eye-blink': isBlinking, 
          'eye-wide': isListening, 
          'eye-happy': isInteracting,
          'eye-think': isLoading && !isStreaming 
        }"
      ></div>
    </div>

    <!-- Animated Talking Mouth (Lip Sync to Speech Readout, Audio & Real-time Text Streaming) -->
    <div class="ai-mouth mt-1 z-10 flex items-center justify-center h-3.5">
      <!-- When Speaking or Streaming: Animated Real-Time Mouth Bars (Lip Sync) -->
      <div v-if="isSpeaking || isLiveSpeaking || isStreaming" class="talking-mouth flex items-center gap-0.5 h-3">
        <span class="mouth-bar bar-1 bg-amber-400 w-1 rounded-full animate-lip-1 shadow-xs" :style="isLiveSpeaking ? { height: `${Math.max(4, audioAmplitude * 14)}px` } : {}"></span>
        <span class="mouth-bar bar-2 bg-amber-400 w-1 rounded-full animate-lip-2 shadow-xs" :style="isLiveSpeaking ? { height: `${Math.max(6, audioAmplitude * 16)}px` } : {}"></span>
        <span class="mouth-bar bar-3 bg-amber-400 w-1 rounded-full animate-lip-3 shadow-xs" :style="isLiveSpeaking ? { height: `${Math.max(4, audioAmplitude * 14)}px` } : {}"></span>
      </div>
      <!-- When Listening / Live Active: Pulsing O Mouth -->
      <div v-else-if="isListening || isLiveConnected" class="listening-mouth w-2.5 h-2.5 rounded-full border-2 border-red-500 bg-red-900/50 animate-ping"></div>
      <!-- When Interacting / Happy: Curved Smile -->
      <div v-else-if="isInteracting" class="smile-mouth w-4 h-2 border-b-2 border-amber-400 rounded-b-full shadow-xs"></div>
      <!-- Idle Gold Straight Mouth Line -->
      <div v-else class="idle-mouth w-3.5 h-[2px] bg-amber-400 rounded-full group-hover:w-4.5 transition-all shadow-xs"></div>
    </div>

    <!-- AI Aura Glow Ring -->
    <div class="ai-mascot-aura" :class="{ 'mascot-live-aura': isLiveConnected }"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = withDefaults(
  defineProps<{
    isListening?: boolean
    isLoading?: boolean
    isStreaming?: boolean
    isSpeaking?: boolean
    isLiveSpeaking?: boolean
    isLiveConnected?: boolean
    audioAmplitude?: number
  }>(),
  {
    isListening: false,
    isLoading: false,
    isStreaming: false,
    isSpeaking: false,
    isLiveSpeaking: false,
    isLiveConnected: false,
    audioAmplitude: 0
  }
)

const isBlinking = ref(false)
const isInteracting = ref(false)
let blinkInterval: ReturnType<typeof setInterval> | null = null

function handleMascotClick() {
  isInteracting.value = true
  setTimeout(() => {
    isInteracting.value = false
  }, 1800)
}

function startBlinkCycle() {
  blinkInterval = setInterval(() => {
    isBlinking.value = true
    setTimeout(() => {
      isBlinking.value = false
    }, 200)
  }, 4000)
}

onMounted(() => {
  startBlinkCycle()
})

onBeforeUnmount(() => {
  if (blinkInterval) clearInterval(blinkInterval)
})
</script>

<style scoped>
.ai-mascot-box {
  width: 44px;
  height: 44px;
  border-radius: 16px;
  background: linear-gradient(135deg, #111827 0%, #1f2937 100%);
  border: 2.5px solid #ea580c;
  box-shadow: 0 0 14px rgba(234, 88, 12, 0.45);
  position: relative;
}
.ai-mascot-box:hover {
  transform: scale(1.06);
  border-color: #ff7b00;
  box-shadow: 0 0 20px rgba(255, 123, 0, 0.6);
}

.ai-eye {
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
</style>

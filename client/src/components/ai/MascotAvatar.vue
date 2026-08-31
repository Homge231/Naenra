<template>
  <!-- 🤖 INTERACTIVE AI MASCOT AVATAR (Glowing Eyes + Radio Signal Audio Waveform Mouth) -->
  <div 
    class="ai-mascot-box relative flex flex-col items-center justify-center cursor-pointer select-none transition-all duration-300 group"
    @click="handleMascotClick"
    :class="{
      'mascot-pulse-listening': isListening,
      'mascot-glow-thinking': isLoading && !isStreaming,
      'mascot-talk-speaking': isSpeaking || isStreaming || isLiveSpeaking,
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
          'eye-speak': isSpeaking || isStreaming || isLiveSpeaking,
          'eye-think': isLoading && !isStreaming 
        }"
      ></div>
      <div 
        class="ai-eye right-eye" 
        :class="{ 
          'eye-blink': isBlinking, 
          'eye-wide': isListening, 
          'eye-happy': isInteracting,
          'eye-speak': isSpeaking || isStreaming || isLiveSpeaking,
          'eye-think': isLoading && !isStreaming 
        }"
      ></div>
    </div>

    <!-- 📻 Radio Signal Audio Waveform Mouth -->
    <div class="ai-mouth mt-1.5 z-10 flex items-center justify-center h-4 w-full px-2">
      <!-- 1. When Speaking / TTS / Streaming / Live Voice: Dynamic Radio Signal Oscilloscope Waves -->
      <div 
        v-if="isSpeaking || isLiveSpeaking || isStreaming" 
        class="radio-signal-mouth flex items-center justify-center gap-[2px] h-3.5"
      >
        <span class="signal-bar bar-1" :style="dynamicBarStyle(0, 3, 8)"></span>
        <span class="signal-bar bar-2" :style="dynamicBarStyle(1, 4, 11)"></span>
        <span class="signal-bar bar-3" :style="dynamicBarStyle(2, 5, 14)"></span>
        <span class="signal-bar bar-4" :style="dynamicBarStyle(3, 6, 16)"></span>
        <span class="signal-bar bar-5" :style="dynamicBarStyle(4, 5, 14)"></span>
        <span class="signal-bar bar-6" :style="dynamicBarStyle(5, 4, 11)"></span>
        <span class="signal-bar bar-7" :style="dynamicBarStyle(6, 3, 8)"></span>
      </div>

      <!-- 2. When Listening to User Mic: Red Radio Receiver Waves (Reacts to Voice Amplitude) -->
      <div v-else-if="isListening || isLiveConnected" class="radio-listening-mouth flex items-center justify-center h-3.5 w-full">
        <!-- Voice detected (> 0.05 amplitude): Dynamic radio altitude bars -->
        <div v-if="(audioAmplitude || 0) >= 0.05" class="flex items-center justify-center gap-[2px] h-3.5">
          <span class="listening-bar lbar-1" :style="listeningBarStyle(0, 3, 8)"></span>
          <span class="listening-bar lbar-2" :style="listeningBarStyle(1, 4, 12)"></span>
          <span class="listening-bar lbar-3" :style="listeningBarStyle(2, 5, 16)"></span>
          <span class="listening-bar lbar-4" :style="listeningBarStyle(3, 4, 12)"></span>
          <span class="listening-bar lbar-5" :style="listeningBarStyle(4, 3, 8)"></span>
        </div>
        <!-- Silence / listening standby: Flat calm resting red carrier line -->
        <div v-else class="listening-idle-line w-4 h-[2px] bg-red-500/80 rounded-full shadow-[0_0_6px_rgba(239,68,68,0.7)] animate-pulse"></div>
      </div>

      <!-- 3. When Thinking / Loading: Radar Frequency Scanner Line -->
      <div v-else-if="isLoading" class="radio-scanning-mouth w-5 h-[2.5px] rounded-full overflow-hidden relative bg-amber-950/60 border border-amber-500/40">
        <div class="radar-scan-beam"></div>
      </div>

      <!-- 4. When Interacting / Clicked: Curved Radio Smile Arc -->
      <div v-else-if="isInteracting" class="smile-mouth w-4.5 h-2 border-b-2 border-amber-400 rounded-b-full shadow-[0_0_8px_#f59e0b]"></div>

      <!-- 5. Idle: Sleek Glowing Radio Signal Carrier Baseline -->
      <div v-else class="idle-radio-mouth flex items-center justify-center">
        <div class="idle-carrier-line w-4 h-[2px] bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.8)] group-hover:w-5.5 group-hover:shadow-[0_0_12px_rgba(251,191,36,1)] transition-all duration-300"></div>
      </div>
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

function dynamicBarStyle(index: number, minH: number, maxH: number) {
  if (props.isLiveSpeaking && props.audioAmplitude > 0) {
    const height = Math.min(16, Math.max(minH, props.audioAmplitude * maxH * 1.5))
    return { height: `${height}px` }
  }
  return {}
}

function listeningBarStyle(index: number, minH: number, maxH: number) {
  const amp = props.audioAmplitude || 0
  const factor = index === 2 ? 1.0 : (index === 1 || index === 3) ? 0.75 : 0.5
  const height = Math.min(16, Math.max(minH, amp * maxH * factor * 1.6))
  return { height: `${height}px`, transition: 'height 0.05s ease' }
}

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

.eye-speak {
  box-shadow: 0 0 10px #fbbf24, 0 0 16px #f97316 !important;
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

/* 📻 Radio Signal Oscilloscope Bars */
.signal-bar {
  width: 2px;
  min-height: 3px;
  border-radius: 2px;
  background: linear-gradient(180deg, #fef08a 0%, #fbbf24 40%, #f97316 100%);
  box-shadow: 0 0 6px rgba(251, 191, 36, 0.9), 0 0 10px rgba(249, 115, 22, 0.6);
  transform-origin: center;
}

.bar-1 { animation: radioWave 0.45s ease-in-out infinite alternate; max-height: 8px; }
.bar-2 { animation: radioWave 0.38s ease-in-out infinite alternate 0.08s; max-height: 11px; }
.bar-3 { animation: radioWave 0.52s ease-in-out infinite alternate 0.16s; max-height: 14px; }
.bar-4 { animation: radioWave 0.34s ease-in-out infinite alternate 0.04s; max-height: 16px; }
.bar-5 { animation: radioWave 0.48s ease-in-out infinite alternate 0.12s; max-height: 14px; }
.bar-6 { animation: radioWave 0.41s ease-in-out infinite alternate 0.2s; max-height: 11px; }
.bar-7 { animation: radioWave 0.46s ease-in-out infinite alternate 0.06s; max-height: 8px; }

@keyframes radioWave {
  0% {
    height: 3px;
    opacity: 0.7;
    filter: brightness(0.9);
  }
  50% {
    height: 14px;
    opacity: 1;
    filter: brightness(1.3);
    box-shadow: 0 0 8px rgba(254, 240, 138, 1), 0 0 14px rgba(249, 115, 22, 0.8);
  }
  100% {
    height: 5px;
    opacity: 0.85;
    filter: brightness(1.1);
  }
}

/* 🎙️ Listening Mic Input Radio Waves */
.listening-bar {
  width: 2px;
  border-radius: 2px;
  background: linear-gradient(180deg, #fca5a5 0%, #ef4444 100%);
  box-shadow: 0 0 8px rgba(239, 68, 68, 0.95);
  animation: listenRadioWave 0.3s ease-in-out infinite alternate;
}
.lbar-1 { animation-delay: 0s; max-height: 8px; }
.lbar-2 { animation-delay: 0.08s; max-height: 12px; }
.lbar-3 { animation-delay: 0.16s; max-height: 15px; }
.lbar-4 { animation-delay: 0.05s; max-height: 12px; }
.lbar-5 { animation-delay: 0.12s; max-height: 8px; }

@keyframes listenRadioWave {
  0% { height: 3px; opacity: 0.6; }
  100% { height: 13px; opacity: 1; box-shadow: 0 0 12px rgba(239, 68, 68, 1); }
}

/* 📡 Radar scanning beam for thinking state */
.radar-scan-beam {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 8px;
  background: linear-gradient(90deg, transparent, #fbbf24, transparent);
  box-shadow: 0 0 8px #fbbf24;
  animation: radarSweep 0.9s linear infinite;
}

@keyframes radarSweep {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(300%); }
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
  border-color: #f59e0b !important;
  box-shadow: 0 0 22px rgba(245, 158, 11, 0.85), 0 0 35px rgba(249, 115, 22, 0.4) !important;
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

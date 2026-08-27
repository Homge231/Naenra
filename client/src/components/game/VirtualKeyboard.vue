<template>
  <div v-if="showVirtualKeyboard" class="virtual-keyboard-container sticky bottom-0 left-0 right-0 shrink-0 w-full bg-darkNavy/90 backdrop-blur-md p-2 rounded-t-xl border-t border-white/10 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] z-50">
    <div class="flex flex-col gap-2 max-w-lg mx-auto">
      <!-- Row 1 -->
      <div class="flex justify-center gap-1 sm:gap-1.5">
        <button
          v-for="key in row1"
          :key="key"
          @pointerdown.prevent.stop="emitKey(key)"
          @touchstart.prevent.stop="emitKey(key)"
          @click.prevent.stop
          type="button"
          class="vk-btn"
        >
          {{ key }}
        </button>
      </div>
      <!-- Row 2 -->
      <div class="flex justify-center gap-1 sm:gap-1.5 px-4">
        <button
          v-for="key in row2"
          :key="key"
          @pointerdown.prevent.stop="emitKey(key)"
          @touchstart.prevent.stop="emitKey(key)"
          @click.prevent.stop
          type="button"
          class="vk-btn"
        >
          {{ key }}
        </button>
      </div>
      <!-- Row 3 -->
      <div class="flex justify-center gap-1 sm:gap-1.5">
        <button
          @pointerdown.prevent.stop="emitKey('Backspace')"
          @touchstart.prevent.stop="emitKey('Backspace')"
          @click.prevent.stop
          type="button"
          class="vk-btn-special text-hexred font-bold flex-[1.2] px-1.5 sm:px-2.5"
          title="Delete"
        >
          ⌫ DEL
        </button>
        <button
          v-for="key in row3"
          :key="key"
          @pointerdown.prevent.stop="emitKey(key)"
          @touchstart.prevent.stop="emitKey(key)"
          @click.prevent.stop
          type="button"
          class="vk-btn"
        >
          {{ key }}
        </button>
        <button
          @pointerdown.prevent.stop="emitKey('Enter')"
          @touchstart.prevent.stop="emitKey('Enter')"
          @click.prevent.stop
          type="button"
          class="vk-btn-special text-emerald-400 font-bold flex-[1.2] px-1.5 sm:px-2.5"
          title="Enter"
        >
          ↵ ENTER
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDeviceMode } from '../../composables/useDeviceMode';

const { showVirtualKeyboard } = useDeviceMode();
const emit = defineEmits<{
  (e: 'keypress', key: string): void
}>();

const row1 = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'];
const row2 = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'];
const row3 = ['Z', 'X', 'C', 'V', 'B', 'N', 'M'];

let lastEmitTime = 0;
let lastEmitKey = '';

const emitKey = (key: string) => {
  const now = Date.now();
  // Debounce duplicate events if pointerdown and touchstart both fire on same event cycle (< 40ms)
  if (now - lastEmitTime < 40 && lastEmitKey === key) return;
  lastEmitTime = now;
  lastEmitKey = key;

  // Haptic feedback vibration on mobile devices (8ms gentle pulse)
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(8);
    } catch {}
  }

  emit('keypress', key);
};
</script>

<style scoped>
.virtual-keyboard-container {
  /* Let it flow naturally in the flex container so main takes remaining height */
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  flex-shrink: 0;
}

.vk-btn {
  @apply flex-1 h-12 sm:h-14 bg-white/10 hover:bg-white/20 active:bg-orange active:text-white rounded text-lg sm:text-xl font-black text-gray-200 transition-colors select-none flex items-center justify-center border border-white/5;
  min-width: 28px;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.vk-btn-special {
  @apply h-12 sm:h-14 bg-white/5 hover:bg-white/15 active:bg-white/30 rounded text-xs sm:text-sm font-black transition-colors select-none flex items-center justify-center border border-white/5;
  min-width: 36px;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
</style>

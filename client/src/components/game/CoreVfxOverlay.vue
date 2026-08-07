<template>
  <div v-if="playing && settingsStore.vfxEnabled" class="core-vfx-container pointer-events-none">
    <!-- Aegis Core Family: Rotating Ancient Ward Crests (Distinct Protective Style) -->
    <div v-if="family === 'aegis'" class="vfx-wrapper aegis-magical">
      <span class="ward-crest left">❂</span>
      <span class="ward-crest right">❂</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSettingsStore } from '../../stores/settingsStore'

const settingsStore = useSettingsStore()

const props = defineProps<{
  activeCoreName: string | null | undefined
  playing: boolean
}>()

const family = computed(() => {
  if (!props.activeCoreName) return 'none'
  const name = props.activeCoreName.toLowerCase()
  if (name.includes('aegis') || name.includes('shield') || name === 'bastion of light' || name === 'indomitable') return 'aegis'
  return 'none'
})
</script>

<style scoped>
.core-vfx-container {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 5;
  overflow: hidden;
  border-radius: inherit;
}

.vfx-wrapper {
  position: absolute;
  inset: 0;
}

/* --- Aegis Magical Shield Wards --- */
.aegis-magical {
  position: absolute;
  inset: 0;
  border-radius: inherit;
}
.ward-crest {
  position: absolute;
  top: 40%;
  font-size: 32px;
  color: #60a5fa;
  text-shadow: 0 0 12px #3b82f6, 0 0 25px rgba(59, 130, 246, 0.6);
  animation: crestSpin 12s linear infinite;
  user-select: none;
}
.ward-crest.left { left: -16px; }
.ward-crest.right { right: -16px; }

@keyframes crestSpin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>

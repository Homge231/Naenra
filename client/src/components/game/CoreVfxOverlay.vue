<template>
  <div v-if="playing && settingsStore.vfxEnabled" class="core-vfx-container pointer-events-none">
    <!-- Phoenix Core Family VFX: Floating orange/red fire embers -->
    <div v-if="family === 'phoenix'" class="vfx-wrapper phoenix-embers">
      <span v-for="n in 8" :key="'ember-'+n" class="ember" :class="'eb' + n"></span>
    </div>

    <!-- Aegis Core Family VFX: Shimmering blue shield aura outline -->
    <div v-if="family === 'aegis'" class="vfx-wrapper aegis-shield-glow">
      <div class="shield-border"></div>
    </div>

    <!-- Power Core Family VFX: Red lightning energy pulses -->
    <div v-if="family === 'power'" class="vfx-wrapper power-sparks">
      <div class="power-glow"></div>
    </div>

    <!-- High Roller Core Family VFX: Golden neon sparkles -->
    <div v-if="family === 'high-roller'" class="vfx-wrapper high-roller-stars">
      <span v-for="n in 6" :key="'star-'+n" class="star" :class="'st' + n">✦</span>
    </div>

    <!-- Balanced Core Family VFX: Zen radial gradient pulse -->
    <div v-if="family === 'balanced'" class="vfx-wrapper balanced-zen">
      <div class="zen-pulse"></div>
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
  if (name.includes('phoenix') || name === 'rebirth' || name === 'ashes to ashes') return 'phoenix'
  if (name.includes('aegis') || name.includes('shield') || name === 'bastion of light' || name === 'indomitable') return 'aegis'
  if (name.includes('power') || name.includes('overclock') || name.includes('hypercharge') || name === 'desperado' || name === 'brute force' || name === 'overload' || name === 'supermassive') return 'power'
  if (name.includes('roller') || name === 'jackpot' || name === 'safe bet' || name.includes('nothing') || name === 'all in' || name === 'russian roulette' || name === 'house advantage') return 'high-roller'
  if (name === 'balance' || name === 'balanced core' || name.includes('harmony') || name === 'zenith' || name === 'equilibrium' || name === 'steady pace' || name === 'yin yang' || name === 'cosmic balance' || name === 'nirvana') return 'balanced'
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

/* --- Phoenix Embers VFX --- */
.ember {
  position: absolute;
  bottom: -20px;
  width: 6px;
  height: 6px;
  background: radial-gradient(circle, rgba(239, 68, 68, 0.9), rgba(251, 146, 60, 0.4));
  border-radius: 50%;
  filter: blur(1px);
  animation: emberRise 3s linear infinite;
  box-shadow: 0 0 8px rgba(251, 146, 60, 0.8);
  opacity: 0;
}

.eb1 { left: 15%; animation-delay: 0s; animation-duration: 2.5s; width: 4px; height: 4px; }
.eb2 { left: 30%; animation-delay: 0.5s; animation-duration: 3.2s; width: 6px; height: 6px; }
.eb3 { left: 45%; animation-delay: 1.2s; animation-duration: 2.8s; width: 5px; height: 5px; }
.eb4 { left: 60%; animation-delay: 0.2s; animation-duration: 3.5s; width: 4px; height: 4px; }
.eb5 { left: 75%; animation-delay: 1.8s; animation-duration: 2.9s; width: 7px; height: 7px; }
.eb6 { left: 85%; animation-delay: 0.8s; animation-duration: 3.1s; width: 5px; height: 5px; }
.eb7 { left: 25%; animation-delay: 2.2s; animation-duration: 3.6s; width: 6px; height: 6px; }
.eb8 { left: 70%; animation-delay: 1.5s; animation-duration: 2.7s; width: 5px; height: 5px; }

@keyframes emberRise {
  0% { transform: translateY(0) scale(1); opacity: 0; }
  10% { opacity: 0.8; }
  90% { opacity: 0.4; }
  100% { transform: translateY(-110vh) scale(0.5); opacity: 0; }
}

/* --- Aegis Shield Glow VFX --- */
.shield-border {
  position: absolute;
  inset: 0;
  border: 2px solid rgba(59, 130, 246, 0.15);
  box-shadow: inset 0 0 20px rgba(59, 130, 246, 0.08);
  animation: shieldPulse 4s ease-in-out infinite;
  border-radius: inherit;
}

@keyframes shieldPulse {
  0%, 100% { border-color: rgba(59, 130, 246, 0.15); box-shadow: inset 0 0 20px rgba(59, 130, 246, 0.08); }
  50% { border-color: rgba(59, 130, 246, 0.35); box-shadow: inset 0 0 35px rgba(59, 130, 246, 0.2); }
}

/* --- Power Sparks VFX --- */
.power-glow {
  position: absolute;
  inset: 0;
  box-shadow: inset 0 0 25px rgba(239, 68, 68, 0.06);
  animation: powerPulse 2s ease-in-out infinite;
  border-radius: inherit;
}

@keyframes powerPulse {
  0%, 100% { box-shadow: inset 0 0 20px rgba(239, 68, 68, 0.05); }
  50% { box-shadow: inset 0 0 40px rgba(239, 68, 68, 0.18); }
}

/* --- High Roller Stars VFX --- */
.star {
  position: absolute;
  color: rgba(250, 204, 21, 0.85);
  font-size: 14px;
  text-shadow: 0 0 6px rgba(250, 204, 21, 0.8);
  animation: starTwinkle 2.5s ease-in-out infinite;
  opacity: 0;
}

.st1 { top: 15%; left: 8%; animation-delay: 0s; }
.st2 { top: 25%; right: 10%; animation-delay: 0.4s; }
.st3 { bottom: 20%; left: 12%; animation-delay: 0.8s; }
.st4 { bottom: 15%; right: 14%; animation-delay: 1.2s; }
.st5 { top: 75%; left: 4%; animation-delay: 0.2s; }
.st6 { top: 45%; right: 6%; animation-delay: 1.5s; }

@keyframes starTwinkle {
  0%, 100% { opacity: 0; transform: scale(0.6) rotate(0deg); }
  50% { opacity: 0.7; transform: scale(1.1) rotate(180deg); }
}

/* --- Balanced Zen VFX --- */
.zen-pulse {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle, rgba(167, 243, 208, 0.03) 0%, transparent 70%);
  animation: zenFloat 6s ease-in-out infinite alternate;
}

@keyframes zenFloat {
  0% { transform: scale(0.9); opacity: 0.3; }
  100% { transform: scale(1.1); opacity: 0.7; }
}
</style>

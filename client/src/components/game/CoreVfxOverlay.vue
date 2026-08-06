<template>
  <div v-if="playing && settingsStore.vfxEnabled" class="core-vfx-container pointer-events-none">
    <!-- Phoenix Core Family VFX: Floating orange/red fire embers -->
    <div v-if="family === 'phoenix'" class="vfx-wrapper phoenix-embers">
      <span v-for="n in 8" :key="'ember-'+n" class="ember" :class="'eb' + n"></span>
    </div>

    <!-- Aegis Core Family VFX: Shimmering hexagonal energy grid -->
    <div v-if="family === 'aegis'" class="vfx-wrapper aegis-honeycomb">
      <span class="aegis-item hex st1">⬢</span>
      <span class="aegis-item hex st2">⬡</span>
      <span class="aegis-item hex st3">⬢</span>
      <span class="aegis-item hex st4">⬡</span>
      <span class="aegis-item hex st5">⬢</span>
      <span class="aegis-item hex st6">⬢</span>
      <div class="honeycomb-grid"></div>
    </div>

    <!-- Power Core Family VFX: Red lightning & hypercharge energy surge -->
    <div v-if="family === 'power'" class="vfx-wrapper power-surge">
      <span class="power-item bolt st1">⚡</span>
      <span class="power-item bolt st2">⚡</span>
      <span class="power-item bolt st3">⚡</span>
      <span class="power-item bolt st4">⚡</span>
      <div class="overclock-glow"></div>
    </div>

    <!-- High Roller Core Family VFX: Gambler & Cowboy style (card suits, dice, gold coins, and sheriff stars) -->
    <div v-if="family === 'high-roller'" class="vfx-wrapper high-roller-gambler">
      <span class="gambler-item spade st1">♠</span>
      <span class="gambler-item heart st2">♥</span>
      <span class="gambler-item diamond st3">♦</span>
      <span class="gambler-item club st4">♣</span>
      <span class="gambler-item badge st5">⭐</span>
      <span class="gambler-item dice st6">🎲</span>
      <span class="gambler-item coin st7">🪙</span>
      <span class="gambler-item badge st8">⭐</span>
      <!-- Dust storm/Sunset glow overlay -->
      <div class="desert-sunset"></div>
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

/* --- Aegis Hexagonal Honeycomb VFX --- */
.aegis-item {
  position: absolute;
  font-size: 24px;
  animation: hexPulseFloat 5s ease-in-out infinite;
  opacity: 0;
  user-select: none;
}

.hex {
  color: rgba(96, 165, 250, 0.5);
  text-shadow: 0 0 10px rgba(59, 130, 246, 0.8), 0 0 20px rgba(59, 130, 246, 0.4);
}

@keyframes hexPulseFloat {
  0% { opacity: 0; transform: scale(0.8) translateY(10px) rotate(0deg); }
  30% { opacity: 0.7; }
  70% { opacity: 0.7; }
  100% { opacity: 0; transform: scale(1.1) translateY(-20px) rotate(180deg); }
}

.honeycomb-grid {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(59, 130, 246, 0.12) 1.5px, transparent 1.5px);
  background-size: 16px 16px;
  mask-image: radial-gradient(circle at center, transparent 30%, black 100%);
  animation: gridShimmer 8s linear infinite;
  pointer-events: none;
  border-radius: inherit;
}

@keyframes gridShimmer {
  0% { opacity: 0.4; transform: scale(1.0); }
  50% { opacity: 0.8; transform: scale(1.03); }
  100% { opacity: 0.4; transform: scale(1.0); }
}

/* --- Power Lightning Surge VFX --- */
.power-item {
  position: absolute;
  font-size: 24px;
  font-weight: bold;
  animation: lightningSurge 2.5s ease-in-out infinite;
  opacity: 0;
  user-select: none;
}

.bolt {
  color: #f87171;
  text-shadow: 0 0 12px #ef4444, 0 0 24px rgba(239, 68, 68, 0.8);
}

@keyframes lightningSurge {
  0% { opacity: 0; transform: scale(0.6) translateY(5px); filter: brightness(1); }
  10% { opacity: 1; filter: brightness(1.8); }
  15% { opacity: 0.4; filter: brightness(1); }
  20% { opacity: 1; filter: brightness(1.8); }
  75% { opacity: 0.8; }
  100% { opacity: 0; transform: scale(1.2) translateY(-15px); filter: brightness(1); }
}

.overclock-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at top, rgba(239, 68, 68, 0.05) 0%, transparent 60%);
  pointer-events: none;
  border-radius: inherit;
  animation: alarmPulse 1.5s ease-in-out infinite alternate;
}

@keyframes alarmPulse {
  0% { opacity: 0.3; }
  100% { opacity: 1; }
}

/* --- High Roller Gambler & Cowboy VFX --- */
.gambler-item {
  position: absolute;
  font-size: 22px; /* Made larger and clearer */
  font-weight: bold;
  animation: gamblerDrift 5s ease-in-out infinite;
  opacity: 0;
  user-select: none;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3));
}

.spade { 
  color: #a78bfa; 
  text-shadow: 0 0 10px #8b5cf6, 0 0 20px rgba(139, 92, 246, 0.4); 
}
.heart { 
  color: #f87171; 
  text-shadow: 0 0 10px #ef4444, 0 0 20px rgba(239, 68, 68, 0.4); 
}
.diamond { 
  color: #fb923c; 
  text-shadow: 0 0 10px #f59e0b, 0 0 20px rgba(245, 158, 11, 0.4); 
}
.club { 
  color: #60a5fa; 
  text-shadow: 0 0 10px #3b82f6, 0 0 20px rgba(59, 130, 246, 0.4); 
}
.badge { 
  color: #fcd34d; 
  font-size: 26px; 
  text-shadow: 0 0 12px #fbbf24, 0 0 25px rgba(245, 158, 11, 0.6);
  animation: badgeSpin 6s linear infinite; 
}
.dice {
  font-size: 24px;
  animation: diceTumble 4.5s ease-in-out infinite;
}
.coin {
  font-size: 20px;
  animation: coinFlip 4s ease-in-out infinite;
}

.st1 { top: 10%; left: 6%; animation-delay: 0s; }
.st2 { top: 20%; right: 8%; animation-delay: 1.2s; }
.st3 { bottom: 25%; left: 8%; animation-delay: 2.4s; }
.st4 { bottom: 20%; right: 10%; animation-delay: 3.6s; }
.st5 { top: 65%; left: 5%; animation-delay: 0.8s; }
.st6 { top: 40%; right: 6%; animation-delay: 1.8s; }
.st7 { bottom: 45%; left: 4%; animation-delay: 3s; }
.st8 { top: 5%; right: 25%; animation-delay: 2s; }

@keyframes gamblerDrift {
  0% { opacity: 0; transform: translateY(20px) rotate(0deg) scale(0.7); }
  20% { opacity: 0.95; }
  80% { opacity: 0.95; }
  100% { opacity: 0; transform: translateY(-30px) rotate(360deg) scale(1.2); }
}

@keyframes badgeSpin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes diceTumble {
  0% { opacity: 0; transform: translate(0, 20px) rotate(0deg) scale(0.7); }
  25% { opacity: 0.9; transform: translate(-10px, 0) rotate(90deg) scale(1); }
  50% { opacity: 0.9; transform: translate(5px, -20px) rotate(180deg) scale(1.1); }
  75% { opacity: 0.9; transform: translate(-5px, -35px) rotate(270deg) scale(1); }
  100% { opacity: 0; transform: translate(0, -50px) rotate(360deg) scale(0.8); }
}

@keyframes coinFlip {
  0% { opacity: 0; transform: scale(0.6) rotateY(0deg); }
  20% { opacity: 0.95; }
  80% { opacity: 0.95; }
  100% { opacity: 0; transform: translateY(-40px) scale(1.1) rotateY(720deg); }
}

.desert-sunset {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at bottom right, rgba(245, 158, 11, 0.05) 0%, transparent 60%),
              radial-gradient(circle at bottom left, rgba(239, 68, 68, 0.05) 0%, transparent 60%);
  pointer-events: none;
  border-radius: inherit;
  box-shadow: inset 0 0 30px rgba(245, 158, 11, 0.05);
  animation: sunsetGlow 8s ease-in-out infinite alternate;
}

@keyframes sunsetGlow {
  0% { opacity: 0.6; }
  100% { opacity: 1; }
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

<template>
  <div v-if="playing && settingsStore.vfxEnabled" class="core-vfx-container pointer-events-none">
    <!-- Phoenix Core Family: Fire Vignette & Heat Pulse -->
    <div v-if="family === 'phoenix'" class="vfx-wrapper phoenix-vignette">
      <div class="fire-glow"></div>
    </div>

    <!-- Aegis Core Family: Defensive Dome & Guard Plates (Protector Style) -->
    <div v-if="family === 'aegis'" class="vfx-wrapper aegis-protector">
      <div class="shield-dome"></div>
      <div class="guard-plate left"></div>
      <div class="guard-plate right"></div>
    </div>

    <!-- Power Core Family: Blazing Energy Aura & Overload Vibration (Strong Style) -->
    <div v-if="family === 'power'" class="vfx-wrapper power-strong">
      <div class="blazing-aura"></div>
      <div class="heavy-braces"></div>
    </div>

    <!-- High Roller Core Family: Casino Gold Card Corners & Flashing Marquee -->
    <div v-if="family === 'high-roller'" class="vfx-wrapper high-roller-marquee">
      <div class="marquee-border"></div>
      <div class="gold-card-corner top-left"></div>
      <div class="gold-card-corner top-right"></div>
      <div class="gold-card-corner bottom-left"></div>
      <div class="gold-card-corner bottom-right"></div>
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

/* --- Phoenix Vignette VFX --- */
.phoenix-vignette {
  background: radial-gradient(circle, transparent 50%, rgba(239, 68, 68, 0.08) 100%);
  border-radius: inherit;
}
.fire-glow {
  position: absolute;
  inset: 0;
  box-shadow: inset 0 0 35px rgba(249, 115, 22, 0.15);
  animation: fireBreath 4s ease-in-out infinite alternate;
  border-radius: inherit;
}

@keyframes fireBreath {
  0% { box-shadow: inset 0 0 25px rgba(249, 115, 22, 0.15); filter: contrast(1); }
  100% { box-shadow: inset 0 0 45px rgba(239, 68, 68, 0.28); filter: contrast(1.08); }
}

/* --- Aegis Protector VFX --- */
.aegis-protector {
  position: absolute;
  inset: 0;
  border-radius: inherit;
}
.shield-dome {
  position: absolute;
  inset: 10px;
  border: 3px solid rgba(59, 130, 246, 0.35);
  border-radius: 20px;
  background: radial-gradient(circle, transparent 65%, rgba(59, 130, 246, 0.06) 100%);
  box-shadow: 0 0 25px rgba(59, 130, 246, 0.25), inset 0 0 20px rgba(59, 130, 246, 0.15);
  animation: domePulse 3s ease-in-out infinite alternate;
}
.guard-plate {
  position: absolute;
  top: 15%;
  height: 70%;
  width: 6px;
  background: #3b82f6;
  border-radius: 9999px;
  box-shadow: 0 0 15px rgba(59, 130, 246, 0.8);
  animation: guardPulse 3s ease-in-out infinite alternate;
}
.guard-plate.left { left: 4px; border-radius: 0 9999px 9999px 0; }
.guard-plate.right { right: 4px; border-radius: 9999px 0 0 9999px; }

@keyframes domePulse {
  0% { transform: scale(0.99); opacity: 0.7; box-shadow: 0 0 15px rgba(59, 130, 246, 0.15), inset 0 0 15px rgba(59, 130, 246, 0.1); }
  100% { transform: scale(1.01); opacity: 1; box-shadow: 0 0 35px rgba(59, 130, 246, 0.35), inset 0 0 30px rgba(59, 130, 246, 0.25); }
}

@keyframes guardPulse {
  0% { transform: scaleY(0.95); opacity: 0.6; }
  100% { transform: scaleY(1.05); opacity: 1; }
}

/* --- Power Strong VFX --- */
.power-strong {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  animation: boardVibrate 0.25s linear infinite;
}
.blazing-aura {
  position: absolute;
  inset: 0;
  border: 4px solid rgba(239, 68, 68, 0.3);
  border-radius: inherit;
  box-shadow: inset 0 0 30px rgba(239, 68, 68, 0.2);
  background: radial-gradient(circle, transparent 60%, rgba(239, 68, 68, 0.12) 100%);
  animation: energyBlaze 2s ease-in-out infinite alternate;
}
.heavy-braces {
  position: absolute;
  inset: 6px;
  border: 3px double #ef4444;
  border-radius: inherit;
  box-shadow: 0 0 20px rgba(239, 68, 68, 0.6);
  animation: braceFlicker 1s steps(2) infinite;
}

@keyframes energyBlaze {
  0% { 
    box-shadow: inset 0 0 20px rgba(239, 68, 68, 0.15), 0 0 15px rgba(239, 68, 68, 0.3); 
    border-color: rgba(239, 68, 68, 0.3);
  }
  100% { 
    box-shadow: inset 0 0 40px rgba(239, 68, 68, 0.35), 0 0 30px rgba(239, 68, 68, 0.6); 
    border-color: rgba(239, 68, 68, 0.6);
  }
}

@keyframes braceFlicker {
  0%, 100% { opacity: 0.9; }
  50% { opacity: 0.65; }
}

@keyframes boardVibrate {
  0%, 100% { transform: translate(0, 0); }
  25% { transform: translate(0.5px, -0.5px); }
  50% { transform: translate(-0.5px, 0.5px); }
  75% { transform: translate(0.5px, 0.5px); }
}

/* --- High Roller Marquee VFX --- */
.high-roller-marquee {
  background: radial-gradient(circle at center, transparent 40%, rgba(245, 158, 11, 0.06) 100%);
  border-radius: inherit;
}
.marquee-border {
  position: absolute;
  inset: 6px;
  border: 2px dashed #fbbf24;
  border-radius: inherit;
  filter: drop-shadow(0 0 8px #f59e0b);
  animation: marqueeChase 0.8s linear infinite;
}

@keyframes marqueeChase {
  0% { border-style: dashed; border-color: #fbbf24; }
  50% { border-color: #f43f5e; }
  100% { border-style: dashed; border-color: #fbbf24; }
}

.gold-card-corner {
  position: absolute;
  width: 30px;
  height: 30px;
  border: 2px solid #fbbf24;
  filter: drop-shadow(0 0 5px rgba(251, 191, 36, 0.8));
  opacity: 0.85;
}
.gold-card-corner.top-left { top: 12px; left: 12px; border-right: none; border-bottom: none; border-radius: 4px 0 0 0; }
.gold-card-corner.top-right { top: 12px; right: 12px; border-left: none; border-bottom: none; border-radius: 0 4px 0 0; }
.gold-card-corner.bottom-left { bottom: 12px; left: 12px; border-right: none; border-top: none; border-radius: 0 0 0 4px; }
.gold-card-corner.bottom-right { bottom: 12px; right: 12px; border-left: none; border-top: none; border-radius: 0 0 4px 0; }

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

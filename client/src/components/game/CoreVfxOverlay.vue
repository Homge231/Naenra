<template>
  <div v-if="playing && settingsStore.vfxEnabled" class="core-vfx-container pointer-events-none">
    <!-- Phoenix Core Family: Fire Vignette & Heat Pulse (No floating particles) -->
    <div v-if="family === 'phoenix'" class="vfx-wrapper phoenix-vignette">
      <div class="fire-glow"></div>
    </div>

    <!-- Aegis Core Family: Tactical Cyber HUD Corner Brackets & Scan Line -->
    <div v-if="family === 'aegis'" class="vfx-wrapper aegis-hud">
      <div class="hud-bracket top-left"></div>
      <div class="hud-bracket top-right"></div>
      <div class="hud-bracket bottom-left"></div>
      <div class="hud-bracket bottom-right"></div>
      <div class="hud-scanner"></div>
    </div>

    <!-- Power Core Family: Overclock Alert Brackets & Danger Scanline -->
    <div v-if="family === 'power'" class="vfx-wrapper power-alert">
      <div class="alert-bracket top-left"></div>
      <div class="alert-bracket top-right"></div>
      <div class="alert-bracket bottom-left"></div>
      <div class="alert-bracket bottom-right"></div>
      <div class="alert-scanline"></div>
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

/* --- Aegis HUD VFX --- */
.aegis-hud {
  box-shadow: inset 0 0 25px rgba(59, 130, 246, 0.08);
  border-radius: inherit;
}
.hud-bracket {
  position: absolute;
  width: 20px;
  height: 20px;
  border: 3px solid #60a5fa;
  filter: drop-shadow(0 0 5px rgba(59, 130, 246, 0.8));
  animation: bracketPulse 3s ease-in-out infinite;
}
.hud-bracket.top-left { top: 12px; left: 12px; border-right: none; border-bottom: none; }
.hud-bracket.top-right { top: 12px; right: 12px; border-left: none; border-bottom: none; }
.hud-bracket.bottom-left { bottom: 12px; left: 12px; border-right: none; border-top: none; }
.hud-bracket.bottom-right { bottom: 12px; right: 12px; border-left: none; border-top: none; }

@keyframes bracketPulse {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.05); }
}

.hud-scanner {
  position: absolute;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(96, 165, 250, 0.4), transparent);
  animation: scanMove 4s linear infinite;
  box-shadow: 0 0 10px rgba(59, 130, 246, 0.3);
}

@keyframes scanMove {
  0% { top: 0%; opacity: 0; }
  10% { opacity: 0.8; }
  90% { opacity: 0.8; }
  100% { top: 100%; opacity: 0; }
}

/* --- Power Alert VFX --- */
.power-alert {
  box-shadow: inset 0 0 30px rgba(239, 68, 68, 0.12);
  border-radius: inherit;
}
.alert-bracket {
  position: absolute;
  width: 22px;
  height: 22px;
  border: 3px solid #f87171;
  filter: drop-shadow(0 0 6px rgba(239, 68, 68, 0.8));
  animation: alertFlicker 1.8s ease-in-out infinite;
}
.alert-bracket.top-left { top: 12px; left: 12px; border-right: none; border-bottom: none; }
.alert-bracket.top-right { top: 12px; right: 12px; border-left: none; border-bottom: none; }
.alert-bracket.bottom-left { bottom: 12px; left: 12px; border-right: none; border-top: none; }
.alert-bracket.bottom-right { bottom: 12px; right: 12px; border-left: none; border-top: none; }

@keyframes alertFlicker {
  0%, 100% { opacity: 0.8; transform: scale(1); }
  5% { opacity: 0.3; }
  10% { opacity: 0.9; }
  15% { opacity: 0.4; }
  50% { opacity: 1; transform: scale(1.08); }
}

.alert-scanline {
  position: absolute;
  left: 0;
  width: 100%;
  height: 3px;
  background: rgba(239, 68, 68, 0.6);
  box-shadow: 0 0 12px rgba(239, 68, 68, 0.8);
  animation: scanlineCrack 3s ease-in-out infinite;
}

@keyframes scanlineCrack {
  0% { top: 20%; opacity: 0; }
  5% { opacity: 0.8; }
  10% { top: 40%; opacity: 0.3; }
  12% { opacity: 0.9; }
  30% { top: 80%; opacity: 0.8; }
  35% { opacity: 0; }
  100% { top: 100%; opacity: 0; }
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
  50% { border-color: #f43f5e; } /* Flashing gold to rose-gold */
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

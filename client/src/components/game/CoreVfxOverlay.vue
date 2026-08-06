<template>
  <div v-if="playing && settingsStore.vfxEnabled" class="core-vfx-container pointer-events-none">
    <!-- Phoenix Core Family: Fire Vignette & Heat Pulse -->
    <div v-if="family === 'phoenix'" class="vfx-wrapper phoenix-vignette">
      <div class="fire-glow"></div>
    </div>

    <!-- Aegis Core Family: Rotating Ancient Ward Crests & Side Barriers (Distinct Protective Style) -->
    <div v-if="family === 'aegis'" class="vfx-wrapper aegis-magical">
      <span class="ward-crest left">❂</span>
      <span class="ward-crest right">❂</span>
      <div class="ward-barrier"></div>
    </div>

    <!-- Power Core Family: Volcanic Might & Strength Rune (Uruz strength rune) -->
    <div v-if="family === 'power'" class="vfx-wrapper power-runic">
      <span class="strength-rune top-left">ᚢ</span>
      <span class="strength-rune top-right">ᚢ</span>
      <span class="strength-rune bottom-left">ᚢ</span>
      <span class="strength-rune bottom-right">ᚢ</span>
      <div class="magma-glow"></div>
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

.ward-barrier {
  position: absolute;
  inset: 8px;
  border-left: 3px solid rgba(96, 165, 250, 0.35);
  border-right: 3px solid rgba(96, 165, 250, 0.35);
  border-radius: 12px;
  box-shadow: inset 0 0 20px rgba(59, 130, 246, 0.1);
  animation: barrierPulse 3s ease-in-out infinite alternate;
}

@keyframes crestSpin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes barrierPulse {
  0% { opacity: 0.4; }
  100% { opacity: 1; }
}

/* --- Power Volcanic Might VFX --- */
.power-runic {
  position: absolute;
  inset: 0;
  border-radius: inherit;
}
.strength-rune {
  position: absolute;
  font-size: 28px;
  color: #fdba74;
  text-shadow: 0 0 12px #f97316, 0 0 24px rgba(239, 68, 68, 0.8);
  animation: runeGlow 2s ease-in-out infinite alternate;
  user-select: none;
  font-weight: bold;
}
.strength-rune.top-left { top: 12px; left: 16px; }
.strength-rune.top-right { top: 12px; right: 16px; }
.strength-rune.bottom-left { bottom: 12px; left: 16px; }
.strength-rune.bottom-right { bottom: 12px; right: 16px; }

.magma-glow {
  position: absolute;
  inset: 0;
  border: 2px solid rgba(239, 68, 68, 0.3);
  border-radius: inherit;
  box-shadow: inset 0 0 30px rgba(249, 115, 22, 0.18);
  background: radial-gradient(circle, transparent 65%, rgba(239, 68, 68, 0.08) 100%);
  animation: magmaPulse 2.5s ease-in-out infinite alternate;
}

@keyframes magmaPulse {
  0% { opacity: 0.6; box-shadow: inset 0 0 20px rgba(249, 115, 22, 0.12); }
  100% { opacity: 1; box-shadow: inset 0 0 40px rgba(239, 68, 68, 0.3); }
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

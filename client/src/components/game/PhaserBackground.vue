<template>
  <div class="absolute inset-0 z-0">
    <div
      class="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out"
      :style="{ backgroundImage: `url(${imageUrl})` }"
    ></div>

    <div class="absolute inset-0 bg-darkNavy/60 backdrop-blur-[2px]"></div>

    <div id="phaser-container" class="absolute inset-0 pointer-events-none" :class="{ 'opacity-0': vfxEnabled === false }"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue'

const props = defineProps<{
  imageUrl: string
  vfxEnabled?: boolean
  activeCoreName?: string | null
}>()

let phaserGame: import('phaser').Game | null = null
let cancelled = false

const initPhaser = async () => {
  const Phaser = await import('phaser')
  if (cancelled) return

  class MagicScene extends Phaser.Scene {
    emitter: any = null
    constructor() {
      super('MagicScene')
    }

    create() {
      const g = this.add.graphics()
      g.fillStyle(0xffffff, 1) // Pure white for perfect tinting
      g.fillCircle(4, 4, 4)
      g.generateTexture('dust-mote', 8, 8)
      g.destroy()

      this.updateEmitterConfig(props.activeCoreName)
    }

    updateEmitterConfig(coreName: string | null | undefined) {
      if (this.emitter) {
        this.emitter.destroy()
        this.emitter = null
      }

      const width = this.scale.width
      const height = this.scale.height
      const name = coreName?.toLowerCase() || ''

      const config: any = {
        x: { min: 0, max: width },
        y: { min: 0, max: height },
        lifespan: { min: 5000, max: 10000 },
        scale: { min: 0.1, max: 0.4 },
        alpha: { start: 0.6, end: 0 },
        quantity: 1,
        blendMode: 'SCREEN'
      }

      if (name.includes('phoenix') || name === 'rebirth' || name === 'ashes to ashes') {
        // Phoenix Core: Fire sparks floating upwards rapidly
        config.tint = 0xff5500
        config.speedX = { min: -30, max: 30 }
        config.speedY = { min: -120, max: -40 }
        config.frequency = 60
        config.scale = { min: 0.15, max: 0.55 }
      } else if (name.includes('aegis') || name.includes('shield') || name === 'bastion of light' || name === 'indomitable') {
        // Aegis Core: Shield blue defensive matrix drifting slowly
        config.tint = 0x3b82f6
        config.speedX = { min: -40, max: 40 }
        config.speedY = { min: -40, max: 40 }
        config.frequency = 90
        config.scale = { min: 0.2, max: 0.6 }
      } else if (name.includes('roller') || name.includes('jackpot') || name === 'safe bet' || name.includes('nothing') || name === 'all in' || name === 'russian roulette' || name === 'house advantage' || name.includes('gambler') || name.includes('poker')) {
        // High Roller (Jazz, Cowboy & Gambler Saloon Theme): Warm golden amber neon sparkles floating upward like saloon jazz smoke & gold chip glints
        config.tint = [0xffb700, 0xff8800, 0xffd700]
        config.speedX = { min: -25, max: 25 }
        config.speedY = { min: -55, max: -15 }
        config.frequency = 55
        config.scale = { min: 0.15, max: 0.55 }
        config.blendMode = 'ADD'
      } else {
        // Default gold-tinted dust motes
        config.tint = 0xffeeba
        config.speedX = { min: -10, max: 20 }
        config.speedY = { min: -10, max: 20 }
        config.frequency = 150
        config.scale = { min: 0.1, max: 0.4 }
      }

      this.emitter = this.add.particles(0, 0, 'dust-mote', config)
    }
  }

  const config: import('phaser').Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: 'phaser-container',
    width: window.innerWidth,
    height: window.innerHeight,
    transparent: true,
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: MagicScene
  }
  phaserGame = new Phaser.Game(config)
}

watch(() => props.vfxEnabled, (newVal) => {
  if (phaserGame && phaserGame.scene) {
    const scene = phaserGame.scene.getScene('MagicScene')
    if (scene) {
      if (newVal === false) {
        scene.scene.pause()
      } else {
        scene.scene.resume()
      }
    }
  }
})

watch(() => props.activeCoreName, (newVal) => {
  if (phaserGame && phaserGame.scene) {
    const scene = phaserGame.scene.getScene('MagicScene') as any
    if (scene && typeof scene.updateEmitterConfig === 'function') {
      scene.updateEmitterConfig(newVal)
    }
  }
})

onMounted(() => {
  initPhaser().then(() => {
    if (props.vfxEnabled === false && phaserGame && phaserGame.scene) {
      const scene = phaserGame.scene.getScene('MagicScene')
      if (scene) scene.scene.pause()
    }
  })
})

onUnmounted(() => {
  cancelled = true
  if (phaserGame) phaserGame.destroy(true)
})
</script>

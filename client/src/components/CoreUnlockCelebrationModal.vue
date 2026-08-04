<template>
  <Transition name="celebration-fade">
    <div
      v-if="isOpen && unlockedCores.length > 0"
      class="celebration-overlay fixed inset-0 z-[10000] flex items-center justify-center bg-black/85 backdrop-blur-xl p-4"
    >
      <!-- Confetti Particle Canvas -->
      <canvas ref="canvasRef" class="absolute inset-0 pointer-events-none z-0"></canvas>

      <!-- Modal Card Box -->
      <div class="relative z-10 w-full max-w-lg bg-gradient-to-b from-slate-900 via-slate-950 to-black border border-cyan-500/40 rounded-3xl p-8 shadow-[0_0_80px_rgba(6,182,212,0.3)] text-center overflow-hidden">
        
        <!-- Header Badge -->
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 font-bold text-xs uppercase tracking-widest mb-4 animate-bounce">
          <span>🎉</span> CORE UNLOCKED <span>🎉</span>
        </div>

        <h2 class="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-500 mb-2 drop-shadow-sm">
          NHIỆM VỤ HOÀN THÀNH!
        </h2>
        <p class="text-slate-400 text-sm mb-6">
          Bạn vừa xuất sắc mở khóa được Support Core mới!
        </p>

        <!-- Unlocked Core Card Preview Carousel/Grid -->
        <div class="flex flex-col gap-4 my-6">
          <div
            v-for="core in unlockedCores"
            :key="core.id"
            class="group relative bg-slate-800/80 border border-amber-500/50 hover:border-amber-400 rounded-2xl p-5 flex items-center gap-5 text-left transition-all duration-300 shadow-xl hover:shadow-amber-500/20"
          >
            <!-- Core Icon Box -->
            <div class="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-500/30 to-orange-600/30 border border-amber-400/60 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform">
              <img
                :src="resolveIcon(core)"
                :alt="core.name"
                class="w-10 h-10 object-contain drop-shadow-md"
                @error="onImgError"
              />
            </div>

            <!-- Core Information -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <h3 class="text-lg font-bold text-white truncate">{{ core.name }}</h3>
                <span class="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/40">
                  TIER {{ core.tier || 2 }}
                </span>
              </div>
              <p class="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                {{ core.description }}
              </p>
              <div class="flex gap-3 mt-2 text-[11px] font-mono text-cyan-400 font-semibold">
                <span v-if="core.flat_buff">+{{ core.flat_buff }} Pts</span>
                <span v-if="core.multiplier_buff && core.multiplier_buff !== 1">x{{ core.multiplier_buff }} Buff</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center justify-center gap-4 mt-6">
          <button
            @click="closeModal"
            class="px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-sm tracking-wide uppercase shadow-[0_0_25px_rgba(245,158,11,0.4)] transition-all hover:scale-105 active:scale-95"
          >
            TRANG BỊ NGAY
          </button>
        </div>

      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'

export interface UnlockedCoreDetail {
  id: string
  name: string
  classification: string
  tier: number
  description: string
  flat_buff: number
  multiplier_buff: number
  icon_url?: string
}

const props = defineProps<{
  isOpen: boolean
  unlockedCores: UnlockedCoreDetail[]
}>()

const emit = defineEmits(['close'])

const canvasRef = ref<HTMLCanvasElement | null>(null)
let animFrame: number | null = null

function closeModal() {
  emit('close')
}

function resolveIcon(core: UnlockedCoreDetail) {
  if (core.icon_url) return core.icon_url
  const slug = core.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  return `/icons/cores/${slug}.svg`
}

function onImgError(e: Event) {
  const target = e.target as HTMLImageElement
  target.src = '/icons/cores/default.svg'
}

// ── Confetti Animation Logic ─────────────────────────────────────────
function startConfetti() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  const particles: Array<{
    x: number
    y: number
    r: number
    d: number
    color: string
    tilt: number
    tiltAngleIncremental: number
    tiltAngle: number
  }> = []

  const colors = ['#f59e0b', '#06b6d4', '#3b82f6', '#ec4899', '#10b981', '#ffffff']

  for (let i = 0; i < 120; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      r: Math.random() * 8 + 4,
      d: Math.random() * 10 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      tilt: Math.floor(Math.random() * 10) - 10,
      tiltAngleIncremental: Math.random() * 0.07 + 0.05,
      tiltAngle: 0
    })
  }

  function draw() {
    if (!ctx || !canvas) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i]
      ctx.beginPath()
      ctx.lineWidth = p.r
      ctx.strokeStyle = p.color
      ctx.moveTo(p.x + p.tilt + p.r / 2, p.y)
      ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2)
      ctx.stroke()
    }

    update()
  }

  function update() {
    if (!canvas) return
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i]
      p.tiltAngle += p.tiltAngleIncremental
      p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2
      p.x += Math.sin(p.d)
      p.tilt = Math.sin(p.tiltAngle) * 15

      if (p.y > canvas.height) {
        p.x = Math.random() * canvas.width
        p.y = -20
        p.tilt = Math.floor(Math.random() * 10) - 10
      }
    }
  }

  function loop() {
    draw()
    animFrame = requestAnimationFrame(loop)
  }

  loop()
}

function stopConfetti() {
  if (animFrame !== null) {
    cancelAnimationFrame(animFrame)
    animFrame = null
  }
}

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    setTimeout(() => startConfetti(), 100)
  } else {
    stopConfetti()
  }
})

onBeforeUnmount(() => {
  stopConfetti()
})
</script>

<style scoped>
.celebration-fade-enter-active,
.celebration-fade-leave-active {
  transition: opacity 0.4s ease;
}
.celebration-fade-enter-from,
.celebration-fade-leave-to {
  opacity: 0;
}
</style>

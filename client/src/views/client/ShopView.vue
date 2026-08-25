<template>
  <div class="min-h-screen w-full bg-[#fff8f5] text-gray-800 relative font-sans flex flex-col">
    <!-- Ambient blobs -->
    <div class="fixed inset-0 pointer-events-none z-0">
      <div class="absolute top-[-10%] left-[-5%] w-[50vw] h-[50vw] bg-orange-200/20 rounded-full blur-[100px] animate-pulse"></div>
      <div class="absolute bottom-[-10%] right-[-5%] w-[45vw] h-[45vw] bg-purple-300/15 rounded-full blur-[100px] animate-pulse" style="animation-delay:1s"></div>
    </div>

    <!-- Header -->
    <header class="relative z-20 flex items-center p-4 lg:px-8">
      <button
        @click="router.push('/home')"
        class="flex items-center gap-2 bg-white/70 backdrop-blur-md px-3 py-2 rounded-2xl shadow-sm border border-white/60 active:scale-95 transition-transform cursor-pointer"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" />
        </svg>
        <span class="text-xs font-black uppercase tracking-wider text-gray-700">Back</span>
      </button>
    </header>

    <!-- Content -->
    <main class="relative z-10 flex-1 flex flex-col items-center justify-center px-4 text-center gap-6">
      <div class="text-6xl animate-bounce">🛒</div>

      <div>
        <h1 class="text-4xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500 mb-2">
          Shop
        </h1>
        <p class="text-sm font-bold text-gray-400 uppercase tracking-[0.3em]">Coming Soon</p>
      </div>

      <div class="bg-white/80 backdrop-blur-xl rounded-3xl border-2 border-white p-6 shadow-[0_10px_40px_rgba(0,0,0,0.06)] max-w-sm w-full">
        <p class="text-sm text-gray-500 font-medium leading-relaxed mb-5">
          The Naenra Shop is under construction. Soon you'll be able to purchase cosmetics, avatar frames, and special Core skins here.
        </p>
        <div class="flex flex-wrap gap-2 justify-center">
          <span class="text-xs bg-orange-50 text-orange-500 border border-orange-200 px-3 py-1 rounded-full font-bold">🎨 Avatar Frames</span>
          <span class="text-xs bg-purple-50 text-purple-500 border border-purple-200 px-3 py-1 rounded-full font-bold">✨ Core Skins</span>
          <span class="text-xs bg-blue-50 text-blue-500 border border-blue-200 px-3 py-1 rounded-full font-bold">🏆 Title Badges</span>
        </div>
      </div>

      <button
        @click="router.push('/home')"
        class="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg active:scale-95 transition-all cursor-pointer"
      >
        ← Back to Home
      </button>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

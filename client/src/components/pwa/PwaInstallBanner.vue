<template>
  <div>
    <!-- FLOATING PWA INSTALL POPUP (WHEN NATIVE PROMPT IS AVAILABLE) -->
    <transition name="slide-fade">
      <div
        v-if="canInstall && !isDismissed"
        class="fixed bottom-5 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-40 bg-slate-900/95 border border-purple-500/50 rounded-2xl p-4 shadow-[0_0_30px_rgba(134,59,255,0.3)] backdrop-blur-xl animate-fade-in"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl bg-slate-950 border border-purple-500/60 p-2 flex items-center justify-center shadow-[0_0_15px_rgba(134,59,255,0.4)] flex-shrink-0">
              <img src="/favicon.svg" alt="Naenra" class="w-full h-full object-contain" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h4 class="text-xs font-black text-white font-mono uppercase tracking-wide">
                  Install Naenra App
                </h4>
                <span class="px-1.5 py-0.2 text-[9px] font-mono font-bold rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  PWA 60FPS
                </span>
              </div>
              <p class="text-[11px] text-slate-300 mt-0.5 leading-snug">
                Play standalone in full-screen with 0 URL bars & Offline Solo Practice.
              </p>
            </div>
          </div>

          <button
            @click="handleDismiss"
            class="text-slate-400 hover:text-white text-xs p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div class="mt-3 flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
          <button
            @click="handleDismiss"
            class="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 font-semibold transition-colors cursor-pointer"
          >
            Later
          </button>
          <button
            @click="installApp"
            class="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black rounded-xl text-xs font-mono shadow-[0_0_15px_rgba(134,59,255,0.4)] active:scale-95 transition-all cursor-pointer"
          >
            <span>📲</span>
            <span>Install Now</span>
          </button>
        </div>
      </div>
    </transition>

    <!-- UNIVERSAL PWA INSTALL GUIDE MODAL -->
    <div
      v-if="showInstallModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in"
    >
      <div class="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 text-center relative overflow-hidden">
        <!-- BACKGROUND GLOW -->
        <div class="absolute -right-12 -top-12 w-48 h-48 bg-purple-600/15 rounded-full blur-3xl pointer-events-none"></div>

        <!-- APP ICON -->
        <div class="w-16 h-16 mx-auto rounded-2xl bg-slate-950 border-2 border-purple-500/60 p-2.5 flex items-center justify-center shadow-[0_0_25px_rgba(134,59,255,0.5)]">
          <img src="/favicon.svg" alt="Naenra" class="w-full h-full object-contain" />
        </div>

        <div>
          <h3 class="text-lg font-black text-white tracking-wide">
            Install Naenra (PWA App)
          </h3>
          <p class="text-xs text-slate-400 mt-1">
            Enjoy full-screen standalone 60 FPS gameplay & Offline Practice!
          </p>
        </div>

        <!-- PLATFORM TABS -->
        <div class="flex items-center justify-center gap-1 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800 text-xs">
          <button
            v-for="tab in ['ios', 'android', 'desktop']"
            :key="tab"
            @click="activeTab = tab"
            :class="[
              'px-3 py-1.5 rounded-lg font-bold font-mono uppercase transition-all cursor-pointer text-[11px]',
              activeTab === tab
                ? 'bg-purple-600 text-white shadow-[0_0_10px_rgba(134,59,255,0.4)]'
                : 'text-slate-400 hover:text-white'
            ]"
          >
            {{ tab === 'ios' ? '📱 iPhone / iPad' : tab === 'android' ? '🤖 Android' : '💻 PC / Mac' }}
          </button>
        </div>

        <!-- TAB CONTENT: IOS -->
        <div v-if="activeTab === 'ios'" class="space-y-2.5 text-left text-xs bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80">
          <div class="flex items-start gap-3">
            <span class="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 font-bold font-mono flex items-center justify-center flex-shrink-0 text-[11px]">1</span>
            <p class="text-slate-300">
              In Safari, tap the <strong class="text-white">Share</strong> button
              <svg class="inline-block w-4 h-4 text-blue-400 mx-1 align-text-bottom" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              at the bottom bar.
            </p>
          </div>
          <div class="flex items-start gap-3">
            <span class="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 font-bold font-mono flex items-center justify-center flex-shrink-0 text-[11px]">2</span>
            <p class="text-slate-300">
              Scroll down and tap <strong class="text-amber-400">"Add to Home Screen"</strong>.
            </p>
          </div>
          <div class="flex items-start gap-3">
            <span class="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 font-bold font-mono flex items-center justify-center flex-shrink-0 text-[11px]">3</span>
            <p class="text-slate-300">
              Tap <strong class="text-emerald-400">"Add"</strong> in the top right corner.
            </p>
          </div>
        </div>

        <!-- TAB CONTENT: ANDROID -->
        <div v-else-if="activeTab === 'android'" class="space-y-2.5 text-left text-xs bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80">
          <div class="flex items-start gap-3">
            <span class="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 font-bold font-mono flex items-center justify-center flex-shrink-0 text-[11px]">1</span>
            <p class="text-slate-300">
              Tap the <strong class="text-white">Three Dots (⋮)</strong> in the top right of Chrome.
            </p>
          </div>
          <div class="flex items-start gap-3">
            <span class="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 font-bold font-mono flex items-center justify-center flex-shrink-0 text-[11px]">2</span>
            <p class="text-slate-300">
              Select <strong class="text-amber-400">"Install app"</strong> or "Add to Home screen".
            </p>
          </div>
          <div class="flex items-start gap-3">
            <span class="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 font-bold font-mono flex items-center justify-center flex-shrink-0 text-[11px]">3</span>
            <p class="text-slate-300">
              Tap <strong class="text-emerald-400">"Install"</strong> to confirm.
            </p>
          </div>
        </div>

        <!-- TAB CONTENT: DESKTOP PC / MAC -->
        <div v-else class="space-y-2.5 text-left text-xs bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80">
          <div class="flex items-start gap-3">
            <span class="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 font-bold font-mono flex items-center justify-center flex-shrink-0 text-[11px]">1</span>
            <p class="text-slate-300">
              <strong class="text-white">On Chrome / Edge</strong>: Click the <strong class="text-amber-400">Install (⤓)</strong> icon on the right side of the address bar.
            </p>
          </div>
          <div class="flex items-start gap-3">
            <span class="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 font-bold font-mono flex items-center justify-center flex-shrink-0 text-[11px]">2</span>
            <p class="text-slate-300">
              <strong class="text-white">On Safari (macOS Sonoma+)</strong>: In the top menu bar, click <strong class="text-amber-400">File ➜ Add to Dock</strong>.
            </p>
          </div>
        </div>

        <button
          @click="showInstallModal = false"
          class="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black rounded-xl text-xs font-mono tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(134,59,255,0.4)] cursor-pointer active:scale-95"
        >
          Got It ✨
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { usePwaInstall } from '../../composables/usePwaInstall'

const { canInstall, isIos, showInstallModal, installApp, dismissInstall } = usePwaInstall()
const isDismissed = ref(false)
const activeTab = ref(isIos.value ? 'ios' : 'desktop')

function handleDismiss() {
  isDismissed.value = true
  dismissInstall()
}
</script>

<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease-out;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(20px);
  opacity: 0;
}
</style>

<template>
  <div>
    <!-- FLOATING PWA INSTALL POPUP (WARM NAENRA THEME) -->
    <transition name="slide-fade">
      <div
        v-if="canInstall && !isDismissed"
        class="fixed bottom-5 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-40 bg-white/95 border-2 border-orange-200 rounded-3xl p-4 shadow-[0_15px_40px_rgba(255,122,0,0.18)] backdrop-blur-xl animate-fade-in"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-300 p-2.5 flex items-center justify-center shadow-md flex-shrink-0">
              <svg viewBox="0 0 24 24" class="w-full h-full" fill="#FF7A00">
                <path d="M7 3 L7 21 L12 21 L12 9 L17 21 L17 3 L12 3 L12 15 L7 3 Z"/>
              </svg>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h4 class="text-xs font-black text-gray-900 uppercase tracking-wide">
                  Install Naenra App
                </h4>
                <span class="px-2 py-0.5 text-[9px] font-black rounded-full bg-orange-100 text-orange-600 border border-orange-200">
                  PWA 60FPS
                </span>
              </div>
              <p class="text-[11px] text-gray-600 mt-0.5 leading-snug font-medium">
                Play standalone in full-screen with 0 URL bars & Offline Solo Practice.
              </p>
            </div>
          </div>

          <button
            @click="handleDismiss"
            class="text-gray-400 hover:text-gray-800 text-xs p-1.5 rounded-lg hover:bg-orange-50 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div class="mt-3 flex items-center justify-end gap-2 pt-2 border-t border-orange-100">
          <button
            @click="handleDismiss"
            class="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-800 font-bold transition-colors cursor-pointer"
          >
            Later
          </button>
          <button
            @click="installApp"
            class="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white font-black rounded-xl text-xs tracking-wider uppercase shadow-[0_4px_15px_rgba(239,68,68,0.3)] active:scale-95 transition-all cursor-pointer"
          >
            <span>📲</span>
            <span>Install Now</span>
          </button>
        </div>
      </div>
    </transition>

    <!-- UNIVERSAL PWA INSTALL GUIDE MODAL (WARM NAENRA THEME) -->
    <div
      v-if="showInstallModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in"
    >
      <div class="bg-white/95 border-2 border-orange-200 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-[0_20px_60px_rgba(255,122,0,0.2)] space-y-5 text-center relative overflow-hidden backdrop-blur-2xl">
        <!-- BACKGROUND WARM AMBIENT GLOW -->
        <div class="absolute -right-12 -top-12 w-48 h-48 bg-orange-400/10 rounded-full blur-3xl pointer-events-none"></div>

        <!-- ORANGE N APP ICON -->
        <div class="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-300 p-3 flex items-center justify-center shadow-lg">
          <svg viewBox="0 0 24 24" class="w-full h-full" fill="#FF7A00">
            <path d="M7 3 L7 21 L12 21 L12 9 L17 21 L17 3 L12 3 L12 15 L7 3 Z"/>
          </svg>
        </div>

        <div>
          <h3 class="text-xl font-black text-gray-900 tracking-tight">
            Install Naenra (PWA App)
          </h3>
          <p class="text-xs text-gray-600 mt-1 font-medium">
            Enjoy full-screen standalone 60 FPS gameplay & Offline Practice!
          </p>
        </div>

        <!-- PLATFORM TABS -->
        <div class="flex items-center justify-center gap-1 bg-orange-50 border border-orange-200 p-1.5 rounded-2xl text-xs">
          <button
            v-for="tab in ['ios', 'android', 'desktop']"
            :key="tab"
            @click="activeTab = tab"
            :class="[
              'px-3.5 py-2 rounded-xl font-black transition-all cursor-pointer text-xs flex items-center gap-1.5',
              activeTab === tab
                ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-md'
                : 'text-gray-600 hover:text-orange-600 hover:bg-orange-100/60'
            ]"
          >
            <span>{{ tab === 'ios' ? '📱 iPhone' : tab === 'android' ? '🤖 Android' : '💻 PC / Mac' }}</span>
          </button>
        </div>

        <!-- TAB CONTENT: IOS -->
        <div v-if="activeTab === 'ios'" class="space-y-3 text-left text-xs bg-orange-50/70 p-4 rounded-2xl border border-orange-100 text-gray-700">
          <div class="flex items-start gap-3">
            <span class="w-5 h-5 rounded-full bg-orange-200 text-orange-700 font-black flex items-center justify-center flex-shrink-0 text-[11px] border border-orange-300">1</span>
            <p class="leading-relaxed">
              In Safari, tap the <strong class="text-gray-900">Share</strong> button
              <svg class="inline-block w-4 h-4 text-blue-500 mx-1 align-text-bottom" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              at the bottom toolbar.
            </p>
          </div>
          <div class="flex items-start gap-3">
            <span class="w-5 h-5 rounded-full bg-orange-200 text-orange-700 font-black flex items-center justify-center flex-shrink-0 text-[11px] border border-orange-300">2</span>
            <p class="leading-relaxed">
              Scroll down and tap <strong class="text-orange-600 font-bold">"Add to Home Screen"</strong>.
            </p>
          </div>
          <div class="flex items-start gap-3">
            <span class="w-5 h-5 rounded-full bg-orange-200 text-orange-700 font-black flex items-center justify-center flex-shrink-0 text-[11px] border border-orange-300">3</span>
            <p class="leading-relaxed">
              Tap <strong class="text-emerald-600 font-bold">"Add"</strong> in the top right corner.
            </p>
          </div>
        </div>

        <!-- TAB CONTENT: ANDROID -->
        <div v-else-if="activeTab === 'android'" class="space-y-3 text-left text-xs bg-orange-50/70 p-4 rounded-2xl border border-orange-100 text-gray-700">
          <div class="flex items-start gap-3">
            <span class="w-5 h-5 rounded-full bg-orange-200 text-orange-700 font-black flex items-center justify-center flex-shrink-0 text-[11px] border border-orange-300">1</span>
            <p class="leading-relaxed">
              Tap the <strong class="text-gray-900">Three Dots (⋮)</strong> in the top right of Chrome.
            </p>
          </div>
          <div class="flex items-start gap-3">
            <span class="w-5 h-5 rounded-full bg-orange-200 text-orange-700 font-black flex items-center justify-center flex-shrink-0 text-[11px] border border-orange-300">2</span>
            <p class="leading-relaxed">
              Select <strong class="text-orange-600 font-bold">"Install app"</strong> or "Add to Home screen".
            </p>
          </div>
          <div class="flex items-start gap-3">
            <span class="w-5 h-5 rounded-full bg-orange-200 text-orange-700 font-black flex items-center justify-center flex-shrink-0 text-[11px] border border-orange-300">3</span>
            <p class="leading-relaxed">
              Tap <strong class="text-emerald-600 font-bold">"Install"</strong> to confirm.
            </p>
          </div>
        </div>

        <!-- TAB CONTENT: DESKTOP PC / MAC -->
        <div v-else class="space-y-3 text-left text-xs bg-orange-50/70 p-4 rounded-2xl border border-orange-100 text-gray-700">
          <div class="flex items-start gap-3">
            <span class="w-5 h-5 rounded-full bg-orange-200 text-orange-700 font-black flex items-center justify-center flex-shrink-0 text-[11px] border border-orange-300">1</span>
            <p class="leading-relaxed">
              <strong class="text-gray-900">On Chrome / Edge</strong>: Click the <strong class="text-orange-600 font-bold">Install (⤓)</strong> icon on the right side of the address bar.
            </p>
          </div>
          <div class="flex items-start gap-3">
            <span class="w-5 h-5 rounded-full bg-orange-200 text-orange-700 font-black flex items-center justify-center flex-shrink-0 text-[11px] border border-orange-300">2</span>
            <p class="leading-relaxed">
              <strong class="text-gray-900">On Safari (macOS Sonoma+)</strong>: In the top menu bar, click <strong class="text-orange-600 font-bold">File ➜ Add to Dock</strong>.
            </p>
          </div>
        </div>

        <button
          @click="showInstallModal = false"
          class="w-full py-3.5 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white font-black rounded-2xl text-xs tracking-widest uppercase transition-all shadow-[0_8px_20px_rgba(239,68,68,0.25)] hover:scale-[1.02] active:scale-95 cursor-pointer"
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

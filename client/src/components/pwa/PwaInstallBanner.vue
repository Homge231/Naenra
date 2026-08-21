<template>
  <div>
    <!-- FLOATING PWA INSTALL POPUP (WARM NAENRA THEME) -->
    <transition name="slide-fade">
      <div
        v-if="canInstall && !isDismissed"
        class="fixed bottom-5 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-40 rounded-3xl p-4 backdrop-blur-xl animate-fade-in"
        style="background: rgba(255, 255, 255, 0.98); border: 2px solid #fed7aa; box-shadow: 0 15px 40px rgba(255,123,0,0.18);"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl p-2.5 flex items-center justify-center shadow-md flex-shrink-0"
              style="background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%); border: 2px solid #fdba74;">
              <svg viewBox="0 0 24 24" class="w-full h-full" fill="#FF7A00">
                <path d="M7 3 L7 21 L12 21 L12 9 L17 21 L17 3 L12 3 L12 15 L7 3 Z"/>
              </svg>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h4 class="text-xs font-black uppercase tracking-wide" style="color: #0f172a;">
                  Install Naenra App
                </h4>
                <span class="px-2 py-0.5 text-[9px] font-black rounded-full"
                  style="background: #ffedd5; color: #c2410c; border: 1px solid #fed7aa;">
                  PWA 60FPS
                </span>
              </div>
              <p class="text-[11px] mt-0.5 leading-snug font-medium" style="color: #475569;">
                Play standalone in full-screen with 0 URL bars & Offline Solo Practice.
              </p>
            </div>
          </div>

          <button
            @click="handleDismiss"
            class="text-xs p-1.5 rounded-lg transition-colors cursor-pointer"
            style="color: #94a3b8;"
            onmouseover="this.style.color='#0f172a'"
            onmouseout="this.style.color='#94a3b8'"
          >
            ✕
          </button>
        </div>

        <div class="mt-3 flex items-center justify-end gap-2 pt-2" style="border-top: 1px solid #ffedd5;">
          <button
            @click="handleDismiss"
            class="px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer"
            style="color: #64748b;"
          >
            Later
          </button>
          <button
            @click="installApp"
            class="flex items-center gap-1.5 px-4 py-2 font-black rounded-xl text-xs tracking-wider uppercase active:scale-95 transition-all cursor-pointer shadow-md"
            style="background: linear-gradient(135deg, #FF7B00 0%, #E63946 100%) !important; color: #ffffff !important;"
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
      class="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in"
      style="background: rgba(15, 23, 42, 0.65);"
    >
      <div class="rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-5 text-center relative overflow-hidden backdrop-blur-2xl"
        style="background: rgba(255, 255, 255, 0.98); border: 2px solid #fed7aa; box-shadow: 0 25px 60px rgba(0, 0, 0, 0.3);">
        <!-- BACKGROUND WARM AMBIENT GLOW -->
        <div class="absolute -right-12 -top-12 w-48 h-48 rounded-full blur-3xl pointer-events-none" style="background: rgba(255, 123, 0, 0.12);"></div>

        <!-- ORANGE N APP ICON -->
        <div class="w-16 h-16 mx-auto rounded-2xl p-3 flex items-center justify-center shadow-lg"
          style="background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%); border: 2px solid #fdba74;">
          <svg viewBox="0 0 24 24" class="w-full h-full" fill="#FF7A00">
            <path d="M7 3 L7 21 L12 21 L12 9 L17 21 L17 3 L12 3 L12 15 L7 3 Z"/>
          </svg>
        </div>

        <div>
          <h3 class="text-xl font-black tracking-tight" style="color: #0f172a;">
            Install Naenra (PWA App)
          </h3>
          <p class="text-xs mt-1 font-medium" style="color: #64748b;">
            Enjoy full-screen standalone 60 FPS gameplay & Offline Practice!
          </p>
        </div>

        <!-- PLATFORM TABS -->
        <div class="flex items-center justify-center gap-1.5 p-1.5 rounded-2xl text-xs"
          style="background: #f8fafc; border: 1px solid #e2e8f0;">
          <button
            v-for="tab in ['ios', 'android', 'desktop']"
            :key="tab"
            @click="activeTab = tab"
            class="flex-1 py-2.5 rounded-xl font-black transition-all cursor-pointer text-xs flex items-center justify-center gap-1"
            :style="activeTab === tab 
              ? 'background: linear-gradient(135deg, #FF7B00 0%, #E63946 100%) !important; color: #ffffff !important; box-shadow: 0 4px 12px rgba(255,123,0,0.35);'
              : 'background: transparent; color: #64748b;'"
          >
            <span>{{ tab === 'ios' ? '📱 iPhone' : tab === 'android' ? '🤖 Android' : '💻 PC / Mac' }}</span>
          </button>
        </div>

        <!-- TAB CONTENT: IOS -->
        <div v-if="activeTab === 'ios'" class="space-y-3 text-left text-xs p-4 rounded-2xl"
          style="background: #fff7ed; border: 1px solid #ffedd5; color: #1e293b;">
          <div class="flex items-start gap-3">
            <span class="w-5 h-5 rounded-full font-black flex items-center justify-center flex-shrink-0 text-[11px]"
              style="background: #fed7aa; color: #c2410c; border: 1px solid #fdba74;">1</span>
            <p class="leading-relaxed">
              In Safari, tap the <strong style="color: #0f172a;">Share</strong> button
              <svg class="inline-block w-4 h-4 text-blue-500 mx-1 align-text-bottom" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              at the bottom toolbar.
            </p>
          </div>
          <div class="flex items-start gap-3">
            <span class="w-5 h-5 rounded-full font-black flex items-center justify-center flex-shrink-0 text-[11px]"
              style="background: #fed7aa; color: #c2410c; border: 1px solid #fdba74;">2</span>
            <p class="leading-relaxed">
              Scroll down and tap <strong style="color: #ea580c; font-weight: 800;">"Add to Home Screen"</strong>.
            </p>
          </div>
          <div class="flex items-start gap-3">
            <span class="w-5 h-5 rounded-full font-black flex items-center justify-center flex-shrink-0 text-[11px]"
              style="background: #fed7aa; color: #c2410c; border: 1px solid #fdba74;">3</span>
            <p class="leading-relaxed">
              Tap <strong style="color: #16a34a; font-weight: 800;">"Add"</strong> in the top right corner.
            </p>
          </div>
        </div>

        <!-- TAB CONTENT: ANDROID -->
        <div v-else-if="activeTab === 'android'" class="space-y-3 text-left text-xs p-4 rounded-2xl"
          style="background: #fff7ed; border: 1px solid #ffedd5; color: #1e293b;">
          <div class="flex items-start gap-3">
            <span class="w-5 h-5 rounded-full font-black flex items-center justify-center flex-shrink-0 text-[11px]"
              style="background: #fed7aa; color: #c2410c; border: 1px solid #fdba74;">1</span>
            <p class="leading-relaxed">
              Tap the <strong style="color: #0f172a;">Three Dots (⋮)</strong> in the top right of Chrome.
            </p>
          </div>
          <div class="flex items-start gap-3">
            <span class="w-5 h-5 rounded-full font-black flex items-center justify-center flex-shrink-0 text-[11px]"
              style="background: #fed7aa; color: #c2410c; border: 1px solid #fdba74;">2</span>
            <p class="leading-relaxed">
              Select <strong style="color: #ea580c; font-weight: 800;">"Install app"</strong> or "Add to Home screen".
            </p>
          </div>
          <div class="flex items-start gap-3">
            <span class="w-5 h-5 rounded-full font-black flex items-center justify-center flex-shrink-0 text-[11px]"
              style="background: #fed7aa; color: #c2410c; border: 1px solid #fdba74;">3</span>
            <p class="leading-relaxed">
              Tap <strong style="color: #16a34a; font-weight: 800;">"Install"</strong> to confirm.
            </p>
          </div>
        </div>

        <!-- TAB CONTENT: DESKTOP PC / MAC -->
        <div v-else class="space-y-3 text-left text-xs p-4 rounded-2xl"
          style="background: #fff7ed; border: 1px solid #ffedd5; color: #1e293b;">
          <div class="flex items-start gap-3">
            <span class="w-5 h-5 rounded-full font-black flex items-center justify-center flex-shrink-0 text-[11px]"
              style="background: #fed7aa; color: #c2410c; border: 1px solid #fdba74;">1</span>
            <p class="leading-relaxed">
              <strong style="color: #0f172a;">On Chrome / Edge</strong>: Click the <strong style="color: #ea580c; font-weight: 800;">Install (⤓)</strong> icon on the right side of the address bar.
            </p>
          </div>
          <div class="flex items-start gap-3">
            <span class="w-5 h-5 rounded-full font-black flex items-center justify-center flex-shrink-0 text-[11px]"
              style="background: #fed7aa; color: #c2410c; border: 1px solid #fdba74;">2</span>
            <p class="leading-relaxed">
              <strong style="color: #0f172a;">On Safari (macOS Sonoma+)</strong>: In the top menu bar, click <strong style="color: #ea580c; font-weight: 800;">File ➜ Add to Dock</strong>.
            </p>
          </div>
        </div>

        <button
          @click="showInstallModal = false"
          class="w-full py-4 font-black rounded-2xl text-xs tracking-widest uppercase transition-all hover:scale-[1.02] active:scale-95 cursor-pointer shadow-lg"
          style="background: linear-gradient(135deg, #FF7B00 0%, #E63946 100%) !important; color: #ffffff !important; box-shadow: 0 10px 25px rgba(230, 57, 70, 0.4) !important;"
        >
          GOT IT ✨
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

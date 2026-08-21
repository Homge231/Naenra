<template>
  <div>
    <!-- FLOATING PWA INSTALL POPUP (WHEN PROMPT READY) -->
    <transition name="slide-fade">
      <div
        v-if="canInstall && !isDismissed"
        class="fixed bottom-5 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-40 bg-slate-900/95 border border-orange-500/50 rounded-2xl p-4 shadow-[0_0_30px_rgba(255,122,0,0.3)] backdrop-blur-xl animate-fade-in"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl bg-slate-950 border border-orange-500/60 p-2 flex items-center justify-center shadow-[0_0_15px_rgba(255,122,0,0.4)] flex-shrink-0">
              <svg viewBox="0 0 24 24" class="w-full h-full fill-orange" fill="#FF7A00">
                <path d="M7 3 L7 21 L12 21 L12 9 L17 21 L17 3 L12 3 L12 15 L7 3 Z"/>
              </svg>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h4 class="text-xs font-black text-white font-mono uppercase tracking-wide">
                  Cài Đặt App Naenra
                </h4>
                <span class="px-1.5 py-0.2 text-[9px] font-mono font-bold rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  PWA 60FPS
                </span>
              </div>
              <p class="text-[11px] text-slate-300 mt-0.5 leading-snug">
                Chơi toàn màn hình không có thanh URL & Luyện tập Offline khi mất mạng.
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
            Để sau
          </button>
          <button
            @click="installApp"
            class="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white font-black rounded-xl text-xs font-mono shadow-[0_0_15px_rgba(255,122,0,0.4)] active:scale-95 transition-all cursor-pointer"
          >
            <span>📲</span>
            <span>Cài Đặt Ngay</span>
          </button>
        </div>
      </div>
    </transition>

    <!-- UNIVERSAL PWA INSTALL GUIDE MODAL (FOR ALL PLATFORMS) -->
    <div
      v-if="showInstallModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in"
    >
      <div class="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 text-center relative overflow-hidden">
        <!-- BACKGROUND GLOW -->
        <div class="absolute -right-12 -top-12 w-48 h-48 bg-orange-600/15 rounded-full blur-3xl pointer-events-none"></div>

        <!-- APP ICON -->
        <div class="w-16 h-16 mx-auto rounded-2xl bg-slate-950 border-2 border-orange-500/60 p-3 flex items-center justify-center shadow-[0_0_25px_rgba(255,122,0,0.5)]">
          <svg viewBox="0 0 24 24" class="w-full h-full fill-orange" fill="#FF7A00">
            <path d="M7 3 L7 21 L12 21 L12 9 L17 21 L17 3 L12 3 L12 15 L7 3 Z"/>
          </svg>
        </div>

        <div>
          <h3 class="text-lg font-black text-white tracking-wide">
            Cài Đặt Naenra (PWA App)
          </h3>
          <p class="text-xs text-slate-400 mt-1">
            Chơi độc lập toàn màn hình 60 FPS & Luyện tập Offline mọi lúc mọi nơi!
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
                ? 'bg-orange-500 text-slate-950 shadow-[0_0_10px_rgba(255,122,0,0.4)]'
                : 'text-slate-400 hover:text-white'
            ]"
          >
            {{ tab === 'ios' ? '📱 iPhone / iPad' : tab === 'android' ? '🤖 Android' : '💻 PC / Mac' }}
          </button>
        </div>

        <!-- TAB CONTENT: IOS -->
        <div v-if="activeTab === 'ios'" class="space-y-2.5 text-left text-xs bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80">
          <div class="flex items-start gap-3">
            <span class="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 font-bold font-mono flex items-center justify-center flex-shrink-0 text-[11px]">1</span>
            <p class="text-slate-300">
              Trên Safari, nhấn vào nút <strong class="text-white">Chia sẻ (Share)</strong>
              <svg class="inline-block w-4 h-4 text-blue-400 mx-1 align-text-bottom" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              ở thanh dưới cùng.
            </p>
          </div>
          <div class="flex items-start gap-3">
            <span class="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 font-bold font-mono flex items-center justify-center flex-shrink-0 text-[11px]">2</span>
            <p class="text-slate-300">
              Cuộn xuống và chọn <strong class="text-amber-400">"Thêm vào MH chính" (Add to Home Screen)</strong>.
            </p>
          </div>
          <div class="flex items-start gap-3">
            <span class="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 font-bold font-mono flex items-center justify-center flex-shrink-0 text-[11px]">3</span>
            <p class="text-slate-300">
              Bấm <strong class="text-emerald-400">"Thêm" (Add)</strong> ở góc trên bên phải màn hình.
            </p>
          </div>
        </div>

        <!-- TAB CONTENT: ANDROID -->
        <div v-else-if="activeTab === 'android'" class="space-y-2.5 text-left text-xs bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80">
          <div class="flex items-start gap-3">
            <span class="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 font-bold font-mono flex items-center justify-center flex-shrink-0 text-[11px]">1</span>
            <p class="text-slate-300">
              Nhấn vào biểu tượng <strong class="text-white">Menu 3 chấm (⋮)</strong> ở góc phải trên của Chrome.
            </p>
          </div>
          <div class="flex items-start gap-3">
            <span class="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 font-bold font-mono flex items-center justify-center flex-shrink-0 text-[11px]">2</span>
            <p class="text-slate-300">
              Chọn <strong class="text-amber-400">"Cài đặt ứng dụng" (Install App)</strong> hoặc "Thêm vào Màn hình chính".
            </p>
          </div>
          <div class="flex items-start gap-3">
            <span class="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 font-bold font-mono flex items-center justify-center flex-shrink-0 text-[11px]">3</span>
            <p class="text-slate-300">
              Bấm <strong class="text-emerald-400">"Cài đặt"</strong> để hoàn tất.
            </p>
          </div>
        </div>

        <!-- TAB CONTENT: DESKTOP PC / MAC -->
        <div v-else class="space-y-2.5 text-left text-xs bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80">
          <div class="flex items-start gap-3">
            <span class="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 font-bold font-mono flex items-center justify-center flex-shrink-0 text-[11px]">1</span>
            <p class="text-slate-300">
              <strong class="text-white">Trên Chrome / Edge</strong>: Nhấn vào biểu tượng <strong class="text-amber-400">Cài đặt (Install) ⤓</strong> nằm ở góc phải của thanh địa chỉ URL.
            </p>
          </div>
          <div class="flex items-start gap-3">
            <span class="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 font-bold font-mono flex items-center justify-center flex-shrink-0 text-[11px]">2</span>
            <p class="text-slate-300">
              <strong class="text-white">Trên Safari (Mac macOS Sonoma trở lên)</strong>: Vào thanh Menu trên cùng ➜ <strong class="text-amber-400">Tệp (File) ➜ Thêm vào Dock (Add to Dock)</strong>.
            </p>
          </div>
        </div>

        <button
          @click="showInstallModal = false"
          class="w-full py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white font-black rounded-xl text-xs font-mono tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(255,122,0,0.4)] cursor-pointer active:scale-95"
        >
          Đã Hiểu ✨
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

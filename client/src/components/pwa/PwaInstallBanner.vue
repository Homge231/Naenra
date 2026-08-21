<template>
  <div>
    <!-- FLOATING PWA INSTALL BANNER -->
    <transition name="slide-fade">
      <div
        v-if="canInstall || (isIos && !isDismissed)"
        class="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-40 bg-slate-900/95 border border-red-500/40 rounded-2xl p-4 shadow-[0_0_25px_rgba(220,38,38,0.25)] backdrop-blur-xl animate-fade-in"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-xl shadow-[0_0_15px_rgba(220,38,38,0.5)] flex-shrink-0">
              ⚡
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h4 class="text-xs font-black text-white font-mono uppercase tracking-wide">
                  Cài Đặt App Naenra
                </h4>
                <span class="px-1.5 py-0.2 text-[9px] font-mono font-bold rounded bg-red-500/20 text-red-400 border border-red-500/30">
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
            class="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold rounded-xl text-xs font-mono shadow-[0_0_15px_rgba(220,38,38,0.4)] active:scale-95 transition-all cursor-pointer"
          >
            <span>📲</span>
            <span>{{ isIos ? 'Xem Cách Cài Đặt' : 'Cài Đặt Ngay' }}</span>
          </button>
        </div>
      </div>
    </transition>

    <!-- IOS SAFARI INSTALL GUIDE MODAL -->
    <div
      v-if="showIosGuide"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
    >
      <div class="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-5 text-center relative overflow-hidden">
        <div class="absolute -right-12 -top-12 w-40 h-40 bg-red-600/10 rounded-full blur-2xl pointer-events-none"></div>

        <div class="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(220,38,38,0.5)]">
          📱
        </div>

        <div>
          <h3 class="text-base font-black text-white tracking-wide">
            Cài Đặt Naenra Trên iPhone / iPad
          </h3>
          <p class="text-xs text-slate-400 mt-1">
            Chỉ với 2 bước đơn giản để thêm game ra Màn hình chính Safari:
          </p>
        </div>

        <div class="space-y-3 text-left text-xs bg-slate-950/70 p-4 rounded-xl border border-slate-800/80">
          <div class="flex items-start gap-3">
            <span class="w-5 h-5 rounded-full bg-red-500/20 text-red-400 font-bold font-mono flex items-center justify-center flex-shrink-0 text-[11px]">1</span>
            <p class="text-slate-300">
              Nhấn vào biểu tượng <strong class="text-white">Chia sẻ (Share)</strong>
              <svg class="inline-block w-4 h-4 text-blue-400 mx-1 align-text-bottom" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              ở thanh dưới cùng trình duyệt Safari.
            </p>
          </div>

          <div class="flex items-start gap-3">
            <span class="w-5 h-5 rounded-full bg-red-500/20 text-red-400 font-bold font-mono flex items-center justify-center flex-shrink-0 text-[11px]">2</span>
            <p class="text-slate-300">
              Cuộn xuống và chọn <strong class="text-amber-400">"Thêm vào MH chính" (Add to Home Screen)</strong>.
            </p>
          </div>

          <div class="flex items-start gap-3">
            <span class="w-5 h-5 rounded-full bg-red-500/20 text-red-400 font-bold font-mono flex items-center justify-center flex-shrink-0 text-[11px]">3</span>
            <p class="text-slate-300">
              Bấm <strong class="text-emerald-400">"Thêm" (Add)</strong> ở góc trên bên phải màn hình.
            </p>
          </div>
        </div>

        <button
          @click="showIosGuide = false"
          class="w-full py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold rounded-xl text-xs font-mono tracking-wider uppercase transition-all shadow-[0_0_15px_rgba(220,38,38,0.4)] cursor-pointer"
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

const { canInstall, isIos, showIosGuide, installApp, dismissInstall } = usePwaInstall()
const isDismissed = ref(false)

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

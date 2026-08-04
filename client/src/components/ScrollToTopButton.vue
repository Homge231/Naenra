<template>
  <transition name="scroll-top-fade">
    <button
      v-if="showButton"
      @click="scrollToTop"
      class="fixed bottom-24 right-6 z-50 p-3.5 rounded-full bg-gradient-to-r from-orange to-hexred text-white shadow-[0_8px_25px_rgba(255,107,0,0.4)] border-2 border-white hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center cursor-pointer group"
      title="Back to Top"
      aria-label="Scroll to top"
    >
      <svg class="w-6 h-6 transform group-hover:-translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    </button>
  </transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const showButton = ref(false)

function handleScroll() {
  showButton.value = window.scrollY > 10
}

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.scroll-top-fade-enter-active,
.scroll-top-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.scroll-top-fade-enter-from,
.scroll-top-fade-leave-to {
  opacity: 0;
  transform: translateY(16px) scale(0.8);
}
</style>

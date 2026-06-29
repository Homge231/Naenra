<template>
  <div
    v-if="src"
    class="fixed bottom-1 left-6 z-[60] pointer-events-none translate-y-1/2"
  >
    <div class="w-24 h-24 rounded-full bg-gradient-to-br from-blue to-lightBlue p-0.5 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
      <img
        :src="src"
        :alt="alt"
        class="w-full h-full rounded-full object-cover bg-darkNavy"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  src: string
  alt?: string
}>()
</script>
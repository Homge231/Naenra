<!-- src/views/CustomRoomView.vue -->
<template>
  <div class="h-screen w-full bg-darkNavy text-white flex flex-col items-center justify-center font-sans">
    <h1 class="text-4xl font-black italic tracking-widest uppercase text-lightBlue mb-4">
      Custom Room
    </h1>
    <p class="text-gray-400 tracking-wider">Waiting for opponent...</p>
    
    <button @click="$router.push('/home')" class="mt-8 px-6 py-2 border border-white/20 hover:bg-white/10 transition-colors">
      Back to Lobby
    </button>
  </div>
</template>

<script setup lang="ts">
// Custom room setup logic will go here
</script>
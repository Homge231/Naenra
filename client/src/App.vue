<template>
  <div class="app-wrapper">
    <RouterView />
    <ErrorNotification />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import ErrorNotification from './components/ErrorNotification.vue'
</script>

<style scoped>
</style>
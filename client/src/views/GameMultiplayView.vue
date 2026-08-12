<template>
  <GameMultiplayMobile v-if="isMobileScreen" />
  <GameMultiplayDesktop v-else />
</template>

<script setup lang="ts">
import { useDeviceMode } from '../composables/useDeviceMode';
import GameMultiplayDesktop from './GameMultiplayDesktop.vue';
import GameMultiplayMobile from './GameMultiplayMobile.vue';

const { isMobileScreen } = useDeviceMode();
</script>

<template>
  <GameplayMobile v-if="isMobileScreen" />
  <GameplayDesktop v-else />
</template>

<script setup lang="ts">
import { useDeviceMode } from '../../composables/useDeviceMode.ts';
import GameplayDesktop from './GameplayDesktop.vue';
import GameplayMobile from './GameplayMobile.vue';

const { isMobileScreen } = useDeviceMode();

</script>

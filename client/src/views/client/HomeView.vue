<template>
  <HomeMobile v-if="isMobileScreen" />
  <HomeDesktop v-else />
</template>

<script setup lang="ts">
import { useDeviceMode } from '../../composables/useDeviceMode.ts';
import HomeDesktop from './HomeDesktop.vue';
import HomeMobile from './HomeMobile.vue';

const { isMobileScreen } = useDeviceMode();

</script>

<template>
  <CoreSelectionMobile v-if="isMobileScreen" />
  <CoreSelectionDesktop v-else />
</template>

<script setup lang="ts">
import { useDeviceMode } from '../../composables/useDeviceMode.ts';
import CoreSelectionDesktop from './CoreSelectionDesktop.vue';
import CoreSelectionMobile from './CoreSelectionMobile.vue';

const { isMobileScreen } = useDeviceMode();
</script>

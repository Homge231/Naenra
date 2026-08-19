<template>
  <CoreSelectionMultiMobile v-if="isMobileScreen" />
  <CoreSelectionMultiDesktop v-else />
</template>

<script setup lang="ts">
import { useDeviceMode } from '../../composables/useDeviceMode.ts';
import CoreSelectionMultiDesktop from './CoreSelectionMultiDesktop.vue';
import CoreSelectionMultiMobile from './CoreSelectionMultiMobile.vue';

const { isMobileScreen } = useDeviceMode();

</script>

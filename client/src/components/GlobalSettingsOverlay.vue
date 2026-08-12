<template>
  <GlobalSettingsMobile v-if="isMobileScreen" />
  <GlobalSettingsDesktop v-else />
</template>

<script setup lang="ts">
import { useDeviceMode } from '../composables/useDeviceMode';
import GlobalSettingsDesktop from './GlobalSettingsDesktop.vue';
import GlobalSettingsMobile from './GlobalSettingsMobile.vue';

const { isMobileScreen } = useDeviceMode();
</script>

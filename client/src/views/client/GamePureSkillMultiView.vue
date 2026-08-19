<template>
  <GamePureSkillMultiMobile v-if="isMobileScreen" />
  <GamePureSkillMultiDesktop v-else />
</template>

<script setup lang="ts">
import { useDeviceMode } from '../../composables/useDeviceMode.ts';
import GamePureSkillMultiDesktop from './GamePureSkillMultiDesktop.vue';
import GamePureSkillMultiMobile from './GamePureSkillMultiMobile.vue';

const { isMobileScreen } = useDeviceMode();

</script>

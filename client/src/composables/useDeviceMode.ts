import { ref, onMounted, onUnmounted, watchEffect } from 'vue';

export function useDeviceMode() {
  const isMobileScreen = ref(false);
  const isTouchDevice = ref(false);
  const showVirtualKeyboard = ref(false);

  const checkDevice = () => {
    // Check if the screen width is mobile sized (< 768px as per US-81)
    isMobileScreen.value = window.innerWidth < 768;
    
    // Check if it's a touch device
    isTouchDevice.value = 
      'ontouchstart' in window || 
      navigator.maxTouchPoints > 0 || 
      // @ts-ignore
      navigator.msMaxTouchPoints > 0;

    // Show virtual keyboard on touch devices that are also mobile screens
    showVirtualKeyboard.value = isTouchDevice.value && isMobileScreen.value;
  };

  onMounted(() => {
    checkDevice();
    window.addEventListener('resize', checkDevice);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', checkDevice);
  });

  return {
    isMobileScreen,
    isTouchDevice,
    showVirtualKeyboard
  };
}

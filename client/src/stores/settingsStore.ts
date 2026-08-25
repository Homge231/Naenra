import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { audioService } from '../services/audioService'

export const useSettingsStore = defineStore('settings', () => {
  const isSettingsOpen = ref(false)
  
  // Default values
  const volumeLevel = ref(50)
  const vfxEnabled = ref(true)
  const soundEnabled = ref(true)

  // Load from localStorage
  const storedVolume = localStorage.getItem('arena_volume')
  if (storedVolume !== null) {
    volumeLevel.value = parseInt(storedVolume, 10)
  }

  const storedVfx = localStorage.getItem('arena_vfx')
  if (storedVfx !== null) {
    vfxEnabled.value = storedVfx === 'true'
  }

  const storedSound = localStorage.getItem('arena_sound')
  if (storedSound !== null) {
    soundEnabled.value = storedSound !== 'false'
  }

  // Persist and apply changes
  watch(volumeLevel, (newVal) => {
    localStorage.setItem('arena_volume', String(newVal))
    // Apply immediately to Web Audio API
    import('../composables/game/useAudioEngine').then(({ setMasterVolume }) => {
      setMasterVolume(soundEnabled.value ? newVal / 100.0 : 0)
    }).catch(() => {})
    
    // Apply to HTML5 Audio elements
    audioService.setMasterVolume(soundEnabled.value ? newVal / 100.0 : 0)
  })

  watch(vfxEnabled, (newVal) => {
    localStorage.setItem('arena_vfx', String(newVal))
  })

  watch(soundEnabled, (newVal) => {
    localStorage.setItem('arena_sound', String(newVal))
    const effectiveVolume = newVal ? volumeLevel.value / 100.0 : 0
    import('../composables/game/useAudioEngine').then(({ setMasterVolume }) => {
      setMasterVolume(effectiveVolume)
    }).catch(() => {})
    audioService.setMasterVolume(effectiveVolume)
  })

  return {
    isSettingsOpen,
    volumeLevel,
    vfxEnabled,
    soundEnabled
  }
})


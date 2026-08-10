import { ref } from 'vue'
import { playCardHover, playCardFlip, playCardSelect } from './game/useAudioEngine'

export interface CardTiltState {
  rotateX: number
  rotateY: number
  scale: number
  glareX: number
  glareY: number
  glareOpacity: number
  isFlipping: boolean
}

export function useCardTilt() {
  const cardStates = ref<Record<number, CardTiltState>>({})

  function getCardState(index: number): CardTiltState {
    if (!cardStates.value[index]) {
      cardStates.value[index] = {
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        glareX: 50,
        glareY: 50,
        glareOpacity: 0,
        isFlipping: false
      }
    }
    return cardStates.value[index]
  }

  function handleMouseMove(index: number, event: MouseEvent) {
    const card = event.currentTarget as HTMLElement
    if (!card) return

    const rect = card.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    const centerX = rect.width / 2
    const centerY = rect.height / 2

    // Max tilt angles (14deg)
    const rotateX = -((y - centerY) / centerY) * 14
    const rotateY = ((x - centerX) / centerX) * 14

    // Glare position percentage
    const glareX = (x / rect.width) * 100
    const glareY = (y / rect.height) * 100

    const state = getCardState(index)
    state.rotateX = rotateX
    state.rotateY = rotateY
    state.scale = 1.04
    state.glareX = glareX
    state.glareY = glareY
    state.glareOpacity = 0.4
  }

  function handleMouseEnter(index: number) {
    playCardHover()
  }

  function handleMouseLeave(index: number) {
    const state = getCardState(index)
    state.rotateX = 0
    state.rotateY = 0
    state.scale = 1
    state.glareOpacity = 0
  }

  function triggerCardFlip(index: number) {
    playCardFlip()
    const state = getCardState(index)
    state.isFlipping = true
    setTimeout(() => {
      state.isFlipping = false
    }, 600)
  }

  function triggerCardSelect() {
    playCardSelect()
  }

  return {
    getCardState,
    handleMouseMove,
    handleMouseEnter,
    handleMouseLeave,
    triggerCardFlip,
    triggerCardSelect,
    playCardHover,
    playCardFlip,
    playCardSelect
  }
}

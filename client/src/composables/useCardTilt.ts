import { ref } from 'vue'
import { playCardHover, playCardFlip, playCardSelect } from './game/useAudioEngine'

export function useCardTilt() {
  const flippingCards = ref<Record<number, boolean>>({})

  function isFlipping(index: number): boolean {
    return !!flippingCards.value[index]
  }

  function handleMouseEnter() {
    playCardHover()
  }

  function triggerCardFlip(index: number) {
    playCardSelect()
    flippingCards.value[index] = true
    setTimeout(() => {
      flippingCards.value[index] = false
    }, 600)
  }

  return {
    isFlipping,
    handleMouseEnter,
    triggerCardFlip,
    playCardHover,
    playCardFlip,
    playCardSelect
  }
}

import { ref, onMounted } from 'vue'

export function useVoiceSynthesis() {
  const isSpeaking = ref(false)
  const isVoiceOutputEnabled = ref(true)

  let speechQueue: SpeechSynthesisUtterance[] = []

  function getBestVoice(isVi: boolean): SpeechSynthesisVoice | null {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null
    const voices = window.speechSynthesis.getVoices()
    if (!voices || voices.length === 0) return null

    const targetLang = isVi ? 'vi' : 'en'
    const langVoices = voices.filter(v => v.lang.toLowerCase().includes(targetLang))
    if (langVoices.length === 0) return voices[0] || null

    // Priority ranking list for human-like voices matching Puck / Assistant
    const priorityNames = [
      'guy online (natural)',
      'google us english',
      'google uk english male',
      'natural (male)',
      'neural (male)',
      'alex',
      'daniel',
      'fred',
      'jenny online (natural)',
      'aria online (natural)',
      'online (natural)',
      'samantha (enhanced)',
      'samantha',
      'enhanced',
      'natural',
      'neural'
    ]

    for (const nameKeyword of priorityNames) {
      const found = langVoices.find(v => v.name.toLowerCase().includes(nameKeyword))
      if (found) return found
    }

    return langVoices[0] || null
  }

  function stopSpeaking() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    speechQueue = []
    isSpeaking.value = false
  }

  function toggleVoiceOutput() {
    isVoiceOutputEnabled.value = !isVoiceOutputEnabled.value
    if (!isVoiceOutputEnabled.value) {
      stopSpeaking()
    }
  }

  function speakText(text: string, isChatOpen = true, options?: { rate?: number; pitch?: number }) {
    if (!isChatOpen || !isVoiceOutputEnabled.value || typeof window === 'undefined' || !('speechSynthesis' in window)) return

    stopSpeaking()

    // Clean status tags, markdown, symbols, emojis, and formatting before speaking
    const cleanText = text
      .replace(/\[STATUS\]:?|\[TELEMETRY DATA\]:?|\[TACTICAL RECOMMENDATION\]:?|\[SYSTEM STATUS\]:?|\[OPERATION EXECUTED\]:?|\[ANALYSIS\]:?/gi, '')
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F6D0}-\u{1F6FF}\u{1F900}-\u{1F9FF}]/gu, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/<[^>]*>/g, '')
      .replace(/^[-•*]\s+/gm, '')
      .replace(/https?:\/\/\S+/g, '')
      .trim()

    if (!cleanText || !isChatOpen) {
      isSpeaking.value = false
      return
    }

    const isVi = /[àáảãạâầấẩẫậăằắẳẵặèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i.test(cleanText)
    const voice = getBestVoice(isVi)

    const utterance = new SpeechSynthesisUtterance(cleanText)
    utterance.lang = isVi ? 'vi-VN' : 'en-US'
    utterance.rate = options?.rate ?? 1.05
    utterance.pitch = options?.pitch ?? 0.95

    if (voice) {
      utterance.voice = voice
    }

    utterance.onstart = () => {
      if (isChatOpen) {
        isSpeaking.value = true
      }
    }

    utterance.onend = () => {
      isSpeaking.value = false
    }

    utterance.onerror = () => {
      isSpeaking.value = false
    }

    isSpeaking.value = true
    window.speechSynthesis.speak(utterance)
  }

  onMounted(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        // Voices loaded
      }
    }
  })

  return {
    isSpeaking,
    isVoiceOutputEnabled,
    toggleVoiceOutput,
    speakText,
    stopSpeaking
  }
}

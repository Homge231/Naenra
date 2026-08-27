import { ref, onMounted } from 'vue'

export function useVoiceSynthesis() {
  const isSpeaking = ref(false)
  const isVoiceOutputEnabled = ref(true)

  function getBestVoice(isVi: boolean): SpeechSynthesisVoice | null {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null
    const voices = window.speechSynthesis.getVoices()
    if (!voices || voices.length === 0) return null

    const targetLang = isVi ? 'vi' : 'en'
    const langVoices = voices.filter(v => v.lang.toLowerCase().includes(targetLang))
    if (langVoices.length === 0) return voices[0] || null

    // Priority ranking list for natural, high-clarity voice personas
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

  let currentSpeechSession = 0

  function stopSpeaking() {
    currentSpeechSession++
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel()
      } catch {}
    }
    isSpeaking.value = false
  }

  function toggleVoiceOutput() {
    isVoiceOutputEnabled.value = !isVoiceOutputEnabled.value
    if (!isVoiceOutputEnabled.value) {
      stopSpeaking()
    }
  }

  function cleanSpeechText(text: string): string {
    return text
      .replace(/```[\s\S]*?```/g, '') // remove code blocks
      .replace(/\[STATUS\]:?|\[TELEMETRY DATA\]:?|\[TACTICAL RECOMMENDATION\]:?|\[SYSTEM STATUS\]:?|\[OPERATION EXECUTED\]:?|\[ANALYSIS\]:?/gi, '')
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F6D0}-\u{1F6FF}]/gu, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/<[^>]*>/g, '')
      .replace(/^[-•*]\s+/gm, '')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/[\r\n]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  }

  function splitIntoSentences(text: string): string[] {
    const rawChunks = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g)
    if (!rawChunks) return [text]
    const cleaned = rawChunks.map(c => c.trim()).filter(c => c.length > 0)
    return cleaned.length > 0 ? cleaned : [text]
  }

  function speakText(text: string, isChatOpen = true, options?: { rate?: number; pitch?: number }) {
    if (!isChatOpen || !isVoiceOutputEnabled.value || typeof window === 'undefined' || !('speechSynthesis' in window)) return

    // Immediately stop previous speech and increment session sequence
    stopSpeaking()
    const thisSession = currentSpeechSession

    const cleanText = cleanSpeechText(text)
    if (!cleanText || !isChatOpen) {
      isSpeaking.value = false
      return
    }

    const isVi = /[àáảãạâầấẩẫậăằắẳẵặèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i.test(cleanText)
    const voice = getBestVoice(isVi)
    const sentences = splitIntoSentences(cleanText)

    let currentSentenceIdx = 0

    function playNextSentence() {
      if (currentSpeechSession !== thisSession || !isChatOpen || currentSentenceIdx >= sentences.length) {
        if (currentSpeechSession === thisSession) {
          isSpeaking.value = false
        }
        return
      }

      const sentence = sentences[currentSentenceIdx]
      currentSentenceIdx++

      const utterance = new SpeechSynthesisUtterance(sentence)
      utterance.lang = isVi ? 'vi-VN' : 'en-US'
      utterance.rate = options?.rate ?? 1.05
      utterance.pitch = options?.pitch ?? 0.95
      if (voice) {
        utterance.voice = voice
      }

      utterance.onstart = () => {
        if (currentSpeechSession !== thisSession) {
          try { window.speechSynthesis.cancel() } catch {}
          isSpeaking.value = false
          return
        }
        isSpeaking.value = true
      }

      utterance.onend = () => {
        if (currentSpeechSession !== thisSession) {
          isSpeaking.value = false
          return
        }
        if (currentSentenceIdx < sentences.length) {
          playNextSentence()
        } else {
          isSpeaking.value = false
        }
      }

      utterance.onerror = (e) => {
        if (currentSpeechSession !== thisSession) {
          isSpeaking.value = false
          return
        }
        // If an individual sentence errors (e.g. cancelled), stop gracefully
        if (e.error !== 'canceled' && currentSentenceIdx < sentences.length) {
          playNextSentence()
        } else {
          isSpeaking.value = false
        }
      }

      try {
        isSpeaking.value = true
        window.speechSynthesis.speak(utterance)
      } catch {
        isSpeaking.value = false
      }
    }

    playNextSentence()
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

import { ref, onUnmounted } from 'vue'

export interface SpeechRecognitionOptions {
  lang?: string
  continuous?: boolean
  interimResults?: boolean
}

export function useSpeechRecognition() {
  const isListening = ref(false)
  const isSupported = ref(false)
  const transcript = ref('')
  const interimTranscript = ref('')
  const errorMsg = ref<string | null>(null)

  let recognition: any = null
  let micMediaStream: MediaStream | null = null
  let onResultCallback: ((fullText: string, isFinal: boolean) => void) | null = null
  let finalAccumulated = ''

  if (typeof window !== 'undefined') {
    const SpeechRecognitionClass =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition ||
      (window as any).mozSpeechRecognition ||
      (window as any).msSpeechRecognition

    isSupported.value = !!SpeechRecognitionClass
  }

  function setupRecognitionInstance(options?: SpeechRecognitionOptions) {
    if (typeof window === 'undefined') return null

    const SpeechRecognitionClass =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition ||
      (window as any).mozSpeechRecognition ||
      (window as any).msSpeechRecognition

    if (!SpeechRecognitionClass) {
      errorMsg.value = 'Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.'
      return null
    }

    const instance = new SpeechRecognitionClass()
    instance.continuous = options?.continuous ?? true
    instance.interimResults = options?.interimResults ?? true
    instance.maxAlternatives = 1

    // Detect language: default to Vietnamese if Vietnamese characters or locale, else en-US
    const browserLang = navigator.language || 'en-US'
    instance.lang = options?.lang || (browserLang.startsWith('vi') ? 'vi-VN' : 'en-US')

    instance.onstart = () => {
      isListening.value = true
      errorMsg.value = null
    }

    instance.onresult = (event: any) => {
      let interim = ''
      let currentFinal = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const item = event.results[i]
        const text = item[0]?.transcript || ''
        if (item.isFinal) {
          currentFinal += text
        } else {
          interim += text
        }
      }

      if (currentFinal) {
        finalAccumulated += (finalAccumulated && !finalAccumulated.endsWith(' ') ? ' ' : '') + currentFinal.trim()
      }

      interimTranscript.value = interim
      const combined = (finalAccumulated + (interim ? ' ' + interim : '')).trim()
      transcript.value = combined

      if (onResultCallback) {
        onResultCallback(combined, !interim && !!currentFinal)
      }
    }

    instance.onerror = (event: any) => {
      const err = event.error
      if (err === 'no-speech') {
        // Normal when user holds mic without talking
        return
      }
      if (err === 'not-allowed' || err === 'service-not-allowed') {
        errorMsg.value = 'Microphone permission denied. Please allow microphone access in your browser settings.'
      } else if (err !== 'aborted') {
        console.warn('[SpeechRecognition Error]:', err)
      }
    }

    instance.onend = () => {
      isListening.value = false
      interimTranscript.value = ''
      releaseMicHardware()
    }

    return instance
  }

  async function acquireMicHardware(): Promise<boolean> {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) return true
    try {
      micMediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })
      return true
    } catch (err: any) {
      console.warn('[useSpeechRecognition] Microphone permission error:', err)
      errorMsg.value = 'Microphone permission denied. Please allow microphone access.'
      return false
    }
  }

  function releaseMicHardware() {
    if (micMediaStream) {
      try {
        micMediaStream.getTracks().forEach(track => track.stop())
      } catch {}
      micMediaStream = null
    }
  }

  async function startListening(options?: SpeechRecognitionOptions): Promise<boolean> {
    abortListening()

    finalAccumulated = ''
    transcript.value = ''
    interimTranscript.value = ''
    errorMsg.value = null

    if (!isSupported.value) {
      errorMsg.value = 'Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.'
      return false
    }

    const hasMic = await acquireMicHardware()
    if (!hasMic) return false

    try {
      recognition = setupRecognitionInstance(options)
      if (!recognition) return false
      recognition.start()
      isListening.value = true
      return true
    } catch (err: any) {
      console.warn('[useSpeechRecognition] Failed to start recognition:', err)
      releaseMicHardware()
      return false
    }
  }

  function stopListening(): Promise<string> {
    return new Promise((resolve) => {
      if (!recognition || !isListening.value) {
        releaseMicHardware()
        resolve(transcript.value.trim())
        return
      }

      const finishAndResolve = () => {
        const full = transcript.value.trim()
        releaseMicHardware()
        resolve(full)
      }

      try {
        recognition.onend = () => {
          isListening.value = false
          interimTranscript.value = ''
          finishAndResolve()
        }
        recognition.stop()
      } catch {
        finishAndResolve()
      }

      // Safeguard timeout in case browser hangs on onend
      setTimeout(() => {
        finishAndResolve()
      }, 400)
    })
  }

  function abortListening() {
    isListening.value = false
    interimTranscript.value = ''
    if (recognition) {
      try {
        recognition.onend = null
        recognition.onerror = null
        recognition.abort()
      } catch {}
        recognition = null
    }
    releaseMicHardware()
  }

  function onTranscriptUpdate(cb: (text: string, isFinal: boolean) => void) {
    onResultCallback = cb
  }

  onUnmounted(() => {
    abortListening()
  })

  return {
    isListening,
    isSupported,
    transcript,
    interimTranscript,
    errorMsg,
    startListening,
    stopListening,
    abortListening,
    onTranscriptUpdate
  }
}

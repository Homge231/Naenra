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
  const audioAmplitude = ref(0)
  const isVoiceDetected = ref(false)

  let recognition: any = null
  let micMediaStream: MediaStream | null = null
  let audioContext: AudioContext | null = null
  let analyserNode: AnalyserNode | null = null
  let animFrameId: number | null = null
  let onResultCallback: ((fullText: string, isFinal: boolean) => void) | null = null
  let finalAccumulated = ''
  let isRecordingActive = false

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
      if (isRecordingActive) {
        // Restart recognition instance if browser automatically cycled during hold
        try {
          if (recognition) {
            recognition.start()
            return
          }
        } catch {}
      }
      isListening.value = false
      interimTranscript.value = ''
    }

    return instance
  }

  function startAudioAnalyser(stream: MediaStream) {
    stopAudioAnalyser()
    if (typeof window === 'undefined') return
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioCtx) return
      audioContext = new AudioCtx()
      const source = audioContext.createMediaStreamSource(stream)
      analyserNode = audioContext.createAnalyser()
      analyserNode.fftSize = 256
      analyserNode.smoothingTimeConstant = 0.4
      source.connect(analyserNode)

      const bufferLength = analyserNode.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)

      const sampleLoop = () => {
        if (!analyserNode || !isListening.value) {
          audioAmplitude.value = 0
          isVoiceDetected.value = false
          return
        }
        analyserNode.getByteFrequencyData(dataArray)
        let sum = 0
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i]
        }
        const avg = sum / bufferLength
        // Apply noise gate: background noise (< 10) yields 0
        if (avg < 10) {
          audioAmplitude.value = 0
          isVoiceDetected.value = false
        } else {
          // Normalized altitude / amplitude: 0.1 to 1.0
          const normalized = Math.min(1, Math.max(0.1, (avg - 10) / 70))
          audioAmplitude.value = normalized
          isVoiceDetected.value = true
        }

        animFrameId = requestAnimationFrame(sampleLoop)
      }

      sampleLoop()
    } catch (e) {
      console.warn('[useSpeechRecognition] AudioContext analyser init error:', e)
    }
  }

  function stopAudioAnalyser() {
    if (animFrameId) {
      cancelAnimationFrame(animFrameId)
      animFrameId = null
    }
    if (audioContext) {
      try {
        audioContext.close()
      } catch {}
      audioContext = null
    }
    analyserNode = null
    audioAmplitude.value = 0
    isVoiceDetected.value = false
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
      startAudioAnalyser(micMediaStream)
      return true
    } catch (err: any) {
      console.warn('[useSpeechRecognition] Microphone permission error:', err)
      errorMsg.value = 'Microphone permission denied. Please allow microphone access.'
      return false
    }
  }

  function releaseMicHardware() {
    stopAudioAnalyser()
    if (micMediaStream) {
      try {
        micMediaStream.getTracks().forEach(track => track.stop())
      } catch {}
      micMediaStream = null
    }
  }

  async function startListening(options?: SpeechRecognitionOptions): Promise<boolean> {
    abortListening()

    isRecordingActive = true
    finalAccumulated = ''
    transcript.value = ''
    interimTranscript.value = ''
    errorMsg.value = null

    if (!isSupported.value) {
      errorMsg.value = 'Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.'
      return false
    }

    const hasMic = await acquireMicHardware()
    if (!hasMic) {
      isRecordingActive = false
      return false
    }

    try {
      recognition = setupRecognitionInstance(options)
      if (!recognition) {
        isRecordingActive = false
        releaseMicHardware()
        return false
      }
      recognition.start()
      isListening.value = true
      return true
    } catch (err: any) {
      console.warn('[useSpeechRecognition] Failed to start recognition:', err)
      isRecordingActive = false
      releaseMicHardware()
      return false
    }
  }

  function stopListening(): Promise<string> {
    isRecordingActive = false
    return new Promise((resolve) => {
      const finishAndResolve = () => {
        const full = (transcript.value.trim() || interimTranscript.value.trim())
        interimTranscript.value = ''
        releaseMicHardware()
        isListening.value = false
        resolve(full)
      }

      if (!recognition) {
        finishAndResolve()
        return
      }

      try {
        recognition.onend = () => {
          finishAndResolve()
        }
        recognition.stop()
      } catch {
        finishAndResolve()
      }

      // Safeguard timeout in case browser hangs on onend
      setTimeout(() => {
        finishAndResolve()
      }, 250)
    })
  }

  function abortListening() {
    isRecordingActive = false
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
    audioAmplitude,
    isVoiceDetected,
    startListening,
    stopListening,
    abortListening,
    onTranscriptUpdate
  }
}

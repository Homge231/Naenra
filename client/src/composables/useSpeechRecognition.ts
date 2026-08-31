import { ref, onUnmounted } from 'vue'

export interface SpeechRecognitionOptions {
  lang?: string
  continuous?: boolean
  interimResults?: boolean
}

export interface SpeechResult {
  text: string
  audioData?: string
  mimeType?: string
  hasVoice: boolean
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
  let maxRecordedAmplitude = 0
  let mediaRecorder: MediaRecorder | null = null
  let recordedAudioChunks: Blob[] = []

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

    if (!SpeechRecognitionClass) return null

    const instance = new SpeechRecognitionClass()
    instance.continuous = options?.continuous ?? true
    instance.interimResults = options?.interimResults ?? true
    instance.maxAlternatives = 1

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
      if (err === 'no-speech') return
      if (err === 'not-allowed' || err === 'service-not-allowed') {
        errorMsg.value = 'Microphone permission denied. Please allow microphone access in browser settings.'
      } else if (err !== 'aborted') {
        console.warn('[SpeechRecognition Error]:', err)
      }
    }

    instance.onend = () => {
      if (isRecordingActive) {
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
        if (avg < 8) {
          audioAmplitude.value = 0
          isVoiceDetected.value = false
        } else {
          const normalized = Math.min(1, Math.max(0.1, (avg - 8) / 65))
          audioAmplitude.value = normalized
          isVoiceDetected.value = true
          if (normalized > maxRecordedAmplitude) {
            maxRecordedAmplitude = normalized
          }
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

  function startMediaRecorder(stream: MediaStream) {
    recordedAudioChunks = []
    if (typeof window === 'undefined' || typeof MediaRecorder === 'undefined') return
    try {
      let mimeType = 'audio/webm;codecs=opus'
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : MediaRecorder.isTypeSupported('audio/mp4')
          ? 'audio/mp4'
          : ''
      }

      mediaRecorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream)
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedAudioChunks.push(e.data)
        }
      }
      mediaRecorder.start(100)
    } catch (e) {
      console.warn('[useSpeechRecognition] MediaRecorder init error:', e)
    }
  }

  function stopMediaRecorder(): Promise<{ base64: string; mimeType: string } | null> {
    return new Promise((resolve) => {
      if (!mediaRecorder || mediaRecorder.state === 'inactive') {
        resolve(null)
        return
      }

      mediaRecorder.onstop = async () => {
        try {
          const mimeType = mediaRecorder?.mimeType || 'audio/webm'
          const blob = new Blob(recordedAudioChunks, { type: mimeType })
          recordedAudioChunks = []
          const arrayBuf = await blob.arrayBuffer()
          let binary = ''
          const bytes = new Uint8Array(arrayBuf)
          for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i])
          }
          const base64 = window.btoa(binary)
          resolve({ base64, mimeType })
        } catch {
          resolve(null)
        }
      }

      try {
        mediaRecorder.stop()
      } catch {
        resolve(null)
      }
    })
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
      startMediaRecorder(micMediaStream)
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
    maxRecordedAmplitude = 0
    finalAccumulated = ''
    transcript.value = ''
    interimTranscript.value = ''
    errorMsg.value = null

    const hasMic = await acquireMicHardware()
    if (!hasMic) {
      isRecordingActive = false
      return false
    }

    try {
      recognition = setupRecognitionInstance(options)
      if (recognition) {
        recognition.start()
      }
      isListening.value = true
      return true
    } catch (err: any) {
      console.warn('[useSpeechRecognition] WebSpeech start warning (MediaRecorder active):', err)
      isListening.value = true
      return true
    }
  }

  async function stopListening(): Promise<SpeechResult> {
    isRecordingActive = false
    const audioResult = await stopMediaRecorder()

    return new Promise((resolve) => {
      const finishAndResolve = () => {
        const fullText = (transcript.value.trim() || interimTranscript.value.trim())
        interimTranscript.value = ''
        releaseMicHardware()
        isListening.value = false

        resolve({
          text: fullText,
          audioData: audioResult?.base64,
          mimeType: audioResult?.mimeType,
          hasVoice: maxRecordedAmplitude > 0.05 || !!fullText
        })
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

      setTimeout(() => {
        finishAndResolve()
      }, 200)
    })
  }

  function abortListening() {
    isRecordingActive = false
    isListening.value = false
    interimTranscript.value = ''
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      try { mediaRecorder.stop() } catch {}
    }
    recordedAudioChunks = []
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

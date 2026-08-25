import { ref, onUnmounted } from 'vue'

export function useGeminiLive() {
  const isLiveConnected = ref(false)
  const isConnecting = ref(false)
  const isSpeaking = ref(false)
  const isRecording = ref(false)
  const audioAmplitude = ref(0) // 0..1 volume level for mascot lip-sync
  const errorMsg = ref<string | null>(null)

  // Issue #7: mic is locked while AI is playing audio (prevents echo loop)
  const isMicLocked = ref(false)

  // Issue #6: PTT — tracks whether mic streaming is actively paused
  const isMicPaused = ref(false)

  let ws: WebSocket | null = null
  let audioCtx: AudioContext | null = null
  let micStream: MediaStream | null = null
  let scriptNode: ScriptProcessorNode | null = null
  let nextPlayTime = 0

  function getWsUrl(): string {
    let envUrl = import.meta.env.VITE_SERVER_URL
    if (!envUrl && typeof window !== 'undefined') {
      envUrl = window.location.protocol === 'https:' ? 'https://api.naenra.xyz' : `http://${window.location.hostname}:3000`
    }
    envUrl = envUrl || 'http://localhost:3000'
    const wsProto = envUrl.startsWith('https') ? 'wss' : 'ws'
    const host = envUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')
    const token = typeof window !== 'undefined' ? (localStorage.getItem('arena_token') || '') : ''
    return `${wsProto}://${host}/api/ai/live?token=${encodeURIComponent(token)}`
  }

  // Linear interpolation downsampler to 16kHz
  function downsampleTo16k(input: Float32Array, sampleRate: number): Float32Array {
    if (sampleRate === 16000) return input
    const ratio = sampleRate / 16000
    const newLength = Math.floor(input.length / ratio)
    const result = new Float32Array(newLength)
    for (let i = 0; i < newLength; i++) {
      const originIndex = Math.floor(i * ratio)
      result[i] = input[originIndex]
    }
    return result
  }

  // Convert Float32Array to 16-bit PCM ArrayBuffer
  function floatTo16BitPCM(input: Float32Array): ArrayBuffer {
    const output = new DataView(new ArrayBuffer(input.length * 2))
    for (let i = 0; i < input.length; i++) {
      const s = Math.max(-1, Math.min(1, input[i]))
      output.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true)
    }
    return output.buffer
  }

  // Convert ArrayBuffer to Base64
  function arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = ''
    const bytes = new Uint8Array(buffer)
    const len = bytes.byteLength
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return window.btoa(binary)
  }

  // Start Gemini 3.1 Live Session
  async function startLiveSession() {
    if (isLiveConnected.value || isConnecting.value) return
    isConnecting.value = true
    errorMsg.value = null

    try {
      // 1. Initialize Audio Context with standard browser sample rate
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      audioCtx = new AudioCtxClass()
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume()
      }

      // 2. Request Microphone Access optionally (audio playback works even if mic is denied or unavailable)
      // Issue #8: Enforce noise/echo suppression + mono channel to filter mechanical keyboard noise
      try {
        micStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            channelCount: 1,               // Mono reduces noise floor (Issue #8)
            suppressLocalAudioPlayback: true // Prevent AI speaker output bleeding into mic (Issue #8)
          }
        })
      } catch {
        // Fallback to standard noise suppression constraints if advanced WebRTC flags aren't supported
        try {
          micStream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
            }
          })
        } catch (micErr) {
          console.warn('[Gemini Live]: Microphone not available or denied. Proceeding with audio output playback mode.', micErr)
          micStream = null
        }
      }

      // 3. Connect WebSocket
      const wsUrl = getWsUrl()
      ws = new WebSocket(wsUrl)

      ws.onopen = () => {
        isConnecting.value = true
        // Session setup ready
      }

      ws.onmessage = (event) => {
        // Gemini Live may return Blob (binary) or string
        if (event.data instanceof Blob) {
          event.data.text().then((text: string) => handleServerMessage(text))
        } else {
          handleServerMessage(event.data as string)
        }
      }

      ws.onerror = (err) => {
        console.error('[Gemini Live Error]:', err)
        errorMsg.value = 'Failed to connect to Gemini 3.1 Live service.'
        stopLiveSession()
      }

      ws.onclose = () => {
        stopLiveSession()
      }
    } catch (err: unknown) {
      console.error('[Gemini Live Start Error]:', err)
      const message = err instanceof Error ? err.message : 'Network error or audio initialization failed.'
      errorMsg.value = message
      stopLiveSession()
    }
  }

  // Start Mic Recording & Stream PCM Chunks with proper 16kHz downsampling
  function startMicRecording() {
    if (!micStream || !audioCtx) return

    const source = audioCtx.createMediaStreamSource(micStream)
    scriptNode = audioCtx.createScriptProcessor(2048, 1, 1)

    // Silent gain node to prevent microphone feedback echo
    const silenceGain = audioCtx.createGain()
    silenceGain.gain.value = 0

    let chunkBuffer: Float32Array[] = []
    let chunkSamples = 0
    const TARGET_SAMPLES = audioCtx.sampleRate * 0.15 // ~150ms chunks

    scriptNode.onaudioprocess = (e) => {
      // Issue #6: Skip if PTT is released (mic paused)
      // Issue #7: Skip if AI is currently speaking (mic locked to prevent echo)
      if (!isLiveConnected.value || !ws || ws.readyState !== WebSocket.OPEN) return
      if (isMicPaused.value || isMicLocked.value) {
        chunkBuffer = []
        chunkSamples = 0
        return
      }
      const inputData = e.inputBuffer.getChannelData(0)
      chunkBuffer.push(new Float32Array(inputData))
      chunkSamples += inputData.length

      if (chunkSamples >= TARGET_SAMPLES) {
        const merged = new Float32Array(chunkSamples)
        let offset = 0
        for (const buf of chunkBuffer) {
          merged.set(buf, offset)
          offset += buf.length
        }
        chunkBuffer = []
        chunkSamples = 0

        // Downsample from browser audioCtx.sampleRate to 16000Hz for Gemini Live
        const downsampled = downsampleTo16k(merged, audioCtx!.sampleRate)
        const pcmBuffer = floatTo16BitPCM(downsampled)
        const base64Audio = arrayBufferToBase64(pcmBuffer)

        const mediaChunk = {
          realtimeInput: {
            audio: {
              mimeType: 'audio/pcm;rate=16000',
              data: base64Audio
            }
          }
        }
        ws!.send(JSON.stringify(mediaChunk))
      }
    }

    source.connect(scriptNode)
    scriptNode.connect(silenceGain)
    silenceGain.connect(audioCtx.destination)
  }

  // Issue #6: Push-to-Talk — pause mic streaming without closing WebSocket session
  function pauseMicRecording() {
    isMicPaused.value = true
    isRecording.value = false
  }

  // Issue #6: Push-to-Talk — resume mic streaming on button press
  function resumeMicRecording() {
    if (isMicLocked.value) return // Issue #7: don't resume if AI is speaking
    isMicPaused.value = false
    isRecording.value = true
  }

  const aiTranscriptListeners: ((text: string) => void)[] = []
  const userTranscriptListeners: ((text: string) => void)[] = []
  const turnCompleteListeners: (() => void)[] = []

  function onAiTranscript(cb: (text: string) => void) {
    aiTranscriptListeners.push(cb)
  }
  function onUserTranscript(cb: (text: string) => void) {
    userTranscriptListeners.push(cb)
  }
  function onTurnComplete(cb: () => void) {
    turnCompleteListeners.push(cb)
  }

  // Process Messages Received from Gemini 3.1 Flash Live
  function handleServerMessage(dataStr: string) {
    if (!dataStr || typeof dataStr !== 'string') return
    // Skip empty or non-JSON messages
    const trimmed = dataStr.trim()
    if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) return
    try {
      const msg = JSON.parse(trimmed)

      if (msg.error) {
        errorMsg.value = msg.error
        return
      }

      // Setup complete — Gemini 3.1 Live is ready, start mic in PTT paused state (Issue #6)
      // User must hold the mic button to actively stream audio (Push-to-Talk)
      if (msg.setupComplete) {
        isLiveConnected.value = true
        isConnecting.value = false
        isRecording.value = false  // Issue #6: start paused — user holds button to speak
        isMicPaused.value = true   // Issue #6: PTT default = paused until user holds
        startMicRecording()        // Initialize the audio pipeline but streaming is gated by isMicPaused
        return
      }

      // Check for output transcription (AI text response)
      if (msg.serverContent?.outputTranscription?.text) {
        const text = msg.serverContent.outputTranscription.text
        aiTranscriptListeners.forEach(cb => cb(text))
      }

      // Check for input transcription (User speech-to-text from server if available)
      if (msg.serverContent?.inputTranscription?.text) {
        const text = msg.serverContent.inputTranscription.text
        userTranscriptListeners.forEach(cb => cb(text))
      }

      // Check for incoming audio and text parts
      const parts = msg.serverContent?.modelTurn?.parts || []
      for (const part of parts) {
        if (part.inlineData && part.inlineData.mimeType?.startsWith('audio/pcm')) {
          playAudioChunk(part.inlineData.data)
        }
        if (part.text) {
          aiTranscriptListeners.forEach(cb => cb(part.text))
        }
      }

      // Check for turn complete / generation complete signal from server
      if (msg.serverContent?.turnComplete || msg.serverContent?.generationComplete || msg.serverContent?.interrupted) {
        turnCompleteListeners.forEach(cb => cb())
      }

      // Check for audio interruption (Barge-in)
      if (msg.serverContent?.interrupted) {
        nextPlayTime = 0
        isSpeaking.value = false
        audioAmplitude.value = 0
      }
    } catch {
      // Silently ignore non-JSON binary blobs (audio frames from websocket)
    }
  }

  const activeSources = new Set<AudioBufferSourceNode>()

  // Stop all active audio playback and clear audio queue
  function stopAllAudio() {
    activeSources.forEach(source => {
      try {
        source.stop(0)
        source.disconnect()
      } catch {}
    })
    activeSources.clear()
    nextPlayTime = 0
    isSpeaking.value = false
    audioAmplitude.value = 0
    isMicLocked.value = false  // Issue #7: Always free mic lock when audio is manually stopped
  }

  function interruptSession() {
    stopAllAudio()
  }

  // Play Back PCM Audio Chunks from Gemini 3.1 Flash Live
  function playAudioChunk(base64Data: string) {
    if (!audioCtx) return

    try {
      const binaryStr = window.atob(base64Data)
      const len = binaryStr.length
      const bytes = new Uint8Array(len)
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryStr.charCodeAt(i)
      }

      const pcm16 = new Int16Array(bytes.buffer)
      const float32 = new Float32Array(pcm16.length)
      let sumSq = 0

      for (let i = 0; i < pcm16.length; i++) {
        const sample = pcm16[i] / 32768.0
        float32[i] = sample
        sumSq += sample * sample
      }

      // Amplitude for mascot lip sync
      const rms = Math.sqrt(sumSq / pcm16.length)
      audioAmplitude.value = Math.min(1, rms * 4)

      const audioBuffer = audioCtx.createBuffer(1, float32.length, 24000)
      audioBuffer.getChannelData(0).set(float32)

      const source = audioCtx.createBufferSource()
      source.buffer = audioBuffer
      source.connect(audioCtx.destination)

      const now = audioCtx.currentTime
      if (nextPlayTime < now) {
        nextPlayTime = now
      }

      isSpeaking.value = true
      isMicLocked.value = true  // Issue #7: Lock mic while AI audio is playing
      activeSources.add(source)
      source.start(nextPlayTime)
      nextPlayTime += audioBuffer.duration

      source.onended = () => {
        activeSources.delete(source)
        if (activeSources.size === 0 || (audioCtx && audioCtx.currentTime >= nextPlayTime - 0.05)) {
          isSpeaking.value = false
          audioAmplitude.value = 0
          isMicLocked.value = false  // Issue #7: Unlock mic when AI finishes speaking
        }
      }
    } catch (err) {
      console.error('[Audio Playback Error]:', err)
    }
  }

  // Send text message directly into active Gemini 3.1 Live session
  function sendTextMessage(text: string) {
    if (!isLiveConnected.value || !ws || ws.readyState !== WebSocket.OPEN) return
    const clientMsg = {
      clientContent: {
        turns: [
          {
            role: 'user',
            parts: [{ text }]
          }
        ],
        turnComplete: true
      }
    }
    ws.send(JSON.stringify(clientMsg))
  }

  // Speak text using Gemini 3.1 Flash Live neural 'Puck' voice
  async function speakTextViaLive(text: string) {
    if (!text || !text.trim()) return
    const cleanText = text
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F6D0}-\u{1F6FF}]/gu, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/<[^>]*>/g, '')
      .replace(/^[-•*]\s+/gm, '')
      .replace(/https?:\/\/\S+/g, '')
      .trim()

    if (!cleanText) return

    if (!isLiveConnected.value) {
      await startLiveSession()
      let attempts = 0
      while (!isLiveConnected.value && attempts < 20) {
        await new Promise(r => setTimeout(r, 200))
        attempts++
      }
    }

    if (isLiveConnected.value) {
      sendTextMessage(`Please read aloud clearly: "${cleanText}"`)
    }
  }

  // Stop Live Session
  function stopLiveSession() {
    isLiveConnected.value = false
    isConnecting.value = false
    isSpeaking.value = false
    isRecording.value = false
    audioAmplitude.value = 0
    isMicLocked.value = false   // Issue #7: Always release mic lock on session end
    isMicPaused.value = false   // Issue #6: Always release PTT pause on session end

    stopAllAudio()

    if (scriptNode) {
      scriptNode.disconnect()
      scriptNode = null
    }

    if (micStream) {
      micStream.getTracks().forEach((track) => track.stop())
      micStream = null
    }

    if (audioCtx) {
      audioCtx.close()
      audioCtx = null
    }

    if (ws) {
      ws.close()
      ws = null
    }
  }

  onUnmounted(() => {
    stopLiveSession()
  })

  return {
    isLiveConnected,
    isConnecting,
    isSpeaking,
    isRecording,
    isMicLocked,    // Issue #7: exposed so UI can disable PTT button
    isMicPaused,    // Issue #6: exposed so UI can track PTT hold state
    audioAmplitude,
    errorMsg,
    startLiveSession,
    stopLiveSession,
    stopAllAudio,
    interruptSession,
    sendTextMessage,
    speakTextViaLive,
    pauseMicRecording,   // Issue #6: PTT press-release
    resumeMicRecording,  // Issue #6: PTT press-release
    onAiTranscript,
    onUserTranscript,
    onTurnComplete
  }
}


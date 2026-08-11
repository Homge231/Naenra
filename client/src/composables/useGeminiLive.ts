import { ref, onUnmounted } from 'vue'

export function useGeminiLive() {
  const isLiveConnected = ref(false)
  const isConnecting = ref(false)
  const isSpeaking = ref(false)
  const isRecording = ref(false)
  const audioAmplitude = ref(0) // 0..1 volume level for mascot lip-sync
  const errorMsg = ref<string | null>(null)

  let ws: WebSocket | null = null
  let audioCtx: AudioContext | null = null
  let micStream: MediaStream | null = null
  let scriptNode: ScriptProcessorNode | null = null
  let nextPlayTime = 0

  function getWsUrl(): string {
    if (import.meta.env.VITE_SERVER_URL) {
      const envUrl = import.meta.env.VITE_SERVER_URL
      const wsProto = envUrl.startsWith('https') ? 'wss' : 'ws'
      const host = envUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')
      return `${wsProto}://${host}/api/ai/live`
    }
    const loc = window.location
    const wsProto = loc.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = loc.port === '5173' ? `${loc.hostname}:3000` : loc.host
    return `${wsProto}//${host}/api/ai/live`
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

      // 2. Request Microphone Access without rigid sampleRate hardware constraints
      micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })

      // 3. Connect WebSocket
      const wsUrl = getWsUrl()
      ws = new WebSocket(wsUrl)

      ws.onopen = () => {
        isLiveConnected.value = true
        isConnecting.value = false
        isRecording.value = true
        startMicRecording()
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
      const message = err instanceof Error ? err.message : 'Microphone or network permission denied.'
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
      if (!isLiveConnected.value || !ws || ws.readyState !== WebSocket.OPEN) return
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
            mediaChunks: [{ mimeType: 'audio/pcm;rate=16000', data: base64Audio }]
          }
        }
        ws!.send(JSON.stringify(mediaChunk))
      }
    }

    source.connect(scriptNode)
    scriptNode.connect(silenceGain)
    silenceGain.connect(audioCtx.destination)
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

      // Setup complete — Gemini is ready
      if (msg.setupComplete) return

      // Check for incoming audio parts
      const parts = msg.serverContent?.modelTurn?.parts || []
      for (const part of parts) {
        if (part.inlineData && part.inlineData.mimeType?.startsWith('audio/pcm')) {
          playAudioChunk(part.inlineData.data)
        }
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
      source.start(nextPlayTime)
      nextPlayTime += audioBuffer.duration

      source.onended = () => {
        if (audioCtx && audioCtx.currentTime >= nextPlayTime - 0.05) {
          isSpeaking.value = false
          audioAmplitude.value = 0
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

  // Stop Live Session
  function stopLiveSession() {
    isLiveConnected.value = false
    isConnecting.value = false
    isSpeaking.value = false
    isRecording.value = false
    audioAmplitude.value = 0

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
    audioAmplitude,
    errorMsg,
    startLiveSession,
    stopLiveSession,
    sendTextMessage
  }
}

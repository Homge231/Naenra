import { Server as HttpServer } from 'http'
import { WebSocketServer, WebSocket } from 'ws'
import dotenv from 'dotenv'

dotenv.config()

export function setupAiLiveGateway(): WebSocketServer {
  const wss = new WebSocketServer({ noServer: true })

  wss.on('connection', (clientWs: WebSocket) => {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      clientWs.send(JSON.stringify({ error: 'GEMINI_API_KEY is missing on server env.' }))
      clientWs.close()
      return
    }

    const host = 'generativelanguage.googleapis.com'
    const geminiUri = `wss://${host}/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${apiKey}`

    const geminiWs = new WebSocket(geminiUri)

    geminiWs.on('open', () => {
      // 1. Send Setup Message to Gemini 3.1 Flash Live
      const setupMsg = {
        setup: {
          model: 'models/gemini-3.1-flash-live-preview',
          generationConfig: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: 'Puck'
                }
              }
            },
            thinkingConfig: {
              thinkingLevel: 'MINIMAL'
            }
          },
          systemInstruction: {
            parts: [
              {
                text: `You are Naenra Cyber AI Coach, an energetic, friendly real-time voice AI coach in Naenra typing game.
You talk directly to players via real-time audio.
Keep responses concise, natural, and helpful.
Answer in Vietnamese or English depending on what the user speaks.
Key Game Facts:
- Naenra is a 60s timed vocabulary typing game with 3-Round loop.
- Has 10 Tier 1 Main Cores: Perfect Combo, Aegis Shield, Pandora's Box, Power Strike, Mission Impossible, Argus Eyes (Oracle), Speedster, Balance, Phoenix, High Roller.
- ELO Rank tiers: Bronze (0-100), Silver (101-200), Gold (201-300), Platinum (301-400), Diamond (401-600), Master (601-800), Grandmaster (801+).`
              }
            ]
          }
        }
      }

      geminiWs.send(JSON.stringify(setupMsg))
    })

    // 2. Relay messages from Client -> Gemini Live
    clientWs.on('message', (message: Buffer | string) => {
      if (geminiWs.readyState === WebSocket.OPEN) {
        geminiWs.send(message.toString())
      }
    })

    // 3. Relay responses from Gemini Live -> Client
    geminiWs.on('message', (data: Buffer | string) => {
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(data.toString())
      }
    })

    // Cleanup on disconnect
    clientWs.on('close', () => {
      if (geminiWs.readyState === WebSocket.OPEN || geminiWs.readyState === WebSocket.CONNECTING) {
        geminiWs.close()
      }
    })

    geminiWs.on('close', (code, reason) => {
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.close(code, reason.toString())
      }
    })

    geminiWs.on('error', (err) => {
      console.error('[GeminiLiveProxy Error]:', err.message)
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(JSON.stringify({ error: err.message }))
      }
    })
  })

  return wss
}

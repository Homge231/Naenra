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

    let isSetupComplete = false
    const pendingClientMessages: (Buffer | string)[] = []

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
                text: `You are Naenra AI Coach, an energetic, friendly real-time voice AI coach in Naenra typing game (live at naenra.xyz).
You talk directly to players via real-time audio.
Detect the language of the player (Vietnamese, English, Spanish, Japanese, French, etc.) and speak naturally, fluently, and enthusiastically in that exact language.

2-PHASE CONVERSATIONAL SPOKEN PACING:
Whenever a player asks a question or speaks to you, ALWAYS start your spoken voice response with an immediate, natural conversational acknowledgment phrase first (e.g. In English: "Alright, let me check that for you!", "Got it, let's see!", "Sure thing, here's how that works!"; In Vietnamese: "Được rồi, để mình xem nào!", "Hiểu rồi, để mình giải thích ngay cho bạn nhé!", "Ồ hay đấy, để mình kiểm tra nhé!"), followed immediately by your concise, punchy advice in the same voice turn.

Key Game Facts:
- Naenra is a 60s timed vocabulary typing game with 3-Round loop.
- Has 65 Support Cores across 10 families: Combo, Speedster, Aegis, Oracle (Argus Eyes), Mission, Pandora, Phoenix, High Roller, Power, and Balanced.
- Players select 1 Support Core during the 15-second prep phase before each round.
- NO HYBRID STACKING: Super Hybrids or cross-family core stacking do not exist. Players equip 1 Support Core for each round.
- ELO Rank tiers: Bronze (0-100), Silver (101-200), Gold (201-300), Platinum (301-400), Diamond (401-600), Master (601-800), Grandmaster (801+).
- Keep voice responses compact (under 45 words) for fast, natural in-game audio listening.`
              }
            ]
          }
        }
      }

      geminiWs.send(JSON.stringify(setupMsg))
    })

    // 2. Relay messages from Client -> Gemini Live (Buffered until setup completes)
    clientWs.on('message', (message: Buffer | string) => {
      if (isSetupComplete && geminiWs.readyState === WebSocket.OPEN) {
        geminiWs.send(message.toString())
      } else {
        pendingClientMessages.push(message)
      }
    })

    // 3. Relay responses from Gemini Live -> Client
    geminiWs.on('message', (data: Buffer | string) => {
      try {
        const dataStr = data.toString()
        if (dataStr.includes('setupComplete')) {
          isSetupComplete = true
          // Flush buffered messages once setup completes
          while (pendingClientMessages.length > 0) {
            const pending = pendingClientMessages.shift()
            if (pending && geminiWs.readyState === WebSocket.OPEN) {
              geminiWs.send(pending.toString())
            }
          }
        }
      } catch {
        // Ignore non-JSON parsing errors
      }

      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(data)
      }
    })

    // Cleanup on disconnect
    clientWs.on('close', () => {
      if (geminiWs.readyState === WebSocket.OPEN || geminiWs.readyState === WebSocket.CONNECTING) {
        geminiWs.close()
      }
    })

    geminiWs.on('close', (code, reason) => {
      const reasonStr = reason ? reason.toString() : ''
      console.log(`[GeminiLiveProxy Close]: Code ${code}, Reason: ${reasonStr}`)
      if (clientWs.readyState === WebSocket.OPEN) {
        if (code !== 1000 && reasonStr) {
          try {
            clientWs.send(JSON.stringify({ error: `Gemini Live error (${code}): ${reasonStr}` }))
          } catch { /* ignore */ }
        }
        clientWs.close(code, reasonStr)
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

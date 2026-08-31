import { Server as HttpServer } from 'http'
import { WebSocketServer, WebSocket } from 'ws'
import dotenv from 'dotenv'
import { verifyToken } from '../utils/jwt'
import { supabase } from '../config/supabase'
import { getRankFromElo } from '../utils/ranks'

dotenv.config()

export function setupAiLiveGateway(): WebSocketServer {
  const wss = new WebSocketServer({ noServer: true })

  wss.on('connection', async (clientWs: WebSocket, req: any) => {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      clientWs.send(JSON.stringify({ error: 'GEMINI_API_KEY is missing on server env.' }))
      clientWs.close()
      return
    }

    // 1. Resolve player identity & live career stats from query token
    let playerName = 'Player'
    let playerElo = 0
    let playerRank = 'Bronze'
    let playerWins = 0
    let playerLosses = 0
    let totalMatches = 0
    let winRate = '0%'

    try {
      const requestUrl = new URL(req?.url || '', 'http://localhost')
      const token = requestUrl.searchParams.get('token')
      if (token) {
        const decoded = verifyToken(token)
        if (decoded?.id) {
          playerName = decoded.username || decoded.email?.split('@')[0] || 'Player'
          const { data: dbPlayer } = await supabase
            .from('players')
            .select('username, elo, wins, losses, total_matches')
            .eq('id', decoded.id)
            .maybeSingle()

          if (dbPlayer) {
            playerName = dbPlayer.username || playerName
            playerElo = dbPlayer.elo ?? 0
            playerRank = getRankFromElo(playerElo)
            playerWins = dbPlayer.wins ?? 0
            playerLosses = dbPlayer.losses ?? 0
            totalMatches = dbPlayer.total_matches ?? (playerWins + playerLosses)
            winRate = totalMatches > 0 ? `${Math.round((playerWins / totalMatches) * 100)}%` : '0%'
          }
        }
      }
    } catch (err) {
      console.warn('[GeminiLiveProxy] Could not resolve player token:', err)
    }

    const host = 'generativelanguage.googleapis.com'
    const geminiUri = `wss://${host}/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${apiKey}`

    const geminiWs = new WebSocket(geminiUri)

    let isSetupComplete = false
    // Issue #7: track whether Gemini is currently streaming audio back to client
    let isAiStreaming = false
    const pendingClientMessages: (Buffer | string)[] = []

    geminiWs.on('open', () => {
      const liveModel = process.env.GEMINI_LIVE_MODEL || 'models/gemini-3.1-flash-live-preview'
      const setupMsg = {
        setup: {
          model: liveModel,
          generationConfig: {
            responseModalities: ['AUDIO', 'TEXT'],
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
                text: `You are Naenra AI Coach, the official energetic, friendly real-time voice AI guide in Naenra typing game (live at naenra.xyz).
You talk directly to the player via real-time audio.

LANGUAGE RULES:
- Primary Languages: English and Vietnamese only.
- When the player speaks English (such as "Hello", "Hi", "Hey", "How do I play?", "What is my rank?"), ALWAYS understand in English and reply directly in energetic, natural English.
- When the player speaks Vietnamese, understand and reply directly in fluent Vietnamese.
- NEVER interpret English phonemes into Chinese characters, Japanese kana, or any other Asian scripts.
- Keep voice responses compact (under 35 words) for fast, natural in-game audio listening.

CURRENT PLAYER IDENTITY & LIVE STATS:
- In-Game Player Name / Username: "${playerName}"
- ELO Rating: ${playerElo} (Rank Tier: ${playerRank})
- Career Record: ${playerWins} Wins / ${playerLosses} Losses (${totalMatches} Total Matches, Win Rate: ${winRate})

PLAYER IDENTITY & STATS AUTHORIZATION:
You HAVE FULL, DIRECT AUTHORIZED ACCESS to this player's in-game account.
If the player asks "What is my username?", "Who am I?", "What is my rank?", "Tên của tôi là gì?", "Tôi tên là gì?", "Tài khoản của tôi là gì?", "Tôi là ai?", or asks about their ELO, rank, or career performance:
YOU MUST STATE THEIR EXACT IN-GAME USERNAME ("${playerName}") AND LIVE STATS DIRECTLY!
NEVER say "I don't have access to your username" or "I cannot access personal info" — you are their personal in-game coach and you know their exact username "${playerName}".

Key Game Facts:
- Naenra is a 60s timed vocabulary typing game with 3-Round loop.
- Has 65 Support Cores across 10 families: Combo, Speedster, Aegis, Oracle (Argus Eyes), Mission, Pandora, Phoenix, High Roller, Power, and Balanced.
- Players select 1 Support Core during the 15-second prep phase before each round.
- NO HYBRID STACKING: Super Hybrids or cross-family core stacking do not exist. Players equip 1 Support Core for each round.
- ELO Rank tiers: Bronze (0-100), Silver (101-200), Gold (201-300), Platinum (301-400), Diamond (401-600), Master (601-800), Grandmaster (801+).`
              }
            ]
          }
        }
      }

      geminiWs.send(JSON.stringify(setupMsg))
    })

    // 2. Relay messages from Client -> Gemini Live (Buffered until setup completes)
    clientWs.on('message', (message: Buffer | string) => {
      // Issue #7: Drop incoming mic audio while AI is streaming (prevents echo loop)
      if (isSetupComplete && isAiStreaming) {
        try {
          const parsed = JSON.parse(message.toString())
          if (parsed.realtimeInput?.audio) {
            // Silently drop audio chunk — AI is currently speaking
            return
          }
        } catch { /* non-JSON, relay as-is */ }
      }

      if (isSetupComplete && geminiWs.readyState === WebSocket.OPEN) {
        geminiWs.send(message.toString())
      } else {
        pendingClientMessages.push(message)
      }
    })

    // 3. Relay responses from Gemini Live -> Client
    geminiWs.on('message', (data: Buffer | string) => {
      // Handle setupComplete and flush pending messages
      try {
        const dataStr = data.toString()
        if (dataStr.includes('setupComplete')) {
          isSetupComplete = true
          while (pendingClientMessages.length > 0) {
            const pending = pendingClientMessages.shift()
            if (pending && geminiWs.readyState === WebSocket.OPEN) {
              geminiWs.send(pending.toString())
            }
          }
        }
      } catch {
        // Ignore non-JSON parsing errors for setupComplete check
      }

      // HF-4: Separate try/catch for isAiStreaming tracking
      // Ensures binary audio frames cannot silently prevent turnComplete from unlocking mic
      try {
        const msg = JSON.parse(data.toString())
        const parts = msg?.serverContent?.modelTurn?.parts || []
        if (parts.some((p: any) => p.inlineData?.mimeType?.startsWith('audio/'))) {
          isAiStreaming = true  // AI is sending audio — lock mic
        }
        if (msg?.serverContent?.turnComplete || msg?.serverContent?.interrupted || msg?.serverContent?.generationComplete) {
          isAiStreaming = false  // AI finished speaking — unlock mic
        }
      } catch {
        // Binary audio frames are not JSON — this is normal, ignore silently
        // isAiStreaming state is NOT modified here, preserving last known value
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

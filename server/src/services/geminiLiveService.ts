import { Server as HttpServer } from 'http'
import WebSocket, { WebSocketServer } from 'ws'
import { verifyToken } from '../utils/jwt'
import dotenv from 'dotenv'

dotenv.config()

export function initGeminiLiveRelay(httpServer: HttpServer) {
  const wss = new WebSocketServer({ noServer: true })

  // Listen to upgrade event on httpServer before Colyseus or other listeners handle it
  const existingListeners = httpServer.listeners('upgrade').slice()
  httpServer.removeAllListeners('upgrade')

  httpServer.on('upgrade', (req, socket, head) => {
    const url = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`)
    if (url.pathname === '/api/ai/live') {
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit('connection', ws, req)
      })
    } else {
      // Pass through to Colyseus or existing upgrade listeners
      for (const listener of existingListeners) {
        listener.call(httpServer, req, socket, head)
      }
    }
  })

  wss.on('connection', (ws: WebSocket, req) => {
    const url = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`)
    const token = url.searchParams.get('token')

    if (!token) {
      console.warn('[GeminiLiveRelay] Connection rejected: missing token')
      ws.close(4001, 'Token missing')
      return
    }

    let username = 'Player'
    try {
      const decoded = verifyToken(token)
      if (!decoded || !decoded.id) {
        ws.close(4001, 'Invalid token')
        return
      }
      username = decoded.username || 'Player'
    } catch (err) {
      console.warn('[GeminiLiveRelay] Connection rejected: token verification failed', err)
      ws.close(4001, 'Token invalid')
      return
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      console.error('[GeminiLiveRelay] Connection failed: GEMINI_API_KEY is not set')
      ws.close(4002, 'GEMINI_API_KEY not configured')
      return
    }

    // Connect to Gemini Live WebSocket API
    const geminiUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${apiKey}`
    const geminiWs = new WebSocket(geminiUrl)

    console.log(`[GeminiLiveRelay] Client connected for user "${username}". Relay connecting to Gemini Live API...`)

    geminiWs.on('open', () => {
      console.log(`[GeminiLiveRelay] Connected to Gemini Live API for user "${username}".`)

      // Automatically send initial setup if client hasn't sent one yet
      const initialSetup = {
        setup: {
          model: 'models/gemini-2.0-flash-exp',
          generationConfig: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: 'Aoede'
                }
              }
            }
          },
          systemInstruction: {
            parts: [
              {
                text: `You are Naenra AI Coach, a friendly, sharp, and encouraging personal tutor in the competitive typing arena Naenra.
Player username: "${username}".
Always respond naturally, concisely, and encouragingly in the language the player speaks (mostly Vietnamese or English). Keep responses brief and conversational (under 40 words) since they will be read aloud to the player in real-time.`
              }
            ]
          }
        }
      }
      geminiWs.send(JSON.stringify(initialSetup))
    })

    // Relay messages from client to Gemini
    ws.on('message', (data) => {
      if (geminiWs.readyState === WebSocket.OPEN) {
        try {
          const parsed = JSON.parse(data.toString())
          // If client sends explicit setup, inject system instruction with username
          if (parsed.setup) {
            parsed.setup.systemInstruction = {
              parts: [
                {
                  text: `You are Naenra AI Coach, a friendly, sharp, and encouraging personal tutor in the competitive typing arena Naenra.
Player username: "${username}".
Always respond naturally, concisely, and encouragingly. Keep spoken responses brief and conversational.`
                }
              ]
            }
            geminiWs.send(JSON.stringify(parsed))
          } else {
            geminiWs.send(data.toString())
          }
        } catch (e) {
          geminiWs.send(data.toString())
        }
      }
    })

    // Relay messages from Gemini to client
    geminiWs.on('message', (data) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(data.toString())
      }
    })

    // Error and Close handling
    geminiWs.on('error', (err) => {
      console.error(`[GeminiLiveRelay] Gemini WS Error (${username}):`, err)
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ error: 'Gemini Live Service Error' }))
      }
    })

    geminiWs.on('close', (code, reason) => {
      console.log(`[GeminiLiveRelay] Gemini WS Closed (${username}): ${code} ${reason}`)
      if (ws.readyState === WebSocket.OPEN) {
        ws.close(1000, 'Gemini connection closed')
      }
    })

    ws.on('error', (err) => {
      console.error(`[GeminiLiveRelay] Client WS Error (${username}):`, err)
      if (geminiWs.readyState === WebSocket.OPEN) {
        geminiWs.close()
      }
    })

    ws.on('close', () => {
      console.log(`[GeminiLiveRelay] Client disconnected (${username}).`)
      if (geminiWs.readyState === WebSocket.OPEN) {
        geminiWs.close()
      }
    })
  })

  console.log('[GeminiLiveRelay] Initialized on path /api/ai/live')
}

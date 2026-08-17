import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import dotenv from 'dotenv'
import authRoutes from './routes/authRoutes'
import userRoutes from './routes/userRoutes'
import gameRoutes from './routes/gameRoutes'
import aiRoutes from './routes/aiRoutes'
import adminRoutes from './routes/adminRoutes'
import rateLimit from 'express-rate-limit'
import { initQuestionCron } from './cron/questionCron'
import { initGuestCleanupCron } from './cron/guestCleanupCron'
import { Server } from 'colyseus'
import { WebSocketTransport } from '@colyseus/ws-transport'
import { MatchRoom } from './rooms/MatchRoom'
import { QueueRoom } from './rooms/QueueRoom'
import { setupAiLiveGateway } from './services/aiLiveGateway'

dotenv.config()

const app = express()
app.use(cors({
  origin: [
    'https://naenra.xyz',
    'https://www.naenra.xyz',
    'https://axonproject.onrender.com',
    'http://localhost:5173'
  ],
  credentials: true
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ limit: '10mb', extended: true }))

const httpServer = createServer(app)

app.get('/health', (_, res) => {
  res.json({ status: 'ok', message: 'ARENA.ENG server running' })
})

app.use('/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/game', gameRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/admin', adminRoutes)


httpServer.listen(3000, () => {
  console.log('Server running on port 3000')
})
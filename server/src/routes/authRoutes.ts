import { Router, Request, Response } from 'express'
import { createClient } from '@supabase/supabase-js'
import { generateToken } from '../utils/jwt'
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware'
import dotenv from 'dotenv'
dotenv.config()

const router = Router()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env')
}

const supabase = createClient(supabaseUrl, supabaseKey)

router.post('/token', async (req: Request, res: Response) => {
  const { supabase_token } = req.body

  if (!supabase_token) {
    res.status(401).json({ error: 'Unauthorized', message: 'Missing supabase token' })
    return
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(supabase_token)

    if (error || !user) {
      res.status(401).json({ error: 'Unauthorized', message: 'Invalid supabase token' })
      return
    }

    const { data: profile } = await supabase
      .from('players')
      .select('*')
      .eq('id', user.id)
      .single()

    const token = generateToken({
      id: user.id,
      email: user.email || '',
      username: profile?.username || user.email || ''
    })

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: profile?.username,
        avatar_url: profile?.avatar_url,
        elo: profile?.elo || 1000
      }
    })
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/me', authMiddleware, (req: AuthRequest, res: Response) => {
  res.json({ user: req.user })
})

export default router

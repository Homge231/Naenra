import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../utils/jwt'
import { supabase } from '../config/supabase'

export interface AuthRequest extends Request {
  user?: {
    id: string
    email: string
    username: string
    sessionVersion: number
  }
}

export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized', message: 'Missing or malformed token' })
    return
  }

  const token = authHeader.split(' ')[1]

  if (!token) {
    res.status(401).json({ error: 'Unauthorized', message: 'Token is missing' })
    return
  }

  try {
    const decoded = verifyToken(token)

    const { data: player, error } = await supabase
      .from('players')
      .select('session_version')
      .eq('id', decoded.id)
      .single()

    if (error || !player) {
      res.status(401).json({ error: 'Unauthorized', message: 'Account not found' })
      return
    }

    if (player.session_version !== decoded.sessionVersion) {
      res.status(401).json({ error: 'Unauthorized', message: 'Session expired due to login elsewhere' })
      return
    }

    req.user = decoded
    next()
  } catch (error: any) {
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
      res.status(401).json({ error: 'Unauthorized', message: 'Token is invalid or expired' })
      return
    }

    res.status(403).json({ error: 'Forbidden', message: 'Token verification failed' })
  }
}
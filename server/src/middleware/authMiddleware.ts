import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../utils/jwt'
import { supabase } from '../config/supabase'
import { touchUserActivity } from '../utils/activeClients'

export interface AuthRequest extends Request {
  user?: {
    id: string
    email: string
    username: string
    sessionVersion: number
    isGuest?: boolean
  }
}

const lastDbActivityUpdateMap = new Map<string, number>()

export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : ''

  if (!token) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Missing or malformed token'
    })
    return
  }

  try {
    const decoded = verifyToken(token)

    if (!decoded || !decoded.id) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid token payload'
      })
      return
    }

    // Touch in-memory activity tracking for real-time presence
    touchUserActivity(decoded.id)

    // Throttled DB updated_at update (at most once every 60s per user)
    const lastDbUpdate = lastDbActivityUpdateMap.get(decoded.id) || 0
    if (Date.now() - lastDbUpdate > 60000) {
      lastDbActivityUpdateMap.set(decoded.id, Date.now())
      void supabase
        .from('players')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', decoded.id)
    }

    if (decoded.isGuest) {
      if (typeof decoded.id === 'string' && decoded.id.startsWith('guest_')) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Stale guest token format. Please re-authenticate.'
        })
        return
      }

      // Ensure guest player exists in DB
      const { data: playerExists } = await supabase
        .from('players')
        .select('id')
        .eq('id', decoded.id)
        .maybeSingle()

      if (!playerExists) {
        await supabase.from('players').upsert({
          id: decoded.id,
          email: decoded.email || `${decoded.id}@guest.naenra.xyz`,
          username: decoded.username || 'Guest',
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(decoded.username || 'Guest')}`,
          elo: 1000,
          session_version: 0
        })
      }

      req.user = decoded
      next()
      return
    }

    const { data: player, error } = await supabase
      .from('players')
      .select('session_version, is_banned')
      .eq('id', decoded.id)
      .single()

    if (error || !player) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Account not found'
      })
      return
    }

    if (player.is_banned) {
      res.status(403).json({
        error: 'AccountBanned',
        message: 'Your account has been suspended by an administrator.'
      })
      return
    }

    // Treat tokens issued before sessionVersion was added as version 0.
    const tokenVersion = decoded.sessionVersion ?? 0
    const dbVersion    = player.session_version   ?? 0

    if (dbVersion !== 0 && tokenVersion !== dbVersion) {
      res.status(401).json({
        error: 'SessionInvalidated',
        message: 'Session expired due to login elsewhere'
      })
      return
    }

    req.user = decoded
    next()
  } catch (error: any) {
    if (
      error.name === 'TokenExpiredError' ||
      error.name === 'JsonWebTokenError'
    ) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Token is invalid or expired'
      })
      return
    }

    res.status(403).json({
      error: 'Forbidden',
      message: 'Token verification failed'
    })
  }
}
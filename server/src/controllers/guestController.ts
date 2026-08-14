import { Request, Response } from 'express'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { supabase } from '../config/supabase'
import { generateToken } from '../utils/jwt'
import { cleanupOldGuestAccounts } from '../utils/cleanupGuests'

const JWT_SECRET = process.env.JWT_SECRET || 'arena-eng-super-secret-jwt-key-2024'

export async function loginAsGuest(req: Request, res: Response): Promise<void> {
  try {
    const randomNumber = Math.floor(1000 + Math.random() * 9000)
    const guestEmail = `guest_${Date.now()}_${randomNumber}@guest.naenra.xyz`
    const guestPassword = `GuestPass_${crypto.randomBytes(8).toString('hex')}`
    const username = `Guest #${randomNumber}`
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`

    // Create authentic guest user in Supabase auth so UUID FK constraints pass across all tables
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: guestEmail,
      password: guestPassword,
      email_confirm: true,
      user_metadata: { is_guest: true, username }
    })

    if (authError || !authData.user) {
      console.error('Failed to create guest user in auth:', authError)
      throw new Error(authError?.message || 'Failed to create guest user in auth')
    }

    const guestId = authData.user.id

    // Register Guest in players table so foreign key references in game_sessions work seamlessly
    const { error: playerErr } = await supabase.from('players').upsert({
      id: guestId,
      email: guestEmail,
      username,
      avatar_url: avatarUrl,
      elo: 1000,
      session_version: 0
    })

    if (playerErr) {
      console.error('Error inserting guest into players:', playerErr)
    }

    const payload = {
      id: guestId,
      email: guestEmail,
      username,
      sessionVersion: 0,
      isGuest: true
    }

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })

    res.status(200).json({
      token,
      user: {
        id: guestId,
        username,
        email: guestEmail,
        isGuest: true,
        avatar_url: avatarUrl,
        elo: 1000
      }
    })
  } catch (error: any) {
    console.error('loginAsGuest error:', error)
    res.status(500).json({ error: 'InternalServerError', message: error.message })
  }
}

export async function convertGuest(req: Request, res: Response): Promise<void> {
  try {
    const { email, password, username } = req.body

    if (!email || !password || !username) {
      res.status(400).json({ error: 'BadRequest', message: 'Email, password, and username are required' })
      return
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } }
    })

    if (authError || !authData.user) {
      res.status(400).json({ error: 'ConversionFailed', message: authError?.message || 'Failed to create account' })
      return
    }

    const userId = authData.user.id
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`

    const { data: player, error: playerError } = await supabase
      .from('players')
      .upsert({
        id: userId,
        username,
        avatar_url: avatarUrl,
        elo: 1000,
        session_version: 1
      })
      .select()
      .single()

    if (playerError) {
      console.error('Error creating player during conversion:', playerError)
    }

    const token = generateToken({
      id: userId,
      email,
      username,
      sessionVersion: 1
    })

    res.status(200).json({
      token,
      user: {
        id: userId,
        email,
        username,
        avatar_url: avatarUrl,
        elo: 1000,
        isGuest: false
      }
    })
  } catch (error: any) {
    console.error('convertGuest error:', error)
    res.status(500).json({ error: 'InternalServerError', message: error.message })
  }
}

export async function cleanupGuests(req: Request, res: Response): Promise<void> {
  try {
    const days = req.body.days ? parseInt(req.body.days) : 3
    const result = await cleanupOldGuestAccounts(days)
    res.status(200).json({ message: `Successfully cleaned up ${result.deletedCount} old guest accounts older than ${days} days.`, deletedCount: result.deletedCount })
  } catch (error: any) {
    console.error('cleanupGuests error:', error)
    res.status(500).json({ error: 'InternalServerError', message: error.message })
  }
}

import { Router, Request, Response } from 'express'
import { generateToken } from '../utils/jwt'
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware'
import { generateOTP } from '../utils/otp'
import { sendOTPEmail } from '../utils/mailer'
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import dotenv from 'dotenv'
import { supabase } from '../config/supabase'
import { broadcastSessionInvalidated } from '../utils/realtimeBroadcast'
import { kickUserClients } from '../utils/activeClients'
import { loginAsGuest, convertGuest, cleanupGuests } from '../controllers/guestController'
dotenv.config()

const ENCRYPTION_KEY = crypto.createHash('sha256').update(process.env.SUPABASE_SERVICE_KEY || 'default-secret').digest()
const IV_LENGTH = 16

function encryptPassword(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return iv.toString('hex') + ':' + encrypted
}

function decryptPassword(text: string): string {
  try {
    const parts = text.split(':')
    const iv = Buffer.from(parts.shift()!, 'hex')
    const encryptedText = Buffer.from(parts.join(':'), 'hex')
    const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv)
    let decrypted = decipher.update(encryptedText, undefined, 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
  } catch (e) {
    return text // fallback for previously unencrypted testing rows
  }
}

const router = Router()

// ── Session helper ────────────────────────────────────────────────────────────

/**
 * Increment session version, kick old sessions, and generate a new arena JWT.
 * Used by both /auth/login (email) and /auth/token (OAuth) to avoid duplication.
 * Returns null and writes a 500 response if the version RPC fails.
 */
async function establishNewSession(
  res: Response,
  player: { id: string; email: string; username: string; is_admin?: boolean }
): Promise<{ token: string; newVersion: number } | null> {
  const { data: newVersion, error: versionError } = await supabase
    .rpc('increment_session_version', { player_id: player.id })

  if (versionError || newVersion == null) {
    console.error('session_version increment error:', versionError)
    res.status(500).json({ error: 'Failed to establish session' })
    return null
  }

  await broadcastSessionInvalidated(player.id, newVersion)
  kickUserClients(player.id)

  const token = generateToken({
    id: player.id,
    email: player.email,
    username: player.username,
    sessionVersion: newVersion,
    is_admin: Boolean(player.is_admin)
  })

  return { token, newVersion }
}

interface PendingAction {
  email: string
  hashedPassword?: string
  username?: string
  otp: string
  expiresAt: number
  type: 'register' | 'reset'
}

const pendingStore = new Map<string, PendingAction>()

function cleanupPendingStore() {
  const now = Date.now()
  for (const [key, value] of pendingStore.entries()) {
    if (value.expiresAt < now) {
      pendingStore.delete(key)
    }
  }
}

// ── Helper: check provider type from players table (fast, no admin API) ──────
async function getPlayerProviderInfo(email: string): Promise<{
  exists: boolean
  hasEmailAuth: boolean
  hasGoogleAuth: boolean
  playerId: string | null
}> {
  const { data: player } = await supabase
    .from('players')
    .select('id, hashed_password')
    .eq('email', email)
    .maybeSingle()

  if (!player) return { exists: false, hasEmailAuth: false, hasGoogleAuth: false, playerId: null }

  const hasEmailAuth = player.hashed_password !== '' && player.hashed_password !== null
  const hasGoogleAuth = !hasEmailAuth

  return { exists: true, hasEmailAuth, hasGoogleAuth, playerId: player.id }
}

// POST /auth/guest
router.post('/guest', loginAsGuest)

// POST /auth/convert-guest
router.post('/convert-guest', convertGuest)

// POST /auth/cleanup-guests
router.post('/cleanup-guests', cleanupGuests)

// POST /auth/register
router.post('/register', async (req: Request, res: Response) => {
  const { email, password, username } = req.body

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email || !emailRegex.test(email)) {
    res.status(400).json({ error: 'Invalid email format' })
    return
  }
  if (!password || password.length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters' })
    return
  }
  if (!username || username.trim().length === 0) {
    res.status(400).json({ error: 'Username is required' })
    return
  }

  try {
    const { exists, hasEmailAuth, hasGoogleAuth } = await getPlayerProviderInfo(email)

    if (exists && hasEmailAuth) {
      res.status(409).json({ error: 'Email already registered' })
      return
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    cleanupPendingStore()

    const otp = generateOTP()

    pendingStore.set(email, {
      email,
      hashedPassword,
      username,
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000,
      type: 'register'
    })

    await sendOTPEmail(email, otp)
    res.status(200).json({ message: 'OTP sent to your email', email })

  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// In-memory brute-force protection for OTP verification
const otpAttempts = new Map<string, { count: number; lockedUntil: number }>()

// POST /auth/verify-otp
router.post('/verify-otp', async (req: Request, res: Response) => {
  const { email, otp } = req.body

  if (!email || !otp) {
    res.status(400).json({ error: 'Email and OTP are required' })
    return
  }

  const record = otpAttempts.get(email)
  if (record && record.lockedUntil > Date.now()) {
    res.status(429).json({ error: 'Too many attempts. Please try again later.' })
    return
  }

  try {
    cleanupPendingStore()

    const pending = pendingStore.get(email)

    if (!pending || pending.type !== 'register') {
      res.status(400).json({ error: 'Registration session expired or not found. Please register again.' })
      return
    }

    if (pending.otp !== otp) {
      const attempts = (record?.count || 0) + 1
      if (attempts >= 5) {
        otpAttempts.set(email, { count: attempts, lockedUntil: Date.now() + 10 * 60 * 1000 })
        res.status(429).json({ error: 'Too many attempts. Please try again in 10 minutes.' })
      } else {
        otpAttempts.set(email, { count: attempts, lockedUntil: 0 })
        res.status(400).json({ error: 'Invalid or expired OTP' })
      }
      return
    }

    otpAttempts.delete(email)

    const { data: existingPlayer } = await supabase
      .from('players')
      .select('id, session_version')
      .eq('email', pending.email)
      .maybeSingle()

    let userId = ''
    let sessionVersion = 1

    if (existingPlayer) {
      userId = existingPlayer.id
      const { data: updatedPlayer, error: updateError } = await supabase
        .from('players')
        .update({ hashed_password: pending.hashedPassword })
        .eq('id', userId)
        .select('session_version')
        .single()
      
      if (updateError) {
        res.status(400).json({ error: 'Failed to link password: ' + updateError.message })
        return
      }
      sessionVersion = updatedPlayer.session_version
    } else {
      const tempPassword = Math.random().toString(36).slice(-10) + 'Aa1!'
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: pending.email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { full_name: pending.username }
      })

      if (authError) {
        console.error('AuthError:', authError.message)
        res.status(400).json({ error: authError.message })
        return
      }
      
      userId = authData.user.id

      // The database trigger automatically creates the row, so we just update it
      const { data: updatedPlayer, error: upsertError } = await supabase
        .from('players')
        .update({
          email: pending.email,
          username: pending.username,
          hashed_password: pending.hashedPassword,
          elo: 0,
          wins: 0,
          losses: 0,
          total_matches: 0,
          session_version: 0
        })
        .eq('id', userId)
        .select('session_version')
        .single()

      if (upsertError) {
        res.status(400).json({ error: 'Failed to initialize player profile: ' + upsertError.message })
        return
      }
      sessionVersion = updatedPlayer.session_version
    }

    pendingStore.delete(email)

    const token = generateToken({
      id: userId,
      email: pending.email || '',
      username: pending.username || '',
      sessionVersion: sessionVersion
    })

    res.status(201).json({
      message: 'Account verified successfully',
      token,
      user: {
        id: userId,
        email: pending.email,
        username: pending.username,
        elo: 0,
        session_version: sessionVersion
      }
    })

    // Also forcefully drop any existing Colyseus connections
    kickUserClients(userId)

  } catch (error) {
    console.error('verify-otp error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /auth/resend-otp
router.post('/resend-otp', async (req: Request, res: Response) => {
  const { email } = req.body

  if (!email) {
    res.status(400).json({ error: 'Email is required' })
    return
  }

  try {
    cleanupPendingStore()

    const pending = pendingStore.get(email)

    if (!pending) {
      res.status(400).json({ error: 'Session expired or not found' })
      return
    }

    const otp = generateOTP()

    pending.otp = otp
    pending.expiresAt = Date.now() + 10 * 60 * 1000
    pendingStore.set(email, pending)

    await sendOTPEmail(email, otp)
    res.json({ message: 'OTP resent successfully' })
  } catch {
    res.status(500).json({ error: 'Failed to send OTP' })
  }
})

// GET /auth/check-email
router.get('/check-email', async (req: Request, res: Response) => {
  const { email } = req.query

  if (!email || typeof email !== 'string') {
    res.status(400).json({ error: 'Email is required' })
    return
  }

  try {
    const { exists, hasEmailAuth, hasGoogleAuth } = await getPlayerProviderInfo(email)

    if (!exists) {
      res.json({ exists: false, provider: null })
      return
    }

    res.json({
      exists: true,
      provider: hasEmailAuth ? 'email' : 'google'
    })
  } catch {
    res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /auth/login
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email || !emailRegex.test(email)) {
    res.status(400).json({ error: 'Invalid email format' })
    return
  }
  if (!password || password.length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters' })
    return
  }

  try {
    const { exists, hasEmailAuth, hasGoogleAuth } = await getPlayerProviderInfo(email)

    if (exists && hasGoogleAuth && !hasEmailAuth) {
      res.status(401).json({ error: 'This email uses Google sign-in. To add a password, go to the Register tab first, then you can log in with either method.' })
      return
    }

    const { data: player } = await supabase
      .from('players')
      .select('id, email, username, avatar_url, hashed_password, is_first_play, elo, is_admin, is_banned')
      .eq('email', email)
      .single()

    if (!player || !player.hashed_password) {
      res.status(401).json({ error: 'Invalid email or password' })
      return
    }

    if (player.is_banned) {
      res.status(403).json({ error: 'Your account has been suspended by an administrator.' })
      return
    }

    const isValid = await bcrypt.compare(password, player.hashed_password)
    if (!isValid) {
      res.status(401).json({ error: 'Invalid email or password' })
      return
    }

    const session = await establishNewSession(res, player)
    if (!session) return

    res.json({
      message: 'Login successful',
      token: session.token,
      user: {
        id: player.id,
        email: player.email,
        username: player.username,
        avatar_url: player.avatar_url,
        elo: player.elo ?? 0,
        is_first_play: player.is_first_play ?? true,
        session_version: session.newVersion,
        is_admin: Boolean(player.is_admin)
      }
    })

  } catch (err) {
    console.error('login error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// In-memory brute-force protection for password reset OTP
const resetAttempts = new Map<string, { count: number; lockedUntil: number }>()

// POST /auth/forgot-password
router.post('/forgot-password', async (req: Request, res: Response) => {
  const { email } = req.body
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email || !emailRegex.test(email)) {
    res.status(400).json({ error: 'Valid email is required' })
    return
  }

  try {
    const { data: player } = await supabase
      .from('players')
      .select('id, hashed_password')
      .eq('email', email)
      .maybeSingle()

    // Always respond with success to prevent email enumeration
    if (!player) {
      res.json({ message: 'If that email exists, a reset code has been sent.' })
      return
    }

    if (!player.hashed_password) {
      // Google-only account — cannot reset a password they don't have
      res.status(400).json({ error: 'This account uses Google sign-in. Password reset is not available. Please use the Google button to log in.' })
      return
    }

    // Clean up expired reset rows
    cleanupPendingStore()

    const otp = generateOTP()

    pendingStore.set(email, {
      email,
      otp,
      expiresAt: Date.now() + 15 * 60 * 1000, // 15 mins
      type: 'reset'
    })

    await sendOTPEmail(email, otp)
    res.json({ message: 'If that email exists, a reset code has been sent.' })
  } catch (err) {
    console.error('forgot-password error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /auth/reset-password
router.post('/reset-password', async (req: Request, res: Response) => {
  const { email, otp, newPassword } = req.body

  if (!email || !otp || !newPassword) {
    res.status(400).json({ error: 'Email, OTP, and new password are required' })
    return
  }
  if (newPassword.length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters' })
    return
  }

  const record = resetAttempts.get(email)
  if (record && record.lockedUntil > Date.now()) {
    res.status(429).json({ error: 'Too many attempts. Please try again later.' })
    return
  }

  try {
    // Clean up expired
    cleanupPendingStore()

    const pending = pendingStore.get(email)

    if (!pending || pending.type !== 'reset') {
      res.status(400).json({ error: 'Reset code expired or not found. Please request a new one.' })
      return
    }

    if (pending.otp !== otp) {
      const attempts = (record?.count || 0) + 1
      if (attempts >= 5) {
        resetAttempts.set(email, { count: attempts, lockedUntil: Date.now() + 10 * 60 * 1000 })
        res.status(429).json({ error: 'Too many attempts. Please request a new reset code.' })
      } else {
        resetAttempts.set(email, { count: attempts, lockedUntil: 0 })
        res.status(400).json({ error: 'Invalid reset code' })
      }
      return
    }

    resetAttempts.delete(email)

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    const { error: updateError } = await supabase
      .from('players')
      .update({ hashed_password: hashedPassword })
      .eq('email', email)

    if (updateError) {
      console.error('Reset password update error:', updateError)
      res.status(500).json({ error: 'Failed to update password. Please try again.' })
      return
    }

    // Clean up the reset record
    pendingStore.delete(email)

    res.json({ message: 'Password updated successfully. You can now log in.' })
  } catch (err) {
    console.error('reset-password error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /auth/token  (Google OAuth → arena JWT)
router.post('/token', async (req: Request, res: Response) => {
  const { supabase_token } = req.body
  if (!supabase_token) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }
  try {
    const { data: { user }, error } = await supabase.auth.getUser(supabase_token)
    if (error || !user) {
      res.status(401).json({ error: 'Invalid token' })
      return
    }

    const { data: profile } = await supabase
      .from('players')
      .select('*, is_first_play')
      .eq('id', user.id)
      .single()

    if (!profile) {
      const { error: insertError } = await supabase.from('players').insert({
        id: user.id,
        email: user.email,
        username: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Player',
        hashed_password: '',
        avatar_url: user.user_metadata?.avatar_url || null,
        elo: 0,
        wins: 0,
        losses: 0,
        total_matches: 0,
        session_version: 0
      })
      if (insertError) {
        console.error('players insert error in /auth/token:', insertError)
        res.status(500).json({ error: 'Failed to provision player profile', detail: insertError.message })
        return
      }
    } else if (profile.hashed_password === '' && user.user_metadata?.avatar_url) {
      // Always sync the latest Google avatar URL on every OAuth login.
      // Google CDN URLs can change or expire, so we must update every time —
      // not just the first time — to prevent stale/broken avatars.
      await supabase
        .from('players')
        .update({ avatar_url: user.user_metadata.avatar_url })
        .eq('id', user.id)
    }

    const { data: freshProfile, error: freshError } = await supabase
      .from('players')
      .select('*')
      .eq('id', user.id)
      .single()

    if (freshError || !freshProfile) {
      console.error('players fetch error in /auth/token:', freshError)
      res.status(500).json({ error: 'Failed to load player profile' })
      return
    }

    if (freshProfile.is_banned) {
      res.status(403).json({ error: 'Your account has been suspended by an administrator.' })
      return
    }

    const session = await establishNewSession(res, {
      id: user.id,
      email: user.email || '',
      username: freshProfile.username || user.user_metadata?.full_name || '',
      is_admin: freshProfile.is_admin
    })
    if (!session) return

    res.json({ token: session.token, user: { ...freshProfile, session_version: session.newVersion, is_admin: Boolean(freshProfile.is_admin) } })
  } catch (err) {
    console.error('token error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /auth/me
router.get('/me', authMiddleware, (req: AuthRequest, res: Response) => {
  res.json({ user: req.user })
})

// GET /auth/profile  (legacy)
router.get('/profile', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { data: profile } = await supabase
    .from('players')
    .select('*')
    .eq('id', req.user!.id)
    .single()

  if (!profile) {
    res.status(404).json({ error: 'Profile not found' })
    return
  }

  res.json({ profile })
})

// POST /auth/skip-tutorial
router.post('/skip-tutorial', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { error } = await supabase
      .from('players')
      .update({ is_first_play: false })
      .eq('id', req.user!.id)

    if (error) {
      console.error('Failed to skip tutorial:', error)
      return res.status(500).json({ error: 'Failed to update preference' })
    }

    res.json({ message: 'Tutorial skipped permanently' })
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
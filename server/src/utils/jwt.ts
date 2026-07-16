import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

const jwtSecret = process.env.JWT_SECRET

if (!jwtSecret) {
  throw new Error('JWT_SECRET environment variable is required')
}

const JWT_SECRET: jwt.Secret = jwtSecret

export function generateToken(payload: {
  id: string
  email: string
  username: string
  sessionVersion: number
}): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): any {
  return jwt.verify(token, JWT_SECRET)
}

export function generateSignature(payload: any, expiresIn: string | number = '1h'): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: expiresIn as any })
}

export function verifySignature(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (err) {
    return null
  }
}
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'arena-eng-secret-key'

export function generateToken(payload: {
  id: string
  email: string
  username: string
}): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): any {
  return jwt.verify(token, JWT_SECRET)
}

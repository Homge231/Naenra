const otpStore = new Map<string, { otp: string; expiresAt: number; attempts: number }>()

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export function saveOTP(email: string, otp: string): void {
  otpStore.set(email, {
    otp,
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    attempts: 0
  })
}

export function verifyOTP(email: string, otp: string): boolean | { locked: true } {
  const record = otpStore.get(email)
  if (!record) return false
  
  if (record.attempts >= 5) {
    return { locked: true }
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(email)
    return false
  }

  if (record.otp !== otp) {
    record.attempts++
    if (record.attempts >= 5) {
      return { locked: true }
    }
    return false
  }
  
  otpStore.delete(email)
  return true
}

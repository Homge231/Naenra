import { supabase } from '../config/supabase'

export async function broadcastSessionInvalidated(userId: string, newVersion: number) {
  try {
    const channel = supabase.channel(`session-kick:${userId}`)
    await channel.send({
      type: 'broadcast',
      event: 'session_invalidated',
      payload: { session_version: newVersion }
    })
    await supabase.removeChannel(channel)
  } catch (err) {
    console.error('broadcastSessionInvalidated failed:', err)
  }
}
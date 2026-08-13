import { supabase } from '../config/supabase.js'

/**
 * Deletes guest accounts older than specified days to free up DB space and recycle resources.
 * @param daysOlderThan Number of days threshold (default: 3 days)
 */
export async function cleanupOldGuestAccounts(daysOlderThan = 3): Promise<{ deletedCount: number }> {
  try {
    const cutoffDate = new Date(Date.now() - daysOlderThan * 24 * 60 * 60 * 1000).toISOString()

    // 1. Fetch guest accounts created before the cutoff date
    const { data: oldGuests, error: fetchErr } = await supabase
      .from('players')
      .select('id, email, username')
      .ilike('email', '%@guest.naenra.xyz')
      .lt('created_at', cutoffDate)

    if (fetchErr) {
      console.error('[CleanupGuests] Error fetching old guests:', fetchErr)
      throw fetchErr
    }

    if (!oldGuests || oldGuests.length === 0) {
      console.log('[CleanupGuests] No old guest accounts to clean up.')
      return { deletedCount: 0 }
    }

    console.log(`[CleanupGuests] Found ${oldGuests.length} guest accounts older than ${daysOlderThan} days. Cleaning up...`)

    let count = 0
    for (const guest of oldGuests) {
      // Delete game sessions first to prevent FK constraint errors
      await supabase.from('game_sessions').delete().eq('player_id', guest.id)
      
      // Delete from players table
      await supabase.from('players').delete().eq('id', guest.id)

      // Delete from Supabase Auth
      const { error: authErr } = await supabase.auth.admin.deleteUser(guest.id)
      if (authErr) {
        console.warn(`[CleanupGuests] Could not delete auth user ${guest.id}:`, authErr.message)
      } else {
        count++
      }
    }

    console.log(`[CleanupGuests] Successfully recycled/deleted ${count} old guest accounts.`)
    return { deletedCount: count }
  } catch (error) {
    console.error('[CleanupGuests] Error during guest account cleanup:', error)
    throw error
  }
}

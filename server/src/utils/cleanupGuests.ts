import { supabase } from '../config/supabase'

/**
 * Deletes guest accounts older than specified days to free up DB space and recycle resources.
 * @param daysOlderThan Number of days threshold (default: 1 day = 24h)
 */
export async function cleanupOldGuestAccounts(daysOlderThan = 1): Promise<{ deletedCount: number }> {
  try {
    const cutoffMs = Date.now() - daysOlderThan * 24 * 60 * 60 * 1000

    // 1. Fetch all guest accounts from players table
    const { data: allGuests, error: fetchErr } = await supabase
      .from('players')
      .select('id, email, username, created_at')
      .ilike('email', '%@guest.naenra.xyz')

    if (fetchErr) {
      console.error('[CleanupGuests] Error fetching guests:', fetchErr)
      throw fetchErr
    }

    if (!allGuests || allGuests.length === 0) {
      console.log('[CleanupGuests] No guest accounts found in database.')
      return { deletedCount: 0 }
    }

    // Filter guests created before cutoff date using email timestamp or created_at column
    const oldGuests = allGuests.filter((guest: any) => {
      // 1. Extract millisecond timestamp from guest email: guest_<timestamp>_<rand>@guest.naenra.xyz
      const match = guest.email?.match(/^guest_(\d+)_/i)
      if (match && match[1]) {
        const timestamp = parseInt(match[1], 10)
        if (!isNaN(timestamp)) {
          return timestamp < cutoffMs
        }
      }

      // 2. Fallback to DB created_at column if present
      if (guest.created_at) {
        const dbTime = new Date(guest.created_at).getTime()
        if (!isNaN(dbTime)) {
          return dbTime < cutoffMs
        }
      }

      return false
    })

    if (oldGuests.length === 0) {
      console.log(`[CleanupGuests] No guest accounts older than ${daysOlderThan} day(s) to clean up. (Found ${allGuests.length} active guest(s) within retention window).`)
      return { deletedCount: 0 }
    }

    console.log(`[CleanupGuests] Found ${oldGuests.length} guest accounts older than ${daysOlderThan} day(s). Cleaning up...`)

    let count = 0
    for (const guest of oldGuests) {
      try {
        // Delete all dependent child records first to satisfy Foreign Key constraints
        await supabase.from('game_session_answers').delete().eq('player_id', guest.id)
        await supabase.from('game_sessions').delete().eq('player_id', guest.id)
        await supabase.from('user_vocab_stats').delete().eq('user_id', guest.id)
        await supabase.from('user_core_progress').delete().eq('user_id', guest.id)

        // Delete from public.players table
        const { error: playerErr } = await supabase.from('players').delete().eq('id', guest.id)
        if (playerErr) {
          console.warn(`[CleanupGuests] Could not delete DB player ${guest.id}:`, playerErr.message)
        }

        // Delete from Supabase Auth admin API
        const { error: authErr } = await supabase.auth.admin.deleteUser(guest.id)
        if (authErr) {
          console.warn(`[CleanupGuests] Could not delete auth user ${guest.id}:`, authErr.message)
        }

        count++
      } catch (err: any) {
        console.error(`[CleanupGuests] Error deleting guest ${guest.id}:`, err?.message || err)
      }
    }

    console.log(`[CleanupGuests] Successfully recycled/deleted ${count} old guest accounts.`)
    return { deletedCount: count }
  } catch (error) {
    console.error('[CleanupGuests] Error during guest account cleanup:', error)
    throw error
  }
}

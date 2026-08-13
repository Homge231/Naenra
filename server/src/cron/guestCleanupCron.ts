import cron from 'node-cron'
import { cleanupOldGuestAccounts } from '../utils/cleanupGuests.js'

export function initGuestCleanupCron() {
  // Run daily at 3:00 AM (0 3 * * *)
  cron.schedule('0 3 * * *', async () => {
    console.log('[GuestCleanupCron] Running daily guest account cleanup job...')
    try {
      const result = await cleanupOldGuestAccounts(3)
      console.log(`[GuestCleanupCron] Successfully cleaned up ${result.deletedCount} old guest accounts.`)
    } catch (err) {
      console.error('[GuestCleanupCron] Error during guest account cleanup:', err)
    }
  })

  // Run once on server startup after 10 seconds delay to clean up accumulated stale guests
  setTimeout(async () => {
    console.log('[GuestCleanupCron] Running startup check for old guest accounts...')
    try {
      await cleanupOldGuestAccounts(3)
    } catch (err) {
      console.error('[GuestCleanupCron] Startup guest cleanup error:', err)
    }
  }, 10000)
}

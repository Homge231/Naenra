/**
 * Hardcoded super-admin emails that always have admin access
 * regardless of the players.is_admin DB field.
 * This serves as a break-glass fallback during initial setup or DB issues.
 */
export const SUPER_ADMIN_EMAILS = new Set([
  'homge231@gmail.com',
  'baonhggcd220259@fpt.edu.vn'
])

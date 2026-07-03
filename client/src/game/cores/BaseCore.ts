// ── Frontend Core Module — Base Interface ─────────────────────────────────────
//
// HOW TO ADD A NEW CORE (frontend):
//   1. Add one entry to  client/src/game/cores/registry.ts
//   Done — GameplayView.vue never needs to be touched.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Describes everything the UI needs to know about an active core.
 * Add a new core by implementing this shape and registering it in registry.ts.
 */
export interface CoreModule {
  /** UUID that matches `cores.id` in Supabase. Use PENDING_UUID for unreleased cores. */
  id: string

  /** Display name — must match `cores.name` in Supabase (case-insensitive). */
  name: string

  // ── Timer display ──────────────────────────────────────────────────────────
  /** Tailwind color class applied to the timer digit + icon when this core is active. */
  timerColor: string
  /** CSS class(es) for the animated glow/pulse effect on the timer digit. */
  timerClass: string
  /** CSS class(es) for the animated glow/pulse effect on the timer icon. */
  timerIconClass: string

  // ── Score popup ────────────────────────────────────────────────────────────
  /**
   * Popup variant to show when this core scores a correct answer.
   * 'correct'   → standard green "+N PTS"
   * 'speedster' → cyan "+N FAST!" with shimmer animation
   * Add more variants in GameplayView's popup template as needed.
   */
  popupType: 'correct' | 'speedster'

  // ── Optional overlay ───────────────────────────────────────────────────────
  /**
   * When true, the wind-streak overlay is rendered around the letter slots.
   * Add more overlay types as needed.
   */
  showWindOverlay?: boolean
}

/** Sentinel value for cores that exist in the FE registry but not yet in Supabase. */
export const PENDING_UUID = 'PENDING'

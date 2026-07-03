import {
  BaseCore,
  BASE_POINTS,
  SPEEDSTER_MULTIPLIER,
  MATCH_DURATION_MS,
  ScoringContext,
  ScoringResult,
} from './BaseCore'

/**
 * Speedster Core  (US-17.1)
 *
 * Rewards players who answer quickly. The faster the answer, the higher the bonus.
 * Flat 100-point base is replaced entirely by a time-based formula.
 *
 * Formula:
 *   speedBonus = floor( (1 - timeTaken / totalTime) * SPEEDSTER_MULTIPLIER )
 *   total      = BASE_POINTS + speedBonus
 *
 * Examples (SPEEDSTER_MULTIPLIER = 200, totalTime = 60 000 ms):
 *   Answer in  1s  →  +197 bonus  → 297 pts
 *   Answer in 10s  →  +167 bonus  → 267 pts
 *   Answer in 30s  →  +100 bonus  → 200 pts
 *   Answer in 59s  →  +  3 bonus  → 103 pts
 *
 * The combo streak and flat_buff / multiplier_buff are intentionally ignored —
 * speed is the ONLY axis that matters for this core.
 */
export class SpeedsterCoreStrategy extends BaseCore {
  readonly coreName = 'speedster'

  calculateCorrect(ctx: ScoringContext): ScoringResult {
    const oraclePenalty = this._oraclePenalty(ctx)

    // Clamp timeTaken to [0, totalTime] to guard against clock drift or missing data
    const safeTotalTime = ctx.totalTime > 0 ? ctx.totalTime : MATCH_DURATION_MS
    const safeTaken     = Math.min(Math.max(ctx.timeTaken, 0), safeTotalTime)

    const speedRatio  = 1 - safeTaken / safeTotalTime          // 1.0 = instant, 0.0 = full time used
    const speedBonus  = Math.floor(speedRatio * SPEEDSTER_MULTIPLIER)
    const total       = BASE_POINTS + speedBonus - oraclePenalty

    return {
      pointsDelta: Math.max(0, total),  // never go negative on a correct answer
      breakdown: {
        base:            BASE_POINTS,
        combo_bonus:     0,             // Speedster ignores combo
        flat_buff:       0,             // Speedster ignores flat_buff
        multiplier_buff: 1,             // Speedster ignores multiplier_buff
        oracle_penalty:  oraclePenalty,
        penalty:         0,
        speed_bonus:     speedBonus,    // extra field surfaced in the response
        time_taken_ms:   ctx.timeTaken,
      },
    }
  }
}

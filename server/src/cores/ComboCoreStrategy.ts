import {
  BaseCore,
  BASE_POINTS,
  COMBO_BONUS_PER_STREAK,
  MAX_COMBO_BONUS,
  ScoringContext,
  ScoringResult,
} from './BaseCore'

/**
 * Combo Core
 *
 * Rewards players for maintaining an answer streak.
 * Formula: floor( (BASE + comboBonus + flat_buff) * multiplier_buff )
 *
 * comboBonus = min(combo * COMBO_BONUS_PER_STREAK, MAX_COMBO_BONUS)
 *   → combo 1  = +10, combo 5  = +50, combo 10+ = +100 (capped)
 */
export class ComboCoreStrategy extends BaseCore {
  readonly coreName = 'combo core'

  calculateCorrect(ctx: ScoringContext): ScoringResult {
    const oraclePenalty = this._oraclePenalty(ctx)
    const comboBonus    = Math.min(ctx.combo * COMBO_BONUS_PER_STREAK, MAX_COMBO_BONUS)
    const beforeMult    = BASE_POINTS + comboBonus + ctx.flatBuff
    const total         = Math.floor(beforeMult * ctx.multiplierBuff) - oraclePenalty

    return {
      pointsDelta: total,
      breakdown: {
        base:            BASE_POINTS,
        combo_bonus:     comboBonus,
        flat_buff:       ctx.flatBuff,
        multiplier_buff: ctx.multiplierBuff,
        oracle_penalty:  oraclePenalty,
        penalty:         0,
      },
    }
  }
}

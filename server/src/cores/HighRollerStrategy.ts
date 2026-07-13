import { BaseCore, ScoringContext, ScoringResult, BASE_POINTS } from './BaseCore'

export class HighRollerStrategy extends BaseCore {
  public readonly coreName: string
  private basePointsOverride: number

  constructor(
    coreName: string,
    basePointsOverride: number = BASE_POINTS
  ) {
    super()
    this.coreName = coreName
    this.basePointsOverride = basePointsOverride
  }

  calculateCorrect(ctx: ScoringContext): ScoringResult {
    const oraclePenalty = this._oraclePenalty(ctx)

    // Calculate base first
    const baseScore = Math.floor(
      (this.basePointsOverride + ctx.flatBuff) * ctx.multiplierBuff
    )
    
    // High Roller logic: 50% chance for 2x, 50% chance for 0.5x
    const isLucky = Math.random() < 0.5
    const multiplier = isLucky ? 2 : 0.5
    
    let finalScore = Math.floor(baseScore * multiplier)
    finalScore -= oraclePenalty

    // UI will use combo_bonus to represent the "gamble" outcome if we want to show it,
    // or we can just let it be baked into multiplier_buff visually.
    // For simplicity, we just adjust the final score.
    return {
      pointsDelta: finalScore,
      breakdown: {
        base: this.basePointsOverride,
        combo_bonus: 0, 
        flat_buff: ctx.flatBuff,
        multiplier_buff: ctx.multiplierBuff * multiplier, // Show the effective multiplier
        oracle_penalty: oraclePenalty,
        penalty: 0
      }
    }
  }

  calculateWrong(ctx: ScoringContext): ScoringResult {
    const oraclePenalty = this._oraclePenalty(ctx)
    const pointsDelta = -(ctx.wrongPenalty + oraclePenalty)

    return {
      pointsDelta,
      breakdown: {
        base: 0,
        combo_bonus: 0,
        flat_buff: 0,
        multiplier_buff: 0,
        oracle_penalty: oraclePenalty,
        penalty: ctx.wrongPenalty
      }
    }
  }
}

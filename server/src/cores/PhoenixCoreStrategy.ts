import { BaseCore, ScoringContext, ScoringResult, BASE_POINTS } from './BaseCore'

export class PhoenixCoreStrategy extends BaseCore {
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
    // Phoenix Core logic: +200 bonus points if the previous answer was wrong
    let phoenixBonus = 0
    if (ctx.answerHistory.length >= 2) {
      const previousAnswerWasCorrect = ctx.answerHistory[ctx.answerHistory.length - 2]
      if (!previousAnswerWasCorrect) {
        phoenixBonus = 200
      }
    }

    const oraclePenalty = this._oraclePenalty(ctx)
    let finalScore = Math.floor(
      (this.basePointsOverride + ctx.flatBuff + phoenixBonus) * ctx.multiplierBuff
    )
    finalScore -= oraclePenalty

    return {
      pointsDelta: finalScore,
      breakdown: {
        base: this.basePointsOverride,
        combo_bonus: phoenixBonus, // we hijack combo_bonus for the phoenix bonus to show in UI
        flat_buff: ctx.flatBuff,
        multiplier_buff: ctx.multiplierBuff,
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

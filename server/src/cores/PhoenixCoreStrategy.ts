import { BaseCore, ScoringContext, ScoringResult, getBasePoints } from './BaseCore'

/**
 * Phoenix Core Strategy (Rebirth / Accumulated Penalty Debt Recovery)
 *
 * Mechanic:
 * - Accumulates all lost penalty points from skipped/wrong answers into a debt pool.
 * - When the next answer is answered CORRECTLY, Phoenix recovers 100% of the accumulated
 *   penalty debt + awards base correct points (+ upgrade specific bonuses).
 */
export class PhoenixCoreStrategy extends BaseCore {
  public readonly coreName: string
  
  private debtBonusRate: number      // Extra bonus rate on top of recovered debt (e.g. 0.25 = +25% bonus)
  private nullifyPenaltyRate: number // Rate of wrong penalty nullified (e.g. 0.5 = 50% penalty, 1.0 = 0 penalty)
  private scalingPerMiss: number     // Multiplier added per miss (e.g. 0.5 or 1.0)
  private maxMultiplier: number      // Cap for scaling multiplier (e.g. 3.0 or 5.0)
  private extraFlatBonus: number     // Extra flat bonus on rebirth (e.g. +50, +100, +150)

  constructor(
    coreName: string,
    debtBonusRate: number = 0,
    nullifyPenaltyRate: number = 0,
    scalingPerMiss: number = 0,
    maxMultiplier: number = 0,
    extraFlatBonus: number = 0
  ) {
    super()
    this.coreName = coreName.toLowerCase()
    this.debtBonusRate = debtBonusRate
    this.nullifyPenaltyRate = nullifyPenaltyRate
    this.scalingPerMiss = scalingPerMiss
    this.maxMultiplier = maxMultiplier
    this.extraFlatBonus = extraFlatBonus
  }

  private getAccumulatedDebt(history: boolean[], deltas?: number[]): { missCount: number, debt: number } {
    let missCount = 0
    let debt = 0

    // history contains current answer at index history.length - 1 (which is true for calculateCorrect)
    // Inspect previous answers starting from history.length - 2 downwards
    for (let i = history.length - 2; i >= 0; i--) {
      if (history[i] === false) {
        missCount++
        if (deltas && typeof deltas[i] === 'number') {
          debt += Math.abs(deltas[i])
        } else {
          // Fallback if deltas not provided: estimate 50 pts per miss
          debt += 50
        }
      } else {
        // Stop counting at the first previous correct answer
        break
      }
    }

    return { missCount, debt }
  }

  calculateCorrect(ctx: ScoringContext): ScoringResult {
    const { missCount, debt } = this.getAccumulatedDebt(ctx.answerHistory, ctx.answerHistoryDeltas)
    const basePts = getBasePoints(ctx.targetWord)
    const oraclePenalty = this._oraclePenalty(ctx)

    let dynamicMult = ctx.multiplierBuff
    if (this.scalingPerMiss > 0 && missCount > 0) {
      dynamicMult += missCount * this.scalingPerMiss
      if (this.maxMultiplier > 0 && dynamicMult > this.maxMultiplier) {
        dynamicMult = this.maxMultiplier
      }
    }

    // Recover 100% accumulated debt + bonus rate on debt + extra flat rebirth bonus
    const debtBonus = debt > 0 ? Math.floor(debt * this.debtBonusRate) : 0
    const totalDebtRefund = debt + debtBonus
    const rebirthFlat = missCount > 0 ? this.extraFlatBonus : 0

    let finalScore = Math.floor((basePts + ctx.flatBuff + rebirthFlat + totalDebtRefund) * dynamicMult) - oraclePenalty

    return {
      pointsDelta: Math.max(0, finalScore),
      breakdown: {
        base: basePts,
        combo_bonus: totalDebtRefund + rebirthFlat,
        flat_buff: ctx.flatBuff,
        multiplier_buff: dynamicMult,
        oracle_penalty: oraclePenalty,
        penalty: 0,
        phoenix_debt_refund: totalDebtRefund,
        phoenix_miss_count: missCount
      }
    }
  }

  calculateWrong(ctx: ScoringContext): ScoringResult {
    const oraclePenalty = this._oraclePenalty(ctx)
    // Reduce wrong penalty by nullifyPenaltyRate
    const penaltyRatio = Math.max(0, 1 - this.nullifyPenaltyRate)
    const appliedPenalty = Math.floor(ctx.wrongPenalty * penaltyRatio)
    const pointsDelta = -(appliedPenalty + oraclePenalty)

    return {
      pointsDelta,
      breakdown: {
        base: 0,
        combo_bonus: 0,
        flat_buff: 0,
        multiplier_buff: 0,
        oracle_penalty: oraclePenalty,
        penalty: appliedPenalty
      }
    }
  }
}

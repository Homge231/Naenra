import {
  BaseCore,
  getBasePoints,
  ScoringContext,
  ScoringResult,
} from './BaseCore'

/**
 * Pandora's Box Core (Fallback)
 *
 * Pandora's Box is a meta-core. The frontend is responsible for shape-shifting
 * the active core and submitting the *shifted* core ID to the server.
 * 
 * However, if the player manages to submit an answer BEFORE the very first shift
 * occurs on the frontend, the server will receive the raw Pandora's Box core ID.
 * This strategy exists to handle that edge case gracefully and provide base points.
 */
export class PandoraCoreStrategy extends BaseCore {
  readonly coreName: string;

  constructor(name: string = "pandora's box") {
    super()
    this.coreName = name.toLowerCase()
  }

  // Fallback if Pandora is somehow run directly
  calculateCorrect(ctx: ScoringContext): ScoringResult {
    const oraclePenalty = this._oraclePenalty(ctx)
    const beforeMult = getBasePoints(ctx.targetWord) + ctx.flatBuff
    const total      = Math.floor(beforeMult * ctx.multiplierBuff) - oraclePenalty

    return {
      pointsDelta: total,
      breakdown: {
        base:            getBasePoints(ctx.targetWord),
        combo_bonus:     0,
        flat_buff:       ctx.flatBuff,
        multiplier_buff: ctx.multiplierBuff,
        oracle_penalty:  oraclePenalty,
        penalty:         0,
      },
    }
  }

  // Meta-core modifier applied on top of the secondary core's result
  applyModifiers(result: ScoringResult, isCorrect: boolean, ctx: ScoringContext, answer: string): ScoringResult {
    const newResult = { ...result, breakdown: { ...result.breakdown } }

    // Base Pandora's Box Buff (US-84 Pandora Hybrid Exception)
    if (this.coreName === "pandora's box" && isCorrect) {
      const chaosBonus = Math.floor(Math.random() * 201) + 150 // +150 to +350 pts
      newResult.pointsDelta += chaosBonus
      newResult.breakdown.flat_buff = (newResult.breakdown.flat_buff || 0) + chaosBonus
    }

    if (this.coreName === "trickster's glass") {
      if (!isCorrect) {
        // Trickster's Glass: 100% immunity on wrong answers and skips
        newResult.pointsDelta = 0
        newResult.breakdown.penalty = 0
        newResult.breakdown.oracle_penalty = 0
        newResult.forgiveMistake = true
      } else {
        newResult.pointsDelta = Math.floor(newResult.pointsDelta * 1.5)
      }
    }

    if (this.coreName === 'chaos theory' && isCorrect) {
      const chaosPts = Math.floor(Math.random() * 601) + 200 // +200 to +800 pts
      newResult.pointsDelta += chaosPts
      newResult.breakdown.flat_buff = (newResult.breakdown.flat_buff || 0) + chaosPts
    }

    if (this.coreName === 'butterfly effect' && isCorrect) {
      const bonusMult = 1.2 + (ctx.combo * 0.20)
      newResult.pointsDelta = Math.floor(newResult.pointsDelta * bonusMult)
      newResult.breakdown.multiplier_buff = (newResult.breakdown.multiplier_buff || 1) * bonusMult
    }

    if (this.coreName === 'cosmic entropy' && isCorrect) {
      const randMult = 1.5 + Math.random() * 4.5 // 1.5x to 6.0x
      newResult.pointsDelta = Math.floor(newResult.pointsDelta * randMult)
      newResult.breakdown.multiplier_buff = (newResult.breakdown.multiplier_buff || 1) * randMult
    }

    if (this.coreName === 'reality collapse' && isCorrect) {
      const isDoubled = Math.random() > 0.4
      const factor = isDoubled ? 3.0 : 1.0
      newResult.pointsDelta = Math.floor(newResult.pointsDelta * factor)
      newResult.breakdown.multiplier_buff = (newResult.breakdown.multiplier_buff || 1) * factor
    }

    if (this.coreName === "pandora's curse") {
      if (isCorrect) newResult.pointsDelta = Math.floor(newResult.pointsDelta * 3.0)
      else newResult.pointsDelta = 0
    }

    if (this.coreName === "pandora's mirror") {
      if (!isCorrect && newResult.pointsDelta < 0) {
        // Reflects all typos/wrong answers as positive points
        newResult.pointsDelta = Math.abs(newResult.pointsDelta)
      }
    }

    if (this.coreName === 'chaos prism') {
      if (isCorrect) newResult.pointsDelta += 200
    }

    if (this.coreName === 'warp reality') {
      if (isCorrect) newResult.pointsDelta = Math.floor(newResult.pointsDelta * 2.0)
    }

    if (this.coreName === "pandora's wrath") {
      if (isCorrect) {
        newResult.pointsDelta += 800
        newResult.breakdown.flat_buff = (newResult.breakdown.flat_buff || 0) + 800
      } else {
        newResult.pointsDelta = 0
        newResult.breakdown.penalty = 0
        newResult.breakdown.oracle_penalty = 0
      }
    }

    // Wild Card (T2): Random bonus +100~+500, negates penalty 50% of the time
    if (this.coreName === 'wild card') {
      if (isCorrect) {
        const wildBonus = Math.floor(Math.random() * 401) + 100 // +100 to +500
        newResult.pointsDelta += wildBonus
        newResult.breakdown.flat_buff = (newResult.breakdown.flat_buff || 0) + wildBonus
      } else if (Math.random() > 0.5) {
        newResult.pointsDelta = 0
        newResult.breakdown.penalty = 0
      }
    }

    // Pandora Overdrive (T3): Extreme chaos — correct: x1.5~x4.0 random, wrong: always forgiven
    if (this.coreName === 'pandora overdrive') {
      if (isCorrect) {
        const overdriveMult = 1.5 + Math.random() * 2.5 // 1.5x to 4.0x
        newResult.pointsDelta = Math.floor(newResult.pointsDelta * overdriveMult)
        newResult.breakdown.multiplier_buff = (newResult.breakdown.multiplier_buff || 1) * overdriveMult
      } else {
        // Pandora Overdrive forgives ALL wrong answers
        newResult.pointsDelta = 0
        newResult.breakdown.penalty = 0
        newResult.breakdown.oracle_penalty = 0
        newResult.forgiveMistake = true
      }
    }

    return newResult
  }
}

# Naenra (ARENA.ENG) Centralized Game Knowledge Base

This document details all game rules, core parameters, scoring calculations, match flow, synergies, and unlock conditions for Naenra (live at naenra.xyz). It serves as the single source of truth for the AI Cyber Assistant to prevent hallucinations.

---

## 1. Match Flow & Game Loop
* **Rounds**: Each match consists of **3 rounds** (Single-player) or **4 rounds** (Multiplayer).
* **Round Duration**: Standard rounds last **60 seconds**.
* **Core Selection**: Players have a **15-second phase** before each round to choose a Support Core.
* **Race Mode (Round 4)**: Active in multiplayer. Enabled via Colyseus v0.17+ 1v1 mechanics where players compete in real-time to complete a set number of words first.

---

## 2. Core Scoring & Formulas

### 2.1 Base Word Scoring
Base points are determined by target word length:
* **Length 1–5**: 100 points
* **Length 6–7**: 125 points
* **Length 8–9**: 150 points
* **Length 10–11**: 175 points
* **Length 12+**: 200 points

### 2.2 Standard Scoring Formula
* **Correct**: `Total Points = floor((Base + ComboBonus + FlatBuff) * MultiplierBuff) - OraclePenalty`
* **Incorrect**: Standard Levenshtein penalty applies.
* **Combo Bonus**: `min(combo_streak * 10, 100)`. Max combo bonus cap is `+100` (starts at +10 for streak = 1).

### 2.3 Levenshtein Penalty Rules
* **High Accuracy (≥80%)**: `penalty = distance * 2`
* **Low Accuracy (<80%) or Skip**: `penalty = clamp(distance * 10, 10 to 50)`

---

## 3. Support Core Families (65 Total Cores across 10 Families)

### 3.1 Combo Core Family
Multiplies score based on consecutive correct streaks.
* **Perfect Combo / Combo Core** (Tier 1): Tracks consecutive correct answers. Each combo level adds bonus points, capped at +100.
* **Radiant Combo** (Tier 2): Each combo level adds bonus points, capped at +200.
* **Combo Burst** (Tier 2): Reaching a 5-streak releases a point burst of +300 points (1.2x multiplier).
* **Combo Multiplier** (Tier 2): Score multiplier increases by +0.1x per combo stack, capped at +1.0x multiplier.
* **Combo Focus** (Tier 2): Correct answers during combo give +10 points per combo level, but wrong answers subtract 30 points.
* **Combo Time** (Tier 2): Correct answers during a combo streak add +1 second to the match timer.
* **Combo Shield** (Tier 2): Earn +1 Aegis Shield stack for every 3 combo streak.
* **Prismatic Combo** (Tier 3): Max cap +300 points per combo. Correct answers trigger explosive VFX.
* **Golden Combo** (Tier 3): Double all combo streak bonus points. Capped at +500 points.
* **Hyper Combo** (Tier 3): Maintaining a 10-streak doubles all streak bonus points (Max +600 PTS, 2.0x multiplier).
* **Super Combo** (Tier 3): Correct answers while combo is 5+ receive a 2.5x score multiplier.
* **Chain Lightning** (Tier 3): Maintaining a 5-streak automatically reveals the next target word with no score penalty.
* **Combo Mastery** (Tier 3): Complete a round with zero wrong answers or skips to receive a massive +1500 points.

### 3.2 Speedster Core Family
Time-based score and timer manipulation.
* **Speedster** (Tier 1): Answer faster to earn exponentially more points. Every second counts.
* **Time Warp** (Tier 2): Answer faster for exponential points. Adds +2 seconds to the timer for every correct answer.
* **Velocity Shield** (Tier 2): Answering in under 2.5s generates 1 protective shield stack (1.2x multiplier).
* **Speed Shield** (Tier 2): Quick reflexes. Answering in under 3 seconds grants +1 Aegis Shield stack (max 3).
* **Mach Speed** (Tier 2): Supersonic pace. Answering in under 2 seconds awards double points.
* **Overdrive** (Tier 2): Timer counts down 20% faster, but all correct answers yield a 2.0x multiplier.
* **Speed Demon** (Tier 2): Answer in under 1.5 seconds to add +3 seconds to the match timer.
* **Hyperdrive** (Tier 3): Hyperspeed typing quadruples time-taken speed bonus points (2.5x multiplier).
* **Time Freeze** (Tier 3): Answering correctly pauses the game timer for 1 second.
* **Chronobreak** (Tier 3): Inherits Time Warp. Maintaining a 3-streak pauses the match timer for 3 seconds.
* **Warp Speed** (Tier 3): Unleash hyperspace velocity. Time-based speed bonus points are tripled.
* **Grand Prix** (Tier 3): Complete the match with an average time of less than 3s per question for +2000 points.
* **Sonic Boom** (Tier 3): Speed bonus points are quadrupled if the question is solved in under 1 second.

### 3.3 Oracle / Argus Eyes Core Family
Reveals letter slots and hints.
* **Argus Eyes** (Tier 1): Reveals hints for target words. Correct answers earn 50% fewer points.
* **Clairvoyance** (Tier 2): Reveals hints for target words. You earn 100% of points (no penalty).
* **Inner Eye** (Tier 2): Oracle hints are free and automatically reveal target word length.
* **Third Eye** (Tier 2): Oracle hints are free. Automatically reveals the first letter of the target word.
* **Mind Reader** (Tier 3): Oracle hints are free. Automatically reveals the first 2 letters of the target word.
* **Prophecy** (Tier 3): Oracle prophecy reveals target word category and first letter (1.5x multiplier).
* **Cosmic Wisdom** (Tier 3): Oracle hints are free. Correct answers with no hints used award a 2.0x points multiplier.
* **Omniscience** (Tier 3): Oracle hints are free. Automatically reveals the first letter, and timer ticks 20% slower.
* **Predictive Strike** (Tier 3): Oracle hints are free. Solving a word with all 3 hints revealed awards +300 points.

### 3.4 Aegis Core Family
Defensive shield capabilities. Mistakes consume 1 shield instead of losing points.
* **Aegis Shield** (Tier 1): Safety net. Correct answers stack shields (Max 3). Mistakes consume 1 shield instead of losing points.
* **Reflective Aegis** (Tier 2): Stacks shields (Max 3). Mistakes consume 1 shield and grant +50 points instead of losing points.
* **Reflective Barrier** (Tier 2): Consuming a shield reflects mistake penalties and grants +100 bonus points (1.2x multiplier).
* **Bastion of Light** (Tier 3): Stacks shields (Max 5). When at maximum shields, all points earned are doubled.
* **Aegis Sanctuary** (Tier 3): Generates 1 free Aegis Shield every 3 correct answers (Max 5 shields, 1.5x multiplier).

### 3.5 Mission Core Family
Streak targets and milestone bounties.
* **Mission Impossible / Mission Core** (Tier 1): Answer 5 questions correctly in a row for a massive +500 point bonus.
* **Contract Hunter** (Tier 2): Completing a 4-streak target mission awards +800 flat bonus points.
* **Bounty Hunter** (Tier 2): Answer 5 questions correctly in a row for a massive +1000 point bonus.
* **Mission Specialist** (Tier 3): Completing any three separate 4-streaks of correct answers awards +4000 points (+800 flat).
* **Mission Legend** (Tier 3): Completing an 8-streak mission awards a massive +4000 flat bonus points.
* **Bounty Overlord** (Tier 3): Completing a 5-streak of correct answers awards +3000 points (+1500 flat).
* **Apex Predator** (Tier 3): Target acquired. Solving the longest word of the round awards +2000 points (+800 flat).
* **Exodia** (Tier 3): Answer 10 questions correctly in a row for +5000 points and trigger a camera shake (+1500 flat).

### 3.6 Phoenix Core Family
Penalty debt accumulation and comeback rebirths.
* **Phoenix** (Tier 1): Accumulates all lost penalty points from skipped/wrong answers into a debt pool. Answering next question correctly refunds 100% of accumulated debt + base points.
* **Ashes to Ashes** (Tier 2): Refunds 100% of accumulated penalty debt + gains +0.4x score multiplier per miss (Max 2.6x).
* **Solar Ember** (Tier 2): Consumes 1 mistake penalty and converts it into +100 flat bonus points on next correct answer.
* **Feather Shield** (Tier 2): Recovering from a mistake grants 1 protective Aegis Shield stack.
* **Eternal Rebirth** (Tier 3): Refunds 100% of accumulated penalty debt + 25% extra debt bonus + 150 flat rebirth points + grants 2 protective Aegis Shields upon rebirth.
* **Supernova Ashes** (Tier 3): Refunds 100% of accumulated penalty debt + 25% extra debt bonus + gains +0.8x score multiplier per miss (Max 4.2x) + 100 flat rebirth points.
* **Immortal Phoenix** (Tier 3): Refunds 100% of accumulated penalty debt + 50% extra debt bonus + 150 flat rebirth points on next correct answer.
* **Blazing Resurrection** (Tier 3): Refunds 100% of mistake debt + grants 2.0x score multiplier on the next 3 consecutive correct answers (+150 flat).
* **Phoenix Overlord** (Tier 3): Restores full score momentum on mistake recovery and extends match timer by +3 seconds (+200 flat, 1.5x multiplier).

### 3.7 High Roller Core Family
Gamble scoring multipliers and high-stakes payouts.
* **High Roller** (Tier 1): Every correct answer has a 50% chance to grant 2x points, and a 50% chance to grant 0.5x points.
* **Safe Bet** (Tier 2): 80% chance to grant 1.5x points, and a 20% chance to grant 0.5x points.
* **Double or Nothing** (Tier 2): 50% chance to grant 2x points. 50% chance to grant 0 points.
* **Jackpot** (Tier 2): 30% chance to grant 3x points, and a 70% chance to grant 0.5x points.
* **High Stakes** (Tier 2): 60% chance to grant 2.5x points, 40% chance to deduct 20 points on wrong answer (2.0x multiplier).
* **Lucky Seven** (Tier 2): Every 7th correct answer triggers a guaranteed 3.0x score multiplier (+100 flat, 1.5x multiplier).
* **House Advantage** (Tier 3): 70% chance to grant 2x points, and a 30% chance to grant 0.5x points.
* **All In** (Tier 3): 10% chance to grant 10x points, and a 90% chance to grant 0.1x points.
* **Russian Roulette** (Tier 3): 16.6% chance to grant 12x points. 83.4% chance to grant 0 points.
* **Royal Flush** (Tier 3): Maintaining a 5-streak in gamble mode triggers a massive +2000 flat jackpot!
* **Casino Empire** (Tier 3): 80% chance for 2.0x multiplier and immunizes gamble losses on streak (+300 flat, 2.0x multiplier).

### 3.8 Power Core Family
Pure raw score multipliers with heavier risk penalties.
* **Power Strike / Power Core** (Tier 1): 1.5x multiplier on every score calculation.
* **Overclock** (Tier 2): 2.0x multiplier on every score calculation.
* **Overcharge** (Tier 2): Pushes score multiplier to 2.2x on sub-3-second answers.
* **Power Surge** (Tier 2): Surging energy. 2.0x multiplier, and wrong answers deduct double points.
* **Brute Force** (Tier 2): Raw power. 2.0x multiplier, but wrong answers subtract 50 points.
* **Overload** (Tier 2): 2.0x multiplier, but mistakes lock typing board input for 2 seconds.
* **Hypercharge** (Tier 2): Unleash raw power. 2.0x multiplier, but the match timer runs 15% faster.
* **Cataclysm** (Tier 3): Cataclysmic power granting 3.5x multiplier on correct answers.
* **Supernova** (Tier 3): Star-shattering power. 2.5x multiplier on correct answers.
* **Gigawatt** (Tier 3): Insane power. 2.5x multiplier, but match duration is reduced by 15 seconds.
* **Supermassive** (Tier 3): Grants a massive 2.5x multiplier, but mistakes deduct 200 points.
* **Desperado** (Tier 3): All-or-nothing. 2.5x multiplier, but a single wrong answer ends the match.
* **Absolute Power** (Tier 3): Grants a 2.5x multiplier, but mistakes subtract 100 points.

### 3.9 Balanced Core Family
Equilibrium scoring, mistake forgiveness, and steady pace.
* **Balance / Balanced Core** (Tier 1): 1.0x multiplier. Basic balanced core (+50 flat).
* **Harmony** (Tier 2): 1.0x multiplier. Harmony in play (+50 flat).
* **Zen Momentum** (Tier 2): Steady pace increases score multiplier by +0.1x per correct answer (Max 1.8x, 1.4x multiplier).
* **Yin Yang** (Tier 2): Harmony in play. Mistakes deduct only 5 points.
* **Steady Pace** (Tier 2): Correct answers add +1 second to the timer.
* **Harmony Wave** (Tier 2): Mistakes do not subtract points for the next 2 errors.
* **Equilibrium** (Tier 2): Both correct and incorrect answers score closer to average.
* **Serenity** (Tier 3): Complete immunity to mistake penalties + awards +100 flat points per answer (1.5x multiplier).
* **Zenith** (Tier 3): Reaching a peak. Standard scoring.
* **Nirvana** (Tier 3): Wrong answers do not break your combo streaks.
* **Cosmic Balance** (Tier 3): Wrong answers deduct a flat 10 points.
* **Universal Harmony** (Tier 3): Wrong answers cost only 10 points.
* **Perfect Harmony** (Tier 3): Mistakes are completely forgiven (0 points lost, +50 flat).

### 3.10 Pandora Core Family
Chaotic shape-shifting core.
* **Pandora's Box** (Tier 1): Shape-shifts every 25 seconds into Main (Tier 1) cores.
* **Trickster's Glass** (Tier 2): Shape-shifts every 20 seconds. Skipping a question (submitting empty) no longer deducts any points.
* **Wild Card** (Tier 2): Shape-shifts every 15s. 50% chance to grant +200 flat points per answer.
* **Pandora Overdrive** (Tier 3): Shape-shifts every 10s. Every correct answer triggers a random multiplier between 1.5x and 3.5x (2.5x multiplier).
* **Chaos Theory** (Tier 3): Shape-shifts every 15 seconds. Every correct answer grants a random bonus between +100 and +500 points.
* **Pandora's Wrath** (Tier 3): Shape-shifts every 15 seconds into Main (Tier 1) cores. Correct answers give +500 flat points, wrong answers give 0 (+200 flat).

---

## 4. ELO Rank Tiers
* **Bronze I–III**: 0–1499 ELO
* **Silver I–III**: 1500–2999 ELO
* **Gold I–III**: 3000–4499 ELO
* **Platinum I–III**: 4500–5999 ELO
* **Diamond I–III**: 6000–7499 ELO
* **Master**: 7500–7999 ELO
* **Grandmaster**: 8000+ ELO

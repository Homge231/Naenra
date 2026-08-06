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

## 3. Support Core Families (40+ Cores)

### 3.1 Combo Core Family
Multiplies score based on consecutive correct streaks.
* **Perfect Combo / Combo Core** (Tier 1): Standard combo bonus (max +100). Unlock: Default.
* **Radiant Combo** (Tier 2): Capped at +200 combo bonus. Unlock: Max Combo 5.
* **Prismatic Combo** (Tier 3): Capped at +300 combo bonus. Unlock: Max Combo 15.
* **Golden Combo** (Tier 3): Capped at +500 combo bonus; bonus per streak is +20 instead of +10. Unlock: 150 correct words.
* **Combo Focus** (Tier 2): Bonus per streak is +10, but incorrect answers add an extra `-30` points penalty. Unlock: Max Combo 12.
* **Combo Time** (Tier 2): Adds `+1s` to match timer for correct answers during combo (streak ≥ 1). Unlock: 5 matches played.
* **Combo Multiplier** (Tier 2): Adds `min(streak * 0.1, 1.0)` to the active multiplier. Unlock: 40 correct words.
* **Combo Shield** (Tier 2): Grants `+1 Aegis Shield` stack for every 3 combo streak. Unlock: Max Combo 8.
* **Super Combo** (Tier 3): Multiplies active multiplier by `2.5x` when combo streak is 4+. Unlock: Max Combo 25.

### 3.2 Speedster Core Family
Time-based score adjustments. Replaces combo bonus and flat/multiplier buffs entirely.
* **Speedster** (Tier 1): `speedBonus = max(0, floor((1 - timeTaken / 8000) * 140))`. Unlock: Default.
* **Time Warp** (Tier 2): Adds `+2s` to the match timer on correct answers. Unlock: 30 fast words (<3s).
* **Speed Shield** (Tier 2): Grants `+1 Aegis Shield` on correct. Incorrect consumes shield instead of points. Unlock: 4 matches played.
* **Mach Speed** (Tier 2): Doubles points (`baseTotal * 2`) if answer speed is under 2s. Unlock: 60 correct words.
* **Overdrive** (Tier 2): Doubles base points (`baseTotal * 2`) for all correct answers. Unlock: Max Combo 10 at high speed.
* **Time Freeze** (Tier 3): Pauses the match timer for `1s` on correct answers. Unlock: 15 speedster matches.
* **Warp Speed** (Tier 3): Triples speed bonus (`speedBonus * 3`). Unlock: Max Combo 20 fast words.
* **Grand Prix** (Tier 3): Standard speedster core. Unlock: 20 matches completed.
* **Speed Demon** (Tier 2): Adds `+3s` to the match timer if answer speed is under 1.5s. Unlock: 8 matches played.
* **Sonic Boom** (Tier 3): Multiplies speed bonus by `4x` if answered under 1s. Correct gives `+5s * combo` timer (cap +30s); incorrect deducts `-5s`. Unlock: 200 correct fast words.
* **Chronobreak** (Tier 3): Pauses the match timer for `3s` on every 3rd combo streak. Unlock: 100 correct fast words.

### 3.3 Oracle Core Family
Reveals letters slots.
* **Argus Eyes / Oracle Core** (Tier 1): Standard hint reveals (L1 = -10, L2 = -30, L3 = -60 pts). Unlock: Default.
* **Clairvoyance** (Tier 2): Forgives all oracle hint penalties entirely (0 pts cost). Unlock: 25 words with hints.
* **Future Sight** (Tier 2): Correct answer in under 4 seconds grants `+50` flat points. Unlock: 50 words with hints.
* **Cosmic Wisdom** (Tier 3): Doubles active multiplier (`2.0x`) if no hints are used. Unlock: 150 correct words.
* **Oracle Blessing** (Tier 2): Grants `1.5x` active multiplier if no hints are used. Unlock: 7 matches played.
* **Predictive Strike** (Tier 3): Grants `+300` bonus points if all 3 hints are revealed. Unlock: 10 matches played.

### 3.4 Aegis Core Family
Defensive shield capabilities. Mistake consumes 1 shield instead of losing points. Correct answers stack shields (Max 3).
* **Aegis Shield** (Tier 1): Standard shield absorption (Max 3). Unlock: Default.
* **Reflective Aegis** (Tier 2): Grants `+50` points when a shield block is triggered. Unlock: 5 mistake blocks.
* **Spiked Shield** (Tier 3): Grants `+200` points when a shield block is triggered. Unlock: 10 matches played.
* **Bastion of Light** (Tier 3): Max shields capacity increased to `5`. Doubles active multiplier (`2.0x`) when at maximum shields. Unlock: 20 mistake blocks.
* **Indomitable** (Tier 3): Increases active multiplier by `+15%` (`+0.15`) per active shield stack. Unlock: Max Combo 20.
* **Aegis Nova** (Tier 3): Earning a shield stack at maximum capacity triggers an explosion of `+500` points. Unlock: 100 correct words.
* **Guardian Angel** (Tier 3): Earning a shield stack at maximum capacity adds `+10s` to the match timer. Unlock: 15 matches played.
* **Shield Burst** (Tier 2): Correct answers while maximum shields are active grant `+100` points. Unlock: 50 correct words.
* **Shield Synergy** (Tier 2): Correct answers while maximum shields are active grant `+50` points. Unlock: Max Combo 10.

### 3.5 Mission Core Family
Streak targets and bounties.
* **Mission Impossible / Mission Core** (Tier 1): Grants `+500` points bounty every 5 consecutive correct answers. Unlock: Default.
* **Bounty Hunter / Exodia / Bounty Overlord** (Tier 2/3): Every 5 consecutive correct answers yields a flat bounty. Unlock: 35 target missions / 100 mission targets / 10 matches.
* **Daily Quest / Apex Predator / Swift Mission / Mission Master** (Tier 2/3): Every 3 consecutive correct answers yields a bounty. Unlock: 5 matches / Max Combo 18 / Max Combo 10 / 20 matches.
* **Time Mission** (Tier 2): Every 5 consecutive correct answers yields flat bounty and `+10s` match timer. Unlock: 50 mission objectives.
* **Swift Mission** (Tier 2): Every 3 consecutive correct answers yields bounty, but streak resets to 0 if any answer takes >4s. Unlock: Max Combo 10.
* **Mission Master** (Tier 3): Every 3 consecutive correct answers gives a bounty. Streak = 3 gives `+1000` points. Streak = 6 gives `+3000` points. Unlock: 20 matches.
* **Shield Mission** (Tier 2): Every 3 consecutive correct answers grants a max capacity shield stack. Streak does not break on incorrect if protected by shield. Unlock: 3 mistake blocks.

### 3.6 Phoenix Core Family
Accumulated Penalty Debt comeback. Low-risk, easy to use, so overall refund yields are lower.
* **Phoenix** (Tier 1): Accumulates wrong penalties into a debt pool. Rebirth correct answer refunds `30%` of debt. Unlock: Default.
* **Phoenix Flame** (Tier 2): Refunds `40%` of accumulated debt (`30% base + 10% bonus`) and grants `+15` flat points. Unlock: 3 matches played.
* **Rebirth** (Tier 2): Refunds `30%` of debt, grants `+20` flat points, and grants `1 Aegis Shield` upon rebirth. Unlock: 30 momentum recoveries.
* **Ashes to Ashes** (Tier 2): Refunds `30%` of debt and adds `+15%` (`+0.15`) multiplier per accumulated miss (cap 1.6x). Unlock: 6 matches played.
* **Immortal Phoenix** (Tier 3): Refunds `50%` of accumulated debt (`30% base + 20% bonus`) and grants `+40` flat points. Unlock: Max Combo 12.
* **Eternal Rebirth** (Tier 3): Refunds `40%` of debt, grants `+40` flat points, and grants `2 Aegis Shields` upon rebirth. Unlock: 80 correct rebirth words.
* **Supernova Ashes** (Tier 3): Refunds `40%` of debt, grants `+30` flat points, and adds `+30%` (`+0.3`) multiplier per accumulated miss (cap 2.2x). Unlock: Max Combo 18.

### 3.7 High Roller Core Family
Gamble scoring multipliers on correct answers. High risk, high variance, so payouts are buffed to incentivize risk.
* **High Roller** (Tier 1): 50% chance for `2.2x` score, 50% chance for `0.5x` score. Unlock: Default.
* **Jackpot** (Tier 2): 30% chance for `3.5x` score, 70% chance for `0.5x` score. Unlock: 3 matches played.
* **Safe Bet** (Tier 2): 80% chance for `1.5x` score, 20% chance for `0.5x` score. Unlock: 30 gamble words.
* **Double or Nothing** (Tier 2): 50% chance for `2.4x` score, 50% chance for `0x` score (0 points). Unlock: 6 matches played.
* **All In** (Tier 3): 10% chance for `12.0x` score, 90% chance for `0.1x` score. Unlock: Max Combo 10 while gambling.
* **House Advantage** (Tier 3): 70% chance for `2.2x` score, 30% chance for `0.5x` score. Unlock: 80 gamble words.
* **Russian Roulette** (Tier 3): 16.6% (1/6) chance for `15.0x` score, 83.3% chance for `0x` score. Unlock: Max Combo 15.

### 3.8 Power Core Family
Pure raw score output. Heavier incorrect penalties.
* **Power Strike / Power Core** (Tier 1): Standard scoring, standard `1.0x` penalty. Unlock: Default.
* **Overclock / Hypercharge / Power Surge / Brute Force / Overload / Overcharge** (Tier 2): Standard scoring, `2.0x` incorrect penalty.
  * *Brute Force*: Incorrect penalty is fixed at `-50` points. Unlock: 60 correct words.
  * *Overload*: Incorrect answer locks player input for `2s` (`2000ms`). Unlock: 8 matches played.
* **Supernova / Gigawatt / Desperado / Absolute Power / Supermassive / Cataclysm** (Tier 3): Standard scoring, `3.0x` incorrect penalty.
  * *Absolute Power*: Incorrect penalty is fixed at `-100` points. Unlock: 200 correct words.
  * *Supermassive*: Incorrect penalty is fixed at `-200` points. Unlock: Max Combo 25.
  * *Desperado*: Incorrect answer deducts `-999s` from the match timer (Instantly ends the match). Unlock: 12 matches played.

### 3.9 Balanced Core Family
Stable score scaling and mistake forgiveness.
* **Balance / Balanced Core** (Tier 1): Steady equilibrium scaling. Unlock: Default.
* **Zenith** (Tier 3): Correct answer gives a fixed `+300` points. Incorrect penalty is a fixed `-30` points. Unlock: 10 matches played.
* **Equilibrium** (Tier 2): Correct answer gives `70%` of normal score. Incorrect penalty is `30%` of normal penalty. Unlock: 40 correct words.
* **Steady Pace** (Tier 2): Correct answer grants `+1s` to the match timer. Unlock: 6 matches played.
* **Yin Yang** (Tier 2): Incorrect penalty is fixed at `-5` points. Unlock: Max Combo 7.
* **Cosmic Balance** (Tier 3): Incorrect penalty is fixed at `-10` points. Unlock: 15 matches played.
* **Harmony Wave** (Tier 2): The first 2 incorrect answers in a match have `0` penalty and do not break combo. Unlock: 80 correct words.
* **Nirvana** (Tier 3): Incorrect answers do not break the combo streak. Unlock: 150 correct words.
* **Universal Harmony / Perfect Harmony** (Tier 3): Complete immunity to incorrect penalties (`0` penalty points). Unlock: Max Combo 20.

### 3.10 Pandora Core Family
Chaotic shape-shifter meta-core. Modifies the result of the shifted core.
* **Pandora's Box** (Tier 1): Fallback. Unlock: Default.
* **Trickster's Glass** (Tier 2): Skipped answers (empty submission) yield `0` penalty. Unlock: 3 matches played.
* **Chaos Prism** (Tier 2): Correct answers add `+80` flat points. Unlock: 30 words under chaos.
* **Warp Reality** (Tier 2): Correct answers are multiplied by `1.75x`. Unlock: 6 matches played.
* **Pandora's Curse** (Tier 2): Correct answers score `2.5x` points. Incorrect answers penalty is doubled (`-2x`). Unlock: Max Combo 8.
* **Pandora's Mirror** (Tier 2): Typing errors (excluding skips) are converted to positive points. Unlock: 70 correct words under chaos.
* **Chaos Theory** (Tier 3): Correct answers add a random `+100` to `+500` points. Unlock: Max Combo 15.
* **Butterfly Effect** (Tier 3): Correct answers are multiplied by `1 + (streak * 0.15)`. Unlock: 10 matches played.
* **Cosmic Entropy** (Tier 3): Correct answers are multiplied by a random `1.0x` to `5.0x` multiplier. Unlock: 15 matches played.
* **Reality Collapse** (Tier 3): Correct answers are multiplied by `2.5x` (50% chance) or `0.5x` (50% chance). Unlock: Max Combo 20.
* **Pandora's Wrath** (Tier 3): Correct answers grant `+600` points. Incorrect answers grant `0` points (forgiving penalty). Unlock: 120 words.
* **Wild Card / Pandora Overdrive** (Tier 2/3): Core shape-shifting. Unlock: 40 words / Max Combo 15.

---

## 4. ELO Rank Tiers
* **Bronze I–III**: 0–1499 ELO
* **Silver I–III**: 1500–2999 ELO
* **Gold I–III**: 3000–4499 ELO
* **Platinum I–III**: 4500–5999 ELO
* **Diamond I–III**: 6000–7499 ELO
* **Master**: 7500–7999 ELO
* **Grandmaster**: 8000+ ELO

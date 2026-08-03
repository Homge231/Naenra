<template>
  <div class="min-h-screen w-full bg-[#fff8f5] text-gray-800 relative font-sans selection:bg-orange/50 flex flex-col">
    
    <!-- Background Ambient Animations -->
    <div class="fixed inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center">
      <div class="absolute top-[-10%] left-[-5%] w-[50vw] h-[50vw] bg-orange/20 rounded-full mix-blend-multiply blur-[100px] animate-float-slow"></div>
      <div class="absolute bottom-[-10%] right-[-5%] w-[45vw] h-[45vw] bg-hexred/10 rounded-full mix-blend-multiply blur-[100px] animate-float-delayed"></div>
      <div class="absolute top-[30%] left-[60%] w-[30vw] h-[30vw] bg-lightBlue/20 rounded-full mix-blend-multiply blur-[80px] animate-pulse-slow"></div>
      
      <div v-for="letter in floatingLetters" :key="letter.id"
        class="absolute top-0 font-black uppercase text-gray-300 select-none animate-matrix-drift opacity-40"
        :style="{ left: letter.left + '%', fontSize: letter.size + 'rem', animationDelay: letter.delay + 's', animationDuration: letter.duration + 's' }">
        {{ letter.char }}
      </div>
    </div>

    <!-- Header Navigation -->
    <header class="relative z-30 w-full px-6 md:px-12 pt-8 pb-4 flex justify-between items-center">
      <button @click="router.push('/library')" class="flex items-center gap-3 group bg-white/60 backdrop-blur-md px-5 py-3 rounded-2xl shadow-sm border border-white/50 active:scale-95 transition-all hover:bg-orange-50 cursor-pointer">
        <svg class="w-6 h-6 text-gray-500 group-hover:text-orange transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M15 19l-7-7 7-7"></path></svg>
        <span class="font-black tracking-widest text-sm text-gray-600 group-hover:text-orange uppercase transition-colors">Back to Library</span>
      </button>
    </header>

    <div class="relative z-20 w-full max-w-[1400px] mx-auto flex flex-col flex-1 pb-16">

      <!-- Loading State -->
      <div v-if="loading" class="w-full flex justify-center py-24 flex-1 items-center">
        <svg class="animate-spin w-12 h-12 text-orange" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>

      <!-- Main Detail Layout -->
      <main v-else-if="baseCore" class="w-full px-6 md:px-12 py-4 flex flex-col gap-12">
        
        <!-- Base Core Showcase Banner -->
        <div class="flex flex-col md:flex-row gap-8 items-center md:items-start bg-white/80 backdrop-blur-xl border-2 border-white rounded-[2.5rem] p-8 md:p-10 shadow-sm w-full">
          <div class="w-32 h-32 md:w-40 md:h-40 rounded-3xl p-[3px] shadow-md bg-gradient-to-br from-orange to-hexred flex-shrink-0">
            <div class="w-full h-full bg-white rounded-[21px] flex items-center justify-center overflow-hidden">
              <img 
                :src="resolveIcon(baseCore)" 
                :alt="baseCore.name" 
                @error="onImgError"
                class="w-full h-full object-contain drop-shadow-sm p-2 rounded-[21px]" 
              />
            </div>
          </div>
          
          <div class="flex-1 text-center md:text-left flex flex-col justify-center">
            <div class="inline-flex items-center gap-2 bg-orange/10 border border-orange/30 px-3.5 py-1 rounded-full w-max mx-auto md:mx-0 mb-4">
              <span class="w-2 h-2 rounded-full bg-orange animate-pulse"></span>
              <span class="text-[10px] font-black tracking-widest text-orange uppercase">Base Core - Round 1</span>
            </div>
            <h1 class="text-4xl md:text-6xl font-black text-gray-900 uppercase tracking-tight mb-4 drop-shadow-sm">
              {{ baseCore.name }}
            </h1>
            <p class="text-gray-600 font-semibold text-base md:text-lg max-w-3xl leading-relaxed">
              {{ baseCore.description || baseCore.desc || 'Base tactical core providing fundamental scoring mechanics for typing matches.' }}
            </p>
          </div>
        </div>

        <!-- Upgrade Path / Evolution Section -->
        <div class="w-full">
          <div class="flex items-center gap-4 mb-8">
            <h3 class="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-wide">Evolution Paths</h3>
            <div class="h-1 flex-1 bg-gradient-to-r from-gray-200 to-transparent rounded-full"></div>
          </div>

          <div v-if="upgrades.length === 0" class="text-center py-12 bg-white/40 rounded-3xl border border-white/60">
            <p class="text-gray-400 font-black uppercase tracking-widest">No upgrade evolutions found for this core.</p>
          </div>

          <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            
            <!-- Upgrade Card -->
            <div 
              v-for="upgrade in upgrades" 
              :key="upgrade.id"
              @mouseenter="showTooltip($event, upgrade)"
              @mouseleave="hideTooltip"
              @touchstart="showTooltip($event, upgrade)"
              @touchend="hideTooltip"
              class="group bg-white/80 backdrop-blur-xl border-2 border-white rounded-[2rem] p-7 shadow-sm hover:shadow-[0_15px_30px_rgba(0,0,0,0.08)] transform transition-all duration-300 hover:-translate-y-2 flex flex-col h-full cursor-help relative overflow-hidden"
            >
              <!-- Tier Badge -->
              <div :class="[
                'absolute top-5 right-5 text-[10px] font-black px-3 py-1 rounded-full tracking-widest uppercase shadow-sm border',
                upgrade.computedTier === 3 ? 'bg-hexred/10 border-hexred/30 text-hexred' : 'bg-orange/10 border-orange/30 text-orange'
              ]">
                Round {{ upgrade.computedTier || 2 }}
              </div>

              <!-- Icon -->
              <div class="w-16 h-16 rounded-2xl p-[3px] shadow-sm bg-gradient-to-br from-orange to-hexred mb-6 group-hover:scale-110 transition-transform origin-left flex-shrink-0">
                <div class="w-full h-full bg-white rounded-[14px] flex items-center justify-center overflow-hidden">
                  <img 
                    :src="resolveIcon(upgrade)" 
                    :alt="upgrade.name" 
                    @error="onImgError"
                    class="w-10 h-10 object-contain drop-shadow-sm group-hover:rotate-6 transition-transform duration-300" 
                  />
                </div>
              </div>

              <!-- Info -->
              <div class="flex-1 flex flex-col">
                <h4 class="text-xl font-black text-gray-900 uppercase tracking-wide mb-2 group-hover:text-orange transition-colors">
                  {{ upgrade.name }}
                </h4>
                
                <div class="w-12 h-1 bg-gray-200 rounded-full mb-4 group-hover:w-20 group-hover:bg-orange transition-all duration-300"></div>

                <p class="text-sm font-bold text-gray-500 leading-relaxed flex-1">
                  {{ getCoreDescription(upgrade) }}
                </p>
                
                <div class="mt-6 text-[10px] font-black text-lightBlue tracking-widest uppercase flex items-center gap-1.5 opacity-70 group-hover:opacity-100 transition-opacity">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Hover for details
                </div>
              </div>
            </div>

          </div>
        </div>

      </main>
      
      <!-- Core Not Found Error -->
      <div v-else class="w-full flex-1 flex flex-col justify-center items-center py-20">
        <div class="w-24 h-24 mb-6 text-gray-300">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
        <h2 class="text-3xl font-black text-gray-400 uppercase tracking-widest">Core Not Found</h2>
        <p class="text-gray-500 mt-2 font-semibold">The selected core could not be retrieved from the server.</p>
        <button @click="router.push('/library')" class="mt-6 px-6 py-2 bg-orange text-white rounded-full font-bold uppercase tracking-wider text-sm hover:bg-orange/90 cursor-pointer">
            Return to Library
        </button>
      </div>
    </div>

    <!-- Hover Tooltip Container -->
    <div 
      v-if="isTooltipVisible && hoveredCore"
      class="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full pb-4"
      :style="{ top: tooltipY + 'px', left: tooltipX + 'px' }"
    >
      <CoreTooltip :core="formattedTooltipCore" />
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { audioService } from '../services/audioService'
import CoreTooltip from '../components/game/CoreTooltip.vue'

const route = useRoute()
const router = useRouter()
const coreId = route.params.id

const loading = ref(true)
const baseCore = ref<any>(null)
const upgrades = ref<any[]>([])

const isTooltipVisible = ref(false)
const hoveredCore = ref<any>(null)
const tooltipX = ref(0)
const tooltipY = ref(0)

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'

// ── RICH CORE DETAILS MAPPING FOR ALL FAMILIES ────────────────────────────
const CORE_DETAILS_MAP: Record<string, { description: string; multiplier_buff?: number; flat_buff?: number; tier?: number; classification?: string }> = {
  // Aegis Family
  'aegis shield': { description: 'Safety net. Correct answers stack shields (Max 3). Mistakes consume 1 shield instead of losing points.', tier: 1, classification: 'Defense' },
  'reflective aegis': { description: 'Reflects mistake penalties back as bonus points while active shield absorbs the error.', multiplier_buff: 1.2, tier: 2, classification: 'Defense' },
  'shield battery': { description: 'Expanded battery capacity allowing up to 4 mistake shields.', tier: 2, classification: 'Defense' },
  'fortress aegis': { description: 'Fortified defense providing maximum mistake absorption with higher point preservation.', tier: 2, classification: 'Defense' },
  'shield synergy': { description: 'Shield regeneration speeds up with every streak milestone.', tier: 2, classification: 'Defense' },
  'shield burst': { description: 'Consuming a shield triggers a shockwave that awards bonus points.', flat_buff: 150, tier: 2, classification: 'Defense' },
  'bastion of light': { description: 'Ultimate Aegis evolution. Max 5 shields, error reflection, and automatic shield restoration.', multiplier_buff: 1.5, tier: 3, classification: 'Defense' },
  'spiked shield': { description: 'Spiked defense that punishes mistakes with high point reflection.', multiplier_buff: 1.3, tier: 3, classification: 'Defense' },
  'indomitable': { description: 'Unstoppable shield barrier that prevents all combo breaks on mistakes.', tier: 3, classification: 'Defense' },
  'aegis nova': { description: 'Releasing stored shield charges in a massive point burst.', flat_buff: 300, tier: 3, classification: 'Defense' },
  'guardian angel': { description: 'Grants a revive shield that protects score against sudden failures.', tier: 3, classification: 'Defense' },

  // Combo Family
  'perfect combo': { description: 'Grants bonus points for consecutive correct words. Streaks multiply score exponentially.', multiplier_buff: 1.2, tier: 1, classification: 'Attack' },
  'radiant combo': { description: 'Emits radiant energy, doubling combo bonus gains on 5+ word streaks.', multiplier_buff: 1.5, tier: 2, classification: 'Attack' },
  'combo shield': { description: 'Protects your current word streak from breaking on a single typo.', multiplier_buff: 1.2, tier: 2, classification: 'Defense' },
  'combo time': { description: 'Extends time limit slightly with every 10-word combo milestone.', multiplier_buff: 1.3, tier: 2, classification: 'Attack' },
  'combo multiplier': { description: 'Escalates point multiplier rapidly as combo streak increases.', multiplier_buff: 1.8, tier: 2, classification: 'Attack' },
  'combo focus': { description: 'Sharpens focus, lowering streak requirements for maximum bonus.', multiplier_buff: 1.4, tier: 2, classification: 'Attack' },
  'prismatic combo': { description: 'Prismatic streak aura converting high combos into massive point surges.', multiplier_buff: 2.5, tier: 3, classification: 'Attack' },
  'golden combo': { description: 'Golden touch awarding massive flat point bonuses on 15+ combo streaks.', multiplier_buff: 3.0, flat_buff: 500, tier: 3, classification: 'Attack' },
  'chain lightning': { description: 'Chain reactions where typing speed multiplies streak rewards.', multiplier_buff: 2.0, tier: 3, classification: 'Attack' },
  'combo mastery': { description: 'Mastery over combo mechanics, sustaining streak bonuses longer.', multiplier_buff: 2.2, tier: 3, classification: 'Attack' },
  'super combo': { description: 'Supercharged combo engine unlocking maximum score multipliers.', multiplier_buff: 2.8, tier: 3, classification: 'Attack' },

  // Speedster Family
  'speedster': { description: 'Rewarding fast typing. Faster time-taken per answer increases point gains.', multiplier_buff: 1.2, tier: 1, classification: 'Attack' },
  'time warp': { description: 'Distorts time, giving extra bonus score for sub-2-second answers.', multiplier_buff: 1.5, tier: 2, classification: 'Economy' },
  'speed shield': { description: 'Fast typing generates protective shields against occasional errors.', multiplier_buff: 1.2, tier: 2, classification: 'Defense' },
  'mach speed': { description: 'Reaching supersonic typing speed unlocks 2.0x point multiplier.', multiplier_buff: 2.0, tier: 2, classification: 'Attack' },
  'overdrive': { description: 'Pushes typing output into overdrive with escalating speed bonuses.', multiplier_buff: 1.8, tier: 2, classification: 'Attack' },
  'speed demon': { description: 'Demon speed boost converting rapid keystrokes into raw points.', multiplier_buff: 1.6, tier: 2, classification: 'Attack' },
  'chronobreak': { description: 'Bends timeline to refund lost seconds on quick recovery.', multiplier_buff: 2.2, tier: 3, classification: 'Economy' },
  'time freeze': { description: 'Freezes match timer briefly during fast typing bursts.', multiplier_buff: 2.5, tier: 3, classification: 'Economy' },
  'warp speed': { description: 'Warp velocity typing delivering top-tier multiplier multipliers.', multiplier_buff: 3.0, tier: 3, classification: 'Attack' },
  'grand prix': { description: 'Competitive speed racing mode providing big streak payouts.', multiplier_buff: 2.4, tier: 3, classification: 'Economy' },
  'sonic boom': { description: 'Shockwave explosion on rapid answers yielding instant score spikes.', multiplier_buff: 2.8, tier: 3, classification: 'Attack' },

  // Oracle Family
  'argus eyes': { description: 'All-seeing vision. Reveals partial word letters and hints.', tier: 1, classification: 'Economy' },
  'clairvoyance': { description: 'Foresight that highlights target word length and letter positions.', tier: 2, classification: 'Economy' },
  'third eye': { description: 'Third eye sight revealing additional word clues.', tier: 2, classification: 'Economy' },
  'future sight': { description: 'Previews upcoming word topics and patterns.', tier: 2, classification: 'Economy' },
  'divine guidance': { description: 'Divine aura reducing penalties for partial spelling mistakes.', tier: 2, classification: 'Economy' },
  'oracle blessing': { description: 'Blessing of wisdom increasing point yields on hinted words.', tier: 2, classification: 'Economy' },
  'omniscience': { description: 'Complete omniscience revealing full word structures automatically.', tier: 3, classification: 'Economy' },
  'mind reader': { description: 'Reads word solutions ahead of time for instant recognition.', tier: 3, classification: 'Economy' },
  'predictive strike': { description: 'Predictive accuracy converting revealed letters into point multipliers.', multiplier_buff: 2.0, tier: 3, classification: 'Attack' },
  'cosmic wisdom': { description: 'Cosmic insight maximizing score for complex vocabulary.', tier: 3, classification: 'Economy' },
  'divine eye': { description: 'Ultimate divine eye revealing letter positions instantly.', tier: 3, classification: 'Economy' },

  // Mission Family
  'mission impossible': { description: 'Tactical objectives. Complete target word missions to earn large point bounties.', flat_buff: 200, tier: 1, classification: 'Economy' },
  'bounty hunter': { description: 'Hunts high-value target words for double mission bounties.', flat_buff: 350, tier: 2, classification: 'Economy' },
  'daily quest': { description: 'Short-term mission objectives rewarding consistent accuracy.', flat_buff: 250, tier: 2, classification: 'Economy' },
  'shield mission': { description: 'Completing mission goals grants bonus mistake shields.', tier: 2, classification: 'Defense' },
  'time mission': { description: 'Mission completion rewards extra match time.', tier: 2, classification: 'Economy' },
  'swift mission': { description: 'Fast mission completion yields instant score multipliers.', multiplier_buff: 1.5, tier: 2, classification: 'Attack' },
  'exodia': { description: 'Assembling all 5 mission pieces unlocks massive Exodia point surge!', flat_buff: 1000, tier: 3, classification: 'Economy' },
  'bounty overlord': { description: 'Overlord bounty system maximizing mission payout rewards.', flat_buff: 600, tier: 3, classification: 'Economy' },
  'apex predator': { description: 'Dominates missions with lethal accuracy and top point rewards.', multiplier_buff: 2.5, tier: 3, classification: 'Attack' },
  'mission specialist': { description: 'Specialist efficiency lowering mission completion requirements.', tier: 3, classification: 'Economy' },
  'mission master': { description: 'Mastery over tactical missions for infinite bounty stacking.', flat_buff: 800, tier: 3, classification: 'Economy' },

  // Power Family
  'power strike': { description: 'High risk, high reward. 1.5x points on correct answers, but double mistake penalty.', multiplier_buff: 1.5, tier: 1, classification: 'Attack' },
  'overclock': { description: 'Overclocks point output to 2.0x multiplier with increased error risk.', multiplier_buff: 2.0, tier: 2, classification: 'Attack' },
  'hypercharge': { description: 'Hypercharges points per word while increasing penalty intensity.', multiplier_buff: 2.2, tier: 2, classification: 'Attack' },
  'power surge': { description: 'Surge of raw power boosting high-speed answers.', multiplier_buff: 2.0, tier: 2, classification: 'Attack' },
  'brute force': { description: 'Brute force scoring ignoring minor penalties on close answers.', multiplier_buff: 1.8, tier: 2, classification: 'Attack' },
  'overload': { description: 'Overloads scoring matrix for explosive point gains.', multiplier_buff: 2.5, tier: 2, classification: 'Attack' },
  'supernova': { description: 'Supernova explosion granting 3.0x score multiplier with 3.0x mistake risk.', multiplier_buff: 3.0, tier: 3, classification: 'Attack' },
  'gigawatt': { description: 'Gigawatt power surge maximizing point yield on every correct word.', multiplier_buff: 3.2, tier: 3, classification: 'Attack' },
  'desperado': { description: 'All-out offensive stance converting speed directly into points.', multiplier_buff: 3.5, tier: 3, classification: 'Attack' },
  'absolute power': { description: 'Unmatched power surge offering maximum score potential.', multiplier_buff: 4.0, tier: 3, classification: 'Attack' },
  'supermassive': { description: 'Supermassive gravity pulling huge point multipliers into your score.', multiplier_buff: 3.5, tier: 3, classification: 'Attack' },

  // Balanced Family
  'balance': { description: 'Harmonious performance. Balanced point multiplier and mistake reduction.', multiplier_buff: 1.1, tier: 1, classification: 'Economy' },
  'harmony': { description: 'Steady harmony maintaining consistent score growth.', multiplier_buff: 1.3, tier: 2, classification: 'Economy' },
  'equilibrium': { description: 'Perfect equilibrium balancing speed, accuracy, and score.', multiplier_buff: 1.4, tier: 2, classification: 'Economy' },
  'yin yang': { description: 'Dual balance converting mistakes into momentum.', multiplier_buff: 1.3, tier: 2, classification: 'Economy' },
  'steady pace': { description: 'Consistent typing pace increases score multiplier over time.', multiplier_buff: 1.5, tier: 2, classification: 'Economy' },
  'harmony wave': { description: 'Rhythmic typing pulses awarding periodic point waves.', multiplier_buff: 1.4, tier: 2, classification: 'Economy' },
  'perfect harmony': { description: 'Flawless balance yielding maximum score stability and bonuses.', multiplier_buff: 2.0, tier: 3, classification: 'Economy' },
  'zenith': { description: 'Reaching the zenith of balanced typing performance.', multiplier_buff: 2.2, tier: 3, classification: 'Economy' },
  'nirvana': { description: 'State of typing nirvana immunizing score against major dips.', multiplier_buff: 2.5, tier: 3, classification: 'Economy' },
  'cosmic balance': { description: 'Cosmic equilibrium aligning all scoring metrics.', multiplier_buff: 2.4, tier: 3, classification: 'Economy' },
  'universal harmony': { description: 'Universal alignment delivering steady high-tier multipliers.', multiplier_buff: 2.3, tier: 3, classification: 'Economy' },

  // Pandora Family
  'pandora\'s box': { description: 'Chaos and mystery. Random positive or negative score multipliers each word.', tier: 1, classification: 'Attack' },
  'trickster\'s glass': { description: 'Illusionary mirror swapping word penalties into point gains randomly.', tier: 2, classification: 'Attack' },
  'chaos prism': { description: 'Refracts scoring into unpredictable multi-point outcomes.', tier: 2, classification: 'Attack' },
  'warp reality': { description: 'Distorts reality to trigger surprise bonus multipliers.', tier: 2, classification: 'Attack' },
  'pandora\'s curse': { description: 'High-volatility curse with chance for massive point explosions.', tier: 2, classification: 'Attack' },
  'pandora\'s mirror': { description: 'Reflects random modifiers back onto word score.', tier: 2, classification: 'Attack' },
  'chaos theory': { description: 'Mastery over chaos unlocking extreme positive modifier shifts.', multiplier_buff: 2.5, tier: 3, classification: 'Attack' },
  'butterfly effect': { description: 'Small keystroke streaks cause cascading point surges.', tier: 3, classification: 'Attack' },
  'pandora\'s wrath': { description: 'Unleashes full Pandora wrath for huge point payout rolls.', multiplier_buff: 3.0, tier: 3, classification: 'Attack' },
  'cosmic entropy': { description: 'Entropy engine maximizing high-tier random bonus rolls.', tier: 3, classification: 'Attack' },
  'reality collapse': { description: 'Collapses score variations into pure high-tier point bonuses.', multiplier_buff: 3.5, tier: 3, classification: 'Attack' },

  // Phoenix Family
  'phoenix': { description: 'Rebirth from mistakes. Recover lost points when building streaks after errors.', tier: 1, classification: 'Defense' },
  'phoenix flame': { description: 'Ignites flame on mistake, converting error into point momentum.', tier: 2, classification: 'Defense' },
  'rebirth': { description: 'Instantly restores lost points upon answering 3 consecutive words.', tier: 2, classification: 'Defense' },
  'ashes to ashes': { description: 'Consumes mistake penalties to fuel upcoming word multipliers.', tier: 2, classification: 'Defense' },
  'immortal phoenix': { description: 'Immortal rebirth fully restoring score and granting multiplier surge.', multiplier_buff: 2.0, tier: 3, classification: 'Defense' },
  'eternal rebirth': { description: 'Infinite rebirth engine protecting score throughout the match.', tier: 3, classification: 'Defense' },
  'supernova ashes': { description: 'Explosive rebirth triggering huge point explosion on streak recovery.', multiplier_buff: 2.5, tier: 3, classification: 'Defense' },

  // High Roller Family
  'high roller': { description: 'Gamble your score. Take risky bets for astronomical point payouts.', tier: 1, classification: 'Economy' },
  'jackpot': { description: 'Chance to hit the jackpot on fast correct answers!', flat_buff: 300, tier: 2, classification: 'Economy' },
  'safe bet': { description: 'Low-risk gambling mechanics ensuring steady point gains.', tier: 2, classification: 'Economy' },
  'double or nothing': { description: 'Bet current word score for double or nothing payouts!', multiplier_buff: 2.0, tier: 2, classification: 'Economy' },
  'all in': { description: 'Go all in on your typing speed for 4.0x point multiplier!', multiplier_buff: 4.0, tier: 3, classification: 'Economy' },
  'house advantage': { description: 'Stack odds in your favor for consistent gamble payouts.', tier: 3, classification: 'Economy' },
  'russian roulette': { description: 'Extreme gamble mode delivering up to 10x point multipliers!', multiplier_buff: 5.0, tier: 3, classification: 'Economy' }
}

const getCoreDescription = (core: any): string => {
  if (core && core.description && !core.description.includes('hidden') && core.description.trim() !== '') {
    return core.description
  }
  const key = core.name?.toLowerCase() || ''
  return CORE_DETAILS_MAP[key]?.description || 'Tactical core evolution providing enhanced performance in competitive typing matches.'
}

const CORE_FAMILIES: Record<string, { tier1: string[], tier2: string[], tier3: string[] }> = {
  'combo': {
    tier1: ['Perfect Combo'],
    tier2: ['Radiant Combo', 'Combo Shield', 'Combo Time', 'Combo Multiplier', 'Combo Focus'],
    tier3: ['Prismatic Combo', 'Golden Combo', 'Chain Lightning', 'Combo Mastery', 'Super Combo']
  },
  'speedster': {
    tier1: ['Speedster'],
    tier2: ['Time Warp', 'Speed Shield', 'Mach Speed', 'Overdrive', 'Speed Demon'],
    tier3: ['Chronobreak', 'Time Freeze', 'Warp Speed', 'Grand Prix', 'Sonic Boom']
  },
  'oracle': {
    tier1: ['Argus Eyes'],
    tier2: ['Clairvoyance', 'Third Eye', 'Future Sight', 'Divine Guidance', 'Oracle Blessing'],
    tier3: ['Omniscience', 'Mind Reader', 'Predictive Strike', 'Cosmic Wisdom', 'Divine Eye']
  },
  'mission': {
    tier1: ['Mission Impossible'],
    tier2: ['Bounty Hunter', 'Daily Quest', 'Shield Mission', 'Time Mission', 'Swift Mission'],
    tier3: ['Exodia', 'Bounty Overlord', 'Apex Predator', 'Mission Specialist', 'Mission Master']
  },
  'aegis': {
    tier1: ['Aegis Shield'],
    tier2: ['Reflective Aegis', 'Shield Battery', 'Fortress Aegis', 'Shield Synergy', 'Shield Burst'],
    tier3: ['Bastion of Light', 'Spiked Shield', 'Indomitable', 'Aegis Nova', 'Guardian Angel']
  },
  'balanced': {
    tier1: ['Balance'],
    tier2: ['Harmony', 'Equilibrium', 'Yin Yang', 'Steady Pace', 'Harmony Wave'],
    tier3: ['Perfect Harmony', 'Zenith', 'Nirvana', 'Cosmic Balance', 'Universal Harmony']
  },
  'power': {
    tier1: ['Power Strike'],
    tier2: ['Overclock', 'Hypercharge', 'Power Surge', 'Brute Force', 'Overload'],
    tier3: ['Supernova', 'Gigawatt', 'Desperado', 'Absolute Power', 'Supermassive']
  },
  'pandora': {
    tier1: ["Pandora's Box"],
    tier2: ["Trickster's Glass", 'Chaos Prism', 'Warp Reality', "Pandora's Curse", "Pandora's Mirror"],
    tier3: ['Chaos Theory', 'Butterfly Effect', "Pandora's Wrath", 'Cosmic Entropy', 'Reality Collapse']
  },
  'phoenix': {
    tier1: ['Phoenix'],
    tier2: ['Phoenix Flame', 'Rebirth', 'Ashes to Ashes'],
    tier3: ['Immortal Phoenix', 'Eternal Rebirth', 'Supernova Ashes']
  },
  'highroller': {
    tier1: ['High Roller'],
    tier2: ['Jackpot', 'Safe Bet', 'Double or Nothing'],
    tier3: ['All In', 'House Advantage', 'Russian Roulette']
  }
}

const cleanName = (name: string) => name ? String(name).toLowerCase().replace(/[^a-z0-9]/g, '') : ''

const getFamilyForCore = (coreName: string) => {
  const cleaned = cleanName(coreName);
  for (const [family, data] of Object.entries(CORE_FAMILIES)) {
    const allNames = [...data.tier1, ...data.tier2, ...data.tier3].map(cleanName);
    if (allNames.includes(cleaned)) {
      return family;
    }
  }
  return 'combo';
}

import { getCoreIconPath } from '../game/cores/icons'

const resolveIcon = (core: any) => {
  if (!core || !core.name) return '/icons/cores/default.svg'
  return getCoreIconPath(core.name, core.icon_url || core.icon || core.image)
}

const onImgError = (event: Event) => {
  const target = event.target as HTMLImageElement
  if (target && target.src !== '/icons/cores/default.svg') {
    target.src = '/icons/cores/default.svg'
  }
}

onMounted(async () => {
  try {
    const token = localStorage.getItem('arena_token') || ''
    
    // CRITICAL FIX: Add ?all=true so backend returns ALL tiers (Tier 1, Tier 2, Tier 3)
    const resAll = await fetch(`${SERVER_URL}/api/game/cores?all=true`, { 
      headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) } 
    })
    
    let allCoresList: any[] = []
    if (resAll.ok) {
      const dataAll = await resAll.json()
      const rawData = dataAll.data || dataAll.cores || dataAll || []
      allCoresList = Array.isArray(rawData) ? rawData : Object.values(rawData)
    }

    if (allCoresList.length > 0) {
      // Find Base Core
      baseCore.value = allCoresList.find((c: any) => String(c.id) === String(coreId) || String(c._id) === String(coreId))

      if (baseCore.value) {
        const baseCleaned = cleanName(baseCore.value.name)
        let targetFamily: any = null

        for (const key in CORE_FAMILIES) {
          const family = CORE_FAMILIES[key]
          const isPartOfFamily = 
            family.tier1.some((n: string) => cleanName(n) === baseCleaned) ||
            family.tier2.some((n: string) => cleanName(n) === baseCleaned) ||
            family.tier3.some((n: string) => cleanName(n) === baseCleaned)
            
          if (isPartOfFamily) {
            targetFamily = family
            break
          }
        }

        if (targetFamily) {
          const matchedUpgrades: any[] = []

          // Process Tier 2 Upgrades
          targetFamily.tier2.forEach((expectedName: string) => {
             const cName = cleanName(expectedName)
             const foundInDB = allCoresList.find((c: any) => cleanName(c.name) === cName)
             const mapData = CORE_DETAILS_MAP[expectedName.toLowerCase()] || {}
             
             if (foundInDB) {
                 matchedUpgrades.push({ 
                   ...foundInDB, 
                   computedTier: 2,
                   description: getCoreDescription(foundInDB),
                   multiplier_buff: foundInDB.multiplier_buff || mapData.multiplier_buff || 1.0,
                   flat_buff: foundInDB.flat_buff || mapData.flat_buff || 0
                 })
             } else {
                 matchedUpgrades.push({
                     id: 'mock-' + expectedName,
                     name: expectedName,
                     description: mapData.description || 'Evolution effect providing enhanced tactical mechanics.',
                     computedTier: 2,
                     multiplier_buff: mapData.multiplier_buff || 1.0,
                     flat_buff: mapData.flat_buff || 0,
                     classification: mapData.classification || 'upgrade'
                 })
             }
          })

          // Process Tier 3 Upgrades
          targetFamily.tier3.forEach((expectedName: string) => {
             const cName = cleanName(expectedName)
             const foundInDB = allCoresList.find((c: any) => cleanName(c.name) === cName)
             const mapData = CORE_DETAILS_MAP[expectedName.toLowerCase()] || {}
             
             if (foundInDB) {
                 matchedUpgrades.push({ 
                   ...foundInDB, 
                   computedTier: 3,
                   description: getCoreDescription(foundInDB),
                   multiplier_buff: foundInDB.multiplier_buff || mapData.multiplier_buff || 1.0,
                   flat_buff: foundInDB.flat_buff || mapData.flat_buff || 0
                 })
             } else {
                 matchedUpgrades.push({
                     id: 'mock-' + expectedName,
                     name: expectedName,
                     description: mapData.description || 'Ultimate core evolution yielding maximum tactical performance.',
                     computedTier: 3,
                     multiplier_buff: mapData.multiplier_buff || 1.0,
                     flat_buff: mapData.flat_buff || 0,
                     classification: mapData.classification || 'upgrade'
                 })
             }
          })

          upgrades.value = matchedUpgrades
        }
      }
    }
  } catch (err) {
    console.error("Lỗi khi kết nối lấy dữ liệu Cores:", err)
  } finally {
    loading.value = false
  }
})

// Tooltip formatting
const formattedTooltipCore = computed(() => {
  if (!hoveredCore.value) return null
  const c = hoveredCore.value
  const mapData = CORE_DETAILS_MAP[c.name?.toLowerCase()] || {}
  
  return {
    ...c,
    description: getCoreDescription(c),
    tier: c.computedTier || c.tier || mapData.tier || 2,
    multiplier_buff: c.multiplier_buff || mapData.multiplier_buff || 1.0,
    flat_buff: c.flat_buff || mapData.flat_buff || 0,
    classification: c.classification || mapData.classification || 'upgrade'
  }
})

const showTooltip = (event: MouseEvent | TouchEvent, core: any) => {
  if (audioService?.playHover) audioService.playHover()
  hoveredCore.value = core
  isTooltipVisible.value = true
  
  let clientX, clientY
  if ('touches' in event && event.touches.length > 0) {
    clientX = event.touches[0].clientX
    clientY = event.touches[0].clientY
  } else if ('clientX' in event) {
    clientX = (event as MouseEvent).clientX
    clientY = (event as MouseEvent).clientY
  } else {
    clientX = window.innerWidth / 2
    clientY = window.innerHeight / 2
  }

  tooltipX.value = clientX
  tooltipY.value = clientY
}

const hideTooltip = () => {
  isTooltipVisible.value = false
  hoveredCore.value = null
}

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
const floatingLetters = alphabet.map((char, index) => ({
  id: index,
  char: char,
  left: Math.random() * 95,
  size: 1.5 + Math.random() * 4,
  delay: Math.random() * 15,
  duration: 15 + Math.random() * 20
}))
</script>

<style scoped>
.animate-float-slow {
  animation: floatSky 12s ease-in-out infinite alternate;
}

.animate-float-delayed {
  animation: floatSky 15s ease-in-out infinite alternate-reverse;
}

.animate-pulse-slow {
  animation: pulseBlob 8s ease-in-out infinite alternate;
}

@keyframes floatSky {
  0% { transform: translate(0, 0) scale(1); }
  100% { transform: translate(40px, -40px) scale(1.1); }
}

@keyframes pulseBlob {
  0% { transform: scale(1); opacity: 0.3; }
  100% { transform: scale(1.1); opacity: 0.5; }
}

.animate-matrix-drift {
  animation-name: drift;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  animation-fill-mode: both;
}

@keyframes drift {
  0% { transform: translateY(110vh); opacity: 0; }
  10% { opacity: 0.2; }
  90% { opacity: 0.2; }
  100% { transform: translateY(-20vh); opacity: 0; }
}
</style>

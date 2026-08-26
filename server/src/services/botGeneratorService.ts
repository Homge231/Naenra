export interface BotProfile {
  id: string
  name: string
  title?: string
  icon?: string
  avatar: string
  tier?: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Boss'
  elo: number
  wpm: number
  accuracy: number
  solveIntervalMs: number
  pointsPerSolve: number
  favoriteCore?: string
  badgeColor?: string
  quote?: string
  description?: string
  isBot: boolean
}

export const CREATURE_CHALLENGERS: BotProfile[] = [
  {
    id: "creature_puck_pixie",
    name: "Puck the Cyber Pixie",
    title: "Playful Mascot",
    icon: "🦝",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=PuckThePixie&backgroundColor=b6e3f4",
    tier: "Bronze",
    elo: 800,
    wpm: 38,
    accuracy: 0.70,
    solveIntervalMs: 4500,
    pointsPerSolve: 100,
    favoriteCore: "Balanced Core",
    badgeColor: "#10B981",
    quote: "Let's practice together! Don't worry, I won't type too fast!",
    description: "Gentle training bot. Great for warming up and beginners.",
    isBot: true
  },
  {
    id: "creature_neon_wolf",
    name: "Neon Wolf",
    title: "Cybernetic Scout",
    icon: "🐺",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=NeonWolf99&backgroundColor=c0aede",
    tier: "Bronze",
    elo: 1200,
    wpm: 48,
    accuracy: 0.75,
    solveIntervalMs: 3800,
    pointsPerSolve: 105,
    favoriteCore: "Combo Core",
    badgeColor: "#06B6D4",
    quote: "A swift strike will test your reflexes in the arena.",
    description: "Quick and agile, builds steady combo chains.",
    isBot: true
  },
  {
    id: "creature_cyber_golem",
    name: "Cyber Golem",
    title: "Armored Titan",
    icon: "🤖",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=CyberGolemSteel&backgroundColor=d1d5db",
    tier: "Silver",
    elo: 1800,
    wpm: 58,
    accuracy: 0.82,
    solveIntervalMs: 3200,
    pointsPerSolve: 120,
    favoriteCore: "Aegis Shield",
    badgeColor: "#64748B",
    quote: "My defenses are impenetrable. Break through if you can.",
    description: "Rock-solid accuracy with resilient shield tactics.",
    isBot: true
  },
  {
    id: "creature_thunder_falcon",
    name: "Thunder Falcon",
    title: "Tempest Raptor",
    icon: "🦅",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=ThunderFalconStorm&backgroundColor=bae6fd",
    tier: "Silver",
    elo: 2400,
    wpm: 70,
    accuracy: 0.84,
    solveIntervalMs: 2800,
    pointsPerSolve: 130,
    favoriteCore: "Speedster",
    badgeColor: "#3B82F6",
    quote: "Lightning strikes twice before you even blink!",
    description: "Rapid burst typing speed that tests your sprint capacity.",
    isBot: true
  },
  {
    id: "creature_ignis_drake",
    name: "Ignis Drake",
    title: "Infernal Dragon",
    icon: "🐉",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=IgnisDrakeFire&backgroundColor=fed7aa",
    tier: "Gold",
    elo: 3200,
    wpm: 82,
    accuracy: 0.86,
    solveIntervalMs: 2300,
    pointsPerSolve: 145,
    favoriteCore: "Power Strike",
    badgeColor: "#F97316",
    quote: "Feel the heat! Can your vocabulary withstand the flame?",
    description: "Aggressive, high-scoring words with explosive power.",
    isBot: true
  },
  {
    id: "creature_argus_specter",
    name: "Argus Specter",
    title: "All-Seeing Phantom",
    icon: "👁️",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=ArgusSpecterPhantom&backgroundColor=e9d5ff",
    tier: "Gold",
    elo: 4000,
    wpm: 92,
    accuracy: 0.88,
    solveIntervalMs: 2000,
    pointsPerSolve: 160,
    favoriteCore: "Oracle Core",
    badgeColor: "#8B5CF6",
    quote: "I foresee every letter before your fingers touch the keys.",
    description: "Uncanny word prediction and lightning-fast puzzle solving.",
    isBot: true
  },
  {
    id: "creature_kitsune_glitch",
    name: "Kitsune Glitch",
    title: "Nine-Tailed Trickster",
    icon: "🦊",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=KitsuneGlitchTrickster&backgroundColor=fbcfe8",
    tier: "Platinum",
    elo: 5000,
    wpm: 104,
    accuracy: 0.90,
    solveIntervalMs: 1700,
    pointsPerSolve: 180,
    favoriteCore: "High Roller",
    badgeColor: "#EC4899",
    quote: "High risk, infinite reward. Care to roll the dice?",
    description: "Gambles on huge score multipliers with blistering speed.",
    isBot: true
  },
  {
    id: "creature_solar_chimera",
    name: "Solar Chimera",
    title: "Radiant Apex",
    icon: "🦁",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=SolarChimeraApex&backgroundColor=fef08a",
    tier: "Diamond",
    elo: 6500,
    wpm: 118,
    accuracy: 0.93,
    solveIntervalMs: 1400,
    pointsPerSolve: 200,
    favoriteCore: "Phoenix Core",
    badgeColor: "#EAB308",
    quote: "From the ashes of defeated rivals, I rise victorious.",
    description: "Relentless comeback potential and master-tier execution.",
    isBot: true
  },
  {
    id: "creature_abyssal_kraken",
    name: "Abyssal Kraken",
    title: "Deep Sea Behemoth",
    icon: "🐙",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=AbyssalKrakenLeviathan&backgroundColor=99f6e4",
    tier: "Diamond",
    elo: 7800,
    wpm: 130,
    accuracy: 0.95,
    solveIntervalMs: 1200,
    pointsPerSolve: 220,
    favoriteCore: "Pandora's Box",
    badgeColor: "#14B8A6",
    quote: "The abyss consumes all hesitations. You cannot escape.",
    description: "Overwhelming speed and complex advanced vocabulary.",
    isBot: true
  },
  {
    id: "creature_void_leviathan",
    name: "Void Leviathan",
    title: "Cosmic Overlord",
    icon: "🌌",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=VoidLeviathanCosmic&backgroundColor=fecaca",
    tier: "Boss",
    elo: 9999,
    wpm: 145,
    accuracy: 0.97,
    solveIntervalMs: 1000,
    pointsPerSolve: 250,
    favoriteCore: "Combo Core",
    badgeColor: "#EF4444",
    quote: "I am the end of silence. Submit to the ultimate trial.",
    description: "The ultimate typing challenge. Near-perfect speed and godlike precision.",
    isBot: true
  }
]

export const CORE_NAMES = [
  "Combo Core", "Speedster", "Oracle Core", "Aegis Shield",
  "Mission Core", "Phoenix Core", "Pandora's Box", "High Roller",
  "Power Strike", "Balanced Core"
]

export function getCreatureById(id: string): BotProfile | undefined {
  return CREATURE_CHALLENGERS.find(c => c.id === id)
}

export function generateBotProfile(playerElo: number = 1000, creatureId?: string): BotProfile {
  // 1. If explicit creature selected, return matching creature with fresh id
  if (creatureId) {
    const creature = getCreatureById(creatureId)
    if (creature) {
      return {
        ...creature,
        id: `bot_${Math.random().toString(36).substring(2, 10)}`
      }
    }
  }

  // 2. Select creature closest to player Elo from catalog
  const sorted = [...CREATURE_CHALLENGERS].sort((a, b) => 
    Math.abs(a.elo - playerElo) - Math.abs(b.elo - playerElo)
  )
  const baseCreature = sorted[0] || CREATURE_CHALLENGERS[0]

  // Add a small Elo variance (+/- 40) for dynamic feel
  const eloOffset = Math.floor(Math.random() * 81) - 40
  const dynamicElo = Math.max(100, baseCreature.elo + eloOffset)

  return {
    ...baseCreature,
    id: `bot_${Math.random().toString(36).substring(2, 10)}`,
    elo: dynamicElo
  }
}

export function getRandomBotCoreName(preferredCore?: string): string {
  if (preferredCore && Math.random() < 0.75) {
    return preferredCore
  }
  const idx = Math.floor(Math.random() * CORE_NAMES.length)
  return CORE_NAMES[idx]
}

export interface BotProfile {
  id: string
  name: string
  avatar: string
  elo: number
  wpm: number
  accuracy: number
  solveIntervalMs: number
  pointsPerSolve: number
  isBot: boolean
}

const BOT_NAMES = [
  "ShadowTypist", "QuickFingers", "Faker99", "CyberPawn", "VortexType",
  "EchoKnight", "AeroKey", "QuantumTyper", "ZenithSprint", "HyperVelocity",
  "StormWriter", "ViperFingers", "NeonRunner", "PhantomKey", "AlphaBlade",
  "NovaPulse", "ChronoType", "MirageShift", "StarlightTypist", "VelocityZero",
  "ApexGlyph", "SonicKey", "GlitchMaster", "PrismaticType", "AegisRunner",
  "OracleMind", "PandoraBoxer", "HighRollerPro", "PowerSurge", "ZenEquilibrium",
  "LaserFingers", "Overclocked", "TurboScript", "LuminaKey", "ObsidianTyper",
  "SpectralShift", "NexusRider", "CipherBreak", "MatrixTypist", "VanguardKey",
  "TitanFingers", "RiftWalker", "AetherType", "SolarFlare", "LunarEclipse",
  "CosmicDash", "PulseRider", "StarlightSeeker", "InfinityTyper", "VenomKey"
]

const CORE_NAMES = [
  "Combo Core", "Speedster", "Oracle Core", "Aegis Shield",
  "Mission Core", "Phoenix Core", "Pandora's Box", "High Roller",
  "Power Strike", "Balanced Core"
]

export function generateBotProfile(playerElo: number = 1000): BotProfile {
  // 1. Random name from pool
  const nameIndex = Math.floor(Math.random() * BOT_NAMES.length)
  const name = BOT_NAMES[nameIndex]

  // 2. Elo: playerElo +/- [0 to 50], min 0
  const eloOffset = Math.floor(Math.random() * 101) - 50
  const elo = Math.max(0, playerElo + eloOffset)

  // 3. Avatar
  const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`

  // 4. Realistic Human-like WPM & Accuracy scaling with REAL MISTAKES
  let wpm = 40
  let accuracy = 0.70
  let solveIntervalMs = 4500
  let pointsPerSolve = 100

  if (elo < 1500) {
    // Bronze: Human-like WPM 30-42, Accuracy 65-75% (25-35% mistake rate)
    wpm = Math.floor(Math.random() * 13) + 30
    accuracy = 0.65 + Math.random() * 0.10
    solveIntervalMs = Math.floor(Math.random() * 1500) + 4000
    pointsPerSolve = 100
  } else if (elo < 3000) {
    // Silver: Human-like WPM 45-60, Accuracy 72-82% (18-28% mistake rate)
    wpm = Math.floor(Math.random() * 16) + 45
    accuracy = 0.72 + Math.random() * 0.10
    solveIntervalMs = Math.floor(Math.random() * 1000) + 3200
    pointsPerSolve = 115
  } else if (elo < 4500) {
    // Gold: Human-like WPM 65-78, Accuracy 78-86% (14-22% mistake rate)
    wpm = Math.floor(Math.random() * 14) + 65
    accuracy = 0.78 + Math.random() * 0.08
    solveIntervalMs = Math.floor(Math.random() * 800) + 2500
    pointsPerSolve = 135
  } else if (elo < 6000) {
    // Platinum: Human-like WPM 80-95, Accuracy 84-90% (10-16% mistake rate)
    wpm = Math.floor(Math.random() * 16) + 80
    accuracy = 0.84 + Math.random() * 0.06
    solveIntervalMs = Math.floor(Math.random() * 600) + 2000
    pointsPerSolve = 160
  } else if (elo < 7500) {
    // Diamond: Human-like WPM 98-112, Accuracy 88-94% (6-12% mistake rate)
    wpm = Math.floor(Math.random() * 15) + 98
    accuracy = 0.88 + Math.random() * 0.06
    solveIntervalMs = Math.floor(Math.random() * 500) + 1600
    pointsPerSolve = 190
  } else {
    // Master / Grandmaster: WPM 115-130, Accuracy 91-96% (4-9% mistake rate)
    wpm = Math.floor(Math.random() * 16) + 115
    accuracy = 0.91 + Math.random() * 0.05
    solveIntervalMs = Math.floor(Math.random() * 400) + 1300
    pointsPerSolve = 220
  }

  const id = `bot_${Math.random().toString(36).substring(2, 10)}`

  return {
    id,
    name,
    avatar,
    elo,
    wpm,
    accuracy,
    solveIntervalMs,
    pointsPerSolve,
    isBot: true
  }
}

export function getRandomBotCoreName(): string {
  const idx = Math.floor(Math.random() * CORE_NAMES.length)
  return CORE_NAMES[idx]
}

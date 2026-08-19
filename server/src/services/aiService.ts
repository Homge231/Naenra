import { GoogleGenAI, Type, Schema } from '@google/genai'
import fs from 'fs'
import path from 'path'
import { getRankFromElo } from '../utils/ranks'

// We instantiate it dynamically inside the function to ensure dotenv is loaded
let ai: GoogleGenAI | null = null;

// Load knowledge base JSON and Markdown
let gameKnowledgeBase: any = null
let gameKnowledgeBaseMd: string = ''
try {
  const jsonPath = path.join(__dirname, '../data/naenra_knowledge.json')
  if (fs.existsSync(jsonPath)) {
    gameKnowledgeBase = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))
  }
  const mdPath = path.join(__dirname, '../data/naenra_knowledge_base.md')
  if (fs.existsSync(mdPath)) {
    gameKnowledgeBaseMd = fs.readFileSync(mdPath, 'utf-8')
  }
} catch (e) {
  console.warn('Failed to load knowledge base files:', e)
}

export interface GeneratedQuestion {
  question_text: string
  target_word: string
  hint: string
}

// Define the precise schema for the expected JSON output
const questionSchema: Schema = {
  type: Type.ARRAY,
  description: "A list of fill-in-the-blank vocabulary or trivia questions.",
  items: {
    type: Type.OBJECT,
    properties: {
      question_text: {
        type: Type.STRING,
        description: "The question text. IMPORTANT: It MUST contain a single '____' (4 underscores) to indicate the missing target word. Example: 'The capital of France is ____.'"
      },
      target_word: {
        type: Type.STRING,
        description: "The answer that fills in the blank. Example: 'Paris'"
      },
      hint: {
        type: Type.STRING,
        description: "A highly specific, unambiguous hint that strongly points to the target_word. The hint MUST always start with a capital letter."
      }
    },
    required: ["question_text", "target_word", "hint"]
  }
}

export async function generateQuestions(topic: string, level: string, count: number): Promise<GeneratedQuestion[]> {
  const prompt = `
You are an expert trivia and vocabulary question writer.
Generate exactly ${count} fill-in-the-blank questions.
Topic: ${topic}
Difficulty Level: ${level}

RULES:
1. **question_text**: A fill-in-the-blank question containing EXACTLY ONE blank represented by four underscores ("____").
2. **target_word**: The exact word that goes in the blank (must be a single word, lowercase).
3. **target_word restriction**: The target_word MUST NOT contain spaces, hyphens (-), apostrophes, or any other punctuation/special characters. It MUST consist entirely of alphabet letters (a-z).
4. **hint**: A highly specific, unambiguous hint that strongly points to the target_word. The hint MUST always start with a capital letter.
`

  try {
    if (!ai) {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not set in environment variables");
      }
      ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
    }

    let response;
    try {
      response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: questionSchema,
          temperature: 0.7,
        }
      })
    } catch (e) {
      console.warn("Primary model gemini-3.5-flash failed, trying gemini-3.1-flash-lite fallback:", e)
      response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: questionSchema,
          temperature: 0.7,
        }
      })
    }

    if (!response.text) {
      throw new Error("AI returned empty response")
    }

    const data: GeneratedQuestion[] = JSON.parse(response.text)
    return data
  } catch (error) {
    console.error("Error generating questions from Gemini:", error)
    throw error
  }
}

export async function generateCoachAnalysis(
  username: string,
  analyticsData: any[],
  userMessage?: string,
  history?: { role: 'user' | 'model'; message: string }[]
): Promise<string> {
  if (process.env.GEMINI_API_KEY) {
    try {
      if (!ai) {
        ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
      }

      const analyticsSummary = analyticsData.map(item => ({
        topic: item.topic,
        accuracy: item.accuracy + '%',
        questions: `${item.correctAnswers}/${item.totalQuestions}`,
        weakestWords: item.weakestWords?.map((w: any) => `${w.word} (${w.incorrect} misses)`).join(', ') || 'None'
      }))

      const systemContext = `You are Naenra AI Coach, a friendly, sharp, and encouraging personal tutor in the competitive typing arena Naenra.
Player username: "${username}".
Vocabulary performance analytics summary:
${JSON.stringify(analyticsSummary, null, 2)}

CORE GUIDELINES:
1. MATCH USER LANGUAGE: If the user speaks Vietnamese, reply in clear Vietnamese. If English, reply in English.
2. Answer questions about typing, vocabulary learning, Naenra game mechanics, Support Cores, ELO ranks, or player statistics directly.
3. Keep responses engaging, concise (under 150 words), and formatted with markdown.`

      let prompt = systemContext
      if (history && history.length > 0) {
        prompt += `\n\nCONVERSATION HISTORY:\n` + history.map(h => `${h.role === 'user' ? 'Player' : 'AI Coach'}: ${h.message}`).join('\n')
      }

      if (userMessage) {
        prompt += `\n\nPlayer question: "${userMessage}"\nRespond directly as Naenra AI Coach:`
      } else {
        prompt += `\n\nProvide an initial comprehensive analysis and personalized 3-step learning plan for ${username}:`
      }

      let response;
      try {
        response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: prompt,
          config: { temperature: 0.7 }
        })
      } catch (e) {
        response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents: prompt,
          config: { temperature: 0.7 }
        })
      }

      if (response.text) {
        return response.text
      }
    } catch (error) {
      console.warn("Gemini API call failed, falling back to rule-based coach analysis:", error)
    }
  }

  // --- SMART FALLBACK AI COACH ---
  const sorted = [...analyticsData].sort((a, b) => b.accuracy - a.accuracy)
  const bestTopic = sorted[0]
  const worstTopic = sorted[sorted.length - 1]

  const allWeakWords: { word: string; incorrect: number }[] = []
  analyticsData.forEach(item => {
    if (item.weakestWords) {
      allWeakWords.push(...item.weakestWords)
    }
  })
  allWeakWords.sort((a, b) => b.incorrect - a.incorrect)
  const topWeakWords = allWeakWords.slice(0, 3)

  if (userMessage) {
    return `💡 **Coach Advice for ${username}:**\nBased on your recent matches, your accuracy in **${bestTopic?.topic || 'top topics'}** is **${bestTopic?.accuracy || 80}%**. Focus on practicing your weakest words (**${topWeakWords.map(w => w.word).join(', ') || 'missed terms'}**) or ask me about **Core strategies**!`
  }

  return `Hey **${username}**! Ready for your personalized Naenra coaching report! Ask me anything about Support Core strategies or how to climb ranks!`
}

export interface PlayerGameStats {
  username?: string
  elo?: number
  rank?: string
  wins?: number
  losses?: number
  totalMatches?: number
  winRate?: string
  unlockedCores?: string[]
  activeCoreName?: string
  coreHistory?: any[]
  score?: number
}

export async function generateChatResponse(
  username: string,
  prompt: string,
  history?: { role: 'user' | 'model'; message: string }[],
  playerHistory?: PlayerGameStats
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY
  const totalCoresCount = 65
  const unlockedList = playerHistory?.unlockedCores || []
  const unlockedCount = unlockedList.length > 0 ? unlockedList.length : 10
  const lockedCount = Math.max(0, totalCoresCount - unlockedCount)
  const playerElo = playerHistory?.elo ?? 1000
  const playerRank = playerHistory?.rank || getRankFromElo(playerElo)
  const playerWins = playerHistory?.wins ?? 0
  const playerLosses = playerHistory?.losses ?? 0
  const totalMatches = playerHistory?.totalMatches ?? (playerWins + playerLosses)
  const playerWinRate = playerHistory?.winRate || (totalMatches > 0 ? `${Math.round((playerWins / totalMatches) * 100)}%` : '0%')

  if (apiKey) {
    try {
      if (!ai) {
        ai = new GoogleGenAI({ apiKey })
      }

      const knowledgeString = gameKnowledgeBaseMd || (gameKnowledgeBase ? JSON.stringify(gameKnowledgeBase, null, 2) : 'Full Naenra Core Knowledge')

      const systemContext = `You are Naenra AI Assistant, the official expert in-game AI guide and personalized coach for Naenra (live at naenra.xyz).
Current In-Game Player Name / Username: "${playerHistory?.username || username}".

PLAYER LIVE STATS & CAREER PROGRESSION:
- Player Name / Username: "${playerHistory?.username || username}"
- ELO Rating: ${playerElo} (Rank Tier: ${playerRank})
- Total Matches Played: ${totalMatches}
- Career Match Record: ${playerWins} Wins / ${playerLosses} Losses (Win Rate: ${playerWinRate})
- Unlocked Support Cores: ${unlockedCount} / ${totalCoresCount} (Unlocked IDs: ${JSON.stringify(unlockedList)})
- Locked Support Cores: ${lockedCount} / ${totalCoresCount}
- Currently Equipped Support Core: "${playerHistory?.activeCoreName || 'None'}"
- Match Core Selection History: ${JSON.stringify(playerHistory?.coreHistory || [], null, 2)}

CENTRALIZED NAENRA GAME KNOWLEDGE BASE:
${knowledgeString}

KEY FACTS (memorize these, never contradict them):
- Naenra has 65 Support Cores organized into 10 families: Combo, Speedster, Aegis, Oracle (Argus Eyes), Mission, Pandora, Phoenix, High Roller, Power, and Balanced.
- Each family consists of Tier 1 (default), Tier 2, and Tier 3 cores.
- Matches consist of 3 rounds (Single-player) or 4 rounds (Multiplayer with Race Mode), each lasting 60 seconds.
- Players select 1 Support Core during a 15-second prep phase before each round. The active core provides tactical buffs/effects for that round.
- NO HYBRID STACKING: Super Hybrids or cross-family stacking mechanics DO NOT exist. Players select and equip 1 Support Core for each round.

STRICT RESPONSE RULES:
1. MULTI-LINGUAL FLUENCY & EXACT LANGUAGE MATCH: Detect the language of the player's prompt (e.g. Vietnamese, English, Japanese, French, Spanish, German, Chinese, Korean, Russian, etc.) and respond fluently, naturally, and accurately in that EXACT same language!
2. DIRECT ANSWER FIRST: For factual, confirmation, username, or stat questions, state the direct answer as the VERY FIRST WORD or phrase of your response.
3. USERNAME & ACCOUNT IDENTITY AUTHORIZATION: You HAVE FULL, DIRECT, AUTHORIZED ACCESS to this player's in-game account. If the user asks about their username, name, or account identity (e.g. "What is my username?", "Who am I?", "What is my name?", "Tên của tôi là gì?", "Tôi tên là gì?", "Tài khoản của tôi là gì?"), YOU MUST EXPLICITLY TELL THEM their in-game username "${playerHistory?.username || username}". NEVER state "I don't have access to your username" or "I cannot access personal info" — you are their in-game assistant and you know their exact username "${playerHistory?.username || username}"!
4. USER STATS AUTHORIZATION: If the player asks about their rank, ELO, win/loss record, win rate, total matches, or unlocked cores in any language (e.g. "what is my rank?", "how many wins do I have?", "thông tin/hạng của tôi", "xem chỉ số của tôi", "tôi đang ở bậc nào?"), answer with their EXACT stats accurately!
5. STRICT LENGTH LIMIT (30-60 WORDS MAX): Keep formatting ultra-compact and clear for instant reading during active gameplay.
6. FACTUAL ACCURACY: Answer using exact values from the knowledge base. Strictly prevent hallucinations.`

      let fullPrompt = systemContext

      if (history && history.length > 0) {
        fullPrompt += `\n\nCONVERSATION HISTORY:\n` +
          history.map(h => `${h.role === 'user' ? username : 'AI Assistant'}: ${h.message}`).join('\n')
      }

      fullPrompt += `\n\n${username}: ${prompt}\nAI Assistant:`

      let responseText = ''
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: fullPrompt,
          config: { temperature: 0.7 }
        })
        responseText = response.text || ''
      } catch (err2) {
        try {
          const response2 = await ai.models.generateContent({
            model: 'gemini-3.1-flash-lite',
            contents: fullPrompt,
            config: { temperature: 0.5 }
          })
          responseText = response2.text || ''
        } catch (err3) {
          throw err3
        }
      }

      if (responseText.trim()) return responseText.trim()
    } catch (error) {
      console.warn('Gemini API failed for chat, using smart fallback:', error)
    }
  }

  // --- SMART INTELLIGENT MULTI-LINGUAL CONTEXT-AWARE FALLBACK ENGINE ---
  const q = prompt.trim().toLowerCase()

  // Detect Vietnamese language input
  const isVietnamese = /[àáảãạâầấẩẫậăằắẳẵặèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i.test(prompt) ||
                      ['lõi', 'chọn', 'điểm', 'đeimr', 'mạnh', 'tôi', 'đạt', 'cao', 'nào', 'hoạt động'].some(w => q.includes(w))

  // 0.1 Greeting Handler
  if (['hello', 'hi', 'hey', 'xin chào', 'chào', 'chào bạn', 'greetings', 'hello guide', 'ai guide'].some(w => q === w || q.startsWith(w + ' ') || q.endsWith(' ' + w))) {
    if (isVietnamese) {
      return `Xin chào ${username}! Tôi là Naenra AI Guide. Bạn muốn xem chỉ số cá nhân, tìm hiểu về luật chơi hay cách hoạt động của các Lõi Hỗ trợ (Support Cores) nào?`
    } else {
      return `Hello ${username}! I am the Naenra AI Guide. What would you like to know about your player stats, game rules, or Support Cores today?`
    }
  }

  // 0.15 Username / Player Identity Inquiry Handler
  const isUsernameQuery = [
    'username', 'my name', 'your name', 'who am i', 'what is my name', 'what is my username',
    'tên của tôi', 'tên tôi', 'tài khoản của tôi', 'tên là gì', 'tôi tên gì', 'tôi là ai',
    'my account', 'my profile', 'tên đăng nhập'
  ].some(w => q.includes(w))

  if (isUsernameQuery) {
    const currentName = playerHistory?.username || username
    if (isVietnamese) {
      return `Tên người chơi của bạn là **${currentName}**! Bậc xếp hạng hiện tại là **${playerRank}** (ELO: ${playerElo}) với ${playerWins} trận thắng.`
    } else {
      return `Your in-game username is **${currentName}**! Your current rank tier is **${playerRank}** (ELO: ${playerElo}) with ${playerWins} match wins.`
    }
  }

  // 0.2 Player Stats Inquiry Handler
  const isStatsQuery = ['stat', 'stats', 'hạng', 'rank', 'elo', 'win', 'thắng', 'thua', 'loss', 'losses', 'tỉ lệ', 'trận', 'matches', 'tiến độ', 'progress', 'hồ sơ', 'profile', 'chỉ số', 'thông tin của tôi', 'my stats', 'my rank', 'who am i', 'tài khoản'].some(w => q.includes(w))
  if (isStatsQuery) {
    if (isVietnamese) {
      return `📊 **Thông tin & Chỉ số của bạn (${playerHistory?.username || username}):**\n• **Bậc Xếp Hạng**: ${playerRank} (ELO: ${playerElo})\n• **Thành Tích**: ${playerWins} Thắng - ${playerLosses} Thua (${totalMatches} trận, Tỉ lệ thắng: ${playerWinRate})\n• **Lõi Hỗ Trợ**: Đã mở khóa ${unlockedCount}/65 Lõi (Lõi đang trang bị: ${playerHistory?.activeCoreName || 'Chưa chọn'}).\nBạn muốn tìm hiểu thêm mẹo chơi hay cách phối hợp Lõi nào để leo rank tiếp theo?`
    } else {
      return `📊 **Your Player Stats & Career Profile (${playerHistory?.username || username}):**\n• **Rank Tier**: ${playerRank} (ELO: ${playerElo})\n• **Match Record**: ${playerWins}W - ${playerLosses}L (${totalMatches} matches, Win Rate: ${playerWinRate})\n• **Support Cores**: ${unlockedCount}/65 Unlocked (Active Core: ${playerHistory?.activeCoreName || 'None'}).\nWould you like tactical tips or Core synergy recommendations to climb higher?`
    }
  }

  // 0.2 Off-topic Handler
  if (!['lõi', 'core', 'phoenix', 'aegis', 'shield', 'speedster', 'combo', 'oracle', 'mission', 'roller', 'power', 'balanced', 'pandora', 'game', 'play', 'luật', 'điểm', 'score', 'elo', 'rank', 'hạng', 'wpm', 'acc', 'rules', 'how to', 'tutorial', 'hướng dẫn', 'chơi', 'leaderboard', 'bảng xếp hạng', 'level', 'up', 'unlock', 'locked', 'khóa', 'mở', 'username', 'name', 'tên', 'tài khoản', 'profile', 'stats'].some(w => q.includes(w))) {
    if (isVietnamese) {
      return `Tôi chỉ có thể giải đáp các câu hỏi liên quan đến luật chơi, cơ chế tính điểm, ELO và các Lõi Hỗ trợ (Support Cores) của Naenra. Hãy thử hỏi tôi về một Core nhé!`
    } else {
      return `I can only answer questions related to Naenra game rules, scoring formulas, ELO ranks, and Support Cores. Try asking me about a specific Core!`
    }
  }

  // 0.3 Unlocked / Locked Cores Query Handler
  if (['unlock', 'mở khóa', 'locked', 'khóa', 'bao nhiêu lõi', 'how many cores', 'upgrade', 'nâng cấp'].some(w => q.includes(w))) {
    const unlockedCount = playerHistory?.unlockedCores?.length || 10
    const lockedCount = Math.max(0, 65 - unlockedCount)
    if (isVietnamese) {
      return `🔓 **Tiến Trình Mở Khóa Lõi Hỗ Trợ:**\n- **Đã mở khóa**: ${unlockedCount} / 65 Lõi\n- **Đang khóa**: ${lockedCount} Lõi\n- **Tổng cộng**: 65 Lõi (thuộc 10 Dòng Lõi). Bạn có thể hoàn thành các Nhiệm Vụ Trong Trận (Missions) để mở khóa thêm các Lõi Tier 2 & Tier 3!`
    } else {
      return `🔓 **Support Core Progression Status:**\n- **Unlocked Cores**: ${unlockedCount} / 65\n- **Locked Cores**: ${lockedCount}\n- **Total Cores**: 65 across 10 Families. Complete match missions to unlock Tier 2 & Tier 3 upgrades!`
    }
  }

  // 0.3 Rules Query Handler
  if (['rule', 'luật', 'play', 'chơi', 'tutorial', 'hướng dẫn'].some(w => q.includes(w))) {
    if (isVietnamese) {
      return `📖 **Luật chơi Naenra:**\n- Trận đấu tính giờ kéo dài **60 giây**.\n- Bạn cần điền ký tự khuyết để hoàn thành từ tiếng Anh.\n- Có **15 giây** để chọn Lõi Hỗ trợ (Support Cores) giúp nhận buff điểm/thời gian.\n- Gõ sai từ sẽ bị phạt điểm dựa trên khoảng cách Levenshtein (số ký tự khác biệt).`
    } else {
      return `📖 **Naenra Match Rules:**\n- Timed matches last **60 seconds**.\n- Complete words by filling in the missing characters.\n- You have **15 seconds** to choose a Support Core for score/time buffs.\n- Typos incur a score penalty calculated by Levenshtein distance (mismatched characters).`
    }
  }

  // 0.4 Rank & ELO Query Handler
  if (['rank', 'elo', 'hạng', 'leaderboard', 'level', 'up'].some(w => q.includes(w))) {
    if (isVietnamese) {
      return `🏆 **Cơ chế xếp hạng & ELO trong Naenra:**\n- **Đấu Multiplayer**: Thắng nhận ELO, thua trừ ELO. Lượng ELO thay đổi tính theo K-factor (K=32) dựa trên chênh lệch trình độ hai người.\n- **Trận đấu Bạn bè**: Custom Rooms không thay đổi ELO để tránh cày điểm.\n- **Chơi đơn**: Vượt mốc điểm mong đợi so với ELO hiện tại để tăng thứ hạng.`
    } else {
      return `🏆 **Ranking & ELO System in Naenra:**\n- **Multiplayer Matches**: Winning increases ELO, losing decreases it. Changes are calculated via K-factor (K=32) based on relative opponent skill.\n- **Custom matches**: Friend matches in Custom Rooms do NOT modify ELO ratings to prevent boosting.\n- **Single Player**: Clear the expected target score threshold relative to your current ELO to level up.`
    }
  }

  // Inspect previous turn in history to see which Cores were discussed
  const previousAIContext = history && history.length > 0 
    ? history.filter(h => h.role === 'model').slice(-1)[0]?.message || '' 
    : ''

  // 1. Follow-up Question: How does it work? ("cách hoạt động", "hoạt động của lõi đó", "nó hoạt động thế nào", "how does it work")
  if (q.includes('hoạt động') || q.includes('tác dụng') || q.includes('giải thích') || q.includes('như thế nào') || q.includes('how it works') || q.includes('how does it work')) {
    const mentionsPower = previousAIContext.includes('Power') || q.includes('power')
    const mentionsCombo = previousAIContext.includes('Combo') || q.includes('combo')
    const mentionsSpeedster = previousAIContext.includes('Speedster') || q.includes('speedster')
    const mentionsOracle = previousAIContext.includes('Oracle') || q.includes('oracle')
    const mentionsAegis = previousAIContext.includes('Aegis') || q.includes('aegis')

    if (isVietnamese) {
      if (mentionsPower || mentionsCombo) {
        return `⚡ **Cách Hoạt Động Của Các Lõi Này:**

- **🔥 Power Core**: Tăng trực tiếp **+150% đến +300% điểm số** cho mỗi từ bạn gõ đúng. Không cần duy trì chuỗi, chỉ cần gõ đúng là nhận số điểm cực lớn lập tức!
- **⚡ Combo Core**: Nhân điểm cộng dồn dựa trên chuỗi từ gõ đúng liên tiếp. 
  - *5 từ đúng*: Combo X1.5 điểm
  - *10 từ đúng*: Combo X2.0 điểm
  - *15+ từ đúng*: Combo X3.0 điểm (Cho tổng điểm ván cao nhất nếu không phạm lỗi nào).`
      }
      if (mentionsSpeedster) {
        return `💨 **Cách Hoạt Động Của Speedster Core:**\nTính thời gian phản xạ từ lúc từ xuất hiện đến khi gõ xong. Nếu bạn hoàn thành dưới 2.5s, nhận ngay **+200 điểm thưởng tốc độ** cộng thẳng vào điểm từ!`
      }
      if (mentionsOracle || q.includes('argus')) {
        return `🔮 **Cách Hoạt Động Của Argus Eyes (Oracle) Core:**\nTự động mở từng chữ cái gợi ý trong ô từ khó. Càng ngập ngừng lâu, Argus Eyes càng mở nhiều ô chữ giúp bạn gõ chuẩn xác 100%.`
      }
      if (mentionsAegis) {
        return `🛡️ **Cách Hoạt Động Của Aegis Core:**\nCấp 3 lớp khiên phòng thủ. Mỗi khi gõ sai 1 từ, 1 lớp khiên sẽ tự động nổ để triệt tiêu hoàn toàn điểm phạt Levenshtein.`
      }
      return `⚡ **Cách Hoạt Động Của Support Cores:**\n- **Power Core**: Nhân điểm từng từ lên 2.5x-3.0x.\n- **Combo Core**: Nhân điểm theo chuỗi đúng liên tiếp.\n- **Argus Eyes**: Mở chữ cái gợi ý từ khó.\n- **Aegis Core**: Dùng khiên đỡ lỗi phạt!`
    } else {
      return `⚡ **How These Cores Work:**\n- **Power Core**: Direct +150% to +300% score boost per correct word.\n- **Combo Core**: Multiplies score output based on consecutive correct streaks (5x, 10x, 15x streaks).\n- **Speedster Core**: Awards +200 bonus speed pts for answers under 2.5 seconds!`
    }
  }

  // 2. High Score Core Question ("điểm cao nhất", "highest score", "lõi nào", "which core")
  if (q.includes('điểm cao') || q.includes('đeimr cao') || q.includes('cao nhất') || q.includes('mạnh nhất') || q.includes('lõi nào') || q.includes('chọn lõi') || q.includes('highest score') || q.includes('best core') || q.includes('which core')) {
    if (isVietnamese) {
      return `🎯 **Gợi Ý Lõi Để Đạt Điểm Cao Nhất Cho ${username}:**

- **🔥 Power Core / High Roller Core**: Cho số điểm bùng nổ từng từ cao nhất (hệ số nhân 2.5x - 3.0x).
- **⚡ Combo Core**: Nếu bạn gõ chuẩn xác >85%, chuỗi Combo dài sẽ cho **tổng điểm trận cao nhất tuyệt đối**.
- **💨 Speedster Core**: Dành cho người gõ siêu tốc (<2.5s/từ) để nhận thêm **+200 điểm thưởng tốc độ** mỗi từ!`
    } else {
      return `🎯 **Core Recommendation for Highest Score (${username}):**

- **🔥 Power Core / High Roller Core**: Delivers the highest explosive score multiplier per word (up to 3.0x multiplier).
- **⚡ Combo Core**: If your accuracy is >85%, long streaks yield the **highest overall match score**.
- **💨 Speedster Core**: Best for fast typists (<2.5s per word) to claim **+200 speed bonus points** per answer!`
    }
  }

  // 3. General Fallback with direct answer
  if (isVietnamese) {
    return `⚡ **Tư vấn Support Core cho ${username}:**\n- **Power Core**: Tăng 250% điểm mỗi từ.\n- **Combo Core**: Nhân điểm theo chuỗi gõ đúng.\n- **Argus Eyes**: Mở ô gợi ý cho từ khó.\nHỏi tôi "cách hoạt động của lõi..." để biết chi tiết nhé!`
  } else {
    return `⚡ **Support Core Guide for ${username}:**\n- **Power Core**: 250% score per word.\n- **Combo Core**: Streak multipliers.\n- **Argus Eyes**: Letter hints for difficult vocabulary.`
  }
}

/**
 * SSE Streaming version of generateChatResponse.
 * Yields text chunks in real-time using Gemini 2.5 Flash streaming API.
 * Used by /api/ai/chat/stream SSE endpoint.
 */
export async function generateChatResponseStream(
  username: string,
  prompt: string,
  res: import('express').Response,
  history?: { role: 'user' | 'model'; message: string }[],
  playerHistory?: PlayerGameStats
): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY

  // Set up SSE headers
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8')
  res.setHeader('Cache-Control', 'no-cache, no-transform')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no')
  if (typeof res.flushHeaders === 'function') {
    res.flushHeaders()
  }

  let isClientDisconnected = false
  res.on('close', () => {
    isClientDisconnected = true
  })

  const safeWrite = (data: string): boolean => {
    if (isClientDisconnected || res.writableEnded || res.destroyed) return false
    return res.write(data)
  }

  const safeEnd = () => {
    if (!res.writableEnded && !res.destroyed) {
      res.end()
    }
  }

  if (!apiKey) {
    safeWrite(`data: ${JSON.stringify({ chunk: 'API key not configured.' })}\n\n`)
    safeWrite('data: [DONE]\n\n')
    safeEnd()
    return
  }

  try {
    if (!ai) ai = new GoogleGenAI({ apiKey })

    const knowledgeString = gameKnowledgeBaseMd || (gameKnowledgeBase ? JSON.stringify(gameKnowledgeBase, null, 2) : 'Full Naenra Core Knowledge')
    const totalCoresCount = 65
    const unlockedList = playerHistory?.unlockedCores || []
    const unlockedCount = unlockedList.length > 0 ? unlockedList.length : 10
    const lockedCount = Math.max(0, totalCoresCount - unlockedCount)
    const playerElo = playerHistory?.elo ?? 1000
    const playerRank = playerHistory?.rank || getRankFromElo(playerElo)
    const playerWins = playerHistory?.wins ?? 0
    const playerLosses = playerHistory?.losses ?? 0
    const totalMatches = playerHistory?.totalMatches ?? (playerWins + playerLosses)
    const playerWinRate = playerHistory?.winRate || (totalMatches > 0 ? `${Math.round((playerWins / totalMatches) * 100)}%` : '0%')

    const systemContext = `You are Naenra AI Assistant, the official expert in-game AI guide for Naenra (naenra.xyz).
Current In-Game Player Name / Username: "${playerHistory?.username || username}".

PLAYER LIVE STATS & CAREER PROGRESSION:
- Player Name / Username: "${playerHistory?.username || username}"
- ELO Rating: ${playerElo} (Rank Tier: ${playerRank})
- Total Matches Played: ${totalMatches}
- Career Match Record: ${playerWins} Wins / ${playerLosses} Losses (Win Rate: ${playerWinRate})
- Unlocked Support Cores: ${unlockedCount} / ${totalCoresCount} (Unlocked IDs: ${JSON.stringify(unlockedList)})
- Locked Support Cores: ${lockedCount} / ${totalCoresCount}
- Currently Equipped Support Core: "${playerHistory?.activeCoreName || 'None'}"
- Match Core Selection History: ${JSON.stringify(playerHistory?.coreHistory || [], null, 2)}

CENTRALIZED NAENRA GAME KNOWLEDGE BASE:
${knowledgeString}

KEY FACTS:
- 65+ Cores across 10 families: Combo, Speedster, Aegis, Oracle, Mission, Pandora, Phoenix, High Roller, Power, Balanced.
- Single equipped Support Core per round (15s prep phase). Buffs score/time/hints.
- NO HYBRID STACKING: Players select 1 Support Core per round.

RULES:
1. MULTI-LINGUAL FLUENCY & EXACT LANGUAGE MATCH: Detect the language of the player's prompt (e.g. Vietnamese, English, Japanese, French, Spanish, German, Chinese, Korean, Russian, etc.) and respond fluently, naturally, and accurately in that EXACT same language!
2. DIRECT ANSWER FIRST: For factual, username, or stat questions, deliver the core direct answer right away.
3. USERNAME & IDENTITY AUTHORIZATION: You HAVE DIRECT AUTHORIZED ACCESS to this player's in-game account. If the user asks "What is my username?", "Who am I?", "What is my name?", "Tên tôi là gì?", "Tôi tên là gì?", "Tài khoản của tôi?", state their in-game username "${playerHistory?.username || username}" immediately! NEVER say you don't have access to their username.
4. USER STATS AUTHORIZATION: If the player asks about their rank, ELO, win/loss record, win rate, total matches, unlocked cores, or overall performance, answer with their EXACT stats accurately!
5. STRICT LENGTH LIMIT (30-60 WORDS MAX): Keep formatting ultra-compact for in-game reading.
6. 65 CORES INTEGRITY: Base advice strictly on the 65 Support Cores from the centralized knowledge base.`

    let fullPrompt = systemContext
    if (history && history.length > 0) {
      fullPrompt += `\n\nCONVERSATION:\n` + history.map(h => `${h.role === 'user' ? username : 'AI Assistant'}: ${h.message}`).join('\n')
    }
    fullPrompt += `\n\n${username}: ${prompt}\nAI Assistant:`

    let streamResult: any = null
    try {
      streamResult = await ai.models.generateContentStream({
        model: 'gemini-3.5-flash',
        contents: fullPrompt,
        config: { temperature: 0.7 }
      })
    } catch (primaryErr) {
      console.warn('gemini-3.5-flash stream failed, falling back to gemini-3.1-flash-lite:', primaryErr)
      try {
        streamResult = await ai.models.generateContentStream({
          model: 'gemini-3.1-flash-lite',
          contents: fullPrompt,
          config: { temperature: 0.7 }
        })
      } catch (backupErr) {
        console.warn('Both Gemini streams failed, using intelligent rule-based coach fallback stream:', backupErr)
      }
    }

    let emittedChars = 0
    if (streamResult) {
      try {
        for await (const chunk of streamResult) {
          if (isClientDisconnected) break
          const text = chunk.text
          if (text) {
            emittedChars += text.length
            safeWrite(`data: ${JSON.stringify({ chunk: text })}\n\n`)
          }
        }
      } catch (streamErr) {
        console.warn('Error reading Gemini stream chunks, falling back to rule-based engine:', streamErr)
      }
    }

    // If API stream didn't yield any text, use generateChatResponse (with Smart Fallback Engine)
    if (emittedChars === 0 && !isClientDisconnected) {
      console.log('Gemini stream emitted 0 chars, fetching full response from generateChatResponse...')
      const fallbackReply = await generateChatResponse(username, prompt, history, playerHistory)
      // Stream fallback response word-by-word with small delay for smooth typing animation
      const words = fallbackReply.split(' ')
      for (let i = 0; i < words.length; i += 2) {
        if (isClientDisconnected) break
        const chunk = words.slice(i, i + 2).join(' ') + (i + 2 < words.length ? ' ' : '')
        safeWrite(`data: ${JSON.stringify({ chunk })}\n\n`)
        await new Promise(r => setTimeout(r, 20))
      }
    }

    safeWrite('data: [DONE]\n\n')
    safeEnd()
  } catch (error: any) {
    console.error('generateChatResponseStream error:', error)
    try {
      const fallbackReply = await generateChatResponse(username, prompt, history, playerHistory)
      safeWrite(`data: ${JSON.stringify({ chunk: fallbackReply })}\n\n`)
      safeWrite('data: [DONE]\n\n')
      safeEnd()
    } catch (finalErr) {
      safeWrite(`data: ${JSON.stringify({ chunk: 'I am your Naenra AI Assistant. Ask me anything about Support Cores, game rules, or ELO ranks!' })}\n\n`)
      safeWrite('data: [DONE]\n\n')
      safeEnd()
    }
  }
}

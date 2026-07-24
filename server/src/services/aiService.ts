import { GoogleGenAI, Type, Schema } from '@google/genai'

// We instantiate it dynamically inside the function to ensure dotenv is loaded
let ai: GoogleGenAI | null = null;

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

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: questionSchema,
        temperature: 0.7,
      }
    })

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
  // If GEMINI_API_KEY is available, use Gemini 2.5 Flash
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
1. FLEXIBLE & HELPFUL: Answer questions about typing, vocabulary learning, Naenra game mechanics, Support Cores, ELO ranks, or player statistics.
2. CONVERSATIONAL REPLIES: For simple greetings ("hi", "hello"), acknowledgments ("no", "yes", "ok", "sure"), or casual chatter, respond naturally and concisely as their coach without dumping full statistical reports.
3. TOPIC GUARDRAIL: If the user asks completely off-topic questions (e.g. recipes, non-gaming coding, general trivia, politics), politely decline and pivot back to Naenra typing skills and vocabulary mastery.
4. Keep responses engaging, concise (under 150 words), and formatted with markdown.`

      let prompt = systemContext
      if (history && history.length > 0) {
        prompt += `\n\nCONVERSATION HISTORY:\n` + history.map(h => `${h.role === 'user' ? 'Player' : 'AI Coach'}: ${h.message}`).join('\n')
      }

      if (userMessage) {
        prompt += `\n\nPlayer question: "${userMessage}"\nRespond directly as Naenra AI Coach:`
      } else {
        prompt += `\n\nProvide an initial comprehensive analysis and personalized 3-step learning plan for ${username}:`
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          temperature: 0.7,
        }
      })

      if (response.text) {
        return response.text
      }
    } catch (error) {
      console.warn("Gemini API call failed, falling back to rule-based coach analysis:", error)
    }
  }

  // --- SMART FALLBACK AI COACH (when GEMINI_API_KEY is not set or API fails) ---
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
    const qLower = userMessage.trim().toLowerCase()

    // 1. Greetings
    if (['hi', 'hello', 'hey', 'sup', 'yo', 'halo', 'chào'].some(g => qLower === g || qLower.startsWith(g + ' '))) {
      return `👋 Hey **${username}**! Ready to sharpen your typing skills today? Ask me about your weak spots, core strategies, or how to boost your ELO rank!`
    }

    // 2. Acknowledgments / Short conversational replies ("no", "yes", "ok", "cool")
    if (['no', 'nope', 'nah', 'not really', 'no thanks'].includes(qLower)) {
      return `👍 No problem, **${username}**! Whenever you're ready, just ask me about your weak words or Core strategies to prepare for your next match.`
    }
    if (['yes', 'yeah', 'yep', 'ok', 'okay', 'sure', 'cool', 'alright'].includes(qLower)) {
      return `⚡ Awesome! Let's get to work, **${username}**. You can ask me how to master **${worstTopic?.topic || 'difficult topics'}** or which Support Core fits your playstyle best!`
    }

    // 3. Identity / Capability questions
    if (qLower.includes('what are you') || qLower.includes('who are you') || qLower.includes('what can you do') || qLower.includes('who r u') || qLower.includes('what r u')) {
      return `🤖 I am **Naenra AI Coach**! Your personal AI learning assistant in the Naenra competitive typing arena.\n\nI analyze your match history, track your vocabulary accuracy across topics, highlight your missed words, and recommend custom Core strategies to help you dominate ranked matches!`
    }

    // 4. Gratitude / Farewells
    if (qLower.includes('thank') || qLower.includes('thanks') || qLower.includes('cảm ơn') || qLower.includes('bye')) {
      return `😊 You're very welcome, **${username}**! Keep practicing and climbing the leaderboard. Good luck in your next match!`
    }

    // 5. Gaming & Topic Questions
    if (qLower.includes('science') || qLower.includes('sports') || qLower.includes('topic') || qLower.includes('master') || qLower.includes('daily') || qLower.includes('accuracy')) {
      return `🎯 **Coach Advice for ${username}:**\nTo master your topics, focus on words with high error rates. For **${worstTopic ? worstTopic.topic : 'weak areas'}**, practice typing target terms repeatedly in Single Player matches. Using **Oracle Core** will grant letter hints to build muscle memory!`
    }
    if (qLower.includes('core') || qLower.includes('strategy') || qLower.includes('power') || qLower.includes('combo') || qLower.includes('oracle') || qLower.includes('speed')) {
      return `⚡ **Core Selection Strategy:**\n- **Combo Core**: Great if your overall accuracy is over 70% to stack score multipliers.\n- **Oracle Core**: Best for topics like **${worstTopic?.topic || 'difficult categories'}** where you need hint reveals.\n- **Speedster**: Use on topics like **${bestTopic?.topic || 'your top category'}** where your typing speed is highest!`
    }
    if (qLower.includes('weak') || qLower.includes('miss') || qLower.includes('word')) {
      return `💡 **Weak Words Focus:**\nYour top missed words are: **${topWeakWords.map(w => `\`${w.word}\` (${w.incorrect} misses)`).join(', ') || 'None'}**. Try slowing down slightly on these specific words to build accuracy before increasing speed!`
    }

    // 6. Off-topic Guardrail Filter (e.g. recipe, weather, coding external app)
    if (qLower.includes('recipe') || qLower.includes('pizza') || qLower.includes('weather') || qLower.includes('code') || qLower.includes('python') || qLower.includes('song')) {
      return `🤖 As your **Naenra AI Coach**, I specialize in helping you improve your typing speed, vocabulary accuracy, and game tactics! Ask me about your missed words, category stats, or Core selection.`
    }

    // 7. General typing advice
    return `💡 **Coach Advice for ${username}:**\nBased on your recent matches, your accuracy in **${bestTopic?.topic || 'top topics'}** is **${bestTopic?.accuracy || 80}%**. Focus on practicing your weakest words (**${topWeakWords.map(w => w.word).join(', ') || 'missed terms'}**) or ask me about **Core strategies**!`
  }

  const weakWordsList = topWeakWords.length > 0 
    ? topWeakWords.map(w => `\`${w.word}\` (${w.incorrect} misses)`).join(', ')
    : 'None yet! Great job.'

  return `Hey **${username}**! I've analyzed your performance data across **${analyticsData.length}** vocabulary categories. Here is your personalized learning report:

🎯 **Key Highlights:**
- **Strongest Category:** **${bestTopic?.topic || 'General'}** (${bestTopic?.accuracy || 0}% accuracy)
- **Focus Area:** **${worstTopic?.topic || 'General'}** (${worstTopic?.accuracy || 0}% accuracy)

💡 **Weakest Words to Watch Out For:**
${weakWordsList}

⚡ **3-Step Action Plan:**
1. **Warm Up:** Play 1-2 Single Player matches in **${bestTopic?.topic || 'your strong topic'}** to get into your typing rhythm.
2. **Target Weak Spots:** Focus on **${worstTopic?.topic || 'difficult topics'}** and take extra care when typing **${topWeakWords[0]?.word || 'missed terms'}**.
3. **Core Synergies:** Equip **Oracle Core** to reveal hints on tough words, or **Combo Core** to maximize your high accuracy streaks!`
}

export async function generateChatResponse(
  username: string,
  prompt: string,
  history?: { role: 'user' | 'model'; message: string }[]
): Promise<string> {
  if (process.env.GEMINI_API_KEY) {
    try {
      if (!ai) {
        ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
      }

      const systemContext = `You are Naenra Assistant, the official AI guide and expert for Naenra — a fast-paced competitive vocabulary typing arena game (live at naenra.xyz).
Player username: "${username}".

COMPREHENSIVE NAENRA GAME KNOWLEDGE:

1. GAME STRUCTURE & MATCH LOOP:
- 3-Round Match Loop:
  Phase 1: Support Core Selection (15 seconds) — choose 1 Support Core strategy.
  Phase 2: Typing Gameplay (60 seconds) — type answers into letter slots with dynamic animated backgrounds & audio feedback.
  Phase 3: Match Recap & Analytics — score breakdown, WPM, accuracy %, ELO updates.
- Game Modes: Ranked Matchmaking, Single Player practice, and 1v1 Custom Multiplayer Rooms (create/join via room code).

2. ALL 10 SUPPORT CORE FAMILIES & STRATEGIES:
- Combo Core: Multiplies score output based on consecutive correct streaks (Perfect Combo, Radiant Combo, Prismatic Combo). Best for high-accuracy players.
- Speedster Core: Gives massive speed bonus based on time taken (up to +200 bonus pts for fast answers under 60s), cyan timer glow, and wind overlay visual effects.
- Oracle Core: Gives progressive letter hints (Tier 1-3) for difficult vocabulary words (Argus Eyes, Clairvoyance, Omniscience).
- Aegis Core / Aegis Shield: Grants protective shields that absorb penalties from spelling mistakes (Reflective Aegis, Shield Battery, Bastion of Light).
- Mission Core: Gives in-match mini-quests and bounties for extra bonus points (Bounty Hunter, Apex Predator, Exodia).
- Phoenix Core: Grants rebirth and comeback bonuses when player health or score is falling behind (Phoenix Flame, Rebirth, Immortal Phoenix).
- Pandora Core: High-risk/high-reward chaos prism & entropy mechanics with unpredictable multiplier gambles (Pandora's Box, Chaos Theory).
- High Roller Core: Gambling, jackpot, and all-in risk-taking score multipliers (Jackpot, Double or Nothing, All In).
- Power Core: Raw score output, hypercharge, and overclocking multipliers (Power Strike, Overclock, Supernova).
- Balanced Core: Equilibrium, steady score scaling, and high error tolerance (Harmony, Equilibrium, Zenith).

3. SCORING ENGINE & ANTI-CHEAT FORMULAS:
- Correct Base Score: 100 points + flat core buff × multiplier core buff.
- Speedster Formula: speedBonus = floor((1 - timeTaken/60000) * 200). Points = 100 + speedBonus.
- Levenshtein Wrong Answer Penalty:
  * High accuracy (≥80%): penalty = distance × 2 (uncapped).
  * Low accuracy (<80% or Skip): penalty = clamp(distance × 10, 10 to 50 pts).
- Anti-Cheat: All scoring runs strictly server-side using strategy pattern. Active Core ID is locked per session.

4. ELO RANKING SYSTEM:
- Starting ELO: 1000 ELO (Bronze I).
- Rank Tiers:
  * Bronze I-III: 0 - 1499 ELO
  * Silver I-III: 1500 - 2999 ELO
  * Gold I-III: 3000 - 4499 ELO
  * Platinum I-III: 4500 - 5999 ELO
  * Diamond I-III: 6000 - 7499 ELO
  * Master: 7500 - 7999 ELO
  * Grandmaster: 8000+ ELO

5. ADDITIONAL FEATURES:
- Vocabulary Analytics: Tracks topic accuracy, unique words count, and weakest/most missed words.
- Profile & Avatars: Custom username and avatars (Google OAuth, Dicebear avatar seeds, custom image uploads).
- Single Active Session: Security protection against concurrent logins.

GUIDELINES FOR RESPONDING:
1. Be helpful, concise, enthusiastic, and encouraging — like an expert e-sports coach and guide.
2. Respond naturally in whatever language the user speaks to you (English or Vietnamese).
3. Provide precise, accurate game details based on the rules above whenever asked about mechanics, cores, formulas, or ranks.
4. If asked about unrelated non-gaming topics (recipes, weather, external coding), politely pivot back to Naenra typing and strategies.
5. Use markdown formatting (bold, bullet points) for readability. Keep answers clear and under 150 words unless detailed explanation is requested.`

      let fullPrompt = systemContext

      if (history && history.length > 0) {
        fullPrompt += `\n\nCONVERSATION HISTORY:\n` +
          history.map(h => `${h.role === 'user' ? username : 'Assistant'}: ${h.message}`).join('\n')
      }

      fullPrompt += `\n\n${username}: ${prompt}\nAssistant:`

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: fullPrompt,
        config: { temperature: 0.7 }
      })

      if (response.text) return response.text
    } catch (error) {
      console.warn('Gemini API failed for chat, using fallback:', error)
    }
  }

  // --- FALLBACK ---
  const q = prompt.trim().toLowerCase()
  if (['hi', 'hello', 'hey', 'yo', 'chào'].some(g => q === g || q.startsWith(g + ' '))) {
    return `👋 Xin chào **${username}**! Tôi là Naenra Assistant. Hỏi tôi bất cứ điều gì về game, Support Cores, ELO hay từ vựng nhé!`
  }
  if (q.includes('core') || q.includes('combo') || q.includes('oracle') || q.includes('speedster')) {
    return `⚡ **Support Cores:**\n- **Combo Core**: Nhân điểm khi chuỗi đúng liên tiếp\n- **Oracle Core**: Hé lộ gợi ý chữ cái giúp vượt từ khó\n- **Speedster Core**: Thưởng điểm cho tốc độ gõ cao\n\nChọn Core phù hợp với điểm mạnh của bạn để tối đa điểm số!`
  }
  if (q.includes('elo') || q.includes('rank') || q.includes('hạng')) {
    return `🏆 **Bảng Xếp Hạng Naenra:**\nBronze → Silver → Gold → Platinum → Diamond → Master → **Grandmaster** (8000+ ELO)\n\nELO tăng khi thắng trận và giảm khi thua. Hãy chọn Core phù hợp để tối ưu điểm số mỗi trận!`
  }
  return `🤖 **Naenra Assistant** sẵn sàng hỗ trợ **${username}**! Hỏi tôi về Support Cores, chiến thuật gõ phím, ELO hay bất cứ điều gì liên quan đến Naenra nhé.`
}



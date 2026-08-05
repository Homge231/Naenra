import { GoogleGenAI, Type, Schema } from '@google/genai'
import fs from 'fs'
import path from 'path'

// We instantiate it dynamically inside the function to ensure dotenv is loaded
let ai: GoogleGenAI | null = null;

// Load knowledge base JSON
let gameKnowledgeBase: any = null
try {
  const knowledgePath = path.join(__dirname, '../data/naenra_knowledge.json')
  if (fs.existsSync(knowledgePath)) {
    gameKnowledgeBase = JSON.parse(fs.readFileSync(knowledgePath, 'utf-8'))
  }
} catch (e) {
  console.warn('Failed to load naenra_knowledge.json:', e)
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

export async function generateChatResponse(
  username: string,
  prompt: string,
  history?: { role: 'user' | 'model'; message: string }[],
  playerHistory?: { coreHistory?: any[]; unlockedCores?: string[]; elo?: number }
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY
  if (apiKey) {
    try {
      if (!ai) {
        ai = new GoogleGenAI({ apiKey })
      }

      const knowledgeString = gameKnowledgeBase ? JSON.stringify(gameKnowledgeBase, null, 2) : 'Full Naenra Core Knowledge'
      const historyString = playerHistory ? JSON.stringify(playerHistory, null, 2) : 'No recent selection history'

      const systemContext = `You are Naenra Cyber Assistant, the official expert AI guide and personalized coach for Naenra (live at naenra.xyz).
Player username: "${username}".

PLAYER CORE SELECTION & MATCH HISTORY:
${historyString}

CENTRALIZED NAENRA GAME KNOWLEDGE FILE DATA:
${knowledgeString}

STRICT RESPONSE RULES:
1. MATCH USER LANGUAGE EXACTLY: If the user asks in Vietnamese, YOU MUST RESPOND IN VIETNAMESE! If in English, respond in English!
2. CONTINUITY & CONTEXT AWARENESS: Pay close attention to conversation history! If the user asks follow-up questions like "cách hoạt động của lõi đó" (how does that core work?), "giải thích thêm", or "tại sao", refer back to the exact Support Cores mentioned in the previous turn and explain their detailed mechanics!
3. NO REPETITIVE INTROS: Jump directly into answering the user's question. Do NOT repeat generic greetings or bot introductions.
4. FOR HIGH SCORE QUESTIONS ("điểm cao nhất", "highest score", "lõi nào mạnh nhất"):
   Explain clearly:
   - **Power Core / High Roller Core**: Cho điểm bùng nổ từng từ cao nhất (nhân điểm up to 3.0x, High Stakes Jackpot).
   - **Combo Core**: Nếu độ chính xác >85%, chuỗi Combo liên tục cho tổng điểm tối đa cao nhất toàn ván.
   - **Speedster Core**: Cho tốc độ gõ dưới 2.5 giây (+200 điểm thưởng/từ).
5. Concise markdown formatting (bold, bullet points). Keep under 180 words.`

      let fullPrompt = systemContext

      if (history && history.length > 0) {
        fullPrompt += `\n\nCONVERSATION HISTORY:\n` +
          history.map(h => `${h.role === 'user' ? username : 'Cyber Assistant'}: ${h.message}`).join('\n')
      }

      fullPrompt += `\n\n${username}: ${prompt}\nCyber Assistant:`

      let responseText = ''
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: fullPrompt,
          config: { temperature: 0.7 }
        })
        responseText = response.text || ''
      } catch (err2) {
        const response2 = await ai.models.generateContent({
          model: 'gemini-1.5-flash',
          contents: fullPrompt,
          config: { temperature: 0.7 }
        })
        responseText = response2.text || ''
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
      if (mentionsOracle) {
        return `🔮 **Cách Hoạt Động Của Oracle Core:**\nTự động mở từng chữ cái gợi ý trong ô từ khó. Càng ngập ngừng lâu, Oracle càng mở nhiều ô chữ giúp bạn gõ chuẩn xác 100%.`
      }
      if (mentionsAegis) {
        return `🛡️ **Cách Hoạt Động Của Aegis Core:**\nCấp 3 lớp khiên phòng thủ. Mỗi khi gõ sai 1 từ, 1 lớp khiên sẽ tự động nổ để triệt tiêu hoàn toàn điểm phạt Levenshtein.`
      }
      return `⚡ **Cách Hoạt Động Của Support Cores:**\n- **Power Core**: Nhân điểm từng từ lên 2.5x-3.0x.\n- **Combo Core**: Nhân điểm theo chuỗi đúng liên tiếp.\n- **Oracle Core**: Mở chữ cái gợi ý từ khó.\n- **Aegis Core**: Dùng khiên đỡ lỗi phạt!`
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
    return `⚡ **Tư vấn Support Core cho ${username}:**\n- **Power Core**: Tăng 250% điểm mỗi từ.\n- **Combo Core**: Nhân điểm theo chuỗi gõ đúng.\n- **Oracle Core**: Mở ô gợi ý cho từ khó.\nHỏi tôi "cách hoạt động của lõi..." để biết chi tiết nhé!`
  } else {
    return `⚡ **Support Core Guide for ${username}:**\n- **Power Core**: 250% score per word.\n- **Combo Core**: Streak multipliers.\n- **Oracle Core**: Letter hints for difficult vocabulary.`
  }
}

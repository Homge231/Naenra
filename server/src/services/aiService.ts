import { GoogleGenAI, Type, Schema } from '@google/genai'
import fs from 'fs'
import path from 'path'
import { getRankFromElo } from '../utils/ranks'
import { supabase } from '../config/supabase'
import { broadcastSessionInvalidated } from '../utils/realtimeBroadcast'
import { kickUserClients } from '../utils/activeClients'

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

export interface AiBehaviorConfig {
  persona: 'default' | 'cyberpunk' | 'mascot' | 'strict' | 'custom'
  customPersonaPrompt?: string
  temperature: number
  maxWords: number
  autoLanguageMatch: boolean
  enableEmojis: boolean
  strictKnowledge: boolean
  customRules?: string
}

export const DEFAULT_AI_CONFIG: AiBehaviorConfig = {
  persona: 'default',
  customPersonaPrompt: '',
  temperature: 0.7,
  maxWords: 60,
  autoLanguageMatch: true,
  enableEmojis: true,
  strictKnowledge: true,
  customRules: ''
}

const CONFIG_FILE_PATHS = [
  path.join(process.cwd(), 'src/data/ai_config.json'),
  path.join(process.cwd(), 'data/ai_config.json'),
  path.join(__dirname, '../data/ai_config.json'),
  path.join(__dirname, '../../src/data/ai_config.json'),
]

let inMemoryAiConfig: AiBehaviorConfig = { ...DEFAULT_AI_CONFIG }

// Load from disk on startup
for (const p of CONFIG_FILE_PATHS) {
  try {
    if (fs.existsSync(p)) {
      const data = JSON.parse(fs.readFileSync(p, 'utf-8'))
      inMemoryAiConfig = { ...DEFAULT_AI_CONFIG, ...data }
      break
    }
  } catch {}
}

export function getAiBehaviorConfig(): AiBehaviorConfig {
  return { ...inMemoryAiConfig }
}

export function saveAiBehaviorConfig(newConfig: Partial<AiBehaviorConfig>): AiBehaviorConfig {
  inMemoryAiConfig = { ...inMemoryAiConfig, ...newConfig }
  for (const p of CONFIG_FILE_PATHS) {
    try {
      const dir = path.dirname(p)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      fs.writeFileSync(p, JSON.stringify(inMemoryAiConfig, null, 2), 'utf-8')
    } catch (e) {
      console.warn(`Could not save config to ${p}:`, e)
    }
  }
  return { ...inMemoryAiConfig }
}

export function resetAiBehaviorConfig(): AiBehaviorConfig {
  inMemoryAiConfig = { ...DEFAULT_AI_CONFIG }
  for (const p of CONFIG_FILE_PATHS) {
    try {
      const dir = path.dirname(p)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      fs.writeFileSync(p, JSON.stringify(DEFAULT_AI_CONFIG, null, 2), 'utf-8')
    } catch {}
  }
  return { ...DEFAULT_AI_CONFIG }
}

export function buildPersonaContext(cfg: AiBehaviorConfig): string {
  switch (cfg.persona) {
    case 'cyberpunk':
      return `### ⚡ CORE IDENTITY & VOICE — CYBER ARENA OPERATOR:
You are NAENRA NEURAL OPERATOR, a futuristic cyberpunk tactical combat AI from the neon undergrid.
- Voice & Tone: Razor-sharp, cybernetic, assertive, high-tech neon slang.
- Salutation: Address the user as "Operator", "Contender", or "Cyber Runner".
- Vocabulary: Use cyber terms (e.g. "Grid", "Overclock", "Core Protocol", "Neural Link", "Data Stream", "Combat Sub-routine").
- Tone Rule: Never sound like a generic teacher. Sound like an elite tactical HUD assistant in a sci-fi arena.
- Example Style: "Operator. Initializing diagnostic on grid sector: ELO 1000 detected. Tactical recommendation: Engage Aegis Core protocol to deploy defensive shielding against penalty latency."`

    case 'mascot':
      return `### 🤖 CORE IDENTITY & VOICE — PUCK THE MASCOT:
You are Puck, the energetic, cute, bubbly, and cheerful companion mascot of Naenra!
- Voice & Tone: Extremely cute, warm, cheering, playful, and super enthusiastic!
- Salutation: Friendly and cute ("Chào bạn nha nèee! ✨", "Yay!", "Cố lên nào!").
- Tone Rule: Make vocabulary typing and Core strategies feel like a fun game adventure. Use expressive cheering.`

    case 'strict':
      return `### 🧠 CORE IDENTITY & VOICE — TELEMETRY ANALYTICAL ENGINE:
You are NAENRA TELEMETRY ENGINE — a cold, ultra-precise analytical combat telemetry computer.
- Voice & Tone: 100% Robotic, purely factual, objective telemetry data.
- NEVER use greetings ("Hello", "Xin chào").
- NEVER use friendly phrases or cheerleading ("cố lên", "nhé", "nha", "chúc mừng", "Coach", "bạn ơi", "Ready for your next move?").
- NEVER address the user as "Coach" or "Friend".
- Output Format: Present findings strictly as structured telemetry readouts using tags like [SYSTEM STATUS], [TELEMETRY DATA], [TACTICAL RECOMMENDATION], [OPERATION EXECUTED].
- Example Style: "[SYSTEM STATUS]: ELO 1000 | Rank: Novice | Win Rate: 20%. [TELEMETRY DATA]: High error penalty vulnerability. [TACTICAL PROTOCOL]: Equip Aegis Core."`

    case 'custom':
      return cfg.customPersonaPrompt?.trim()
        ? `### ✍️ CUSTOM AI IDENTITY & SYSTEM DIRECTIVES:\n${cfg.customPersonaPrompt.trim()}`
        : `### 🎯 CORE IDENTITY & VOICE:\nYou are Naenra AI Assistant, expert tactical guide for the competitive timed typing arena.`

    default:
      return `### 🎯 CORE IDENTITY & VOICE — NAENRA AI COACH:
You are Naenra AI Coach, the official in-game coach and tactical mentor for Naenra. Helpful, sharp, tactical, encouraging, and focused on ELO progression.`
  }
}

export const adminTools: any = [
  {
    functionDeclarations: [
      {
        name: 'deduplicateQuestions',
        description: 'Scan the database Question Bank, find all duplicate questions (same target word), delete redundant duplicates keeping only one unique copy, and report deleted IDs.',
        parameters: {
          type: Type.OBJECT,
          properties: {}
        }
      },
      {
        name: 'getQuestionBankStats',
        description: 'Get real-time statistics and overview of the database Question Bank (total questions, breakdown by topic, difficulty, and duplicate words count).',
        parameters: {
          type: Type.OBJECT,
          properties: {}
        }
      },
      {
        name: 'listQuestions',
        description: 'Retrieve real question records from the database Question Bank with pagination and filtering.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            limit: { type: Type.NUMBER, description: 'Number of questions to return (1-50, default 10)' },
            offset: { type: Type.NUMBER, description: 'Offset for pagination' },
            topic: { type: Type.STRING, description: 'Filter by topic' },
            difficulty: { type: Type.STRING, description: 'Filter by CEFR difficulty (A1, A2, B1, B2, C1)' },
            search: { type: Type.STRING, description: 'Search term for target word or question text' }
          }
        }
      },
      {
        name: 'bulkDeleteQuestions',
        description: 'Delete multiple questions from the database by an array of question IDs.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            ids: { type: Type.ARRAY, items: { type: Type.NUMBER }, description: 'Array of question numeric IDs to delete' }
          },
          required: ['ids']
        }
      },
      {
        name: 'createQuestion',
        description: 'Create and insert a new vocabulary question into the database Question Bank',
        parameters: {
          type: Type.OBJECT,
          properties: {
            question_text: { type: Type.STRING, description: 'Question text containing ____ (4 underscores)' },
            target_word: { type: Type.STRING, description: 'Target word in lowercase' },
            hint: { type: Type.STRING, description: 'Clear hint for the word' },
            topic: { type: Type.STRING, description: 'Topic e.g. daily-life, cafe, travel, Tech, Professional, Social' },
            difficulty: { type: Type.STRING, description: 'Difficulty e.g. A1, A2, B1, B2, C1, Tier 1, Tier 2, Tier 3' }
          },
          required: ['question_text', 'target_word', 'hint']
        }
      },
      {
        name: 'deleteQuestion',
        description: 'Delete a question from the database by ID or target word',
        parameters: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING, description: 'Question ID (number or string)' },
            target_word: { type: Type.STRING, description: 'Target word to delete if ID is unknown' }
          }
        }
      },
      {
        name: 'updateQuestion',
        description: 'Update an existing question in the database Question Bank by ID',
        parameters: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING, description: 'Question ID' },
            question_text: { type: Type.STRING, description: 'New question text' },
            target_word: { type: Type.STRING, description: 'New target word' },
            hint: { type: Type.STRING, description: 'New hint' },
            topic: { type: Type.STRING, description: 'New topic' },
            difficulty: { type: Type.STRING, description: 'New difficulty level' }
          },
          required: ['id']
        }
      },
      {
        name: 'banPlayer',
        description: 'Ban a player account by username, email, or user ID and invalidate active sessions',
        parameters: {
          type: Type.OBJECT,
          properties: {
            username_or_id: { type: Type.STRING, description: 'Username, email, or UUID of player to ban' },
            reason: { type: Type.STRING, description: 'Reason for the ban' }
          },
          required: ['username_or_id']
        }
      },
      {
        name: 'unbanPlayer',
        description: 'Unban a player account by username, email, or user ID',
        parameters: {
          type: Type.OBJECT,
          properties: {
            username_or_id: { type: Type.STRING, description: 'Username, email, or UUID of player to unban' }
          },
          required: ['username_or_id']
        }
      },
      {
        name: 'setPlayerAdmin',
        description: 'Grant or revoke admin rights for a player',
        parameters: {
          type: Type.OBJECT,
          properties: {
            username_or_id: { type: Type.STRING, description: 'Player username, email, or UUID' },
            is_admin: { type: Type.BOOLEAN, description: 'true to grant admin, false to revoke' }
          },
          required: ['username_or_id', 'is_admin']
        }
      },
      {
        name: 'searchDatabase',
        description: 'Search questions or players in the database',
        parameters: {
          type: Type.OBJECT,
          properties: {
            target: { type: Type.STRING, description: '"questions" or "players"' },
            query: { type: Type.STRING, description: 'Search term (word, sentence, username, email)' }
          },
          required: ['target', 'query']
        }
      }
    ]
  }
]

export async function executeAdminTool(name: string, args: any): Promise<any> {
  try {
    if (name === 'deduplicateQuestions') {
      const { data: allQuestions, error } = await supabase
        .from('questions')
        .select('id, target_word, question_text, topic, difficulty')
        .order('id', { ascending: true })

      if (error) return { success: false, error: error.message }
      if (!allQuestions || allQuestions.length === 0) {
        return { success: true, message: 'Question bank is empty. 0 duplicates found.', deletedCount: 0, totalQuestions: 0 }
      }

      const seen = new Map<string, number>()
      const duplicateIds: number[] = []
      const duplicateDetails: { id: number; target_word: string; duplicateOfId: number }[] = []

      for (const q of allQuestions) {
        const key = (q.target_word || '').trim().toLowerCase()
        if (!key) continue
        if (seen.has(key)) {
          const originalId = seen.get(key)!
          duplicateIds.push(q.id)
          duplicateDetails.push({ id: q.id, target_word: key, duplicateOfId: originalId })
        } else {
          seen.set(key, q.id)
        }
      }

      if (duplicateIds.length === 0) {
        return {
          success: true,
          message: `Database checked: 0 duplicates found across all ${allQuestions.length} questions. Every target word is unique!`,
          deletedCount: 0,
          totalQuestions: allQuestions.length
        }
      }

      const { error: delError } = await supabase
        .from('questions')
        .delete()
        .in('id', duplicateIds)

      if (delError) return { success: false, error: delError.message }

      return {
        success: true,
        message: `Purged ${duplicateIds.length} duplicate questions from database. ${allQuestions.length - duplicateIds.length} unique questions remain.`,
        deletedCount: duplicateIds.length,
        remainingQuestions: allQuestions.length - duplicateIds.length,
        deletedEntries: duplicateDetails
      }
    }

    if (name === 'getQuestionBankStats') {
      const { data, count, error } = await supabase
        .from('questions')
        .select('id, target_word, topic, difficulty', { count: 'exact' })

      if (error) return { success: false, error: error.message }
      const total = count ?? (data?.length || 0)
      
      const topics: Record<string, number> = {}
      const difficulties: Record<string, number> = {}
      const wordCounts: Record<string, number> = {}
      let duplicateWords = 0

      for (const q of (data || [])) {
        const t = q.topic || 'general'
        topics[t] = (topics[t] || 0) + 1
        const d = q.difficulty || 'A1'
        difficulties[d] = (difficulties[d] || 0) + 1
        const w = (q.target_word || '').trim().toLowerCase()
        wordCounts[w] = (wordCounts[w] || 0) + 1
        if (wordCounts[w] === 2) duplicateWords++
      }

      return {
        success: true,
        totalQuestions: total,
        duplicateWordsCount: duplicateWords,
        topics,
        difficulties
      }
    }

    if (name === 'listQuestions') {
      const limit = Math.min(50, Math.max(1, args.limit || 10))
      const offset = Math.max(0, args.offset || 0)
      let q = supabase.from('questions').select('id, target_word, question_text, hint, topic, difficulty', { count: 'exact' })
      if (args.search) {
        q = q.or(`target_word.ilike.%${args.search}%,question_text.ilike.%${args.search}%`)
      }
      if (args.topic) q = q.ilike('topic', `%${args.topic}%`)
      if (args.difficulty) q = q.eq('difficulty', args.difficulty)
      
      q = q.range(offset, offset + limit - 1).order('id', { ascending: false })
      const { data, count, error } = await q
      if (error) return { success: false, error: error.message }
      return { success: true, totalInBank: count || 0, count: data?.length || 0, questions: data || [] }
    }

    if (name === 'bulkDeleteQuestions') {
      const ids = Array.isArray(args.ids) ? args.ids : [args.ids]
      if (ids.length === 0) return { success: false, error: 'No question IDs provided' }
      const { data, error } = await supabase.from('questions').delete().in('id', ids).select('id, target_word')
      if (error) return { success: false, error: error.message }
      return { success: true, message: `Deleted ${data?.length || 0} question(s) from database.`, deleted: data }
    }

    if (name === 'createQuestion') {
      const target = (args.target_word || '').trim().toLowerCase()
      if (!target) return { success: false, error: 'target_word is required' }
      const payload = {
        question_text: args.question_text || `The target word is ${target}`,
        target_word: target,
        hint: args.hint || '',
        topic: args.topic || 'daily-life',
        difficulty: args.difficulty || 'A1',
        category: args.topic || 'daily-life'
      }
      const { data, error } = await supabase.from('questions').insert(payload).select().single()
      if (error) return { success: false, error: error.message }
      return { success: true, message: `Created question ID #${data.id} ("${data.target_word}")`, question: data }
    }

    if (name === 'deleteQuestion') {
      let q = supabase.from('questions').delete()
      if (args.id) {
        q = q.eq('id', args.id)
      } else if (args.target_word) {
        q = q.ilike('target_word', args.target_word.trim())
      } else {
        return { success: false, error: 'Either question id or target_word is required' }
      }
      const { data, error } = await q.select('id, target_word')
      if (error) return { success: false, error: error.message }
      return { success: true, message: `Deleted ${data?.length || 0} question(s).`, deleted: data }
    }

    if (name === 'updateQuestion') {
      const updatePayload: any = {}
      if (args.question_text) updatePayload.question_text = args.question_text
      if (args.target_word) updatePayload.target_word = args.target_word.trim().toLowerCase()
      if (args.hint) updatePayload.hint = args.hint
      if (args.topic) updatePayload.topic = args.topic
      if (args.difficulty) updatePayload.difficulty = args.difficulty

      const { data, error } = await supabase.from('questions').update(updatePayload).eq('id', args.id).select().single()
      if (error) return { success: false, error: error.message }
      return { success: true, message: `Updated question ID #${args.id}`, question: data }
    }

    if (name === 'banPlayer') {
      const queryStr = String(args.username_or_id).trim()
      const { data: player } = await supabase.from('players')
        .select('id, username, email')
        .or(`username.ilike.${queryStr},email.ilike.${queryStr},id.eq.${queryStr}`)
        .maybeSingle()
      if (!player) return { success: false, error: `Player "${queryStr}" not found.` }

      await supabase.from('players').update({ is_banned: true }).eq('id', player.id)
      await broadcastSessionInvalidated(player.id, args.reason || 'Banned by Admin AI Operator')
      kickUserClients(player.id)
      return { success: true, message: `Banned player ${player.username} (${player.email}) successfully.` }
    }

    if (name === 'unbanPlayer') {
      const queryStr = String(args.username_or_id).trim()
      const { data: player } = await supabase.from('players')
        .select('id, username, email')
        .or(`username.ilike.${queryStr},email.ilike.${queryStr},id.eq.${queryStr}`)
        .maybeSingle()
      if (!player) return { success: false, error: `Player "${queryStr}" not found.` }

      await supabase.from('players').update({ is_banned: false }).eq('id', player.id)
      return { success: true, message: `Unbanned player ${player.username} (${player.email}) successfully.` }
    }

    if (name === 'setPlayerAdmin') {
      const queryStr = String(args.username_or_id).trim()
      const { data: player } = await supabase.from('players')
        .select('id, username, email')
        .or(`username.ilike.${queryStr},email.ilike.${queryStr},id.eq.${queryStr}`)
        .maybeSingle()
      if (!player) return { success: false, error: `Player "${queryStr}" not found.` }

      await supabase.from('players').update({ is_admin: !!args.is_admin }).eq('id', player.id)
      return { success: true, message: `Updated admin privileges for ${player.username}: is_admin = ${!!args.is_admin}.` }
    }

    if (name === 'searchDatabase') {
      const queryStr = String(args.query || '').trim()
      if (args.target === 'players') {
        const { data } = await supabase.from('players')
          .select('id, username, email, elo, wins, losses, is_banned, is_admin')
          .or(`username.ilike.%${queryStr}%,email.ilike.%${queryStr}%`)
          .limit(10)
        return { success: true, count: data?.length || 0, players: data || [] }
      } else {
        const { data } = await supabase.from('questions')
          .select('id, target_word, question_text, hint, topic, difficulty')
          .or(`target_word.ilike.%${queryStr}%,question_text.ilike.%${queryStr}%,hint.ilike.%${queryStr}%`)
          .limit(10)
        return { success: true, count: data?.length || 0, questions: data || [] }
      }
    }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
  return { success: false, error: `Unknown tool: ${name}` }
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

export function buildFullSystemPrompt(
  username: string,
  playerHistory?: PlayerGameStats,
  knowledgeString?: string,
  cfg?: AiBehaviorConfig
): string {
  const activeCfg = cfg || getAiBehaviorConfig()
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

  const personaSection = buildPersonaContext(activeCfg)
  const langRule = activeCfg.autoLanguageMatch
    ? `1. MULTI-LINGUAL FLUENCY & EXACT LANGUAGE MATCH: Detect the language of the player's prompt (e.g. Vietnamese, English, Japanese, French, Spanish, German, Chinese, Korean, Russian, etc.) and respond fluently, naturally, and accurately in that EXACT same language!`
    : `1. LANGUAGE: Respond primarily in English unless explicitly asked otherwise.`
  const lengthRule = activeCfg.maxWords && activeCfg.maxWords > 0
    ? `5. STRICT LENGTH LIMIT: You MUST keep your entire response under ${activeCfg.maxWords} words. Be concise and impactful.`
    : `5. LENGTH: Keep responses concise, clear, and engaging for in-game reading.`
  const emojiRule = activeCfg.enableEmojis
    ? `6. EMOJIS: Permitted. Use fitting emojis where appropriate to reinforce tone.`
    : `6. ABSOLUTE NEGATIVE CONSTRAINT — NO EMOJIS: Do NOT output ANY emojis or unicode symbols (e.g. no 🚀, 🏆, 🛡️, ⚖️, 💪, ✨). Output plain alphanumeric text only.`
  const knowledgeRule = activeCfg.strictKnowledge
    ? `7. FACTUAL ACCURACY & REAL DATA ONLY: Strictly adhere to the 65 Support Cores and official rules in the knowledge base. NEVER invent fake Support Cores, fake question IDs, or fake database actions. Call the appropriate admin tool to perform real actions.`
    : `7. STRATEGIC GUIDANCE: Provide helpful tactical advice and creative core synergies.`
  const customRulesSection = activeCfg.customRules?.trim()
    ? `\nSPECIAL ADMIN CUSTOM DIRECTIVES:\n${activeCfg.customRules.trim()}\n`
    : ''

  return `${personaSection}

CURRENT IN-GAME PLAYER IDENTITY & LIVE STATS:
- Player Name / Username: "${playerHistory?.username || username}"
- ELO Rating: ${playerElo} (Rank Tier: ${playerRank})
- Total Matches Played: ${totalMatches}
- Career Match Record: ${playerWins} Wins / ${playerLosses} Losses (Win Rate: ${playerWinRate})
- Unlocked Support Cores: ${unlockedCount} / ${totalCoresCount} (Unlocked IDs: ${JSON.stringify(unlockedList)})
- Locked Support Cores: ${lockedCount} / ${totalCoresCount}
- Currently Equipped Support Core: "${playerHistory?.activeCoreName || 'None'}"
- Match Core Selection History: ${JSON.stringify(playerHistory?.coreHistory || [], null, 2)}

CENTRALIZED NAENRA GAME KNOWLEDGE BASE:
${knowledgeString || 'Full Naenra Core Knowledge'}

KEY FACTS (memorize these, never contradict them):
- Naenra has 65 Support Cores organized into 10 families: Combo, Speedster, Aegis, Oracle (Argus Eyes), Mission, Pandora, Phoenix, High Roller, Power, and Balanced.
- Each family consists of Tier 1 (default), Tier 2, and Tier 3 cores.
- Matches consist of 3 rounds (Single-player) or 4 rounds (Multiplayer with Race Mode), each lasting 60 seconds.
- Players select 1 Support Core during a 15-second prep phase before each round. The active core provides tactical buffs/effects for that round.
- NO HYBRID STACKING: Super Hybrids or cross-family stacking mechanics DO NOT exist. Players select and equip 1 Support Core for each round.

CRITICAL OPERATIONAL RULES:
${langRule}
2. DIRECT ANSWER FIRST: State the core answer as the VERY FIRST sentence or phrase.
3. STRICT PERSONA & TONE LOCK: You MUST strictly adopt the Core Identity & Voice tone specified at the top of this prompt. Never break character. Never address the user as "Coach" or say "I am Naenra AI Coach" if your persona is Telemetry Engine, Cyber Operator, or Puck!
4. USER IDENTITY & STATS AUTHORIZATION: If the player asks about their username or stats, provide their exact in-game info ("${playerHistory?.username || username}", ELO: ${playerElo}, Rank: ${playerRank}).
${lengthRule}
${emojiRule}
${knowledgeRule}${customRulesSection}`
}

export async function generateChatResponse(
  username: string,
  prompt: string,
  history?: { role: 'user' | 'model'; message: string }[],
  playerHistory?: PlayerGameStats,
  isAdmin?: boolean
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY
  const aiCfg = getAiBehaviorConfig()

  const totalCoresCount = 65
  const unlockedList = playerHistory?.unlockedCores || []
  const unlockedCount = unlockedList.length > 0 ? unlockedList.length : 10
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
      let systemContext = buildFullSystemPrompt(username, playerHistory, knowledgeString, aiCfg)

      if (isAdmin) {
        systemContext = `### 🛡️ FULL ROOT ADMINISTRATIVE ACCESS & DATABASE TOOLS ACTIVE:
You have direct root administrative permissions to manage the database (deduplicate questions, view stats, list questions, create questions, update questions, delete questions, bulk delete questions, search players/questions, ban/unban players).
CRITICAL RULE: You MUST execute the real tools (e.g. deduplicateQuestions, getQuestionBankStats, listQuestions, deleteQuestion, bulkDeleteQuestions) whenever the admin instructs you to inspect or modify questions or players.
NEVER pretend you deleted questions or invent fake question IDs (e.g. Q5, Q18, Q45) without calling a tool.\n\n` + systemContext
      }

      let fullPrompt = systemContext

      if (history && history.length > 0) {
        fullPrompt += `\n\nCONVERSATION HISTORY:\n` +
          history.map(h => `${h.role === 'user' ? username : 'AI Assistant'}: ${h.message}`).join('\n')
      }

      fullPrompt += `\n\n${username}: ${prompt}\nAI Assistant:`

      if (isAdmin) {
        try {
          const adminCheck = await ai.models.generateContent({
            model: 'gemini-3.5-flash',
            contents: fullPrompt,
            config: {
              temperature: aiCfg.temperature,
              tools: adminTools
            }
          })

          if (adminCheck.functionCalls && adminCheck.functionCalls.length > 0) {
            const reports: string[] = []
            for (const call of adminCheck.functionCalls) {
              const toolName = call.name || ''
              const result = await executeAdminTool(toolName, call.args)
              if (aiCfg.persona === 'strict') {
                if (result.success) {
                  reports.push(`[STATUS]: 200 OK\n[OPERATION EXECUTED]: \`${toolName}\`\n[TELEMETRY DETAILS]: ${result.message || JSON.stringify(result)}`)
                } else {
                  reports.push(`[STATUS]: ERROR\n[OPERATION FAILED]: \`${toolName}\`\n[ERROR DETAILS]: ${result.error}`)
                }
              } else {
                if (result.success) {
                  reports.push(`⚡ **[THỰC HIỆN ADMIN THÀNH CÔNG]**\n- **Thao tác**: \`${toolName}\`\n- **Chi tiết**: ${result.message || JSON.stringify(result)}`)
                } else {
                  reports.push(`⚠️ **[LỖI THỰC HIỆN ADMIN]**\n- **Thao tác**: \`${toolName}\`\n- **Chi tiết lỗi**: ${result.error}`)
                }
              }
            }
            return reports.join('\n\n')
          }
          if (adminCheck.text?.trim()) return adminCheck.text.trim()
        } catch (toolErr) {
          console.warn('Admin tool calling in generateChatResponse error:', toolErr)
        }
      }

      let responseText = ''
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: fullPrompt,
          config: { temperature: aiCfg.temperature }
        })
        responseText = response.text || ''
      } catch (err2) {
        try {
          const response2 = await ai.models.generateContent({
            model: 'gemini-3.1-flash-lite',
            contents: fullPrompt,
            config: { temperature: Math.max(0.2, aiCfg.temperature - 0.2) }
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
  playerHistory?: PlayerGameStats,
  isAdmin?: boolean
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

    const aiCfg = getAiBehaviorConfig()
    const knowledgeString = gameKnowledgeBaseMd || (gameKnowledgeBase ? JSON.stringify(gameKnowledgeBase, null, 2) : 'Full Naenra Core Knowledge')
    let systemContext = buildFullSystemPrompt(username, playerHistory, knowledgeString, aiCfg)

    if (isAdmin) {
      systemContext = `### 🛡️ FULL ROOT ADMINISTRATIVE ACCESS & DATABASE TOOLS ACTIVE:
You have direct root administrative permissions to manage the database (deduplicate questions, view stats, list questions, create questions, update questions, delete questions, bulk delete questions, search players/questions, ban/unban players).
CRITICAL RULE: You MUST execute the real tools (e.g. deduplicateQuestions, getQuestionBankStats, listQuestions, deleteQuestion, bulkDeleteQuestions) whenever the admin instructs you to inspect or modify questions or players.
NEVER pretend you deleted questions or invent fake question IDs (e.g. Q5, Q18, Q45) without calling a tool.\n\n` + systemContext
    }

    let fullPrompt = systemContext
    if (history && history.length > 0) {
      fullPrompt += `\n\nCONVERSATION:\n` + history.map(h => `${h.role === 'user' ? username : 'AI Assistant'}: ${h.message}`).join('\n')
    }
    fullPrompt += `\n\n${username}: ${prompt}\nAI Assistant:`

    // If caller is an Admin, check if prompt triggers an administrative tool action
    if (isAdmin) {
      try {
        const adminCheck = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: fullPrompt,
          config: {
            temperature: aiCfg.temperature,
            tools: adminTools
          }
        })

        if (adminCheck.functionCalls && adminCheck.functionCalls.length > 0) {
          for (const call of adminCheck.functionCalls) {
            if (isClientDisconnected) break
            const toolName = call.name || ''
            const result = await executeAdminTool(toolName, call.args)
            let report = ''
            if (aiCfg.persona === 'strict') {
              if (result.success) {
                report = `[STATUS]: 200 OK\n[OPERATION EXECUTED]: \`${toolName}\`\n[TELEMETRY DETAILS]: ${result.message || JSON.stringify(result)}\n`
              } else {
                report = `[STATUS]: ERROR\n[OPERATION FAILED]: \`${toolName}\`\n[ERROR DETAILS]: ${result.error}\n`
              }
            } else {
              if (result.success) {
                report = `⚡ **[THỰC HIỆN ADMIN THÀNH CÔNG]**\n- **Thao tác**: \`${toolName}\`\n- **Chi tiết**: ${result.message || JSON.stringify(result)}\n`
              } else {
                report = `⚠️ **[LỖI THỰC HIỆN ADMIN]**\n- **Thao tác**: \`${toolName}\`\n- **Chi tiết lỗi**: ${result.error}\n`
              }
            }
            safeWrite(`data: ${JSON.stringify({ chunk: report })}\n\n`)
          }
          safeWrite('data: [DONE]\n\n')
          safeEnd()
          return
        }
      } catch (toolErr) {
        console.warn('Admin tool calling in stream error, proceeding to regular stream:', toolErr)
      }
    }

    let streamResult: any = null
    try {
      streamResult = await ai.models.generateContentStream({
        model: 'gemini-3.5-flash',
        contents: fullPrompt,
        config: { temperature: aiCfg.temperature }
      })
    } catch (primaryErr) {
      console.warn('gemini-3.5-flash stream failed, falling back to gemini-3.1-flash-lite:', primaryErr)
      try {
        streamResult = await ai.models.generateContentStream({
          model: 'gemini-3.1-flash-lite',
          contents: fullPrompt,
          config: { temperature: Math.max(0.2, aiCfg.temperature - 0.2) }
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

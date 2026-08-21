import cron from 'node-cron'
import { generateQuestions } from '../services/aiService'
import { supabase } from '../config/supabase'

export function initQuestionCron() {
  // Run every Sunday at midnight (0 0 * * 0)
  cron.schedule('0 0 * * 0', async () => {
    console.log('Running weekly AI question generation cron job...')
    try {
      // 1. Generate 50 new questions
      const topicConfigs = [
        { slug: 'daily-life', prompt: 'Daily Life & Habits' },
        { slug: 'cafe', prompt: 'Food & Cafe Culture' },
        { slug: 'travel', prompt: 'Travel & Vacations' },
        { slug: 'chaos-random', prompt: 'Completely random and unpredictable concepts from any domain (science, pop culture, history, abstract concepts, slang, etc.), the more random the better' }
      ]
      const levels = ['A1', 'B1', 'B2']
      let allNewQuestions: any[] = []
      
      for (const t of topicConfigs) {
        for (const level of levels) {
          let success = false;
          let attempts = 0;
          while (!success && attempts < 3) {
            try {
              const questions = await generateQuestions(t.prompt, level, 50)
              const questionsWithTopic = questions.map(q => ({ ...q, topic: t.slug }))
              allNewQuestions = allNewQuestions.concat(questionsWithTopic)
              success = true;
            } catch (err: any) {
              attempts++;
              console.error(`⚠️ Cron attempt ${attempts} failed: ${err.message}`)
              if (attempts < 3) {
                await new Promise(r => setTimeout(r, 5000))
              } else {
                throw err
              }
            }
          }
          await new Promise(r => setTimeout(r, 2000))
        }
      }
      
      // 2. Safely append new unique questions to database (prevent wiping existing questions)
      if (allNewQuestions.length > 0) {
        const { data: existingQuestions } = await supabase
          .from('questions')
          .select('target_word')

        const existingSet = new Set(
          (existingQuestions || []).map((q: any) => (q.target_word || '').trim().toLowerCase())
        )

        const uniqueQuestions = allNewQuestions.filter(
          q => q.target_word && !existingSet.has(q.target_word.trim().toLowerCase())
        )

        if (uniqueQuestions.length > 0) {
          const { error: insertErr } = await supabase
            .from('questions')
            .insert(uniqueQuestions)

          if (insertErr) {
            console.error('[QuestionCron] Failed to insert new questions:', insertErr)
          } else {
            console.log(`[QuestionCron] Successfully generated and appended ${uniqueQuestions.length} new unique AI questions!`)
          }
        } else {
          console.log('[QuestionCron] All generated questions already existed in the bank. 0 duplicates inserted.')
        }
      }
    } catch (err) {
      console.error('Error during weekly question generation cron job:', err)
    }
  })
}

<template>
  <div class="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 sm:p-6 backdrop-blur-xl shadow-xl space-y-6 relative overflow-hidden">
    <!-- BACKGROUND AI NEBULA GLOW -->
    <div class="absolute -right-20 -top-20 w-72 h-72 bg-violet-600/10 rounded-full blur-3xl pointer-events-none"></div>

    <!-- HEADER SECTION -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center shadow-[0_0_15px_rgba(124,58,237,0.4)] text-lg">
          🤖
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h3 class="text-base sm:text-lg font-bold text-white tracking-wide">
              AI Question Quality Auditor
            </h3>
            <span class="px-2 py-0.5 text-[10px] font-mono font-bold rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
              GEMINI 2.5 FLASH
            </span>
          </div>
          <p class="text-xs text-slate-400">
            Lexicographical auditing: Detects blank mismatches (____), vague hints, & CEFR misclassifications
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button
          @click="runAudit"
          :disabled="auditing"
          class="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs shadow-[0_0_15px_rgba(124,58,237,0.3)] transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          <svg :class="['w-4 h-4', auditing ? 'animate-spin' : '']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
          <span>{{ auditing ? 'Auditing with Gemini...' : 'Start AI Quality Audit' }}</span>
        </button>
      </div>
    </div>

    <!-- AUDIT CONTROLS -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
      <div>
        <label class="text-[10px] font-mono text-slate-400 uppercase">Batch Scan Size</label>
        <select
          v-model="auditLimit"
          class="w-full mt-1 bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-violet-500 font-mono"
        >
          <option :value="15">15 Questions</option>
          <option :value="30">30 Questions</option>
          <option :value="50">50 Questions</option>
        </select>
      </div>

      <div>
        <label class="text-[10px] font-mono text-slate-400 uppercase">Difficulty Filter</label>
        <select
          v-model="auditDifficulty"
          class="w-full mt-1 bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-violet-500 font-mono"
        >
          <option value="">All Difficulties</option>
          <option value="A1">A1 (Beginner)</option>
          <option value="A2">A2 (Elementary)</option>
          <option value="B1">B1 (Intermediate)</option>
          <option value="B2">B2 (Upper Intermediate)</option>
          <option value="C1">C1 (Advanced)</option>
        </select>
      </div>

      <div>
        <label class="text-[10px] font-mono text-slate-400 uppercase">Topic Scope</label>
        <select
          v-model="auditTopic"
          class="w-full mt-1 bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-violet-500 font-mono"
        >
          <option value="">All Topics</option>
          <option value="daily-life">Daily Life</option>
          <option value="cafe">Cafe & Dining</option>
          <option value="travel">Travel</option>
        </select>
      </div>
    </div>

    <!-- AUDIT SUMMARY BAR (WHEN RUN) -->
    <div v-if="auditResults.length > 0" class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div class="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
        <span class="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Audited Questions</span>
        <div class="text-lg font-black text-white mt-0.5">{{ auditResults.length }}</div>
      </div>
      <div class="bg-slate-950/60 border border-rose-900/40 rounded-xl p-3">
        <span class="text-[10px] font-mono text-rose-400 uppercase tracking-wider">Quality Issues Found</span>
        <div class="text-lg font-black text-rose-400 mt-0.5">{{ questionsWithIssues.length }}</div>
      </div>
      <div class="bg-slate-950/60 border border-emerald-900/40 rounded-xl p-3">
        <span class="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">Flawless Questions</span>
        <div class="text-lg font-black text-emerald-400 mt-0.5">{{ flawlessCount }}</div>
      </div>
      <div class="bg-slate-950/60 border border-violet-900/40 rounded-xl p-3 flex items-center justify-between">
        <div>
          <span class="text-[10px] font-mono text-violet-400 uppercase tracking-wider">Batch Actions</span>
          <div class="text-xs font-bold text-slate-300 mt-0.5">{{ selectedIds.length }} Selected</div>
        </div>
        <button
          @click="applyFixes(questionsWithIssues)"
          :disabled="fixing || questionsWithIssues.length === 0"
          class="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-40 cursor-pointer shadow-[0_0_10px_rgba(124,58,237,0.4)] active:scale-95"
        >
          {{ fixing ? 'Fixing...' : '✨ Auto-Fix All' }}
        </button>
      </div>
    </div>

    <!-- AUDITED ITEMS LIST -->
    <div v-if="auditing" class="py-14 flex flex-col items-center justify-center text-slate-400 space-y-3">
      <div class="w-10 h-10 border-3 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
      <span class="text-xs font-mono text-violet-300">Auditing syntax, blanks, and definitions with Gemini 3.5 Flash...</span>
    </div>

    <div v-else-if="auditResults.length > 0" class="space-y-4 max-h-[550px] overflow-y-auto pr-1">
      <div
        v-for="item in auditResults"
        :key="item.id"
        :class="[
          'rounded-xl p-4 border transition-all duration-200 space-y-3',
          item.issues.length > 0
            ? 'bg-slate-950/90 border-rose-900/40 hover:border-rose-700/60'
            : 'bg-slate-950/50 border-slate-800/60 opacity-75'
        ]"
      >
        <!-- ITEM HEADER -->
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-2.5">
            <span class="font-black text-sm text-white font-mono uppercase tracking-wider">
              {{ item.target_word }}
            </span>
            <span class="px-1.5 py-0.2 text-[9px] font-mono font-bold rounded bg-slate-800 text-slate-400 border border-slate-700">
              {{ item.difficulty }} • {{ item.topic }}
            </span>
            <span
              v-if="item.issues.length > 0"
              class="px-2 py-0.5 text-[9px] font-mono font-black uppercase rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40"
            >
              {{ item.issues.length }} Issue(s)
            </span>
            <span
              v-else
              class="px-2 py-0.5 text-[9px] font-mono font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
            >
              ✓ Perfect
            </span>
          </div>

          <div v-if="item.issues.length > 0" class="flex items-center gap-2">
            <button
              @click="applyFixes([item])"
              :disabled="fixing"
              class="px-3 py-1 bg-violet-600/30 hover:bg-violet-600 text-violet-200 hover:text-white border border-violet-500/40 rounded-lg text-xs font-semibold transition-all cursor-pointer active:scale-95 disabled:opacity-40"
            >
              Apply Fix
            </button>
          </div>
        </div>

        <!-- ISSUES TAGS -->
        <div v-if="item.issues.length > 0" class="flex flex-wrap gap-1.5">
          <span
            v-for="(issue, idx) in item.issues"
            :key="idx"
            class="px-2 py-0.5 rounded bg-rose-950/50 border border-rose-800/40 text-[10px] text-rose-300 font-mono"
          >
            ⚠️ {{ issue }}
          </span>
        </div>

        <!-- DIFF COMPARISON (ORIGINAL VS AI FIX) -->
        <div v-if="item.issues.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <!-- ORIGINAL -->
          <div class="bg-slate-900/80 rounded-lg p-3 border border-slate-800 space-y-1">
            <div class="text-[10px] font-mono uppercase text-slate-500 font-bold">Current in Database:</div>
            <p class="text-slate-300 italic">"{{ item.question_text }}"</p>
            <p class="text-[11px] text-slate-400 font-mono">Hint: {{ item.hint || '—' }}</p>
          </div>

          <!-- AI SUGGESTION -->
          <div class="bg-violet-950/30 rounded-lg p-3 border border-violet-800/40 space-y-1">
            <div class="text-[10px] font-mono uppercase text-violet-400 font-bold flex items-center gap-1">
              <span>✨ AI Recommended Correction:</span>
            </div>
            <p class="text-violet-200 font-medium">"{{ item.suggested_question_text }}"</p>
            <p class="text-[11px] text-violet-300 font-mono">Hint: {{ item.suggested_hint }} ({{ item.suggested_difficulty }})</p>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="py-12 flex flex-col items-center justify-center text-slate-400 bg-slate-950/40 rounded-xl border border-slate-800/60">
      <span class="text-3xl mb-2">🔍</span>
      <p class="text-sm font-semibold text-slate-200">No active audit loaded</p>
      <p class="text-xs text-slate-500 mt-1">Configure batch options and click "Start AI Quality Audit" to scan the question bank.</p>
    </div>

    <!-- TOAST -->
    <div
      v-if="statusMsg"
      class="fixed bottom-6 right-6 z-50 px-4 py-3 bg-slate-900 text-white border border-violet-500/50 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce"
    >
      <span>✨</span>
      <span class="text-xs font-medium">{{ statusMsg }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'

const auditing = ref(false)
const fixing = ref(false)
const auditLimit = ref(30)
const auditDifficulty = ref('')
const auditTopic = ref('')
const auditResults = ref<any[]>([])
const selectedIds = ref<string[]>([])
const statusMsg = ref('')

const questionsWithIssues = computed(() => auditResults.value.filter(item => item.issues && item.issues.length > 0))
const flawlessCount = computed(() => auditResults.value.filter(item => !item.issues || item.issues.length === 0).length)

async function runAudit() {
  auditing.value = true
  auditResults.value = []
  try {
    const token = localStorage.getItem('arena_token')
    const res = await fetch(`${SERVER_URL}/api/admin/questions/audit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        limit: auditLimit.value,
        difficulty: auditDifficulty.value || undefined,
        topic: auditTopic.value || undefined
      })
    })
    const data = await res.json()
    if (data.success && Array.isArray(data.items)) {
      auditResults.value = data.items
    }
  } catch (err) {
    console.error('runAudit error:', err)
  } finally {
    auditing.value = false
  }
}

async function applyFixes(itemsToFix: any[]) {
  if (itemsToFix.length === 0) return
  fixing.value = true
  try {
    const token = localStorage.getItem('arena_token')
    const fixes = itemsToFix.map(item => ({
      id: item.id,
      question_text: item.suggested_question_text || item.question_text,
      target_word: item.target_word,
      hint: item.suggested_hint || item.hint,
      difficulty: item.suggested_difficulty || item.difficulty,
      topic: item.topic
    }))

    const res = await fetch(`${SERVER_URL}/api/admin/questions/auto-fix`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ fixes })
    })
    const data = await res.json()
    if (data.success) {
      statusMsg.value = data.message || `Successfully auto-fixed ${fixes.length} question(s)!`
      setTimeout(() => { statusMsg.value = '' }, 3500)
      // Re-run audit to reflect updated DB state
      await runAudit()
    }
  } catch (err) {
    console.error('applyFixes error:', err)
  } finally {
    fixing.value = false
  }
}
</script>

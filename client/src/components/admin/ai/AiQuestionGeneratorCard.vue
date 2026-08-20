<template>
  <!-- ⚡ BATCH QUESTION GENERATOR CARD -->
  <div class="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-xl flex flex-col overflow-hidden">
    <!-- Header -->
    <div class="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
          ⚡
        </div>
        <div>
          <h3 class="text-sm font-bold text-white tracking-wide">Question Generator</h3>
          <p class="text-[11px] text-slate-500">Batch-generate vocabulary questions via AI</p>
        </div>
      </div>
      <span class="text-[11px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400">
        {{ questions.length }} Generated
      </span>
    </div>

    <!-- Config form -->
    <div class="px-5 pt-4 pb-3 border-b border-slate-800 space-y-3">
      <div class="grid grid-cols-3 gap-3">
        <!-- Topic -->
        <div class="col-span-3 sm:col-span-1">
          <label class="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1 block">Topic</label>
          <select
            v-model="config.topic"
            class="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500 transition-colors"
          >
            <option value="daily-life">Daily Life</option>
            <option value="cafe">Cafe & Dining</option>
            <option value="travel">Travel & Culture</option>
            <option value="Professional">Professional Skills</option>
            <option value="Social">Social Interaction</option>
            <option value="Tech">Critical Thinking & Tech</option>
          </select>
        </div>

        <!-- Level -->
        <div>
          <label class="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1 block">Level</label>
          <select
            v-model="config.level"
            class="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500 transition-colors"
          >
            <option value="A1">A1 (Beginner)</option>
            <option value="A2">A2 (Elementary)</option>
            <option value="B1">B1 (Intermediate)</option>
            <option value="B2">B2 (Upper Intermediate)</option>
            <option value="C1">C1 (Advanced)</option>
            <option value="Tier 1">Tier 1</option>
            <option value="Tier 2">Tier 2</option>
            <option value="Tier 3">Tier 3</option>
          </select>
        </div>

        <!-- Count -->
        <div>
          <label class="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1 block">Count</label>
          <select
            v-model="config.count"
            class="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500 transition-colors"
          >
            <option :value="3">3</option>
            <option :value="5">5</option>
            <option :value="10">10</option>
            <option :value="15">15</option>
          </select>
        </div>
      </div>

      <!-- Sub-topic focus input & Bank deduplication filter -->
      <div class="space-y-2 pt-1">
        <div>
          <label class="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Sub-Topic / Focus Context <span class="text-slate-600 lowercase">(optional)</span></span>
            <span class="text-[10px] text-amber-400/80">Enhances diversity</span>
          </label>
          <input
            v-model="config.focusContext"
            type="text"
            placeholder="e.g. Airport boarding, Cybersecurity protocols, Coffee brewing..."
            class="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 placeholder-slate-600 transition-colors font-mono"
          />
        </div>

        <label class="flex items-center gap-2 cursor-pointer select-none bg-slate-950/60 p-2 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors">
          <input
            type="checkbox"
            v-model="config.avoidDuplicates"
            class="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500 focus:ring-offset-slate-900"
          />
          <div class="flex-1">
            <div class="flex items-center gap-1.5">
              <span class="text-xs font-bold text-slate-200">🛡️ Auto-Exclude Existing Bank Words</span>
              <span class="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Zero Duplicates</span>
            </div>
            <p class="text-[10px] text-slate-500 leading-tight">Searches current database Question Bank to ensure generated target words are 100% fresh and unique.</p>
          </div>
        </label>
      </div>

      <button
        @click="$emit('generate')"
        :disabled="isGenerating"
        class="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-all shadow-[0_0_15px_rgba(217,119,6,0.3)] cursor-pointer"
      >
        <svg v-if="isGenerating" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"/><path d="M4 12a8 8 0 018-8" stroke-linecap="round"/></svg>
        <span>⚡</span>
        <span>{{ isGenerating ? `Generating ${config.count} Unique Questions...` : `Generate ${config.count} Questions` }}</span>
      </button>
    </div>

    <!-- Generated questions preview table -->
    <div class="flex-1 overflow-y-auto p-4 min-h-[200px] max-h-[340px]">
      <div v-if="questions.length === 0 && !isGenerating" class="flex flex-col items-center justify-center h-full text-center gap-3 py-8">
        <span class="text-4xl opacity-30">📝</span>
        <p class="text-xs text-slate-500 font-mono">Generated questions will appear here.<br/>Configure topic, level, and count above.</p>
      </div>

      <div v-else-if="isGenerating" class="space-y-3">
        <div v-for="n in config.count" :key="n" class="h-16 bg-slate-800/60 rounded-xl animate-pulse border border-slate-700/30"></div>
      </div>

      <div v-else class="space-y-2.5">
        <div
          v-for="(q, idx) in questions"
          :key="idx"
          class="p-3.5 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-amber-500/30 transition-colors group"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="flex-1 min-w-0">
              <p class="text-xs text-slate-200 leading-relaxed font-medium">{{ q.question_text }}</p>
              <div class="flex flex-wrap items-center gap-2 mt-2">
                <span class="text-[11px] font-mono px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/25 text-amber-400 font-bold">
                  {{ q.target_word }}
                </span>
                <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-300 border border-slate-600/40">
                  {{ config.level }}
                </span>
                <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-300 border border-slate-600/40">
                  {{ config.topic }}
                </span>
                <span class="text-[11px] text-slate-400 truncate">💡 {{ q.hint }}</span>
              </div>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <button
                v-if="!savedIndexes.has(idx)"
                @click="$emit('saveSingle', idx)"
                :disabled="isSaving"
                class="text-[11px] px-2 py-1 rounded bg-slate-800 hover:bg-emerald-600/20 text-slate-400 hover:text-emerald-400 border border-slate-700 hover:border-emerald-500/30 transition-colors cursor-pointer"
                title="Save this question to Question Bank"
              >
                ➕ Save
              </button>
              <span v-else class="text-[11px] font-mono text-emerald-400 font-bold">✓ Saved</span>
              <span class="text-[11px] font-mono text-slate-600">#{{ idx + 1 }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Export footer -->
    <div v-if="questions.length > 0" class="px-5 py-3 border-t border-slate-800 flex items-center justify-between gap-3">
      <span class="text-[11px] text-slate-500 font-mono">{{ questions.length }} questions ready</span>
      <div class="flex items-center gap-2">
        <button
          @click="$emit('saveAll')"
          :disabled="isSaving"
          class="text-[11px] font-mono font-bold px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-all shadow-[0_0_10px_rgba(16,185,129,0.3)] disabled:opacity-50 flex items-center gap-1 cursor-pointer"
        >
          <span>💾</span>
          <span>{{ isSaving ? 'Saving...' : 'Save All to Question Bank' }}</span>
        </button>
        <button
          @click="$emit('exportJson')"
          class="text-[11px] font-mono px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-slate-300 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
        >
          <span>📥</span>
          <span>Export JSON</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface GeneratedQuestion {
  question_text: string
  target_word: string
  hint: string
}

export interface GenConfig {
  topic: string
  level: string
  count: number
  avoidDuplicates: boolean
  focusContext: string
}

const props = defineProps<{
  modelValue: GenConfig
  questions: GeneratedQuestion[]
  isGenerating?: boolean
  isSaving?: boolean
  savedIndexes: Set<number>
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: GenConfig): void
  (e: 'generate'): void
  (e: 'saveSingle', idx: number): void
  (e: 'saveAll'): void
  (e: 'exportJson'): void
}>()

const config = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})
</script>

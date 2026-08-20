<template>
  <!-- 🎭 AI PERSONA & BEHAVIOR CONFIGURATION ENGINE -->
  <div class="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-xl">
          🎭
        </div>
        <div>
          <h3 class="text-base font-bold text-white tracking-wide flex items-center gap-2">
            <span>AI Persona & Prompt Engineering</span>
            <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
              LIVE OVERRIDE
            </span>
          </h3>
          <p class="text-xs text-slate-400 mt-0.5">
            Updates take effect immediately in the in-game chat widget, coach analysis, and admin console.
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button
          @click="$emit('reset')"
          :disabled="isSaving || isLoading"
          class="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold border border-slate-700 transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
          title="Reset to factory Naenra Coach behavior"
        >
          <span>🔄</span>
          <span>Reset Defaults</span>
        </button>

        <button
          @click="$emit('save')"
          :disabled="isSaving || isLoading"
          class="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold transition-all shadow-[0_0_15px_rgba(139,92,246,0.3)] disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
        >
          <svg v-if="isSaving" class="w-3.5 h-3.5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"/><path d="M4 12a8 8 0 018-8" stroke-linecap="round"/></svg>
          <span>💾</span>
          <span>{{ isSaving ? 'Saving...' : 'Save AI Behavior' }}</span>
        </button>
      </div>
    </div>

    <!-- 1. PERSONA PRESETS -->
    <div>
      <label class="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 mb-3 block">
        1. Choose AI Persona & Voice Tone
      </label>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <button
          v-for="p in personaPresets"
          :key="p.id"
          @click="selectPersona(p.id)"
          type="button"
          :class="[
            'p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between group cursor-pointer',
            config.persona === p.id
              ? 'bg-gradient-to-br from-violet-600/25 to-purple-900/20 border-violet-500/60 shadow-[0_0_15px_rgba(139,92,246,0.2)]'
              : 'bg-slate-950/60 hover:bg-slate-800/60 border-slate-800/80 hover:border-slate-700'
          ]"
        >
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-xl">{{ p.icon }}</span>
              <span v-if="config.persona === p.id" class="w-2 h-2 rounded-full bg-violet-400 animate-pulse"></span>
            </div>
            <h4 class="text-xs font-bold text-white tracking-wide group-hover:text-violet-300 transition-colors">
              {{ p.title }}
            </h4>
            <p class="text-[11px] text-slate-400 mt-1 leading-snug">
              {{ p.desc }}
            </p>
          </div>
        </button>
      </div>
    </div>

    <!-- CUSTOM PERSONA PROMPT (Visible only when persona === 'custom') -->
    <div v-if="config.persona === 'custom'" class="p-4 bg-slate-950/80 border border-violet-500/40 rounded-xl space-y-2 animate-fade-in">
      <label class="text-xs font-mono font-semibold uppercase tracking-wider text-violet-400 block">
        ✍️ Custom Persona Prompt & Voice Description
      </label>
      <textarea
        v-model="config.customPersonaPrompt"
        rows="3"
        placeholder="e.g. You are Master Sensei of typing. Speak with zen wisdom, profound metaphors, and calm guidance..."
        class="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-violet-500 font-sans transition-colors"
      ></textarea>
    </div>

    <!-- 2. BEHAVIOR SLIDERS & CONTROLS -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 border-t border-slate-800/80">
      <!-- TEMPERATURE SLIDER -->
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <label class="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
            🌡️ Temperature (Creativity)
          </label>
          <span class="text-xs font-mono font-bold text-violet-400">{{ config.temperature.toFixed(2) }}</span>
        </div>
        <input
          v-model.number="config.temperature"
          type="range"
          min="0"
          max="1"
          step="0.05"
          class="w-full accent-violet-500 cursor-pointer"
        />
        <div class="flex items-center justify-between text-[10px] font-mono text-slate-500">
          <span>0.0 (Strict/Factual)</span>
          <span>0.5 (Balanced)</span>
          <span>1.0 (Creative)</span>
        </div>
      </div>

      <!-- WORD COUNT LIMIT -->
      <div class="space-y-2">
        <label class="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 block">
          📏 Response Word Limit
        </label>
        <select
          v-model="config.maxWords"
          class="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-violet-500 transition-colors"
        >
          <option :value="30">30 Words (Ultra Compact - Best for In-Game)</option>
          <option :value="60">60 Words (Standard Balanced)</option>
          <option :value="120">120 Words (Detailed Explanation)</option>
          <option :value="0">Unlimited / Natural Length</option>
        </select>
        <p class="text-[10px] text-slate-500 font-mono">Controls verbosity of AI answers</p>
      </div>

      <!-- BEHAVIOR TOGGLES -->
      <div class="space-y-2.5">
        <label class="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 block">
          ⚙️ Response Constraints
        </label>
        <div class="space-y-2">
          <label class="flex items-center gap-2 cursor-pointer text-xs text-slate-300 select-none">
            <input v-model="config.autoLanguageMatch" type="checkbox" class="accent-violet-500 rounded" />
            <span>🌐 Auto-detect & match user language</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer text-xs text-slate-300 select-none">
            <input v-model="config.enableEmojis" type="checkbox" class="accent-violet-500 rounded" />
            <span>✨ Use expressive emojis in replies</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer text-xs text-slate-300 select-none">
            <input v-model="config.strictKnowledge" type="checkbox" class="accent-violet-500 rounded" />
            <span>🛡️ Strict 65 Cores knowledge base lock</span>
          </label>
        </div>
      </div>
    </div>

    <!-- 3. CUSTOM SYSTEM INSTRUCTIONS TEXTAREA -->
    <div class="pt-2 border-t border-slate-800/80 space-y-2">
      <div class="flex items-center justify-between">
        <label class="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
          3. Custom Rules & Behavioral Directives (Injected into System Prompt)
        </label>
        <span class="text-[10px] font-mono text-slate-500">Appended to live context</span>
      </div>
      <textarea
        v-model="config.customRules"
        rows="3"
        placeholder="- Always address the player as 'Agent' or 'Champion'&#10;- Emphasize Speedster core benefits for quick-typing players&#10;- If asked about ELO, explain that winning consecutive rounds grants multiplier bonus"
        class="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-violet-500 font-mono transition-colors"
      ></textarea>
      
      <!-- Quick sample rule chips -->
      <div class="flex flex-wrap items-center gap-2 pt-1">
        <span class="text-[10px] font-mono text-slate-500">Quick Insert:</span>
        <button
          v-for="chip in sampleRules"
          :key="chip.label"
          @click="insertSampleRule(chip.text)"
          type="button"
          class="text-[10px] font-mono px-2 py-1 rounded-lg bg-slate-800 hover:bg-violet-950 hover:text-violet-300 text-slate-400 border border-slate-700/60 hover:border-violet-500/40 transition-colors cursor-pointer"
        >
          + {{ chip.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface AiConfig {
  persona: 'default' | 'cyberpunk' | 'mascot' | 'strict' | 'custom'
  customPersonaPrompt?: string
  temperature: number
  maxWords: number
  autoLanguageMatch: boolean
  enableEmojis: boolean
  strictKnowledge: boolean
  customRules?: string
}

const props = defineProps<{
  modelValue: AiConfig
  isLoading?: boolean
  isSaving?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: AiConfig): void
  (e: 'save'): void
  (e: 'reset'): void
}>()

const config = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const personaPresets = [
  { id: 'default', icon: '🎯', title: 'Naenra Coach', desc: 'Sharp, encouraging, tactical ELO & Core advice' },
  { id: 'cyberpunk', icon: '⚡', title: 'Cyber Operator', desc: 'Futuristic, neon-arena combat navigator' },
  { id: 'mascot', icon: '🤖', title: 'Puck Mascot', desc: 'Cute, cheerful, energetic with rich emojis' },
  { id: 'strict', icon: '🧠', title: 'Telemetry Core', desc: 'Minimalist, pure numbers & direct tactical facts' },
  { id: 'custom', icon: '✍️', title: 'Custom Persona', desc: 'Write your own specialized AI instructions' },
] as const

const sampleRules = [
  { label: 'Champion greeting', text: '- Always address the player as "Champion".' },
  { label: 'Motivational quote', text: '- End every reply with a short 1-line motivational typing quote.' },
  { label: 'Recommend Speedster', text: '- Frequently recommend Speedster Core for quick-fingered typists.' },
  { label: 'Vietnamese slang', text: '- Use friendly Vietnamese gaming terms (e.g. "leo rank", "out trình").' },
]

function selectPersona(id: 'default' | 'cyberpunk' | 'mascot' | 'strict' | 'custom') {
  config.value.persona = id
  if (id === 'strict') {
    config.value.enableEmojis = false
    config.value.temperature = 0.2
  } else if (id === 'mascot') {
    config.value.enableEmojis = true
    config.value.temperature = 0.85
  } else if (id === 'cyberpunk') {
    config.value.temperature = 0.75
  } else if (id === 'default') {
    config.value.temperature = 0.7
    config.value.enableEmojis = true
  }
}

function insertSampleRule(text: string) {
  if (!config.value.customRules) {
    config.value.customRules = text
  } else if (!config.value.customRules.includes(text)) {
    config.value.customRules = `${config.value.customRules.trim()}\n${text}`
  }
}
</script>

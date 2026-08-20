<template>
  <div class="space-y-6 animate-fade-in">

    <!-- PAGE HEADER -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <div class="flex items-center gap-2.5 mb-1.5">
          <span class="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-violet-500/10 text-violet-400 border border-violet-500/30 flex items-center gap-1.5 shadow-[0_0_10px_rgba(139,92,246,0.15)]">
            <span class="w-2 h-2 rounded-full bg-violet-500 animate-pulse"></span>
            AI OPERATIONS WORKSPACE
          </span>
          <span class="text-xs font-mono text-slate-500">US-96</span>
        </div>
        <h2 class="text-2xl font-black text-white tracking-wide flex items-center gap-2.5">
          <span>🤖</span>
          <span>AI Core Assistant & Prompt Engine</span>
        </h2>
        <p class="text-xs text-slate-400 mt-1">
          Customize AI personas & behavior rules in real-time, test chat streaming, and batch-generate questions.
        </p>
      </div>

      <!-- Model status badge -->
      <div class="flex items-center gap-3">
        <div
          :class="[
            'flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold border transition-all',
            modelStatus === 'online'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
              : modelStatus === 'checking'
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          ]"
        >
          <span
            :class="[
              'w-2 h-2 rounded-full',
              modelStatus === 'online' ? 'bg-emerald-500 animate-pulse' :
              modelStatus === 'checking' ? 'bg-amber-500 animate-pulse' :
              'bg-red-500'
            ]"
          ></span>
          {{ modelStatus === 'online' ? 'Gemini Online' : modelStatus === 'checking' ? 'Checking...' : 'Model Offline' }}
        </div>
        <button
          @click="checkModelStatus"
          :disabled="modelStatus === 'checking'"
          class="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-violet-500/50 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
        >
          <svg :class="['w-3.5 h-3.5 text-violet-400', modelStatus === 'checking' ? 'animate-spin' : '']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Ping AI
        </button>
      </div>
    </div>

    <!-- TOAST -->
    <Transition name="toast-fade">
      <div
        v-if="toast.message"
        :class="[
          'p-4 rounded-xl border flex items-center justify-between shadow-lg',
          toast.type === 'success'
            ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
            : 'bg-red-950/80 border-red-500/40 text-red-300'
        ]"
      >
        <div class="flex items-center gap-2 text-sm font-medium">
          <span>{{ toast.type === 'success' ? '✅' : '⚠️' }}</span>
          <span>{{ toast.message }}</span>
        </div>
        <button @click="toast.message = ''" class="text-xs opacity-60 hover:opacity-100">✕</button>
      </div>
    </Transition>

    <!-- MODEL STATUS CARDS ROW -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="p-5 bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl">
        <p class="text-[11px] font-mono text-slate-500 uppercase tracking-wider mb-2">Primary Model</p>
        <p class="text-base font-bold text-white font-mono">gemini-3.5-flash</p>
        <p class="text-xs text-slate-400 mt-1">Chat · Questions · Coach</p>
      </div>
      <div class="p-5 bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl">
        <p class="text-[11px] font-mono text-slate-500 uppercase tracking-wider mb-2">Fallback Model</p>
        <p class="text-base font-bold text-slate-300 font-mono">gemini-3.1-flash-lite</p>
        <p class="text-xs text-slate-400 mt-1">Auto-activated on primary fail</p>
      </div>
      <div class="p-5 bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl">
        <p class="text-[11px] font-mono text-slate-500 uppercase tracking-wider mb-2">Active Persona</p>
        <p class="text-base font-bold text-violet-400 font-mono capitalize">{{ aiConfig.persona }}</p>
        <p class="text-xs text-slate-400 mt-1">Temp: {{ aiConfig.temperature }} · {{ aiConfig.maxWords }} words max</p>
      </div>
    </div>

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
            @click="resetConfigToDefault"
            :disabled="isSavingConfig || isLoadingConfig"
            class="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold border border-slate-700 transition-all disabled:opacity-50 flex items-center gap-1.5"
            title="Reset to factory Naenra Coach behavior"
          >
            <span>🔄</span>
            <span>Reset Defaults</span>
          </button>

          <button
            @click="saveAiConfig"
            :disabled="isSavingConfig || isLoadingConfig"
            class="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold transition-all shadow-[0_0_15px_rgba(139,92,246,0.3)] disabled:opacity-50 flex items-center gap-1.5"
          >
            <svg v-if="isSavingConfig" class="w-3.5 h-3.5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"/><path d="M4 12a8 8 0 018-8" stroke-linecap="round"/></svg>
            <span>💾</span>
            <span>{{ isSavingConfig ? 'Saving...' : 'Save AI Behavior' }}</span>
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
              'p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between group',
              aiConfig.persona === p.id
                ? 'bg-gradient-to-br from-violet-600/25 to-purple-900/20 border-violet-500/60 shadow-[0_0_15px_rgba(139,92,246,0.2)]'
                : 'bg-slate-950/60 hover:bg-slate-800/60 border-slate-800/80 hover:border-slate-700'
            ]"
          >
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-xl">{{ p.icon }}</span>
                <span v-if="aiConfig.persona === p.id" class="w-2 h-2 rounded-full bg-violet-400 animate-pulse"></span>
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
      <div v-if="aiConfig.persona === 'custom'" class="p-4 bg-slate-950/80 border border-violet-500/40 rounded-xl space-y-2 animate-fade-in">
        <label class="text-xs font-mono font-semibold uppercase tracking-wider text-violet-400 block">
          ✍️ Custom Persona Prompt & Voice Description
        </label>
        <textarea
          v-model="aiConfig.customPersonaPrompt"
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
            <span class="text-xs font-mono font-bold text-violet-400">{{ aiConfig.temperature.toFixed(2) }}</span>
          </div>
          <input
            v-model.number="aiConfig.temperature"
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
            v-model="aiConfig.maxWords"
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
              <input v-model="aiConfig.autoLanguageMatch" type="checkbox" class="accent-violet-500 rounded" />
              <span>🌐 Auto-detect & match user language</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer text-xs text-slate-300 select-none">
              <input v-model="aiConfig.enableEmojis" type="checkbox" class="accent-violet-500 rounded" />
              <span>✨ Use expressive emojis in replies</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer text-xs text-slate-300 select-none">
              <input v-model="aiConfig.strictKnowledge" type="checkbox" class="accent-violet-500 rounded" />
              <span>🛡️ Strict 65 Cores knowledge base lock</span>
            </label>
          </div>
        </div>
      </div>

      <!-- 3. CUSTOM SYSTEM INSTRUCTIONS TEXTAREA -->
      <div class="space-y-2 pt-2 border-t border-slate-800/80">
        <div class="flex items-center justify-between">
          <label class="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
            📝 Custom System Instructions & Behavioral Rules
          </label>
          <span class="text-[10px] font-mono text-slate-500">{{ (aiConfig.customRules || '').length }} characters</span>
        </div>
        <textarea
          v-model="aiConfig.customRules"
          rows="3"
          placeholder="Add specific instructions injected directly into every AI prompt, e.g.:&#10;- Always address the user as 'Champion'&#10;- End answers with a short motivational slogan&#10;- Emphasize Speedster Core for fast typists"
          class="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-violet-500 font-sans transition-colors"
        ></textarea>

        <!-- Quick suggestion pills -->
        <div class="flex flex-wrap items-center gap-2 pt-1">
          <span class="text-[10px] font-mono text-slate-500">Quick Rules:</span>
          <button
            v-for="rule in sampleRules"
            :key="rule.label"
            @click="addRule(rule.text)"
            type="button"
            class="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700/50 transition-colors"
          >
            + {{ rule.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- TWO-COLUMN MAIN PANEL: CHAT CONSOLE + QUESTION GENERATOR -->
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">

      <!-- LEFT: AI CHAT CONSOLE -->
      <div id="ai-chat-console" class="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-xl">
        <!-- Header -->
        <div class="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-lg">💬</span>
            <div>
              <h3 class="text-sm font-bold text-white tracking-wide">AI Chat Console</h3>
              <p class="text-[11px] text-slate-500">Live-test AI responses with active persona & behavior via SSE</p>
            </div>
          </div>
          <button
            @click="clearChat"
            class="text-[11px] font-mono text-slate-500 hover:text-red-400 transition-colors px-2 py-1 rounded-lg hover:bg-red-500/10"
          >
            Clear
          </button>
        </div>

        <!-- Messages -->
        <div ref="chatBodyRef" class="flex-1 overflow-y-auto p-4 space-y-3 min-h-[280px] max-h-[380px]">
          <div v-if="chatMessages.length === 0" class="flex flex-col items-center justify-center h-full text-center gap-3 py-8">
            <span class="text-4xl opacity-30">🤖</span>
            <p class="text-xs text-slate-500 font-mono">Type a prompt to test your active AI Persona.<br/>Stream is live via SSE with dynamic behavior rules.</p>
          </div>

          <div v-for="(msg, idx) in chatMessages" :key="idx" :class="['flex', msg.role === 'user' ? 'justify-end' : 'justify-start']">
            <div
              :class="[
                'max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed',
                msg.role === 'user'
                  ? 'bg-violet-600/20 border border-violet-500/30 text-violet-100 rounded-br-md'
                  : 'bg-slate-800/80 border border-slate-700/60 text-slate-200 rounded-bl-md'
              ]"
            >
              <div v-if="msg.role === 'model'" v-html="renderMarkdown(msg.content)"></div>
              <p v-else>{{ msg.content }}</p>
              <!-- Streaming cursor -->
              <span v-if="isChatStreaming && chatStreamingIdx === idx" class="inline-block w-[2px] h-3.5 bg-violet-400 ml-0.5 animate-pulse rounded-full align-middle"></span>
            </div>
          </div>

          <!-- Thinking indicator -->
          <div v-if="isChatLoading && !isChatStreaming" class="flex items-center gap-2 text-xs text-slate-500 font-mono">
            <span class="w-2 h-2 rounded-full bg-violet-500 animate-bounce"></span>
            <span class="w-2 h-2 rounded-full bg-violet-500 animate-bounce [animation-delay:0.15s]"></span>
            <span class="w-2 h-2 rounded-full bg-violet-500 animate-bounce [animation-delay:0.3s]"></span>
            <span class="ml-1">AI thinking...</span>
          </div>
        </div>

        <!-- Input -->
        <div class="p-4 border-t border-slate-800">
          <div class="flex gap-2">
            <input
              v-model="chatInput"
              @keyup.enter="sendChatMessage"
              type="text"
              placeholder="Test a prompt (e.g. 'What is Aegis Core?')"
              class="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
              maxlength="300"
            />
            <button
              @click="sendChatMessage"
              :disabled="!chatInput.trim()"
              class="px-4 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-all shadow-[0_0_12px_rgba(139,92,246,0.3)] shrink-0"
            >
              <svg v-if="!isChatLoading" class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
              <svg v-else class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"/><path d="M4 12a8 8 0 018-8" stroke-linecap="round"/></svg>
            </button>
          </div>
          <!-- Quick test prompts -->
          <div class="flex flex-wrap gap-1.5 mt-2.5">
            <button
              v-for="hint in quickTestPrompts"
              :key="hint"
              @click="chatInput = hint"
              class="text-[10px] font-mono px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700/50 transition-colors"
            >
              {{ hint }}
            </button>
          </div>
        </div>
      </div>

      <!-- RIGHT: QUESTION GENERATOR -->
      <div class="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-xl">
        <!-- Header -->
        <div class="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-lg">⚡</span>
            <div>
              <h3 class="text-sm font-bold text-white tracking-wide">Question Generator</h3>
              <p class="text-[11px] text-slate-500">Batch-generate vocabulary questions via AI</p>
            </div>
          </div>
          <span class="text-[11px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400">
            {{ generatedQuestions.length }} Generated
          </span>
        </div>

        <!-- Config form -->
        <div class="px-5 pt-4 pb-3 border-b border-slate-800 space-y-3">
          <div class="grid grid-cols-3 gap-3">
            <!-- Topic -->
            <div class="col-span-3 sm:col-span-1">
              <label class="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1 block">Topic</label>
              <select
                v-model="genConfig.topic"
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
                v-model="genConfig.level"
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
                v-model="genConfig.count"
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
                v-model="genConfig.focusContext"
                type="text"
                placeholder="e.g. Airport boarding, Cybersecurity protocols, Coffee brewing..."
                class="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 placeholder-slate-600 transition-colors font-mono"
              />
            </div>

            <label class="flex items-center gap-2 cursor-pointer select-none bg-slate-950/60 p-2 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors">
              <input
                type="checkbox"
                v-model="genConfig.avoidDuplicates"
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
            @click="generateQuestions"
            :disabled="isGenerating"
            class="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-all shadow-[0_0_15px_rgba(217,119,6,0.3)]"
          >
            <svg v-if="isGenerating" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"/><path d="M4 12a8 8 0 018-8" stroke-linecap="round"/></svg>
            <span>⚡</span>
            <span>{{ isGenerating ? `Generating ${genConfig.count} Unique Questions...` : `Generate ${genConfig.count} Questions` }}</span>
          </button>
        </div>

        <!-- Generated questions preview table -->
        <div class="flex-1 overflow-y-auto p-4 min-h-[200px] max-h-[340px]">
          <div v-if="generatedQuestions.length === 0 && !isGenerating" class="flex flex-col items-center justify-center h-full text-center gap-3 py-8">
            <span class="text-4xl opacity-30">📝</span>
            <p class="text-xs text-slate-500 font-mono">Generated questions will appear here.<br/>Configure topic, level, and count above.</p>
          </div>

          <div v-else-if="isGenerating" class="space-y-3">
            <div v-for="n in genConfig.count" :key="n" class="h-16 bg-slate-800/60 rounded-xl animate-pulse border border-slate-700/30"></div>
          </div>

          <div v-else class="space-y-2.5">
            <div
              v-for="(q, idx) in generatedQuestions"
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
                      {{ genConfig.level }}
                    </span>
                    <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-300 border border-slate-600/40">
                      {{ genConfig.topic }}
                    </span>
                    <span class="text-[11px] text-slate-400 truncate">💡 {{ q.hint }}</span>
                  </div>
                </div>
                <div class="flex items-center gap-2 shrink-0">
                  <button
                    v-if="!savedIndexes.has(idx)"
                    @click="saveSingleQuestion(idx)"
                    :disabled="isSaving"
                    class="text-[11px] px-2 py-1 rounded bg-slate-800 hover:bg-emerald-600/20 text-slate-400 hover:text-emerald-400 border border-slate-700 hover:border-emerald-500/30 transition-colors"
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
        <div v-if="generatedQuestions.length > 0" class="px-5 py-3 border-t border-slate-800 flex items-center justify-between gap-3">
          <span class="text-[11px] text-slate-500 font-mono">{{ generatedQuestions.length }} questions ready</span>
          <div class="flex items-center gap-2">
            <button
              @click="saveAllToQuestionBank"
              :disabled="isSaving"
              class="text-[11px] font-mono font-bold px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-all shadow-[0_0_10px_rgba(16,185,129,0.3)] disabled:opacity-50 flex items-center gap-1"
            >
              <span>💾</span>
              <span>{{ isSaving ? 'Saving...' : 'Save All to Question Bank' }}</span>
            </button>
            <button
              @click="exportAsJSON"
              class="text-[11px] font-mono px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-slate-300 rounded-lg transition-colors flex items-center gap-1"
            >
              <span>📥</span>
              <span>Export JSON</span>
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { fetchWithAuth } from '../../services/api'

// ── Types ────────────────────────────────────────────────────────────────────

interface ChatMessage {
  role: 'user' | 'model'
  content: string
}

interface GeneratedQuestion {
  question_text: string
  target_word: string
  hint: string
}

interface GenConfig {
  topic: string
  level: string
  count: number
  avoidDuplicates: boolean
  focusContext: string
}

interface AiConfig {
  persona: 'default' | 'cyberpunk' | 'mascot' | 'strict' | 'custom'
  customPersonaPrompt?: string
  temperature: number
  maxWords: number
  autoLanguageMatch: boolean
  enableEmojis: boolean
  strictKnowledge: boolean
  customRules?: string
}

interface Toast {
  message: string
  type: 'success' | 'error'
}

// ── State ────────────────────────────────────────────────────────────────────

const modelStatus = ref<'checking' | 'online' | 'offline'>('online')

// AI Persona & Behavior Config
const aiConfig = ref<AiConfig>({
  persona: 'default',
  customPersonaPrompt: '',
  temperature: 0.7,
  maxWords: 60,
  autoLanguageMatch: true,
  enableEmojis: true,
  strictKnowledge: true,
  customRules: ''
})
const isLoadingConfig = ref(false)
const isSavingConfig = ref(false)

const personaPresets = [
  { id: 'default', icon: '🎯', title: 'Naenra Coach', desc: 'Sharp, encouraging, tactical ELO & Core advice' },
  { id: 'cyberpunk', icon: '⚡', title: 'Cyber Operator', desc: 'Futuristic, neon-arena combat navigator' },
  { id: 'mascot', icon: '🤖', title: 'Puck Mascot', desc: 'Cute, cheerful, energetic with rich emojis' },
  { id: 'strict', icon: '🧠', title: 'Telemetry Core', desc: 'Minimalist, pure numbers & direct tactical facts' },
  { id: 'custom', icon: '✍️', title: 'Custom Persona', desc: 'Write your own specialized AI instructions' },
]

const sampleRules = [
  { label: 'Champion greeting', text: '- Always address the player as "Champion".' },
  { label: 'Motivational quote', text: '- End every reply with a short 1-line motivational typing quote.' },
  { label: 'Recommend Speedster', text: '- Frequently recommend Speedster Core for quick-fingered typists.' },
  { label: 'Vietnamese slang', text: '- Use friendly Vietnamese gaming terms (e.g. "leo rank", "out trình").' },
]

// Chat console
const chatBodyRef = ref<HTMLElement | null>(null)
const chatInput = ref('')
const chatMessages = ref<ChatMessage[]>([])
const isChatLoading = ref(false)
const isChatStreaming = ref(false)
const chatStreamingIdx = ref(-1)
let chatAbortController: AbortController | null = null
let chatStreamTimer: ReturnType<typeof setInterval> | null = null

// Question generator
const genConfig = ref<GenConfig>({
  topic: 'daily-life',
  level: 'A1',
  count: 5,
  avoidDuplicates: true,
  focusContext: ''
})
const generatedQuestions = ref<GeneratedQuestion[]>([])
const isGenerating = ref(false)
const isSaving = ref(false)
const savedIndexes = ref<Set<number>>(new Set())

// Toast
const toast = ref<Toast>({ message: '', type: 'success' })

const quickTestPrompts = [
  'What is Aegis Core?',
  '🔍 Tìm 3 câu hỏi chủ đề Tech',
  '➕ Tạo câu hỏi từ "astronaut" độ khó B2',
  '👥 Tìm người chơi có tên "admin"',
  'What is my rank?',
]

// ── Helpers ──────────────────────────────────────────────────────────────────

function showToast(message: string, type: 'success' | 'error' = 'success') {
  toast.value = { message, type }
  setTimeout(() => { toast.value.message = '' }, 4000)
}

function scrollChatToBottom() {
  nextTick(() => {
    if (chatBodyRef.value) {
      chatBodyRef.value.scrollTop = chatBodyRef.value.scrollHeight
    }
  })
}

function renderMarkdown(raw: string): string {
  if (!raw) return ''
  let html = raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>')
  html = html.replace(/`([^`]+)`/g, '<code class="bg-slate-700/60 px-1 py-0.5 rounded text-xs font-mono">$1</code>')
  html = html.replace(/\n/g, '<br/>')
  return html
}

// ── AI Behavior Configuration Functions ─────────────────────────────────────

async function fetchAiConfig() {
  isLoadingConfig.value = true
  try {
    const res = await fetchWithAuth('/api/admin/ai/config')
    if (res.ok) {
      const result = await res.json()
      if (result.success && result.data) {
        aiConfig.value = { ...aiConfig.value, ...result.data }
      }
    }
  } catch (err) {
    console.error('Failed to fetch AI configuration:', err)
  } finally {
    isLoadingConfig.value = false
  }
}

async function saveAiConfig() {
  isSavingConfig.value = true
  try {
    const res = await fetchWithAuth('/api/admin/ai/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(aiConfig.value)
    })
    if (res.ok) {
      showToast('✅ AI Persona & Behavior configuration saved! Live in-game immediately.')
    } else {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message || 'Failed to save configuration')
    }
  } catch (err: any) {
    showToast(`Failed to save AI config: ${err.message}`, 'error')
  } finally {
    isSavingConfig.value = false
  }
}

async function resetConfigToDefault() {
  if (isSavingConfig.value) return
  isSavingConfig.value = true
  try {
    const res = await fetchWithAuth('/api/admin/ai/config/reset', { method: 'POST' })
    if (res.ok) {
      const result = await res.json()
      if (result.data) {
        aiConfig.value = result.data
      }
      showToast('🔄 AI behavior reset to factory defaults.')
    }
  } catch (err: any) {
    showToast(`Reset failed: ${err.message}`, 'error')
  } finally {
    isSavingConfig.value = false
  }
}

function selectPersona(id: string) {
  aiConfig.value.persona = id as any
  if (id === 'strict') {
    aiConfig.value.enableEmojis = false
    aiConfig.value.temperature = 0.05
    aiConfig.value.maxWords = 30
    aiConfig.value.strictKnowledge = true
  } else if (id === 'cyberpunk') {
    aiConfig.value.enableEmojis = true
    aiConfig.value.temperature = 0.65
    aiConfig.value.maxWords = 45
    aiConfig.value.strictKnowledge = true
  } else if (id === 'mascot') {
    aiConfig.value.enableEmojis = true
    aiConfig.value.temperature = 0.85
    aiConfig.value.maxWords = 60
    aiConfig.value.strictKnowledge = false
  } else if (id === 'default') {
    aiConfig.value.enableEmojis = true
    aiConfig.value.temperature = 0.7
    aiConfig.value.maxWords = 60
    aiConfig.value.strictKnowledge = true
  }
}

function addRule(text: string) {
  if (!aiConfig.value.customRules) {
    aiConfig.value.customRules = text
  } else if (!aiConfig.value.customRules.includes(text)) {
    aiConfig.value.customRules += `\n${text}`
  }
}

// ── Model Status ─────────────────────────────────────────────────────────────

async function checkModelStatus() {
  modelStatus.value = 'checking'
  try {
    const res = await fetchWithAuth('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'ping', history: [], playerHistory: {} })
    })
    modelStatus.value = res.ok ? 'online' : 'offline'
    showToast(res.ok ? '✅ Gemini AI is responding normally.' : '⚠️ AI model returned an error.', res.ok ? 'success' : 'error')
  } catch {
    modelStatus.value = 'offline'
    showToast('⚠️ Could not reach AI service.', 'error')
  }
}

// ── Chat Console ─────────────────────────────────────────────────────────────

function clearChat() {
  if (chatAbortController) {
    chatAbortController.abort()
    chatAbortController = null
  }
  if (chatStreamTimer) {
    clearInterval(chatStreamTimer)
    chatStreamTimer = null
  }
  chatMessages.value = []
  isChatLoading.value = false
  isChatStreaming.value = false
  chatStreamingIdx.value = -1
}

async function sendChatMessage() {
  const text = chatInput.value.trim()
  if (!text) return

  chatInput.value = ''

  // 1. Immediately abort active stream & interval
  if (chatAbortController) {
    chatAbortController.abort()
    chatAbortController = null
  }
  if (chatStreamTimer) {
    clearInterval(chatStreamTimer)
    chatStreamTimer = null
  }

  // 2. Finalize previous AI message if still typing
  if (chatStreamingIdx.value >= 0 && chatStreamingIdx.value < chatMessages.value.length) {
    const prev = chatMessages.value[chatStreamingIdx.value]
    if (prev && !prev.content.trim()) {
      chatMessages.value.splice(chatStreamingIdx.value, 1)
    }
  }

  isChatLoading.value = false
  isChatStreaming.value = false
  chatStreamingIdx.value = -1

  chatMessages.value.push({ role: 'user', content: text })
  scrollChatToBottom()

  isChatLoading.value = true

  let incomingBuffer = ''
  let displayedText = ''
  let isStreamClosed = false

  // Push placeholder AI message
  chatMessages.value.push({ role: 'model', content: '' })
  let answerIdx = chatMessages.value.length - 1

  const startTypewriter = () => {
    if (chatStreamTimer) clearInterval(chatStreamTimer)
    chatStreamTimer = setInterval(() => {
      if (displayedText.length < incomingBuffer.length) {
        if (!isChatStreaming.value) {
          isChatStreaming.value = true
          chatStreamingIdx.value = answerIdx
        }
        const backlog = incomingBuffer.length - displayedText.length
        const step = backlog > 80 ? 5 : backlog > 30 ? 3 : backlog > 12 ? 2 : 1
        displayedText += incomingBuffer.slice(displayedText.length, displayedText.length + step)
        if (answerIdx >= 0 && answerIdx < chatMessages.value.length) {
          chatMessages.value[answerIdx] = { role: 'model', content: displayedText }
        }
        scrollChatToBottom()
      } else if (isStreamClosed) {
        clearInterval(chatStreamTimer!)
        chatStreamTimer = null
        isChatStreaming.value = false
        chatStreamingIdx.value = -1
        isChatLoading.value = false
        if (!displayedText.trim() && answerIdx >= 0) {
          chatMessages.value.splice(answerIdx, 1)
          showToast('AI returned no response. Check model status.', 'error')
        }
        scrollChatToBottom()
      }
    }, 14)
  }

  try {
    chatAbortController = new AbortController()
    const timeoutId = setTimeout(() => chatAbortController?.abort(), 25000)

    const apiBase = (import.meta.env.VITE_SERVER_URL || 'http://localhost:3000') as string
    const token = localStorage.getItem('arena_token') || ''

    const history = chatMessages.value
      .slice(0, -1)
      .slice(-8)
      .map(m => ({ role: m.role, message: m.content }))

    const res = await fetch(`${apiBase}/api/ai/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ prompt: text, history, playerHistory: {} }),
      signal: chatAbortController.signal
    })

    clearTimeout(timeoutId)

    if (!res.ok || !res.body) {
      throw new Error(`AI stream error: ${res.status}`)
    }

    startTypewriter()

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const payload = line.slice(6).trim()
        if (payload === '[DONE]') { isStreamClosed = true; break }
        try {
          const parsed = JSON.parse(payload)
          if (parsed.chunk) incomingBuffer += parsed.chunk
        } catch { /* skip malformed */ }
      }
    }
    isStreamClosed = true
  } catch (err: any) {
    isStreamClosed = true
    if (chatStreamTimer) { clearInterval(chatStreamTimer); chatStreamTimer = null }
    if (answerIdx >= 0 && chatMessages.value[answerIdx]?.content === '') {
      chatMessages.value.splice(answerIdx, 1)
    }
    isChatLoading.value = false
    isChatStreaming.value = false
    chatStreamingIdx.value = -1
    if (err.name !== 'AbortError') {
      showToast(`Chat error: ${err.message}`, 'error')
    }
  } finally {
    chatAbortController = null
    scrollChatToBottom()
  }
}

// ── Question Generator ────────────────────────────────────────────────────────

async function generateQuestions() {
  if (isGenerating.value) return
  isGenerating.value = true
  generatedQuestions.value = []

  try {
    const apiBase = (import.meta.env.VITE_SERVER_URL || 'http://localhost:3000') as string
    const token = localStorage.getItem('arena_token') || ''

    const genRes = await fetch(`${apiBase}/api/admin/ai/generate-questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        topic: genConfig.value.topic,
        level: genConfig.value.level,
        count: genConfig.value.count,
        avoidDuplicates: genConfig.value.avoidDuplicates,
        focusContext: genConfig.value.focusContext
      })
    })

    if (!genRes.ok) {
      const err = await genRes.json().catch(() => ({}))
      throw new Error(err.error || `Generation failed: ${genRes.status}`)
    }

    const data = await genRes.json()
    generatedQuestions.value = data.questions || data || []
    savedIndexes.value = new Set()
    showToast(`✅ Generated ${generatedQuestions.value.length} questions successfully!`)
  } catch (err: any) {
    showToast(`Generation failed: ${err.message}`, 'error')
  } finally {
    isGenerating.value = false
  }
}

async function saveSingleQuestion(idx: number) {
  const q = generatedQuestions.value[idx]
  if (!q || isSaving.value) return
  isSaving.value = true
  try {
    const res = await fetchWithAuth('/api/admin/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question_text: q.question_text,
        target_word: q.target_word.trim().toLowerCase(),
        hint: q.hint,
        topic: genConfig.value.topic,
        difficulty: genConfig.value.level
      })
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message || 'Failed to save question')
    }
    savedIndexes.value.add(idx)
    showToast(`✅ Saved question #${idx + 1} (${q.target_word}) to Question Bank!`)
  } catch (err: any) {
    showToast(`Save failed: ${err.message}`, 'error')
  } finally {
    isSaving.value = false
  }
}

async function saveAllToQuestionBank() {
  if (generatedQuestions.value.length === 0 || isSaving.value) return
  isSaving.value = true
  try {
    const payload = generatedQuestions.value.map(q => ({
      question_text: q.question_text,
      target_word: q.target_word.trim().toLowerCase(),
      hint: q.hint,
      topic: genConfig.value.topic,
      difficulty: genConfig.value.level
    }))

    const res = await fetchWithAuth('/api/admin/questions/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questions: payload })
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message || 'Failed to import questions')
    }

    // Mark all as saved
    generatedQuestions.value.forEach((_, idx) => savedIndexes.value.add(idx))
    showToast(`✅ Saved all ${generatedQuestions.value.length} questions to Question Bank!`)
  } catch (err: any) {
    showToast(`Save all failed: ${err.message}`, 'error')
  } finally {
    isSaving.value = false
  }
}

function exportAsJSON() {
  const json = JSON.stringify(generatedQuestions.value, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `naenra_questions_${genConfig.value.topic}_${genConfig.value.level}_${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
  showToast(`📥 Exported ${generatedQuestions.value.length} questions as JSON.`)
}

onMounted(() => {
  fetchAiConfig()
})
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: all 0.3s ease;
}
.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>

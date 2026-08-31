# AGENTS.md — AI Agent Handoff

> Full technical specification lives in [`CLAUDE.md`](file:///Users/nhgbao/Desktop/AxonProject-main/CLAUDE.md). This document tracks current state, completed work, and next steps for AI agents.

## Project
**Naenra (ARENA.ENG)** — Competitive timed vocabulary typing game with Support Core tactical abilities.
- **Frontend**: Vue 3 + TypeScript + Pinia + Tailwind CSS + Phaser 3/4 (`client/`)
- **Backend**: Node.js + Express + TypeScript + Colyseus 0.17+ + Supabase (`server/`)
- **Live URLs**: naenra.xyz / api.naenra.xyz

---

## Completed Architecture & Features ✅

### Core Gameplay & Anti-Cheat
- 60s timed match loop with letter-slot UI, score popups, and batch question fetching.
- **Support Core Strategy Pattern**: Server-side strategy registry (`server/src/cores/index.ts`) handling 65 cores across 10 families (Combo, Speedster, Oracle, Aegis, Mission, Pandora, Phoenix, High Roller, Power, Balanced). Frontend registry (`client/src/game/cores/registry.ts`) for visual overlays, timer styles, and popups.
- **Anti-Cheat Enforcement**: Server validates `active_core_id` against `game_sessions` DB records per submit-answer POST, and validates `time_taken` against server-side `sessionTimers`.
- **Levenshtein Scoring Penalty**: Typo distance $\ge 80\%$ similarity $\rightarrow -2 \text{ pts/letter}$; $<80\%$ or skip $\rightarrow -10 \text{ pts/letter}$ (capped at 50 pts).

### Session Security & Auth
- JWT authentication middleware checking `players.session_version` in DB for single active session enforcement. Invalidates stale logins via Supabase Realtime Broadcast.
- Email/Password auth with 6-digit OTP verification, Google OAuth token exchange, password reset, and Guest mode token generation (`/auth/guest`).

### Multiplayer (1v1 Colyseus)
- `QueueRoom` automated matchmaking with expanding ELO threshold over time and self-match bypass.
- `MatchRoom` with 4-round structure (Rounds 1–3 Core Mode with 15s core selection; Round 4 Race Mode with 5 fast questions, 12s timeout).
- Custom room ELO locking to prevent boosting.

### AI Integration, Voice & Real-time Streaming (US-95 & US-96 Completed)
- AI Question Generator (`generateQuestions`) using `gemini-2.5-flash` (fallback `gemini-2.0-flash`, `gemini-1.5-flash`) with structured JSON schema (`____` blanks, lowercase `target_word`), live database deduplication (`questions` table exclusion list), and sub-topic context focusing.
- AI Performance Coach (`generateCoachAnalysis`) for personalized vocabulary analytics reports.
- AI Assistant (`generateChatResponse` & `generateChatResponseStream`) using injected knowledge base (`naenra_knowledge_base.md`), offline multi-lingual fallback NLP engine, and Gemini Multimodal Live Voice WebSocket integration (`models/gemini-2.0-flash-exp`).
- **Dynamic AI Persona & Root Admin Function Calling**: Server-side tool execution suite (`deduplicateQuestions`, `getQuestionBankStats`, `listQuestions`, `bulkDeleteQuestions`, `createQuestion`, `updateQuestion`, `deleteQuestion`, `banPlayer`, `unbanPlayer`, `setPlayerAdmin`, `searchDatabase`) and configurable persona engine (`Naenra Coach`, `Cyber Operator`, `Puck Mascot`, `Telemetry Core`, `Custom`).
- **Instant Preemption & Voice Interruption**: Non-blocking input with instant abort of in-flight HTTP SSE streams, typewriter timers, and Web Speech Synthesis (`window.speechSynthesis.cancel()`) upon receiving new text or microphone voice triggers.

### Cross-Device Responsiveness & User Profile (Sprint 6 & 7 Completed)
- `useDeviceMode.ts`: 3-layer touch API, screen width, and user preference detection.
- `VirtualKeyboard.vue`: Cyberpunk QWERTY touch keyboard emitting `keypress` events.
- Synthetic `KeyboardEvent` bridge into `GameplayView.vue`, `GameMultiplayView.vue`, and `GamePureSkillMultiView.vue`.
- Native keyboard suppression via `readOnly` input attribute on touch devices.
- Dynamic `slotSize` scaling for long words on 375px mobile screens.
- **Avatar Upload Optimization**: 10MB raw file support with automatic client-side HTML5 Canvas downsampling (512x512px @ ~100KB) for instant uploads and zero storage bloat.

---

## Technical Constraints & Guidelines for AI Agents

1. **Strategy Pattern Rule**: Never add `if/else` per-core logic in `gameController.ts` or `GameplayView.vue`. All scoring strategies must extend `BaseCore` and register in `server/src/cores/index.ts` and `client/src/game/cores/registry.ts`.
2. **Server Source of Truth**: The server handles all score calculations, session lock status, and anti-cheat validation.
3. **Anti-Cheat Preservation**: Do not weaken `active_core_id` verification or `time_taken` validation during submission.
4. **Desktop UI Parity**: All mobile responsive CSS rules must use Tailwind `lg:` prefixes so PC desktop layouts (`≥1024px`) remain unchanged.
5. **Environment Secrets**: Never commit secrets or real keys to repository files. Use `.env` variables.
6. **Documentation Updates**: Keep `CLAUDE.md`, `README.md`, and `docs/ai_prompts.md` aligned whenever updating API endpoints, AI models, or game mechanics.
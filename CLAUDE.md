# ARENA.ENG – Agent Context Guide (condensed)

> Authoritative technical reference. Read before editing. Update after significant changes.

## Stack
- **Client** (`client/`): Vue 3 + TS, Vite 8, Phaser 3/4, Pinia 3, Vue Router 5, Tailwind CSS 3, Supabase JS 2, Web Speech API
- **Server** (`server/`): Node.js, Express 5, TS, Colyseus 0.17+, Supabase JS 2 (Service Role), `@google/genai` (Gemini SDK), bcrypt, jsonwebtoken, nodemailer, dotenv

## Architecture
```
client/src/
  views/          # GameplayView, CoreSelectionView, CoreSelectionMultiView, CustomRoomView, GameMultiplayView, GamePureSkillMultiView, CoreLibraryView, CoreDetailView, CoreUpgradeDetailView, HomeView, ProfileView, LoginView, VerifyOTPView, ForgotPasswordView, ResetPasswordView, LeaderboardView, MissionsDashboardView, MatchmakingView, MatchFoundView
  stores/         # authStore, gameStore, matchStore, settingsStore, errorStore
  composables/    # useTutorial.ts, useErrorBoundary.ts, useDeviceMode.ts, useGeminiLive.ts, game/ (useAudioEngine, useMatchTimer, useQuestionQueue, useScoreAnimation)
  components/     # AIChatWidget, AiCoachWidget, Avatar, ErrorNotification, GlobalSettingsOverlay, MissionToastOverlay, CoreUnlockCelebrationModal, VirtualKeyboard, game/ (PhaserBackground, AegisShieldIndicator, ComboCoreIndicator, CoreCard, CoreTooltip, CoreUpgradeOverlay, CoreVfxOverlay, FeedbackOverlay, MatchResultOverlay, MissionCoreIndicator, OpponentWidget, OracleCoreIndicator, PandoraOverlay, RoomSettingsOverlay, SpeedsterOverlay)
  game/cores/     # FE core registry (Strategy Pattern): BaseCore.ts, registry.ts, families.ts, icons.ts
  router/         # Auth guards, guest access routing

server/src/
  controllers/    # gameController.ts, userController.ts, feedbackController.ts, guestController.ts
  middleware/     # authMiddleware (JWT + session_version single active session check)
  rooms/          # Colyseus rooms: MatchRoom.ts, QueueRoom.ts
  services/       # aiService.ts (Gemini question generator, coach, AI assistant chat & stream), botGeneratorService.ts, missionEvaluatorService.ts, aiLiveGateway.ts
  utils/          # jwt.ts, otp.ts, mailer.ts, ranks.ts
  data/           # naenra_knowledge.json, naenra_knowledge_base.md
  cores/          # BE scoring strategy system: BaseCore.ts, families.ts, index.ts (65 Cores across 10 Families)
```

## Core System — Strategy Pattern (MOST IMPORTANT)
Each Support Core = self-contained strategy class (BE) / UI module config (FE). No `if/else` chains in `gameController.ts` / `GameplayView.vue`.

**Add a new core:**
- **BE**: Create `server/src/cores/YourCoreStrategy.ts` extending `BaseCore`, implement `calculateCorrect(ctx)` & `calculateWrong(ctx)`; register 1 line entry in `CORE_REGISTRY` inside `server/src/cores/index.ts`.
- **FE**: Get UUID from Supabase `cores` table → add 1 entry in `client/src/game/cores/registry.ts`.
- `gameController.ts` / `GameplayView.vue` are NEVER modified for specific core logic.

**ScoringContext** (`server/src/cores/BaseCore.ts`):
`timeTaken`, `totalTime` (=60000ms), `combo`, `wrongPenalty` (pre-calculated Levenshtein penalty), `oracleRevealLevel` (0–3), `flatBuff`, `multiplierBuff`.

**BE Registry Families** (`server/src/cores/index.ts`):
65 Cores total across 10 families:
1. **Combo Core**: Multiplies score on consecutive correct streaks.
2. **Speedster Core**: Awards up to +200 bonus points for quick answers under 2.5s.
3. **Oracle Core (Argus Eyes)**: Auto-reveals letter slots for difficult words.
4. **Aegis Shield**: Grants protective shields that absorb Levenshtein typo penalties.
5. **Mission Core**: Grants massive bonus points upon reaching target word thresholds.
6. **Pandora Core**: Introduces high-risk, high-reward wild card mechanics.
7. **Phoenix Core**: Rebirth mechanic converting accumulated wrong-answer debt into score boosts.
8. **High Roller Core**: Explosive multipliers (up to 12.0x / 15.0x) balanced by failure penalties.
9. **Power Core**: Direct score amplification per correct answer (+150% to +300%).
10. **Balanced Core**: Stable, consistent score buffs with zero negative penalties.

> **Lookup**: Case-insensitive trimmed core name lookup in `server/src/cores/index.ts`. Unknown core → `NoCoreStrategy` with warning fallback.

## Scoring Engine & Anti-Cheat
`runScoring(isCorrect, core.name, ctx)` in `gameController.ts` replaces monolith scoring. Returns `{ pointsDelta, breakdown }`.

**Wrong-answer penalty (Levenshtein accuracy across all cores):**
- Similarity $\ge 80\%$ (non-empty submission) $\rightarrow$ Typo penalty: $-2 \text{ pts per letter}$.
- Similarity $< 80\%$ or empty/skip $\rightarrow$ Wrong penalty: $-10 \text{ pts per letter}$ (capped at 50 pts).

**Speedster Formula:**
- `speedBonus = floor((1 - timeTaken / 60000) * 200)`
- `pointsDelta = 100 + speedBonus`

**Server-Side Anti-Cheat:**
- Client sends `active_core_id` and `time_taken` in POST `/api/game/submit-answer`.
- Server verifies `active_core_id` matches the DB `game_sessions.active_core_id` locked at session creation (mismatch $\rightarrow$ 403 Forbidden).
- Server validates `time_taken` against server-side in-memory `sessionTimers`.

## Auth & Session Lifecycle
```
Register    → POST /auth/register → validate, dup check → pendingRegistrations (10m TTL) → Send OTP email
Verify OTP  → POST /auth/verify-otp → Supabase admin.createUser → upsert player → Issue 7-day JWT
Login       → POST /auth/login → check not Google-only → signInWithPassword → Issue 7-day JWT
Guest Auth  → POST /auth/guest → generate anonymous player token → limited access
Google OAuth→ signInWithOAuth → onAuthStateChange → POST /auth/token → upsert player → Issue arena_token
Session Security → JWT payload contains session_version; server checks players.session_version DB column.
               New login increments DB session_version, invalidating previous sessions via Realtime Broadcast.
```

## Game Flow (Single Player)
```
CoreSelectionView → Choose 1 Support Core → gameStore.activeCoreId
GameplayView.onMounted → POST /api/game/session { active_core_id } → session_id, theme, active_core
  → GET /api/game/questions (batch 20) → loadQuestion() → questionStartTime = Date.now() → 60s countdown
Each answer → timeTaken = Date.now() - questionStartTime → POST /api/game/submit-answer
  → BE Anti-Cheat check → runScoring() → BE updates score → FE popup & UI feedback
Timer hits 0 → POST /api/game/timeout → status = 'timeout', session score locked
```

## Game Flow (Multiplayer 1v1 Colyseus)
1. **Matchmaking**: `MatchmakingView.vue` connects to `QueueRoom`. Server pairs players based on ELO difference vs wait time (expands over 5s). Self-matching is bypassed.
2. **Match Join**: `QueueRoom` broadcasts `match_found` $\rightarrow$ Clients join `MatchRoom`. `MatchRoom.onAuth` validates JWT and auto-abandons any stuck sessions.
3. **4-Round Loop**:
   - **Rounds 1–3 (Core Mode)**: 15s core selection (`CoreSelectionMultiView`) $\rightarrow$ 60s typing phase $\rightarrow$ Recap screen $\rightarrow$ Next round.
   - **Round 4 (Race Mode)**: Coreless fast-paced round. 5 questions total, 12s server-enforced timeout per question. First to complete wins max points. Real-time broadcasting via `MatchRoom`.

## AI Services Architecture (`server/src/services/aiService.ts`)
- **Primary Model**: `gemini-3.5-flash` (configurable via `GEMINI_MODEL`)
- **Fallback Models**: `gemini-3.1-flash-lite`, `gemini-2.5-flash`, `gemini-2.0-flash`, `gemini-1.5-flash` (dynamic automatic fallback chain)
- **Live Voice Engine**: Gemini 3.1 Flash Live Multimodal WebSocket (`models/gemini-3.1-flash-live-preview` / `GEMINI_LIVE_MODEL`) + Web Speech API PTT STT
- **Functions**:
  1. `generateQuestions(topic, level, count)`: Generates structured JSON fill-in-the-blank questions with `____` placeholders, lowercase `target_word` (a-z letters only), and capitalized hints.
  2. `generateCoachAnalysis(username, analyticsData)`: Generates personalized performance advice based on topic accuracy and weakest words.
  3. `generateChatResponse(username, prompt, history, playerHistory)`: Answers game queries using `naenra_knowledge_base.md` context (65 cores across 10 families, game rules, ELO ranks).
  4. `generateChatResponseStream(...)`: Real-time SSE streaming (`/api/ai/chat/stream`) with chunked text delivery.
- **Smart Fallback Engine**: If Gemini API is unconfigured or rate-limited, an offline multi-lingual NLP engine handles queries with regex-based Vietnamese/English detection and structured response templates.

## Cross-Device & Responsive Touch Keyboard
- **Composable**: `client/src/composables/useDeviceMode.ts` (3-layer touch API + screen width + user preference detection).
- **Component**: `client/src/components/VirtualKeyboard.vue` (Cyberpunk QWERTY touch keyboard emitting `keypress`).
- **Bridge**: `handleVirtualKey(key)` creates synthetic `KeyboardEvent` and routes through existing `handleKeydown()` in gameplay views. On mobile/tablet touch devices, text input elements are set to `readOnly` to prevent native OS keyboard overlay.
- **Scaling**: Dynamic `slotSize` scaling ensures long words (up to 12 letters) render cleanly without overflow on 375px mobile viewports.

## DB Schema Summary
- `cores`: `id` (UUID), `name` (text, matches BE registry case-insensitively), `description`, `flat_buff` (int), `multiplier_buff` (float), `core_type`, `classification`, `tier`.
- `players`: `id` (UUID), `username`, `email`, `elo` (int, default 1000, K=32 update), `session_version` (int), `unlocked_cores` (jsonb array).
- `game_sessions`: `id` (UUID), `player_id`, `active_core_id`, `score`, `status` (`active` | `timeout` | `abandoned`).
- `game_session_answers`: `session_id`, `question_id`, `user_answer`, `is_correct`, `points_delta`, `time_taken`.

## API Endpoints
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | None | Register user & send OTP |
| POST | `/auth/verify-otp` | None | Verify OTP & create Supabase player |
| POST | `/auth/login` | None | Login with email/password |
| POST | `/auth/guest` | None | Create anonymous guest session |
| POST | `/auth/token` | None | OAuth token exchange |
| GET | `/api/user/profile` | JWT | Fetch full user profile & ELO rank |
| PATCH | `/api/user/profile` | JWT | Update username / avatar |
| GET | `/api/game/questions` | JWT | Batch fetch 20 questions |
| GET | `/api/game/cores` | JWT | List unlocked & total cores |
| POST | `/api/game/session` | JWT | Initialize single-player session |
| POST | `/api/game/submit-answer` | JWT | Process typing submission & scoring |
| POST | `/api/game/timeout` | JWT | End & lock session on timer expiry |
| GET | `/api/ai/chat/stream` | JWT | SSE stream for AI Assistant chat |
| GET | `/health` | None | Server status check |

## Environment Variables
- `client/.env`: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SERVER_URL`, `VITE_SITE_URL`
- `server/.env`: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `JWT_SECRET`, `GEMINI_API_KEY`, `RESEND_API_KEY`, `MAIL_FROM`

## Agent Rules
1. Read files before editing; execute actual file modifications.
2. New core added $\rightarrow$ update `server/src/cores/index.ts` and `client/src/game/cores/registry.ts`.
3. No `if/else` per-core logic in `gameController.ts` or `GameplayView.vue` — use strategy registry.
4. Server is the single source of truth for scores and anti-cheat validation.
5. Desktop UI (`≥1024px`) must remain completely untouched when adding mobile responsive adjustments (`lg:` prefixing).
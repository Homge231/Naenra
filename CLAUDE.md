# ARENA.ENG – Agent Context Guide (condensed)

> Authoritative technical reference. Read before editing. Update after significant changes.

## Stack
**Client** (`client/`): Vue 3 + TS, Vite 8, Phaser 4, Pinia 3, Vue Router 5, Tailwind 3, Supabase JS 2
**Server** (`server/`): Node.js, Express 5, TS, Colyseus 0.17, Supabase JS 2 (service key), bcrypt, jsonwebtoken, nodemailer, dotenv

## Architecture
```
client/src/
  views/          # GameplayView, CoreSelectionView, HomeView, ProfileView, LoginView, VerifyOTPView, ForgotPasswordView, ResetPasswordView
  stores/         # authStore, gameStore, errorStore
  components/     # Avatar, ErrorNotification, game/PhaserBackground
  game/cores/     # FE core registry (Strategy Pattern): BaseCore.ts (CoreModule iface + PENDING_UUID), registry.ts (uuid→config)
  router/         # auth guards

server/src/
  controllers/    # gameController.ts (getQuestion(s), getCores, createSession, submitAnswer, timeoutSession, abandonSession)
                  # userController.ts (getUserProfile, updateUserProfile — rank from elo)
  middleware/     # authMiddleware (JWT)
  utils/          # jwt.ts, otp.ts, mailer.ts
  cores/          # BE scoring strategy system: BaseCore.ts (ScoringContext/Result types), NoCore/Combo/Oracle/SpeedsterCoreStrategy.ts, index.ts (registry + runScoring())
```

## Core System — Strategy Pattern (MOST IMPORTANT)
Each Support Core = self-contained class (BE) / config (FE). No `if/else` chains in `gameController.ts` / `GameplayView.vue`.

**Add a new core:**
- BE: new `server/src/cores/YourCoreStrategy.ts` extending `BaseCore`, implement `calculateCorrect(ctx)`; register 1 line in `cores/index.ts`.
- FE: get UUID from Supabase `cores` row → 1 entry in `client/src/game/cores/registry.ts`.
`gameController.ts` / `GameplayView.vue` never touched.

**ScoringContext** (`server/src/cores/BaseCore.ts`): `timeTaken`, `totalTime` (=60000ms), `combo`, `wrongPenalty` (pre-calc Levenshtein), `oracleRevealLevel` (0-3), `flatBuff`, `multiplierBuff`.

**BE registry** (`server/src/cores/index.ts`), lookup by `core.name` (case-insensitive/trimmed), unknown → `NoCoreStrategy` + warn:
| key | class | formula |
|---|---|---|
| `no core` | NoCoreStrategy | `floor((100+flat_buff)×multiplier_buff)` |
| `combo core` | ComboCoreStrategy | `floor((100+comboBonus+flat_buff)×multiplier_buff)` |
| `oracle core` | OracleCoreStrategy | No Core minus oracle penalty |
| `speedster` | SpeedsterCoreStrategy | `100+floor((1−timeTaken/60000)×200)` |

> Jira Sprint 3 scopes 6 tactical cores (Combo/Speed/Oracle/Aegis-Shield/Mission/Pandora). Above table = only what's confirmed shipped at last check — verify `cores/index.ts` directly.

**CoreModule iface** (`client/src/game/cores/BaseCore.ts`): `id`, `name` (matches DB), `timerColor`, `timerClass`, `timerIconClass`, `popupType: 'correct'|'speedster'`, `showWindOverlay?`.

**FE registry** (`client/src/game/cores/registry.ts`):
| UUID | Core | Effects |
|---|---|---|
| `...0001` | No Core | none |
| `...0005` | Combo Core | none |
| `...0006` | Oracle Core | own template block |
| `...0007` | Speedster | cyan timer glow, wind overlay, "+N FAST!" popup |

Không đủ dữ liệu để xác minh UUIDs for Aegis/Mission/Pandora — check `registry.ts` + Supabase `cores` table.

GameplayView usage: `activeCoreModule = computed(() => getCoreModule(gameStore.activeCoreId))` drives timer classes, wind overlay `v-if`, popup type.

## Scoring Engine
`runScoring(isCorrect, core.name, ctx)` in `gameController.ts` replaces old `calculateScore()` monolith → `{ pointsDelta, breakdown }`.

**Wrong-answer penalty** (Levenshtein accuracy, all cores): accuracy ≥80% → `max(1, distance×2)` no cap; <80%/skip → `clamp(distance×10, 10, 50)`.

**Speedster (US-17.1):** `speedBonus = floor((1−timeTaken/60000)×200)`; `pointsDelta = 100+speedBonus` (ignores buffs). 1s→~297, 30s→~200, 59s→~103.

## time_taken tracking
`questionStartTime` reset in `loadQuestion()`. `checkAnswer()`/`skipQuestion()` compute `Date.now()-questionStartTime`, sent in every submit-answer POST.

## Visual Effects — Speedster (US-17.2/17.3)
`.speedster-timer-glow` (cyan pulse 0.8s), `.speedster-timer-icon` (pulse+drop-shadow), `.speedster-wind-container`+`.wind-streak.ws1-6` (6 streaks, 0.65-0.95s staggered), `.speedster-slots-glow`, `.speedster-fast-text` popup (shimmer, 1.8s burst).

## Auth Flow
```
Register → POST /auth/register → validate, dup check → pendingRegistrations(TTL 10m) → OTP email → 200
Verify OTP → POST /auth/verify-otp → supabase admin.createUser → upsert players → JWT → 201
Login → POST /auth/login → check not Google-only → signInWithPassword → JWT → 200
Google OAuth → signInWithOAuth → onAuthStateChange → POST /auth/token → upsert players → arena_token
Reset → resetPasswordForEmail → /reset-password → updateUser
```
Token: `localStorage.arena_token` (7-day JWT).

> Sprint 5 in progress: single-session enforcement via `session_version` col + RPC + JWT check, invalidated on new login via Supabase Realtime Broadcast (REST). `fetchWithAuth` race condition (stale 401 clears fresh valid token) under investigation — verify current state before assuming resolved.

## Game Flow
```
CoreSelectionView → pick core → gameStore.activeCoreId
GameplayView.onMounted → POST /api/game/session{active_core_id} → session_id,theme,active_core
  → GET /api/game/questions (batch 20) → loadQuestion() → questionStartTime=now() → 60s countdown
Each answer → timeTaken=now()-questionStartTime → POST /api/game/submit-answer{session_id,question_id,answer,current_combo,active_core_id,oracle_reveal_level,time_taken}
  → BE anti-cheat (core mismatch→403) → runScoring() → score updated from BE response → popup
Timer 0 → POST /api/game/timeout → status='timeout', score locked
```

## DB Schema
`cores`: id(uuid), name(text, BE-matched case-insensitive), description, flat_buff(int,def 0), multiplier_buff(float,def 1.0). Speedster row not yet seeded — copy UUID to registry.ts once inserted.
`game_sessions`: active_core_id(FK, locked at creation, validated per submit), score(int), status(active|timeout|abandoned).
`game_session_answers`: points_delta(int, +earn/-penalty).
`players`: elo(int, def 1000, updated post-match since Sprint 3), hashed_password(empty for Google users).

## API Endpoints
| Method | Path | Auth | Desc |
|---|---|---|---|
| POST | /auth/register | ✗ | validate, OTP, pending reg |
| POST | /auth/verify-otp | ✗ | create user+player |
| POST | /auth/resend-otp | ✗ | resend OTP |
| POST | /auth/login | ✗ | email/password |
| POST | /auth/token | ✗ | exchange Supabase token (Google) |
| GET | /auth/check-email | ✗ | provider detection |
| GET | /api/user/profile | JWT | full profile+rank |
| PATCH | /api/user/profile | JWT | update username/avatar |
| GET | /api/game/questions | JWT | batch 20 |
| GET | /api/game/cores | JWT | list cores |
| POST | /api/game/session | JWT | create session |
| POST | /api/game/submit-answer | JWT | score via registry |
| POST | /api/game/timeout | JWT | lock session |
| POST | /api/game/abandon | JWT | abandon |
| GET | /health | ✗ | status |

## Tailwind Palette
`hexred:#E63946 orange:#FF7B00 lightOrange:#FFA62B blue:#3B82F6 lightBlue:#60A5FA darkNavy:#0F172A success:#22C55E`

## Env Vars
`client/.env`: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_SERVER_URL, VITE_SITE_URL
`server/.env`: SUPABASE_URL, SUPABASE_SERVICE_KEY, JWT_SECRET, RESEND_API_KEY, MAIL_FROM

## Sprint Status
> Source: Jira project `IN` (Intern_Project—AXONACTIVE), cloudId `169b52ba-e4c2-43ae-b78f-6f300cb11e96`. Verified 2026-07-20.

| Sprint | State | Dates | Issues | Goal |
|---|---|---|---|---|
| 1 | closed | 06-15→06-21 | 14/14 Done | Auth (Email+Google) + protected Lobby |
| 2 | closed | 06-22→06-29 | 18 (17D/1TD) | Playable core loop |
| 2.5 Bug Fixes | closed (untracked in Jira) | — | — | See below |
| 3: Support Core | closed | 06-29→07-06 | 44 (35D/2WI/7TD) | 15s core select, server scoring, 6 tactical cores |
| 4: Core Loop Completion | closed | 07-06→07-13 | 47 (32D/15TD) | 3-Round loop, dynamic backgrounds, session security, AI question gen |
| 5: Single-Player Polish | completed (dev) | 07-13→07-20 | (Pending Jira Sync) | Analytics/tutorials/tooltips + WS/Colyseus groundwork for 1v1 |

Sprint 2.5 fixes: Aegis Shield 0-shield default, `getCoreIconPath` crash fix, `@error` icon fallback→default.svg, Oracle Tier-1 penalty-bypass fix, Phoenix bonus 200→100 (total 200 not 300), Session State Leak fix (clear `gameStore.sessionId` on goHome/submitCore).

Sprint 5 fixes & groundwork: `session_version` enforcement, `fetchWithAuth` race condition resolved, Colyseus `@colyseus/sdk` v0.17+ alignment done. Multiplayer base (Custom Rooms, Game loop, Real-time event broadcasting/Toast UI) complete.

⚠️ ELO-post-match and full Colyseus matchmaking rooms are **not confirmed scheduled to any sprint** — không đủ dữ liệu để xác minh; check Jira backlog before planning against them.

## CORS Origins
naenra.xyz, www.naenra.xyz, axonproject.onrender.com, localhost:5173

## Deployment (Render)
Server: root `server/`, build `npm install && npm run build`, start `npm start`, → api.naenra.xyz
Client: root `client/`, build `npm install && npm run build`, publish `dist` → naenra.xyz

## Agent Rules
- Read files before editing; make changes, don't just describe them.
- New core → update this file's registry tables.
- Speedster UUID `...0007`, final in `registry.ts`.
- No `if/else` per-core in `gameController.ts` — use strategy registry.
- No hardcoded core UUIDs in `GameplayView.vue` — use `activeCoreModule`.
- Cross-check sprint/status claims against Jira `IN` before stating as fact.
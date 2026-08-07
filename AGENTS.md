# AGENTS.md — AI Agent Handoff (condensed)

> Full architecture/scoring detail lives in `CLAUDE.md`. This file = current state + next steps only.

## Project
Naenra (ARENA.ENG) — competitive typing game, 60s timed vocabulary matches with power-up "Support Cores".
FE: Vue3+TS+Pinia+Tailwind (`client/`). BE: Node+Express+TS+Supabase (`server/`). Live: naenra.xyz / api.naenra.xyz.

## Done ✅ (Sprint 1–5, closed/dev completed)
Auth (email/password+OTP, Google OAuth, reset), JWT middleware, profile/elo/rank, 60s match loop, letter-slot UI, score popups, batch question fetch, session lifecycle, anti-cheat, Core Strategy Pattern (BE `server/src/cores/`, FE `client/src/game/cores/`), Levenshtein penalty, 12 Support Core families (Combo, Oracle, Speedster, Aegis, Mission, Pandora, Phoenix, High Roller, Balanced, Power, etc.), Support Core selection UI (15s), 3-Round loop (Select→Type→Recap), dynamic backgrounds, AI question generator, single active session enforcement (`session_version`), `fetchWithAuth` race condition resolution, Colyseus v0.17+ alignment, vocabulary analytics, interactive tutorials, custom room multiplayer UI, Full Colyseus automated matchmaking queues and Race Mode (Round 4), US-77 Upgrade selection timeout & disconnect navigation bug fix (`room_terminated` event + `/lobby` redirect), US-88 (IN-352) Homepage Instant Play & Guest Restrictions (`/auth/guest`, Enter key shortcut, guest feature lock badges, account conversion CTA), Custom Match ELO Lock Bypass, AI Off-topic & rules/ranking fallbacks, and IN-366 (US-89) Support Core Audio, Visual, and Typing Interaction Polish.

## Completed This Week ✅ (2026-08-07, outside Jira sprint)
- **AI Assistant Online Fix**: Resolved `server/.env` `xSUPABASE_SERVICE_KEY` typo causing Supabase crash on startup. Fixed dotenv loading order in `server/src/index.ts` (moved `dotenv.config()` before all imports to prevent race condition with `supabase.ts`). Updated `GEMINI_API_KEY`. Removed `gemini-2.0-flash` quota-exhausted fallback; AI chat now uses `gemini-flash-latest` exclusively.
- **AI System Prompt Update**: Injected explicit `40+ cores, 12 families` fact into system context to prevent AI undercounting cores.
- **Speech Recognition UX**: Updated `AIChatWidget.vue` error handler to show specific error reasons (`not-allowed`, `network`, `service-not-allowed`, `audio-capture`) instead of a generic message.
- **GitHub Push Protection**: Cleaned `.agents/mcp_config.json` — removed Jira API token from committed file.

## In progress 🔄
- Finalizing Jira sync & production regression verification.
- Post-match ELO ranking updates integration.
- Production server (`api.naenra.xyz`) deployment of AI fix (requires SSH + `git pull && npm run build` on VPS).

## Planned Next Week \ud83d\udcc5 (Sprint 6 candidate, week of 2026-08-11)

### Feature: Cross-Device Responsiveness & Simulated Virtual Cyber Keyboard
> **Goal**: Make Naenra fully playable on mobile (iOS/Android) and tablet touchscreens without breaking any existing PC desktop behaviour.

#### New Files to Create:
| File | Purpose |
|---|---|
| `client/src/composables/useDeviceMode.ts` | 3-layer device detection (touch API + screen width + user preference). Exposes `showVirtualKeyboard`, `isMobileScreen`, `isTouchDevice` reactive refs. |
| `client/src/components/game/VirtualKeyboard.vue` | Cyberpunk-styled QWERTY touch keyboard (rows: QWERTYUIOP / ASDFGHJKL / ZXCVBNM + ⌫ + SKIP⏩). Emits `keypress(key: string)`. Renders only when `showVirtualKeyboard === true`. |

#### Files to Modify:
| File | Change Summary |
|---|---|
| `client/src/views/GameplayView.vue` | Add `handleVirtualKey(key)` → creates synthetic `KeyboardEvent` → calls existing `handleKeydown()`. Add `useDeviceMode()`. Dynamic `slotSize` computed for mobile-safe letter slot scaling. On touch: set `inputRef` to `readOnly` to suppress native keyboard. Mount `<VirtualKeyboard>`. |
| `client/src/views/GameMultiplayView.vue` | Same as GameplayView changes above. |
| `client/src/views/GamePureSkillMultiView.vue` | Same as GameplayView changes above. |
| `client/src/views/CoreSelectionView.vue` | Ensure LOCK CORE buttons have `min-h-[44px]` (iOS touch target). Add `px-4` safe horizontal padding for 375px screens. |
| `client/src/views/CoreSelectionMultiView.vue` | Same CoreSelection touch target fixes. |
| `client/vite.config.ts` | Add `build.rollupOptions.output.manualChunks` to split `phaser`, `@colyseus/sdk`, `@supabase/supabase-js` into isolated vendor chunks. Add `esbuild: { drop: ['console', 'debugger'] }` for production. |
| `client/index.html` | Update `<meta name="viewport">` to `width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover`. Add `<link rel="preconnect">` for Supabase and API. |
| `client/src/style.css` | Add `touch-action: manipulation` to button/input elements. Add `-webkit-tap-highlight-color: transparent`. Add safe-area inset CSS vars. |
| `client/public/` | Convert `bg-cafe.png` (2.55MB), `bg-daily-life.png` (2.97MB), `bg-travel.png` (2.67MB) → WebP format (~110KB each). Update `THEME_MAP` in `GameplayView.vue`. |

#### Technical Constraints to Respect:
1. **Anti-cheat is safe**: `handleVirtualKey()` routes through the same `handleKeydown()`. Server-side `active_core_id` check in `submitAnswer()` is NOT touched.
2. **`time_taken` unaffected**: Speedster scoring uses `Date.now() - questionStartTime.value` (wall clock) — identical for touch vs keyboard.
3. **PC desktop: zero visual change**: All responsive classes use `lg:` prefix. Desktop slot sizes stay `w-14 h-20 text-4xl`.
4. **No `if/else` per-core added**: No new per-core branching; `VirtualKeyboard` is UI-only, agnostic to core type.

#### Not yet scheduled ❌
Check Jira backlog before planning.

## Sprint Timeline (Jira project `IN`, verified 2026-07-20)
| Sprint | State | Dates | Issues | Goal |
|---|---|---|---|---|
| 1 | closed | 06-15→06-21 | 14/14 Done | Auth + protected Lobby |
| 2 | closed | 06-22→06-29 | 18 (17 Done/1 To Do) | Core game loop |
| 3: Support Core | closed | 06-29→07-06 | 44 (35 Done/2 Waiting/7 To Do) | 15s core select, server scoring, 6 tactical cores |
| 4: Core Loop Completion | closed | 07-06→07-13 | 47 (32 Done/15 To Do) | 3-Round loop, backgrounds, session security, AI questions |
| 5: Single-Player Polish | active | 07-13→07-20 | 54 (16 Done/36 To Do/2 In Review) | Analytics/tutorials/tooltips + WS/Colyseus groundwork |

16 issues unassigned to any sprint.

## Rules for AI Agents
1. Read files before editing; never just describe changes.
2. No `if/else` per-core in `gameController.ts` — use strategy registry.
3. No hardcoded core UUIDs in `GameplayView.vue` — use `activeCoreModule`.
4. Update `CLAUDE.md` sprint status after completing a story — cross-check Jira `IN`, don't carry forward assumptions.
5. No secrets in commits (`.env` gitignored).
6. Server is source of truth for scores.
7. Anti-cheat (`active_core_id` check in `submitAnswer()`) must not be weakened.
8. `time_taken` always sent from FE regardless of core.
9. Don't state a sprint assignment unless Jira-verified.
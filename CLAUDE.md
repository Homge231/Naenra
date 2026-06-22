# ARENA.ENG — Project Context

## Stack

**Client** (`client/`): Vue 3 + TypeScript, Vite 8, Phaser 4, Pinia 3, Vue Router 5, TailwindCSS 3, Supabase JS 2

**Server** (`server/`): Node.js, Express 5, TypeScript, Colyseus 0.17, Supabase JS 2 (service key), bcrypt, jsonwebtoken, nodemailer, dotenv

---

## Architecture

### Client

| Path | Role |
|---|---|
| `src/main.ts` | App bootstrap, Pinia, Router, Supabase auth listener + exchangeTokenAfterOAuth |
| `src/router/index.ts` | Vue Router; guards check `localStorage.arena_token` + Supabase session |
| `src/lib/supabase.ts` | Supabase client (anon key) |
| `src/stores/authStore.ts` | Auth state: user, profile, login/register/logout, exchangeTokenAfterOAuth. **fetchProfile now calls `/api/user/profile` via arena JWT (not Supabase anon client) to bypass RLS.** |
| `src/stores/errorStore.ts` | Global toast notification store |
| `src/stores/gameStore.ts` | Game session state (unused in Sprint 1) |
| `src/game/PhaserGame.ts` | Phaser 4 init (transparent, RESIZE mode) |
| `src/game/scenes/` | PreloadScene → BackgroundScene (placeholder debug text, remove before demo) |
| `src/components/ErrorNotification.vue` | Toast UI (top-right, type-colored) |
| `src/views/LoginView.vue` | Login + Register tabs; calls `POST /auth/login` via `authStore.loginWithEmail`; **"Remember Me" checkbox saves email to localStorage** |
| `src/views/VerifyOTPView.vue` | 6-digit OTP input; calls `POST /auth/verify-otp` |
| `src/views/HomeView.vue` | Authenticated home / matchmaking stub; avatar clickable → /profile |
| `src/views/ProfileView.vue` | View + edit username/avatar; shows elo, rank, wins, losses, matches |
| `src/views/ForgotPasswordView.vue` | Supabase `resetPasswordForEmail` |
| `src/views/ResetPasswordView.vue` | Supabase `updateUser` (handles `#access_token` hash) |
| `src/views/SignupView.vue` | DEAD CODE — delete before Sprint 2 |

### Server

| Path | Role |
|---|---|
| `src/index.ts` | Express + HTTP server on port 3000; mounts `/auth` and `/api/user`; body limit 10mb; CORS configured for naenra.xyz, www.naenra.xyz, axonproject.onrender.com, localhost:5173
| `src/routes/authRoutes.ts` | All auth endpoints |
| `src/routes/userRoutes.ts` | Profile endpoints: GET/PATCH `/api/user/profile` |
| `src/controllers/userController.ts` | getUserProfile, updateUserProfile; rank computed from elo |
| `src/middleware/authMiddleware.ts` | JWT Bearer verification; attaches `req.user` |
| `src/utils/jwt.ts` | `generateToken` / `verifyToken` (7d expiry) |
| `src/utils/otp.ts` | In-memory OTP store (10-min TTL) |
| `src/utils/mailer.ts` | nodemailer via Gmail SMTP |

---

## Auth Flow

```
Register → POST /auth/register
  → validate → check duplicate email in auth.users (catches Google-only accounts too)
  → pendingRegistrations Map (TTL 10min, auto-cleanup every 5min)
  → generateOTP → saveOTP → sendOTPEmail → 200 {email}

Verify OTP → POST /auth/verify-otp
  → verifyOTP → check pending expiry
  → supabase.auth.admin.createUser (plain pw, email_confirm:true)
  → upsert players row (elo:1000, wins:0, losses:0, total_matches:0 explicitly set)
  → delete pending → generateToken → 201 {token, user}

Login → POST /auth/login
  → check if email is Google-only (returns clear error if so)
  → supabase.auth.signInWithPassword → fetch players profile → generateToken → 200 {token, user}
  → client: authStore.loginWithEmail stores token, calls fetchProfile() via arena JWT

Google OAuth → client calls supabase.auth.signInWithOAuth (prompt: 'select_account') → redirect /home
  → onAuthStateChange SIGNED_IN fires → exchangeTokenAfterOAuth()
  → POST /auth/token → upsert players row if missing (elo:1000 explicitly set, saves avatar_url from Google)
  → arena_token stored → fetchProfile() called

Password Reset → ForgotPasswordView → supabase.auth.resetPasswordForEmail (redirectTo /reset-password)
  → ResetPasswordView handles #access_token hash → supabase.auth.updateUser
```

Token storage: `localStorage.arena_token`

Remember Me storage: `localStorage.arena_remember_me` + `localStorage.arena_saved_email`

---

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | — | Validate, check auth.users for conflicts (incl. Google-only), send OTP, store pending |
| POST | `/auth/verify-otp` | — | Verify OTP, create user+player row (explicit elo:1000) |
| POST | `/auth/resend-otp` | — | Resend OTP |
| POST | `/auth/login` | — | Check not Google-only, email/password login |
| POST | `/auth/token` | — | Exchange Supabase token for arena JWT + upsert player row (explicit elo:1000) |
| GET | `/auth/me` | JWT | Return decoded user |
| GET | `/auth/profile` | JWT | Return players row (legacy) |
| GET | `/api/user/profile` | JWT | Return full profile: username, avatar_url, elo, rank, wins, losses, total_matches |
| PATCH | `/api/user/profile` | JWT | Update username and/or avatar_url |
| GET | `/health` | — | Server status |

---

## Database (Supabase/PostgreSQL)

Table `players` — actual schema:

| Column | Type | Notes |
|---|---|---|
| id | uuid | FK → auth.users.id |
| email | text | |
| username | text | |
| hashed_password | text | bcrypt hash; empty string for Google OAuth users |
| avatar_url | text | nullable |
| elo | int | default 1000 |
| wins | int | default 0 |
| losses | int | default 0 |
| total_matches | int | default 0 |
| created_at | timestamptz | |
| updated_at | timestamptz | |

RLS enabled. Server uses `SUPABASE_SERVICE_KEY` to bypass RLS for admin ops.

**No `rank` column** — rank is computed server-side from elo:
```
>= 2000 → Grandmaster
>= 1800 → Master
>= 1600 → Diamond
>= 1400 → Platinum
>= 1200 → Gold
>= 1000 → Silver
<  1000 → Bronze
```

---

## Environment Variables

**`client/.env`**
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_SERVER_URL=http://localhost:3000
VITE_SITE_URL=http://localhost:5173
```

**`server/.env`**
```
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
JWT_SECRET=
MAIL_USER=
MAIL_PASS=
```

---

## Known Issues / Architecture Notes

- `pendingRegistrations` is in-memory — lost on server restart. Documented limitation for Sprint 1; move to Redis/Supabase in future sprint.
- No rate limiting on auth endpoints yet — Sprint 1 deferred.
- `BackgroundScene` has placeholder debug text — remove before any demo.
- `SignupView.vue` and `/signup` route are dead code — delete before Sprint 2.
- Avatar upload stores base64 in Supabase DB column — not ideal for large images. Move to Supabase Storage in future sprint.
- **Dual auth architecture**: custom JWT (`arena_token`) for all API calls + Supabase session for OAuth/password reset. `fetchProfile` in authStore now always uses the arena JWT to call `/api/user/profile`, avoiding Supabase RLS issues that previously caused elo to show as 0.
- `supabase.auth.admin.listUsers()` in `/register` and `/login` endpoints does a full user list scan to detect Google-only accounts. This is fine at small scale but should be replaced with a targeted lookup (`getUserByEmail` if available) before production scaling.

---

## Bug Fixes (Sprint 1 post)

### 1. Google + email same-account conflict
**Problem**: A user who signed up with Google could attempt to register again with the same email (or vice versa), causing confusing errors or silent failures.
**Fix**: `POST /auth/register` now checks `supabase.auth.admin.listUsers()` for the email and returns a clear error if the account is Google-only. `POST /auth/login` does the same check before attempting password auth, returning `"This account uses Google sign-in. Please use the Google button."` if applicable.

### 2. ELO shows as 0 after account creation
**Problem**: `authStore.fetchProfile()` used the Supabase **anon client** which is blocked by RLS for the `players` table (no valid Supabase session context after email/password login via custom backend). Result: `profile = null`, elo fell back to `?? 0`.
**Fix**: `fetchProfile()` now calls `GET /api/user/profile` using the `arena_token` Bearer JWT. The server uses the service key to bypass RLS and returns the correct elo. Additionally, `verify-otp` and `/auth/token` now explicitly set `elo: 1000` on insert rather than relying solely on DB defaults.

### 3. Google always re-prompts for account selection / no "Remember Me"
**Problem**: `signInWithOAuth` had no `prompt` param so Google always showed the account chooser. Email login had no persistence mechanism.
**Fix**:
  - Google: Added `queryParams: { prompt: 'select_account' }` so it's explicit when the user clicks "Connect with Google" (intentional selection), but subsequent auto-logins via existing Supabase session skip the OAuth flow entirely.
  - Email: Added "Remember Me" checkbox in `LoginView.vue`. When checked, saves email to `localStorage.arena_saved_email` and restores it on next visit.

---

## Sprint Status

**Sprint 1 (complete)**:
- Auth foundation: register + OTP verify, email/password login, Google OAuth, password reset
- JWT middleware, players table upsert, error toast system
- HomeView with real username/avatar/elo from authStore
- ProfileView: view + edit username/avatar (click-to-upload), stats display
- Rank computed from elo server-side
- Fixed: logout redirect, pendingRegistrations TTL, Google OAuth player row creation
- Fixed (post): Google+email conflict detection, elo=0 bug, Remember Me for email login

**Sprint 2 (next)**: Colyseus room definition, matchmaking, game loop, CoreSelectionView, GameplayView.

---

## Tailwind Color Palette

```js
hexred: '#E63946'
orange: '#FF7B00'
lightOrange: '#FFA62B'
blue: '#3B82F6'
lightBlue: '#60A5FA'
darkNavy: '#0F172A'
success: '#22C55E'
```

---

## Run Locally

## CORS Origins (server)
- https://naenra.xyz
- https://www.naenra.xyz  
- https://axonproject.onrender.com
- http://localhost:5173 (local dev)

## Deployment (Railway)

## Deployment (Render)

**Server (Web Service):**
- Root Directory: `/server`
- Build Command: `npm install && npm run build`
- Start Command: `npm start`
- URL: https://axonproject-1.onrender.com

**Client (Static Site):**
- Root Directory: `/client`
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`
- URL: https://axonproject.onrender.com
- Custom Domain: https://naenra.xyz

**Environment Variables:**
- Client: VITE_SERVER_URL=https://axonproject-1.onrender.com
- Client: VITE_SITE_URL=https://naenra.xyz
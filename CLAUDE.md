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
| `src/stores/authStore.ts` | Auth state: user, profile, login/register/logout, exchangeTokenAfterOAuth |
| `src/stores/errorStore.ts` | Global toast notification store |
| `src/stores/gameStore.ts` | Game session state (unused in Sprint 1) |
| `src/game/PhaserGame.ts` | Phaser 4 init (transparent, RESIZE mode) |
| `src/game/scenes/` | PreloadScene → BackgroundScene (placeholder debug text, remove before demo) |
| `src/components/ErrorNotification.vue` | Toast UI (top-right, type-colored) |
| `src/views/LoginView.vue` | Login + Register tabs; calls `POST /auth/login` and `POST /auth/register` |
| `src/views/VerifyOTPView.vue` | 6-digit OTP input; calls `POST /auth/verify-otp` |
| `src/views/HomeView.vue` | Authenticated home / matchmaking stub; avatar clickable → /profile |
| `src/views/ProfileView.vue` | View + edit username/avatar; shows elo, rank, wins, losses, matches |
| `src/views/ForgotPasswordView.vue` | Supabase `resetPasswordForEmail` |
| `src/views/ResetPasswordView.vue` | Supabase `updateUser` (handles `#access_token` hash) |
| `src/views/SignupView.vue` | DEAD CODE — delete before Sprint 2 |

### Server

| Path | Role |
|---|---|
| `src/index.ts` | Express + HTTP server on port 3000; mounts `/auth` and `/api/user`; body limit 10mb |
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
  → validate → check duplicate email → bcrypt hash
  → pendingRegistrations Map (TTL 10min, auto-cleanup every 5min)
  → generateOTP → saveOTP → sendOTPEmail → 200 {email}

Verify OTP → POST /auth/verify-otp
  → verifyOTP → check pending expiry
  → supabase.auth.admin.createUser (plain pw, email_confirm:true)
  → upsert players row → delete pending → generateToken → 201 {token, user}

Login → POST /auth/login
  → supabase.auth.signInWithPassword → fetch players profile → generateToken → 200 {token, user}

Google OAuth → client calls supabase.auth.signInWithOAuth → redirect /home
  → onAuthStateChange SIGNED_IN fires → exchangeTokenAfterOAuth()
  → POST /auth/token → upsert players row if missing (saves avatar_url from Google) → arena_token stored

Password Reset → ForgotPasswordView → supabase.auth.resetPasswordForEmail (redirectTo /reset-password)
  → ResetPasswordView handles #access_token hash → supabase.auth.updateUser
```

Token storage: `localStorage.arena_token`

---

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | — | Validate, send OTP, store pending |
| POST | `/auth/verify-otp` | — | Verify OTP, create user+player row |
| POST | `/auth/resend-otp` | — | Resend OTP |
| POST | `/auth/login` | — | Email/password login |
| POST | `/auth/token` | — | Exchange Supabase token for arena JWT + upsert player row |
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

## Known Issues

- `pendingRegistrations` is in-memory — lost on server restart. Documented limitation for Sprint 1; move to Redis/Supabase in future sprint.
- No rate limiting on auth endpoints yet — Sprint 1 deferred.
- `BackgroundScene` has placeholder debug text — remove before any demo.
- `SignupView.vue` and `/signup` route are dead code — delete before Sprint 2.
- Avatar upload stores base64 in Supabase DB column — not ideal for large images. Move to Supabase Storage in future sprint.

---

## Sprint Status

**Sprint 1 (complete)**:
- Auth foundation: register + OTP verify, email/password login, Google OAuth, password reset
- JWT middleware, players table upsert, error toast system
- HomeView with real username/avatar/elo from authStore
- ProfileView: view + edit username/avatar (click-to-upload), stats display
- Rank computed from elo server-side
- Fixed: logout redirect, pendingRegistrations TTL, Google OAuth player row creation

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

```bash
# Client
cd client && npm install && npm run dev

# Server
cd server && npm install && npm run dev
```

Client: http://localhost:5173
Server: http://localhost:3000/health

## Deployment (Railway)

Client SPA deployment:
1. Root Directory: `/client`
2. Pre-deploy: `npm install && npm run build`
3. Start: `npx serve -s dist -l $PORT`
4. Add Railway domain to Supabase redirect URLs
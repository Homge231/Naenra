# NAENRA (ARENA.ENG) ⚡

> **Competitive Cyberpunk Real-Time Vocabulary Arena with Tactical Support Cores & AI Assistance**

[![Vue 3](https://img.shields.io/badge/Vue_3-3.5+-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.2-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Colyseus](https://img.shields.io/badge/Colyseus-0.17+-F87171?style=for-the-badge&logo=websocket&logoColor=white)](https://colyseus.io/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-3.5_Flash-8E75B2?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

🌐 **Live Web Application**: [https://naenra.xyz](https://naenra.xyz)  
🚀 **Live Backend API**: [https://api.naenra.xyz](https://api.naenra.xyz)

---

## 🌟 Key Architecture & Features

- **60-Second Timed Arena**: Fast-paced fill-in-the-blank vocabulary challenges with interactive letter-slot UI, dynamic hint levels, and real-time score animations.
- **65 Support Cores across 10 Families (Strategy Pattern)**: Modular ability architecture decoupling score calculations into 10 families (*Combo, Speedster, Oracle, Aegis, Mission, Pandora, Phoenix, High Roller, Power, Balanced*), eliminating conditional branching in controllers with an $O(1)$ Strategy Pattern.
- **1v1 Real-Time Multiplayer (Colyseus WebSockets)**: Low-latency multiplayer matchmaking with expanding ELO search radius (`QueueRoom`) and synchronized 4-round matches (`MatchRoom`) featuring a 12-second sudden-death Race Mode.
- **Generative AI Assistant & Performance Coach**: Integrated with `@google/genai` (**Gemini 3.5 Flash** with automated fallback chain to `3.1-flash-lite`, `2.5-flash`), delivering structured JSON question generation, real-time **Server-Sent Events (SSE)** chat streaming, and personalized player diagnostic reports.
- **Authoritative Anti-Cheat & Session Security**: Server-side in-memory session timers, core verification per answer submit, concurrent session termination via JWT + database `session_version` invalidation on Supabase Realtime, and a **Levenshtein distance penalty engine** ($\ge 80\%$ typo penalty vs $<80\%$ wrong penalty).
- **Cross-Device Cyberpunk UI & Touch Keyboard**: Built with Vue 3 Composition API, Pinia, and Tailwind CSS. Features an interactive custom `VirtualKeyboard` with a 3-layer touch detection bridge for desktop keyboard and mobile touchscreen parity.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | Vue 3 (Composition API, TypeScript), Vite 8, Pinia 3, Vue Router 5 |
| **Styling & Canvas FX** | Tailwind CSS 3, Phaser 3/4, Web Audio API, Canvas Effects |
| **Backend Runtime** | Node.js, Express 5, TypeScript |
| **Multiplayer Engine** | Colyseus 0.17+ (State Synchronization, Room Architecture via WebSockets) |
| **Database & Auth** | Supabase (PostgreSQL, Auth, Service Role, Realtime Broadcast, Storage) |
| **AI Integration** | Google GenAI SDK (`@google/genai` — Gemini 3.5 Flash, Gemini 3.1 Flash Live) |
| **DevOps & Tooling** | Git/GitHub, Postman, Node-Cron, Nodemailer, Resend, Dotenv |

---

## 🏗️ Architecture & Project Structure

```
AxonProject-main/
├── client/                     # Vue 3 + Vite Frontend
│   ├── src/
│   │   ├── components/         # UI & Game widgets (AIChatWidget, VirtualKeyboard, CoreCard, etc.)
│   │   ├── composables/        # Custom composables (useDeviceMode, useAudioEngine, useMatchTimer, etc.)
│   │   ├── game/cores/         # Frontend Support Core registry (Strategy Pattern)
│   │   ├── stores/             # Pinia stores (authStore, gameStore, matchStore, etc.)
│   │   └── views/              # Page views (GameplayView, GameMultiplayView, HomeView, etc.)
├── server/                     # Node.js + Express Backend
│   ├── src/
│   │   ├── controllers/        # Express controllers (gameController, userController, adminController, etc.)
│   │   ├── cores/              # Backend Scoring Strategy Engine (BaseCore, 65 Cores across 10 families)
│   │   ├── middleware/         # Auth & session_version security middleware
│   │   ├── rooms/              # Colyseus multiplayer rooms (QueueRoom, MatchRoom)
│   │   ├── routes/             # Modular REST routes (authRoutes, gameRoutes, aiRoutes, userRoutes, adminRoutes)
│   │   ├── services/           # Gemini AI services, bot generator, mission evaluator
│   │   └── cron/               # Automated cron jobs (question seeding, guest cleanup)
├── docs/                       # Project documentation & AI Prompts
├── CLAUDE.md                   # Authoritative technical reference guide
└── AGENTS.md                   # AI Agent handoff & project state tracking
```

---

## 📡 API & WebSocket Overview

### 🔐 1. Authentication & Session Security (`/auth`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | Public | Register new player account & dispatch 6-digit verification OTP |
| `POST` | `/auth/verify-otp` | Public | Verify OTP, provision player profile in Supabase, & issue 7-day JWT |
| `POST` | `/auth/login` | Public | Email/Password login with credential verification |
| `POST` | `/auth/guest` | Public | Provision anonymous guest session token |
| `POST` | `/auth/token` | Public | Google OAuth token exchange & player profile upsert |
| `POST` | `/auth/forgot-password` | Public | Request password reset verification code via email |
| `POST` | `/auth/reset-password` | Public | Verify reset code & update hashed password |
| `GET` | `/auth/me` | JWT | Validate current session & return active player metadata |
| `POST` | `/auth/skip-tutorial` | JWT | Permanently mark onboarding tutorial completed |

### 🎮 2. Core Gameplay & Anti-Cheat (`/api/game`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/game/questions` | JWT | Batch fetch 20 fill-in-the-blank questions |
| `GET` | `/api/game/cores` | JWT | Retrieve all available & player-unlocked Support Cores |
| `POST` | `/api/game/session` | JWT | Initialize single-player session & lock `active_core_id` |
| `POST` | `/api/game/submit-answer` | JWT | Validate answer, execute **Strategy Pattern** scoring & anti-cheat checks |
| `POST` | `/api/game/timeout` | JWT | Lock game session upon 60s timer expiration |
| `POST` | `/api/game/abandon` | JWT | Forfeit active game session and record penalty |
| `PUT` | `/api/game/session/core` | JWT | Update active core selection during pre-match phase |
| `POST` | `/api/game/feedback` | JWT | Submit gameplay telemetry & player feedback |

### 👤 3. Player Profile & Progression (`/api/user`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/user/profile` | JWT | Fetch player profile, ELO rank, match statistics, & cores |
| `PATCH` | `/api/user/profile` | JWT | Update username or avatar image URL |
| `POST` | `/api/user/ai-coach` | JWT | Generate AI Performance Coach analysis on accuracy and weak words |
| `GET` | `/api/user/leaderboard` | JWT | Fetch global top player rankings by ELO rating |
| `GET` | `/api/user/core-progress` | JWT | Fetch individual Support Core mission unlock progress |
| `POST` | `/api/user/core-progress/claim` | JWT | Claim rewards for completed Core mastery missions |
| `POST` | `/api/user/core-progress/sync` | JWT | Sync offline Core progress metrics to Supabase cloud |

### 🤖 4. AI Assistant & Real-Time Streaming (`/api/ai`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/ai/chat` | JWT | Standard AI Assistant response using injected knowledge base |
| `POST` | `/api/ai/chat/stream` | JWT | Real-time **Server-Sent Events (SSE)** chunked chat stream |

### ⚔️ 5. Real-Time Multiplayer (Colyseus WebSockets)

| Room | Protocol | Description |
|---|---|---|
| `QueueRoom` | Colyseus WS | Automated 1v1 matchmaking with dynamic ELO search radius expansion |
| `MatchRoom` | Colyseus WS | 4-round competitive match loop, state synchronization, and 12s Race Mode |
| `LiveGateway` | WebSockets | Gemini 3.1 Flash Live multimodal voice/audio gateway |

### 🛡️ 6. Admin & Operations Suite (`/api/admin`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/admin/summary` | Admin | High-level system telemetry, active users, and match metrics |
| `GET/POST`| `/api/admin/questions` | Admin | CRUD operations on vocabulary question bank |
| `POST` | `/api/admin/questions/import` | Admin | Bulk CSV/JSON question import |
| `POST` | `/api/admin/questions/audit` | Admin | AI-powered question quality audit and automated grammar fix |
| `GET` | `/api/admin/players` | Admin | Player management table with ban/unban and admin privileges |
| `GET` | `/api/admin/anticheat/anomalies` | Admin | Real-time anti-cheat radar detecting suspicious submission speeds |
| `GET/PATCH`| `/api/admin/cores/meta` | Admin | Support Core win-rate analytics and live hotfix parameter tuning |

---

## ⚡ Quick Start & Local Setup

### Prerequisites
- Node.js `v18.x` or higher
- npm `v9.x` or higher
- Supabase project with configured PostgreSQL tables
- Google Gemini API Key

### 1. Environment Setup

Create `.env` files for both server and client:

**`server/.env`**:
```env
PORT=3000
SUPABASE_URL=https://your-supabase-project.supabase.co
SUPABASE_SERVICE_KEY=your-supabase-service-role-key
JWT_SECRET=your-jwt-secret-key
GEMINI_API_KEY=your-gemini-api-key
RESEND_API_KEY=your-resend-api-key
MAIL_FROM=noreply@naenra.xyz
```

**`client/.env`**:
```env
VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_SERVER_URL=http://localhost:3000
VITE_SITE_URL=http://localhost:5173
```

### 2. Install & Run

```bash
# Terminal 1: Backend Server
cd server
npm install
npm run dev

# Terminal 2: Frontend Client
cd client
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 📄 License & Attribution

Developed for **ARENA.ENG / Naenra**. All rights reserved.
# NAENRA (ARENA.ENG) ⚡

> **Competitive Cyberpunk Timed Vocabulary Arena with Tactical Support Cores & AI Assistance**

Naenra is a high-speed, competitive vocabulary typing game where players compete in 60-second timed rounds to solve missing letter-slot words, equip tactical **Support Cores** to alter scoring rules, climb global ELO ranks, and play 1v1 multiplayer matches.

---

## 🌟 Key Features

- **60-Second Timed Arena**: Fast-paced fill-in-the-blank vocabulary challenges with interactive letter-slot UI and real-time score popups.
- **65 Support Cores across 10 Families**: Tactical abilities integrated via the Strategy Pattern (Combo, Speedster, Argus Eyes / Oracle, Aegis Shield, Mission, Pandora, Phoenix Rebirth, High Roller, Power, Balanced).
- **Levenshtein Penalty & Anti-Cheat Engine**: Proportional score deductions based on character edit distance ($\ge 80\%$ similarity $\rightarrow$ typo penalty, $<80\%$ $\rightarrow$ wrong penalty). Server-side `time_taken` and `active_core_id` anti-cheat verification.
- **1v1 Colyseus Multiplayer & Race Mode**: Automated matchmaking via `QueueRoom` and 4-round matches in `MatchRoom` (Rounds 1–3 Core Mode, Round 4 Race Mode with 12s fast timeouts).
- **Gemini AI Assistant & Coach**: Integrated AI powered by `gemini-3.5-flash` (fallback `gemini-3.1-flash-lite`) providing custom question generation, player performance analytics, and live 2-phase in-game chat streaming.
- **Cross-Device & Cyber Virtual Keyboard**: Fully responsive UI supporting desktop keyboard play as well as mobile/tablet touch devices via an interactive Cyberpunk Virtual Keyboard (`VirtualKeyboard.vue`).

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | Vue 3 (Composition API, TypeScript), Vite 8 |
| **State & Routing** | Pinia 3, Vue Router 5 |
| **Game & Visual Effects** | Phaser 3/4, Tailwind CSS 3, Canvas FX |
| **Backend Runtime** | Node.js, Express 5, TypeScript |
| **Multiplayer Engine** | Colyseus 0.17+ (WebSockets) |
| **Database & Auth** | Supabase (PostgreSQL, Service Role, Auth, Realtime) |
| **AI Integration** | Google GenAI SDK (`@google/genai` — Gemini 3.5 Flash) |

---

## 🏗️ Architecture & Project Structure

```
AxonProject-main/
├── client/                     # Vue 3 + Vite Frontend
│   ├── src/
│   │   ├── components/         # UI & Game components (AIChatWidget, VirtualKeyboard, CoreCard, etc.)
│   │   ├── composables/        # Custom composables (useDeviceMode, useAudioEngine, useMatchTimer, etc.)
│   │   ├── game/cores/         # FE Support Core visual registry & modules
│   │   ├── stores/             # Pinia stores (authStore, gameStore, matchStore, etc.)
│   │   └── views/              # Page views (GameplayView, GameMultiplayView, HomeView, etc.)
├── server/                     # Node.js + Express Backend
│   ├── src/
│   │   ├── controllers/        # Express controllers (gameController, userController, etc.)
│   │   ├── cores/              # BE Scoring Strategy System (BaseCore, 65 Cores across 10 families)
│   │   ├── data/               # Centralized Knowledge Base (naenra_knowledge_base.md)
│   │   ├── middleware/         # Auth & session_version security middleware
│   │   ├── rooms/              # Colyseus multiplayer rooms (MatchRoom, QueueRoom)
│   │   ├── routes/             # REST API routes (authRoutes, gameRoutes, aiRoutes, userRoutes)
│   │   └── services/           # Gemini AI services (generateQuestions, generateChatResponse, SSE stream)
├── docs/                       # Project documentation & AI Prompts
│   ├── ai_prompts.md           # System prompts, JSON schemas, & offline NLP fallback specs
│   └── master_ai_system_prompt.md # Master AI System Prompt for developers & assistants
├── CLAUDE.md                   # Authoritative technical reference guide
└── AGENTS.md                   # AI Agent handoff & project state tracking
```

---

## ⚡ Quick Start & Local Setup

### Prerequisites
- Node.js `v18.x` or higher
- npm `v9.x` or higher
- Supabase account with configured PostgreSQL tables and Service Role key
- Google Gemini API Key

### 1. Clone & Environment Setup

Create `.env` files for both client and server:

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

### 2. Install Dependencies & Run Server

```bash
# Terminal 1: Backend
cd server
npm install
npm run dev
```

### 3. Install Dependencies & Run Client

```bash
# Terminal 2: Frontend
cd client
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 📡 API Overview

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | Public | Register new player & dispatch OTP |
| `POST` | `/auth/verify-otp` | Public | Verify OTP & create Supabase player |
| `POST` | `/auth/login` | Public | Email/Password login |
| `POST` | `/auth/guest` | Public | Generate anonymous guest token |
| `GET` | `/api/user/profile` | JWT | Fetch player profile, ELO, & unlocked cores |
| `GET` | `/api/game/questions` | JWT | Batch fetch fill-in-the-blank questions |
| `POST` | `/api/game/session` | JWT | Initialize single-player game session |
| `POST` | `/api/game/submit-answer` | JWT | Submit answer, process strategy scoring, & check anti-cheat |
| `POST` | `/api/game/timeout` | JWT | Lock game session upon timer expiry |
| `GET` | `/api/ai/chat/stream` | JWT | SSE real-time stream for AI Assistant chat |

---

## 📄 License & Attribution

Developed for **ARENA.ENG / Naenra**. All rights reserved.
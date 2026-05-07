# VoltAgent

An agentic AI web app that acts as a personal energy manager for residential buildings in Washington state. It proactively analyzes utility usage, forecasts your bill, runs a 30-day savings sprint, and sends smart alerts via email or SMS — all automatically.

**Live demo:** https://volt-agent.vercel.app

## Features

- **Bill Forecasting** — AI predicts your end-of-month bill from live 15-minute interval data
- **Time-of-Use Alerts** — notifies you before peak pricing windows open so you can shift loads
- **Tier Threshold Tracker** — warns before you cross into a higher rate tier (e.g. 600 kWh)
- **Vampire Power Audit** — detects always-on standby devices and calculates their monthly cost
- **30-Day Energy Sprint** — enroll in a challenge to cut usage 10%, tracked daily with dollar savings
- **Investor Analytics** — platform-wide MAU, collective kWh saved, load-shifting metrics
- **Weekly Summary Email** — rich HTML digest with projected bill, savings, and sprint progress
- **Email & SMS Notifications** — per-alert-type preferences, delivered via Resend and Twilio
- **Green Button OAuth** — connects directly to WA utility accounts for live data (requires utility developer registration)
- **Demo Data** — instant 30-day synthetic dataset so you can explore all features without a utility connection
- **PDF Bill Upload** — manual fallback for users without live connection
- **Savings Calculator** — instant savings estimate on the landing page before sign-up
- **Privacy & Security page** — full transparency on data collection, OAuth scope, and deletion rights

<img width="1856" height="1072" alt="image" src="https://github.com/user-attachments/assets/e53bff41-2abc-46b8-a20d-efd1f7922472" />

## Architecture

```
apps/
├── web/    Next.js 15 · TypeScript · Tailwind CSS
└── api/    FastAPI · Python 3.12 · SQLAlchemy 2 · Celery
```

### AI Agent Layer

All agents use the OpenAI Chat Completions API and return structured JSON.

| Agent | Responsibility |
|---|---|
| `CoordinatorAgent` | Orchestrates all specialist agents every 15 min via Celery beat |
| `ForecastingAgent` | Projects end-of-month bill; fires overspend alerts |
| `TOUAgent` | Monitors Time-of-Use windows; recommends optimal appliance run times |
| `TierAgent` | Tracks kWh against tier thresholds; prevents expensive tier crossings |
| `VampireAgent` | Detects standby power waste from quiet-hour baselines; estimates per-device cost |

### Background Jobs (Celery Beat)

| Task | Schedule | Purpose |
|---|---|---|
| `run_agent_analysis_all_users` | Every 15 min | Full agent analysis + alert delivery per user |
| `update_challenge_day_results` | 1 AM UTC nightly | Scores each active 30-day sprint day |
| `compute_platform_snapshot` | 2 AM UTC nightly | Writes investor metrics snapshot row |
| `send_weekly_summaries` | Monday 9 AM UTC | Sends rich HTML weekly email to all opted-in users |

### Data Model

| Model | Purpose |
|---|---|
| `User` | Auth, notification prefs, alert type toggles |
| `UtilityConnection` | Green Button OAuth tokens per user |
| `UsageRecord` | 15-minute interval kWh readings |
| `TierPricingPlan` | Rate tiers per utility |
| `Alert` | Persisted agent alerts with delivery status |
| `Challenge` | 30-day sprint with baseline, target, and daily totals |
| `ChallengeDayResult` | Per-day actual vs target kWh and savings |
| `DailyPlatformSnapshot` | Nightly investor metrics snapshot |

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15.5, TypeScript, Tailwind CSS, Recharts, Lucide |
| Backend | FastAPI, SQLAlchemy 2 async, Alembic, Celery + Redis |
| Database | PostgreSQL 16 |
| AI | OpenAI Chat Completions API (`gpt-4o-mini` default) |
| Email | Resend |
| SMS | Twilio |
| Auth | JWT (python-jose) + Green Button OAuth |
| External APIs | Open-Meteo (weather), Electricity Maps (carbon intensity) |

## Deployment

The app is deployed across three free-tier services:

| Service | Platform | URL |
|---|---|---|
| Frontend | Vercel | https://volt-agent.vercel.app |
| API + Celery | Render | https://voltagent-api.onrender.com |
| PostgreSQL | Supabase | Managed |
| Redis | Upstash | Managed |

> **Note:** The Render free tier spins down after 15 min of inactivity — the first request after idle may take ~30 seconds to wake up.

### Deploy your own

#### 1. Supabase (PostgreSQL)
1. Create a project at [supabase.com](https://supabase.com)
2. Go to **Connect** → **Direct** → **Session pooler** → copy the URI
3. Replace `postgresql://` with `postgresql+asyncpg://`

#### 2. Upstash (Redis)
1. Create a database at [upstash.com](https://upstash.com)
2. Copy the `REDIS_URL` from the dashboard

#### 3. Render (API + Celery worker + beat)
1. Go to [render.com](https://render.com) → **New** → **Blueprint**
2. Connect the VoltAgent GitHub repo — Render detects `render.yaml` automatically
3. Fill in environment variables (see table below)
4. After deploy, run migrations: point `DATABASE_URL` at Supabase and run `alembic upgrade head`

#### 4. Vercel (Frontend)
1. Go to [vercel.com](https://vercel.com) → **Add New Project** → import VoltAgent
2. Set **Root Directory** → `apps/web`
3. Add `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_APP_URL` environment variables
4. Deploy

### Production Environment Variables

**Render (API):**

| Variable | Where to get it |
|---|---|
| `DATABASE_URL` | Supabase → Connect → Session pooler URI (with `+asyncpg`) |
| `REDIS_URL` | Upstash dashboard |
| `SECRET_KEY` | `openssl rand -hex 32` |
| `OPENAI_API_KEY` | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |
| `FRONTEND_URL` | Your Vercel URL (e.g. `https://volt-agent.vercel.app`) |
| `RESEND_API_KEY` | [resend.com](https://resend.com) (optional — for email) |
| `TWILIO_*` | [twilio.com/console](https://www.twilio.com/console) (optional — for SMS) |

**Vercel (Frontend):**

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | Your Render API URL |
| `NEXT_PUBLIC_APP_URL` | Your Vercel URL |

## Local Development

### Prerequisites

- Docker & Docker Compose (recommended)
- Or: Node.js 20+, Python 3.12+, PostgreSQL 16, Redis 7

### Option A — Docker Compose (recommended)

```bash
# 1. Copy and fill in your API keys
cp apps/api/.env.example apps/api/.env
# Edit apps/api/.env — minimum required:
#   SECRET_KEY=<run: openssl rand -hex 32>
#   OPENAI_API_KEY=sk-...

# 2. Build and start all services
docker compose up --build

# 3. In a second terminal, run the database migration
docker compose exec api alembic upgrade head
```

| Service | URL |
|---|---|
| Web app | http://localhost:3001 |
| API | http://localhost:8000 |
| API docs (Swagger) | http://localhost:8000/docs |

### Option B — Local without Docker

```bash
# Start only the infrastructure
docker compose up db redis -d

# API
cd apps/api
cp .env.example .env        # fill in SECRET_KEY and OPENAI_API_KEY
pip install -e ".[dev]"
alembic upgrade head
uvicorn app.main:app --reload   # http://localhost:8000

# Web (new terminal)
cd apps/web
npm install
npm run dev                     # http://localhost:3001
```

### Useful commands

```bash
# Restart API after Python code changes
docker compose restart api

# Rebuild frontend after UI changes
docker compose build web && docker compose up -d

# Rebuild frontend after package.json changes
docker compose build --no-cache web && docker compose up -d

# View logs
docker compose logs api --tail=30
docker compose logs worker --tail=30

# Full reset (wipes local DB)
docker compose down -v && docker compose up -d
```

### Testing the app

1. Sign up at http://localhost:3001/auth/signup
2. Go to **Settings** → click **Load 30 Days of Demo Data** to populate the dashboard
3. Go to **Dashboard** to see forecasts, TOU status, tier usage, and vampire power
4. Go to **Sprint** to enroll in a 30-day energy challenge

## Pages

| Route | Description |
|---|---|
| `/` | Landing page with feature overview and savings calculator |
| `/auth/signup` | Registration — name, email, optional phone, password |
| `/auth/login` | Login |
| `/dashboard` | Live KPI cards, daily usage chart, agent alerts feed |
| `/challenge` | 30-day sprint enrollment, progress ring, day-by-day results |
| `/settings` | Utility connection, demo data loader, PDF upload, notification preferences |
| `/privacy` | Full privacy and security policy |

## Supported Utilities

- Puget Sound Energy (PSE)
- Seattle City Light
- Tacoma Power
- Snohomish PUD

> Green Button OAuth requires registering your app with each utility's developer program. Use **Load Demo Data** in Settings to explore all features without a utility connection.

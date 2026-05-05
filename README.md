# VoltAgent

An agentic AI web app that acts as a personal energy manager for residential buildings in Washington state. It proactively analyzes utility usage, forecasts your bill, runs a 30-day savings sprint, and sends smart alerts via email or SMS — all automatically.

## Features

- **Bill Forecasting** — AI predicts your end-of-month bill from live 15-minute interval data
- **Time-of-Use Alerts** — notifies you before peak pricing windows open so you can shift loads
- **Tier Threshold Tracker** — warns before you cross into a higher rate tier (e.g. 600 kWh)
- **Vampire Power Audit** — detects always-on standby devices and calculates their monthly cost
- **30-Day Energy Sprint** — enroll in a challenge to cut usage 10%, tracked daily with dollar savings
- **Investor Analytics** — platform-wide MAU, collective kWh saved, load-shifting metrics
- **Weekly Summary Email** — rich HTML digest with projected bill, savings, and sprint progress
- **Email & SMS Notifications** — per-alert-type preferences, delivered via Resend and Twilio
- **Green Button OAuth** — connects directly to WA utility accounts for live data
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

## Getting Started

### Prerequisites

- Docker & Docker Compose (recommended)
- Or: Node.js 20+, Python 3.12+, PostgreSQL 16, Redis 7

### Option A — Docker Compose (recommended)

```bash
# 1. Copy and fill in your API keys
cp apps/api/.env.example apps/api/.env
# Edit apps/api/.env — minimum required keys:
#   SECRET_KEY=<any 32-char random string>
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

### Option B — Local Development

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

### Required Environment Variables

| Variable | Where to get it |
|---|---|
| `SECRET_KEY` | Run `openssl rand -hex 32` |
| `OPENAI_API_KEY` | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |
| `RESEND_API_KEY` | [resend.com](https://resend.com) (optional — for email delivery) |
| `TWILIO_*` | [twilio.com/console](https://www.twilio.com/console) (optional — for SMS) |

## Pages

| Route | Description |
|---|---|
| `/` | Landing page with feature overview and savings calculator |
| `/auth/signup` | Registration — name, email, optional phone, password |
| `/auth/login` | Login |
| `/dashboard` | Live KPI cards, daily usage chart, agent alerts feed |
| `/challenge` | 30-day sprint enrollment, progress ring, day-by-day results |
| `/settings` | Utility connection, PDF upload, notification preferences |
| `/privacy` | Full privacy and security policy |

## Supported Utilities

- Puget Sound Energy (PSE)
- Seattle City Light
- Tacoma Power
- Snohomish PUD

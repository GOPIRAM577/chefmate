# ChefMate

**Cook with what you already have.** ChefMate is a full-stack, serverless AWS application that tracks your pantry, turns a photo of your fridge into a structured ingredient list (Amazon Rekognition), and generates recipes grounded in your *actual* pantry contents (Amazon Bedrock) — prioritizing ingredients closest to expiry, and emailing you before food goes to waste.

Built as a 1-month solo applied project to complement AWS Solutions Architect Associate (SAA-C03) study. Designed to run end-to-end on a brand-new AWS account without exceeding Free Tier limits in any meaningful way — Bedrock is the only paid line item, and it's hard-capped.




---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Repo Structure](#repo-structure)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Getting Started (Local Development)](#getting-started-local-development)
- [Deploying to AWS](#deploying-to-aws)
- [Running Tests](#running-tests)
- [API Reference](#api-reference)
- [Cost & Free Tier Notes](#cost--free-tier-notes)
- [Known Limitations](#known-limitations)
- [Roadmap / Stretch Goals](#roadmap--stretch-goals)
- [License](#license)

---

## Overview

**Core flow:**
1. Add pantry items manually, or upload a fridge/pantry photo — Rekognition's `DetectLabels` scans it and pre-fills a candidate ingredient list for you to confirm or edit.
2. Tap **"What can I cook?"** — the backend builds a prompt from your live pantry rows in DynamoDB (no document RAG, no vector store) and calls Bedrock (Claude Haiku) to generate 2–3 recipes, each showing which ingredients you have and which you're missing.
3. Save recipes you like; missing ingredients across suggestions roll up into an auto-generated shopping list.
4. A daily scheduled job scans for items expiring within 2 days and emails you a summary before they go bad.

**Why no OpenSearch / vector DB?** Grounding comes from injecting the user's live DynamoDB pantry rows directly into the Bedrock prompt — cheaper and simpler than a document-RAG pattern, while still demonstrating prompt-grounding and context-window management.

## Architecture

```
User Browser
   │
   ▼
React Frontend (S3 + CloudFront)
   │
   ▼
API Gateway (HTTP API)
   │
   ▼
Lambda Functions (Python 3.12)
   ├──► Amazon Rekognition (DetectLabels — photo → candidate ingredient list)
   ├──► Amazon Bedrock (Claude Haiku — grounded recipe generation)
   ├──► DynamoDB (PantryItems, SavedRecipes tables)
   └──► S3 (uploaded pantry/fridge photos)

EventBridge (daily scheduled rule)
   │
   ▼
Lambda (Expiry Checker)
   │
   ▼
Amazon SNS / SES (expiry alert email)
```

Full diagram: [`/docs/architecture.png`](./docs/architecture.png)

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React + Vite + Tailwind CSS |
| Hosting | S3 + CloudFront |
| API | API Gateway (HTTP API) + Lambda |
| Runtime | Python 3.12 |
| LLM Inference | Amazon Bedrock (Claude Haiku) |
| Image Recognition | Amazon Rekognition (DetectLabels) |
| Data Store | DynamoDB |
| Photo Storage | S3 |
| Scheduling | Amazon EventBridge |
| Notifications | Amazon SNS / SES |
| Auth (stretch) | Amazon Cognito |
| Secrets | SSM Parameter Store |
| IaC | AWS CDK (Python) |
| CI/CD | GitHub Actions |
| Monitoring | CloudWatch (Logs, Metrics, Alarms, Dashboard) |

## Repo Structure

```
pantrychef/
├── .github/workflows/       # ci.yml, deploy.yml, perf-report.yml
├── frontend/                 # React + Vite app
│   └── src/{components,api,__tests__}/
├── backend/                  # Lambda source + tests
│   └── src/{handler,pantry_service,photo_service,recipe_service,
│              expiry_checker,throttle,validator,response_formatter}.py
├── infra/                     # AWS CDK app + stacks
│   └── stacks/{api,frontend,data,scheduler}_stack.py
├── scripts/generate_perf_report.py
├── k6/recipe_load_test.js
├── docs/{architecture.png, PRD.pdf}
└── reports/{coverage/, perf/}
```

## Prerequisites

- Node.js ≥ 18 and npm
- Python ≥ 3.12 and pip
- AWS CLI v2, configured (`aws configure`) with a fresh/dedicated AWS account
- AWS CDK CLI: `npm install -g aws-cdk`
- Docker (only needed if Lambda dependencies require container-based bundling)
- An AWS account with **Bedrock model access enabled** for Anthropic Claude Haiku (must be requested once per account in the Bedrock console under *Model access*)

## Environment Variables

Create `backend/.env` (local dev) and set the equivalent values in **SSM Parameter Store** for deployed environments — never commit real values.

| Variable | Description | Example |
|---|---|---|
| `AWS_REGION` | Region for all AWS resources | `us-east-1` |
| `BEDROCK_MODEL_ID` | Bedrock model identifier | `anthropic.claude-3-haiku-...` |
| `BEDROCK_MAX_TOKENS` | Max output tokens per recipe generation | `512` |
| `PANTRY_TABLE_NAME` | DynamoDB table for pantry items | `PantryItems` |
| `RECIPES_TABLE_NAME` | DynamoDB table for saved recipes | `SavedRecipes` |
| `PHOTOS_BUCKET_NAME` | S3 bucket for uploaded photos | `pantrychef-photos-<account>` |
| `EXPIRY_WINDOW_DAYS` | Days-ahead threshold for expiry alerts | `2` |
| `NOTIFY_TOPIC_ARN` | SNS topic ARN (or SES sender) for alerts | `arn:aws:sns:...` |
| `RECIPE_THROTTLE_PER_HOUR` | Max recipe-generation calls per session/hour | `10` |
| `LOG_LEVEL` | Lambda log verbosity | `INFO` |
| `VITE_API_BASE_URL` | Frontend → API Gateway base URL | `https://xxxx.execute-api...` |

## Getting Started (Local Development)

```bash
# Clone
git clone https://github.com/<your-username>/pantrychef.git
cd pantrychef

# Backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in values from the table above

# Frontend
cd ../frontend
npm install
cp .env.example .env.local
npm run dev             # starts Vite dev server, proxies to API_BASE_URL
```

Local backend testing without deploying uses `moto`-mocked AWS calls for DynamoDB/S3/SNS; Bedrock and Rekognition are stubbed in unit tests (see [Running Tests](#running-tests)).

## Deploying to AWS

```bash
cd infra
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

cdk bootstrap                 # one-time per account/region
cdk diff                      # review changes
cdk deploy --all               # deploys data, api, frontend, scheduler stacks
```

After deploy, note the CloudFront URL and API Gateway endpoint from the CDK output and set `VITE_API_BASE_URL` accordingly before building/uploading the frontend (or let `deploy.yml` handle this automatically).

**Before deploying:** enable Bedrock model access for Claude Haiku in the target account/region, and set a CloudWatch billing alarm at a $3 threshold (see [Cost & Free Tier Notes](#cost--free-tier-notes)) — do this on Day 1, before any Bedrock-calling code ships.

## Running Tests

```bash
# Backend unit + coverage
cd backend
pytest tests/unit --cov=src --cov-report=html:../reports/coverage

# Backend integration (moto-mocked)
pytest tests/integration

# Frontend unit
cd frontend
npm test -- --coverage

# Performance / SLA (requires k6 installed, and a deployed dev endpoint)
k6 run k6/recipe_load_test.js
python scripts/generate_perf_report.py results.json > ../reports/perf/$(date +%F).md
```

Coverage target: **≥ 70% line coverage**, both frontend and backend, enforced in CI.

## API Reference

| Method | Path | Description |
|---|---|---|
| `POST` | `/pantry/items` | Add a pantry item |
| `GET` | `/pantry/items` | List current pantry items |
| `PUT` | `/pantry/items/{id}` | Edit a pantry item |
| `DELETE` | `/pantry/items/{id}` | Remove a pantry item |
| `POST` | `/pantry/photo` | Upload a photo → Rekognition → candidate ingredient list |
| `POST` | `/recipes/generate` | Generate recipes grounded in current pantry (`{ mealType? }`) |
| `GET` | `/recipes/history` | List previously saved recipes |
| `GET` | `/health` | Service + dependency health check |

Full request/response schemas are documented in the PRD, Section 3.3.

## Cost & Free Tier Notes

Every service except Bedrock stays within genuine AWS Free Tier allowances at solo-project scale (DynamoDB, Lambda, API Gateway, S3, CloudFront, SNS/SES, EventBridge, Rekognition's 5,000 images/month, Cognito's 50,000 MAU). **Bedrock is billed per token** and is the one line item to watch — kept small via the 512-max-output-token cap and the 10-requests/hour throttle.

| Week | Bedrock spend | Rekognition calls | Notes |
|---|---|---|---|
| 1 | $ | | |
| 2 | $ | | |
| 3 | $ | | |
| 4 | $ | | |

A CloudWatch billing alarm fires (via SNS email) at a **$3** threshold. If cost spikes: confirm Claude Haiku (not Sonnet) is active, drop `BEDROCK_MAX_TOKENS` to 256, tighten the throttle to 5/hour, and document the change in the work log.

## Known Limitations

- Single demo user/session by default — multi-user auth via Cognito is a stretch goal, not required for MVP.
- No barcode scanning or grocery-delivery integrations.
- Rekognition label quality varies with photo lighting/angle; all detected items require user confirmation before being saved (never auto-added).
- No high-availability guarantee — app is intended to be available during working hours/demo windows, not 24/7 production SLA.
- Expiry alerts require SES to be moved out of sandbox mode (or SNS used instead) to email arbitrary addresses.

## Roadmap / Stretch Goals

- [ ] Cognito-based multi-user auth (50,000 MAU always-free tier)
- [ ] Provisioned concurrency for Lambda cold starts, if budget allows
- [ ] Barcode scanning for faster pantry entry
- [ ] Nutrition estimates per suggested recipe



*Built as a 1-month CS internship alternative project — AWS SAA-C03 applied track, Free Tier–first build. See [`/docs/PRD.pdf`](./docs/PRD.pdf) for the full requirements document.*

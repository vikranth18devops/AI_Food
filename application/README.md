# FoodLens AI — Microservices Food Analysis & Health Insights Platform

FoodLens AI is an enterprise-grade full-stack microservices application built with **React, Node.js, TypeScript, NestJS, PostgreSQL, Prisma, Redis, RabbitMQ, Docker**, and external AI/nutrition/YouTube providers.

It enables users to upload food images, identify dishes and ingredients using vision AI, retrieve authoritative nutrition data per 100g, generate AI educational health insights (pros/cons, allergens, dietary compatibility, citations), dynamically recalculate portion nutrients (100g, 200g, 350g, 500g, custom), and view curated YouTube culinary tutorials.

---

## 1. Project Overview

FoodLens AI transforms raw dish photographs into comprehensive, science-backed nutrition and health breakdown cards. The architecture is built with an event-driven workflow powered by RabbitMQ for resilience, scalability, and loose microservice coupling.

```
USER → Upload Food Image
  ↓
API Gateway (Port 3000)
  ↓
Image Service (Upload & Validation)
  ↓ (RabbitMQ Event Bus)
Food Recognition Service → Vision AI / Mock Provider
  ↓ (FOOD_RECOGNIZED)
Nutrition Service → USDA DB / Mock + Redis Cache
  ↓ (NUTRITION_COMPLETED)
Health Analysis Service → AI Educator / Mock Provider
  ↓ (HEALTH_ANALYSIS_COMPLETED)
Recommendation Service → YouTube v3 API / Mock + Redis
  ↓ (COMPLETED)
PostgreSQL Database + Real-Time SSE Stream Update
```

---

## 2. Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, TanStack React Query, Zustand, Lucide Icons
- **Backend Services**: Node.js 20, TypeScript, NestJS, Passport JWT, Multer
- **Database & Cache**: PostgreSQL 15, Prisma ORM 5, Redis 7 (ioredis)
- **Message Broker**: RabbitMQ 3.12 (AMQP + Management Dashboard)
- **Infrastructure**: Docker & Docker Compose
- **Documentation**: Swagger OpenAPI (`/api/docs`), Mermaid Architecture Diagrams

---

## 3. Microservice Responsibilities & Ports

| Service | Port | Primary Responsibility |
| :--- | :--- | :--- |
| **Frontend** | `5173` | React SPA UI (Dashboard, Upload, SSE Tracker, Macro Charts, History, Serving Recalculator) |
| **API Gateway** | `3000` | Single public API entry, Auth Validation, Rate Limiting, Helmet Headers, SSE Proxy, Swagger |
| **Auth Service** | `3001` | JWT authentication, user registration, bcrypt password hashing, refresh token revocation |
| **Image Service** | `3002` | Upload validation (MIME, max 10MB), path traversal protection, `StorageProvider` abstraction |
| **Food Recognition Service** | `3003` | Vision AI Provider & Mock Provider dish identification |
| **Nutrition Service** | `3004` | Nutrition DB Provider & Mock Provider lookup + Redis caching per 100g base serving |
| **Health Analysis Service** | `3005` | AI Health Provider & Mock Provider (pros/cons, allergens, dietary flags, citation claims) |
| **Recommendation Service** | `3006` | YouTube v3 API Provider & Mock Provider recipe video search + Redis caching |
| **PostgreSQL** | `5432` | Primary relational database |
| **Redis** | `6379` | Fast caching layer for nutrition facts & YouTube searches |
| **RabbitMQ** | `5672` / `15672` | AMQP Message Broker & Management Web Console |

---

## 4. Environment Variables & Setup

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Key environment variables:

```env
NODE_ENV=development
DATABASE_URL=postgresql://foodlens_user:foodlens_password@localhost:5432/foodlens_db?schema=public
REDIS_URL=redis://localhost:6379
RABBITMQ_URL=amqp://guest:guest@localhost:5672
JWT_ACCESS_SECRET=super-secret-access-key-foodlens-2026
JWT_REFRESH_SECRET=super-secret-refresh-key-foodlens-2026

# LOCAL MOCK MODE (Runs 100% locally without paid external API keys out of the box)
MOCK_EXTERNAL_SERVICES=true

# REAL PROVIDER API KEYS (Used when MOCK_EXTERNAL_SERVICES=false)
AI_PROVIDER=openai
AI_API_KEY=your_openai_api_key_here
NUTRITION_API_KEY=your_usda_api_key_here
YOUTUBE_API_KEY=your_youtube_api_key_here
```

---

## 5. Local Startup Instructions

### Option A: Docker Compose (Recommended)

Run the full system in Docker with a single command:

```bash
docker compose up --build
```

Access the components:
- **React Web App**: `http://localhost:5173`
- **API Gateway Swagger**: `http://localhost:3000/api/docs`
- **RabbitMQ Console**: `http://localhost:15672` (User: `guest`, Pass: `guest`)

### Option B: Local Monorepo Development

1. Start Infrastructure (PostgreSQL, Redis, RabbitMQ):
```bash
docker compose up postgres redis rabbitmq -d
```

2. Install dependencies:
```bash
npm install
```

3. Run Prisma Migration & Seed Data:
```bash
npx prisma generate --schema=./prisma/schema.prisma
npx prisma db push --schema=./prisma/schema.prisma
npm run prisma:seed
```

4. Run all microservices in build/dev mode:
```bash
npm run build
```

---

## 6. Seed Accounts & Mock Mode

By default, `MOCK_EXTERNAL_SERVICES=true` is enabled. You can register a new account or log in with the pre-seeded demo user:

- **Email**: `demo@foodlens.ai`
- **Password**: `TestPass123!`

When in **Mock Mode**, uploading any food image will deterministically identify dishes (such as Chicken Biryani, Mediterranean Salad, Margherita Pizza, Salmon Avocado Bowl), calculate real nutrition metrics, generate health insights, and display YouTube recipe videos.

To switch to **Real Providers**:
Set `MOCK_EXTERNAL_SERVICES=false` in `.env` and fill in `AI_API_KEY`, `NUTRITION_API_KEY`, and `YOUTUBE_API_KEY`.

---

## 7. Testing

### Run Unit Tests
Runs unit tests across shared utilities (serving size math, DTO parsing, token helpers):

```bash
npm test
```

### Run End-to-End Test Suite
Executes end-to-end integration tests using mock providers:

```bash
npm run test:e2e
```

---

## 8. Database Migrations & Seeds

To reset or sync the PostgreSQL schema:

```bash
# Push schema updates to DB
npm run prisma:migrate

# Seed development test data
npm run prisma:seed
```

---

## 9. Project Structure

```
foodlens-ai/
├── apps/
│   └── frontend/              # Vite + React 18 + TS + Tailwind CSS
├── services/
│   ├── api-gateway/           # NestJS Public Gateway + Swagger + SSE Proxy
│   ├── auth-service/          # NestJS Auth Service + JWT
│   ├── image-service/         # NestJS Image Service + Storage Providers
│   ├── food-service/          # NestJS Vision Food Recognition Service
│   ├── nutrition-service/     # NestJS Nutrition Lookup Service + Redis
│   ├── analysis-service/      # NestJS AI Health Analysis Service
│   └── recommendation-service/# NestJS YouTube Recommendation Service + Redis
├── packages/
│   ├── shared-types/          # TypeScript DTOs, Enums, Events
│   ├── shared-config/         # Configuration & Env validators
│   └── shared-utils/          # Logger, Serving Size Math, Correlation IDs
├── prisma/
│   ├── schema.prisma          # PostgreSQL Schema
│   └── seeds/                 # Dev Seed Data
├── ../docs/                 # Architecture, Events, API, DB Specs, Azure/AWS/GCP guides
├── docker-compose.yml
├── README.md
└── SECURITY.md
```

---

## 10. Security & Compliance

See [SECURITY.md](SECURITY.md) for full security controls, Helmet header details, rate limiting specifications, path traversal safeguards, and JWT token protection policies.

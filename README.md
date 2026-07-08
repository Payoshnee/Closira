# Closira

AI-powered digital wardrobe and virtual styling assistant.

Closira helps users digitize their wardrobe, remember what they own, avoid duplicate purchases, build outfits, plan looks for events, and later preview clothes, jewelry, lipstick, makeup, and accessories on personal photos with explicit consent.

## Product Vision

Closira is a production-grade mobile-first wardrobe platform for fashion-focused users who own many clothes and need a private, intelligent system for organization and styling. The product must be dynamic at every phase: real authentication, real database persistence, real file uploads, real APIs, real validation, real state management, and no fake buttons or placeholder-only user flows.

## Problem

Users often forget what they own, repeat similar purchases, struggle to combine items, underuse clothes, and spend too much time choosing outfits for college, office, weddings, festivals, travel, parties, and daily wear.

## Solution

Closira creates a searchable wardrobe inventory with images, metadata, usage history, outfit planning, AI tagging, similarity search, recommendations, and future virtual try-on. AI suggestions must use the user's actual wardrobe unless explicitly marked as shopping suggestions.

## Core Features

- Authentication, refresh tokens, email verification, forgot password, secure logout, and account deletion.
- User profile with style preferences, favorite colors, optional measurements, privacy, and notification settings.
- Digital wardrobe with front, back, and optional close-up images.
- Category, subcategory, material, color, season, occasion, style, usage, and custom tag management.
- Search, filters, sorting, favorite items, and purchase/usage metadata.
- Outfit builder, outfit duplication, favorite outfits, mark-worn flow, and outfit calendar.
- Usage analytics including cost per wear, unused items, never worn items, and wardrobe value.
- AI auto tagging, image embeddings, similar item detection, outfit recommendations, and smart shopping checks.
- Future virtual try-on behind consent and feature flags until it generates real previews.
- Admin dashboard for users, categories, tags, storage, AI health, and app analytics.

## Technology Stack

- Mobile: Flutter, Dart, Riverpod, GoRouter, Dio, Flutter Secure Storage, Cached Network Image, Image Picker, camera support.
- Web admin: Next.js, React, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query, React Hook Form, Zod.
- API: NestJS, TypeScript, Prisma, PostgreSQL, Redis, BullMQ, JWT, RBAC.
- AI service: Python FastAPI, PyTorch, OpenCV, Pillow, CLIP or modern embedding model, pgvector.
- Storage: Cloudflare R2 or AWS S3 with signed URLs and private user folders.
- DevOps: Docker, Docker Compose, GitHub Actions, Nginx or Caddy, environment-based config, logging, monitoring, backups.
- Testing: Jest, Supertest, Flutter tests, Playwright, Pytest, API collection.

## Repository Layout

```text
closira/
  apps/
    mobile/        Flutter app
    web-admin/     Next.js admin dashboard
  services/
    api/           NestJS REST API
    ai/            FastAPI AI service
  packages/
    shared-types/  Shared TypeScript contracts
    config/        Shared config and lint presets
  infra/
    docker/        Docker assets
    nginx/         Reverse proxy config
    database/      SQL, migrations notes, seed data
    scripts/       Operational scripts
  storage/
    local-dev-only/
  tests/
    api/
    e2e/
    mobile/
    web/
  docs/
```

See [docs/FOLDER_STRUCTURE.md](docs/FOLDER_STRUCTURE.md) for the full ownership map.

## Environment Variables

Phase 1 will introduce `.env.example` files for each runtime. Required groups:

- API: `DATABASE_URL`, `REDIS_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `AI_SERVICE_URL`.
- AI: `DATABASE_URL`, `MODEL_CACHE_DIR`, `EMBEDDING_MODEL_NAME`, `API_SHARED_SECRET`.
- Web admin: `NEXT_PUBLIC_API_URL`.
- Mobile: API base URL supplied by build flavor or runtime config.

No production secret may be committed.

## Local Development Flow

Phase 1 foundation:

1. Copy environment examples into local `.env` files.
2. Start PostgreSQL, Redis, object storage emulator, API, AI service, and web admin through Docker Compose.
3. Run Prisma migrations.
4. Start Flutter with the local API base URL.
5. Verify `/health` for API and AI service.

Current commands:

```bash
npm install
npm --workspace services/api run start
npm --workspace apps/web-admin run dev
PYTHONPATH=services/ai python3 -m uvicorn app.main:app --host 127.0.0.1 --port 8000
cd apps/mobile && flutter run
```

If port `3001` is already in use, run the API with `PORT=3011 npm --workspace services/api run start`.

## Production Deployment Flow

Production uses separately deployed mobile builds, web admin, NestJS API, FastAPI AI service, PostgreSQL with pgvector, Redis, private object storage, background workers, reverse proxy, CI/CD, migrations, logging, monitoring, and backups. See [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md).

## API Overview

The API is REST-first with authenticated user routes and admin-only routes. Major domains:

- `/auth`
- `/profile`
- `/wardrobe`
- `/categories`
- `/tags`
- `/outfits`
- `/calendar`
- `/ai`
- `/analytics`
- `/admin`

See [docs/API_SPECIFICATION.md](docs/API_SPECIFICATION.md).

## Database Overview

PostgreSQL is the system of record. UUID primary keys, audit fields, soft deletes where appropriate, relational constraints, enum types, and indexes are required. pgvector stores wardrobe image embeddings for similarity. See [docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md).

## AI Modules

AI features are service-backed and must expose confidence, fallbacks, and user confirmation where needed. Released AI features must be clearly separated from future or feature-flagged features. See [docs/AI_MODULES.md](docs/AI_MODULES.md).

## Testing Strategy

Each phase must include unit, integration, API, UI, and manual QA coverage appropriate to its risk. A phase is not complete until tests pass and dynamic flows are verified. See [docs/TESTING_PLAN.md](docs/TESTING_PLAN.md).

## Contribution Rules

- Do not add fake UI, dead buttons, static-only pages, or demo-only services.
- Every visible action must work or be hidden behind a feature flag.
- All user data must come from authenticated APIs.
- All image flows must be private by default.
- Update documentation and `docs/CHANGELOG.md` after every phase.
- Run tests before marking a phase complete.

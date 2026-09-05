# System Architecture

## Overview

Clorisa is a monorepo with a Flutter mobile app, Next.js admin dashboard, NestJS API, FastAPI AI service, PostgreSQL database, Redis queue/cache layer, private object storage, and deployment infrastructure.

## Components

- Mobile app: user-facing wardrobe, outfit, AI, calendar, analytics, and profile flows.
- Web admin: internal dashboard for user management, default taxonomies, storage, reports, and AI health.
- Backend API: authentication, authorization, domain logic, validation, file orchestration, analytics, and admin APIs.
- Database: PostgreSQL with relational schema and pgvector for image embeddings.
- Object storage: private wardrobe and profile images using signed URL upload/download.
- AI service: image analysis, embeddings, similarity search support, outfit recommendation scoring, future try-on pipeline.
- Redis and BullMQ: background image processing, AI jobs, notification scheduling, email tasks, and cache.
- Notifications: email first, push later, event reminders and unused-item nudges.
- Auth service: API-owned JWT access and refresh tokens with revocation tracking.

## Runtime Flow

1. Client authenticates through the API.
2. API issues access and refresh tokens.
3. Client requests signed upload URLs.
4. Client uploads images to storage.
5. API persists metadata and queues image processing.
6. AI service analyzes images and returns structured suggestions.
7. User confirms AI suggestions before permanent wardrobe metadata updates.
8. Analytics are calculated from database-backed wardrobe, outfit, calendar, and usage events.

## Deployment Architecture

- Mobile app distributed through app stores or internal testing.
- Web admin deployed as a Next.js app.
- API and AI services deployed as containers.
- PostgreSQL, Redis, and object storage are managed services in production.
- Reverse proxy terminates TLS and routes `/api`, `/ai-internal`, and web admin traffic.
- CI/CD runs lint, tests, builds, migrations, and deployment gates.

## Virtual Try-On Pipeline

Virtual try-on remains feature-flagged until it produces real previews. The planned pipeline includes consent capture, full-body image upload, segmentation, pose estimation, garment preprocessing, model inference, preview storage, and safe deletion.

## Reliability

All long-running work is queued. API routes return explicit job status for asynchronous operations. Failed AI jobs must expose user-safe fallback states and retry metadata.

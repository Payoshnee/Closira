# Development Phases

## Phase 0: Documentation and Architecture

Deliver all documentation, architecture, schema, API specification, UI guide, AI plan, security plan, testing plan, deployment guide, changelog, and roadmap.

Completion: every required doc exists and explains dynamic implementation rules.

## Phase 1: Project Foundation

Create Flutter app, Next.js web admin, NestJS API, FastAPI AI service, PostgreSQL, Redis, Docker Compose, Prisma, env examples, linting, formatting, and basic CI.

Completion: all services run locally, mobile opens, web admin opens, API health works, AI health works, database and Redis connect.

## Phase 2: Authentication and User Profile

Registration, login, JWT, refresh token, logout, forgot password, email verification abstraction, profile CRUD, avatar upload, account deletion.

## Phase 3: Wardrobe Core

Wardrobe item CRUD, image upload, categories, subcategories, materials, colors, purchase details, size, tags, detail, grid, list.

## Phase 4: Search, Filter, and Tags

Database-backed search, filters, sorting, and user-specific custom tags.

## Phase 5: Outfit Builder

Create, edit, delete, favorite, duplicate, and mark-worn outfits linked to real wardrobe items.

## Phase 6: Outfit Calendar and Usage Tracking

Calendar planning, event plans, conflict warnings, usage logs, last worn dates, cost per wear, unused reports.

## Phase 7: AI Auto Tagging

Connected AI service for category, color, pattern, fabric, style, occasion, season, and confidence. User confirmation required.

## Phase 8: Similar Clothing Detection

Embeddings, pgvector search, similar owned items, similarity explanation, duplicate purchase warning.

## Phase 9: AI Outfit Recommendation

Occasion-aware recommendations using actual wardrobe items with explanations and alternatives.

## Phase 10: Smart Shopping Assistant

Purchase image upload, wardrobe comparison, compatibility score, gap analysis, buy/maybe/avoid recommendation.

## Phase 11: Web Admin Dashboard

Dynamic admin dashboard for users, stats, AI health, storage, reports, categories, tags, and analytics.

## Phase 12: Virtual Try-On Foundation

Consent, full-body upload, garment selection, preprocessing, and feature-flagged model integration. Hide unless real previews work.

## Phase 13: Production Readiness

Full tests, security audit, rate limiting, image optimization, logging, monitoring, backups, CI/CD, staging, production deployment, privacy policy, terms.

## Phase Gate

Before coding a phase, document what will be built, files changed, database tables, APIs, UI screens, and tests. After coding, update docs and changelog, run tests, fix errors, and verify no non-working UI remains.

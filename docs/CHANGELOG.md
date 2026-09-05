# Changelog

## 0.0.0 - Phase 0 Documentation Bootstrap

- Created documentation-first architecture for Clorisa.
- Defined product requirements, system architecture, folder structure, database schema, API specification, UI/UX guide, AI modules, security/privacy rules, phase plan, testing plan, deployment guide, and roadmap.
- Created initial monorepo directory skeleton.

## 0.1.0 - Phase 1 Foundation Bootstrap

- Added npm workspace configuration and dependency lockfile.
- Generated Flutter mobile app foundation.
- Added Next.js web admin shell with Tailwind.
- Added NestJS API service with `/api/v1/health`.
- Added FastAPI AI service with `/health`.
- Added Prisma schema foundation, Docker Compose, PostgreSQL pgvector init SQL, Redis service, environment examples, shared packages, and service Dockerfiles.
- Verified API tests, API build, web admin build, Flutter analyze/tests, AI tests, Docker Compose config, and API/AI health endpoints.
- Note: local port `3001` was already occupied during verification, so API health was verified on `3011`.

## 0.2.0 - Run 1 Public Website Foundation

- Added website planning and inspection documentation.
- Started the public website and design system foundation for the existing Next.js app.
- Kept authenticated dashboard work deferred to Run 2.

## 0.2.1 - Run 2 Auth and Dashboard Shell

- Added typed auth session and auth form models.
- Added mock-backed current-session and auth intent services for frontend-only dashboard access.
- Reworked login, signup, and forgot-password pages into working entry forms.
- Added the dashboard shell and dashboard home.
- Limited dashboard navigation to implemented routes and marked later-run modules as unavailable.

## 0.3.0 - Run 3 Wardrobe Taxonomy Foundation

- Added typed frontend models for wardrobe items, categories, tags, filters, images, and wardrobe summaries.
- Added mock-backed API service adapters for wardrobe, categories, and tags.
- Added wardrobe dashboard routes for browsing, filtering, inspecting, adding, and editing wardrobe item metadata.
- Added category and tag management routes with reusable taxonomy components.
- Added reusable wardrobe cards, grids, filters, stats, taxonomy tables, and editor forms.

## 0.4.0 - Run 4 Outfits and Calendar

- Added typed frontend models for outfits, outfit items, calendar events, and calendar summaries.
- Added mock-backed API service adapters for outfits and calendar planning.
- Added dashboard routes for outfit browsing, detail, create, edit, calendar list, and calendar planning.
- Added reusable outfit and calendar components.
- Promoted Outfits and Calendar into the active dashboard shell navigation.

## 0.5.0 - Run 5 AI Stylist, Shopping Assistant, and Analytics

- Added typed frontend models for AI recommendations, shopping checks, and wardrobe analytics.
- Added mock-backed API service adapters for AI stylist, shopping assistant, and analytics.
- Added dashboard routes for AI stylist, shopping assistant, and analytics.
- Added reusable AI recommendation, shopping check, metric, and analytics chart components.
- Promoted AI stylist, shopping assistant, and analytics into active dashboard shell navigation.

## 0.6.0 - Run 6 Profile, Billing, and Admin

- Added typed frontend models for profile, billing, payments, admin metrics, and service health.
- Added mock-backed API service adapters for profile, billing, and admin dashboard data.
- Added dashboard routes for profile, billing, and admin.
- Added reusable profile, billing, and admin dashboard components.
- Promoted Profile, Billing, and Admin into active dashboard shell navigation.

## 0.7.0 - Run 7 Polish and Build Fixes

- Verified lint, typecheck, and production build.
- Added mobile dashboard navigation for all active dashboard modules.
- Cleaned frontend status documentation so deferred notes reflect completed later runs.

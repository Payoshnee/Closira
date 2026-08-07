# Changelog

## 0.0.0 - Phase 0 Documentation Bootstrap

- Created documentation-first architecture for Closira.
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

## 0.3.0 - Run 3 Wardrobe Taxonomy Foundation

- Added typed frontend models for wardrobe items, categories, tags, filters, images, and wardrobe summaries.
- Added mock-backed API service adapters for wardrobe, categories, and tags.
- Added wardrobe dashboard routes for browsing, filtering, inspecting, adding, and editing wardrobe item metadata.
- Added category and tag management routes with reusable taxonomy components.
- Added reusable wardrobe cards, grids, filters, stats, taxonomy tables, and editor forms.

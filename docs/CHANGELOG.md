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

# Repository Inspection Report

## Current Apps and Services

- `apps/mobile`: Flutter mobile application.
- `apps/web-admin`: Next.js web application for public website now and dashboard later.
- `services/api`: NestJS REST API with Prisma.
- `services/ai`: FastAPI AI service.
- `packages/shared-types`: shared TypeScript contracts.
- `packages/config`: shared configuration package.
- `docker-compose.yml`: PostgreSQL with pgvector, Redis, API, and AI services.

## Web App State

- Next.js App Router exists in `apps/web-admin/app`.
- Tailwind CSS is configured through `tailwind.config.ts`, `postcss.config.js`, and `app/globals.css`.
- shadcn/ui was not configured before Run 1. The Run 1 foundation uses shadcn-compatible primitives and a `components.json` marker without invoking the generator.
- npm workspaces are used. `package-lock.json` is present.

## Backend State

- `services/api` exposes a NestJS service and health controller under `/api/v1/health`.
- `services/ai` exposes a FastAPI `/health` endpoint.
- Product API domains are documented, but most feature endpoints are not implemented yet.

## Design Assets

- No Figma handoff files, screenshots, `.fig`, `.sketch`, or obvious exported design assets were found.
- Design direction is defined in `docs/UI_UX_GUIDE.md`.


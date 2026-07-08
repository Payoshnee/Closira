# Folder Structure

```text
closira/
  README.md
  docs/
  apps/
    mobile/
    web-admin/
  services/
    api/
    ai/
  packages/
    shared-types/
    config/
  infra/
    docker/
    nginx/
    database/
    scripts/
  storage/
    local-dev-only/
  tests/
    e2e/
    api/
    mobile/
    web/
```

## Root

- `README.md`: product overview, setup, architecture, and contribution entrypoint.
- `docs/`: phase-gated technical documentation.

## Apps

- `apps/mobile/`: Flutter application for Android and iOS. Contains screens, routing, state management, API clients, models, widgets, and tests.
- `apps/web-admin/`: Next.js admin dashboard. Contains admin pages, components, queries, forms, validation, auth guards, and Playwright tests.

## Services

- `services/api/`: NestJS API. Contains modules for auth, profile, wardrobe, categories, tags, outfits, calendar, AI orchestration, analytics, admin, storage, jobs, and notifications.
- `services/ai/`: FastAPI service. Contains model loading, image analysis, embedding generation, similarity helpers, recommendation logic, and AI tests.

## Packages

- `packages/shared-types/`: shared TypeScript DTOs, enums, API contracts, and generated OpenAPI clients when applicable.
- `packages/config/`: shared ESLint, Prettier, TypeScript, and environment validation helpers.

## Infrastructure

- `infra/docker/`: Dockerfiles, compose overlays, and local service configuration.
- `infra/nginx/`: reverse proxy templates.
- `infra/database/`: seed data, SQL notes, pgvector setup, and migration support files.
- `infra/scripts/`: repeatable scripts for setup, backup, restore, health checks, and deployment.

## Storage

- `storage/local-dev-only/`: ignored local storage for development. Production images must use private object storage.

## Tests

- `tests/api/`: API collection and black-box API tests.
- `tests/e2e/`: end-to-end flows across services.
- `tests/mobile/`: mobile integration QA assets.
- `tests/web/`: web admin e2e tests.

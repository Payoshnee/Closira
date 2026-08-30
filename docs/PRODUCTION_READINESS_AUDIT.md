# Closira Production Readiness Audit

Last updated: 2026-08-30

## Current Summary

Closira is no longer only a frontend scaffold. The repository now contains a real Next.js dashboard, NestJS API, Prisma/PostgreSQL schema, pgvector embedding table, auth/session flows, wardrobe/outfit/calendar APIs, AI orchestration endpoints, billing gateway abstraction, admin APIs, setup/run scripts, CI, API hardening, request logging, health checks, and database operations scripts.

It is still not market-ready production software. The biggest remaining gaps are AI model quality, mobile API integration, real object storage image processing, payment provider activation, end-to-end test coverage, deployment automation, and final legal/brand work.

For a table-based feature-by-feature status, see `docs/FEATURE_STATUS_MATRIX.md`.

## AI Status

Built:

- FastAPI AI service.
- `/health`, `/analyze-clothing`, `/embed-image`, `/recommend-outfit`, `/shopping-check`, and `/virtual-try-on` endpoints.
- Train/evaluate scripts for a local baseline model.
- Sample JSONL manifest and generated baseline artifact.
- NestJS AI orchestration endpoints.
- AI job persistence.
- API-level confidence/fallback handling.
- pgvector table and vector index.
- API settings for Native, OpenAI, Anthropic, Gemini, Azure OpenAI, Ollama, and custom providers.
- Frontend AI settings screen.

Current limitation:

- The native AI model is a tiny baseline, not a production stylist model.
- Embeddings now return 768 dimensions from the AI service, with optional OpenCLIP support and a deterministic dev fallback.
- Clothing image analysis now routes to the active external LLM provider when a vision-capable provider is configured, then falls back to the native baseline service.
- Virtual try-on returns `not_available`.
- Provider settings exist, but user-supplied API keys are not securely encrypted yet. Production calls should use environment-backed provider keys until encryption lands.
- External provider calls exist in the API path for styling, shopping checks, and clothing image analysis, but need hardened provider-specific contracts, retries, cost tracking, capability checks, and integration tests.

AI left:

- Collect the real licensed production image corpus.
- Label and QA the production dataset.
- Real fashion image classifier or native vision-language model strategy.
- Runtime embeddings aligned to the `vector(768)` database design, with optional OpenCLIP generation and a local deterministic fallback.
- Background AI job queue with retries.
- Provider key encryption and masked connected-state UI.
- Provider health checks and staging credential verification.
- Real auto-tag confirmation workflow.
- Similarity quality evaluation.
- Stylist feedback loop and recommendation evaluation set.
- Virtual try-on provider/model integration with consent and deletion controls.

## Mobile Status

Built:

- Flutter app folder exists.
- Android/iOS project shell exists.
- Closira mobile app shell replaces the generated counter app.
- Mobile auth, dashboard, wardrobe, outfits/calendar, AI/shopping, and profile/settings screens exist.
- Mobile login/register/session restore call the NestJS API.
- Mobile access and refresh tokens persist through Flutter Secure Storage.
- Mobile 401 handling retries with refresh tokens.
- Mobile wardrobe sync/create/favorite/mark-worn/signed-upload/finalize call the API.
- Mobile outfits list/create/duplicate call the API.
- Mobile AI stylist and shopping check call the API.
- Mobile profile update calls the API.
- A Flutter integration-test smoke flow exists.
- Widget tests cover sign-in shell entry and wardrobe add flow.

Current limitation:

- Some mobile screens still keep an offline demo path for previews/tests.
- Mobile calendar planning mutations and provider settings are not fully interactive yet.
- Upload flow exists, but needs preview/progress polish and real device testing.
- Mobile billing/admin surfaces are not implemented.

Mobile left:

- Add mobile calendar create/worn flows and richer month/week/day views.
- Add mobile provider settings connect/test/disconnect flows.
- Add billing/subscription screens if mobile checkout is in scope.
- Run integration tests on a real simulator/device.
- Add upload e2e, golden, and accessibility tests.
- Configure real app IDs, signing, icons, splash screen, and release builds.

## Docs Audit Findings

Several docs are stale because they were written during earlier scaffold runs:

- `docs/PROJECT_BUILD_STATUS.md` still says many backend modules are missing, even though API controllers/schema now exist.
- `docs/FRONTEND_STATUS.md` still says many services are mock-backed, even though many frontend adapters now call real API endpoints with fallback behavior.
- `docs/ROADMAP.md` still describes `0.0.0`/`0.1.0` foundation status and should be revised for the current production-hardening phase.
- `docs/AI_PROVIDER_SETTINGS_PLAN.md` is partly stale: encrypted provider settings are already represented in schema, but key encryption and health checks still need implementation.
- `docs/TESTING_PLAN.md` remains aspirational; actual tests are still thin.
- `docs/SECURITY_PRIVACY.md` is directionally correct, but account deletion, object storage deletion, and consent records are not fully implemented.

## Production Readiness Done

- API rate limiting.
- Security headers.
- Request body size limits.
- Configurable CORS.
- Global request validation pipe.
- Request IDs.
- Structured request logs.
- Liveness endpoint.
- Readiness endpoint.
- Prometheus-style metrics endpoint.
- CI workflow for Node/API/web and AI service checks.
- Database backup script.
- Database restore script.
- Database retention cleanup script.
- Database operations runbook.

## Production Readiness Left

- Error tracking integration, such as Sentry or an OpenTelemetry collector.
- Alert rules for API errors, failed AI jobs, storage usage, and database health.
- Real metrics backend/dashboard, such as Prometheus/Grafana or hosted observability.
- Dependency vulnerability cleanup and policy.
- Accessibility audit with automated and manual checks.
- Deployment automation for staging and production.
- Container image publishing.
- Smoke tests after deployment.
- Secrets rotation runbook.
- CSRF protection for cookie-auth browser mutations.
- Object storage lifecycle policy.
- Real privacy policy and terms reviewed by counsel.
- Real brand assets, logo package, app icons, Open Graph images, and product screenshots.

## Feature Gaps By Area

### Database

Done:

- Prisma schema.
- Migrations.
- Seed data.
- PostgreSQL persistence.
- pgvector embedding table and index.
- Backup/restore/retention scripts.
- Operations runbook.

Left:

- Run migrations against real staging/prod.
- Schedule backups and retention jobs.
- Validate restore against staging data.
- Add object storage lifecycle and deletion jobs.

### Auth

Done:

- Register/login/logout.
- Refresh tokens.
- Email verification token flow.
- Forgot/reset password token flow.
- Protected dashboard routes.
- Secure cookie defaults in production.
- Redis-backed failed-login account lockout policy with local memory fallback.
- Authenticated account deletion endpoint with session revocation, account anonymization, AI secret disabling, embedding/image row cleanup, wardrobe soft deletion, and audit logging.
- SMTP delivery path for verification and password reset email.
- SMTP verification script.
- Auth/security runbook with secret rotation steps.
- Dual-secret JWT verification for zero-downtime rotation.
- Playwright auth/CSRF smoke spec.

Left:

- Configure real SMTP provider credentials in staging/prod and run `infra/scripts/verify-smtp.sh`.
- Verify Redis-backed lockout behavior in staging.
- Run external object storage deletion script during deletion drills.
- Add provider/customer deletion automation for billing providers.
- Run and expand browser/mobile auth and CSRF e2e tests.

### Wardrobe

Done:

- Wardrobe CRUD.
- Category/tag CRUD.
- Local-dev upload route.
- Signed upload abstraction.
- Favorite toggle.
- Mark-worn flow.
- Search/filter/sort/pagination.

Left:

- Production S3/R2 bucket verification.
- Deploy/schedule the image processing worker or replace it with a durable queue for high-volume production.
- Additional image e2e tests.
- Malware/content scanning if public uploads are allowed.

### Outfits and Calendar

Done:

- Outfit CRUD.
- Item slots.
- Duplication.
- Calendar persistence.
- Basic conflict detection.
- Usage logs.

Left:

- Rich calendar month/week views.
- Reminder/notification integration.
- Deeper conflict rules.
- More tests.

### Billing

Done:

- Billing schema.
- Billing UI.
- Gateway-agnostic adapter interface.
- Manual gateway.
- Generic checkout/portal gateway adapter.
- Entitlement enforcement for wardrobe item count, storage bytes, AI request count, and custom AI provider access.
- Generic HMAC webhook signature verification.
- Stripe, Razorpay, Paddle, and PayPal webhook event normalization.
- Invoice text download endpoint.
- Configurable billing currency and tax mode.
- Staging billing verification script and runbook.

Left:

- Configure real payment providers.
- Verify provider-specific webhooks in staging.
- Replace text invoice download with branded PDF invoices if required.
- Payment failure handling.
- Final tax/currency policy.

### Admin

Done:

- Admin RBAC guard path.
- User list and role update API.
- AI job monitoring API.
- Storage monitoring API.
- Reports API.
- Audit log API.
- Admin dashboard UI.

Left:

- More granular roles/permissions.
- Admin action audit coverage across all sensitive changes.
- User suspension/deletion workflows.
- Operational alerting.

### Public Website

Done:

- Public marketing pages.
- Privacy and terms placeholder pages.
- Pricing page.
- Contact page UI.

Left:

- Real lead capture/contact backend.
- SEO metadata and sitemap.
- Open Graph images.
- Final legal copy.
- Real brand/product imagery.

## Recommended Next Order

1. Real S3/R2 deployment verification and queued production image workers.
2. Provider key encryption and AI provider health checks.
3. Mobile UX polish and simulator/device validation.
4. Payment webhook verification and entitlement enforcement.
5. Accessibility audit and fixes.
6. Deployment automation and smoke tests.
7. Real AI dataset/model pipeline.
8. Legal and brand asset finalization.

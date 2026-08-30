# Closira Feature Status Matrix

Last updated: 2026-08-30

Status key:

- `Real`: implemented with backend/data flow.
- `Partial`: implementation exists, but production work remains.
- `Mock/Fallback`: UI or API path exists, but behavior is placeholder, fallback, or demo quality.
- `Not Built`: planned but not implemented.

| Area | Feature | Status | What Is Built | Mock/Fallback/Limitations | What Is Left |
| --- | --- | --- | --- | --- | --- |
| Public Website | Marketing homepage | Real | Public landing page exists in Next.js. | Needs real product imagery and final brand assets. | SEO, OG images, real screenshots, conversion tracking. |
| Public Website | Features page | Real | Feature overview route exists. | Content may need final product copy. | Final copy and screenshots. |
| Public Website | How-it-works page | Real | Public explanation page exists. | Static marketing content. | Final images and proof points. |
| Public Website | Pricing page | Partial | Pricing route exists and plans are represented. | Billing entitlements are not fully enforced. | Connect live gateway plans and entitlement checks. |
| Public Website | Privacy page | Partial | Privacy route exists. | Legal copy is not lawyer-reviewed. | Final legal review. |
| Public Website | Terms page | Partial | Terms route exists. | Legal copy is not lawyer-reviewed. | Final legal review. |
| Public Website | Contact page | Partial | Contact page UI exists. | No real contact/lead backend confirmed. | Contact submission endpoint, email/CRM integration, spam protection. |
| Design System | Tailwind theme | Real | Tailwind configured with Closira visual direction. | Needs formal brand tokens/assets package. | Brand lockup, image style guide, asset library. |
| Design System | UI primitives | Real | Button, card, badge, input, textarea, skeleton, empty/error states, toast-style primitives. | Not a published component package. | Accessibility audit and Storybook-style documentation if needed. |
| Auth | Signup/register | Real | Backend register endpoint, frontend form integration, SMTP-capable email sending, and SMTP verification script exist. | Real provider credentials are environment-owned. | Configure provider in staging/prod and monitor deliverability. |
| Auth | Login | Real | Backend login, session creation, secure cookies, frontend integration, CSRF token issuance, and Redis-backed failed-login lockout with memory fallback exist. | Needs staging Redis verification and e2e tests. | Run Redis-backed lockout tests in staging. |
| Auth | Logout | Real | Backend logout and frontend action exist. | Needs broader e2e coverage. | Add tests. |
| Auth | Refresh tokens | Real | Refresh token/session persistence, mobile bearer refresh, secret rotation runbook, and dual-secret JWT verification exist. | Needs staging rotation drill. | Run rotation drill before launch. |
| Auth | Email verification | Partial | Token flow, dev email fallback, SMTP delivery path, and SMTP verification script exist. | Real email provider not configured in repo. | Configure SMTP provider and deliverability monitoring. |
| Auth | Forgot/reset password | Partial | Token flow, frontend pages, SMTP delivery path, and SMTP verification script exist. | Real email provider not configured in repo. | Configure templates/provider and deliverability tests. |
| Auth | Protected dashboard routes | Real | Dashboard layout checks session and redirects unauthenticated users. | Needs e2e tests. | Playwright coverage. |
| Security | Secure cookies/session handling | Real | HttpOnly cookies, production secure flag path, readable CSRF cookie, CSRF header validation, frontend mutation token forwarding, and Playwright auth/CSRF smoke spec exist. | Needs full browser e2e run against live local/staging services. | Run and expand Playwright CSRF/auth regression tests. |
| Security | Rate limiting | Real | API global/auth rate limits and Redis-backed login lockout exist. | Express rate-limit store is still in-memory. | Redis-backed global rate-limit store. |
| Security | Security headers | Real | Helmet is configured. | Needs production CSP tuning. | CSP per deployment/assets domains. |
| Security | Request validation | Partial | Global Nest validation pipe enabled. | Many controllers still use loose body types instead of DTO classes. | Add DTOs with class-validator/Zod schemas per endpoint. |
| Database | Prisma schema | Real | Production schema exists for users, wardrobe, outfits, calendar, AI, billing, admin/audit. | Future schema changes still expected. | More migration tests. |
| Database | Migrations | Real | Initial production migration and billing gateway migration exist. | Not yet run against real staging/prod. | Staging/prod deploy. |
| Database | Seed data | Real | Seed script exists. | Demo-oriented data only. | Production-safe seed strategy. |
| Database | PostgreSQL persistence | Real | API controllers persist to PostgreSQL through Prisma. | Needs staging/prod DB setup. | Provision managed DB and run migrations. |
| Database | pgvector embeddings table | Real | Vector extension/table/index exist and runtime embeddings now return 768 dimensions. | Production quality depends on OpenCLIP/model deployment and real image coverage. | Backfill real image embeddings in staging/prod. |
| Database Ops | Backup script | Real | `infra/scripts/backup-postgres.sh` exists. | Scheduling not configured. | Cron/hosted scheduled backups. |
| Database Ops | Restore script | Real | `infra/scripts/restore-postgres.sh` exists. | Restore not tested on staging data. | Staging restore drill. |
| Database Ops | Retention cleanup | Real | `infra/scripts/run-data-retention.sh` exists. | Scheduling not configured. | Scheduled job and retention policy review. |
| Wardrobe | Wardrobe CRUD | Real | Backend CRUD and frontend adapters exist. | Needs broader tests. | API/e2e coverage. |
| Wardrobe | Category CRUD | Real | Backend category endpoints and frontend management exist. | Needs tests and admin taxonomy strategy. | Tests and global/default taxonomy controls. |
| Wardrobe | Tag CRUD | Real | Backend tag endpoints and frontend management exist. | Needs tests. | Tests. |
| Wardrobe | Image upload | Partial | Local-dev upload route, S3-compatible signed upload abstraction, image record creation, finalize step, image delete API, primary-image management, upload progress, and retry UI exist. | Production bucket credentials must be configured outside the repo. | Run bucket verification in staging/prod and add deeper upload e2e tests. |
| Wardrobe | Signed URLs | Real | Storage service supports local and S3-compatible signed upload generation, private expiring read URL generation, object deletion, and frontend private image rendering via proxy routes. | Real bucket credentials are environment-owned. | Verify against staging/prod bucket. |
| Wardrobe | Favorite toggle | Real | Backend and frontend action exist. | Needs tests. | Add tests. |
| Wardrobe | Mark-worn flow | Real | Backend and frontend action exist; usage logs update. | Needs richer history UX. | Usage timeline and tests. |
| Wardrobe | Search/filter/sort/pagination | Real | Backend query support and frontend filters exist. | Needs performance checks on large data. | Index review and load tests. |
| Wardrobe | Image processing | Partial | Finalize step reads local or S3-compatible objects, validates dimensions, strips metadata through re-encoding, generates thumbnail/card/detail WebP variants, stores metadata, keeps original archived, and a `worker:images` batch command exists. | Worker is batch/scheduled-command style, not a durable queue with retries/dead-lettering. | Deploy/schedule worker in staging/prod or replace with BullMQ/SQS-style queue for high-volume production. |
| Outfits | Outfit CRUD | Real | Backend outfit endpoints and frontend pages exist. | Needs tests. | API/e2e tests. |
| Outfits | Outfit item slots | Real | Outfit slots exist in schema/API/UI. | Needs richer drag/drop builder if desired. | Better builder UX. |
| Outfits | Outfit duplication | Real | Backend duplicate endpoint and frontend action exist. | Needs tests. | Add tests. |
| Outfits | Favorite outfit toggle | Real | Backend/frontend action exists. | Needs tests. | Add tests. |
| Calendar | Calendar persistence | Real | Calendar plans persist in PostgreSQL. | Needs richer calendar views. | Month/week/day views. |
| Calendar | Conflict detection | Partial | Basic conflict detection exists. | Needs richer rules and time overlap behavior. | Event overlap logic, outfit/item availability checks. |
| Calendar | Usage logs | Real | Mark-worn creates usage logs. | Needs analytics validation. | Cost-per-wear and usage reports tests. |
| Calendar | Reminders | Not Built | Reminder fields/planning exist conceptually. | No notification service. | Email/push reminder scheduler. |
| Analytics | Wardrobe analytics endpoint | Partial | API route and dashboard route exist. | Needs deeper source definitions and test coverage. | Cost-per-wear, unused reports, time filters, exports. |
| Analytics | Dashboard metrics UI | Real | Metric cards and visual lists exist. | Data quality needs validation. | Caveats/source definitions and tests. |
| AI | AI settings UI | Partial | User can choose Native/OpenAI/Claude/Gemini/Azure/Ollama/custom provider options and route API calls through the active provider. | User-entered keys are masked only; production calls should use env-backed keys until encryption is implemented. | Encrypt keys, test connection, disconnect, capability badges. |
| AI | Native AI service | Mock/Fallback | FastAPI service and trainable baseline exist. | Tiny sample model; not stylist-quality production AI. | Dataset, real model, eval pipeline. |
| AI | Clothing image analysis | Partial | Endpoint now uses the active provider for real multimodal image analysis when OpenAI/Azure/custom, Anthropic, Gemini, or Ollama vision credentials/models are configured, then falls back to native baseline. | Native model remains baseline quality; provider keys are env-backed, not securely persisted user secrets yet. | Provider health checks, encrypted user keys, confidence tests, and image-analysis evaluation set. |
| AI | Auto-tagging | Partial | Analysis response can suggest tags and API can apply tags. | Needs review/confirmation flow and model quality. | Confirmation UI and better model. |
| AI | Image embeddings | Partial | Runtime endpoint returns 768-dim vectors; offline OpenCLIP embedding builder exists; deterministic 768-dim fallback remains for dev. | Production OpenCLIP/container deployment and image backfill still required. | Deploy embedding model, backfill wardrobe images, ranking tests. |
| AI | pgvector similarity search | Partial | Database table/index exists and API path has similarity search support. | Quality depends on real embeddings. | Real embeddings, ranking tests, UX surfacing. |
| AI | Outfit recommendation endpoint | Partial | API/job flow exists and answers prompts using wardrobe data/provider path. | Native model is baseline/fallback quality. | Production stylist model, feedback loop, eval set. |
| AI | Shopping-check endpoint | Partial | API/job flow exists. | Native logic is deterministic/fallback quality. | Real image upload, similarity scoring, buy/skip evaluation. |
| AI | Provider adapters | Partial | Provider settings and HTTP execution paths exist for text styling, shopping checks, and multimodal clothing analysis across OpenAI/Azure/custom-compatible, Anthropic, Gemini, and Ollama. | Needs encrypted credentials, health checks, retries, cost/capability tracking, and provider-specific integration tests. | Harden per-provider adapters and tests. |
| AI | Confidence/fallback pipeline | Real | API-level confidence and fallback job status exist. | Needs model-level calibration. | Confidence calibration against eval data. |
| AI | Training dataset | Partial | Licensed dataset collection script, source policy, manifest normalizer, and split script exist. | Real licensed image corpus is not collected yet. | Acquire/label commercial-safe dataset and run QA. |
| AI | Virtual try-on | Not Built | Endpoint returns `not_available`. | No real try-on model. | Consent flow, segmentation, pose/garment model, result storage/deletion. |
| Billing | Billing schema | Real | Subscription, invoice, gateway models exist. | Provider-specific behavior still limited. | Live provider activation. |
| Billing | Gateway abstraction | Real | Generic payment gateway adapter interface exists. | Real providers not fully configured. | Provider credentials and gateway-specific contracts. |
| Billing | Manual gateway | Real | Manual/local checkout behavior exists. | Not production payment collection. | Use only for admin/manual testing. |
| Billing | Stripe/Razorpay/custom gateways | Partial | Env slots, generic gateway pattern, HMAC webhook signature verification, and Stripe/Razorpay/Paddle/PayPal webhook normalization exist. | Live checkout/webhooks not verified against real provider dashboards. | Sandbox checkout verification in staging. |
| Billing | Billing UI | Partial | Plan panel, invoices, checkout/portal actions, invoice download links, and clearer entitlement error messages exist. | Depends on real provider configuration. | Upgrade/paywall components near every limit-bearing action. |
| Billing | Entitlements | Real | Plan limits are enforced for wardrobe item count, storage bytes, AI request count, and custom AI provider access. | Needs broader route coverage and UX upgrade prompts. | E2E coverage and upgrade/paywall UI polish. |
| Admin | Admin RBAC | Partial | Admin route guard checks role. | Needs granular permission model. | Permissions, super admin controls, audit coverage. |
| Admin | User management | Partial | User list and role update API exist. | Needs suspension/deletion workflows. | Admin lifecycle controls. |
| Admin | AI job monitoring | Real | Admin API/dashboard show AI job state. | Needs alerts. | Alerting and retries dashboard. |
| Admin | Storage monitoring | Partial | Admin storage metrics exist. | Needs real object storage usage integration. | Bucket usage metrics. |
| Admin | Reports | Partial | Admin report API exists. | Needs richer production reports. | Export/report scheduling. |
| Admin | Audit logs | Partial | Audit log model/API exists and some actions write logs. | Not every sensitive action is audited yet. | Audit coverage pass. |
| Profile | Profile view/edit | Real | Backend profile endpoint and frontend form exist. | Needs tests. | Tests and validation polish. |
| Profile | Avatar upload | Not Built | Profile has image fields conceptually. | No avatar upload flow. | Upload, crop, delete. |
| Profile | Notification settings | Partial | Settings shape exists. | No notification delivery service. | Email/push preferences and scheduler. |
| Profile | Account deletion | Partial | Authenticated account deletion endpoint soft-deletes user, anonymizes email/name, revokes sessions, disables AI provider secrets, deletes embedding/image rows, marks wardrobe items deleted, clears cookies, and audits. | External object storage object deletion and provider/customer deletion need worker execution. | Deletion worker for storage objects and billing/customer cleanup. |
| Mobile | Flutter project | Real | `apps/mobile` now contains a Closira Material app with Android/iOS shell. | Still early mobile implementation. | App IDs, signing, icons, splash, release builds. |
| Mobile | Auth | Partial | Login/register call API; access/refresh tokens persist in secure storage; session restore calls `/auth/me`; 401 retry refreshes tokens; logout clears tokens. | Offline demo path remains for previews/tests. | Device e2e against staging and account verification/reset flows. |
| Mobile | Wardrobe | Partial | Wardrobe list/sync, create, favorite, mark-worn, signed image upload, upload PUT, and finalize call exist. | Edit/delete/detail UX still thin. | Image preview/progress polish, edit/delete/detail screens, device upload tests. |
| Mobile | Outfits/calendar | Partial | Outfit list sync, create, duplicate, and calendar segment exist with API calls. | Calendar planning mutations still need richer mobile UI. | Calendar create/worn flows and month/week/day calendar. |
| Mobile | AI/shopping | Partial | AI stylist prompts and shopping check call real API and show results. | Provider settings surface is display-only. | Provider connect/edit/test UI and richer result cards. |
| Mobile | Profile/settings | Partial | Profile form, API update call, notification toggles, AI data consent toggle, and logout action exist. | Form controllers are minimal and settings toggles are disabled. | Real editable settings/privacy flows. |
| Mobile | Tests | Partial | Flutter widget tests verify Closira auth shell and wardrobe state; integration test smoke flow exists. | Integration test has not been run on a real simulator/device in this session. | Run device e2e, upload e2e, golden, and accessibility tests. |
| Observability | Request logs | Real | Structured request logs with request IDs exist. | Needs centralized log backend. | Ship logs to production provider. |
| Observability | Metrics export | Real | `/api/v1/metrics` Prometheus-style endpoint exists. | In-memory metrics reset on restart and are per-instance. | Prometheus/Grafana or hosted metrics backend. |
| Observability | Error tracking | Partial | Webhook-based error tracking hook exists. | No Sentry/OpenTelemetry SDK selected. | Choose provider and add release/environment tagging. |
| Observability | Alerts | Not Built | N/A | No alert rules configured. | Error-rate, failed AI job, DB, storage, latency alerts. |
| CI/CD | CI workflow | Real | GitHub Actions workflow exists for Node/API/web/AI checks. | No deploy jobs. | Staging/prod deployment automation. |
| CI/CD | Deployment automation | Not Built | N/A | No container publishing/deploy workflow. | Build/push images, deploy staging, smoke test, prod approval. |
| Testing | API tests | Partial | Health and metrics tests exist. | Most modules untested. | Auth/wardrobe/outfit/calendar/AI/billing/admin tests. |
| Testing | Web tests | Partial | Lint/typecheck/build pass. | No Playwright/user-flow tests. | E2E coverage. |
| Testing | AI tests | Partial | Health tests exist. | No model quality/schema/ranking tests. | AI contract and evaluation tests. |
| Testing | Mobile tests | Partial | Flutter widget tests verify Closira auth shell and wardrobe add flow. | No API/integration tests yet. | Mobile API, upload, golden, and accessibility tests. |
| Accessibility | Audit | Not Built | N/A | No automated/manual accessibility audit. | Add axe/Playwright checks and manual keyboard/screen reader pass. |
| Legal | Privacy/terms | Partial | Pages exist. | Not final legal copy. | Counsel-reviewed privacy policy, terms, cookie policy if needed. |
| Brand | Brand assets | Partial | Visual direction exists in UI. | No final logo package/product screenshots/OG images. | Logo, icons, screenshots, social images, app store assets. |

## Highest-Priority Next Features

| Priority | Feature | Why It Matters |
| --- | --- | --- |
| 1 | Real object storage image pipeline | Wardrobe is image-first; production still needs real bucket verification and queued workers for scale. |
| 2 | Provider key encryption and AI provider health checks | AI settings cannot be production without secure credential storage and connection validation. |
| 3 | Payment provider activation | Provider contracts exist; live provider credentials/webhooks still need staging verification. |
| 4 | Mobile UX and device validation | Mobile API wiring exists for core flows; it needs richer UX and real simulator/device e2e runs. |
| 5 | Real AI dataset/model pipeline | Current AI is integration-quality, not stylist-quality. |
| 6 | Deployment automation | CI exists, but staging/prod deploy is still manual/not built. |
| 7 | Accessibility and legal review | Required before market launch. |

# Clorisa Project Build Status

Last updated: 2026-08-25

## Executive Summary

Clorisa now has a complete Next.js web frontend foundation for the public website and dashboard modules through Run 7. The implemented web experience includes the marketing website, auth entry screens, dashboard shell, wardrobe, categories, tags, outfits, calendar, AI stylist, shopping assistant, analytics, profile, billing, and admin dashboard screens.

The current web implementation is production-build clean. AI, shopping assistant, and analytics now call real NestJS HTTP endpoints instead of local frontend mock adapters. Many non-AI product areas still use typed mock adapters because the full database, persistence, and business APIs are not implemented yet.

## Repository Areas

### Existing Apps and Services

- `apps/web-admin`: Next.js web app and dashboard. This is the most built-out area.
- `apps/mobile`: Flutter app foundation exists, but feature work has not started in this implementation sequence.
- `services/api`: NestJS API foundation exists.
- `services/ai`: FastAPI AI service foundation exists.
- `packages/shared-types`: shared TypeScript package exists.
- `packages/config`: shared config package exists.
- `infra/database`: database init assets exist.
- `docs`: product, architecture, frontend, and implementation documentation exists.

### Current Web Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- shadcn-compatible local UI primitives
- lucide-react icons
- typed service layer under `apps/web-admin/lib/api`
- isolated mock data under `apps/web-admin/lib/mock`

## What We Have Built

### Run 1: Documentation, Design System, Public Website

Status: complete.

Built:

- Public marketing website.
- Premium visual direction with ivory, champagne, rose, lavender, sage, and charcoal styling.
- Global Tailwind theme tokens.
- Reusable UI primitives:
  - button
  - card
  - badge
  - input
  - textarea
  - skeleton
  - empty state
  - error state
  - toast
- Layout primitives:
  - public shell
  - responsive container
- Marketing components:
  - navbar
  - footer
  - section header
  - feature card
  - visual mockup
  - simple page wrapper
- Public routes:
  - `/`
  - `/features`
  - `/how-it-works`
  - `/pricing`
  - `/ai-stylist`
  - `/smart-shopping`
  - `/privacy`
  - `/terms`
  - `/contact`
  - `/login`
  - `/signup`
  - `/forgot-password`
- Documentation:
  - `docs/REPOSITORY_INSPECTION_REPORT.md`
  - `docs/WEBSITE_PRODUCT_REQUIREMENTS.md`
  - `docs/WEBSITE_INFORMATION_ARCHITECTURE.md`
  - `docs/WEBSITE_DESIGN_SYSTEM.md`
  - `docs/WEBSITE_SCREEN_FLOW.md`
  - `docs/WEBSITE_API_REQUIREMENTS.md`
  - `docs/WEBSITE_IMPLEMENTATION_PLAN.md`
  - `docs/FRONTEND_STATUS.md`

### Run 2: Auth, Dashboard Shell, Dashboard Home

Status: complete.

Built:

- Auth-related frontend types.
- Mock-backed auth/session service.
- Functional auth entry pages that route to real app pages.
- Dashboard shell with desktop and mobile navigation.
- Dashboard home with account context and active module cards.
- Dashboard route:
  - `/dashboard`
- Auth routes:
  - `/login`
  - `/signup`
  - `/forgot-password`
- Reusable components:
  - `AuthForm`
  - `DashboardShell`
  - `DashboardHome`

Important limitation:

- There is no real token persistence, protected routing, refresh token flow, logout, email verification, or backend authentication integration yet.

### Run 3: Wardrobe, Categories, Tags

Status: complete.

Built:

- Wardrobe frontend types:
  - wardrobe item
  - wardrobe image
  - wardrobe filters
  - wardrobe summary
  - category
  - tag
- Mock-backed services:
  - `listWardrobeItems`
  - `getWardrobeItem`
  - `getWardrobeSummary`
  - `listCategories`
  - `listTags`
- Routes:
  - `/dashboard/wardrobe`
  - `/dashboard/wardrobe/new`
  - `/dashboard/wardrobe/[itemId]`
  - `/dashboard/wardrobe/[itemId]/edit`
  - `/dashboard/categories`
  - `/dashboard/tags`
- Reusable components:
  - wardrobe stat grid
  - wardrobe filters
  - wardrobe card
  - wardrobe grid
  - wardrobe editor
  - taxonomy editor
  - taxonomy table

Important limitation:

- Create/edit forms route to existing screens but do not persist data.
- Wardrobe images are CSS visual placeholders, not real uploads.
- Category/tag create forms do not persist data.
- Backend endpoints are documented but not implemented.

### Run 4: Outfits and Calendar

Status: complete.

Built:

- Outfit frontend types:
  - outfit
  - outfit item
  - outfit slot
  - outfit filters
  - outfit summary
- Calendar frontend types:
  - outfit calendar event
  - calendar conflict status
  - calendar summary
- Mock-backed services:
  - `listOutfits`
  - `getOutfit`
  - `getOutfitSummary`
  - `listCalendarEvents`
  - `getCalendarSummary`
- Routes:
  - `/dashboard/outfits`
  - `/dashboard/outfits/new`
  - `/dashboard/outfits/[outfitId]`
  - `/dashboard/outfits/[outfitId]/edit`
  - `/dashboard/calendar`
  - `/dashboard/calendar/new`
- Reusable components:
  - outfit card
  - outfit grid
  - outfit stat grid
  - outfit editor
  - calendar list
  - calendar editor

Important limitation:

- Outfit creation/editing and calendar planning forms do not persist data.
- Calendar conflict warnings are mock data, not computed by a backend.

### Run 5: AI Stylist, Shopping Assistant, Analytics

Status: complete.

Built:

- AI frontend types:
  - AI stylist recommendation
  - shopping assistant check
- Analytics frontend types:
  - analytics metric
  - analytics slice
  - wardrobe analytics
- Mock-backed services:
  - `listAiStylistRecommendations`
  - `listShoppingAssistantChecks`
  - `getWardrobeAnalytics`
- Routes:
  - `/dashboard/ai-stylist`
  - `/dashboard/shopping-assistant`
  - `/dashboard/analytics`
- Reusable components:
  - AI recommendation card
  - shopping check card
  - metric grid
  - analytics bar list

Important limitation:

- AI stylist now calls the NestJS API, but the NestJS API currently uses deterministic native logic rather than hosted model SDK calls.
- Shopping assistant now calls the NestJS API, but image analysis and embeddings are not yet connected to persisted wardrobe images.
- Analytics now call the NestJS API, but values are not yet database-derived.

### Run 6: Profile, Billing, Admin Dashboard

Status: complete.

Built:

- Profile frontend types and mock data.
- Billing frontend types and mock data.
- Admin metric/health frontend types and mock data.
- Mock-backed services:
  - `getProfile`
  - `getBillingPlan`
  - `listPaymentRecords`
  - `getAdminMetrics`
  - `getAdminHealth`
- Routes:
  - `/dashboard/profile`
  - `/dashboard/billing`
  - `/dashboard/admin`
- Reusable components:
  - profile form
  - billing panel
  - admin dashboard

Important limitation:

- Profile updates do not persist.
- Billing is not connected to Stripe or any payment provider.
- Admin dashboard uses mock operational data.
- Admin RBAC is not implemented.

### Run 7: Polish and Build Fixes

Status: complete.

Built:

- Mobile dashboard navigation.
- Documentation cleanup.
- Full frontend verification after all dashboard modules.
- Build/lint/typecheck fixes.

Verified:

- `npm --workspace apps/web-admin run lint`
- `npm --workspace apps/web-admin run build`
- `npm --workspace apps/web-admin exec tsc -- --noEmit`
- Fresh smoke checks for public, auth, and dashboard routes.

## Current Feature Inventory

### Public Website Features

Built:

- Product landing page.
- Feature overview.
- How-it-works page.
- Pricing page.
- AI stylist marketing page.
- Smart shopping marketing page.
- Privacy page.
- Terms page.
- Contact page.
- Login, signup, and forgot-password entry points.
- Responsive public navigation.
- Responsive footer.

Left:

- Real lead capture.
- Real contact submission handling.
- Final legal copy.
- Real product imagery or brand assets.
- SEO metadata per page.
- Open Graph images.

### Authentication Features

Built:

- Login UI.
- Signup UI.
- Forgot-password UI.
- Mock session service.
- Dashboard entry routing.

Left:

- Register endpoint integration.
- Login endpoint integration.
- Refresh token flow.
- Logout.
- Email verification.
- Password reset token flow.
- Protected dashboard route middleware.
- Secure cookie/session handling.
- Form validation with backend error handling.

### Dashboard Shell Features

Built:

- Dashboard layout.
- Sidebar navigation.
- Mobile dashboard navigation.
- Dashboard home.
- Active module cards.
- Public-site back link.

Left:

- Active route highlighting.
- User menu.
- Logout action.
- Role-based navigation.
- Dashboard loading and error boundaries.
- Real account-aware personalization.

### Wardrobe Features

Built:

- Wardrobe grid.
- Wardrobe item cards.
- Wardrobe filters.
- Wardrobe summary stats.
- Wardrobe item detail.
- Wardrobe add/edit metadata forms.
- Category management UI.
- Tag management UI.

Left:

- Real wardrobe CRUD API.
- Real image upload with signed URLs.
- Image progress, retry, and delete states.
- Persistent search/filter/sort/pagination.
- Favorite toggle persistence.
- Mark-worn flow persistence.
- Delete confirmation.
- Server-side validation and API error handling.
- Real category/tag CRUD.

### Outfits and Calendar Features

Built:

- Outfit list.
- Outfit cards.
- Outfit detail.
- Outfit create/edit forms.
- Outfit summary stats.
- Calendar list.
- Calendar planning form.
- Calendar conflict warning display.

Left:

- Real outfit CRUD API.
- Real outfit item slot management.
- Outfit duplication.
- Favorite outfit toggle.
- Mark-worn flow.
- Real calendar CRUD API.
- Conflict detection from actual history.
- Date range filtering.
- Reminder integration.
- Calendar month/week views.

### AI Stylist Features

Built:

- AI stylist dashboard route.
- Prompt input UI.
- Recommendation cards.
- Confidence display.
- Owned wardrobe item suggestions.

Left:

- Real AI recommendation endpoint.
- Prompt submission handling.
- Confidence and fallback logic from model output.
- User feedback on AI suggestions.
- Save recommendation as outfit.
- AI suggestion editing workflow.
- Guardrails to ensure owned items are used unless marked as shopping suggestions.

### Shopping Assistant Features

Built:

- Shopping assistant dashboard route.
- Item check input UI.
- Compatibility score display.
- Duplicate risk display.
- Similar owned item display.

Left:

- Real shopping-check endpoint.
- Purchase image upload.
- Similarity search through embeddings.
- Recommendation logic from wardrobe data.
- Save check history.
- Clear buy/skip/consider workflow.

### Analytics Features

Built:

- Analytics dashboard route.
- Metric cards.
- Category breakdown bars.
- Usage breakdown bars.
- Color breakdown bars.

Left:

- Real analytics endpoints.
- Cost-per-wear calculations from usage logs.
- Wardrobe value from stored purchase data.
- Unused item reports.
- Time-based filtering.
- Export or report generation.
- Source definitions and caveats in UI.

### Profile Features

Built:

- Profile route.
- Profile form.
- Style preferences and favorite colors display.
- Privacy mode control.

Left:

- Real profile API integration.
- Preferences persistence.
- Avatar upload.
- Measurements.
- Notification settings persistence.
- Account deletion.
- Privacy settings connected to backend behavior.

### Billing Features

Built:

- Billing route.
- Current plan panel.
- Payment record list.

Left:

- Stripe or payment provider integration.
- Real subscription plans.
- Checkout.
- Plan upgrade/downgrade.
- Invoices.
- Billing portal.
- Entitlement enforcement.

### Admin Features

Built:

- Admin dashboard route.
- Admin metrics cards.
- Service health panel.

Left:

- Admin authentication and RBAC.
- User management.
- Category/tag admin controls.
- AI job monitoring.
- Storage monitoring.
- Reports.
- Audit logs.
- Real service health calls.

## Backend Status

### Existing

- NestJS API service foundation.
- Health controller.
- Prisma config shell.
- API documentation for intended routes.
- Dockerfile.

### Left

- Full Prisma schema implementation.
- Database migrations.
- Auth module.
- Profile module.
- Wardrobe module.
- Category and tag modules.
- Outfit module.
- Calendar module.
- AI orchestration module.
- Analytics module.
- Billing module.
- Admin module.
- DTO validation.
- Error contract implementation.
- JWT/session security.
- RBAC.
- Integration tests.

## AI Service Status

### Existing

- FastAPI service foundation.
- Health endpoint.
- AI module documentation.
- Deterministic endpoints for clothing analysis, embeddings, outfit recommendations, shopping checks, and virtual try-on availability status.
- Lightweight train/evaluate pipeline for a baseline wardrobe classifier.
- Sample JSONL training manifest.
- Local baseline model artifact generated from the sample manifest.

### Left

- Hosted model integration for native Clorisa AI.
- Provider connectors for OpenAI, Anthropic, Gemini, Azure OpenAI, Ollama, and custom OpenAI-compatible endpoints.
- Real clothing image analysis.
- Auto-tagging connected to wardrobe save flows.
- pgvector-backed image embedding search.
- Real similar item search.
- Model-backed outfit recommendation logic.
- Model-backed shopping assistant analysis.
- Consent-gated virtual try-on with a configured model provider.
- Model loading and cache strategy.
- Error handling and confidence scoring.
- AI service authentication between API and AI service.

### Training Status

Completed:

- Added `services/ai/scripts/train_baseline.py`.
- Added `services/ai/scripts/evaluate_baseline.py`.
- Added sample dataset at `services/ai/data/sample_manifest.jsonl`.
- Trained a local baseline artifact at `services/ai/models/clorisa-baseline.json`.
- Wired the AI service to load `CLORISA_MODEL_PATH` when present.

Important limitation:

- This is a tiny baseline trained on five sample rows. It proves the training pipeline works, but it is not a production-quality fashion model.
- Real model quality requires a much larger labeled dataset, held-out evaluation data, image assets, opt-in privacy controls, and likely a vision model or embedding model.

## Mobile App Status

### Existing

- Flutter app foundation.

### Left

- Mobile app architecture.
- Authentication screens.
- Wardrobe screens.
- Upload flows.
- Outfit builder.
- Calendar.
- AI stylist.
- Shopping assistant.
- Analytics.
- Profile/settings.
- API integration.
- Mobile tests.

## Data and Persistence Status

### Existing

- Mock frontend data in `apps/web-admin/lib/mock`.
- Typed frontend service adapters in `apps/web-admin/lib/api`.
- Database documentation.
- Initial database infrastructure files.
- AI, shopping assistant, and analytics frontend adapters call real NestJS API endpoints.

### Left

- Real PostgreSQL schema.
- Prisma migrations.
- Seed data.
- API persistence.
- File/object storage integration.
- Signed upload URLs.
- pgvector embeddings.
- Redis queues.
- Background jobs.

## Testing and Verification Status

### Verified Recently

- Web lint passes.
- Web production build passes.
- Web TypeScript check passes.
- Main public routes return `200`.
- Main dashboard routes return `200`.

### Left

- Unit tests for frontend components.
- Service-layer tests.
- Playwright end-to-end tests.
- API unit and integration tests beyond health.
- AI service tests beyond health.
- Mobile tests beyond generated foundation.
- Accessibility audit.
- Visual regression checks.

## Known Limitations

- The app currently has a polished frontend shell, but many non-AI interactions are mock-backed.
- Forms generally navigate to existing pages instead of persisting data.
- No real authentication or protected route enforcement exists yet.
- No real user data is loaded from the backend.
- No real image upload pipeline exists.
- AI has real HTTP endpoints, but hosted model inference is not connected yet.
- No billing provider is connected.
- No admin RBAC is enforced.

## Recommended Next Work

### Priority 1: Backend Foundation

- Implement Prisma schema and migrations.
- Build real auth endpoints.
- Add protected route/session handling.
- Implement profile and wardrobe APIs first.

### Priority 2: Wardrobe Persistence

- Add wardrobe CRUD.
- Add category/tag CRUD.
- Add signed image upload.
- Connect frontend wardrobe services to real API responses.

### Priority 3: Outfit and Calendar Persistence

- Add outfit CRUD.
- Add calendar CRUD.
- Add mark-worn and usage logs.
- Add conflict warning logic.

### Priority 4: Analytics and AI

- Build usage analytics from persisted wardrobe/outfit/calendar data.
- Add embeddings and similarity search.
- Add AI stylist and shopping assistant endpoints.

### Priority 5: Production Readiness

- Add route protection.
- Add test coverage.
- Add accessibility pass.
- Add observability.
- Add deployment environment setup.
- Add real legal copy, SEO, and assets.

## Useful Commands

Install:

```bash
npm install
```

Run web app:

```bash
npm --workspace apps/web-admin run dev
```

Lint web app:

```bash
npm --workspace apps/web-admin run lint
```

Typecheck web app:

```bash
npm --workspace apps/web-admin exec tsc -- --noEmit
```

Build web app:

```bash
npm --workspace apps/web-admin run build
```

Run API:

```bash
npm --workspace services/api run start
```

Run AI service:

```bash
PYTHONPATH=services/ai python3 -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

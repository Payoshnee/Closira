Big Production Items Still Left
1. AI is still the biggest gap
   - Native AI is still a tiny baseline, not a real stylist-quality model.
   - Need real vision model, real 768-dim embeddings, dataset pipeline, evaluation set, provider key encryption, provider health checks, and virtual try-on.
2. Mobile app is still not built
   - Flutter app exists, but it is still basically the generated counter app.
   - Need auth, API client, secure token storage, wardrobe, outfits, calendar, AI, shopping, profile, tests, app icons/signing.
3. Billing is not fully production
   - Billing schema/UI/gateway abstraction exist.
   - Still need real provider configuration, webhook verification, entitlement enforcement, invoices, payment failure handling, tax/currency policy.
4. Storage still needs production environment + queue
   - Code supports S3/R2-style upload/read/delete/variants now.
   - Still need real staging/prod bucket credentials, run bucket verification, object lifecycle policy, queued image worker for scale, image e2e tests.
5. Testing is thin
   - Current tests cover health, metrics, CSRF.
   - Need API tests for auth, wardrobe, outfits, calendar, AI, billing, admin.
   - Need Playwright web tests.
   - Need AI schema/ranking/model tests.
   - Need real mobile tests.
6. Production deployment is not done
   - CI exists.
   - Still need container publishing, staging deploy, smoke tests, production deploy approval, rollback flow.
7. Observability is partial
   - Logs, request IDs, metrics endpoint, and webhook error tracking exist.
   - Still need real monitoring backend, dashboards, alert rules, centralized logs.
8. Security/compliance still left
   - Need real SMTP provider.
   - Need brute-force/account lockout.
   - Need secrets rotation runbook.
   - Need account deletion workflow.
   - Need stricter DTO validation across controllers.
   - Need production CSP tuning.
   - Need dependency vulnerability cleanup.
9. Public website launch polish
   - Need real contact/lead capture.
   - SEO metadata and sitemap.
   - Open Graph images.
   - Real brand/product imagery.
   - Final legal copy reviewed by counsel.
10. Docs are stale in places
    - PROJECT_BUILD_STATUS.md, FRONTEND_STATUS.md, ROADMAP.md, AI_PROVIDER_SETTINGS_PLAN.md, and parts of SECURITY_PRIVACY.md still contain older scaffold-era statements.
    - The most accurate docs right now are:
      - docs/FEATURE_STATUS_MATRIX.md
      - docs/PRODUCTION_READINESS_AUDIT.md
Recommended Next Order
1. AI provider key encryption + provider health checks.
2. Billing entitlement enforcement + webhook verification.
3. Replace Flutter counter app with real Clorisa mobile shell.
4. Add API/web e2e tests.
5. Add deployment automation.
6. Build real AI dataset/model pipeline.
7. Finish legal/brand/SEO launch polish.
# Deployment Guide

## Local Deployment

Phase 1 will provide Docker Compose for PostgreSQL, Redis, API, AI service, web admin, and local storage. Developers run migrations, seed default categories/tags, and verify health checks.

## Staging

Staging mirrors production with non-production secrets, isolated database, isolated object storage bucket, seed data, monitoring, and CI/CD deployment gates.

## Production

Production uses managed PostgreSQL with pgvector, managed Redis, private object storage, containerized API and AI services, web admin hosting, TLS reverse proxy, migrations, logging, metrics, and backups.

## Docker

Each service gets a production Dockerfile and development compose override. Images must not bake secrets.

## CI/CD

Pipeline stages: install, lint, typecheck, test, build, migration check, container build, security scan, deploy staging, smoke test, production approval, deploy production.

## Environment Variables

Secrets are managed by deployment platform secret storage. Required groups include database, Redis, JWT, object storage, AI service URL, email provider, monitoring, and payment provider.

Verify auth and billing secrets from staging before production promotion:

```bash
TEST_EMAIL_TO=you@example.com infra/scripts/verify-smtp.sh
API_BASE_URL=https://staging-api.example.com/api/v1 infra/scripts/verify-billing-gateways.sh stripe
```

## Logging and Monitoring

Use structured logs, request IDs, error tracking, service health endpoints, queue metrics, AI job metrics, storage usage alerts, and database monitoring.

## Backups

Automated PostgreSQL backups, tested restore process, object storage lifecycle policy, and retention rules. Backup access is restricted. Use `docs/DATABASE_OPERATIONS_RUNBOOK.md` for migration, backup, restore, and retention commands.

## Rollback

Keep previous container images, reversible migrations where possible, feature flags for risky releases, and documented restore procedures.

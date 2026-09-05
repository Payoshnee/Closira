# Database Operations Runbook

This runbook covers PostgreSQL operations for Clorisa staging and production.

## Required Tools

- `psql`
- `pg_dump`
- `pg_restore`
- Access to the environment `DATABASE_URL`
- Access to the deployment secret manager

## Migration Flow

Use Prisma deploy migrations in staging and production. Do not run `prisma migrate dev` against shared databases.

```bash
DATABASE_URL="postgresql://..." npm --workspace services/api exec prisma migrate deploy
```

Recommended release order:

1. Take a fresh database backup.
2. Deploy application code to staging.
3. Run `prisma migrate deploy` in staging.
4. Run smoke tests against `/api/v1/health/ready`.
5. Repeat backup and migration deploy for production.
6. Watch API logs, migration output, and database CPU/connection metrics.

## Backup

Create a timestamped custom-format PostgreSQL backup:

```bash
DATABASE_URL="postgresql://..." BACKUP_DIR="backups/postgres" ./infra/scripts/backup-postgres.sh
```

The script writes files like:

```text
backups/postgres/clorisa-20260829T120000Z.dump
```

Production backups should be copied to encrypted private storage with restricted access.

## Restore

Restore into an empty or disposable database first. The restore script uses `--clean --if-exists`.

```bash
DATABASE_URL="postgresql://..." ./infra/scripts/restore-postgres.sh backups/postgres/clorisa-20260829T120000Z.dump
```

Production restore checklist:

1. Confirm incident owner and approval.
2. Stop write traffic or put the API in maintenance mode.
3. Snapshot the current database before restoring.
4. Restore the selected backup into a validation database.
5. Run smoke tests and data sanity checks.
6. Restore production only after validation passes.
7. Rotate affected secrets if the incident involved credential exposure.

## Retention Cleanup

Run retention cleanup from a scheduled job:

```bash
DATABASE_URL="postgresql://..." ./infra/scripts/run-data-retention.sh
```

Configurable retention values:

- `AUDIT_LOG_RETENTION_DAYS`, default `365`
- `AI_JOB_RETENTION_DAYS`, default `180`

The cleanup removes:

- Expired or revoked sessions
- Expired or used email verification codes
- Expired or used password reset tokens
- Old completed AI jobs
- Old audit logs beyond the configured retention window

## Health Checks

Use readiness for deployment checks:

```bash
curl -f http://localhost:3001/api/v1/health/ready
```

Use liveness for process checks:

```bash
curl -f http://localhost:3001/api/v1/health/live
```

## Recovery Targets

Initial targets until production traffic proves otherwise:

- Recovery point objective: 24 hours
- Recovery time objective: 4 hours

Tighten these after the first production launch if paid customers depend on same-day outfit/calendar data.

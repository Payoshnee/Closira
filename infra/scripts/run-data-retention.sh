#!/usr/bin/env bash
set -euo pipefail

DATABASE_URL="${DATABASE_URL:-postgresql://closira:closira@localhost:5432/closira}"
AUDIT_LOG_RETENTION_DAYS="${AUDIT_LOG_RETENTION_DAYS:-365}"
AI_JOB_RETENTION_DAYS="${AI_JOB_RETENTION_DAYS:-180}"

if ! command -v psql >/dev/null 2>&1; then
  echo "ERROR: psql is required." >&2
  exit 1
fi

psql "$DATABASE_URL" \
  --set=ON_ERROR_STOP=1 \
  --set=audit_log_retention_days="$AUDIT_LOG_RETENTION_DAYS" \
  --set=ai_job_retention_days="$AI_JOB_RETENTION_DAYS" <<'SQL'
DELETE FROM "sessions"
WHERE "expires_at" < now() OR "revoked_at" IS NOT NULL;

DELETE FROM "verification_codes"
WHERE "expires_at" < now() OR "used_at" IS NOT NULL;

DELETE FROM "password_resets"
WHERE "expires_at" < now() OR "used_at" IS NOT NULL;

DELETE FROM "ai_jobs"
WHERE "created_at" < now() - (:'ai_job_retention_days' || ' days')::interval
  AND "status" IN ('SUCCEEDED', 'FAILED', 'FALLBACK_USED');

DELETE FROM "audit_logs"
WHERE "created_at" < now() - (:'audit_log_retention_days' || ' days')::interval;
SQL

echo "Retention cleanup completed."

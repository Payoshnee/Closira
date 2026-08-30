#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-backups/postgres}"
DATABASE_URL="${DATABASE_URL:-postgresql://closira:closira@localhost:5432/closira}"
TIMESTAMP="$(date -u +"%Y%m%dT%H%M%SZ")"
OUTPUT_FILE="${BACKUP_DIR}/closira-${TIMESTAMP}.dump"

if ! command -v pg_dump >/dev/null 2>&1; then
  echo "ERROR: pg_dump is required." >&2
  exit 1
fi

mkdir -p "$BACKUP_DIR"

pg_dump "$DATABASE_URL" \
  --format=custom \
  --no-owner \
  --no-acl \
  --file="$OUTPUT_FILE"

echo "Backup written to $OUTPUT_FILE"

#!/usr/bin/env bash
set -euo pipefail

STORAGE_BUCKET="${STORAGE_BUCKET:-}"
STORAGE_REGION="${STORAGE_REGION:-auto}"
STORAGE_ENDPOINT="${STORAGE_ENDPOINT:-}"
STORAGE_TEST_KEY="${STORAGE_TEST_KEY:-health/clorisa-storage-check.txt}"

if [[ -z "$STORAGE_BUCKET" ]]; then
  echo "ERROR: STORAGE_BUCKET is required." >&2
  exit 1
fi

if ! command -v aws >/dev/null 2>&1; then
  echo "ERROR: AWS CLI is required for S3/R2 verification." >&2
  exit 1
fi

ENDPOINT_ARGS=()
if [[ -n "$STORAGE_ENDPOINT" ]]; then
  ENDPOINT_ARGS+=(--endpoint-url "$STORAGE_ENDPOINT")
fi

TMP_FILE="$(mktemp)"
trap 'rm -f "$TMP_FILE"' EXIT
printf "clorisa object storage verification %s\n" "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" > "$TMP_FILE"

aws s3api put-object \
  --bucket "$STORAGE_BUCKET" \
  --key "$STORAGE_TEST_KEY" \
  --body "$TMP_FILE" \
  --content-type "text/plain" \
  --region "$STORAGE_REGION" \
  "${ENDPOINT_ARGS[@]}" >/dev/null

aws s3api head-object \
  --bucket "$STORAGE_BUCKET" \
  --key "$STORAGE_TEST_KEY" \
  --region "$STORAGE_REGION" \
  "${ENDPOINT_ARGS[@]}" >/dev/null

aws s3api delete-object \
  --bucket "$STORAGE_BUCKET" \
  --key "$STORAGE_TEST_KEY" \
  --region "$STORAGE_REGION" \
  "${ENDPOINT_ARGS[@]}" >/dev/null

echo "Object storage verification passed for bucket $STORAGE_BUCKET"

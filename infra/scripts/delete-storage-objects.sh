#!/usr/bin/env bash
set -euo pipefail

KEY_FILE="${1:-}"

if [[ -z "${KEY_FILE}" || ! -f "${KEY_FILE}" ]]; then
  echo "Usage: infra/scripts/delete-storage-objects.sh path/to/storage-keys.txt" >&2
  exit 1
fi

if [[ "${STORAGE_PROVIDER:-LOCAL}" == "LOCAL" ]]; then
  while IFS= read -r key; do
    [[ -z "${key}" ]] && continue
    rm -f "storage/local-dev-only/uploads/${key}"
    echo "deleted local ${key}"
  done < "${KEY_FILE}"
  exit 0
fi

for required in STORAGE_BUCKET STORAGE_REGION STORAGE_ACCESS_KEY_ID STORAGE_SECRET_ACCESS_KEY; do
  if [[ -z "${!required:-}" ]]; then
    echo "Missing ${required}" >&2
    exit 1
  fi
done

while IFS= read -r key; do
  [[ -z "${key}" ]] && continue
  aws s3api delete-object \
    --bucket "${STORAGE_BUCKET}" \
    --key "${key}" \
    ${STORAGE_ENDPOINT:+--endpoint-url "${STORAGE_ENDPOINT}"}
  echo "deleted ${key}"
done < "${KEY_FILE}"

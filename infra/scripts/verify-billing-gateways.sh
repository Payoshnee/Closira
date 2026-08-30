#!/usr/bin/env bash
set -euo pipefail

API_BASE_URL="${API_BASE_URL:-http://localhost:3001/api/v1}"
GATEWAY="${1:-${BILLING_GATEWAY:-stripe}}"
SECRET_ENV_NAME="$(echo "${GATEWAY}" | tr '[:lower:]-' '[:upper:]_')_SECRET_KEY"
WEBHOOK_ENV_NAME="$(echo "${GATEWAY}" | tr '[:lower:]-' '[:upper:]_')_WEBHOOK_SECRET"

echo "==> Verifying billing gateway environment"
echo "API: ${API_BASE_URL}"
echo "Gateway: ${GATEWAY}"

if [[ -z "${!SECRET_ENV_NAME:-}" ]]; then
  echo "Missing ${SECRET_ENV_NAME}" >&2
  exit 1
fi

if [[ -z "${!WEBHOOK_ENV_NAME:-}" ]]; then
  echo "Missing ${WEBHOOK_ENV_NAME}" >&2
  exit 1
fi

echo "==> Checking API billing plans endpoint"
curl --fail --silent --show-error "${API_BASE_URL}/billing/plans" >/dev/null

echo "==> Checking signed webhook rejection/acceptance contract"
BODY='{"id":"evt_verify","type":"billing.verify","subscriptionId":"sub_verify","plan":"PRO","status":"active"}'
BAD_STATUS="$(curl --silent --output /dev/null --write-out "%{http_code}" \
  -H "Content-Type: application/json" \
  -H "x-closira-signature: invalid" \
  -d "${BODY}" \
  "${API_BASE_URL}/billing/webhooks/${GATEWAY}")"

if [[ "${BAD_STATUS}" != "403" ]]; then
  echo "Expected invalid signature to return 403, got ${BAD_STATUS}" >&2
  exit 1
fi

SIGNATURE="$(printf '%s' "${BODY}" | openssl dgst -sha256 -hmac "${!WEBHOOK_ENV_NAME}" -hex | awk '{print $2}')"
curl --fail --silent --show-error \
  -H "Content-Type: application/json" \
  -H "x-closira-signature: ${SIGNATURE}" \
  -d "${BODY}" \
  "${API_BASE_URL}/billing/webhooks/${GATEWAY}" >/dev/null

echo "Billing gateway verification passed."

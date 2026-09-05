# Auth And Security Runbook

## SMTP Setup

Required production variables:

```bash
MAIL_FROM="Clorisa <no-reply@clorisa.com>"
SMTP_HOST=smtp.provider.example
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=...
SMTP_PASSWORD=...
WEB_ORIGIN=https://clorisa.com
```

Verify staging SMTP:

```bash
TEST_EMAIL_TO=you@example.com infra/scripts/verify-smtp.sh
```

Registration and password reset use SMTP when `SMTP_HOST` is configured. Without it, the API logs dev links and tokens only for local development.

## Lockout

Failed login lockout supports Redis in production and memory fallback in local development.

```bash
REDIS_URL=redis://...
AUTH_LOCK_MAX_FAILURES=5
AUTH_LOCK_WINDOW_MS=900000
AUTH_LOCK_DURATION_MS=900000
```

Use a managed Redis instance in multi-instance production so lockouts are shared across API replicas.

## Account Deletion

`DELETE /api/v1/auth/account` revokes sessions, anonymizes the user, disables AI provider secrets, deletes embeddings/images, marks wardrobe items deleted, and writes an audit log.

Production follow-up: export deleted users' external storage keys before row cleanup when possible, then run:

```bash
infra/scripts/delete-storage-objects.sh deleted-account-storage-keys.txt
```

Billing/customer records in external providers must be canceled/deleted from the provider dashboard or provider API according to the launch-country retention policy.

## Secret Rotation

Rotate secrets in this order:

1. Add the new secret to the deployment platform.
2. Move current JWT secrets into `JWT_PREVIOUS_ACCESS_SECRET` and `JWT_PREVIOUS_REFRESH_SECRET`.
3. Set new values in `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`.
4. Deploy API with both old and new verifier support.
5. Wait one refresh-token TTL grace window or force session revocation.
6. Remove `JWT_PREVIOUS_ACCESS_SECRET` and `JWT_PREVIOUS_REFRESH_SECRET`.
7. Run smoke tests for login, refresh, logout, email verification, password reset, billing webhooks, and object storage.

Minimum rotation cadence:

- JWT access/refresh secrets: quarterly or after incident.
- SMTP password/API key: quarterly or provider policy.
- Object storage keys: quarterly.
- Billing webhook secrets: after provider dashboard changes or incident.

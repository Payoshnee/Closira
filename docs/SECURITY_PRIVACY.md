# Security and Privacy

## Authentication

Use JWT access tokens and rotating refresh tokens. Store mobile tokens in Flutter Secure Storage. Hash passwords with a modern adaptive algorithm. Revoke refresh tokens on logout, password reset, and account deletion.

## Authorization

All user data is scoped by authenticated `user_id`. Admin routes require separate admin roles. Object storage keys must not grant cross-user access.

## File Security

Images are private by default. Upload and download use short-lived signed URLs. Store files under user-scoped prefixes. Validate MIME type, size, dimensions, and extension. Strip unsafe metadata when generating variants.

## Image Privacy

Personal try-on photos require explicit consent. Users can delete wardrobe images, try-on images, and account data permanently. User photos are not used for model training without opt-in.

## Data Protection

Use TLS in transit, encrypted storage in production, environment-managed secrets, minimal metadata retention, audit logs, and backups with retention policies.

## Rate Limiting

Rate limit auth, upload signing, AI analysis, shopping checks, and recommendation endpoints. Add abuse monitoring and account lockout protections.

## Safe Deletion

Account deletion queues deletion of database records, object storage files, embeddings, AI analyses, and notification data. Deletion status must be auditable.

## Consent

Consent is required for full-body try-on photos, face/lip/makeup processing, optional model-improvement data use, and marketing notifications.

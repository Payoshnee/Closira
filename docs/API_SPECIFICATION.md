# API Specification

## Conventions

- Base path: `/api/v1`.
- Auth: Bearer access token unless endpoint is public.
- Validation: request bodies validated by DTOs and Zod/OpenAPI-compatible schemas.
- Errors: `{ "code": "STRING", "message": "Human readable", "details": {} }`.
- Pagination: `page`, `limit`, `sort`, `order`.
- Private images are accessed through signed URLs only.

## Auth

### POST `/auth/register`

Creates a user. Body: `email`, `password`, `name`. Returns user summary and tokens. Errors: duplicate email, weak password, invalid email.

### POST `/auth/login`

Authenticates user. Body: `email`, `password`. Returns access token, refresh token, and user profile status.

### POST `/auth/refresh`

Rotates refresh token. Body: `refreshToken`.

### POST `/auth/logout`

Revokes current refresh token. Auth required.

### POST `/auth/forgot-password`

Starts password reset through email-service abstraction.

### POST `/auth/verify-email`

Verifies email token.

## Profile

- `GET /profile`: current profile.
- `PATCH /profile`: updates name, phone, preferences, privacy, notifications, measurements.
- `POST /profile/avatar`: creates signed upload and image record.
- `DELETE /profile`: deletes account and queues permanent data deletion.

## Wardrobe

- `POST /wardrobe/items`: create item metadata.
- `GET /wardrobe/items`: search, filter, sort, and paginate.
- `GET /wardrobe/items/:id`: item detail with images and tags.
- `PATCH /wardrobe/items/:id`: update metadata.
- `DELETE /wardrobe/items/:id`: soft delete and revoke image access.
- `POST /wardrobe/items/:id/images`: signed upload for front, back, or close-up.
- `POST /wardrobe/items/:id/favorite`: toggle favorite.
- `POST /wardrobe/items/:id/mark-worn`: create usage log and update counters.

Query filters: `q`, `categoryId`, `subcategoryId`, `color`, `occasionTagId`, `seasonTagId`, `material`, `favorite`, `neverWorn`, `lastWornBefore`, `priceMin`, `priceMax`, `purchaseDateFrom`, `purchaseDateTo`.

## Categories

- `GET /categories`: default plus user categories.
- `POST /categories`: create user category.
- `PATCH /categories/:id`: update user-owned category.
- `DELETE /categories/:id`: delete if not used or soft delete with migration rules.

## Tags

- `GET /tags`: default plus user tags by type.
- `POST /tags`: create user tag.
- `PATCH /tags/:id`: update user-owned tag.
- `DELETE /tags/:id`: delete user-owned tag.

## Outfits

- `POST /outfits`: create outfit with linked wardrobe item slots.
- `GET /outfits`: list with filters.
- `GET /outfits/:id`: detail.
- `PATCH /outfits/:id`: update outfit and items.
- `DELETE /outfits/:id`: soft delete.
- `POST /outfits/:id/mark-worn`: creates outfit and item usage logs.

## Calendar

- `POST /calendar/outfits`: plan outfit for date/event.
- `GET /calendar/outfits`: list by date range.
- `PATCH /calendar/outfits/:id`: update plan.
- `DELETE /calendar/outfits/:id`: remove plan.

Conflict warning is returned when the same outfit is planned too close to another event.

## AI

- `POST /ai/analyze-clothing`: analyzes uploaded wardrobe image and returns editable suggestions.
- `POST /ai/similar-items`: compares an image or item against wardrobe embeddings.
- `POST /ai/recommend-outfit`: recommends outfits using owned items only unless marked as shopping suggestion.
- `POST /ai/shopping-check`: evaluates a potential purchase image.
- `POST /ai/virtual-try-on`: feature-flagged; requires consent and released model support.

## Analytics

- `GET /analytics/wardrobe`: totals, categories, colors, wardrobe value.
- `GET /analytics/usage`: most used, least used, never worn, stale items.
- `GET /analytics/cost-per-wear`: item and wardrobe-level cost-per-wear.
- `GET /analytics/unused-items`: 3-month, 6-month, 1-year unused reports.

## Admin

Admin routes require admin JWT and RBAC: users, wardrobe stats, categories, tags, AI health, storage usage, reports, settings.

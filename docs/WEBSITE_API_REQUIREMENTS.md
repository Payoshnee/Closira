# Website API Requirements

## Current Real Endpoints

- API health: `GET /api/v1/health`
- AI health: `GET /health` on the AI service

## Run 1 Service Layer

The public website does not require product data endpoints. Run 1 creates typed service-layer placeholders for later runs and keeps mock adapters isolated under `apps/web-admin/lib/mock`.

## Future Requirements

- Auth: login, signup, logout, refresh, forgot password, reset password.
- Profile: user preferences and account details.
- Wardrobe: item CRUD, images, metadata, filters, favorites.
- Categories and tags: CRUD and admin/user visibility.
- Outfits and calendar: outfit planning and mark-worn flow.
- AI stylist: recommendations, confidence, user feedback.
- Smart shopping: duplicate checks and purchase guidance.
- Analytics: wardrobe value, usage, cost per wear, unused items.
- Billing and admin: plan status, admin metrics, moderation, and monitoring.


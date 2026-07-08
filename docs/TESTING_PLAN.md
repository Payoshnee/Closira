# Testing Plan

## Unit Tests

- API services, guards, validators, mappers, and utility functions with Jest.
- AI preprocessing, color extraction, and scoring helpers with Pytest.
- Flutter state notifiers, validators, and pure widgets.
- Web admin form schemas and query utilities.

## Integration Tests

- API plus PostgreSQL and Redis through test containers or isolated Docker services.
- Prisma migrations and relational constraints.
- Storage signing and image metadata creation.
- AI service contract tests.

## API Tests

Use Supertest and an API collection. Cover auth, profile, wardrobe, categories, tags, outfits, calendar, AI orchestration, analytics, and admin authorization.

## Mobile UI Tests

Cover register, login, add wardrobe item, upload images, filter wardrobe, create outfit, plan outfit, mark worn, and privacy flows.

## Web Tests

Use Playwright for admin login, dashboard loading, category/tag management, reports, and error states.

## Database Tests

Validate migrations, indexes, cascade/soft-delete behavior, ownership boundaries, unique constraints, enum values, and pgvector queries.

## AI Tests

Validate response schemas, confidence ranges, fallback behavior, no hallucinated wardrobe items, embedding generation, similarity ranking, and recommendation constraints.

## Manual QA Checklist

- Every visible button performs a real action.
- Loading, empty, error, success, and validation states appear correctly.
- Images remain private and signed URLs expire.
- Account deletion removes accessible data.
- Offline and failed AI scenarios are usable.
- Mobile layouts do not overflow.
- Admin data comes from backend APIs only.

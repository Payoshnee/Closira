# Clorisa Free Deployment Guide

This guide is for a placement/demo deployment using free tiers only. The goal is to show Clorisa as a working product without paying for cloud services.

## What We Need To Deploy

| Service | Repo location | Purpose | Free deployment option |
| --- | --- | --- | --- |
| Web app | `apps/web-admin` | Next.js public site and dashboard | Vercel free tier |
| API | `services/api` | NestJS backend, auth, wardrobe, outfits, billing, AI orchestration | Render free web service or Railway free credits if available |
| AI service | `services/ai` | FastAPI local/native AI service | Local demo only, or Render free web service with small model limits |
| Database | `docker-compose.yml` / Prisma | PostgreSQL + pgvector | Supabase free tier or Neon free tier |
| Redis | auth lockout/cache | Redis store | Upstash Redis free tier |
| Image storage | `storage/` local mode | Wardrobe images | Local storage for demo, or Supabase Storage free tier |

## Recommended Free Demo Setup

Use this for placement because it is simple and avoids paid object storage.

1. Deploy the web app to Vercel.
2. Deploy the API to Render free tier.
3. Use Supabase free tier for PostgreSQL.
4. Use Upstash free tier for Redis.
5. Keep `STORAGE_PROVIDER=LOCAL` for local demo, or use Supabase Storage if the hosted API needs persistent uploads.
6. Use Ollama locally for AI during live demo, or configure an external provider key only if free credits are available.

Important: Render free services can sleep when inactive. The first request may be slow.

## Local Demo Deployment

This is the safest demo path when you are presenting from your laptop.

```bash
cp .env.example .env
cp apps/web-admin/.env.example apps/web-admin/.env.local
cp services/api/.env.example services/api/.env
cp services/ai/.env.example services/ai/.env

npm install
./run.sh infra
```

In a second terminal:

```bash
npm --workspace services/api run prisma:generate
npm --workspace services/api run prisma:migrate
npm --workspace services/api run prisma:seed
npm run build
./run.sh all
```

Open:

- Web: `http://localhost:3000`
- API health: `http://localhost:3001/api/v1/health`
- AI service: `http://localhost:8000`

If ports are already used:

```bash
./run.sh stop
./run.sh all
```

## Free Hosted Web App: Vercel

Create a new Vercel project from the GitHub repository.

Settings:

| Setting | Value |
| --- | --- |
| Framework | Next.js |
| Root directory | `apps/web-admin` |
| Install command | `npm install` |
| Build command | `npm run build` |
| Output directory | Next.js default |

Environment variables:

```bash
NEXT_PUBLIC_API_URL=https://YOUR_FREE_API_URL/api/v1
```

After deployment, update API CORS:

```bash
WEB_ORIGIN=https://YOUR_VERCEL_APP.vercel.app
CORS_ORIGINS=https://YOUR_VERCEL_APP.vercel.app
```

## Free Hosted API: Render

Create a Render Web Service from the GitHub repository.

Settings:

| Setting | Value |
| --- | --- |
| Runtime | Node |
| Root directory | repository root |
| Build command | `npm install && npm --workspace services/api run prisma:generate && npm --workspace services/api run build` |
| Start command | `npm --workspace services/api run start` |

Environment variables:

```bash
NODE_ENV=production
PORT=3001
DATABASE_URL=YOUR_SUPABASE_OR_NEON_DATABASE_URL
REDIS_URL=YOUR_UPSTASH_REDIS_URL
JWT_ACCESS_SECRET=GENERATE_A_LONG_RANDOM_SECRET
JWT_REFRESH_SECRET=GENERATE_A_DIFFERENT_LONG_RANDOM_SECRET
WEB_ORIGIN=https://YOUR_VERCEL_APP.vercel.app
CORS_ORIGINS=https://YOUR_VERCEL_APP.vercel.app
AI_SERVICE_URL=http://127.0.0.1:8000
STORAGE_PROVIDER=LOCAL
MAIL_FROM=Clorisa <no-reply@clorisa.local>
DEFAULT_BILLING_GATEWAY=manual
```

For free demo email, keep SMTP empty and show the token flow from logs/database if needed. For a more realistic demo, use a free SMTP sandbox such as Mailtrap free tier.

Run database setup from your machine against the hosted database:

```bash
DATABASE_URL="YOUR_HOSTED_DATABASE_URL" npm --workspace services/api run prisma:migrate
DATABASE_URL="YOUR_HOSTED_DATABASE_URL" npm --workspace services/api run prisma:seed
```

## Free Database: Supabase Or Neon

Use Supabase free tier if you want PostgreSQL plus optional Storage in one place. Use Neon free tier if you only need PostgreSQL.

Required database features:

- PostgreSQL
- `pgvector` extension
- Public connection string for Prisma migrations
- Pooled or direct connection string for API runtime

After creating the database, make sure `pgvector` is enabled. Supabase usually supports this from SQL editor:

```sql
create extension if not exists vector;
```

Then run:

```bash
DATABASE_URL="YOUR_HOSTED_DATABASE_URL" npm --workspace services/api run prisma:migrate
DATABASE_URL="YOUR_HOSTED_DATABASE_URL" npm --workspace services/api run prisma:seed
```

## Free Redis: Upstash

Create an Upstash Redis database on the free tier and copy the Redis URL.

Set this in the API host:

```bash
REDIS_URL=YOUR_UPSTASH_REDIS_URL
```

Use Redis for:

- refresh/session support
- auth lockout
- production-like multi-instance behavior

## Free Image Storage Choices

### Option A: Local Storage

Use this for laptop demos.

```bash
STORAGE_PROVIDER=LOCAL
```

Pros:

- Free
- Simple
- Works without cloud setup

Limits:

- Not persistent on most free hosted API services
- Not shared across multiple API instances
- Not production-grade

### Option B: Supabase Storage Free Tier

Use this if hosted uploads must persist.

Set the storage adapter only after confirming the current API storage code supports the provider you choose. If the API is still using local/S3-style storage only, keep local storage for demo or add a Supabase-compatible adapter before relying on it.

## Free AI Options

### Option A: Local Ollama

Best for placement demos because it avoids API cost.

Install Ollama, pull a local model, then run:

```bash
ollama pull llama3:8b
ollama pull nomic-embed-text:latest

CLORISA_FORCE_AI_PROVIDER=OLLAMA \
OLLAMA_BASE_URL=http://localhost:11434 \
OLLAMA_MODEL=qwen2.5vl:3b \
OLLAMA_API_KEY=your-dybrain-project-token \
OLLAMA_EMBEDDING_MODEL=nomic-embed-text:latest \
./run.sh all
```

Limits:

- Hosted Vercel/Render cannot call your laptop Ollama unless you expose it through a secure tunnel.
- Local models are useful for demos, but quality depends on the model and prompt pipeline.

### Option B: Free Provider Credits

If you have free credits, configure one provider:

```bash
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GEMINI_API_KEY=
AZURE_OPENAI_API_KEY=
CUSTOM_AI_API_KEY=
CUSTOM_AI_BASE_URL=
```

Only add real keys in hosting provider environment variables. Do not commit keys to Git.

## Free Billing Mode

For placement, use manual billing mode:

```bash
DEFAULT_BILLING_GATEWAY=manual
```

This lets the product demonstrate plans, entitlements, and upgrade flows without real money movement.

Do not enable live Stripe/Razorpay unless:

- webhook secrets are configured
- hosted webhook URLs are verified
- test mode checkout is confirmed
- payment failure behavior is tested

## Verification Checklist

Run before demo:

```bash
npm run lint
npm run typecheck
npm run build
npm test
```

Check these URLs:

```bash
curl http://localhost:3001/api/v1/health
curl http://localhost:8000
```

Manual product checks:

- Register a user
- Log in
- Open protected dashboard routes
- Add wardrobe item
- Upload image in local storage mode
- Favorite item
- Mark item worn
- Create outfit
- Add calendar plan
- Ask AI stylist a prompt
- Ask shopping assistant a prompt
- Open billing/settings/profile

## Free Demo Script

1. Open the public site.
2. Register or log in.
3. Add two or three wardrobe items.
4. Upload at least one image.
5. Mark one item as worn.
6. Create an outfit from wardrobe items.
7. Plan it on the calendar.
8. Ask AI stylist: `Create a polished dinner outfit using items I have not worn recently.`
9. Show analytics.
10. Show settings, AI provider connection, and billing plan screen.

## Production Gaps Because This Is Free

Free deployment is good for placement and demos, but it is not full production.

Still needed for real production:

- Paid reliable API hosting
- Persistent object storage with private signed URLs
- Background workers for image processing
- Production SMTP provider
- Real payment provider account
- Error tracking and hosted metrics
- Backups and restore drills
- Security review
- Accessibility audit
- Legal review
- Real brand assets and final product images

## Quick Recommendation

For placement, use:

| Part | Free choice |
| --- | --- |
| Web | Vercel |
| API | Render |
| Database | Supabase |
| Redis | Upstash |
| Storage | Local for laptop demo, Supabase Storage for hosted demo |
| AI | Local Ollama |
| Billing | Manual mode |

This gives you the strongest demo without paying for infrastructure.

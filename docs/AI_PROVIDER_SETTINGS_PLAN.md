# AI Provider Settings Plan

Last updated: 2026-08-25

## Goal

Closira should support a native AI mode and custom user-connected AI providers that can perform the same AI tasks:

- clothing image analysis
- auto-tagging
- image embeddings
- similar item search
- outfit recommendations
- shopping checks
- virtual try-on where supported
- confidence, fallback, and explanation output

## Current Status

Built:

- NestJS API endpoints:
  - `GET /api/v1/ai/settings`
  - `POST /api/v1/ai/settings`
  - `GET /api/v1/ai/recommendations`
  - `POST /api/v1/ai/recommend-outfit`
  - `GET /api/v1/ai/shopping-checks`
  - `POST /api/v1/ai/shopping-check`
  - `GET /api/v1/analytics/wardrobe`
- FastAPI AI service endpoints:
  - `GET /health`
  - `POST /analyze-clothing`
  - `POST /embed-image`
  - `POST /recommend-outfit`
  - `POST /shopping-check`
  - `POST /virtual-try-on`
- Train/evaluate scripts:
  - `services/ai/scripts/train_baseline.py`
  - `services/ai/scripts/evaluate_baseline.py`
- Sample training manifest:
  - `services/ai/data/sample_manifest.jsonl`
- Local baseline artifact:
  - `services/ai/models/closira-baseline.json`
- Frontend AI settings route:
  - `/dashboard/ai-settings`
- Supported provider options in the UI:
  - Closira Native AI
  - ChatGPT / OpenAI
  - Claude / Anthropic
  - Gemini / Google
  - Azure OpenAI
  - Ollama
  - Custom OpenAI-compatible API

## Important Limitation

The current provider settings flow is a real UI and API contract, but credentials are not persisted securely yet. Hosted model SDK calls are not wired yet. The current native AI behavior uses a tiny local baseline model when available and deterministic fallback behavior otherwise. It is suitable as an integration scaffold, not as production AI quality.

## Required Backend Work

- Add database table for encrypted AI provider settings.
- Store API keys server-side only.
- Add provider health checks.
- Add per-provider request adapters.
- Add timeout, retry, and rate-limit handling.
- Add fallback chain:
  1. selected custom provider
  2. Closira native provider
  3. deterministic safe fallback
- Add audit logging for AI tasks.
- Add consent records for image and virtual try-on tasks.

## Required Provider Adapters

### Native Closira AI

- Hosted model endpoint or local model runtime.
- Clothing classifier.
- Tag extractor.
- Embedding model.
- Outfit recommendation model.
- Shopping compatibility model.
- Optional virtual try-on model.

### OpenAI / ChatGPT

- Chat/completion adapter.
- Vision-capable image analysis adapter.
- Embedding adapter.
- Structured JSON output validation.

### Anthropic Claude

- Message adapter.
- Vision analysis adapter where supported.
- Structured response validation.

### Gemini

- Generative model adapter.
- Vision adapter.
- Structured response validation.

### Azure OpenAI

- Azure endpoint configuration.
- Deployment-name mapping.
- API-version handling.

### Ollama

- Local endpoint URL.
- Model selection.
- Timeout warnings for local inference.

### Custom Provider

- OpenAI-compatible base URL.
- API key.
- Model name.
- Capability flags.

## Required Frontend Work

- Add real provider connection testing.
- Add masked connected-state display.
- Add disconnect provider action.
- Add model selection per provider.
- Add capability badges per provider.
- Add privacy warning for third-party providers.
- Add consent prompts for image and try-on tasks.

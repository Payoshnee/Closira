# AI Provider Settings Plan

Last updated: 2026-08-30

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
- Provider-backed API execution:
  - styling recommendations call the active LLM provider for JSON output
  - shopping checks call the active LLM provider for JSON output
  - clothing image analysis sends the wardrobe image to the active vision-capable provider
  - native AI remains the fallback path

## Runtime Provider Environment

Until encrypted user-secret storage is implemented, configure provider keys in staging/prod environment variables:

- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `GEMINI_API_KEY`
- `AZURE_OPENAI_API_KEY`
- `AZURE_OPENAI_CHAT_COMPLETIONS_URL`
- `CUSTOM_AI_API_KEY`
- `CUSTOM_AI_BASE_URL`

Ollama uses `baseUrl` from settings or defaults to `http://localhost:11434`.

## Important Limitation

The current provider settings flow is a real UI and API contract, and hosted LLM HTTP calls are wired for text styling, shopping checks, and clothing image analysis. Credentials are not persisted securely yet; user-entered keys are masked only, so production should rely on environment-backed provider secrets until encryption is implemented. The current native AI behavior uses a tiny local baseline model when available and deterministic fallback behavior otherwise. It is suitable as an integration layer, not as production stylist-model quality.

## Required Backend Work

- Replace masked key storage with real encryption/decryption for AI provider settings.
- Store API keys server-side only, never in browser-readable state.
- Add provider health checks and capability checks.
- Harden per-provider request adapters.
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

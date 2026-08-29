# Closira AI Training

This service now supports a lightweight baseline training path. It is not a production fashion model yet; it is a trainable scaffold that lets Closira move from deterministic placeholders toward measured model behavior.

## Dataset Format

Training data is a JSONL manifest. Each row should describe one wardrobe item:

```json
{"id":"item-1","title":"Ivory linen blazer","description":"Light workwear blazer","material":"linen","pattern":"solid","tags":["office"],"labels":{"category":"Formal Wear","primary_color":"Ivory","occasion":"Office","style":"Minimal"}}
```

Do not include user photos in training unless the user explicitly opted in.

## Train

```bash
PYTHONPATH=services/ai python3 services/ai/scripts/train_baseline.py \
  --dataset services/ai/data/sample_manifest.jsonl \
  --output services/ai/models/closira-baseline.json
```

## Evaluate

```bash
PYTHONPATH=services/ai python3 services/ai/scripts/evaluate_baseline.py \
  --dataset services/ai/data/sample_manifest.jsonl \
  --model services/ai/models/closira-baseline.json
```

## Runtime

Set `CLOSIRA_MODEL_PATH` to load a trained artifact:

```bash
CLOSIRA_MODEL_PATH=services/ai/models/closira-baseline.json \
PYTHONPATH=services/ai python3 -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

If no model artifact exists, the service falls back to deterministic heuristics.


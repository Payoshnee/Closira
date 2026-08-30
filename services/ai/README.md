# Closira AI Training

This service now supports a lightweight baseline training path. It is not a production fashion model yet; it is a trainable scaffold that lets Closira move from deterministic placeholders toward measured model behavior.

## Dataset Format

Training data is a JSONL manifest. Each row should describe one wardrobe item:

```json
{"id":"item-1","title":"Ivory linen blazer","description":"Light workwear blazer","material":"linen","pattern":"solid","tags":["office"],"labels":{"category":"Formal Wear","primary_color":"Ivory","occasion":"Office","style":"Minimal"}}
```

Do not include user photos in training unless the user explicitly opted in.

## Production Dataset Collection

Use only commercial-safe images: user opt-in wardrobe photos, owned catalog/editorial shoots, paid licensed datasets, or individually verified Creative Commons/public-domain assets. Do not train on random scraped fashion images.

Normalize approved data:

```bash
python3 services/ai/scripts/collect_dataset.py \
  --input services/ai/data/raw/licensed-fashion.csv \
  --output services/ai/data/processed/licensed-fashion-manifest.jsonl \
  --download
```

Split the manifest:

```bash
python3 services/ai/scripts/split_dataset.py \
  --manifest services/ai/data/processed/licensed-fashion-manifest.jsonl \
  --output-dir services/ai/data/splits
```

Build 768-dimensional embeddings:

```bash
python3 -m pip install -r services/ai/requirements-embeddings.txt
python3 services/ai/scripts/build_image_embeddings.py \
  --manifest services/ai/data/splits/train.jsonl \
  --output services/ai/data/embeddings/train-openclip.jsonl \
  --provider open_clip
```

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

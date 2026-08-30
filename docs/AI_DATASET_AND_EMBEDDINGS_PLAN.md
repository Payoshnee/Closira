# Closira AI Dataset and Embeddings Plan

Closira must train and evaluate on legally usable fashion data. Do not scrape random product pages or social images for training. Every image row must carry license, source, author, consent, and label metadata before it enters the model pipeline.

## Production Dataset Sources

| Source type | Use | Status | Notes |
| --- | --- | --- | --- |
| User opt-in wardrobe images | Training/evaluation after explicit consent | Preferred | Store consent id, revocation status, and deletion lineage. |
| Owned catalog/editorial shoots | Training/evaluation | Preferred | Best source for commercial launch quality and consistent labels. |
| Paid licensed fashion datasets | Training/evaluation | Preferred | Must keep contract/license proof outside the repo. |
| Verified Creative Commons images | Training/evaluation if license allows commercial use | Allowed with review | Keep license URL, attribution, author, and source URL per image. |
| DeepFashion/DeepFashion2 public research downloads | Research only unless separately licensed | Blocked by default | Treat as non-commercial research data without a commercial license. |
| Random web/social scraping | None | Blocked | Too much copyright, privacy, and brand risk for a market product. |
| LAION-style URL indexes | Discovery only after per-image license verification | Blocked by default | URL metadata is not enough for production training rights. |

## Manifest Contract

Use `services/ai/scripts/collect_dataset.py` to normalize approved rows into JSONL:

```bash
python3 services/ai/scripts/collect_dataset.py \
  --input services/ai/data/raw/licensed-fashion.csv \
  --output services/ai/data/processed/licensed-fashion-manifest.jsonl \
  --download
```

Required source fields: `image_url` or `path`, `license_family`, `labels`.

Recommended fields: `id`, `title`, `description`, `license_url`, `source`, `author`, `consent_id`, `tags`.

Allowed `license_family` values are defined in `services/ai/data/dataset_sources.json`.

## Splits

Create deterministic train/validation/test splits:

```bash
python3 services/ai/scripts/split_dataset.py \
  --manifest services/ai/data/processed/licensed-fashion-manifest.jsonl \
  --output-dir services/ai/data/splits
```

Keep user, shoot, catalog, and near-duplicate leakage out of validation/test before final model evaluation.

## Embeddings

Install the optional embedding stack:

```bash
python3 -m pip install -r services/ai/requirements-embeddings.txt
```

Build 768-dimensional OpenCLIP embeddings:

```bash
python3 services/ai/scripts/build_image_embeddings.py \
  --manifest services/ai/data/splits/train.jsonl \
  --output services/ai/data/embeddings/train-openclip.jsonl \
  --provider open_clip
```

For local development only, use the hash fallback:

```bash
python3 services/ai/scripts/build_image_embeddings.py \
  --manifest services/ai/data/splits/train.jsonl \
  --output services/ai/data/embeddings/train-dev-hash.jsonl \
  --provider hash
```

Runtime `/embed-image` now returns 768 dimensions. Set `CLOSIRA_IMAGE_EMBEDDING_PROVIDER=open_clip` when the AI container includes `requirements-embeddings.txt`; otherwise the service returns a deterministic 768-dimensional dev fallback.

## Evaluation Before Launch

Track at minimum:

- category/top-color/material/style accuracy
- tag precision and recall
- duplicate/similar-item retrieval recall@5 and recall@10
- outfit recommendation human preference rating
- shopping-check duplicate detection precision
- confidence calibration by task and provider
- fairness and failure cases across body types, skin tones, cultures, climates, and modesty preferences

## What Is Still Left

- Acquire enough licensed commercial fashion images and user opt-in images.
- Build label QA tooling and reviewer workflows.
- Add near-duplicate detection before splitting.
- Fine-tune or adapt the vision model beyond OpenCLIP embeddings.
- Store dataset versions, model versions, metrics, and rollback metadata.
- Connect embedding backfills to production storage events and pgvector.

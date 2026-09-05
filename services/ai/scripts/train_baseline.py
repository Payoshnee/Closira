#!/usr/bin/env python3
import argparse
import json
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from app.model_registry import vectorize_text


def main() -> None:
    parser = argparse.ArgumentParser(description="Train Clorisa's lightweight baseline wardrobe classifier.")
    parser.add_argument("--dataset", required=True, help="Path to JSONL dataset manifest.")
    parser.add_argument("--output", default="services/ai/models/clorisa-baseline.json", help="Output model artifact path.")
    args = parser.parse_args()

    rows = read_jsonl(Path(args.dataset))
    if not rows:
        raise SystemExit("Dataset is empty. Add labeled rows before training.")

    grouped: dict[str, dict[str, list[list[float]]]] = {
        "category": defaultdict(list),
        "primary_color": defaultdict(list),
        "occasion": defaultdict(list),
        "style": defaultdict(list),
    }

    for row in rows:
        text = build_text(row)
        features = vectorize_text(text)
        labels = row.get("labels", {})
        for target in grouped:
            label = labels.get(target)
            if label:
                grouped[target][label].append(features)

    artifact = {
        "model_name": "clorisa-baseline",
        "model_type": "text-centroid-baseline",
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "row_count": len(rows),
        "labels": {target: sorted(labels.keys()) for target, labels in grouped.items()},
        "centroids": {
            target: {label: average(vectors) for label, vectors in labels.items()}
            for target, labels in grouped.items()
        },
    }

    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(artifact, indent=2), encoding="utf-8")
    print(f"wrote {output} from {len(rows)} rows")


def read_jsonl(path: Path) -> list[dict[str, Any]]:
    rows = []
    with path.open("r", encoding="utf-8") as file:
        for line_number, line in enumerate(file, start=1):
            if not line.strip():
                continue
            try:
                rows.append(json.loads(line))
            except json.JSONDecodeError as exc:
                raise SystemExit(f"Invalid JSON on line {line_number}: {exc}") from exc
    return rows


def build_text(row: dict[str, Any]) -> str:
    parts = [
        row.get("title", ""),
        row.get("description", ""),
        row.get("brand", ""),
        row.get("material", ""),
        row.get("pattern", ""),
        " ".join(row.get("tags", [])),
    ]
    return " ".join(part for part in parts if part)


def average(vectors: list[list[float]]) -> list[float]:
    width = len(vectors[0])
    return [round(sum(vector[index] for vector in vectors) / len(vectors), 6) for index in range(width)]


if __name__ == "__main__":
    main()


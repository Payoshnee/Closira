#!/usr/bin/env python3
import argparse
import json
from pathlib import Path
from typing import Any

from app.model_registry import BaselineModel


def main() -> None:
    parser = argparse.ArgumentParser(description="Evaluate Clorisa's lightweight baseline wardrobe classifier.")
    parser.add_argument("--dataset", required=True, help="Path to JSONL evaluation manifest.")
    parser.add_argument("--model", default="services/ai/models/clorisa-baseline.json", help="Model artifact path.")
    args = parser.parse_args()

    model = BaselineModel(json.loads(Path(args.model).read_text(encoding="utf-8")))
    rows = read_jsonl(Path(args.dataset))
    targets = ["category", "primary_color", "occasion", "style"]
    scores = {}

    for target in targets:
        total = 0
        correct = 0
        for row in rows:
            expected = row.get("labels", {}).get(target)
            if not expected:
                continue
            predicted, _confidence = model.predict_label(build_text(row), target)
            total += 1
            correct += int(predicted == expected)
        scores[target] = {"correct": correct, "total": total, "accuracy": round(correct / total, 4) if total else None}

    print(json.dumps(scores, indent=2))


def read_jsonl(path: Path) -> list[dict[str, Any]]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def build_text(row: dict[str, Any]) -> str:
    return " ".join(
        part for part in [
            row.get("title", ""),
            row.get("description", ""),
            row.get("brand", ""),
            row.get("material", ""),
            row.get("pattern", ""),
            " ".join(row.get("tags", [])),
        ]
        if part
    )


if __name__ == "__main__":
    main()

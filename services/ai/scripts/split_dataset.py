#!/usr/bin/env python3
import argparse
import hashlib
import json
from pathlib import Path
from typing import Any


def main() -> None:
    parser = argparse.ArgumentParser(description="Create deterministic train/validation/test splits.")
    parser.add_argument("--manifest", required=True)
    parser.add_argument("--output-dir", required=True)
    parser.add_argument("--train", type=float, default=0.8)
    parser.add_argument("--validation", type=float, default=0.1)
    args = parser.parse_args()

    rows = [json.loads(line) for line in Path(args.manifest).read_text(encoding="utf-8").splitlines() if line.strip()]
    splits = {"train": [], "validation": [], "test": []}

    for row in rows:
        bucket = stable_bucket(str(row.get("id") or row.get("sha256") or row.get("path")))
        if bucket < args.train:
            splits["train"].append(row)
        elif bucket < args.train + args.validation:
            splits["validation"].append(row)
        else:
            splits["test"].append(row)

    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    for name, split_rows in splits.items():
        write_jsonl(output_dir / f"{name}.jsonl", split_rows)
        print(f"{name}: {len(split_rows)}")


def stable_bucket(value: str) -> float:
    digest = hashlib.sha256(value.encode("utf-8")).hexdigest()
    return int(digest[:8], 16) / 0xFFFFFFFF


def write_jsonl(path: Path, rows: list[dict[str, Any]]) -> None:
    with path.open("w", encoding="utf-8") as file:
        for row in rows:
            file.write(json.dumps(row, ensure_ascii=False) + "\n")


if __name__ == "__main__":
    main()

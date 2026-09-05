#!/usr/bin/env python3
import argparse
import csv
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import httpx

ALLOWED_LICENSES = {
    "user_opt_in",
    "owned_catalog",
    "paid_commercial_license",
    "cc-by-4.0",
    "cc-by-3.0",
    "cc-by-2.0",
    "cc0",
    "public-domain",
}


def main() -> None:
    parser = argparse.ArgumentParser(description="Collect licensed Clorisa training image manifests.")
    parser.add_argument("--input", required=True, help="CSV or JSONL with image_url,path,license_family,labels fields.")
    parser.add_argument("--output", required=True, help="Output normalized JSONL manifest.")
    parser.add_argument("--image-dir", default="services/ai/data/images", help="Directory for downloaded images.")
    parser.add_argument("--download", action="store_true", help="Download remote image_url assets.")
    parser.add_argument("--max-items", type=int, default=0, help="Optional cap for collection dry runs.")
    args = parser.parse_args()

    rows = read_rows(Path(args.input))
    if args.max_items > 0:
        rows = rows[: args.max_items]

    image_dir = Path(args.image_dir)
    image_dir.mkdir(parents=True, exist_ok=True)
    normalized = []

    for index, row in enumerate(rows, start=1):
        license_family = str(row.get("license_family", "")).strip().lower()
        if license_family not in ALLOWED_LICENSES:
            raise SystemExit(f"Row {index} has unsupported or unsafe license_family: {license_family}")

        image_path = str(row.get("path", "")).strip()
        image_url = str(row.get("image_url", "")).strip()
        if args.download and image_url:
            image_path = download_image(image_url, image_dir)

        if not image_path:
            raise SystemExit(f"Row {index} needs path or image_url with --download.")

        labels = parse_json_field(row.get("labels"), {})
        tags = parse_json_field(row.get("tags"), [])
        normalized.append(
            {
                "id": row.get("id") or hashlib.sha256(f"{image_url}:{image_path}".encode()).hexdigest()[:24],
                "title": row.get("title", ""),
                "description": row.get("description", ""),
                "image_url": image_url,
                "path": image_path,
                "sha256": file_sha256(Path(image_path)) if Path(image_path).exists() else "",
                "license_family": license_family,
                "license_url": row.get("license_url", ""),
                "source": row.get("source", ""),
                "author": row.get("author", ""),
                "consent_id": row.get("consent_id", ""),
                "labels": labels,
                "tags": tags,
                "collected_at": datetime.now(timezone.utc).isoformat(),
            }
        )

    write_jsonl(Path(args.output), normalized)
    print(f"wrote {len(normalized)} licensed rows to {args.output}")


def read_rows(path: Path) -> list[dict[str, Any]]:
    if path.suffix.lower() == ".jsonl":
        return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]

    with path.open("r", encoding="utf-8", newline="") as file:
        return list(csv.DictReader(file))


def download_image(url: str, image_dir: Path) -> str:
    response = httpx.get(url, follow_redirects=True, timeout=30)
    response.raise_for_status()
    content_type = response.headers.get("content-type", "").split(";")[0]
    extension = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp" }.get(content_type, ".img")
    digest = hashlib.sha256(response.content).hexdigest()
    output = image_dir / f"{digest}{extension}"
    output.write_bytes(response.content)
    return str(output)


def parse_json_field(value: Any, default: Any) -> Any:
    if isinstance(value, (dict, list)):
        return value
    if not value:
        return default
    try:
        return json.loads(str(value))
    except json.JSONDecodeError:
        return default


def file_sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as file:
        for chunk in iter(lambda: file.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def write_jsonl(path: Path, rows: list[dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as file:
        for row in rows:
            file.write(json.dumps(row, ensure_ascii=False) + "\n")


if __name__ == "__main__":
    main()

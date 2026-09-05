#!/usr/bin/env python3
import argparse
import hashlib
import json
from pathlib import Path
from typing import Any

import numpy as np
from PIL import Image

EMBEDDING_DIMENSION = 768


def main() -> None:
    parser = argparse.ArgumentParser(description="Build Clorisa image embeddings from a licensed image manifest.")
    parser.add_argument("--manifest", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--provider", choices=["open_clip", "hash"], default="open_clip")
    parser.add_argument("--model", default="ViT-L-14")
    parser.add_argument("--pretrained", default="openai")
    parser.add_argument("--allow-fallback", action="store_true")
    args = parser.parse_args()

    rows = [json.loads(line) for line in Path(args.manifest).read_text(encoding="utf-8").splitlines() if line.strip()]
    embedder = make_embedder(args)
    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)

    with output.open("w", encoding="utf-8") as file:
        for row in rows:
            image_path = Path(row["path"])
            vector = embedder.embed(image_path)
            file.write(
                json.dumps(
                    {
                        "id": row["id"],
                        "path": str(image_path),
                        "sha256": row.get("sha256", ""),
                        "embedding_model": embedder.name,
                        "dimension": len(vector),
                        "embedding": vector,
                        "labels": row.get("labels", {}),
                        "license_family": row.get("license_family", ""),
                    }
                )
                + "\n"
            )

    print(f"wrote {len(rows)} embeddings to {output}")


def make_embedder(args: argparse.Namespace):
    if args.provider == "hash":
        return HashEmbedder()

    try:
        return OpenClipEmbedder(args.model, args.pretrained)
    except Exception as exc:
        if args.allow_fallback:
            print(f"warning: open_clip unavailable, using hash fallback: {exc}")
            return HashEmbedder()
        raise SystemExit(
            "open_clip embedding provider is unavailable. Install services/ai/requirements-embeddings.txt "
            "or pass --provider hash --allow-fallback for local development."
        ) from exc


class OpenClipEmbedder:
    def __init__(self, model_name: str, pretrained: str) -> None:
        import open_clip
        import torch

        self.name = f"open_clip:{model_name}:{pretrained}"
        self.torch = torch
        self.model, _, self.preprocess = open_clip.create_model_and_transforms(model_name, pretrained=pretrained)
        self.model.eval()

    def embed(self, path: Path) -> list[float]:
        image = self.preprocess(Image.open(path).convert("RGB")).unsqueeze(0)
        with self.torch.no_grad():
            features = self.model.encode_image(image)
            features = features / features.norm(dim=-1, keepdim=True)
        vector = features.squeeze(0).cpu().numpy().astype(float)
        if vector.shape[0] != EMBEDDING_DIMENSION:
            vector = resize_vector(vector, EMBEDDING_DIMENSION)
        return [round(float(value), 8) for value in vector.tolist()]


class HashEmbedder:
    name = "local_hash_768_dev_only"

    def embed(self, path: Path) -> list[float]:
        image = Image.open(path).convert("RGB").resize((32, 32))
        digest = hashlib.sha256(path.read_bytes()).digest()
        pixels = np.asarray(image).astype(np.float32).flatten()
        seeded = np.frombuffer((digest * 96)[:EMBEDDING_DIMENSION], dtype=np.uint8).astype(np.float32)
        vector = pixels[:EMBEDDING_DIMENSION] + seeded
        norm = np.linalg.norm(vector) or 1.0
        return [round(float(value), 8) for value in (vector / norm).tolist()]


def resize_vector(vector: np.ndarray, dimension: int) -> np.ndarray:
    if vector.shape[0] > dimension:
        return vector[:dimension]
    return np.pad(vector, (0, dimension - vector.shape[0]))


if __name__ == "__main__":
    main()

import hashlib
import io
import os
import math
from pathlib import Path
from typing import Optional

import httpx

EMBEDDING_DIMENSION = 768


class ImageEmbeddingResult:
    def __init__(self, embedding: list[float], model: str, fallback_used: bool) -> None:
        self.embedding = embedding
        self.model = model
        self.fallback_used = fallback_used


class ImageEmbedder:
    def __init__(self) -> None:
        self.provider = os.getenv("CLOSIRA_IMAGE_EMBEDDING_PROVIDER", "auto").lower()
        self.model_name = os.getenv("CLOSIRA_OPENCLIP_MODEL", "ViT-L-14")
        self.pretrained = os.getenv("CLOSIRA_OPENCLIP_PRETRAINED", "openai")
        self._clip_model = None
        self._clip_preprocess = None
        self._torch = None
        if self.provider in {"auto", "open_clip"}:
            self._load_open_clip()

    def embed(self, item_name: Optional[str], image_url: Optional[str]) -> ImageEmbeddingResult:
        if self._clip_model and image_url:
            try:
                image = self._load_image(image_url)
                return ImageEmbeddingResult(
                    embedding=self._embed_open_clip(image),
                    model=f"open_clip:{self.model_name}:{self.pretrained}",
                    fallback_used=False,
                )
            except Exception:
                if self.provider == "open_clip":
                    raise

        seed = f"{item_name or ''}:{image_url or ''}"
        return ImageEmbeddingResult(
            embedding=stable_text_embedding(seed),
            model="closira-local-hash-embedding-768-dev",
            fallback_used=True,
        )

    def _load_open_clip(self) -> None:
        try:
            import open_clip
            import torch
        except Exception:
            return

        self._torch = torch
        self._clip_model, _, self._clip_preprocess = open_clip.create_model_and_transforms(self.model_name, pretrained=self.pretrained)
        self._clip_model.eval()

    def _load_image(self, image_url: str):
        from PIL import Image

        if image_url.startswith(("http://", "https://")):
            response = httpx.get(image_url, follow_redirects=True, timeout=30)
            response.raise_for_status()
            return Image.open(io.BytesIO(response.content)).convert("RGB")

        path = Path(image_url)
        if path.exists():
            return Image.open(path).convert("RGB")

        raise FileNotFoundError(f"Image source is not readable: {image_url}")

    def _embed_open_clip(self, image) -> list[float]:
        tensor = self._clip_preprocess(image).unsqueeze(0)
        with self._torch.no_grad():
            features = self._clip_model.encode_image(tensor)
            features = features / features.norm(dim=-1, keepdim=True)
        vector = [float(value) for value in features.squeeze(0).cpu().tolist()]
        return normalize_vector(resize_vector(vector, EMBEDDING_DIMENSION))


def stable_text_embedding(seed: str) -> list[float]:
    chunks = []
    counter = 0
    while len(chunks) < EMBEDDING_DIMENSION:
        digest = hashlib.sha256(f"{seed}:{counter}".encode("utf-8")).digest()
        chunks.extend((byte / 127.5) - 1.0 for byte in digest)
        counter += 1
    return normalize_vector(chunks[:EMBEDDING_DIMENSION])


def resize_vector(vector: list[float], dimension: int) -> list[float]:
    if len(vector) > dimension:
        return vector[:dimension]
    return vector + [0.0] * (dimension - len(vector))


def normalize_vector(vector: list[float]) -> list[float]:
    norm = math.sqrt(sum(value * value for value in vector)) or 1.0
    return [round(float(value / norm), 8) for value in vector]

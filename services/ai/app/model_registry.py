import json
import math
import os
from pathlib import Path
from typing import Any, Optional

MODEL_PATH = Path(os.getenv("CLORISA_MODEL_PATH", "services/ai/models/clorisa-baseline.json"))


class BaselineModel:
    def __init__(self, artifact: dict[str, Any]) -> None:
        self.artifact = artifact
        self.labels = artifact.get("labels", {})
        self.centroids = artifact.get("centroids", {})

    @property
    def is_loaded(self) -> bool:
        return bool(self.centroids)

    def predict_label(self, text: str, target: str) -> tuple[str, float]:
        target_centroids = self.centroids.get(target, {})
        if not target_centroids:
            return "unknown", 0.0

        features = vectorize_text(text)
        scored = []
        for label, centroid in target_centroids.items():
            scored.append((label, cosine_similarity(features, centroid)))

        scored.sort(key=lambda item: item[1], reverse=True)
        label, score = scored[0]
        return label, round(max(score, 0.0), 4)


def load_model(path: Optional[Path] = None) -> Optional[BaselineModel]:
    model_path = path or MODEL_PATH
    if not model_path.exists():
        return None

    with model_path.open("r", encoding="utf-8") as file:
        return BaselineModel(json.load(file))


def vectorize_text(text: str) -> list[float]:
    tokens = [token.strip().lower() for token in text.replace("-", " ").replace("_", " ").split() if token.strip()]
    buckets = [0.0] * 32
    for token in tokens:
        index = sum(ord(char) for char in token) % len(buckets)
        buckets[index] += 1.0
    norm = math.sqrt(sum(value * value for value in buckets)) or 1.0
    return [round(value / norm, 6) for value in buckets]


def cosine_similarity(left: list[float], right: list[float]) -> float:
    length = min(len(left), len(right))
    numerator = sum(left[index] * right[index] for index in range(length))
    left_norm = math.sqrt(sum(value * value for value in left)) or 1.0
    right_norm = math.sqrt(sum(value * value for value in right)) or 1.0
    return numerator / (left_norm * right_norm)


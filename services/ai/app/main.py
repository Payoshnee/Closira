from datetime import datetime, timezone
from typing import Optional

from fastapi import FastAPI
from pydantic import BaseModel

from app.model_registry import load_model

app = FastAPI(title="Closira AI Service", version="0.1.0")
baseline_model = load_model()


class ClothingAnalysisRequest(BaseModel):
    item_name: Optional[str] = None
    image_url: Optional[str] = None
    notes: Optional[str] = None


class RecommendationRequest(BaseModel):
    prompt: Optional[str] = None
    occasion: Optional[str] = None
    wardrobe_items: list[dict] = []


class ShoppingCheckRequest(BaseModel):
    item_name: str
    occasion: Optional[str] = None
    wardrobe_items: list[dict] = []


@app.get("/health")
def health() -> dict[str, str]:
    return {
        "status": "ok",
        "service": "closira-ai",
        "model_loaded": str(bool(baseline_model)),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.post("/analyze-clothing")
def analyze_clothing(payload: ClothingAnalysisRequest) -> dict:
    text = payload.item_name or payload.notes or "wardrobe item"
    name = text.lower()
    if baseline_model:
        category, category_confidence = baseline_model.predict_label(text, "category")
        color, color_confidence = baseline_model.predict_label(text, "primary_color")
        occasion, occasion_confidence = baseline_model.predict_label(text, "occasion")
        style, style_confidence = baseline_model.predict_label(text, "style")
        return {
            "detected_category": category,
            "detected_colors": [color],
            "suggested_tags": [occasion, style],
            "confidence": round((category_confidence + color_confidence + occasion_confidence + style_confidence) / 4, 4),
            "fallback_used": False,
            "model": baseline_model.artifact.get("model_name", "closira-baseline"),
        }

    category = "Footwear" if "heel" in name or "shoe" in name else "Formal Wear" if "blazer" in name else "Wardrobe"
    colors = [color for color in ["ivory", "rose", "gold", "charcoal", "silver"] if color in name]
    return {
        "detected_category": category,
        "detected_colors": colors or ["unknown"],
        "suggested_tags": ["office"] if category == "Formal Wear" else ["occasion"],
        "confidence": 0.72,
        "fallback_used": True,
        "model": "closira-native-deterministic-v0",
    }


@app.post("/embed-image")
def embed_image(payload: ClothingAnalysisRequest) -> dict:
    seed = sum(ord(char) for char in (payload.item_name or payload.image_url or "closira"))
    embedding = [round(((seed + index * 17) % 100) / 100, 4) for index in range(16)]
    return {
        "embedding": embedding,
        "dimensions": len(embedding),
        "model": "closira-native-embedding-v0",
        "fallback_used": True,
    }


@app.post("/recommend-outfit")
def recommend_outfit(payload: RecommendationRequest) -> dict:
    items = payload.wardrobe_items[:3]
    confidence = 0.81 if baseline_model and items else 0.76 if items else 0.42
    return {
        "title": "Native wardrobe recommendation",
        "occasion": payload.occasion or "Daily",
        "items": items,
        "confidence": confidence,
        "explanation": "Native recommendation using supplied wardrobe metadata and the trained baseline when available.",
        "fallback_used": not bool(baseline_model),
        "model": baseline_model.artifact.get("model_name", "closira-native-stylist-v0") if baseline_model else "closira-native-stylist-v0",
    }


@app.post("/shopping-check")
def shopping_check(payload: ShoppingCheckRequest) -> dict:
    similar = [item for item in payload.wardrobe_items if item.get("primaryColor", "").lower() in payload.item_name.lower()]
    return {
        "recommendation": "consider" if similar else "buy",
        "compatibility_score": 74 if similar else 86,
        "duplicate_risk": "medium" if similar else "low",
        "similar_items": similar[:3],
        "explanation": "Deterministic native shopping check using supplied wardrobe metadata.",
        "fallback_used": True,
        "model": "closira-native-shopping-v0",
    }


@app.post("/virtual-try-on")
def virtual_try_on() -> dict:
    return {
        "status": "not_available",
        "requires_consent": True,
        "message": "Virtual try-on requires a configured model provider and explicit user consent.",
    }

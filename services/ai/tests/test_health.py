from fastapi.testclient import TestClient

from app.main import app


def test_health() -> None:
    client = TestClient(app)
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json()["status"] == "ok"
    assert response.json()["service"] == "clorisa-ai"


def test_analyze_clothing() -> None:
    client = TestClient(app)
    response = client.post("/analyze-clothing", json={"item_name": "Ivory linen blazer"})

    assert response.status_code == 200
    assert "detected_category" in response.json()
    assert "confidence" in response.json()


def test_embed_image() -> None:
    client = TestClient(app)
    response = client.post("/embed-image", json={"item_name": "Ivory linen blazer"})

    assert response.status_code == 200
    body = response.json()
    assert body["dimensions"] == 768
    assert len(body["embedding"]) == 768

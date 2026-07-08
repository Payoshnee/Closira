from datetime import datetime, timezone

from fastapi import FastAPI

app = FastAPI(title="Closira AI Service", version="0.1.0")


@app.get("/health")
def health() -> dict[str, str]:
    return {
        "status": "ok",
        "service": "closira-ai",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


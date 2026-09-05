"""FastAPI application entrypoint.

Run locally with:
    uvicorn main:app --reload --port 8000
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import auth as auth_service
from database import Base, SessionLocal, engine
from routers import auth as auth_router
from routers import dashboard as dashboard_router


@asynccontextmanager
async def lifespan(_: FastAPI):
    """Create tables and seed the demo user on startup."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        auth_service.seed_demo_user(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="Relay — Email Marketing SaaS API",
    version="0.1.0",
    lifespan=lifespan,
)

# The Vite dev server (frontend) talks to this API on localhost:5173.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(dashboard_router.router)


@app.get("/api/health", tags=["meta"])
def health() -> dict[str, str]:
    """Liveness probe used by the frontend to detect a running backend."""
    return {"status": "ok"}

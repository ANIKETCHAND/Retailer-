"""
RetailVision - FastAPI Application Factory
Provides CORS middleware, error handlers, authentication, store management, and analytics routes.
"""

from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from src.api.routes import analytics, auth, data, forecasting, reports, stores
from src.api.schemas import HealthResponse
from src.core.config import settings
from src.core.exceptions import RetailVisionError
from src.core.logging import logger
from src.db.database import Base, SessionLocal, engine, run_migrations
from src.db.models import Store
from src.db.seed import seed_database


def create_app() -> FastAPI:
    """Creates and configures the FastAPI application instance."""
    # Ensure migrations and tables exist
    run_migrations()
    Base.metadata.create_all(bind=engine)

    # Auto-seed if database is empty
    try:
        db = SessionLocal()
        if db.query(Store).count() == 0:
            logger.info("Initializing database with default retail stores and demo account...")
            seed_database()
        db.close()
    except Exception as e:
        logger.warning(f"Database auto-seed check skipped or failed: {e}")

    app = FastAPI(
        title=f"{settings.APP_NAME} 3D Marketplace Platform API",
        version=settings.APP_VERSION,
        description="Scalable REST API powering the 3D Retail Marketplace, CSV Construction, Analytics & ML Forecasting.",
        docs_url="/docs",
        redoc_url="/redoc"
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.exception_handler(RetailVisionError)
    async def retail_vision_exception_handler(request: Request, exc: RetailVisionError):
        logger.warning(f"Domain exception on {request.url.path}: {exc.message}")
        return JSONResponse(
            status_code=400,
            content={"error": exc.__class__.__name__, "message": exc.message, "details": exc.details}
        )

    @app.get("/health", response_model=HealthResponse, tags=["Health"])
    @app.get("/api/health", response_model=HealthResponse, tags=["Health"])
    @app.get("/api/v1/health", response_model=HealthResponse, tags=["Health"])
    def health_check():
        return HealthResponse(status="ok", version=settings.APP_VERSION, app_name=settings.APP_NAME)

    # Register routers with clean /api and /api/v1 prefixes
    for prefix in ["/api", "/api/v1"]:
        app.include_router(auth.router, prefix=prefix)
        app.include_router(stores.router, prefix=prefix)
        app.include_router(analytics.router, prefix=prefix)
        app.include_router(forecasting.router, prefix=prefix)
        app.include_router(reports.router, prefix=prefix)
        app.include_router(data.router, prefix=prefix)

    # Static frontend assets & SPA index fallback
    dist_dir = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
    if not dist_dir.exists():
        dist_dir = Path("frontend/dist")

    if dist_dir.exists():
        assets_dir = dist_dir / "assets"
        if assets_dir.exists():
            app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

        @app.get("/")
        @app.get("/index.html")
        async def serve_index():
            index_path = dist_dir / "index.html"
            if index_path.exists():
                return FileResponse(str(index_path))
            return JSONResponse(status_code=404, content={"error": "index.html not found"})

    return app


api_app = create_app()

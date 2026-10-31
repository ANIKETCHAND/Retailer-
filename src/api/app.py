"""
RetailVision - FastAPI Application Factory
Provides CORS middleware, error handlers, authentication, store management, and analytics routes.
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from src.api.routes import analytics, auth, data, forecasting, reports, stores
from src.api.schemas import HealthResponse
from src.core.config import settings
from src.core.exceptions import RetailVisionError
from src.core.logging import logger
from src.db.database import Base, SessionLocal, engine
from src.db.models import Store
from src.db.seed import seed_database


def create_app() -> FastAPI:
    """Creates and configures the FastAPI application instance."""
    # Ensure tables exist
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

    return app


api_app = create_app()

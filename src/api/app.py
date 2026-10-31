"""
RetailVision - FastAPI Application Factory
Provides CORS middleware, error handlers, and route aggregation for scalable microservices/APIs.
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from src.api.routes import analytics, data, forecasting, reports
from src.api.schemas import HealthResponse
from src.core.config import settings
from src.core.exceptions import RetailVisionError
from src.core.logging import logger


def create_app() -> FastAPI:
    """Creates and configures the FastAPI application instance."""
    app = FastAPI(
        title=f"{settings.APP_NAME} REST API",
        version=settings.APP_VERSION,
        description="Scalable REST API for retail analytics, machine learning forecasting, and executive reporting.",
        docs_url="/docs",
        redoc_url="/redoc"
    )

    # CORS configuration
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Domain exception handler
    @app.exception_handler(RetailVisionError)
    async def retail_vision_exception_handler(request: Request, exc: RetailVisionError):
        logger.warning(f"Domain exception on {request.url.path}: {exc.message}")
        return JSONResponse(
            status_code=400,
            content={"error": exc.__class__.__name__, "message": exc.message, "details": exc.details}
        )

    # Health check endpoints
    @app.get("/health", response_model=HealthResponse, tags=["Health"])
    @app.get("/api/v1/health", response_model=HealthResponse, tags=["Health"])
    def health_check():
        return HealthResponse(status="ok", version=settings.APP_VERSION, app_name=settings.APP_NAME)

    # Include route sub-routers under /api/v1 prefix
    api_v1_prefix = "/api/v1"
    app.include_router(analytics.router, prefix=api_v1_prefix)
    app.include_router(forecasting.router, prefix=api_v1_prefix)
    app.include_router(reports.router, prefix=api_v1_prefix)
    app.include_router(data.router, prefix=api_v1_prefix)

    return app


api_app = create_app()

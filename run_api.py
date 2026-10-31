"""
RetailVision - REST API Server Entry Point
Launches FastAPI with Uvicorn.
Usage: python run_api.py
"""

import uvicorn
from src.core.config import settings
from src.core.logging import logger

if __name__ == "__main__":
    logger.info(f"Starting {settings.APP_NAME} REST API on http://{settings.APP_HOST}:{settings.API_PORT}")
    logger.info(f"Interactive Swagger Documentation: http://localhost:{settings.API_PORT}/docs")
    uvicorn.run(
        "src.api.app:api_app",
        host=settings.APP_HOST,
        port=settings.API_PORT,
        reload=False
    )

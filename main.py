"""
RetailVision - Main Application Launcher
Runs FastAPI backend server with Uvicorn.
Usage:
    python main.py
"""

import sys
from pathlib import Path

# Add project root to sys.path
root_dir = Path(__file__).resolve().parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

import uvicorn
from src.core.config import settings
from src.core.logging import logger

def main():
    logger.info(f"Launching {settings.APP_NAME} on http://{settings.APP_HOST}:{settings.API_PORT}")
    logger.info(f"API Docs available at http://localhost:{settings.API_PORT}/docs")
    uvicorn.run(
        "src.api.app:api_app",
        host=settings.APP_HOST,
        port=settings.API_PORT,
        reload=False
    )

if __name__ == "__main__":
    main()

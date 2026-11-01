"""
RetailVision - Server Module
Provides server application reference and standalone launch capabilities.
Usage:
    python server.py
"""

import sys
from pathlib import Path

# Add project root to sys.path
root_dir = Path(__file__).resolve().parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

import uvicorn
from src.api.app import api_app
from src.core.config import settings
from src.core.logging import logger

app = api_app

if __name__ == "__main__":
    logger.info(f"Starting {settings.APP_NAME} via server.py on http://{settings.APP_HOST}:{settings.API_PORT}")
    uvicorn.run(
        "server:app",
        host=settings.APP_HOST,
        port=settings.API_PORT,
        reload=False
    )

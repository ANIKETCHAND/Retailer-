"""
RetailVision - Centralized Logging Configuration
Provides unified logging formatting and level management.
"""

import logging
import sys
from src.core.config import settings

def setup_logger(name: str = "retailvision") -> logging.Logger:
    """Configures and returns a standardized logger."""
    logger = logging.getLogger(name)

    if not logger.handlers:
        logger.setLevel(getattr(logging, settings.LOG_LEVEL, logging.INFO))

        handler = logging.StreamHandler(sys.stdout)
        handler.setLevel(getattr(logging, settings.LOG_LEVEL, logging.INFO))

        formatter = logging.Formatter(
            fmt="[%(asctime)s] [%(levelname)s] [%(name)s]: %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S"
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)

    return logger

logger = setup_logger()

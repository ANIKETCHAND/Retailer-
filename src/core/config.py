"""
RetailVision - Core Configuration Module
Centralizes environment configuration, paths, defaults, and feature flags.
Decouples environment variables from business logic.
"""

import os
from pathlib import Path
from typing import Literal

# Base directory paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "data"
DEFAULT_DATASET_PATH = DATA_DIR / "retail_sales.csv"
REPORTS_DIR = BASE_DIR / "reports"
ASSETS_DIR = BASE_DIR / "assets"

# Ensure runtime directories exist
DATA_DIR.mkdir(parents=True, exist_ok=True)
REPORTS_DIR.mkdir(parents=True, exist_ok=True)
ASSETS_DIR.mkdir(parents=True, exist_ok=True)


class Settings:
    """Application runtime settings with environment variable fallbacks."""

    APP_NAME: str = os.getenv("APP_NAME", "RetailVision")
    APP_VERSION: str = "2.0.0"
    APP_ENV: Literal["development", "production", "testing"] = os.getenv("APP_ENV", "development")  # type: ignore

    # Server configuration
    APP_HOST: str = os.getenv("APP_HOST", "0.0.0.0")
    APP_PORT: int = int(os.getenv("APP_PORT", "8501"))
    API_PORT: int = int(os.getenv("API_PORT", "8000"))

    # Logging configuration
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO").upper()

    # Paths
    BASE_DIR: Path = BASE_DIR
    DATA_DIR: Path = DATA_DIR
    DEFAULT_DATASET_PATH: Path = DEFAULT_DATASET_PATH
    REPORTS_DIR: Path = REPORTS_DIR
    ASSETS_DIR: Path = ASSETS_DIR

    # UI Defaults
    DEFAULT_THEME: str = os.getenv("DEFAULT_THEME", "dark").lower()

    # Machine Learning & Forecasting Defaults
    FORECAST_DEFAULT_HORIZON: int = int(os.getenv("FORECAST_DEFAULT_HORIZON", "30"))
    FORECAST_MIN_DAYS_REQUIRED: int = int(os.getenv("FORECAST_MIN_DAYS_REQUIRED", "20"))
    FORECAST_TEST_RATIO: float = float(os.getenv("FORECAST_TEST_RATIO", "0.15"))
    FORECAST_RIDGE_ALPHA: float = float(os.getenv("FORECAST_RIDGE_ALPHA", "1.0"))

    # Safety limits
    MAX_UPLOAD_SIZE_MB: int = int(os.getenv("MAX_UPLOAD_SIZE_MB", "50"))


settings = Settings()

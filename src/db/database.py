"""
RetailVision - Database Configuration & Connection Engine
Supports Supabase PostgreSQL as primary production cloud database,
with automatic fallback to isolated SQLite for local development and offline testing.
"""

import os
from pathlib import Path
import sqlite3
from typing import Any, Optional
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker
from src.core.config import settings
from src.core.logging import logger

try:
    from supabase import Client, create_client
    _SUPABASE_SDK_AVAILABLE = True
except ImportError:
    _SUPABASE_SDK_AVAILABLE = False
    Client = None

DB_PATH = settings.DATA_DIR / "retailvision.db"

# 1. Determine Database URL
# If Supabase / PostgreSQL DATABASE_URL is provided, use PostgreSQL; otherwise fallback to local SQLite
raw_db_url = settings.DATABASE_URL

if raw_db_url and raw_db_url.strip():
    # SQLAlchemy 2.0 requires postgresql:// instead of postgres://
    if raw_db_url.startswith("postgres://"):
        raw_db_url = raw_db_url.replace("postgres://", "postgresql://", 1)
    SQLALCHEMY_DATABASE_URL = raw_db_url
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20
    )
    logger.info("Database configured: Connected to PostgreSQL / Supabase")
else:
    SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        connect_args={"check_same_thread": False}
    )
    logger.info(f"Database configured: Connected to local SQLite ({DB_PATH.name})")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def is_postgres() -> bool:
    """Returns True if the active database is PostgreSQL (e.g. Supabase)."""
    return engine.dialect.name == "postgresql"


_supabase_instance: Optional[Any] = None


def get_supabase_client() -> Optional[Any]:  # type: ignore
    """Initializes and returns authenticated Supabase Python Client (singleton)."""
    global _supabase_instance
    if _supabase_instance is not None:
        return _supabase_instance
    if not _SUPABASE_SDK_AVAILABLE:
        return None
    url = settings.SUPABASE_URL
    key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_ANON_KEY
    if url and key:
        try:
            _supabase_instance = create_client(url, key)
            return _supabase_instance
        except Exception as e:
            logger.warning(f"Could not initialize Supabase Python SDK client: {e}")
            return None
    return None


def run_migrations():
    """
    Applies schema synchronization.
    For SQLite: checks and applies missing column migrations for stores and plots.
    For PostgreSQL: creates missing tables and verifies schema connectivity.
    """
    # Create all defined models in Base metadata
    Base.metadata.create_all(bind=engine)

    if not is_postgres() and DB_PATH.exists():
        try:
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()

            # Check existing columns in stores
            cursor.execute("PRAGMA table_info(stores)")
            existing_cols = {row[1] for row in cursor.fetchall()}

            if existing_cols:
                # Add columns if missing
                col_defs = [
                    ("dataset_id", "VARCHAR(100)"),
                    ("district_id", "VARCHAR(50) DEFAULT 'district_1'"),
                    ("district_name", "VARCHAR(100) DEFAULT 'Central Commercial Plaza'"),
                    ("construction_status", "VARCHAR(30) DEFAULT 'completed'"),
                    ("store_name", "VARCHAR(100)"),
                    ("building_position_x", "FLOAT DEFAULT 0.0"),
                    ("building_position_z", "FLOAT DEFAULT 0.0"),
                    ("status", "VARCHAR(30) DEFAULT 'completed'"),
                    ("updated_at", "DATETIME")
                ]
                for col_name, col_type in col_defs:
                    if col_name not in existing_cols:
                        cursor.execute(f"ALTER TABLE stores ADD COLUMN {col_name} {col_type}")

                # Sync store_name, building_position_x, building_position_z, status
                if "name" in existing_cols:
                    cursor.execute("UPDATE stores SET store_name = name WHERE store_name IS NULL")
                if "grid_x" in existing_cols:
                    cursor.execute("UPDATE stores SET building_position_x = grid_x WHERE building_position_x IS NULL OR building_position_x = 0.0")
                if "grid_z" in existing_cols:
                    cursor.execute("UPDATE stores SET building_position_z = grid_z WHERE building_position_z IS NULL OR building_position_z = 0.0")
                if "construction_status" in existing_cols:
                    cursor.execute("UPDATE stores SET status = construction_status WHERE status IS NULL")

            # Check existing columns in construction_plots
            cursor.execute("PRAGMA table_info(construction_plots)")
            plot_cols = {row[1] for row in cursor.fetchall()}
            if plot_cols:
                plot_defs = [
                    ("position_x", "FLOAT DEFAULT 0.0"),
                    ("position_z", "FLOAT DEFAULT 0.0"),
                    ("status", "VARCHAR(30) DEFAULT 'available'"),
                    ("associated_store_id", "VARCHAR(100)")
                ]
                for col_name, col_type in plot_defs:
                    if col_name not in plot_cols:
                        cursor.execute(f"ALTER TABLE construction_plots ADD COLUMN {col_name} {col_type}")

                if "grid_x" in plot_cols:
                    cursor.execute("UPDATE construction_plots SET position_x = grid_x WHERE position_x IS NULL OR position_x = 0.0")
                if "grid_z" in plot_cols:
                    cursor.execute("UPDATE construction_plots SET position_z = grid_z WHERE position_z IS NULL OR position_z = 0.0")
                if "store_id" in plot_cols:
                    cursor.execute("UPDATE construction_plots SET associated_store_id = store_id WHERE associated_store_id IS NULL")

            conn.commit()
            conn.close()
        except Exception as e:
            logger.info(f"SQLite migration notice: {e}")


def get_db():
    """Dependency injection helper for FastAPI routes."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

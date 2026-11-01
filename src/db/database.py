"""
RetailVision - Database Configuration
SQLite engine, session factory, schema migration, and dependency injection for SQLAlchemy.
"""

from pathlib import Path
import sqlite3
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from src.core.config import settings

DB_PATH = settings.DATA_DIR / "retailvision.db"
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def run_migrations():
    """Applies lightweight SQLite column migrations if columns are missing."""
    if not DB_PATH.exists():
        return
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        # Check existing columns in stores
        cursor.execute("PRAGMA table_info(stores)")
        existing_cols = {row[1] for row in cursor.fetchall()}

        if existing_cols:
            if "dataset_id" not in existing_cols:
                cursor.execute("ALTER TABLE stores ADD COLUMN dataset_id VARCHAR(100)")
            if "district_id" not in existing_cols:
                cursor.execute("ALTER TABLE stores ADD COLUMN district_id VARCHAR(50) DEFAULT 'district_1'")
            if "district_name" not in existing_cols:
                cursor.execute("ALTER TABLE stores ADD COLUMN district_name VARCHAR(100) DEFAULT 'Central Commercial Plaza'")
            if "construction_status" not in existing_cols:
                cursor.execute("ALTER TABLE stores ADD COLUMN construction_status VARCHAR(30) DEFAULT 'completed'")
            conn.commit()

        conn.close()
    except Exception as e:
        print(f"Migration notice: {e}")


def get_db():
    """Dependency injection helper for FastAPI routes."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

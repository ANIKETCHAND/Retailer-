"""
RetailVision - Migration Runner
Applies versioned SQL migrations to PostgreSQL (Supabase) or runs SQLite schema sync.
Usage:
    python migrations/run_migrations.py
"""

from pathlib import Path
import sys

# Ensure root directory in path
root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from sqlalchemy import text
from src.core.config import settings
from src.core.logging import logger
from src.db.database import engine, is_postgres, run_migrations as run_local_migrations

MIGRATIONS_DIR = Path(__file__).resolve().parent


def apply_sql_migration(sql_file_path: Path):
    """Executes SQL migration script against active PostgreSQL engine."""
    logger.info(f"Applying migration: {sql_file_path.name} to {engine.url.database}...")
    with open(sql_file_path, "r", encoding="utf-8") as f:
        sql_content = f.read()

    # Split statements by semicolon while ignoring comments
    statements = [stmt.strip() for stmt in sql_content.split(";") if stmt.strip()]

    with engine.connect() as conn:
        with conn.begin():
            for stmt in statements:
                if stmt:
                    conn.execute(text(stmt))
    logger.info(f"Successfully applied {sql_file_path.name}")


def main():
    if is_postgres():
        logger.info(f"Detected PostgreSQL connection ({settings.DATABASE_URL[:25]}...)")
        sql_files = sorted(MIGRATIONS_DIR.glob("*.sql"))
        for sql_file in sql_files:
            try:
                apply_sql_migration(sql_file)
            except Exception as e:
                logger.error(f"Migration error on {sql_file.name}: {e}")
                raise
    else:
        logger.info("Local SQLite environment detected. Executing SQLite schema synchronization...")
        run_local_migrations()
        logger.info("SQLite schema synchronization complete.")


if __name__ == "__main__":
    main()

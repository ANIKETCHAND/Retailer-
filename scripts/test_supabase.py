"""
RetailVision - Supabase Connection Verifier
Tests connection to Supabase via SQLAlchemy PostgreSQL engine.
Run with: python scripts/test_supabase.py
"""

import os
import sys
from pathlib import Path

# Add project root to sys.path
root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from src.db.database import engine, Base, SessionLocal
from src.db.models import Store, User
from sqlalchemy import text


def verify_connection():
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("[!] No DATABASE_URL found in environment variables.")
        print("[i] Using local SQLite database.")
        print(f"    Engine: {engine.url}")
    else:
        print(f"[+] Found DATABASE_URL: {engine.url.render_as_string(hide_password=True)}")

    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1;")).scalar()
            print(f"[OK] Database connection successful! (Ping test: {result})")

        # Create schema if not exists
        Base.metadata.create_all(bind=engine)
        print("[OK] SQLAlchemy schema verified/created successfully.")

        db = SessionLocal()
        count = db.query(Store).count()
        print(f"[OK] Current stores count in database: {count}")
        db.close()

    except Exception as e:
        print(f"[ERROR] Database connection failed: {e}")
        return False

    return True


if __name__ == "__main__":
    verify_connection()

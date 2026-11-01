"""
RetailVision - Supabase Storage & File Management Service
Handles CSV dataset uploads, PDF reports storage, path sanitization,
and automatic fallback to local persistent filesystem when operating offline.
"""

from io import BytesIO
import os
from pathlib import Path
import re
from typing import Any, Optional, Union
from src.core.config import settings
from src.core.logging import logger

try:
    from supabase import Client, create_client
    _SUPABASE_AVAILABLE = True
except ImportError:
    _SUPABASE_AVAILABLE = False
    Client = None


def get_supabase_client() -> Optional[Any]:  # type: ignore
    """Initializes and returns authenticated Supabase client if configured."""
    if not _SUPABASE_AVAILABLE:
        return None
    url = settings.SUPABASE_URL
    key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_ANON_KEY
    if url and key:
        try:
            return create_client(url, key)
        except Exception as e:
            logger.warning(f"Could not initialize Supabase client: {e}")
            return None
    return None


def sanitize_filename(filename: str) -> str:
    """
    Sanitizes filenames to prevent directory traversal and special character attacks.
    Extracts base filename and removes illegal characters.
    """
    base_name = Path(filename).name
    # Strip any characters that are not alphanumeric, dot, underscore, or hyphen
    sanitized = re.sub(r"[^\w\.\-]", "_", base_name)
    # Prevent hidden files
    sanitized = sanitized.lstrip(".")
    return sanitized or "dataset.csv"


class StorageService:
    """Manages cloud storage in Supabase with local filesystem fallback."""

    def __init__(self):
        self.supabase = get_supabase_client()
        self.local_upload_dir = settings.DATA_DIR / "uploads"
        self.local_reports_dir = settings.REPORTS_DIR
        self.local_upload_dir.mkdir(parents=True, exist_ok=True)
        self.local_reports_dir.mkdir(parents=True, exist_ok=True)

    def is_cloud_enabled(self) -> bool:
        """Returns True if connected to Supabase Cloud Storage."""
        return self.supabase is not None

    def ensure_buckets(self):
        """Ensures storage buckets exist in Supabase or creates local directories."""
        if not self.supabase:
            self.local_upload_dir.mkdir(parents=True, exist_ok=True)
            self.local_reports_dir.mkdir(parents=True, exist_ok=True)
            return

        for bucket_name in [settings.SUPABASE_STORAGE_BUCKET_DATASETS, settings.SUPABASE_STORAGE_BUCKET_REPORTS]:
            try:
                self.supabase.storage.get_bucket(bucket_name)
            except Exception:
                try:
                    self.supabase.storage.create_bucket(bucket_name, options={"public": False})
                    logger.info(f"Created Supabase Storage bucket: '{bucket_name}'")
                except Exception as e:
                    logger.warning(f"Notice regarding bucket '{bucket_name}': {e}")

    def upload_dataset(
        self,
        store_id: str,
        filename: str,
        file_bytes: bytes,
        content_type: str = "text/csv"
    ) -> str:
        """
        Uploads dataset to Supabase Storage bucket 'retail-datasets' (or local disk fallback).
        Returns the resolved storage path.
        """
        clean_name = sanitize_filename(filename)
        destination_name = f"{store_id}_{clean_name}"

        # 1. Always keep local copy for fast Pandas disk access & offline redundancy
        local_path = self.local_upload_dir / f"{store_id}.csv"
        with open(local_path, "wb") as f:
            f.write(file_bytes)

        # 2. Upload to Supabase Storage if configured
        if self.supabase:
            try:
                bucket = settings.SUPABASE_STORAGE_BUCKET_DATASETS
                storage_path = f"datasets/{destination_name}"
                self.supabase.storage.from_(bucket).upload(
                    path=storage_path,
                    file=file_bytes,
                    file_options={"content-type": content_type, "upsert": "true"}
                )
                logger.info(f"Uploaded dataset to Supabase Storage: {bucket}/{storage_path}")
                return storage_path
            except Exception as e:
                logger.error(f"Failed uploading to Supabase Storage, falling back to local: {e}")

        return str(local_path)

    def upload_report(
        self,
        store_id: str,
        report_bytes: bytes,
        report_type: str = "pdf"
    ) -> str:
        """Uploads generated PDF or CSV report to Supabase Storage or local disk."""
        filename = f"report_{store_id}.{report_type}"
        local_path = self.local_reports_dir / filename
        with open(local_path, "wb") as f:
            f.write(report_bytes)

        if self.supabase:
            try:
                bucket = settings.SUPABASE_STORAGE_BUCKET_REPORTS
                storage_path = f"reports/{filename}"
                content_type = "application/pdf" if report_type == "pdf" else "text/csv"
                self.supabase.storage.from_(bucket).upload(
                    path=storage_path,
                    file=report_bytes,
                    file_options={"content-type": content_type, "upsert": "true"}
                )
                return storage_path
            except Exception as e:
                logger.error(f"Supabase report upload failed: {e}")

        return str(local_path)

    def download_file(self, bucket: str, storage_path: str) -> Optional[bytes]:
        """Downloads file content from Supabase or local storage."""
        if self.supabase and not os.path.isabs(storage_path):
            try:
                return self.supabase.storage.from_(bucket).download(storage_path)
            except Exception as e:
                logger.warning(f"Supabase download failed, checking local filesystem: {e}")

        local_file = Path(storage_path)
        if local_file.exists():
            with open(local_file, "rb") as f:
                return f.read()
        return None

    def delete_dataset(self, store_id: str, storage_path: Optional[str] = None):
        """Deletes dataset from Supabase storage and local uploads."""
        # Remove local file
        local_path = self.local_upload_dir / f"{store_id}.csv"
        if local_path.exists():
            try:
                local_path.unlink()
            except Exception:
                pass

        if self.supabase and storage_path and not os.path.isabs(storage_path):
            try:
                bucket = settings.SUPABASE_STORAGE_BUCKET_DATASETS
                self.supabase.storage.from_(bucket).remove([storage_path])
            except Exception as e:
                logger.warning(f"Supabase storage delete notice: {e}")


storage_service = StorageService()

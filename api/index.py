"""
RetailVision - Vercel Serverless Function Entrypoint
Exposes the FastAPI application to Vercel's Python runtime.
"""

import os
import sys
from pathlib import Path

# Ensure root workspace is on sys.path
root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from src.api.app import create_app

app = create_app()

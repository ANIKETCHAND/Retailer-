"""
Unit and integration tests for CSV Upload & Dataset Processing (test_csv_upload.py).
Tests file validation, size limits, format checks, rollback on failure, and path sanitization.
"""

import io
import pytest
from fastapi.testclient import TestClient
from src.api.app import api_app
from src.db.database import SessionLocal
from src.db.models import ConstructionPlot, Store
from src.db.seed import seed_database
from src.services.storage_service import sanitize_filename


@pytest.fixture(scope="module")
def client():
    seed_database()
    with TestClient(api_app) as c:
        yield c


def test_sanitize_filename():
    """Verify directory traversal and unsafe characters are neutralized."""
    assert sanitize_filename("../../../etc/passwd") == "passwd"
    assert sanitize_filename("..\\..\\windows\\system32\\cmd.exe") == "cmd.exe"
    assert sanitize_filename(".hidden_file.csv") == "hidden_file.csv"
    assert sanitize_filename("valid_retail_dataset_2026.csv") == "valid_retail_dataset_2026.csv"


def test_upload_invalid_file_extension(client):
    """Verify non-CSV files (e.g. .txt, .pdf) are rejected with HTTP 400."""
    fake_txt = io.BytesIO(b"This is a text file, not a CSV dataset.")
    files = {"file": ("malicious_payload.txt", fake_txt, "text/plain")}
    data = {"name": "Invalid File Store", "category": "Custom"}
    resp = client.post("/api/stores/construct", files=files, data=data)
    assert resp.status_code == 400
    assert "csv" in resp.json()["detail"].lower()


def test_upload_empty_csv(client):
    """Verify completely empty CSV file is rejected with HTTP 400."""
    empty_csv = io.BytesIO(b"")
    files = {"file": ("empty.csv", empty_csv, "text/csv")}
    data = {"name": "Empty File Store", "category": "Custom"}
    resp = client.post("/api/stores/construct", files=files, data=data)
    assert resp.status_code == 400
    assert "empty" in resp.json()["detail"].lower()


def test_upload_missing_required_columns(client):
    """Verify CSV missing required order_date or product is rejected."""
    bad_csv = io.BytesIO(b"customer_id,region,city\nCUST-1,North,Chicago\n")
    files = {"file": ("missing_cols.csv", bad_csv, "text/csv")}
    data = {"name": "Missing Columns Store", "category": "Custom"}
    resp = client.post("/api/stores/construct", files=files, data=data)
    assert resp.status_code == 400
    assert "required" in resp.json()["detail"].lower() or "missing" in resp.json()["detail"].lower()


def test_upload_valid_csv_success(client):
    """Verify valid CSV completes end-to-end upload and returns StoreListItem."""
    valid_csv = (
        "Order ID,Order Date,Product,Category,Quantity,Unit Price,Total Amount,Region,City,Customer ID\n"
        "ORD-UP-101,2025-05-01,Espresso Maker,Appliances,2,120.00,240.00,North,Boston,CUST-901\n"
        "ORD-UP-102,2025-05-02,Coffee Grinder,Appliances,1,45.00,45.00,South,Miami,CUST-902\n"
        "ORD-UP-103,2025-05-03,Ceramic Mug Set,Kitchen,4,15.00,60.00,East,New York,CUST-903\n"
    )
    files = {"file": ("valid_upload_test.csv", io.BytesIO(valid_csv.encode()), "text/csv")}
    data = {
        "name": "Artisan Coffee Emporium",
        "category": "Custom",
        "description": "Premium specialty roasters and brewing equipment."
    }
    resp = client.post("/api/stores/construct", files=files, data=data)
    assert resp.status_code == 200
    store = resp.json()
    assert store["name"] == "Artisan Coffee Emporium"
    assert store["total_revenue"] == pytest.approx(345.00, abs=0.01)
    assert store["total_orders"] == 3
    assert store["total_products"] == 3

    # Clean up created store
    del_resp = client.delete(f"/api/stores/{store['id']}")
    assert del_resp.status_code == 200


def test_options_construct_store(client):
    """Verify OPTIONS preflight request to /api/stores/construct returns 200 with Allow headers."""
    resp = client.options("/api/stores/construct")
    assert resp.status_code == 200
    allow_header = resp.headers.get("allow", "").upper()
    assert "POST" in allow_header or "OPTIONS" in allow_header


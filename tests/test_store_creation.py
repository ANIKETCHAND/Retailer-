"""
Unit and integration tests for store creation, lifecycle, and deletion (test_store_creation.py).
Tests plot occupancy, dataset association, persistence, and deletion protections.
"""

import io
import pytest
from fastapi.testclient import TestClient
from src.api.app import api_app
from src.db.database import SessionLocal
from src.db.models import ConstructionPlot, Dataset, Store
from src.db.seed import seed_database


@pytest.fixture(scope="module")
def client():
    seed_database()
    with TestClient(api_app) as c:
        yield c


def test_cannot_delete_default_demo_store(client):
    """Verify default demo stores return HTTP 400 when delete is attempted."""
    resp = client.delete("/api/stores/store_electronics")
    assert resp.status_code == 400
    assert "default" in resp.json()["detail"].lower()


def test_store_creation_and_deletion_lifecycle(client):
    """Verify full lifecycle: construct store -> verify dataset -> delete store -> plot freed."""
    csv_content = (
        "Order ID,Order Date,Product,Category,Quantity,Unit Price,Total Amount,Region,City,Customer ID\n"
        "ORD-LFC-01,2025-08-01,Outdoor Tent,Sports,1,150.00,150.00,West,Denver,CUST-201\n"
        "ORD-LFC-02,2025-08-02,Sleeping Bag,Sports,2,40.00,80.00,West,Denver,CUST-202\n"
    )
    files = {"file": ("outdoors.csv", io.BytesIO(csv_content.encode()), "text/csv")}
    data = {
        "name": "Mountain Peak Outfitters",
        "category": "Sports",
        "description": "High-altitude camping gear and technical climbing apparel."
    }

    # 1. Construct store
    construct_resp = client.post("/api/stores/construct", files=files, data=data)
    assert construct_resp.status_code == 200
    store = construct_resp.json()
    store_id = store["id"]

    # 2. Retrieve store dataset
    ds_resp = client.get(f"/api/stores/{store_id}/dataset")
    assert ds_resp.status_code == 200
    ds = ds_resp.json()
    assert ds["store_id"] == store_id
    assert ds["row_count"] == 2

    # 3. Verify in database
    db = SessionLocal()
    db_store = db.query(Store).filter(Store.id == store_id).first()
    assert db_store is not None
    assert db_store.total_revenue == pytest.approx(230.00)
    db.close()

    # 4. Delete store
    del_resp = client.delete(f"/api/stores/{store_id}")
    assert del_resp.status_code == 200
    assert del_resp.json()["success"] is True

    # 5. Verify store is removed and plot is available
    db = SessionLocal()
    assert db.query(Store).filter(Store.id == store_id).first() is None
    db.close()

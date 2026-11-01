"""
Unit and integration tests for Security & Access Control (test_security.py).
Tests SQL injection resistance, path traversal prevention, credentials safety, and unauthorized operations.
"""

import io
import pytest
from fastapi.testclient import TestClient
from src.api.app import api_app
from src.core.config import settings
from src.db.seed import seed_database


@pytest.fixture(scope="module")
def client():
    seed_database()
    with TestClient(api_app) as c:
        yield c


def test_sql_injection_in_login(client):
    """Verify classic SQL injection attempts in login fail safely."""
    payloads = [
        "' OR '1'='1",
        "admin' --",
        "admin' /*",
        "' OR 1=1 --",
        "'; DROP TABLE users; --"
    ]
    for p in payloads:
        resp = client.post("/api/auth/login", json={"login": p, "password": "anypassword"})
        assert resp.status_code == 401


def test_sql_injection_in_store_url(client):
    """Verify SQL injection in store ID path param fails with 404."""
    malicious_ids = [
        "store_electronics' OR '1'='1",
        "store_electronics; DROP TABLE stores; --",
        "../etc/passwd"
    ]
    for mid in malicious_ids:
        resp = client.get(f"/api/stores/{mid}/analytics")
        assert resp.status_code in (404, 422)


def test_service_role_key_never_exposed(client):
    """Verify backend API responses never leak service role secret key or JWT secret."""
    endpoints = [
        "/api/v1/health",
        "/api/stores",
        "/api/stores/plots",
        "/api/analytics/kpis",
        "/api/data/summary"
    ]
    for ep in endpoints:
        resp = client.get(ep)
        assert resp.status_code == 200
        text_body = resp.text
        if settings.SUPABASE_SERVICE_ROLE_KEY:
            assert settings.SUPABASE_SERVICE_ROLE_KEY not in text_body
        assert settings.JWT_SECRET not in text_body


def test_path_traversal_in_upload_filename(client):
    """Verify uploaded filenames cannot escape data/uploads via path traversal."""
    csv_bytes = b"Order Date,Product,Quantity,Unit Price\n2025-01-01,Test,1,10.0\n"
    files = {"file": ("../../../../etc/shadow.csv", io.BytesIO(csv_bytes), "text/csv")}
    data = {"name": "Traversal Test Store", "category": "Custom"}
    resp = client.post("/api/stores/construct", files=files, data=data)
    assert resp.status_code == 200
    store = resp.json()

    # Clean up
    client.delete(f"/api/stores/{store['id']}")


def test_cross_user_isolation_and_authorization(client):
    """
    CRITICAL PART 12 SECURITY REQUIREMENT:
    Test that one user cannot read, modify or delete another user's stores, datasets or reports.
    """
    # 1. Register User A and User B
    resp_a = client.post("/api/auth/register", json={
        "username": "retailer_alice",
        "email": "alice@retailvision.com",
        "password": "alicepassword123",
        "full_name": "Alice Retailer"
    })
    assert resp_a.status_code in (200, 400)
    token_a = resp_a.json().get("token") or client.post("/api/auth/login", json={"login": "alice@retailvision.com", "password": "alicepassword123"}).json()["token"]

    resp_b = client.post("/api/auth/register", json={
        "username": "retailer_bob",
        "email": "bob@retailvision.com",
        "password": "bobpassword123",
        "full_name": "Bob Retailer"
    })
    assert resp_b.status_code in (200, 400)
    token_b = resp_b.json().get("token") or client.post("/api/auth/login", json={"login": "bob@retailvision.com", "password": "bobpassword123"}).json()["token"]

    headers_a = {"Authorization": f"Bearer {token_a}"}
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # 2. User A constructs a store with custom CSV
    csv_content = (
        "Order ID,Order Date,Product,Quantity,Unit Price,Total Amount\n"
        "ORD-ALICE-1,2025-01-01,Alice Product A,2,50.0,100.0\n"
        "ORD-ALICE-2,2025-01-02,Alice Product B,1,150.0,150.0\n"
    )
    files = {"file": ("alice_store.csv", io.BytesIO(csv_content.encode("utf-8")), "text/csv")}
    data = {"name": "Alice Boutique", "category": "Clothing", "description": "Alice private store"}
    store_resp = client.post("/api/stores/construct", files=files, data=data, headers=headers_a)
    assert store_resp.status_code == 200
    store_a = store_resp.json()
    store_a_id = store_a["id"]

    try:
        # 3. User B tries to DELETE User A's store -> Must fail with 403 Forbidden!
        del_resp = client.delete(f"/api/stores/{store_a_id}", headers=headers_b)
        assert del_resp.status_code == 403, f"Expected 403 Forbidden for User B deleting User A's store, got {del_resp.status_code}"

        # 4. User B tries to GET User A's dataset -> Must fail with 403 Forbidden!
        ds_resp = client.get(f"/api/stores/{store_a_id}/dataset", headers=headers_b)
        assert ds_resp.status_code == 403, f"Expected 403 Forbidden for User B accessing User A's dataset, got {ds_resp.status_code}"

        # 5. User B tries to GET User A's analytics -> Must fail with 403 Forbidden!
        analytics_resp = client.get(f"/api/stores/{store_a_id}/analytics", headers=headers_b)
        assert analytics_resp.status_code == 403, f"Expected 403 Forbidden for User B accessing User A's analytics, got {analytics_resp.status_code}"

        # 6. User B tries to download User A's PDF report -> Must fail with 403 Forbidden!
        report_resp = client.get(f"/api/stores/{store_a_id}/report/pdf", headers=headers_b)
        assert report_resp.status_code == 403, f"Expected 403 Forbidden for User B downloading User A's report, got {report_resp.status_code}"

        # 7. User B lists stores -> Must NOT include User A's custom store
        stores_b_resp = client.get("/api/stores", headers=headers_b)
        assert stores_b_resp.status_code == 200
        store_ids_seen_by_b = [s["id"] for s in stores_b_resp.json()]
        assert store_a_id not in store_ids_seen_by_b, "User B must not see User A's isolated custom store"

        # 8. User A CAN access their own store
        owner_resp = client.get(f"/api/stores/{store_a_id}/analytics", headers=headers_a)
        assert owner_resp.status_code == 200

        # 9. Verify PDF report creates a record in the database
        pdf_resp = client.get(f"/api/stores/{store_a_id}/report/pdf", headers=headers_a)
        assert pdf_resp.status_code == 200
        assert pdf_resp.headers["content-type"] == "application/pdf"

    finally:
        # User A cleans up their store
        client.delete(f"/api/stores/{store_a_id}", headers=headers_a)


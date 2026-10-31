"""
Unit tests for RetailVision REST API endpoints (FastAPI).
Includes authentication, store listing, store analytics, and forecasting.
"""

import pytest
from fastapi.testclient import TestClient
from src.api.app import api_app
from src.db.seed import seed_database


@pytest.fixture(scope="module")
def client():
    seed_database()
    with TestClient(api_app) as c:
        yield c


def test_health_check(client):
    """Verify health endpoint returns status 200 and ok."""
    resp = client.get("/api/v1/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ok"
    assert data["app_name"] == "RetailVision"


def test_auth_login_success(client):
    """Verify admin user can log in with demo credentials."""
    resp = client.post("/api/auth/login", json={
        "login": "admin@retailvision.com",
        "password": "admin123"
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert "token" in data
    assert data["username"] == "admin"


def test_auth_login_invalid(client):
    """Verify invalid password returns HTTP 401."""
    resp = client.post("/api/auth/login", json={
        "login": "admin@retailvision.com",
        "password": "wrongpassword"
    })
    assert resp.status_code == 401


def test_list_stores(client):
    """Verify default stores are listed with 3D coordinates."""
    resp = client.get("/api/stores")
    assert resp.status_code == 200
    stores = resp.json()
    assert len(stores) >= 5
    categories = {s["category"] for s in stores}
    assert "Electronics" in categories
    assert "Grocery" in categories
    assert "Clothing" in categories
    assert "Furniture" in categories
    assert "Accessories" in categories
    # Check 3D positions exist
    assert all("grid_x" in s and "grid_z" in s for s in stores)


def test_store_analytics(client):
    """Verify analytics for a specific store."""
    resp = client.get("/api/stores/store_electronics/analytics")
    assert resp.status_code == 200
    data = resp.json()
    assert data["store"]["id"] == "store_electronics"
    assert data["kpis"]["total_revenue"] > 0
    assert len(data["monthly_trend"]) > 0
    assert len(data["top_products"]) > 0


def test_store_forecast(client):
    """Verify forecasting for a specific store."""
    resp = client.post("/api/stores/store_electronics/forecast", json={"horizon_days": 14})
    assert resp.status_code == 200
    data = resp.json()
    assert data["is_successful"] is True
    assert data["horizon_days"] == 14
    assert len(data["forecast"]) == 14
    assert data["metrics"]["rmse"] > 0


def test_store_pdf_report(client):
    """Verify PDF report download for a specific store."""
    resp = client.get("/api/stores/store_electronics/report/pdf")
    assert resp.status_code == 200
    assert resp.headers["content-type"] == "application/pdf"
    assert resp.content.startswith(b"%PDF-")


def test_store_csv_export(client):
    """Verify CSV download for a specific store."""
    resp = client.get("/api/stores/store_electronics/report/csv")
    assert resp.status_code == 200
    assert "text/csv" in resp.headers["content-type"]
    assert b"order_date" in resp.content.lower()

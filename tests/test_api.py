"""
Unit tests for RetailVision REST API endpoints (FastAPI).
"""

import pytest
from fastapi.testclient import TestClient
from src.api.app import api_app


@pytest.fixture(scope="module")
def client():
    with TestClient(api_app) as c:
        yield c


def test_health_check(client):
    """Verify health endpoint returns status 200 and ok."""
    resp = client.get("/api/v1/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ok"
    assert data["app_name"] == "RetailVision"


def test_analytics_kpis(client):
    """Verify KPI endpoint returns valid executive metrics."""
    resp = client.get("/api/v1/analytics/kpis")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_revenue"] > 0
    assert data["total_orders"] > 0
    assert data["average_order_value"] > 0
    assert data["total_products"] > 0


def test_analytics_monthly(client):
    """Verify monthly aggregation endpoint."""
    resp = client.get("/api/v1/analytics/monthly")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert "revenue" in data[0]
    assert "mom_growth_pct" in data[0]


def test_analytics_categories(client):
    """Verify category breakdown endpoint."""
    resp = client.get("/api/v1/analytics/categories")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) > 0
    assert "category" in data[0]
    assert "revenue_share_pct" in data[0]


def test_analytics_products(client):
    """Verify product rankings endpoint."""
    resp = client.get("/api/v1/analytics/products?top_n=5")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 5
    assert "cumulative_revenue_pct" in data[0]


def test_forecast_predict(client):
    """Verify machine learning forecasting endpoint."""
    resp = client.post("/api/v1/forecast/predict", json={"horizon_days": 14})
    assert resp.status_code == 200
    data = resp.json()
    assert data["is_successful"] is True
    assert data["horizon_days"] == 14
    assert data["total_projected_revenue"] > 0
    assert len(data["forecast"]) == 14
    assert data["metrics"]["rmse"] > 0


def test_reports_pdf(client):
    """Verify PDF report download endpoint returns valid PDF."""
    resp = client.get("/api/v1/reports/pdf")
    assert resp.status_code == 200
    assert resp.headers["content-type"] == "application/pdf"
    assert resp.content.startswith(b"%PDF-")


def test_reports_csv(client):
    """Verify CSV export endpoint."""
    resp = client.get("/api/v1/reports/csv")
    assert resp.status_code == 200
    assert "text/csv" in resp.headers["content-type"]
    assert b"order_date" in resp.content


def test_data_summary(client):
    """Verify dataset diagnostics endpoint."""
    resp = client.get("/api/v1/data/summary")
    assert resp.status_code == 200
    data = resp.json()
    assert data["is_valid"] is True
    assert data["clean_row_count"] > 0
    assert "mapped_columns" in data

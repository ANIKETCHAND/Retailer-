"""
Integration tests for Streamlit application using AppTest framework.
Verifies initial render, navigation, and state consistency.
"""

import os
from pathlib import Path
import pytest
from streamlit.testing.v1 import AppTest

APP_PATH = str(Path(__file__).parent.parent / "app.py")


def test_app_initial_render():
    """Verify app mounts without exceptions and displays Overview Dashboard."""
    at = AppTest.from_file(APP_PATH, default_timeout=30)
    at.run()
    assert not at.exception, f"App threw exception during render: {at.exception}"

    # Verify title
    assert len(at.title) > 0
    assert "Executive Overview Dashboard" in at.title[0].value


def test_app_navigation_to_sales():
    """Verify navigating to Sales Analytics executes cleanly."""
    at = AppTest.from_file(APP_PATH, default_timeout=30)
    at.run()
    assert not at.exception

    # Select Sales Analytics navigation option
    radio = at.sidebar.radio[1]  # Navigation radio
    radio.set_value("Sales Analytics").run()
    assert not at.exception
    assert "Sales Analytics" in at.title[0].value


def test_app_navigation_to_forecasting():
    """Verify navigating to Sales Forecasting executes cleanly."""
    at = AppTest.from_file(APP_PATH, default_timeout=30)
    at.run()
    assert not at.exception

    radio = at.sidebar.radio[1]
    radio.set_value("Sales Forecasting").run()
    assert not at.exception
    assert "Predictive Sales Forecasting" in at.title[0].value


def test_app_navigation_to_data_management():
    """Verify navigating to Data Management executes cleanly."""
    at = AppTest.from_file(APP_PATH, default_timeout=30)
    at.run()
    assert not at.exception

    radio = at.sidebar.radio[1]
    radio.set_value("Data Management").run()
    assert not at.exception
    assert "Data Management" in at.title[0].value


def test_complete_user_journey_e2e():
    """
    CRITICAL END-TO-END ACCEPTANCE TEST:
    LOGIN -> MARKETPLACE -> SELECT STORE -> VIEW ANALYTICS ->
    CONSTRUCT STORE -> UPLOAD CSV -> GENERATE BUILDING ->
    CREATE NEXT PLOT -> VIEW NEW STORE ANALYTICS.
    """
    import io
    from fastapi.testclient import TestClient
    from src.api.app import api_app
    from src.db.seed import seed_database

    seed_database()
    client = TestClient(api_app)

    # 1. LOGIN
    login_resp = client.post("/api/auth/login", json={
        "login": "admin@retailvision.com",
        "password": "admin123"
    })
    assert login_resp.status_code == 200
    token = login_resp.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. MARKETPLACE - Load stores and next available plot
    stores_resp = client.get("/api/stores", headers=headers)
    assert stores_resp.status_code == 200
    stores = stores_resp.json()
    assert len(stores) >= 5

    plot_resp = client.get("/api/stores/plots/next", headers=headers)
    assert plot_resp.status_code == 200
    initial_plot = plot_resp.json()
    assert initial_plot["is_occupied"] is False

    # 3. SELECT STORE - Choose first default store
    selected_store_id = stores[0]["id"]

    # 4. VIEW ANALYTICS - Compute analytics for selected store
    analytics_resp = client.get(f"/api/stores/{selected_store_id}/analytics", headers=headers)
    assert analytics_resp.status_code == 200
    analytics = analytics_resp.json()
    assert analytics["kpis"]["total_revenue"] > 0
    assert len(analytics["monthly_trend"]) > 0

    # 5. CONSTRUCT STORE & UPLOAD CSV
    csv_data = (
        "Order ID,Order Date,Product,Category,Quantity,Unit Price,Total Amount,Region,City,Customer ID\n"
        "ORD-E2E-01,2025-09-01,Omni Headset,Tech,2,75.00,150.00,Central,Austin,CUST-E2E-1\n"
        "ORD-E2E-02,2025-09-02,Wireless Mouse,Tech,3,25.00,75.00,Central,Austin,CUST-E2E-2\n"
    )
    files = {"file": ("omni_tech.csv", io.BytesIO(csv_data.encode()), "text/csv")}
    payload = {
        "name": "Omni Spatial Hardware",
        "category": "Custom",
        "description": "Next-generation mixed reality and spatial interfaces."
    }
    construct_resp = client.post("/api/stores/construct", files=files, data=payload, headers=headers)
    assert construct_resp.status_code == 200
    new_store = construct_resp.json()
    new_store_id = new_store["id"]

    # 6. GENERATE BUILDING - Building placed at plot coordinates
    assert (new_store["grid_x"], new_store["grid_z"]) == (initial_plot["grid_x"], initial_plot["grid_z"])

    # 7. CREATE NEXT PLOT - System has dynamically allocated next plot
    next_plot_resp = client.get("/api/stores/plots/next", headers=headers)
    assert next_plot_resp.status_code == 200
    next_plot = next_plot_resp.json()
    assert next_plot["is_occupied"] is False
    assert (next_plot["grid_x"], next_plot["grid_z"]) != (initial_plot["grid_x"], initial_plot["grid_z"])

    # 8. VIEW NEW STORE ANALYTICS - Compute isolated analytics for new store
    new_analytics_resp = client.get(f"/api/stores/{new_store_id}/analytics", headers=headers)
    assert new_analytics_resp.status_code == 200
    new_analytics = new_analytics_resp.json()
    assert new_analytics["kpis"]["total_revenue"] == pytest.approx(225.00)
    assert new_analytics["kpis"]["total_orders"] == 2
    assert new_analytics["kpis"]["total_products"] == 2

    # Clean up created store
    client.delete(f"/api/stores/{new_store_id}", headers=headers)


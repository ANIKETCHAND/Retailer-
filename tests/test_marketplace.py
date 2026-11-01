"""
Unit and integration tests for 3D Marketplace & Infinite Procedural Expansion (test_marketplace.py).
Tests deterministic coordinates, collision avoidance, district rings, and plot APIs.
"""

import pytest
from fastapi.testclient import TestClient
from src.api.app import api_app
from src.db.seed import seed_database
from src.services.procedural_layout import (
    DISTRICT_DEFINITIONS, find_next_unoccupied_plot, get_plot_definition
)


@pytest.fixture(scope="module")
def client():
    seed_database()
    with TestClient(api_app) as c:
        yield c


def test_plot_definitions_deterministic():
    """Verify plot definitions return deterministic coordinates for standard curated districts."""
    plot_0 = get_plot_definition(0)
    assert plot_0["grid_x"] == -6.5
    assert plot_0["grid_z"] == -6.0
    assert plot_0["district_id"] == "district_1"

    plot_8 = get_plot_definition(8)
    assert plot_8["district_id"] == "district_2"
    assert plot_8["grid_x"] == 31.0
    assert plot_8["grid_z"] == -6.5


def test_infinite_procedural_outer_rings():
    """Verify procedural generation expands infinitely beyond index 40 without crashing."""
    for idx in [40, 55, 75, 120, 500]:
        plot = get_plot_definition(idx)
        assert plot["plot_index"] == idx
        assert "district_id" in plot
        assert "grid_x" in plot and isinstance(plot["grid_x"], float)
        assert "grid_z" in plot and isinstance(plot["grid_z"], float)
        assert "rotation_y" in plot


def test_collision_free_unoccupied_plot_search():
    """Verify find_next_unoccupied_plot skips all occupied coordinates."""
    occupied = [(-6.5, -6.0), (6.5, 6.0), (-6.5, 6.0), (13.5, 6.0), (6.5, -6.0)]
    next_plot = find_next_unoccupied_plot(occupied)
    assert next_plot["plot_index"] == 5
    assert (next_plot["grid_x"], next_plot["grid_z"]) not in occupied


def test_api_get_next_plot(client):
    """Verify /api/stores/plots/next returns available empty plot."""
    resp = client.get("/api/stores/plots/next")
    assert resp.status_code == 200
    plot = resp.json()
    assert plot["is_occupied"] is False
    assert "grid_x" in plot
    assert "grid_z" in plot


def test_api_list_plots(client):
    """Verify /api/stores/plots returns list of all current plots."""
    resp = client.get("/api/stores/plots")
    assert resp.status_code == 200
    plots = resp.json()
    assert len(plots) >= 6
    # Must have at least one unoccupied plot ready
    assert any(p["is_occupied"] is False for p in plots)

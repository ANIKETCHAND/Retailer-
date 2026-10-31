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

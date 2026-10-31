"""
RetailVision - Centralized State Management
Provides typed, encapsulated state access for Streamlit session state,
with fallback memory storage for headless/API/test environments.
"""

from typing import Any, Dict, List, Optional, Tuple
import pandas as pd

# Check if streamlit is in active context
try:
    import streamlit as st
    HAS_STREAMLIT = True
except ImportError:
    HAS_STREAMLIT = False

_FALLBACK_STATE: Dict[str, Any] = {}


class AppStateManager:
    """Manages application state with typed properties and change handlers."""

    DEFAULT_STATE = {
        "theme": "dark",
        "dataset_source": "Built-in Sample",
        "custom_clean_df": None,
        "custom_report": None,
        "active_nav": "Overview Dashboard",
        "selected_categories": ["All"],
        "selected_regions": ["All"],
        "selected_cities": ["All"],
        "date_range": None
    }

    @classmethod
    def _get_store(cls) -> Dict[str, Any]:
        if HAS_STREAMLIT:
            try:
                # Test accessing session_state safely
                return st.session_state
            except Exception:
                return _FALLBACK_STATE
        return _FALLBACK_STATE

    @classmethod
    def initialize(cls) -> None:
        """Initializes default keys in state store."""
        store = cls._get_store()
        for key, default_val in cls.DEFAULT_STATE.items():
            if key not in store:
                store[key] = default_val

    @classmethod
    def get(cls, key: str, default: Any = None) -> Any:
        store = cls._get_store()
        return store.get(key, default)

    @classmethod
    def set(cls, key: str, value: Any) -> None:
        store = cls._get_store()
        store[key] = value

    # Typed State Getters & Setters
    @classmethod
    def get_theme(cls) -> str:
        return cls.get("theme", "dark")

    @classmethod
    def set_theme(cls, theme: str) -> None:
        cls.set("theme", theme.lower())

    @classmethod
    def get_dataset_source(cls) -> str:
        return cls.get("dataset_source", "Built-in Sample")

    @classmethod
    def set_dataset_source(cls, source: str) -> None:
        cls.set("dataset_source", source)

    @classmethod
    def get_custom_df(cls) -> Optional[pd.DataFrame]:
        return cls.get("custom_clean_df", None)

    @classmethod
    def set_custom_df(cls, df: Optional[pd.DataFrame], report: Any = None) -> None:
        cls.set("custom_clean_df", df)
        cls.set("custom_report", report)
        if df is not None:
            cls.set("dataset_source", "Custom Upload")

    @classmethod
    def get_custom_report(cls) -> Any:
        return cls.get("custom_report", None)

    @classmethod
    def get_active_nav(cls) -> str:
        return cls.get("active_nav", "Overview Dashboard")

    @classmethod
    def set_active_nav(cls, nav_item: str) -> None:
        cls.set("active_nav", nav_item)

    @classmethod
    def reset_filters(cls) -> None:
        """Resets all filter dimensions to default 'All'."""
        cls.set("selected_categories", ["All"])
        cls.set("selected_regions", ["All"])
        cls.set("selected_cities", ["All"])
        cls.set("date_range", None)


state_manager = AppStateManager()

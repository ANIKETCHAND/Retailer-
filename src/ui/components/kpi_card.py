"""
RetailVision - Reusable KPI Card Component
Renders sleek, responsive executive KPI metric cards with growth deltas.
"""

from typing import Optional
import streamlit as st


def render_kpi_card(
    title: str,
    value: str,
    growth: Optional[float] = None,
    growth_label: str = "vs prior period"
) -> None:
    """Renders a styled KPI card with period-over-period delta badge."""
    if growth is not None:
        if growth > 0:
            delta_html = f"<div class='kpi-delta-positive'>↑ {growth:+.1f}% {growth_label}</div>"
        elif growth < 0:
            delta_html = f"<div class='kpi-delta-negative'>↓ {growth:+.1f}% {growth_label}</div>"
        else:
            delta_html = f"<div class='kpi-delta-neutral'>— 0.0% {growth_label}</div>"
    else:
        delta_html = "<div class='kpi-delta-neutral'>Historical baseline</div>"

    card_html = f"""
    <div class='kpi-container'>
        <div class='kpi-title'>{title}</div>
        <div class='kpi-value'>{value}</div>
        {delta_html}
    </div>
    """
    st.markdown(card_html, unsafe_allow_html=True)

"""
RetailVision - UI Theme & Style Management
Injects responsive, enterprise CSS for Dark Mode and Light Mode.
"""

import streamlit as st


def inject_custom_styles(theme: str = "dark") -> None:
    """Injects responsive, enterprise-tier CSS for dark and light modes."""
    if theme == "dark":
        bg_main = "#0B0F19"
        card_bg = "#111827"
        border_col = "#1F2937"
        text_primary = "#F9FAFB"
        text_secondary = "#9CA3AF"
        accent_blue = "#3B82F6"
        card_hover = "#162032"
        badge_bg = "#1E293B"
    else:
        bg_main = "#F8FAFC"
        card_bg = "#FFFFFF"
        border_col = "#E2E8F0"
        text_primary = "#0F172A"
        text_secondary = "#64748B"
        accent_blue = "#2563EB"
        card_hover = "#F1F5F9"
        badge_bg = "#F1F5F9"

    css = f"""
    <style>
    .stApp {{
        background-color: {bg_main};
        color: {text_primary};
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }}
    section[data-testid="stSidebar"] {{
        background-color: {card_bg};
        border-right: 1px solid {border_col};
    }}
    .kpi-container {{
        background-color: {card_bg};
        border: 1px solid {border_col};
        border-radius: 10px;
        padding: 16px 18px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.04);
        margin-bottom: 14px;
        transition: transform 0.15s ease, border-color 0.15s ease;
    }}
    .kpi-container:hover {{
        border-color: {accent_blue};
        background-color: {card_hover};
    }}
    .kpi-title {{
        font-size: 0.78rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: {text_secondary};
        margin-bottom: 4px;
    }}
    .kpi-value {{
        font-size: 1.65rem;
        font-weight: 800;
        color: {text_primary};
        line-height: 1.2;
    }}
    .kpi-delta-positive {{
        font-size: 0.78rem;
        font-weight: 600;
        color: #10B981;
        margin-top: 6px;
    }}
    .kpi-delta-negative {{
        font-size: 0.78rem;
        font-weight: 600;
        color: #EF4444;
        margin-top: 6px;
    }}
    .kpi-delta-neutral {{
        font-size: 0.78rem;
        font-weight: 600;
        color: {text_secondary};
        margin-top: 6px;
    }}
    .badge-tag {{
        display: inline-block;
        padding: 3px 8px;
        font-size: 0.72rem;
        font-weight: 600;
        border-radius: 6px;
        background-color: {badge_bg};
        color: {accent_blue};
        border: 1px solid {border_col};
    }}
    div[data-testid="stDataFrame"] {{
        border: 1px solid {border_col};
        border-radius: 8px;
        overflow: hidden;
    }}
    </style>
    """
    st.markdown(css, unsafe_allow_html=True)

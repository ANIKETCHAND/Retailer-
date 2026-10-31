"""
RetailVision - Matplotlib Visualization Engine
Generates publication-quality, modern, responsive Matplotlib figures
with full support for Dark Mode and Light Mode themes.
"""

from typing import Any, Dict, List, Optional
import matplotlib
import matplotlib.dates as mdates
import matplotlib.pyplot as plt
import matplotlib.ticker as ticker
import numpy as np
import pandas as pd

matplotlib.use("Agg")

THEME_CONFIGS = {
    "dark": {
        "fig_bg": "#111827",
        "ax_bg": "#1F2937",
        "text": "#F3F4F6",
        "secondary_text": "#9CA3AF",
        "grid": "#374151",
        "spine": "#4B5563",
        "accent_primary": "#3B82F6",
        "accent_secondary": "#10B981",
        "accent_tertiary": "#8B5CF6",
        "accent_warning": "#F59E0B",
        "accent_danger": "#EF4444",
        "palette": ["#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#EC4899", "#06B6D4", "#F97316", "#84CC16"]
    },
    "light": {
        "fig_bg": "#FFFFFF",
        "ax_bg": "#F8FAFC",
        "text": "#0F172A",
        "secondary_text": "#64748B",
        "grid": "#E2E8F0",
        "spine": "#CBD5E1",
        "accent_primary": "#2563EB",
        "accent_secondary": "#059669",
        "accent_tertiary": "#7C3AED",
        "accent_warning": "#D97706",
        "accent_danger": "#DC2626",
        "palette": ["#2563EB", "#059669", "#7C3AED", "#D97706", "#DB2777", "#0891B2", "#EA580C", "#65A30D"]
    }
}


def _get_theme(theme_name: str = "dark") -> Dict[str, Any]:
    return THEME_CONFIGS.get(theme_name.lower(), THEME_CONFIGS["dark"])


def _apply_base_styling(ax: plt.Axes, fig: plt.Figure, theme_dict: Dict[str, Any], title: str = "", xlabel: str = "", ylabel: str = ""):
    """Applies modern minimalist styling to Matplotlib axes and figure."""
    fig.patch.set_facecolor(theme_dict["fig_bg"])
    ax.set_facecolor(theme_dict["ax_bg"])

    if title:
        ax.set_title(title, fontsize=13, fontweight="bold", pad=14, color=theme_dict["text"], loc="left")
    if xlabel:
        ax.set_xlabel(xlabel, fontsize=10, fontweight="medium", labelpad=8, color=theme_dict["secondary_text"])
    if ylabel:
        ax.set_ylabel(ylabel, fontsize=10, fontweight="medium", labelpad=8, color=theme_dict["secondary_text"])

    ax.tick_params(colors=theme_dict["secondary_text"], labelsize=9)
    ax.grid(True, linestyle="--", alpha=0.5, color=theme_dict["grid"])
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    ax.spines["left"].set_color(theme_dict["spine"])
    ax.spines["bottom"].set_color(theme_dict["spine"])


def currency_fmt(x, pos):
    """Format large currency values compactly ($1.2K, $500, $1.5M)."""
    if abs(x) >= 1e6:
        return f"${x*1e-6:.1f}M"
    elif abs(x) >= 1e3:
        return f"${x*1e-3:.0f}K"
    else:
        return f"${x:.0f}"


def plot_monthly_revenue_trend(monthly_df: pd.DataFrame, theme: str = "dark") -> plt.Figure:
    """Plots monthly revenue trend line with filled gradient area."""
    t = _get_theme(theme)
    fig, ax = plt.subplots(figsize=(9, 4.2), dpi=130)

    if monthly_df.empty:
        _apply_base_styling(ax, fig, t, title="Monthly Revenue Trend (No Data)")
        return fig

    x_labels = monthly_df["month_name"].tolist()
    y_values = monthly_df["revenue"].tolist()
    x_indices = np.arange(len(x_labels))

    ax.plot(
        x_indices, y_values,
        color=t["accent_primary"], linewidth=2.5,
        marker="o", markersize=5, markerfacecolor=t["accent_primary"],
        markeredgecolor=t["fig_bg"], markeredgewidth=1.5,
        label="Monthly Revenue"
    )
    ax.fill_between(x_indices, y_values, alpha=0.15, color=t["accent_primary"])

    if len(y_values) > 0:
        max_idx = int(np.argmax(y_values))
        ax.scatter([max_idx], [y_values[max_idx]], color=t["accent_warning"], s=70, zorder=5)
        ax.annotate(
            f"Peak: ${y_values[max_idx]:,.0f}",
            (max_idx, y_values[max_idx]),
            textcoords="offset points", xytext=(0, 10),
            ha="center", fontsize=8.5, fontweight="bold",
            color=t["accent_warning"]
        )

    _apply_base_styling(ax, fig, t, title="Monthly Revenue Trajectory", xlabel="Billing Month", ylabel="Total Revenue")
    ax.set_xticks(x_indices)
    ax.set_xticklabels(x_labels, rotation=40, ha="right")
    ax.yaxis.set_major_formatter(ticker.FuncFormatter(currency_fmt))
    ax.set_ylim(bottom=0, top=max(y_values) * 1.18 if len(y_values) else 100)

    plt.tight_layout()
    return fig


def plot_category_distribution(cat_df: pd.DataFrame, theme: str = "dark") -> plt.Figure:
    """Plots a donut chart representing category revenue distribution."""
    t = _get_theme(theme)
    fig, ax = plt.subplots(figsize=(5.5, 4.2), dpi=130)
    fig.patch.set_facecolor(t["fig_bg"])
    ax.set_facecolor(t["fig_bg"])

    if cat_df.empty:
        ax.text(0.5, 0.5, "No Category Data", ha="center", va="center", color=t["text"])
        return fig

    labels = cat_df["category"].tolist()
    values = cat_df["revenue"].tolist()
    colors = t["palette"][:len(labels)]

    wedges, texts, autotexts = ax.pie(
        values,
        labels=None,
        autopct="%1.1f%%",
        pctdistance=0.75,
        startangle=140,
        colors=colors,
        wedgeprops=dict(width=0.45, edgecolor=t["fig_bg"], linewidth=2)
    )

    for autotext in autotexts:
        autotext.set_color("#FFFFFF")
        autotext.set_fontsize(8.5)
        autotext.set_fontweight("bold")

    ax.legend(
        wedges, labels,
        title="Categories",
        loc="center left",
        bbox_to_anchor=(1, 0, 0.5, 1),
        facecolor=t["ax_bg"],
        edgecolor=t["spine"],
        labelcolor=t["text"],
        fontsize=8.5
    )

    ax.set_title("Revenue by Product Category", fontsize=12, fontweight="bold", color=t["text"], pad=14, loc="left")
    plt.tight_layout()
    return fig


def plot_regional_sales(reg_df: pd.DataFrame, theme: str = "dark") -> plt.Figure:
    """Plots horizontal bar chart of sales by geographic region."""
    t = _get_theme(theme)
    fig, ax = plt.subplots(figsize=(7, 3.8), dpi=130)

    if reg_df.empty:
        _apply_base_styling(ax, fig, t, title="Regional Sales (No Data)")
        return fig

    df_sorted = reg_df.sort_values(by="revenue", ascending=True)
    regions = df_sorted["region"].tolist()
    revenues = df_sorted["revenue"].tolist()
    y_pos = np.arange(len(regions))

    bars = ax.barh(y_pos, revenues, height=0.55, color=t["accent_primary"], edgecolor=t["spine"], linewidth=0.5)

    for bar in bars:
        width = bar.get_width()
        ax.text(
            width * 1.02, bar.get_y() + bar.get_height() / 2,
            f" ${width:,.0f}",
            va="center", ha="left",
            fontsize=8.5, fontweight="bold", color=t["text"]
        )

    _apply_base_styling(ax, fig, t, title="Revenue by Geographic Region", xlabel="Total Revenue ($)", ylabel="Region")
    ax.set_yticks(y_pos)
    ax.set_yticklabels(regions)
    ax.xaxis.set_major_formatter(ticker.FuncFormatter(currency_fmt))
    ax.set_xlim(0, max(revenues) * 1.25 if len(revenues) else 100)

    plt.tight_layout()
    return fig


def plot_top_products(prod_df: pd.DataFrame, theme: str = "dark", top_n: int = 10) -> plt.Figure:
    """Plots horizontal bar chart of top N products ranked by revenue."""
    t = _get_theme(theme)
    fig, ax = plt.subplots(figsize=(8.5, 4.5), dpi=130)

    if prod_df.empty:
        _apply_base_styling(ax, fig, t, title="Top Products (No Data)")
        return fig

    df_subset = prod_df.head(top_n).sort_values(by="revenue", ascending=True)
    products = [p[:32] + "..." if len(p) > 35 else p for p in df_subset["product"].tolist()]
    revenues = df_subset["revenue"].tolist()
    y_pos = np.arange(len(products))

    bars = ax.barh(y_pos, revenues, height=0.6, color=t["accent_secondary"], edgecolor=t["spine"], linewidth=0.5)

    for bar in bars:
        width = bar.get_width()
        ax.text(
            width * 1.02, bar.get_y() + bar.get_height() / 2,
            f" ${width:,.0f}",
            va="center", ha="left",
            fontsize=8, fontweight="bold", color=t["text"]
        )

    _apply_base_styling(ax, fig, t, title=f"Top {len(products)} Performing Products by Revenue", xlabel="Total Revenue ($)")
    ax.set_yticks(y_pos)
    ax.set_yticklabels(products)
    ax.xaxis.set_major_formatter(ticker.FuncFormatter(currency_fmt))
    ax.set_xlim(0, max(revenues) * 1.22 if len(revenues) else 100)

    plt.tight_layout()
    return fig


def plot_daily_sales_trend(daily_df: pd.DataFrame, theme: str = "dark") -> plt.Figure:
    """Plots daily sales trend with 7-day moving average overlay."""
    t = _get_theme(theme)
    fig, ax = plt.subplots(figsize=(9, 4.2), dpi=130)

    if daily_df.empty:
        _apply_base_styling(ax, fig, t, title="Daily Sales (No Data)")
        return fig

    ax.plot(
        daily_df["date"], daily_df["revenue"],
        color=t["accent_primary"], alpha=0.35, linewidth=1.0,
        label="Daily Revenue"
    )

    if "moving_avg_7d" in daily_df.columns:
        ax.plot(
            daily_df["date"], daily_df["moving_avg_7d"],
            color=t["accent_secondary"], linewidth=2.2,
            label="7-Day Moving Avg"
        )

    _apply_base_styling(ax, fig, t, title="Daily Sales & 7-Day Moving Average", xlabel="Date", ylabel="Revenue ($)")
    ax.xaxis.set_major_formatter(mdates.DateFormatter("%b %Y"))
    ax.xaxis.set_major_locator(mdates.MonthLocator(interval=2 if len(daily_df) > 90 else 1))
    fig.autofmt_xdate(rotation=35, ha="right")
    ax.yaxis.set_major_formatter(ticker.FuncFormatter(currency_fmt))
    ax.legend(facecolor=t["ax_bg"], edgecolor=t["spine"], labelcolor=t["text"], fontsize=8.5, loc="upper left")

    plt.tight_layout()
    return fig


def plot_growth_comparison(monthly_df: pd.DataFrame, theme: str = "dark") -> plt.Figure:
    """Dual-axis chart: Monthly Revenue (Bars) vs Month-over-Month Growth % (Line)."""
    t = _get_theme(theme)
    fig, ax1 = plt.subplots(figsize=(9, 4.2), dpi=130)

    if monthly_df.empty:
        _apply_base_styling(ax1, fig, t, title="Growth Analysis (No Data)")
        return fig

    x_labels = monthly_df["month_name"].tolist()
    x = np.arange(len(x_labels))
    revenues = monthly_df["revenue"].tolist()
    growths = monthly_df["mom_growth_pct"].tolist()

    bars = ax1.bar(x, revenues, width=0.55, color=t["accent_primary"], alpha=0.85, label="Revenue ($)")
    _apply_base_styling(ax1, fig, t, title="Monthly Revenue & MoM Growth Momentum", xlabel="Month", ylabel="Revenue ($)")
    ax1.set_xticks(x)
    ax1.set_xticklabels(x_labels, rotation=40, ha="right")
    ax1.yaxis.set_major_formatter(ticker.FuncFormatter(currency_fmt))
    ax1.set_ylim(0, max(revenues) * 1.25 if len(revenues) else 100)

    ax2 = ax1.twinx()
    ax2.plot(x, growths, color=t["accent_warning"], linewidth=2.2, marker="s", markersize=4.5, label="MoM Growth %")
    ax2.axhline(0, color=t["secondary_text"], linestyle=":", linewidth=0.8, alpha=0.6)
    ax2.set_ylabel("MoM Growth (%)", color=t["accent_warning"], fontsize=9.5, labelpad=8)
    ax2.tick_params(colors=t["accent_warning"], labelsize=8.5)
    ax2.spines["top"].set_visible(False)
    ax2.spines["left"].set_visible(False)
    ax2.spines["right"].set_color(t["spine"])
    ax2.yaxis.set_major_formatter(ticker.PercentFormatter(decimals=0))

    lines1, labels1 = ax1.get_legend_handles_labels()
    lines2, labels2 = ax2.get_legend_handles_labels()
    ax1.legend(lines1 + lines2, labels1 + labels2, facecolor=t["ax_bg"], edgecolor=t["spine"], labelcolor=t["text"], fontsize=8.5, loc="upper left")

    plt.tight_layout()
    return fig


def plot_customer_frequency(freq_df: pd.DataFrame, theme: str = "dark") -> plt.Figure:
    """Plots distribution of customer purchase frequencies."""
    t = _get_theme(theme)
    fig, ax = plt.subplots(figsize=(7, 3.8), dpi=130)

    if freq_df.empty:
        _apply_base_styling(ax, fig, t, title="Purchase Frequency (No Data)")
        return fig

    tiers = freq_df["frequency_tier"].astype(str).tolist()
    counts = freq_df["customer_count"].tolist()
    percentages = freq_df["percentage"].tolist()
    x = np.arange(len(tiers))

    bars = ax.bar(x, counts, width=0.5, color=t["accent_tertiary"], edgecolor=t["spine"], linewidth=0.5)
    for bar, pct in zip(bars, percentages):
        height = bar.get_height()
        ax.text(
            bar.get_x() + bar.get_width() / 2, height + max(counts) * 0.02,
            f"{int(height)}\n({pct:.1f}%)",
            ha="center", va="bottom",
            fontsize=8, fontweight="bold", color=t["text"]
        )

    _apply_base_styling(ax, fig, t, title="Customer Order Frequency Distribution", xlabel="Order Frequency Tier", ylabel="Number of Customers")
    ax.set_xticks(x)
    ax.set_xticklabels(tiers)
    ax.set_ylim(0, max(counts) * 1.25 if len(counts) else 10)

    plt.tight_layout()
    return fig


def plot_repeat_vs_onetime(breakdown_df: pd.DataFrame, theme: str = "dark") -> plt.Figure:
    """Plots donut chart comparing Repeat Customers vs One-Time Customers in revenue."""
    t = _get_theme(theme)
    fig, ax = plt.subplots(figsize=(5.5, 4.0), dpi=130)
    fig.patch.set_facecolor(t["fig_bg"])
    ax.set_facecolor(t["fig_bg"])

    if breakdown_df.empty:
        ax.text(0.5, 0.5, "No Customer Breakdown Data", ha="center", va="center", color=t["text"])
        return fig

    labels = breakdown_df["segment"].tolist()
    values = breakdown_df["total_revenue"].tolist()
    colors = [t["accent_secondary"], t["accent_primary"]]

    wedges, texts, autotexts = ax.pie(
        values,
        labels=None,
        autopct="%1.1f%%",
        pctdistance=0.72,
        startangle=90,
        colors=colors,
        wedgeprops=dict(width=0.45, edgecolor=t["fig_bg"], linewidth=2)
    )

    for autotext in autotexts:
        autotext.set_color("#FFFFFF")
        autotext.set_fontsize(9)
        autotext.set_fontweight("bold")

    ax.legend(
        wedges, [f"{l}: ${v:,.0f}" for l, v in zip(labels, values)],
        title="Customer Revenue Share",
        loc="center left",
        bbox_to_anchor=(1, 0, 0.5, 1),
        facecolor=t["ax_bg"],
        edgecolor=t["spine"],
        labelcolor=t["text"],
        fontsize=8.5
    )

    ax.set_title("Revenue: Repeat vs Single-Order Buyers", fontsize=12, fontweight="bold", color=t["text"], pad=14, loc="left")
    plt.tight_layout()
    return fig


def plot_forecast_results(
    historical_df: pd.DataFrame,
    forecast_df: pd.DataFrame,
    test_actuals_df: Optional[pd.DataFrame] = None,
    test_preds_df: Optional[pd.DataFrame] = None,
    theme: str = "dark"
) -> plt.Figure:
    """Plots historical daily revenue alongside test evaluation and future forecast horizon."""
    t = _get_theme(theme)
    fig, ax = plt.subplots(figsize=(10, 4.8), dpi=130)

    if historical_df.empty:
        _apply_base_styling(ax, fig, t, title="Sales Forecast (No Historical Data)")
        return fig

    ax.plot(
        historical_df["date"], historical_df["revenue"],
        color=t["secondary_text"], alpha=0.55, linewidth=1.2,
        label="Historical Sales"
    )

    if test_actuals_df is not None and not test_actuals_df.empty:
        ax.plot(
            test_actuals_df["date"], test_actuals_df["revenue"],
            color=t["text"], linewidth=1.5,
            label="Actual Test Period Sales"
        )
    if test_preds_df is not None and not test_preds_df.empty:
        ax.plot(
            test_preds_df["date"], test_preds_df["predicted_revenue"],
            color=t["accent_warning"], linestyle="--", linewidth=1.8,
            label="Validation Predictions (Model Fit)"
        )

    if forecast_df is not None and not forecast_df.empty:
        ax.plot(
            forecast_df["date"], forecast_df["forecast_revenue"],
            color=t["accent_primary"], linewidth=2.4, marker="o", markersize=4,
            label="Future Forecast"
        )

        if "lower_bound" in forecast_df.columns and "upper_bound" in forecast_df.columns:
            ax.fill_between(
                forecast_df["date"],
                forecast_df["lower_bound"],
                forecast_df["upper_bound"],
                color=t["accent_primary"], alpha=0.18,
                label="Forecast Confidence Band (±1.5 RMSE)"
            )

    _apply_base_styling(ax, fig, t, title="Historical Sales & Future Revenue Forecast Horizon", xlabel="Date", ylabel="Daily Revenue ($)")
    ax.xaxis.set_major_formatter(mdates.DateFormatter("%b %d, %Y" if len(historical_df) < 180 else "%b %Y"))
    fig.autofmt_xdate(rotation=30, ha="right")
    ax.yaxis.set_major_formatter(ticker.FuncFormatter(currency_fmt))
    ax.set_ylim(bottom=0)
    ax.legend(facecolor=t["ax_bg"], edgecolor=t["spine"], labelcolor=t["text"], fontsize=8.5, loc="upper left")

    plt.tight_layout()
    return fig

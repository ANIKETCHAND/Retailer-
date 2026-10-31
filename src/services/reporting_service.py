"""
RetailVision - Reporting Service (Business Logic)
Compiles ReportLab executive PDF reports and serializes datasets to CSV.
"""

from datetime import datetime
from io import BytesIO
from typing import Dict, List, Optional
import pandas as pd
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.platypus import (
    HRFlowable, PageBreak, Paragraph, SimpleDocTemplate,
    Spacer, Table, TableStyle
)
from src.core.exceptions import ReportGenerationError
from src.services.analytics_service import (
    KPISummary, get_category_sales, get_monthly_sales, get_product_rankings,
    get_regional_sales
)
from src.services.forecasting_service import ForecastResult


def generate_business_insights(
    kpi: KPISummary,
    cat_df: pd.DataFrame,
    reg_df: pd.DataFrame,
    prod_df: pd.DataFrame,
    forecast_res: Optional[ForecastResult] = None
) -> List[str]:
    """Generates automated analytical takeaways from filtered metrics."""
    insights = []
    insights.append(
        f"Generated a total revenue of ${kpi.total_revenue:,.2f} across {kpi.total_orders:,} customer transactions, "
        f"yielding a robust Average Order Value (AOV) of ${kpi.average_order_value:,.2f}."
    )

    if not cat_df.empty:
        top_cat = cat_df.iloc[0]
        insights.append(
            f"The '{top_cat['category']}' category leads portfolio performance, contributing "
            f"${top_cat['revenue']:,.2f} ({top_cat['revenue_share_pct']:.1f}% of total portfolio revenue)."
        )

    if not reg_df.empty:
        top_reg = reg_df.iloc[0]
        insights.append(
            f"Geographically, the {top_reg['region']} market generated the highest commercial demand with "
            f"${top_reg['revenue']:,.2f} in sales ({top_reg['revenue_share_pct']:.1f}% market share)."
        )

    if not prod_df.empty:
        top_prod = prod_df.iloc[0]
        insights.append(
            f"Top individual product: '{top_prod['product']}' achieved ${top_prod['revenue']:,.2f} in sales "
            f"with {int(top_prod['units_sold']):,} units shipped."
        )

    if forecast_res and forecast_res.is_successful and not forecast_res.future_forecast.empty:
        insights.append(
            f"Forward Predictive Outlook: Machine learning regression models project ${forecast_res.total_projected_revenue:,.2f} "
            f"over the next {forecast_res.horizon_days} days (averaging ${forecast_res.daily_avg_projected_revenue:,.2f}/day) "
            f"with an out-of-sample Test RMSE of ${forecast_res.metrics.rmse:,.2f}."
        )

    return insights


def generate_pdf_report(
    df: pd.DataFrame,
    kpi: KPISummary,
    forecast_res: Optional[ForecastResult] = None,
    filter_summary: Optional[Dict[str, str]] = None
) -> bytes:
    """Builds a professional multi-page PDF executive sales report."""
    try:
        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            leftMargin=36,
            rightMargin=36,
            topMargin=36,
            bottomMargin=36
        )

        styles = getSampleStyleSheet()

        header_style = ParagraphStyle(
            "ReportHeader",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=20,
            leading=24,
            textColor=colors.HexColor("#0F172A")
        )

        sub_header_style = ParagraphStyle(
            "ReportSubHeader",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=12,
            leading=16,
            textColor=colors.HexColor("#1E3A8A")
        )

        meta_style = ParagraphStyle(
            "MetaStyle",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=8.5,
            leading=12,
            textColor=colors.HexColor("#64748B")
        )

        body_style = ParagraphStyle(
            "BodyDark",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=8.5,
            leading=12,
            textColor=colors.HexColor("#1E293B")
        )

        table_header_style = ParagraphStyle(
            "TableHeader",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=8.5,
            leading=11,
            textColor=colors.HexColor("#FFFFFF")
        )

        table_cell_style = ParagraphStyle(
            "TableCell",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=8,
            leading=10,
            textColor=colors.HexColor("#1E293B")
        )

        story = []

        # 1. Header Banner
        story.append(Paragraph("RETAILVISION | EXECUTIVE SALES ANALYTICS REPORT", header_style))
        story.append(Spacer(1, 4))
        story.append(Paragraph("Comprehensive Retail Performance, Portfolio Diagnostics & Predictive Intelligence", meta_style))
        story.append(Spacer(1, 6))

        gen_time = datetime.now().strftime("%B %d, %Y - %H:%M:%S")
        date_range_str = filter_summary.get("Date Range", "Full Historical Range") if filter_summary else "Full Historical Range"
        cat_str = filter_summary.get("Categories", "All Categories") if filter_summary else "All Categories"
        reg_str = filter_summary.get("Regions", "All Regions") if filter_summary else "All Regions"

        meta_text = (
            f"<b>Generated:</b> {gen_time} &nbsp;|&nbsp; "
            f"<b>Analysis Period:</b> {date_range_str} &nbsp;|&nbsp; "
            f"<b>Filtered Categories:</b> {cat_str} &nbsp;|&nbsp; "
            f"<b>Regions:</b> {reg_str}"
        )
        story.append(Paragraph(meta_text, meta_style))
        story.append(Spacer(1, 10))
        story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#1E3A8A"), spaceAfter=14))

        # 2. Key Performance Indicators
        story.append(Paragraph("1. Executive Key Performance Indicators", sub_header_style))
        story.append(Spacer(1, 6))

        kpi_data = [
            [
                Paragraph("<b>Total Revenue</b>", table_header_style),
                Paragraph("<b>Total Orders</b>", table_header_style),
                Paragraph("<b>Units Sold</b>", table_header_style),
                Paragraph("<b>Avg Order Value</b>", table_header_style),
                Paragraph("<b>Unique Customers</b>", table_header_style)
            ],
            [
                Paragraph(f"<b>${kpi.total_revenue:,.2f}</b>", body_style),
                Paragraph(f"<b>{kpi.total_orders:,}</b>", body_style),
                Paragraph(f"<b>{kpi.total_units_sold:,}</b>", body_style),
                Paragraph(f"<b>${kpi.average_order_value:,.2f}</b>", body_style),
                Paragraph(f"<b>{kpi.total_customers:,}</b>", body_style)
            ]
        ]

        kpi_table = Table(kpi_data, colWidths=[108] * 5)
        kpi_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1E3A8A")),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ("BACKGROUND", (0, 1), (-1, 1), colors.HexColor("#F8FAFC")),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ]))
        story.append(kpi_table)
        story.append(Spacer(1, 14))

        # 3. Monthly Sales Trajectory
        monthly_df = get_monthly_sales(df)
        if not monthly_df.empty:
            story.append(Paragraph("2. Monthly Sales Performance & Growth Momentum", sub_header_style))
            story.append(Spacer(1, 6))

            recent_monthly = monthly_df.tail(8)
            month_rows = [[
                Paragraph("<b>Month</b>", table_header_style),
                Paragraph("<b>Revenue ($)</b>", table_header_style),
                Paragraph("<b>Orders</b>", table_header_style),
                Paragraph("<b>Units</b>", table_header_style),
                Paragraph("<b>Avg Order ($)</b>", table_header_style),
                Paragraph("<b>MoM Growth (%)</b>", table_header_style)
            ]]

            for _, r in recent_monthly.iterrows():
                growth_color = "#16A34A" if r["mom_growth_pct"] >= 0 else "#DC2626"
                month_rows.append([
                    Paragraph(str(r["month_name"]), table_cell_style),
                    Paragraph(f"${r['revenue']:,.2f}", table_cell_style),
                    Paragraph(f"{int(r['orders']):,}", table_cell_style),
                    Paragraph(f"{int(r['units']):,}", table_cell_style),
                    Paragraph(f"${r['avg_order_value']:,.2f}", table_cell_style),
                    Paragraph(f"<font color='{growth_color}'>{r['mom_growth_pct']:+.1f}%</font>", table_cell_style)
                ])

            m_table = Table(month_rows, colWidths=[90, 95, 80, 80, 95, 100])
            m_table.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0F172A")),
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#FFFFFF"), colors.HexColor("#F8FAFC")]),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ]))
            story.append(m_table)
            story.append(Spacer(1, 14))

        # 4. Product Category Breakdown
        cat_df = get_category_sales(df)
        reg_df = get_regional_sales(df)
        prod_df = get_product_rankings(df, top_n=10)

        if not cat_df.empty:
            story.append(Paragraph("3. Category Revenue Distribution", sub_header_style))
            story.append(Spacer(1, 6))

            cat_rows = [[
                Paragraph("<b>Category</b>", table_header_style),
                Paragraph("<b>Total Revenue</b>", table_header_style),
                Paragraph("<b>Units Sold</b>", table_header_style),
                Paragraph("<b>Orders Count</b>", table_header_style),
                Paragraph("<b>Revenue Share</b>", table_header_style)
            ]]

            for _, r in cat_df.iterrows():
                cat_rows.append([
                    Paragraph(str(r["category"]), table_cell_style),
                    Paragraph(f"${r['revenue']:,.2f}", table_cell_style),
                    Paragraph(f"{int(r['units']):,}", table_cell_style),
                    Paragraph(f"{int(r['orders']):,}", table_cell_style),
                    Paragraph(f"{r['revenue_share_pct']:.1f}%", table_cell_style)
                ])

            c_table = Table(cat_rows, colWidths=[140, 100, 100, 100, 100])
            c_table.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1E3A8A")),
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#FFFFFF"), colors.HexColor("#F8FAFC")]),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ]))
            story.append(c_table)
            story.append(Spacer(1, 14))

        story.append(PageBreak())

        # 5. Top 10 Products
        story.append(Paragraph("4. Top 10 Performing Products Ranking", sub_header_style))
        story.append(Spacer(1, 6))

        prod_rows = [[
            Paragraph("<b>Rank</b>", table_header_style),
            Paragraph("<b>Product Name</b>", table_header_style),
            Paragraph("<b>Category</b>", table_header_style),
            Paragraph("<b>Revenue</b>", table_header_style),
            Paragraph("<b>Units</b>", table_header_style),
            Paragraph("<b>Share %</b>", table_header_style),
            Paragraph("<b>Pareto Cumul %</b>", table_header_style)
        ]]

        for idx, r in prod_df.iterrows():
            prod_rows.append([
                Paragraph(f"#{idx+1}", table_cell_style),
                Paragraph(str(r["product"]), table_cell_style),
                Paragraph(str(r["category"]), table_cell_style),
                Paragraph(f"${r['revenue']:,.2f}", table_cell_style),
                Paragraph(f"{int(r['units_sold']):,}", table_cell_style),
                Paragraph(f"{r['revenue_share_pct']:.1f}%", table_cell_style),
                Paragraph(f"{r['cumulative_revenue_pct']:.1f}%", table_cell_style)
            ])

        p_table = Table(prod_rows, colWidths=[35, 175, 95, 75, 50, 50, 60])
        p_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0F172A")),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#FFFFFF"), colors.HexColor("#F8FAFC")]),
            ("TOPPADDING", (0, 0), (-1, -1), 3.5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3.5),
        ]))
        story.append(p_table)
        story.append(Spacer(1, 14))

        # 6. Regional Performance
        if not reg_df.empty:
            story.append(Paragraph("5. Geographic Regional Performance", sub_header_style))
            story.append(Spacer(1, 6))

            reg_rows = [[
                Paragraph("<b>Region</b>", table_header_style),
                Paragraph("<b>Total Revenue</b>", table_header_style),
                Paragraph("<b>Total Orders</b>", table_header_style),
                Paragraph("<b>Units Sold</b>", table_header_style),
                Paragraph("<b>Regional Share</b>", table_header_style)
            ]]

            for _, r in reg_df.iterrows():
                reg_rows.append([
                    Paragraph(str(r["region"]), table_cell_style),
                    Paragraph(f"${r['revenue']:,.2f}", table_cell_style),
                    Paragraph(f"{int(r['orders']):,}", table_cell_style),
                    Paragraph(f"{int(r['units']):,}", table_cell_style),
                    Paragraph(f"{r['revenue_share_pct']:.1f}%", table_cell_style)
                ])

            r_table = Table(reg_rows, colWidths=[120, 105, 105, 105, 105])
            r_table.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1E3A8A")),
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#FFFFFF"), colors.HexColor("#F8FAFC")]),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ]))
            story.append(r_table)
            story.append(Spacer(1, 14))

        # 7. Predictive Sales Forecasting
        if forecast_res and forecast_res.is_successful and forecast_res.metrics:
            m = forecast_res.metrics
            story.append(Paragraph(f"6. Sales Forecast & Predictive Model Evaluation ({forecast_res.horizon_days}-Day Horizon)", sub_header_style))
            story.append(Spacer(1, 6))

            f_rows = [
                [
                    Paragraph("<b>Forecast Horizon</b>", table_header_style),
                    Paragraph("<b>Projected Revenue</b>", table_header_style),
                    Paragraph("<b>Daily Avg Run-Rate</b>", table_header_style),
                    Paragraph("<b>Out-of-Sample MAE</b>", table_header_style),
                    Paragraph("<b>Out-of-Sample RMSE</b>", table_header_style),
                    Paragraph("<b>Test MAPE</b>", table_header_style)
                ],
                [
                    Paragraph(f"<b>{forecast_res.horizon_days} Days</b>", table_cell_style),
                    Paragraph(f"<b>${forecast_res.total_projected_revenue:,.2f}</b>", table_cell_style),
                    Paragraph(f"<b>${forecast_res.daily_avg_projected_revenue:,.2f}</b>", table_cell_style),
                    Paragraph(f"${m.mae:,.2f}", table_cell_style),
                    Paragraph(f"${m.rmse:,.2f}", table_cell_style),
                    Paragraph(f"{m.mape:.1f}%", table_cell_style)
                ]
            ]

            f_table = Table(f_rows, colWidths=[90, 95, 95, 85, 85, 90])
            f_table.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0F172A")),
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
                ("BACKGROUND", (0, 1), (-1, 1), colors.HexColor("#F8FAFC")),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ]))
            story.append(f_table)
            story.append(Spacer(1, 14))

        # 8. Strategic Business Insights
        story.append(Paragraph("7. Strategic Business Insights & Executive Takeaways", sub_header_style))
        story.append(Spacer(1, 6))

        insights = generate_business_insights(kpi, cat_df, reg_df, prod_df, forecast_res)
        for idx, ins in enumerate(insights, 1):
            story.append(Paragraph(f"<b>{idx}.</b> {ins}", body_style))
            story.append(Spacer(1, 4))

        story.append(Spacer(1, 10))
        story.append(HRFlowable(width="100%", thickness=1.0, color=colors.HexColor("#CBD5E1"), spaceAfter=8))
        story.append(Paragraph(
            "<i>RetailVision Analytics Report - Generated for Academic Mini-Project Demonstration. All synthetic datasets are strictly labeled.</i>",
            meta_style
        ))

        doc.build(story)
        pdf_bytes = buffer.getvalue()
        buffer.close()
        return pdf_bytes
    except Exception as e:
        raise ReportGenerationError(f"Failed to compile PDF report: {str(e)}")


def export_dataframe_to_csv(df: pd.DataFrame) -> bytes:
    """Converts a pandas DataFrame to UTF-8 CSV bytes."""
    if df is None or df.empty:
        return b""
    return df.to_csv(index=False).encode("utf-8")

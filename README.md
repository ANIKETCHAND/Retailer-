# RetailVision – Advanced Retail Sales Analytics & Predictive Intelligence Platform

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![Streamlit](https://img.shields.io/badge/Streamlit-1.40%2B-FF4B4B.svg)](https://streamlit.io/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.119%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![Pandas](https://img.shields.io/badge/Pandas-2.0%2B-150458.svg)](https://pandas.pydata.org/)
[![Matplotlib](https://img.shields.io/badge/Matplotlib-3.8%2B-11557c.svg)](https://matplotlib.org/)
[![Scikit--Learn](https://img.shields.io/badge/Scikit--Learn-1.3%2B-F7931E.svg)](https://scikit-learn.org/)
[![ReportLab](https://img.shields.io/badge/ReportLab-4.0%2B-D0021B.svg)](https://www.reportlab.com/)
[![Tests](https://img.shields.io/badge/Tests-34%20Passing-success.svg)](https://docs.pytest.org/)

An enterprise-grade, full-stack Retail Sales & Business Intelligence platform designed with a clean **N-Tier Architecture**: decoupling presentation (Streamlit), REST APIs (FastAPI), domain services, state management, and configuration.

GitHub Repository: [https://github.com/ANIKETCHAND/Retailer-](https://github.com/ANIKETCHAND/Retailer-)

---

## 📑 Table of Contents

1. [Architectural Overview](#-architectural-overview)
2. [Folder Organization](#-folder-organization)
3. [Decoupled Architecture & Design Patterns](#-decoupled-architecture--design-patterns)
4. [Scalable REST API (FastAPI)](#-scalable-rest-api-fastapi)
5. [State Management & Environment Decoupling](#-state-management--environment-decoupling)
6. [Core Capabilities & Modules](#-core-capabilities--modules)
7. [Installation & Setup](#-installation--setup)
8. [Automated Testing & Verification](#-automated-testing--verification)
9. [Viva & Academic Demonstration Guide](#-viva--academic-demonstration-guide)
10. [Academic Integrity Disclaimer](#-academic-integrity-disclaimer)

---

## 🏛 Architectural Overview

RetailVision follows industry-standard **Separation of Concerns (SoC)** and **Clean Architecture**:

```
┌──────────────────────────────────────────────────────────┐
│                   PRESENTATION LAYER                     │
│   Streamlit Web Dashboard (src.ui)  │  Swagger / OpenAPI │
└────────────┬─────────────────────────────┬───────────────┘
             │                             │
             ▼                             ▼
┌───────────────────────────┐ ┌────────────────────────────┐
│      STATE MANAGER        │ │    REST API CONTROLLER     │
│   (src.core.state)        │ │    FastAPI (src.api)       │
└────────────┬──────────────┘ └────────────┬───────────────┘
             │                             │
             └──────────────┬──────────────┘
                            ▼
┌──────────────────────────────────────────────────────────┐
│                  BUSINESS SERVICE LAYER                  │
│  DataService │ AnalyticsService │ CustomerService        │
│  ForecastingService │ ReportingService                   │
└───────────────────────────┬──────────────────────────────┘
                            ▼
┌──────────────────────────────────────────────────────────┐
│                     INFRASTRUCTURE                       │
│  Settings (.env) │ Domain Exceptions │ Logger │ Datasets │
└──────────────────────────────────────────────────────────┘
```

---

## 📂 Folder Organization

```
RetailVision/
│
├── app.py                         # Streamlit presentation orchestrator (80 LOC)
├── run_api.py                     # Uvicorn FastAPI REST server runner
├── requirements.txt               # Documented dependencies
├── .env.example                   # Environment configuration template
├── .gitignore                     # Git ignore rules for Python, IDEs, and artifacts
├── README.md                      # Comprehensive documentation
│
├── data/
│   └── retail_sales.csv           # 3,600-row realistic synthetic retail dataset (2024–2025)
│
├── assets/
│   └── logo.svg                   # Brand mark vector graphic
│
├── reports/                       # Generated executive PDF reports
│
├── src/
│   ├── __init__.py
│   ├── core/                      # System-wide infrastructure
│   │   ├── __init__.py
│   │   ├── config.py              # Environment configuration & Settings
│   │   ├── exceptions.py          # Domain exception hierarchy
│   │   ├── logging.py             # Centralized structured logger
│   │   └── state.py               # Typed state management & session store
│   │
│   ├── services/                  # Pure Business Logic (No UI dependencies)
│   │   ├── __init__.py
│   │   ├── data_service.py        # CSV ingestion, alias mapping & cross-imputation
│   │   ├── analytics_service.py   # KPIs, time-series aggregations, rankings
│   │   ├── customer_service.py    # Retention metrics, frequency tiers, ARPU
│   │   ├── forecasting_service.py # ML Ridge regression & chronological evaluation
│   │   └── reporting_service.py   # ReportLab PDF building & CSV serialization
│   │
│   ├── visualizations/            # Matplotlib Visualizations
│   │   ├── __init__.py
│   │   └── charts.py              # Dark & Light mode Matplotlib figures
│   │
│   ├── ui/                        # Presentation Components & Views
│   │   ├── __init__.py
│   │   ├── theme.py               # Enterprise CSS injection & theme colors
│   │   ├── components/
│   │   │   ├── __init__.py
│   │   │   ├── kpi_card.py        # KPI card widget with period-over-period deltas
│   │   │   └── sidebar.py         # Sidebar navigation & cascading filter panel
│   │   └── views/
│   │       ├── __init__.py
│   │       ├── overview.py        # Executive dashboard view
│   │       ├── sales.py           # Temporal sales analytics view
│   │       ├── products.py        # Product portfolio view
│   │       ├── customers.py       # Customer retention view
│   │       ├── forecasting.py     # Predictive machine learning view
│   │       ├── data_mgmt.py       # CSV upload & diagnostics view
│   │       └── reports.py         # Executive PDF & CSV export view
│   │
│   └── api/                       # Scalable REST API Microservice
│       ├── __init__.py
│       ├── app.py                 # FastAPI application factory & middleware
│       ├── schemas.py             # Pydantic request/response schemas
│       └── routes/
│           ├── __init__.py
│           ├── analytics.py       # /api/v1/analytics endpoints
│           ├── forecasting.py     # /api/v1/forecast endpoints
│           ├── reports.py         # /api/v1/reports endpoints
│           └── data.py            # /api/v1/data endpoints
│
├── modules/                       # Backward-compatibility proxies
│   ├── __init__.py
│   ├── analytics.py
│   ├── customer_analytics.py
│   ├── data_loader.py
│   ├── dataset_generator.py
│   ├── forecasting.py
│   ├── reporting.py
│   └── visualizations.py
│
└── tests/
    ├── __init__.py
    ├── test_analytics.py          # 6 unit tests for aggregations & KPIs
    ├── test_api.py                # 9 integration tests for REST API endpoints
    ├── test_data_loader.py        # 8 unit tests for data ingestion & aliases
    ├── test_forecasting.py        # 5 unit tests for ML forecasting & metrics
    ├── test_integration.py        # 4 integration tests via Streamlit AppTest
    └── test_reporting.py          # 2 unit tests for PDF compilation & CSV
```

---

## ⚡ Decoupled Architecture & Design Patterns

1. **Separation of Business Logic from UI:**
   - Services (`src/services/`) contain pure Python/Pandas/Scikit-learn logic without any `st.` calls.
   - UI views (`src/ui/views/`) call the services and pass data to presentation components.
   - Both the Streamlit Web App and the FastAPI REST API consume the exact same underlying services without code duplication.

2. **Consistent Naming Conventions:**
   - All modules, files, and functions follow strict PEP 8 snake_case conventions.
   - Domain classes follow PascalCase (`KPISummary`, `ValidationReport`, `ForecastResult`).
   - Private helpers are prefixed with an underscore (`_apply_base_styling`).

3. **Domain Exception Hierarchy:**
   - Base domain class: `RetailVisionError(Exception)`.
   - Specialized exceptions: `DataValidationError`, `DatasetEmptyError`, `ForecastingError`, `ReportGenerationError`, `ResourceNotFoundError`.
   - Handled cleanly in UI with friendly notifications and in API with HTTP 400 JSON responses.

---

## 🌐 Scalable REST API (FastAPI)

RetailVision includes a production-ready REST API powered by **FastAPI** with auto-generated OpenAPI/Swagger documentation.

### Starting the API Server:
```powershell
python run_api.py
```
Open **http://localhost:8000/docs** to interact with the endpoints.

### API Endpoints:
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/health` | Service health status check |
| `GET` | `/api/v1/analytics/kpis` | Executive KPIs and period-over-period growth rates |
| `GET` | `/api/v1/analytics/monthly` | Monthly sales aggregations and MoM growth |
| `GET` | `/api/v1/analytics/categories`| Category revenue breakdown & share % |
| `GET` | `/api/v1/analytics/regions` | Geographic sales breakdown |
| `GET` | `/api/v1/analytics/products`| Product rankings with Pareto cumulative % |
| `POST`| `/api/v1/forecast/predict` | ML time-series predictions (7 to 90 days ahead) |
| `GET` | `/api/v1/reports/pdf` | Stream compiled PDF executive report |
| `GET` | `/api/v1/reports/csv` | Stream transactions CSV |
| `GET` | `/api/v1/data/summary` | Dataset metadata & data quality diagnostics |

---

## 🛡️ State Management & Environment Decoupling

### 1. Centralized State Manager (`src/core/state.py`)
Encapsulates Streamlit's `st.session_state` behind a typed API with fallback in-memory storage for headless/API environments:
```python
from src.core.state import state_manager

current_theme = state_manager.get_theme()
state_manager.set_dataset_source("Custom Upload")
state_manager.reset_filters()
```

### 2. Environment Configuration (`src/core/config.py`)
Separates deployment environments from code using `.env` and `.env.example`:
```ini
APP_NAME=RetailVision
APP_ENV=development
APP_PORT=8501
API_PORT=8000
DEFAULT_THEME=dark
LOG_LEVEL=INFO
FORECAST_DEFAULT_HORIZON=30
```

---

## 🚀 Installation & Setup

### 1. Install Dependencies
```powershell
pip install -r requirements.txt
```

### 2. Launch the Streamlit Dashboard
```powershell
python -m streamlit run app.py
```
Access at: **http://localhost:8501**

### 3. Launch the REST API
```powershell
python run_api.py
```
Access docs at: **http://localhost:8000/docs**

---

## 🧪 Automated Testing & Verification

The test suite contains **34 comprehensive tests** across all architectural layers:

```powershell
python -m pytest tests/ -v
```

### Test Suite Distribution:
- `test_analytics.py` (6 tests): Aggregations, KPIs, filtering, product rankings.
- `test_api.py` (9 tests): FastAPI endpoints (health, KPIs, forecast, PDF, CSV, diagnostics).
- `test_data_loader.py` (8 tests): Schema aliases, duplicate purge, date parsing, cross-imputation.
- `test_forecasting.py` (5 tests): Continuous date reindexing, feature extraction, MAE/RMSE/safe MAPE.
- `test_integration.py` (4 tests): Streamlit `AppTest` mounting, filter updates, navigation.
- `test_reporting.py` (2 tests): ReportLab PDF compilation, CSV byte serialization.

---

## 🎓 Viva & Academic Demonstration Guide

1. **Architecture & Separation of Concerns (1 min):** Explain how business logic (`src/services/`) is completely decoupled from UI (`src/ui/`) and exposed simultaneously to both Streamlit and FastAPI.
2. **Interactive Streamlit UI (2 min):** Showcase the 6 real-time KPI cards, Dark/Light mode theme switching, and cascading filters.
3. **Machine Learning Forecasting (2 min):** Explain why chronological train/test splitting avoids data leakage, demonstrate the 7 to 90-day horizons, and show the confidence interval band.
4. **FastAPI Microservice (2 min):** Open `http://localhost:8000/docs` in browser, execute `/api/v1/analytics/kpis` and `/api/v1/forecast/predict`.
5. **ReportLab PDF Generation (1 min):** Download the executive PDF and open it to demonstrate publication formatting.
6. **Automated Testing (1 min):** Run `python -m pytest tests/ -v` to showcase 34 passing tests.

---

## 🛡️ Academic Integrity Disclaimer

- **Synthetic Data:** The default dataset (`data/retail_sales.csv`) contains 3,600 synthetically generated retail transactions spanning 2024–2025 created purely for educational demonstration.
- **Honest Metrics:** Machine learning accuracy metrics are calculated strictly on out-of-sample data. Volatility in retail demand is transparently acknowledged without fabricated claims.

---

**Developed with ❤️ by ANIKET CHAND for Semester Mini-Project Submission.**

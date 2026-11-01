# RetailVision – Immersive 3D Retail Marketplace & Predictive Analytics Platform

[![Three.js](https://img.shields.io/badge/Three.js-r174-black.svg)](https://threejs.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB.svg)](https://react.dev/)
[![React Three Fiber](https://img.shields.io/badge/React%20Three%20Fiber-9.0-blueviolet.svg)](https://docs.pmnd.rs/react-three-fiber/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.119%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20%7C%20Storage-3ECF8E.svg)](https://supabase.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15%2B-336791.svg)](https://www.postgresql.org/)
[![Pandas](https://img.shields.io/badge/Pandas-2.0%2B-150458.svg)](https://pandas.pydata.org/)
[![Scikit--Learn](https://img.shields.io/badge/Scikit--Learn-1.3%2B-F7931E.svg)](https://scikit-learn.org/)
[![ReportLab](https://img.shields.io/badge/ReportLab-4.0%2B-D0021B.svg)](https://www.reportlab.com/)
[![Tests](https://img.shields.io/badge/Tests-70%20Passing-success.svg)](https://docs.pytest.org/)

An enterprise-grade, interactive **3D Retail Marketplace Simulation** paired with a robust **Python Business Intelligence & Forecasting Engine** and cloud-native **Supabase / PostgreSQL** persistence. Users explore a virtual 3D shopping town, inspect real retail datasets by clicking stores, forecast revenues with Scikit-learn, export ReportLab executive PDFs, and construct brand new 3D stores with procedural infinite plot allocation simply by uploading CSV datasets.

GitHub Repository: [https://github.com/ANIKETCHAND/Retailer-](https://github.com/ANIKETCHAND/Retailer-)

---

## 📑 Table of Contents

1. [Architectural Overview](#-architectural-overview)
2. [Interactive 3D Experience (3 Scenes)](#-interactive-3d-experience)
3. [Cloud Database & Storage (Supabase & PostgreSQL)](#-cloud-database--storage-supabase--postgresql)
4. [Folder Organization](#-folder-organization)
5. [Python Analytics & ML Forecasting Engine](#-python-analytics--ml-forecasting-engine)
6. [FastAPI Scalable REST API](#-fastapi-scalable-rest-api)
7. [Installation & Setup](#-installation--setup)
8. [Automated Testing & Verification](#-automated-testing--verification)
9. [Demonstration & Presentation Guide](#-demonstration--presentation-guide)
10. [Academic Integrity Disclaimer](#-academic-integrity-disclaimer)

---

## 🏛 Architectural Overview

RetailVision strictly follows a **Python-first architecture** where all business logic, KPI calculations, ML trend regressions, dataset parsing, and ReportLab PDF document generation execute in Python. The WebGL/Three.js frontend remains visual-only, rendering state delivered via FastAPI REST APIs:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   3D INTERACTIVE FRONTEND (Vite + React)              │
│  Three.js │ React Three Fiber │ Drei │ Tailwind CSS v4 │ Framer Motion │
│   - Scene 1: Locked Storefront Window & Secure Sign-In Modal           │
│   - Scene 2: Isometric 3D Town / Marketplace with Orbit Controls       │
│   - Scene 3: Dedicated Construction Plot & Live CSV Ingestion Modal    │
│   - Glassmorphic BI Dashboard (KPIs, Charts, Pareto, Forecast, Export) │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / REST (/api)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     FASTAPI REST API BACKEND                          │
│  CORS │ Auth (/api/auth) │ Stores (/api/stores) │ Analytics & Forecast │
└─────────────────┬──────────────────────────────────┬───────────────────┘
                  │                                  │
                  ▼                                  ▼
┌───────────────────────────────────┐  ┌─────────────────────────────────┐
│     SUPABASE / POSTGRESQL + ORM   │  │     PYTHON DATA SCIENCE CORE    │
│  Profiles, Stores, Datasets,      │  │  DataService (Alias Imputation) │
│  SalesRecords, ConstructionPlots, │  │  AnalyticsService (KPIs/Pareto) │
│  Districts, Reports, AuditLogs    │  │  ForecastingService (ML Trend)  │
│  (Offline SQLite local fallback)  │  │  ReportingService (ReportLab)   │
│  Supabase Storage (Dual-tier S3)  │  │  StorageService (Cloud + Local) │
└───────────────────────────────────┘  └─────────────────────────────────┘
```

---

## 🌟 Interactive 3D Experience

### 1. Scene One – The Locked Storefront Window
- **Cinematic 3D Storefront:** Realistic glass windows, wooden framing, warm interior illumination with pendant lights, shelves, potted plants, and a hanging "CLOSE" sign.
- **Interactive Padlock:** Moving the mouse over the metallic padlock triggers smooth hover highlights. Clicking the padlock unlocks the sign-in modal.
- **Authentication System:** Secure credential validation with hashed passwords and demo quick-fill (`admin@retailvision.com` / `admin123`).
- **Cinematic Camera Transition:** Upon successful sign-in, the padlock unclasps, the storefront door swings open, and the camera glides smoothly forward through the entrance directly into the 3D marketplace.

### 2. Scene Two – 3D Retail Marketplace (Shopping Town)
- **Isometric Town Environment:** High-performance low-poly 3D world complete with paved roads, lane markings, streetlamps, benches, pine and round trees, low-poly cars, and ambient lighting.
- **Pre-Built Retail Stores:**
  1. **Nova Electronics:** Modern dark slate and blue tech store with solar panels and neon signage.
  2. **Daily Fresh Market:** Pastel purple boutique grocer with striped awning, rooftop HVAC, and bench.
  3. **Urban Style Boutique:** Clean terracotta and cream apparel shop with glass showcase windows.
  4. **Nordic Living Furniture:** Warm Scandinavian timber structure with elevated terrace.
  5. **Luxe & Leather Goods:** Elegant violet boutique with gold accents and boutique lighting.
- **Store Interaction:** Hovering over any building raises it slightly with an active spotlight and dynamic tooltip HUD displaying its category, revenue, and order count.
- **Camera Controls:** Smooth orbit rotation, zoom, pan, and a top quick-jump menu to fly directly to any store or reset the isometric view.

### 3. Glassmorphic Analytics Dashboard
Clicking any store opens a comprehensive BI modal with 5 analytical tabs:
- **Executive Overview:** 6 real-time KPI cards (Revenue, Orders, Units Sold, AOV, Unique Customers, Products) and monthly revenue bar charts.
- **Sales Analytics:** Daily sales trends, category contributions, and regional revenue share.
- **Product Intelligence:** Top 10 products by revenue and units, lowest performers, and **Pareto (80/20) cumulative revenue analysis**.
- **Customer Analytics:** Unique customer counts, repeat purchase rates, revenue per customer, and top spenders.
- **Machine Learning Forecast:** Chronologically split Scikit-learn trend regression with 7, 14, 30, 60, and 90-day future horizons, out-of-sample MAE, RMSE, and zero-safe MAPE.
- **Report Downloads:** Live generation and download of professional **ReportLab PDF summary reports** and clean CSV exports.

### 4. Scene Three – Construction Plot & Infinite Procedural Expansion
- **Dedicated Construction Site:** Plot with concrete foundation, hazard striping, safety cones, a rotating orange construction crane, and a 3D "CONSTRUCT - BUILD YOUR STORE" signboard with a beacon light.
- **Procedural Store Creation:** Clicking the plot opens a construction modal requesting Store Name, Category, Description, and a CSV sales dataset.
- **Infinite Procedural Plot Grid:** The backend dynamically calculates non-overlapping concentric coordinate rings `(x, z)`. Once a plot is occupied, the next available plot in the district is procedurally allocated and broadcast to the frontend.
- **Real-Time Validation & Storage:** Uploaded CSVs are stored in Supabase Storage (with automatic local filesystem fallback), parsed into normalized database `Dataset` and `SalesRecord` entities, and aggregated immediately.

---

## 🗄️ Cloud Database & Storage (Supabase & PostgreSQL)

RetailVision is built to connect seamlessly to **Supabase** (PostgreSQL + Supabase Cloud Storage) with zero-configuration fallback to local SQLite for offline development:

### Database Models (Normalized Schema)
1. **`users` / `profiles`**: User authentication accounts and extended profile metadata (full name, avatar, role, preferences).
2. **`stores`**: Registered stores with procedural 3D world coordinates (`x`, `z`), rotation, category, status, and theme colors.
3. **`datasets`**: Uploaded dataset records containing storage pointers, row counts, column maps, and verification hashes.
4. **`sales_records`**: Granular transaction lines (order ID, date, customer ID, product, category, quantity, unit price, discount percentage, total amount, region, payment method).
5. **`construction_plots`**: Deterministic grid plots tracking spatial bounds, occupancy status, and foreign key to the building store.
6. **`districts`**: Town zones (`Central Commercial Plaza`, `East Boulevard`, `West Fashion Promenade`) with center bounds and plot capacities.
7. **`reports`**: Generated PDF and CSV audit exports with cloud download URLs.
8. **`audit_logs`**: Tamper-evident activity logs capturing user actions, timestamps, and IP addresses.

### Storage Service (Dual-Tier Resilience)
- **Primary Tier:** Supabase Storage buckets (`retailvision-datasets` and `retailvision-reports`).
- **Offline Fallback Tier:** Local directory storage under `data/stores/` and `data/reports/` when Supabase credentials are not supplied or cloud connectivity is unavailable.
- **Security:** Filename sanitization against path traversal attacks (`../` and illegal characters).

---

## 📂 Folder Organization

```
RetailVision/
│
├── frontend/                          # Vite + React + Three.js 3D Frontend
│   ├── src/
│   │   ├── api/client.ts              # Axios REST client with JWT/auth header
│   │   ├── components/3d/             # Three.js / React Three Fiber components
│   │   │   ├── StorefrontScene.tsx    # Scene 1: Locked storefront & swinging door
│   │   │   ├── MarketplaceScene.tsx   # Scene 2: 3D town camera & lighting
│   │   │   ├── StoreBuilding.tsx      # Procedural 3D retail building with signage
│   │   │   ├── ConstructPlot.tsx      # Scene 3: Construction plot & rotating crane
│   │   │   └── EnvironmentDecor.tsx   # Roads, cars, trees, streetlamps, benches
│   │   ├── components/ui/             # Glassmorphic Tailwind UI components
│   │   │   ├── LockOverlay.tsx        # Sign-in modal with demo auto-fill
│   │   │   ├── StoreAnalyticsModal.tsx# 5-tab analytics & forecasting modal
│   │   │   ├── ConstructModal.tsx     # CSV upload & store builder modal
│   │   │   ├── FloatingNav.tsx        # Top HUD navigation & camera controls
│   │   │   └── StoreCardTooltip.tsx   # Hover HUD card over 3D buildings
│   │   ├── types/index.ts             # TypeScript interfaces for Stores & KPIs
│   │   ├── App.tsx                    # Main state machine (LOCKED -> MARKETPLACE)
│   │   └── main.tsx                   # React root entrypoint
│   ├── package.json
│   ├── vite.config.ts                 # Configured with @tailwindcss/vite & API proxy
│   └── tsconfig.json
│
├── src/                               # Python Backend Core
│   ├── api/                           # FastAPI REST Layer
│   │   ├── routes/
│   │   │   ├── auth.py                # Sign-in, registration, JWT & profile tokens
│   │   │   ├── stores.py              # Store CRUD, infinite plot allocation, CSV build
│   │   │   ├── analytics.py           # Dataset KPI & aggregation endpoints
│   │   │   ├── forecasting.py         # ML horizon prediction endpoints
│   │   │   ├── reports.py             # PDF & CSV byte stream exports
│   │   │   └── data.py                # Schema diagnostics & upload validation
│   │   ├── app.py                     # FastAPI application factory
│   │   └── schemas.py                 # Pydantic request/response contracts
│   ├── db/                            # Database Layer
│   │   ├── database.py                # Supabase / SQLite SQLAlchemy connection pool
│   │   ├── models.py                  # 9 relational entities with backward-compatible synonyms
│   │   └── seed.py                    # Seeder & synthetic retail data generator
│   ├── services/                      # Decoupled Business Logic
│   │   ├── data_service.py            # CSV schema cleaning, aliases, discount handling
│   │   ├── analytics_service.py       # KPIs, Pareto analysis, category aggregations
│   │   ├── customer_service.py        # Retention, repeat purchase frequency
│   │   ├── forecasting_service.py     # Time-series ML trend regression & metrics
│   │   ├── reporting_service.py       # ReportLab PDF & CSV builders
│   │   └── storage_service.py         # Supabase Storage client with local disk fallback
│   ├── core/                          # Cross-Cutting Infrastructure
│   │   ├── config.py                  # Pydantic Settings & environment variables
│   │   ├── exceptions.py              # Domain error hierarchy
│   │   └── logging.py                 # Structured logging configuration
│   └── ui/                            # Streamlit Presentation (preserved dual mode)
│
├── migrations/                        # SQL Migrations
│   ├── 001_initial_schema.sql         # Supabase PostgreSQL DDL, indexes & RLS policies
│   └── run_migrations.py              # Migration executor & schema synchronizer
├── alembic/                           # Alembic Database Migration Environment
├── scripts/
│   └── test_infinite_construction.py  # 13-point acceptance test for infinite building
├── tests/                             # Automated Test Suite (70 passing tests)
├── .env.example                       # Environment configuration template
├── main.py / server.py                # Root backend entry points
├── requirements.txt                   # Python dependencies
└── RETAILVISION_SYSTEM_AUDIT.md       # Comprehensive 15-section technical audit report
```

---

## ⚡ Quick Start & Setup

### 1. Environment Configuration

Copy the sample environment file and provide your Supabase credentials (optional: defaults to local SQLite if omitted):
```powershell
copy .env.example .env
```

Key environment variables in `.env`:
```ini
DATABASE_URL=sqlite:///./data/retailvision.db
# For Supabase PostgreSQL:
# DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres

SUPABASE_URL=https://[PROJECT_REF].supabase.co
SUPABASE_ANON_KEY=[ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[SERVICE_ROLE_KEY]
JWT_SECRET=super-secret-jwt-key-replace-in-production
```

### 2. Backend Setup (FastAPI & Python)

Install Python dependencies:
```powershell
pip install -r requirements.txt
```

Run schema migrations (for Supabase PostgreSQL or local SQLite):
```powershell
python migrations/run_migrations.py
```

Start the FastAPI REST backend:
```powershell
python main.py
```
- **Backend API:** `http://localhost:8000`
- **Swagger Interactive Docs:** `http://localhost:8000/docs`
- *Note:* The database and default stores will be automatically seeded on first launch if empty.

### 3. Frontend Setup (3D React Marketplace)

In a new terminal, navigate to the `frontend/` directory:
```powershell
cd frontend
npm install
npm run dev
```
- **Interactive 3D Marketplace:** `http://localhost:3000`

---

## 🔑 Demo Sign-In Credentials

When prompted at the locked storefront:
- **Email:** `admin@retailvision.com`
- **Password:** `admin123`
*(Or simply click the **"Fill Demo Credentials"** button on the lock screen)*

---

## 🧪 Automated Testing & Verification

Run the full pytest suite:
```powershell
python -m pytest tests/ -v
```

The **70 passing automated tests** cover:
- **Authentication (`test_auth.py`):** Registration, duplicate user rejection, password hashing, JWT creation, Google OAuth login.
- **Database (`test_database.py`):** 9 normalized models, field synonyms, foreign keys, audit logs, idempotent migration runner.
- **CSV Ingestion (`test_csv_upload.py`, `test_data_loader.py`, `test_data_validation.py`):** Empty streams, missing columns, duplicate row purging, mathematical discount percentage calculations, and cross-imputation.
- **Store & Marketplace (`test_store_creation.py`, `test_marketplace.py`):** Infinite procedural plot grid allocation, deterministic coordinates, collision prevention, store deletion safeguards.
- **Analytics & Forecasting (`test_analytics.py`, `test_forecasting.py`):** Pareto distribution, customer retention, multi-horizon regressions (7, 14, 30, 60, 90 days), zero-safe MAPE.
- **Reporting (`test_reporting.py`):** ReportLab PDF generation and CSV byte stream export.
- **API & Security (`test_api.py`, `test_security.py`, `test_integration.py`):** SQL injection resistance, service role key leak prevention, path traversal blocking, end-to-end user journeys.

Run the Infinite Procedural Store Construction acceptance suite:
```powershell
python scripts/test_infinite_construction.py
```
*Builds 15 consecutive stores (6 through 20), allocates unique plots across concentric district rings, tests persistence across server restarts, and verifies isolated independent datasets.*

---

## 🎓 Academic Demonstration Guide

1. **Scene 1 Presentation:** Showcase the 3D storefront window matching realistic lighting. Hover over the padlock to demonstrate Three.js raycasting. Click the lock to reveal the sign-in modal.
2. **Door Open & Camera Glide:** Sign in and observe the door opening and camera gliding forward into the 3D shopping town.
3. **Marketplace Exploration:** Orbit, pan, and zoom around the town. Hover over stores to inspect the dynamic HUD tooltip with real dataset statistics.
4. **Analytics Deep-Dive:** Click any building (e.g. Nova Electronics) to open the BI dashboard. Explore Executive Overview, Pareto product ranking, customer retention, and Scikit-learn revenue forecasts for 7 to 90 days.
5. **PDF Report Export:** Click "Download PDF Report" to download a clean, multi-page ReportLab PDF summary.
6. **Scene 3 Store Construction:** Click the orange crane plot, upload any CSV dataset, specify store details, and watch the confetti fire as the new store is dynamically added to the 3D town on an open plot.

---

## 🛡️ Academic Integrity Disclaimer

- **Synthetic Data:** Default store datasets contain realistic synthetically generated transactions spanning 2024–2025 created purely for educational demonstration.
- **Honest Metrics:** Machine learning accuracy metrics are calculated strictly on out-of-sample data. Volatility in retail demand is transparently acknowledged without fabricated claims.

---

**Developed with ❤️ by ANIKET CHAND for Semester Mini-Project Submission.**

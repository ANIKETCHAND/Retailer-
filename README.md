# RetailVision – Immersive 3D Retail Marketplace & Predictive Analytics Platform

[![Three.js](https://img.shields.io/badge/Three.js-r174-black.svg)](https://threejs.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB.svg)](https://react.dev/)
[![React Three Fiber](https://img.shields.io/badge/React%20Three%20Fiber-9.0-blueviolet.svg)](https://docs.pmnd.rs/react-three-fiber/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.119%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![Pandas](https://img.shields.io/badge/Pandas-2.0%2B-150458.svg)](https://pandas.pydata.org/)
[![Scikit--Learn](https://img.shields.io/badge/Scikit--Learn-1.3%2B-F7931E.svg)](https://scikit-learn.org/)
[![ReportLab](https://img.shields.io/badge/ReportLab-4.0%2B-D0021B.svg)](https://www.reportlab.com/)
[![Tests](https://img.shields.io/badge/Tests-33%20Passing-success.svg)](https://docs.pytest.org/)

An enterprise-grade, interactive **3D Retail Marketplace Simulation** paired with a robust **Python Business Intelligence & Forecasting Engine**. Users explore a virtual 3D shopping town, inspect real retail datasets by clicking stores, forecast revenues with Scikit-learn, export ReportLab executive PDFs, and construct brand new 3D stores simply by uploading CSV datasets.

GitHub Repository: [https://github.com/ANIKETCHAND/Retailer-](https://github.com/ANIKETCHAND/Retailer-)

---

## 📑 Table of Contents

1. [Architectural Overview](#-architectural-overview)
2. [Interactive 3D Experience (3 Scenes)](#-interactive-3d-experience)
3. [Folder Organization](#-folder-organization)
4. [Python Analytics & ML Forecasting Engine](#-python-analytics--ml-forecasting-engine)
5. [FastAPI Scalable REST API](#-fastapi-scalable-rest-api)
6. [Installation & Setup](#-installation--setup)
7. [Automated Testing & Verification](#-automated-testing--verification)
8. [Demonstration & Presentation Guide](#-demonstration--presentation-guide)
9. [Academic Integrity Disclaimer](#-academic-integrity-disclaimer)

---

## 🏛 Architectural Overview

RetailVision bridges **WebGL 3D Interactive Graphics** with **Python Enterprise Data Science**:

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
│     SQLITE & SQLALCHEMY ORM       │  │     PYTHON DATA SCIENCE CORE    │
│  User Accounts │ Store Geometries │  │  DataService │ AnalyticsService │
│  CSV Dataset Pointers & Metadata  │  │  ForecastingService (ML Trend)  │
└───────────────────────────────────┘  │  ReportingService (ReportLab)   │
                                       └─────────────────────────────────┘
```

---

## 🌟 Interactive 3D Experience

### 1. Scene One – The Locked Storefront Window
- **Cinematic 3D Storefront:** Realistic glass windows, wooden framing, warm interior illumination with pendant lights, shelves, potted plants, and a hanging "CLOSE" sign.
- **Interactive Padlock:** Moving the mouse over the metallic padlock triggers smooth hover highlights. Clicking the padlock unlocks the sign-in modal.
- **Authentication System:** Local secure credential validation with hashed passwords and demo quick-fill (`admin@retailvision.com` / `admin123`).
- **Cinematic Camera Transition:** Upon successful sign-in, the padlock unclasps, the storefront door swings open, and the camera glides smoothly forward through the entrance directly into the 3D marketplace.

### 2. Scene Two – 3D Retail Marketplace (Shopping Town)
- **Isometric Town Environment:** High-performance low-poly 3D world complete with paved roads, lane markings, streetlamps, benches, pine and round trees, low-poly cars, and ambient lighting.
- **Pre-Built Retail Stores:**
  1. **Nova Electronics:** Modern dark slate and blue tech store with solar panels and neon signage.
  2. **FreshHarvest Grocery:** Pastel purple boutique grocer with striped awning, rooftop HVAC, and bench.
  3. **Apex Streetwear:** Clean terracotta and cream apparel shop with glass showcase windows.
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

### 4. Scene Three – Construction Plot & Live CSV Ingestion
- **Dedicated Construction Site:** Plot with concrete foundation, hazard striping, safety cones, a rotating orange construction crane, and a 3D "CONSTRUCT - BUILD YOUR STORE" signboard with a beacon light.
- **Procedural Store Creation:** Clicking the plot opens a construction modal requesting Store Name, Category, Description, and a CSV sales dataset.
- **Real-Time Validation & Plot Allocation:** FastAPI parses and validates the CSV (detecting schema aliases, imputing unit prices, deduplicating records), calculates aggregate statistics, assigns the next open grid plot `(x, z)`, persists the store to SQLite, triggers confetti, and places the newly generated 3D building into the marketplace.

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
│   │   │   ├── auth.py                # Sign-in & user verification
│   │   │   ├── stores.py              # Stores listing, CSV construction, reports
│   │   │   ├── analytics.py           # Dataset KPI & aggregation endpoints
│   │   │   ├── forecasting.py         # ML horizon prediction endpoints
│   │   │   ├── reports.py             # PDF & CSV byte stream exports
│   │   │   └── data.py                # Schema diagnostics & upload validation
│   │   ├── app.py                     # FastAPI factory & auto-seeding
│   │   └── schemas.py                 # Pydantic request/response contracts
│   ├── db/                            # Database Layer
│   │   ├── database.py                # SQLAlchemy engine & session factory
│   │   ├── models.py                  # User and Store relational models
│   │   └── seed.py                    # Seeder & synthetic retail data generator
│   ├── services/                      # Decoupled Business Logic
│   │   ├── data_service.py            # CSV schema cleaning, aliases & validation
│   │   ├── analytics_service.py       # KPIs, Pareto analysis, category aggregations
│   │   ├── customer_service.py        # Retention, repeat purchase frequency
│   │   ├── forecasting_service.py     # Time-series ML trend regression & metrics
│   │   └── reporting_service.py       # ReportLab PDF & CSV builders
│   ├── core/                          # Cross-Cutting Infrastructure
│   │   ├── config.py                  # Pydantic Settings & environment variables
│   │   ├── exceptions.py              # Domain error hierarchy
│   │   ├── logging.py                 # Structured logging configuration
│   │   └── state.py                   # Thread-safe state manager
│   └── ui/                            # Streamlit Presentation (preserved dual mode)
│
├── data/
│   ├── retail_sales.csv               # Baseline multi-category sample dataset
│   └── stores/                        # Distinct datasets for each 3D store
├── tests/                             # Automated Test Suite (33 passing tests)
├── run_api.py                         # FastAPI Uvicorn entry point
├── app.py                             # Streamlit entry point (classic mode)
└── requirements.txt                   # Python dependencies
```

---

## ⚡ Quick Start & Setup

### 1. Backend Setup (FastAPI & Python)

Clone the repository and install Python dependencies:
```powershell
pip install -r requirements.txt
```

Start the FastAPI REST backend:
```powershell
python run_api.py
```
- **Backend API:** `http://localhost:8000`
- **Swagger Interactive Docs:** `http://localhost:8000/docs`
- *Note:* The database and default stores will be automatically seeded on first launch if empty.

### 2. Frontend Setup (3D React Marketplace)

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

The 33 passing automated tests cover:
- **Analytics Service:** KPI calculations, Pareto analysis, filter pipelines, regional aggregations.
- **Data Service:** Flexible column aliasing, duplicate purging, unit-price cross imputation.
- **Forecasting Service:** Chronological train/test split, horizon forecasting, zero-safe MAPE.
- **REST API:** Authentication, store retrieval, CSV construct upload, forecast generation, PDF export.
- **Reporting Service:** ReportLab PDF compilation and CSV export.

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

- **Synthetic Data:** Default store datasets (`data/stores/*.csv`) contain realistic synthetically generated transactions spanning 2024–2025 created purely for educational demonstration.
- **Honest Metrics:** Machine learning accuracy metrics are calculated strictly on out-of-sample data. Volatility in retail demand is transparently acknowledged without fabricated claims.

---

**Developed with ❤️ by ANIKET CHAND for Semester Mini-Project Submission.**

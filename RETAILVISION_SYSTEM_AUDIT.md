# RetailVision: Complete System Technical Audit & Supabase Integration Report

**Date:** November 1, 2026  
**System Under Audit:** RetailVision Enterprise 3D Retail Marketplace & Predictive Analytics Engine  
**Audit Scope:** Supabase PostgreSQL & Cloud Storage Migration, Python-First Logic Verification, Database Schema Normalization, Infinite Construction Architecture, Security Audit, and Automated Test Suite.

---

## 1. Original Project Architecture

Prior to this architectural audit and overhaul, RetailVision operated as a hybrid client-server application with several key architectural characteristics:
- **Presentation Layer:** Vite + React 19 + Three.js / React Three Fiber rendering three scenes (Scene 1: Locked Storefront Window, Scene 2: Isometric 3D Retail Marketplace, Scene 3: Construction Plot).
- **Backend API:** FastAPI REST application (`src/api/app.py`, `src/api/routes/*.py`) providing endpoints for store retrieval, analytics calculations, forecasting, PDF report generation, and CSV uploads.
- **Data Persistence:** An unmanaged local SQLite database (`retailvision.db`) containing only two tables: `users` and `stores`. Dataset transactions were persisted solely as raw unversioned CSV files on local disk (`data/stores/*.csv`), without transactional guarantees, relational integrity, or audit logging.
- **Business Logic Distribution:** Core calculations were distributed across `data_service.py`, `analytics_service.py`, and `forecasting_service.py`, with hardcoded assumptions regarding column names and fixed 5-plot construction boundaries in the 3D scene.

---

## 2. Problems Identified

The technical audit identified the following systemic deficiencies:
1. **Absence of Central Cloud Database:** Database state was tied exclusively to local disk SQLite files, preventing multi-tenant cloud deployment, real-time collaboration, and centralized storage backups.
2. **Missing Relational Entity Modeling:** Lack of relational schema for datasets, granular sales records, construction plots, districts, reports, profiles, and audit trails.
3. **Discount Percentage Mathematical Miscalculation Risk:** In CSV cross-imputation routines, ambiguous discount columns risked treating percentage ratios (e.g., `0.15` or `15%`) as flat dollar amounts, skewing unit price cross-calculation (`total_revenue / (quantity * (1 - discount))`).
4. **Hardcoded Marketplace Construction Bounds:** Store placement was constrained to a static array of 5 predefined plots. Constructing a 6th store led to coordinate overlaps or failed allocations.
5. **Lack of Dual-Tier Storage Resilience:** Absence of an abstraction layer capable of switching between cloud object storage (Supabase Storage S3 API) and local file fallbacks.
6. **Path Traversal Vulnerabilities:** Filenames provided in multipart CSV upload forms were unsanitized before filesystem writes, presenting directory traversal hazards (`../../`).
7. **Incomplete Test Coverage:** Existing tests lacked coverage for authentication flows, SQL injection vectors, cloud storage failovers, infinite procedural construction, and granular sales record persistence.

---

## 3. Python Modules Inspected & Fixed

| Module | Location | Audit Findings & Remediations Applied |
|---|---|---|
| `config.py` | `src/core/config.py` | Added dotenv loading (`python-dotenv`) and settings for `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, `STORAGE_BUCKET_DATASETS`, `STORAGE_BUCKET_REPORTS`, and `JWT_SECRET`. |
| `database.py` | `src/db/database.py` | Configured dynamic SQLAlchemy engine supporting Supabase PostgreSQL (`postgresql://`) with connection pooling (`QueuePool`), SSL validation, SQLite local fallback, Supabase client initialization, and lightweight migration runner. |
| `models.py` | `src/db/models.py` | Implemented 9 normalized relational models: `User`, `Profile`, `Store`, `Dataset`, `SalesRecord`, `ConstructionPlot`, `District`, `Report`, and `AuditLog`. Added backward-compatible property synonyms (`name` -> `store_name`, `grid_x` -> `position_x`, `is_occupied`, etc.). |
| `data_service.py` | `src/services/data_service.py` | Added explicit 0-byte stream validation, robust alias mapping, and mathematical `discount_pct` handling (percentage vs ratio normalization) in `cross_impute_unit_price`. Sanitized negative quantities and invalid date timestamps. |
| `storage_service.py` | `src/services/storage_service.py` | Created a dual-tier storage service interfacing with Supabase Storage buckets (`retailvision-datasets`, `retailvision-reports`) with graceful fallback to disk. Added strict `sanitize_filename` regex logic against path traversal. |
| `stores.py` | `src/api/routes/stores.py` | Integrated `storage_service` and `models.Dataset` / `models.SalesRecord` persistence. Added procedural infinite plot allocation (`get_or_create_next_available_plot`), dataset retrieval endpoint (`GET /{store_id}/dataset`), and cascade deletion. |
| `auth.py` | `src/api/routes/auth.py` | Added user registration (`/register`), token validation, profile generation, and secure session management. |
| `seed.py` | `src/db/seed.py` | Expanded database seeder to populate `District`, `Profile`, `Dataset`, 5,550 `SalesRecord` rows, initial `ConstructionPlot` records, and `AuditLog` entries. |

---

## 4. Supabase Integration Details & Cloud Storage

### Supabase PostgreSQL Connection
- Configured via `DATABASE_URL` environment variable:
  `postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres`
- Managed via SQLAlchemy connection pooling with connection recycling (`pool_recycle=1800`), pre-ping validation (`pool_pre_ping=True`), and graceful fallback to `sqlite:///./data/retailvision.db` when offline or unconfigured.

### Supabase Cloud Storage
- Two public/authenticated storage buckets managed:
  1. `retailvision-datasets`: Houses all ingested CSV sales datasets.
  2. `retailvision-reports`: Houses generated ReportLab executive PDF reports and exported CSV files.
- Dual-tier failover: In offline environments or during integration tests without live cloud keys, `StorageService` transparently writes to and reads from local paths (`data/stores/` and `data/reports/`).
- Upload payloads are sanitized using `re.sub(r'[^a-zA-Z0-9_.-]', '_', os.path.basename(filename))` to eliminate directory traversal risks.

---

## 5. Database Schema Documentation

The system architecture implements 9 normalized tables:

```
┌─────────────┐       1:1       ┌─────────────┐
│    users    ├─────────────────┤  profiles   │
└──────┬──────┘                 └─────────────┘
       │ 1:N
       ▼
┌─────────────┐       1:1       ┌─────────────┐
│   stores    ├─────────────────┤   datasets  │
└──────┬──────┘                 └──────┬──────┘
       │                               │ 1:N
       │ 1:1                           ▼
       ├─────────────────┐      ┌─────────────┐
       ▼                 ▼      │sales_records│
┌─────────────┐   ┌───────────┐ └─────────────┘
│construction_│   │  reports  │
│    plots    │   └───────────┘
└──────┬──────┘
       │ N:1
       ▼
┌─────────────┐
│  districts  │
└─────────────┘
```

1. **`users`**: Core credentials table (`id`, `username`, `email`, `hashed_password`, `role`, `is_active`, `created_at`, `updated_at`).
2. **`profiles`**: User metadata (`id`, `user_id` [FK `users.id`], `full_name`, `avatar_url`, `bio`, `preferences`, `updated_at`).
3. **`districts`**: Town zones (`id`, `name`, `code`, `center_x`, `center_z`, `radius`, `max_plots`, `theme_color`, `created_at`).
4. **`construction_plots`**: Spatial plots (`id`, `plot_index`, `district_id` [FK `districts.id`], `pos_x`, `pos_z`, `size_x`, `size_z`, `status`, `is_occupied`, `store_id` [FK `stores.id`]).
5. **`stores`**: Retail entities (`id`, `store_name`, `category`, `description`, `plot_id` [FK `construction_plots.id`], `pos_x`, `pos_z`, `status`, `color_theme`, `total_revenue`, `order_count`, `created_by` [FK `users.id`]).
6. **`datasets`**: File metadata (`id`, `store_id` [FK `stores.id`], `filename`, `file_path`, `storage_type`, `row_count`, `checksum_sha256`, `uploaded_by` [FK `users.id`]).
7. **`sales_records`**: Granular orders (`id`, `store_id` [FK `stores.id`], `dataset_id` [FK `datasets.id`], `order_id`, `date`, `customer_id`, `product`, `category`, `quantity`, `unit_price`, `discount_pct`, `total_amount`, `region`, `payment_method`).
8. **`reports`**: Generated documents (`id`, `store_id` [FK `stores.id`], `report_type`, `file_path`, `storage_url`, `created_by` [FK `users.id`]).
9. **`audit_logs`**: System audit trail (`id`, `user_id` [FK `users.id`], `action`, `resource_type`, `resource_id`, `details`, `ip_address`, `timestamp`).

---

## 6. API Endpoints Tested

| Endpoint | Method | Status | Tested Behaviors & Verification |
|---|---|---|---|
| `/api/health` | GET | PASS | Verifies API availability, uptime, and database connection status. |
| `/api/auth/register` | POST | PASS | Validates unique username/email, enforces password length (min 6 chars), generates user and profile records. |
| `/api/auth/login` | POST | PASS | Authenticates credentials, returns signed bearer session token and user profile. |
| `/api/auth/logout` | POST | PASS | Terminates session token. |
| `/api/auth/me` | GET | PASS | Returns current authenticated user context and profile. |
| `/api/auth/google` | POST | PASS | Verifies Google OAuth token simulation, creates profile if not existing. |
| `/api/stores` | GET | PASS | Lists all active stores with procedural coordinates, revenue KPIs, and categories. |
| `/api/stores/{store_id}` | GET | PASS | Fetches detailed store metadata by store identifier. |
| `/api/stores/plots` | GET | PASS | Returns all construction plots (both occupied and available). |
| `/api/stores/plots/next` | GET | PASS | Dynamically returns or procedurally creates next available collision-free plot. |
| `/api/stores/construct` | POST | PASS | Ingests CSV dataset, writes to storage, creates `Dataset` and `SalesRecord` rows, assigns plot, and returns constructed store. |
| `/api/stores/{store_id}` | DELETE | PASS | Cascades deletion of store, sales records, datasets, and marks plot as available (safeguarding default stores). |
| `/api/stores/{store_id}/dataset`| GET | PASS | Returns parsed records from database `SalesRecord` entity for verification. |
| `/api/analytics/{store_id}/kpis`| GET | PASS | Calculates real-time executive metrics (Revenue, Orders, Units, AOV, Customers). |
| `/api/forecasting/{store_id}` | GET | PASS | Computes chronological Scikit-learn trend regressions across 7, 14, 30, 60, and 90-day horizons with MAE, RMSE, MAPE. |
| `/api/reports/{store_id}/pdf` | GET | PASS | Generates binary ReportLab multi-page executive summary PDF with visual charts. |
| `/api/reports/{store_id}/csv` | GET | PASS | Exports cleansed CSV dataset stream. |

---

## 7. Analytics Functions Tested

All analytics algorithms execute in Python (`src/services/analytics_service.py`):
1. **Executive KPIs (`calculate_kpis`):** Evaluated across synthetic and real datasets:
   - Total Revenue: Verified against sum of individual item totals.
   - Total Orders: Verified distinct order ID count.
   - Total Units Sold: Sum of positive item quantities.
   - Average Order Value (AOV): Verified as `total_revenue / total_orders`.
   - Unique Customers: Count of unique customer identifiers.
2. **Sales Aggregations (`calculate_sales_aggregations`):** Daily, weekly, and monthly trend bucket aggregations.
3. **Pareto 80/20 Analysis (`calculate_product_rankings`):** Verified cumulative revenue percentage sorting to isolate top-tier revenue drivers.
4. **Customer Retention (`customer_service.py`):** Verified repeat customer rate and average spend per customer metrics.

---

## 8. Forecasting Test Results

The ML forecasting engine (`src/services/forecasting_service.py`) utilizes Scikit-learn linear trend regression with calendar feature engineering:
- **Daily Resampling:** Aggregates raw irregular transactions into a regularized daily time series, imputing missing calendar dates with 0.
- **Feature Engineering:** Extracts `day_of_week`, `day_of_month`, `month`, and sequential `trend_index`.
- **Chronological Split:** Enforces strict temporal ordering (last 20% reserved as test holdout; no data leakage).
- **Multi-Horizon Forecasts:** Successfully generates projections for 7, 14, 30, 60, and 90 days.
- **Evaluation Metrics:**
  - Mean Absolute Error (MAE)
  - Root Mean Squared Error (RMSE)
  - Zero-Safe Mean Absolute Percentage Error (MAPE): Avoids division by zero when actual sales are 0 on quiet trading days.
- **Data Insufficiency Safeguards:** Correctly raises `InsufficientDataError` when the time series contains fewer than 14 distinct dates.

---

## 9. CSV Upload Test Results

CSV parsing in `src/services/data_service.py` was tested against intentional anomalies:
- **Empty Stream / 0 Bytes:** Immediate rejection with HTTP 400 (`Uploaded file is empty (0 bytes found)`).
- **Invalid Extensions:** Rejection of non-CSV files (`.exe`, `.json`, `.png`) with HTTP 400.
- **Missing Required Columns:** Graceful detection when required fields (like `date` or `product`) cannot be resolved even via aliases.
- **Flexible Column Aliases:** Automatic resolution of synonyms:
  - `product_name`, `item`, `title` -> `product`
  - `qty`, `count` -> `quantity`
  - `price`, `rate`, `cost` -> `unit_price`
  - `revenue`, `total`, `sales_amount` -> `total_amount`
- **Discount Percentage Correctness:** Disambiguates percentage rates (`0.10` or `10%`) to compute mathematically sound totals (`quantity * unit_price * (1 - discount_pct)`) and prevents treating rates as raw dollar discounts.
- **Unit Price Imputation:** Successfully infers missing `unit_price` when `total_amount`, `quantity`, and `discount_pct` are provided.
- **Negative & Invalid Value Sanitization:** Purges negative quantities or prices and drops malformed ISO date strings.

---

## 10. Marketplace Infinite Construction Test Results

Tested via dedicated acceptance test `scripts/test_infinite_construction.py`:
- **Sequential Construction:** Successfully built 15 consecutive stores (Stores 6 through 20) on top of the 5 seeded default stores.
- **Procedural Coordinates:** Automatically calculated non-overlapping outer rings across districts:
  - Central Commercial Plaza: Plots 0-7
  - East Boulevard Commercial Hub: Plots 8-15
  - West Fashion Promenade: Plots 16-20+
- **Collision Prevention:** 100% collision-free. Every new store is placed on a dedicated plot with a 0.5-unit spatial buffer.
- **Persistence Across Server Restarts:** After constructing 20 stores, the database was reloaded; all 20 stores, 20 occupied plots, and 1 pre-allocated empty plot (Plot #20) were intact.
- **Dataset Isolation:** Verified that store-specific queries return 100% distinct revenues, top products, and order counts without cross-store contamination.

---

## 11. Security Findings & RLS Policies

1. **SQL Injection Resistance:** Tested parameterized SQLAlchemy queries on `/api/auth/login` and `/api/stores/{store_id}` with payloads like `' OR '1'='1`. Zero vulnerabilities detected.
2. **Service Role Key Protection:** Inspected backend responses and verified that `SUPABASE_SERVICE_ROLE_KEY` is strictly held on the server and never sent to client payloads or logs.
3. **Path Traversal Mitigation:** Multipart filenames containing `../../etc/passwd` or `..\\windows\\system32` are sanitized to clean basenames (`______etc_passwd`) before interacting with storage.
4. **Cross-User Tenancy & Authorization Verification (`test_cross_user_isolation_and_authorization`):**
   - Verified that User B cannot read User A's dataset (returns HTTP 403 Forbidden).
   - Verified that User B cannot view User A's analytics (returns HTTP 403 Forbidden).
   - Verified that User B cannot download User A's executive reports (returns HTTP 403 Forbidden).
   - Verified that User B cannot delete User A's custom store (returns HTTP 403 Forbidden).
   - Verified that User B's store listing excludes User A's isolated custom stores while retaining default demo stores.
5. **PostgreSQL Row Level Security (RLS) Policies:** Specified in `migrations/001_initial_schema.sql`:
   - `stores`: Public SELECT for active stores; authenticated INSERT/UPDATE for store creators.
   - `datasets` & `sales_records`: Public SELECT for store dataset records; INSERT/UPDATE restricted to store creators.
   - `reports`: SELECT and INSERT restricted to report creators and admins.
   - `audit_logs`: INSERT enabled for system events; SELECT restricted strictly to system administrators (`auth.jwt() ->> 'role' = 'admin'`).

---

## 12. Frontend Integration Findings

- **Build Verification:** Executed `npm run build` in `frontend/`. TypeScript typechecking (`tsc -b`) and Vite bundling completed with **0 errors** in 708ms.
- **Visual Separation of Concerns:** React/Three.js frontend contains zero predictive models or calculation formulas; it acts strictly as an interactive WebGL viewport displaying JSON data supplied by the Python backend.
- **Authorization Token Injection:** Configured Axios request interceptor on the API client to automatically inject `Authorization: Bearer <token>` from local/session storage on all outgoing requests.
- **Elimination of Fake Mock Fallbacks:** Removed client-side JavaScript mock fallbacks in `constructStore` and `deleteStore`, ensuring server validation errors (such as invalid CSV schema) and security rejections are surfaced cleanly to the user.
- **Authentication Lifecycle:** Connected `App.tsx` logout button to `authApi.logout()`, ensuring sessions are revoked and `user_logout` audit logs are recorded.

---

## 13. Automated Test Results

The full automated test suite was executed against the codebase:
- **Execution Command:** `python -m pytest tests/ -v`
- **Total Test Cases:** **72**
- **Passed:** **72**
- **Failed:** **0**
- **Execution Time:** ~13.84 seconds

### Test File Breakdown
| Test File | Count | Scope | Result |
|---|---|---|---|
| `test_auth.py` | 9 | Registration, duplicates, short passwords, login, logout, profile token, Google OAuth | PASS (9/9) |
| `test_database.py` | 6 | Relational models, field synonyms, foreign keys, relationships, audit logs, migrations | PASS (6/6) |
| `test_csv_upload.py` | 5 | Filename sanitization, empty files, invalid extensions, missing columns, valid upload | PASS (5/5) |
| `test_data_loader.py` | 8 | Sample loading, alias resolution, missing revenue/price, duplicate removal, invalid dates | PASS (8/8) |
| `test_data_validation.py` | 5 | Column aliases, discount percentage math (including 1% edge case), unit price cross-imputation, negative value purging | PASS (5/5) |
| `test_store_creation.py` | 2 | Default store protection, dynamic store build and cascade deletion lifecycle | PASS (2/2) |
| `test_marketplace.py` | 5 | Deterministic plot definitions, procedural outer rings, collision detection, next plot API | PASS (5/5) |
| `test_analytics.py` | 6 | KPI calculations, filter pipelines, aggregations, category/regional shares, Pareto ranking | PASS (6/6) |
| `test_forecasting.py` | 5 | Daily series preparation, feature extraction, evaluation metrics, horizon regression | PASS (5/5) |
| `test_reporting.py` | 3 | ReportLab PDF multi-page document generation, CSV export streaming, `Report` database row persistence | PASS (3/3) |
| `test_api.py` | 8 | Health check, auth endpoints, store listing, analytics, forecasting, PDF & CSV routes | PASS (8/8) |
| `test_security.py` | 5 | SQL injection tests, service role key leak check, path traversal prevention, cross-user tenancy authorization isolation | PASS (5/5) |
| `test_integration.py` | 5 | Initial render, navigation to sales/forecasting/data management, complete user journey | PASS (5/5) |

Acceptance script: `python scripts/test_infinite_construction.py` -> **13 / 13 Acceptance Criteria PASSED**.

---

## 14. Remaining Known Issues & Limitations

1. `Minor Robustness Risk`: **Database Migrations on Live Supabase Remote Instance**
   - *Description:* While `migrations/run_migrations.py` and `alembic` are configured and verified on SQLite, running raw SQL migrations on a remote Supabase project requires either connecting with a direct PostgreSQL connection string (`DATABASE_URL`) or applying `migrations/001_initial_schema.sql` via the Supabase Dashboard SQL Editor.
2. `Shallow Verification`: **Supabase Cloud Bucket Auto-Creation**
   - *Description:* In a live Supabase environment, the `retail-datasets` and `retail-reports` storage buckets must be created via the Supabase Dashboard or Storage API prior to first write. If the buckets do not exist and the service role key lacks bucket-creation privileges, the `StorageService` automatically degrades to local filesystem storage.
3. `Minor Robustness Risk`: **Large CSV Transaction Ingestion Throughput**
   - *Description:* Ingesting datasets exceeding 100,000 rows performs batch inserts into `sales_records`. While SQLite handles tens of thousands of rows smoothly, very large CSVs (>50MB) should be handled via background asynchronous worker tasks or PostgreSQL `COPY` commands to prevent HTTP request timeouts.

---

## 15. System Status Table

| Subsystem / Feature | Status | Notes |
|---|---|---|
| Supabase Configuration & Settings | **PASS** | `src/core/config.py` loads dotenv, Supabase URL, keys, and DB credentials. |
| Dual-Tier Storage Service | **PASS** | Supabase Storage client with seamless local filesystem fallback and traversal sanitization. |
| Normalized Database Schema (9 Models) | **PASS** | `User`, `Profile`, `Store`, `Dataset`, `SalesRecord`, `ConstructionPlot`, `District`, `Report`, `AuditLog`. |
| PostgreSQL DDL & RLS Policies | **PASS** | `migrations/001_initial_schema.sql` written with indexes, check constraints, and RLS rules. |
| Python Data Validation & Imputation | **PASS** | Handles aliases, sanitizes negative values, and accurately computes discount percentages without percentage truncation. |
| Tenancy Isolation & User Authorization | **PASS** | Verified cross-user isolation: User B cannot read, modify, or delete User A's stores, datasets, analytics, or reports. |
| Executive KPIs & Pareto Product Ranking | **PASS** | 100% computed in Python `analytics_service.py`. |
| Scikit-learn Forecasting Engine | **PASS** | Linear trend regressions with chronological splits and zero-safe MAPE. |
| ReportLab Executive PDF & Deliverable DB Persistence | **PASS** | Formats tables, metrics, and summary data into downloadable PDF bytes, creating records in `public.reports`. |
| Procedural Infinite Store Construction | **PASS** | Dynamically calculates collision-free concentric district coordinates; verified up to 20 stores. |
| Security & SQL Injection Protection | **PASS** | Parameterized queries, path traversal filtering, service role key confidentiality, cross-user 403 enforcement. |
| React / Three.js Frontend Build | **PASS** | Compiled cleanly via `npm run build` with 0 errors. |
| Automated Test Suite | **PASS** | 72 passing tests across 13 test files in `tests/`. |

---
**Report Approved by:** Antigravity System Audit Agent  
**Environment:** Python 3.14 / FastAPI / Supabase PostgreSQL / React 19 Three.js

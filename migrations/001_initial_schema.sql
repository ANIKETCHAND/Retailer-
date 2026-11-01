-- ==============================================================================
-- RetailVision - Supabase PostgreSQL Initial Schema & RLS Policies Migration
-- Version: 001_initial_schema.sql
-- Normalized Architecture: Profiles, Stores, Datasets, Sales Records, Plots,
-- Districts, Reports, Audit Logs with Row Level Security & Indexes.
-- ==============================================================================

-- 1. Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. Table: PROFILES
-- Stores extended user profile information linked to Supabase Auth (auth.users)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(150) DEFAULT '',
    email VARCHAR(150) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- ==============================================================================
-- 3. Table: DISTRICTS
-- Urban commercial sector zones in the expandable 3D marketplace
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.districts (
    id VARCHAR(100) PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    district_name VARCHAR(100) NOT NULL,
    grid_x DOUBLE PRECISION DEFAULT 0.0 NOT NULL,
    grid_z DOUBLE PRECISION DEFAULT 0.0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_districts_user_id ON public.districts(user_id);

-- ==============================================================================
-- 4. Table: STORES
-- 3D Retail establishments with spatial marketplace coordinates & aggregate stats
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.stores (
    id VARCHAR(100) PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    store_name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT DEFAULT '',
    dataset_id VARCHAR(100),
    dataset_path VARCHAR(255),
    district_id VARCHAR(50) DEFAULT 'district_1',
    district_name VARCHAR(100) DEFAULT 'Central Commercial Plaza',
    building_position_x DOUBLE PRECISION DEFAULT 0.0 NOT NULL,
    building_position_z DOUBLE PRECISION DEFAULT 0.0 NOT NULL,
    rotation_y DOUBLE PRECISION DEFAULT 0.0,
    color VARCHAR(30) DEFAULT '#3B82F6',
    is_default BOOLEAN DEFAULT FALSE,
    status VARCHAR(30) DEFAULT 'completed' CHECK (status IN ('active', 'completed', 'in_progress', 'archived')),
    total_revenue DOUBLE PRECISION DEFAULT 0.0 CHECK (total_revenue >= 0.0),
    total_orders INTEGER DEFAULT 0 CHECK (total_orders >= 0),
    total_products INTEGER DEFAULT 0 CHECK (total_products >= 0),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_stores_user_id ON public.stores(user_id);
CREATE INDEX IF NOT EXISTS idx_stores_category ON public.stores(category);
CREATE INDEX IF NOT EXISTS idx_stores_district_id ON public.stores(district_id);
CREATE INDEX IF NOT EXISTS idx_stores_dataset_id ON public.stores(dataset_id);
CREATE INDEX IF NOT EXISTS idx_stores_coords ON public.stores(building_position_x, building_position_z);

-- ==============================================================================
-- 5. Table: DATASETS
-- Metadata for uploaded CSV retail sales datasets stored in Supabase Storage
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.datasets (
    id VARCHAR(100) PRIMARY KEY,
    store_id VARCHAR(100) REFERENCES public.stores(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    original_filename VARCHAR(255) NOT NULL,
    storage_path VARCHAR(500) NOT NULL,
    file_size BIGINT DEFAULT 0 CHECK (file_size >= 0),
    row_count INTEGER DEFAULT 0 CHECK (row_count >= 0),
    column_count INTEGER DEFAULT 0 CHECK (column_count >= 0),
    upload_status VARCHAR(50) DEFAULT 'completed' CHECK (upload_status IN ('uploaded', 'completed', 'failed', 'processing')),
    uploaded_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_datasets_store_id ON public.datasets(store_id);
CREATE INDEX IF NOT EXISTS idx_datasets_user_id ON public.datasets(user_id);

-- ==============================================================================
-- 6. Table: SALES_RECORDS
-- Normalized individual order line transactions parsed from datasets
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.sales_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dataset_id VARCHAR(100) NOT NULL REFERENCES public.datasets(id) ON DELETE CASCADE,
    order_id VARCHAR(100),
    order_date DATE NOT NULL,
    customer_id VARCHAR(100),
    product VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
    unit_price DOUBLE PRECISION DEFAULT 0.0 CHECK (unit_price >= 0.0),
    revenue DOUBLE PRECISION DEFAULT 0.0 CHECK (revenue >= 0.0),
    region VARCHAR(100),
    city VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sales_records_dataset_id ON public.sales_records(dataset_id);
CREATE INDEX IF NOT EXISTS idx_sales_records_order_date ON public.sales_records(order_date);
CREATE INDEX IF NOT EXISTS idx_sales_records_category ON public.sales_records(category);
CREATE INDEX IF NOT EXISTS idx_sales_records_product ON public.sales_records(product);
CREATE INDEX IF NOT EXISTS idx_sales_records_customer ON public.sales_records(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_records_region ON public.sales_records(region);

-- ==============================================================================
-- 7. Table: CONSTRUCTION_PLOTS
-- Procedurally expanding plots in the 3D world ensuring collision-free store builds
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.construction_plots (
    id VARCHAR(100) PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    plot_index INTEGER NOT NULL,
    district_id VARCHAR(50) DEFAULT 'district_1',
    district_name VARCHAR(100) DEFAULT 'Central Commercial Plaza',
    position_x DOUBLE PRECISION NOT NULL,
    position_z DOUBLE PRECISION NOT NULL,
    rotation_y DOUBLE PRECISION DEFAULT 0.0,
    status VARCHAR(30) DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'reserved')),
    associated_store_id VARCHAR(100) REFERENCES public.stores(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_plots_user_id ON public.construction_plots(user_id);
CREATE INDEX IF NOT EXISTS idx_plots_index ON public.construction_plots(plot_index);
CREATE INDEX IF NOT EXISTS idx_plots_status ON public.construction_plots(status);
CREATE INDEX IF NOT EXISTS idx_plots_coords ON public.construction_plots(position_x, position_z);

-- ==============================================================================
-- 8. Table: REPORTS
-- Stored analytical deliverables (PDF executive briefs & CSV exports)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id VARCHAR(100) REFERENCES public.stores(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    report_type VARCHAR(50) DEFAULT 'pdf' CHECK (report_type IN ('pdf', 'csv')),
    storage_path VARCHAR(500) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_reports_store_id ON public.reports(store_id);
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON public.reports(user_id);

-- ==============================================================================
-- 9. Table: AUDIT_LOGS
-- Comprehensive security audit trail for store creation, CSV uploads, deletions
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);


-- ==============================================================================
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- Strict user isolation adhering to Supabase best practices:
-- TO authenticated, auth.uid() comparisons, and WITH CHECK clauses
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.construction_plots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- PROFILES Policies
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    TO authenticated
    USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING ((SELECT auth.uid()) = user_id)
    WITH CHECK ((SELECT auth.uid()) = user_id);

-- STORES Policies (Users see their own stores + default demo stores)
CREATE POLICY "Users can select own or default stores"
    ON public.stores FOR SELECT
    TO authenticated
    USING ((SELECT auth.uid()) = user_id OR is_default = TRUE);

CREATE POLICY "Users can insert own stores"
    ON public.stores FOR INSERT
    TO authenticated
    WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own stores"
    ON public.stores FOR UPDATE
    TO authenticated
    USING ((SELECT auth.uid()) = user_id)
    WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete own non-default stores"
    ON public.stores FOR DELETE
    TO authenticated
    USING ((SELECT auth.uid()) = user_id AND is_default = FALSE);

-- DATASETS Policies
CREATE POLICY "Users can select own or default datasets"
    ON public.datasets FOR SELECT
    TO authenticated
    USING (
        (SELECT auth.uid()) = user_id OR
        store_id IN (SELECT id FROM public.stores WHERE is_default = TRUE)
    );

CREATE POLICY "Users can insert own datasets"
    ON public.datasets FOR INSERT
    TO authenticated
    WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete own datasets"
    ON public.datasets FOR DELETE
    TO authenticated
    USING ((SELECT auth.uid()) = user_id);

-- SALES_RECORDS Policies
CREATE POLICY "Users can view sales records of accessible datasets"
    ON public.sales_records FOR SELECT
    TO authenticated
    USING (
        dataset_id IN (
            SELECT id FROM public.datasets
            WHERE user_id = (SELECT auth.uid())
            OR store_id IN (SELECT id FROM public.stores WHERE is_default = TRUE)
        )
    );

CREATE POLICY "Users can insert sales records into own datasets"
    ON public.sales_records FOR INSERT
    TO authenticated
    WITH CHECK (
        dataset_id IN (
            SELECT id FROM public.datasets WHERE user_id = (SELECT auth.uid())
        )
    );

-- CONSTRUCTION_PLOTS Policies
CREATE POLICY "Users can view all plots"
    ON public.construction_plots FOR SELECT
    TO authenticated
    USING (TRUE);

CREATE POLICY "Users can update plots they occupy"
    ON public.construction_plots FOR UPDATE
    TO authenticated
    USING ((SELECT auth.uid()) = user_id OR user_id IS NULL)
    WITH CHECK ((SELECT auth.uid()) = user_id);

-- DISTRICTS Policies
CREATE POLICY "Users can view districts"
    ON public.districts FOR SELECT
    TO authenticated
    USING (TRUE);

-- REPORTS Policies
CREATE POLICY "Users can access own reports"
    ON public.reports FOR SELECT
    TO authenticated
    USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own reports"
    ON public.reports FOR INSERT
    TO authenticated
    WITH CHECK ((SELECT auth.uid()) = user_id);

-- AUDIT_LOGS Policies (Read own logs, Insert allowed)
CREATE POLICY "Users can view own audit logs"
    ON public.audit_logs FOR SELECT
    TO authenticated
    USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Authenticated users can insert audit logs"
    ON public.audit_logs FOR INSERT
    TO authenticated
    WITH CHECK ((SELECT auth.uid()) = user_id);

-- ==============================================================================
-- 11. SUPABASE STORAGE BUCKETS SETUP
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('retail-datasets', 'retail-datasets', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('retail-reports', 'retail-reports', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS
CREATE POLICY "Authenticated users can upload datasets"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'retail-datasets');

CREATE POLICY "Authenticated users can download datasets"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (bucket_id = 'retail-datasets');

CREATE POLICY "Authenticated users can upload reports"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'retail-reports');

CREATE POLICY "Authenticated users can download reports"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (bucket_id = 'retail-reports');

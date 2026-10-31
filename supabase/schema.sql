-- ========================================================
-- RetailVision 3D Marketplace - Supabase PostgreSQL Schema
-- Run this script in your Supabase SQL Editor:
-- Dashboard -> SQL Editor -> New Query -> Run
-- ========================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Stores Table (Coordinates, 3D Attributes & Pre-computed KPIs)
CREATE TABLE IF NOT EXISTS public.stores (
    id VARCHAR(50) PRIMARY KEY,
    user_id INTEGER REFERENCES public.users(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT DEFAULT '',
    dataset_path VARCHAR(255) DEFAULT '',
    grid_x DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    grid_z DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    rotation_y DOUBLE PRECISION DEFAULT 0.0,
    color VARCHAR(30) DEFAULT '#3B82F6',
    is_default BOOLEAN DEFAULT FALSE,
    total_revenue DOUBLE PRECISION DEFAULT 0.0,
    total_orders INTEGER DEFAULT 0,
    total_products INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Indexes for fast 3D map queries
CREATE INDEX IF NOT EXISTS idx_stores_category ON public.stores(category);
CREATE INDEX IF NOT EXISTS idx_stores_created_at ON public.stores(created_at);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Allow public read access to stores so any visitor can explore the 3D marketplace
CREATE POLICY "Allow public read on stores" 
ON public.stores FOR SELECT 
USING (true);

-- Allow public/authenticated insert and update for interactive store construction
CREATE POLICY "Allow store construction and updates" 
ON public.stores FOR ALL 
USING (true)
WITH CHECK (true);

-- 5. Seed Initial 3D Marketplace Stores
INSERT INTO public.stores (id, name, category, description, grid_x, grid_z, rotation_y, color, is_default, total_revenue, total_orders, total_products)
VALUES 
    (
        'store_electronics',
        'Nova Electronics',
        'Electronics',
        'High-tech gadgets, smartphones, 4K displays, and audio systems.',
        -6.5,
        -6.0,
        0.0,
        '#3B82F6',
        TRUE,
        412850.0,
        1200,
        7
    ),
    (
        'store_grocery',
        'Daily Fresh Market',
        'Grocery',
        'Organic produce, artisan baked goods, dairy, and gourmet pantry staples.',
        6.5,
        6.0,
        0.0,
        '#10B981',
        TRUE,
        341200.0,
        1500,
        8
    ),
    (
        'store_furniture',
        'Nordic Living',
        'Furniture',
        'Scandinavian solid oak dining tables, ergonomic desks, and minimalist sofas.',
        0.0,
        6.0,
        0.0,
        '#F59E0B',
        TRUE,
        265420.0,
        380,
        5
    ),
    (
        'store_fastfood',
        'Metro Burger Co.',
        'Fast Food',
        'Gourmet smash burgers, golden hand-cut fries, and craft milkshakes.',
        -6.5,
        6.0,
        0.0,
        '#EF4444',
        TRUE,
        168200.0,
        2100,
        6
    ),
    (
        'store_accessories',
        'Luxe & Leather Goods',
        'Accessories',
        'Handcrafted leather wallets, aviator sunglasses, and chronograph timepieces.',
        6.5,
        -6.0,
        0.0,
        '#8B5CF6',
        TRUE,
        198700.0,
        950,
        6
    )
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    total_revenue = EXCLUDED.total_revenue,
    total_orders = EXCLUDED.total_orders;

"""
RetailVision - Database Seeder & Default Store Initializer
Creates database schema, sets up default demo user account, generates
distinct realistic retail sales datasets for each default store, and
initializes the dynamic construction plot system.
"""

import csv
import datetime
import hashlib
import os
import random
from pathlib import Path
import numpy as np
from src.core.config import settings
from src.db.database import Base, SessionLocal, engine
from src.db.models import ConstructionPlot, Store, User
from src.services.data_service import validate_and_clean_dataset
from src.services.procedural_layout import get_plot_definition


def hash_password(password: str) -> str:
    """Generates secure SHA-256 hash with salt for local demo auth."""
    salt = "retailvision_salt_2026"
    return hashlib.sha256((password + salt).encode()).hexdigest()


def generate_store_dataset(
    output_path: Path,
    category_name: str,
    product_catalog: list,
    num_records: int = 1200,
    seed: int = 42
):
    """Generates a realistic synthetic CSV dataset for a specific store."""
    random.seed(seed)
    np.random.seed(seed)

    cities = {
        "North": ["New York", "Boston", "Chicago"],
        "South": ["Atlanta", "Miami", "Dallas"],
        "West": ["Los Angeles", "Seattle", "San Francisco"],
        "East": ["Philadelphia", "Washington D.C.", "Charlotte"],
        "Central": ["Denver", "Austin", "Kansas City"]
    }

    start_date = datetime.date(2024, 1, 1)
    end_date = datetime.date(2025, 12, 31)
    total_days = (end_date - start_date).days + 1
    customer_ids = [f"CUST-{1000 + i}" for i in range(1, 201)]

    records = []
    for i in range(num_records):
        day_offset = random.randint(0, total_days - 1)
        order_date = start_date + datetime.timedelta(days=day_offset)

        product, base_price = random.choice(product_catalog)
        price = round(base_price * random.uniform(0.95, 1.05), 2)
        qty = random.choices([1, 2, 3, 4], weights=[0.65, 0.20, 0.10, 0.05], k=1)[0]
        total = round(qty * price, 2)

        reg = random.choice(list(cities.keys()))
        city = random.choice(cities[reg])
        cust = random.choice(customer_ids)

        records.append({
            "Order ID": f"ORD-{category_name[:3].upper()}-{10001 + i}",
            "Order Date": order_date.strftime("%Y-%m-%d"),
            "Product": product,
            "Category": category_name,
            "Quantity": qty,
            "Unit Price": price,
            "Total Amount": total,
            "Region": reg,
            "City": city,
            "Customer ID": cust
        })

    records.sort(key=lambda r: r["Order Date"])
    output_path.parent.mkdir(parents=True, exist_ok=True)

    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=[
            "Order ID", "Order Date", "Product", "Category", "Quantity",
            "Unit Price", "Total Amount", "Region", "City", "Customer ID"
        ])
        writer.writeheader()
        writer.writerows(records)


def seed_database():
    """Initializes tables and seeds default user, 5 default stores, and dynamic plots."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # 1. Create or get Admin Demo User
    admin = db.query(User).filter(User.email == "admin@retailvision.com").first()
    if not admin:
        admin = User(
            username="admin",
            email="admin@retailvision.com",
            hashed_password=hash_password("admin123"),
            created_at=datetime.datetime.utcnow()
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)

    # 2. Store Catalog Definitions (5 Default Stores)
    store_definitions = [
        {
            "id": "store_electronics",
            "name": "Nova Electronics",
            "category": "Electronics",
            "description": "High-tech gadgets, smartphones, 4K displays, and audio systems.",
            "color": "#3B82F6",
            "plot_index": 0,
            "catalog": [
                ("Pro Smartphone Max", 899.99),
                ("Noise-Cancelling Headphones", 189.99),
                ("Ultra-HD Smart TV 55\"", 549.99),
                ("Slim Pro Laptop 15\"", 1199.99),
                ("Bluetooth Studio Speaker", 79.99),
                ("Fitness Tracker Watch", 149.99),
                ("Mechanical RGB Keyboard", 99.99),
                ("Wireless Fast Charger Pad", 29.99)
            ],
            "records": 1200
        },
        {
            "id": "store_grocery",
            "name": "Daily Fresh Market",
            "category": "Grocery",
            "description": "Organic produce, artisan baked goods, dairy, and gourmet pantry staples.",
            "color": "#10B981",
            "plot_index": 1,
            "catalog": [
                ("Organic Farm Fresh Milk (1 Gal)", 5.49),
                ("Artisan Sourdough Loaf", 6.25),
                ("Extra Virgin Olive Oil 500ml", 14.99),
                ("Organic Fresh Strawberries", 4.99),
                ("Single-Origin Coffee Beans (12oz)", 15.50),
                ("Free-Range Brown Eggs (12ct)", 4.80),
                ("Himalayan Pink Salt Grinder", 7.20),
                ("Aged Cheddar Cheese Wedge", 8.95)
            ],
            "records": 1500
        },
        {
            "id": "store_clothing",
            "name": "Urban Style Boutique",
            "category": "Clothing",
            "description": "Contemporary fashion, designer denim, casual wear, and seasonal coats.",
            "color": "#EC4899",
            "plot_index": 2,
            "catalog": [
                ("Raw Selvedge Denim Jeans", 79.99),
                ("Organic Cotton Classic Tee", 28.00),
                ("Tailored Oxford Dress Shirt", 54.50),
                ("Athletic Performance Runner", 89.99),
                ("Merino Wool Knit Sweater", 68.00),
                ("Winter Hooded Parka Coat", 145.00),
                ("Casual Canvas Low Sneakers", 49.99)
            ],
            "records": 1100
        },
        {
            "id": "store_furniture",
            "name": "Nordic Living Furniture",
            "category": "Furniture",
            "description": "Minimalist Scandinavian furniture, ergonomic desks, and ambient lighting.",
            "color": "#F59E0B",
            "plot_index": 3,
            "catalog": [
                ("Ergonomic Lumbar Office Chair", 199.99),
                ("Solid Oak Dining Table", 450.00),
                ("Mid-Century Velvet Armchair", 289.00),
                ("Minimalist Brass Floor Lamp", 89.99),
                ("Hand-Woven Wool Area Rug", 175.00),
                ("Floating Wall Shelf Set", 55.00)
            ],
            "records": 800
        },
        {
            "id": "store_accessories",
            "name": "Luxe & Leather Goods",
            "category": "Accessories",
            "description": "Handcrafted leather wallets, aviator sunglasses, and chronograph timepieces.",
            "color": "#8B5CF6",
            "plot_index": 4,
            "catalog": [
                ("Full-Grain Bifold Leather Wallet", 45.00),
                ("Polarized Aviator Sunglasses", 75.00),
                ("Automatic Chronograph Watch", 220.00),
                ("Silk Printed Evening Scarf", 35.00),
                ("Canvas & Leather Weekend Duffle", 110.00),
                ("Braided Leather Key Fob", 18.50)
            ],
            "records": 950
        }
    ]

    for s_def in store_definitions:
        csv_path = settings.DATA_DIR / "stores" / f"{s_def['category'].lower()}.csv"
        generate_store_dataset(
            output_path=csv_path,
            category_name=s_def["category"],
            product_catalog=s_def["catalog"],
            num_records=s_def["records"]
        )

        clean_df, report = validate_and_clean_dataset(csv_path)
        tot_rev = round(float(clean_df["total_amount"].sum()), 2)
        tot_orders = int(clean_df["order_id"].nunique())
        tot_prods = int(clean_df["product"].nunique())

        plot_info = get_plot_definition(s_def["plot_index"])

        existing_store = db.query(Store).filter(Store.id == s_def["id"]).first()
        if not existing_store:
            store = Store(
                id=s_def["id"],
                user_id=admin.id,
                name=s_def["name"],
                category=s_def["category"],
                description=s_def["description"],
                dataset_id=f"ds_{s_def['id']}",
                dataset_path=str(csv_path),
                grid_x=plot_info["grid_x"],
                grid_z=plot_info["grid_z"],
                rotation_y=plot_info["rotation_y"],
                color=s_def["color"],
                is_default=True,
                district_id=plot_info["district_id"],
                district_name=plot_info["district_name"],
                construction_status="completed",
                total_revenue=tot_rev,
                total_orders=tot_orders,
                total_products=tot_prods,
                created_at=datetime.datetime.utcnow()
            )
            db.add(store)
        else:
            existing_store.total_revenue = tot_rev
            existing_store.total_orders = tot_orders
            existing_store.total_products = tot_prods
            existing_store.dataset_path = str(csv_path)
            existing_store.grid_x = plot_info["grid_x"]
            existing_store.grid_z = plot_info["grid_z"]
            existing_store.rotation_y = plot_info["rotation_y"]
            existing_store.district_id = plot_info["district_id"]
            existing_store.district_name = plot_info["district_name"]

        # Ensure Plot Record is registered as occupied
        plot_record = db.query(ConstructionPlot).filter(ConstructionPlot.plot_index == s_def["plot_index"]).first()
        if not plot_record:
            plot_record = ConstructionPlot(
                id=f"plot_{s_def['plot_index']}",
                user_id=admin.id,
                plot_index=s_def["plot_index"],
                district_id=plot_info["district_id"],
                district_name=plot_info["district_name"],
                grid_x=plot_info["grid_x"],
                grid_z=plot_info["grid_z"],
                rotation_y=plot_info["rotation_y"],
                is_occupied=True,
                store_id=s_def["id"],
                created_at=datetime.datetime.utcnow()
            )
            db.add(plot_record)
        else:
            plot_record.is_occupied = True
            plot_record.store_id = s_def["id"]

    # 3. Ensure the first empty construction plot (Plot Index 5) is seeded and available
    first_empty_plot = get_plot_definition(5)
    existing_empty = db.query(ConstructionPlot).filter(ConstructionPlot.plot_index == 5).first()
    if not existing_empty:
        empty_plot_rec = ConstructionPlot(
            id="plot_5",
            user_id=admin.id,
            plot_index=5,
            district_id=first_empty_plot["district_id"],
            district_name=first_empty_plot["district_name"],
            grid_x=first_empty_plot["grid_x"],
            grid_z=first_empty_plot["grid_z"],
            rotation_y=first_empty_plot["rotation_y"],
            is_occupied=False,
            store_id=None,
            created_at=datetime.datetime.utcnow()
        )
        db.add(empty_plot_rec)

    db.commit()
    db.close()
    print("Database seeding completed successfully.")


if __name__ == "__main__":
    seed_database()

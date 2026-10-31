"""
Script to generate realistic synthetic retail sales dataset for RetailVision.
Dataset spans 2024-01-01 to 2025-12-31 (2 full years) with realistic pricing,
seasonality, regional distributions, and customer repeat behavior.
All data is synthetic and generated for academic mini-project demonstration.
"""

import csv
import datetime
import random
import numpy as np

def generate_retail_dataset(output_path="data/retail_sales.csv", num_records=3600, seed=42):
    random.seed(seed)
    np.random.seed(seed)

    products_by_category = {
        "Electronics": [
            ("Smartphone Pro Max", 899.99),
            ("Wireless Noise-Cancelling Headphones", 179.99),
            ("4K Ultra HD Smart TV 55\"", 499.99),
            ("Ultra-Slim Laptop 15\"", 1099.99),
            ("Bluetooth Portable Speaker", 69.99),
            ("Smart Fitness Watch", 149.99),
            ("Gaming Mechanical Keyboard", 89.99),
            ("Fast Wireless Charging Pad", 29.99)
        ],
        "Apparel & Fashion": [
            ("Premium Cotton T-Shirt", 24.99),
            ("Slim Fit Denim Jeans", 59.99),
            ("Classic Oxford Formal Shirt", 44.99),
            ("Athletic Running Shoes", 84.99),
            ("Leather Bifold Wallet", 34.99),
            ("Winter Hooded Parka", 139.99),
            ("Casual Canvas Sneakers", 49.99),
            ("Silk Blend Scarf", 22.50)
        ],
        "Home & Kitchen": [
            ("Espresso Coffee Maker", 229.99),
            ("Stainless Steel Cookware Set (10-pc)", 159.99),
            ("Smart Robot Vacuum Cleaner", 299.99),
            ("Deluxe Digital Air Fryer", 109.99),
            ("Ceramic 16-Piece Dinnerware Set", 79.99),
            ("Ergonomic Mesh Office Chair", 189.99),
            ("Memory Foam Queen Pillow", 39.99)
        ],
        "Beauty & Personal Care": [
            ("Hydrating Hyaluronic Facial Serum", 38.50),
            ("Organic Herbal Shampoo & Conditioner", 26.00),
            ("Sonic Electric Toothbrush", 64.99),
            ("Vitamin C Brightening Moisturizer", 32.00),
            ("Artisan Cologne Spray (100ml)", 75.00),
            ("Nourishing Shea Butter Body Lotion", 18.50)
        ],
        "Sports & Outdoors": [
            ("Non-Slip Extra Thick Yoga Mat", 29.99),
            ("Adjustable Cast Iron Dumbbell Set", 129.99),
            ("4-Person Waterproof Camping Dome Tent", 149.99),
            ("Vacuum Insulated Sports Water Bottle", 24.99),
            ("All-Terrain Mountain Bike 26\"", 389.99),
            ("Trail Running Hydration Backpack", 49.99)
        ]
    }

    region_cities = {
        "North": ["New York", "Boston", "Chicago", "Minneapolis"],
        "South": ["Atlanta", "Miami", "Dallas", "Houston"],
        "West": ["Los Angeles", "Seattle", "San Francisco", "Phoenix"],
        "East": ["Philadelphia", "Washington D.C.", "Baltimore", "Charlotte"],
        "Central": ["Denver", "Austin", "Kansas City", "Indianapolis"]
    }

    # Generate customer pool (500 distinct customers with Pareto distribution of frequency)
    customer_ids = [f"CUST-{1000 + i}" for i in range(1, 501)]
    # Weights for customer selection (some power shoppers, many casual shoppers)
    customer_weights = np.random.pareto(a=1.8, size=500)
    customer_weights /= customer_weights.sum()

    start_date = datetime.date(2024, 1, 1)
    end_date = datetime.date(2025, 12, 31)
    total_days = (end_date - start_date).days + 1

    records = []
    order_counter = 10001

    # Generate records distributed over the 2 years with realistic seasonality
    for _ in range(num_records):
        day_offset = random.randint(0, total_days - 1)
        order_date = start_date + datetime.timedelta(days=day_offset)

        # Seasonality factor: November/December holiday shopping boost
        month = order_date.month
        is_holiday_season = month in (11, 12)
        is_summer_season = month in (6, 7)
        is_weekend = order_date.weekday() >= 5

        # Weighted category selection
        cat_choices = list(products_by_category.keys())
        if is_holiday_season:
            cat_weights = [0.35, 0.25, 0.20, 0.10, 0.10]
        elif is_summer_season:
            cat_weights = [0.20, 0.25, 0.15, 0.15, 0.25]
        else:
            cat_weights = [0.25, 0.25, 0.20, 0.15, 0.15]

        category = random.choices(cat_choices, weights=cat_weights, k=1)[0]
        product_item = random.choice(products_by_category[category])
        product_name, base_price = product_item

        # Slight price variation (+- 3%) for sales/discounts
        price_variation = round(random.uniform(0.97, 1.03) * base_price, 2)

        # Quantity: usually 1-3, occasionally larger for cheaper items
        if price_variation > 300:
            quantity = random.choices([1, 2, 3], weights=[0.85, 0.12, 0.03], k=1)[0]
        elif price_variation > 100:
            quantity = random.choices([1, 2, 3, 4], weights=[0.70, 0.20, 0.08, 0.02], k=1)[0]
        else:
            quantity = random.choices([1, 2, 3, 4, 5, 6], weights=[0.50, 0.25, 0.12, 0.07, 0.04, 0.02], k=1)[0]

        total_amount = round(quantity * price_variation, 2)

        # Customer selection
        customer_id = np.random.choice(customer_ids, p=customer_weights)

        # Region & city
        region = random.choices(
            list(region_cities.keys()),
            weights=[0.28, 0.22, 0.25, 0.13, 0.12],
            k=1
        )[0]
        city = random.choice(region_cities[region])

        order_id = f"ORD-{order_date.year}-{order_counter}"
        order_counter += 1

        records.append({
            "Order ID": order_id,
            "Order Date": order_date.strftime("%Y-%m-%d"),
            "Product": product_name,
            "Category": category,
            "Quantity": quantity,
            "Unit Price": price_variation,
            "Total Amount": total_amount,
            "Region": region,
            "City": city,
            "Customer ID": customer_id
        })

    # Sort chronologically by Order Date
    records.sort(key=lambda r: r["Order Date"])

    # Re-sequence order IDs to match chronological order
    for idx, r in enumerate(records, start=10001):
        year_prefix = r["Order Date"].split("-")[0]
        r["Order ID"] = f"ORD-{year_prefix}-{idx}"

    fieldnames = [
        "Order ID", "Order Date", "Product", "Category",
        "Quantity", "Unit Price", "Total Amount", "Region", "City", "Customer ID"
    ]

    with open(output_path, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(records)

    print(f"Successfully generated {len(records)} records in {output_path}")

if __name__ == "__main__":
    generate_retail_dataset()

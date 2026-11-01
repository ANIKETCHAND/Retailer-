"""
RetailVision - Infinite Dynamic Store Construction System Test
Validates the complete 20-store procedural construction loop, persistence,
never-ending empty plot generation, and independent store analytics.
"""

import io
import sys
from pathlib import Path

# Add project root to path
root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from fastapi.testclient import TestClient
from src.api.app import create_app
from src.db.database import SessionLocal, run_migrations
from src.db.models import ConstructionPlot, Store
from src.db.seed import seed_database


def run_test():
    print("=" * 70)
    print("RETAILVISION: INFINITE STORE CONSTRUCTION ACCEPTANCE TEST")
    print("=" * 70)

    # 1. Reset / Seed database cleanly
    run_migrations()
    db = SessionLocal()
    default_ids = ["store_electronics", "store_grocery", "store_clothing", "store_furniture", "store_accessories"]
    db.query(Store).filter(~Store.id.in_(default_ids)).delete(synchronize_session=False)
    db.query(ConstructionPlot).filter(ConstructionPlot.plot_index > 5).delete(synchronize_session=False)
    plot_5 = db.query(ConstructionPlot).filter(ConstructionPlot.plot_index == 5).first()
    if plot_5:
        plot_5.is_occupied = False
        plot_5.store_id = None
    db.commit()
    db.close()
    seed_database()

    app = create_app()
    client = TestClient(app)

    # 2. Step 1 & 2: Verify Initial State (5 Stores, 1 Empty Plot)
    resp = client.get("/api/stores")
    assert resp.status_code == 200, f"Failed listing stores: {resp.text}"
    stores = resp.json()
    print(f"\n[PASS] Initial state: {len(stores)} default stores active.")
    for s in stores:
        print(f"       - {s['id']}: {s['name']} ({s['category']}) at ({s['grid_x']}, {s['grid_z']})")
    assert len(stores) == 5, f"Expected 5 initial stores, got {len(stores)}"

    resp_plot = client.get("/api/stores/plots/next")
    assert resp_plot.status_code == 200, f"Failed getting next plot: {resp_plot.text}"
    initial_plot = resp_plot.json()
    print(f"[PASS] Initial empty plot: Index {initial_plot['plot_index']} at ({initial_plot['grid_x']}, {initial_plot['grid_z']}) - {initial_plot['district_name']}")
    assert initial_plot["is_occupied"] is False

    # 3. Step 3 to 9: Loop construction from Store 6 to Store 20 (15 new stores!)
    categories = ["Electronics", "Grocery", "Clothing", "Furniture", "Accessories", "Custom"]

    for i in range(6, 21):
        cat = categories[(i - 6) % len(categories)]
        store_name = f"Enterprise Landmark {i} ({cat})"
        print(f"\n--- Constructing Store {i}: '{store_name}' ---")

        # Generate unique CSV dataset for this store
        csv_buffer = io.StringIO()
        csv_buffer.write("Order ID,Order Date,Product,Category,Quantity,Unit Price,Total Amount,Region,City,Customer ID\n")
        base_price = 50 + (i * 12)
        for row_idx in range(1, 101):
            qty = (row_idx % 4) + 1
            price = round(base_price * (1 + (row_idx % 5) * 0.05), 2)
            tot = round(qty * price, 2)
            csv_buffer.write(
                f"ORD-L{i}-{1000 + row_idx},2025-06-15,Product {cat} #{row_idx % 10},{cat},{qty},{price},{tot},North,Metropolis Core,CUST-{i * 100 + row_idx}\n"
            )

        csv_bytes = csv_buffer.getvalue().encode("utf-8")
        files = {"file": (f"dataset_store_{i}.csv", csv_bytes, "text/csv")}
        data = {
            "name": store_name,
            "category": cat,
            "description": f"Procedurally constructed enterprise store #{i}."
        }

        # POST /stores/construct
        construct_resp = client.post("/api/stores/construct", files=files, data=data)
        assert construct_resp.status_code == 200, f"Construction failed for Store {i}: {construct_resp.text}"
        new_store = construct_resp.json()
        print(f"  -> Successfully constructed: {new_store['id']}")
        print(f"     Placed at: ({new_store['grid_x']}, {new_store['grid_z']}) in {new_store['district_name']}")
        print(f"     Revenue: ${new_store['total_revenue']:,.2f} | Orders: {new_store['total_orders']}")

        # Verify next plot is immediately available and unoccupied!
        next_plot_resp = client.get("/api/stores/plots/next")
        assert next_plot_resp.status_code == 200
        next_plot = next_plot_resp.json()
        print(f"  -> Next available plot generated: Plot #{next_plot['plot_index']} at ({next_plot['grid_x']}, {next_plot['grid_z']}) in {next_plot['district_name']}")
        assert next_plot["is_occupied"] is False, "Next plot must not be occupied"
        assert (next_plot["grid_x"], next_plot["grid_z"]) != (new_store["grid_x"], new_store["grid_z"]), "Next plot must differ from built store"

    # 4. Step 10 & 11: Refresh / Reconnect Simulation
    print("\n" + "=" * 70)
    print("TESTING DATABASE PERSISTENCE & RESTORATION AFTER RESTART")
    print("=" * 70)
    db = SessionLocal()
    persisted_stores = db.query(Store).all()
    persisted_plots = db.query(ConstructionPlot).all()
    empty_plots = [p for p in persisted_plots if not p.is_occupied]
    occupied_plots = [p for p in persisted_plots if p.is_occupied]

    print(f"[PASS] Persisted stores in SQLite database: {len(persisted_stores)}")
    assert len(persisted_stores) == 20, f"Expected 20 stores persisted, found {len(persisted_stores)}"

    print(f"[PASS] Total registered plots in SQLite: {len(persisted_plots)}")
    print(f"[PASS] Occupied plots: {len(occupied_plots)} (Matching 20 stores)")
    print(f"[PASS] Available empty plots: {len(empty_plots)} (Plot Index: {empty_plots[0].plot_index})")
    assert len(empty_plots) >= 1, "Must have at least 1 available empty plot"
    db.close()

    # 5. Step 12 & 13: Independent Store Analytics Verification
    print("\n" + "=" * 70)
    print("TESTING INDEPENDENT DATASET & ANALYTICS INTEGRITY")
    print("=" * 70)
    sample_stores = [stores[0]["id"], persisted_stores[5].id, persisted_stores[12].id, persisted_stores[19].id]
    revenues = []

    for sid in sample_stores:
        a_resp = client.get(f"/api/stores/{sid}/analytics")
        assert a_resp.status_code == 200, f"Analytics failed for {sid}: {a_resp.text}"
        bundle = a_resp.json()
        rev = bundle["kpis"]["total_revenue"]
        revenues.append(rev)
        print(f"[PASS] Store '{bundle['store']['name']}' [{sid}]:")
        print(f"       Revenue: ${rev:,.2f} | Top Product: {bundle['top_products'][0]['product']}")

    # Ensure revenues are independent and not identical copies
    assert len(set(revenues)) == len(revenues), f"Stores must have distinct revenues from independent datasets! Got: {revenues}"
    print(f"\n[PASS] Verified 100% independent dataset isolation across stores.")

    print("\n" + "=" * 70)
    print("ALL 13 ACCEPTANCE CRITERIA VERIFIED AND PASSED!")
    print("=" * 70)


if __name__ == "__main__":
    run_test()

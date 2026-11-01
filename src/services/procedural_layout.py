"""
RetailVision - Procedural City Layout & Plot Allocation Engine
Generates deterministic, collision-free 3D building coordinates across expanding
districts for infinite marketplace growth.
"""

from typing import Dict, List, Optional, Tuple

DISTRICT_DEFINITIONS = [
    {
        "id": "district_1",
        "name": "Central Commercial Plaza",
        "theme": "Metropolitan Flagship Core",
        "color": "#38bdf8",
        "center": (0.0, 0.0),
        "plots": [
            (-6.5, -6.0),   # 0: Store 1 (Electronics) - West Core North
            (6.5, 6.0),     # 1: Store 2 (Grocery) - East Core South
            (-6.5, 6.0),    # 2: Store 3 (Clothing) - West Core South
            (13.5, 6.0),    # 3: Store 4 (Furniture) - East Core South outer
            (6.5, -6.0),    # 4: Store 5 (Accessories) - East Core North
            (13.5, -6.0),   # 5: Plot 1 (First empty plot for Store 6) - East Core North outer
            (-13.5, -6.0),  # 6: Plot 2 - West Core North outer
            (-13.5, 6.0),   # 7: Plot 3 - West Core South outer
        ]
    },
    {
        "id": "district_2",
        "name": "East Boulevard Commercial Hub",
        "theme": "Contemporary Retail & Dining",
        "color": "#f59e0b",
        "center": (34.0, 0.0),
        "plots": [
            (31.0, -6.5),   # 8: Plot 4 - East Block North
            (31.0, 6.5),    # 9: Plot 5 - East Block South
            (38.0, -6.5),   # 10: Plot 6 - East Block North outer
            (38.0, 6.5),    # 11: Plot 7 - East Block South outer
            (31.0, -14.0),  # 12: Plot 8 - East Block Far North
            (31.0, 14.0),   # 13: Plot 9 - East Block Far South
            (38.0, -14.0),  # 14: Plot 10 - East Block Far North outer
            (38.0, 14.0),   # 15: Plot 11 - East Block Far South outer
        ]
    },
    {
        "id": "district_3",
        "name": "West Fashion Promenade",
        "theme": "Luxury Boutiques & Salons",
        "color": "#ec4899",
        "center": (-34.0, 0.0),
        "plots": [
            (-31.0, -6.5),  # 16: Plot 12 - West Block North
            (-31.0, 6.5),   # 17: Plot 13 - West Block South
            (-38.0, -6.5),  # 18: Plot 14 - West Block North outer
            (-38.0, 6.5),   # 19: Plot 15 - West Block South outer
            (-31.0, -14.0), # 20: Plot 16 - West Block Far North
            (-31.0, 14.0),  # 21: Plot 17 - West Block Far South
            (-38.0, -14.0), # 22: Plot 18 - West Block Far North outer
            (-38.0, 14.0),  # 23: Plot 19 - West Block Far South outer
        ]
    },
    {
        "id": "district_4",
        "name": "North Innovation Parkway",
        "theme": "Technology & Smart Living",
        "color": "#10b981",
        "center": (0.0, -34.0),
        "plots": [
            (-6.5, -31.0),  # 24: Plot 20 - North Block West
            (6.5, -31.0),   # 25: Plot 21 - North Block East
            (-13.5, -31.0), # 26: Plot 22 - North Block West outer
            (13.5, -31.0),  # 27: Plot 23 - North Block East outer
            (-6.5, -38.0),  # 28: Plot 24 - North Block Far West
            (6.5, -38.0),   # 29: Plot 25 - North Block Far East
            (-13.5, -38.0), # 30: Plot 26 - North Block Far West outer
            (13.5, -38.0),  # 31: Plot 27 - North Block Far East outer
        ]
    },
    {
        "id": "district_5",
        "name": "South Marina Waterfront",
        "theme": "Coastal Lifestyle & Artisan Goods",
        "color": "#8b5cf6",
        "center": (0.0, 34.0),
        "plots": [
            (-6.5, 31.0),   # 32: Plot 28 - South Block West
            (6.5, 31.0),    # 33: Plot 29 - South Block East
            (-13.5, 31.0),  # 34: Plot 30 - South Block West outer
            (13.5, 31.0),   # 35: Plot 31 - South Block East outer
            (-6.5, 38.0),   # 36: Plot 32 - South Block Far West
            (6.5, 38.0),    # 37: Plot 33 - South Block Far East
            (-13.5, 38.0),  # 38: Plot 34 - South Block Far West outer
            (13.5, 38.0),   # 39: Plot 35 - South Block Far East outer
        ]
    }
]


def get_plot_definition(index: int) -> Dict:
    """
    Returns deterministic plot coordinates, district metadata, and rotation for any plot index.
    For index >= 40, procedurally generates expanding outer district rings.
    """
    # 1. Check curated districts (Indices 0 to 39)
    current_offset = 0
    for district in DISTRICT_DEFINITIONS:
        count = len(district["plots"])
        if index < current_offset + count:
            rel_idx = index - current_offset
            gx, gz = district["plots"][rel_idx]
            # Face towards nearest central avenue
            rot_y = 0.0
            if abs(gx) > abs(gz):
                rot_y = -1.57 if gx > 0 else 1.57
            else:
                rot_y = 3.14 if gz > 0 else 0.0

            return {
                "plot_index": index,
                "grid_x": round(float(gx), 2),
                "grid_z": round(float(gz), 2),
                "rotation_y": rot_y,
                "district_id": district["id"],
                "district_name": district["name"],
                "theme": district["theme"],
                "color": district["color"]
            }
        current_offset += count

    # 2. Infinite Procedural Outer Ring Extension (Index >= 40)
    extra_idx = index - 40
    ring = 6 + (extra_idx // 16)
    slot = extra_idx % 16
    side = slot // 4
    pos_in_side = slot % 4

    step = 6.5
    base_dist = 28.0 + (ring - 6) * 12.0
    offsets = [-9.75, -3.25, 3.25, 9.75]
    lateral = offsets[pos_in_side]

    if side == 0:    # East
        gx = base_dist
        gz = lateral
        rot_y = -1.57
    elif side == 1:  # West
        gx = -base_dist
        gz = lateral
        rot_y = 1.57
    elif side == 2:  # North
        gx = lateral
        gz = -base_dist
        rot_y = 0.0
    else:            # South
        gx = lateral
        gz = base_dist
        rot_y = 3.14

    return {
        "plot_index": index,
        "grid_x": round(float(gx), 2),
        "grid_z": round(float(gz), 2),
        "rotation_y": rot_y,
        "district_id": f"district_{ring}",
        "district_name": f"Metropolis District {ring}",
        "theme": "Expanded Metropolitan Zone",
        "color": "#6366f1"
    }


def find_next_unoccupied_plot(occupied_coords: List[Tuple[float, float]]) -> Dict:
    """
    Finds the first procedural plot that is NOT occupied by any existing building.
    Guarantees that when plot N is occupied, plot N+1 is immediately returned.
    """
    index = 0
    while True:
        plot = get_plot_definition(index)
        is_occupied = any(
            ((plot["grid_x"] - ox) ** 2 + (plot["grid_z"] - oz) ** 2) ** 0.5 < 3.2
            for ox, oz in occupied_coords
        )
        if not is_occupied:
            return plot
        index += 1

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
            (-6.5, -6.0),   # 0: Default Store 1 (Electronics)
            (6.5, 6.0),     # 1: Default Store 2 (Grocery)
            (-6.5, 6.0),    # 2: Default Store 3 (Clothing)
            (13.0, 6.0),    # 3: Default Store 4 (Furniture)
            (6.5, -6.0),    # 4: Default Store 5 (Accessories)
            (13.0, -6.0),   # 5: Plot 1 (First empty plot for Store 6)
            (-13.0, -6.0),  # 6: Plot 2
            (-13.0, 6.0),   # 7: Plot 3
        ]
    },
    {
        "id": "district_2",
        "name": "East Boulevard Commercial Hub",
        "theme": "Contemporary Retail & Dining",
        "color": "#f59e0b",
        "center": (22.5, 0.0),
        "plots": [
            (19.5, -6.0),   # 8: Plot 4
            (19.5, 6.0),    # 9: Plot 5
            (25.5, -6.0),   # 10: Plot 6
            (25.5, 6.0),    # 11: Plot 7
            (19.5, -12.0),  # 12: Plot 8
            (19.5, 12.0),   # 13: Plot 9
            (25.5, -12.0),  # 14: Plot 10
            (25.5, 12.0),   # 15: Plot 11
        ]
    },
    {
        "id": "district_3",
        "name": "West Fashion Promenade",
        "theme": "Luxury Boutiques & Salons",
        "color": "#ec4899",
        "center": (-22.5, 0.0),
        "plots": [
            (-19.5, -6.0),  # 16: Plot 12
            (-19.5, 6.0),   # 17: Plot 13
            (-25.5, -6.0),  # 18: Plot 14
            (-25.5, 6.0),   # 19: Plot 15
            (-19.5, -12.0), # 20: Plot 16
            (-19.5, 12.0),  # 21: Plot 17
            (-25.5, -12.0), # 22: Plot 18
            (-25.5, 12.0),  # 23: Plot 19
        ]
    },
    {
        "id": "district_4",
        "name": "North Innovation Parkway",
        "theme": "Technology & Smart Living",
        "color": "#10b981",
        "center": (0.0, -19.0),
        "plots": [
            (-6.5, -16.0),  # 24: Plot 20
            (6.5, -16.0),   # 25: Plot 21
            (-13.0, -16.0), # 26: Plot 22
            (13.0, -16.0),  # 27: Plot 23
            (-6.5, -22.0),  # 28: Plot 24
            (6.5, -22.0),   # 29: Plot 25
            (-13.0, -22.0), # 30: Plot 26
            (13.0, -22.0),  # 31: Plot 27
        ]
    },
    {
        "id": "district_5",
        "name": "South Marina Waterfront",
        "theme": "Coastal Lifestyle & Artisan Goods",
        "color": "#8b5cf6",
        "center": (0.0, 19.0),
        "plots": [
            (-6.5, 16.0),   # 32: Plot 28
            (6.5, 16.0),    # 33: Plot 29
            (-13.0, 16.0),  # 34: Plot 30
            (13.0, 16.0),   # 35: Plot 31
            (-6.5, 22.0),   # 36: Plot 32
            (6.5, 22.0),    # 37: Plot 33
            (-13.0, 22.0),  # 38: Plot 34
            (13.0, 22.0),   # 39: Plot 35
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

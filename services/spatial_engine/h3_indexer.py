"""
SafePath-X Uber H3 Hexagonal Spatial Indexer (Resolution-9)
Provides O(1) constant-time coordinate-to-hexagon mapping and risk scoring.
"""

import os
import json
import math
import time
from typing import List, Tuple, Dict, Any
from .redis_cache import spatial_cache

try:
    import h3
    H3_LIB_AVAILABLE = True
except ImportError:
    H3_LIB_AVAILABLE = False


class H3SpatialIndexer:
    def __init__(self, resolution: int = 9):
        self.resolution = resolution
        self.cache = spatial_cache
        self._bootstrap_seeded_cache()

    def _bootstrap_seeded_cache(self) -> None:
        """Loads pre-generated H3 risk cache from disk into Redis/in-memory cache on startup if available."""
        cache_file = os.path.join(os.path.dirname(__file__), "data", "h3_risk_cache.json")
        if os.path.exists(cache_file):
            try:
                import json
                with open(cache_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    cells = data.get("cells", {})
                    for h3_idx, cell_data in cells.items():
                        self.cache.set_cell_risk(h3_idx, cell_data, ttl_seconds=86400)
                    print(f"[H3 Indexer] Bootstrapped {len(cells)} empirically-seeded H3 cells from disk cache")
            except Exception as e:
                print(f"[H3 Indexer] Cache bootstrap note: {e}")

    def lat_lng_to_h3(self, lat: float, lng: float, res: int = None) -> str:
        """
        Converts (lat, lng) to an H3 index string in O(1) time.
        Resolution 9 represents ~174m hexagon edge length (~0.1 km²).
        """
        target_res = res if res is not None else self.resolution

        if H3_LIB_AVAILABLE:
            try:
                # Support both h3 v3 and v4 APIs
                if hasattr(h3, 'latlng_to_cell'):
                    return h3.latlng_to_cell(lat, lng, target_res)
                elif hasattr(h3, 'geo_to_h3'):
                    return h3.geo_to_h3(lat, lng, target_res)
            except Exception:
                pass

        # Standard deterministic geometric fallback
        scale = 1000 if target_res == 9 else 200 if target_res == 8 else 40
        lat_idx = int(math.floor(lat * scale))
        lng_idx = int(math.floor(lng * scale))
        return f"8{target_res}6{abs(lat_idx):06x}{abs(lng_idx):06x}"

    def h3_to_boundary(self, h3_index: str) -> List[Tuple[float, float]]:
        """
        Returns the 6 boundary vertices [(lat, lng), ...] of an H3 cell.
        """
        if H3_LIB_AVAILABLE:
            try:
                if hasattr(h3, 'cell_to_boundary'):
                    return h3.cell_to_boundary(h3_index)
                elif hasattr(h3, 'h3_to_geo_boundary'):
                    return h3.h3_to_geo_boundary(h3_index)
            except Exception:
                pass

        # Approximate hexagon boundary
        radius_meters = 174.0 if self.resolution == 9 else 550.0
        # Parse approximate center from index if available or default
        lat_radius = radius_meters / 111320.0
        lng_radius = radius_meters / (111320.0 * math.cos(math.radians(27.2481)))

        vertices = []
        center_lat, center_lng = 27.2481, 77.8345
        for i in range(6):
            angle_rad = math.radians(i * 60)
            v_lat = center_lat + lat_radius * math.sin(angle_rad)
            v_lng = center_lng + lng_radius * math.cos(angle_rad)
            vertices.append((round(v_lat, 6), round(v_lng, 6)))
        return vertices

    def calculate_cell_risk(self, h3_index: str, lat: float, lng: float, timestamp: float = None) -> Dict[str, Any]:
        """
        Calculates or retrieves the composite risk score for an H3 cell.
        Formula:
        Risk = 0.35*Crime + 0.20*Lighting(t) + 0.15*Crowd + 0.10*Terrain - 0.20*Police
        """
        # 1. Check Redis Cache
        cached = self.cache.get_cell_risk(h3_index)
        if cached:
            return cached

        # 2. Compute dynamic spatio-temporal risk factors
        ts = timestamp if timestamp else time.time()
        hour = time.localtime(ts).tm_hour
        is_night = hour >= 19 or hour < 6

        # Distance to known hazard/safe anchors (e.g. Keetham Forest, Taj Mahal, Sharda / Anand Campus)
        dist_to_keetham = math.hypot(lat - 27.2510, lng - 77.8420)
        dist_to_sharda = math.hypot(lat - 27.2481, lng - 77.8345)
        dist_to_taj = math.hypot(lat - 27.1751, lng - 78.0421)

        crime_weight = 2.0
        lighting_weight = 9.0 if is_night else 1.5
        crowd_density = 3.0
        terrain_hazard = 1.0
        police_protection = 7.0

        if dist_to_keetham < 0.008:
            # Danger Zone: Reserve Forest
            crime_weight = 8.5
            lighting_weight = 9.8 if is_night else 5.0
            crowd_density = 8.5 # high isolation
            terrain_hazard = 9.0
            police_protection = 1.0
        elif dist_to_sharda < 0.006:
            # Safe Zone: Campus Enclave
            crime_weight = 0.8
            lighting_weight = 0.5
            crowd_density = 1.5 # safe social density
            police_protection = 9.5
        elif dist_to_taj < 0.007:
            # Safe Zone: CISF Protected Heritage
            crime_weight = 1.0
            lighting_weight = 0.8
            crowd_density = 2.0
            police_protection = 9.8

        composite_risk = (
            0.35 * crime_weight +
            0.20 * lighting_weight +
            0.15 * crowd_density +
            0.10 * terrain_hazard -
            0.20 * police_protection
        )

        clamped_risk = round(max(0.5, min(9.9, composite_risk)), 2)
        safety_score = max(5, min(99, int(round(100 - clamped_risk * 10))))

        zone_type = "safe" if clamped_risk < 3.5 else "caution" if clamped_risk < 5.5 else "danger"

        risk_payload = {
            "h3_index": h3_index,
            "resolution": self.resolution,
            "latitude": round(lat, 6),
            "longitude": round(lng, 6),
            "composite_risk_score": clamped_risk,
            "safety_rating_percent": safety_score,
            "zone_classification": zone_type,
            "factors": {
                "crime": crime_weight,
                "lighting": lighting_weight,
                "crowd": crowd_density,
                "terrain": terrain_hazard,
                "police": police_protection
            },
            "timestamp": ts
        }

        # 3. Store in Redis/Cache
        self.cache.set_cell_risk(h3_index, risk_payload, ttl_seconds=3600)
        return risk_payload


# Global singleton instance
h3_indexer = H3SpatialIndexer(resolution=9)

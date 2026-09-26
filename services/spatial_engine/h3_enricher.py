"""
SafePath-X Uber H3 Spatial Enrichment Worker
Enriches H3 Resolution-9 cells with empirical OSM infrastructure (police stations, street lighting) and Kaggle crime data.
"""

import json
import os
import math
from typing import Dict, Any, List, Tuple
from .h3_indexer import h3_indexer
from .redis_cache import spatial_cache
from .data_ingest.osm_collector import fetch_osm_infrastructure, DEFAULT_AGRA_BBOX
from .data_ingest.crime_harmonizer import crime_harmonizer


class H3SpatialEnricher:
    def __init__(self, bbox: tuple = DEFAULT_AGRA_BBOX):
        self.bbox = bbox
        self.police_nodes: List[Tuple[float, float, str]] = []  # (lat, lng, name)
        self.lighting_nodes: List[Tuple[float, float]] = []     # (lat, lng)

    def load_osm_features(self, geojson_data: Dict[str, Any]) -> None:
        """Parses extracted OSM features into spatial search lists."""
        self.police_nodes.clear()
        self.lighting_nodes.clear()

        features = geojson_data.get("features", [])
        for feat in features:
            geom = feat.get("geometry", {})
            props = feat.get("properties", {})
            coords = geom.get("coordinates", [])
            if len(coords) >= 2:
                lng, lat = float(coords[0]), float(coords[1])
                if props.get("amenity") == "police":
                    self.police_nodes.append((lat, lng, props.get("name", "Police Outpost")))
                elif props.get("highway") == "street_lamp" or props.get("lit") == "yes":
                    self.lighting_nodes.append((lat, lng))

        print(f"[H3 Enricher] Loaded {len(self.police_nodes)} police stations & {len(self.lighting_nodes)} lighting nodes")

    def find_nearest_police(self, lat: float, lng: float) -> Tuple[float, str]:
        """Finds distance in meters to nearest police station and its name."""
        if not self.police_nodes:
            return 2500.0, "Regional Police Command"

        min_dist = float("inf")
        nearest_name = "Police Post"

        for p_lat, p_lng, name in self.police_nodes:
            d_m = math.hypot((lat - p_lat) * 111320.0, (lng - p_lng) * 111320.0 * math.cos(math.radians(lat)))
            if d_m < min_dist:
                min_dist = d_m
                nearest_name = name

        return round(min_dist, 1), nearest_name

    def count_nearby_lights(self, lat: float, lng: float, radius_m: float = 350.0) -> int:
        """Counts street lighting points within given radius."""
        count = 0
        for l_lat, l_lng in self.lighting_nodes:
            d_m = math.hypot((lat - l_lat) * 111320.0, (lng - l_lng) * 111320.0 * math.cos(math.radians(lat)))
            if d_m <= radius_m:
                count += 1
        return count

    def generate_and_enrich_grid(
        self,
        step_deg: float = 0.004, # ~400m grid sampling across bounding box
        export_file: str = None
    ) -> Dict[str, Dict[str, Any]]:
        """
        Iterates over the Agra bounding box, converts points to H3 resolution-9 cells,
        computes empirical multi-factor risk scores, and caches results.
        """
        min_lat, min_lng, max_lat, max_lng = self.bbox
        enriched_cache: Dict[str, Dict[str, Any]] = {}

        lat = min_lat
        while lat <= max_lat:
            lng = min_lng
            while lng <= max_lng:
                h3_index = h3_indexer.lat_lng_to_h3(lat, lng, res=9)

                # Avoid duplicate cell enrichment
                if h3_index not in enriched_cache:
                    # 1. Police proximity & mitigation
                    dist_police_m, police_name = self.find_nearest_police(lat, lng)
                    # Proximity factor: < 300m = 9.8, > 2500m = 2.0
                    police_factor = max(1.5, min(9.9, 10.0 - (dist_police_m / 300.0)))

                    # 2. Street lighting count & illumination factor
                    light_count = self.count_nearby_lights(lat, lng, radius_m=400.0)
                    # Illumination factor: high lights = 1.0 (low hazard), no lights = 8.5 (high hazard)
                    lighting_hazard = max(1.0, 9.0 - (light_count * 2.0))

                    # 3. Real crime density from harmonizer
                    crime_density = crime_harmonizer.compute_spatial_crime_density(lat, lng, bandwidth_km=1.2)

                    # 4. Terrain & isolation hazard (Keetham Forest & Yamuna floodplain)
                    dist_to_keetham = math.hypot(lat - 27.2510, lng - 77.8420)
                    dist_to_yamuna = math.hypot(lat - 27.1850, lng - 78.0350)
                    terrain_hazard = 9.0 if dist_to_keetham < 0.008 else 8.0 if dist_to_yamuna < 0.006 else 1.5
                    crowd_isolation = 8.5 if (dist_to_keetham < 0.008 or dist_to_yamuna < 0.006) else 2.5

                    # 5. Composite Risk Calculation
                    # Formula: 0.35*Crime + 0.20*Lighting + 0.15*Crowd + 0.10*Terrain - 0.20*Police
                    composite_risk = (
                        0.35 * crime_density +
                        0.20 * lighting_hazard +
                        0.15 * crowd_isolation +
                        0.10 * terrain_hazard -
                        0.20 * police_factor
                    )

                    clamped_risk = round(max(0.5, min(9.9, composite_risk)), 2)
                    safety_score = max(5, min(99, int(round(100 - clamped_risk * 10))))
                    zone_type = "safe" if clamped_risk < 3.5 else "caution" if clamped_risk < 5.5 else "danger"

                    cell_record = {
                        "h3_index": h3_index,
                        "resolution": 9,
                        "latitude": round(lat, 6),
                        "longitude": round(lng, 6),
                        "composite_risk_score": clamped_risk,
                        "safety_rating_percent": safety_score,
                        "zone_classification": zone_type,
                        "empirical_factors": {
                            "nearest_police_name": police_name,
                            "nearest_police_dist_meters": dist_police_m,
                            "police_mitigation_score": round(police_factor, 2),
                            "street_lamp_count": light_count,
                            "lighting_hazard_score": round(lighting_hazard, 2),
                            "crime_density_score": crime_density,
                            "terrain_hazard_score": terrain_hazard
                        },
                        "is_empirically_seeded": True
                    }

                    # Seed into Redis & memory
                    spatial_cache.set_cell_risk(h3_index, cell_record, ttl_seconds=86400)
                    enriched_cache[h3_index] = cell_record

                lng += step_deg
            lat += step_deg

        print(f"[H3 Enricher] Successfully generated and enriched {len(enriched_cache)} H3 Resolution-9 cells")

        if export_file:
            os.makedirs(os.path.dirname(export_file), exist_ok=True)
            with open(export_file, "w", encoding="utf-8") as f:
                json.dump({"total_cells": len(enriched_cache), "cells": enriched_cache}, f, indent=2)
            print(f"[H3 Enricher] Exported H3 risk cache to {export_file}")

        return enriched_cache


# Global singleton enricher
h3_enricher = H3SpatialEnricher()


def run_full_enrichment_pipeline(export_cache: bool = True) -> Dict[str, Any]:
    """Runs end-to-end OSM collector, Crime Harmonizer, and H3 Spatial Enrichment."""
    data_dir = os.path.join(os.path.dirname(__file__), "data")
    osm_file = os.path.join(data_dir, "agra_osm_infrastructure.geojson")
    crime_file = os.path.join(data_dir, "agra_crime_incidents.json")
    h3_cache_file = os.path.join(data_dir, "h3_risk_cache.json")

    print("--- [1/3] Fetching OpenStreetMap Infrastructure ---")
    osm_data = fetch_osm_infrastructure(output_filepath=osm_file)

    print("--- [2/3] Harmonizing Kaggle Crime Metrics ---")
    crime_harmonizer.export_harmonized_dataset(crime_file)

    print("--- [3/3] Generating & Seeding Enriched H3 Hexagonal Risk Grid ---")
    h3_enricher.load_osm_features(osm_data)
    cache = h3_enricher.generate_and_enrich_grid(step_deg=0.005, export_file=h3_cache_file if export_cache else None)

    return cache


if __name__ == "__main__":
    run_full_enrichment_pipeline()

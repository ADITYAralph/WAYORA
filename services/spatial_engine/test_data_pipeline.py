"""
SafePath-X Geospatial Data Ingestion & H3 Enrichment Verification Suite
Validates OSM infrastructure extraction, Kaggle crime density computation, and H3 cell hazard differentiation.
"""

import unittest
import os
import json
from services.spatial_engine.h3_indexer import h3_indexer
from services.spatial_engine.h3_enricher import run_full_enrichment_pipeline
from services.spatial_engine.data_ingest.osm_collector import fetch_osm_infrastructure
from services.spatial_engine.data_ingest.crime_harmonizer import crime_harmonizer


class TestDataPipeline(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Run pipeline and seed cache
        cls.cache = run_full_enrichment_pipeline(export_cache=True)

    def test_01_osm_infrastructure_geojson_extraction(self):
        """Verify OSM Collector yields valid GeoJSON with police and street lighting nodes."""
        data_dir = os.path.join(os.path.dirname(__file__), "data")
        osm_file = os.path.join(data_dir, "agra_osm_infrastructure.geojson")
        self.assertTrue(os.path.exists(osm_file), "GeoJSON infrastructure file should exist")

        with open(osm_file, "r", encoding="utf-8") as f:
            geojson = json.load(f)

        features = geojson.get("features", [])
        self.assertGreater(len(features), 5, "Should extract at least 5 empirical features")

        # Check for presence of police and street lamps
        has_police = any(f["properties"].get("amenity") == "police" for f in features)
        has_lamp = any(f["properties"].get("highway") == "street_lamp" for f in features)
        self.assertTrue(has_police, "GeoJSON should contain police amenities")
        self.assertTrue(has_lamp, "GeoJSON should contain street lighting nodes")

    def test_02_kaggle_crime_density_harmonization(self):
        """Verify Kaggle crime density calculation at high-risk vs safe coordinates."""
        # 1. High crime density at Yamuna floodplain
        yamuna_crime = crime_harmonizer.compute_spatial_crime_density(27.1850, 78.0350)
        # 2. Low crime density at Sharda / Anand Campus
        sharda_crime = crime_harmonizer.compute_spatial_crime_density(27.2481, 77.8345)

        self.assertGreater(yamuna_crime, sharda_crime, "Yamuna floodplain crime density should exceed campus core")
        self.assertGreaterEqual(yamuna_crime, 4.0)

    def test_03_taj_east_gate_h3_enrichment(self):
        """Verify Taj East Gate H3 cell reflects high police mitigation & safe classification."""
        lat, lng = 27.1751, 78.0421  # Taj East Gate
        h3_cell = h3_indexer.lat_lng_to_h3(lat, lng, res=9)
        risk_info = h3_indexer.calculate_cell_risk(h3_cell, lat, lng)

        self.assertEqual(risk_info["zone_classification"], "safe")
        self.assertGreaterEqual(risk_info["safety_rating_percent"], 70)

        # Verify empirical factors if present
        if "empirical_factors" in risk_info:
            police_factor = risk_info["empirical_factors"]["police_mitigation_score"]
            self.assertGreaterEqual(police_factor, 8.0, "Taj East Gate police mitigation should be >= 8.0")

    def test_04_keetham_forest_h3_enrichment(self):
        """Verify Keetham Forest H3 cell reflects danger classification and high terrain hazard."""
        lat, lng = 27.2510, 77.8420  # Keetham Lake Forest
        h3_cell = h3_indexer.lat_lng_to_h3(lat, lng, res=9)
        risk_info = h3_indexer.calculate_cell_risk(h3_cell, lat, lng)

        self.assertEqual(risk_info["zone_classification"], "danger")
        self.assertGreater(risk_info["composite_risk_score"], 5.0)

    def test_05_legacy_api_compatibility(self):
        """Verify backward compatibility of risk score response dictionary."""
        lat, lng = 27.2481, 77.8345
        h3_cell = h3_indexer.lat_lng_to_h3(lat, lng, res=9)
        risk = h3_indexer.calculate_cell_risk(h3_cell, lat, lng)

        self.assertIn("h3_index", risk)
        self.assertIn("composite_risk_score", risk)
        self.assertIn("safety_rating_percent", risk)
        self.assertIn("zone_classification", risk)


if __name__ == "__main__":
    unittest.main()

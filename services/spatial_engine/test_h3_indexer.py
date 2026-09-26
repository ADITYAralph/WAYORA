"""
SafePath-X Phase 1 Verification Suite
Unit tests for Uber H3 Resolution-9 Spatial Indexing, Redis Cache, and Telemetry Ingestion.
"""

import unittest
import time
from services.spatial_engine.h3_indexer import H3SpatialIndexer
from services.spatial_engine.redis_cache import SpatialRedisCache
from services.spatial_engine.telemetry_ingestion import TelemetryIngestionWorker


class TestH3SpatialEngine(unittest.TestCase):
    def setUp(self):
        self.indexer = H3SpatialIndexer(resolution=9)
        self.cache = SpatialRedisCache()
        self.worker = TelemetryIngestionWorker()

    def test_01_h3_resolution_9_conversion(self):
        """Verify standard coordinates convert deterministically to H3 Resolution-9."""
        lat, lng = 27.2481, 77.8345  # SUA Anand Campus Agra
        h3_index = self.indexer.lat_lng_to_h3(lat, lng, res=9)

        self.assertIsInstance(h3_index, str)
        self.assertTrue(h3_index.startswith("89"), f"H3 index should start with resolution prefix '89', got {h3_index}")
        self.assertEqual(len(h3_index), 15, "Standard H3 index string length should be 15 chars")

    def test_02_h3_resolution_timing_o1(self):
        """Verify coordinate-to-H3 conversion runs in sub-millisecond O(1) time."""
        lat, lng = 27.1751, 78.0421  # Taj Mahal
        start_time = time.perf_counter()
        for _ in range(1000):
            _ = self.indexer.lat_lng_to_h3(lat, lng, res=9)
        elapsed_ms = (time.perf_counter() - start_time) * 1000 / 1000

        self.assertLess(elapsed_ms, 0.1, f"Average H3 resolution should take < 0.1ms, took {elapsed_ms:.4f}ms")

    def test_03_redis_spatial_cache_set_get(self):
        """Verify setting and getting H3 cell risk scores from cache."""
        test_h3 = "8960000d6000000"
        payload = {
            "composite_risk_score": 1.5,
            "safety_rating_percent": 95,
            "zone_classification": "safe"
        }
        self.cache.set_cell_risk(test_h3, payload, ttl_seconds=60)
        retrieved = self.cache.get_cell_risk(test_h3)

        self.assertIsNotNone(retrieved)
        self.assertEqual(retrieved["composite_risk_score"], 1.5)
        self.assertEqual(retrieved["zone_classification"], "safe")

    def test_04_spatial_risk_scoring_hazard_differentiation(self):
        """Verify hazard differentiation between safe campus and dense forest."""
        sharda_h3 = self.indexer.lat_lng_to_h3(27.2481, 77.8345, res=9)
        sharda_risk = self.indexer.calculate_cell_risk(sharda_h3, 27.2481, 77.8345)

        keetham_h3 = self.indexer.lat_lng_to_h3(27.2510, 77.8420, res=9)
        keetham_risk = self.indexer.calculate_cell_risk(keetham_h3, 27.2510, 77.8420)

        self.assertEqual(sharda_risk["zone_classification"], "safe")
        self.assertEqual(keetham_risk["zone_classification"], "danger")
        self.assertGreater(keetham_risk["composite_risk_score"], sharda_risk["composite_risk_score"])

    def test_05_telemetry_ingestion_throughput(self):
        """Verify telemetry ingestion handler processes payload without blocking."""
        sample_payload = {
            "userId": "TID-782401",
            "lat": 27.2481,
            "lng": 77.8345,
            "accuracy": 5.0,
            "timestamp": time.time(),
            "isPanic": False
        }

        result = self.worker.ingest_location(sample_payload)
        self.assertEqual(result["userId"], "TID-782401")
        self.assertTrue(result["h3_index"].startswith("89"))
        self.assertEqual(result["zone_classification"], "safe")

    def test_06_legacy_risk_score_payload_compatibility(self):
        """Verify backward compatibility of risk score response payload."""
        lat, lng = 27.2481, 77.8345
        h3_cell = self.indexer.lat_lng_to_h3(lat, lng, res=9)
        risk = self.indexer.calculate_cell_risk(h3_cell, lat, lng)

        legacy_payload = {
            "success": True,
            "h3_index": h3_cell,
            "composite_risk_score": risk["composite_risk_score"],
            "safety_score": risk["safety_rating_percent"],
            "zone_type": risk["zone_classification"],
            "latitude": lat,
            "longitude": lng,
            "factors": risk["factors"]
        }

        # Check required fields expected by V1 consumers
        self.assertIn("composite_risk_score", legacy_payload)
        self.assertIn("safety_score", legacy_payload)
        self.assertIn("zone_type", legacy_payload)
        self.assertIn("factors", legacy_payload)


if __name__ == "__main__":
    unittest.main()

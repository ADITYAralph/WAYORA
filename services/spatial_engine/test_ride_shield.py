"""
SafePath-X Ride Shield Verification Suite
Synthetic Trajectory Simulation: Normal -> Diverged -> Critical Route Diversion Alert
"""

import unittest
import time
from services.spatial_engine.ride_shield import (
    RideShieldEngine,
    calculate_cross_track_distance,
    compute_cosine_similarity
)


class TestRideShield(unittest.TestCase):
    def setUp(self):
        self.engine = RideShieldEngine(urban_threshold_m=250.0, highway_threshold_m=750.0)
        # Planned Safe Route: Straight along NH-19 from SUA Anand Campus to Sikandra
        self.planned_polyline = [
            (27.2481, 77.8345),  # Waypoint 1: SUA Anand Campus
            (27.2410, 77.8700),  # Waypoint 2: NH-19 Transit Lane
            (27.2300, 77.9100),  # Waypoint 3: Highway Section
            (27.2206, 77.9505)   # Waypoint 4: Sikandra
        ]

    def test_01_cross_track_calculation(self):
        """Verify cross-track orthogonal distance calculation."""
        on_track_point = (27.2445, 77.8522)  # directly on segment 1-2
        d_perp = calculate_cross_track_distance(on_track_point, self.planned_polyline)
        self.assertLess(d_perp, 50.0, f"Distance on track should be < 50m, got {d_perp}m")

        off_track_point = (27.2580, 77.8522)  # ~1.5 km North into rural fields
        d_perp_off = calculate_cross_track_distance(off_track_point, self.planned_polyline)
        self.assertGreater(d_perp_off, 1000.0, f"Distance off track should be > 1000m, got {d_perp_off}m")

    def test_02_cosine_similarity(self):
        """Verify cosine similarity calculation between heading vectors."""
        # Heading East (1, 0) and target East (2, 0) -> cos = 1.0
        sim_collinear = compute_cosine_similarity((1.0, 0.0), (2.0, 0.0))
        self.assertAlmostEqual(sim_collinear, 1.0, places=3)

        # Heading East (1, 0) and target North (0, 1) -> cos = 0.0
        sim_orthogonal = compute_cosine_similarity((1.0, 0.0), (0.0, 1.0))
        self.assertAlmostEqual(sim_orthogonal, 0.0, places=3)

    def test_03_synthetic_trajectory_state_transitions(self):
        """
        Simulates a continuous trajectory demonstrating:
        Phase A (t=0s): Normal path along planned corridor
        Phase B (t=30s): Initial deviation > 250m
        Phase C (t=130s): Dwell time >= 120s aligned toward suspicious emporium -> Critical Alert
        """
        ride_id = "test-ride-trajectory-01"
        base_time = 1700000000.0

        # Phase A: t = 0s, Normal Point on Route
        res_a = self.engine.analyze_vehicle_position(
            ride_id=ride_id,
            current_gps=(27.2481, 77.8345),
            planned_polyline=self.planned_polyline,
            vehicle_heading_deg=110.0,
            is_highway=False,
            timestamp=base_time
        )
        self.assertEqual(res_a["status"], "NORMAL")
        self.assertFalse(res_a["isCritical"])
        self.assertLess(res_a["crossTrackDistanceMeters"], 50.0)

        # Phase B: t = 30s, First detected off-route (initial deviation point)
        res_b1 = self.engine.analyze_vehicle_position(
            ride_id=ride_id,
            current_gps=(27.2410, 77.8300),  # shifted West into unlit alley
            planned_polyline=self.planned_polyline,
            vehicle_heading_deg=170.0,
            is_highway=False,
            timestamp=base_time + 30.0
        )
        self.assertIn(res_b1["status"], ["MINOR_DEVIATION", "WARNING_OFF_ROUTE"])
        self.assertFalse(res_b1["isCritical"])
        self.assertGreater(res_b1["crossTrackDistanceMeters"], 250.0)
        self.assertEqual(res_b1["dwellDurationSeconds"], 0.0)

        # Phase B2: t = 60s (30s after first deviation), Off-route warning
        res_b2 = self.engine.analyze_vehicle_position(
            ride_id=ride_id,
            current_gps=(27.2350, 77.8280),
            planned_polyline=self.planned_polyline,
            vehicle_heading_deg=170.0,
            is_highway=False,
            timestamp=base_time + 60.0
        )
        self.assertEqual(res_b2["dwellDurationSeconds"], 30.0)

        # Phase C: t = 160s (130s dwell >= 120s), heading aligned with unauthorized marble scam cluster
        res_c = self.engine.analyze_vehicle_position(
            ride_id=ride_id,
            current_gps=(27.1680, 78.0250),  # approaching Unauthorized Marble Emporium (27.1650, 78.0280)
            planned_polyline=self.planned_polyline,
            vehicle_heading_deg=135.0,  # vector pointing South-East into emporium cluster
            is_highway=False,
            timestamp=base_time + 160.0
        )
        self.assertEqual(res_c["status"], "CRITICAL_ROUTE_DIVERSION")
        self.assertTrue(res_c["isCritical"])
        self.assertGreaterEqual(res_c["dwellDurationSeconds"], 120.0)
        self.assertIn("Vehicle deviated", res_c["alertReason"])
        self.assertIsNotNone(res_c["targetedScamCluster"])


if __name__ == "__main__":
    unittest.main()

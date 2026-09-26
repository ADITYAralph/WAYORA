"""
SafePath-X FairFare Verification Suite
Validates baseline gazette formulas, night multiplier thresholds, and tolerance corridors.
"""

import unittest
from services.pricing.fair_fare import FairFareEngine


class TestFairFareEngine(unittest.TestCase):
    def setUp(self):
        self.engine = FairFareEngine()

    def test_01_daytime_auto_rickshaw_calculation(self):
        """Verify daytime Auto Rickshaw fare: Base 30 + (10 - 1.5) * 12 = 132 INR."""
        res = self.engine.calculate_fare(
            distance_km=10.0,
            vehicle_type="auto_rickshaw",
            is_night=False,
            weather_factor=1.0
        )
        self.assertEqual(res["exactCalculatedFare"], 132.0)
        self.assertFalse(res["isNightTariff"])
        self.assertEqual(res["toleranceCorridor"]["minFare"], 125)
        self.assertEqual(res["toleranceCorridor"]["maxFare"], 139)
        self.assertEqual(res["toleranceCorridor"]["formattedRange"], "₹125 — ₹139")

    def test_02_short_distance_base_tariff(self):
        """Verify journeys under 1.5 km charge exact base tariff 30 INR."""
        res = self.engine.calculate_fare(
            distance_km=1.0,
            vehicle_type="auto_rickshaw",
            is_night=False
        )
        self.assertEqual(res["exactCalculatedFare"], 30.0)
        self.assertEqual(res["additionalKm"], 0.0)

    def test_03_night_tariff_hours_trigger_125x(self):
        """Verify 1.25x night multiplier triggers between 23:00 and 05:00."""
        # 1. Daytime hour 14:00 -> No night tariff
        res_day = self.engine.calculate_fare(distance_km=10.0, hour=14)
        self.assertFalse(res_day["isNightTariff"])
        self.assertEqual(res_day["exactCalculatedFare"], 132.0)

        # 2. Night hour 23:30 (hour 23) -> 1.25x multiplier
        res_night_23 = self.engine.calculate_fare(distance_km=10.0, hour=23)
        self.assertTrue(res_night_23["isNightTariff"])
        self.assertEqual(res_night_23["nightMultiplier"], 1.25)
        self.assertEqual(res_night_23["exactCalculatedFare"], 165.0)  # 132 * 1.25 = 165

        # 3. Night hour 02:00 (hour 2) -> 1.25x multiplier
        res_night_02 = self.engine.calculate_fare(distance_km=10.0, hour=2)
        self.assertTrue(res_night_02["isNightTariff"])
        self.assertEqual(res_night_02["exactCalculatedFare"], 165.0)

        # 4. Morning hour 05:00 (hour 5) -> Resets to daytime tariff
        res_morning = self.engine.calculate_fare(distance_km=10.0, hour=5)
        self.assertFalse(res_morning["isNightTariff"])
        self.assertEqual(res_morning["exactCalculatedFare"], 132.0)

    def test_04_taxi_ac_calculation(self):
        """Verify Taxi AC: Base 75 + (10 - 1.5) * 20 = 75 + 170 = 245 INR."""
        res = self.engine.calculate_fare(
            distance_km=10.0,
            vehicle_type="taxi_ac",
            is_night=False
        )
        self.assertEqual(res["exactCalculatedFare"], 245.0)
        self.assertEqual(res["toleranceCorridor"]["formattedRange"], "₹233 — ₹257")

    def test_05_regulatory_citation_code(self):
        """Verify presence of UP statutory gazette citation."""
        res = self.engine.calculate_fare(distance_km=5.0)
        self.assertIn("UP-RTO-AGRA-NOTIF-2025/T-401", res["regulatoryCitation"])


if __name__ == "__main__":
    unittest.main()

"""
SafePath-X GSM SMS Fallback Beacon Verification Suite
Validates 24-byte binary packing, 32-char Base64 encoding, and < 1 meter spatial precision.
"""

import unittest
import math
from services.telemetry.sms_decoder import pack_beacon, unpack_beacon


def haversine_distance_meters(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    R = 6371000.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lng2 - lng1)
    a = math.sin(dphi / 2.0) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2.0) ** 2
    return 2.0 * R * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))


class TestSmsBeacon(unittest.TestCase):
    def test_01_taj_mahal_coordinate_precision_under_1_meter(self):
        """Verify (27.1751, 78.0421) packs and unpacks with loss strictly < 1 meter."""
        original_lat = 27.1751
        original_lng = 78.0421

        data = {
            "version": 1,
            "alertTypeId": 1,  # PANIC_SOS
            "batteryPercent": 85,
            "gpsAccuracyMeters": 8,
            "latitude": original_lat,
            "longitude": original_lng,
            "epochMinuteOffset": 840,
            "speedKmh": 25,
            "touristShortHash": "8f192b49c09a"
        }

        base64_beacon = pack_beacon(data)

        # Verify Base64 string length is exactly 32 characters (24 bytes * 4/3 = 32 chars)
        self.assertEqual(len(base64_beacon), 32, f"Base64 length must be 32 chars, got {len(base64_beacon)}")

        # Unpack back to data
        unpacked = unpack_beacon(base64_beacon)

        # Spatial loss calculation
        distance_loss_m = haversine_distance_meters(
            original_lat, original_lng,
            unpacked["latitude"], unpacked["longitude"]
        )

        self.assertLess(
            distance_loss_m, 1.0,
            f"Spatial error must be < 1 meter, got {distance_loss_m:.6f} meters"
        )
        self.assertEqual(unpacked["alertTypeId"], 1)
        self.assertEqual(unpacked["batteryPercent"], 85)
        self.assertEqual(unpacked["gpsAccuracyMeters"], 8)
        self.assertEqual(unpacked["speedKmh"], 25)

    def test_02_sharda_campus_coordinate_precision(self):
        """Verify Sharda University Agra / Anand Campus (27.2481, 77.8345) spatial accuracy."""
        original_lat = 27.2481
        original_lng = 77.8345

        data = {
            "version": 1,
            "alertTypeId": 2,  # ROUTE_DIVERSION
            "batteryPercent": 92,
            "gpsAccuracyMeters": 5,
            "latitude": original_lat,
            "longitude": original_lng,
            "epochMinuteOffset": 520,
            "speedKmh": 45,
            "touristShortHash": "3c71a92bf01e"
        }

        b64 = pack_beacon(data)
        self.assertEqual(len(b64), 32)

        unpacked = unpack_beacon(b64)
        error_m = haversine_distance_meters(original_lat, original_lng, unpacked["latitude"], unpacked["longitude"])

        self.assertLess(error_m, 0.05, f"Sub-meter resolution expected, error was {error_m:.6f}m")
        self.assertEqual(unpacked["alertTypeName"], "ROUTE_DIVERSION")

    def test_03_boundary_limits(self):
        """Verify negative coordinate and edge values packing."""
        data = {
            "version": 7,
            "alertTypeId": 31,
            "batteryPercent": 100,
            "gpsAccuracyMeters": 511,
            "latitude": -33.8688,
            "longitude": 151.2093,
            "epochMinuteOffset": 65535,
            "speedKmh": 255,
            "touristShortHash": "ffffffffffff"
        }

        b64 = pack_beacon(data)
        self.assertEqual(len(b64), 32)

        unpacked = unpack_beacon(b64)
        self.assertEqual(unpacked["version"], 7)
        self.assertEqual(unpacked["alertTypeId"], 31)
        self.assertEqual(unpacked["batteryPercent"], 100)
        self.assertEqual(unpacked["gpsAccuracyMeters"], 511)
        self.assertAlmostEqual(unpacked["latitude"], -33.8688, places=4)
        self.assertAlmostEqual(unpacked["longitude"], 151.2093, places=4)


if __name__ == "__main__":
    unittest.main()

"""
SafePath-X FairFare Dynamic Regulatory Pricing Engine
Calculates statutory fare corridors based on UP State Gazette Transportation Tariffs.
"""

import json
import os
import math
from typing import Dict, Any, Optional, Tuple


DEFAULT_TARIFF_CONFIG = {
    "gazetteNotificationCode": "UP-RTO-AGRA-NOTIF-2025/T-401",
    "nightTariffHours": {
        "start": "23:00",
        "end": "05:00",
        "multiplier": 1.25
    },
    "vehicleCategories": {
        "auto_rickshaw": {
            "name": "Auto Rickshaw (3-Wheeler)",
            "baseTariff": 30.0,
            "baseDistanceKm": 1.5,
            "perKmRate": 12.0
        },
        "taxi_non_ac": {
            "name": "Taxi Non-AC",
            "baseTariff": 50.0,
            "baseDistanceKm": 1.5,
            "perKmRate": 16.0
        },
        "taxi_ac": {
            "name": "Taxi AC",
            "baseTariff": 75.0,
            "baseDistanceKm": 1.5,
            "perKmRate": 20.0
        },
        "e_rickshaw": {
            "name": "E-Rickshaw",
            "baseTariff": 15.0,
            "baseDistanceKm": 1.5,
            "perKmRate": 8.0
        }
    }
}


class FairFareEngine:
    def __init__(self, config_path: Optional[str] = None):
        self.config = DEFAULT_TARIFF_CONFIG
        if config_path and os.path.exists(config_path):
            try:
                with open(config_path, "r", encoding="utf-8") as f:
                    self.config = json.load(f)
            except Exception as e:
                print(f"[FairFareEngine] Failed to load config from {config_path}: {e}. Using default.")

    @staticmethod
    def is_night_tariff_applicable(hour: int) -> bool:
        """Night tariff triggers between 23:00 (inclusive) and 05:00 (exclusive)."""
        return hour >= 23 or hour < 5

    def calculate_fare(
        self,
        distance_km: float,
        vehicle_type: str = "auto_rickshaw",
        is_night: Optional[bool] = None,
        hour: Optional[int] = None,
        weather_factor: float = 1.0,
        luggage_count: int = 0
    ) -> Dict[str, Any]:
        """
        Calculates FairFare using the statutory gazette formula:
        Fare = [Base_Tariff + max(0, Distance_km - 1.5) * Per_Km_Rate] * Night_Multiplier * Weather_Factor + Luggage
        """
        categories = self.config.get("vehicleCategories", {})
        v_config = categories.get(vehicle_type, categories.get("auto_rickshaw"))

        base_tariff = float(v_config.get("baseTariff", 30.0))
        base_distance = float(v_config.get("baseDistanceKm", 1.5))
        per_km_rate = float(v_config.get("perKmRate", 12.0))
        luggage_rate = float(v_config.get("luggageChargePerPiece", 10.0))

        # Determine night multiplier
        night_mult = 1.0
        if is_night is True or (is_night is None and hour is not None and self.is_night_tariff_applicable(hour)):
            night_mult = float(self.config.get("nightTariffHours", {}).get("multiplier", 1.25))

        # Base running calculation
        additional_km = max(0.0, distance_km - base_distance)
        running_cost = base_tariff + (additional_km * per_km_rate)

        # Apply multipliers
        adjusted_fare = running_cost * night_mult * weather_factor
        luggage_charge = luggage_count * luggage_rate
        total_fare = adjusted_fare + luggage_charge

        exact_fare = round(total_fare, 2)
        recommended_price = int(round(total_fare / 5.0) * 5)  # Round to nearest 5 rupees for street currency ease
        min_corridor = int(round(total_fare * 0.95))
        max_corridor = int(round(total_fare * 1.05))

        # Ensure corridor is at least minimum sensible range
        if max_corridor <= min_corridor:
            max_corridor = min_corridor + 10

        return {
            "distanceKm": round(distance_km, 2),
            "vehicleType": vehicle_type,
            "vehicleName": v_config.get("name", vehicle_type),
            "baseTariff": base_tariff,
            "perKmRate": per_km_rate,
            "additionalKm": round(additional_km, 2),
            "isNightTariff": night_mult > 1.0,
            "nightMultiplier": night_mult,
            "weatherFactor": weather_factor,
            "luggageCharge": luggage_charge,
            "exactCalculatedFare": exact_fare,
            "recommendedPrice": recommended_price,
            "toleranceCorridor": {
                "minFare": min_corridor,
                "maxFare": max_corridor,
                "formattedRange": f"₹{min_corridor} — ₹{max_corridor}"
            },
            "regulatoryCitation": self.config.get("gazetteNotificationCode", "UP-RTO-AGRA-NOTIF-2025/T-401"),
            "regulatoryAuthority": self.config.get("regulatoryAuthority", "Regional Transport Authority, Agra")
        }


# Global singleton pricing engine
fair_fare_engine = FairFareEngine(
    config_path=os.path.join(os.path.dirname(__file__), "..", "..", "config", "tariffs", "agra_regional_tariffs.json")
)

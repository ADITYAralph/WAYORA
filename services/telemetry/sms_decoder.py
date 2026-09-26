"""
SafePath-X 24-Byte GSM SMS Fallback Beacon Encoder & Decoder (Python)
Bit-packs and unpacks 24-byte binary telemetry frames encoded to 32 Base64 characters.
"""

import struct
import base64
from typing import Dict, Any


ALERT_TYPE_NAMES = {
    1: "PANIC_SOS",
    2: "ROUTE_DIVERSION",
    3: "STATIONARY_DISTRESS",
    4: "DANGER_ZONE_BREACH"
}


def pack_beacon(data: Dict[str, Any]) -> str:
    """
    Packs telemetry data dictionary into a 24-byte binary frame and returns 32-character Base64 string.
    """
    version = int(data.get("version", 1)) & 0x07
    alert_type_id = int(data.get("alertTypeId", 1)) & 0x1F
    byte0 = (version << 5) | alert_type_id

    battery = max(0, min(100, int(data.get("batteryPercent", 100)))) & 0x7F
    accuracy = max(0, min(511, int(data.get("gpsAccuracyMeters", 10)))) & 0x1FF
    batt_acc = (battery << 9) | accuracy

    lat_fixed = int(round(float(data.get("latitude", 0.0)) * 10000000))
    lng_fixed = int(round(float(data.get("longitude", 0.0)) * 10000000))

    epoch_minute = int(data.get("epochMinuteOffset", 0)) & 0xFFFF
    speed_kmh = max(0, min(255, int(data.get("speedKmh", 0)))) & 0xFF

    # 6 bytes tourist short hash
    hash_hex = str(data.get("touristShortHash", "8f192b49c09a")).ljust(12, "0")[:12]
    hash_bytes = bytes.fromhex(hash_hex)

    # 20 bytes prefix before checksum
    prefix = struct.pack(">BHiiHB", byte0, batt_acc, lat_fixed, lng_fixed, epoch_minute, speed_kmh) + hash_bytes

    # Truncated 4-byte checksum
    checksum = 0x5A1FE000
    for b in prefix:
        checksum = ((checksum << 5) - checksum + b) & 0xFFFFFFFF

    hmac_val = int(data.get("hmacSignature", checksum)) & 0xFFFFFFFF
    full_frame = prefix + struct.pack(">I", hmac_val)

    if len(full_frame) != 24:
        raise ValueError(f"Packed frame length must be 24 bytes, got {len(full_frame)}")

    return base64.b64encode(full_frame).decode("ascii")


def unpack_beacon(base64_str: str) -> Dict[str, Any]:
    """
    Unpacks a 32-character Base64 string back into structured telemetry data.
    """
    clean_str = base64_str.strip().replace("SAFEPATH:", "")
    raw_bytes = base64.b64decode(clean_str)

    if len(raw_bytes) != 24:
        raise ValueError(f"Invalid SMS Beacon length: expected 24 bytes, got {len(raw_bytes)}")

    byte0, batt_acc, lat_fixed, lng_fixed, epoch_minute, speed_kmh = struct.unpack(">BHiiHB", raw_bytes[:14])
    hash_bytes = raw_bytes[14:20]
    hmac_val = struct.unpack(">I", raw_bytes[20:24])[0]

    version = (byte0 >> 5) & 0x07
    alert_type_id = byte0 & 0x1F

    battery_percent = (batt_acc >> 9) & 0x7F
    gps_accuracy_meters = batt_acc & 0x1FF

    latitude = round(lat_fixed / 10000000.0, 7)
    longitude = round(lng_fixed / 10000000.0, 7)

    return {
        "version": version,
        "alertTypeId": alert_type_id,
        "alertTypeName": ALERT_TYPE_NAMES.get(alert_type_id, "UNKNOWN"),
        "batteryPercent": battery_percent,
        "gpsAccuracyMeters": gps_accuracy_meters,
        "latitude": latitude,
        "longitude": longitude,
        "epochMinuteOffset": epoch_minute,
        "speedKmh": speed_kmh,
        "touristShortHash": hash_bytes.hex(),
        "hmacSignature": hmac_val
    }

"""
SafePath-X Ride Shield: Anti-Diversion & Route Abduction Anomaly Engine
Calculates cross-track orthogonal distance d_perp(V_t, P) and cosine similarity alignment with known scam/unauthorized shop clusters.
"""

import math
import time
from typing import List, Tuple, Dict, Any, Optional

# Known unauthorized / high-commission scam emporium & diversion centroids around major tourist circuits (e.g. Agra / Golden Triangle)
SUSPICIOUS_SCAM_CLUSTERS = [
    {
        "id": "scam_cluster_agra_marble_alleys",
        "name": "Unauthorized High-Commission Marble Emporium Cluster",
        "lat": 27.1650,
        "lng": 78.0280,
        "radius_meters": 400,
        "description": "Aggressive driver tout diversion point for marked-up marble souvenirs"
    },
    {
        "id": "scam_cluster_yamuna_bypass_isolated",
        "name": "Yamuna Expressway Isolated Service Cut-Off",
        "lat": 27.2100,
        "lng": 77.9900,
        "radius_meters": 600,
        "description": "Unlit bypass off main highway known for forced luggage extortion"
    },
    {
        "id": "scam_cluster_runakta_dhaba_pocket",
        "name": "Runakta Unauthorized Holding Dhaba Pocket",
        "lat": 27.2350,
        "lng": 77.8900,
        "radius_meters": 500,
        "description": "Remote transit pocket with frequent tourist overcharging diversions"
    }
]


def haversine_distance_meters(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Computes great-circle distance between two coordinates in meters."""
    R = 6371000.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lng2 - lng1)

    a = math.sin(dphi / 2.0) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2.0) ** 2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c


def point_to_segment_distance(
    px: float, py: float,
    ax: float, ay: float,
    bx: float, by: float
) -> float:
    """
    Computes orthogonal distance in meters from point P(px, py) to line segment AB[(ax, ay), (bx, by)].
    """
    # Convert lat/lng diffs to approximate local planar metric offsets
    mean_lat = math.radians((ax + bx + px) / 3.0)
    meters_per_lat = 111320.0
    meters_per_lng = 111320.0 * math.cos(mean_lat)

    P = ((px - ax) * meters_per_lat, (py - ay) * meters_per_lng)
    B = ((bx - ax) * meters_per_lat, (by - ay) * meters_per_lng)

    dot_pb = P[0] * B[0] + P[1] * B[1]
    len_sq_b = B[0] ** 2 + B[1] ** 2

    if len_sq_b < 1e-6:
        return math.hypot(P[0], P[1])

    # Projection factor t
    t = max(0.0, min(1.0, dot_pb / len_sq_b))
    proj = (t * B[0], t * B[1])

    return math.hypot(P[0] - proj[0], P[1] - proj[1])


def calculate_cross_track_distance(
    current_point: Tuple[float, float],
    polyline_waypoints: List[Tuple[float, float]]
) -> float:
    """
    Calculates minimal orthogonal cross-track distance d_perp(V_t, P) to planned polyline in meters.
    """
    if not polyline_waypoints:
        return 0.0
    if len(polyline_waypoints) == 1:
        return haversine_distance_meters(
            current_point[0], current_point[1],
            polyline_waypoints[0][0], polyline_waypoints[0][1]
        )

    min_dist = float("inf")
    p_lat, p_lng = current_point

    for i in range(len(polyline_waypoints) - 1):
        a_lat, a_lng = polyline_waypoints[i]
        b_lat, b_lng = polyline_waypoints[i + 1]
        dist = point_to_segment_distance(p_lat, p_lng, a_lat, a_lng, b_lat, b_lng)
        if dist < min_dist:
            min_dist = dist

    return min_dist


def compute_cosine_similarity(
    u_vehicle: Tuple[float, float],
    u_target: Tuple[float, float]
) -> float:
    """
    Computes cosine similarity between vehicle heading vector and target direction vector:
    cos(theta) = (u_vehicle . u_scam) / (||u_vehicle|| ||u_scam||)
    """
    dot = u_vehicle[0] * u_target[0] + u_vehicle[1] * u_target[1]
    norm_v = math.hypot(u_vehicle[0], u_vehicle[1])
    norm_t = math.hypot(u_target[0], u_target[1])

    if norm_v < 1e-7 or norm_t < 1e-7:
        return 0.0

    return max(-1.0, min(1.0, dot / (norm_v * norm_t)))


class RideShieldEngine:
    def __init__(self, urban_threshold_m: float = 250.0, highway_threshold_m: float = 750.0):
        self.urban_threshold_m = urban_threshold_m
        self.highway_threshold_m = highway_threshold_m
        self.active_ride_sessions: Dict[str, Dict[str, Any]] = {}

    def analyze_vehicle_position(
        self,
        ride_id: str,
        current_gps: Tuple[float, float],  # (lat, lng)
        planned_polyline: List[Tuple[float, float]],
        vehicle_heading_deg: Optional[float] = None,
        is_highway: bool = False,
        timestamp: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Evaluates current vehicle position against planned route and flags route diversion or abduction risks.
        """
        now = timestamp if timestamp is not None else time.time()
        lat, lng = current_gps

        # 1. Calculate Cross-Track Orthogonal Distance
        d_perp = calculate_cross_track_distance(current_gps, planned_polyline)
        threshold = self.highway_threshold_m if is_highway else self.urban_threshold_m
        is_deviated = d_perp > threshold

        # 2. Session Dwell Tracking
        session = self.active_ride_sessions.get(ride_id, {
            "first_deviated_time": None,
            "previous_coord": None,
            "dwell_duration_seconds": 0.0,
            "status": "NORMAL"
        })

        if is_deviated:
            if session["first_deviated_time"] is None:
                session["first_deviated_time"] = now
            dwell_seconds = now - session["first_deviated_time"]
            session["dwell_duration_seconds"] = round(dwell_seconds, 1)
        else:
            session["first_deviated_time"] = None
            session["dwell_duration_seconds"] = 0.0

        # 3. Calculate Heading Vector
        u_vehicle = (0.0, 0.0)
        if vehicle_heading_deg is not None:
            rad = math.radians(vehicle_heading_deg)
            u_vehicle = (math.cos(rad), math.sin(rad))
        elif session["previous_coord"]:
            p_lat, p_lng = session["previous_coord"]
            u_vehicle = (lat - p_lat, lng - p_lng)

        session["previous_coord"] = (lat, lng)

        # 4. Check Alignment with Suspicious Scam / Diversion Clusters
        matched_scam_cluster = None
        max_cos_sim = -1.0

        for cluster in SUSPICIOUS_SCAM_CLUSTERS:
            u_scam = (cluster["lat"] - lat, cluster["lng"] - lng)
            dist_to_scam = haversine_distance_meters(lat, lng, cluster["lat"], cluster["lng"])

            if dist_to_scam < 4000:  # Within 4km influence radius
                cos_sim = compute_cosine_similarity(u_vehicle, u_scam)
                if cos_sim > max_cos_sim:
                    max_cos_sim = cos_sim
                    if cos_sim > 0.65 and dist_to_scam < cluster["radius_meters"] * 3:
                        matched_scam_cluster = cluster

        # 5. Severity & Alert Classification
        severity = "NORMAL"
        alert_reason = "Vehicle progressing along verified safe polyline"
        is_critical_diversion = False

        if is_deviated:
            if session["dwell_duration_seconds"] >= 120.0 and (matched_scam_cluster or max_cos_sim > 0.70):
                severity = "CRITICAL_ROUTE_DIVERSION"
                is_critical_diversion = True
                alert_reason = (
                    f"Vehicle deviated by {int(d_perp)}m for {int(session['dwell_duration_seconds'])}s "
                    f"with heading aligned toward: {matched_scam_cluster['name'] if matched_scam_cluster else 'Suspicious Unplanned Corridor'}"
                )
            elif session["dwell_duration_seconds"] >= 60.0 or d_perp > threshold * 2:
                severity = "WARNING_OFF_ROUTE"
                alert_reason = f"Vehicle has drifted {int(d_perp)}m off the planned route for {int(session['dwell_duration_seconds'])}s"
            else:
                severity = "MINOR_DEVIATION"
                alert_reason = f"Slight route deviation ({int(d_perp)}m) detected"

        session["status"] = severity
        self.active_ride_sessions[ride_id] = session

        return {
            "rideId": ride_id,
            "status": severity,
            "isCritical": is_critical_diversion,
            "crossTrackDistanceMeters": round(d_perp, 1),
            "dwellDurationSeconds": session["dwell_duration_seconds"],
            "thresholdMeters": threshold,
            "cosineSimilarityScam": round(max_cos_sim, 3) if max_cos_sim > -1 else 0.0,
            "targetedScamCluster": matched_scam_cluster,
            "alertReason": alert_reason,
            "recommendedAction": (
                "Trigger Tourist Safety Broadcast audio & notify Emergency Police Dispatch"
                if is_critical_diversion
                else "Continue passive monitoring"
            ),
            "timestamp": now
        }


# Global singleton ride shield engine
ride_shield_engine = RideShieldEngine()

"""
SafePath-X Python Spatial Intelligence & Ingestion Microservice
Exposes REST endpoints for H3 spatial partitioning and high-concurrency telemetry.
"""

import json
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse
from .h3_indexer import h3_indexer
from .telemetry_ingestion import telemetry_worker

class SpatialRequestHandler(BaseHTTPRequestHandler):
    def _send_json(self, status_code: int, data: dict):
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode("utf-8"))

    def do_OPTIONS(self):
        self._send_json(200, {"status": "ok"})

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/health":
            self._send_json(200, {
                "status": "healthy",
                "service": "SafePath-X Spatial Intelligence & H3 Partitioning Engine",
                "processed_telemetry_count": telemetry_worker.processed_count
            })
        else:
            self._send_json(404, {"error": "Not Found"})

    def do_POST(self):
        parsed = urlparse(self.path)
        content_length = int(self.headers.get("Content-Length", 0))
        raw_body = self.rfile.read(content_length).decode("utf-8") if content_length > 0 else "{}"
        
        try:
            body = json.loads(raw_body)
        except Exception:
            body = {}

        # 1. High-Throughput Telemetry Ingestion Endpoint
        if parsed.path in ["/api/v1/telemetry/ingest", "/api/v1/telemetry"]:
            result = telemetry_worker.ingest_location(body)
            self._send_json(200, {
                "success": True,
                "data": result
            })

        # 2. Legacy / V1 Compatible Risk-Score Endpoint
        elif parsed.path in ["/api/v1/risk-score", "/risk-score"]:
            lat = float(body.get("lat", 27.2481))
            lng = float(body.get("lng", 77.8345))
            ts = float(body.get("timestamp", 0)) or None

            h3_cell = h3_indexer.lat_lng_to_h3(lat, lng, res=9)
            risk = h3_indexer.calculate_cell_risk(h3_cell, lat, lng, timestamp=ts)

            # Legacy backward-compatible response schema
            response_data = {
                "success": True,
                "h3_index": h3_cell,
                "composite_risk_score": risk["composite_risk_score"],
                "safety_score": risk["safety_rating_percent"],
                "zone_type": risk["zone_classification"],
                "latitude": lat,
                "longitude": lng,
                "factors": risk["factors"]
            }
            self._send_json(200, response_data)

        # 3. Anomaly Check Endpoint
        elif parsed.path in ["/api/v1/anomaly-check", "/anomaly-check"]:
            is_panic = body.get("isPanic", False)
            self._send_json(200, {
                "success": True,
                "anomaly_detected": is_panic,
                "anomaly_type": "PANIC_SOS" if is_panic else "NONE"
            })

        # 4. SafePath-X Ride Shield (Anti-Diversion Anomaly Check)
        elif parsed.path in ["/api/v1/ride-shield/check", "/ride-shield/check"]:
            from .ride_shield import ride_shield_engine
            ride_id = body.get("rideId", "ride-demo-01")
            current_gps = (float(body.get("lat", 27.2481)), float(body.get("lng", 77.8345)))
            raw_polyline = body.get("plannedPolyline", [])
            polyline = [(float(p[0]), float(p[1])) for p in raw_polyline] if raw_polyline else [current_gps]
            heading = float(body["heading"]) if "heading" in body and body["heading"] is not None else None
            is_highway = bool(body.get("isHighway", False))
            ts = float(body["timestamp"]) if "timestamp" in body and body["timestamp"] is not None else None

            analysis = ride_shield_engine.analyze_vehicle_position(
                ride_id=ride_id,
                current_gps=current_gps,
                planned_polyline=polyline,
                vehicle_heading_deg=heading,
                is_highway=is_highway,
                timestamp=ts
            )
            self._send_json(200, {
                "success": True,
                "data": analysis
            })

        else:
            self._send_json(404, {"error": f"Endpoint {parsed.path} not found"})


def run_server(port: int = 8000):
    server_address = ("", port)
    httpd = HTTPServer(server_address, SpatialRequestHandler)
    print(f"🚀 SafePath-X Python Spatial Engine running at http://localhost:{port}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping Spatial Engine server...")
        httpd.server_close()


if __name__ == "__main__":
    run_server()

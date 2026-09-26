"""
SafePath-X High-Throughput Telemetry Ingestion Handler
Accepts real-time tourist GPS pings, maps H3 cells, and evaluates hazard boundaries asynchronously.
"""

import time
import queue
import threading
from typing import Dict, Any, Optional
from .h3_indexer import h3_indexer
from .redis_cache import spatial_cache

class TelemetryIngestionWorker:
    def __init__(self, max_queue_size: int = 10000):
        self.queue = queue.Queue(maxsize=max_queue_size)
        self.batch_size = 50
        self.flush_interval = 2.0  # seconds
        self.is_running = True
        self.processed_count = 0
        self.latest_telemetry: Dict[str, Dict[str, Any]] = {}

        # Background batch consumer thread
        self.worker_thread = threading.Thread(target=self._batch_consumer_loop, daemon=True)
        self.worker_thread.start()

    def ingest_location(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Ingests tourist telemetry synchronously for H3 resolution and risk check,
        and enqueues the coordinate asynchronously for batch database persistence.
        """
        user_id = payload.get("userId", "anonymous")
        lat = float(payload.get("lat", 0.0))
        lng = float(payload.get("lng", 0.0))
        accuracy = float(payload.get("accuracy", 10.0))
        ts = float(payload.get("timestamp", time.time()))

        # 1. O(1) H3 Index Resolution
        h3_cell = h3_indexer.lat_lng_to_h3(lat, lng, res=9)

        # 2. Query/Compute Spatial Risk
        risk_info = h3_indexer.calculate_cell_risk(h3_cell, lat, lng, timestamp=ts)

        # 3. Form enriched telemetry record
        enriched = {
            "userId": user_id,
            "lat": lat,
            "lng": lng,
            "accuracy": accuracy,
            "timestamp": ts,
            "h3_index": h3_cell,
            "risk_score": risk_info["composite_risk_score"],
            "safety_score": risk_info["safety_rating_percent"],
            "zone_classification": risk_info["zone_classification"],
            "is_panic": bool(payload.get("isPanic", False))
        }

        # Cache latest in memory
        self.latest_telemetry[user_id] = enriched

        # 4. Enqueue for asynchronous batch persistence
        try:
            self.queue.put_nowait(enriched)
        except queue.Full:
            # Drop or log if buffer is overflowing under extreme load
            pass

        return enriched

    def _batch_consumer_loop(self):
        """Asynchronous batch processor to prevent database write quota saturation."""
        batch = []
        last_flush = time.time()

        while self.is_running:
            try:
                item = self.queue.get(timeout=0.5)
                batch.append(item)
            except queue.Empty:
                pass

            now = time.time()
            if (len(batch) >= self.batch_size) or (batch and now - last_flush >= self.flush_interval):
                self._persist_batch(batch)
                batch = []
                last_flush = now

    def _persist_batch(self, batch: list):
        """Mock/Real sink for writing batch telemetry to TimescaleDB, ClickHouse, or Firestore batch."""
        self.processed_count += len(batch)
        # In production, this issues 1 single bulk insert instead of N individual database writes


# Global singleton ingestion worker
telemetry_worker = TelemetryIngestionWorker()

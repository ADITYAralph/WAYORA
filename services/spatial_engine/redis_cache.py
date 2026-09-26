"""
SafePath-X Redis-Backed Spatial Cache Manager
Provides sub-millisecond H3 cell risk index lookups with in-memory fallback.
"""

import os
import json
from typing import Dict, Any, Optional

try:
    import redis
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False


class SpatialRedisCache:
    def __init__(self, host: str = "localhost", port: int = 6379, db: int = 0):
        self.redis_client = None
        self.in_memory_cache: Dict[str, str] = {}
        self.is_connected = False

        redis_url = os.getenv("REDIS_URL", f"redis://{host}:{port}/{db}")
        if REDIS_AVAILABLE:
            try:
                self.redis_client = redis.from_url(redis_url, decode_responses=True, socket_timeout=1.0)
                self.redis_client.ping()
                self.is_connected = True
                print(f"[SpatialRedisCache] Connected successfully to Redis at {redis_url}")
            except Exception as e:
                print(f"[SpatialRedisCache] Redis not available at {redis_url} ({e}). Falling back to fast in-memory spatial cache.")
                self.redis_client = None
                self.is_connected = False
        else:
            print("[SpatialRedisCache] 'redis' package not installed. Operating in ultra-fast in-memory cache mode.")

    def set_cell_risk(self, h3_index: str, risk_payload: Dict[str, Any], ttl_seconds: int = 3600) -> bool:
        """Cache pre-calculated composite risk score for an H3 cell."""
        data_str = json.dumps(risk_payload)
        self.in_memory_cache[h3_index] = data_str

        if self.is_connected and self.redis_client:
            try:
                self.redis_client.setex(f"h3_risk:{h3_index}", ttl_seconds, data_str)
                return True
            except Exception:
                pass
        return True

    def get_cell_risk(self, h3_index: str) -> Optional[Dict[str, Any]]:
        """Retrieve pre-calculated risk score in O(1) time."""
        if self.is_connected and self.redis_client:
            try:
                cached = self.redis_client.get(f"h3_risk:{h3_index}")
                if cached:
                    return json.loads(cached)
            except Exception:
                pass

        if h3_index in self.in_memory_cache:
            return json.loads(self.in_memory_cache[h3_index])

        return None

    def flush_cache(self) -> None:
        """Flush cache for testing purposes."""
        self.in_memory_cache.clear()
        if self.is_connected and self.redis_client:
            try:
                self.redis_client.flushdb()
            except Exception:
                pass


# Global singleton cache instance
spatial_cache = SpatialRedisCache()

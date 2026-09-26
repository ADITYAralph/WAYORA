"""
SafePath-X CLI Pipeline Runner
Executes OpenStreetMap infrastructure collection, Kaggle crime metric harmonization, and H3 Resolution-9 cache enrichment.
"""

import os
import sys
from services.spatial_engine.h3_enricher import run_full_enrichment_pipeline

def main():
    print("================================================================")
    print("🚀 SafePath-X Real-World Geospatial & Crime ETL Pipeline")
    print("================================================================")
    cache = run_full_enrichment_pipeline(export_cache=True)
    print(f"\n✅ Pipeline Complete! Enriched and seeded {len(cache)} H3 cells into spatial cache.")


if __name__ == "__main__":
    main()

export interface H3CellRisk {
  h3Index: string
  resolution: number // 7, 8, or 9
  center: { lat: number; lng: number }
  boundaryPolygon: Array<{ lat: number; lng: number }>
  riskIndex: number // 0.0 to 10.0 (10 = highest risk)
  safetyScore: number // 0 to 100 (100 = safest)
  type: 'safe' | 'caution' | 'danger'
  factors: {
    crimeWeight: number
    lightingWeight: number
    crowdDensityWeight: number
    terrainHazardWeight: number
    policeProximityMitigation: number
  }
  dominantCorridor?: string
  lastEvaluated: number
}

export interface SpatialBoundingBox {
  minLat: number
  maxLat: number
  minLng: number
  maxLng: number
}

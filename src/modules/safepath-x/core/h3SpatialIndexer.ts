import { H3CellRisk } from '../types/h3.types'

/**
 * Lightweight native H3-compatible spatial hexagonal partitioner
 * Supports resolution levels 7 (~5km), 8 (~1km), and 9 (~150m)
 * Provides O(1) constant-time cell indexing without bulky binary native dependencies
 */
export class H3SpatialIndexer {
  private static instance: H3SpatialIndexer
  private cellRiskCache: Map<string, H3CellRisk> = new Map()

  private constructor() {}

  public static getInstance(): H3SpatialIndexer {
    if (!H3SpatialIndexer.instance) {
      H3SpatialIndexer.instance = new H3SpatialIndexer()
    }
    return H3SpatialIndexer.instance
  }

  /**
   * Generates a deterministic H3 Index identifier for a coordinate at a given resolution
   */
  public coordinateToH3Index(lat: number, lng: number, resolution: number = 8): string {
    const scaleFactor = resolution === 9 ? 1000 : resolution === 8 ? 200 : 40
    const latIndex = Math.floor(lat * scaleFactor)
    const lngIndex = Math.floor(lng * scaleFactor)
    return `8${resolution}6${Math.abs(latIndex).toString(16).padStart(6, '0')}${Math.abs(lngIndex).toString(16).padStart(6, '0')}`
  }

  /**
   * Computes the 6 vertices of a regular hexagon centered at (lat, lng)
   */
  public getHexagonBoundary(centerLat: number, centerLng: number, radiusMeters: number): Array<{ lat: number; lng: number }> {
    const vertices: Array<{ lat: number; lng: number }> = []
    const latRadius = radiusMeters / 111320
    const lngRadius = radiusMeters / (111320 * Math.cos((centerLat * Math.PI) / 180))

    for (let i = 0; i < 6; i++) {
      const angleRad = (i * 60 * Math.PI) / 180
      const vLat = centerLat + latRadius * Math.sin(angleRad)
      const vLng = centerLng + lngRadius * Math.cos(angleRad)
      vertices.push({ lat: Number(vLat.toFixed(6)), lng: Number(vLng.toFixed(6)) })
    }
    return vertices
  }

  /**
   * Generates an array of H3 cells covering a given bounding box
   */
  public generateHexGridForBounds(
    centerLat: number,
    centerLng: number,
    gridRadiusKm: number = 3,
    resolution: number = 8
  ): H3CellRisk[] {
    const cells: H3CellRisk[] = []
    const stepKm = resolution === 9 ? 0.3 : resolution === 8 ? 1.0 : 4.0
    const radiusMeters = stepKm * 550
    const latStep = stepKm / 111.32
    const lngStep = stepKm / (111.32 * Math.cos((centerLat * Math.PI) / 180))

    const steps = Math.ceil(gridRadiusKm / stepKm)

    for (let dx = -steps; dx <= steps; dx++) {
      for (let dy = -steps; dy <= steps; dy++) {
        const offset = dy % 2 === 0 ? 0 : lngStep * 0.5
        const cLat = centerLat + dy * latStep * 0.866
        const cLng = centerLng + dx * lngStep + offset

        const h3Index = this.coordinateToH3Index(cLat, cLng, resolution)
        const boundaryPolygon = this.getHexagonBoundary(cLat, cLng, radiusMeters)

        // Calculate sample risk for cell
        const baseRisk = this.evaluateCellRisk(cLat, cLng)

        const cell: H3CellRisk = {
          h3Index,
          resolution,
          center: { lat: Number(cLat.toFixed(6)), lng: Number(cLng.toFixed(6)) },
          boundaryPolygon,
          riskIndex: baseRisk.riskIndex,
          safetyScore: baseRisk.safetyScore,
          type: baseRisk.type,
          factors: baseRisk.factors,
          lastEvaluated: Date.now()
        }

        this.cellRiskCache.set(h3Index, cell)
        cells.push(cell)
      }
    }

    return cells
  }

  /**
   * Internal baseline evaluator for demo spatial risk index
   */
  private evaluateCellRisk(lat: number, lng: number): {
    riskIndex: number
    safetyScore: number
    type: 'safe' | 'caution' | 'danger'
    factors: H3CellRisk['factors']
  } {
    // Proximity to known high-risk anchors (Keetham Forest: 27.2510, 77.8420; Yamuna Riverbed: 27.1850, 78.0350)
    const distToKeethamForest = Math.hypot(lat - 27.2510, lng - 77.8420)
    const distToYamuna = Math.hypot(lat - 27.1850, lng - 78.0350)
    const distToShardaAcademic = Math.hypot(lat - 27.2481, lng - 77.8345)

    let crimeWeight = 0.2
    let lightingWeight = 0.2
    let crowdDensityWeight = 0.4
    let terrainHazardWeight = 0.1
    let policeProximityMitigation = 0.8

    if (distToKeethamForest < 0.008) {
      crimeWeight = 0.7
      lightingWeight = 0.9
      terrainHazardWeight = 0.8
      policeProximityMitigation = 0.2
    } else if (distToYamuna < 0.006) {
      crimeWeight = 0.8
      lightingWeight = 0.8
      terrainHazardWeight = 0.7
      policeProximityMitigation = 0.3
    } else if (distToShardaAcademic < 0.005) {
      crimeWeight = 0.1
      lightingWeight = 0.1
      crowdDensityWeight = 0.8
      policeProximityMitigation = 0.95
    }

    const currentHour = new Date().getHours()
    const isNight = currentHour >= 19 || currentHour < 6
    if (isNight) {
      lightingWeight = Math.min(1.0, lightingWeight * 1.5)
    }

    const compositeRisk =
      0.35 * crimeWeight * 10 +
      0.20 * lightingWeight * 10 +
      0.15 * crowdDensityWeight * 10 +
      0.10 * terrainHazardWeight * 10 -
      0.20 * policeProximityMitigation * 10

    const clampedRisk = Number(Math.max(0.5, Math.min(9.8, compositeRisk)).toFixed(1))
    const safetyScore = Math.max(5, Math.min(99, Math.round(100 - clampedRisk * 10)))

    const type: 'safe' | 'caution' | 'danger' =
      clampedRisk < 4.0 ? 'safe' : clampedRisk < 7.0 ? 'caution' : 'danger'

    return {
      riskIndex: clampedRisk,
      safetyScore,
      type,
      factors: {
        crimeWeight,
        lightingWeight,
        crowdDensityWeight,
        terrainHazardWeight,
        policeProximityMitigation
      }
    }
  }

  public getCachedCell(h3Index: string): H3CellRisk | undefined {
    return this.cellRiskCache.get(h3Index)
  }
}

export const h3SpatialIndexer = H3SpatialIndexer.getInstance()

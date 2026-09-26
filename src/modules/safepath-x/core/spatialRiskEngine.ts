import { H3CellRisk } from '../types/h3.types'
import { h3SpatialIndexer } from './h3SpatialIndexer'

export interface RiskEvaluationRequest {
  lat: number
  lng: number
  timestamp?: number
  currentSpeed?: number
  userGroupSize?: number
}

export interface RiskEvaluationResponse {
  h3Index: string
  compositeRiskScore: number // 0.0 to 10.0
  safetyRatingPercent: number // 0 to 100%
  zoneClassification: 'safe' | 'caution' | 'danger'
  activeRiskFactors: string[]
  recommendedActions: string[]
  nearestPoliceUnitMeters: number
  safeCorridorId?: string
}

export class SpatialRiskEngine {
  private static instance: SpatialRiskEngine

  private constructor() {}

  public static getInstance(): SpatialRiskEngine {
    if (!SpatialRiskEngine.instance) {
      SpatialRiskEngine.instance = new SpatialRiskEngine()
    }
    return SpatialRiskEngine.instance
  }

  /**
   * Calculates the composite multi-factor dynamic risk score for any location and timestamp
   */
  public evaluateLocation(req: RiskEvaluationRequest): RiskEvaluationResponse {
    const { lat, lng, timestamp = Date.now() } = req
    const h3Index = h3SpatialIndexer.coordinateToH3Index(lat, lng, 8)

    // Check proximity to anchors
    const distToKeethamForest = Math.hypot(lat - 27.2510, lng - 77.8420)
    const distToTajUNESCO = Math.hypot(lat - 27.1751, lng - 78.0421)
    const distToShardaCampus = Math.hypot(lat - 27.2481, lng - 77.8345)

    const date = new Date(timestamp)
    const hour = date.getHours()
    const isNight = hour >= 19 || hour < 6

    let baseCrime = 2.0
    let lightingDeficit = isNight ? 5.0 : 1.0
    let crowdIsolation = 3.0
    let terrainHazard = 1.5
    let policeProtection = 7.5
    let nearestPolice = 1200 // meters

    const activeRisks: string[] = []
    const recommendations: string[] = []

    if (distToKeethamForest < 0.008) {
      baseCrime = 7.5
      lightingDeficit = isNight ? 9.5 : 4.0
      terrainHazard = 8.5
      crowdIsolation = 8.0
      policeProtection = 2.0
      nearestPolice = 2800

      activeRisks.push('Dense forest perimeter & wildlife corridor (Sur Sarovar)')
      if (isNight) activeRisks.push('Curfew active (Unlit after 17:30 - Wildlife hazard)')
      recommendations.push('Head West immediately toward the NH-19 illuminated highway frontage')
      recommendations.push('Avoid unpaved wetland trails and stay in groups')
    } else if (distToShardaCampus < 0.006) {
      baseCrime = 0.8
      lightingDeficit = 0.5
      crowdIsolation = 1.0
      policeProtection = 9.5
      nearestPolice = 150

      recommendations.push('Verified Safe Campus Enclave. 24/7 Security Patrols active')
      recommendations.push('Keep Digital Tourist / Student ID handy for entry gates')
    } else if (distToTajUNESCO < 0.007) {
      baseCrime = 1.2
      lightingDeficit = 0.8
      policeProtection = 9.8
      nearestPolice = 80
      recommendations.push('Tier-1 Maximum Protection CISF Protected Heritage Corridor')
    } else {
      recommendations.push('Maintain general spatial awareness and stay on main arterial roads')
    }

    if (isNight && lightingDeficit > 4.0) {
      activeRisks.push('Low-light sector after dusk')
      recommendations.push('Utilize well-lit SafePath verified transit corridors')
    }

    // Composite equation: R = 0.35*C + 0.20*L + 0.15*D + 0.10*T - 0.20*P
    const compositeRisk =
      0.35 * baseCrime +
      0.20 * lightingDeficit +
      0.15 * crowdIsolation +
      0.10 * terrainHazard -
      0.20 * policeProtection

    const clampedRisk = Number(Math.max(0.4, Math.min(9.9, compositeRisk)).toFixed(1))
    const safetyPercent = Math.max(5, Math.min(99, Math.round(100 - clampedRisk * 10)))

    const zoneClassification: 'safe' | 'caution' | 'danger' =
      clampedRisk < 3.8 ? 'safe' : clampedRisk < 6.8 ? 'caution' : 'danger'

    return {
      h3Index,
      compositeRiskScore: clampedRisk,
      safetyRatingPercent: safetyPercent,
      zoneClassification,
      activeRiskFactors: activeRisks.length > 0 ? activeRisks : ['No acute immediate hazards detected'],
      recommendations,
      nearestPoliceUnitMeters: nearestPolice,
      safeCorridorId: 'corridor-golden-triangle'
    }
  }
}

export const spatialRiskEngine = SpatialRiskEngine.getInstance()

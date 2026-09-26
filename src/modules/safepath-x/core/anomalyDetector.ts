import { NationalTouristTelemetry, NationalIncidentAlert } from '../types/safepathX.types'

/**
 * Spatial Trajectory & Stationary Distress Anomaly Detector
 */
export class AnomalyDetector {
  private static instance: AnomalyDetector
  private touristHistory: Map<string, { lastLat: number; lastLng: number; lastMovedTime: number }> = new Map()

  private constructor() {}

  public static getInstance(): AnomalyDetector {
    if (!AnomalyDetector.instance) {
      AnomalyDetector.instance = new AnomalyDetector()
    }
    return AnomalyDetector.instance
  }

  public analyzeTelemetry(telemetry: NationalTouristTelemetry): NationalIncidentAlert | null {
    // 1. Panic SOS Flag (Immediate Critical Alert)
    if (telemetry.isPanic) {
      return {
        incidentId: `inc-sos-${Date.now()}-${telemetry.touristId.slice(-4)}`,
        touristId: telemetry.touristId,
        touristName: telemetry.touristName,
        phone: telemetry.contactPhone,
        stateCode: telemetry.stateCode || 'UP',
        corridorId: telemetry.currentCorridorId,
        severity: 'CRITICAL',
        type: 'PANIC_SOS',
        lat: telemetry.lat,
        lng: telemetry.lng,
        formattedAddress: telemetry.formattedAddress,
        timestamp: Date.now(),
        erssDispatched: true,
        erssCadNumber: `CAD-UP-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
        assignedUnit: 'Rapid Response Highway Interceptor 04',
        status: 'OPEN'
      }
    }

    // 2. Stationary Dwell Time Anomaly in Danger Zone (> 25 mins motionless in red zone)
    const history = this.touristHistory.get(telemetry.touristId)
    const now = Date.now()

    if (history) {
      const distMoved = Math.hypot(telemetry.lat - history.lastLat, telemetry.lng - history.lastLng)
      if (distMoved < 0.0001) {
        const motionlessMinutes = (now - history.lastMovedTime) / 60000
        if (telemetry.status === 'danger' && motionlessMinutes > 25) {
          return {
            incidentId: `inc-stat-${Date.now()}-${telemetry.touristId.slice(-4)}`,
            touristId: telemetry.touristId,
            touristName: telemetry.touristName,
            phone: telemetry.contactPhone,
            stateCode: telemetry.stateCode || 'UP',
            corridorId: telemetry.currentCorridorId,
            severity: 'HIGH',
            type: 'STATIONARY_DISTRESS',
            lat: telemetry.lat,
            lng: telemetry.lng,
            formattedAddress: telemetry.formattedAddress,
            timestamp: Date.now(),
            erssDispatched: false,
            assignedUnit: 'State Tourism Safety Outpost Unit',
            status: 'OPEN'
          }
        }
      } else {
        this.touristHistory.set(telemetry.touristId, {
          lastLat: telemetry.lat,
          lastLng: telemetry.lng,
          lastMovedTime: now
        })
      }
    } else {
      this.touristHistory.set(telemetry.touristId, {
        lastLat: telemetry.lat,
        lastLng: telemetry.lng,
        lastMovedTime: now
      })
    }

    return null
  }
}

export const anomalyDetector = AnomalyDetector.getInstance()

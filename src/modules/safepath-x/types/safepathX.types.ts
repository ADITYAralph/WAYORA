import { H3CellRisk } from './h3.types'

export interface NationalTouristTelemetry {
  telemetryId: string
  touristId: string
  touristName: string
  nationality: string
  contactPhone: string
  emergencyContact: string
  digitalIdHash: string
  lat: number
  lng: number
  altitude?: number
  speed: number | null // m/s or km/h
  heading: number | null // degrees
  accuracy: number // meters
  batteryLevel?: number
  currentH3Index: string
  currentCorridorId?: string
  stateCode: string
  currentZoneName: string
  safetyLevel: number // 1 to 10
  status: 'safe' | 'caution' | 'danger' | 'sos'
  isPanic: boolean
  isStationaryAnomaly: boolean
  timestamp: number
  formattedAddress: string
}

export interface StateControlRoom {
  stateCode: string
  stateName: string
  policeHQ: string
  tourismBoard: string
  erssEndpoint: string
  emergencyHelpline: string
  activePatrolUnits: number
  activeTouristCount: number
  alertCount: number
  coveragePolygonCenter: { lat: number; lng: number }
}

export interface NationalCorridor {
  id: string
  name: string
  region: 'North' | 'South' | 'East' | 'West' | 'Northeast' | 'Central'
  statesCovered: string[]
  keyWaypoints: Array<{ name: string; lat: number; lng: number }>
  totalDistanceKm: number
  averageSafetyRating: number
  highRiskSectors: Array<{
    name: string
    lat: number
    lng: number
    radiusMeters: number
    riskReason: string
    curfewStart?: string
  }>
  emergencyHubs: Array<{
    name: string
    type: 'police' | 'medical' | 'tourist_booth'
    phone: string
    lat: number
    lng: number
  }>
}

export interface NationalIncidentAlert {
  incidentId: string
  touristId: string
  touristName: string
  phone: string
  stateCode: string
  corridorId?: string
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  type: 'PANIC_SOS' | 'STATIONARY_DISTRESS' | 'ROUTE_DEVIATION' | 'DANGER_ZONE_BREACH'
  lat: number
  lng: number
  formattedAddress: string
  timestamp: number
  erssDispatched: boolean
  erssCadNumber?: string
  assignedUnit?: string
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED'
}

export interface SafeRouteResult {
  routeType: 'fast' | 'safe'
  totalDistanceMeters: number
  estimatedDurationSeconds: number
  compositeRiskScore: number
  waypoints: Array<[number, number]> // [lat, lng]
  avoidedDangerZones: string[]
  safeCheckpointsPassed: number
}

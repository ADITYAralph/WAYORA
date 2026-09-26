import { STATE_COMMAND_REGISTRY } from '../data/stateCommandRegistry'
import { NationalIncidentAlert } from '../types/safepathX.types'

export interface ErssCadPayload {
  cadId: string
  timestamp: string
  sourceApp: string
  incidentType: string
  priority: 'P1-EMERGENCY' | 'P2-HIGH' | 'P3-MEDIUM'
  victimDetails: {
    name: string
    touristId: string
    phone: string
  }
  gisLocation: {
    latitude: number
    longitude: number
    address: string
    stateCode: string
  }
  assignedStatePSAP: string
  recommendedUnits: string[]
}

export class Erss112Bridge {
  private static instance: Erss112Bridge

  private constructor() {}

  public static getInstance(): Erss112Bridge {
    if (!Erss112Bridge.instance) {
      Erss112Bridge.instance = new Erss112Bridge()
    }
    return Erss112Bridge.instance
  }

  public generateCadDispatch(alert: NationalIncidentAlert): ErssCadPayload {
    const stateInfo = STATE_COMMAND_REGISTRY[alert.stateCode] || STATE_COMMAND_REGISTRY['UP']
    const cadId = `CAD-${alert.stateCode}-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`

    const payload: ErssCadPayload = {
      cadId,
      timestamp: new Date().toISOString(),
      sourceApp: 'WayORA National Infrastructure',
      incidentType: alert.type === 'PANIC_SOS' ? '112-SOS Panic Distress Alarm' : 'Geospatial Hazard / Anomaly Alert',
      priority: alert.severity === 'CRITICAL' ? 'P1-EMERGENCY' : 'P2-HIGH',
      victimDetails: {
        name: alert.touristName,
        touristId: alert.touristId,
        phone: alert.phone
      },
      gisLocation: {
        latitude: alert.lat,
        longitude: alert.lng,
        address: alert.formattedAddress,
        stateCode: alert.stateCode
      },
      assignedStatePSAP: stateInfo.policeHQ,
      recommendedUnits: [
        'Local Police Station Emergency Mobile Patrol (PRV)',
        'State Tourism Safety Quick Response Team (QRT)',
        '108 Advanced Life Support (ALS) Ambulance'
      ]
    }

    console.log(`🚨 [ERSS-112 BRIDGE] CAD Dispatch Generated for ${alert.touristName} (${cadId}) to ${stateInfo.policeHQ}`)
    return payload
  }
}

export const erss112Bridge = Erss112Bridge.getInstance()

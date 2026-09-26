import { NATIONAL_TOURISM_CORRIDORS } from '../data/nationalCorridors'
import { NationalCorridor } from '../types/safepathX.types'
import { SHARDA_AGRA_ZONES, AgraSafetyZone } from '@/data/shardaAgraZones'

export class NationalZoneService {
  private static instance: NationalZoneService

  private constructor() {}

  public static getInstance(): NationalZoneService {
    if (!NationalZoneService.instance) {
      NationalZoneService.instance = new NationalZoneService()
    }
    return NationalZoneService.instance
  }

  public getAllCorridors(): NationalCorridor[] {
    return NATIONAL_TOURISM_CORRIDORS
  }

  public getCorridorById(id: string): NationalCorridor | undefined {
    return NATIONAL_TOURISM_CORRIDORS.find(c => c.id === id)
  }

  public getLocalCampusZones(): AgraSafetyZone[] {
    return SHARDA_AGRA_ZONES
  }

  public findNearestCorridor(lat: number, lng: number): { corridor: NationalCorridor; distanceKm: number } | null {
    let nearest: NationalCorridor | null = null
    let minDistance = Infinity

    NATIONAL_TOURISM_CORRIDORS.forEach(corridor => {
      corridor.keyWaypoints.forEach(wp => {
        const d = Math.hypot(lat - wp.lat, lng - wp.lng) * 111.32
        if (d < minDistance) {
          minDistance = d
          nearest = corridor
        }
      })
    })

    return nearest ? { corridor: nearest, distanceKm: Number(minDistance.toFixed(1)) } : null
  }
}

export const nationalZoneService = NationalZoneService.getInstance()

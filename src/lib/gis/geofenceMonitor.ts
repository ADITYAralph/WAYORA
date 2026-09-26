/**
 * SafePath-X Automated Geofence Entry/Exit Transition Engine
 * Uses Haversine geodesic distance calculation to monitor transitions across GLOBAL_SAFETY_ZONES.
 * Dispatches real-time events to Firestore 'authority_notifications' collection.
 */

import { GLOBAL_SAFETY_ZONES, SafetyZone } from '@/lib/constants/zones'
import { db } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

export type TransitionEvent = 'ENTRY' | 'EXIT'

export interface ZoneTransitionAlert {
  type: 'ZONE_TRANSITION'
  event: TransitionEvent
  zoneName: string
  zoneLevel: 'Safe' | 'Caution' | 'Danger'
  touristName: string
  touristId: string
  timestamp: string
  location: { lat: number; lng: number }
  metadata: string
}

type TransitionCallback = (alert: ZoneTransitionAlert) => void

class GeofenceMonitor {
  private userInsideZones: Set<string> = new Set()
  private listeners: TransitionCallback[] = []
  private initialized = false

  /**
   * Calculates Haversine distance in meters between two lat/lng points.
   */
  public calculateHaversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371000 // Earth radius in meters
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  /**
   * Evaluates current user position against all global safety zones.
   */
  public evaluatePosition(
    lat: number,
    lng: number,
    touristName = 'Aditya Kaushik',
    touristId = 'TID-88491'
  ): ZoneTransitionAlert[] {
    const alerts: ZoneTransitionAlert[] = []

    GLOBAL_SAFETY_ZONES.forEach((zone: SafetyZone) => {
      const distance = this.calculateHaversineDistance(
        lat,
        lng,
        zone.center[0],
        zone.center[1]
      )
      const isInsideNow = distance <= zone.radius
      const wasInsideBefore = this.userInsideZones.has(zone.id)

      if (this.initialized) {
        if (isInsideNow && !wasInsideBefore) {
          // ZONE ENTRY TRANSITION
          this.userInsideZones.add(zone.id)
          const alert: ZoneTransitionAlert = {
            type: 'ZONE_TRANSITION',
            event: 'ENTRY',
            zoneName: zone.name,
            zoneLevel: zone.level,
            touristName,
            touristId,
            timestamp: new Date().toISOString(),
            location: { lat, lng },
            metadata: zone.metadata
          }
          alerts.push(alert)
          this.broadcastAlert(alert)
        } else if (!isInsideNow && wasInsideBefore) {
          // ZONE EXIT TRANSITION
          this.userInsideZones.delete(zone.id)
          const alert: ZoneTransitionAlert = {
            type: 'ZONE_TRANSITION',
            event: 'EXIT',
            zoneName: zone.name,
            zoneLevel: zone.level,
            touristName,
            touristId,
            timestamp: new Date().toISOString(),
            location: { lat, lng },
            metadata: zone.metadata
          }
          alerts.push(alert)
          this.broadcastAlert(alert)
        }
      } else {
        // Initial state population
        if (isInsideNow) {
          this.userInsideZones.add(zone.id)
        }
      }
    })

    if (!this.initialized) {
      this.initialized = true
    }

    return alerts
  }

  /**
   * Broadcasts alert to subscribers and writes document to Firestore.
   */
  private async broadcastAlert(alert: ZoneTransitionAlert) {
    // Notify in-memory client subscribers
    this.listeners.forEach((callback) => {
      try {
        callback(alert)
      } catch (err) {
        console.error('Error in transition listener:', err)
      }
    })

    // Write to Firestore authority_notifications
    try {
      if (db) {
        await addDoc(collection(db, 'authority_notifications'), {
          ...alert,
          createdAt: serverTimestamp()
        })
      }
    } catch (err: any) {
      console.warn('Firestore notification write bypassed:', err.message)
    }
  }

  /**
   * Subscribe to local transition events.
   */
  public subscribe(callback: TransitionCallback): () => void {
    this.listeners.push(callback)
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback)
    }
  }
}

export const geofenceMonitor = new GeofenceMonitor()

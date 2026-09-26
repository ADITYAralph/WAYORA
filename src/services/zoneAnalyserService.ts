import { SHARDA_AGRA_ZONES, AgraSafetyZone } from '@/data/shardaAgraZones'
import { db } from '@/lib/firebase'
import { doc, setDoc, updateDoc, collection, addDoc, onSnapshot, query, where, orderBy, limit } from 'firebase/firestore'

export interface LiveTouristLocation {
  userId: string
  touristName: string
  touristId: string
  phone?: string
  email?: string
  lat: number
  lng: number
  accuracy: number
  speed?: number | null
  heading?: number | null
  timestamp: number
  formattedAddress: string
  currentZoneId: string | null
  currentZoneName: string | null
  currentZoneType: 'safe' | 'caution' | 'danger' | 'outside'
  safetyLevel: number
  isPanic: boolean
  batteryLevel?: number
  isSharing: boolean
}

export interface ZoneTransitionEvent {
  id: string
  userId: string
  touristName: string
  touristId: string
  zoneId: string
  zoneName: string
  zoneType: 'safe' | 'caution' | 'danger'
  action: 'ENTER' | 'EXIT' | 'INSIDE'
  location: { lat: number; lng: number }
  formattedAddress: string
  timestamp: number
  riskFactors: string[]
  emergencyContacts: {
    police: string
    medical: string
    campusSecurity?: string
    touristHelpline: string
  }
}

class ZoneAnalyserService {
  private static instance: ZoneAnalyserService
  private watchId: number | null = null
  private broadcastChannel: BroadcastChannel | null = null
  private addressCache: Map<string, string> = new Map()
  private lastKnownZoneId: string | null = null
  private activeLocationListeners: Set<(loc: LiveTouristLocation) => void> = new Set()
  private activeAlertListeners: Set<(alert: ZoneTransitionEvent) => void> = new Set()

  private constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel('safepath_live_stream')
        this.broadcastChannel.onmessage = (event) => {
          if (event.data?.type === 'LOCATION_UPDATE') {
            this.activeLocationListeners.forEach(listener => listener(event.data.payload))
          } else if (event.data?.type === 'ZONE_TRANSITION') {
            this.activeAlertListeners.forEach(listener => listener(event.data.payload))
          }
        }
      } catch (err) {
        console.warn('BroadcastChannel not initialized:', err)
      }
    }
  }

  static getInstance(): ZoneAnalyserService {
    if (!ZoneAnalyserService.instance) {
      ZoneAnalyserService.instance = new ZoneAnalyserService()
    }
    return ZoneAnalyserService.instance
  }

  // Calculate distance in meters using Haversine formula
  public calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371e3
    const φ1 = (lat1 * Math.PI) / 180
    const φ2 = (lat2 * Math.PI) / 180
    const Δφ = ((lat2 - lat1) * Math.PI) / 180
    const Δλ = ((lng2 - lng1) * Math.PI) / 180

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  // Point in Polygon algorithm (Ray Casting)
  public isPointInPolygon(point: { lat: number; lng: number }, vs: Array<{ lat: number; lng: number }>): boolean {
    const x = point.lat
    const y = point.lng
    let inside = false
    for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
      const xi = vs[i].lat
      const yi = vs[i].lng
      const xj = vs[j].lat
      const yj = vs[j].lng

      const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi
      if (intersect) inside = !inside
    }
    return inside
  }

  // Analyse coordinates against all Sharda Agra and Agra Safety Zones
  public analyseZone(lat: number, lng: number): {
    zone: AgraSafetyZone | null
    distanceFromCenter: number
    type: 'safe' | 'caution' | 'danger' | 'outside'
    safetyLevel: number
  } {
    for (const zone of SHARDA_AGRA_ZONES) {
      // If polygon defined, test polygon first
      if (zone.polygon && zone.polygon.length >= 3) {
        if (this.isPointInPolygon({ lat, lng }, zone.polygon)) {
          const dist = this.calculateDistance(lat, lng, zone.center.lat, zone.center.lng)
          return {
            zone,
            distanceFromCenter: Math.round(dist),
            type: zone.type,
            safetyLevel: zone.safetyLevel
          }
        }
      }

      // Test radius from center
      const distance = this.calculateDistance(lat, lng, zone.center.lat, zone.center.lng)
      if (distance <= zone.radius) {
        return {
          zone,
          distanceFromCenter: Math.round(distance),
          type: zone.type,
          safetyLevel: zone.safetyLevel
        }
      }
    }

    return {
      zone: null,
      distanceFromCenter: 0,
      type: 'outside',
      safetyLevel: 7 // Default neutral safety score
    }
  }

  // Reverse Geocoding via OpenStreetMap with caching
  public async reverseGeocode(lat: number, lng: number): Promise<string> {
    const key = `${lat.toFixed(4)},${lng.toFixed(4)}`
    if (this.addressCache.has(key)) {
      return this.addressCache.get(key)!
    }

    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      const res = await fetch(url, {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'SafePath-Tourist-Safety-App'
        }
      })

      if (res.ok) {
        const data = await res.json()
        if (data && data.display_name) {
          const addr = data.display_name
          this.addressCache.set(key, addr)
          return addr
        }
      }
    } catch (err) {
      console.warn('Reverse geocoding error:', err)
    }

    // Fallback based on proximity to Sharda / Agra landmarks
    const { zone } = this.analyseZone(lat, lng)
    if (zone) {
      const fallback = `${zone.name}, ${zone.address}`
      this.addressCache.set(key, fallback)
      return fallback
    }

    const defaultFallback = `Coordinates: ${lat.toFixed(5)}° N, ${lng.toFixed(5)}° E, Agra Region, Uttar Pradesh`
    this.addressCache.set(key, defaultFallback)
    return defaultFallback
  }

  // Process a coordinate update and publish notifications to authorities
  public async processLocationUpdate(
    userMeta: {
      userId: string
      touristName: string
      touristId: string
      phone?: string
      email?: string
    },
    coords: {
      lat: number
      lng: number
      accuracy?: number
      speed?: number | null
      heading?: number | null
    },
    isPanic: boolean = false
  ): Promise<LiveTouristLocation> {
    const analysis = this.analyseZone(coords.lat, coords.lng)
    const formattedAddress = await this.reverseGeocode(coords.lat, coords.lng)

    const locationData: LiveTouristLocation = {
      userId: userMeta.userId,
      touristName: userMeta.touristName,
      touristId: userMeta.touristId,
      phone: userMeta.phone || '+91 98765 43210',
      email: userMeta.email,
      lat: coords.lat,
      lng: coords.lng,
      accuracy: coords.accuracy || 10,
      speed: coords.speed || null,
      heading: coords.heading || null,
      timestamp: Date.now(),
      formattedAddress,
      currentZoneId: analysis.zone?.id || null,
      currentZoneName: analysis.zone?.name || 'Agra Open Zone',
      currentZoneType: analysis.type,
      safetyLevel: analysis.safetyLevel,
      isPanic,
      isSharing: true
    }

    // Detect zone transition
    if (analysis.zone && analysis.zone.id !== this.lastKnownZoneId) {
      this.lastKnownZoneId = analysis.zone.id

      const transitionEvent: ZoneTransitionEvent = {
        id: `transition-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        userId: userMeta.userId,
        touristName: userMeta.touristName,
        touristId: userMeta.touristId,
        zoneId: analysis.zone.id,
        zoneName: analysis.zone.name,
        zoneType: analysis.zone.type,
        action: 'ENTER',
        location: { lat: coords.lat, lng: coords.lng },
        formattedAddress,
        timestamp: Date.now(),
        riskFactors: analysis.zone.riskFactors,
        emergencyContacts: analysis.zone.emergencyContacts
      }

      this.publishZoneTransition(transitionEvent)
    } else if (!analysis.zone && this.lastKnownZoneId) {
      // Exited a zone
      this.lastKnownZoneId = null
    }

    // Publish updates across all channels
    this.publishLocationUpdate(locationData)

    return locationData
  }

  // Publish Location Update to BroadcastChannel, LocalStorage, and Firebase
  private publishLocationUpdate(locationData: LiveTouristLocation): void {
    // 1. BroadcastChannel (fast intra-browser sync)
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({
          type: 'LOCATION_UPDATE',
          payload: locationData
        })
      } catch (e) {
        console.warn('BroadcastChannel post error', e)
      }
    }

    // 2. LocalStorage Sync for Multi-tab Authority View
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('safepath_live_tourist_location', JSON.stringify(locationData))
        
        // Update list of active tourists
        const activeListStr = localStorage.getItem('safepath_active_tourists_list') || '[]'
        let activeList: LiveTouristLocation[] = JSON.parse(activeListStr)
        activeList = activeList.filter(t => t.userId !== locationData.userId)
        activeList.unshift(locationData)
        localStorage.setItem('safepath_active_tourists_list', JSON.stringify(activeList.slice(0, 20)))
      } catch (err) {
        console.warn('LocalStorage sync error:', err)
      }
    }

    // 3. Firestore Sync (Cloud Persistence)
    if (typeof window !== 'undefined' && db && locationData.userId) {
      try {
        setDoc(doc(db, 'active_tourists', locationData.userId), {
          ...locationData,
          updatedAt: new Date().toISOString()
        }, { merge: true }).catch(err => console.warn('Firestore active_tourists update error:', err))
      } catch (err) {
        console.warn('Firestore write exception:', err)
      }
    }

    // 4. Notify local memory listeners
    this.activeLocationListeners.forEach(listener => listener(locationData))
  }

  // Publish Zone Transition Alert to Authority
  private publishZoneTransition(event: ZoneTransitionEvent): void {
    console.log(`🚨 ZONE TRANSITION: ${event.touristName} entered ${event.zoneName} (${event.zoneType})`)

    // 1. BroadcastChannel
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({
          type: 'ZONE_TRANSITION',
          payload: event
        })
      } catch (e) {
        console.warn('BroadcastChannel post error', e)
      }
    }

    // 2. LocalStorage Alerts Feed
    if (typeof window !== 'undefined') {
      try {
        const storedAlerts = JSON.parse(localStorage.getItem('safepath_authority_alerts') || '[]')
        storedAlerts.unshift(event)
        localStorage.setItem('safepath_authority_alerts', JSON.stringify(storedAlerts.slice(0, 30)))
      } catch (err) {
        console.warn('Alert storage error:', err)
      }
    }

    // 3. Firestore Alerts Collection
    if (typeof window !== 'undefined' && db) {
      try {
        addDoc(collection(db, 'authority_notifications'), {
          ...event,
          createdAt: new Date().toISOString(),
          status: 'UNREAD'
        }).catch(err => console.warn('Firestore notification error:', err))
      } catch (err) {
        console.warn('Firestore write exception:', err)
      }
    }

    // 4. Notify local memory listeners
    this.activeAlertListeners.forEach(listener => listener(event))
  }

  // Subscribe to live location stream
  public onLocationUpdate(callback: (loc: LiveTouristLocation) => void): () => void {
    this.activeLocationListeners.add(callback)
    return () => {
      this.activeLocationListeners.delete(callback)
    }
  }

  // Subscribe to authority zone transition alert stream
  public onZoneAlert(callback: (alert: ZoneTransitionEvent) => void): () => void {
    this.activeAlertListeners.add(callback)
    return () => {
      this.activeAlertListeners.delete(callback)
    }
  }

  // Start real GPS hardware tracking
  public startTracking(
    userMeta: {
      userId: string
      touristName: string
      touristId: string
      phone?: string
      email?: string
    },
    onSuccess?: (loc: LiveTouristLocation) => void,
    onError?: (err: GeolocationPositionError) => void
  ): boolean {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      return false
    }

    this.stopTracking()

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 5000
    }

    this.watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const loc = await this.processLocationUpdate(userMeta, {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          speed: pos.coords.speed,
          heading: pos.coords.heading
        })
        if (onSuccess) onSuccess(loc)
      },
      (err) => {
        console.error('GPS Watch error:', err)
        if (onError) onError(err)
      },
      options
    )

    return true
  }

  // Stop real GPS tracking
  public stopTracking(userId?: string): void {
    if (this.watchId !== null && typeof window !== 'undefined') {
      navigator.geolocation.clearWatch(this.watchId)
      this.watchId = null
    }

    // Mark as inactive in storage if userId provided
    if (userId && typeof window !== 'undefined') {
      try {
        const activeListStr = localStorage.getItem('safepath_active_tourists_list') || '[]'
        let activeList: LiveTouristLocation[] = JSON.parse(activeListStr)
        activeList = activeList.filter(t => t.userId !== userId)
        localStorage.setItem('safepath_active_tourists_list', JSON.stringify(activeList))
      } catch (err) {
        console.warn('Storage cleanup error:', err)
      }
    }
  }

  // Get initial/cached list of active tourists
  public getActiveTourists(): LiveTouristLocation[] {
    if (typeof window === 'undefined') return []
    try {
      const data = localStorage.getItem('safepath_active_tourists_list')
      if (data) return JSON.parse(data)
    } catch (err) {
      console.warn('Error reading active tourists:', err)
    }
    return []
  }

  // Get initial/cached authority alerts
  public getAuthorityAlerts(): ZoneTransitionEvent[] {
    if (typeof window === 'undefined') return []
    try {
      const data = localStorage.getItem('safepath_authority_alerts')
      if (data) return JSON.parse(data)
    } catch (err) {
      console.warn('Error reading authority alerts:', err)
    }
    return []
  }
}

export const zoneAnalyserService = ZoneAnalyserService.getInstance()
export default zoneAnalyserService

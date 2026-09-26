/**
 * SafePath-X Offline Manager & GSM SMS Fallback Dispatcher
 * Automatically detects network loss during SOS emergencies and activates 24-byte GSM SMS Beacon.
 */

import { packBeacon, SmsBeaconData } from '@/lib/telemetry/sms_beacon'

export interface OfflineEmergencyTriggerParams {
  userId: string
  touristName: string
  lat: number
  lng: number
  accuracy?: number
  batteryPercent?: number
  speedKmh?: number
  alertTypeId?: number // 1=SOS, 2=DIVERSION, 3=STATIONARY
  customPhone?: string // e.g. '112' or '1363'
}

export class OfflineManager {
  private static instance: OfflineManager
  private isOnlineState: boolean = true
  private connectionListeners: Set<(isOnline: boolean) => void> = new Set()

  private constructor() {
    if (typeof window !== 'undefined') {
      this.isOnlineState = navigator.onLine !== false

      window.addEventListener('online', () => {
        this.isOnlineState = true
        this.notifyListeners(true)
      })

      window.addEventListener('offline', () => {
        this.isOnlineState = false
        this.notifyListeners(false)
      })
    }
  }

  public static getInstance(): OfflineManager {
    if (!OfflineManager.instance) {
      OfflineManager.instance = new OfflineManager()
    }
    return OfflineManager.instance
  }

  public isOnline(): boolean {
    if (typeof window === 'undefined') return true
    return navigator.onLine !== false && this.isOnlineState
  }

  public onConnectionChange(callback: (isOnline: boolean) => void): () => void {
    this.connectionListeners.add(callback)
    return () => this.connectionListeners.delete(callback)
  }

  private notifyListeners(isOnline: boolean): void {
    this.connectionListeners.forEach((cb) => {
      try {
        cb(isOnline)
      } catch (e) {
        console.warn('Offline listener error:', e)
      }
    })
  }

  /**
   * Generates the 24-byte Base64 GSM SMS beacon and native SMS dispatch URI
   */
  public generateSmsFallback(params: OfflineEmergencyTriggerParams): {
    base64Beacon: string
    smsUriAndroid: string
    smsUriIOS: string
    humanReadableBody: string
    targetNumber: string
  } {
    const targetNumber = params.customPhone || '112'
    const now = new Date()
    const epochMinuteOffset = now.getHours() * 60 + now.getMinutes()

    const beaconData: SmsBeaconData = {
      version: 1,
      alertTypeId: params.alertTypeId || 1, // 1 = PANIC_SOS
      batteryPercent: params.batteryPercent !== undefined ? params.batteryPercent : 85,
      gpsAccuracyMeters: Math.round(params.accuracy || 10),
      latitude: Number(params.lat.toFixed(7)),
      longitude: Number(params.lng.toFixed(7)),
      epochMinuteOffset,
      speedKmh: Math.round(params.speedKmh || 0),
      touristShortHash: params.userId.replace(/[^a-f0-9]/gi, '').slice(0, 12).padEnd(12, '0')
    }

    const base64Beacon = packBeacon(beaconData)

    const humanReadableBody =
      `WAYORA SOS! TID:${params.userId} ` +
      `LOC:${params.lat.toFixed(5)}N,${params.lng.toFixed(5)}E ` +
      `BATT:${beaconData.batteryPercent}% ` +
      `BEACON:${base64Beacon}`

    const encodedBody = encodeURIComponent(humanReadableBody)

    // Android uses '?', iOS uses '&' for SMS query body delimiter
    const smsUriAndroid = `sms:${targetNumber}?body=${encodedBody}`
    const smsUriIOS = `sms:${targetNumber}&body=${encodedBody}`

    return {
      base64Beacon,
      smsUriAndroid,
      smsUriIOS,
      humanReadableBody,
      targetNumber
    }
  }

  /**
   * Launches native SMS application with pre-filled 24-byte GSM beacon
   */
  public launchNativeSms(params: OfflineEmergencyTriggerParams): boolean {
    if (typeof window === 'undefined') return false

    const { smsUriAndroid, smsUriIOS } = this.generateSmsFallback(params)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const uri = isIOS ? smsUriIOS : smsUriAndroid

    try {
      window.location.href = uri
      return true
    } catch (err) {
      console.warn('Failed to open native SMS client:', err)
      return false
    }
  }
}

export const offlineManager = OfflineManager.getInstance()

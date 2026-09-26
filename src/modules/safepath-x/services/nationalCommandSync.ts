import { NationalTouristTelemetry, NationalIncidentAlert } from '../types/safepathX.types'
import { telemetryBuffer } from '../core/telemetryBuffer'
import { anomalyDetector } from '../core/anomalyDetector'
import { erss112Bridge } from './erss112Bridge'

export class NationalCommandSync {
  private static instance: NationalCommandSync
  private broadcastChannel: BroadcastChannel | null = null
  private telemetryListeners: Set<(telemetry: NationalTouristTelemetry) => void> = new Set()
  private incidentListeners: Set<(alert: NationalIncidentAlert) => void> = new Set()

  private constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel('wayora_national_channel')
        this.broadcastChannel.onmessage = (event) => {
          if (event.data?.type === 'NATIONAL_TELEMETRY') {
            this.telemetryListeners.forEach((l) => l(event.data.payload))
          } else if (event.data?.type === 'NATIONAL_INCIDENT') {
            this.incidentListeners.forEach((l) => l(event.data.payload))
          }
        }
      } catch (err) {
        console.warn('BroadcastChannel error in WayORA:', err)
      }
    }

    // Connect telemetry buffer to anomaly pipeline
    telemetryBuffer.onFlush((batch) => {
      batch.forEach((telemetry) => {
        const anomaly = anomalyDetector.analyzeTelemetry(telemetry)
        if (anomaly) {
          this.publishIncident(anomaly)
        }
      })
    })
  }

  public static getInstance(): NationalCommandSync {
    if (!NationalCommandSync.instance) {
      NationalCommandSync.instance = new NationalCommandSync()
    }
    return NationalCommandSync.instance
  }

  public publishTelemetry(telemetry: NationalTouristTelemetry): void {
    telemetryBuffer.push(telemetry)

    // Broadcast across tabs
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({
          type: 'NATIONAL_TELEMETRY',
          payload: telemetry
        })
      } catch (e) {
        console.warn(e)
      }
    }

    // Local in-memory listeners
    this.telemetryListeners.forEach((l) => l(telemetry))

    // LocalStorage fallback for multi-window inspection
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('wayora_latest_telemetry', JSON.stringify(telemetry))
      } catch (e) {}
    }
  }

  public publishIncident(incident: NationalIncidentAlert): void {
    if (incident.severity === 'CRITICAL' && !incident.erssDispatched) {
      erss112Bridge.generateCadDispatch(incident)
      incident.erssDispatched = true
    }

    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({
          type: 'NATIONAL_INCIDENT',
          payload: incident
        })
      } catch (e) {
        console.warn(e)
      }
    }

    this.incidentListeners.forEach((l) => l(incident))

    if (typeof window !== 'undefined') {
      try {
        const stored = JSON.parse(localStorage.getItem('wayora_national_incidents') || '[]')
        stored.unshift(incident)
        localStorage.setItem('wayora_national_incidents', JSON.stringify(stored.slice(0, 50)))
      } catch (e) {}
    }
  }

  public onTelemetry(callback: (t: NationalTouristTelemetry) => void): () => void {
    this.telemetryListeners.add(callback)
    return () => this.telemetryListeners.delete(callback)
  }

  public onIncident(callback: (i: NationalIncidentAlert) => void): () => void {
    this.incidentListeners.add(callback)
    return () => this.incidentListeners.delete(callback)
  }

  public getCachedIncidents(): NationalIncidentAlert[] {
    if (typeof window === 'undefined') return []
    try {
      const stored = localStorage.getItem('wayora_national_incidents') || localStorage.getItem('safepath_x_national_incidents')
      if (stored) return JSON.parse(stored)
    } catch (e) {}
    return []
  }
}

export const nationalCommandSync = NationalCommandSync.getInstance()

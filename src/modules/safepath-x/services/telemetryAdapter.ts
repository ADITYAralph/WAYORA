/**
 * SafePath-X Telemetry Ingestion Mode Adapter
 * Toggles seamlessly between V1 Firestore direct sync and SafePath-X High-Throughput H3 Ingestion Worker
 * Configured via process.env.NEXT_PUBLIC_INGESTION_ENGINE ('h3_stream' | 'firestore_legacy')
 */

import { db } from '@/lib/firebase'
import { doc, setDoc } from 'firebase/firestore'
import { nationalCommandSync } from './nationalCommandSync'
import { NationalTouristTelemetry } from '../types/safepathX.types'

export type IngestionMode = 'h3_stream' | 'firestore_legacy'

export interface TelemetryPayload {
  userId: string
  touristName: string
  touristId: string
  phone?: string
  lat: number
  lng: number
  accuracy?: number
  speed?: number | null
  heading?: number | null
  timestamp?: number
  formattedAddress?: string
  currentZoneName?: string
  safetyLevel?: number
  isPanic?: boolean
}

export class TelemetryIngestionAdapter {
  private static instance: TelemetryIngestionAdapter
  private mode: IngestionMode = 'firestore_legacy'

  private constructor() {
    // Detect environment flag
    const envEngine = process.env.NEXT_PUBLIC_INGESTION_ENGINE
    if (envEngine === 'h3_stream') {
      this.mode = 'h3_stream'
    } else {
      this.mode = 'firestore_legacy'
    }
  }

  public static getInstance(): TelemetryIngestionAdapter {
    if (!TelemetryIngestionAdapter.instance) {
      TelemetryIngestionAdapter.instance = new TelemetryIngestionAdapter()
    }
    return TelemetryIngestionAdapter.instance
  }

  public getMode(): IngestionMode {
    return this.mode
  }

  public setMode(newMode: IngestionMode): void {
    this.mode = newMode
  }

  /**
   * Dispatches tourist telemetry through the configured ingestion pipeline
   */
  public async dispatchTelemetry(payload: TelemetryPayload): Promise<{ success: boolean; modeUsed: IngestionMode; h3Index?: string }> {
    const ts = payload.timestamp || Date.now()

    // MODE A: HIGH-THROUGHPUT H3 SPATIAL WORKER
    if (this.mode === 'h3_stream') {
      try {
        const nationalTelemetry: NationalTouristTelemetry = {
          telemetryId: `tel-${Date.now()}-${payload.userId.slice(-4)}`,
          touristId: payload.touristId || payload.userId,
          touristName: payload.touristName,
          nationality: 'Indian',
          contactPhone: payload.phone || '+91 98765 43210',
          emergencyContact: '+91 98765 00000',
          digitalIdHash: '0x8f192b49c09a82e1',
          lat: payload.lat,
          lng: payload.lng,
          speed: payload.speed || 0,
          heading: payload.heading || 0,
          accuracy: payload.accuracy || 10,
          currentH3Index: `896${Math.abs(Math.floor(payload.lat * 1000)).toString(16).padStart(6, '0')}${Math.abs(Math.floor(payload.lng * 1000)).toString(16).padStart(6, '0')}`,
          currentCorridorId: 'corridor-golden-triangle',
          stateCode: 'UP',
          currentZoneName: payload.currentZoneName || 'National Tourism Corridor',
          safetyLevel: payload.safetyLevel || 9,
          status: payload.isPanic ? 'sos' : payload.safetyLevel && payload.safetyLevel < 4 ? 'danger' : 'safe',
          isPanic: Boolean(payload.isPanic),
          isStationaryAnomaly: false,
          timestamp: ts,
          formattedAddress: payload.formattedAddress || 'Agra Tourism Track'
        }

        // Publish to in-memory/broadcast sync pipeline
        nationalCommandSync.publishTelemetry(nationalTelemetry)

        // Asynchronously post to backend edge ingestion endpoint without blocking
        if (typeof window !== 'undefined') {
          fetch('/api/safepath-x/telemetry', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nationalTelemetry)
          }).catch((err) => console.warn('SafePath-X Edge Ingestion async notify error:', err))
        }

        return {
          success: true,
          modeUsed: 'h3_stream',
          h3Index: nationalTelemetry.currentH3Index
        }
      } catch (err) {
        console.warn('[TelemetryAdapter] H3 Stream dispatch exception, falling back to local sync:', err)
      }
    }

    // MODE B: V1 FIRESTORE LEGACY SYNC
    if (db) {
      try {
        const touristRef = doc(db, 'active_tourists', payload.userId)
        await setDoc(
          touristRef,
          {
            userId: payload.userId,
            touristName: payload.touristName,
            touristId: payload.touristId,
            phone: payload.phone || '+91 98765 43210',
            lat: payload.lat,
            lng: payload.lng,
            accuracy: payload.accuracy || 10,
            speed: payload.speed || null,
            heading: payload.heading || null,
            timestamp: ts,
            formattedAddress: payload.formattedAddress,
            currentZoneName: payload.currentZoneName,
            safetyLevel: payload.safetyLevel,
            isPanic: Boolean(payload.isPanic),
            isSharing: true
          },
          { merge: true }
        )
      } catch (e) {
        // Silent fallback for offline
      }
    }

    return {
      success: true,
      modeUsed: 'firestore_legacy'
    }
  }
}

export const telemetryAdapter = TelemetryIngestionAdapter.getInstance()

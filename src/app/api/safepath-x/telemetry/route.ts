import { NextRequest, NextResponse } from 'next/server'
import { telemetryBuffer } from '@/modules/safepath-x/core/telemetryBuffer'
import { nationalCommandSync } from '@/modules/safepath-x/services/nationalCommandSync'
import { NationalTouristTelemetry } from '@/modules/safepath-x/types/safepathX.types'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const telemetry: NationalTouristTelemetry = {
      telemetryId: body.telemetryId || `tel-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      touristId: body.touristId || 'TID-DEMO',
      touristName: body.touristName || 'Anonymous Traveler',
      nationality: body.nationality || 'Indian',
      contactPhone: body.contactPhone || '+91 98765 43210',
      emergencyContact: body.emergencyContact || '+91 98765 00000',
      digitalIdHash: body.digitalIdHash || '0x0000',
      lat: Number(body.lat),
      lng: Number(body.lng),
      altitude: body.altitude,
      speed: body.speed || 0,
      heading: body.heading || 0,
      accuracy: body.accuracy || 10,
      batteryLevel: body.batteryLevel || 85,
      currentH3Index: body.currentH3Index || '8860000d6000000',
      currentCorridorId: body.currentCorridorId || 'corridor-golden-triangle',
      stateCode: body.stateCode || 'UP',
      currentZoneName: body.currentZoneName || 'National Corridor Track',
      safetyLevel: body.safetyLevel || 8,
      status: body.isPanic ? 'sos' : body.status || 'safe',
      isPanic: Boolean(body.isPanic),
      isStationaryAnomaly: Boolean(body.isStationaryAnomaly),
      timestamp: Date.now(),
      formattedAddress: body.formattedAddress || 'National Tourism Grid Coordinate'
    }

    // Publish to SafePath-X sync engine
    nationalCommandSync.publishTelemetry(telemetry)

    return NextResponse.json({
      success: true,
      telemetryId: telemetry.telemetryId,
      h3Index: telemetry.currentH3Index,
      status: 'INGESTED'
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 })
  }
}

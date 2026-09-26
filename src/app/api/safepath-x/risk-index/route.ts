import { NextRequest, NextResponse } from 'next/server'
import { spatialRiskEngine } from '@/modules/safepath-x/core/spatialRiskEngine'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { lat, lng, timestamp, currentSpeed, userGroupSize } = body

    if (lat === undefined || lng === undefined) {
      return NextResponse.json({ success: false, error: 'Latitude and Longitude are required' }, { status: 400 })
    }

    const evaluation = spatialRiskEngine.evaluateLocation({
      lat: Number(lat),
      lng: Number(lng),
      timestamp: timestamp ? Number(timestamp) : Date.now(),
      currentSpeed: currentSpeed ? Number(currentSpeed) : undefined,
      userGroupSize: userGroupSize ? Number(userGroupSize) : undefined
    })

    return NextResponse.json({
      success: true,
      data: evaluation
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

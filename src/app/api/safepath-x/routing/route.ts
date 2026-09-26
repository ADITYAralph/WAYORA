import { NextRequest, NextResponse } from 'next/server'
import { routingEngineX } from '@/modules/safepath-x/services/routingEngineX'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { origin, destination } = body

    if (!origin || !destination || !Array.isArray(origin) || !Array.isArray(destination)) {
      return NextResponse.json(
        { success: false, error: 'origin [lat, lng] and destination [lat, lng] arrays are required' },
        { status: 400 }
      )
    }

    const routes = routingEngineX.computeDualRoutes(
      [Number(origin[0]), Number(origin[1])],
      [Number(destination[0]), Number(destination[1])]
    )

    return NextResponse.json({
      success: true,
      routes
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

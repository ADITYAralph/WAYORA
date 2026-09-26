import { NextRequest, NextResponse } from 'next/server'
import { erss112Bridge } from '@/modules/safepath-x/services/erss112Bridge'
import { NationalIncidentAlert } from '@/modules/safepath-x/types/safepathX.types'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const incident: NationalIncidentAlert = {
      incidentId: body.incidentId || `inc-erss-${Date.now()}`,
      touristId: body.touristId || 'TID-DEMO',
      touristName: body.touristName || 'Aditya Kaushik',
      phone: body.phone || '+91 98765 43210',
      stateCode: body.stateCode || 'UP',
      severity: body.severity || 'CRITICAL',
      type: body.type || 'PANIC_SOS',
      lat: Number(body.lat),
      lng: Number(body.lng),
      formattedAddress: body.formattedAddress || 'Agra National Tourism Corridor',
      timestamp: Date.now(),
      erssDispatched: true,
      status: 'OPEN'
    }

    const cadPayload = erss112Bridge.generateCadDispatch(incident)

    return NextResponse.json({
      success: true,
      cadId: cadPayload.cadId,
      dispatchedTo: cadPayload.assignedStatePSAP,
      cadPayload
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

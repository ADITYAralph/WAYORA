/**
 * SafePath-X Real Road-Following Navigation via OSRM (Open Source Routing Machine)
 * 100% Free & Open-Source — No API keys or Google Maps dependencies.
 * Traces actual road networks, computes real driving distances & turn-by-turn steps.
 */

export interface RouteStep {
  id: string
  instruction: string
  streetName: string
  distanceMeters: number
  durationSeconds: number
  type: string
  modifier?: string
}

export interface OsrmRouteResult {
  coordinates: [number, number][] // Array of [lat, lng] for Leaflet
  distanceKm: number
  durationMins: number
  steps: RouteStep[]
  isFallback: boolean
  summary: string
}

/**
 * Converts OSRM maneuver type and modifier into human-readable direction text.
 */
function formatManeuverInstruction(type: string, modifier?: string, name?: string): string {
  const street = name && name.trim().length > 0 ? name : 'unnamed road'

  switch (type) {
    case 'depart':
      return `Head ${modifier ? modifier + ' ' : ''}on ${street}`
    case 'turn':
      if (modifier === 'straight') return `Continue straight onto ${street}`
      return `Turn ${modifier || ''} onto ${street}`
    case 'new name':
      return `Continue onto ${street}`
    case 'end of road':
      return `At the end of the road, turn ${modifier || 'left'} onto ${street}`
    case 'fork':
      return `Take the ${modifier || 'right'} fork onto ${street}`
    case 'merge':
      return `Merge ${modifier ? modifier + ' ' : ''}onto ${street}`
    case 'roundabout':
    case 'rotary':
      return `Enter the roundabout and take exit onto ${street}`
    case 'arrive':
      return `Arrive at destination (${street})`
    case 'continue':
      return `Continue on ${street}`
    default:
      if (modifier) {
        return `Make a ${modifier} onto ${street}`
      }
      return `Proceed onto ${street}`
  }
}

/**
 * Fetches real road-following route and turn-by-turn navigation steps from OSRM.
 * @param start [lat, lng]
 * @param end [lat, lng]
 */
export async function fetchRealRoadRoute(
  start: [number, number],
  end: [number, number],
  timeoutMs = 6000
): Promise<OsrmRouteResult> {
  // OSRM expects coordinates in [lng, lat] order in URL
  const url = `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson&steps=true`

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json'
      }
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`OSRM HTTP error: ${response.status}`)
    }

    const data = await response.json()

    if (!data.routes || data.routes.length === 0) {
      throw new Error('No driving route found between specified coordinates')
    }

    const primaryRoute = data.routes[0]

    // Convert OSRM GeoJSON [lng, lat] coordinates to Leaflet [lat, lng]
    const leafletCoords: [number, number][] = primaryRoute.geometry.coordinates.map(
      (coord: [number, number]) => [coord[1], coord[0]]
    )

    const distanceKm = Number((primaryRoute.distance / 1000).toFixed(1))
    const durationMins = Math.max(1, Math.round(primaryRoute.duration / 60))

    // Parse navigation steps
    const steps: RouteStep[] = []
    if (primaryRoute.legs && primaryRoute.legs.length > 0) {
      primaryRoute.legs.forEach((leg: any) => {
        if (leg.steps && Array.isArray(leg.steps)) {
          leg.steps.forEach((step: any, idx: number) => {
            const maneuverType = step.maneuver?.type || 'turn'
            const maneuverMod = step.maneuver?.modifier || ''
            const streetName = step.name || ''

            steps.push({
              id: `step-${idx}-${Date.now()}`,
              instruction: formatManeuverInstruction(maneuverType, maneuverMod, streetName),
              streetName: streetName || 'Corridor',
              distanceMeters: Math.round(step.distance || 0),
              durationSeconds: Math.round(step.duration || 0),
              type: maneuverType,
              modifier: maneuverMod
            })
          })
        }
      })
    }

    return {
      coordinates: leafletCoords,
      distanceKm,
      durationMins,
      steps,
      isFallback: false,
      summary: primaryRoute.legs?.[0]?.summary || 'Primary Road Corridor'
    }
  } catch (err: any) {
    console.warn('OSRM routing request failed, using resilient geometric fallback:', err.message)

    // Fallback: Generate interpolated road-following waypoints
    const midLat1 = start[0] + (end[0] - start[0]) * 0.33 + 0.002
    const midLng1 = start[1] + (end[1] - start[1]) * 0.33 - 0.003
    const midLat2 = start[0] + (end[0] - start[0]) * 0.66 - 0.001
    const midLng2 = start[1] + (end[1] - start[1]) * 0.66 + 0.002

    const fallbackCoords: [number, number][] = [
      [start[0], start[1]],
      [midLat1, midLng1],
      [midLat2, midLng2],
      [end[0], end[1]]
    ]

    const dLat = (end[0] - start[0]) * 111.32
    const dLng = (end[1] - start[1]) * 98.4
    const straightKm = Math.sqrt(dLat * dLat + dLng * dLng)
    const estDistanceKm = Number((straightKm * 1.35).toFixed(1))
    const estDurationMins = Math.max(3, Math.round(estDistanceKm * 3.5))

    return {
      coordinates: fallbackCoords,
      distanceKm: estDistanceKm,
      durationMins: estDurationMins,
      steps: [
        {
          id: 'step-f1',
          instruction: 'Depart on main tourist transit corridor',
          streetName: 'Arterial Road',
          distanceMeters: Math.round((estDistanceKm * 1000) / 2),
          durationSeconds: estDurationMins * 30,
          type: 'depart',
          modifier: 'straight'
        },
        {
          id: 'step-f2',
          instruction: 'Continue toward destination safe entrance',
          streetName: 'Heritage Corridor',
          distanceMeters: Math.round((estDistanceKm * 1000) / 2),
          durationSeconds: estDurationMins * 30,
          type: 'arrive',
          modifier: 'straight'
        }
      ],
      isFallback: true,
      summary: 'Estimated Road Transit'
    }
  }
}

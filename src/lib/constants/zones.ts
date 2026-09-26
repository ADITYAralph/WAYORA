/**
 * SafePath-X Centralized Global Safety Zones Registry
 * Single source of truth for all geofence zones across every Leaflet map instance.
 */

export interface SafetyZone {
  id: string
  name: string
  center: [number, number] // [lat, lng]
  radius: number // in meters
  level: 'Safe' | 'Caution' | 'Danger'
  color: string
  fillOpacity: number
  metadata: string
  cctvCount: number
  patrolFrequency: string
}

export const GLOBAL_SAFETY_ZONES: SafetyZone[] = [
  {
    id: 'sharda-univ-agra',
    name: 'Sharda University Agra Main Campus',
    center: [27.2450, 77.8420],
    radius: 600,
    level: 'Safe',
    color: '#10B981',
    fillOpacity: 0.25,
    metadata: 'Educational & Cultural Hub • Active CISF & Campus Security Perimeter',
    cctvCount: 36,
    patrolFrequency: '24/7 Monitored Campus Guard Beat'
  },
  {
    id: 'keetham-lake-sanctuary',
    name: 'Keetham Lake & Sur Sarovar Bird Sanctuary',
    center: [27.2510, 77.8480],
    radius: 900,
    level: 'Caution',
    color: '#F59E0B',
    fillOpacity: 0.20,
    metadata: 'Wetland Forest Perimeter • Post-dusk restricted curfew zone',
    cctvCount: 14,
    patrolFrequency: 'Forest Ranger Patrol Every 30 mins'
  },
  {
    id: 'taj-mahal-corridor',
    name: 'Taj Mahal Protected Heritage Corridor',
    center: [27.1751, 78.0421],
    radius: 700,
    level: 'Safe',
    color: '#10B981',
    fillOpacity: 0.25,
    metadata: 'World Heritage Tier-1 ASI Security Zone with 24/7 Paramilitary Patrols',
    cctvCount: 64,
    patrolFrequency: 'Every 5 mins (CISF & Tourist Police)'
  },
  {
    id: 'agra-fort-perimeter',
    name: 'Agra Fort Perimeter',
    center: [27.1795, 78.0211],
    radius: 550,
    level: 'Safe',
    color: '#10B981',
    fillOpacity: 0.25,
    metadata: 'Historic Mughal Fortress & Dedicated Tourist Police Assistance Booth',
    cctvCount: 42,
    patrolFrequency: 'Every 10 mins (Agra Police)'
  },
  {
    id: 'sadar-bazaar-zone',
    name: 'Sadar Bazaar Commercial Center',
    center: [27.1580, 78.0070],
    radius: 450,
    level: 'Safe',
    color: '#10B981',
    fillOpacity: 0.25,
    metadata: 'Prime Verified Retail & Hospitality Corridor with Fixed Tariffs',
    cctvCount: 38,
    patrolFrequency: 'Every 15 mins (City PCR Beat)'
  },
  {
    id: 'kinari-bazaar-alleys',
    name: 'Kinari Bazaar Alleys',
    center: [27.1950, 78.0160],
    radius: 400,
    level: 'Caution',
    color: '#F59E0B',
    fillOpacity: 0.20,
    metadata: 'Dense Historic Textile Market • High pickpocket & touts vigilance',
    cctvCount: 22,
    patrolFrequency: 'Narrow Alley Beat Patrol'
  }
]

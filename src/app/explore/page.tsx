'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { 
  Shield, 
  Compass, 
  MapPin, 
  Navigation, 
  Car, 
  Radio, 
  AlertTriangle,
  Info, 
  Search, 
  ArrowLeft, 
  CheckCircle2,
  ExternalLink
} from 'lucide-react'
import { loadLeaflet, createOsmTileLayer, AGRA_COORDINATES } from '@/lib/leafletOsm'
import { BrandLogo } from '@/components/common/BrandLogo'

interface Spot {
  id: string
  name: string
  category: 'monument' | 'market' | 'hotel'
  safetyScore: number
  cctvCount: number
  patrolFrequency: string
  lat: number
  lng: number
  description: string
  tips: string
  scamIndex: 'Low' | 'Moderate' | 'Very Low'
}

const AGRA_SPOTS: Spot[] = [
  // Monuments
  {
    id: 'taj-mahal',
    name: 'Taj Mahal Complex',
    category: 'monument',
    safetyScore: 98,
    cctvCount: 64,
    patrolFrequency: 'Every 5 mins (CISF & Tourist Police)',
    lat: 27.1751,
    lng: 78.0421,
    description: 'World Heritage Site. ASI Tier-1 protected heritage corridor with round-the-clock paramilitary surveillance.',
    tips: 'Official ASI ticket counters only at West & East gates. Ignore unauthorized tour guides outside boundary.',
    scamIndex: 'Very Low'
  },
  {
    id: 'agra-fort',
    name: 'Agra Fort',
    category: 'monument',
    safetyScore: 95,
    cctvCount: 42,
    patrolFrequency: 'Every 10 mins (Tourist Police)',
    lat: 27.1795,
    lng: 78.0211,
    description: 'Historic Mughal fortress with wide open courtyards and dedicated tourist police assistance booth.',
    tips: 'Use pre-paid audio guides inside Amar Singh Gate. Standard entry QR tickets available via ASI portal.',
    scamIndex: 'Low'
  },
  {
    id: 'sharda-univ-agra',
    name: 'Sharda University Agra Main Campus',
    category: 'monument',
    safetyScore: 99,
    cctvCount: 36,
    patrolFrequency: '24/7 CISF & Campus Security Beat',
    lat: 27.2450,
    lng: 77.8420,
    description: 'Premier educational, innovation, and cultural center with 24/7 active security perimeter and high-density CCTV coverage.',
    tips: 'Official visitor passes issued at Main Gate #1. Digital RFID access control enabled throughout campus.',
    scamIndex: 'Very Low'
  },
  {
    id: 'keetham-lake',
    name: 'Keetham Lake & Sur Sarovar',
    category: 'monument',
    safetyScore: 82,
    cctvCount: 14,
    patrolFrequency: 'Forest Ranger Patrol Every 30 mins',
    lat: 27.2510,
    lng: 77.8480,
    description: 'Scenic national bird sanctuary and wetland lake hosting migratory bird species.',
    tips: 'Post-dusk entry restricted. Stay within marked lakeside eco-trails.',
    scamIndex: 'Moderate'
  },
  {
    id: 'mehtab-bagh',
    name: 'Mehtab Bagh',
    category: 'monument',
    safetyScore: 81,
    cctvCount: 16,
    patrolFrequency: 'Every 20 mins',
    lat: 27.1800,
    lng: 78.0420,
    description: 'Charbagh garden complex across Yamuna River offering panoramic views of Taj Mahal.',
    tips: 'Ideal for photography during daylight. Recommended to leave before complete dusk.',
    scamIndex: 'Moderate'
  },

  // Markets
  {
    id: 'sadar-bazaar',
    name: 'Sadar Bazaar',
    category: 'market',
    safetyScore: 88,
    cctvCount: 38,
    patrolFrequency: 'Every 15 mins (Agra City Police)',
    lat: 27.1585,
    lng: 78.0105,
    description: 'Prime retail shopping and culinary district known for Agra petha, leather crafts, and brass artifacts.',
    tips: 'Fixed-price shops available along the main street. Digital UPI payments accepted everywhere.',
    scamIndex: 'Low'
  },
  {
    id: 'kinari-bazaar',
    name: 'Kinari Bazaar',
    category: 'market',
    safetyScore: 74,
    cctvCount: 22,
    patrolFrequency: 'Every 30 mins (Narrow Alley Beat)',
    lat: 27.1870,
    lng: 78.0130,
    description: 'Traditional wholesale jewelry and textile market with narrow historic alleys near Jama Masjid.',
    tips: 'Keep valuables secure in crowded lanes. Avoid unverified touts offering gemstone discounts.',
    scamIndex: 'Moderate'
  },
  {
    id: 'subhash-bazaar',
    name: 'Subhash Bazaar',
    category: 'market',
    safetyScore: 78,
    cctvCount: 28,
    patrolFrequency: 'Every 20 mins',
    lat: 27.1830,
    lng: 78.0180,
    description: 'Vibrant local bazaar for silk sarees, handicrafts, and local sweets.',
    tips: 'Always confirm auto-rickshaw fare with FairFare calculator before boarding.',
    scamIndex: 'Low'
  },

  // Hotels
  {
    id: 'oberoi-amarvilas',
    name: 'The Oberoi Amarvilas',
    category: 'hotel',
    safetyScore: 99,
    cctvCount: 52,
    patrolFrequency: '24/7 Dedicated Private Security & PCR',
    lat: 27.1690,
    lng: 78.0480,
    description: 'Ultra-luxury resort located 600m from Taj Mahal with private security perimeter and verified fleet.',
    tips: 'Golf cart transit directly to Taj Mahal East Gate available for verified guests.',
    scamIndex: 'Very Low'
  },
  {
    id: 'itc-mughal',
    name: 'ITC Mughal Resort & Spa',
    category: 'hotel',
    safetyScore: 99,
    cctvCount: 48,
    patrolFrequency: '24/7 Monitored Safe Hospitality Corridor',
    lat: 27.1610,
    lng: 78.0380,
    description: 'Sprawling 5-star heritage hotel set on 35 acres of lush gardens with certified safety credentials.',
    tips: '24-hour concierge and verified government-certified tour desk on premise.',
    scamIndex: 'Very Low'
  },
  {
    id: 'taj-hotel-convention',
    name: 'Taj Hotel & Convention Centre',
    category: 'hotel',
    safetyScore: 96,
    cctvCount: 44,
    patrolFrequency: '24/7 Security Patrol',
    lat: 27.1570,
    lng: 78.0510,
    description: 'Modern luxury hotel on Fatehabad Road with rooftop infinity pool viewing the Taj Mahal.',
    tips: 'Well-lit pedestrian corridor along Fatehabad tourist arterial road.',
    scamIndex: 'Very Low'
  }
]

function ExploreContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') || ''

  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const leafletInstanceRef = useRef<any>(null)

  const markersRef = useRef<any[]>([])
  const circlesRef = useRef<any[]>([])

  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'monument' | 'market' | 'hotel'>('all')
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(AGRA_SPOTS[0])

  // Filtered Spots
  const filteredSpots = AGRA_SPOTS.filter((spot) => {
    const matchesCategory = categoryFilter === 'all' || spot.category === categoryFilter
    const matchesSearch =
      spot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spot.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spot.tips.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // 1. Initialize Leaflet & CARTO Dark Matter Tiles
  useEffect(() => {
    let isMounted = true

    loadLeaflet().then((L) => {
      if (!isMounted || !mapContainerRef.current) return
      leafletInstanceRef.current = L

      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [27.1720, 78.0300],
          zoom: 13,
          zoomControl: false
        })

        L.control.zoom({ position: 'topright' }).addTo(map)

        // OpenStreetMap Raster Layer (styled with dark mode CSS filter)
        createOsmTileLayer(L).addTo(map)

        mapInstanceRef.current = map
        setIsMapLoaded(true)
      }
    })

    return () => {
      isMounted = false
    }
  }, [])

  // 2. Render Markers and Geofencing Circles
  useEffect(() => {
    if (!isMapLoaded || !mapInstanceRef.current || !leafletInstanceRef.current) return
    const L = leafletInstanceRef.current
    const map = mapInstanceRef.current

    // Clear old layers
    markersRef.current.forEach((m) => map.removeLayer(m))
    circlesRef.current.forEach((c) => map.removeLayer(c))
    markersRef.current = []
    circlesRef.current = []

    filteredSpots.forEach((spot) => {
      const isSelected = selectedSpot?.id === spot.id
      const color =
        spot.safetyScore >= 90 ? '#10b981' : spot.safetyScore >= 75 ? '#f59e0b' : '#ef4444'
      const iconEmoji =
        spot.category === 'monument' ? '🏛️' : spot.category === 'market' ? '🛍️' : '🏨'

      // Geofence Circle (500m radius)
      const circle = L.circle([spot.lat, spot.lng], {
        radius: 500,
        color: color,
        weight: isSelected ? 2.5 : 1.2,
        fillColor: color,
        fillOpacity: isSelected ? 0.22 : 0.08,
        dashArray: isSelected ? undefined : '4, 4'
      }).addTo(map)
      circlesRef.current.push(circle)

      // Custom DivIcon Marker
      const customIcon = L.divIcon({
        className: 'safepath-spot-pin',
        html: `
          <div style="position: relative; width: 34px; height: 34px; cursor: pointer;">
            ${isSelected ? `<div style="position: absolute; inset: -4px; background: ${color}; opacity: 0.35; border-radius: 50%; animation: ping 1.4s infinite;"></div>` : ''}
            <div style="position: relative; width: 34px; height: 34px; background: #0f172a; border: 2.5px solid ${color}; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 15px; box-shadow: 0 4px 12px rgba(0,0,0,0.6);">
              ${iconEmoji}
            </div>
            <div style="position: absolute; bottom: -6px; right: -6px; background: ${color}; color: #0f172a; font-size: 9px; font-weight: 900; padding: 1px 4px; border-radius: 6px; font-family: monospace;">
              ${spot.safetyScore}%
            </div>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      })

      const marker = L.marker([spot.lat, spot.lng], { icon: customIcon })
        .addTo(map)
        .bindPopup(`
          <div style="color: #0f172a; font-family: sans-serif; font-size: 12px; max-width: 220px;">
            <strong style="font-size: 14px;">${spot.name}</strong><br>
            <div style="margin: 4px 0; font-weight: bold; color: ${color}; font-size: 12px;">
              🛡️ Safety Score: ${spot.safetyScore}% (${spot.scamIndex} Scam Risk)
            </div>
            <div style="color: #334155; font-size: 11px; margin-top: 4px;">
              📹 ${spot.cctvCount} CCTVs in 500m geofence
            </div>
          </div>
        `)

      marker.on('click', () => {
        setSelectedSpot(spot)
      })

      markersRef.current.push(marker)
    })
  }, [isMapLoaded, filteredSpots, selectedSpot])

  // Center map when spot is selected from list
  const handleSelectSpot = (spot: Spot) => {
    setSelectedSpot(spot)
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([spot.lat, spot.lng], 15, { animate: true })
    }
  }

  return (
    <div className="min-h-screen bg-[#F0F8FF] text-slate-800 font-sans selection:bg-sky-500 selection:text-white flex flex-col">
      {/* Top Universal Back to Hub Bar */}
      <div className="bg-white border-b border-sky-100 px-4 lg:px-8 py-2.5 flex items-center justify-between text-xs">
        <Link
          href="/"
          className="flex items-center gap-2 text-slate-600 hover:text-sky-700 font-semibold transition group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition" />
          <span>← Back to WayORA Hub</span>
        </Link>
        <div className="flex items-center gap-3 text-slate-500">
          <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            OpenStreetMap GIS Live
          </span>
          <span className="hidden sm:inline font-sans text-slate-400">Agra District Radar</span>
        </div>
      </div>

      {/* Main App Header */}
      <header className="bg-white/95 backdrop-blur-xl border-b border-sky-100 px-4 lg:px-8 py-3 sticky top-0 z-30 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <BrandLogo size="sm" showText={false} />
            <div>
              <span className="text-lg font-black tracking-wider text-[#0C2340]">WayORA</span>
              <span className="text-xs text-sky-600 font-bold ml-1.5 uppercase">DISCOVERY RADAR</span>
            </div>
          </Link>
        </div>

        <nav className="hidden sm:flex items-center gap-2 text-xs text-slate-600 font-medium">
          <Link href="/ride" className="px-3 py-1.5 rounded-full hover:bg-sky-50 text-slate-700 hover:text-sky-700 transition flex items-center gap-1.5">
            <Car size={14} className="text-sky-600" /> Safe Ride
          </Link>
          <Link href="/sos" className="px-3 py-1.5 rounded-full hover:bg-rose-50 text-slate-700 hover:text-rose-700 transition flex items-center gap-1.5">
            <AlertTriangle size={14} className="text-rose-500" /> Silent SOS
          </Link>
          <Link href="/authority" className="px-3 py-1.5 rounded-full hover:bg-sky-50 text-slate-700 hover:text-sky-700 transition flex items-center gap-1.5">
            <Radio size={14} className="text-sky-600" /> Authority
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs text-sky-800 bg-sky-50 px-3 py-1 rounded-full border border-sky-200 font-medium">
            500m GEOFENCE RADAR ACTIVE
          </span>
        </div>
      </header>

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden bg-[#F0F8FF]">
        {/* Left Side: Directory & Verified Spot Inspection (5 Cols) */}
        <div className="lg:col-span-5 p-4 lg:p-6 overflow-y-auto max-h-[calc(100vh-100px)] space-y-5 border-r border-sky-100 bg-[#F0F8FF]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-[11px] font-semibold mb-2">
              <Shield size={12} /> Safe Corridor Radar
            </div>
            <h1 className="text-2xl font-black text-[#0C2340]">Agra Safe Zone Explorer</h1>
            <p className="text-xs text-slate-500">
              Real-time safety scores, verified tips, and ASI security guidelines
            </p>
          </div>

          {/* Search & Category Filter Pills */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400 size={16}" />
              <input
                type="text"
                placeholder="Search monuments, bazaars, luxury hotels..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-sky-100 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 shadow-2xs"
              />
            </div>

            <div className="flex gap-2">
              {(['all', 'monument', 'market', 'hotel'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`flex-1 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition ${
                    categoryFilter === cat
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'bg-white border border-sky-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cat === 'all' ? 'All (9)' : cat === 'monument' ? 'Monuments' : cat === 'market' ? 'Markets' : 'Hotels'}
                </button>
              ))}
            </div>
          </div>

          {/* Detailed Card for Selected Spot */}
          {selectedSpot && (
            <div className="bg-white border border-sky-100 rounded-2xl p-5 shadow-[0_8px_30px_rgb(2,132,199,0.06)] space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">
                      {selectedSpot.category === 'monument' ? '🏛️' : selectedSpot.category === 'market' ? '🛍️' : '🏨'}
                    </span>
                    <h3 className="text-lg font-bold text-[#0C2340]">{selectedSpot.name}</h3>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-black text-emerald-600">{selectedSpot.safetyScore}%</div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Safety Score</div>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{selectedSpot.description}</p>

              {/* Local Tips & Security Info */}
              <div className="bg-sky-50/60 border border-sky-100 rounded-xl p-3.5 text-xs space-y-2">
                <div className="flex items-start gap-2">
                  <Info size={14} className="text-sky-600 shrink-0 mt-0.5" />
                  <span className="text-slate-700">
                    <strong className="text-slate-900">Verified Advice:</strong> {selectedSpot.tips}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-slate-500 border-t border-sky-100">
                  <div>
                    📹 CCTVs in 500m: <strong className="text-sky-700 font-bold">{selectedSpot.cctvCount}</strong>
                  </div>
                  <div>
                    🛡️ Scam Index: <strong className="text-emerald-700 font-bold">{selectedSpot.scamIndex}</strong>
                  </div>
                </div>
              </div>

              {/* Navigation CTA */}
              <button
                onClick={() => router.push(`/navigation?dest=${encodeURIComponent(selectedSpot.name)}`)}
                className="w-full py-3 rounded-full bg-sky-600 text-white font-bold text-xs hover:bg-sky-700 active:scale-95 transition shadow-sm flex items-center justify-center gap-2"
              >
                <Navigation size={14} /> Navigate Safely Here (Fast vs Safe Corridor)
              </button>
            </div>
          )}

          {/* Directory List of Spots */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Verified Corridors ({filteredSpots.length})
            </h4>

            {filteredSpots.map((spot) => (
              <div
                key={spot.id}
                onClick={() => handleSelectSpot(spot)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                  selectedSpot?.id === spot.id
                    ? 'bg-white border-sky-500 shadow-[0_4px_20px_rgba(2,132,199,0.12)] ring-1 ring-sky-500/20'
                    : 'bg-white/80 border-sky-100 hover:border-sky-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl p-2 bg-sky-50 rounded-xl border border-sky-100">
                    {spot.category === 'monument' ? '🏛️' : spot.category === 'market' ? '🛍️' : '🏨'}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">{spot.name}</div>
                    <div className="text-[11px] text-slate-500 capitalize">
                      {spot.category} • {spot.cctvCount} CCTVs
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className={`text-sm font-bold px-2 py-0.5 rounded-md ${
                      spot.safetyScore >= 90
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : spot.safetyScore >= 75
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {spot.safetyScore}%
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">500m Zone</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Leaflet 1.9.4 & OpenStreetMap Canvas (7 Cols) */}
        <div className="lg:col-span-7 relative h-[450px] lg:h-auto min-h-[450px] bg-slate-100">
          <div ref={mapContainerRef} className="w-full h-full min-h-[450px]" />

          {/* Floating Map Legend */}
          <div className="absolute bottom-4 right-4 z-20 bg-white/95 backdrop-blur-md border border-sky-100 rounded-2xl px-4 py-3 text-xs shadow-lg space-y-1.5">
            <div className="font-bold text-slate-700 mb-1">500m Safety Boundaries</div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              <span className="text-emerald-700 font-medium">90% - 100% Safe (Protected Corridor)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500"></span>
              <span className="text-amber-700 font-medium">75% - 89% Caution (Active Marketplace)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500"></span>
              <span className="text-rose-700 font-medium">&lt; 75% High Vigilance Zone</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ExplorePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F0F8FF] text-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm font-medium text-slate-500">Loading Smart Discovery Radar...</p>
        </div>
      </div>
    }>
      <ExploreContent />
    </Suspense>
  )
}

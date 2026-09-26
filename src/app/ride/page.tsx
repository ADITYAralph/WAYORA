'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Shield,
  Car,
  MapPin,
  Navigation,
  AlertTriangle,
  CheckCircle2,
  Star,
  Phone,
  Volume2,
  VolumeX,
  RefreshCw,
  ArrowRight,
  Info,
  Lock,
  Clock,
  Zap,
  Compass,
  Radio,
  QrCode,
  Languages,
  ArrowLeft,
  PhoneCall,
  Activity,
  ChevronDown,
  ChevronUp,
  CornerUpRight,
  CornerUpLeft,
  ArrowUp,
  RotateCw,
  Route
} from 'lucide-react'
import { loadLeaflet, createOsmTileLayer, AGRA_COORDINATES } from '@/lib/leafletOsm'
import { fetchRealRoadRoute, RouteStep, OsrmRouteResult } from '@/lib/routing/osrmRouter'
import { GLOBAL_SAFETY_ZONES } from '@/lib/constants/zones'
import { geofenceMonitor, ZoneTransitionAlert } from '@/lib/gis/geofenceMonitor'
import { db } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { BrandLogo } from '@/components/common/BrandLogo'

interface Driver {
  id: string
  name: string
  vehicleType: 'Auto' | 'E-Rickshaw' | 'Sedan'
  vehicleModel: string
  vehicleNumber: string
  rating: number
  trips: number
  etaMins: number
  phone: string
  lat: number
  lng: number
  photo: string
  baseRate: number
  perKm: number
}

interface LocationPreset {
  id: string
  name: string
  lat: number
  lng: number
}

const PRESET_LOCATIONS: LocationPreset[] = [
  { id: 'sharda-univ', name: 'Sharda University Agra Main Campus', lat: 27.2450, lng: 77.8420 },
  { id: 'keetham-lake', name: 'Keetham Lake & Sur Sarovar', lat: 27.2510, lng: 77.8480 },
  { id: 'agra-cantt', name: 'Agra Cantt Railway Station', lat: 27.1620, lng: 78.0080 },
  { id: 'taj-east', name: 'Taj Mahal East Gate', lat: 27.1730, lng: 78.0450 },
  { id: 'agra-fort', name: 'Agra Fort Main Gate', lat: 27.1795, lng: 78.0211 },
  { id: 'sadar-bazaar', name: 'Sadar Bazaar Commercial Center', lat: 27.1585, lng: 78.0105 },
  { id: 'itc-mughal', name: 'ITC Mughal Luxury Resort', lat: 27.1610, lng: 78.0380 },
  { id: 'mehtab-bagh', name: 'Mehtab Bagh Yamuna Viewpoint', lat: 27.1800, lng: 78.0420 }
]

const MOCK_DRIVERS: Driver[] = [
  {
    id: 'drv-01',
    name: 'Chinnu',
    vehicleType: 'Auto',
    vehicleModel: 'Bajaj RE Compact CNG',
    vehicleNumber: 'UP 80 BT 4421',
    rating: 4.9,
    trips: 1420,
    etaMins: 3,
    phone: '+91 98370 12345',
    lat: 27.1645,
    lng: 78.0120,
    photo: '👨🏽‍✈️',
    baseRate: 35,
    perKm: 12
  },
  {
    id: 'drv-02',
    name: 'Shivi Srivastava',
    vehicleType: 'E-Rickshaw',
    vehicleModel: 'Mahindra Treo Electric',
    vehicleNumber: 'UP 80 ER 8890',
    rating: 4.95,
    trips: 980,
    etaMins: 5,
    phone: '+91 94120 56789',
    lat: 27.1605,
    lng: 78.0150,
    photo: '👩🏽‍✈️',
    baseRate: 20,
    perKm: 8
  },
  {
    id: 'drv-03',
    name: 'Aditya Yadav',
    vehicleType: 'Sedan',
    vehicleModel: 'Maruti Suzuki Dzire Tour',
    vehicleNumber: 'UP 80 AC 1104',
    rating: 4.85,
    trips: 2150,
    etaMins: 7,
    phone: '+91 98970 99881',
    lat: 27.1680,
    lng: 78.0190,
    photo: '👨🏻‍✈️',
    baseRate: 70,
    perKm: 18
  }
]

export default function SafeRideShieldPage() {
  const router = useRouter()
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const leafletInstanceRef = useRef<any>(null)

  const routePolylineRef = useRef<any>(null)
  const deviationPolylineRef = useRef<any>(null)
  const driverMarkersRef = useRef<any[]>([])
  const endpointMarkersRef = useRef<any[]>([])

  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [origin, setOrigin] = useState<LocationPreset>(PRESET_LOCATIONS[0])
  const [destination, setDestination] = useState<LocationPreset>(PRESET_LOCATIONS[1])
  const [selectedDriver, setSelectedDriver] = useState<Driver>(MOCK_DRIVERS[0])

  // Real OSRM Road Route State
  const [routeResult, setRouteResult] = useState<OsrmRouteResult | null>(null)
  const [isLoadingRoute, setIsLoadingRoute] = useState(false)
  const [showStepsDrawer, setShowStepsDrawer] = useState(false)

  const [isNightTime, setIsNightTime] = useState(false)
  const [rideState, setRideState] = useState<'IDLE' | 'LOCKED' | 'DIVERTED'>('IDLE')
  const [deviationDistance, setDeviationDistance] = useState<number>(0)
  const [isMuted, setIsMuted] = useState<boolean>(false)
  const [telemetryTicks, setTelemetryTicks] = useState(0)

  // 1. Initialize Leaflet & OpenStreetMap Tiles
  useEffect(() => {
    let isMounted = true

    loadLeaflet().then((L) => {
      if (!isMounted || !mapContainerRef.current) return
      leafletInstanceRef.current = L

      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [27.1680, 78.0260],
          zoom: 13.5,
          zoomControl: false
        })

        L.control.zoom({ position: 'topright' }).addTo(map)

        // OpenStreetMap Raster Layer (Dark Mode Styled)
        createOsmTileLayer(L).addTo(map)

        mapInstanceRef.current = map
        setIsMapLoaded(true)
      }
    })

    return () => {
      isMounted = false
    }
  }, [])

  // 2. Fetch Real Road-Following Route via OSRM Engine
  useEffect(() => {
    let isMounted = true
    setIsLoadingRoute(true)

    fetchRealRoadRoute([origin.lat, origin.lng], [destination.lat, destination.lng])
      .then((res) => {
        if (!isMounted) return
        setRouteResult(res)
        setIsLoadingRoute(false)
      })
      .catch((err) => {
        if (!isMounted) return
        console.error('Routing failed:', err)
        setIsLoadingRoute(false)
      })

    return () => {
      isMounted = false
    }
  }, [origin, destination])

  // 3. Render Real Road Polyline, Drivers & Markers on Leaflet
  useEffect(() => {
    if (!isMapLoaded || !mapInstanceRef.current || !leafletInstanceRef.current || !routeResult) return
    const L = leafletInstanceRef.current
    const map = mapInstanceRef.current

    // Clear old layers
    if (routePolylineRef.current) map.removeLayer(routePolylineRef.current)
    if (deviationPolylineRef.current) map.removeLayer(deviationPolylineRef.current)
    driverMarkersRef.current.forEach((m) => map.removeLayer(m))
    driverMarkersRef.current = []
    endpointMarkersRef.current.forEach((m) => map.removeLayer(m))
    endpointMarkersRef.current = []

    const roadCoordinates = routeResult.coordinates

    // Draw Real Road-Following Polyline (Google Maps Style Neon Blue/Emerald)
    routePolylineRef.current = L.polyline(roadCoordinates, {
      color: '#3B82F6',
      weight: 5,
      opacity: 0.9,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map)

    // Deviation Polyline Simulation
    if (rideState === 'DIVERTED') {
      const midPoint = roadCoordinates[Math.floor(roadCoordinates.length / 2)] || [origin.lat, origin.lng]
      const diversionPoints: [number, number][] = [
        midPoint,
        [midPoint[0] + 0.005, midPoint[1] + 0.008],
        [midPoint[0] + 0.009, midPoint[1] + 0.014]
      ]
      deviationPolylineRef.current = L.polyline(diversionPoints, {
        color: '#ef4444',
        weight: 5,
        dashArray: '8, 8',
        opacity: 0.95
      }).addTo(map)

      // Alert Marker
      const alertIcon = L.divIcon({
        className: 'safepath-alert-marker',
        html: `
          <div style="position: relative; width: 36px; height: 36px; animation: ping 1.2s infinite; background: rgba(239, 68, 68, 0.4); border-radius: 50%;"></div>
          <div style="position: absolute; top: 0; left: 0; width: 36px; height: 36px; background: #dc2626; border: 2.5px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; box-shadow: 0 4px 14px rgba(220,38,38,0.7);">
            ⚠️
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      })
      const alertMark = L.marker([midPoint[0] + 0.009, midPoint[1] + 0.014], { icon: alertIcon })
        .addTo(map)
        .bindPopup(`
          <div style="color: #0f172a; font-family: sans-serif; font-size: 12px; max-width: 200px;">
            <strong style="color: #dc2626; font-size: 13px;">🚨 Route Diversion Alert</strong><br>
            <span>Vehicle deviated 310m off planned OSRM road path into unverified alley.</span>
          </div>
        `)
      endpointMarkersRef.current.push(alertMark)
    }

    // Origin Marker (Cyan)
    const origIcon = L.divIcon({
      className: 'safepath-orig-marker',
      html: `
        <div style="width: 28px; height: 28px; background: #06b6d4; border: 3px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; box-shadow: 0 0 12px #06b6d4;">
          📍
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    })
    const origMarker = L.marker([origin.lat, origin.lng], { icon: origIcon })
      .addTo(map)
      .bindPopup(`<strong>Pickup:</strong> ${origin.name}`)
    endpointMarkersRef.current.push(origMarker)

    // Destination Marker (Emerald)
    const destIcon = L.divIcon({
      className: 'safepath-dest-marker',
      html: `
        <div style="width: 28px; height: 28px; background: #10b981; border: 3px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; box-shadow: 0 0 12px #10b981;">
          🏁
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    })
    const destMarker = L.marker([destination.lat, destination.lng], { icon: destIcon })
      .addTo(map)
      .bindPopup(`<strong>Destination:</strong> ${destination.name}`)
    endpointMarkersRef.current.push(destMarker)

    // Driver Markers
    MOCK_DRIVERS.forEach((driver) => {
      const isSelected = selectedDriver.id === driver.id
      const color = isSelected ? '#38bdf8' : '#64748b'

      const drvIcon = L.divIcon({
        className: 'safepath-drv-marker',
        html: `
          <div style="position: relative; width: 34px; height: 34px; cursor: pointer;">
            ${isSelected ? `<div style="position: absolute; inset: -4px; background: #38bdf8; opacity: 0.35; border-radius: 50%; animation: ping 1.5s infinite;"></div>` : ''}
            <div style="position: relative; width: 34px; height: 34px; background: #0f172a; border: 2.5px solid ${color}; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 15px; box-shadow: 0 4px 12px rgba(0,0,0,0.6);">
              ${driver.photo}
            </div>
            <div style="position: absolute; bottom: -6px; right: -6px; background: ${color}; color: #0f172a; font-size: 9px; font-weight: 900; padding: 1px 4px; border-radius: 6px; font-family: monospace;">
              ${driver.etaMins}m
            </div>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      })

      const dMark = L.marker([driver.lat, driver.lng], { icon: drvIcon })
        .addTo(map)
        .bindPopup(`
          <div style="color: #0f172a; font-family: sans-serif; font-size: 12px;">
            <strong style="font-size: 13px;">${driver.name}</strong><br>
            <span style="color: #64748b;">${driver.vehicleModel} (${driver.vehicleNumber})</span><br>
            <span style="color: #059669; font-weight: bold;">★ ${driver.rating} • ${driver.etaMins} mins away</span>
          </div>
        `)

      dMark.on('click', () => {
        setSelectedDriver(driver)
      })

      driverMarkersRef.current.push(dMark)
    })

    // Render Global Safety Zones on Ride Map
    GLOBAL_SAFETY_ZONES.forEach((zone) => {
      const circle = L.circle(zone.center, {
        radius: zone.radius,
        color: zone.color,
        weight: 1.5,
        fillColor: zone.color,
        fillOpacity: zone.fillOpacity,
        dashArray: zone.level === 'Caution' ? '4, 4' : undefined
      }).addTo(map)

      circle.bindPopup(`
        <div style="color: #0f172a; font-family: sans-serif; font-size: 12px; max-width: 220px;">
          <strong style="font-size: 13px; color: #0c2340;">${zone.name}</strong><br>
          <div style="margin: 4px 0; font-weight: bold; color: ${zone.color};">
            ${zone.level === 'Safe' ? '🛡️ Safe Zone Corridor' : '⚠️ Vigilance Zone'}
          </div>
          <div style="color: #334155; font-size: 11px;">${zone.metadata}</div>
        </div>
      `)
      endpointMarkersRef.current.push(circle)
    })

    // Fit map bounds to exact OSRM road polyline
    const bounds = L.latLngBounds(roadCoordinates)
    map.fitBounds(bounds, { padding: [50, 50] })
  }, [isMapLoaded, origin, destination, selectedDriver, routeResult, rideState])

  // FairFare Dynamic Regulatory Formula based on ACTUAL OSRM ROAD DISTANCE:
  // Base_Tariff + max(0, Driving_Distance_km - 1.5) * Per_Km_Rate * Night_Multiplier
  const drivingDistanceKm = routeResult ? routeResult.distanceKm : 5.2
  const drivingDurationMins = routeResult ? routeResult.durationMins : 14
  const baseTariff = selectedDriver.baseRate
  const perKmRate = selectedDriver.perKm
  const nightMultiplier = isNightTime ? 1.25 : 1.0
  const chargeableKm = Math.max(0, drivingDistanceKm - 1.5)
  const calculatedFare = Math.round((baseTariff + chargeableKm * perKmRate) * nightMultiplier)
  const fairCorridorMin = Math.round(calculatedFare * 0.95)
  const fairCorridorMax = Math.round(calculatedFare * 1.05)

  // Voice Warning Broadcast strictly in fluent English
  const playVoiceAlert = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const text =
      "Notice: This vehicle's route is actively tracked and monitored by the Tourism Safety Dispatch Center."
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US'
    window.speechSynthesis.speak(utterance)
  }

  // Telemetry Heartbeat simulation during active ride + Geofence evaluation
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (rideState === 'LOCKED' || rideState === 'DIVERTED') {
      interval = setInterval(() => {
        setTelemetryTicks((t) => t + 1)
        // Periodic geofence monitoring evaluation
        geofenceMonitor.evaluatePosition(origin.lat, origin.lng, 'Aditya Kaushik', 'TID-88491')
      }, 2000)
    }
    return () => clearInterval(interval)
  }, [rideState, origin])

  // Lock Route Trigger & Real-Time Sync to Firestore 'active_rides'
  const handleLockRoute = async () => {
    setRideState('LOCKED')
    setDeviationDistance(12)

    try {
      if (db) {
        await addDoc(collection(db, 'active_rides'), {
          rideId: `RIDE-${Date.now()}`,
          userId: 'USR-78291',
          touristName: 'Aditya Kaushik',
          driverName: selectedDriver.name,
          vehicleNumber: selectedDriver.vehicleNumber,
          vehicleModel: selectedDriver.vehicleModel,
          pickup: { lat: origin.lat, lng: origin.lng, address: origin.name },
          destination: { lat: destination.lat, lng: destination.lng, address: destination.name },
          fare: calculatedFare,
          status: 'IN_PROGRESS',
          currentLocation: { lat: origin.lat, lng: origin.lng },
          timestamp: Date.now(),
          createdAt: serverTimestamp()
        })
      }
    } catch (err: any) {
      console.warn('Firestore active_rides sync bypassed:', err.message)
    }

    geofenceMonitor.evaluatePosition(origin.lat, origin.lng, 'Aditya Kaushik', 'TID-88491')
  }

  // Simulate Anomaly Deviation
  const handleToggleDeviationSimulation = () => {
    if (rideState === 'DIVERTED') {
      setRideState('LOCKED')
      setDeviationDistance(14)
    } else {
      setRideState('DIVERTED')
      setDeviationDistance(310)
      if (!isMuted) {
        playVoiceAlert()
      }
    }
  }

  // Direction Step Icon Helper
  const getStepIcon = (type: string, modifier?: string) => {
    if (type === 'arrive') return <CheckCircle2 size={16} className="text-emerald-400" />
    if (type === 'depart') return <Navigation size={16} className="text-cyan-400" />
    if (modifier?.includes('left')) return <CornerUpLeft size={16} className="text-blue-400" />
    if (modifier?.includes('right')) return <CornerUpRight size={16} className="text-blue-400" />
    if (type.includes('roundabout')) return <RotateCw size={16} className="text-amber-400" />
    return <ArrowUp size={16} className="text-slate-300" />
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
          <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            OSRM Road Engine Active
          </span>
          <span className="hidden sm:inline font-sans text-slate-400">100% Free GIS Routing</span>
        </div>
      </div>

      {/* Main App Header */}
      <header className="bg-white/95 backdrop-blur-xl border-b border-sky-100 px-4 lg:px-8 py-3 sticky top-0 z-30 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <BrandLogo size="sm" showText={false} />
            <div>
              <span className="text-lg font-black tracking-wider text-[#0C2340]">WayORA</span>
              <span className="text-xs text-sky-600 font-bold ml-1.5 uppercase">Safe Ride Shield</span>
            </div>
          </Link>
        </div>

        <nav className="hidden sm:flex items-center gap-2 text-xs text-slate-600 font-medium">
          <Link href="/explore" className="px-3 py-1.5 rounded-full hover:bg-sky-50 text-slate-700 hover:text-sky-700 transition flex items-center gap-1.5">
            <Compass size={14} className="text-sky-600" /> Radar Discovery
          </Link>
          <Link href="/sos" className="px-3 py-1.5 rounded-full hover:bg-rose-50 text-slate-700 hover:text-rose-700 transition flex items-center gap-1.5">
            <AlertTriangle size={14} className="text-rose-500" /> Silent SOS
          </Link>
          <Link href="/authority" className="px-3 py-1.5 rounded-full hover:bg-sky-50 text-slate-700 hover:text-sky-700 transition flex items-center gap-1.5">
            <Radio size={14} className="text-sky-600" /> Authority
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsNightTime(!isNightTime)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition border ${isNightTime
                ? 'bg-purple-50 border-purple-200 text-purple-700'
                : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
          >
            <Clock size={12} />
            {isNightTime ? 'Night Tariff (1.25x)' : 'Day Tariff'}
          </button>
        </div>
      </header>

      {/* Main Grid Body */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden bg-[#F0F8FF]">
        {/* Left Side: Ride Booking & FairFare Bargaining Card (5 Cols) */}
        <div className="lg:col-span-5 p-4 lg:p-6 overflow-y-auto max-h-[calc(100vh-100px)] space-y-5 border-r border-sky-100 bg-[#F0F8FF]">
          {/* Section 1: Route Setup */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-700 flex items-center gap-1.5">
                <Navigation size={14} /> Road Navigation Corridor
              </span>
              <span className="text-xs font-sans text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                {isLoadingRoute ? (
                  <span className="animate-spin text-sky-600">⏳</span>
                ) : (
                  <span>🛣️ {drivingDistanceKm} km ({drivingDurationMins} min)</span>
                )}
              </span>
            </div>

            <div className="bg-white border border-sky-100 rounded-2xl p-4 shadow-sm space-y-3">
              <div>
                <label className="text-[11px] text-slate-500 font-semibold mb-1 block">PICKUP POINT</label>
                <select
                  value={origin.id}
                  onChange={(e) => setOrigin(PRESET_LOCATIONS.find((l) => l.id === e.target.value)!)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500 font-medium"
                >
                  {PRESET_LOCATIONS.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-500 font-semibold mb-1 block">DESTINATION</label>
                <select
                  value={destination.id}
                  onChange={(e) => setDestination(PRESET_LOCATIONS.find((l) => l.id === e.target.value)!)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500 font-medium"
                >
                  {PRESET_LOCATIONS.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: FairFare Dynamic Transparency Card */}
          <div className="bg-white border border-sky-100 rounded-2xl p-5 shadow-[0_8px_30px_rgb(2,132,199,0.06)] space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 text-[10px] font-bold uppercase tracking-wider border border-sky-200">
                  Official Municipal Tariff Estimate
                </span>
              </div>
              <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 size={13} className="text-emerald-600" /> FairFare Verified ({drivingDistanceKm} km)
              </span>
            </div>

            {/* Fare Corridor Display */}
            <div className="flex items-end justify-between pt-1">
              <div>
                <div className="text-3xl font-black tracking-tight text-[#0C2340] font-sans">
                  ₹{fairCorridorMin} — ₹{fairCorridorMax}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Regulated corridor for <strong className="text-slate-800">{selectedDriver.vehicleType}</strong> ({drivingDistanceKm} km)
                </div>
              </div>
              <div className="text-right font-sans text-xs font-bold text-sky-800 bg-sky-50 px-3 py-1.5 rounded-xl border border-sky-200">
                Avg: ₹{calculatedFare}
              </div>
            </div>

            {/* Regulatory Rate Card Display */}
            <div className="bg-sky-50/70 border border-sky-100 rounded-xl p-3.5 space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-500 text-[11px]">
                <span className="flex items-center gap-1 text-slate-700 font-semibold">
                  <Shield size={13} className="text-sky-600" /> Regulated Municipal Rate Card
                </span>
                <span className="text-[10px] text-sky-700 bg-white px-2 py-0.5 rounded-full border border-sky-100 font-medium">State Motor Vehicles Rules</span>
              </div>
              <div className="text-sm font-bold text-sky-900 font-sans tracking-wide">
                {origin.name.split(' ')[0]} ➔ {destination.name.split(' ')[0]}: ₹{fairCorridorMin} — ₹{fairCorridorMax}
              </div>
              <p className="text-[11px] text-slate-600 leading-tight">
                Official regulated rate card: Base 1.5 km = ₹{baseTariff}, additional road distance = ₹{perKmRate}/km.
              </p>
            </div>
          </div>

          {/* Section 3: Verified Drivers Carousel */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Verified Nearby Transporters ({MOCK_DRIVERS.length})
              </span>
              <span className="text-[11px] text-slate-500">Police & ASI Cleared</span>
            </div>

            <div className="space-y-2.5">
              {MOCK_DRIVERS.map((driver) => (
                <div
                  key={driver.id}
                  onClick={() => setSelectedDriver(driver)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${selectedDriver.id === driver.id
                      ? 'bg-white border-sky-500 shadow-[0_4px_20px_rgba(2,132,199,0.12)] ring-1 ring-sky-500/20'
                      : 'bg-white/80 border-sky-100 hover:border-sky-200'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl p-2 bg-sky-50 rounded-xl border border-sky-100">
                      {driver.photo}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-slate-900">{driver.name}</span>
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200">
                          ★ {driver.rating}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {driver.vehicleModel} • {driver.vehicleNumber}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-800">{driver.etaMins} mins away</div>
                    <div className="text-[10px] text-emerald-700 font-semibold">{driver.trips} trips</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Lock Route & Anti-Diversion Action */}
          <div className="pt-2 space-y-2.5">
            {rideState === 'IDLE' ? (
              <button
                onClick={handleLockRoute}
                className="w-full py-3.5 rounded-full bg-sky-600 text-white font-bold text-sm tracking-wide hover:bg-sky-700 active:scale-98 transition shadow-lg shadow-sky-600/20 flex items-center justify-center gap-2"
              >
                <Lock size={15} /> Confirm & Lock Safe Ride Shield
              </button>
            ) : (
              <div className="space-y-3">
                <div
                  className={`p-3.5 rounded-2xl border text-xs space-y-2 ${rideState === 'DIVERTED'
                      ? 'bg-rose-50 border-rose-300 text-rose-800 animate-pulse'
                      : 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1.5">
                      <Activity size={14} className={rideState === 'DIVERTED' ? 'text-rose-600' : 'text-emerald-600'} />
                      {rideState === 'DIVERTED' ? 'CRITICAL: ROUTE DIVERSION DETECTED' : 'SAFE RIDE SHIELD ACTIVE'}
                    </span>
                    <span className="font-sans font-bold text-[11px]">
                      {rideState === 'DIVERTED' ? `d_perp = ${deviationDistance}m (>250m)` : `d_perp = ${deviationDistance}m (OK)`}
                    </span>
                  </div>
                  <p className="text-[11px] opacity-90">
                    {rideState === 'DIVERTED'
                      ? 'Vehicle is veering towards known high-commission touts zone. Police telemetry dispatched.'
                      : 'Live GPS polyline lock active. Automatic SMS beacon armed if mobile data drops.'}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleToggleDeviationSimulation}
                    className={`flex-1 py-2.5 rounded-full text-xs font-bold transition flex items-center justify-center gap-1.5 border ${rideState === 'DIVERTED'
                        ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        : 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                      }`}
                  >
                    <AlertTriangle size={14} />
                    {rideState === 'DIVERTED' ? 'Reset Safe Corridor' : 'Simulate Route Diversion (Test)'}
                  </button>

                  <button
                    onClick={() => {
                      setIsMuted(!isMuted)
                      if (isMuted && rideState === 'DIVERTED') playVoiceAlert()
                    }}
                    className="p-2.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-2xs"
                    title={isMuted ? 'Unmute Voice Warnings' : 'Mute Voice Warnings'}
                  >
                    {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} className="text-sky-600" />}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Leaflet 1.9.4 & OpenStreetMap Canvas (7 Cols) */}
        <div className="lg:col-span-7 relative h-[450px] lg:h-auto min-h-[450px] bg-slate-100 flex flex-col">
          <div ref={mapContainerRef} className="w-full flex-1 min-h-[450px]" />

          {/* Floating HUD Top Badge */}
          <div className="absolute top-4 left-4 z-20 bg-white/95 backdrop-blur-md border border-sky-100 rounded-2xl px-4 py-2.5 text-xs shadow-lg flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <div>
              <div className="font-bold text-[#0C2340] text-[12px] flex items-center gap-1.5">
                <Route size={14} className="text-sky-600" />
                OSRM Road Driving Navigation
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {drivingDistanceKm} km • {drivingDurationMins} mins ({routeResult?.summary || 'Agra Corridor'})
              </div>
            </div>
          </div>

          {/* Turn-by-Turn Google Maps-Style Drawer */}
          <div className="absolute top-4 right-4 z-20 max-w-xs w-full">
            <div className="bg-white/95 backdrop-blur-md border border-sky-100 rounded-2xl shadow-xl overflow-hidden">
              <button
                onClick={() => setShowStepsDrawer(!showStepsDrawer)}
                className="w-full px-3.5 py-2.5 bg-sky-50/80 hover:bg-sky-100/80 transition flex items-center justify-between text-xs font-bold text-sky-900"
              >
                <div className="flex items-center gap-2 text-sky-700">
                  <Navigation size={14} />
                  <span>Turn-by-Turn Steps ({routeResult?.steps.length || 0})</span>
                </div>
                {showStepsDrawer ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {showStepsDrawer && (
                <div className="max-h-60 overflow-y-auto p-3 space-y-2 text-xs divide-y divide-slate-100">
                  {routeResult?.steps && routeResult.steps.length > 0 ? (
                    routeResult.steps.map((step, idx) => (
                      <div key={step.id || idx} className="pt-2 first:pt-0 flex items-start gap-2.5">
                        <div className="p-1.5 bg-sky-50 rounded-lg border border-sky-100 shrink-0 mt-0.5">
                          {getStepIcon(step.type, step.modifier)}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-slate-800 leading-snug">
                            {step.instruction}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {step.distanceMeters > 0 ? `${step.distanceMeters}m` : ''} • {step.streetName}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-400 text-center py-2">
                      Calculating real road maneuver instructions...
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Floating Driver Bottom Badge */}
          <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-md border border-sky-100 rounded-2xl p-3 text-xs shadow-lg flex items-center gap-3">
            <div className="text-3xl">{selectedDriver.photo}</div>
            <div>
              <div className="font-bold text-slate-900">{selectedDriver.name}</div>
              <div className="text-[11px] text-slate-500">
                {selectedDriver.vehicleModel} • <strong className="text-sky-700 font-mono">{selectedDriver.vehicleNumber}</strong>
              </div>
            </div>
            <a
              href={`tel:${selectedDriver.phone}`}
              className="ml-2 p-2 bg-emerald-600 hover:bg-emerald-700 rounded-full text-white transition shadow-sm"
            >
              <Phone size={14} />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

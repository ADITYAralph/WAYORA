'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Shield, 
  Radio, 
  Users, 
  AlertTriangle, 
  FileText, 
  Printer, 
  Download, 
  MapPin, 
  CheckCircle2, 
  PhoneCall, 
  Clock, 
  Search, 
  Filter, 
  Car, 
  Compass, 
  Navigation, 
  QrCode, 
  X,
  ExternalLink,
  Activity,
  ArrowLeft,
  ScanSearch,
  Bell,
  Volume2,
  VolumeX,
  ChevronDown,
  ChevronUp,
  Route
} from 'lucide-react'
import { loadLeaflet, createOsmTileLayer, AGRA_COORDINATES } from '@/lib/leafletOsm'
import { GLOBAL_SAFETY_ZONES, SafetyZone } from '@/lib/constants/zones'
import { geofenceMonitor, ZoneTransitionAlert } from '@/lib/gis/geofenceMonitor'
import { db } from '@/lib/firebase'
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore'
import { BrandLogo } from '@/components/common/BrandLogo'
import { HeritageSkylineBackdrop } from '@/components/layout/HeritageSkylineBackdrop'

interface TouristIncident {
  id: string
  touristId: string
  touristName: string
  phone: string
  lat: number
  lng: number
  status: 'SOS_PANIC' | 'ROUTE_DIVERSION' | 'OFFLINE_BEACON' | 'SAFE'
  timestamp: string
  locationName: string
  battery: number
  details: string
}

interface ActiveRide {
  id: string
  rideId: string
  userId: string
  touristName: string
  driverName: string
  vehicleNumber: string
  vehicleModel?: string
  pickup: { lat: number; lng: number; address: string }
  destination: { lat: number; lng: number; address: string }
  fare: number
  status: string
  currentLocation: { lat: number; lng: number }
  timestamp: number
}

const DEMO_INCIDENTS: TouristIncident[] = [
  {
    id: 'INC-2025-081',
    touristId: 'TID-782401',
    touristName: 'Aditya Kaushik',
    phone: '+91 98765 43210',
    lat: 27.2450,
    lng: 77.8420,
    status: 'SAFE',
    timestamp: 'Just now',
    locationName: 'Sharda University Agra Main Campus',
    battery: 88,
    details: 'Verified safe entry into Sharda University Agra security perimeter.'
  },
  {
    id: 'INC-2025-082',
    touristId: 'TID-910243',
    touristName: 'Elena Rostova',
    phone: '+7 916 123-4567',
    lat: 27.1751,
    lng: 78.0421,
    status: 'SOS_PANIC',
    timestamp: '2 mins ago',
    locationName: 'Taj Mahal West Gate Entry',
    battery: 42,
    details: 'SOS Panic triggered from mobile app. Unidentified crowd pressure reported.'
  },
  {
    id: 'INC-2025-083',
    touristId: 'TID-449102',
    touristName: 'Marcus Vance',
    phone: '+1 415 555-0199',
    lat: 27.1950,
    lng: 78.0160,
    status: 'ROUTE_DIVERSION',
    timestamp: '5 mins ago',
    locationName: 'Kinari Bazaar Alleys',
    battery: 68,
    details: 'Vehicle deviated 310m off planned safe polyline into narrow unmonitored lane.'
  },
  {
    id: 'INC-2025-084',
    touristId: 'TID-339180',
    touristName: 'Sarah Jenkins',
    phone: '+44 7700 900077',
    lat: 27.2510,
    lng: 77.8480,
    status: 'OFFLINE_BEACON',
    timestamp: '8 mins ago',
    locationName: 'Keetham Lake & Sur Sarovar Bird Sanctuary',
    battery: 19,
    details: '24-byte GSM SMS fallback beacon received via ERSS 112 gateway. Zero cellular data.'
  }
]

const DEMO_ACTIVE_RIDES: ActiveRide[] = [
  {
    id: 'ride-demo-01',
    rideId: 'RIDE-17262301',
    userId: 'USR-8812',
    touristName: 'Aditya Kaushik',
    driverName: 'Ramesh Sharma',
    vehicleNumber: 'UP 80 BT 4421',
    vehicleModel: 'Bajaj RE Auto',
    pickup: { lat: 27.1620, lng: 78.0080, address: 'Agra Cantt Railway Station' },
    destination: { lat: 27.2450, lng: 77.8420, address: 'Sharda University Agra Main Campus' },
    fare: 185,
    status: 'IN_PROGRESS',
    currentLocation: { lat: 27.2000, lng: 77.9200 },
    timestamp: Date.now() - 360000
  },
  {
    id: 'ride-demo-02',
    rideId: 'RIDE-17262302',
    userId: 'USR-9934',
    touristName: 'David Miller',
    driverName: 'Amit Verma',
    vehicleNumber: 'UP 80 AC 1104',
    vehicleModel: 'Prime Sedan Dzire',
    pickup: { lat: 27.1730, lng: 78.0450, address: 'Taj Mahal East Gate' },
    destination: { lat: 27.1610, lng: 78.0380, address: 'ITC Mughal Luxury Resort' },
    fare: 140,
    status: 'IN_PROGRESS',
    currentLocation: { lat: 27.1670, lng: 78.0410 },
    timestamp: Date.now() - 180000
  }
]

export default function AuthorityPage() {
  const router = useRouter()
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const leafletInstanceRef = useRef<any>(null)

  const incidentMarkersRef = useRef<any[]>([])
  const zoneLayersRef = useRef<any[]>([])
  const rideMarkersRef = useRef<any[]>([])
  const ridePolylinesRef = useRef<any[]>([])

  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [filter, setFilter] = useState<'ALL' | 'SOS_PANIC' | 'ROUTE_DIVERSION' | 'OFFLINE_BEACON' | 'ACTIVE_RIDES'>('ALL')
  const [selectedIncident, setSelectedIncident] = useState<TouristIncident>(DEMO_INCIDENTS[0])
  const [efirModalData, setEfirModalData] = useState<TouristIncident | null>(null)
  
  // Real-time Active Rides Sync
  const [activeRides, setActiveRides] = useState<ActiveRide[]>(DEMO_ACTIVE_RIDES)
  const [selectedRide, setSelectedRide] = useState<ActiveRide | null>(DEMO_ACTIVE_RIDES[0])
  const [showRidesDrawer, setShowRidesDrawer] = useState(true)

  // Real-time Geofence Entry/Exit Notification Alerts
  const [liveAlert, setLiveAlert] = useState<ZoneTransitionAlert | null>({
    type: 'ZONE_TRANSITION',
    event: 'ENTRY',
    zoneName: 'Sharda University Agra Main Campus',
    zoneLevel: 'Safe',
    touristName: 'Aditya Kaushik',
    touristId: 'TID-88491',
    timestamp: new Date().toLocaleTimeString('en-IN'),
    location: { lat: 27.2450, lng: 77.8420 },
    metadata: 'Educational & Cultural Hub • Active CISF Security'
  })
  const [audioMuted, setAudioMuted] = useState(false)

  // Play audio chime on zone transition alert
  const playAlertChime = () => {
    if (audioMuted || typeof window === 'undefined') return
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const osc = audioCtx.createOscillator()
      const gain = audioCtx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime) // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1) // A5
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35)
      osc.connect(gain)
      gain.connect(audioCtx.destination)
      osc.start()
      osc.stop(audioCtx.currentTime + 0.35)
    } catch (e) {}
  }

  // 1. Subscribe to local Geofence Monitor
  useEffect(() => {
    const unsubscribe = geofenceMonitor.subscribe((alert) => {
      setLiveAlert(alert)
      playAlertChime()
    })
    return () => unsubscribe()
  }, [audioMuted])

  // 2. Real-Time Firestore Sync for Active Rides and Authority Notifications
  useEffect(() => {
    let unsubRides: (() => void) | undefined
    let unsubNotes: (() => void) | undefined

    try {
      if (db) {
        unsubRides = onSnapshot(collection(db, 'active_rides'), (snapshot) => {
          const fetchedRides: ActiveRide[] = []
          snapshot.forEach((doc) => {
            fetchedRides.push({ id: doc.id, ...(doc.data() as any) })
          })
          if (fetchedRides.length > 0) {
            setActiveRides(fetchedRides)
          }
        }, (err) => console.log('Firestore active_rides fallback:', err.message))

        unsubNotes = onSnapshot(collection(db, 'authority_notifications'), (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              const data = change.doc.data() as any
              if (data.type === 'ZONE_TRANSITION') {
                setLiveAlert(data as ZoneTransitionAlert)
                playAlertChime()
              }
            }
          })
        }, (err) => console.log('Firestore authority_notifications fallback:', err.message))
      }
    } catch (err) {
      console.warn('Firestore subscription fallback:', err)
    }

    return () => {
      if (unsubRides) unsubRides()
      if (unsubNotes) unsubNotes()
    }
  }, [audioMuted])

  const filteredIncidents = DEMO_INCIDENTS.filter((inc) => {
    if (filter === 'ALL' || filter === 'ACTIVE_RIDES') return true
    return inc.status === filter
  })

  // 3. Dynamic Leaflet Loader
  useEffect(() => {
    let isMounted = true

    loadLeaflet().then((L) => {
      if (!isMounted || !mapContainerRef.current) return
      leafletInstanceRef.current = L

      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [27.2050, 77.9500],
          zoom: 12,
          zoomControl: false
        })

        L.control.zoom({ position: 'topright' }).addTo(map)

        // OpenStreetMap Basemap Layer (Dark Mode Styled)
        createOsmTileLayer(L).addTo(map)

        mapInstanceRef.current = map
        setIsMapLoaded(true)
      }
    })

    return () => {
      isMounted = false
    }
  }, [])

  // 4. Render Global Safety Zones, Incidents, and Active Rides on Leaflet Map
  useEffect(() => {
    if (!isMapLoaded || !mapInstanceRef.current || !leafletInstanceRef.current) return
    const L = leafletInstanceRef.current
    const map = mapInstanceRef.current

    // Clear old layers
    incidentMarkersRef.current.forEach((m) => map.removeLayer(m))
    incidentMarkersRef.current = []
    zoneLayersRef.current.forEach((z) => map.removeLayer(z))
    zoneLayersRef.current = []
    rideMarkersRef.current.forEach((rm) => map.removeLayer(rm))
    rideMarkersRef.current = []
    ridePolylinesRef.current.forEach((rp) => map.removeLayer(rp))
    ridePolylinesRef.current = []

    // A. Render GLOBAL_SAFETY_ZONES
    GLOBAL_SAFETY_ZONES.forEach((zone: SafetyZone) => {
      const circle = L.circle(zone.center, {
        radius: zone.radius,
        color: zone.color,
        weight: 2,
        fillColor: zone.color,
        fillOpacity: zone.fillOpacity,
        dashArray: zone.level === 'Caution' ? '5, 5' : undefined
      }).addTo(map)

      circle.bindPopup(`
        <div style="color: #0f172a; font-family: sans-serif; font-size: 12px; max-width: 220px;">
          <strong style="font-size: 13px; color: #0c2340;">${zone.name}</strong><br>
          <div style="margin: 4px 0; font-weight: bold; color: ${zone.color};">
            ${zone.level === 'Safe' ? '🛡️ Safe Zone Corridor' : '⚠️ High Vigilance Area'}
          </div>
          <div style="color: #334155; font-size: 11px; margin-top: 2px;">
            ${zone.metadata}
          </div>
          <div style="color: #0284c7; font-size: 10px; margin-top: 4px; font-family: monospace;">
            📹 ${zone.cctvCount} CCTVs • ${zone.patrolFrequency}
          </div>
        </div>
      `)

      zoneLayersRef.current.push(circle)
    })

    // B. Render Incident Markers
    filteredIncidents.forEach((incident) => {
      const isSos = incident.status === 'SOS_PANIC'
      const isDiversion = incident.status === 'ROUTE_DIVERSION'
      const isOffline = incident.status === 'OFFLINE_BEACON'
      const isSelected = selectedIncident?.id === incident.id

      const color = isSos ? '#ef4444' : isDiversion ? '#f97316' : isOffline ? '#eab308' : '#10b981'
      const iconEmoji = isSos ? '🚨' : isDiversion ? '⚠️' : isOffline ? '📡' : '👤'

      const icon = L.divIcon({
        className: 'wayora-incident-pin',
        html: `
          <div style="position: relative; width: 34px; height: 34px; cursor: pointer;">
            ${isSelected ? `<div style="position: absolute; inset: -4px; background: ${color}; opacity: 0.4; border-radius: 50%; animation: ping 1.2s infinite;"></div>` : ''}
            <div style="position: relative; width: 34px; height: 34px; background: #ffffff; border: 2.5px solid ${color}; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 15px; box-shadow: 0 4px 12px rgba(2,132,199,0.18);">
              ${iconEmoji}
            </div>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      })

      const marker = L.marker([incident.lat, incident.lng], { icon })
        .addTo(map)
        .bindPopup(`
          <div style="color: #0f172a; font-family: sans-serif; font-size: 12px; max-width: 220px;">
            <strong style="font-size: 14px; color: #0c2340;">${incident.touristName}</strong> (${incident.touristId})<br>
            <span style="color: #64748b;">${incident.locationName}</span><br>
            <div style="font-weight: bold; color: ${color}; margin-top: 4px;">Status: ${incident.status}</div>
            <div style="color: #334155; margin-top: 4px; font-size: 11px;">${incident.details}</div>
          </div>
        `)

      marker.on('click', () => {
        setSelectedIncident(incident)
      })

      incidentMarkersRef.current.push(marker)
    })

    // C. Render Active Rides (Vehicle Markers & Route Lines)
    activeRides.forEach((ride) => {
      const isSelected = selectedRide?.rideId === ride.rideId
      
      // Ride Polyline
      const line = L.polyline(
        [
          [ride.pickup.lat, ride.pickup.lng],
          [ride.currentLocation.lat, ride.currentLocation.lng],
          [ride.destination.lat, ride.destination.lng]
        ],
        {
          color: '#0284c7',
          weight: isSelected ? 4 : 2.5,
          opacity: isSelected ? 0.9 : 0.6,
          dashArray: '6, 6'
        }
      ).addTo(map)
      ridePolylinesRef.current.push(line)

      // Vehicle Marker (Car/Auto)
      const carIcon = L.divIcon({
        className: 'wayora-active-car',
        html: `
          <div style="position: relative; width: 34px; height: 34px; cursor: pointer;">
            <div style="position: absolute; inset: -3px; background: #0284c7; opacity: 0.35; border-radius: 50%; animation: pulse 1.5s infinite;"></div>
            <div style="position: relative; width: 34px; height: 34px; background: #ffffff; border: 2px solid #0284c7; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; box-shadow: 0 4px 10px rgba(2,132,199,0.2);">
              🚖
            </div>
            <div style="position: absolute; bottom: -5px; right: -5px; background: #0284c7; color: #ffffff; font-size: 8px; font-weight: 900; padding: 1px 3px; border-radius: 4px; font-family: monospace;">
              LIVE
            </div>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      })

      const vMarker = L.marker([ride.currentLocation.lat, ride.currentLocation.lng], { icon: carIcon })
        .addTo(map)
        .bindPopup(`
          <div style="color: #0f172a; font-family: sans-serif; font-size: 12px; max-width: 220px;">
            <strong style="color: #0284c7; font-size: 13px;">🚖 Live Transit: ${ride.driverName}</strong><br>
            <span>Passenger: <strong>${ride.touristName}</strong></span><br>
            <div style="color: #475569; font-size: 11px; margin-top: 3px;">
              ${ride.vehicleModel || 'Verified Cab'} • ${ride.vehicleNumber}<br>
              Fare: <strong>₹${ride.fare}</strong>
            </div>
            <div style="color: #059669; font-size: 10px; margin-top: 3px; font-weight: bold;">
              Destination: ${ride.destination.address}
            </div>
          </div>
        `)

      vMarker.on('click', () => {
        setSelectedRide(ride)
      })

      rideMarkersRef.current.push(vMarker)
    })
  }, [isMapLoaded, filteredIncidents, selectedIncident, activeRides, selectedRide])

  const handleSelectIncident = (inc: TouristIncident) => {
    setSelectedIncident(inc)
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([inc.lat, inc.lng], 14.5, { animate: true })
    }
  }

  const handleSelectRide = (ride: ActiveRide) => {
    setSelectedRide(ride)
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([ride.currentLocation.lat, ride.currentLocation.lng], 14, { animate: true })
    }
  }

  return (
    <div className="min-h-screen bg-[#F0F8FF] text-slate-800 font-sans selection:bg-sky-500 selection:text-white flex flex-col relative overflow-hidden">
      {/* Heritage Skyline 04 Backdrop for Authority Command Center */}
      <HeritageSkylineBackdrop imageSrc="/heritage-skyline04.png" opacity="opacity-75" />

      {/* Top Universal Back to Hub Bar */}
      <div className="bg-white/80 backdrop-blur-md border-b border-sky-100 px-4 lg:px-8 py-2.5 flex items-center justify-between text-xs relative z-10">
        <Link
          href="/"
          className="flex items-center gap-2 text-slate-600 hover:text-sky-700 font-semibold transition group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition" />
          <span>← Back to WayORA Hub</span>
        </Link>
        <div className="flex items-center gap-3 text-slate-500">
          <span className="flex items-center gap-1.5 text-sky-700 font-mono font-medium">
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping"></span>
            Tactical Command Room Active
          </span>
          <span className="hidden sm:inline font-mono text-slate-400">Agra Police & ASI Command Grid</span>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white/95 backdrop-blur-xl border-b border-sky-100 px-4 lg:px-8 py-3 sticky top-0 z-30 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <BrandLogo size="sm" showText={false} />
            <div>
              <span className="text-lg font-black tracking-wider text-[#0C2340]">WayORA</span>
              <span className="text-xs text-sky-600 font-bold ml-1.5">AUTHORITY COMMAND & CONTROL</span>
            </div>
          </Link>
        </div>

        <nav className="hidden sm:flex items-center gap-2 text-xs text-slate-600 font-medium">
          <Link href="/ride" className="px-3 py-1.5 rounded-xl hover:bg-sky-50 transition flex items-center gap-1.5">
            <Car size={14} className="text-sky-600" /> Safe Ride
          </Link>
          <Link href="/sos" className="px-3 py-1.5 rounded-xl hover:bg-rose-50 transition flex items-center gap-1.5">
            <AlertTriangle size={14} className="text-rose-500" /> Silent SOS
          </Link>
          <Link href="/explore" className="px-3 py-1.5 rounded-xl hover:bg-emerald-50 transition flex items-center gap-1.5">
            <Compass size={14} className="text-emerald-600" /> Discovery Radar
          </Link>
          <Link href="/inspector" className="px-3 py-1.5 rounded-xl hover:bg-indigo-50 transition flex items-center gap-1.5">
            <ScanSearch size={14} className="text-indigo-600" /> Scam Inspector
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setAudioMuted(!audioMuted)}
            className="p-1.5 rounded-xl bg-sky-50 border border-sky-200 text-slate-600 hover:text-sky-700 text-xs flex items-center gap-1"
            title={audioMuted ? 'Unmute Alert Chime' : 'Mute Alert Chime'}
          >
            {audioMuted ? <VolumeX size={15} /> : <Volume2 size={15} className="text-sky-600" />}
          </button>
          <span className="inline-flex items-center gap-1.5 text-xs text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-200 font-mono font-bold">
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping"></span>
            POLICE DESK #04
          </span>
        </div>
      </header>

      {/* Dynamic Geofence Entry/Exit Alert Ticker */}
      {liveAlert && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 lg:px-8 py-2.5 flex items-center justify-between text-xs animate-fadeIn shadow-xs">
          <div className="flex items-center gap-2 text-amber-900 font-semibold">
            <Bell size={14} className="animate-bounce text-amber-600 shrink-0" />
            <span>
              <strong>GEOFENCE {liveAlert.event}:</strong> Tourist <u>{liveAlert.touristName}</u> ({liveAlert.touristId}) has {liveAlert.event === 'ENTRY' ? 'ENTERED' : 'EXITED'} <strong>{liveAlert.zoneName}</strong> ({liveAlert.zoneLevel} Zone) at {liveAlert.timestamp}
            </span>
          </div>
          <button
            onClick={() => setLiveAlert(null)}
            className="text-amber-700 hover:text-amber-950 ml-2 text-xs font-bold"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left Side: Incidents & Active Rides Dispatch Console (5 Cols) */}
        <div className="lg:col-span-5 p-4 lg:p-6 overflow-y-auto max-h-[calc(100vh-120px)] space-y-5 border-r border-sky-100 bg-[#F0F8FF]/60">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-100 border border-sky-200 text-sky-800 text-[11px] font-semibold mb-2">
              <Shield size={12} className="text-sky-600" /> Live Tactical Command & Ride Telemetry
            </div>
            <h1 className="text-2xl font-black text-[#0C2340]">Incident & Fleet Dispatch</h1>
            <p className="text-xs text-slate-500">
              Live monitoring of active transit rides, distress alerts, and geofence boundary crossings
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'ALL', label: 'All Feeds' },
              { id: 'ACTIVE_RIDES', label: `Active Rides (${activeRides.length})` },
              { id: 'SOS_PANIC', label: 'SOS Panic' },
              { id: 'ROUTE_DIVERSION', label: 'Route Diversion' },
              { id: 'OFFLINE_BEACON', label: '24B SMS Beacon' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  filter === f.id
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-white border border-sky-100 text-slate-600 hover:text-sky-700 hover:border-sky-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Section: Live Active Rides in Transit */}
          {(filter === 'ALL' || filter === 'ACTIVE_RIDES') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Car size={14} className="text-sky-600" /> Active Transit Rides ({activeRides.length})
                </span>
                <span className="text-[11px] text-slate-400 font-mono">Firestore Real-Time Live</span>
              </div>

              <div className="space-y-2">
                {activeRides.map((ride) => (
                  <div
                    key={ride.id || ride.rideId}
                    onClick={() => handleSelectRide(ride)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition ${
                      selectedRide?.rideId === ride.rideId
                        ? 'bg-white border-sky-400 shadow-[0_4px_20px_rgb(2,132,199,0.12)] ring-2 ring-sky-300/40'
                        : 'bg-white border-sky-100 hover:border-sky-300 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-2.5">
                        <div className="p-2 rounded-xl bg-sky-50 border border-sky-100 text-sky-600 text-lg">
                          🚖
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#0C2340] flex items-center gap-1.5">
                            <span>{ride.driverName}</span>
                            <span className="text-[10px] text-sky-800 font-mono bg-sky-100 px-1.5 py-0.2 rounded border border-sky-200">
                              {ride.vehicleNumber}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Passenger: <strong className="text-slate-800">{ride.touristName}</strong>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1">
                            {ride.pickup.address} ➔ {ride.destination.address}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-mono font-bold text-emerald-600">₹{ride.fare}</div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-sky-700 uppercase">
                          {ride.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Active Distress Incidents */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-[#0C2340] uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle size={14} className="text-amber-500" /> Emergency Incident Feed ({filteredIncidents.length})
            </span>

            <div className="space-y-2">
              {filteredIncidents.map((incident) => {
                const isSos = incident.status === 'SOS_PANIC'
                const isDiversion = incident.status === 'ROUTE_DIVERSION'
                const isOffline = incident.status === 'OFFLINE_BEACON'
                const color = isSos ? 'text-rose-600' : isDiversion ? 'text-amber-600' : isOffline ? 'text-amber-500' : 'text-emerald-600'

                return (
                  <div
                    key={incident.id}
                    onClick={() => handleSelectIncident(incident)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition ${
                      selectedIncident.id === incident.id
                        ? 'bg-white border-sky-400 shadow-[0_4px_20px_rgb(2,132,199,0.12)] ring-2 ring-sky-300/40'
                        : 'bg-white border-sky-100 hover:border-sky-300 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-black ${color}`}>
                          {isSos ? '🚨' : isDiversion ? '⚠️' : isOffline ? '📡' : '👤'} {incident.status}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">({incident.id})</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{incident.timestamp}</span>
                    </div>

                    <div className="text-xs font-bold text-[#0C2340] mb-0.5">{incident.touristName}</div>
                    <div className="text-[11px] text-slate-500 mb-2">{incident.locationName}</div>

                    <div className="p-2.5 rounded-xl bg-sky-50/70 border border-sky-100 text-[11px] text-slate-700">
                      {incident.details}
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 text-[11px]">
                      <span className="text-slate-500 font-mono">Battery: <strong className="text-slate-700">{incident.battery}%</strong></span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setEfirModalData(incident)
                        }}
                        className="px-2.5 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-bold text-[10px] transition flex items-center gap-1 shadow-xs"
                      >
                        <FileText size={12} /> 1-Click E-FIR
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Leaflet 1.9.4 & OpenStreetMap Tactical Grid (7 Cols) */}
        <div className="lg:col-span-7 relative h-[450px] lg:h-auto min-h-[450px] bg-sky-50 flex flex-col">
          <div ref={mapContainerRef} className="w-full flex-1 min-h-[450px]" />

          {/* Floating Map Overlay Status */}
          <div className="absolute top-4 left-4 z-20 bg-white/95 backdrop-blur-md border border-sky-100 rounded-2xl p-3.5 text-xs shadow-[0_4px_20px_rgb(2,132,199,0.1)] space-y-1">
            <div className="font-bold text-[#0C2340] flex items-center gap-2">
              <Radio size={15} className="text-sky-600 animate-pulse" />
              Agra Police Tactical Grid (OpenStreetMap)
            </div>
            <div className="text-slate-500 text-[11px]">
              6 Global Safety Geofences Active • {activeRides.length} Fleet Rides Live Tracking
            </div>
          </div>

          {/* Floating Map Legend */}
          <div className="absolute bottom-4 right-4 z-20 bg-white/95 backdrop-blur-md border border-sky-100 rounded-2xl p-3 text-xs shadow-[0_4px_20px_rgb(2,132,199,0.1)] space-y-1.5 font-medium">
            <div className="font-bold text-slate-800 text-[11px] mb-1">Tactical Legend</div>
            <div className="flex items-center gap-2 text-emerald-700 text-[11px]">
              <span className="w-3 h-3 rounded-full bg-emerald-500/30 border border-emerald-500"></span>
              <span>Safe Zones (Sharda Univ, Taj Mahal, Fort, Sadar)</span>
            </div>
            <div className="flex items-center gap-2 text-amber-700 text-[11px]">
              <span className="w-3 h-3 rounded-full bg-amber-500/30 border border-amber-500"></span>
              <span>Caution Zones (Keetham Lake, Kinari Alleys)</span>
            </div>
            <div className="flex items-center gap-2 text-sky-700 text-[11px]">
              <span className="w-3 h-3 rounded-full bg-sky-500/30 border border-sky-500"></span>
              <span>Active Passenger Fleet (🚖)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 1-Click E-FIR Filing Modal */}
      {efirModalData && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-sky-100 rounded-3xl max-w-lg w-full p-6 shadow-[0_20px_60px_rgba(2,132,199,0.25)] space-y-4 animate-scaleUp">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-sky-50 text-sky-600 border border-sky-200">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#0C2340]">UP Police Electronic FIR Generation</h3>
                  <p className="text-xs text-slate-500 font-mono">FIR REG: UP-AGRA-2025-{efirModalData.id.replace('INC-', '')}</p>
                </div>
              </div>
              <button
                onClick={() => setEfirModalData(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 bg-sky-50/60 rounded-2xl border border-sky-100 font-mono text-xs space-y-2 text-slate-700">
              <div className="flex justify-between">
                <span>Complainant:</span> <strong className="text-slate-900">{efirModalData.touristName}</strong>
              </div>
              <div className="flex justify-between">
                <span>Tourist ID:</span> <strong className="text-sky-700">{efirModalData.touristId}</strong>
              </div>
              <div className="flex justify-between">
                <span>Incident Type:</span> <strong className="text-rose-600">{efirModalData.status}</strong>
              </div>
              <div className="flex justify-between">
                <span>Incident Location:</span> <strong className="text-slate-900">{efirModalData.locationName}</strong>
              </div>
              <div className="flex justify-between">
                <span>GPS Telemetry:</span> <span>{efirModalData.lat}, {efirModalData.lng}</span>
              </div>
              <div className="pt-2 border-t border-sky-200 text-[11px] text-slate-600 font-sans">
                Summary: {efirModalData.details}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setEfirModalData(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert(`E-FIR filed successfully. Dispatched to Agra Kotwali Police Station. Reference ID: UP-AGRA-2025-${efirModalData.id}`)
                  setEfirModalData(null)
                }}
                className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
              >
                <Printer size={14} /> Submit & Print E-FIR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

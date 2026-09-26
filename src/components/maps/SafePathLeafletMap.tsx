'use client'

import { useEffect, useRef, useState } from 'react'
import { loadLeaflet, createOsmTileLayer, AGRA_COORDINATES } from '@/lib/leafletOsm'
import { GLOBAL_SAFETY_ZONES, SafetyZone } from '@/lib/constants/zones'

export interface MapMarker {
  id: string
  lat: number
  lng: number
  title?: string
  popupHtml?: string
  iconEmoji?: string
  color?: string
  badgeText?: string
  onClick?: () => void
}

export interface MapGeofence {
  id: string
  lat: number
  lng: number
  radius: number
  color?: string
  fillOpacity?: number
  isSelected?: boolean
  popupHtml?: string
}

export interface MapPolyline {
  id: string
  latlngs: [number, number][]
  color?: string
  weight?: number
  dashArray?: string
  opacity?: number
}

export interface WayORALeafletMapProps {
  center?: [number, number]
  zoom?: number
  markers?: MapMarker[]
  geofences?: MapGeofence[]
  polylines?: MapPolyline[]
  showGlobalZones?: boolean
  className?: string
  onMapReady?: (map: any, L: any) => void
}

export default function WayORALeafletMap({
  center = [AGRA_COORDINATES.lat, AGRA_COORDINATES.lng],
  zoom = AGRA_COORDINATES.zoom,
  markers = [],
  geofences = [],
  polylines = [],
  showGlobalZones = true,
  className = 'w-full h-full min-h-[400px]',
  onMapReady
}: WayORALeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const leafletInstanceRef = useRef<any>(null)

  const markerLayersRef = useRef<any[]>([])
  const geofenceLayersRef = useRef<any[]>([])
  const polylineLayersRef = useRef<any[]>([])

  const [isLoaded, setIsLoaded] = useState(false)

  // 1. Initialize Leaflet & OpenStreetMap Layer
  useEffect(() => {
    let isMounted = true

    loadLeaflet().then((L) => {
      if (!isMounted || !mapContainerRef.current) return
      leafletInstanceRef.current = L

      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: center,
          zoom: zoom,
          zoomControl: false
        })

        L.control.zoom({ position: 'topright' }).addTo(map)

        // Add pure OpenStreetMap Raster Layer (styled via global CSS filter in dark mode)
        createOsmTileLayer(L).addTo(map)

        mapInstanceRef.current = map
        setIsLoaded(true)

        if (onMapReady) {
          onMapReady(map, L)
        }
      }
    })

    return () => {
      isMounted = false
    }
  }, [])

  // 2. Render Polylines
  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current || !leafletInstanceRef.current) return
    const L = leafletInstanceRef.current
    const map = mapInstanceRef.current

    polylineLayersRef.current.forEach((p) => map.removeLayer(p))
    polylineLayersRef.current = []

    polylines.forEach((poly) => {
      const line = L.polyline(poly.latlngs, {
        color: poly.color || '#06b6d4',
        weight: poly.weight || 4,
        opacity: poly.opacity || 0.9,
        dashArray: poly.dashArray || undefined,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map)
      polylineLayersRef.current.push(line)
    })
  }, [isLoaded, polylines])

  // 3. Render Geofences (GLOBAL_SAFETY_ZONES + Custom Geofences)
  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current || !leafletInstanceRef.current) return
    const L = leafletInstanceRef.current
    const map = mapInstanceRef.current

    geofenceLayersRef.current.forEach((g) => map.removeLayer(g))
    geofenceLayersRef.current = []

    // A. Render Global Safety Zones
    if (showGlobalZones) {
      GLOBAL_SAFETY_ZONES.forEach((zone: SafetyZone) => {
        const circle = L.circle(zone.center, {
          radius: zone.radius,
          color: zone.color,
          weight: 1.8,
          fillColor: zone.color,
          fillOpacity: zone.fillOpacity,
          dashArray: zone.level === 'Caution' ? '5, 5' : undefined
        }).addTo(map)

        circle.bindPopup(`
          <div style="color: #0f172a; font-family: sans-serif; font-size: 12px; max-width: 220px;">
            <strong style="font-size: 13px; color: #0c2340;">${zone.name}</strong><br>
            <div style="margin: 4px 0; font-weight: bold; color: ${zone.color};">
              ${zone.level === 'Safe' ? '🛡️ Protected Safe Zone' : '⚠️ High Vigilance Zone'}
            </div>
            <div style="color: #334155; font-size: 11px;">
              ${zone.metadata}
            </div>
          </div>
        `)

        geofenceLayersRef.current.push(circle)
      })
    }

    // B. Render Additional Custom Geofences
    geofences.forEach((geo) => {
      const color = geo.color || '#10b981'
      const circle = L.circle([geo.lat, geo.lng], {
        radius: geo.radius,
        color: color,
        weight: geo.isSelected ? 2.5 : 1.2,
        fillColor: color,
        fillOpacity: geo.fillOpacity !== undefined ? geo.fillOpacity : geo.isSelected ? 0.22 : 0.08,
        dashArray: geo.isSelected ? undefined : '4, 4'
      }).addTo(map)

      if (geo.popupHtml) {
        circle.bindPopup(geo.popupHtml)
      }

      geofenceLayersRef.current.push(circle)
    })
  }, [isLoaded, geofences, showGlobalZones])

  // 4. Render Markers
  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current || !leafletInstanceRef.current) return
    const L = leafletInstanceRef.current
    const map = mapInstanceRef.current

    markerLayersRef.current.forEach((m) => map.removeLayer(m))
    markerLayersRef.current = []

    markers.forEach((m) => {
      const color = m.color || '#10b981'
      const emoji = m.iconEmoji || '📍'

      const customIcon = L.divIcon({
        className: 'safepath-marker-pin',
        html: `
          <div style="position: relative; width: 34px; height: 34px; cursor: pointer;">
            <div style="position: relative; width: 34px; height: 34px; background: #0f172a; border: 2.5px solid ${color}; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 15px; box-shadow: 0 4px 12px rgba(0,0,0,0.6);">
              ${emoji}
            </div>
            ${m.badgeText ? `<div style="position: absolute; bottom: -6px; right: -6px; background: ${color}; color: #0f172a; font-size: 9px; font-weight: 900; padding: 1px 4px; border-radius: 6px; font-family: monospace;">${m.badgeText}</div>` : ''}
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      })

      const marker = L.marker([m.lat, m.lng], { icon: customIcon }).addTo(map)

      if (m.popupHtml) {
        marker.bindPopup(m.popupHtml)
      }

      if (m.onClick) {
        marker.on('click', () => m.onClick!())
      }

      markerLayersRef.current.push(marker)
    })
  }, [isLoaded, markers])

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className={className} />
      {!isLoaded && (
        <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center z-10">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
            <span>INITIALIZING OPENSTREETMAP TILES...</span>
          </div>
        </div>
      )}
    </div>
  )
}

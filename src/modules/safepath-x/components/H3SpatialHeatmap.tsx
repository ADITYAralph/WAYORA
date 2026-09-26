'use client'

import React, { useEffect, useRef, useState } from 'react'
import { h3SpatialIndexer } from '../core/h3SpatialIndexer'
import { H3CellRisk } from '../types/h3.types'
import { Layers, Shield, AlertTriangle, Eye, EyeOff, Sparkles } from 'lucide-react'

interface H3SpatialHeatmapProps {
  centerLat?: number
  centerLng?: number
  zoomLevel?: number
  resolution?: number
  onCellClick?: (cell: H3CellRisk) => void
  activeTourists?: Array<{ lat: number; lng: number; name: string; isPanic?: boolean }>
}

export const H3SpatialHeatmap: React.FC<H3SpatialHeatmapProps> = ({
  centerLat = 27.2481, // SUA Anand Campus Agra
  centerLng = 77.8345,
  zoomLevel = 14,
  resolution = 8,
  onCellClick,
  activeTourists = []
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const hexLayersRef = useRef<any[]>([])
  const touristMarkersRef = useRef<any[]>([])
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [selectedCell, setSelectedCell] = useState<H3CellRisk | null>(null)
  const [showHexGrid, setShowHexGrid] = useState(true)
  const [activeRes, setActiveRes] = useState(resolution)

  // 1. Dynamic Leaflet Loader
  useEffect(() => {
    if (typeof window === 'undefined') return

    if (!document.querySelector('link[href*="leaflet.css"]')) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }

    if (!(window as any).L) {
      const script = document.createElement('script')
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      script.onload = () => setIsMapLoaded(true)
      document.head.appendChild(script)
    } else {
      setIsMapLoaded(true)
    }
  }, [])

  // 2. Initialize Leaflet Map
  useEffect(() => {
    if (!isMapLoaded || !mapContainerRef.current || mapInstanceRef.current || !(window as any).L) return

    const L = (window as any).L
    const map = L.map(mapContainerRef.current, {
      center: [centerLat, centerLng],
      zoom: zoomLevel,
      zoomControl: false
    })

    L.control.zoom({ position: 'topright' }).addTo(map)

    // OpenStreetMap basemap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | SafePath-X Spatial Intelligence',
      maxZoom: 19
    }).addTo(map)

    mapInstanceRef.current = map
    renderH3Grid(map, centerLat, centerLng, activeRes)
  }, [isMapLoaded])

  // 3. Render H3 Hexagons on Map
  const renderH3Grid = (map: any, lat: number, lng: number, res: number) => {
    if (!map || !(window as any).L) return
    const L = (window as any).L

    hexLayersRef.current.forEach((layer) => map.removeLayer(layer))
    hexLayersRef.current = []

    const cells = h3SpatialIndexer.generateHexGridForBounds(lat, lng, 3.5, res)

    cells.forEach((cell) => {
      const fillColor =
        cell.type === 'safe'
          ? '#10B981'
          : cell.type === 'caution'
          ? '#F59E0B'
          : '#EF4444'

      const latLngs = cell.boundaryPolygon.map((p) => [p.lat, p.lng])

      const polygon = L.polygon(latLngs, {
        color: fillColor,
        weight: 1.5,
        fillColor: fillColor,
        fillOpacity: cell.type === 'danger' ? 0.35 : 0.22,
        dashArray: cell.type === 'danger' ? '4, 4' : undefined
      }).addTo(map)

      polygon.on('click', () => {
        setSelectedCell(cell)
        if (onCellClick) onCellClick(cell)
      })

      hexLayersRef.current.push(polygon)
    })
  }

  // 4. Update Tourist Markers on Heatmap
  useEffect(() => {
    if (!mapInstanceRef.current || !(window as any).L) return
    const L = (window as any).L
    const map = mapInstanceRef.current

    touristMarkersRef.current.forEach((m) => map.removeLayer(m))
    touristMarkersRef.current = []

    activeTourists.forEach((t) => {
      const markerColor = t.isPanic ? '#EF4444' : '#3B82F6'
      const icon = L.divIcon({
        className: 'h3-tourist-beacon',
        html: `
          <div style="position: relative; width: 24px; height: 24px; cursor: pointer;">
            <div style="
              position: absolute;
              inset: 0;
              background: ${markerColor};
              opacity: 0.5;
              border-radius: 50%;
              animation: ping 1.4s cubic-bezier(0, 0, 0.2, 1) infinite;
            "></div>
            <div style="
              position: relative;
              width: 24px;
              height: 24px;
              background: ${markerColor};
              border: 2px solid white;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 11px;
              box-shadow: 0 4px 10px rgba(0,0,0,0.5);
            ">
              ${t.isPanic ? '🚨' : '👤'}
            </div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      })

      const marker = L.marker([t.lat, t.lng], { icon, zIndexOffset: 1000 })
        .addTo(map)
        .bindPopup(`<strong>📍 ${t.name}</strong><br><small>WayORA Spatial Stream</small>`)

      touristMarkersRef.current.push(marker)
    })
  }, [activeTourists])

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
      {/* Top Map HUD Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 backdrop-blur-xl border border-slate-800 p-3 rounded-xl shadow-xl">
        <div className="flex items-center gap-2">
          <Layers size={18} className="text-cyan-400" />
          <div>
            <h4 className="text-xs font-black tracking-wider uppercase text-white">
              H3 Spatial Risk Hexagon Layer
            </h4>
            <p className="text-[10px] text-slate-400">Resolution {activeRes} (~1km) • Real-time Spatio-Temporal Matrix</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-slate-800 bg-slate-950 p-0.5 text-[11px] font-bold">
            <button
              onClick={() => {
                setActiveRes(8)
                if (mapInstanceRef.current) renderH3Grid(mapInstanceRef.current, centerLat, centerLng, 8)
              }}
              className={`px-2.5 py-1 rounded-md transition ${
                activeRes === 8 ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Res 8 (1km)
            </button>
            <button
              onClick={() => {
                setActiveRes(9)
                if (mapInstanceRef.current) renderH3Grid(mapInstanceRef.current, centerLat, centerLng, 9)
              }}
              className={`px-2.5 py-1 rounded-md transition ${
                activeRes === 9 ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Res 9 (150m)
            </button>
          </div>

          <button
            onClick={() => {
              const newState = !showHexGrid
              setShowHexGrid(newState)
              hexLayersRef.current.forEach((layer) => {
                if (mapInstanceRef.current) {
                  if (newState) mapInstanceRef.current.addLayer(layer)
                  else mapInstanceRef.current.removeLayer(layer)
                }
              })
            }}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
            title="Toggle Hexagons"
          >
            {showHexGrid ? <Eye size={15} /> : <EyeOff size={15} />}
          </button>
        </div>
      </div>

      {/* Map Viewport */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[460px] z-10" />

      {/* Selected Hexagon Inspector Drawer */}
      {selectedCell && (
        <div className="absolute bottom-4 left-4 z-20 max-w-sm bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-xl p-4 shadow-2xl text-xs space-y-2 text-slate-200">
          <div className="flex items-center justify-between">
            <span
              className={`px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider text-[10px] ${
                selectedCell.type === 'safe'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : selectedCell.type === 'caution'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}
            >
              {selectedCell.type} Cell • Score: {selectedCell.safetyScore}%
            </span>
            <button onClick={() => setSelectedCell(null)} className="text-slate-400 hover:text-white p-1">
              ✕
            </button>
          </div>

          <div className="font-mono text-[11px] text-cyan-400">H3 Index: {selectedCell.h3Index}</div>
          <p className="text-[11px] text-slate-400">
            Center: {selectedCell.center.lat.toFixed(5)}° N, {selectedCell.center.lng.toFixed(5)}° E
          </p>

          <div className="border-t border-slate-800 pt-2 grid grid-cols-2 gap-2 text-[10px] font-mono">
            <div>Crime Weight: <strong className="text-white">{(selectedCell.factors.crimeWeight * 10).toFixed(1)}/10</strong></div>
            <div>Lighting Index: <strong className="text-white">{(selectedCell.factors.lightingWeight * 10).toFixed(1)}/10</strong></div>
            <div>Crowd Density: <strong className="text-white">{(selectedCell.factors.crowdDensityWeight * 10).toFixed(1)}/10</strong></div>
            <div>Police Factor: <strong className="text-emerald-400">{(selectedCell.factors.policeProximityMitigation * 10).toFixed(1)}/10</strong></div>
          </div>
        </div>
      )}
    </div>
  )
}

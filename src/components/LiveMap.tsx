'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPin, Minimize2, Maximize2, Navigation, AlertCircle, Target, Crosshair, Shield } from 'lucide-react'
import { REAL_INDIA_TOURIST_ZONES } from '@/data/realIndiaZones'

interface LiveMapProps {
  apiKey?: string
}

export function LiveMap({ apiKey }: LiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const userMarkerRef = useRef<any>(null)
  const watchIdRef = useRef<number | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [isTracking, setIsTracking] = useState(false)
  const [accuracy, setAccuracy] = useState<number | null>(null)
  const [lastUpdate, setLastUpdate] = useState<string>('')

  // Load Leaflet CSS and JS
  useEffect(() => {
    const loadLeaflet = async () => {
      // Load CSS
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        document.head.appendChild(link)
      }

      // Load JS
      if (!(window as any).L) {
        const script = document.createElement('script')
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
        script.onload = () => {
          setIsLoaded(true)
        }
        document.head.appendChild(script)
      } else {
        setIsLoaded(true)
      }
    }

    loadLeaflet()
  }, [])

  // Initialize map and start location tracking
  useEffect(() => {
    if (isLoaded && mapRef.current && !mapInstanceRef.current && (window as any).L) {
      const L = (window as any).L
      
      // Default location (India Gate, Delhi)
      const defaultLocation = [28.6129, 77.2295] as [number, number]
      
      mapInstanceRef.current = L.map(mapRef.current).setView(defaultLocation, 13)

      // Add OpenStreetMap tiles (styled with dark mode CSS filter)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(mapInstanceRef.current)

      // Render safety zones on map
      renderSafetyZones(mapInstanceRef.current, L)

      // Start automatic location tracking
      startLocationTracking()
    }

    return () => {
      // Cleanup - stop watching location when component unmounts
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
    }
  }, [isLoaded])

  const renderSafetyZones = (map: any, L: any) => {
    REAL_INDIA_TOURIST_ZONES.forEach((zone) => {
      const color = zone.type === 'safe' ? '#10B981' : zone.type === 'caution' ? '#F59E0B' : '#EF4444'
      
      L.circle([zone.location.lat, zone.location.lng], {
        radius: zone.radius,
        color,
        fillColor: color,
        fillOpacity: 0.2,
        weight: 2
      }).addTo(map).bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px;">
          <strong>${zone.name}</strong><br>
          <span>${zone.type === 'safe' ? '🟢 Safe Zone' : zone.type === 'caution' ? '🟡 Caution Zone' : '🔴 Danger Zone'} (${zone.safetyLevel}/10)</span><br>
          <small>${zone.city}, ${zone.state}</small>
        </div>
      `)
    })
  }

  const startLocationTracking = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser')
      return
    }

    setIsTracking(true)
    setLocationError(null)

    // First, get current position immediately
    navigator.geolocation.getCurrentPosition(
      (position) => {
        updateUserLocation(position)
        setIsTracking(false)
        
        // Then start watching for changes
        watchIdRef.current = navigator.geolocation.watchPosition(
          updateUserLocation,
          handleLocationError,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 30000 // Accept cached position up to 30 seconds old
          }
        )
      },
      (error) => {
        handleLocationError(error)
        setIsTracking(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000
      }
    )
  }

  const updateUserLocation = (position: GeolocationPosition) => {
    const userPos = {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    }
    
    setUserLocation(userPos)
    setAccuracy(position.coords.accuracy)
    setLastUpdate(new Date().toLocaleTimeString())
    setLocationError(null)
    
    if (mapInstanceRef.current && (window as any).L) {
      const L = (window as any).L
      
      // Center map on user location
      mapInstanceRef.current.setView([userPos.lat, userPos.lng], 16)
      
      // Remove existing marker
      if (userMarkerRef.current) {
        mapInstanceRef.current.removeLayer(userMarkerRef.current)
      }
      
      // Create custom marker icon
      const customIcon = L.divIcon({
        html: `
          <div style="
            width: 20px; 
            height: 20px; 
            background: #3B82F6; 
            border: 3px solid white; 
            border-radius: 50%; 
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            position: relative;
          ">
            <div style="
              width: 8px;
              height: 8px;
              background: white;
              border-radius: 50%;
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
            "></div>
          </div>
        `,
        className: 'live-location-marker',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      })
      
      // Add user location marker with popup
      userMarkerRef.current = L.marker([userPos.lat, userPos.lng], { icon: customIcon })
        .addTo(mapInstanceRef.current)
        .bindPopup(`
          <div style="text-align: center;">
            <strong>📍 Your Live Location</strong><br>
            <small>Lat: ${userPos.lat.toFixed(6)}</small><br>
            <small>Lng: ${userPos.lng.toFixed(6)}</small><br>
            <small>Accuracy: ~${Math.round(position.coords.accuracy)}m</small>
          </div>
        `)

      // Add accuracy circle
      if (position.coords.accuracy < 1000) { // Only show if accuracy is reasonable
        L.circle([userPos.lat, userPos.lng], {
          radius: position.coords.accuracy,
          fillColor: '#3B82F6',
          fillOpacity: 0.1,
          color: '#3B82F6',
          opacity: 0.3,
          weight: 1
        }).addTo(mapInstanceRef.current)
      }
    }
  }

  const handleLocationError = (error: GeolocationPositionError) => {
    setIsTracking(false)
    let errorMessage = 'Unable to get your location'
    
    switch(error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = 'Location access denied. Please enable location permissions.'
        break
      case error.POSITION_UNAVAILABLE:
        errorMessage = 'Location information is unavailable.'
        break
      case error.TIMEOUT:
        errorMessage = 'Location request timed out. Trying again...'
        // Auto-retry on timeout
        setTimeout(() => {
          if (!userLocation) {
            startLocationTracking()
          }
        }, 3000)
        break
    }
    
    setLocationError(errorMessage)
    console.error("Location error:", error?.message || 'Unknown location error')
  }

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
    // Trigger map resize after expansion
    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize()
      }
    }, 300)
  }

  const centerOnUser = () => {
    if (userLocation && mapInstanceRef.current) {
      mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], 16)
      // Also refresh location
      startLocationTracking()
    } else {
      startLocationTracking()
    }
  }

  const requestLocationPermission = async () => {
    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' })
      if (permission.state === 'denied') {
        setLocationError('Location permission denied. Please enable in browser settings.')
      } else {
        startLocationTracking()
      }
    } catch (error) {
      startLocationTracking() // Fallback to direct request
    }
  }

  return (
    <div className={`live-map-container ${isExpanded ? 'expanded' : 'collapsed'}`}>
      {/* Map Header */}
      <div className="map-header">
        <div className="flex items-center gap-2">
          <Target size={16} className="text-blue-600" />
          <span className="font-semibold text-gray-800">Live Location</span>
          {userLocation && (
            <div className="status-indicator">
              <div className="status-dot animate-pulse"></div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={centerOnUser}
            className="map-control-btn"
            title="Refresh location"
            disabled={isTracking}
          >
            <Navigation size={14} className={isTracking ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={toggleExpanded}
            className="map-control-btn"
            title={isExpanded ? 'Minimize' : 'Maximize'}
          >
            {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="map-body">
        {!isLoaded ? (
          <div className="map-loading">
            <div className="loading-spinner"></div>
            <span>Loading map...</span>
          </div>
        ) : (
          <>
            <div ref={mapRef} className="leaflet-map"></div>
            
            {!userLocation && !locationError && (
              <div className="location-prompt">
                <Crosshair size={24} className="text-blue-500 mb-2" />
                <p className="text-sm text-gray-600 mb-2">Getting your location...</p>
                <button
                  onClick={requestLocationPermission}
                  className="location-btn"
                >
                  Enable Location
                </button>
              </div>
            )}
          </>
        )}
        
        {locationError && (
          <div className="location-error">
            <AlertCircle size={16} />
            <span>{locationError}</span>
            <button 
              onClick={requestLocationPermission}
              className="retry-btn"
            >
              Retry
            </button>
          </div>
        )}
      </div>

      {/* Location Info */}
      {userLocation && (
        <div className="location-info">
          <div className="location-coords">
            📍 {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
          </div>
          {accuracy && (
            <div className="location-accuracy">
              ±{Math.round(accuracy)}m • {lastUpdate}
            </div>
          )}
        </div>
      )}

<style jsx>{`
  .live-map-container {
    position: fixed;
    bottom: 20px;        /* ← CHANGED: Now at bottom */
    right: 20px;         /* ← SAME: Still at right */
    background: white;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
    border: 1px solid #e5e7eb;
    z-index: 1000;
    overflow: hidden;
    transition: all 0.3s ease;
  }

  .live-map-container.collapsed {
    width: 300px;
    height: 220px;
  }

  .live-map-container.expanded {
    width: 400px;
    height: 500px;
    bottom: 20px;        /* ← CHANGED: Keep at bottom when expanded */
  }

  .map-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid #e5e7eb;
    background: #f8fafc;
  }

  .status-indicator {
    margin-left: 8px;
  }

  .status-dot {
    width: 8px;
    height: 8px;
    background: #10b981;
    border-radius: 50%;
  }

  .map-control-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 6px;
    border: 1px solid #d1d5db;
    background: white;
    color: #6b7280;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .map-control-btn:hover {
    background: #f3f4f6;
    color: #374151;
  }

  .map-control-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .map-body {
    position: relative;
    flex: 1;
    height: calc(100% - 50px);
  }

  .leaflet-map {
    width: 100%;
    height: 100%;
  }

  .map-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #6b7280;
    font-size: 14px;
  }

  .loading-spinner {
    width: 24px;
    height: 24px;
    border: 2px solid #e5e7eb;
    border-top: 2px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 8px;
  }

  .location-prompt {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10;
  }

  .location-btn {
    background: #3b82f6;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 12px;
    cursor: pointer;
    transition: background 0.2s;
  }

  .location-btn:hover {
    background: #2563eb;
  }

  .location-error {
    position: absolute;
    top: 8px;
    left: 8px;
    right: 8px;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 6px;
    color: #dc2626;
    font-size: 12px;
    z-index: 10;
  }

  .retry-btn {
    margin-left: auto;
    background: #dc2626;
    color: white;
    border: none;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 10px;
    cursor: pointer;
  }

  .location-info {
    position: absolute;
    bottom: 8px;
    left: 8px;
    right: 8px;
    padding: 8px 12px;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(8px);
    border-radius: 6px;
    z-index: 10;
  }

  .location-coords {
    color: white;
    font-size: 11px;
    font-family: monospace;
    margin-bottom: 2px;
  }

  .location-accuracy {
    color: #d1d5db;
    font-size: 9px;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @media (max-width: 768px) {
    .live-map-container.collapsed {
      width: 250px;
      height: 180px;
      bottom: 20px;     /* ← ADDED: Keep at bottom on mobile */
    }
    
    .live-map-container.expanded {
      width: calc(100vw - 40px);
      height: 400px;
      right: 20px;
      bottom: 20px;     /* ← ADDED: Keep at bottom when expanded on mobile */
    }
  }
`}</style>
    </div>
  )
}

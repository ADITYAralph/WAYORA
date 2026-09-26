'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Navigation, MapPin, Clock, Route, Zap, X } from 'lucide-react'
import { Monument } from '@/data/monuments'

interface NavigationMapProps {
  monument: Monument
  onClose: () => void
}

export function NavigationMap({ monument, onClose }: NavigationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const userMarkerRef = useRef<any>(null)
  const monumentMarkerRef = useRef<any>(null)
  const routeControlRef = useRef<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)
  const [distance, setDistance] = useState<string>('')
  const [duration, setDuration] = useState<string>('')
  const [locationError, setLocationError] = useState<string | null>(null)
  const [isLoadingRoute, setIsLoadingRoute] = useState(false)

  // Load Leaflet and routing libraries
  useEffect(() => {
    const loadLibraries = async () => {
      // Load CSS
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        document.head.appendChild(link)
      }

      // Load routing CSS
      if (!document.querySelector('link[href*="leaflet-routing-machine"]')) {
        const routingLink = document.createElement('link')
        routingLink.rel = 'stylesheet'
        routingLink.href = 'https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.css'
        document.head.appendChild(routingLink)
      }

      // Load Leaflet JS
      if (!(window as any).L) {
        const script = document.createElement('script')
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
        script.onload = () => {
          // Load routing machine
          const routingScript = document.createElement('script')
          routingScript.src = 'https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.js'
          routingScript.onload = () => {
            setIsLoaded(true)
          }
          document.head.appendChild(routingScript)
        }
        document.head.appendChild(script)
      } else if ((window as any).L.Routing) {
        setIsLoaded(true)
      } else {
        const routingScript = document.createElement('script')
        routingScript.src = 'https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.js'
        routingScript.onload = () => {
          setIsLoaded(true)
        }
        document.head.appendChild(routingScript)
      }
    }

    loadLibraries()
  }, [])

  // Initialize map
  useEffect(() => {
    if (isLoaded && mapRef.current && !mapInstanceRef.current && (window as any).L) {
      const L = (window as any).L
      
      // Monument location
      const monumentLocation = [monument.location_details.coordinates.lat, monument.location_details.coordinates.lng] as [number, number]
      
      mapInstanceRef.current = L.map(mapRef.current).setView(monumentLocation, 13)

      // Add OpenStreetMap tiles (styled with dark mode CSS filter)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(mapInstanceRef.current)

      // Add monument marker
      const monumentIcon = L.divIcon({
        html: `
          <div style="
            width: 32px; 
            height: 32px; 
            background: #dc2626; 
            border: 3px solid white; 
            border-radius: 50%; 
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
          ">${monument.doodle}</div>
        `,
        className: 'monument-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      })

      monumentMarkerRef.current = L.marker(monumentLocation, { icon: monumentIcon })
        .addTo(mapInstanceRef.current)
        .bindPopup(`
          <div style="text-align: center;">
            <strong>${monument.doodle} ${monument.name}</strong><br>
            <small>${monument.location}, ${monument.state}</small>
          </div>
        `)

      // Get user location and show route
      getCurrentLocationAndRoute()
    }
  }, [isLoaded, monument])

  const getCurrentLocationAndRoute = () => {
    if (navigator.geolocation) {
      setLocationError(null)
      setIsLoadingRoute(true)
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          
          setUserLocation(userPos)
          addUserMarkerAndRoute(userPos)
        },
        (error) => {
          setLocationError('Unable to get your location')
          setIsLoadingRoute(false)
          console.error('Location error:', error)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      )
    } else {
      setLocationError('Geolocation is not supported')
    }
  }

  const addUserMarkerAndRoute = (userPos: {lat: number, lng: number}) => {
    if (!mapInstanceRef.current || !(window as any).L) return

    const L = (window as any).L

    // Add user location marker
    const userIcon = L.divIcon({
      html: `
        <div style="
          width: 24px; 
          height: 24px; 
          background: #3B82F6; 
          border: 3px solid white; 
          border-radius: 50%; 
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
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
      className: 'user-marker',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    })

    userMarkerRef.current = L.marker([userPos.lat, userPos.lng], { icon: userIcon })
      .addTo(mapInstanceRef.current)
      .bindPopup('📍 Your Location')

    // Add routing
    if (L.Routing) {
      routeControlRef.current = L.Routing.control({
        waypoints: [
          L.latLng(userPos.lat, userPos.lng),
          L.latLng(monument.location_details.coordinates.lat, monument.location_details.coordinates.lng)
        ],
        routeWhileDragging: false,
        addWaypoints: false,
        createMarker: () => null, // Don't create default markers
        lineOptions: {
          styles: [{ color: '#3B82F6', weight: 5, opacity: 0.8 }]
        }
      }).on('routesfound', (e: any) => {
        const routes = e.routes
        const summary = routes[0].summary
        
        // Calculate distance and time
        const distanceKm = (summary.totalDistance / 1000).toFixed(1)
        const timeMinutes = Math.round(summary.totalTime / 60)
        
        setDistance(`${distanceKm} km`)
        setDuration(`${timeMinutes} min`)
        setIsLoadingRoute(false)
      }).addTo(mapInstanceRef.current)

      // Fit map to show both locations
      const group = L.featureGroup([userMarkerRef.current, monumentMarkerRef.current])
      mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1))
    }
  }

  const startNavigation = () => {
    if (userLocation) {
      const googleMapsUrl = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${monument.location_details.coordinates.lat},${monument.location_details.coordinates.lng}`
      window.open(googleMapsUrl, '_blank')
    }
  }

  return (
    <div className="navigation-map-overlay">
      <div className="navigation-map-container">
        {/* Header */}
        <div className="nav-header">
          <button onClick={onClose} className="back-btn">
            <ArrowLeft size={20} />
          </button>
          <div className="nav-title">
            <h2>{monument.doodle} {monument.name}</h2>
            <p>{monument.location}, {monument.state}</p>
          </div>
          <button onClick={onClose} className="close-btn">
            <X size={20} />
          </button>
        </div>

        {/* Map */}
        <div className="map-container">
          {!isLoaded ? (
            <div className="map-loading">
              <div className="loading-spinner"></div>
              <span>Loading navigation...</span>
            </div>
          ) : (
            <div ref={mapRef} className="navigation-map"></div>
          )}

          {isLoadingRoute && (
            <div className="route-loading">
              <div className="loading-spinner"></div>
              <span>Calculating route...</span>
            </div>
          )}

          {locationError && (
            <div className="location-error">
              <span>{locationError}</span>
              <button onClick={getCurrentLocationAndRoute} className="retry-btn">
                Retry
              </button>
            </div>
          )}
        </div>

        {/* Route Info */}
        {userLocation && distance && duration && (
          <div className="route-info">
            <div className="route-stats">
              <div className="stat">
                <Route size={16} className="stat-icon" />
                <span className="stat-label">Distance</span>
                <span className="stat-value">{distance}</span>
              </div>
              <div className="stat">
                <Clock size={16} className="stat-icon" />
                <span className="stat-label">Duration</span>
                <span className="stat-value">{duration}</span>
              </div>
            </div>
            
            <button onClick={startNavigation} className="navigate-btn">
              <Navigation size={16} />
              Start Navigation
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .navigation-map-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .navigation-map-container {
          width: 100%;
          max-width: 900px;
          height: 90vh;
          background: white;
          border-radius: 16px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .nav-header {
          display: flex;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid #e5e7eb;
          background: #f8fafc;
        }

        .back-btn, .close-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 8px;
          border: 1px solid #d1d5db;
          background: white;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .back-btn:hover, .close-btn:hover {
          background: #f3f4f6;
          color: #374151;
        }

        .nav-title {
          flex: 1;
          text-align: center;
          margin: 0 16px;
        }

        .nav-title h2 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
        }

        .nav-title p {
          margin: 4px 0 0 0;
          font-size: 14px;
          color: #6b7280;
        }

        .map-container {
          flex: 1;
          position: relative;
        }

        .navigation-map {
          width: 100%;
          height: 100%;
        }

        .map-loading, .route-loading {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          z-index: 10;
        }

        .route-loading {
          top: 80px;
          left: 50%;
          transform: translateX(-50%);
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

        .location-error {
          position: absolute;
          top: 20px;
          left: 20px;
          right: 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          color: #dc2626;
          font-size: 14px;
          z-index: 10;
        }

        .retry-btn {
          background: #dc2626;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
        }

        .route-info {
          padding: 20px;
          border-top: 1px solid #e5e7eb;
          background: #f8fafc;
        }

        .route-stats {
          display: flex;
          gap: 32px;
          margin-bottom: 16px;
        }

        .stat {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .stat-icon {
          color: #6b7280;
        }

        .stat-label {
          font-size: 14px;
          color: #6b7280;
        }

        .stat-value {
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
        }

        .navigate-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 24px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        }

        .navigate-btn:hover {
          background: #2563eb;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .navigation-map-overlay {
            padding: 10px;
          }

          .navigation-map-container {
            height: 95vh;
          }

          .route-stats {
            flex-direction: column;
            gap: 12px;
          }
        }
      `}</style>
    </div>
  )
}

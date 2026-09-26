'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { X, Shield, MapPin, AlertTriangle, Eye, EyeOff, Search, AlertCircle } from 'lucide-react'
import GoBackButton from './GoBackButton' // ✅ NEW: Import Go Back Button

import { REAL_INDIA_TOURIST_ZONES } from '@/data/realIndiaZones'

interface GeofencingModalProps {
  isOpen: boolean
  onClose: () => void
}

// Leaflet types
declare global {
  interface Window {
    L: any
  }
}

export default function GeofencingModal({ isOpen, onClose }: GeofencingModalProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  
  const [isLoaded, setIsLoaded] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null)
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [selectedZone, setSelectedZone] = useState<any>(null)
  const [nearbyZones, setNearbyZones] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'safe' | 'caution' | 'danger'>('all')
  const [showZones, setShowZones] = useState(true)

  // Load Leaflet instead of Mapbox (more reliable)
  useEffect(() => {
    if (!isOpen) return

    const loadLeaflet = async () => {
      try {
        if (typeof window !== 'undefined' && window.L) {
          setIsLoaded(true)
          return
        }

        setLoadError(null)
        
        // Load Leaflet CSS
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const cssLink = document.createElement('link')
          cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
          cssLink.rel = 'stylesheet'
          cssLink.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='
          cssLink.crossOrigin = ''
          document.head.appendChild(cssLink)
        }
        
        // Load Leaflet JS
        if (!document.querySelector('script[src*="leaflet.js"]')) {
          const script = document.createElement('script')
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
          script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo='
          script.crossOrigin = ''
          script.async = true
          
          script.onload = () => {
            if (window.L) {
              console.log('Leaflet loaded successfully')
              setIsLoaded(true)
              setLoadError(null)
            } else {
              throw new Error('Leaflet failed to initialize')
            }
          }
          
          script.onerror = (error) => {
            console.error('Failed to load Leaflet:', error)
            setLoadError('Failed to load map. Please check your internet connection.')
            setIsLoaded(false)
          }
          
          document.head.appendChild(script)
        } else {
          if (window.L) {
            setIsLoaded(true)
          }
        }
      } catch (error) {
        console.error('Error loading Leaflet:', error)
        setLoadError('Failed to load mapping service')
      }
    }

    loadLeaflet()
  }, [isOpen])

  // Initialize Map
  useEffect(() => {
    if (!isLoaded || !mapContainerRef.current || !isOpen || !window.L) return

    const initMap = () => {
      try {
        // Cleanup existing map
        if (mapRef.current) {
          mapRef.current.remove()
        }

        // Center on India (Delhi)
        const indiaCenter = [28.6139, 77.2090]
        
        mapRef.current = window.L.map(mapContainerRef.current).setView(indiaCenter, 6)
        
        // Add OpenStreetMap raster tiles (styled with dark mode CSS filter)
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mapRef.current)

        console.log('Map initialized successfully')
        
        // Add zones to map
        if (showZones) {
          addZonesToMap()
        }
        
      } catch (error) {
        console.error('Error initializing map:', error)
        setLoadError('Failed to initialize map. Please refresh the page.')
      }
    }

    initMap()
    getCurrentLocation()
  }, [isLoaded, isOpen])

  // Get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      console.log('Geolocation not supported')
      const delhiLocation = { lat: 28.6139, lng: 77.2090 }
      setCurrentLocation(delhiLocation)
      updateNearbyZones(delhiLocation)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
        setCurrentLocation(location)
        
        if (mapRef.current && window.L) {
          try {
            // Add current location marker (blue)
            const locationMarker = window.L.marker([location.lat, location.lng])
              .addTo(mapRef.current)
              .bindPopup('Your Location')
              .openPopup()
            
            markersRef.current.push(locationMarker)
            
            // Center map on user location
            mapRef.current.setView([location.lat, location.lng], 10)
            
            updateNearbyZones(location)
          } catch (error) {
            console.error('Error adding location marker:', error)
          }
        }
      },
      (error) => {
        console.log('Geolocation error:', error)
        const delhiLocation = { lat: 28.6139, lng: 77.2090 }
        setCurrentLocation(delhiLocation)
        updateNearbyZones(delhiLocation)
      }
    )
  }

  // Add zones to map
  const addZonesToMap = useCallback(() => {
    if (!mapRef.current || !window.L) return

    try {
      // Clear existing markers
      markersRef.current.forEach(marker => {
        try {
          mapRef.current.removeLayer(marker)
        } catch (e) {
          console.log('Error removing marker:', e)
        }
      })
      markersRef.current = []

      const filteredZones = REAL_INDIA_TOURIST_ZONES.filter((zone: any) => {
        const matchesSearch = zone.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             zone.monumentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             zone.city.toLowerCase().includes(searchTerm.toLowerCase())
        
        const matchesFilter = filterType === 'all' || zone.type === filterType
        
        return matchesSearch && matchesFilter && zone.isActive
      })

      filteredZones.forEach((zone: any) => {
        try {
          const zoneColor = zone.type === 'safe' ? 'green' : 
                           zone.type === 'caution' ? 'orange' : 'red'
          
          // Create custom icon
          const customIcon = window.L.divIcon({
            className: 'custom-marker',
            html: `<div style="
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background-color: ${zoneColor};
              border: 3px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            "></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          })
          
          // Add marker
          const marker = window.L.marker([zone.location.lat, zone.location.lng], {
            icon: customIcon
          })
          .addTo(mapRef.current)
          .bindPopup(`
            <div style="max-width: 200px;">
              <h3 style="margin: 0 0 5px 0; font-weight: bold;">${zone.name}</h3>
              <p style="margin: 0 0 3px 0; font-size: 14px; color: #666;">${zone.monumentName}</p>
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #999;">${zone.city}, ${zone.state}</p>
              <div style="background: ${zone.type === 'safe' ? '#dcfce7' : zone.type === 'caution' ? '#fef3c7' : '#fee2e2'}; 
                          color: ${zone.type === 'safe' ? '#166534' : zone.type === 'caution' ? '#92400e' : '#991b1b'};
                          padding: 4px 8px; border-radius: 12px; font-size: 12px; display: inline-block; margin-bottom: 8px;">
                ${zone.type === 'safe' ? '✅ Safe Zone' : zone.type === 'caution' ? '⚠️ Caution Zone' : '🚨 Danger Zone'}
              </div>
              <div style="font-size: 12px;">
                <p><strong>Safety Level:</strong> ${zone.safetyLevel}/10</p>
                <p><strong>Emergency:</strong> ${zone.emergencyContacts.police}</p>
              </div>
            </div>
          `)
          
          // Add safety zone circle
          const circle = window.L.circle([zone.location.lat, zone.location.lng], {
            color: zoneColor,
            fillColor: zoneColor,
            fillOpacity: 0.1,
            radius: zone.radius
          }).addTo(mapRef.current)
          
          // Add click handler
          marker.on('click', () => {
            setSelectedZone(zone)
            mapRef.current.setView([zone.location.lat, zone.location.lng], 15)
          })
          
          markersRef.current.push(marker)
          markersRef.current.push(circle)
          
        } catch (error) {
          console.error('Error adding zone to map:', error)
        }
      })
      
      // Re-add current location if it exists
      if (currentLocation) {
        const locationMarker = window.L.marker([currentLocation.lat, currentLocation.lng])
          .addTo(mapRef.current)
          .bindPopup('Your Location')
        
        markersRef.current.push(locationMarker)
      }
      
    } catch (error) {
      console.error('Error in addZonesToMap:', error)
    }
  }, [searchTerm, filterType, showZones, currentLocation])

  // Update map when filters change
  useEffect(() => {
    if (showZones && mapRef.current && window.L) {
      addZonesToMap()
    } else if (!showZones && mapRef.current) {
      // Clear zone markers, keep location
      markersRef.current.forEach(marker => {
        try {
          mapRef.current.removeLayer(marker)
        } catch (e) {}
      })
      markersRef.current = []
      
      if (currentLocation) {
        const locationMarker = window.L.marker([currentLocation.lat, currentLocation.lng])
          .addTo(mapRef.current)
          .bindPopup('Your Location')
        
        markersRef.current.push(locationMarker)
      }
    }
  }, [showZones, searchTerm, filterType, addZonesToMap])

  // Calculate nearby zones
  const updateNearbyZones = (location: {lat: number, lng: number}) => {
    try {
      const nearby = REAL_INDIA_TOURIST_ZONES.filter((zone: any) => {
        const distance = calculateDistance(
          location.lat, location.lng,
          zone.location.lat, zone.location.lng
        )
        return distance <= 50 && zone.isActive
      }).sort((a: any, b: any) => {
        const distA = calculateDistance(location.lat, location.lng, a.location.lat, a.location.lng)
        const distB = calculateDistance(location.lat, location.lng, b.location.lat, b.location.lng)
        return distA - distB
      })

      setNearbyZones(nearby.slice(0, 5))
    } catch (error) {
      console.error('Error updating nearby zones:', error)
    }
  }

  // Calculate distance between two points
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  // Center map on zone
  const centerOnZone = (zone: any) => {
    if (mapRef.current) {
      try {
        mapRef.current.setView([zone.location.lat, zone.location.lng], 15)
        setSelectedZone(zone)
      } catch (error) {
        console.error('Error centering on zone:', error)
      }
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
      }
    }
  }, [])

  // Handle modal background click
  const handleModalClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleModalClick}
    >
      <div 
        className="bg-white rounded-2xl w-full max-w-7xl h-[90vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ✅ UPDATED Header with Go Back Button */}
        <div 
          className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* ✅ NEW: Go Back Button */}
              <GoBackButton
                variant="header"
                onClick={onClose}
                label="Back"
                className="mr-2"
                hideOnHomePage={false} // Always show in modal
              />
              
              <Shield size={28} />
              <div>
                <h2 className="text-xl font-bold">WayORA Live Geofencing</h2>
                <p className="text-green-100 text-sm">Real-time safety zones across India&apos;s tourist destinations</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="flex h-full">
          {/* Map Section */}
          <div className="flex-1 relative">
            {/* Map Controls */}
            <div className="absolute top-4 left-4 right-4 z-[1000] flex gap-2">
              <div className="flex items-center bg-white rounded-lg shadow-lg px-3 py-2 flex-1">
                <Search size={18} className="text-gray-500 mr-2" />
                <input
                  type="text"
                  placeholder="Search monuments, cities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 outline-none text-white placeholder:text-[#808080]"
                />
              </div>
              
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="bg-white rounded-lg shadow-lg px-3 py-2 outline-none text-[#808080]"
              >
                <option value="all">All Zones</option>
                <option value="safe">Safe Zones</option>
                <option value="caution">Caution Zones</option>
                <option value="danger">Danger Zones</option>
              </select>

              <button
                onClick={() => setShowZones(!showZones)}
                className={`px-4 py-2 rounded-lg shadow-lg font-medium transition-colors ${
                  showZones ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'
                }`}
              >
                {showZones ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Map Container */}
            <div 
              ref={mapContainerRef} 
              className="w-full h-full"
              style={{ minHeight: '400px', zIndex: 1 }}
            />

            {/* Loading/Error overlay */}
            {(!isLoaded || loadError) && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-100 to-green-100 z-[2000]">
                <div className="text-center bg-white p-6 rounded-lg shadow-lg">
                  {loadError ? (
                    <>
                      <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
                      <p className="text-red-600 font-medium mb-2">Map Loading Issue</p>
                      <p className="text-gray-600 text-sm mb-4">Check your internet connection</p>
                      <button 
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Retry
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading interactive map...</p>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="w-80 bg-gray-50 border-l overflow-y-auto">
            {/* Status */}
            <div className="p-4 bg-white border-b">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    isMonitoring ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                  }`}></div>
                  <span className="font-medium text-[#808080]">
                    {isMonitoring ? 'GPS Monitoring Active' : 'GPS Inactive'}
                  </span>
                </div>
                
                <button
                  onClick={() => setIsMonitoring(!isMonitoring)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    isMonitoring 
                      ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {isMonitoring ? 'Stop' : 'Start'}
                </button>
              </div>
              
              {currentLocation && (
                <div className="text-xs text-gray-600">
                  📍 {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
                </div>
              )}
            </div>

            {/* Zone Statistics */}
            <div className="p-4 bg-white border-b">
              <h3 className="font-semibold mb-3 text-[#808080]">Live Statistics</h3>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center">
                  <div className="w-6 h-6 bg-green-500 rounded-full mx-auto mb-1"></div>
                  <div className="text-xs text-gray-600">Safe</div>
                  <div className="font-bold text-green-600">
                    {REAL_INDIA_TOURIST_ZONES.filter((z: any) => z.type === 'safe' && z.isActive).length}
                  </div>
                </div>
                <div className="text-center">
                  <div className="w-6 h-6 bg-yellow-500 rounded-full mx-auto mb-1"></div>
                  <div className="text-xs text-gray-600">Caution</div>
                  <div className="font-bold text-yellow-600">
                    {REAL_INDIA_TOURIST_ZONES.filter((z: any) => z.type === 'caution' && z.isActive).length}
                  </div>
                </div>
                <div className="text-center">
                  <div className="w-6 h-6 bg-red-500 rounded-full mx-auto mb-1"></div>
                  <div className="text-xs text-gray-600">Danger</div>
                  <div className="font-bold text-red-600">
                    {REAL_INDIA_TOURIST_ZONES.filter((z: any) => z.type === 'danger' && z.isActive).length}
                  </div>
                </div>
              </div>
            </div>

            {/* Nearby Zones */}
            <div className="p-4">
              <h3 className="font-semibold mb-3 text-[#808080]">Nearby Tourist Zones</h3>
              <div className="space-y-2">
                {nearbyZones.map((zone: any) => (
                  <div 
                    key={zone.id}
                    onClick={() => centerOnZone(zone)}
                    className="bg-white p-3 rounded-lg border hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{zone.name}</h4>
                        <p className="text-xs text-gray-600">{zone.monumentName}</p>
                        <p className="text-xs text-gray-500">{zone.city}, {zone.state}</p>
                        
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`inline-block w-2 h-2 rounded-full ${
                            zone.type === 'safe' ? 'bg-green-500' :
                            zone.type === 'caution' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}></span>
                          <span className="text-xs text-gray-600">
                            Safety: {zone.safetyLevel}/10
                          </span>
                        </div>
                      </div>
                      
                      <MapPin size={16} className="text-gray-400 mt-1" />
                    </div>
                  </div>
                ))}
                
                {nearbyZones.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    <MapPin size={48} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No zones found nearby</p>
                    <p className="text-xs">Enable GPS to find zones</p>
                  </div>
                )}
              </div>
            </div>

            {/* Selected Zone Details */}
            {selectedZone && (
              <div className="p-4 bg-blue-50 border-t text-[#808080]">
                <h3 className="font-semibold mb-2 text-[#808080]">Zone Details</h3>
                <div className="space-y-2 text-[#808080]">
                  <h4 className="font-medium text-[#808080]">{selectedZone.name}</h4>
                  <p className="text-sm text-gray-600">{selectedZone.description}</p>
                  
                  <div className="text-sm">
                    <strong>Emergency Contacts:</strong>
                    <div className="mt-1 space-y-1">
                      <div>Police: {selectedZone.emergencyContacts.police}</div>
                      <div>Medical: {selectedZone.emergencyContacts.medical}</div>
                      <div>Tourist Helpline: {selectedZone.emergencyContacts.tourist_helpline}</div>
                    </div>
                  </div>

                  {selectedZone.facilities && selectedZone.facilities.length > 0 && (
                    <div className="text-sm">
                      <strong>Facilities:</strong>
                      <div className="mt-1 text-gray-600">
                        {selectedZone.facilities.join(', ')}
                      </div>
                    </div>
                  )}

                  {selectedZone.riskFactors && selectedZone.riskFactors.length > 0 && (
                    <div className="text-sm">
                      <strong>Risk Factors:</strong>
                      <div className="mt-1 text-gray-600">
                        {selectedZone.riskFactors.join(', ')}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

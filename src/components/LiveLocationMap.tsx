'use client'

import { useState, useEffect, useRef } from 'react'
import { MapPin, Navigation, RotateCcw, Zap, Shield, AlertTriangle, Satellite } from 'lucide-react'

interface LocationData {
  latitude: number
  longitude: number
  accuracy: number
  timestamp: number
  address?: string
}

interface LiveLocationMapProps {
  monumentLocation?: { lat: number; lng: number }
  monumentName?: string
  showRoute?: boolean
}

export function LiveLocationMap({ monumentLocation, monumentName, showRoute = false }: LiveLocationMapProps) {
  const [userLocation, setUserLocation] = useState<LocationData | null>(null)
  const [locationError, setLocationError] = useState<string>('')
  const [isTracking, setIsTracking] = useState(false)
  const [address, setAddress] = useState<string>('')
  const [distance, setDistance] = useState<number>(0)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [locationStatus, setLocationStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied'>('idle')
  const mapRef = useRef<HTMLDivElement>(null)
  const watchIdRef = useRef<number | null>(null)
  const mapInstanceRef = useRef<any>(null)

  // Initialize Google Maps with better error handling
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (typeof window !== 'undefined' && (window as any).google && (window as any).google.maps) {
        setMapLoaded(true)
        return
      }

      if (typeof window !== 'undefined') {
        // Use OpenStreetMap as fallback - no API key required
        setMapLoaded(true)
      }
    }

    loadGoogleMaps()
  }, [])

  // FIXED: Proper error handling function
  const handleLocationError = (error: GeolocationPositionError) => {
    setIsTracking(false)
    setLocationStatus('denied')
    
    let errorMessage = 'Unknown location error occurred'
    
    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = 'Location access denied. Please allow location access and refresh the page.'
        console.error('Location error: Permission denied')
        break
      case error.POSITION_UNAVAILABLE:
        errorMessage = 'Location information is unavailable. Please check your GPS settings.'
        console.error('Location error: Position unavailable')
        break
      case error.TIMEOUT:
        errorMessage = 'Location request timed out. Trying alternative method...'
        console.error('Location error: Timeout expired')
        // Try alternative method on timeout
        setTimeout(() => tryAlternativeLocation(), 1000)
        break
      default:
        errorMessage = 'Unable to get location. Please try again or check your device settings.'
        console.error('Location error: Unknown error', error)
    }
    
    setLocationError(errorMessage)
  }

  // Enhanced location request with better timeout handling
  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser')
      return
    }

    setLocationError('')
    setIsTracking(true)
    setLocationStatus('requesting')

    // First, try to get cached position
    const cachedOptions: PositionOptions = {
      enableHighAccuracy: false,
      timeout: 5000,
      maximumAge: 300000 // 5 minutes
    }

    // Then try high accuracy
    const highAccuracyOptions: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 20000, // Increased timeout to 20 seconds
      maximumAge: 60000 // 1 minute
    }

    const tryGetLocation = (options: PositionOptions): Promise<GeolocationPosition> => {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve, 
          reject, 
          options
        )
      })
    }

    try {
      let position: GeolocationPosition

      try {
        // First try: Quick cached location
        position = await tryGetLocation(cachedOptions)
        console.log('Got cached location')
      } catch (error) {
        // Second try: High accuracy with longer timeout
        console.log('Trying high accuracy location...')
        position = await tryGetLocation(highAccuracyOptions)
        console.log('Got high accuracy location')
      }

      const locationData: LocationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp
      }
      
      setUserLocation(locationData)
      setLocationStatus('granted')
      setIsTracking(false)
      setLocationError('') // Clear any previous errors
      
      console.log('Location acquired:', locationData)
      
      // Get address and calculate distance
      reverseGeocode(locationData.latitude, locationData.longitude)
      
      if (monumentLocation) {
        calculateDistance(locationData, monumentLocation)
      }

    } catch (error: any) {
      console.error('Location acquisition failed:', error)
      handleLocationError(error)
    }
  }

  // Alternative location method for timeout cases
  const tryAlternativeLocation = async () => {
    console.log('Trying alternative location method...')
    try {
      // Use IP-based location as fallback
      const response = await fetch('https://ipapi.co/json/')
      const data = await response.json()
      
      if (data.latitude && data.longitude) {
        const locationData: LocationData = {
          latitude: parseFloat(data.latitude),
          longitude: parseFloat(data.longitude),
          accuracy: 10000, // IP location is less accurate
          timestamp: Date.now()
        }
        
        setUserLocation(locationData)
        setLocationStatus('granted')
        setLocationError('Using approximate location based on your internet connection.')
        
        console.log('Alternative location acquired:', locationData)
        
        reverseGeocode(locationData.latitude, locationData.longitude)
        
        if (monumentLocation) {
          calculateDistance(locationData, monumentLocation)
        }
      } else {
        throw new Error('Invalid response from IP location service')
      }
    } catch (error) {
      console.error('Alternative location failed:', error)
      setLocationError('Unable to determine your location. Please enable GPS or try again.')
    }
  }

  // Improved location tracking with better error handling
  const startLocationTracking = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported')
      return
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 15000, // Longer timeout for tracking
      maximumAge: 5000 // 5 seconds
    }

    console.log('Starting location tracking...')

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const locationData: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        }
        
        setUserLocation(locationData)
        setLocationError('') // Clear any previous errors
        
        console.log('Location updated:', locationData)
        
        reverseGeocode(locationData.latitude, locationData.longitude)
        
        if (monumentLocation) {
          calculateDistance(locationData, monumentLocation)
        }
      },
      (error) => {
        console.error('Location tracking error:', error)
        if (error.code === error.TIMEOUT) {
          setLocationError('Location tracking timed out. GPS signal may be weak.')
        } else {
          handleLocationError(error)
        }
      },
      options
    )
  }

  // Stop location tracking
  const stopLocationTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
      console.log('Location tracking stopped')
    }
  }

  // Enhanced reverse geocoding with better error handling
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'WayORA Tourist Safety App'
          }
        }
      )
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.display_name) {
        setAddress(data.display_name)
        console.log('Address resolved:', data.display_name)
      } else {
        setAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`)
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error)
      setAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`)
    }
  }

  // Calculate distance between user and monument
  const calculateDistance = (userLoc: LocationData, monumentLoc: { lat: number; lng: number }) => {
    const R = 6371 // Earth's radius in km
    const dLat = (monumentLoc.lat - userLoc.latitude) * Math.PI / 180
    const dLon = (monumentLoc.lng - userLoc.longitude) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(userLoc.latitude * Math.PI / 180) * Math.cos(monumentLoc.lat * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    const distance = R * c
    setDistance(distance)
    console.log('Distance calculated:', distance, 'km')
  }

  // Auto-get location on component mount
  useEffect(() => {
    // Delay initial location request slightly to allow UI to render
    const timer = setTimeout(() => {
      console.log('Initializing location request...')
      getCurrentLocation()
    }, 500)
    
    return () => {
      clearTimeout(timer)
      stopLocationTracking()
    }
  }, [])

  const formatAccuracy = (accuracy: number) => {
    if (accuracy < 1000) return `±${Math.round(accuracy)}m`
    return `±${(accuracy / 1000).toFixed(1)}km`
  }

  const formatDistance = (dist: number) => {
    if (dist < 1) return `${Math.round(dist * 1000)}m away`
    return `${dist.toFixed(1)}km away`
  }

  return (
    <>
      <div className="live-location-container">
        {/* Header */}
        <div className="location-header">
          <div className="header-left">
            <div className="location-icon">
              {locationStatus === 'requesting' ? (
                <Satellite className="pulse" size={20} />
              ) : (
                '📍'
              )}
            </div>
            <div>
              <h3>Live Location</h3>
              <p>
                {locationStatus === 'requesting' && 'Searching for GPS signal...'}
                {locationStatus === 'granted' && 'Real-time GPS tracking'}
                {locationStatus === 'denied' && 'Location access needed'}
                {locationStatus === 'idle' && 'Real-time GPS tracking'}
              </p>
            </div>
          </div>
          
          <div className="header-actions">
            <button 
              onClick={getCurrentLocation}
              disabled={isTracking}
              className={`location-btn ${isTracking ? 'loading' : ''}`}
            >
              {isTracking ? <RotateCcw className="spin" size={16} /> : <Navigation size={16} />}
              {isTracking ? 'Finding...' : 'Update'}
            </button>
          </div>
        </div>

        {/* Location Info */}
        {userLocation && (
          <div className="location-info">
            <div className="location-details">
              <div className="location-item">
                <MapPin size={16} />
                <div>
                  <span className="label">Current Location</span>
                  <p>{address || 'Loading address...'}</p>
                </div>
              </div>
              
              <div className="location-stats">
                <div className="stat">
                  <Zap size={14} />
                  <span>Accuracy: {formatAccuracy(userLocation.accuracy)}</span>
                </div>
                
                {distance > 0 && (
                  <div className="stat">
                    <Shield size={14} />
                    <span>{formatDistance(distance)}</span>
                  </div>
                )}
                
                <div className="stat">
                  <Satellite size={14} />
                  <span>
                    {userLocation.accuracy < 100 ? 'High precision' : 
                     userLocation.accuracy < 500 ? 'Good precision' : 
                     'Basic precision'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Message with Enhanced UI */}
        {locationError && (
          <div className="location-error">
            <AlertTriangle size={16} />
            <div className="error-content">
              <span>{locationError}</span>
              <div className="error-actions">
                <button onClick={getCurrentLocation} className="retry-btn">
                  Try Again
                </button>
                <button onClick={tryAlternativeLocation} className="alternative-btn">
                  Use Approximate Location
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Map Placeholder */}
        <div className="map-container">
          {userLocation ? (
            <div className="map-placeholder">
              <div className="map-info">
                <Satellite size={32} className="map-icon" />
                <h4>Location Found!</h4>
                <p>Latitude: {userLocation.latitude.toFixed(6)}</p>
                <p>Longitude: {userLocation.longitude.toFixed(6)}</p>
                {monumentLocation && (
                  <button 
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        window.open(`https://www.google.com/maps/dir/${userLocation.latitude},${userLocation.longitude}/${monumentLocation.lat},${monumentLocation.lng}`, '_blank')
                      }
                    }}
                    className="directions-btn"
                  >
                    <Navigation size={16} />
                    Get Directions
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="map-loading">
              <div className="loading-spinner"></div>
              <p>
                {isTracking ? 'Getting your location...' : 
                 locationError ? 'Location unavailable' : 
                 'Tap Update to get your location'}
              </p>
            </div>
          )}
        </div>

        {/* Enhanced Controls */}
        <div className="map-controls">
          <button 
            onClick={startLocationTracking}
            className="control-btn primary"
            disabled={!userLocation}
          >
            <Satellite size={16} />
            Start Tracking
          </button>
          <button 
            onClick={stopLocationTracking}
            className="control-btn secondary"
          >
            <RotateCcw size={16} />
            Stop Tracking
          </button>
          {monumentLocation && userLocation && (
            <button 
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.open(`https://www.google.com/maps/dir/${userLocation.latitude},${userLocation.longitude}/${monumentLocation.lat},${monumentLocation.lng}`, '_blank')
                }
              }}
              className="control-btn accent"
            >
              <Navigation size={16} />
              Get Directions
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        .live-location-container {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          border: 1px solid #e5e7eb;
        }

        .location-header {
          padding: 16px;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .location-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
          color: white;
        }

        .pulse {
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }

        .location-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
        }

        .location-header p {
          margin: 0;
          font-size: 12px;
          color: #6b7280;
        }

        .location-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #3b82f6;
          color: white;
          border: none;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .location-btn:hover:not(:disabled) {
          background: #2563eb;
        }

        .location-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .location-btn .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .location-info {
          padding: 16px;
          border-bottom: 1px solid #e5e7eb;
        }

        .location-item {
          display: flex;
          gap: 12px;
          margin-bottom: 12px;
        }

        .location-item .label {
          font-size: 12px;
          font-weight: 600;
          color: #3b82f6;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .location-item p {
          margin: 4px 0 0 0;
          color: #374151;
          font-size: 14px;
          line-height: 1.4;
        }

        .location-stats {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        .stat {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #6b7280;
          font-size: 12px;
        }

        .location-error {
          padding: 12px 16px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-left: 4px solid #ef4444;
          display: flex;
          align-items: flex-start;
          gap: 8px;
          color: #dc2626;
          font-size: 14px;
        }

        .error-content {
          flex: 1;
        }

        .error-actions {
          display: flex;
          gap: 8px;
          margin-top: 8px;
        }

        .retry-btn, .alternative-btn {
          background: #dc2626;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .alternative-btn {
          background: #6b7280;
        }

        .retry-btn:hover {
          background: #b91c1c;
        }

        .alternative-btn:hover {
          background: #4b5563;
        }

        .map-container {
          height: 300px;
          position: relative;
        }

        .map-placeholder {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .map-info {
          text-align: center;
          color: #0f172a;
        }

        .map-icon {
          color: #3b82f6;
          margin-bottom: 16px;
        }

        .map-info h4 {
          margin: 0 0 12px 0;
          font-size: 18px;
          font-weight: 600;
        }

        .map-info p {
          margin: 4px 0;
          font-size: 14px;
          color: #64748b;
        }

        .directions-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #3b82f6;
          color: white;
          border: none;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          margin-top: 16px;
          transition: all 0.2s;
        }

        .directions-btn:hover {
          background: #2563eb;
          transform: translateY(-1px);
        }

        .map-loading {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: #f9fafb;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
        }

        .loading-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #e5e7eb;
          border-top: 3px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .map-controls {
          padding: 16px;
          background: #f9fafb;
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .control-btn {
          flex: 1;
          padding: 10px 16px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          min-width: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .control-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .control-btn.primary {
          background: #10b981;
          color: white;
        }

        .control-btn.primary:hover:not(:disabled) {
          background: #059669;
        }

        .control-btn.secondary {
          background: #6b7280;
          color: white;
        }

        .control-btn.secondary:hover {
          background: #4b5563;
        }

        .control-btn.accent {
          background: #f59e0b;
          color: white;
        }

        .control-btn.accent:hover {
          background: #d97706;
        }
      `}</style>
    </>
  )
}

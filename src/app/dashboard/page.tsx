'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { SafetyScore } from '@/components/SafetyScore'
import { PanicButton } from '@/components/PanicButton'
import { BlockchainBadge } from '@/components/BlockchainBadge'
import { LanguageSelector } from '@/components/LanguageSelector'
import { Shield, MapPin, Bell, User, LogOut, AlertTriangle } from 'lucide-react'

// ADD: Import the new geofencing modal
import AllIndiaGeofencingModal from '@/components/AllIndiaGeofencingModal'
import { BrandLogo } from '@/components/common/BrandLogo'

export default function Dashboard() {
  const { t } = useTranslation()
  const router = useRouter()
  const [touristData, setTouristData] = useState<any>(null)
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null)
  const [geoFenceAlert, setGeoFenceAlert] = useState(false)

  // ADD: New states for All India geofencing
  const [showGeofencing, setShowGeofencing] = useState(false)
  const [useAllIndiaMode, setUseAllIndiaMode] = useState(false)

  useEffect(() => {
    // Check authentication
    const isAuthenticated = localStorage.getItem('tourist_authenticated')
    if (!isAuthenticated) {
      router.push('/digital-id')
      return
    }

    // Load tourist data
    const storedData = localStorage.getItem('tourist_digital_id')
    if (storedData) {
      setTouristData(JSON.parse(storedData))
    }

    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          setCurrentLocation(location)
          
          // Check geo-fence (simulate high-risk area check)
          checkGeoFence(location)
        },
        (error) => {
          console.error('Location access denied:', error)
        }
      )
    }
  }, [router])

  const checkGeoFence = (location: {lat: number, lng: number}) => {
    // Simulate geo-fence check - you can replace with actual geo-fencing logic
    const highRiskZones = [
      { lat: 28.7041, lng: 77.1025, radius: 1000 }, // Example: Delhi area
    ]
    
    // Simple distance check (for demo)
    const isInHighRisk = highRiskZones.some(zone => {
      const distance = getDistance(location, zone)
      return distance < zone.radius
    })
    
    if (isInHighRisk && !geoFenceAlert) {
      setGeoFenceAlert(true)
      alert(t('enterHighRisk'))
    }
  }

  const getDistance = (pos1: {lat: number, lng: number}, pos2: {lat: number, lng: number}) => {
    // Haversine formula for distance calculation
    const R = 6371e3 // metres
    const φ1 = pos1.lat * Math.PI/180
    const φ2 = pos2.lat * Math.PI/180
    const Δφ = (pos2.lat-pos1.lat) * Math.PI/180
    const Δλ = (pos2.lng-pos1.lng) * Math.PI/180

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

    return R * c // in metres
  }

  const handleLogout = () => {
    localStorage.removeItem('tourist_authenticated')
    localStorage.removeItem('tourist_digital_id')
    router.push('/')
  }

  if (!touristData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm sticky top-0 z-40 h-20 md:h-24">
        <div className="max-w-6xl mx-auto px-6 h-full">
          <div className="relative flex items-center justify-between h-full">
            <div className="flex items-center gap-3 z-10">
              {/* ADD: All India Mode Toggle */}
              <button
                onClick={() => setUseAllIndiaMode(!useAllIndiaMode)}
                className={`px-3.5 py-2 rounded-full text-xs font-bold transition shadow-sm ${
                  useAllIndiaMode 
                    ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {useAllIndiaMode ? '🇮🇳 All India' : '📍 Local'} Mode
              </button>
            </div>

            {/* Centered Expanded Logo */}
            <div 
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer flex items-center justify-center w-72 sm:w-96 md:w-[450px] h-full py-1.5 z-0"
              onClick={() => router.push('/')}
            >
              <img
                src="/logo.png"
                alt="WayORA Logo"
                width={600}
                height={160}
                className="w-full h-full object-contain max-h-16 md:max-h-20 select-none bg-transparent transition-transform duration-200 hover:scale-[1.02]"
              />
            </div>
            
            <div className="flex items-center gap-4 z-10">
              <LanguageSelector />
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 transition text-sm font-semibold border border-transparent hover:border-red-200"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Geo-fence Alert */}
      {geoFenceAlert && (
        <div className="bg-red-100 border-l-4 border-red-500 p-4">
          <div className="flex items-center">
            <AlertTriangle className="text-red-500 mr-3" size={20} />
            <p className="text-red-700 font-semibold">{t('enterHighRisk')}</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Tourist Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <User className="text-blue-600" size={24} />
                <h2 className="text-xl font-bold">Tourist Profile</h2>
              </div>
              
              <div className="space-y-3">
                <div>
                  <span className="font-semibold">Name:</span> {touristData.name}
                </div>
                <div>
                  <span className="font-semibold">ID:</span> 
                  <span className="font-mono text-xs ml-2">{touristData.id}</span>
                </div>
                <div>
                  <span className="font-semibold">Valid Until:</span> {new Date(touristData.validUntil).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-semibold">Status:</span> 
                  <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Active</span>
                </div>
              </div>
              
              <div className="mt-4">
                <BlockchainBadge />
              </div>
            </div>

            {/* Current Location */}
            {currentLocation && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <MapPin className="text-green-600" size={24} />
                  <h2 className="text-xl font-bold">Current Location</h2>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <span className="font-semibold">Latitude:</span> {currentLocation.lat.toFixed(6)}
                  </div>
                  <div>
                    <span className="font-semibold">Longitude:</span> {currentLocation.lng.toFixed(6)}
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-green-600 font-semibold">Live Tracking Active</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Safety Features */}
          <div className="lg:col-span-2">
            <SafetyScore />
            <PanicButton touristId={touristData.id} />
            
            {/* Additional Features - MODIFIED: Changed to 3 columns */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <Bell className="text-blue-500" size={20} />
                  Smart Alerts
                </h3>
                <p className="text-gray-600 text-sm mb-3">
                  Get notified when entering high-risk areas or when anomalous behavior is detected.
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-600">Active</span>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <Shield className="text-purple-500" size={20} />
                  AI Protection
                </h3>
                <p className="text-gray-600 text-sm mb-3">
                  Advanced AI monitors your travel patterns for unusual activity.
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-600">Monitoring</span>
                </div>
              </div>

              {/* NEW: Add All India Geofencing tile */}
              <div 
                className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow"
                onClick={() => setShowGeofencing(true)}
              >
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <MapPin className="text-green-500" size={20} />
                  {useAllIndiaMode ? '🇮🇳 Monument Zones' : '📍 Local Zones'}
                </h3>
                <p className="text-gray-600 text-sm mb-3">
                  {useAllIndiaMode 
                    ? 'Monitor 37+ cities across India with 100+ monument zones'
                    : 'Track local safety zones and geofencing alerts'
                  }
                </p>
                <button className="text-sm text-blue-600 font-semibold hover:text-blue-700">
                  Click to explore →
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ADD: All India Geofencing Modal */}
      {showGeofencing && (
        <AllIndiaGeofencingModal 
          isOpen={showGeofencing} 
          onClose={() => setShowGeofencing(false)} 
        />
      )}
    </div>
  )
}

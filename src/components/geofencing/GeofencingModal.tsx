'use client'

import { useState, useEffect } from 'react'
import { X, Shield, MapPin, AlertTriangle, Navigation, Eye, EyeOff } from 'lucide-react'

interface GeofencingModalProps {
  isOpen: boolean
  onClose: () => void
}

export function GeofencingModal({ isOpen, onClose }: GeofencingModalProps) {
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null)
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [showZones, setShowZones] = useState(true)
  const [nearbyZones, setNearbyZones] = useState([
    { id: 1, name: 'Taj Mahal Safe Zone', type: 'safe', distance: '0.2 km' },
    { id: 2, name: 'Agra Fort Area', type: 'caution', distance: '1.5 km' },
    { id: 3, name: 'Tourist Parking', type: 'safe', distance: '0.3 km' }
  ])

  useEffect(() => {
    if (isOpen && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => console.log('Location access denied')
      )
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield size={28} />
              <div>
                <h2 className="text-2xl font-bold">WayORA Geofencing</h2>
                <p className="text-green-100">Real-time safety zone monitoring</p>
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

        <div className="p-6">
          {/* Status Bar */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`flex items-center gap-2 px-3 py-2 rounded-full ${
                  isMonitoring ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    isMonitoring ? 'bg-green-500' : 'bg-red-500'
                  } animate-pulse`}></div>
                  <span className="text-sm font-medium">
                    {isMonitoring ? 'GPS Active' : 'GPS Inactive'}
                  </span>
                </div>
                
                {currentLocation && (
                  <div className="text-sm text-gray-600">
                    📍 {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
                  </div>
                )}
              </div>
              
              <button
                onClick={() => setIsMonitoring(!isMonitoring)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isMonitoring 
                    ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Interactive Map Area */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Live Safety Map</h3>
                <button
                  onClick={() => setShowZones(!showZones)}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  {showZones ? <EyeOff size={16} /> : <Eye size={16} />}
                  {showZones ? 'Hide Zones' : 'Show Zones'}
                </button>
              </div>
              
              {/* Mock Map Display */}
              <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center relative overflow-hidden">
                <div className="text-gray-500 text-center">
                  <MapPin size={48} className="mx-auto mb-2" />
                  <p className="font-medium">Interactive Safety Map</p>
                  <p className="text-sm">GPS tracking and zone visualization</p>
                </div>
                
                {/* Mock location dot */}
                {currentLocation && (
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse border-2 border-white shadow-lg"></div>
                  </div>
                )}
                
                {/* Mock zone indicators */}
                {showZones && (
                  <>
                    <div className="absolute top-8 left-8 w-12 h-12 bg-green-400/30 rounded-full border-2 border-green-500"></div>
                    <div className="absolute bottom-12 right-12 w-16 h-16 bg-yellow-400/30 rounded-full border-2 border-yellow-500"></div>
                  </>
                )}
              </div>
            </div>

            {/* Zone Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Nearby Safety Zones</h3>
              
              <div className="space-y-3">
                {nearbyZones.map((zone) => (
                  <div key={zone.id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          zone.type === 'safe' ? 'bg-green-400' : 
                          zone.type === 'caution' ? 'bg-yellow-400' : 'bg-red-400'
                        }`}></div>
                        <div>
                          <h4 className="font-medium text-gray-900">{zone.name}</h4>
                          <p className="text-sm text-gray-500">Distance: {zone.distance}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          zone.type === 'safe' ? 'bg-green-100 text-green-800' :
                          zone.type === 'caution' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {zone.type === 'safe' ? '✅ Safe' : 
                           zone.type === 'caution' ? '⚠️ Caution' : '🚨 Alert'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Emergency Contacts */}
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <h4 className="font-semibold text-red-900 mb-2">Emergency Contacts</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Police:</span> 100</p>
                  <p><span className="font-medium">Medical:</span> 108</p>
                  <p><span className="font-medium">Tourist Helpline:</span> 1363</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3">
                <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-lg font-medium transition-colors">
                  🚨 Emergency Alert
                </button>
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg font-medium transition-colors">
                  📍 Share Location
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

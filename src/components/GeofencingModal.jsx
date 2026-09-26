import React, { useState, useEffect, useRef } from 'react';

const GeofencingModal = ({ isOpen, onClose }) => {
  const [map, setMap] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [currentZone, setCurrentZone] = useState(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  // Real Delhi tourist zones with accurate coordinates
  const zones = [
    {
      id: 1,
      name: 'Red Fort Complex',
      type: 'safe',
      lat: 28.6562,
      lng: 77.2410,
      radius: 600,
      description: 'UNESCO World Heritage Site with high security'
    },
    {
      id: 2,
      name: 'Connaught Place',
      type: 'safe',
      lat: 28.6315,
      lng: 77.2167,
      radius: 800,
      description: 'Central business district with police presence'
    },
    {
      id: 3,
      name: 'India Gate',
      type: 'safe',
      lat: 28.6129,
      lng: 77.2295,
      radius: 700,
      description: 'National monument with 24/7 security'
    },
    {
      id: 4,
      name: 'Chandni Chowk',
      type: 'caution',
      lat: 28.6506,
      lng: 77.2334,
      radius: 400,
      description: 'Crowded market area - watch for pickpockets'
    },
    {
      id: 5,
      name: 'Old Delhi Railway Station',
      type: 'caution',
      lat: 28.6414,
      lng: 77.2193,
      radius: 350,
      description: 'Busy transport hub - stay alert'
    },
    {
      id: 6,
      name: 'Lotus Temple',
      type: 'safe',
      lat: 28.5535,
      lng: 77.2588,
      radius: 500,
      description: 'Peaceful religious site with good security'
    },
    {
      id: 7,
      name: 'Humayun Tomb',
      type: 'safe',
      lat: 28.5933,
      lng: 77.2507,
      radius: 450,
      description: 'Protected heritage monument'
    },
    {
      id: 8,
      name: 'Karol Bagh Market',
      type: 'caution',
      lat: 28.6519,
      lng: 77.1909,
      radius: 300,
      description: 'Shopping area - be cautious with valuables'
    }
  ];

  useEffect(() => {
    if (isOpen) {
      loadLeafletMap();
      addAlert('🗺️ Loading real-time Delhi map...', 'info');
    }
    return () => {
      if (map) {
        map.remove();
      }
    };
  }, [isOpen]);

  const loadLeafletMap = () => {
    // Load Leaflet CSS and JS
    if (!window.L) {
      // Add Leaflet CSS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      // Add Leaflet JS
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = initializeMap;
      document.head.appendChild(script);
    } else {
      initializeMap();
    }
  };

  const initializeMap = () => {
    if (!mapRef.current || !window.L) return;

    // Initialize map centered on Delhi
    const mapInstance = window.L.map(mapRef.current).setView([28.6139, 77.2090], 11);

    // Add OpenStreetMap raster tiles (styled with dark mode CSS filter)
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(mapInstance);

    // Add zones to map
    zones.forEach(zone => {
      const color = zone.type === 'safe' ? '#4CAF50' : 
                   zone.type === 'caution' ? '#FF9800' : '#F44336';

      // Add circle for zone
      const circle = window.L.circle([zone.lat, zone.lng], {
        color: color,
        fillColor: color,
        fillOpacity: 0.2,
        radius: zone.radius
      }).addTo(mapInstance);

      // Add marker for zone center
      const marker = window.L.marker([zone.lat, zone.lng], {
        icon: window.L.divIcon({
          className: 'custom-div-icon',
          html: `<div style="
            background-color: ${color};
            width: 25px;
            height: 25px;
            border-radius: 50%;
            border: 3px solid white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            font-weight: bold;
            color: white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          ">${zone.type === 'safe' ? '🛡️' : '⚠️'}</div>`,
          iconSize: [25, 25],
          iconAnchor: [12, 12]
        })
      }).addTo(mapInstance);

      // Add popup with zone info
      marker.bindPopup(`
        <div style="font-family: system-ui; padding: 5px;">
          <h4 style="margin: 0 0 8px 0; color: #333;">${zone.name}</h4>
          <p style="margin: 0 0 8px 0; font-size: 13px; color: #666;">
            ${zone.description}
          </p>
          <div style="
            background: ${color};
            color: white;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: bold;
            display: inline-block;
          ">
            ${zone.type.toUpperCase()} ZONE
          </div>
        </div>
      `);

      markersRef.current.push({ marker, circle, zone });
    });

    setMap(mapInstance);
    addAlert('✅ Real Delhi map loaded with live zones', 'success');
  };

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      addAlert('❌ Geolocation not supported by browser', 'error');
      return;
    }

    addAlert('📡 Getting your real GPS location...', 'info');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        };

        setUserLocation(location);

        if (map) {
          // Add user location marker
          const userMarker = window.L.marker([location.lat, location.lng], {
            icon: window.L.divIcon({
              className: 'user-location-icon',
              html: `<div style="
                background: linear-gradient(45deg, #2196F3, #64B5F6);
                width: 20px;
                height: 20px;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 2px 10px rgba(33,150,243,0.5);
                animation: pulse 2s infinite;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 12px;
                font-weight: bold;
              ">📍</div>`,
              iconSize: [20, 20],
              iconAnchor: [10, 10]
            })
          }).addTo(map);

          userMarker.bindPopup(`
            <div style="font-family: system-ui; text-align: center;">
              <h4 style="margin: 0 0 5px 0;">📍 Your Location</h4>
              <p style="margin: 0; font-size: 12px;">
                Accuracy: ±${Math.round(location.accuracy)}m
              </p>
            </div>
          `);

          // Center map on user location
          map.setView([location.lat, location.lng], 13);

          markersRef.current.push({ marker: userMarker, type: 'user' });
        }

        addAlert(
          `✅ Location found! Accuracy: ±${Math.round(location.accuracy)}m`, 
          'success'
        );

        checkGeofenceZones(location);
      },
      (error) => {
        let errorMsg = 'Unknown location error';
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMsg = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMsg = 'Location request timed out';
            break;
        }
        addAlert(`❌ ${errorMsg}`, 'error');
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000
      }
    );
  };

  const checkGeofenceZones = (location) => {
    let insideZones = [];

    zones.forEach(zone => {
      const distance = calculateDistance(
        location.lat, location.lng, 
        zone.lat, zone.lng
      );

      if (distance <= zone.radius) {
        insideZones.push(zone);
      }
    });

    if (insideZones.length > 0) {
      insideZones.forEach(zone => {
        if (zone.type === 'safe') {
          addAlert(`✅ Inside SAFE ZONE: ${zone.name}`, 'success');
        } else {
          addAlert(`⚠️ CAUTION ZONE: ${zone.name} - ${zone.description}`, 'caution');
        }
      });
      setCurrentZone(insideZones[0]);
    } else {
      addAlert('📍 You are in an unmonitored area', 'info');
      setCurrentZone(null);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in meters
  };

  const addAlert = (message, type) => {
    const newAlert = {
      id: `alert_${Date.now()}_${Math.random()}`, // FIXED: Unique key
      message,
      type,
      time: new Date().toLocaleTimeString()
    };
    setAlerts(prev => [newAlert, ...prev.slice(0, 9)]);
  };

  const toggleTracking = () => {
    if (!isTracking) {
      setIsTracking(true);
      getUserLocation();
      addAlert('▶️ Real-time geofencing monitoring started', 'info');

      // Start continuous tracking
      const trackingInterval = setInterval(() => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const location = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                accuracy: position.coords.accuracy
              };
              setUserLocation(location);
              checkGeofenceZones(location);
            },
            null,
            { enableHighAccuracy: true }
          );
        }
      }, 15000); // Check every 15 seconds

      window.geofencingTracker = trackingInterval;
    } else {
      setIsTracking(false);
      addAlert('⏸️ Geofencing monitoring stopped', 'info');

      if (window.geofencingTracker) {
        clearInterval(window.geofencingTracker);
        delete window.geofencingTracker;
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        boxSizing: 'border-box'
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '24px',
        width: '95%',
        maxWidth: '1400px',
        height: '90%',
        maxHeight: '900px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 25px 50px rgba(0,0,0,0.4)'
      }}>

        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '20px 30px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ 
              margin: '0 0 8px 0', 
              fontSize: '24px', 
              fontWeight: 'bold'
            }}>
              🗺️ WayORA Live Geofencing
            </h2>
            <p style={{ margin: 0, fontSize: '16px', opacity: 0.9 }}>
              Real-time Delhi map with live GPS tracking • OpenStreetMap
            </p>
          </div>

          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <button
              onClick={toggleTracking}
              style={{
                background: isTracking ? '#ff4757' : '#2ed573',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '25px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
              }}
            >
              {isTracking ? '🛑 Stop Tracking' : '▶️ Start Tracking'}
            </button>

            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: '2px solid rgba(255,255,255,0.3)',
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                fontSize: '24px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ×
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

          {/* Real Map Area */}
          <div style={{ flex: '1', position: 'relative' }}>
            <div 
              ref={mapRef} 
              style={{ 
                width: '100%', 
                height: '100%',
                minHeight: '400px'
              }}
            />

            {/* Live Status Overlay */}
            <div style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              background: 'rgba(255,255,255,0.95)',
              padding: '15px 20px',
              borderRadius: '15px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
              minWidth: '280px'
            }}>
              <div style={{ 
                fontSize: '14px', 
                fontWeight: 'bold', 
                color: isTracking ? '#2ed573' : '#666',
                marginBottom: '8px'
              }}>
                {isTracking ? '🟢 LIVE TRACKING' : '⚫ READY TO TRACK'}
              </div>

              {currentZone && (
                <div style={{
                  fontSize: '13px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: currentZone.type === 'safe' ? '#e8f5e8' : '#fff3e0',
                  border: `1px solid ${currentZone.type === 'safe' ? '#4CAF50' : '#FF9800'}`,
                  marginBottom: '8px'
                }}>
                  <strong>📍 Current Zone:</strong><br/>
                  {currentZone.name} ({currentZone.type.toUpperCase()})
                </div>
              )}

              <div style={{ fontSize: '12px', color: '#888' }}>
                {userLocation 
                  ? `GPS: ${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`
                  : 'GPS location not detected'
                }
              </div>

              {isTracking && (
                <div style={{
                  fontSize: '11px',
                  color: '#2ed573',
                  marginTop: '5px',
                  fontWeight: 'bold'
                }}>
                  🔄 Auto-updating every 15 seconds
                </div>
              )}
            </div>
          </div>

          {/* Info Panel */}
          <div style={{
            width: '350px',
            backgroundColor: '#f8f9fa',
            borderLeft: '1px solid #e0e0e0',
            display: 'flex',
            flexDirection: 'column'
          }}>

            {/* Zone Statistics */}
            <div style={{ padding: '20px', borderBottom: '1px solid #e0e0e0' }}>
              <h3 style={{ margin: '0 0 15px 0', color: '#333', fontSize: '16px' }}>
                🗺️ Live Zone Data
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #e8f5e8, #f0fff0)',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #4CAF50',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#2e7d32' }}>
                    {zones.filter(z => z.type === 'safe').length}
                  </div>
                  <div style={{ fontSize: '11px', color: '#388e3c' }}>Safe Zones</div>
                </div>
                <div style={{
                  background: 'linear-gradient(135deg, #fff3e0, #fef7e0)',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #FF9800',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#f57c00' }}>
                    {zones.filter(z => z.type === 'caution').length}
                  </div>
                  <div style={{ fontSize: '11px', color: '#ef6c00' }}>Caution Zones</div>
                </div>
              </div>
            </div>

            {/* Live Alerts - FIXED KEYS */}
            <div style={{ flex: 1, padding: '20px', overflow: 'hidden' }}>
              <h3 style={{ margin: '0 0 15px 0', color: '#333', fontSize: '16px' }}>
                🚨 Live Feed
              </h3>
              <div style={{ 
                height: '300px', 
                overflowY: 'auto',
                paddingRight: '5px'
              }}>
                {alerts.length === 0 && (
                  <div style={{
                    textAlign: 'center',
                    color: '#999',
                    fontSize: '14px',
                    padding: '40px 20px',
                    lineHeight: '1.6'
                  }}>
                    <div style={{ fontSize: '48px', marginBottom: '15px' }}>🗺️</div>
                    <div>Real map loaded!</div>
                    <div>Click "Start Tracking" for live GPS monitoring.</div>
                  </div>
                )}

                {alerts.map(alert => (
                  <div
                    key={alert.id} // FIXED: Now using unique IDs
                    style={{
                      background: alert.type === 'success' ? '#e8f5e8' :
                                 alert.type === 'error' ? '#ffebee' :
                                 alert.type === 'caution' ? '#fff3e0' :
                                 '#e3f2fd',
                      border: `1px solid ${
                        alert.type === 'success' ? '#4CAF50' :
                        alert.type === 'error' ? '#f44336' :
                        alert.type === 'caution' ? '#ff9800' :
                        '#2196F3'
                      }40`,
                      padding: '10px',
                      marginBottom: '8px',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  >
                    <div style={{ fontWeight: '500', marginBottom: '3px' }}>
                      {alert.message}
                    </div>
                    <div style={{ fontSize: '10px', color: '#666' }}>
                      {alert.time}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Map Attribution */}
            <div style={{ 
              padding: '15px 20px', 
              borderTop: '1px solid #e0e0e0',
              backgroundColor: '#fff',
              fontSize: '11px',
              color: '#666',
              textAlign: 'center'
            }}>
              <div>🗺️ Powered by OpenStreetMap</div>
              <div>Real map data • 100% Free • No API limits</div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default GeofencingModal;
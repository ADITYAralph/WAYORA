// ALL INDIA MONUMENT GEOFENCING MODAL
// File: src/components/AllIndiaGeofencingModal.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { allIndiaZoneService } from '@/services/AllIndiaZoneService';

const AllIndiaGeofencingModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [map, setMap] = useState(null);
  const [zones, setZones] = useState([]);
  const [selectedCity, setSelectedCity] = useState('Delhi');
  const [availableCities, setAvailableCities] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('All Regions');
  const [userLocation, setUserLocation] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [currentZones, setCurrentZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [zoneStats, setZoneStats] = useState({});
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const unsubscribeRef = useRef(null);

  // All India city centers and their coordinates
  const cityCenters = {
    // North India
    'Delhi': { lat: 28.6139, lng: 77.2090, zoom: 11, region: 'North India', icon: '🏛️' },
    'Agra': { lat: 27.1751, lng: 78.0421, zoom: 12, region: 'North India', icon: '🕌' },
    'Jaipur': { lat: 26.9124, lng: 75.7873, zoom: 11, region: 'North India', icon: '🏰' },
    'Jodhpur': { lat: 26.2389, lng: 73.0243, zoom: 12, region: 'North India', icon: '💙' },
    'Udaipur': { lat: 24.5854, lng: 73.7125, zoom: 12, region: 'North India', icon: '🏞️' },
    'Jaisalmer': { lat: 26.9157, lng: 70.9083, zoom: 12, region: 'North India', icon: '🏜️' },
    'Amritsar': { lat: 31.6340, lng: 74.8723, zoom: 12, region: 'North India', icon: '🏛️' },
    'Varanasi': { lat: 25.3176, lng: 82.9739, zoom: 12, region: 'North India', icon: '🕉️' },
    'Khajuraho': { lat: 24.8318, lng: 79.9199, zoom: 12, region: 'North India', icon: '🏛️' },

    // West India
    'Mumbai': { lat: 19.0760, lng: 72.8777, zoom: 11, region: 'West India', icon: '🌆' },
    'Aurangabad': { lat: 19.8762, lng: 75.3433, zoom: 11, region: 'West India', icon: '🏛️' },
    'Ahmedabad': { lat: 23.0225, lng: 72.5714, zoom: 11, region: 'West India', icon: '🏛️' },
    'Dwarka': { lat: 22.2394, lng: 68.9678, zoom: 12, region: 'West India', icon: '🏛️' },
    'Somnath': { lat: 20.8880, lng: 70.4017, zoom: 12, region: 'West India', icon: '🏛️' },
    'Goa': { lat: 15.2993, lng: 74.1240, zoom: 11, region: 'West India', icon: '⛪' },

    // South India
    'Hampi': { lat: 15.3350, lng: 76.4600, zoom: 12, region: 'South India', icon: '🏛️' },
    'Mysore': { lat: 12.2958, lng: 76.6394, zoom: 12, region: 'South India', icon: '🏰' },
    'Chennai': { lat: 13.0827, lng: 80.2707, zoom: 11, region: 'South India', icon: '🏛️' },
    'Mahabalipuram': { lat: 12.6162, lng: 80.1999, zoom: 12, region: 'South India', icon: '🏛️' },
    'Thanjavur': { lat: 10.7905, lng: 79.1378, zoom: 12, region: 'South India', icon: '🏛️' },
    'Madurai': { lat: 9.9252, lng: 78.1198, zoom: 12, region: 'South India', icon: '🏛️' },
    'Kochi': { lat: 9.9312, lng: 76.2673, zoom: 12, region: 'South India', icon: '🏛️' },
    'Hyderabad': { lat: 17.3850, lng: 78.4867, zoom: 11, region: 'South India', icon: '🏛️' },

    // East India
    'Kolkata': { lat: 22.5726, lng: 88.3639, zoom: 11, region: 'East India', icon: '🏛️' },
    'Bhubaneswar': { lat: 20.2961, lng: 85.8245, zoom: 12, region: 'East India', icon: '🏛️' },
    'Konark': { lat: 19.8877, lng: 86.0945, zoom: 12, region: 'East India', icon: '☀️' },
    'Puri': { lat: 19.8135, lng: 85.8312, zoom: 12, region: 'East India', icon: '🏛️' },

    // Northeast India
    'Guwahati': { lat: 26.1445, lng: 91.7362, zoom: 12, region: 'Northeast India', icon: '🏔️' },
    'Shillong': { lat: 25.5788, lng: 91.8933, zoom: 12, region: 'Northeast India', icon: '🏔️' },
    'Gangtok': { lat: 27.3389, lng: 88.6065, zoom: 12, region: 'Northeast India', icon: '🏔️' },

    // Central India
    'Bhopal': { lat: 23.2599, lng: 77.4126, zoom: 11, region: 'Central India', icon: '🏛️' },
    'Sanchi': { lat: 23.4793, lng: 77.7393, zoom: 12, region: 'Central India', icon: '☸️' },
    'Ujjain': { lat: 23.1765, lng: 75.7885, zoom: 12, region: 'Central India', icon: '🏛️' }
  };

  const regions = ['All Regions', 'North India', 'West India', 'South India', 'East India', 'Northeast India', 'Central India'];

  useEffect(() => {
    if (isOpen) {
      loadAvailableCities();
      loadZonesFromFirebase();
      loadLeafletMap();
    }

    return () => {
      cleanup();
    };
  }, [isOpen, selectedCity]);

  const cleanup = () => {
    if (map) {
      map.remove();
      setMap(null);
    }
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
    if (window.geofencingTracker) {
      clearInterval(window.geofencingTracker);
      delete window.geofencingTracker;
    }
  };

  const loadAvailableCities = async () => {
    try {
      const cities = await allIndiaZoneService.getAvailableCities();
      const sortedCities = cities.sort((a, b) => {
        const regionA = cityCenters[a]?.region || 'Other';
        const regionB = cityCenters[b]?.region || 'Other';
        if (regionA === regionB) return a.localeCompare(b);
        return regionA.localeCompare(regionB);
      });
      setAvailableCities(sortedCities);
    } catch (error) {
      console.error('Error loading cities:', error);
      setAvailableCities(Object.keys(cityCenters));
    }
  };

  const loadZonesFromFirebase = async () => {
    try {
      setLoading(true);
      setError(null);
      addAlert(`📡 Loading ${selectedCity} zones from All India database...`, 'info');

      const firebaseZones = await allIndiaZoneService.getZonesByCity(selectedCity);

      if (firebaseZones.length === 0) {
        addAlert(`🌱 No ${selectedCity} zones found. Seeding All India monument data...`, 'info');
        await allIndiaZoneService.seedAllIndiaMonumentZones();
        const seededZones = await allIndiaZoneService.getZonesByCity(selectedCity);
        setZones(seededZones);
        addAlert(`✅ Loaded ${seededZones.length} ${selectedCity} monument zones`, 'success');
      } else {
        setZones(firebaseZones);
        addAlert(`✅ Loaded ${firebaseZones.length} live ${selectedCity} zones`, 'success');
      }

      // Calculate zone statistics
      calculateZoneStats(firebaseZones);

      // Subscribe to real-time updates
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }

      unsubscribeRef.current = allIndiaZoneService.subscribeToZones(selectedCity, (updatedZones) => {
        setZones(updatedZones);
        calculateZoneStats(updatedZones);
        addAlert(`🔄 ${selectedCity} zones updated in real-time`, 'info');
      });

    } catch (error) {
      console.error('Firebase zones error:', error);
      setError(error.message);
      addAlert(`❌ Failed to load ${selectedCity} zones`, 'error');
      setZones(getFallbackZones());
    } finally {
      setLoading(false);
    }
  };

  const calculateZoneStats = (zoneList) => {
    const stats = {
      total: zoneList.length,
      safe: zoneList.filter(z => z.type === 'safe').length,
      caution: zoneList.filter(z => z.type === 'caution').length,
      restricted: zoneList.filter(z => z.type === 'restricted').length,
      monuments: {
        temple: zoneList.filter(z => z.metadata?.monumentType === 'temple').length,
        fortress: zoneList.filter(z => z.metadata?.monumentType === 'fortress').length,
        palace: zoneList.filter(z => z.metadata?.monumentType === 'palace').length,
        other: zoneList.filter(z => z.metadata?.monumentType && !['temple', 'fortress', 'palace'].includes(z.metadata.monumentType)).length
      }
    };
    setZoneStats(stats);
  };

  const getFallbackZones = () => {
    const fallbackData = {
      'Delhi': [{ id: 'f_delhi_1', name: 'Red Fort Safe Zone', type: 'safe', lat: 28.6562, lng: 77.2410, radius: 600 }],
      'Mumbai': [{ id: 'f_mumbai_1', name: 'Gateway of India', type: 'safe', lat: 19.0728, lng: 72.8347, radius: 300 }],
      'Jaipur': [{ id: 'f_jaipur_1', name: 'Hawa Mahal', type: 'safe', lat: 26.9239, lng: 75.8267, radius: 300 }]
    };
    return fallbackData[selectedCity] || fallbackData['Delhi'];
  };

  const handleCityChange = (newCity) => {
    setSelectedCity(newCity);
    setZones([]);
    setCurrentZones([]);
    setUserLocation(null);
    setIsTracking(false);

    const cityInfo = cityCenters[newCity];
    const region = cityInfo?.region || 'India';
    addAlert(`${cityInfo?.icon || '🏛️'} Switched to ${newCity}, ${region}`, 'info');

    if (window.geofencingTracker) {
      clearInterval(window.geofencingTracker);
      delete window.geofencingTracker;
    }
  };

  const handleRegionFilter = (region) => {
    setSelectedRegion(region);
    if (region === 'All Regions') {
      // Show all cities
      return;
    }

    // Filter cities by region
    const regionCities = Object.keys(cityCenters).filter(city => 
      cityCenters[city].region === region
    );

    if (regionCities.length > 0 && !regionCities.includes(selectedCity)) {
      setSelectedCity(regionCities[0]);
    }
  };

  const loadLeafletMap = () => {
    if (!window.L) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = initializeMap;
      document.head.appendChild(script);
    } else {
      initializeMap();
    }
  };

  const initializeMap = () => {
    if (!mapRef.current || !window.L || zones.length === 0) return;

    if (map) {
      map.remove();
    }

    const cityCenter = cityCenters[selectedCity] || cityCenters['Delhi'];
    const mapInstance = window.L.map(mapRef.current).setView([cityCenter.lat, cityCenter.lng], cityCenter.zoom);

    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(mapInstance);

    markersRef.current = [];
    zones.forEach(zone => {
      const color = zone.type === 'safe' ? '#4CAF50' : 
                   zone.type === 'caution' ? '#FF9800' : '#F44336';

      // Add zone circle
      const circle = window.L.circle([zone.lat, zone.lng], {
        color: color,
        fillColor: color,
        fillOpacity: 0.2,
        radius: zone.radius
      }).addTo(mapInstance);

      // Enhanced marker with monument type
      const monumentIcon = getMonumentIcon(zone.metadata?.monumentType);
      const marker = window.L.marker([zone.lat, zone.lng], {
        icon: window.L.divIcon({
          className: 'custom-div-icon',
          html: `<div style="
            background-color: ${color};
            width: 30px;
            height: 30px;
            border-radius: 50%;
            border: 3px solid white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            font-weight: bold;
            color: white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          ">${monumentIcon}</div>`,
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        })
      }).addTo(mapInstance);

      // Enhanced popup with comprehensive information
      const popupContent = `
        <div style="font-family: system-ui; padding: 8px; min-width: 250px;">
          <h4 style="margin: 0 0 8px 0; color: #333; font-size: 16px;">
            ${monumentIcon} ${zone.name}
          </h4>
          <div style="margin: 5px 0; font-size: 13px;">
            <span style="color: #666;">📍 ${zone.city}, ${zone.state}</span>
            ${zone.metadata?.era ? `<br/><span style="color: #666;">🏛️ ${zone.metadata.era} era</span>` : ''}
          </div>
          <p style="margin: 8px 0; font-size: 13px; color: #555; line-height: 1.4;">
            ${zone.description}
          </p>
          <div style="margin: 8px 0; font-size: 12px;">
            ${zone.riskLevel ? `<div><strong>Risk Level:</strong> ${zone.riskLevel}/5</div>` : ''}
            ${zone.metadata?.monumentType ? `<div><strong>Type:</strong> ${zone.metadata.monumentType}</div>` : ''}
            ${zone.emergencyContacts ? `<div><strong>Emergency:</strong> ${zone.emergencyContacts.slice(0,2).join(', ')}</div>` : ''}
          </div>
          <div style="
            background: ${color};
            color: white;
            padding: 6px 12px;
            border-radius: 15px;
            font-size: 11px;
            font-weight: bold;
            display: inline-block;
            margin-top: 8px;
          ">
            ${zone.type.toUpperCase()} ZONE
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      markersRef.current.push({ marker, circle, zone });
    });

    setMap(mapInstance);
    addAlert(`🗺️ ${selectedCity} monument map loaded with ${zones.length} zones`, 'success');
  };

  const getMonumentIcon = (monumentType) => {
    const iconMap = {
      'temple': '🏛️', 'fortress': '🏰', 'palace': '👑', 'mosque': '🕌',
      'church': '⛪', 'monastery': '🏛️', 'stupa': '☸️', 'mausoleum': '⚱️',
      'memorial': '🗿', 'tower': '🗼', 'bridge': '🌉', 'caves': '🏔️',
      'stepwell': '🕳️', 'observatory': '🌟', 'lake': '🏞️'
    };
    return iconMap[monumentType] || '🏛️';
  };

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      addAlert('❌ Geolocation not supported by browser', 'error');
      return;
    }

    addAlert(`📡 Getting your GPS location for ${selectedCity}...`, 'info');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        };

        setUserLocation(location);

        if (map) {
          // Remove old user marker
          markersRef.current.forEach(item => {
            if (item.type === 'user') {
              map.removeLayer(item.marker);
            }
          });
          markersRef.current = markersRef.current.filter(item => item.type !== 'user');

          // Add new user location marker
          const userMarker = window.L.marker([location.lat, location.lng], {
            icon: window.L.divIcon({
              className: 'user-location-icon',
              html: `<div style="
                background: linear-gradient(45deg, #2196F3, #64B5F6);
                width: 24px;
                height: 24px;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 2px 10px rgba(33,150,243,0.5);
                animation: pulse 2s infinite;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 14px;
                font-weight: bold;
              ">📍</div>`,
              iconSize: [24, 24],
              iconAnchor: [12, 12]
            })
          }).addTo(map);

          userMarker.bindPopup(`
            <div style="font-family: system-ui; text-align: center;">
              <h4 style="margin: 0 0 8px 0;">📍 Your Location</h4>
              <div style="font-size: 12px; color: #666;">
                ${selectedCity}, India<br/>
                Accuracy: ±${Math.round(location.accuracy)}m
              </div>
              <div style="margin: 8px 0 0 0; font-size: 11px; color: #888;">
                Lat: ${location.lat.toFixed(6)}<br/>
                Lng: ${location.lng.toFixed(6)}
              </div>
            </div>
          `);

          map.setView([location.lat, location.lng], 14);
          markersRef.current.push({ marker: userMarker, type: 'user' });
        }

        addAlert(`✅ Location found in ${selectedCity}! Accuracy: ±${Math.round(location.accuracy)}m`, 'success');
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
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  };

  const checkGeofenceZones = async (location) => {
    const insideZones = allIndiaZoneService.checkUserInZones(location.lat, location.lng, zones);

    if (insideZones.length > 0) {
      setCurrentZones(insideZones);

      insideZones.forEach(zone => {
        const cityInfo = cityCenters[selectedCity];
        const monument = zone.metadata?.monumentType ? ` ${getMonumentIcon(zone.metadata.monumentType)}` : '';

        if (zone.type === 'safe') {
          addAlert(`✅ Entered SAFE ZONE:${monument} ${zone.name} (${selectedCity})`, 'success');
        } else if (zone.type === 'caution') {
          addAlert(`⚠️ CAUTION ZONE:${monument} ${zone.name} - Stay alert! (${selectedCity})`, 'caution');
        } else {
          addAlert(`🚫 RESTRICTED ZONE:${monument} ${zone.name} - Exit immediately! (${selectedCity})`, 'error');
        }

        // Record activity
        if (user && zone.id && !zone.id.startsWith('f_')) {
          allIndiaZoneService.recordZoneActivity(user.uid, zone.id, 'enter', location);
        }
      });
    } else {
      if (currentZones.length > 0) {
        currentZones.forEach(zone => {
          addAlert(`🚪 Exited ${zone.name} (${selectedCity})`, 'info');

          if (user && zone.id && !zone.id.startsWith('f_')) {
            allIndiaZoneService.recordZoneActivity(user.uid, zone.id, 'exit', location);
          }
        });
      }
      setCurrentZones([]);
      addAlert(`📍 You are in an unmonitored area of ${selectedCity}`, 'info');
    }
  };

  const addAlert = (message, type) => {
    const newAlert = {
      id: `alert_${Date.now()}_${Math.random()}`,
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
      const cityInfo = cityCenters[selectedCity];
      addAlert(`▶️ Started ${selectedCity} monument geofencing ${cityInfo?.icon || '🏛️'}`, 'info');

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
            { enableHighAccuracy: true, timeout: 10000 }
          );
        }
      }, 15000);

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

  const getFilteredCities = () => {
    if (selectedRegion === 'All Regions') {
      return availableCities;
    }
    return availableCities.filter(city => 
      cityCenters[city]?.region === selectedRegion
    );
  };

  if (!isOpen) return null;

  const cityInfo = cityCenters[selectedCity] || cityCenters['Delhi'];

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

        {/* Enhanced Header with Region Filter */}
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
              🇮🇳 WayORA All India Monuments
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <select
                  value={selectedRegion}
                  onChange={(e) => handleRegionFilter(e.target.value)}
                  style={{
                    background: 'rgba(255,255,255,0.15)',
                    color: 'white',
                    border: '2px solid rgba(255,255,255,0.3)',
                    padding: '6px 10px',
                    borderRadius: '15px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  {regions.map(region => (
                    <option key={region} value={region} style={{ color: '#333' }}>
                      {region}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedCity}
                  onChange={(e) => handleCityChange(e.target.value)}
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    border: '2px solid rgba(255,255,255,0.3)',
                    padding: '8px 12px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    minWidth: '120px'
                  }}
                >
                  {getFilteredCities().map(city => (
                    <option key={city} value={city} style={{ color: '#333' }}>
                      {cityCenters[city]?.icon || '🏛️'} {city}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ fontSize: '14px', opacity: 0.9 }}>
                {cityInfo.icon} {selectedCity} • {cityInfo.region}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <div style={{ textAlign: 'right', fontSize: '13px', opacity: 0.9 }}>
              <div>{zoneStats.total || zones.length} zones</div>
              <div>{zoneStats.monuments?.temple || 0} temples • {zoneStats.monuments?.fortress || 0} forts</div>
            </div>

            <button
              onClick={toggleTracking}
              disabled={loading}
              style={{
                background: loading ? '#999' : (isTracking ? '#ff4757' : '#2ed573'),
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '25px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
              }}
            >
              {loading ? '⏳ Loading...' : (isTracking ? '🛑 Stop Tracking' : '▶️ Start Tracking')}
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

          {/* Map Area */}
          <div style={{ flex: '1', position: 'relative' }}>
            {loading && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(255,255,255,0.9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', marginBottom: '20px' }}>
                    {cityInfo.icon}
                  </div>
                  <div style={{ fontSize: '18px', color: '#333', marginBottom: '10px' }}>
                    Loading {selectedCity} monuments...
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    All India Monument Database • {cityInfo.region}
                  </div>
                </div>
              </div>
            )}

            <div 
              ref={mapRef} 
              style={{ 
                width: '100%', 
                height: '100%',
                minHeight: '400px'
              }}
            />

            {/* Enhanced Status Overlay */}
            <div style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              background: 'rgba(255,255,255,0.95)',
              padding: '15px 20px',
              borderRadius: '15px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
              minWidth: '300px'
            }}>
              <div style={{ 
                fontSize: '14px', 
                fontWeight: 'bold', 
                color: isTracking ? '#2ed573' : '#666',
                marginBottom: '8px'
              }}>
                {isTracking ? '🟢 LIVE TRACKING' : '⚫ READY'} • {cityInfo.icon} {selectedCity}
              </div>

              <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                {cityInfo.region} • India
              </div>

              {currentZones.length > 0 && (
                <div style={{
                  fontSize: '13px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: currentZones[0].type === 'safe' ? '#e8f5e8' : 
                             currentZones[0].type === 'caution' ? '#fff3e0' : '#ffebee',
                  border: `1px solid ${currentZones[0].type === 'safe' ? '#4CAF50' : 
                                      currentZones[0].type === 'caution' ? '#FF9800' : '#F44336'}`,
                  marginBottom: '8px'
                }}>
                  <strong>📍 Current Zone:</strong><br/>
                  {getMonumentIcon(currentZones[0].metadata?.monumentType)} {currentZones[0].name}
                  {currentZones[0].distanceFromCenter && (
                    <div style={{ fontSize: '11px', marginTop: '2px' }}>
                      {Math.round(currentZones[0].distanceFromCenter)}m from center
                    </div>
                  )}
                </div>
              )}

              <div style={{ fontSize: '12px', color: '#888' }}>
                {userLocation 
                  ? `GPS: ${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`
                  : `GPS not detected for ${selectedCity}`
                }
              </div>

              {isTracking && !error && (
                <div style={{
                  fontSize: '11px',
                  color: '#2ed573',
                  marginTop: '5px',
                  fontWeight: 'bold'
                }}>
                  🔄 All India monument database sync
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Info Panel */}
          <div style={{
            width: '350px',
            backgroundColor: '#f8f9fa',
            borderLeft: '1px solid #e0e0e0',
            display: 'flex',
            flexDirection: 'column'
          }}>

            {/* Monument Statistics */}
            <div style={{ padding: '20px', borderBottom: '1px solid #e0e0e0' }}>
              <h3 style={{ margin: '0 0 15px 0', color: '#333', fontSize: '16px' }}>
                {cityInfo.icon} {selectedCity} Monuments
              </h3>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px',
                marginBottom: '15px'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #e8f5e8, #f0fff0)',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #4CAF50',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#2e7d32' }}>
                    {zoneStats.safe || 0}
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
                    {zoneStats.caution || 0}
                  </div>
                  <div style={{ fontSize: '11px', color: '#ef6c00' }}>Caution Zones</div>
                </div>
              </div>

              {/* Monument Type Breakdown */}
              {zoneStats.monuments && (
                <div style={{
                  fontSize: '12px',
                  color: '#666',
                  textAlign: 'center',
                  padding: '10px',
                  background: 'rgba(102, 126, 234, 0.05)',
                  borderRadius: '8px'
                }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Monument Types</div>
                  <div>
                    🏛️ {zoneStats.monuments.temple} Temples • 
                    🏰 {zoneStats.monuments.fortress} Forts • 
                    👑 {zoneStats.monuments.palace} Palaces
                  </div>
                </div>
              )}

              <div style={{
                marginTop: '10px',
                fontSize: '11px',
                color: '#666',
                textAlign: 'center',
                padding: '8px',
                background: 'rgba(102, 126, 234, 0.1)',
                borderRadius: '6px'
              }}>
                🇮🇳 All India Monument Coverage • Real-time Firebase
              </div>
            </div>

            {/* Live Alerts */}
            <div style={{ flex: 1, padding: '20px', overflow: 'hidden' }}>
              <h3 style={{ margin: '0 0 15px 0', color: '#333', fontSize: '16px' }}>
                🚨 Live Monument Alerts
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
                    <div style={{ fontSize: '48px', marginBottom: '15px' }}>
                      {cityInfo.icon}
                    </div>
                    <div>All India monument geofencing ready!</div>
                    <div>Track your visits to {selectedCity}'s historic sites.</div>
                  </div>
                )}

                {alerts.map(alert => (
                  <div
                    key={alert.id}
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

            {/* System Status */}
            <div style={{ 
              padding: '15px 20px', 
              borderTop: '1px solid #e0e0e0',
              backgroundColor: '#fff',
              fontSize: '11px',
              color: '#666',
              textAlign: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                <div style={{ 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%', 
                  background: error ? '#f44336' : '#4CAF50' 
                }}></div>
                <span>{error ? 'Database Error' : 'All India Database Online'}</span>
              </div>
              <div style={{ marginTop: '5px' }}>
                🗺️ OpenStreetMap • {availableCities.length} cities • Monument coverage
              </div>
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

export default AllIndiaGeofencingModal;
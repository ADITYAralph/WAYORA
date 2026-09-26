/**
 * SafePath-X Native Leaflet & OpenStreetMap Basemap Configuration
 * 100% Free Open-Source Architecture — Zero External API Keys Required.
 * Uses official OpenStreetMap raster tiles styled with dark CSS filters.
 */

export const OSM_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'

export const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | SafePath-X Open GIS'

export const AGRA_COORDINATES = {
  lat: 27.1751,
  lng: 78.0421,
  zoom: 13
}

/**
 * Ensures Leaflet 1.9.4 CSS and JS are loaded into the browser document.
 * Resolves to window.L once available.
 */
export function loadLeaflet(): Promise<any> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Window not available'))
  }

  return new Promise((resolve) => {
    // 1. Inject Leaflet 1.9.4 CSS
    if (!document.querySelector('link[href*="leaflet.css"]')) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }

    // 2. Check if window.L is already initialized
    if ((window as any).L) {
      return resolve((window as any).L)
    }

    // 3. Inject Leaflet 1.9.4 JS
    const existingScript = document.getElementById('leaflet-core-script')
    if (existingScript) {
      const interval = setInterval(() => {
        if ((window as any).L) {
          clearInterval(interval)
          resolve((window as any).L)
        }
      }, 50)
      return
    }

    const script = document.createElement('script')
    script.id = 'leaflet-core-script'
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.async = true
    script.onload = () => {
      resolve((window as any).L)
    }
    document.head.appendChild(script)
  })
}

/**
 * Creates official OpenStreetMap TileLayer with standard subdomains and maxZoom.
 */
export function createOsmTileLayer(L: any) {
  return L.tileLayer(OSM_TILE_URL, {
    attribution: OSM_ATTRIBUTION,
    subdomains: ['a', 'b', 'c'],
    maxZoom: 19
  })
}

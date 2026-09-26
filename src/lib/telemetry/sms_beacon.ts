/**
 * SafePath-X 24-Byte GSM SMS Fallback Beacon Encoder & Decoder
 * Bit-packs emergency tourist telemetry into exactly 24 binary bytes (32 Base64 chars).
 * Works offline over GSM SMS channel to Emergency Dispatch (112 / 1363).
 */

export interface SmsBeaconData {
  version: number // 3 bits (0..7)
  alertTypeId: number // 5 bits (0..31, 1=SOS, 2=DIVERSION, 3=STATIONARY, 4=CURFEW)
  batteryPercent: number // 7 bits (0..100)
  gpsAccuracyMeters: number // 9 bits (0..511)
  latitude: number // signed float (-90.0 to 90.0), scaled by 10^7
  longitude: number // signed float (-180.0 to 180.0), scaled by 10^7
  epochMinuteOffset: number // 16 bits (0..65535, minutes from reference epoch)
  speedKmh: number // 8 bits (0..255)
  touristShortHash?: string // 6 bytes hex string (12 hex chars)
  hmacSignature?: number // 4 bytes (32-bit unsigned integer)
}

export const ALERT_TYPE_NAMES: Record<number, string> = {
  1: 'PANIC_SOS',
  2: 'ROUTE_DIVERSION',
  3: 'STATIONARY_DISTRESS',
  4: 'DANGER_ZONE_BREACH'
}

/**
 * Packs SmsBeaconData into a 24-byte ArrayBuffer encoded to 32 Base64 characters.
 */
export function packBeacon(data: SmsBeaconData): string {
  const buffer = new ArrayBuffer(24)
  const view = new DataView(buffer)
  const uint8 = new Uint8Array(buffer)

  // Byte 0: Protocol Version (3 bits) + Alert Type ID (5 bits)
  const v = (data.version & 0x07) << 5
  const alertType = data.alertTypeId & 0x1f
  view.setUint8(0, v | alertType)

  // Bytes 1..2: Battery (7 bits) + GPS Accuracy (9 bits) = 16 bits
  const batt = Math.min(100, Math.max(0, Math.round(data.batteryPercent))) & 0x7f
  const acc = Math.min(511, Math.max(0, Math.round(data.gpsAccuracyMeters))) & 0x1ff
  const battAcc = (batt << 9) | acc
  view.setUint16(1, battAcc, false) // big-endian

  // Bytes 3..6: Latitude as Signed 32-bit Integer (scaled by 10^7)
  const latFixed = Math.round(data.latitude * 10000000)
  view.setInt32(3, latFixed, false)

  // Bytes 7..10: Longitude as Signed 32-bit Integer (scaled by 10^7)
  const lngFixed = Math.round(data.longitude * 10000000)
  view.setInt32(7, lngFixed, false)

  // Bytes 11..12: Daily Epoch Minute Offset (16 bits)
  const epochMin = data.epochMinuteOffset & 0xffff
  view.setUint16(11, epochMin, false)

  // Byte 13: Speed in km/h (8 bits)
  const spd = Math.min(255, Math.max(0, Math.round(data.speedKmh)))
  view.setUint8(13, spd)

  // Bytes 14..19: Tourist Short Hash (6 bytes / 48 bits)
  const hashHex = (data.touristShortHash || '8f192b49c09a').padEnd(12, '0').slice(0, 12)
  for (let i = 0; i < 6; i++) {
    const byteVal = parseInt(hashHex.substr(i * 2, 2), 16) || 0
    view.setUint8(14 + i, byteVal)
  }

  // Bytes 20..23: Checksum / Truncated HMAC-SHA256 (4 bytes / 32 bits)
  let checksum = 0x5a1fe000
  for (let i = 0; i < 20; i++) {
    checksum = ((checksum << 5) - checksum + uint8[i]) >>> 0
  }
  const hmacVal = data.hmacSignature !== undefined ? data.hmacSignature : checksum
  view.setUint32(20, hmacVal, false)

  // Convert 24 binary bytes to 32 Base64 characters
  return uint8ToBase64(uint8)
}

/**
 * Unpacks 32 Base64 characters back into SmsBeaconData.
 */
export function unpackBeacon(base64Str: string): SmsBeaconData {
  const cleanStr = base64Str.trim().replace(/^(WAYORA|SAFEPATH):/i, '')
  const uint8 = base64ToUint8(cleanStr)

  if (uint8.length !== 24) {
    throw new Error(`Invalid WayORA SMS Beacon length: expected 24 bytes, got ${uint8.length}`)
  }

  const view = new DataView(uint8.buffer, uint8.byteOffset, uint8.byteLength)

  // Byte 0
  const byte0 = view.getUint8(0)
  const version = (byte0 >> 5) & 0x07
  const alertTypeId = byte0 & 0x1f

  // Bytes 1..2
  const battAcc = view.getUint16(1, false)
  const batteryPercent = (battAcc >> 9) & 0x7f
  const gpsAccuracyMeters = battAcc & 0x1ff

  // Bytes 3..6 & 7..10: Latitude & Longitude (Scale 10^7)
  const latFixed = view.getInt32(3, false)
  const lngFixed = view.getInt32(7, false)
  const latitude = latFixed / 10000000.0
  const longitude = lngFixed / 10000000.0

  // Bytes 11..12 & 13
  const epochMinuteOffset = view.getUint16(11, false)
  const speedKmh = view.getUint8(13)

  // Bytes 14..19: Tourist Short Hash
  let hashHex = ''
  for (let i = 0; i < 6; i++) {
    hashHex += view.getUint8(14 + i).toString(16).padStart(2, '0')
  }

  // Bytes 20..23: Checksum
  const hmacSignature = view.getUint32(20, false)

  return {
    version,
    alertTypeId,
    batteryPercent,
    gpsAccuracyMeters,
    latitude: Number(latitude.toFixed(7)),
    longitude: Number(longitude.toFixed(7)),
    epochMinuteOffset,
    speedKmh,
    touristShortHash: hashHex,
    hmacSignature
  }
}

// Helpers for cross-platform binary Base64 conversion
function uint8ToBase64(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  if (typeof btoa === 'function') {
    return btoa(binary)
  }
  return Buffer.from(binary, 'binary').toString('base64')
}

function base64ToUint8(base64: string): Uint8Array {
  if (typeof atob === 'function') {
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return bytes
  }
  const buf = Buffer.from(base64, 'base64')
  return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength)
}

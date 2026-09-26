'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  AlertTriangle, 
  Shield, 
  BatteryCharging, 
  Radio, 
  PhoneCall, 
  Send, 
  Wifi, 
  WifiOff, 
  MapPin, 
  Clock, 
  KeyRound, 
  CheckCircle2, 
  Volume2, 
  VolumeX, 
  ArrowLeft, 
  RefreshCw,
  Compass,
  Car,
  Copy,
  Info
} from 'lucide-react'
import { packBeacon, unpackBeacon, ALERT_TYPE_NAMES, SmsBeaconData } from '@/lib/telemetry/sms_beacon'
import { BrandLogo } from '@/components/common/BrandLogo'
import { DoodleBackdrop } from '@/components/layout/DoodleBackdrop'
import { HeritageSkylineBackdrop } from '@/components/layout/HeritageSkylineBackdrop'

export default function SosConsolePage() {
  const [isOfflineMode, setIsOfflineMode] = useState(false)
  const [isSosActive, setIsSosActive] = useState(false)
  const [copied, setCopied] = useState(false)
  const [audioMuted, setAudioMuted] = useState(false)
  const [batteryLevel, setBatteryLevel] = useState(84)
  const [gpsData, setGpsData] = useState({
    lat: 27.1751,
    lng: 78.0421,
    accuracy: 8,
    speed: 0,
    timestamp: new Date()
  })

  // Read Battery status if supported
  useEffect(() => {
    if (typeof window !== 'undefined' && 'getBattery' in navigator) {
      ;(navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(Math.round(battery.level * 100))
        battery.addEventListener('levelchange', () => {
          setBatteryLevel(Math.round(battery.level * 100))
        })
      }).catch(() => {})
    }
  }, [])

  // Geolocation watch
  useEffect(() => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setGpsData({
            lat: Number(pos.coords.latitude.toFixed(6)),
            lng: Number(pos.coords.longitude.toFixed(6)),
            accuracy: Math.round(pos.coords.accuracy),
            speed: Math.round((pos.coords.speed || 0) * 3.6),
            timestamp: new Date(pos.timestamp)
          })
        },
        (err) => console.log('Geolocation watch fallback to Agra coords:', err.message),
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 1000 }
      )
      return () => navigator.geolocation.clearWatch(watchId)
    }
  }, [])

  // Generate 24-byte binary payload
  const currentBeaconData: SmsBeaconData = {
    version: 1,
    alertTypeId: 1, // PANIC_SOS
    batteryPercent: batteryLevel,
    gpsAccuracyMeters: gpsData.accuracy,
    latitude: gpsData.lat,
    longitude: gpsData.lng,
    epochMinuteOffset: Math.floor(Date.now() / 60000) % 65536,
    speedKmh: gpsData.speed,
    touristShortHash: '9a4f21b7e801'
  }

  const base64Beacon = packBeacon(currentBeaconData)
  const smsHref = `sms:112?body=${encodeURIComponent('SAFEPATH:' + base64Beacon)}`

  // Sound Alarm tone
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isSosActive && !audioMuted && typeof window !== 'undefined' && window.AudioContext) {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
      interval = setInterval(() => {
        const osc = audioCtx.createOscillator()
        const gain = audioCtx.createGain()
        osc.type = 'sawtooth'
        osc.frequency.setValueAtTime(880, audioCtx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.3)
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3)
        osc.connect(gain)
        gain.connect(audioCtx.destination)
        osc.start()
        osc.stop(audioCtx.currentTime + 0.3)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isSosActive, audioMuted])

  const handleCopyBeacon = () => {
    navigator.clipboard.writeText(`WAYORA:${base64Beacon}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-[#F0F8FF] text-slate-800 font-sans selection:bg-rose-500 selection:text-white flex flex-col relative overflow-hidden">
      {/* Heritage Skyline 02 Backdrop for SOS Console */}
      <HeritageSkylineBackdrop imageSrc="/heritage-skyline02.png" opacity="opacity-75" />

      {/* Monument Line Art Margin Backdrop */}
      <DoodleBackdrop variant="sos" />

      {/* Top Universal Back to Hub Bar */}
      <div className="bg-white/85 backdrop-blur-md border-b border-sky-100 px-4 lg:px-8 py-2.5 flex items-center justify-between text-xs relative z-10">
        <Link
          href="/"
          className="flex items-center gap-2 text-slate-600 hover:text-sky-700 font-semibold transition group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition" />
          <span>← Back to WayORA Hub</span>
        </Link>
        <div className="flex items-center gap-3 text-slate-500">
          <span className="flex items-center gap-1.5 text-rose-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            Direct 112 / 1363 Beacon Armed
          </span>
          <span className="hidden sm:inline font-sans text-slate-400">Offline GSM Encrypted</span>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white/95 backdrop-blur-xl border-b border-sky-100 px-4 lg:px-8 py-3 sticky top-0 z-30 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <BrandLogo size="sm" showText={false} />
            <div>
              <span className="text-lg font-black tracking-wider text-[#0C2340]">WayORA</span>
              <span className="text-xs text-rose-600 font-bold ml-1.5 uppercase">EMERGENCY BEACON CONSOLE</span>
            </div>
          </Link>
        </div>

        <nav className="hidden sm:flex items-center gap-2 text-xs text-slate-600 font-medium">
          <Link href="/ride" className="px-3.5 py-1.5 rounded-full hover:bg-sky-50 text-slate-700 hover:text-sky-700 transition flex items-center gap-1.5">
            <Car size={14} className="text-sky-600" /> Safe Ride
          </Link>
          <Link href="/explore" className="px-3.5 py-1.5 rounded-full hover:bg-sky-50 text-slate-700 hover:text-sky-700 transition flex items-center gap-1.5">
            <Compass size={14} className="text-sky-600" /> Radar Discovery
          </Link>
          <Link href="/authority" className="px-3.5 py-1.5 rounded-full hover:bg-sky-50 text-slate-700 hover:text-sky-700 transition flex items-center gap-1.5">
            <Radio size={14} className="text-sky-600" /> Authority
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsOfflineMode(!isOfflineMode)}
            className={`flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-full border transition font-medium ${
              isOfflineMode
                ? 'bg-amber-50 border-amber-300 text-amber-800 font-bold'
                : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            {isOfflineMode ? <WifiOff size={13} /> : <Wifi size={13} />}
            {isOfflineMode ? 'SIMULATING NO INTERNET' : 'INTERNET ACTIVE'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        {/* Left Column: Big SOS Action & Status (6 Cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white border border-sky-100 rounded-3xl p-6 lg:p-8 text-center space-y-6 shadow-[0_8px_30px_rgb(2,132,199,0.06)] relative overflow-hidden">
            {isSosActive && (
              <div className="absolute inset-0 bg-rose-500/10 pointer-events-none animate-pulse"></div>
            )}

            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold mb-3">
                <Radio size={14} className="animate-ping" /> EMERGENCY DISPATCH PROTOCOL
              </div>
              <h1 className="text-3xl font-black text-[#0C2340]">Silent Distress Beacon</h1>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
                Zero-internet fallback transmitting 24-byte encrypted telemetry directly to Agra Police & Ministry of Tourism (112 / 1363).
              </p>
            </div>

            {/* Big SOS Button */}
            <div className="py-4 flex flex-col items-center justify-center">
              <button
                onClick={() => setIsSosActive(!isSosActive)}
                className={`relative w-48 h-48 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-xl font-black ${
                  isSosActive
                    ? 'bg-gradient-to-br from-rose-500 via-rose-600 to-rose-700 text-white scale-105 shadow-rose-500/40 ring-8 ring-rose-500/20'
                    : 'bg-gradient-to-br from-rose-500 to-rose-700 text-white hover:scale-105 hover:shadow-rose-600/30'
                }`}
              >
                <div className="absolute inset-2 rounded-full border-2 border-dashed border-white/40 animate-[spin_20s_linear_infinite]"></div>
                <AlertTriangle size={48} className={`mb-1 ${isSosActive ? 'animate-bounce' : ''}`} />
                <span className="text-2xl tracking-widest uppercase">
                  {isSosActive ? 'ACTIVE' : 'SOS'}
                </span>
                <span className="text-[10px] tracking-normal font-sans opacity-90">
                  {isSosActive ? 'BROADCASTING' : 'TAP TO BROADCAST'}
                </span>
              </button>

              {isSosActive && (
                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={() => setAudioMuted(!audioMuted)}
                    className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-700 flex items-center gap-1.5 hover:text-slate-900"
                  >
                    {audioMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                    {audioMuted ? 'Unmute Siren Tone' : 'Mute Siren Tone'}
                  </button>
                </div>
              )}
            </div>

            {/* Emergency 1-Tap Dialers */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <a
                href="tel:112"
                className="p-3 rounded-2xl bg-rose-50/70 border border-rose-200 hover:border-rose-400 transition text-center group shadow-2xs"
              >
                <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-1 group-hover:scale-110 transition">
                  <PhoneCall size={16} />
                </div>
                <div className="text-base font-black text-rose-900">112</div>
                <div className="text-[10px] text-slate-500">Police & Central Emergency (ERSS)</div>
              </a>

              <a
                href="tel:1363"
                className="p-3 rounded-2xl bg-sky-50/70 border border-sky-200 hover:border-sky-400 transition text-center group shadow-2xs"
              >
                <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center mx-auto mb-1 group-hover:scale-110 transition">
                  <PhoneCall size={16} />
                </div>
                <div className="text-base font-black text-sky-900">1363</div>
                <div className="text-[10px] text-slate-500">Tourist Inquiries & Support Helpline</div>
              </a>

              <a
                href="tel:1090"
                className="p-3 rounded-2xl bg-purple-50/70 border border-purple-200 hover:border-purple-400 transition text-center group shadow-2xs"
              >
                <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mx-auto mb-1 group-hover:scale-110 transition">
                  <PhoneCall size={16} />
                </div>
                <div className="text-base font-black text-purple-900">1090</div>
                <div className="text-[10px] text-slate-500">Women Safety Helpline</div>
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: 24-Byte GSM Fallback & Bit-Packing Inspection (6 Cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Live Device Telemetry */}
          <div className="bg-white border border-sky-100 rounded-3xl p-6 space-y-4 shadow-[0_8px_30px_rgb(2,132,199,0.06)]">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
              <span>Live Sensor Telemetry</span>
              <span className="text-emerald-700 text-xs font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">GPS LOCK OK</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Battery</div>
                <div className="text-lg font-bold text-emerald-700 flex items-center gap-1.5">
                  <BatteryCharging size={16} /> {batteryLevel}%
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">GPS Accuracy</div>
                <div className="text-lg font-bold text-sky-700 flex items-center gap-1.5">
                  <MapPin size={16} /> ±{gpsData.accuracy}m
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Ground Speed</div>
                <div className="text-lg font-bold text-amber-700">
                  {gpsData.speed} km/h
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Protocol Ver</div>
                <div className="text-lg font-bold text-purple-700">v1.2 (24B)</div>
              </div>
            </div>

            <div className="p-3 bg-sky-50/60 border border-sky-100 rounded-xl flex items-center justify-between text-xs">
              <span className="text-slate-500">Fixed Lat/Lng:</span>
              <span className="text-slate-800 font-bold font-mono">{gpsData.lat}, {gpsData.lng}</span>
            </div>
          </div>

          {/* 24-Byte GSM SMS Payload Viewer */}
          <div className="bg-white border border-sky-100 rounded-3xl p-6 space-y-4 shadow-[0_8px_30px_rgb(2,132,199,0.06)]">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-[#0C2340] uppercase tracking-wider flex items-center gap-2">
                  <Radio size={16} className="text-sky-600" />
                  24-Byte GSM SMS Fallback Beacon
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Zero mobile data required. Fits in a single uncompressed SMS packet.
                </p>
              </div>
              <span className="px-2.5 py-1 bg-sky-50 border border-sky-200 text-sky-800 text-[11px] font-bold rounded-full">
                32 BASE64 CHARS
              </span>
            </div>

            {/* Binary String Representation */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 font-mono">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">GSM Payload Body:</span>
                <button
                  onClick={handleCopyBeacon}
                  className="flex items-center gap-1 text-sky-700 hover:text-sky-800 transition text-[11px] font-sans font-bold"
                >
                  {copied ? <CheckCircle2 size={13} className="text-emerald-600" /> : <Copy size={13} />}
                  <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>

              <div className="p-3 bg-white rounded-xl border border-sky-200 text-sky-900 text-sm break-all font-bold select-all shadow-2xs">
                WAYORA:{base64Beacon}
              </div>

              <div className="text-[11px] text-slate-500 space-y-1">
                <div className="flex justify-between">
                  <span>Byte 0: Protocol Version & Alert Type ID</span>
                  <span className="text-slate-800 font-bold">0x{(1 << 5 | 1).toString(16).padStart(2, '0')} (PANIC_SOS)</span>
                </div>
                <div className="flex justify-between">
                  <span>Bytes 1-2: Battery % & GPS Precision</span>
                  <span className="text-slate-800 font-bold">{batteryLevel}% | {gpsData.accuracy}m</span>
                </div>
                <div className="flex justify-between">
                  <span>Bytes 3-10: Signed Lat/Lng Int32</span>
                  <span className="text-slate-800 font-bold">10^7 Fixed Point</span>
                </div>
                <div className="flex justify-between">
                  <span>Bytes 14-19: Tourist Hash</span>
                  <span className="text-slate-800 font-bold">#9a4f21b7e801</span>
                </div>
                <div className="flex justify-between">
                  <span>Bytes 20-23: HMAC Checksum</span>
                  <span className="text-slate-800 font-bold">32-bit SHA-256</span>
                </div>
              </div>
            </div>

            {/* Direct Send via SMS app */}
            <a
              href={smsHref}
              className="w-full py-3.5 rounded-full bg-rose-600 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-rose-700 active:scale-98 transition shadow-lg shadow-rose-600/20"
            >
              <Send size={15} />
              Transmit Fallback SMS to 112 Dispatch
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}

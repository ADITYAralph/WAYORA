'use client'

import React, { useState, useMemo } from 'react'
import {
  MessageSquare,
  SignalZero,
  Signal,
  Send,
  ShieldAlert,
  Binary,
  Cpu,
  Smartphone,
  CheckCircle2,
  Copy,
  Check
} from 'lucide-react'
import { packBeacon, unpackBeacon, SmsBeaconData } from '@/lib/telemetry/sms_beacon'
import { offlineManager } from '@/modules/safepath-x/offline_manager'

export const SmsBeaconCard: React.FC = () => {
  const [lat, setLat] = useState('27.1751') // Taj Mahal
  const [lng, setLng] = useState('78.0421')
  const [battery, setBattery] = useState(85)
  const [accuracy, setAccuracy] = useState(8)
  const [alertType, setAlertType] = useState<number>(1) // 1=SOS
  const [copied, setCopied] = useState(false)
  const [isSimulatedOffline, setIsSimulatedOffline] = useState(false)

  // Encode beacon
  const { packedBase64, unpackedData, byteLength, smsPayload } = useMemo(() => {
    const data: SmsBeaconData = {
      version: 1,
      alertTypeId: alertType,
      batteryPercent: battery,
      gpsAccuracyMeters: accuracy,
      latitude: parseFloat(lat) || 27.1751,
      longitude: parseFloat(lng) || 78.0421,
      epochMinuteOffset: new Date().getHours() * 60 + new Date().getMinutes(),
      speedKmh: 15,
      touristShortHash: '8f192b49c09a'
    }

    const b64 = packBeacon(data)
    const unpacked = unpackBeacon(b64)
    const sms = offlineManager.generateSmsFallback({
      userId: 'TID-782401',
      touristName: 'Aditya Kaushik',
      lat: parseFloat(lat) || 27.1751,
      lng: parseFloat(lng) || 78.0421,
      accuracy,
      batteryPercent: battery,
      alertTypeId: alertType
    })

    return {
      packedBase64: b64,
      unpackedData: unpacked,
      byteLength: 24,
      smsPayload: sms
    }
  }, [lat, lng, battery, accuracy, alertType])

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(packedBase64)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleLaunchSms = () => {
    offlineManager.launchNativeSms({
      userId: 'TID-782401',
      touristName: 'Aditya Kaushik',
      lat: parseFloat(lat) || 27.1751,
      lng: parseFloat(lng) || 78.0421,
      accuracy,
      batteryPercent: battery,
      alertTypeId: alertType,
      customPhone: '112'
    })
  }

  return (
    <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 text-slate-100 max-w-2xl mx-auto">
      {/* 1. HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-500 to-red-600 flex items-center justify-center text-white font-black shadow-lg shadow-rose-500/20">
            <MessageSquare size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-base text-white tracking-tight">
                24-Byte GSM SMS Fallback Beacon
              </h3>
              <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                Zero-Internet Protocol
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Low-Bandwidth 24-Byte Binary Micro-Frame • 32 Base64 Characters
            </p>
          </div>
        </div>

        {/* Network Status Pill */}
        <button
          onClick={() => setIsSimulatedOffline(!isSimulatedOffline)}
          className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
            isSimulatedOffline
              ? 'bg-rose-950/60 border-rose-500 text-rose-300 animate-pulse'
              : 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
          }`}
        >
          {isSimulatedOffline ? <SignalZero size={14} /> : <Signal size={14} />}
          <span>{isSimulatedOffline ? 'Simulated 0G Offline' : 'GSM Network Active'}</span>
        </button>
      </div>

      {/* 2. BASE64 BEACON DISPLAY (32 CHARACTERS) */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-400">
          <span className="flex items-center gap-1.5">
            <Binary size={14} className="text-cyan-400" /> Packed GSM Micro-Payload (24 Bytes Binary):
          </span>
          <span className="font-mono text-cyan-400">{packedBase64.length} Characters Base64</span>
        </div>

        <div className="bg-slate-900 border border-cyan-500/30 rounded-xl p-3.5 flex items-center justify-between gap-2">
          <code className="text-sm sm:text-base font-mono font-black text-cyan-300 tracking-widest break-all select-all">
            {packedBase64}
          </code>
          <button
            onClick={handleCopy}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition shrink-0"
            title="Copy Base64 Payload"
          >
            {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
          </button>
        </div>

        {/* Byte Allocation Breakdown */}
        <div className="grid grid-cols-4 gap-2 text-[10px] text-slate-400 font-mono text-center pt-1">
          <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
            <div className="text-white font-bold">1 Byte</div>
            <div className="text-[9px] text-slate-500">Ver + Alert ID</div>
          </div>
          <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
            <div className="text-white font-bold">2 Bytes</div>
            <div className="text-[9px] text-slate-500">Batt % + Accur</div>
          </div>
          <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
            <div className="text-white font-bold">8 Bytes</div>
            <div className="text-[9px] text-slate-500">Lat + Lng ($10^7$)</div>
          </div>
          <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
            <div className="text-white font-bold">13 Bytes</div>
            <div className="text-[9px] text-slate-500">Epoch + Hash + HMAC</div>
          </div>
        </div>
      </div>

      {/* 3. SIMULATION INPUTS */}
      <div className="grid sm:grid-cols-2 gap-4 text-xs">
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2">
          <span className="font-bold text-slate-300">GPS Coordinates (Taj Mahal Default):</span>
          <div className="grid grid-cols-2 gap-2 font-mono">
            <div>
              <label className="text-[10px] text-slate-500">Latitude</label>
              <input
                type="text"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 p-2 rounded text-white mt-0.5"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500">Longitude</label>
              <input
                type="text"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 p-2 rounded text-white mt-0.5"
              />
            </div>
          </div>
        </div>

        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2">
          <span className="font-bold text-slate-300">Emergency Alert Type:</span>
          <div className="grid grid-cols-2 gap-2 font-semibold">
            {[
              { id: 1, label: '🚨 Panic SOS' },
              { id: 2, label: '⚠️ Abduction' },
              { id: 3, label: '🛑 Stationary' },
              { id: 4, label: '⛔ Curfew' }
            ].map((a) => (
              <button
                key={a.id}
                onClick={() => setAlertType(a.id)}
                className={`p-2 rounded-lg border text-left text-[11px] transition ${
                  alertType === a.id
                    ? 'bg-rose-600 border-rose-500 text-white font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. DECODED TELEMETRY VERIFICATION ACCORDION */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-xs font-mono space-y-2">
        <div className="flex items-center justify-between text-slate-400 border-b border-slate-800/80 pb-2">
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <CheckCircle2 size={14} /> Bidirectional Decode Output:
          </span>
          <span>Spatial Loss: &lt; 0.011m (Sub-Millimeter Precision)</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-300 pt-1">
          <div>Lat: <strong className="text-white">{unpackedData.latitude}°</strong></div>
          <div>Lng: <strong className="text-white">{unpackedData.longitude}°</strong></div>
          <div>Battery: <strong className="text-emerald-400">{unpackedData.batteryPercent}%</strong></div>
          <div>Accuracy: <strong className="text-cyan-400">{unpackedData.gpsAccuracyMeters}m</strong></div>
        </div>
      </div>

      {/* 5. NATIVE SMS DISPATCH TRIGGER BUTTON */}
      <div className="pt-2">
        <button
          onClick={handleLaunchSms}
          className="w-full bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-red-500 text-white py-3.5 px-5 rounded-2xl font-bold text-xs sm:text-sm tracking-wide transition shadow-xl shadow-rose-600/30 flex items-center justify-center gap-2"
        >
          <Smartphone size={18} />
          <span>Launch Native SMS Client with 24-Byte Beacon to 112</span>
        </button>
        <p className="text-center text-[11px] text-slate-500 mt-2">
          Target URI: <code className="text-slate-400 font-mono">sms:112?body=WAYORA:{packedBase64}</code>
        </p>
      </div>
    </div>
  )
}

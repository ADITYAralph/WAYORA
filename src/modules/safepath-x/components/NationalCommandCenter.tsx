'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { H3SpatialHeatmap } from './H3SpatialHeatmap'
import { TelemetryStreamMatrix } from './TelemetryStreamMatrix'
import { StateIncidentFeed } from './StateIncidentFeed'
import { NationalAnalytics } from './NationalAnalytics'
import { NationalTouristTelemetry, NationalIncidentAlert } from '../types/safepathX.types'
import { nationalCommandSync } from '../services/nationalCommandSync'
import { STATE_COMMAND_REGISTRY } from '../data/stateCommandRegistry'
import { Shield, Radio, Building2, MapPin, Layers, ExternalLink, ArrowRight } from 'lucide-react'

export const NationalCommandCenter: React.FC = () => {
  const router = useRouter()
  const [selectedState, setSelectedState] = useState<string>('ALL')
  const [telemetryStream, setTelemetryStream] = useState<NationalTouristTelemetry[]>([])
  const [incidents, setIncidents] = useState<NationalIncidentAlert[]>([])
  const [selectedTourist, setSelectedTourist] = useState<NationalTouristTelemetry | null>(null)
  const [activeCenter, setActiveCenter] = useState<{ lat: number; lng: number }>({
    lat: 27.2481, // Default Agra / SUA Anand Campus
    lng: 77.8345
  })

  // 1. Initialize Default Telemetry Stream & Sync
  useEffect(() => {
    // Generate initial live telemetry across Golden Triangle & Agra
    const initialUnits: NationalTouristTelemetry[] = [
      {
        telemetryId: 'tel-01',
        touristId: 'TID-782401',
        touristName: 'Aditya Kaushik',
        nationality: 'Indian',
        contactPhone: '+91 98765 43210',
        emergencyContact: '+91 98765 00000',
        digitalIdHash: '0x8f192b49c09a82e1',
        lat: 27.2481,
        lng: 77.8345,
        speed: 1.4,
        heading: 90,
        accuracy: 6,
        batteryLevel: 92,
        currentH3Index: '8860000d6000000',
        currentCorridorId: 'corridor-golden-triangle',
        stateCode: 'UP',
        currentZoneName: 'SUA: Sharda University Agra (Anand Campus)',
        safetyLevel: 9,
        status: 'safe',
        isPanic: false,
        isStationaryAnomaly: false,
        timestamp: Date.now(),
        formattedAddress: 'SUA: Sharda University Agra (AEC Campus), 19th Km Milestone, NH-19, Keetham, Agra, UP'
      },
      {
        telemetryId: 'tel-02',
        touristId: 'TID-482019',
        touristName: 'Elena Rostova',
        nationality: 'German',
        contactPhone: '+49 170 1234567',
        emergencyContact: '+49 170 9999999',
        digitalIdHash: '0x3c71a92bf01e84d2',
        lat: 27.1751,
        lng: 78.0421,
        speed: 0.8,
        heading: 180,
        accuracy: 8,
        batteryLevel: 74,
        currentH3Index: '8860000d6001200',
        currentCorridorId: 'corridor-golden-triangle',
        stateCode: 'UP',
        currentZoneName: 'Taj Mahal Protected Heritage Zone',
        safetyLevel: 10,
        status: 'safe',
        isPanic: false,
        isStationaryAnomaly: false,
        timestamp: Date.now() - 60000,
        formattedAddress: 'Tajganj VIP Corridor, Agra, Uttar Pradesh 282001'
      },
      {
        telemetryId: 'tel-03',
        touristId: 'TID-309118',
        touristName: 'Marcus Vance',
        nationality: 'British',
        contactPhone: '+44 7911 123456',
        emergencyContact: '+44 7911 000000',
        digitalIdHash: '0x99a1f28b417c80d1',
        lat: 28.6129,
        lng: 77.2295,
        speed: 2.1,
        heading: 45,
        accuracy: 10,
        batteryLevel: 68,
        currentH3Index: '8860000d6004500',
        currentCorridorId: 'corridor-golden-triangle',
        stateCode: 'DL',
        currentZoneName: 'India Gate Ceremonial Corridor',
        safetyLevel: 9,
        status: 'safe',
        isPanic: false,
        isStationaryAnomaly: false,
        timestamp: Date.now() - 120000,
        formattedAddress: 'Rajpath Ceremonial Axis, New Delhi, Delhi 110001'
      },
      {
        telemetryId: 'tel-04',
        touristId: 'TID-198402',
        touristName: 'Sophia Lin',
        nationality: 'Singaporean',
        contactPhone: '+65 9123 4567',
        emergencyContact: '+65 9000 0000',
        digitalIdHash: '0x12d998a44c7b20f9',
        lat: 27.2510,
        lng: 77.8420,
        speed: 0.1,
        heading: 0,
        accuracy: 15,
        batteryLevel: 31,
        currentH3Index: '8860000d6007800',
        currentCorridorId: 'corridor-golden-triangle',
        stateCode: 'UP',
        currentZoneName: 'Sur Sarovar (Keetham Lake) Reserve Forest',
        safetyLevel: 2,
        status: 'danger',
        isPanic: false,
        isStationaryAnomaly: true,
        timestamp: Date.now() - 300000,
        formattedAddress: 'Keetham Lake Reserve Forest Trail (East of SUA Campus), Agra'
      }
    ]

    setTelemetryStream(initialUnits)
    setIncidents(nationalCommandSync.getCachedIncidents())

    // Subscribe to live telemetry and incident broadcast stream
    const unsubTel = nationalCommandSync.onTelemetry((newTel) => {
      setTelemetryStream((prev) => {
        const idx = prev.findIndex((u) => u.touristId === newTel.touristId)
        if (idx >= 0) {
          const cp = [...prev]
          cp[idx] = newTel
          return cp
        }
        return [newTel, ...prev]
      })
    })

    const unsubInc = nationalCommandSync.onIncident((newInc) => {
      setIncidents((prev) => [newInc, ...prev.slice(0, 30)])
    })

    return () => {
      unsubTel()
      unsubInc()
    }
  }, [])

  // Filter telemetry by state
  const displayedTelemetry =
    selectedState === 'ALL'
      ? telemetryStream
      : telemetryStream.filter((t) => t.stateCode === selectedState)

  const handleStateSelect = (stateCode: string) => {
    setSelectedState(stateCode)
    if (stateCode !== 'ALL' && STATE_COMMAND_REGISTRY[stateCode]) {
      setActiveCenter(STATE_COMMAND_REGISTRY[stateCode].coveragePolygonCenter)
    } else {
      setActiveCenter({ lat: 27.2481, lng: 77.8345 }) // default
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16">
      {/* 1. NATIONAL HEADER */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 px-6 py-4 shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Shield size={24} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-white tracking-tight">WayORA</h1>
                <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  National Command & Control Deck
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Inter-State Tourism Safety, H3 Spatial Intelligence & ERSS-112 CAD Integration
              </p>
            </div>
          </div>

          {/* Switcher back to V1 Portals */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard/authority')}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition"
            >
              <Building2 size={14} />
              <span>Agra Local Portal</span>
            </button>

            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600/30 to-cyan-600/30 hover:from-blue-600/40 hover:to-cyan-600/40 text-cyan-300 border border-cyan-500/40 px-3.5 py-1.5 rounded-xl text-xs font-bold transition"
            >
              <span>Tourist Companion →</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* 2.1 State Selection Filter Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold">
          <button
            onClick={() => handleStateSelect('ALL')}
            className={`px-3.5 py-2 rounded-xl transition whitespace-nowrap ${
              selectedState === 'ALL'
                ? 'bg-cyan-600 text-white shadow-lg'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            🇮🇳 All India Overview
          </button>

          {Object.keys(STATE_COMMAND_REGISTRY).map((st) => (
            <button
              key={st}
              onClick={() => handleStateSelect(st)}
              className={`px-3.5 py-2 rounded-xl transition whitespace-nowrap ${
                selectedState === st
                  ? 'bg-cyan-600 text-white shadow-lg'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {st}: {STATE_COMMAND_REGISTRY[st].stateName}
            </button>
          ))}
        </div>

        {/* 2.2 National KPI Analytics Strip */}
        <NationalAnalytics />

        {/* 2.3 Main Central Grid: H3 Heatmap & Telemetry Matrix */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: H3 Spatial Risk Heatmap */}
          <div className="lg:col-span-2 h-[520px]">
            <H3SpatialHeatmap
              centerLat={activeCenter.lat}
              centerLng={activeCenter.lng}
              zoomLevel={selectedState === 'ALL' ? 13 : 12}
              resolution={8}
              activeTourists={displayedTelemetry.map((t) => ({
                lat: t.lat,
                lng: t.lng,
                name: t.touristName,
                isPanic: t.isPanic
              }))}
            />
          </div>

          {/* Right Col: Telemetry Stream Matrix */}
          <div>
            <TelemetryStreamMatrix
              telemetryList={displayedTelemetry}
              selectedTouristId={selectedTourist?.touristId}
              onSelectTourist={(t) => {
                setSelectedTourist(t)
                setActiveCenter({ lat: t.lat, lng: t.lng })
              }}
            />
          </div>
        </div>

        {/* 2.4 Incident Triage & ERSS 112 Feed */}
        <StateIncidentFeed
          incidents={incidents}
          onResolveIncident={(id) => {
            setIncidents((prev) =>
              prev.map((inc) => (inc.incidentId === id ? { ...inc, status: 'RESOLVED' } : inc))
            )
          }}
        />
      </main>
    </div>
  )
}

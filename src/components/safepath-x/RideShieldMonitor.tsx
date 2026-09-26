'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  ShieldAlert,
  Volume2,
  VolumeX,
  AlertTriangle,
  Navigation,
  Radio,
  Play,
  CheckCircle2,
  PhoneCall,
  Activity
} from 'lucide-react'
import { nationalCommandSync } from '@/modules/safepath-x/services/nationalCommandSync'
import { NationalIncidentAlert } from '@/modules/safepath-x/types/safepathX.types'

interface RideShieldStatus {
  rideId: string
  status: 'NORMAL' | 'MINOR_DEVIATION' | 'WARNING_OFF_ROUTE' | 'CRITICAL_ROUTE_DIVERSION'
  isCritical: boolean
  crossTrackDistanceMeters: number
  dwellDurationSeconds: number
  thresholdMeters: number
  cosineSimilarityScam: number
  targetedScamCluster?: {
    name: string
    lat: number
    lng: number
    description: string
  } | null
  alertReason: string
  recommendedAction: string
  timestamp: number
}

interface RideShieldMonitorProps {
  plannedWaypoints?: Array<[number, number]>
  vehicleCurrentGps?: [number, number]
  userPhone?: string
  touristName?: string
}

export const RideShieldMonitor: React.FC<RideShieldMonitorProps> = ({
  plannedWaypoints = [
    [27.2481, 77.8345], // SUA Anand Campus Agra
    [27.2410, 77.8700], // NH-19 Transit
    [27.2300, 77.9100], // Highway
    [27.2206, 77.9505]  // Sikandra
  ],
  vehicleCurrentGps = [27.2481, 77.8345],
  userPhone = '+91 98765 43210',
  touristName = 'Aditya Kaushik'
}) => {
  const [shieldData, setShieldData] = useState<RideShieldStatus>({
    rideId: 'RIDE-UP-7824',
    status: 'NORMAL',
    isCritical: false,
    crossTrackDistanceMeters: 18.5,
    dwellDurationSeconds: 0,
    thresholdMeters: 250,
    cosineSimilarityScam: 0.05,
    targetedScamCluster: null,
    alertReason: 'Vehicle progressing safely on verified highway polyline',
    recommendedAction: 'Passive real-time monitoring',
    timestamp: Date.now()
  })

  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [dismissedAlert, setDismissedAlert] = useState(false)
  const isBroadcastingRef = useRef(false)

  // Trigger Audio Broadcast in English
  const triggerAudioBroadcast = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported on this browser.')
      return
    }

    window.speechSynthesis.cancel()
    setIsPlayingAudio(true)

    const englishText = 'Attention: This vehicle route is actively tracked and monitored by State Tourism Safety Command. Unauthorized diversion logged.'

    const uttEn = new SpeechSynthesisUtterance(englishText)
    uttEn.lang = 'en-US'
    uttEn.rate = 0.95
    uttEn.pitch = 1.0

    uttEn.onend = () => setIsPlayingAudio(false)
    uttEn.onerror = () => setIsPlayingAudio(false)

    window.speechSynthesis.speak(uttEn)
  }

  // Handle Simulation Triggers
  const simulateState = (mode: 'NORMAL' | 'MINOR' | 'CRITICAL') => {
    setDismissedAlert(false)

    if (mode === 'NORMAL') {
      setShieldData({
        rideId: 'RIDE-UP-7824',
        status: 'NORMAL',
        isCritical: false,
        crossTrackDistanceMeters: 24.0,
        dwellDurationSeconds: 0,
        thresholdMeters: 250,
        cosineSimilarityScam: 0.08,
        targetedScamCluster: null,
        alertReason: 'Vehicle progressing safely along planned route',
        recommendedAction: 'Passive monitoring',
        timestamp: Date.now()
      })
    } else if (mode === 'MINOR') {
      setShieldData({
        rideId: 'RIDE-UP-7824',
        status: 'WARNING_OFF_ROUTE',
        isCritical: false,
        crossTrackDistanceMeters: 380.0,
        dwellDurationSeconds: 45,
        thresholdMeters: 250,
        cosineSimilarityScam: 0.35,
        targetedScamCluster: null,
        alertReason: 'Vehicle has drifted 380m off planned route into service lane',
        recommendedAction: 'Warning flag logged. Monitoring trajectory',
        timestamp: Date.now()
      })
    } else if (mode === 'CRITICAL') {
      const critData: RideShieldStatus = {
        rideId: 'RIDE-UP-7824',
        status: 'CRITICAL_ROUTE_DIVERSION',
        isCritical: true,
        crossTrackDistanceMeters: 1450.0,
        dwellDurationSeconds: 135,
        thresholdMeters: 250,
        cosineSimilarityScam: 0.88,
        targetedScamCluster: {
          name: 'Unauthorized High-Commission Marble Emporium Cluster',
          lat: 27.1650,
          lng: 78.0280,
          description: 'Known aggressive tout diversion pocket off tourist highway'
        },
        alertReason: 'Vehicle diverted 1,450m for 135s with heading vector aligned to Unauthorized Emporium',
        recommendedAction: 'Trigger audio loudspeaker deterrent and notify Highway Police Patrol QRT',
        timestamp: Date.now()
      }
      setShieldData(critData)

      // Dispatch Incident to SafePath-X Authority Feed
      const incidentPayload: NationalIncidentAlert = {
        incidentId: `inc-ride-abduction-${Date.now()}`,
        touristId: 'TID-782401',
        touristName,
        phone: userPhone,
        stateCode: 'UP',
        severity: 'CRITICAL',
        type: 'ROUTE_DEVIATION',
        lat: 27.1680,
        lng: 78.0250,
        formattedAddress: 'Near Unauthorized Marble Emporium Alleys, Agra Outskirts',
        timestamp: Date.now(),
        erssDispatched: true,
        erssCadNumber: `CAD-UP-RIDE-${Math.floor(100000 + Math.random() * 900000)}`,
        assignedUnit: 'Highway Police Interceptor Unit 02',
        status: 'OPEN'
      }
      nationalCommandSync.publishIncident(incidentPayload)

      // Auto play audio warning
      triggerAudioBroadcast('both')
    }
  }

  return (
    <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
      {/* 1. HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              shieldData.isCritical
                ? 'bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-600/40'
                : shieldData.status === 'WARNING_OFF_ROUTE'
                ? 'bg-amber-500/20 text-amber-400'
                : 'bg-emerald-500/20 text-emerald-400'
            }`}
          >
            <ShieldAlert size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-white uppercase tracking-wider">
                WayORA Ride Shield
              </h3>
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.2 rounded font-mono font-bold">
                Anti-Diversion AI
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Orthogonal Vector Cross-Track & Scam Emporium Alignment Engine
            </p>
          </div>
        </div>

        {/* State Badge */}
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
            shieldData.isCritical
              ? 'bg-rose-600 text-white animate-bounce'
              : shieldData.status === 'WARNING_OFF_ROUTE'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
          }`}
        >
          {shieldData.status.replace(/_/g, ' ')}
        </span>
      </div>

      {/* 2. REAL-TIME METRICS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold">Cross-Track (d_perp)</span>
          <div
            className={`text-lg font-black font-mono ${
              shieldData.crossTrackDistanceMeters > shieldData.thresholdMeters ? 'text-rose-400' : 'text-emerald-400'
            }`}
          >
            {shieldData.crossTrackDistanceMeters}m
          </div>
          <p className="text-[10px] text-slate-500">Threshold: {shieldData.thresholdMeters}m</p>
        </div>

        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold">Deviation Dwell</span>
          <div
            className={`text-lg font-black font-mono ${
              shieldData.dwellDurationSeconds >= 120 ? 'text-rose-400' : 'text-slate-200'
            }`}
          >
            {shieldData.dwellDurationSeconds}s
          </div>
          <p className="text-[10px] text-slate-500">Critical: &gt;= 120s</p>
        </div>

        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold">Scam Alignment (cos θ)</span>
          <div
            className={`text-lg font-black font-mono ${
              shieldData.cosineSimilarityScam > 0.7 ? 'text-rose-400' : 'text-cyan-400'
            }`}
          >
            {(shieldData.cosineSimilarityScam * 100).toFixed(0)}%
          </div>
          <p className="text-[10px] text-slate-500">Heading alignment</p>
        </div>

        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold">Targeted Pocket</span>
          <div className="text-xs font-bold text-slate-200 truncate mt-1">
            {shieldData.targetedScamCluster ? '⚠️ Emporium Pocket' : 'None (Safe Corridor)'}
          </div>
          <p className="text-[10px] text-slate-500 truncate">
            {shieldData.targetedScamCluster ? shieldData.targetedScamCluster.name : 'Verified Route'}
          </p>
        </div>
      </div>

      {/* 3. SIMULATION CONTROLS */}
      <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-3 space-y-2">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
          <span>Synthetic Trajectory Testbed (Test Engine State Transitions):</span>
          <span className="font-mono text-cyan-400">Active Ride: {shieldData.rideId}</span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs font-semibold">
          <button
            onClick={() => simulateState('NORMAL')}
            className={`py-2 px-3 rounded-lg transition border flex items-center justify-center gap-1.5 ${
              shieldData.status === 'NORMAL'
                ? 'bg-emerald-600 border-emerald-500 text-white'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            <CheckCircle2 size={13} /> Normal (On Track)
          </button>

          <button
            onClick={() => simulateState('MINOR')}
            className={`py-2 px-3 rounded-lg transition border flex items-center justify-center gap-1.5 ${
              shieldData.status === 'WARNING_OFF_ROUTE'
                ? 'bg-amber-600 border-amber-500 text-white'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            <AlertTriangle size={13} /> Minor Detour (380m)
          </button>

          <button
            onClick={() => simulateState('CRITICAL')}
            className={`py-2 px-3 rounded-lg transition border flex items-center justify-center gap-1.5 ${
              shieldData.isCritical
                ? 'bg-rose-600 border-rose-500 text-white animate-pulse'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            <ShieldAlert size={13} /> Critical Abduction Alert
          </button>
        </div>
      </div>

      {/* 4. CRITICAL ANOMALY ALERT MODAL / BANNER */}
      {shieldData.isCritical && !dismissedAlert && (
        <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950 border-2 border-rose-500 rounded-2xl p-5 shadow-2xl space-y-3 animate-fadeIn">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="text-2xl animate-bounce">🚨</span>
              <div>
                <h4 className="text-sm font-black text-rose-300 uppercase tracking-wide">
                  CRITICAL ROUTE DIVERSION ANOMALY DETECTED
                </h4>
                <p className="text-xs text-rose-100 mt-1 leading-relaxed">{shieldData.alertReason}</p>
                {shieldData.targetedScamCluster && (
                  <p className="text-[11px] text-amber-300 mt-1 font-semibold">
                    📍 Destination Threat: {shieldData.targetedScamCluster.name} ({shieldData.targetedScamCluster.description})
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => setDismissedAlert(true)}
              className="text-slate-400 hover:text-white text-xs p-1"
            >
              ✕
            </button>
          </div>

          {/* Audio Broadcast & Emergency Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-rose-500/30">
            <button
              onClick={() => triggerAudioBroadcast()}
              disabled={isPlayingAudio}
              className="flex-1 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30"
            >
              <Volume2 size={16} className={isPlayingAudio ? 'animate-spin' : ''} />
              <span>{isPlayingAudio ? 'Broadcasting Audio Warning...' : '🔊 Play Tourism Command Voice Warning'}</span>
            </button>

            <a
              href="tel:112"
              className="bg-slate-800 hover:bg-slate-700 text-rose-300 border border-rose-500/40 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <PhoneCall size={14} /> Call Police 112
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

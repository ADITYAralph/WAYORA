'use client'

import React, { useState, useMemo } from 'react'
import {
  Banknote,
  Volume2,
  Moon,
  Sun,
  ShieldCheck,
  Compass,
  ArrowRight,
  Info,
  Car,
  CloudRain,
  MapPin,
  Sparkles
} from 'lucide-react'
import { fairFareClient, FairFareResult } from '@/lib/fairfare/fairFareEngine'

export const FairFareCard: React.FC = () => {
  const [distanceKm, setDistanceKm] = useState<number>(6.2) // Default: Agra Cantt to Taj Mahal
  const [vehicleType, setVehicleType] = useState<'auto_rickshaw' | 'taxi_non_ac' | 'taxi_ac' | 'e_rickshaw'>('auto_rickshaw')
  const [originName, setOriginName] = useState('Agra Cantt Railway Station')
  const [destName, setDestName] = useState('Taj Mahal West Gate')
  const [destHindi, setDestHindi] = useState('ताज महल पश्चिमी गेट')
  const [isNightManual, setIsNightManual] = useState<boolean>(false)
  const [isRaining, setIsRaining] = useState<boolean>(false)
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false)

  // Calculate fare dynamically
  const fareResult: FairFareResult = useMemo(() => {
    return fairFareClient.calculateFare({
      distanceKm,
      vehicleType,
      isNight: isNightManual,
      weatherFactor: isRaining ? 1.15 : 1.0,
      destinationName: destName,
      destinationHindi: destHindi
    })
  }, [distanceKm, vehicleType, isNightManual, isRaining, destName, destHindi])

  // Play FairFare quote in English
  const handleSpeakEnglishFare = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.')
      return
    }

    window.speechSynthesis.cancel()
    setIsPlayingAudio(true)

    const text = fareResult.localScriptTranslation.audioBroadcastText
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US'
    utterance.rate = 0.95
    utterance.pitch = 1.0

    utterance.onend = () => setIsPlayingAudio(false)
    utterance.onerror = () => setIsPlayingAudio(false)

    window.speechSynthesis.speak(utterance)
  }

  const popularRoutes = fairFareClient.getPopularRoutes()

  return (
    <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 text-slate-100 max-w-2xl mx-auto">
      {/* 1. HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
            <Banknote size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-base text-white tracking-tight">FairFare Dynamic Price Shield</h3>
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                Anti-Overcharging AI
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Government Gazetted Regulatory Tariff Corridor & Local Language Bargaining Card
            </p>
          </div>
        </div>

        {/* Night Tariff Indicator */}
        <button
          onClick={() => setIsNightManual(!isNightManual)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
            isNightManual
              ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200'
              : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
          }`}
        >
          {isNightManual ? <Moon size={14} className="text-indigo-400" /> : <Sun size={14} className="text-amber-400" />}
          <span>{isNightManual ? 'Night Tariff (1.25x Active)' : 'Day Tariff'}</span>
        </button>
      </div>

      {/* 2. HIGH-CONTRAST DRIVER BARGAINING DISPLAY (OFFLINE-READY) */}
      <div className="bg-gradient-to-b from-amber-500/10 via-slate-950 to-slate-950 border-2 border-amber-500/40 rounded-2xl p-6 text-center space-y-3 shadow-inner">
        <div className="flex items-center justify-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest">
          <ShieldCheck size={16} /> Official Recommended Fare Corridor
        </div>

        {/* Large Typography Price Range */}
        <div className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 tracking-tight">
          {fareResult.toleranceCorridor.formattedRange}
        </div>

        <p className="text-xs text-slate-400 font-mono">
          Statutory Target Price: <strong className="text-white text-sm">₹{fareResult.recommendedPrice}</strong> (Exact: ₹{fareResult.exactCalculatedFare})
        </p>

        {/* English Script & Tariff Rate Display */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-1 mt-2">
          <div className="text-lg sm:text-xl font-black text-amber-300 tracking-wide">
            {fareResult.localScriptTranslation.translatedHeadline}
          </div>
          <div className="text-xs text-slate-300 font-medium">
            {fareResult.localScriptTranslation.translatedTariffSummary}
          </div>
        </div>

        {/* Audio Speaker Button */}
        <div className="pt-2">
          <button
            onClick={handleSpeakEnglishFare}
            disabled={isPlayingAudio}
            className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm tracking-wide transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
          >
            <Volume2 size={18} className={isPlayingAudio ? 'animate-bounce' : ''} />
            <span>{isPlayingAudio ? 'Broadcasting Quote in English...' : '🔊 Speak FairFare Quote to Transporter'}</span>
          </button>
        </div>
      </div>

      {/* 3. TRIP & VEHICLE CONFIGURATION SELECTOR */}
      <div className="space-y-3">
        <div className="text-xs font-bold uppercase text-slate-400 tracking-wider">Select Transit Vehicle:</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { id: 'auto_rickshaw', name: 'Auto Rickshaw', icon: '🛺', base: '₹30 base' },
            { id: 'e_rickshaw', name: 'E-Rickshaw', icon: '⚡', base: '₹15 base' },
            { id: 'taxi_non_ac', name: 'Taxi Non-AC', icon: '🚕', base: '₹50 base' },
            { id: 'taxi_ac', name: 'Taxi AC (Prime)', icon: '🚘', base: '₹75 base' }
          ].map((v) => (
            <button
              key={v.id}
              onClick={() => setVehicleType(v.id as any)}
              className={`p-3 rounded-xl border text-left text-xs transition flex flex-col justify-between ${
                vehicleType === v.id
                  ? 'bg-amber-500/20 border-amber-500 text-white shadow-lg ring-1 ring-amber-400'
                  : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <div className="text-xl mb-1">{v.icon}</div>
              <div className="font-bold truncate text-white">{v.name}</div>
              <div className="text-[10px] text-slate-400 font-mono">{v.base}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 4. DISTANCE SLIDER & WEATHER TOGGLE */}
      <div className="grid sm:grid-cols-2 gap-4 text-xs">
        {/* Distance Slider */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex justify-between font-bold">
            <span className="text-slate-400">Transit Distance:</span>
            <span className="font-mono text-amber-400 text-sm">{distanceKm} km</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="40"
            step="0.5"
            value={distanceKm}
            onChange={(e) => setDistanceKm(parseFloat(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>Short Hop (1 km)</span>
            <span>City Center (10 km)</span>
            <span>Highway (40 km)</span>
          </div>
        </div>

        {/* Rain/Weather Surcharge Toggle */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <CloudRain size={16} className="text-cyan-400" /> Monsoonal / Extreme Weather
            </span>
            <input
              type="checkbox"
              checked={isRaining}
              onChange={(e) => setIsRaining(e.target.checked)}
              className="accent-amber-500 w-4 h-4 cursor-pointer"
            />
          </div>
          <p className="text-[10px] text-slate-400">
            Applies standard 1.15x weather allowance factor during heavy monsoon downpours.
          </p>
        </div>
      </div>

      {/* 5. POPULAR PRE-CONFIGURED AGRA ROUTES */}
      <div className="space-y-2">
        <div className="text-xs font-bold uppercase text-slate-400 tracking-wider">
          Popular Agra Tourist Routes (Instant Quotations):
        </div>
        <div className="grid sm:grid-cols-3 gap-2">
          {popularRoutes.map((r, idx) => (
            <button
              key={idx}
              onClick={() => {
                setDistanceKm(r.distanceKm)
                setOriginName(r.origin)
                setDestName(r.destination)
                setDestHindi(r.destinationHindi)
              }}
              className={`p-2.5 rounded-xl border text-left text-xs transition space-y-1 ${
                distanceKm === r.distanceKm
                  ? 'bg-amber-500/10 border-amber-500/60 text-white'
                  : 'bg-slate-950/50 hover:bg-slate-850 border-slate-800/80 text-slate-300'
              }`}
            >
              <div className="font-bold text-white truncate text-[11px]">{r.destination}</div>
              <div className="text-[10px] text-amber-400 font-mono">{r.distanceKm} km • Est: ₹{r.standardAutoFare} Auto</div>
            </button>
          ))}
        </div>
      </div>

      {/* 6. STATUTORY REGULATORY CITATION BADGE */}
      <div className="border-t border-slate-800/80 pt-3 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400 font-mono">
        <span className="flex items-center gap-1">
          <Info size={12} className="text-amber-400" />
          Statutory Gazette Ref: <strong className="text-slate-300">{fareResult.regulatoryCitation}</strong>
        </span>
        <span className="text-slate-500">{fareResult.regulatoryAuthority}</span>
      </div>
    </div>
  )
}

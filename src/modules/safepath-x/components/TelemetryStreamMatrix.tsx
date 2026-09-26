'use client'

import React, { useState } from 'react'
import { NationalTouristTelemetry } from '../types/safepathX.types'
import { Radio, Search, Filter, Shield, AlertTriangle, Battery, Navigation } from 'lucide-react'

interface TelemetryStreamMatrixProps {
  telemetryList: NationalTouristTelemetry[]
  onSelectTourist?: (tourist: NationalTouristTelemetry) => void
  selectedTouristId?: string
}

export const TelemetryStreamMatrix: React.FC<TelemetryStreamMatrixProps> = ({
  telemetryList,
  onSelectTourist,
  selectedTouristId
}) => {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'safe' | 'caution' | 'danger' | 'sos'>('all')

  const filtered = telemetryList.filter((t) => {
    const matchesSearch =
      t.touristName.toLowerCase().includes(search.toLowerCase()) ||
      t.touristId.toLowerCase().includes(search.toLowerCase()) ||
      t.formattedAddress.toLowerCase().includes(search.toLowerCase()) ||
      t.stateCode.toLowerCase().includes(search.toLowerCase())

    if (!matchesSearch) return false
    if (filter === 'all') return true
    if (filter === 'sos') return t.isPanic || t.status === 'sos'
    return t.status === filter
  })

  return (
    <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col justify-between space-y-4">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Radio size={18} className="text-cyan-400 animate-pulse" />
            <h3 className="font-bold text-sm text-white uppercase tracking-wider">
              National Telemetry Stream Matrix
            </h3>
          </div>
          <span className="text-xs bg-cyan-500/20 text-cyan-300 px-2.5 py-0.5 rounded-full font-mono font-bold">
            {filtered.length} Live Units
          </span>
        </div>

        {/* Search & Filter */}
        <div className="space-y-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by name, TID, state (UP/DL/RJ)..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto text-[11px] pb-1 font-semibold">
            {(['all', 'sos', 'danger', 'caution', 'safe'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setFilter(mode)}
                className={`px-2.5 py-1 rounded-lg transition uppercase ${
                  filter === mode
                    ? mode === 'sos' || mode === 'danger'
                      ? 'bg-rose-600 text-white'
                      : 'bg-cyan-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {mode === 'sos' ? '🚨 SOS' : mode}
              </button>
            ))}
          </div>
        </div>

        {/* Telemetry Item Rows */}
        <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
          {filtered.length === 0 ? (
            <div className="text-xs text-slate-500 text-center py-6">No telemetry records match current filters</div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.telemetryId}
                onClick={() => onSelectTourist && onSelectTourist(item)}
                className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                  selectedTouristId === item.touristId
                    ? 'bg-cyan-600/20 border-cyan-500 text-white ring-1 ring-cyan-400'
                    : item.isPanic || item.status === 'sos'
                    ? 'bg-rose-950/40 border-rose-500/80 text-rose-200 animate-pulse'
                    : 'bg-slate-950/60 hover:bg-slate-800/80 border-slate-800/80 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{item.isPanic ? '🚨' : '👤'}</span>
                    <span className="font-bold text-white truncate">{item.touristName}</span>
                    <span className="text-[10px] bg-slate-800 text-cyan-300 px-1.5 py-0.2 rounded font-mono">
                      {item.stateCode}
                    </span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      item.status === 'safe'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : item.status === 'caution'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-rose-500/20 text-rose-300'
                    }`}
                  >
                    {item.status} ({item.safetyLevel * 10}%)
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 truncate mb-1.5">{item.formattedAddress}</p>

                <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800/60 pt-1.5 font-mono">
                  <span>H3: {item.currentH3Index.slice(0, 10)}...</span>
                  <span className="flex items-center gap-1">
                    <Battery size={11} className="text-emerald-400" />
                    {item.batteryLevel || 88}%
                  </span>
                  <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

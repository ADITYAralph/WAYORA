'use client'

import React from 'react'
import { STATE_COMMAND_REGISTRY } from '../data/stateCommandRegistry'
import { Users, Shield, AlertTriangle, Building2, Radio } from 'lucide-react'

export const NationalAnalytics: React.FC = () => {
  const states = Object.values(STATE_COMMAND_REGISTRY)
  const totalTourists = states.reduce((acc, s) => acc + s.activeTouristCount, 0)
  const totalPatrols = states.reduce((acc, s) => acc + s.activePatrolUnits, 0)
  const totalAlerts = states.reduce((acc, s) => acc + s.alertCount, 0)

  return (
    <div className="space-y-4">
      {/* 4 KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">
            <span>National Tourists</span>
            <Users size={18} className="text-cyan-400" />
          </div>
          <div className="text-3xl font-black text-white">{totalTourists.toLocaleString()}</div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Streaming Across 7 States
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">
            <span>Active Patrol Units</span>
            <Shield size={18} className="text-blue-400" />
          </div>
          <div className="text-3xl font-black text-blue-400">{totalPatrols}</div>
          <div className="text-[11px] text-slate-400 mt-1">Police & Tourist QRT Fleet</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">
            <span>Critical Distress Alerts</span>
            <AlertTriangle size={18} className="text-rose-400" />
          </div>
          <div className="text-3xl font-black text-rose-400">{totalAlerts}</div>
          <div className="text-[11px] text-rose-300 mt-1">ERSS 112 CAD Linked</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">
            <span>National Corridors</span>
            <Building2 size={18} className="text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-400">3 Major</div>
          <div className="text-[11px] text-amber-300 mt-1">Golden Triangle, Himalaya, Konkan</div>
        </div>
      </div>

      {/* State Breakdown Strip */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
          State-Wise Tourism Safety & Dispatch Node Coverage
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {states.map((st) => (
            <div
              key={st.stateCode}
              className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 text-xs space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">{st.stateCode}</span>
                <span className="text-[10px] text-slate-400 font-mono">{st.activeTouristCount}</span>
              </div>
              <p className="text-[10px] text-slate-400 truncate">{st.stateName}</p>
              <div className="text-[10px] text-emerald-400 font-mono">QRT: {st.activePatrolUnits}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

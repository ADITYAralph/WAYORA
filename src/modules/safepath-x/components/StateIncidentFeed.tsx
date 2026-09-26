'use client'

import React from 'react'
import { NationalIncidentAlert } from '../types/safepathX.types'
import { AlertTriangle, ShieldCheck, PhoneCall, Clock, CheckCircle2 } from 'lucide-react'

interface StateIncidentFeedProps {
  incidents: NationalIncidentAlert[]
  onResolveIncident?: (id: string) => void
}

export const StateIncidentFeed: React.FC<StateIncidentFeedProps> = ({ incidents, onResolveIncident }) => {
  return (
    <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle size={18} className="text-amber-400" />
          <h3 className="font-bold text-sm text-white uppercase tracking-wider">
            National Incident Triage & ERSS-112 Feed
          </h3>
        </div>
        <span className="text-xs bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2.5 py-0.5 rounded-full font-mono font-bold">
          {incidents.filter((i) => i.status === 'OPEN').length} Active Alerts
        </span>
      </div>

      <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
        {incidents.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span>All monitored national tourism corridors reporting normal status. Zero active critical distress signals.</span>
          </div>
        ) : (
          incidents.map((incident) => (
            <div
              key={incident.incidentId}
              className={`p-3.5 rounded-xl border text-xs flex flex-col justify-between space-y-2 transition-all ${
                incident.severity === 'CRITICAL'
                  ? 'bg-rose-950/40 border-rose-500/50 text-rose-200 shadow-lg'
                  : incident.severity === 'HIGH'
                  ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
                  : 'bg-slate-950/60 border-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <span className="text-base mt-0.5">
                    {incident.severity === 'CRITICAL' ? '🚨' : incident.severity === 'HIGH' ? '⚠️' : 'ℹ️'}
                  </span>
                  <div>
                    <div className="font-bold text-white flex items-center gap-2">
                      <span>{incident.touristName}</span>
                      <span className="font-mono text-[10px] bg-slate-800 px-1.5 py-0.2 rounded text-slate-300">
                        {incident.stateCode} • {incident.type}
                      </span>
                    </div>
                    <p className="text-[11px] opacity-80 mt-0.5">{incident.formattedAddress}</p>
                  </div>
                </div>

                <div className="text-right text-[10px] font-mono opacity-70 whitespace-nowrap">
                  {new Date(incident.timestamp).toLocaleTimeString()}
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/60 pt-2 text-[10px]">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">
                    ERSS-112 Status:{' '}
                    <strong className="text-emerald-400">
                      {incident.erssDispatched ? `CAD Dispatched (${incident.erssCadNumber || 'Active'})` : 'Local QRT'}
                    </strong>
                  </span>
                  {incident.assignedUnit && (
                    <span className="text-slate-400">
                      • Unit: <strong className="text-white">{incident.assignedUnit}</strong>
                    </span>
                  )}
                </div>

                {incident.status === 'OPEN' && onResolveIncident && (
                  <button
                    onClick={() => onResolveIncident(incident.incidentId)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded-lg font-bold transition flex items-center gap-1"
                  >
                    <ShieldCheck size={12} /> Resolve Incident
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

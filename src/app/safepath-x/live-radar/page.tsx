'use client'

import { H3SpatialHeatmap } from '@/modules/safepath-x/components/H3SpatialHeatmap'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Shield } from 'lucide-react'

export default function SafePathXLiveRadarPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="flex items-center gap-2">
            <Shield size={20} className="text-cyan-400" />
            <h1 className="text-base font-black text-white">WayORA • Pan-India Spatial Heatmap Radar</h1>
          </div>
        </div>

        <button
          onClick={() => router.push('/safepath-x/command-center')}
          className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs px-3.5 py-1.5 rounded-xl font-bold transition shadow-lg shadow-cyan-600/20"
        >
          Open Command Deck →
        </button>
      </header>

      <main className="flex-1 p-4">
        <div className="w-full h-[calc(100vh-80px)]">
          <H3SpatialHeatmap centerLat={27.2481} centerLng={77.8345} zoomLevel={14} resolution={8} />
        </div>
      </main>
    </div>
  )
}

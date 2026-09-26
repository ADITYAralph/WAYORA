'use client'

import React from 'react'
import {
  TajMahalDoodle,
  RedFortDoodle,
  IndiaGateDoodle,
  DottedFlightTrail
} from '@/components/ui/MonumentDoodles'

interface DoodleBackdropProps {
  variant?: 'full' | 'subtle' | 'auth' | 'inspector' | 'sos'
}

/**
 * DoodleBackdrop
 * A non-intrusive, pointer-events-none background wrapper that decorates empty
 * page margins with soft cerulean Indian monument line art and handwritten travel script.
 */
export function DoodleBackdrop({ variant = 'full' }: DoodleBackdropProps) {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none"
    >
      {/* 1. Bottom-Left: Taj Mahal with Reflective Waterline & Flight Trail */}
      <div className="absolute -bottom-6 -left-6 w-72 sm:w-80 md:w-96 text-sky-400/25 transition-all">
        <TajMahalDoodle className="w-full h-auto drop-shadow-sm" />
        <span className="font-serif italic text-xs text-sky-600/50 block -mt-3 ml-8 rotate-[-6deg] tracking-wide">
          Taj Heritage Sanctuary ♡
        </span>
      </div>

      {/* 2. Bottom-Right: Red Fort / Agra Fort Fortified Battlements */}
      <div className="absolute -bottom-6 -right-8 w-80 sm:w-96 md:w-[420px] text-sky-400/20 transition-all">
        <RedFortDoodle className="w-full h-auto drop-shadow-sm" />
        <span className="font-serif italic text-xs text-sky-600/50 block -mt-3 mr-8 text-right rotate-[4deg] tracking-wide">
          Secure Fort Corridors ✈
        </span>
      </div>

      {/* 3. Top-Left / Mid-Left: India Gate Arch Silhouette (Auth / Subpages) */}
      {(variant === 'full' || variant === 'auth' || variant === 'sos') && (
        <div className="absolute top-28 -left-10 w-48 sm:w-56 md:w-64 text-sky-400/15 hidden md:block">
          <IndiaGateDoodle className="w-full h-auto" />
          <span className="font-serif italic text-[11px] text-sky-500/40 block -mt-2 ml-12 rotate-[3deg]">
            Agra to the World ♡
          </span>
        </div>
      )}

      {/* 4. Top-Right: Dotted Flight Trail with Origami Jet */}
      <div className="absolute top-24 right-6 w-44 sm:w-52 md:w-64 text-sky-400/25 hidden lg:block">
        <DottedFlightTrail className="w-full h-auto" />
        <span className="font-serif italic text-[11px] text-sky-600/45 block -mt-1 mr-4 text-right rotate-[-3deg]">
          Guardians on Every Path ✈
        </span>
      </div>

      {/* 5. Center-Mid Ambient Accents */}
      {variant === 'full' && (
        <div className="absolute top-1/2 left-10 text-sky-400/20 hidden xl:block">
          <span className="font-serif italic text-xs tracking-wider">
            Explore More, Worry Less ♡
          </span>
        </div>
      )}
    </div>
  )
}
export default DoodleBackdrop

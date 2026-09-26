'use client'

import React from 'react'

export function AirplaneTrailDoodle({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none pointer-events-none ${className}`}
    >
      <path
        d="M10 60 C 40 70, 70 20, 110 30 C 130 35, 140 25, 145 15"
        stroke="#0284C7"
        strokeWidth="2"
        strokeDasharray="4 4"
        strokeLinecap="round"
      />
      {/* Mini Origami Plane */}
      <path
        d="M145 15 L 138 22 L 140 17 L 133 16 Z"
        fill="#0284C7"
      />
      <path
        d="M145 15 L 142 24 L 140 17 Z"
        fill="#38BDF8"
      />
    </svg>
  )
}

export function HeartSparkleDoodle({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none pointer-events-none ${className}`}
    >
      {/* Hand drawn heart */}
      <path
        d="M40 30 C 35 18, 15 20, 20 38 C 24 50, 40 62, 40 62 C 40 62, 56 50, 60 38 C 65 20, 45 18, 40 30 Z"
        stroke="#0284C7"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="#E0F2FE"
        fillOpacity="0.4"
      />
      {/* Mini Sparkles */}
      <path
        d="M62 16 L 64 22 L 70 24 L 64 26 L 62 32 L 60 26 L 54 24 L 60 22 Z"
        fill="#38BDF8"
      />
      <path
        d="M16 54 L 17 58 L 21 59 L 17 60 L 16 64 L 15 60 L 11 59 L 15 58 Z"
        fill="#0284C7"
      />
    </svg>
  )
}

export function DottedPathDoodle({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none pointer-events-none ${className}`}
    >
      <path
        d="M10 30 Q 60 5, 100 35 T 180 20"
        stroke="#38BDF8"
        strokeWidth="2.5"
        strokeDasharray="6 6"
        strokeLinecap="round"
      />
      {/* Mini map pin at the end */}
      <circle cx="185" cy="18" r="5" fill="#0284C7" />
      <circle cx="185" cy="18" r="2" fill="#FFFFFF" />
    </svg>
  )
}

export function HandwrittenAccent({
  children,
  className = '',
  badge
}: {
  children: React.ReactNode
  className?: string
  badge?: string
}) {
  return (
    <span className={`inline-flex items-center gap-1.5 italic font-serif font-medium text-sky-700 ${className}`}>
      {children}
      {badge && (
        <span className="text-xs px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-sans not-italic border border-sky-200">
          {badge}
        </span>
      )}
    </span>
  )
}

export function CompassDoodle({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 60 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none pointer-events-none ${className}`}
    >
      <circle cx="30" cy="30" r="22" stroke="#BAE6FD" strokeWidth="2" strokeDasharray="3 3" />
      <path d="M30 14 L34 26 L30 24 L26 26 Z" fill="#0284C7" />
      <path d="M30 46 L34 34 L30 36 L26 34 Z" fill="#94A3B8" />
    </svg>
  )
}

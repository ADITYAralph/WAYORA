'use client'

import React from 'react'

/**
 * Taj Mahal Hand-Drawn SVG Vector Line Art
 * Features the iconic onion dome, finial, central arch (iwan), side chambers,
 * four outer minarets, and reflective pool water ripple lines.
 */
export function TajMahalDoodle({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none pointer-events-none ${className}`}
    >
      {/* Plinth / Base Platform */}
      <line x1="20" y1="215" x2="380" y2="215" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="35" y1="222" x2="365" y2="222" stroke="currentColor" strokeWidth="1.5" strokeDasharray="6 4" strokeLinecap="round" />

      {/* Main Building Base Outline */}
      <path
        d="M95 215 L95 125 L120 125 L120 110 L280 110 L280 125 L305 215"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Central Grand Iwan (Pointed Arch Portal) */}
      <path
        d="M160 215 L160 145 C160 130 180 120 200 115 C220 120 240 130 240 145 L240 215"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Inner Recessed Arch */}
      <path
        d="M172 215 L172 155 C172 143 186 135 200 130 C214 135 228 143 228 155 L228 215"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="4 3"
        strokeLinecap="round"
      />

      {/* Left Tiered Niche Arches */}
      <path d="M125 155 L125 135 C125 128 135 124 145 124 C155 124 155 128 155 135 L155 155 Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M125 198 L125 170 C125 163 135 160 145 160 C155 160 155 163 155 170 L155 198 Z" stroke="currentColor" strokeWidth="1.5" />

      {/* Right Tiered Niche Arches */}
      <path d="M245 155 L245 135 C245 128 255 124 265 124 C275 124 275 128 275 135 L275 155 Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M245 198 L245 170 C245 163 255 160 265 160 C275 160 275 163 275 170 L275 198 Z" stroke="currentColor" strokeWidth="1.5" />

      {/* Main Central Onion Dome */}
      <path
        d="M152 110 C150 78 175 42 200 32 C225 42 250 78 248 110"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Central Finial / Kalash */}
      <line x1="200" y1="32" x2="200" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="200" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M197 18 L203 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />

      {/* Left Chattris (Cupola) */}
      <path d="M130 110 L130 95 C130 84 140 76 148 76 C156 76 166 84 166 95 L166 110" stroke="currentColor" strokeWidth="1.5" />
      <line x1="148" y1="76" x2="148" y2="66" stroke="currentColor" strokeWidth="1.5" />

      {/* Right Chattris (Cupola) */}
      <path d="M234 110 L234 95 C234 84 244 76 252 76 C260 76 270 84 270 95 L270 110" stroke="currentColor" strokeWidth="1.5" />
      <line x1="252" y1="76" x2="252" y2="66" stroke="currentColor" strokeWidth="1.5" />

      {/* Left Outer Minaret (Far Left) */}
      <path d="M42 215 L48 60 L58 60 L64 215" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="40" y1="165" x2="66" y2="165" stroke="currentColor" strokeWidth="2" />
      <line x1="44" y1="115" x2="62" y2="115" stroke="currentColor" strokeWidth="2" />
      {/* Minaret Dome & Finial */}
      <path d="M46 60 C46 48 53 42 53 42 C53 42 60 48 60 60 Z" stroke="currentColor" strokeWidth="1.5" />
      <line x1="53" y1="42" x2="53" y2="34" stroke="currentColor" strokeWidth="1.5" />

      {/* Right Outer Minaret (Far Right) */}
      <path d="M336 215 L342 60 L352 60 L358 215" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="334" y1="165" x2="360" y2="165" stroke="currentColor" strokeWidth="2" />
      <line x1="338" y1="115" x2="356" y2="115" stroke="currentColor" strokeWidth="2" />
      {/* Minaret Dome & Finial */}
      <path d="M340 60 C340 48 347 42 347 42 C347 42 354 48 354 60 Z" stroke="currentColor" strokeWidth="1.5" />
      <line x1="347" y1="42" x2="347" y2="34" stroke="currentColor" strokeWidth="1.5" />

      {/* Reflective Pool Water Ripple Lines */}
      <path d="M80 232 C120 236 160 228 200 232 C240 236 280 228 320 232" stroke="currentColor" strokeWidth="1.5" strokeDasharray="8 5" strokeLinecap="round" />
      <path d="M110 244 C150 248 180 242 210 244 C240 246 270 240 290 244" stroke="currentColor" strokeWidth="1.5" strokeDasharray="5 5" strokeLinecap="round" />
    </svg>
  )
}

/**
 * Red Fort / Agra Fort Hand-Drawn SVG Vector Line Art
 * Features fortified red sandstone bastions, battlements (merlons),
 * central arched Lahori gate, and decorative dome chattris.
 */
export function RedFortDoodle({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 420 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none pointer-events-none ${className}`}
    >
      {/* Ground Foundation */}
      <line x1="15" y1="195" x2="405" y2="195" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />

      {/* Fort Main Curtain Wall */}
      <path
        d="M45 195 L45 105 L375 105 L375 195"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Merlons / Battlements on Curtain Wall */}
      <path
        d="M45 105 L45 92 L55 92 L55 105 L65 105 L65 92 L75 92 L75 105 L85 105 L85 92 L95 92 L95 105 
           L325 105 L325 92 L335 92 L335 105 L345 105 L345 92 L355 92 L355 105 L365 105 L365 92 L375 92 L375 105"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Left Octagonal Fort Bastion / Tower */}
      <path d="M100 195 L95 65 L155 65 L150 195" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="90" y1="65" x2="160" y2="65" stroke="currentColor" strokeWidth="2" />
      {/* Left Bastion Chattri / Cupola */}
      <path d="M108 65 L108 48 C108 36 125 26 125 26 C125 26 142 36 142 48 L142 65" stroke="currentColor" strokeWidth="1.5" />
      <line x1="125" y1="26" x2="125" y2="16" stroke="currentColor" strokeWidth="1.5" />
      {/* Left Bastion Window Slit */}
      <rect x="120" y="100" width="10" height="22" rx="5" stroke="currentColor" strokeWidth="1.5" />

      {/* Right Octagonal Fort Bastion / Tower */}
      <path d="M270 195 L265 65 L325 65 L320 195" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="260" y1="65" x2="330" y2="65" stroke="currentColor" strokeWidth="2" />
      {/* Right Bastion Chattri / Cupola */}
      <path d="M278 65 L278 48 C278 36 295 26 295 26 C295 26 312 36 312 48 L312 65" stroke="currentColor" strokeWidth="1.5" />
      <line x1="295" y1="26" x2="295" y2="16" stroke="currentColor" strokeWidth="1.5" />
      {/* Right Bastion Window Slit */}
      <rect x="290" y="100" width="10" height="22" rx="5" stroke="currentColor" strokeWidth="1.5" />

      {/* Central Grand Gate Portal */}
      <path
        d="M175 195 L175 120 C175 105 190 95 210 95 C230 95 245 105 245 120 L245 195"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Inner Gate Arch */}
      <path
        d="M188 195 L188 135 C188 122 198 112 210 112 C222 112 232 122 232 135 L232 195"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="4 3"
        strokeLinecap="round"
      />

      {/* Central Roof Chattris */}
      <path d="M195 95 L195 78 C195 68 210 60 210 60 C210 60 225 68 225 78 L225 95" stroke="currentColor" strokeWidth="1.5" />
      <line x1="210" y1="60" x2="210" y2="50" stroke="currentColor" strokeWidth="1.5" />

      {/* Dotted Flag flying atop */}
      <path d="M210 50 L226 43 L210 36 Z" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  )
}

/**
 * India Gate Hand-Drawn SVG Vector Line Art
 * Features the classic triumphal arch monument with stepped cornice,
 * central vault, side pilasters, and Amar Jawan Jyoti plinth.
 */
export function IndiaGateDoodle({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none pointer-events-none ${className}`}
    >
      {/* Base Podium Steps */}
      <line x1="20" y1="230" x2="300" y2="230" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="35" y1="238" x2="285" y2="238" stroke="currentColor" strokeWidth="1.5" strokeDasharray="6 4" strokeLinecap="round" />

      {/* Main Arch Pylons */}
      <path
        d="M55 230 L55 85 L265 85 L265 230"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Stepped Attic / Crown Top Mouldings */}
      <rect x="65" y="60" width="190" height="25" stroke="currentColor" strokeWidth="1.8" />
      <rect x="80" y="42" width="160" height="18" stroke="currentColor" strokeWidth="1.8" />
      <path d="M105 42 L115 28 L205 28 L215 42 Z" stroke="currentColor" strokeWidth="1.8" />
      {/* Bowl / Urn on top */}
      <ellipse cx="160" cy="24" rx="22" ry="4" stroke="currentColor" strokeWidth="1.5" />

      {/* Central Monumental Arch Opening */}
      <path
        d="M110 230 L110 145 C110 115 130 95 160 95 C190 95 210 115 210 145 L210 230"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      {/* Inner Vault Rib & Crown Rosette */}
      <path
        d="M124 230 L124 152 C124 128 140 112 160 112 C180 112 196 128 196 152 L196 230"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeDasharray="4 3"
        strokeLinecap="round"
      />
      <circle cx="160" cy="135" r="4" stroke="currentColor" strokeWidth="1.2" />

      {/* Side Decorative Grooves / Pilasters */}
      <line x1="75" y1="95" x2="75" y2="220" stroke="currentColor" strokeWidth="1.2" strokeDasharray="6 4" />
      <line x1="90" y1="95" x2="90" y2="220" stroke="currentColor" strokeWidth="1.2" strokeDasharray="6 4" />
      <line x1="230" y1="95" x2="230" y2="220" stroke="currentColor" strokeWidth="1.2" strokeDasharray="6 4" />
      <line x1="245" y1="95" x2="245" y2="220" stroke="currentColor" strokeWidth="1.2" strokeDasharray="6 4" />

      {/* INDIA Inscription line */}
      <line x1="120" y1="72" x2="200" y2="72" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

/**
 * Dotted Flight Trail with Origami Jet and Sparkles
 */
export function DottedFlightTrail({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none pointer-events-none ${className}`}
    >
      <path
        d="M15 100 C 60 110, 90 30, 160 40 C 190 45, 210 25, 220 15"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="5 5"
        strokeLinecap="round"
      />
      {/* Paper Airplane */}
      <path d="M220 15 L 208 24 L 212 18 L 202 16 Z" fill="currentColor" />
      <path d="M220 15 L 214 26 L 212 18 Z" fill="currentColor" fillOpacity="0.6" />
      {/* Sparkles */}
      <circle cx="95" cy="45" r="2" fill="currentColor" />
      <circle cx="140" cy="22" r="1.5" fill="currentColor" />
      <circle cx="185" cy="65" r="2" fill="currentColor" />
    </svg>
  )
}

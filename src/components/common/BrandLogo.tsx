'use client'

import React from 'react'
import Image from 'next/image'

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  showText?: boolean
  className?: string
  textClassName?: string
  subtitle?: string
}

export function BrandLogo({
  size = 'md',
  showText = true,
  className = '',
  textClassName = '',
  subtitle
}: BrandLogoProps) {
  const dimensions = {
    sm: { img: 28, text: 'text-base font-bold', sub: 'text-[10px]' },
    md: { img: 36, text: 'text-xl font-black', sub: 'text-xs' },
    lg: { img: 48, text: 'text-2xl font-black', sub: 'text-sm' },
    xl: { img: 64, text: 'text-4xl font-black', sub: 'text-base' },
    '2xl': { img: 120, text: 'text-5xl font-black', sub: 'text-lg' }
  }[size]

  return (
    <div className={`relative flex items-center gap-2.5 bg-transparent select-none ${className}`}>
      <div className="relative flex items-center justify-center shrink-0 bg-transparent">
        <Image
          src="/logo.png"
          alt="WayORA Logo"
          width={dimensions.img}
          height={dimensions.img}
          className="object-contain select-none bg-transparent"
          priority
        />
      </div>
      {showText && (
        <div className="flex flex-col leading-tight bg-transparent">
          <span className={`tracking-wide text-white ${dimensions.text} ${textClassName}`}>
            WayORA
          </span>
          {subtitle && (
            <span className={`text-slate-400 font-medium ${dimensions.sub}`}>
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export default BrandLogo


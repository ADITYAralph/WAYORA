'use client'

import React from 'react'
import Image from 'next/image'

interface BackdropProps {
  imageSrc: string
  opacity?: string
}

export function HeritageSkylineBackdrop({
  imageSrc,
  opacity = 'opacity-75'
}: BackdropProps) {
  return (
    <div
      className={`fixed bottom-0 left-0 right-0 w-full pointer-events-none z-0 select-none overflow-hidden flex items-end justify-center ${opacity}`}
      aria-hidden="true"
    >
      <div className="relative w-full h-48 sm:h-64 md:h-80 lg:h-96 max-w-[1920px]">
        <Image
          src={imageSrc}
          alt="WayORA Heritage Skyline Backdrop"
          fill
          priority
          className="object-cover object-bottom"
        />
        {/* Subtle top fade into the ice-blue background */}
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-[#F0F8FF]" />
      </div>
    </div>
  )
}

export default HeritageSkylineBackdrop

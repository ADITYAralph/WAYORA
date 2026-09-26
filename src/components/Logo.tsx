import Image from 'next/image'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  variant?: 'default' | 'white' | 'mono'
}

export function Logo({ size = 'md', className = '' }: LogoProps) {
  const sizePixels = {
    sm: 24,
    md: 36,
    lg: 48
  }[size]

  return (
    <Image
      src="/logo.png"
      alt="WayORA Logo"
      width={sizePixels}
      height={sizePixels}
      className={`rounded-lg object-contain ${className}`}
    />
  )
}

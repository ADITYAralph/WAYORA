'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Shield, Smartphone, Users, AlertTriangle, Eye, MapPin, Globe, Car, Compass, ShieldCheck, ScanSearch } from 'lucide-react'
import { AuthModal } from '@/components/auth/AuthModal'
import { MonumentSidebar } from '@/components/MonumentSidebar'
import { MonumentDetail } from '@/components/MonumentDetail'
import { MonumentSlideshow } from '@/components/MonumentSlideshow'
import { useAuth } from '@/contexts/AuthContext'
import { Monument } from '@/data/monuments'
import UserProfile from '../components/UserProfile'
import GeofencingModal from '../components/GeofencingModal'
import { BrandLogo } from '@/components/common/BrandLogo'
import { AirplaneTrailDoodle, HeartSparkleDoodle, DottedPathDoodle, HandwrittenAccent, CompassDoodle } from '@/components/ui/Doodles'
import { HeritageSkylineBackdrop } from '@/components/layout/HeritageSkylineBackdrop'

export default function HomePage() {
  const router = useRouter()
  const { user, loading: authLoading, logout } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [animationPhase, setAnimationPhase] = useState(0)
  const [selectedMonument, setSelectedMonument] = useState<Monument | null>(null)
  const [isGeofencingOpen, setIsGeofencingOpen] = useState(false)

  useEffect(() => {
    // Check if intro splash has already run this session
    const hasLoaded = sessionStorage.getItem('hasLoadedWayORAIntro')
    if (hasLoaded) {
      setIsLoading(false)
      return
    }

    // First visit: show clean splash, smoothly transition to navbar, then complete
    setIsLoading(true)
    const timer1 = setTimeout(() => setAnimationPhase(1), 100)
    const timer2 = setTimeout(() => setAnimationPhase(2), 700)
    const timer3 = setTimeout(() => {
      sessionStorage.setItem('hasLoadedWayORAIntro', 'true')
      setIsLoading(false)
    }, 1400)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, [])

  const handleMonumentSelect = (monument: Monument) => {
    setSelectedMonument(monument)
  }

  const closeMonumentDetail = () => {
    setSelectedMonument(null)
  }

  const handleGeofencingClick = () => {
    setIsGeofencingOpen(true)
  }

  // Get user display name with fallback
  const getUserDisplayName = () => {
    if (user?.displayName) return user.displayName
    if (user?.email) return user.email.split('@')[0]
    return 'Aditya'
  }

  // Get user profile picture with fallback
  const getUserProfilePic = () => {
    if (user?.photoURL) return user.photoURL
    return '/api/placeholder/40/40'
  }

  // Create user object for UserProfile component
  const userProfileData = {
    name: getUserDisplayName(),
    profilePic: getUserProfilePic(),
    email: user?.email || '',
    uid: user?.uid || '',
    emailVerified: user?.emailVerified || false
  }

  // Loading Screen Component - Clean Crisp White with Centered Transparent Logo
  if (isLoading) {
    return (
      <div className={`fixed inset-0 z-50 bg-[#F0F8FF] flex flex-col items-center justify-center overflow-hidden transition-opacity duration-500 ${
        animationPhase >= 2 ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}>
        <div className={`flex flex-col items-center justify-center text-center transition-all duration-700 ease-out ${
          animationPhase >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}>
          <div className="relative w-44 h-44 md:w-60 md:h-60 flex items-center justify-center bg-transparent mb-4 animate-pulse">
            <img
              src="/logo.png"
              alt="WayORA Logo"
              className="w-full h-full object-contain bg-transparent select-none drop-shadow-md"
            />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl md:text-3xl font-black text-[#0C2340] tracking-wider">
              WayORA
            </h2>
            <p className="text-xs md:text-sm font-semibold tracking-widest text-sky-600 uppercase">
              Smart Tourism Safety & Transit System
            </p>
          </div>

          <div className="mt-6 flex items-center gap-2">
            <span className="text-xs font-semibold tracking-widest text-slate-400 uppercase">
              by <span className="text-sky-700 font-bold">RUDRACORE</span>
            </span>
          </div>
        </div>
      </div>
    )
  }

  // Show authentication modal if user is not authenticated
  if (!authLoading && !user) {
    return <AuthModal />
  }

  // Show loading if auth is still loading
  if (authLoading) {
    return (
      <div className="fixed inset-0 bg-[#F0F8FF] flex items-center justify-center">
        <div className="text-center text-slate-800">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
          <p className="text-sm font-medium text-slate-500">Loading your safe journey...</p>
        </div>
      </div>
    )
  }

  // Main Website Content - Editorial Ice-Blue Theme
  return (
    <div className="min-h-screen w-full overflow-x-hidden relative bg-[#F0F8FF] text-slate-800">
      {/* Heritage Skyline 01 Backdrop for Homepage */}
      <HeritageSkylineBackdrop imageSrc="/heritage-skyline01.png" opacity="opacity-75" />

      {/* MONUMENT BACKGROUND SLIDESHOW WITH CRISP DAYLIGHT PRESENTATION */}
      <MonumentSlideshow />

      {/* Header - Crisp White Bar with Expanded Wide Centered Logo */}
      <header className="fixed top-0 left-0 right-0 z-50 w-full px-6 bg-white/95 backdrop-blur-md shadow-[0_2px_15px_rgba(2,132,199,0.06)] border-b border-sky-100 animate-slideDown h-20 md:h-24">
        <div className="relative flex items-center justify-between w-full h-full max-w-7xl mx-auto">
          {/* Left Area (Live Map Button) */}
          <div className="flex items-center gap-2 z-10">
            <button
              onClick={handleGeofencingClick}
              className="flex items-center gap-2 px-4 py-2 bg-sky-50 text-sky-700 hover:bg-sky-100 rounded-full font-semibold text-xs md:text-sm transition-all border border-sky-200/80 shadow-xs"
              title="Open Live Geofencing Map"
            >
              <MapPin size={16} className="text-sky-600" />
              <span className="hidden sm:block">Explore Live Map</span>
            </button>
          </div>

          {/* Centered Expanded Focal Brand Logo */}
          <div 
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer flex items-center justify-center w-72 sm:w-96 md:w-[420px] h-full py-1.5 z-0"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <img
              src="/logo.png"
              alt="WayORA Logo"
              width={600}
              height={160}
              className="w-full h-full object-contain max-h-16 md:max-h-20 select-none bg-transparent transition-transform duration-200 hover:scale-[1.02]"
            />
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-3 z-10">
            <div className="hidden md:block text-right pr-1">
              <p className="text-xs text-slate-400 font-medium">Welcome traveler,</p>
              <p className="text-sm font-bold text-[#0C2340]">{getUserDisplayName()}</p>
            </div>

            <UserProfile 
              user={userProfileData}
              onLogout={logout}
            />
          </div>
        </div>
      </header>

      {/* Monument Sidebar */}
      <MonumentSidebar 
        onMonumentSelect={handleMonumentSelect}
        selectedMonument={selectedMonument}
      />

      {/* Monument Detail */}
      {selectedMonument && (
        <MonumentDetail 
          monument={selectedMonument}
          onClose={closeMonumentDetail}
        />
      )}

      {/* Geofencing Modal */}
      <GeofencingModal 
        isOpen={isGeofencingOpen}
        onClose={() => setIsGeofencingOpen(false)}
      />

      {/* CENTERED MAIN CONTENT - Editorial Layout */}
      <main className="w-full px-4 sm:px-8 pt-28 md:pt-36 pb-20 relative z-10">
        <div className="max-w-6xl mx-auto relative">
          <div className={`transition-all duration-300 ${selectedMonument ? 'pr-80' : ''}`}>
            
            {/* Hero Editorial Card */}
            <div className="relative mb-16 rounded-3xl bg-white/95 backdrop-blur-md p-8 sm:p-14 border border-sky-100 shadow-[0_12px_40px_rgba(2,132,199,0.08)] overflow-hidden text-center">
              
              {/* Decorative Travel Doodles */}
              <div className="absolute -top-4 -left-4 w-32 h-20 opacity-70 hidden md:block">
                <AirplaneTrailDoodle className="w-full h-full" />
              </div>
              <div className="absolute top-6 right-6 w-20 h-20 opacity-80 hidden md:block">
                <HeartSparkleDoodle className="w-full h-full" />
              </div>
              <div className="absolute bottom-4 left-8 w-44 h-14 opacity-50 hidden lg:block">
                <DottedPathDoodle className="w-full h-full" />
              </div>

              {/* Tagline Pill */}
              <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-sky-50 border border-sky-200 text-sky-800 text-xs font-bold tracking-wider uppercase mb-6 shadow-2xs">
                <span>✦</span>
                <span>DISCOVER YOUR WAY</span>
                <span>✦</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-extrabold text-[#0C2340] tracking-tight leading-tight mb-6">
                Traveling is exciting, <br className="hidden sm:inline" />
                <span className="text-sky-600 font-serif italic">but it's not always easy...</span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed mb-10">
                WayORA acts as your smart, quiet travel guardian. Experience verified rides with locked fares, 
                anti-diversion alarms, verified digital identity, and direct emergency dispatch.
              </p>

              {/* Slogan Accent */}
              <div className="mb-10">
                <HandwrittenAccent className="text-xl sm:text-2xl" badge="Verified Protection">
                  "Explore More, Worry Less ♡"
                </HandwrittenAccent>
              </div>

              <div className="flex flex-wrap gap-4 justify-center items-center">
                <button
                  onClick={() => router.push('/digital-id')}
                  className="bg-sky-600 hover:bg-sky-700 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-sky-600/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  Get Digital Tourist ID →
                </button>

                <button
                  onClick={() => router.push('/authority')}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-8 py-4 rounded-full font-bold text-lg transition-all border border-slate-200 shadow-2xs"
                >
                  Authority Command Portal
                </button>
              </div>
            </div>

            {/* Section Heading */}
            <div className="text-center mb-10">
              <span className="text-xs font-bold uppercase tracking-widest text-sky-600 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
                SAFETY & TRANSIT SUITE
              </span>
              <h2 className="text-3xl font-extrabold text-[#0C2340] mt-3">
                Everything you need for effortless travel
              </h2>
            </div>

            {/* Features 6-Card Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-20">
              {[
                { 
                  icon: Car, 
                  color: 'sky',
                  bg: 'bg-sky-50',
                  iconColor: 'text-sky-600',
                  border: 'border-sky-100',
                  badge: 'Anti-Diversion',
                  title: 'Safe Ride Shield', 
                  desc: 'Book verified cabs & autos with fair-fare transparency and real-time anti-diversion route locking.', 
                  link: '/ride'
                },
                { 
                  icon: AlertTriangle, 
                  color: 'rose',
                  bg: 'bg-rose-50',
                  iconColor: 'text-rose-600',
                  border: 'border-rose-100',
                  badge: '24-Byte SMS Fallback',
                  title: 'Silent SOS Beacon', 
                  desc: '1-tap discreet emergency dispatch with automatic 24-byte offline SMS fallback when data drops.', 
                  link: '/sos'
                },
                { 
                  icon: MapPin, 
                  color: 'emerald',
                  bg: 'bg-emerald-50',
                  iconColor: 'text-emerald-600',
                  border: 'border-emerald-100',
                  badge: 'Instant Boundary Alerts',
                  title: 'Geo-Fencing Safety', 
                  desc: 'Smart alerts when entering caution zones with real-time location monitoring and safety ratios.', 
                  isClickable: true
                },
                { 
                  icon: Compass, 
                  color: 'indigo',
                  bg: 'bg-indigo-50',
                  iconColor: 'text-indigo-600',
                  border: 'border-indigo-100',
                  badge: 'Safety Scoring',
                  title: 'Radar Discovery', 
                  desc: 'Discover famous markets, monuments, and hotels with live safety ratios and proximity alert popups.', 
                  link: '/explore'
                },
                { 
                  icon: ShieldCheck, 
                  color: 'amber',
                  bg: 'bg-amber-50',
                  iconColor: 'text-amber-600',
                  border: 'border-amber-100',
                  badge: 'Police & Tourism Beat',
                  title: 'Authority Command Room', 
                  desc: 'Real-time monitoring dashboard for police and tourism departments with 1-click E-FIR generation.', 
                  link: '/authority'
                },
                { 
                  icon: ScanSearch, 
                  color: 'teal',
                  bg: 'bg-teal-50',
                  iconColor: 'text-teal-600',
                  border: 'border-teal-100',
                  badge: 'CCPA & ASI Auditor',
                  title: 'Bill & Scam Inspector', 
                  desc: 'Camera OCR auditor to detect illegal service charges, tax fraud, and verify official ASI entry tickets.', 
                  link: '/inspector'
                }
              ].map((feature, index) => (
                <div 
                  key={index} 
                  className="bg-white rounded-3xl p-8 border border-sky-100/90 shadow-[0_8px_30px_rgb(2,132,199,0.06)] hover:shadow-[0_16px_40px_rgb(2,132,199,0.12)] transition-all duration-300 transform hover:-translate-y-1 cursor-pointer flex flex-col justify-between group"
                  onClick={() => {
                    if (feature.isClickable) {
                      handleGeofencingClick()
                    } else if (feature.link) {
                      router.push(feature.link)
                    }
                  }}
                >
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className={`w-14 h-14 ${feature.bg} rounded-2xl flex items-center justify-center border ${feature.border} transition-transform group-hover:scale-110`}>
                        <feature.icon className={feature.iconColor} size={28} />
                      </div>
                      <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60">
                        {feature.badge}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-[#0C2340] mb-3 group-hover:text-sky-600 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed mb-6">
                      {feature.desc}
                    </p>
                  </div>
                  
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-sky-600">
                    <span>{feature.isClickable ? 'Open Geofencing Map' : 'Launch Feature'}</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Travel Quote Banner */}
            <div className="rounded-3xl bg-gradient-to-r from-sky-600 to-indigo-700 p-10 sm:p-14 text-center text-white shadow-xl mb-16 relative overflow-hidden">
              <div className="absolute top-2 right-6 opacity-20 w-32 h-32 hidden md:block">
                <CompassDoodle className="w-full h-full" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
                Ready to travel with peace of mind?
              </h2>
              <p className="text-sky-100 text-base sm:text-lg max-w-2xl mx-auto mb-8 font-light">
                Generate your tamper-proof tourist ID, lock your transit routes, and experience India with confidence.
              </p>
              <button
                onClick={() => router.push('/digital-id')}
                className="bg-white text-sky-700 hover:bg-sky-50 px-10 py-4 rounded-full font-bold text-base shadow-lg transition-all transform hover:scale-105 active:scale-95"
              >
                Create Free Tourist ID ♡
              </button>
            </div>

          </div>
        </div>
      </main>

      {/* Editorial Footer */}
      <footer className="relative z-10 bg-white border-t border-sky-100 py-12 text-slate-600">
        <div className="max-w-7xl mx-auto px-8 text-center flex flex-col items-center justify-center">
          <div className="mb-4">
            <BrandLogo size="lg" />
          </div>
          <p className="text-sm font-medium text-slate-500">
            © 2026 WayORA — Smart Tourism Safety & Transit Infrastructure.
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Protected by Real-Time Telemetry, OSRM Road Verification & Cryptographic Tourist Identity
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-100 text-xs font-semibold text-sky-700">
            <span>Built by</span>
            <span className="font-bold text-sky-900">RUDRACORE</span>
          </div>
        </div>
      </footer>
    </div>
  )
}


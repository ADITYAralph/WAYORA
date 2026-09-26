'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface LoadingScreenProps {
  onAnimationComplete: () => void
}

export function LoadingScreen({ onAnimationComplete }: LoadingScreenProps) {
  const [showLoading, setShowLoading] = useState(true)
  const [animateToHeader, setAnimateToHeader] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number}>>([])

  // Client-side only initialization
  useEffect(() => {
    setIsClient(true)
    const width = window.innerWidth
    const height = window.innerHeight
    setWindowSize({ width, height })
    
    // Generate particles with consistent IDs
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * width,
      y: Math.random() * height,
    }))
    setParticles(newParticles)
  }, [])

  useEffect(() => {
    // Simulate loading time
    const loadingTimer = setTimeout(() => {
      setAnimateToHeader(true)
      
      // Complete animation after transition
      const animationTimer = setTimeout(() => {
        setShowLoading(false)
        onAnimationComplete()
      }, 1500)
      
      return () => clearTimeout(animationTimer)
    }, 2500)

    return () => clearTimeout(loadingTimer)
  }, [onAnimationComplete])

  if (!showLoading) return null

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden"
      suppressHydrationWarning={true}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black to-purple-900/20" />
      
      {/* Animated Background Particles - Only render on client */}
      {isClient && (
        <div className="absolute inset-0 overflow-hidden">
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute w-1 h-1 bg-blue-400/30 rounded-full"
              initial={{ 
                left: particle.x,
                top: particle.y 
              }}
              animate={{
                x: [0, (Math.random() - 0.5) * 100],
                y: [0, (Math.random() - 0.5) * 100],
              }}
              transition={{
                duration: 10 + Math.random() * 5,
                repeat: Infinity,
                ease: "linear",
                repeatType: "reverse"
              }}
              style={{
                left: particle.x,
                top: particle.y,
              }}
            />
          ))}
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 text-center">
        {!animateToHeader ? (
          // Center Loading State
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center"
          >
            {/* WayORA Title */}
            <motion.h1
              animate={{ 
                textShadow: [
                  "0 0 20px #3b82f6",
                  "0 0 40px #3b82f6", 
                  "0 0 20px #3b82f6"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-8xl md:text-9xl font-black text-white mb-4 select-none"
              style={{
                fontFamily: '"Inter", "Arial", sans-serif',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6, #06b6d4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              WayORA
            </motion.h1>

            {/* By RUDRACORE */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-2xl md:text-3xl text-gray-300 font-light tracking-wider select-none"
              style={{ fontFamily: '"Inter", sans-serif' }}
            >
              by <span className="font-medium text-blue-400">RUDRACORE</span>
            </motion.p>

            {/* Loading Animation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="mt-12 flex items-center gap-2"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"
              />
              <span className="text-gray-400 text-lg ml-4">Initializing Safety Systems...</span>
            </motion.div>
          </motion.div>
        ) : (
          // Animate to Header Position
          <motion.div
            initial={{ 
              scale: 1, 
              x: 0, 
              y: 0,
            }}
            animate={{ 
              scale: 0.3,
              x: isClient ? -(windowSize.width * 0.35) : -280,
              y: isClient ? -(windowSize.height * 0.42) : -250,
            }}
            transition={{ 
              duration: 1.5, 
              ease: [0.4, 0, 0.2, 1],
              type: "tween"
            }}
            className="text-white font-black select-none text-8xl"
            style={{
              fontFamily: '"Inter", "Arial", sans-serif',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            WayORA
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

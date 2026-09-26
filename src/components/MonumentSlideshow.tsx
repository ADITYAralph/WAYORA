'use client'

import { useState, useEffect } from 'react'

const monumentImages = [
  {
    url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80',
    name: 'Taj Mahal',
    location: 'Agra, India'
  },
  {
    url: 'https://as2.ftcdn.net/v2/jpg/03/62/28/37/1000_F_362283704_93qXOialKYbG3zQdT2tbDCbMLweZc3rb.jpg',
    name: 'India Gate',
    location: 'New Delhi, India'
  },
  {
    url: 'https://images.unsplash.com/photo-1607836046730-3317bd58a31b?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aGltYWNoYWwlMjBwcmFkZXNoJTIwaW5kaWF8ZW58MHx8MHx8fDA%3D',
    name: 'Mountains',
    location: 'Himachal, India'
  },
  {
    url: 'https://thumbs.dreamstime.com/b/hawa-mahal-palace-jaipur-rajasthan-winds-36197345.jpg',
    name: 'Hawa Mahal',
    location: 'Jaipur, Rajasthan'
  },
  {
    url: 'https://t3.ftcdn.net/jpg/02/00/55/94/360_F_200559473_wEDZgxSDPPjQfgX3sQqXcjz4ph1a79Yt.jpg',
    name: 'Gateway of India',
    location: 'Mumbai, Maharashtra'
  },
  {
    url: 'https://karnatakatourism.org/wp-content/uploads/2020/12/mysuru-palace.jpg',
    name: 'Mysore Palace',
    location: 'Mysore, Karnataka'
  }
]

export function MonumentSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % monumentImages.length)
    }, 5000) // Change every 5 seconds

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      {/* Slideshow Background */}
      <div className="absolute inset-0">
        {monumentImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-2000 ease-in-out ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div
              className="w-full h-full bg-cover bg-center bg-no-repeat transform scale-110"
              style={{
                backgroundImage: `url(${image.url})`,
                filter: 'brightness(0.85) contrast(1.05) saturate(1.1)'
              }}
            />
            
            {/* Subtle Ultra-Light Dark Tint for contrast while keeping image bright and clear */}
            <div className="absolute inset-0 bg-black/25" />
            
            {/* Dot Pattern Overlay */}
            <div className="absolute inset-0 opacity-5" 
                 style={{
                   backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
                   backgroundSize: '30px 30px'
                 }} 
            />
          </div>
        ))}
      </div>

      {/* Monument Info Display */}
      {isLoaded && (
        <div className="absolute bottom-8 left-8 z-10 text-white">
          <div className="bg-black/30 backdrop-blur-md rounded-lg px-4 py-2 border border-white/20">
            <h3 className="font-semibold text-lg">{monumentImages[currentIndex].name}</h3>
            <p className="text-sm opacity-90">{monumentImages[currentIndex].location}</p>
          </div>
        </div>
      )}

      {/* Slide Indicators */}
      <div className="absolute bottom-8 right-8 z-10 flex gap-2">
        {monumentImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? 'bg-white scale-125' 
                : 'bg-white/40 hover:bg-white/60'
            }`}
          />
        ))}
      </div>

      <style jsx>{`
        .transition-opacity {
          transition-property: opacity;
        }
        .duration-2000 {
          transition-duration: 2000ms;
        }
      `}</style>
    </div>
  )
}

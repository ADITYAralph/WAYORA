'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Shield, Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import { BrandLogo } from '@/components/common/BrandLogo'

// Famous Indian monuments for slideshow (keeping your URLs)
const indianMonuments = [
  {
    name: 'Taj Mahal, Agra',
    image: 'https://upload.wikimedia.org/wikipedia/commons/6/68/Taj_Mahal%2C_Agra%2C_India.jpg'
  },
  {
    name: 'Red Fort, Delhi',
    image: 'https://www.alightindia.com/cdn/uploads/postimages/ORIGINAL/Lal%20Qila%20%20Wendy--e3656d.jpg'
  },
  {
    name: 'Gateway of India, Mumbai',
    image: 'https://pohcdn.com/sites/default/files/styles/paragraph__hero_banner__hb_image__1280bp/public/hero_banner/Gateway-to-India_0.jpg'
  },
  {
    name: 'Hawa Mahal, Jaipur',
    image: 'https://s7ap1.scene7.com/is/image/incredibleindia/hawa-mahal-jaipur-rajasthan-1-attr-hero?qlt=82&ts=1742186379435'
  },
  {
    name: 'Mysore Palace, Karnataka',
    image: 'https://www.japjitravel.com/resizer/resizer.php?file=../jap/media/uploads/Mysore-Palace.jpg&width=750&height=375&action=resize&quality=100'
  },
  {
    name: 'Victoria Memorial, Kolkata',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Victoria_Memorial_situated_in_Kolkata.jpg/500px-Victoria_Memorial_situated_in_Kolkata.jpg'
  },
  {
    name: 'Qutub Minar, Delhi',
    image: 'https://s7ap1.scene7.com/is/image/incredibleindia/qutab-minar-delhi-attr-hero?qlt=82&ts=1742169673469'
  },
  {
    name: 'Charminar, Hyderabad',
    image: 'https://media.hitex.co.in/posts/2022/charminar-the-arc-de-triomphe-of-the-east.jpg?1658579435'
  },
  {
    name: 'Meenakshi Temple, Madurai',
    image: 'https://admin.southindiatoursandtravels.com/pages/gallery/24742.jpg'
  },
  {
    name: 'Golden Temple, Amritsar',
    image: 'https://media.istockphoto.com/id/535570117/photo/golden-temple-in-amritsar-punjab-india.jpg?s=2048x2048&w=is&k=20&c=OM4d72Yq8eEGPWOFfeR8usPcGu7eOsn71i9H7pZtXoo='
  }
]

export function AuthModal() {
  const [isSignIn, setIsSignIn] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const { signIn, signUp, signInWithGoogle } = useAuth()

  // Slideshow effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === indianMonuments.length - 1 ? 0 : prevIndex + 1
      )
    }, 4000) // Change image every 4 seconds

    return () => clearInterval(interval)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isSignIn) {
        await signIn(formData.email, formData.password)
      } else {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match')
        }
        if (formData.password.length < 6) {
          throw new Error('Password must be at least 6 characters')
        }
        await signUp(formData.email, formData.password, formData.name)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError('')
    setGoogleLoading(true)

    try {
      await signInWithGoogle()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 overflow-hidden flex items-center justify-center p-4">
      {/* Slideshow Background */}
      <div className="absolute inset-0">
        {indianMonuments.map((monument, index) => (
          <div
            key={index}
            className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-2000 ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              backgroundImage: `url(${monument.image})`
            }}
          >
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/40"></div>
          </div>
        ))}
        
        {/* Monument name label */}
        <div className="absolute bottom-8 left-8 z-10">
          <div className="glass-card px-4 py-2">
            <p className="text-white text-sm font-medium drop-shadow-lg">
              {indianMonuments[currentImageIndex].name}
            </p>
          </div>
        </div>

        {/* Slideshow indicators */}
        <div className="absolute bottom-8 right-8 z-10 flex gap-2">
          {indianMonuments.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`h-2 rounded-full transition-all duration-300 glass-indicator ${
                index === currentImageIndex 
                  ? 'bg-white w-6 shadow-lg' 
                  : 'bg-white/50 w-2 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Premium Glass Floating Elements */}
      <div className="absolute inset-0 opacity-5 z-5">
        <div className="absolute top-10 left-10 w-20 h-20 glass-orb animate-pulse"></div>
        <div className="absolute top-1/4 right-20 w-8 h-8 glass-orb animate-bounce"></div>
        <div className="absolute bottom-20 left-1/3 w-12 h-12 glass-orb animate-ping"></div>
        <div className="absolute bottom-1/4 right-1/4 w-6 h-6 glass-orb animate-pulse"></div>
      </div>

      {/* Premium Glassmorphism Auth Modal */}
      <div className="premium-glass-modal p-8 w-full max-w-md relative z-20 animate-slideUp">
        {/* Glass Shimmer Effect */}
        <div className="absolute inset-0 rounded-2xl glass-shimmer pointer-events-none"></div>
        
        {/* Header */}
        <div className="text-center mb-8 relative z-10 flex flex-col items-center">
          <div className="mb-4">
            <BrandLogo size="lg" showText={false} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-2xl">WayORA</h1>
          <p className="text-white/90 drop-shadow-lg">Smart Tourist Safety System</p>
          <p className="text-sm text-white/80 mt-2 drop-shadow">
            {isSignIn ? 'Welcome back!' : 'Join WayORA today'}
          </p>
        </div>

        {/* Google Sign-In Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          className="google-signin-button relative z-10 mb-6"
        >
          <div className="flex items-center justify-center gap-3">
            {googleLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
            ) : (
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            <span className="text-gray-700 font-medium">
              {googleLoading ? 'Signing in...' : 'Continue with Google'}
            </span>
          </div>
        </button>

        {/* Divider */}
        <div className="flex items-center mb-6 relative z-10">
          <div className="flex-1 h-px bg-white/30"></div>
          <span className="mx-4 text-white/60 text-sm font-medium">or</span>
          <div className="flex-1 h-px bg-white/30"></div>
        </div>

        {/* Toggle Buttons */}
        <div className="flex glass-toggle rounded-xl p-1 mb-6 relative z-10">
          <button
            type="button"
            onClick={() => setIsSignIn(true)}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-300 ${
              isSignIn 
                ? 'glass-button-active text-white shadow-lg' 
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setIsSignIn(false)}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-300 ${
              !isSignIn 
                ? 'glass-button-active text-white shadow-lg' 
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="glass-error px-4 py-3 rounded-lg mb-4 text-sm relative z-10">
            <div className="text-red-100 drop-shadow font-medium">{error}</div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          {/* Name Field (Sign Up Only) */}
          {!isSignIn && (
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2 drop-shadow">
                <User size={16} className="inline mr-2" />
                Full Name *
              </label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="glass-input"
                placeholder="Enter your full name"
              />
            </div>
          )}

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2 drop-shadow">
              <Mail size={16} className="inline mr-2" />
              Email Address *
            </label>
            <input
              required
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="glass-input"
              placeholder="Enter your email"
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2 drop-shadow">
              <Lock size={16} className="inline mr-2" />
              Password *
            </label>
            <div className="relative">
              <input
                required
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="glass-input pr-10"
                placeholder="Enter your password"
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white transition-colors glass-eye-button"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {!isSignIn && (
              <p className="text-xs text-white/70 mt-1 drop-shadow">Password must be at least 6 characters</p>
            )}
          </div>

          {/* Confirm Password Field (Sign Up Only) */}
          {!isSignIn && (
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2 drop-shadow">
                <Lock size={16} className="inline mr-2" />
                Confirm Password *
              </label>
              <input
                required
                type={showPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                className="glass-input"
                placeholder="Confirm your password"
                minLength={6}
              />
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="glass-submit-button"
          >
            <div className="relative z-10">
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  {isSignIn ? 'Signing In...' : 'Creating Account...'}
                </div>
              ) : (
                isSignIn ? 'Sign In' : 'Create Account'
              )}
            </div>
          </button>
        </form>

        {/* Footer */}
        <div className="text-center mt-6 relative z-10">
          <p className="text-sm text-white/80 drop-shadow">
            {isSignIn ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => setIsSignIn(!isSignIn)}
              className="text-blue-200 hover:text-blue-100 font-medium transition-colors glass-link"
            >
              {isSignIn ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
          <p className="text-xs text-white/60 mt-4 drop-shadow">
            Developed by <span className="font-medium text-white/80">RUDRACORE</span>
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from { transform: translateY(50px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%) rotate(45deg); }
          100% { transform: translateX(400%) rotate(45deg); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .animate-slideUp {
          animation: slideUp 0.8s ease-out;
        }
        
        .premium-glass-modal {
          background: linear-gradient(135deg, 
            rgba(255, 255, 255, 0.15) 0%,
            rgba(255, 255, 255, 0.05) 100%);
          backdrop-filter: blur(30px);
          -webkit-backdrop-filter: blur(30px);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 
            0 25px 50px rgba(0, 0, 0, 0.25),
            0 8px 32px rgba(31, 38, 135, 0.37),
            inset 0 1px 0 rgba(255, 255, 255, 0.4),
            inset 0 -1px 0 rgba(0, 0, 0, 0.1);
          position: relative;
          overflow: hidden;
          animation: float 6s ease-in-out infinite;
        }
        
        .google-signin-button {
          width: 100%;
          padding: 12px 24px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          font-weight: 500;
        }
        
        .google-signin-button:hover:not(:disabled) {
          background: rgba(255, 255, 255, 1);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }
        
        .google-signin-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .glass-shimmer {
          background: linear-gradient(135deg,
            transparent 0%,
            rgba(255, 255, 255, 0.2) 25%,
            rgba(255, 255, 255, 0.4) 50%,
            rgba(255, 255, 255, 0.2) 75%,
            transparent 100%);
          transform: translateX(-100%) rotate(45deg);
          animation: shimmer 4s infinite;
          width: 200%;
          height: 200%;
        }
        
        .glass-card {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(31, 38, 135, 0.3);
        }
        
        .glass-orb {
          background: radial-gradient(circle at 30% 30%, 
            rgba(255, 255, 255, 0.4) 0%,
            rgba(255, 255, 255, 0.2) 50%,
            transparent 100%);
          backdrop-filter: blur(15px);
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(31, 38, 135, 0.3);
        }
        
        .glass-icon-bg {
          background: linear-gradient(135deg, 
            rgba(59, 130, 246, 0.8) 0%, 
            rgba(147, 51, 234, 0.8) 100%);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 8px 32px rgba(31, 38, 135, 0.4);
        }
        
        .glass-toggle {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .glass-button-active {
          background: rgba(255, 255, 255, 0.25);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 4px 16px rgba(31, 38, 135, 0.3);
        }
        
        .glass-input {
          width: 100%;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 12px;
          color: white;
          font-weight: 500;
          font-size: 14px;
          transition: all 0.3s ease;
        }
        
        .glass-input:focus {
          outline: none;
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(59, 130, 246, 0.5);
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
        }
        
        .glass-input::placeholder {
          color: rgba(255, 255, 255, 0.6);
        }
        
        .glass-error {
          background: rgba(239, 68, 68, 0.2);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(239, 68, 68, 0.3);
          box-shadow: 0 8px 32px rgba(239, 68, 68, 0.2);
        }
        
        .glass-submit-button {
          width: 100%;
          padding: 12px 24px;
          background: linear-gradient(135deg, 
            rgba(59, 130, 246, 0.8) 0%, 
            rgba(147, 51, 234, 0.8) 100%);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 12px;
          color: white;
          font-weight: 600;
          font-size: 18px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 8px 32px rgba(31, 38, 135, 0.4);
          position: relative;
          overflow: hidden;
        }
        
        .glass-submit-button:hover:not(:disabled) {
          background: linear-gradient(135deg, 
            rgba(59, 130, 246, 0.9) 0%, 
            rgba(147, 51, 234, 0.9) 100%);
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(31, 38, 135, 0.5);
        }
        
        .glass-submit-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .glass-eye-button {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          padding: 4px;
        }
        
        .glass-link {
          position: relative;
          overflow: hidden;
        }
        
        .glass-link:before {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 1px;
          background: rgba(147, 197, 253, 0.8);
          transition: width 0.3s ease;
        }
        
        .glass-link:hover:before {
          width: 100%;
        }
        
        .transition-opacity {
          transition-property: opacity;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .duration-2000 {
          transition-duration: 2000ms;
        }
      `}</style>
    </div>
  )
}

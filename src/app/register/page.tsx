'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Shield, Eye, EyeOff, Mail, Lock, User, ArrowLeft } from 'lucide-react'
import { BrandLogo } from '@/components/common/BrandLogo'
import { DoodleBackdrop } from '@/components/layout/DoodleBackdrop'

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', password: '' })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      const userData = {
        name: formData.name,
        email: formData.email,
        token: 'demo-jwt-token-' + Date.now()
      }

      // Store in localStorage
      localStorage.setItem('wayora_token', userData.token)
      localStorage.setItem('wayora_user', JSON.stringify(userData))

      console.log('Registration successful, redirecting to dashboard')
      router.push('/dashboard')
    } catch (error) {
      console.error('Registration error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F0F8FF] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Monument Line Art Margin Backdrop */}
      <DoodleBackdrop variant="auth" />

      {/* Top Universal Back to Hub Bar */}
      <div className="absolute top-4 left-4 z-20">
        <Link
          href="/"
          className="flex items-center gap-2 text-slate-600 hover:text-sky-700 font-semibold transition text-xs bg-white/80 backdrop-blur-md px-3.5 py-2 rounded-full border border-sky-100 shadow-2xs"
        >
          <ArrowLeft size={14} />
          <span>← Back to WayORA Hub</span>
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-[0_8px_30px_rgb(2,132,199,0.08)] border border-sky-100 w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="mb-4">
            <BrandLogo size="lg" showText={false} />
          </div>
          <h1 className="text-2xl font-black text-[#0C2340] mb-1">Join WayORA</h1>
          <p className="text-slate-500 text-xs">Create your digital tourist safety pass</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-700 text-xs font-bold mb-1.5">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
                placeholder="Aditya Kaushik"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 text-xs font-bold mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
                placeholder="tourist@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 text-xs font-bold mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-11 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
                placeholder="Create a strong password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-sky-600 hover:bg-sky-700 text-white py-3 rounded-2xl font-bold text-xs shadow-sm hover:shadow transition-all duration-200 disabled:opacity-70 mt-2"
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="text-center mt-6 pt-5 border-t border-slate-100">
          <p className="text-slate-500 text-xs">
            Already have an account?{' '}
            <button
              onClick={() => router.push('/signin')}
              className="text-sky-600 hover:text-sky-700 font-bold transition"
            >
              Sign In
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

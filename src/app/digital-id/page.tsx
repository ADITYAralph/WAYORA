'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { QRCodeSVG } from 'qrcode.react'
import { v4 as uuidv4 } from 'uuid'
import { BlockchainBadge } from '@/components/BlockchainBadge'
import { LanguageSelector } from '@/components/LanguageSelector'
import { User, FileText, Phone, Calendar, CreditCard, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { DoodleBackdrop } from '@/components/layout/DoodleBackdrop'

// Simple inline translation function
const useTranslation = () => {
  return {
    t: (key: string) => {
      const translations: { [key: string]: string } = {
        'digitalId': 'Digital Tourist ID',
        'generateId': 'Generate Digital ID',
        'emergencyContacts': 'Emergency Contacts',
        'itinerary': 'Trip Itinerary'
      }
      return translations[key] || key
    }
  }
}

export default function DigitalIDPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    aadhaar: '',
    passport: '',
    phone: '',
    emergencyContact: '',
    itinerary: '',
    checkInDate: '',
    checkOutDate: ''
  })
  const [generatedID, setGeneratedID] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Generate unique ID
      const touristID = uuidv4()
      const blockchainHash = `0x${Math.floor(Math.random() * 1e16).toString(16)}`
      
      const digitalID = {
        id: touristID,
        ...formData,
        createdAt: new Date().toISOString(),
        validUntil: formData.checkOutDate,
        blockchainHash,
        status: 'active'
      }

      // Simulate blockchain storage
      localStorage.setItem('tourist_digital_id', JSON.stringify(digitalID))
      localStorage.setItem('tourist_authenticated', 'true')
      
      setGeneratedID(digitalID)
      
    } catch (error) {
      console.error('ID generation failed:', error)
      alert('Failed to generate ID. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDashboard = () => {
    router.push('/dashboard')
  }

  if (generatedID) {
    return (
      <div className="min-h-screen bg-[#F0F8FF] py-12 px-4 relative overflow-hidden flex items-center justify-center">
        <DoodleBackdrop variant="full" />
        
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

        <div className="max-w-md w-full mx-auto relative z-10">
          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(2,132,199,0.08)] border border-sky-100 p-8 text-center">
            <div className="mb-4">
              <BlockchainBadge verified={true} />
            </div>
            
            <h2 className="text-2xl font-black text-[#0C2340] mb-2">Digital Tourist ID Created</h2>
            <p className="text-slate-500 text-xs mb-6">Your verifiable safety pass on the blockchain</p>

            <div className="bg-sky-50/70 border border-sky-100 rounded-2xl p-6 mb-6">
              <QRCodeSVG value={JSON.stringify(generatedID)} size={200} className="mx-auto mb-4" />
              <div className="space-y-2 text-left text-xs text-slate-700">
                <div><strong>ID:</strong> <span className="font-mono">{generatedID.id}</span></div>
                <div><strong>Name:</strong> {generatedID.name}</div>
                <div><strong>Valid Until:</strong> {new Date(generatedID.validUntil).toLocaleDateString()}</div>
                <div><strong>Blockchain Hash:</strong> <span className="font-mono text-[11px] text-sky-700">{generatedID.blockchainHash}</span></div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleDashboard}
                className="w-full bg-sky-600 hover:bg-sky-700 text-white py-3 rounded-2xl font-bold text-xs transition shadow-sm"
              >
                Go to Dashboard
              </button>
              
              <button
                onClick={() => window.print()}
                className="w-full border border-slate-200 text-slate-700 py-3 rounded-2xl font-bold text-xs hover:bg-slate-50 transition"
              >
                Print ID Card
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F0F8FF] py-10 px-4 relative overflow-hidden">
      <DoodleBackdrop variant="full" />

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Top Universal Back to Hub Bar */}
        <div className="mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-sky-700 font-semibold transition text-xs bg-white/80 backdrop-blur-md px-3.5 py-2 rounded-full border border-sky-100 shadow-2xs"
          >
            <ArrowLeft size={14} />
            <span>← Back to WayORA Hub</span>
          </Link>
        </div>

        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-black text-[#0C2340]">{t('digitalId')}</h1>
          <LanguageSelector />
        </div>

        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(2,132,199,0.08)] border border-sky-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  <User size={15} className="inline mr-1.5 text-sky-600" />
                  Full Name *
                </label>
                <input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-600 font-medium"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Phone size={16} className="inline mr-2" />
                  Phone Number *
                </label>
                <input
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-600 font-medium"
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <CreditCard size={16} className="inline mr-2" />
                  Aadhaar Number
                </label>
                <input
                  value={formData.aadhaar}
                  onChange={(e) => setFormData({...formData, aadhaar: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-600 font-medium"
                  placeholder="XXXX XXXX XXXX"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <CreditCard size={16} className="inline mr-2" />
                  Passport Number
                </label>
                <input
                  value={formData.passport}
                  onChange={(e) => setFormData({...formData, passport: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-600 font-medium"
                  placeholder="Passport number (if applicable)"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Calendar size={16} className="inline mr-2" />
                  Check-in Date *
                </label>
                <input
                  required
                  type="date"
                  value={formData.checkInDate}
                  onChange={(e) => setFormData({...formData, checkInDate: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Calendar size={16} className="inline mr-2" />
                  Check-out Date *
                </label>
                <input
                  required
                  type="date"
                  value={formData.checkOutDate}
                  onChange={(e) => setFormData({...formData, checkOutDate: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Phone size={16} className="inline mr-2" />
                {t('emergencyContacts')} *
              </label>
              <input
                required
                value={formData.emergencyContact}
                onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-600 font-medium"
                placeholder="Emergency contact phone numbers (comma-separated)"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FileText size={16} className="inline mr-2" />
                {t('itinerary')} *
              </label>
              <textarea
                required
                value={formData.itinerary}
                onChange={(e) => setFormData({...formData, itinerary: e.target.value})}
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-600 font-medium"
                placeholder="Please describe your travel plans and places you intend to visit..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Generating ID...
                </div>
              ) : (
                <>{t('generateId')}</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

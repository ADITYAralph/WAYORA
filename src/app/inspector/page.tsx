'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  ScanSearch, 
  ShieldCheck, 
  AlertTriangle, 
  FileText, 
  UploadCloud, 
  CheckCircle2, 
  XCircle, 
  ArrowLeft, 
  Car, 
  Compass, 
  Radio, 
  Info, 
  Copy, 
  Download, 
  Receipt,
  QrCode,
  Sparkles
} from 'lucide-react'
import { BrandLogo } from '@/components/common/BrandLogo'
import { DoodleBackdrop } from '@/components/layout/DoodleBackdrop'
import { HeritageSkylineBackdrop } from '@/components/layout/HeritageSkylineBackdrop'

interface SampleBill {
  id: string
  title: string
  subtitle: string
  type: 'restaurant' | 'ticket' | 'shopping'
  vendor: string
  totalAmount: number
  hasScam: boolean
  scamType?: string
  scamAmount?: number
  items: { name: string; qty: number; price: number }[]
  taxes: { name: string; percent: number; amount: number; isLegal: boolean }[]
  serviceChargePercent?: number
  serviceChargeAmount?: number
  notes: string
  verdict: 'LEGAL' | 'ILLEGAL_CHARGE' | 'FAKE_TICKET' | 'OVERCHARGED'
}

const SAMPLE_BILLS: SampleBill[] = [
  {
    id: 'sample-1',
    title: 'Mughal Treat Restaurant (Agra Cantt)',
    subtitle: 'Contains mandatory 10% Service Charge + Duplicate GST',
    type: 'restaurant',
    vendor: 'Mughal Treat Dine & Lounge, Fatehabad Rd',
    totalAmount: 2680,
    hasScam: true,
    scamType: 'Illegal Mandatory 10% Service Charge',
    scamAmount: 220,
    items: [
      { name: 'Mutton Biryani (Special)', qty: 2, price: 900 },
      { name: 'Butter Chicken (Full)', qty: 1, price: 650 },
      { name: 'Garlic Naan', qty: 4, price: 280 },
      { name: 'Mineral Water (MRP ₹20)', qty: 2, price: 120 }
    ],
    taxes: [
      { name: 'Service Charge (10% - Unlawful under CCPA 2022 Guidelines)', percent: 10, amount: 220, isLegal: false },
      { name: 'CGST (2.5%)', percent: 2.5, amount: 48.75, isLegal: true },
      { name: 'SGST (2.5%)', percent: 2.5, amount: 48.75, isLegal: true }
    ],
    serviceChargePercent: 10,
    serviceChargeAmount: 220,
    notes: 'Central Consumer Protection Authority (CCPA) guideline dated July 4, 2022 strictly prohibits restaurants from levying service charge automatically in food bills.',
    verdict: 'ILLEGAL_CHARGE'
  },
  {
    id: 'sample-2',
    title: 'ASI Official Taj Mahal QR E-Ticket',
    subtitle: 'Verified Government Archaeological Survey of India Pass',
    type: 'ticket',
    vendor: 'Archaeological Survey of India (ASI Portal)',
    totalAmount: 50,
    hasScam: false,
    items: [
      { name: 'Indian Citizen Monument Entry Pass', qty: 1, price: 50 }
    ],
    taxes: [
      { name: 'ADA Monument Toll', percent: 0, amount: 0, isLegal: true }
    ],
    notes: 'Cryptographic QR signature matches official ASI public key. Pass valid today until 18:00 hrs.',
    verdict: 'LEGAL'
  },
  {
    id: 'sample-3',
    title: 'Unauthorized Petha & Handicraft Stall',
    subtitle: 'Non-GST handwritten slip with 300% inflated markup',
    type: 'shopping',
    vendor: 'Royal Taj Souvenir Emporium (Touts Hub)',
    totalAmount: 4500,
    hasScam: true,
    scamType: 'Invalid Fake GSTIN & 300% Touts Commission',
    scamAmount: 3100,
    items: [
      { name: 'Marble Inlay Taj Miniature (3 inch)', qty: 1, price: 3200 },
      { name: 'Agra Kesar Petha (1 kg)', qty: 2, price: 1300 }
    ],
    taxes: [
      { name: 'Unregistered Misc Tax (GSTIN Fake: 09AAAAA0000A1Z5)', percent: 18, amount: 0, isLegal: false }
    ],
    notes: 'GST number failed checksum verification. Vendor is an unregistered street tout with known 40% driver kickback.',
    verdict: 'OVERCHARGED'
  }
]

export default function BillInspectorPage() {
  const [selectedSample, setSelectedSample] = useState<SampleBill>(SAMPLE_BILLS[0])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [copiedDispute, setCopiedDispute] = useState(false)
  const [customFileUploaded, setCustomFileUploaded] = useState<string | null>(null)

  const handleSelectSample = (sample: SampleBill) => {
    setIsAnalyzing(true)
    setSelectedSample(sample)
    setCustomFileUploaded(null)
    setTimeout(() => {
      setIsAnalyzing(false)
    }, 400)
  }

  const handleSimulateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsAnalyzing(true)
      const fileName = e.target.files[0].name
      setCustomFileUploaded(fileName)
      setTimeout(() => {
        setIsAnalyzing(false)
        setSelectedSample(SAMPLE_BILLS[0])
      }, 700)
    }
  }

  const disputeNoticeText = `LEGAL DISPUTE NOTICE UNDER CCPA GUIDELINES (2022)
To: Manager, ${selectedSample.vendor}
Subject: Objection against illegal mandatory levy of Service Charge / Overcharge in Bill

Sir/Madam,
Under the Central Consumer Protection Authority (CCPA) Guidelines dated July 4, 2022, no restaurant or hotel shall add service charge automatically or by default in the food bill. Service charge is strictly voluntary.

Please remove the unlawful charge of ₹${selectedSample.scamAmount || 220} from my bill immediately. Failing which, this bill along with photo evidence will be lodged on the National Consumer Helpline (NCH 1915 / consumerhelpline.gov.in) and Agra District Consumer Disputes Redressal Commission.

Tourist Name: Registered WayORA Verified Visitor
Date: ${new Date().toLocaleDateString('en-IN')}`

  const copyDispute = () => {
    navigator.clipboard.writeText(disputeNoticeText)
    setCopiedDispute(true)
    setTimeout(() => setCopiedDispute(false), 2000)
  }

  const handleCopyDispute = () => {
    copyDispute()
  }

  return (
    <div className="min-h-screen bg-[#F0F8FF] text-slate-800 font-sans selection:bg-sky-500 selection:text-white flex flex-col relative overflow-hidden">
      {/* Heritage Skyline 03 Backdrop for Inspector */}
      <HeritageSkylineBackdrop imageSrc="/heritage-skyline03.png" opacity="opacity-75" />

      {/* Monument Line Art Margin Backdrop */}
      <DoodleBackdrop variant="inspector" />

      {/* Top Universal Back to Hub Bar */}
      <div className="bg-white/85 backdrop-blur-md border-b border-sky-100 px-4 lg:px-8 py-2.5 flex items-center justify-between text-xs relative z-10">
        <Link
          href="/"
          className="flex items-center gap-2 text-slate-600 hover:text-sky-700 font-semibold transition group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition" />
          <span>← Back to WayORA Hub</span>
        </Link>
        <div className="flex items-center gap-3 text-slate-500">
          <span className="flex items-center gap-1.5 text-sky-700 font-mono font-bold">
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping"></span>
            CCPA Legal OCR Armed
          </span>
          <span className="hidden sm:inline font-mono text-slate-400">National Consumer Helpline (NCH 1915)</span>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white/95 backdrop-blur-xl border-b border-sky-100 px-4 lg:px-8 py-3 sticky top-0 z-30 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <BrandLogo size="sm" showText={false} />
            <div>
              <span className="text-lg font-black tracking-wider text-[#0C2340]">WayORA</span>
              <span className="text-xs text-sky-600 font-bold ml-1.5 uppercase">AI BILL & OVERCHARGE INSPECTOR</span>
            </div>
          </Link>
        </div>

        <nav className="hidden sm:flex items-center gap-2 text-xs text-slate-600 font-medium">
          <Link href="/ride" className="px-3.5 py-1.5 rounded-full hover:bg-sky-50 text-slate-700 hover:text-sky-700 transition flex items-center gap-1.5">
            <Car size={14} className="text-sky-600" /> Safe Ride
          </Link>
          <Link href="/sos" className="px-3.5 py-1.5 rounded-full hover:bg-rose-50 text-slate-700 hover:text-rose-600 transition flex items-center gap-1.5">
            <AlertTriangle size={14} className="text-rose-500" /> Silent SOS
          </Link>
          <Link href="/explore" className="px-3.5 py-1.5 rounded-full hover:bg-sky-50 text-slate-700 hover:text-sky-700 transition flex items-center gap-1.5">
            <Compass size={14} className="text-sky-600" /> Radar Discovery
          </Link>
          <Link href="/authority" className="px-3.5 py-1.5 rounded-full hover:bg-sky-50 text-slate-700 hover:text-sky-700 transition flex items-center gap-1.5">
            <Radio size={14} className="text-sky-600" /> Authority
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700">
            Official Consumer Affairs Mode
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        {/* Left Column: Sample Selector & File Upload (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-[11px] font-semibold mb-2">
              <Sparkles size={12} /> Anti-Overcharge Shield
            </div>
            <h1 className="text-2xl font-black text-[#0C2340]">Bill & Ticket Auditor</h1>
            <p className="text-xs text-slate-500">
              Instantly detect unauthorized 10% service charges, invalid GSTINs, and counterfeit monument passes.
            </p>
          </div>

          {/* Upload Dropzone */}
          <label className="block border-2 border-dashed border-sky-200 hover:border-sky-400 rounded-3xl p-6 bg-white text-center cursor-pointer transition shadow-[0_4px_20px_rgba(2,132,199,0.04)] group">
            <input
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={handleSimulateUpload}
            />
            <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition">
              <UploadCloud size={24} />
            </div>
            <div className="text-sm font-bold text-slate-900">
              {customFileUploaded ? `Uploaded: ${customFileUploaded}` : 'Upload Bill or Scan Ticket Photo'}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Supports JPEG, PNG, PDF receipt photos (OCR automated)
            </div>
          </label>

          {/* Preset Test Scenarios */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              1-Click Inspection Samples
            </h3>

            {SAMPLE_BILLS.map((sample) => (
              <div
                key={sample.id}
                onClick={() => handleSelectSample(sample)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition ${
                  selectedSample.id === sample.id
                    ? 'bg-white border-sky-500 shadow-[0_4px_20px_rgba(2,132,199,0.12)] ring-1 ring-sky-500/20'
                    : 'bg-white/80 border-sky-100 hover:border-sky-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2.5">
                    <div className="p-2 rounded-xl bg-sky-50 border border-sky-100 text-sky-600 mt-0.5">
                      {sample.type === 'restaurant' ? <Receipt size={16} /> : sample.type === 'ticket' ? <QrCode size={16} /> : <FileText size={16} />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{sample.title}</div>
                      <div className="text-[11px] text-slate-500 leading-tight mt-0.5">{sample.subtitle}</div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      sample.hasScam
                        ? 'bg-rose-50 border border-rose-200 text-rose-700'
                        : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                    }`}
                  >
                    {sample.hasScam ? 'SCAM DETECTED' : 'VERIFIED OK'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Detailed Audit Breakdown & Dispute Letter (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Audit Verdict Banner */}
          <div
            className={`border rounded-3xl p-5 shadow-[0_8px_30px_rgb(2,132,199,0.06)] transition-all ${
              selectedSample.hasScam
                ? 'bg-white border-rose-200 ring-1 ring-rose-200/50'
                : 'bg-white border-emerald-200 ring-1 ring-emerald-200/50'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                {selectedSample.hasScam ? (
                  <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200">
                    <AlertTriangle size={20} />
                  </div>
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
                    <CheckCircle2 size={20} />
                  </div>
                )}
                <div>
                  <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                    {selectedSample.hasScam ? 'Violation Flagged' : 'Compliance Pass'}
                  </div>
                  <h2 className="text-lg font-black text-[#0C2340]">
                    {selectedSample.hasScam ? selectedSample.scamType : 'Genuine & Lawful Charge'}
                  </h2>
                </div>
              </div>

              {selectedSample.hasScam && (
                <div className="text-right">
                  <div className="text-xl font-black text-rose-600">₹{selectedSample.scamAmount}</div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Excess Charged</div>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              {selectedSample.notes}
            </p>
          </div>

          {/* Line Item Receipt Breakdown */}
          <div className="bg-white border border-sky-100 rounded-3xl p-6 space-y-4 shadow-[0_8px_30px_rgb(2,132,199,0.06)]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{selectedSample.vendor}</h3>
                <div className="text-[11px] text-slate-400">OCR Scanned Items</div>
              </div>
              <span className="font-sans text-xs text-slate-600">
                Total: <strong className="text-[#0C2340] text-base">₹{selectedSample.totalAmount}</strong>
              </span>
            </div>

            {/* Item List */}
            <div className="space-y-2">
              {selectedSample.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs py-1">
                  <span className="text-slate-700">
                    {item.name} <span className="text-slate-400">x{item.qty}</span>
                  </span>
                  <span className="font-sans font-bold text-slate-900">₹{item.price}</span>
                </div>
              ))}
            </div>

            {/* Taxes & Extra Levies */}
            <div className="border-t border-slate-100 pt-3 space-y-2">
              {selectedSample.taxes.map((tax, idx) => (
                <div
                  key={idx}
                  className={`flex justify-between items-center text-xs p-2.5 rounded-xl ${
                    tax.isLegal
                      ? 'bg-slate-50 text-slate-600'
                      : 'bg-rose-50 border border-rose-200 text-rose-800 font-bold'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    {tax.isLegal ? <CheckCircle2 size={13} className="text-emerald-600" /> : <XCircle size={13} className="text-rose-600" />}
                    <span>{tax.name}</span>
                  </div>
                  <span className="font-sans font-bold">
                    {tax.amount > 0 ? `+ ₹${tax.amount}` : '₹0'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Legal Dispute Letter Generator (If Scam Detected) */}
          {selectedSample.hasScam && (
            <div className="bg-white border border-sky-100 rounded-3xl p-6 space-y-3 shadow-[0_8px_30px_rgb(2,132,199,0.06)]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#0C2340] flex items-center gap-2">
                    <FileText size={16} className="text-sky-600" />
                    Instant CCPA Dispute Notice Draft
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Ready to show to vendor manager or submit to National Consumer Helpline 1915.
                  </p>
                </div>
                <button
                  onClick={handleCopyDispute}
                  className="px-3 py-1.5 bg-sky-50 border border-sky-200 rounded-full text-xs font-bold text-sky-800 flex items-center gap-1 hover:bg-sky-100 transition shadow-2xs"
                >
                  <Copy size={13} />
                  <span>{copiedDispute ? 'Copied Notice!' : 'Copy Legal Notice'}</span>
                </button>
              </div>

              <textarea
                readOnly
                value={disputeNoticeText}
                rows={6}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-700 font-mono focus:outline-none select-all"
              />

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-400">
                  Authority: Ministry of Consumer Affairs, CCPA Order F.No. J-24/37/2022
                </span>
                <a
                  href="tel:1915"
                  className="py-2.5 px-4 rounded-xl bg-sky-50 border border-sky-200 hover:border-sky-400 text-center text-xs font-bold text-sky-700 transition flex items-center justify-center gap-1.5"
                >
                  <span>Dial NCH 1915 Helpline</span>
                </a>
                <a
                  href="https://consumerhelpline.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-center text-xs font-bold text-white transition flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span>File Official NCH Grievance</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

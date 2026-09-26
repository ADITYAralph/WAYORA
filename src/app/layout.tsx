import { Metadata } from 'next'
import './globals.css'
import '../styles/translate.css'
import { AuthProvider } from '@/contexts/AuthContext'
import '../components/UserProfile.css'

export const metadata: Metadata = {
  title: 'WayORA — Smart Tourist Safety & Incident Response',
  description: 'WayORA - Smart Tourism Safety, Real-time Transit Monitoring & Emergency Response Infrastructure',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}

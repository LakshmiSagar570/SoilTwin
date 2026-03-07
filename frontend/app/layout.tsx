import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Soil Digital Twin — AI Farm Intelligence',
  description: 'AI-powered soil analysis and crop simulation for Indian farmers',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
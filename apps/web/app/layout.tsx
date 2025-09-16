/*
EarbudHub Marketplace - Professional Earbud Parts Marketplace with Lost/Stolen Registry

PROJECT OVERVIEW:
- Full-stack marketplace for buying/selling individual earbuds, charging cases, and accessories
- Integrated lost/stolen registry with smart matching algorithm
- Advanced ratings system with 12+ criteria and weighted scoring
- Blog system with brand/model taxonomy
- City-level geolocation using GeoDB Cities API
- Trust features: identifier masking, verification badges, escrow payments
- Found items registry with legal compliance workflow

TECHNICAL STACK:
- Frontend: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
- Backend: NestJS, TypeScript, Swagger documentation
- Database: PostgreSQL with Prisma ORM
- Authentication: NextAuth.js (planned)
- Payment: PayPal Orders v2 API with escrow simulation
- Geolocation: GeoDB Cities API for global city picker
- File Upload: MinIO (S3-compatible)
- Development: Docker Compose (PostgreSQL, Redis, MinIO)
- Deployment: Railway (Backend + Database) + Vercel (Frontend)
*/

import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Providers } from './providers'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: false
})

export const metadata: Metadata = {
  title: {
    default: 'EarbudHub - Professional Earbud Parts Marketplace',
    template: '%s | EarbudHub',
  },
  description: 'Buy and sell individual earbuds, charging cases, and accessories. Professional marketplace with lost/stolen registry and legal compliance.',
  keywords: [
    'earbuds',
    'airpods',
    'galaxy buds',
    'replacement parts',
    'marketplace',
    'lost earbuds',
    'found earbuds',
    'charging case',
    'wireless earbuds'
  ],
  authors: [{ name: 'EarbudHub Team' }],
  creator: 'EarbudHub',
  publisher: 'EarbudHub',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://earbudhub.com',
    siteName: 'EarbudHub',
    title: 'EarbudHub - Professional Earbud Parts Marketplace',
    description: 'Buy and sell individual earbuds, charging cases, and accessories. Professional marketplace with lost/stolen registry.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'EarbudHub Marketplace',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EarbudHub - Professional Earbud Parts Marketplace',
    description: 'Buy and sell individual earbuds, charging cases, and accessories.',
    images: ['/og-image.jpg'],
    creator: '@earbudhub',
  },
  verification: {
    google: 'google-site-verification-code',
  },
  category: 'marketplace',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full flex flex-col bg-gray-50`}>
        <Providers>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}

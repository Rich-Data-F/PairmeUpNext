/*
PairAgain - Collaborative Earbud Exchange Platform with Lost/Found Registry

PROJECT OVERVIEW:
- Full-stack platform for buying, selling, trading individual earbuds, charging cases, and accessories
- Integrated lost/found registry with smart matching algorithm
- Advanced ratings system with 12+ criteria and weighted scoring
- Blog system with brand/model taxonomy
- City-level geolocation using GeoDB Cities API
- Trust features: identifier masking, verification badges, escrow payments
- Found items registry with community-driven matching

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
import 'leaflet/dist/leaflet.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from './providers'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: false
})

export const metadata: Metadata = {
  title: {
    default: 'PairAgain - Collaborative Earbud Exchange Platform',
    template: '%s | PairAgain',
  },
  description: 'Buy, sell, trade, declare loss or find of earbud items. Collaborative exchange platform for earbuds, charging cases, and accessories.',
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
  authors: [{ name: 'PairAgain Team' }],
  creator: 'PairAgain',
  publisher: 'PairAgain',
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
    url: 'https://pairagain.com',
    siteName: 'PairAgain',
    title: 'PairAgain - Collaborative Earbud Exchange Platform',
    description: 'Buy, sell, trade, declare loss or find of earbud items. Collaborative exchange platform for earbuds, cases, and accessories.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PairAgain - Professional Earbud Parts Marketplace',
    description: 'Buy and sell earbuds, charging cases, and accessories.',
    creator: '@pairagain',
  },
  verification: {
    google: 'google-site-verification-code',
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-minimal.svg', type: 'image/svg+xml', media: '(prefers-color-scheme: light)' },
      { url: '/favicon-techy.svg', type: 'image/svg+xml', media: '(prefers-color-scheme: dark)' },
    ],
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  category: 'marketplace',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full flex flex-col bg-gray-50`} suppressHydrationWarning={true}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

import Link from 'next/link'

export function HeroSection() {
  return (
    <div className="relative bg-gradient-to-b from-blue-50 to-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="pt-20 pb-16 text-center lg:pt-32">
          <h1 className="mx-auto max-w-4xl font-display text-5xl font-medium tracking-tight text-slate-900 sm:text-7xl">
            Find Your
            <span className="relative whitespace-nowrap text-blue-600">
              <span className="relative"> Missing Earbud</span>
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg tracking-tight text-slate-700">
            Professional marketplace for individual earbuds, charging cases, and accessories. 
            Buy, sell, and find lost items with our secure platform and legal compliance features.
          </p>
          <div className="mt-10 flex justify-center gap-x-6">
            <Link href="/marketplace" className="btn-primary btn-lg">
              Browse Marketplace
            </Link>
            <Link href="/lost-stolen" className="btn-outline btn-lg">
              Report Lost Item
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

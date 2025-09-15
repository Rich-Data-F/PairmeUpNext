import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo and Description */}
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">EH</span>
                </div>
                <span className="text-xl font-bold">EarbudHub</span>
              </div>
              <p className="text-gray-400 text-sm">
                Professional marketplace for earbud parts with lost/stolen registry and legal compliance.
              </p>
            </div>

            {/* Marketplace */}
            <div>
              <h3 className="font-semibold mb-4">Marketplace</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/marketplace" className="hover:text-white">Browse Listings</Link></li>
                <li><Link href="/marketplace/sell" className="hover:text-white">Sell Your Items</Link></li>
                <li><Link href="/brands" className="hover:text-white">Brands</Link></li>
                <li><Link href="/models" className="hover:text-white">Models</Link></li>
              </ul>
            </div>

            {/* Services */}
            <div>
              <h3 className="font-semibold mb-4">Services</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/lost-stolen" className="hover:text-white">Lost & Found Registry</Link></li>
                <li><Link href="/found-items" className="hover:text-white">Found Items</Link></li>
                <li><Link href="/ratings" className="hover:text-white">Ratings & Reviews</Link></li>
                <li><Link href="/verification" className="hover:text-white">Verification</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/about" className="hover:text-white">About Us</Link></li>
                <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
                <li><Link href="/careers" className="hover:text-white">Careers</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-sm text-gray-400">
                © 2024 EarbudHub. All rights reserved.
              </div>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <Link href="/privacy" className="text-sm text-gray-400 hover:text-white">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="text-sm text-gray-400 hover:text-white">
                  Terms of Service
                </Link>
                <Link href="/legal" className="text-sm text-gray-400 hover:text-white">
                  Legal Compliance
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

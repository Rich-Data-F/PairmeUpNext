import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

export async function Footer() {
  const t = await getTranslations('footer')
  return (
    <footer className="bg-gray-900 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo and Description */}
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">PA</span>
                </div>
                <span className="text-xl font-bold">PairAgain</span>
              </div>
              <p className="text-gray-400 text-sm">{t('tagline')}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">{t('allListings')}</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/marketplace" className="hover:text-white">{t('browseListings')}</Link></li>
                <li><Link href="/sell" className="hover:text-white">{t('sellItems')}</Link></li>
                <li><Link href="/brands" className="hover:text-white">{t('brands')}</Link></li>
                <li><Link href="/models" className="hover:text-white">{t('models')}</Link></li>
              </ul>
            </div>

            {/* Services */}
            <div>
              <h3 className="font-semibold mb-4">{t('services')}</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/lost-stolen" className="hover:text-white">{t('lostFound')}</Link></li>
                <li><Link href="/ratings" className="hover:text-white">{t('ratingsReviews')}</Link></li>
                <li><Link href="/verification" className="hover:text-white">{t('verification')}</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="font-semibold mb-4">{t('company')}</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/about" className="hover:text-white">{t('aboutUs')}</Link></li>
                <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
                <li><Link href="/contact" className="hover:text-white">{t('contact')}</Link></li>
                <li><Link href="/careers" className="hover:text-white">{t('careers')}</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-sm text-gray-400">{t('copyright')}</div>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <Link href="/privacy" className="text-sm text-gray-400 hover:text-white">{t('privacyPolicy')}</Link>
                <Link href="/terms" className="text-sm text-gray-400 hover:text-white">{t('termsOfService')}</Link>
                <Link href="/legal" className="text-sm text-gray-400 hover:text-white">{t('legalCompliance')}</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

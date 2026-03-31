import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

export async function HeroSection() {
  const t = await getTranslations('hero')
  return (
    <div className="relative bg-gradient-to-b from-blue-50 to-white">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="pt-20 pb-16 text-center lg:pt-32">
          <h1 className="mx-auto max-w-4xl font-display text-5xl font-medium tracking-tight text-slate-900 sm:text-7xl">
            {t('headline')}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg tracking-tight text-slate-700">
            {t('subheadline')}
          </p>
          <div className="mt-10 flex justify-center gap-x-6">
            <Link href="/marketplace" className="btn-primary btn-lg">
              {t('browseMarketplace')}
            </Link>
            <Link href="/lost-stolen" className="btn-outline btn-lg">
              {t('reportLostItem')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

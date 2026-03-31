import { getTranslations } from 'next-intl/server'

export async function FeaturesSection() {
  const t = await getTranslations('features')
  return (
    <div className="py-16 bg-white">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-12">{t('title')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-4">{t('secureMarketplace')}</h3>
            <p className="text-gray-600">{t('secureMarketplaceDesc')}</p>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-4">{t('lostFoundRegistry')}</h3>
            <p className="text-gray-600">{t('lostFoundRegistryDesc')}</p>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-4">{t('legalCompliance')}</h3>
            <p className="text-gray-600">{t('legalComplianceDesc')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

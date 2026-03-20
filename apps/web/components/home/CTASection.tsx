import { getTranslations } from 'next-intl/server'

export async function CTASection() {
  const t = await getTranslations('cta')
  return <div className="py-16 text-center"><h2 className="text-3xl font-bold">{t('title')}</h2></div>
}

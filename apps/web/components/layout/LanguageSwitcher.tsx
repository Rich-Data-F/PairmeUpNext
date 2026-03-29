'use client';

import { useLocale } from 'next-intl';
import { Link, usePathname, routing } from '@/i18n/routing';

const LABELS: Record<string, string> = { en: 'EN', fr: 'FR', de: 'DE', es: 'ES' };

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <div className="flex items-center space-x-1 rounded-lg border border-gray-200 bg-gray-50 p-0.5 text-xs font-bold">
      {routing.locales.map((l) => (
        <Link
          key={l}
          href={pathname}
          locale={l}
          className={`rounded-md px-2 py-1 transition-all ${
            l === locale
              ? 'bg-white text-blue-600 shadow-sm px-2.5'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          {LABELS[l]}
        </Link>
      ))}
    </div>
  );
}

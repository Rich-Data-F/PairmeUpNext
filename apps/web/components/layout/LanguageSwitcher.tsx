'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { routing } from '@/i18n/routing';

const LABELS: Record<string, string> = { en: 'EN', fr: 'FR', de: 'DE', es: 'ES' };

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (next: string) => {
    const currentPath = pathname || '/';
    // Strip any known locale prefix from the current path
    const knownLocale = routing.locales.find((l) => currentPath === `/${l}` || currentPath.startsWith(`/${l}/`));
    const bare = knownLocale ? currentPath.slice(`/${knownLocale}`.length) || '/' : currentPath;
    const newPath = next === routing.defaultLocale ? bare : `/${next}${bare}`;
    router.push(newPath);
  };

  return (
    <div className="flex items-center space-x-1 rounded-lg border border-gray-200 bg-gray-50 p-0.5 text-xs font-bold">
      {routing.locales.map((l) => (
        <button
          key={l}
          onClick={() => switchLocale(l)}
          className={`rounded-md px-2 py-1 transition-all ${
            l === locale
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          {LABELS[l]}
        </button>
      ))}
    </div>
  );
}

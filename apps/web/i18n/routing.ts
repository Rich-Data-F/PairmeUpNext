import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'fr', 'de', 'es'],
  defaultLocale: 'en',
  localePrefix: 'as-needed', // English URLs stay clean (no /en prefix)
});

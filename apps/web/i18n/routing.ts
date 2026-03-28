import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['en', 'fr', 'de', 'es'],
  defaultLocale: 'en',
  localePrefix: 'as-needed', // English URLs stay clean (no /en prefix)
});

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);

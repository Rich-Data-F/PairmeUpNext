import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Match all routes except internals (_next, api, static files)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};

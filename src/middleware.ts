import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['tr', 'en'],
  defaultLocale: 'tr',
  localePrefix: 'as-needed', // Don't prefix for default locale (tr)
});

export const config = {
  // Match all pathnames except for API, _next, static files
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};

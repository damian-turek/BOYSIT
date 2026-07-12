import createMiddleware from 'next-intl/middleware'

export default createMiddleware({
  locales: ['en', 'pl'],
  defaultLocale: 'en',
})

export const config = {
  matcher: ['/', '/(pl|en)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)'],
}

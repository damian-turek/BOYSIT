import { type NextRequest, NextResponse } from 'next/server'

import { createServerClient } from '@supabase/ssr'
import createIntlMiddleware from 'next-intl/middleware'

const handleI18nRouting = createIntlMiddleware({
  locales: ['en', 'pl'],
  defaultLocale: 'en',
})

export default async function proxy(request: NextRequest) {
  const response = handleI18nRouting(request)

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isDashboardRoute = request.nextUrl.pathname.match(/^\/(en|pl)\/dashboard/)

  if (isDashboardRoute && !user) {
    const locale = request.nextUrl.pathname.split('/')[1] || 'en'
    const url = request.nextUrl.clone()
    url.pathname = `/${locale}`
    return NextResponse.redirect(url)
  }

  const isHomeRoute = request.nextUrl.pathname.match(/^\/(en|pl)\/?$/)

  if (isHomeRoute && user) {
    const locale = request.nextUrl.pathname.split('/')[1] || 'en'
    const url = request.nextUrl.clone()
    url.pathname = `/${locale}/dashboard`
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2?|ttf|otf|eot)$).*)',
  ],
}

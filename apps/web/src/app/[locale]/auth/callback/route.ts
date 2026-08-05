import { type NextRequest, NextResponse } from 'next/server'

import { createSupabaseServerClient } from '@/services/supabaseServer'

type OAuthCallbackRouteContext = {
  params: Promise<{
    locale: string
  }>
}

const getLocale = (locale: string): 'en' | 'pl' => (locale === 'pl' ? 'pl' : 'en')

export async function GET(request: NextRequest, context: OAuthCallbackRouteContext) {
  const { locale: requestedLocale } = await context.params
  const locale = getLocale(requestedLocale)
  const code = request.nextUrl.searchParams.get('code')

  if (code) {
    const supabase = await createSupabaseServerClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.nextUrl.origin))
    }
  }

  const errorUrl = new URL(`/${locale}`, request.nextUrl.origin)
  errorUrl.searchParams.set('authError', 'oauth_callback')

  return NextResponse.redirect(errorUrl)
}

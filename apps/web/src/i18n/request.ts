import { getRequestConfig } from 'next-intl/server'

const locales = ['en', 'pl'] as const

export default getRequestConfig(async ({ requestLocale }) => {
  const requestedLocale = await requestLocale
  const activeLocale =
    requestedLocale && locales.includes(requestedLocale as (typeof locales)[number])
      ? requestedLocale
      : 'en'
  return {
    locale: activeLocale,
    messages: (await import(`../messages/${activeLocale}.json`)).default,
    timeZone: 'Europe/Warsaw',
  }
})

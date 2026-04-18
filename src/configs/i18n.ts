export const i18n = {
  defaultLocale: 'ar',
  locales: ['ar', 'en'],
  langDirection: {
    en: 'ltr',
  
    ar: 'rtl'
  }
} as const

export type Locale = (typeof i18n)['locales'][number]

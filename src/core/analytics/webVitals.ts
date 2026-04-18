import { trackWebVitals } from './events'

export type WebVitalsMetric = {
  name: string
  value: number
  rating?: 'good' | 'needs-improvement' | 'poor'
}

const isProduction = (): boolean => process.env.NODE_ENV === 'production'

const sanitizeUrl = (url?: string): string => {
  if (!url) return '/'

  try {
    const parsed = new URL(url, typeof window !== 'undefined' ? window.location.origin : 'http://localhost')

    return parsed.pathname || '/'
  } catch {
    return url.split('?')[0] || '/'
  }
}

export const reportWebVitalsToPosthog = (metric: WebVitalsMetric): void => {
  if (!isProduction()) return

  trackWebVitals({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    url: sanitizeUrl(typeof window !== 'undefined' ? window.location.pathname : '/')
  })
}

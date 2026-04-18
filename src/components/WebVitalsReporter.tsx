'use client'

import { useReportWebVitals } from 'next/web-vitals'

import { reportWebVitalsToPosthog } from '@/core/analytics/webVitals'

type WebVitalsSnapshot = {
  id: string
  name: string
  value: number
  rating?: 'good' | 'needs-improvement' | 'poor'
  delta: number
  timestamp: number
}

declare global {
  interface Window {
    __RAWSHIN_WEB_VITALS__?: WebVitalsSnapshot[]
  }
}

const MAX_BUFFER_SIZE = 200

export default function WebVitalsReporter() {
  useReportWebVitals(metric => {
    const payload: WebVitalsSnapshot = {
      id: metric.id,
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      timestamp: Date.now()
    }

    const current = window.__RAWSHIN_WEB_VITALS__ ?? []
    const next = [...current, payload]

    window.__RAWSHIN_WEB_VITALS__ = next.length > MAX_BUFFER_SIZE ? next.slice(-MAX_BUFFER_SIZE) : next

    reportWebVitalsToPosthog({
      name: metric.name,
      value: metric.value,
      rating: metric.rating
    })

    if (process.env.NEXT_PUBLIC_ENABLE_WEB_VITALS_LOG === 'true') {
      console.info('[WebVitals]', payload)
    }
  })

  return null
}

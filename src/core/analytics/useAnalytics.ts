'use client'

import { useCallback } from 'react'

import type { AnalyticsEventName } from './analyticsEvents'
import { getPosthog } from './posthog.client'

export const useAnalytics = () => {
  const track = useCallback(
    (event: AnalyticsEventName | string, payload?: Record<string, unknown>) => {
      const posthog = getPosthog()
      if (!posthog) return

      posthog.capture(event, payload)
    },
    [],
  )

  return {
    track,
  }
}

export default useAnalytics

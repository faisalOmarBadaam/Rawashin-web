import { useEffect, useState } from 'react'

import type { AnalyticsFlagKey } from './flags.registry'
import { getPosthog } from './posthog.client'

const readFlag = (flagKey: string): boolean => {
  if (typeof window === 'undefined') return false

  const posthog = getPosthog()
  if (!posthog) return false

  return Boolean(posthog.getFeatureFlag(flagKey))
}

export const getFeatureFlag = (flagKey: AnalyticsFlagKey | string): boolean => {
  return readFlag(flagKey)
}

export const getFeatureFlagPayload = (flagKey: AnalyticsFlagKey | string): unknown => {
  if (typeof window === 'undefined') return null

  const posthog = getPosthog()
  if (!posthog) return null

  return posthog.getFeatureFlagPayload(flagKey)
}

export const useFeatureFlag = (flagKey: AnalyticsFlagKey | string): boolean => {
  const [enabled, setEnabled] = useState<boolean>(() => readFlag(flagKey))

  useEffect(() => {
    setEnabled(readFlag(flagKey))

    const posthog = getPosthog()
    if (!posthog) return

    const unsubscribe = posthog.onFeatureFlags(() => {
      setEnabled(readFlag(flagKey))
    })

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe()
      }
    }
  }, [flagKey])

  return enabled
}

export const useFeatureFlagPayload = (flagKey: AnalyticsFlagKey | string): unknown => {
  const [payload, setPayload] = useState<unknown>(() => getFeatureFlagPayload(flagKey))

  useEffect(() => {
    setPayload(getFeatureFlagPayload(flagKey))

    const posthog = getPosthog()
    if (!posthog) return

    const unsubscribe = posthog.onFeatureFlags(() => {
      setPayload(getFeatureFlagPayload(flagKey))
    })

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe()
      }
    }
  }, [flagKey])

  return payload
}

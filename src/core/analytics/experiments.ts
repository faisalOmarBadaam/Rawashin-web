'use client'

import { useEffect, useState } from 'react'

import { getPosthog } from './posthog.client'

const STORAGE_KEY = 'rawshin_experiment_exposures'
const inMemoryExposures = new Set<string>()

const readStoredExposures = (): Set<string> => {
  if (typeof window === 'undefined') return new Set()

  const raw = window.sessionStorage.getItem(STORAGE_KEY)
  if (!raw) return new Set()

  try {
    const parsed = JSON.parse(raw) as string[]

    return new Set(parsed)
  } catch {
    return new Set()
  }
}

const persistExposure = (key: string): void => {
  if (typeof window === 'undefined') return

  const current = readStoredExposures()
  current.add(key)
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(current)))
}

const hasExposure = (key: string): boolean => {
  if (inMemoryExposures.has(key)) return true

  return readStoredExposures().has(key)
}

export const getExperimentVariant = (key: string): string | null => {
  if (typeof window === 'undefined') return null

  const posthog = getPosthog()
  if (!posthog) return null

  const value = posthog.getFeatureFlag(key)

  return typeof value === 'string' ? value : null
}

export const captureExperimentExposure = (key: string, variant: string): void => {
  const posthog = getPosthog()
  if (!posthog) return

  const exposureKey = `${key}:${variant}`

  if (hasExposure(exposureKey)) return

  inMemoryExposures.add(exposureKey)
  persistExposure(exposureKey)

  posthog.capture('experiment_exposure', {
    experiment_key: key,
    variant
  })
}

export const useExperimentVariant = (key: string): string | null => {
  const [variant, setVariant] = useState<string | null>(() => getExperimentVariant(key))

  useEffect(() => {
    setVariant(getExperimentVariant(key))

    const posthog = getPosthog()
    if (!posthog) return

    const unsubscribe = posthog.onFeatureFlags(() => {
      setVariant(getExperimentVariant(key))
    })

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe()
      }
    }
  }, [key])

  useEffect(() => {
    if (!variant) return

    captureExperimentExposure(key, variant)
  }, [key, variant])

  return variant
}

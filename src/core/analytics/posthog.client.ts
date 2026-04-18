import posthog, { type CaptureResult, type PostHogConfig } from 'posthog-js'

import {
  SENSITIVE_BLOCK_SELECTOR,
  shouldDisableCaptureForPath,
  shouldDisableRecordingForPath
} from './privacy'

let isInitialized = false

const isBrowser = () => typeof window !== 'undefined'

const isEnabled = (): boolean => {
  if (!isBrowser()) return false

  const explicit = process.env.NEXT_PUBLIC_POSTHOG_ENABLED

  if (explicit === 'true') return true
  if (explicit === 'false') return false

  return process.env.NODE_ENV === 'production'
}

const isRecordingEnabled = (): boolean => {
  return process.env.NEXT_PUBLIC_POSTHOG_RECORDING_ENABLED === 'true'
}

const isDebugEnabled = (): boolean => {
  return process.env.NEXT_PUBLIC_POSTHOG_DEBUG === 'true'
}

const getHost = (): string => {
  return process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com'
}

const sanitizePathFromUrl = (value: unknown): string => {
  if (typeof value !== 'string' || !value) return '/'

  try {
    const parsed = new URL(value, window.location.origin)

    return parsed.pathname || '/'
  } catch {
    return value.split('?')[0] || '/'
  }
}

const resolveConfig = (): Partial<PostHogConfig> => {
  const host = getHost()
  const debug = isDebugEnabled()

  const config: Partial<PostHogConfig> = {
    api_host: host,
    capture_pageview: false,
    autocapture: true,
    disable_session_recording: !isRecordingEnabled(),
    secure_cookie: host.startsWith('https://'),
    persistence: 'localStorage+cookie',
    session_recording: {
      maskAllInputs: true,
      maskTextSelector: '*',
      blockSelector: SENSITIVE_BLOCK_SELECTOR,
      maskInputOptions: {
        password: true,
        email: true,
        tel: true,
        text: true,
        number: true
      }
    },
    before_send: (event: CaptureResult | null) => {
      if (!event) return null

      const properties =
        typeof event.properties === 'object' && event.properties !== null
          ? (event.properties as Record<string, unknown>)
          : null

      const pathname = sanitizePathFromUrl(properties?.$current_url)

      if (shouldDisableCaptureForPath(pathname)) {
        return null
      }

      return event
    },
    loaded: instance => {
      if (debug) {
        instance.debug()
      }

      if (!isRecordingEnabled()) {
        instance.stopSessionRecording?.()
      } else if (shouldDisableRecordingForPath(window.location.pathname)) {
        instance.stopSessionRecording?.()
      }
    }
  }

  return config
}

export const initPosthog = (): typeof posthog | null => {
  if (!isBrowser()) return null
  if (!isEnabled()) return null

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY

  if (!key) return null

  if (!isInitialized) {
    posthog.init(key, resolveConfig())
    isInitialized = true
  }

  return posthog
}

export const getPosthog = (): typeof posthog | null => {
  if (!isBrowser()) return null

  return isInitialized ? posthog : null
}

export const updateRecordingState = (pathname: string, canRecord: boolean): void => {
  const instance = getPosthog()

  if (!instance) return

  const enabled = isRecordingEnabled() && canRecord && !shouldDisableRecordingForPath(pathname)

  if (enabled) {
    instance.startSessionRecording?.()

    return
  }

  instance.stopSessionRecording?.()
}

export const isPosthogDebug = (): boolean => {
  return isDebugEnabled()
}

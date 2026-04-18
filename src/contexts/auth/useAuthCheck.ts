import { useEffect, useRef, useState } from 'react'

import { secureLogout } from '@/core/auth/secureLogout'
import { AuthApi } from '@/libs/api/modules/auth.api'
import { tokenStore } from '@/libs/api/tokenStore'
import { useAuthStore } from './auth.store'

type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated' | 'first-login'

type AuthCheckResult = {
  status: AuthStatus
  error?: string
}

type JwtPayload = {
  exp?: number
}

const decodeJwtPayload = (token: string): JwtPayload | null => {
  try {
    const payload = token.split('.')[1]

    if (!payload) return null

    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
    const decoded = atob(padded)
    const json = decodeURIComponent(
      decoded
        .split('')
        .map(char => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join(''),
    )

    return JSON.parse(json) as JwtPayload
  } catch {
    return null
  }
}

const isTokenExpired = (token: string) => {
  const payload = decodeJwtPayload(token)

  if (!payload?.exp) return true

  return payload.exp * 1000 <= Date.now()
}

export const useAuthCheck = (): AuthCheckResult => {
  const [status, setStatus] = useState<AuthStatus>('checking')
  const [error, setError] = useState<string | undefined>(undefined)
  const hasChecked = useRef(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (hasChecked.current) return

    hasChecked.current = true

    const runCheck = async () => {
      setStatus('checking')
      setError(undefined)

      const accessToken = tokenStore.getAccessToken()

      if (!accessToken) {
        setStatus('unauthenticated')

        return
      }

      const expired = isTokenExpired(accessToken)

      if (!expired) {
        const payload = tokenStore.getPayload()

        if (payload) {
          useAuthStore.getState().login({
            userId: payload.id || payload.sub || '',
            email: payload.email,
            name: payload.name,
            roles: payload.roles || [],
            expiresIn: payload.exp || 0,
          })
        }

        if (tokenStore.getIsFirstLogin()) {
          setStatus('first-login')
        } else {
          setStatus('authenticated')
        }

        return
      }

      const refreshToken = tokenStore.getRefreshToken()

      if (!refreshToken) {
        secureLogout()
        setStatus('unauthenticated')

        return
      }

      try {
        const refreshed = await AuthApi.refresh({ refreshToken })

        if (!refreshed?.accessToken) {
          throw new Error('Refresh response missing access token')
        }

        tokenStore.setTokens({
          accessToken: refreshed.accessToken,
          refreshToken: refreshed.refreshToken ?? undefined,
        })
        tokenStore.setIsFirstLogin(refreshed.isFirstLogin)

        const payload = tokenStore.getPayload()

        if (payload) {
          useAuthStore.getState().login({
            userId: payload.id || payload.sub || '',
            email: payload.email,
            name: payload.name,
            roles: payload.roles || [],
            expiresIn: payload.exp || 0,
          })
        }

        if (refreshed.isFirstLogin) {
          setStatus('first-login')
        } else {
          setStatus('authenticated')
        }
      } catch (refreshError) {
        secureLogout()
        setError(refreshError instanceof Error ? refreshError.message : 'Session refresh failed')
        setStatus('unauthenticated')
      }
    }

    void runCheck()
  }, [])

  return { status, error }
}

import type { AuthResponse } from '../types'

export const ACCESS_TOKEN_KEY = 'access_token'
export const REFRESH_TOKEN_KEY = 'refresh_token'

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function hasAccessToken() {
  return Boolean(getAccessToken())
}

type JwtPayload = {
  fullName?: string
  name?: string
  unique_name?: string
  role?: string | string[]
  roles?: string[]
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'?: string
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'?: string | string[]
}

type SessionUser = {
  name: string | null
  role: string | null
}

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
  const decoded = atob(padded)

  return decodeURIComponent(
    Array.from(decoded)
      .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
      .join(''),
  )
}

function parseAccessTokenPayload(token: string): JwtPayload | null {
  const [, payload] = token.split('.')

  if (!payload) {
    return null
  }

  try {
    return JSON.parse(decodeBase64Url(payload)) as JwtPayload
  } catch {
    return null
  }
}

export function getSessionUser(): SessionUser {
  const accessToken = getAccessToken()

  if (!accessToken) {
    return { name: null, role: null }
  }

  const payload = parseAccessTokenPayload(accessToken)

  if (!payload) {
    return { name: null, role: null }
  }

  const name =
    payload.fullName ??
    payload.name ??
    payload.unique_name ??
    payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ??
    null

  const roleValue =
    payload.roles ??
    payload.role ??
    payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ??
    null

  const role = Array.isArray(roleValue) ? roleValue[0] ?? null : roleValue

  return {
    name,
    role,
  }
}

export function storeAuthSession(session: Pick<AuthResponse, 'accessToken' | 'refreshToken'>) {
  localStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken)
}

export function clearAuthSession() {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}
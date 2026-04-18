const ACCESS_KEY = 'rw_access_token'
const REFRESH_KEY = 'rw_refresh_token'
const FIRST_LOGIN_KEY = 'rw_is_first_login'

let inMemoryRefreshToken: string | null = null

const isClient = (): boolean => typeof window !== 'undefined'

const decodePayload = <T = any>(token: string): T | null => {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const base64Url = parts[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')

    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map(char => '%' + ('00' + char.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    )

    return JSON.parse(json) as T
  } catch {
    return null
  }
}

export type JwtPayload = {
  sub?: string
  exp?: number
  roles?: string[] | string
  email?: string
  name?: string
  unique_name?: string
  [key: string]: any
}

export type NormalizedUserPayload = JwtPayload & {
  id?: string
  email?: string
  name?: string
  roles: string[]
}

export const tokenStore = {
  getAccessToken(): string | null {
    if (!isClient()) return null
    return localStorage.getItem(ACCESS_KEY)
  },

  getRefreshToken(): string | null {
    if (!isClient()) return null

    if (inMemoryRefreshToken) {
      return inMemoryRefreshToken
    }

    // TODO(security): remove legacy refresh-token fallback after backend migrates to httpOnly cookie refresh flow.
    const legacyToken = localStorage.getItem(REFRESH_KEY)

    if (!legacyToken) {
      return null
    }

    inMemoryRefreshToken = legacyToken
    localStorage.removeItem(REFRESH_KEY)

    return inMemoryRefreshToken
  },

  setTokens(tokens: { accessToken: string; refreshToken?: string }) {
    if (!isClient()) return

    localStorage.setItem(ACCESS_KEY, tokens.accessToken)

    if (typeof tokens.refreshToken === 'string') {
      inMemoryRefreshToken = tokens.refreshToken
    }

    localStorage.removeItem(REFRESH_KEY)
  },

  clear() {
    if (!isClient()) return

    inMemoryRefreshToken = null

    localStorage.removeItem(ACCESS_KEY)
    localStorage.removeItem(REFRESH_KEY)
    localStorage.removeItem(FIRST_LOGIN_KEY)
  },

  getRawPayload(): JwtPayload | null {
    if (!isClient()) return null

    const token = localStorage.getItem(ACCESS_KEY)
    if (!token) return null

    return decodePayload<JwtPayload>(token)
  },

  getRoles(): string[] {
    if (!isClient()) return []

    const payload = this.getRawPayload()
    if (!payload) return []

    const roles =
      payload.roles ?? payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']

    return Array.isArray(roles) ? roles : roles ? [roles] : []
  },

  getUser(): NormalizedUserPayload | null {
    if (!isClient()) return null

    const payload = this.getRawPayload()
    if (!payload) return null

    const roles =
      payload.roles ?? payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']

    return {
      ...payload,
      id:
        payload.sub ??
        payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
      email:
        payload.email ??
        payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
      name:
        payload.name ??
        payload.unique_name ??
        payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
      roles: Array.isArray(roles) ? roles : roles ? [roles] : [],
    }
  },

  getPayload(): NormalizedUserPayload | null {
    return this.getUser()
  },

  isAccessTokenExpired(): boolean {
    if (!isClient()) return true

    const payload = this.getRawPayload()
    if (!payload?.exp) return true

    return Date.now() >= payload.exp * 1000
  },

  setIsFirstLogin(isFirstLogin?: boolean | null) {
    if (!isClient()) return

    if (typeof isFirstLogin !== 'boolean') {
      localStorage.removeItem(FIRST_LOGIN_KEY)
      return
    }

    localStorage.setItem(FIRST_LOGIN_KEY, String(isFirstLogin))
  },

  getIsFirstLogin(): boolean | null {
    if (!isClient()) return null

    const value = localStorage.getItem(FIRST_LOGIN_KEY)
    if (value === null) return null

    return value === 'true'
  },
}

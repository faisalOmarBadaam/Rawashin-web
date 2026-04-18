'use client'

import { useEffect, useMemo } from 'react'

import { usePathname, useRouter } from 'next/navigation'

import { useAuthStore } from '@/contexts/auth/auth.store'
import { useAuthCheck } from '@/contexts/auth/useAuthCheck'
import {
  canAccess,
  getLocaleFromPath,
  hasBlockedDashboardRole,
  normalizeRoutePath,
} from '@/core/rbac/canAccess'

const EMPTY_ROLES: string[] = []

export default function PrivateGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { status } = useAuthCheck()
  const roles = useAuthStore(state => state.session?.roles ?? EMPTY_ROLES)
  const isAuthenticated = useAuthStore(state => state.isAuthenticated)

  const locale = useMemo(() => getLocaleFromPath(pathname || ''), [pathname])

  useEffect(() => {
    if (!pathname) return

    if (status === 'unauthenticated') {
      const loginPath = `/${locale}/login`

      if (pathname !== loginPath) router.replace(loginPath)
      return
    }

    if (status !== 'authenticated' && status !== 'first-login') return

    // If user just logged out, isAuthenticated becomes false immediately.
    // Skip RBAC redirect and let the unauthenticated effect above handle it.
    if (!isAuthenticated) return

    const normalizedPath = normalizeRoutePath(pathname)

    const hasBlockedRole = hasBlockedDashboardRole(roles)

    if (hasBlockedRole) {
      const loginPath = `/${locale}/login`

      if (pathname !== loginPath) router.replace(loginPath)
      return
    }

    const isAllowedPath = canAccess({
      roles,
      resource: 'dashboard',
      action: 'read',
      route: normalizedPath,
    })

    if (!isAllowedPath) {
      const safePath = `/${locale}/transactions`

      if (pathname !== safePath) router.replace(safePath)
    }
  }, [isAuthenticated, locale, pathname, roles, router, status])

  if (status === 'checking') return null
  if (status === 'unauthenticated') return null

  return <>{children}</>
}

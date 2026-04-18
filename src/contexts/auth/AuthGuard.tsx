'use client'

import { useEffect, useState } from 'react'

import { usePathname, useRouter } from 'next/navigation'

import { useAuthCheck } from './useAuthCheck'
import { useAuthStore } from './auth.store'
import { i18n } from '@/configs/i18n'
import { AppRole } from '@/configs/roles'
import {
  canAccessDashboard,
  isRestrictedCharger,
  isRouteAllowedForCharger,
  logSecurityEvent
} from '@/utils/rbac'

const EMPTY_ROLES: string[] = []

const normalizePath = (pathname: string) => {
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length === 0) return '/'

  const [first, ...rest] = segments
  const remaining = i18n.locales.includes(first as (typeof i18n)['locales'][number]) ? rest : segments

  return remaining.length ? `/${remaining.join('/')}` : '/'
}

const getLocaleFromPath = (pathname: string) => {
  const segment = pathname.split('/').filter(Boolean)[0]

  return i18n.locales.includes(segment as (typeof i18n)['locales'][number]) ? segment : i18n.defaultLocale
}

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { status } = useAuthCheck()
  const roles = useAuthStore(state => state.session?.roles ?? EMPTY_ROLES)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login')
    }
  }, [router, status])

  useEffect(() => {
    if (status !== 'authenticated') return
    if (!pathname) return

    // 1. Check if user has dashboard access at all
    if (!canAccessDashboard(roles)) {
      logSecurityEvent(roles, 'access_dashboard', pathname, false, 'User role not allowed in dashboard')
      const locale = getLocaleFromPath(pathname)
      // Redirect to home or a 403 page
      router.replace(`/${locale}/401`)
      return
    }

    // 2. Check for Charger-specific restrictions
    // If user is a Restricted Charger (Charger only, or Partner+Charger etc),
    // they can ONLY access specific routes.
    if (isRestrictedCharger(roles)) {
      const normalizedPath = normalizePath(pathname)

      // Allow exact match or sub-paths
      const isAllowed = isRouteAllowedForCharger(normalizedPath) ||
        // Startswith check done in util? No, util does generic check. Let's rely on util or improve it.
        // Actually the util logic I wrote earlier was:
        // return CHARGER_ALLOWED_ROUTES.some(route => path.startsWith(route))
        // So `normalizedPath` needs to match that.
        isRouteAllowedForCharger(normalizedPath)

      if (!isAllowed) {
        logSecurityEvent(roles, 'access_route', normalizedPath, false, 'Restricted Charger accessed unauthorized route')
        const locale = getLocaleFromPath(pathname)
        router.replace(`/${locale}/home`) // Redirect to their safe home
        return
      }
    }

    // If we pass all checks
    // logSecurityEvent(roles, 'access_route', pathname, true)

  }, [pathname, roles, router, status])

  if (!isMounted || status === 'checking') return null
  if (status === 'unauthenticated') return null

  return <>{children}</>
}

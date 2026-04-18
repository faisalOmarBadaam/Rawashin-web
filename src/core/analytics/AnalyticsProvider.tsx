'use client'

import { useEffect, useMemo, useRef } from 'react'

import { usePathname, useSearchParams } from 'next/navigation'

import { useAuthStore } from '@/contexts/auth/auth.store'

import {
  deriveModuleFromPath,
  identifySessionUser,
  resetSessionIdentity,
  trackPageView
} from './events'
import { initPosthog, getPosthog, updateRecordingState } from './posthog.client'
import { canRecordForRoles } from './privacy'

const getLangFromPath = (pathname: string): string => {
  const segment = pathname.split('/').filter(Boolean)[0]

  if (!segment) return 'unknown'

  return /^[a-z]{2}(?:-[a-z]{2})?$/i.test(segment) ? segment : 'unknown'
}

type Props = {
  children: React.ReactNode
}

const EMPTY_ROLES: string[] = []

let lastCapturedUrlGlobal = ''

export default function AnalyticsProvider({ children }: Props) {
  const pathname = usePathname() ?? '/'
  const searchParams = useSearchParams()
  const session = useAuthStore(state => state.session)
  const isAuthenticated = useAuthStore(state => state.isAuthenticated)
  const roles = useMemo(() => session?.roles ?? EMPTY_ROLES, [session])

  const initializedRef = useRef(false)
  const lastCapturedUrlRef = useRef<string>('')

  const search = useMemo(() => searchParams?.toString() ?? '', [searchParams])
  const url = `${pathname}${search ? `?${search}` : ''}`

  useEffect(() => {
    if (initializedRef.current) return

    const instance = initPosthog()
    if (!instance) return

    initializedRef.current = true
  }, [])

  useEffect(() => {
    const posthog = getPosthog()
    if (!posthog) return

    const lang = getLangFromPath(pathname)
    const module = deriveModuleFromPath(pathname)

    posthog.register({
      app: 'rawshin-frontend',
      lang,
      module
    })
  }, [pathname])

  useEffect(() => {
    if (lastCapturedUrlRef.current === url) return
    if (lastCapturedUrlGlobal === url) return

    trackPageView({ pathname, search })
    lastCapturedUrlRef.current = url
    lastCapturedUrlGlobal = url
  }, [pathname, search, url])

  useEffect(() => {
    identifySessionUser(session)
  }, [session])

  useEffect(() => {
    if (isAuthenticated) return

    resetSessionIdentity()
  }, [isAuthenticated])

  useEffect(() => {
    updateRecordingState(pathname, canRecordForRoles(roles))
  }, [pathname, roles])

  return <>{children}</>
}

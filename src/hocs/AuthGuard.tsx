'use client'

import { useEffect } from 'react'

import { useRouter } from 'next/navigation'

import { useAuthStore } from '@/contexts/auth/auth.store'
import { secureLogout } from '@/core/auth/secureLogout'
import { tokenStore } from '@/libs/api/tokenStore'
import type { Locale } from '@configs/i18n'

type Props = {
  children: React.ReactNode
  roles?: string[]
  locale: Locale
}

const AuthGuard = ({ children, roles, locale }: Props) => {
  const router = useRouter()

  useEffect(() => {
    const token = tokenStore.getAccessToken()

    if (!token || tokenStore.isAccessTokenExpired()) {
      secureLogout()
      router.replace(`/${locale}/login`)
      return
    }

    const user = tokenStore.getUser()
    if (!user) {
      secureLogout()
      router.replace(`/${locale}/login`)
      return
    }

    const authStore = useAuthStore.getState()

    if (!authStore.isAuthenticated) {
      authStore.login({
        userId: user.id!,
        email: user.email,
        name: user.name,
        roles: user.roles,
        expiresIn: user.exp!,
        accessToken: token,
      })
    }

    if (roles && roles.length > 0) {
      const hasRole = roles.some(role => user.roles.includes(role))

      if (!hasRole) {
        router.replace(`/${locale}/403`)
        return
      }
    }
  }, [roles, router, locale])

  return <>{children}</>
}

export default AuthGuard

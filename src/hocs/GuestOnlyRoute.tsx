'use client'

import { useEffect } from 'react'

import { useRouter } from 'next/navigation'

import { tokenStore } from '@/libs/api/tokenStore'
import type { Locale } from '@configs/i18n'
import themeConfig from '@configs/themeConfig'
import type { ChildrenType } from '@core/types'

type Props = ChildrenType & {
  lang: Locale
}

const GuestOnlyRoute = ({ children, lang }: Props) => {
  const router = useRouter()

  useEffect(() => {
    const token = tokenStore.getAccessToken()
    const isExpired = tokenStore.isAccessTokenExpired()
    const user = tokenStore.getUser()

    if (token && !isExpired && user?.id) {
      router.replace(themeConfig.homePageUrl)
    }

    if (token && (isExpired || !user?.id)) {
      tokenStore.clear()
    }
  }, [router])

  return <>{children}</>
}

export default GuestOnlyRoute

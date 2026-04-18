// src/app/[lang]/(dashboard)/(private)/layout.tsx

import type { ChildrenType } from '@core/types'
import type { Locale } from '@configs/i18n'

import { i18n } from '@configs/i18n'
import { getDictionary } from '@/utils/getDictionary'
import { getMode, getSystemMode, getSettingsFromCookie } from '@core/utils/serverHelpers'

import PrivateClientLayout from './PrivateClientLayout'

const Layout = async (props: ChildrenType & { params: Promise<{ lang: string }> }) => {
  const params = await props.params
  const { children } = props

  const lang: Locale = i18n.locales.includes(params.lang as Locale)
    ? (params.lang as Locale)
    : i18n.defaultLocale

  const direction = i18n.langDirection[lang]
  const dictionary = await getDictionary(lang)
  const mode = await getMode()
  const systemMode = await getSystemMode()
  const settingsCookie = await getSettingsFromCookie()

  return (
    <PrivateClientLayout
      direction={direction}
      dictionary={dictionary}
      mode={mode}
      systemMode={systemMode}
      settingsCookie={settingsCookie}
    >
      {children}
    </PrivateClientLayout>
  )
}

export default Layout

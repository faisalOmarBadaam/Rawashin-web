'use client'

import Button from '@mui/material/Button'

import LayoutWrapper from '@layouts/LayoutWrapper'
import VerticalLayout from '@layouts/VerticalLayout'
import HorizontalLayout from '@layouts/HorizontalLayout'

import ClientProviders from '@components/ClientProviders'
import ThemeProvider from '@components/theme'
import Navigation from '@components/layout/vertical/Navigation'
import Header from '@components/layout/horizontal/Header'
import Navbar from '@components/layout/vertical/Navbar'
import VerticalFooter from '@components/layout/vertical/Footer'
import HorizontalFooter from '@components/layout/horizontal/Footer'
import ScrollToTop from '@core/components/scroll-to-top'

import { VerticalNavProvider } from '@menu/contexts/verticalNavContext'
import { SettingsProvider } from '@core/contexts/settingsContext'
import type { Settings } from '@core/contexts/settingsContext'
import PrivateGuard from './PrivateGuard'

type Props = {
  children: React.ReactNode
  direction: 'ltr' | 'rtl'
  dictionary: any
  mode: any
  systemMode: any
  settingsCookie: Settings
}

export default function PrivateClientLayout({
  children,
  direction,
  dictionary,
  mode,
  systemMode,
  settingsCookie
}: Props) {
  return (
    <PrivateGuard>
      <VerticalNavProvider>
        <SettingsProvider settingsCookie={settingsCookie} mode={mode}>
          <ThemeProvider direction={direction} systemMode={systemMode}>
            <ClientProviders>
              <LayoutWrapper
                systemMode={systemMode}
                verticalLayout={
                  <VerticalLayout
                    navigation={<Navigation dictionary={dictionary} mode={mode} />}
                    navbar={<Navbar />}
                    footer={<VerticalFooter />}
                  >
                    {children}
                  </VerticalLayout>
                }
                horizontalLayout={
                  <HorizontalLayout header={<Header dictionary={dictionary} />} footer={<HorizontalFooter />}>
                    {children}
                  </HorizontalLayout>
                }
              />
              <ScrollToTop className='mui-fixed'>
                <Button
                  variant='contained'
                  className='is-10 bs-10 rounded-full p-0 min-is-0 flex items-center justify-center'
                >
                  <i className='ri-arrow-up-line' />
                </Button>
              </ScrollToTop>
            </ClientProviders>
          </ThemeProvider>
        </SettingsProvider>
      </VerticalNavProvider>
    </PrivateGuard>
  )
}

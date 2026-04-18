'use client'

import { QueryClientProvider } from '@tanstack/react-query'

import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import AnalyticsProvider from '@/core/analytics/AnalyticsProvider'
import { queryClient } from '@/libs/react-query/queryClient'
import SupportTicketsHubProvider from '@components/SupportTicketsHubProvider'
import WebVitalsReporter from '@components/WebVitalsReporter'

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SupportTicketsHubProvider />
      <WebVitalsReporter />
      <AnalyticsProvider>{children}</AnalyticsProvider>
      <ToastContainer />
    </QueryClientProvider>
  )
}

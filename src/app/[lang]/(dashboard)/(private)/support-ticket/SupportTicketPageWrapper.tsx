'use client'

import { Suspense, lazy } from 'react'

import { Box } from '@mui/material'

import Loading from '@/components/layout/shared/Loading'
import PageContainer from '@/components/layout/shared/PageContainer'

const SupportTicketsPage = lazy(() => import('@/views/support-ticket/Main'))

export default function SupportTicketPageWrapper() {
  return (
    <PageContainer
      title="تذاكر الدعم الفني"
      breadcrumbs={[
        { label: 'الدعم الفني', href: '/ar/support-ticket' },
        { label: 'تذاكر الدعم الفني' },
      ]}
    >
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        <Suspense fallback={<Loading />}>
          <SupportTicketsPage />
        </Suspense>
      </Box>
    </PageContainer>
  )
}

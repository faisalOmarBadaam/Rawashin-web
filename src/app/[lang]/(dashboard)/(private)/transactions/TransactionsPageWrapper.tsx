'use client'

import { Suspense, lazy } from 'react'

import { Box } from '@mui/material'

import Loading from '@/components/layout/shared/Loading'
import PageContainer from '@/components/layout/shared/PageContainer'

const TransactionsPage = lazy(() => import('@/views/transactions/Main'))

export default function TransactionsPageWrapper() {
  return (
    <PageContainer
      title="تفاصيل العمليات"
      breadcrumbs={[{ label: 'العمليات', href: '/ar/transcations' }, { label: 'عرض العمليات' }]}
    >
      <Box display="flex" flexDirection="column" gap={4}>
        <Suspense fallback={<Loading />}>
          <TransactionsPage />
        </Suspense>
      </Box>
    </PageContainer>
  )
}

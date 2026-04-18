'use client'

import { Suspense, lazy } from 'react'

import { Box } from '@mui/material'

import Loading from '@/components/layout/shared/Loading'
import PageContainer from '@/components/layout/shared/PageContainer'

const SettlementsListView = lazy(() => import('@/views/settlements/SettlementsListView'))

export default function SettlementsPageWrapper() {
  return (
    <PageContainer
      title="طلبات التسوية"
      breadcrumbs={[{ label: 'التسويات', href: '/ar/settlements' }, { label: 'إدارة التسويات' }]}
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
          <SettlementsListView />
        </Suspense>
      </Box>
    </PageContainer>
  )
}

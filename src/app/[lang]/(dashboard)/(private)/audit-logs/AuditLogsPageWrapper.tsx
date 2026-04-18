'use client'

import { Suspense, lazy } from 'react'

import { Box } from '@mui/material'

import Loading from '@/components/layout/shared/Loading'
import PageContainer from '@/components/layout/shared/PageContainer'

const AuditLogsPage = lazy(() => import('@/views/audit-logs/Main'))

export default function AuditLogsPageWrapper() {
  return (
    <PageContainer
      title="سجل التدقيق"
      breadcrumbs={[{ label: 'سجل التدقيق', href: '/ar/audit-logs' }, { label: 'عرض السجل' }]}
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
          <AuditLogsPage />
        </Suspense>
      </Box>
    </PageContainer>
  )
}

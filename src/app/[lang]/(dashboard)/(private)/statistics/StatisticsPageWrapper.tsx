'use client'

import { Box } from '@mui/material'

import PageContainer from '@/components/layout/shared/PageContainer'
import StatisticsDashboard from '@/views/statistics/Main'

export default function StatisticsPageWrapper() {
  return (
    <PageContainer
      title="إحصائيات المعاملات"
      breadcrumbs={[{ label: 'الإحصائيات', href: '/ar/statistics' }]}
    >
      <Box display="flex" flexDirection="column" gap={4}>
        <StatisticsDashboard />
      </Box>
    </PageContainer>
  )
}

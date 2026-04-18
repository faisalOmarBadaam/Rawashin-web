'use client'

import { Box } from '@mui/material'

import PageContainer from '@/components/layout/shared/PageContainer'
import { ClientsVariantPage } from '@/domains/clients'

export default function MerchantsPageWrapper() {
  return (
    <PageContainer
      title="إدارة الحسابات الفرعية"
      breadcrumbs={[
        { label: 'الحسابات الفرعية', href: '/ar/merchants' },
        { label: 'إدارة الحسابات الفرعية' },
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
        <ClientsVariantPage variant="merchants" />
      </Box>
    </PageContainer>
  )
}

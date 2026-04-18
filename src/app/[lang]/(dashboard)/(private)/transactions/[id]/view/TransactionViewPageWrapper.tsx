'use client'

import { Box } from '@mui/material'

import PageContainer from '@/components/layout/shared/PageContainer'
import ViewTransaction from '@/views/transactions/ViewTransaction'

type Props = {
  id: string
}

export default function TransactionViewPageWrapper({ id }: Props) {
  return (
    <PageContainer
      title="عرض العملية"
      breadcrumbs={[{ label: 'العمليات', href: '/ar/transactions' }, { label: 'عرض العملية' }]}
    >
      <Box display="flex" flexDirection="column" gap={4}>
        <ViewTransaction transactionId={id} />
      </Box>
    </PageContainer>
  )
}

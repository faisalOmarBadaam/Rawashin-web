'use client'

import { Box } from '@mui/material'

import PageContainer from '@/components/layout/shared/PageContainer'
import SettlementDetailsView from '@/views/settlements/SettlementDetailsView'


type Props = {
  id: string
  mode: 'view' | 'edit'
}

const TITLES = {
  view: 'عرض تفاصيل التسوية',
  edit: 'إدارة التسوية'
}

export default function ViewEditSettlementWrapper({ id, mode }: Props) {
  const title = TITLES[mode]

  return (
    <PageContainer
      title={title}
      breadcrumbs={[
        { label: 'التسويات', href: '/settlements' },
        { label: title }
      ]}
    >
      <Box sx={{ width: '100%', marginTop: '10px' }}>
        <SettlementDetailsView settlementId={id} />
      </Box>
    </PageContainer>
  )
}

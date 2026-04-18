'use client'

import { Box, Typography } from '@mui/material'

import PageContainer from '@/components/layout/shared/PageContainer'
import { AppRole } from '@/configs/roles'
import { useAuthStore } from '@/contexts/auth/auth.store'
import MarchentSettlementDetails from '@/views/settlements/MarchentSettlementDetails'

type Props = {
  settlementId: string
}

export default function MerchantSettlementViewPageWrapper({ settlementId }: Props) {
  const session = useAuthStore(state => state.session)
  const roles = session?.roles ?? []
  const isMerchant = roles.includes(AppRole.Merchant)

  return (
    <PageContainer
      title="عرض التسوية"
      breadcrumbs={[
        { label: 'تسويات الحسابات الفرعية', href: '/ar/merchant-settlements' },
        { label: 'عرض التسوية' },
      ]}
    >
      <Box sx={{ width: '100%', marginTop: '10px' }}>
        {isMerchant ? (
          <MarchentSettlementDetails settlementId={settlementId} />
        ) : (
          <Typography color="error">غير مصرح بعرض هذه الصفحة</Typography>
        )}
      </Box>
    </PageContainer>
  )
}

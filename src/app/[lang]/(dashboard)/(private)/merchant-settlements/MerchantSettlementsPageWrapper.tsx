'use client'

import { Box, Typography } from '@mui/material'

import PageContainer from '@/components/layout/shared/PageContainer'
import { AppRole } from '@/configs/roles'
import { useAuthStore } from '@/contexts/auth/auth.store'
import MarchentSettlmentList from '@/views/settlements/MarchentSettlmentList'

export default function MerchantSettlementsPageWrapper() {
  const session = useAuthStore(state => state.session)
  const roles = session?.roles ?? []
  const merchantId = session?.userId
  const isMerchant = roles.includes(AppRole.Merchant)

  return (
    <PageContainer
      title="تسويات الحسابات الفرعية"
      breadcrumbs={[
        { label: 'تسويات الحسابات   الفرعية', href: '/ar/merchant-settlements' },
        { label: 'قائمة التسويات' },
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
        {isMerchant && merchantId ? (
          <MarchentSettlmentList clientId={merchantId} />
        ) : (
          <Typography color="error">غير مصرح بعرض هذه الصفحة</Typography>
        )}
      </Box>
    </PageContainer>
  )
}

'use client'

import { Card, CardContent, Chip, Stack } from '@mui/material'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import { useAuthStore } from '@/contexts/auth/auth.store'
import { useExperimentVariant } from '@/core/analytics/experiments'
import { useFeatureFlag } from '@/core/analytics/flags'
import ClientTransactionsDataGrid from '@/domains/clients/components/shared/ClientTransactionsDataGrid'

const MarchentHome = () => {
  const showNewTopbarHint = useFeatureFlag('ui.new_topbar')
  const headerVariant = useExperimentVariant('exp.merchant_home_header')
  const prefix = headerVariant === 'icon' ? '✨ ' : ''
  const clientId = useAuthStore(s => s.session?.userId)

  if (!clientId) return null

  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <Card
        sx={{
          overflow: 'hidden',
          border: theme => `1px solid ${theme.palette.divider}`,
          background: theme =>
            `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.action.hover} 100%)`,
        }}
      >
        <CardContent>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
          >
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {prefix}
                لوحة تحكم نقطة البيع
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                متابعة العمليات والحركات المالية لحسابك بسهولة
              </Typography>
            </Box>

            <Chip label="نقطة البيع" size="small" color="primary" variant="outlined" />
          </Stack>

          {showNewTopbarHint && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
              تجربة واجهة محسّنة قيد التفعيل
            </Typography>
          )}
        </CardContent>
      </Card>

      <Card
        sx={{
          border: theme => `1px solid ${theme.palette.divider}`,
          boxShadow: theme => theme.shadows[1],
        }}
      >
        <CardContent sx={{ pb: 1 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            sx={{ mb: 1 }}
          >
            <Box>
              <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 600 }}>
                سجل العمليات
              </Typography>
              <Typography variant="body2" color="text.secondary">
                يمكنك تصفية الحركات، البحث، وتصدير النتائج إلى Excel.
              </Typography>
            </Box>

            <Chip label="آخر الحركات" size="small" variant="outlined" />
          </Stack>

          <ClientTransactionsDataGrid clientId={clientId} />
        </CardContent>
      </Card>
    </Box>
  )
}

export default MarchentHome

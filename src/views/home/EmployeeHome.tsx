'use client'

import { Card, CardContent } from '@mui/material'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import { useExperimentVariant } from '@/core/analytics/experiments'
import { useFeatureFlag } from '@/core/analytics/flags'
import ClientListPage from '@/domains/clients/pages/ClientListPage'

const EmployeeHome = () => {
  const showNewTopbarHint = useFeatureFlag('ui.new_topbar')
  const headerVariant = useExperimentVariant('exp.employee_home_header')
  const prefix = headerVariant === 'icon' ? '✨ ' : ''

  return (
    <Box>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5">
            {prefix}
            لوحة التحكم
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            العملاء
          </Typography>
          {showNewTopbarHint && (
            <Typography variant="caption" color="text.secondary">
              تجربة واجهة محسّنة قيد التفعيل
            </Typography>
          )}
        </CardContent>
      </Card>

      <ClientListPage variant="employees" />
    </Box>
  )
}

export default EmployeeHome
